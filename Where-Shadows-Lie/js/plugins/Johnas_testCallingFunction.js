
( function() 
{  


    // 74 is key "J"
    Input.keyMapper[ "74" ] = "CHANGE BASE TILE";

    // 75 is key "K"
    Input.keyMapper[ "75" ] = "CHANGE OVERLAY TILE";

    // 76 is key "L"
    Input.keyMapper[ "76" ] = "MAP ID";

    // 78 is key "N"
    Input.keyMapper[ "78" ] = "REMOVE THE TILE";

    // Have to watch out - _alias .. is used in hearts_working so have to
    // have different names
    _alias_scene_map_melee = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
      _alias_scene_map_melee.call( this );
        if( Input.isTriggered( "CHANGE BASE TILE" ) )
        {
            //console.log( "The J button has been pressed" );

            /**
             * Working function that works as "Plugin command"
             */
            var meleeInterpreter = new Game_Interpreter();
            meleeInterpreter.pluginCommand( 'DISPLAYBASETILE', [ '2386', '10', '3', '5' ] );

            //console.log( "Done the 'Pressed J' comand" );
        } else if( Input.isTriggered( "CHANGE OVERLAY TILE" ) ) {
            //console.log( "The K button has been pressed" );

            /**
             * Working function that works as "Plugin command"
             */
            var meleeInterpreter = new Game_Interpreter();
            meleeInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '10', '1', '5' ] );

            //console.log( "Done the 'Pressed K' comand" );
        } else if( Input.isTriggered( "REMOVE THE TILE" ) ) {
            //console.log( "The N button has been pressed" );

            /**
             * Working function that works as "Plugin command"
             */
            var meleeInterpreter = new Game_Interpreter();
            meleeInterpreter.pluginCommand( 'REMOVETILE', [ '3', '5' ] );
            meleeInterpreter.pluginCommand( 'REMOVETILE', [ '1', '5' ] );

            //console.log( "Done the 'Pressed N' comand" );
        } else if( Input.isTriggered( "MAP ID" ) ) {
            //console.log( "The L button has been pressed" );

            /**
             * Working function that works as "Plugin command"
             */
            //console.log( $gameMap.mapId() );

            //console.log( "Done the 'Pressed L' comand" );
        }
    };
})();  // dont touch this.
