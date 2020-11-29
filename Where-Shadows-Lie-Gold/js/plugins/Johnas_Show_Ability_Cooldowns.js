/*=============================================================================
 * Johnas' Abilities Bar Plugin
 * by Johnas Wong
 * Date: October 4, 2020 
 * Johnas_Show_Ability_Cooldowns.js
 * 
 * File dependencies:
 *   - BMM_Intake.js
 *=============================================================================*/
/*:
 * @plugindesc Shows the status of the player's abilities
 * @author Johnas
 */

/**
 * grab the cdRemaining object from the file BMM_Intake (line 75)
 * 
 * PICTURE IDS 10 - 13
 */

( function() 
{  
    var parameters = PluginManager.parameters('Show_Abilities');




	_alias_scene_map_update_abilities = Scene_Map.prototype.update;
	Scene_Map.prototype.update = function() 
	{


        var bombCooldownValue = BMM.IN.getBombCooldown();
        var dashCooldownValue = BMM.IN.getDashCooldown();
        var bombToggledValue = BMM.IN.getBombToggled();
        var dashToggledValue = BMM.IN.getDashToggled();


        _alias_scene_map_update_abilities.call( this );
        
        $gameScreen.erasePicture(10);
        $gameScreen.erasePicture(12);
        if (BMM.GLOBAL.bomb) {
            switch (bombToggledValue) {
                case true:
                    $gameScreen.showPicture(10, "bomb_selected", 1, 20, 50, 25, 25, 500, 0);
                    break;
                case false:
                    $gameScreen.showPicture(10, "bomb_unselected", 1, 20, 50, 25, 25, 500, 0);
                    break;
                default:
                    console.log("Shouldn't reach here");
            }

            switch (bombCooldownValue) {
                case 8:
                    $gameScreen.showPicture(12, "bar_8seg_empty", 1, 105, 55, 25, 25, 500, 0);
                    break;
                case 7:
                    $gameScreen.showPicture(12, "bar_8seg_orange_1", 1, 105, 55, 25, 25, 500, 0);
                    break;
                case 6:
                    $gameScreen.showPicture(12, "bar_8seg_orange_2", 1, 105, 55, 25, 25, 500, 0);
                    break;
                case 5:
                    $gameScreen.showPicture(12, "bar_8seg_orange_3", 1, 105, 55, 25, 25, 500, 0);
                    break;
                case 4:
                    $gameScreen.showPicture(12, "bar_8seg_orange_4", 1, 105, 55, 25, 25, 500, 0);
                    break;
                case 3:
                    $gameScreen.showPicture(12, "bar_8seg_orange_5", 1, 105, 55, 25, 25, 500, 0);
                    break;
                case 2:
                    $gameScreen.showPicture(12, "bar_8seg_orange_6", 1, 105, 55, 25, 25, 500, 0);
                    break;
                case 1:
                    $gameScreen.showPicture(12, "bar_8seg_orange_7", 1, 105, 55, 25, 25, 500, 0);
                    break;
                case 0:
                    $gameScreen.showPicture(12, "bar_8seg_orange_8", 1, 105, 55, 25, 25, 500, 0);
                    break;
                default:
                    console.log("Shouldn't reach this");
            }
        }
        
        $gameScreen.erasePicture(11);
        $gameScreen.erasePicture(13);
        if (BMM.GLOBAL.dash) {
            switch (dashToggledValue) {
                case true:
                    $gameScreen.showPicture(11, "dash_selected", 1, 20, 85, 25, 25, 500, 0);
                    break;
                case false:
                    $gameScreen.showPicture(11, "dash_unselected", 1, 20, 85, 25, 25, 500, 0);
                    break;
                default:
                    console.log("Shouldn't reach here");
            }

            switch (dashCooldownValue) {
                case 6:
                    $gameScreen.showPicture(13, "bar_6seg_empty", 1, 105, 85, 25, 25, 500, 0);

                    break;
                case 5:
                    $gameScreen.showPicture(13, "bar_6seg_blue_1", 1, 105, 85, 25, 25, 500, 0);

                    break;
                case 4:
                    $gameScreen.showPicture(13, "bar_6seg_blue_2", 1, 105, 85, 25, 25, 500, 0);

                    break;
                case 3:
                    $gameScreen.showPicture(13, "bar_6seg_blue_3", 1, 105, 85, 25, 25, 500, 0);

                    break;
                case 2:
                    $gameScreen.showPicture(13, "bar_6seg_blue_4", 1, 105, 85, 25, 25, 500, 0);

                    break;
                case 1:
                    $gameScreen.showPicture(13, "bar_6seg_blue_5", 1, 105, 85, 25, 25, 500, 0);

                    break;
                case 0:
                    $gameScreen.showPicture(13, "bar_6seg_blue_6", 1, 105, 85, 25, 25, 500, 0);

                    break;
                default:
                    //console.log("Shouldn't reach here either");
                    break;
            }
        }

        /**
         * "$gameScreen.showPicture(pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode)"
         */
        
	};
})();  // dont touch this.
