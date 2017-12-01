export default [
  {
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
  },

  {
    name: 'opensearch-launcher',
    description: 'opensearch main command',
    hidden: true,
    subgraphs: [
      'opensearch',
      'launcher'
    ],
    graph: {
      'connect-query': [
        { 'from-subgraph-output': 'launcher::query$' },
        { 'to-subgraph-input': 'opensearch::query$' }
      ],
      'connect-data': [
        { 'from-subgraph-output': 'opensearch::suggestions$' },
        { 'to-subgraph-input': 'launcher::data$' }
      ],
      'connect-execution': [
        { 'from-subgraph-output': 'launcher::chosenListenItem$' },
        { operator: 'launcher.listview.item.getURL' },
        { operator: 'launcher.openExternal' },
        { operator: 'subscribe' }
      ]
    }
  }
];
