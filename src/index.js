const React = require('react');
const { render } = require('react-dom');
const collections = require('./collections');

const root = document.querySelector(`[data-data-life-crowdsource-root]`);
const collectionId = root.getAttribute('data-collection-id');
const collection = collections[collectionId];

if (!collection) {
  throw new Error(`${collectionId} is an unrecognised collection`);
}

function init() {
  const App = require('./components/App');
  render(<App collection={collection} />, root);
}

init();

if (module.hot) {
  module.hot.accept('./components/App', () => {
    try {
      init();
    } catch (err) {
      const ErrorBox = require('./components/ErrorBox');
      render(<ErrorBox error={err} />, root);
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`Public path: ${__webpack_public_path__}`);
}
