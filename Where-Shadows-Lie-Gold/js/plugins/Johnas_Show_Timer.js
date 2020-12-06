/*=============================================================================
 * Johnas' Show Timer Plugin
 * by Johnas Wong
 * Date: October 21, 2020 
 * Johnas_Show_Timer.js
 * 
 * File dependencies:
 *   - BMM_TimingBelt.js
 *=============================================================================*/
/*:
 * @plugindesc Shows the turn timer and time remaining
 * @author Johnas
 */

/**
 * grab the cdRemaining object from the file BMM_Intake (line 75)
 * 
 * PICTURE IDS 30 - 40
 */

(function() {  
    var parameters = PluginManager.parameters('Show_Timer');
	_alias_scene_map_turntimer = Scene_Map.prototype.update;
	Scene_Map.prototype.update = function() {
        //BMM.TIME.perTurn is max turn time
        var timeRemaining = BMM.TIME.remaining();
        var timeMax = BMM.TIME.perTurn;

        _alias_scene_map_turntimer.call( this );

        $gameScreen.erasePicture(30);
        var frac = null;
        if (timeMax == 8000) {
            frac = Math.floor(timeRemaining / 1000); // 8 seconds -> every second
        } else if (timeMax == 4000) {
            frac = Math.floor(timeRemaining / 500);  // 4 seconds -> every half second
        } else if (timeMax == 2000) {
            frac = Math.floor(timeRemaining / 250);  // 2 seconds -> every quarter second
        }
        if (frac != null && BMM.GLOBAL.showTimer) {
            if (frac < 0) frac = 0;
            if (frac > 8) frac = 8;
            var img = "timer" + frac;
            $gameScreen.showPicture(30, img, 1, 780, 40, 50, 50, 500, 0);
        }
	};
})();  // dont touch this.
