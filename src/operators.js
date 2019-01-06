import { from } from 'rxjs';
import { filter, flatMap, map } from 'rxjs/operators';

const SUGGESTION_TYPE = 'application/x-suggestions+json';

function makeSearchRequest( copalOpensearch, searchTerms, serviceName ) {
  const service = copalOpensearch.services[ serviceName ];
  return from( service.search( { searchTerms }, SUGGESTION_TYPE ) ).pipe(
    map( response => response[1].map( item => {
      const searchRequest = service.createSearchRequest( { searchTerms: item }, 'text/html', 'GET' );
      return {
        title: item,
        url: searchRequest.url
      };
    } ) )
  );
}

export default function ( copalOpensearch ) {
  return {
    'opensearch.getSuggestions': ( [ query$ ], config, command ) =>
      query$.pipe(
        filter( searchTerms => searchTerms !== '' ),
        flatMap( searchTerms =>
          makeSearchRequest( copalOpensearch, searchTerms, command.data.opensearch.service ) )
      )
  };
}
