/*=============================================================================
 * Johnas' Show Boss Information Plugin
 * by Johnas Wong
 * Date: October 7, 2020 
 * Johnas_Show_Boss_Info.js
 * 
 * File dependencies:
 *   - BMM_Powertrain.js
 *=============================================================================*/
/*:
 * @plugindesc Shows the Boss information
 * @author Johnas
 */

/**
 * grab the cdRemaining object from the file BMM_Intake (line 75)
 * 
 * PICTURE IDS 20 - 27
 * 
 * 
 * I want to change the positioning of the hearts
 * like the boss haed in the middle
 * if 5 max hearts, they're around it in an upside down arc
 * 
 * if 4, 2 on each side
 */
// "$gameScreen.showPicture(pictureId, name, origin, x, y,
//     scaleX, scaleY, opacity, blendMode)"

(function() {  
    var parameters = PluginManager.parameters('Show_Boss_Info');

	_alias_scene_map_update_boss_info = Scene_Map.prototype.update;
	Scene_Map.prototype.update = function() {
        var bossMaxHP = BMM.PT.bossMaxHP();
        var bossAttackStage = BMM.PT.bossStage();
        var bossCurrentHP = BMM.PT.bossHP();

        _alias_scene_map_update_boss_info.call( this );

        for (var i = 20; i <= 27; i++) {
            $gameScreen.erasePicture(i);
        }

        if (BMM.PT.isBoss()) {
            var stagestring = "BOSS_STAGE" + Math.min(bossAttackStage, 3);
            $gameScreen.showPicture(20, stagestring, 1, 410, 29, 35, 35, 500, 0);
            var offset = 40;
            var starts = [0, 410, 390, 370, 350, 330];
            for (var i = 0; i < bossMaxHP; i++) {
                var hearttype = (i < bossCurrentHP) ? "full_boss_heart" : "empty_boss_heart";
                $gameScreen.showPicture(20+i+1, hearttype, 1, starts[bossMaxHP] + offset*i, 75, 25, 25, 500, 0);
            }
            $gameScreen.showPicture(26, "boss_detail_left", 1, starts[bossMaxHP] - offset - 10, 75, 25, 25, 500, 0);
            $gameScreen.showPicture(27, "boss_detail_right", 1, starts[bossMaxHP] + offset*bossMaxHP + 10, 75, 25, 25, 500, 0);
        }
	};
})();  // dont touch this.
