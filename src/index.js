import path from 'path';
import { Observable } from 'rxjs';
import { OpenSearchService } from 'opensearch-browser/dist/service';
import { registerFormat } from 'opensearch-browser/dist/formats/index';
import getOperators from './operators';

const SUGGESTION_FORMAT = {
  parse( response ) {
    return JSON.parse( response );
  }
};

// register the format under the given mime-type, TODO: remove in next version of opensearch-browser
registerFormat( 'application/x-suggestions+json', SUGGESTION_FORMAT );

function loadServiceFromFile( fs, filePath ) {
  const readFile = Observable.bindNodeCallback( fs.readFile );
  return readFile( filePath, { encoding: 'utf8' } )
    .map( xmlStr => OpenSearchService.fromXml( xmlStr ) );
}

function loadServicesFromProfile( fs, dirPath ) {
  const readdir = Observable.bindNodeCallback( fs.readdir );

  return readdir( dirPath )
    .map( files => files.filter( file => path.extname( file ) === '.xml' ) )
    .map( xmlFiles =>
      xmlFiles.map( file => loadServiceFromFile( fs, path.join( dirPath, file ) ) ) )
    .flatMap( servicesObs => Observable.from( servicesObs ).mergeAll() )
    .reduce( ( services, currService ) => {
      services[ currService.getDescription().shortName ] = currService;
      return services;
    }, {} );
}

/**
 * OpenSearch extension for copal
 */
export default function ( core ) {
  const plugin = {
    services: {}
  };

  core.commands.connector.addOperators( getOperators( plugin ) );

  return loadServicesFromProfile( core.profile.fs, '/opensearch' )
    .map( services => {
      plugin.services = services;
      return plugin;
    } );
}
