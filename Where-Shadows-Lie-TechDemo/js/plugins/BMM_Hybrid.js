//=============================================================================
// BMM_Hybrid.js
//=============================================================================
var Imported = Imported || {};
Imported.BMM_Hybrid = true;
var BMM = BMM || {};
BMM.HYB = BMM.HYB || {};

/*:
 * @plugindesc Handles core gameplay loops and syncronization
 *
 * @author NavrasK
 * 
 * [parameters]
 *
 * @help This requires BMM_CrackedCylinders, BMM_Intake, and BMM_TimingBelt
 * 
 * TERMS OF USE: No reuse without express permission of author
 * COMPATIBILITY: No known issues
 */
 
(function() {
    var parameters = PluginManager.parameters("BMM_Hybrid");
    
    function testSpawn() {
        Galv.SPAWN.event(1,4,4);
    }

    // I'm just putting player health stuff here for now...
    BMM.HYB.playerHP = 3;

    BMM.HYB.playerDamage = function(amt) {
        BMM.HYB.playerHP -= amt;
        if (BMM.HYB.playerHP <= 0) {
            SceneManager.goto(Scene_Gameover);
        }
        BMM.HYB.updateHP();
    }

    BMM.HYB.playerHeal = function(amt) {
        BMM.HYB.playerHP += amt;
        if (BMM.HYB.playerHP > 3) {
            BMM.HYB.playerHP = 3;
        }
        BMM.HYB.updateHP();
    }

    BMM.HYB.updateHP = function() {
        $gameVariables.setValue(1, BMM.HYB.playerHP);
        console.log(BMM.HYB.playerHP);
    }

    function sceneStart() { // Code runs when scene loads
        //testSpawn();
        BMM.TRAN.initMap();
        BMM.TIME.resetTimer();
        BMM.TRAN.turnCount = 1;
        if (BMM.HYB.playerHP <= 0) {
            BMM.HYB.playerHP = 3;
        }
        BMM.HYB.updateHP();
    }

    function sceneUpdate() { // Code runs every frame update
        BMM.TIME.turnTimer();
        if (!$gameMessage.isBusy()) {
            BMM.IN.getInput();
        }
    }

    var alias_SceneUpdate = Scene_Map.prototype.updateMain;
    Scene_Map.prototype.updateMain = function() {
        sceneUpdate();
        return alias_SceneUpdate.call(this);
    }

    var alias_SceneStart = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        sceneStart();
        return alias_SceneStart.call(this);
    }
 })();