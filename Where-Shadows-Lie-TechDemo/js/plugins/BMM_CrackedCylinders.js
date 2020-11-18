//=============================================================================
// BMM_CrackedCylinders.js
//=============================================================================

var Imported = Imported || {};
Imported.BMM_CrackedCylinders = true;
var BMM = BMM || {};
BMM.CYL = BMM.CYL || {};

/*:
 * @plugindesc Handles the major overrides and disables unneeded features of the engine
 *
 * @author NavrasK
 *
 * @param MovementInputBlock
 * @desc Switch that can be used to disable standard movement code for player
 * @type boolean
 * @default true
 *
 * @help Disables standard movement inputs in order to implement custom input handling
 * TERMS OF USE: No reuse without express permission of author
 * COMPATIBILITY: No issues known
 */
 
(function() {
	var parameters = PluginManager.parameters("BMM_CrackedCylinders");
    var movementInputBlock = parameters["MovementInputBlock"];
	
	// Override normal keyboard movement
	var alias_moveByInput = Game_Player.prototype.moveByInput;
	Game_Player.prototype.moveByInput = function() {
		if (movementInputBlock){
			return;
		}
		return alias_moveByInput.call(this);
	}

	// Override click / touch to move
	var alias_processMapTouch = Scene_Map.prototype.processMapTouch;
	Scene_Map.prototype.processMapTouch = function() {
		if (movementInputBlock){
			if (TouchInput.isTriggered() || this._touchCount > 0) {
				this._touchCount++;
			} else {
				this._touchCount = 0;
			}
		}
		return alias_processMapTouch.call(this);
    }
})();