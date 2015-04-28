import path from "path";
import _ from "lodash";
import opensearch from "opensearch";

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
          console.log( e );
        });
    } );

    copal.bricks.addDataBrick( "OpenSearch.getURL", this.brickGetURL );
    copal.bricks.addDataBrick( "OpenSearch.getSuggestions", this.brickGetSuggestions.bind( this ) );

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
  brickGetSuggestions( cmdSession, inputData ) {
    var provider = this.sources[ inputData.source ];
    var queryString = inputData.queryString || "";
    return provider.getSuggestions( { searchTerms: queryString } ).then( res => {
      return res[1].map( (searchResult, index) => {
        return {
          title: res[1][index],
          description: res[2][index] || "",
          url: res[3][index] || ""
        };
      } );
    } );
  },

  brickGetURL( cmdSession, data ) {
    return data.url;
  }
};
