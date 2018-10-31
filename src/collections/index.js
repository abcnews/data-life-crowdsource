module.exports = {
  domains: {
    key: 'domains',
    title: 'What do you know about this domain?',
    items: require('./domains.json'),
    link: item => `http://${item}`,
    fields: [
      {
        name: 'owner',
        label: `Who owns the domain?`
      },
      {
        name: 'is-tracking',
        choices: ['Yes', 'No'],
        label: `Is this tracking your internet use, location or other personal data?`
      },
      {
        name: 'evidence',
        type: 'textarea',
        label: `What evidence do you have for this?`
      }
    ],
    preSkip: 'Answer the questions below or...',
    skip: 'Try another one'
  }
};
