//=============================================================================
// BMM_Globals.js
//=============================================================================

var Imported = Imported || {};
Imported.BMM_Globals = true;
var BMM = BMM || {};
BMM.GLOBAL = BMM.GLOBAL || {};

/*:
 * @plugindesc Store globally used variables here
 *
 * @author Nifty Gibbon
 * 
 * [parameters]
 *
 * @help Put references to RMMV Variables / Switches here so that when 
 * you use them in other plugins you only need to modify this one file 
 * to update their definitions.  
 * 
 * NOTE this is only storing the reference number to the variable in 
 * RPG Maker (ie. variable #2) NOT the value!
 * 
 * FORMAT: BMM.VAR.[variable_name] = [variable #]
 *         BMM.SW.[switch_name] = [switch #]
 * 
 * TERMS OF USE: No reuse without express permission of authors
 * COMPATIBILITY: No known issues
 */

(function() {
    var parameters = PluginManager.parameters("BMM_Globals");
    
    // Define ALL global vars / switches here
    BMM.GLOBAL.disableStandardInput = true;
    BMM.GLOBAL.disableInput = false;
    BMM.GLOBAL.freezeSequencer = false;
    BMM.GLOBAL.pauseTime = false;
    BMM.GLOBAL.cutscene = false;
    BMM.GLOBAL.bomb = true; // TESTING ONLY
    BMM.GLOBAL.dash = true; // TESTING ONLY

    BMM.GLOBAL.interpreter = new Game_Interpreter();
})();