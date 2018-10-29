const React = require("react");
const styles = require("./styles.scss");
const { Collector } = require("../DomainForm");

class App extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { domain } = this.state;
    return (
      <div className={styles.root}>
        <h1>What do you know about ...</h1>
        <Collector />
      </div>
    );
  }
}

module.exports = App;
