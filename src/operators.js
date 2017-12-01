import R from 'ramda';
import Rx from 'rxjs';

const SUGGESTION_TYPE = 'application/x-suggestions+json';

export default function ( copalOpensearch ) {
  return {
    'opensearch.getSuggestions': ( [ query$ ], config, command ) =>
      query$
        .filter( searchTerms => searchTerms !== '' )
        .flatMap( searchTerms => {
          const service = copalOpensearch.services[ command.data.opensearch.service ];
          return Rx.Observable.fromPromise( service.search( { searchTerms }, SUGGESTION_TYPE ) )
                              .map( response => response[1] );
        } )
  };
}
