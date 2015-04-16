import path from "path";
import _ from "lodash";
import opensearch from "opensearch";

const SETTINGS_DEFAULT = {
  "sources": [],
  "commands": []
};

const COMMAND_DEFAULT = {

  name: "opensearch",

  hidden: true,

  signals: {
    "input": {
      "standard-query-input": ["OpenSearch.getSuggestions"]
    },
    "output": {
      "list-title-url-icon": []
    },
    "listitem-execute": {
      "listitem-title-url-icon": ["OpenSearch.getURL", "Common.open"]
    }
  }
};

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
    this.openSearchDir = path.join( copal.profileDir, "opensearch" );
    this.settings = copal.loadProfileConfig( path.join( "opensearch", "settings.json" ) ) || {};
    this.settings = copal.defaultifyOptions( this.settings, SETTINGS_DEFAULT, true );

    this.sources = {};

    this.settings.sources.forEach( src => {

      if( src.type === "file")
        src.src = path.join( this.openSearchDir, src.src );

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

    copal.addCommand( COMMAND_DEFAULT );
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
