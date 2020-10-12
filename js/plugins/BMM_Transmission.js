//=============================================================================
// BMM_Transmission.js
//=============================================================================
var Imported = Imported || {};
Imported.BMM_Transmission = true;
var BMM = BMM || {};
BMM.TRAN = BMM.TRAN || {};

/*:
 * @plugindesc Handles state management for the game
 *
 * @author NavrasK
 * 
 * [parameters]
 *
 * @help Handles transition steps between turns
 * TERMS OF USE: No reuse without express permission of author
 * COMPATIBILITY: No known issues
 */

(function() {
	var parameters = PluginManager.parameters("BMM_Transmission");

    class LevelMap {
        constructor(){
            this.width = $gameMap.width();
            this.height = $gameMap.height();
            this.map = new Array(this.height).fill(0).map(() => new Array(this.width).fill(0));
            this.eventMap = new Array(this.height).fill(0).map(() => new Array(this.width).fill(0));
            this.events = [];
        }
        scanMap() {
            this.map = new Array(this.height).fill(0).map(() => new Array(this.width).fill(0));
            for (var i = 0; i < this.height; i++) {
                for (var j = 0; j < this.width; j++) {
                    if ($gameMap.regionId(j, i) == 1) {
                        this.map[i][j] = 1;  //wall (marked with region id 1)
                    } else if ($gameMap.isPassable(j,i,2)||$gameMap.isPassable(j,i,4)||$gameMap.isPassable(j,i,6)||$gameMap.isPassable(j,i,8)){
                        this.map[i][j] = 0;  //walkable
                    } else {
                        this.map[i][j] = -1; //hole
                    }
                }
            }
        }
        initEvents() {
            var eventList = $gameMap.events();
            for (var e of eventList) {
                if (!e._erased && !e._sequenced) {
                    var info = this.parseInfo(e.event().note);
                    if (info.type == "enemy") {
                        if (info.class == "melee") {
                            this.events.push(new BMM.PT.ENEMY_Melee(e, info.basehp, info.attack, info.mod));
                        } else if (info.class == "ranged") {
                            this.events.push(new BMM.PT.ENEMY_Ranged(e, info.basehp, info.u. info.d, info.l, info.r, info.mod))
                        } else if (info.class == "bomb") {
                            this.events.push(new BMM.PT.ENEMY_Melee(e, info.basehp, info.attack, info.mod));
                        } else if (info.class == "hitscan") {
                            this.events.push(new BMM.PT.ENEMY_Melee(e, info.basehp, info.attack, info.range, info.mod));
                        }
                    } else if (info.type == "projectile") {
                        if (info.class == "bomb") {
                            this.events.push(new BMM.PT.PROJ_Bomb(e, info.fuse, info.radius, info.damage, info.neutral));
                        } else if (info.class == "arrow") {
                            this.events.push(new BMM.PT.PROJ_Arrow(e, info.direction, info.speed, info.damage, info.neutral));
                        }
                    } else if (info.type == "trap") {
                        if (info.class == "spike") {
                            this.events.push(new BMM.PT.TRAP_Spike(e));
                        } else if (info.class == "arrow") {
                            this.events.push(new BMM.PT.TRAP_Arrow(e, info.direction, info.projectile));
                        }
                    } else if (info.type == "boss") {
                        if (info.class == "golem") {
                            this.events.push(new BMM.PT.BOSS_Golem(e));
                        } else if (info.class == "spectre") {
                            this.events.push(new BMM.PT.BOSS_Spectre(e));
                        } else if (info.class == "radiant") {
                            this.events.push(new BMM.PT.BOSS_Radiant(e));
                        } else if (info.class == "deceiver") {
                            this.events.push(new BMM.PT.BOSS_Deceiver(e));
                        }
                    } else if (info.type == "warning") {
                        this.events.push(new BMM.PT.Warning(e, "generic")); // TODO add warning variants
                    } else {
                        this.events.push(new BMM.PT.Generic(e));
                    }
                }
            }
        }
        parseInfo(note) {
            if (note.toString().length > 0 || note.toString().slice(0, 7) == '{"type":') {
                var info = JSON.parse(note);
                if (info.type == "enemy") {
                    if (!("basehp" in info)) info.basehp = 1;
                    if (!("mod" in info)) info.mod = [];
                    if (!("attack" in info)) info.attack = 1;
                    if (!("maxrange" in info)) info.maxrange = 0;
                } else if (info.type == "projectile") {
                    if (!("speed" in info)) info.speeed = 3;
                    if (!("damage" in info)) info.damage = 1;
                    if (!("neutral" in info)) info.neutral = false;
                    if (!("radius" in info)) info.radius = 1;
                    if (!("fuse" in info)) info.fuse = 1;
                }
            } else {
                info = {"type":"generic"};
            }
            return info;
        }
        scanEvents() {
            this.initEvents();
            this.eventMap = new Array(this.height).fill(0).map(() => new Array(this.width).fill(0));
            for (var e of this.events) {
                if (!e._erased) {
                    this.eventMap[e.y][e.x] = e;
                }
            }
        }
        logMap() {
            var comboMap = new Array(this.height).fill("").map(() => new Array(this.width).fill(""));
            for (var i = 0; i < this.height; i++) {
                for (var j = 0; j < this.width; j++) {
                    if (this.eventMap[i][j] != 0) {
                        var evnote = this.eventMap[i][j].type;
                        if (evnote == "enemy") {
                            comboMap[i][j] = "E";
                        } else if (evnote == "projectile") {
                            comboMap[i][j] = "P";
                        } else if (evnote == "trap") {
                            comboMap[i][j] = "T";
                        } else if (evnote == "boss") {
                            comboMap[i][j] = "!";
                        } else {
                            comboMap[i][j] = "?";
                        }
                    } else {
                        if (this.map[i][j] == -1) {
                            comboMap[i][j] = "╬";
                        } else if (this.map[i][j] == 1) {
                            comboMap[i][j] = "█";
                        } else {
                            comboMap[i][j] = " ";
                        }
                    }
                }
            }
            comboMap[$gamePlayer.y][$gamePlayer.x] = "$";
            var mapString = ""
            for (var i = 0; i < this.height; i++) {
                for (var j = 0; j < this.width; j++) {
                    mapString += comboMap[i][j];
                }
                mapString += "\n";
            }
            console.log(mapString);
        }
        moveEvent(oldx, oldy, newx, newy) {
            this.eventMap[newy][newx] = this.eventAt(oldx, oldy);
            this.eventMap[oldy][oldx] = 0;
        }
        isPassable(x, y) {
            if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
                return this.isMapPassable(x, y) && this.isOpen(x, y);
            } else {
                return false;
            }
        }
        isMapPassable(x, y, flying = false) {
            if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
                if (flying && this.map[y][x] <= 0) {
                    return true;
                } else if (this.map[y][x] == 0) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
        eventAt(x, y) {
            if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
                if (this.eventMap[y][x] != 0) {
                    return (this.eventMap[y][x]);
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
        isOpen(x, y) { // TODO: Improve this
            if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
                var e = this.eventMap[y][x];
                if ((e != 0 && e.type != "warning") || ($gamePlayer.x == x && $gamePlayer.y == y)) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        }
    }

    BMM.TRAN.level = null;
    BMM.TRAN.turnCount = 1;

    BMM.TRAN.initMap = function() {
        BMM.TRAN.level = new LevelMap();
        BMM.TRAN.level.scanMap();
        BMM.TRAN.level.initEvents();
        BMM.TRAN.level.scanEvents();
        BMM.TRAN.level.logMap();
    }
    
    BMM.TRAN.rescan = function() {
        BMM.TRAN.level.scanEvents();
        BMM.TRAN.level.logMap();
    }
	
	BMM.TRAN.advanceTurn = function() {
        BMM.TRAN.turnCount += 1;
        console.log(">> TURN " + BMM.TRAN.turnCount.toString());
        BMM.IN.advanceAbilities();
        for (e of BMM.TRAN.level.events) {

            console.log("Testing event: " + String(e.class));
            if(e.class == "spiketrap"){//update given trap state
                e.changeState();
            }

            if (e.event._erased) {
                var index = BMM.TRAN.level.events.indexOf(e);
                if (index != -1) {
                    BMM.TRAN.level.events.splice(index, 1);
                }
            } else {
                e.advance();
            }
        }
        BMM.TRAN.rescan();
    }

})();