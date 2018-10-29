const React = require("react");
const styles = require("./styles.scss");
const { firestore } = require("../../firebase");

// TODO: these should eventually be passed in as props
const inputData = require("../../domains.json").map(d => ({
  key: d,
  value: { domain: d }
}));
const collectionId = "domains";

class Collector extends React.Component {
  constructor() {
    super();
    this.state = { ready: false };
    this.collectionData = new Map();
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  querySnapshotHandler = snapshot => {
    console.time("fetch data");
    this.collectionSnapshot = snapshot;
    snapshot.forEach(doc => {
      this.collectionData.set(doc.id, doc.data());
    });
    console.timeEnd("fetch data");

    if (!this.state.ready) {
      this.pick();
    }
  };

  componentDidMount() {
    this.queryOff = firestore
      .collection(collectionId)
      .orderBy("count")
      .onSnapshot(this.querySnapshotHandler);
  }

  handleSubmit = e => {
    e.preventDefault();
    const {
      owner,
      item: { key }
    } = this.state;

    firestore
      .collection(collectionId)
      .doc(key)
      .collection("responses")
      .add({ owner });
  };

  pick() {
    const remaining = inputData.filter(d => !this.collectionData.has(d.key));

    // If there are any items not yet responded to at all, go with a random one of those
    if (remaining.length) {
      const localStorageKey = `seen${collectionId}`;
      let item = remaining[Math.floor(Math.random() * remaining.length)];
      let seenItems = window.localStorage.getItem(localStorageKey) || [];
      if (seenItems.indexOf(item.key) === -1) {
        seenItems.push(item.key);
        window.localStorage.setItem(localStorageKey, seenItems);
        return this.setState({ item, ready: true });
      }
    }

    // If there aren't any items remaining use Firestore content.
    ///
  }

  componentWillUnmount() {
    this.queryOff && this.queryOff();
  }

  render() {
    const { ready } = this.state;

    if (!ready) return <p>loading...</p>;

    // TODO: Most of the stuff below here should be re-factored into a form-specific component.

    const {
      owner,
      notes,
      item: {
        value: { domain }
      }
    } = this.state;

    return (
      <div>
        {domain}{" "}
        <a target="_blank" href={`http://${domain}`}>
          [link]
        </a>
        <form onSubmit={this.handleSubmit}>
          <label className={styles.label} htmlFor="owner">
            Domain's corporate owner
          </label>
          <input
            id="owner"
            name="owner"
            type="text"
            onChange={this.handleInputChange}
            value={owner || ""}
          />
          <label className={styles.label} htmlFor="notes">
            Where did you find this information or how do you know it?
          </label>
          <textarea
            content={notes}
            name="notes"
            id="notes"
            onChange={this.handleInputChange}
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

module.exports = { Collector };
