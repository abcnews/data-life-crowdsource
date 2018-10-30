const React = require('react');
const CollectionForm = require('../CollectionForm');
const styles = require('./styles.scss');

const App = ({ collection }) => (
  <div className={styles.root}>
    <CollectionForm collection={collection} />
  </div>
);

module.exports = App;
