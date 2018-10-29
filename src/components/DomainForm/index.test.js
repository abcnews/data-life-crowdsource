const React = require('react');
const renderer = require('react-test-renderer');

const DomainForm = require('.');

describe('DomainForm', () => {
  test('It renders', () => {
    const component = renderer.create(<DomainForm />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
