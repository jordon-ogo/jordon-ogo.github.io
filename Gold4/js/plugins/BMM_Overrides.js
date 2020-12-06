//=============================================================================
// BMM_Overrides.js
//=============================================================================

var Imported = Imported || {};
Imported.BMM_Overrides = true;
var BMM = BMM || {};
BMM.OVR = BMM.OVR || {};

/*:
 * @plugindesc Handles major overrides for RPG Maker functions
 *
 * @author Nifty Gibbon
 * 
 * [parameters]
 *
 * @help This disables standard inputs for movement
 * TERMS OF USE: No reuse without express permission of authors
 * COMPATIBILITY: No known issues
 */

(function() {
	var parameters = PluginManager.parameters("BMM_Overrides");

	// Override normal keyboard movement
	var alias_moveByInput = Game_Player.prototype.moveByInput;
	Game_Player.prototype.moveByInput = function() {
        if (BMM.GLOBAL.disableStandardInput) {
            return;
        } else {
            return alias_moveByInput.call(this);
        }
	}

	// Override click / touch to move
	var alias_processMapTouch = Scene_Map.prototype.processMapTouch;
	Scene_Map.prototype.processMapTouch = function() {
		if (BMM.GLOBAL.disableStandardInput) {
			if (TouchInput.isTriggered() || this._touchCount > 0) {
				this._touchCount++;
			} else {
				this._touchCount = 0;
			}
			return;
		} else {
            return alias_processMapTouch.call(this);
        }
	}
	
	// Override default font size
	Window_Base.prototype.standardFontSize = function() {
		return 20;
	}
})();