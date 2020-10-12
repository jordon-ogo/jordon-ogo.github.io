/**
 * grab the cdRemaining object from the file BMM_Intake (line 75)
 * 
 */
// Scene_CustomMenu.prototype = Object.create


// "$gameScreen.showPicture(pictureId, name, origin, x, y,
//     scaleX, scaleY, opacity, blendMode)"
( function() 
{  
    var parameters = PluginManager.parameters('Show_Abilities');
    





	_alias_scene_map_update_abilities = Scene_Map.prototype.update;
	Scene_Map.prototype.update = function() 
	{
        $gameScreen.showPicture( 10, "BOMB", 1, 40, 50, 15, 10, 500, 0 );
        $gameScreen.showPicture( 11, "DASH", 1, 40, 100, 15, 10, 500, 0 );

        var bombCooldownValue = BMM.IN.getBombCooldown();
        var dashCooldownValue = BMM.IN.getDashCooldown();
        var bombToggledValue = BMM.IN.getBombToggled();
        var dashToggledValue = BMM.IN.getDashToggled();


        _alias_scene_map_update_abilities.call( this );
        
        switch( bombToggledValue )
        {
            case true:
                $gameScreen.showPicture( 26, "TOGGLED", 1, 120, 50, 15, 10, 500, 0 );
                break;
            case false:
                $gameScreen.erasePicture( 26 );
                break;
            default:
                console.log( "Shouldn't reach here" );
        }

        switch( dashToggledValue )
        {
            case true:
                $gameScreen.showPicture( 27, "TOGGLED", 1, 120, 100, 15, 10, 500, 0 );
                break;
            case false:
                $gameScreen.erasePicture( 27 );
                break;
            default:
                console.log( "Shouldn't reach here" );
        }

        switch( bombCooldownValue )
        {
            case 8:
                $gameScreen.showPicture( 12, "BOMB_TICKS", 1, 10, 70, 5, 10, 500, 0 );
                $gameScreen.showPicture( 13, "BOMB_TICKS", 1, 40, 70, 5, 10, 500, 0 );
                $gameScreen.showPicture( 14, "BOMB_TICKS", 1, 70, 70, 5, 10, 500, 0 );
                $gameScreen.showPicture( 15, "BOMB_TICKS", 1, 100, 70, 5, 10, 500, 0 );
                $gameScreen.showPicture( 16, "BOMB_TICKS", 1, 130, 70, 5, 10, 500, 0 );
                $gameScreen.showPicture( 17, "BOMB_TICKS", 1, 160, 70, 5, 10, 500, 0 );
                $gameScreen.showPicture( 18, "BOMB_TICKS", 1, 190, 70, 5, 10, 500, 0 );
                $gameScreen.showPicture( 19, "BOMB_TICKS", 1, 220, 70, 5, 10, 500, 0 );
                break;
            case 7:
                $gameScreen.erasePicture( 19 );
                break;
            case 6:
                $gameScreen.erasePicture( 18 );
                break;
            case 5:
			    $gameScreen.erasePicture( 17 );
                break;
            case 4:
                $gameScreen.erasePicture( 16 );
                break;
            case 3:
                $gameScreen.erasePicture( 15 );
                break;
            case 2:
                $gameScreen.erasePicture( 14 );
                break;
            case 1:
                $gameScreen.erasePicture( 13 );
                break;     
            case 0:
			    $gameScreen.erasePicture( 12 );
                break;
            default:
                console.log( "Shouldn't reach this" );
        }


        switch( dashCooldownValue )
        {
            case 6:
                $gameScreen.showPicture( 20, "DASH_TICKS", 1, 10, 130, 5, 10, 500, 0 );
                $gameScreen.showPicture( 21, "DASH_TICKS", 1, 40, 130, 5, 10, 500, 0 );
                $gameScreen.showPicture( 22, "DASH_TICKS", 1, 70, 130, 5, 10, 500, 0 );
                $gameScreen.showPicture( 23, "DASH_TICKS", 1, 100, 130, 5, 10, 500, 0 );
                $gameScreen.showPicture( 24, "DASH_TICKS", 1, 130, 130, 5, 10, 500, 0 );
                $gameScreen.showPicture( 25, "DASH_TICKS", 1, 160, 130, 5, 10, 500, 0 );    
                break;
            case 5:
                $gameScreen.erasePicture( 25 );
                break;
            case 4:
                $gameScreen.erasePicture( 24 );
                break;
            case 3:
                $gameScreen.erasePicture( 23 );
                break;
            case 2:
			    $gameScreen.erasePicture( 22 );
                break;
            case 1:
                $gameScreen.erasePicture( 21 );
                break;
            case 0:
                $gameScreen.erasePicture( 20 );
                break;
            default:
                console.log( "Shouldn't reach here either" );
        }
	};
})();  // dont touch this.
