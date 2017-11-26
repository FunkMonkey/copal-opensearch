import path from 'path';
import fs from 'fs';
import Rx from 'rxjs';
import { OpenSearchService } from 'opensearch-browser/dist/service';
import { registerFormat } from 'opensearch-browser/dist/formats/index';
import getOperators from './operators';

// import DEFAULT_SETTINGS_OPENSEARCH from './default-settings-opensearch.json';
// import COMMAND_OPENSEARCH from './command-opensearch.json';


const SUGGESTION_FORMAT = {
  parse( response ) {
    return JSON.parse( response );
  }
};

// register the format under the given mime-type
registerFormat( 'application/x-suggestions+json', SUGGESTION_FORMAT );

/**
 * OpenSearch extension for copal
 */
export default function ( core ) {
  const plugin = {
    services: {}
  };

  core.commands.connector.addOperators( getOperators( plugin ) );

  const google = fs.readFileSync( path.join( __dirname, '..', 'google.xml' ), { encoding: 'utf8' } );
  plugin.services.google = OpenSearchService.fromXml( google );
  console.log( plugin );

  return Rx.Observable.of( plugin );
}
