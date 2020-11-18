/*=============================================================================
 * Johnas' Hearts Bar Plugin
 * by Johnas Wong
 * Date: September 28, 2020 
 * Johnas_Show_Hearts.js
 * 
 * File dependencies:
 *   - BMM_Hybrid.js
 *=============================================================================*/
/*:
 * @plugindesc Shows the number of hearts the player has (Currently 0 - 6)
 * @author Johnas
 */

 /**
  * TO DO LIST:
  * 
	- For further polish, if can't find way to animate could do janky animation
     by using .showPicture and using broken heart pngs
     
     - Try to find a way of only drawing the picture if the value changes

	- PICTURE IDS: 1 - 6

  */
( function() 
{  
    var parameters = PluginManager.parameters('Show_Hearts');
    
    _alias_scene_map_update_hearts = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() 
    {
        var maxHearts = BMM.HYB.playerMaxHP;
        var currentHearts = BMM.HYB.playerHP;

        _alias_scene_map_update_hearts.call( this );
        
        if (BMM.GLOBAL.showHearts) {
              switch (maxHearts) {
                   // max life
                   case 6:
                        switch (currentHearts) {
                             case 6:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "full_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "full_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(4, "full_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(5, "full_player_heart", 1, 180, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(6, "full_player_heart", 1, 220, 20, 25, 25, 500, 0);
                                  break;
                             case 5:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "full_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "full_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(4, "full_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(5, "full_player_heart", 1, 180, 20, 25, 25, 500, 0);

                                  $gameScreen.showPicture(6, "emptyl_player_heart", 1, 220, 20, 25, 25, 500, 0);
                                  break;
                             case 4:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "full_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "full_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(4, "full_player_heart", 1, 140, 20, 25, 25, 500, 0);

                                  $gameScreen.showPicture(5, "emptyl_player_heart", 1, 180, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(6, "emptyl_player_heart", 1, 220, 20, 25, 25, 500, 0);
                                  break;
                             case 3:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "full_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "full_player_heart", 1, 100, 20, 25, 25, 500, 0);

                                  $gameScreen.showPicture(4, "emptyl_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(5, "emptyl_player_heart", 1, 180, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(6, "emptyl_player_heart", 1, 220, 20, 25, 25, 500, 0);
                                  break;
                             case 2:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "full_player_heart", 1, 60, 20, 25, 25, 500, 0);

                                  $gameScreen.showPicture(3, "emptyl_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(4, "emptyl_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(5, "emptyl_player_heart", 1, 180, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(6, "emptyl_player_heart", 1, 220, 20, 25, 25, 500, 0);
                                  break;
                             case 1:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);

                                  $gameScreen.showPicture(2, "emptyl_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "emptyl_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(4, "emptyl_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(5, "emptyl_player_heart", 1, 180, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(6, "emptyl_player_heart", 1, 220, 20, 25, 25, 500, 0);
                                  break;
                             case 0:
                                  $gameScreen.showPicture(1, "emptyl_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "emptyl_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "emptyl_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(4, "emptyl_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(5, "emptyl_player_heart", 1, 180, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(6, "emptyl_player_heart", 1, 220, 20, 25, 25, 500, 0);
                                  break;
                        }
                   // max life
                   case 5:
                        switch (currentHearts) {
                             case 5:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "full_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "full_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(4, "full_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(5, "full_player_heart", 1, 180, 20, 25, 25, 500, 0);
                                  break;
                             case 4:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "full_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "full_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(4, "full_player_heart", 1, 140, 20, 25, 25, 500, 0);

                                  $gameScreen.showPicture(5, "emptyl_player_heart", 1, 180, 20, 25, 25, 500, 0);
                                  break;
                             case 3:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "full_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "full_player_heart", 1, 100, 20, 25, 25, 500, 0);

                                  $gameScreen.showPicture(4, "emptyl_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(5, "emptyl_player_heart", 1, 180, 20, 25, 25, 500, 0);
                                  break;
                             case 2:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "full_player_heart", 1, 60, 20, 25, 25, 500, 0);

                                  $gameScreen.showPicture(3, "emptyl_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(4, "emptyl_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(5, "emptyl_player_heart", 1, 180, 20, 25, 25, 500, 0);
                                  break;
                             case 1:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);

                                  $gameScreen.showPicture(2, "emptyl_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "emptyl_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(4, "emptyl_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(5, "emptyl_player_heart", 1, 180, 20, 25, 25, 500, 0);
                                  break;
                             case 0:
                                  $gameScreen.showPicture(1, "emptyl_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "emptyl_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "emptyl_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(4, "emptyl_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(5, "emptyl_player_heart", 1, 180, 20, 25, 25, 500, 0);
                                  break;
                        }
                   // max life
                   case 4:
                        switch (currentHearts) {
                             case 4:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "full_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "full_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(4, "full_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  break;
                             case 3:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "full_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "full_player_heart", 1, 100, 20, 25, 25, 500, 0);

                                  $gameScreen.showPicture(4, "emptyl_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  break;
                             case 2:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "full_player_heart", 1, 60, 20, 25, 25, 500, 0);

                                  $gameScreen.showPicture(3, "emptyl_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(4, "emptyl_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  break;
                             case 1:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);

                                  $gameScreen.showPicture(2, "emptyl_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "emptyl_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(4, "emptyl_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  break;
                             case 0:
                                  $gameScreen.showPicture(1, "emptyl_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "emptyl_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "emptyl_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(4, "emptyl_player_heart", 1, 140, 20, 25, 25, 500, 0);
                                  break;
                        }
                   // max life
                   case 3:
                        switch (currentHearts) {
                             case 3:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "full_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "full_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  break;
                             case 2:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "full_player_heart", 1, 60, 20, 25, 25, 500, 0);

                                  $gameScreen.showPicture(3, "emptyl_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  break;
                             case 1:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);

                                  $gameScreen.showPicture(2, "emptyl_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "emptyl_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  break;
                             case 0:
                                  $gameScreen.showPicture(1, "emptyl_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "emptyl_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(3, "emptyl_player_heart", 1, 100, 20, 25, 25, 500, 0);
                                  break;
                        }
                   // max life
                   case 2:
                        switch (currentHearts) {
                             case 2:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "full_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  break;
                             case 1:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);

                                  $gameScreen.showPicture(2, "emptyl_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  break;
                             case 0:
                                  $gameScreen.showPicture(1, "emptyl_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  $gameScreen.showPicture(2, "emptyl_player_heart", 1, 60, 20, 25, 25, 500, 0);
                                  break;
                        }
                   // max life
                   case 1:
                        switch (currentHearts) {
                             case 1:
                                  $gameScreen.showPicture(1, "full_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  break;
                             case 0:
                                  $gameScreen.showPicture(1, "emptyl_player_heart", 1, 20, 20, 25, 25, 500, 0);
                                  break;
                        }
              }
         }
    };
})();  // dont touch this.