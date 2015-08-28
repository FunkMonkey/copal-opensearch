import path from "path";
import opensearch from "opensearch";

import dec from "copal-core/utils/decorators";

import DEFAULT_SETTINGS_OPENSEARCH from "./default-settings-opensearch.json";
import COMMAND_OPENSEARCH from "./command-opensearch.json";

/**
 * OpenSearch extension for copal
 */
export default {

  /**
   * Initializes the extension
   *  - creates the commands
   *
   * @param    {CoPal}   copal   CoPal instance
   */
  init( copal ) {
    this.settings = copal.loadProfileConfig( "settings-opensearch.json" ) || {};
    this.settings = copal.defaultifyOptions( this.settings, DEFAULT_SETTINGS_OPENSEARCH, true );

    this.sources = {};

    this.settings.sources.forEach( src => {

      if( src.type === "file")
        src.src = path.join( copal.profileDir, src.src );

      opensearch( src.src, { type: src.type } ).
        then( provider => {
          this.sources[src.name] = provider;
        })
        .catch( e => {
          console.log( e ); // TODO: better error handling
        });
    } );

    copal.bricks.addTransformBrick( "OpenSearch.getURL", this.brickGetURL );
    copal.bricks.addTransformBrick( "OpenSearch.getSuggestions", this.brickGetSuggestions.bind( this ) );

    copal.addCommand( COMMAND_OPENSEARCH );
  },

  /**
   * Gets suggestions based on the input data
   *
   * @param    {CommandSession}   cmdSession   Currently executed command session
   * @param    {Object}           inputData    Data being used
   *
   * @return   {Array}                         List of results
   */
  @dec.wrapInStreamPromise
  brickGetSuggestions( brickData, data ) {

    var provider = this.sources[ data.source ];
    var queryString = data.queryString || "";

    // temporary hack, so we don't get Bad request for Google, because of empty string
    if( queryString === "" ) {
      return Promise.resolve( [] );
    }

    return provider.getSuggestions( { searchTerms: queryString } ).then( res => {
      const newData = res[1].map( (searchResult, index) => {
        return {
            title: res[1][index],
            description: res[2][index] || "",
            url: res[3][index] || ""
          };
        } );

      return newData;
    } );
  },

  @dec.wrapInStreamSync
  brickGetURL( brickMeta, data ) {
    return data.url;
  }
};
