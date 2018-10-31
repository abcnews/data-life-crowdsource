const React = require('react');
const { firestore } = require('../../firebase');
const styles = require('./styles.scss');

class CollectionForm extends React.Component {
  constructor(props) {
    super(props);

    this.baseRef = React.createRef();
    this.itemTitleRef = React.createRef();

    this.bringIntoView = this.bringIntoView.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSkip = this.handleSkip.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.download = `data:text/plain;charset=utf-8,${encodeURIComponent(props.collection.items.join('\n'))}`;
    this.counts = {};

    const storedSeen = window.localStorage.getItem(`seen_${this.props.collection.key}`);
    this.seen = storedSeen ? storedSeen.split(',') : [];

    this.state = { isReady: false, response: {} };
  }

  querySnapshotHandler = snapshot => {
    this.collectionSnapshot = snapshot;
    snapshot.forEach(doc => {
      this.counts[doc.id] = doc.data().count;
    });

    if (!this.state.isReady) {
      this.pick();
    }
  };

  pick() {
    // Candidates are initially items that aren't counted yet, and haven't been seen by the visitor
    let candidates = this.props.collection.items.filter(item => !this.counts[item] && this.seen.indexOf(item) === -1);

    // If we don't have any candidates yet, select those with the lowest response count
    if (!candidates.length) {
      const itemsByCount = Object.keys(this.counts)
        .filter(item => this.seen.indexOf(item) === -1)
        .reduce((memo, item) => {
          const count = this.counts[item];

          if (!memo[count]) {
            memo[count] = [item];
          } else {
            memo[count].push(item);
          }

          return memo;
        }, {});

      if (Object.keys(itemsByCount).length) {
        const min = Math.min.apply(Math, Object.keys(itemsByCount));

        candidates = itemsByCount[min];
      }
    }

    // If we have candidates, pick one at random and remember that the visitor has seen it
    if (candidates.length) {
      const item = candidates[Math.floor(Math.random() * candidates.length)];

      this.seen.unshift(item);
      this.seen.sort();
      window.localStorage.setItem(`seen_${this.props.collection.key}`, this.seen.join(','));

      this.setState({ item, isReady: true, response: {} });
    } else {
      this.setState({ isExhausted: true });
    }
  }

  bringIntoView() {
    const baseEl = this.baseRef.current;
    const itemTitleEl = this.itemTitleRef.current;

    if (itemTitleEl.getBoundingClientRect().top < 0) {
      baseEl.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
    }

    if (itemTitleEl.animate) {
      itemTitleEl.animate(
        [
          { transform: 'scale(1)', opacity: 0, easing: 'ease-out' },
          { transform: 'scale(1.25)', easing: 'ease-in' },
          { transform: 'scale(1)', opacity: 1 }
        ],
        500
      );
    }
  }

  handleSkip() {
    this.pick();
    this.bringIntoView();
  }

  handleInputChange = ({ target }) => {
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({
      response: {
        ...this.state.response,
        [name]: value
      }
    });
  };

  handleSubmit = event => {
    const { item, response } = this.state;

    event.preventDefault();

    firestore
      .collection(this.props.collection.key)
      .doc(item)
      .collection('responses')
      .add(response);

    if (!this.counts[item]) {
      this.counts[item] = 1;
    } else {
      this.counts[item]++;
    }

    this.pick();
    this.bringIntoView();
  };

  componentDidMount() {
    this.queryOff = firestore
      .collection(this.props.collection.key)
      .orderBy('count')
      .onSnapshot(this.querySnapshotHandler);
  }

  componentWillUnmount() {
    this.queryOff && this.queryOff();
  }

  render() {
    const { title, link, fields, preSkip, skip } = this.props.collection;
    const { isExhausted, isReady, item, response } = this.state;

    if (isExhausted) {
      return <p>Complete. Thank you!</p>;
    }

    if (!isReady) {
      return <p>Loading...</p>;
    }

    const titleItemClassName = `${styles.titleItem}${item.length > 20 ? ` ${styles.isLong}` : ''}`;

    return (
      <div ref={this.baseRef} className={styles.root}>
        <h1 className={styles.title}>
          {title}
          {link ? (
            <a ref={this.itemTitleRef} className={titleItemClassName} target="_blank" href={link(item)}>
              {`${item} 🔗`}
            </a>
          ) : (
            <span ref={this.itemTitleRef} className={titleItemClassName}>
              {item}
            </span>
          )}
        </h1>
        <p className={styles.skip}>
          {preSkip}
          <button onClick={this.handleSkip}>{skip}</button>
        </p>
        <form onSubmit={this.handleSubmit}>
          {fields.map(({ name, type, label, choices }) => (
            <div key={name} className={styles.field}>
              <label htmlFor={choices ? null : `${name}_input`}>{label}</label>
              {choices ? (
                <div className={styles.choices}>
                  {choices.map((choice, index) => (
                    <label key={`${name}_${index}`} htmlFor={`${name}_input_choice_${index}`}>
                      <input
                        id={`${name}_input_choice_${index}`}
                        name={name}
                        type="radio"
                        value={choice}
                        checked={response[name] === choice}
                        onChange={this.handleInputChange}
                      />
                      {` ${choice}`}
                    </label>
                  ))}
                </div>
              ) : type === 'textarea' ? (
                <textarea
                  id={`${name}_input`}
                  name={name}
                  onChange={this.handleInputChange}
                  value={response[name] || ''}
                />
              ) : (
                <input
                  id={`${name}_input`}
                  name={name}
                  type={type || 'text'}
                  onChange={this.handleInputChange}
                  value={response[name] || ''}
                />
              )}
            </div>
          ))}
          <div className={styles.submit}>
            <button type="submit" disabled={Object.keys(response).length === 0}>
              Submit
            </button>
          </div>
        </form>
        <p class={styles.download}>
          <a href={this.download} download={`${this.props.collection.key}.txt`}>{`Download the full list`}</a> 📄
        </p>
      </div>
    );
  }
}

module.exports = CollectionForm;
