/*=============================================================================
* Johnas' Attack Telegraphing Plugin
* by Johnas Wong
* Date: October 1, 2020 
* Johnas_Show_Attack_Telegraph.js
* 
* File dependencies:
*   - Shaz_TileChanger.js
*=============================================================================*/
/*:
* @plugindesc Shows the affected areas of an enemy's attacks
* @author Johnas
*
* @param 
* @desc 
* @default 
*/


/**
* TO DO LIST:

  - Make different cases for the different enemy attacks

  - MUST TEST OFF MAP CASES

  - Might have to change the dict for each z layer
*/


/**
 * Jordon's needed functions
 * 
 * This is just pseudo code. Add and remove whatever you need,. but this 
 * is basically what I'm looking for.

  displayTile(String tileType, int positionX, int PositionY)
  removeTile(int positionX, int positionY)

  How the remove tile works is on your end. Removing the tile may not be the 
  right word to use, as you might just set the tile to whatever it was prior, 
  rather than remove the entire tile at that pos. Or maybe I'm wrong. You know 
  how it works.

  *** I changed displayTile args to add zLayer on the end
 */


( function() 
{  
  var parameters = PluginManager.parameters('Show_Attack_Telegraph');
  
  /**
   * Global dictionary holding the melee attack tiles
   */
  var redrawMeleeAttackDict = [];
  var threeLayersDict = [];
        

  // 70 is key "F"
  Input.keyMapper[ "70" ] = "TileID Checker ( 0, 0, 0 )";
  // Have to watch out - _alias .. is used in hearts_working so have to
  // have different names

  /**
   * Looks like max B/C overlay tiles is two on one tile.
   * If there's only one overlay, the overlay tile appears on z layer 3.
   * If there's two overlay tiles, the bottom overlay tile appears on z layer 2.
   * The top overlay tile appears on z layer 3.
   * 
   * --> The most top, visible overlay tile is always on layer 3.
   * 
   * Player can walk over B/C pages if the collision is set to allow player over 
   * in the systems tab of Tilesets. 'X' means player CANNOT walk on top, 'O'
   * means player CAN walk on top.
   */
  _alias_scene_map_draw_attack_tiles = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() 
  {
    _alias_scene_map_draw_attack_tiles.call( this );
    if( Input.isTriggered( "TileID Checker ( 0, 0, 0 )" ) )
    {
      console.log( "The F button has been pressed" );
      console.log( "Tile ID at 0, 0, 0 ( actual tile )" );
      console.log( $gameMap.tileId( 0, 0, 0 ) );
      console.log( "Tile ID at 0, 0, 1 ( bottom overlay tile )" );
      console.log( $gameMap.tileId( 0, 0, 2 ) );
      console.log( "Tile ID at 0, 0, 2 ( top overlay tile )" );
      console.log( $gameMap.tileId( 0, 0, 3 ) );
      console.log( "Done the 'Pressed F' comand" );
    }
  };


  /**
   * Need to put in perimetre checking for if attack would go off map
   */
  showMeleeAttack = function( args )
  {
    /**
     * I could reuse this structure if I put an array into the dict
     */
    // var x = eval(args.shift());
    // var y = eval(args.shift());
    // var z = eval(args.shift());

    /**
     * JS DOES BY REFERENCE
     */

    var localOldLeft = Object.create( args.oldLeftTile );
    var localOldRight = Object.create( args.oldRightTile );
    var localOldUp = Object.create( args.oldUpTile );
    var localOldDown = Object.create( args.oldDownTile );

    //console.log( "Inside showMeleeAttack" );
    // ["4", "5", "0", 2816]
    /*console.log( localOldLeft );
    console.log( localOldRight );
    console.log( localOldUp );
    console.log( localOldDown );*/

    /**
     * Redudnant, but i wanted to keep clarity
     */
    var newLeft = Object.create( localOldLeft );
    var newRight = Object.create( localOldRight );
    var newUp = Object.create( localOldUp );
    var newDown = Object.create( localOldDown );

    newLeft[ 3 ] = '2386';
    newRight[ 3 ] = '2386';
    newUp[ 3 ] = '2386';
    newDown[ 3 ] = '2386';

    // console.log( "New left" );
    // [ x, y, z, tileId ]
    // ["4", "5", "0", "2386"]
    // console.log( newLeft );

    var myInterpreter = new Game_Interpreter();

    /*
      * For some reason it's removing the element from the dict here
      * IT'S CUS ALL THE NEW VARIABLES ARE BY REFERENCE 
      * SO VAR A = 100
      * VAR B = A
      * B EQUALS 100 IF DO
      * A = 20
      * B NOW EQUALS 20
      */

    myInterpreter.pluginCommand('ChangeTile', newLeft );
    myInterpreter.pluginCommand('ChangeTile', newRight );
    myInterpreter.pluginCommand('ChangeTile', newUp );
    myInterpreter.pluginCommand('ChangeTile', newDown );

    //console.log( "Done showing melee attack" );
  }


  /**
   * This currently only resets tiles on the 0 Z layer
   */
  removeMeleeAttack = function( args ) 
  {
    var localOldLeft = Object.create( args.oldLeftTile );
    var localOldRight = Object.create( args.oldRightTile );
    var localOldUp = Object.create( args.oldUpTile );
    var localOldDown = Object.create( args.oldDownTile );

    /*console.log( "Inside removeMeleeAttack" );
    // ["4", "5", "0", 2816]
    console.log( localOldLeft );
    console.log( localOldRight );
    console.log( localOldUp );
    console.log( localOldDown );*/

    var myInterpreter = new Game_Interpreter();

    /**
     * I think this may theoretically remove it from the dict? cus it's so janky
     */
    myInterpreter.pluginCommand( 'ChangeTile', localOldLeft );
    myInterpreter.pluginCommand( 'ChangeTile', localOldRight );
    myInterpreter.pluginCommand( 'ChangeTile', localOldUp );
    myInterpreter.pluginCommand( 'ChangeTile', localOldDown );

    redrawMeleeAttackDict.shift();

    //console.log( "Done removing melee attack" );
  }


  meleeAttackDict = function( args )
  {
    //console.log( "meleeAttackDict" );

    var x = eval(args.shift());
    var y = eval(args.shift());
    var z = eval(args.shift());

    /*console.log( x );
    console.log( y );
    console.log( z );*/
    // var showOrRemove = eval(args.shift());
    // var showOrRemove = args.shift();

    /**
     * tileId's of the tiles being changed that need to be redrawn after
     */
    var idOldTileLeft = $gameMap.tileId( x - 1, y, z );
    var idOldTileRight = $gameMap.tileId( x + 1, y, z );
    var idOldTileUp = $gameMap.tileId( x, y - 1, z );
    var idOldTileDown = $gameMap.tileId( x, y + 1, z );

    /**
     * Getting coordinates of the affected tiles
     */
    var xString = x.toString();
    var xLeftString = ( x - 1 ).toString();
    var xRightString = ( x + 1 ).toString();

    var yString = y.toString();
    var yUpString = ( y - 1 ).toString();
    var yDownString = ( y + 1 ).toString();

    var zString = z.toString();

    var oldLeft = [ xLeftString, yString, zString, idOldTileLeft ];
    var oldRight = [ xRightString, yString, zString, idOldTileRight ];
    var oldUp = [ xString, yUpString, zString, idOldTileUp ];
    var oldDown = [ xString, yDownString, zString, idOldTileDown ];

    /***
     * Currently this dictionary holds the 
     *      []
     *    []  []
     *      []
     * coordinates and old tileId in an array
     */
    redrawMeleeAttackDict.push( 
      {
        oldLeftTile: oldLeft,
        oldRightTile: oldRight,
        oldUpTile: oldUp,
        oldDownTile: oldDown
      }
    )
  }


  /**
   * displayTile(String tileType, int positionX, int PositionY)
   * 
    displayBaseTileInterpreter.pluginCommand( 'DISPLAYBASETILE', [ '2816', '10', '10' ] );
   * 
   * ChangeTile x y z tileId
   */
  displayBaseTile = function( args )
  {
    //console.log( "Displaybasetile: ");
    var desiredTileId = args[ 0 ];
    var x = args[ 2 ];
    var y = args[ 3 ];

    /*console.log( "desiredTileId, x, y: " );
    console.log( desiredTileId );
    console.log( x );
    console.log( y );*/


    /**
     * Element still in array
     */
    var myInterpreter = new Game_Interpreter();
    myInterpreter.pluginCommand( 'ChangeTile', [ x, y, 0, desiredTileId ] );

    threeLayersDict.forEach( function( entry ) {
      //console.log( entry );
    } );
  }


  displayOverlayTile = function( args )
  {
    //console.log( "DisplayOverlaytile: ");
    var desiredOverlayId = args[ 1 ];
    var x = args[ 2 ];
    var y = args[ 3 ];

    /*console.log( "desiredOverlayId, x, y: " );
    console.log( desiredOverlayId );
    console.log( x );
    console.log( y );*/


    /**
     * Element still in array
     */
    var myInterpreter = new Game_Interpreter();
    // Have to remember the layer of z to be 3 otherwise black underground
    myInterpreter.pluginCommand( 'ChangeTile', [ x, y, 3, desiredOverlayId ] );
  }


  /**
   * could iterate through entire dict, checking x and y coords
   * 
   * args = int x, int y
   * 
   * remove tile will revert it to the original base and overlay tiles as when
   * the map is first loaded
   * 
   * i think threelayersdict is an array of dicts
   * 
   * BUG IF YOU DISPLAY TILE ON SAME TILE MULTIPLE TIMES, CUS THEN THE MODIFIED
   * TILE IS SAVED AS THE OG TILE AS WHEN YOU CALL THE DISPLAY AGAIN ON THE SAME TILE
   * AT THAT TIME THE STILL MODIFIED TILE IS THE "OG" AT THAT TIME
   */
  removeTile = function( args )
  {
    //console.log( "Removing tile" );


    var testX = args[ 0 ];
    var testY = args[ 1 ];

    //console.log( testX );
    //console.log( testY );

    
    for( var index = 0; index < threeLayersDict.length; ++index )
    {
      var tempElement = Object.create( threeLayersDict[ index ] );
      //console.log( "tempElement.x: ", tempElement.x );
      //console.log( "tempElement.y: ", tempElement.y );
      if( tempElement.x == testX && tempElement.y == testY )
      {
        //console.log( "Same smae" );
        /**
         * structure of the object
        x: x,
        y: y,
        desiredBaseTileId: desiredBaseTileId,
        desiredOverlayTileId: desiredOverlayTileId,
        idOldTileLayer0: idOldTileLayer0,
        idOldTileLayer2: idOldTileLayer2,
        idOldTileLayer3: idOldTileLayer3
         */
        var myInterpreter = new Game_Interpreter();
        myInterpreter.pluginCommand( 'ChangeTile', [ tempElement.x, tempElement.y, 0, tempElement.idOldTileLayer0 ] );
        myInterpreter.pluginCommand( 'ChangeTile', [ tempElement.x, tempElement.y, 2, tempElement.idOldTileLayer2 ] );
        myInterpreter.pluginCommand( 'ChangeTile', [ tempElement.x, tempElement.y, 3, tempElement.idOldTileLayer3 ] );


        threeLayersDict.splice( index, 1 );
      }
    }

    //console.log( "Elements in threeLayersDict: " );
    threeLayersDict.forEach(function(entry) {
      //console.log(entry);
    });
    //console.log( "Done removing tile" );

  }


  /**
   * Args: String baseTileId, String overlayTileId, var positionX, var positionY
   * 
   * If you want to change the base tile, zLayer = 0. If you want an overlaying
   * tile on top, zLayer = 3.
   * 
    displayBaseTileInterpreter.pluginCommand( 'DISPLAYBASETILE', [ '2816', '215', '10', '10' ] );
   *
   * I should put in a check to see if the tile is already in the dict
   */
  threeLayersDictPush = function( args )
  {
    //console.log( "threeLayersDictPush" );

    // Four argument inputs
    var desiredBaseTileId = eval( args.shift() );
    var desiredOverlayTileId = eval( args.shift() );
    var x = eval( args.shift() );
    var y = eval( args.shift() );

    var idOldTileLayer0 = $gameMap.tileId( x, y, 0 );
    var idOldTileLayer2 = $gameMap.tileId( x, y, 2 );
    var idOldTileLayer3 = $gameMap.tileId( x, y, 3 );


    threeLayersDict.push(
      {
        x: x,
        y: y,
        desiredBaseTileId: desiredBaseTileId,
        desiredOverlayTileId: desiredOverlayTileId,
        idOldTileLayer0: idOldTileLayer0,
        idOldTileLayer2: idOldTileLayer2,
        idOldTileLayer3: idOldTileLayer3
      }
    )

    threeLayersDict.forEach( function( entry ) {
      //console.log( entry );
    } );

  }


  /**
   * Taking care of the "plugin command" command
   */
  var _Johnas_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function( command, args ) 
  {
      switch( command.toUpperCase() ) 
      {
        case 'MELEE':
          //console.log( "MELEE CASE" );

          var showOrRemove = args.slice( -1 ).pop();
          if( showOrRemove == "SHOW" )
          {
            //console.log( "Showing attack" );
            meleeAttackDict( args );
            showMeleeAttack( redrawMeleeAttackDict[ Object.keys( redrawMeleeAttackDict ).length - 1 ] );
          } else if( showOrRemove == "REMOVE" ) {
            //console.log( "Removing attack" );
            if( Object.keys( redrawMeleeAttackDict ).length >= 1 )
            {
              removeMeleeAttack( redrawMeleeAttackDict[ 0 ] );
            }
          }
          break;
        case 'DISPLAYBASETILE':
          //console.log( "DISPLAYBASETILE CASE" );
          var tempArgs = Object.create( args );
          //console.log( "Tempargs: ", tempArgs );

          threeLayersDictPush( tempArgs );
          //console.log( "Tempargs 2 : ", tempArgs );
          threeLayersDict.forEach( function( entry ) {
            //console.log( entry );
          } );
          // console.log( "Args: ", args );
          //console.log( "Tempargs3 : ", tempArgs );

          displayBaseTile( tempArgs );
          break;
        case 'DISPLAYOVERLAYTILE':
          //console.log( "DISPLAYOVERLAYTILE CASE" );
          var tempArgs = Object.create( args );
          //console.log( "Tempargs: ", tempArgs );

          threeLayersDictPush( tempArgs );
          //console.log( "Tempargs 2 : ", tempArgs );
          threeLayersDict.forEach( function( entry ) {
            //console.log( entry );
          } );
          // console.log( "Args: ", args );
          //console.log( "Tempargs3 : ", tempArgs );

          displayOverlayTile( tempArgs );
          break;
        case 'REMOVETILE':
          //console.log( "REMOVE TILE CASE" );
          // var tempArgs = Object.create( args );
          removeTile( args );
          // removeTile( tempArgs );
          break;
        default:
          //console.log( "No case detected" );
          // _Johnas_Game_Interpreter_pluginCommand.call( this, command, args );
      }
  };
  
})();  // dont touch this.