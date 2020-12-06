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
(function () {
     var parameters = PluginManager.parameters('Show_Hearts');

     _alias_scene_map_update_hearts = Scene_Map.prototype.update;
     Scene_Map.prototype.update = function () {
          var maxHearts = BMM.HYB.playerMaxHP + BMM.HYB.playerMaxHPmod;
          var currentHearts = BMM.HYB.playerHP;

          _alias_scene_map_update_hearts.call(this);

          for (var i = 1; i <= 6; i++) {
               $gameScreen.erasePicture(i);
          }

          if (BMM.GLOBAL.showHearts) {
               var start = 20;
               var offset = 40;
               for (var i = 0; i < maxHearts; i++) {
                    var hearttype = (i < currentHearts) ? "full_player_heart" : "empty_player_heart";
                    $gameScreen.showPicture(i+1, hearttype, 1, start + offset*i, 20, 25, 25, 500, 0);
               }
          }
     };
})();  // dont touch this.