import R from 'ramda';
import Rx from 'rxjs';

const SUGGESTION_TYPE = 'application/x-suggestions+json';

export default function ( copalOpensearch ) {
  return {
    'opensearch.getSuggestions': ( [ query$ ], config, { data } ) =>
      query$
        .filter( searchTerms => searchTerms !== '' )
        .flatMap( searchTerms => {
          const service = copalOpensearch.services.google;
          return Rx.Observable.fromPromise( service.search( { searchTerms }, SUGGESTION_TYPE ) )
                              .map( response => response[1] );
        } )
  };
}
