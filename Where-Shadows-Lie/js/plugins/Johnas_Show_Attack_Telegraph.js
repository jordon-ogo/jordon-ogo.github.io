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


  Example inputs: 

  meleeInterpreter.pluginCommand( 'DISPLAYBASETILE', [ '2386', '10', '3', '5' ] );
  meleeInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '10', '1', '5' ] );
  meleeInterpreter.pluginCommand( 'REMOVETILE', [ '3', '5' ] );
  meleeInterpreter.pluginCommand( 'REMOVETILE', [ '5', '5' ] );
*/


/**
* TO DO LIST:

  - MUST TEST OFF MAP CASES
*/


( function() 
{  
  var parameters = PluginManager.parameters('Show_Attack_Telegraph');
  
  /**
   * Global dictionary holding the melee attack tiles
   */
  var threeLayersDict = [];
        

  // 70 is key "F"
  Input.keyMapper[ "70" ] = "TileID Checker ( 0, 0, 0 )";
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
      console.log( "Done the 'Pressed F' command" );
    }
  };


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
    /**
     * Element still in array
     */
    var myInterpreter = new Game_Interpreter();
    myInterpreter.pluginCommand( 'ChangeTile', [ x, y, 0, desiredTileId ] );
  }


  displayOverlayTile = function( args )
  {
    var desiredOverlayId = args[ 1 ];
    var x = args[ 2 ];
    var y = args[ 3 ];
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
    var testX = args[ 0 ];
    var testY = args[ 1 ];
    for( var index = 0; index < threeLayersDict.length; ++index )
    {
      var tempElement = Object.create( threeLayersDict[ index ] );
      if( tempElement.x == testX && tempElement.y == testY )
      {
        var myInterpreter = new Game_Interpreter();
        myInterpreter.pluginCommand( 'ChangeTile', [ tempElement.x, tempElement.y, 0, tempElement.idOldTileLayer0 ] );
        myInterpreter.pluginCommand( 'ChangeTile', [ tempElement.x, tempElement.y, 2, tempElement.idOldTileLayer2 ] );
        myInterpreter.pluginCommand( 'ChangeTile', [ tempElement.x, tempElement.y, 3, tempElement.idOldTileLayer3 ] );
      }
    }
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
    // console.log( "3 Layers pushing" );

    // Need these to take the first 2 arguments
    var desiredBaseTileId = eval( args.shift() );
    var desiredOverlayTileId = eval( args.shift() );
    var x = eval( args.shift() );
    var y = eval( args.shift() );

    var idOldTileLayer0 = $gameMap.tileId( x, y, 0 );
    var idOldTileLayer2 = $gameMap.tileId( x, y, 2 );
    var idOldTileLayer3 = $gameMap.tileId( x, y, 3 );

    if( threeLayersDict.length == 0 )
    {
      // console.log( "Not in dict" );
      threeLayersDict.push(
        {
          x: x,
          y: y,
          mapID: $gameMap.mapId(),
          idOldTileLayer0: idOldTileLayer0,
          idOldTileLayer2: idOldTileLayer2,
          idOldTileLayer3: idOldTileLayer3
        }
      )
    // } else {
    //   var inDictAlready = false;
    //   for( var index = 0; index < threeLayersDict.length; ++index )
    //   {
    //     var tempElement = Object.create( threeLayersDict[ index ] );
    //     if( tempElement.x == x && tempElement.y == y && tempElement.mapID == $gameMap.mapId() )
    //     {
    //       console.log( "Already in dict" );
    //       inDictAlready = true;
    //       break;
    //     }
    //   }
    //   if( inDictAlready == false )
    //   {
    //     console.log( "Not in dict" );
    //     threeLayersDict.push(
    //       {
    //         x: x,
    //         y: y,
    //         mapID: $gameMap.mapId(),
    //         idOldTileLayer0: idOldTileLayer0,
    //         idOldTileLayer2: idOldTileLayer2,
    //         idOldTileLayer3: idOldTileLayer3
    //       }
    //     )
    //   }
    // }
      } else {
        var inDictAlready = false;
        for( var index = 0; index < threeLayersDict.length; ++index )
        {
          var tempElement = Object.create( threeLayersDict[ index ] );
          if( tempElement.mapID != $gameMap.mapId() ) 
          {
            console.log( "New map" );
            threeLayersDict = [];
          }
          if( tempElement.x == x && tempElement.y == y )
          {
            // console.log( "Already in dict" );
            inDictAlready = true;
            break;
          }
        }
        if( inDictAlready == false )
        {
          // console.log( "Not in dict" );
          threeLayersDict.push(
            {
              x: x,
              y: y,
              mapID: $gameMap.mapId(),
              idOldTileLayer0: idOldTileLayer0,
              idOldTileLayer2: idOldTileLayer2,
              idOldTileLayer3: idOldTileLayer3
            }
          )
        }
      } 
    // threeLayersDict.forEach(function(entry) {
    //   console.log(entry);
    // }); 
  }


  /**
   * Taking care of the "plugin command" command
   */
  var _Johnas_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function( command, args ) 
  {
      switch( command.toUpperCase() ) 
      {
        case 'DISPLAYBASETILE':
          var tempArgs = Object.create( args );
          threeLayersDictPush( tempArgs );
          displayBaseTile( tempArgs );
          break;
        case 'DISPLAYOVERLAYTILE':
          var tempArgs = Object.create( args );
          threeLayersDictPush( tempArgs );
          displayOverlayTile( tempArgs );
          break;
        case 'REMOVETILE':
          removeTile( args );
          break;
        default:
      }
  };
})();  // dont touch this.