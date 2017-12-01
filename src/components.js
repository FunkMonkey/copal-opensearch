export default [ {
  name: 'opensearch',
  description: 'opensearch main component',
  hidden: true,
  graph: {
    suggestions$: [
      { 'from-input': 'query$' },
      { operator: 'opensearch.getSuggestions' },
      {
        operator: 'startWith',
        args: [ [] ]
      },
      { 'to-output': 'suggestions$' }
    ]
  }
} ];
