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

    BMM.HYB.playerHP = 3;
    BMM.HYB.playerMaxHP = 3;

    BMM.HYB.playerDamage = function(amt) {
        BMM.HYB.playerHP -= amt;
        if (amt > 0) {
            AudioManager.playSe({name: 'PlayerDamage', pan: 0, pitch: 100, volume: 100});
            $gameScreen.startShake(10, 5, 5); // (power, speed, duration)
            $gameScreen.startFlash([255, 0, 0, 150], 25); // ([R, G, B, A], duration) NOTE: RGBA = 0-255
        }
        if (BMM.HYB.playerHP <= 0) {
            AudioManager.playSe({name: 'PlayerDeath', pan: 0, pitch: 100, volume: 100});
            //SceneManager.goto(Scene_Gameover); // TODO: Player death failsafe
            if (DataManager.loadGame(2)) {
                $gamePlayer.reserveTransfer($gameMap.mapId(), $gamePlayer.x, $gamePlayer.y);
                $gamePlayer.requestMapReload();
                SceneManager.goto(Scene_Map);
            }
            BMM.HYB.playerHP = BMM.HYB.playerMaxHP;
        }
    }

    BMM.HYB.playerHeal = function(amt) {
        BMM.HYB.playerHP += amt;
        if (BMM.HYB.playerHP > BMM.HYB.playerMaxHP) {
            BMM.HYB.playerHP = BMM.HYB.playerMaxHP;
        }
    }

    BMM.HYB.advanceTurn = function() {
        BMM.IN.advanceAbilities();
        BMM.TRAN.advanceTurn();
        BMM.TIME.reset();
        console.log(">> TURN " + BMM.TIME.turnCount);
    }

    function sceneStart() { // Code runs when scene loads
        BMM.TRAN.initMap();
        BMM.TIME.turnCount = 0;
        BMM.TIME.nextTurn = -1;
        $gameSystem.onBeforeSave();
        if (DataManager.saveGame(2)) {
            StorageManager.cleanBackup(2);
        }
        BMM.GLOBAL.interpreter.pluginCommand("MapZoom", ["set", 1.5, "duration", 30]);
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