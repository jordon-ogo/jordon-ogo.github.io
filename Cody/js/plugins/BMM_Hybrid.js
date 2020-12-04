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

    BMM.HYB.playerDamage = function(amt, COD = "You died.") {
        BMM.HYB.playerHP -= amt;
        if (amt > 0) {
            AudioManager.playSe({name: 'PlayerDamage', pan: 0, pitch: 100, volume: 90});
            $gameScreen.startShake(10, 5, 5); // (power, speed, duration)
            $gameScreen.startFlash([255, 0, 0, 150], 25); // ([R, G, B, A], duration) NOTE: RGBA = 0-255
        }
        if (BMM.HYB.playerHP <= 0) {
            BMM.HYB.resetStage();
            AudioManager.playSe({name: 'PlayerDeath', pan: 0, pitch: 100, volume: 100});
        }
    }

    BMM.HYB.resetStage = function() {
        AudioManager.stopSe();
        BMM.HYB.mapCleanup();
        if (DataManager.loadGame(1)) {
            $gamePlayer.reserveTransfer($gameMap.mapId(), $gamePlayer.x, $gamePlayer.y);
            $gamePlayer.requestMapReload();
            SceneManager.goto(Scene_Map);
        }
        BMM.HYB.playerHP = BMM.HYB.playerMaxHP;
    }

    BMM.HYB.playerHeal = function(amt) {
        BMM.HYB.playerHP += amt;
        if (BMM.HYB.playerHP > BMM.HYB.playerMaxHP) {
            BMM.HYB.playerHP = BMM.HYB.playerMaxHP;
        }
    }

    BMM.HYB.advanceReady = false;

    BMM.HYB.advanceTurn = function() {
        BMM.IN.advanceAbilities();
        BMM.TRAN.advanceTurn();
        BMM.TIME.reset();
        BMM.HYB.advanceReady = false;
        console.log(">> TURN " + BMM.TIME.turnCount);
    }

    var currMap = null;

    function sceneStart() { // Code runs when scene loads
        if (BMM.GLOBAL.inMenu) {
            BMM.GLOBAL.inMenu = false;
            BMM.TRAN.rescan();
        } else {
            BMM.HYB.resetOverlays();
            BMM.TRAN.initMap();
            BMM.TIME.purgeExpiry();
            BMM.TIME.turnCount = 0;
            BMM.TIME.nextTurn = -1;
            BMM.HYB.playerHP = BMM.HYB.playerMaxHP;
            BMM.IN.resetAbilities();
        }
        if ($gameMap._mapId != currMap) {
            BMM.HYB.resetOverlays();
            $gameSystem.onBeforeSave();
            if (DataManager.saveGame(1)) {
                StorageManager.cleanBackup(1);
            }
            currMap = $gameMap._mapId;
        }
        BMM.IN.zLevel = 1.5;
        BMM.GLOBAL.interpreter.pluginCommand("MapZoom", ["set", BMM.IN.zLevel, "duration", 30]);
    }

    BMM.HYB.mapCleanup = function() {
        BMM.IN.resetAbilities();
        //var tileInterpreter = new Game_Interpreter();
        //tileInterpreter.pluginCommand( 'REMOVEALLTILES', []);//display enemy attacking on tile
        for (var e of BMM.TRAN.level.events) {
            e.destroy();
        }
        BMM.TRAN.level.events = [];
        BMM.HYB.resetOverlays();
        $gameMap.setup($gameMap._mapId);
    }

    BMM.HYB.resetOverlays = function() {
        // Reset any overlays that didn't disappear
        for (var x = 0; x < $gameMap.width(); x++) {
            for (var y = 0; y < $gameMap.height(); y++) {
                BMM.GLOBAL.interpreter.pluginCommand('REMOVETILE', [x, y]);
            }
        }
    }

    function sceneUpdate() { // Code runs every frame update
        if ($gameMessage.isBusy()) {
            BMM.GLOBAL.disableInput = true;
            BMM.GLOBAL.pauseTime = true;
        } else {
            if (BMM.GLOBAL.cutscene == false) {
                BMM.GLOBAL.disableInput = false;
                BMM.GLOBAL.pauseTime = false;
            }
        }
        BMM.TIME.turnTimer();
        BMM.TIME.expiry();
        BMM.IN.getInput();
        //if (BMM.HYB.advanceReady && BMM.TIME.dashInterp == null) BMM.HYB.advanceTurn();
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