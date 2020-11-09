//=============================================================================
// BMM_Powertrain.js
//=============================================================================
var Imported = Imported || {};
Imported.BMM_Powertrain = true;
var BMM = BMM || {};
BMM.PT = BMM.PT || {};

/*:
 * @plugindesc Handles and stores sequenced classes
 *
 * @author NavrasK
 * 
 * [parameters]
 *
 * @help Populate with any sequenced object behaviour needed
 * TERMS OF USE: No reuse without express permission of author
 * COMPATIBILITY: No known issues
 */

(function() {
    var parameters = PluginManager.parameters("BMM_Powertrain");

    var alias_eventInit = Game_Event.prototype.initMembers;
    Game_Event.prototype.initMembers = function() {
        alias_eventInit.call(this);
        this._sequenced = false;
    }

    BMM.PT.Player = class {
        constructor(maxhp, currhp) {
            //TODO: get state of dash / bomb unlock through game variables
        }
    }
    
    function randInt(low, high) { // returns an integer between low and high (inclusive)
        return Math.floor(Math.random() * (high - low + 1)) + low;
    }

    function randomDir() {
        return randInt(1,4) * 2;
    }

    function dirToMove(dir) {
        if (dir == 2) {
            return [0, 1]; //down
        } else if (dir == 4) {
            return [-1, 0];//left
        } else if (dir == 6) {
            return [1, 0]; //right
        } else if (dir == 8) {
            return [0, -1];//up
        } else {
            return [0, 0]; //none
        }
    }

    function testDisplayTileValidity(posX, posY){
        if (posX < 0 || posY < 0 || posX >= BMM.TRAN.level.width || posY >= BMM.TRAN.level.height
            || !BMM.TRAN.level.isMapPassable(posX, posY, true)) {//trying to dash off map or hitting a wall. End loop, as you can't go further.
            return false;
        }
        return true;
    }

    BMM.PT.Generic = class {
        constructor(event, spawned = false) {
            this.event = event;
            this.x = event._x;
            this.y = event._y;
            this.id = event._eventId;
            this.name = event.event().name;
            this.note = event.event().note;
            this.dir = event._direction;
            this.type = "generic";
            this.event._sequenced = true;
            this.warningLoc = {};
            this.isSpawn = spawned;
            this.pose = 0;
            this.disable = false;
        }
        advance() { return null; }
        destroy() {
            var tileInterpreter = new Game_Interpreter();
            for (var loc in this.warningLoc) {//any tiles the event may have displayed need to be removed
                tileInterpreter.pluginCommand( 'REMOVETILE', this.warningLoc[loc]);
                delete this.warningLoc[loc];
            }
            this.nextActions = [];
            if (this.isSpawn) {
                this.event.setImage("", 0);
                this.event.setPriorityType(0);
                BMM.TRAN.level.moveEvent(this.x, this.y, 0, 0);
                this.event.setPosition(0, 0);
                this.x = this.event._x;
                this.u = this.event._y;
                this.event.event().note = '{"type":"spawn"}';
                //this.event._erased = true;
                this.event._sequenced = false;
                this.disable = true;
            } else {
                this.event._erased = true;
                this.event._sequenced = false;
                this.event.refresh();
            }
        }
    }

    // Standard events that everything must boil down to:
    // ["move", dx, dy, dir]: move and face new direction
    // ["face", dir]: face a direction without moving
    // ["warn", x, y, type]: shows warning on tile. Type = "move", "attack", "spawn", or can be unique (ie boss attack)
    // ["hit", x, y, damage, [ignored]]: damages entities on x,y by amount of damage, unless they are in ignored array
    // ["fly", dx, dy, dist, damage, neutral]: tries to move dist units in direction [dx, dy], 
    //      stopping if it hits anything and damaging it if it can
    // ["spawn", x, y, objectid]: spawns object at position
    // ["destroy"]: destroys itself
    // []: do nothing

    // Any event that is connected to the time system extends from here
    class Sequenced extends BMM.PT.Generic {
        constructor(event) {
            super(event);
            this.nextActions = [];
        }
        advance() {
            if (this.disable) return;
            this.executeActions();
            this.nextActions = [];
            this.getNextActions();
        }
        executeActions() {
            if (this.nextActions.length > 0) {
               //console.log("> " + this.name);
            }
            for (var action of this.nextActions) {
                //console.log("\t" + action);
                if (action[0] == "move") {
                    this.face(action[3])
                    this.move(action[1], action[2], action[3]);
                } else if (action[0] == "face") {
                    this.face(action[1]);
                } else if (action[0] == "warn") {
                    this.warn(action[1], action[2], action[3]);
                } else if (action[0] == "hit") {
                    this.hit(action[1], action[2], action[3], action[4]);
                } else if (action[0] == "fly") {
                    this.fly(action[1], action[2], action[3], action[4]), action[5];
                } else if (action[0] == "spawn") {
                    this.spawn(action[1], action[2], action[3]);
                } else if (action[0] == "spawn_event") {
                    this.spawnEvent(action[1], action[2], action[3], action[4]);  
                } else if (action[0] == "destroy") {
                    this.destroy();
                } else if (action[0] == "log") {
                    //console.log(action[1]);
                } else if (action[0] == "radiant_dash") {
                    this.radiantLunge();
                } else if (action[0] == "radiant_bomb") {
                    this.radiantBomb();
                } else if (action[0] == "d_burrow") {
                    this.startBurrow();
                } else if (action[0] == "play_se") {
                    this.playSE(action[1], action[2], action[3], action[4]);
                } else if (action[0] == "d_endburrow") {
                    this.emerge();
                }
            }
        }
        move(dx, dy, dir) {
            if (BMM.TRAN.level.isPassable(this.x + dx, this.y + dy)) {
                BMM.TRAN.level.moveEvent(this.x, this.y, this.x + dx, this.y + dy);
                //this.event.setPosition(this.x + dx, this.y + dy);
                this.event.setMoveSpeed(4.75);
                //this.event.setPattern(this.pose);
                //this.pose = (this.pose === 0) ? 2 : 0;
                this.event.moveStraight(dir);
                this.x = this.event._x;
                this.y = this.event._y;
            }
        }
        face(dir) {
            this.event.setDirection(dir);
            this.dir = this.event._direction;
        }
        warn(xpos, ypos, warntype){
            //console.log("WARNING ENEMY ATTACK");
            var tileInterpreter = new Game_Interpreter();
            if (warntype == "attack") {
                tileInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '11', xpos, ypos]);//display enemy attacking on tile
                //console.log("HASHMAP Before add: " + String(Object.keys(this.warningLoc)));
                this.warningLoc[[xpos, ypos]] = [xpos, ypos];//add tile display loc to hashmap
                //console.log("HASHMAP after add: " + String(Object.keys(this.warningLoc)));
            } else if (warntype == "spawn") {
                tileInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '10', xpos, ypos]);//display enemy attacking on tile
                //console.log("HASHMAP Before add: " + String(Object.keys(this.warningLoc)));
                this.warningLoc[[xpos, ypos]] = [xpos, ypos];//add tile display loc to hashmap
                //console.log("HASHMAP after add: " + String(Object.keys(this.warningLoc)));
            } else if (warntype == "burrow") {
                tileInterpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '5', xpos, ypos]);
            } else {
                // TODO?
            }
        }
        hit(xpos, ypos, dmg, exclude) {
            var hitTarget = BMM.TRAN.level.eventAt(xpos, ypos);
            if (hitTarget == null || hitTarget.type == "warning") {
                if ($gamePlayer.x == xpos && $gamePlayer.y == ypos) {
                    BMM.HYB.playerDamage(dmg);
                }
            } else {
                if ((hitTarget.type == "enemy" && !exclude.includes("enemy")) || (hitTarget.type == "boss" && !exclude.includes("boss"))) {
                    hitTarget.damage(dmg);
                }
            }
            //regarlesss if hit connects or not, remove warning tile
            var tileInterpreter = new Game_Interpreter();
            tileInterpreter.pluginCommand( 'REMOVETILE', [xpos, ypos] );
            //console.log("HASHMAP Before remove: " + String(Object.keys(this.warningLoc)));
            delete this.warningLoc[[xpos, ypos]];
            //console.log("HASHMAP after remove: " + String(Object.keys(this.warningLoc)));
        }
        fly(dx, dy, dist, damage, neutral) {
            for (var i = 0; i < dist; i++) {
                if (BMM.TRAN.level.isPassable(this.x + dx, this.y + dy)) {
                    this.move(dx, dy);
                } else {
                    if (neutral) {
                        this.hit(this.x + dx, this.y + dy, damage);
                    } else {
                        this.hit(this.x + dx, this.y + dy, damage, ["boss", "enemy"]);
                    }
                    this.destroy();
                }
            }
            if (!this.event._erased) {
                for (var i2 = 1; i2 <= dist; i2++) {
                    //console.log("WARNING @ [" + this.x + dx * i2 + ", " + this.y + dy * i2 + "]")
                    this.warn(this.x + dx * i2, this.y + dy * i2, "attack");
                }
            }
        }
        spawn(xpos, ypos, spawnId) {
            if (xpos >= 0 && ypos >= 0 && xpos < BMM.TRAN.level.width && ypos < BMM.TRAN.level.height) {
                Galv.SPAWN.event(spawnId,xpos,ypos);
            }
        }
        spawnEvent(x, y, type, note) {
            BMM.TRAN.level.spawnEvent(x, y, type, note);
            BMM.GLOBAL.interpreter.pluginCommand("REMOVETILE", [x,y]);
        }
        playSE(file, pan, pitch, vol) {
            AudioManager.playSe({name: file, pan: pan, pitch: pitch, volume: vol});
        }
        getNextActions() {
            // MUST BE OVERLOADED IN CHILDREN, AI behaviour tree or sequence
            //throw "getNextActions was not overloaded!"
        }
    }

    BMM.PT.Warning = class extends Sequenced {
        constructor(event, subtype) {
            super(event);
            this.type = "warning";
            this.class = subtype;
            this.nextActions.push(["destroy"]);
        }
        getNextActions(){
            //this.nextActions.push(["destroy"]);
        }
    }

    BMM.PT.Spawn = class extends BMM.PT.Generic {
        constructor(event) {
            event.setPosition(0, 0);
            super(event, true);
        }
        spawn(x, y, type, note) {
            if (type == "melee") {
                this.event.setImage("Monster", 2);
            } else if (type == "melee_elite") {
                this.event.setImage("Monster", 3);
            } else {
                return;
            }
            this.event.event().note = note;
            this.event.setPosition(x, y);
            this.event.setPriorityType(1);
            this.event._erased = false;
            this.disable = false;
            this.event._sequenced = false;
        }
    }

    class Enemy extends Sequenced {
        constructor(event, subtype, baseHP, mods) {
            super(event);
            this.type = "enemy";
            this.class = subtype;
            this.baseHP = baseHP;
            this.hp = baseHP;
            this.getNextActions();
            this.flying = mods.includes("flying");
            this.stationary = mods.includes("stationary");
            this.passive = mods.includes("passive");
            this.aggro = mods.includes("aggro");
            this.isSpawn = mods.includes("spawned");
        }
        damage(amount) {
            this.hp -= amount;
            var soundToPlay = Math.floor(Math.random() * 3);//btw 0-2 inclusive
            if(soundToPlay == 0){
                AudioManager.playSe({name: 'EnemyDamage1', pan: 0, pitch: 100, volume: 60});
            }else if(soundToPlay == 1){
                AudioManager.playSe({name: 'EnemyDamage2', pan: 0, pitch: 100, volume: 80});
            }else {
                AudioManager.playSe({name: 'EnemyDamage3', pan: 0, pitch: 100, volume: 80});
            }
            if (this.hp <= 0) {
                this.death();
            }
        }
        death() {
            var soundToPlay = Math.floor(Math.random() * 2);//btw 0-1 inclusive
            if(soundToPlay == 0){
                AudioManager.playSe({name: 'EnemyDeath', pan: 0, pitch: 100, volume: 50});
            }else {
                AudioManager.playSe({name: 'EnemyDeath2', pan: 0, pitch: 100, volume: 50});
            }
            this.destroy(); // TODO: this is a placeholder, will probably need some death indicator before destroying
            //console.log("Main death function called");
        }
        distToPlayer() {
            return [Math.abs($gameMap.deltaX(this.x, $gamePlayer.x)), Math.abs($gameMap.deltaY(this.y, $gamePlayer.y))];
        }
        dirToPlayer() {
            return this.event.findDirectionTo($gamePlayer.x, $gamePlayer.y);
        }
    }

    class Trap extends Sequenced { // TODO
        constructor(event, subtype) {
            super(event);
            this.type = "trap";
            this.class = subtype;
        }
    }

    class Projectile extends Sequenced { // TODO
        constructor(event, subtype) {
            super(event);
            this.type = "projectile";
            this.class = subtype;
        }
    }

    class Boss extends Sequenced { // TODO
        constructor(event, subtype) {
            super(event);
            this.type = "boss";
            this.class = subtype;
        }
        distToPlayer() {
            return [Math.abs($gameMap.deltaX(this.x, $gamePlayer.x)), Math.abs($gameMap.deltaY(this.y, $gamePlayer.y))];
        }
        dirToPlayer() {
            return this.event.findDirectionTo($gamePlayer.x, $gamePlayer.y);
        }
    }

    BMM.PT.isBoss = function() {
        for (var e of BMM.TRAN.level.events) {
            if (e.type == "boss") {
                return true;
            }
        }
        return false;
    }

    BMM.PT.bossClass = function() {
        for (var e of BMM.TRAN.level.events) {
            if (e.type == "boss") {
                return e.class;
            }
        }
        return null;
    }

    BMM.PT.bossMaxHP = function() {
        for (var e of BMM.TRAN.level.events) {
            if (e.type == "boss") {
                return e.baseHP[e.stage];
            }
        }
        return 0;
    }

    BMM.PT.bossHP = function() {
        for (var e of BMM.TRAN.level.events) {
            if (e.type == "boss") {
                return e.hp;
            }
        }
        return 0;
    }

    BMM.PT.bossStage = function() {
        for (var e of BMM.TRAN.level.events) {
            if (e.type == "boss") {
                return e.stage + 1;
            }
        }
        return 0;
    }

    BMM.PT.BOSS_Spectre = class extends Boss {
        constructor(event) {
            super(event, "spectre");
            this.stage = 0;
            this.baseHP = [3, 2, 3];
            //this.baseHP = [0,0,0];
            this.hp = this.baseHP[this.stage];
            this.distance = 0;
            this.attackDir = 0;
            this.flying = true;

            this.isRaising = false;
            this.raiseCooldown = 0;
            this.raiseMaxCooldown = 6;
            this.raiseState = 0;
            this.spawnLocations = [];
            
            this.isDash = false;
            this.atk = 1;
            this.offstage = false;
            this.dashState = 0;
            this.maxDashTurns = 3;
        }
        getNextActions() {
            if ($gameSelfSwitches.value([$gameMap._mapId, this.id, "B"]) == true) this.destroy();
            this.x = this.event._x;
            this.y = this.event._y;
            this.distance = this.distToPlayer();
            if (this.raiseCooldown > 0 && !this.offstage) this.raiseCooldown--;
            if (this.offstage) {
                this.ghostlyDash();
            } else if (this.isRaising || (this.stage > 0 && this.raiseCooldown <= 0)) {
                this.raiseMinions();
            } else {
                this.attackDir = this.dirToPlayer();
                this.nextActions.push(["face", this.attackDir]);
            }
        }
        raiseMinions() {
            if (this.raiseState == 0) { // standard raise
                this.isRaising = true;
                this.warnRaise();
                this.raiseState++;
            } else if (this.raiseState == 1) {
                AudioManager.playSe({name: 'SpectreAttack', pan: 0, pitch: 100, volume: 85});
                this.spawnMinions();
                this.raiseCooldown = this.raiseMaxCooldown;
                this.raiseState = 0;
                this.isRaising = false;
            }
        }
        warnRaise() {
            if (this.stage == 1) {
                this.spawnLocations = BMM.TRAN.level.selectRandomOpenLocations(Math.min(3, BMM.TRAN.level.spawns.length));
            } else {
                this.spawnLocations = BMM.TRAN.level.selectRandomOpenLocations(Math.min(4, BMM.TRAN.level.spawns.length));
            }
            //console.log(this.spawnLocations);
            if (this.spawnLocations.length <= 0) return;
            for (var pos of this.spawnLocations) {
                this.nextActions.push(["warn", pos[0], pos[1], "spawn"])
            }
        }
        spawnMinions() {
            if (this.spawnLocations.length <= 0) return;
            for (var pos of this.spawnLocations) {
                if (this.stage == 1) {
                    this.nextActions.push(["spawn_event", pos[0], pos[1], "melee", '{"type":"enemy", "class":"melee", "basehp":1, "attack":1, "mod":["aggro", "spawned"]}']);
                } else {
                    this.nextActions.push(["spawn_event", pos[0], pos[1], "melee_elite", '{"type":"enemy", "class":"melee", "basehp":2, "attack":2, "mod":["aggro", "spawned"]}']);
                }
            }
            this.spawnLocations = [];
        }
        ghostlyDash() {
            if (this.dashState == 0) {
                this.offstage = true;
                this.crossAttackPos = this.getCrossAttackPos();
                //console.log(this.crossAttackPos);
                for (var pos of this.crossAttackPos) {
                    this.nextActions.push(["warn", pos[0], pos[1], "attack"]);
                    // BMM.GLOBAL.interpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '11', pos[0], pos[1]]);
                }
                this.dashState++;
            } else if (this.dashState == 1) {
                for (var pos of this.crossAttackPos) {
                    this.nextActions.push(["hit", pos[0], pos[1], this.atk, ["enemy"]])
                    // BMM.GLOBAL.interpreter.pluginCommand('REMOVETILE', [pos[0], pos[1]]);
                    // if ($gamePlayer.x == pos[0] && $gamePlayer.y == pos[1]) {
                    //     BMM.HYB.playerDamage(1);
                    // }
                }
                this.crossAttackPos = [];
                this.event.setImage("", 0);
                this.event.setPriorityType(0);
                BMM.TRAN.level.moveEvent(this.x, this.y, 0, 0);
                this.event.setPosition(0, 0);
                this.x = this.event._x;
                this.y = this.event._y;
                this.dashState++;
            } else if (this.dashState <= 1 + this.maxDashTurns) {
                this.dashState++;
            } else {
                this.dashState = 0;
                this.reappear();
            }
        }
        getCrossAttackPos() {
            var valid = true;
            var tempx = this.event._x;
            var tempy = this.event._y;
            var positions = [[tempx,tempy]];
            var randoff = BMM.GLOBAL.randInt(0,1);
            // up    -> y--
            tempy += randoff;
            while (valid) {
                tempy -= 2;
                if (!BMM.TRAN.level.isMapPassable(tempx, tempy, true)) valid = false;
                else positions.push([tempx, tempy]);
            }
            valid = true;
            var tempx = this.event._x;
            var tempy = this.event._y;
            // down  -> y++
            tempy -= randoff;
            while (valid) {
                tempy += 2;
                if (!BMM.TRAN.level.isMapPassable(tempx, tempy, true)) valid = false;
                else positions.push([tempx, tempy]);
            }
            valid = true;
            var tempx = this.event._x;
            var tempy = this.event._y;
            // left  -> x--
            tempx += randoff;
            while (valid) {
                tempx -= 2;
                if (!BMM.TRAN.level.isMapPassable(tempx, tempy, true)) valid = false;
                else positions.push([tempx, tempy]);
            }
            valid = true;
            var tempx = this.event._x;
            var tempy = this.event._y;
            // right -> x++
            tempx -= randoff;
            while (valid) {
                tempx += 2;
                if (!BMM.TRAN.level.isMapPassable(tempx, tempy, true)) valid = false;
                else positions.push([tempx, tempy]);
            }
            return positions;
        }
        reappear() {
            this.offstage = false;
            var newPos = BMM.TRAN.level.selectRandomOpenLocations(1, true, true);
            BMM.TRAN.level.moveEvent(this.x, this.y, newPos[0], newPos[1]);
            this.event.setPosition(newPos[0], newPos[1]);
            this.x = this.event._x;
            this.y = this.event._y;
            this.event.setPriorityType(1);
            this.event.setImage("fisherman", 3);
        }
        damage(amount) {
            if (this.offstage) return;
            this.hp -= amount;
            AudioManager.playSe({name: 'SpectreDamage', pan: 0, pitch: 100, volume: 55});
            //this.nextActions = [];
            if (this.hp <= 0) {
                this.stage += 1;
                //BMM.HYB.resetOverlays();
                if (this.stage > 2) {
                    this.death();
                } else {
                    this.hp = this.baseHP[this.stage];
                    if (this.stage == 1) {
                        AudioManager.playSe({name: 'BossPhase', pan: 0, pitch: 100, volume: 45});
                        $gameMessage.setFaceImage("Evil", 3);
                        $gameMessage.setBackground(0);
                        $gameMessage.setPositionType(2);
                        $gameMessage.add("This is my sacrifice!");
                        $gameMessage.newPage();
                        $gameMessage.add("RISE MINIONS AND DEFEND THE SEAL!");
                    } else if (this.stage == 2) {
                        AudioManager.playSe({name: 'BossPhase', pan: 0, pitch: 100, volume: 45});
                        $gameMessage.setFaceImage("Evil", 3);
                        $gameMessage.setBackground(0);
                        $gameMessage.setPositionType(2);
                        $gameMessage.add("He must not escape.");
                        $gameMessage.newPage();
                        $gameMessage.add("Shroud of night protect the seal!");
                    }
                    this.ghostlyDash();
                }
            } else {
                this.ghostlyDash();
            }
        }
        death() {
            $gameSelfSwitches.setValue([$gameMap._mapId, this.id, "A"], true);
            AudioManager.playSe({name: 'SpectreDeath', pan: 0, pitch: 100, volume: 65});
            for (var obj of BMM.TRAN.level.events) {
                if (obj.type == "enemy") obj.damage(999);
            }
        }
    }

    BMM.PT.BOSS_Radiant = class extends Boss {
        constructor(event) {
            super(event, "radiant");
            this.stage = 0;
            this.baseHP = [3, 4, 4];
            this.hp = this.baseHP[this.stage];
            this.state = 0;
            this.distance = 0;
            this.attackDir = 0;

            this.isAttack = false;
            this.attackState = 0;
            this.atk = 1;

            this.isLunge = false;
            this.lungeState = 0;
            this.lungeCooldown = 0;
            this.lungeMaxCooldown = 10;
            
            this.isBomb = false;
            this.bombState = 0;
            this.bombCooldown = 0;
            this.bombMaxCooldown = 10;
            this.potentialBombLocations = [];
            this.bossBombLocations = [];

            this.bossDashDisplayLoc = [];
            this.dashDirection = "up";
        }
        getNextActions() {
            if ($gameSelfSwitches.value([$gameMap._mapId, this.id, "B"]) == true) this.destroy();
            this.x = this.event._x;
            this.y = this.event._y;
            this.distance = this.distToPlayer();
            if (this.lungeCooldown > 0) this.lungeCooldown--;
            if (this.bombCooldown > 0) this.bombCooldown--;
            if ((this.isLunge && !this.isBomb && !this.isAttack) || (this.stage >= 2 && this.lungeCooldown <= 0)) {
                this.lungeSequence();
            } else if ((this.isBomb && !this.isLunge && !this.isAttack) || (this.stage >= 1 && this.bombCooldown <= 0)) {
                this.getNextMove();
                this.bombSequence();
            } else if ((this.isAttack && !this.isLunge && !this.isBomb) || (this.stage >= 0 && this.distance[0] + this.distance[1] <= 1)) {
                this.standardAttack();
            } else {
                this.getNextMove();
            }
        }
        damagePlayer(){
            BMM.HYB.playerDamage(1);
        }
        bombSequence() {
            if (this.bombState == 0) {
                this.findPotentialBombLoc();
                this.drawBombDropLocations();
                //this.nextActions.push(["log", ">>>>>>>>>>>>>>>>> WARN RADIANT BOMB"])
                this.isBomb = true;
                this.bombState++;
            } else {
                this.nextActions.push(["radiant_bomb"]);
                this.bombState = 0;
                this.bombCooldown = this.bombMaxCooldown;
                this.isBomb = false;
            }
        }
        radiantBomb() {
            //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  RADIANT BOMB")
            this.removeBombDropDisplays();
            for (var loc of this.bossBombLocations) {
                Galv.SPAWN.overlap = 'all';//Needs to be all to spawn bomb on player
                Galv.SPAWN.event(5, loc[0], loc[1]);
                Galv.SPAWN.overlap = 'none';//set back to default to prevent unwanted spawns
            }
            this.potentialBombLocations = [];//reset it
            this.bossBombLocations = [];
        }
        drawBombDropLocations() {
            var tileInterpreter = new Game_Interpreter();
            //console.log("DRAWING ready2");
            for(var loc of this.bossBombLocations){
                //console.log("DRAWING: " + String(loc[0]) + ":" + String(loc[1]));
                tileInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '8', loc[0], loc[1] ]);
            }
        }
        findPotentialBombLoc() {
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            var radius = 2;

            var bottomLeftX = playerX;
            var bottomLeftY = playerY;

            //console.log("Player pos now is: " + String(bottomLeftX) + ":" + String(bottomLeftY));

            for(var i = 0; i < radius; i++){
                if(bottomLeftX < 0){//going off the map now
                    break;
                }
                bottomLeftX--;
            }
            for(var i = 0; i < radius; i++){
                if(bottomLeftY >= BMM.TRAN.level.height){//going off the map now
                    break;
                }
                bottomLeftY++;
            }

            //console.log("BTMLEFT: " + String(bottomLeftX) + ":" + String(bottomLeftY));

            for(var posX = bottomLeftX; posX < bottomLeftX + (radius * 2) + 1; posX++){
                for(var posY = bottomLeftY; posY > bottomLeftY - (radius * 2) - 1; posY--){
                    //console.log("checking pos: " + String(posX) + ":" + String(posY));

                    if (posX < 0 || posY < 0 || posX >= BMM.TRAN.level.width || posY >= BMM.TRAN.level.height
                        || !BMM.TRAN.level.isMapPassable(posX, posY, true)) {//trying to drop bomb on a place you cannot. Skip location
                        //console.log("#1 CANNOT DO: " + String(posX) + ":" + String(posY));
                        continue;
                    }

                    if (BMM.TRAN.level.isMapPassable(posX, posY)){//no wall or end of map here
                        var landingZoneEvent = BMM.TRAN.level.eventAt(posX, posY);
                        //console.log("#2 CAN DO: " + String(posX) + ":" + String(posY));
                        if (landingZoneEvent == null){//no event here. Maybe can drop bomb here
                            //console.log("#3 CAN DO: " + String(posX) + ":" + String(posY));
                            if(posX == playerX && posY == playerY){//player is here. Skip
                                continue;
                            } else {//player is not here. Do not skip
                                //console.log("#4 CAN DO: " + String(posX) + ":" + String(posY));
                                this.potentialBombLocations.push([posX, posY]);
                            }
                        } 
                    }

                }
            }//end of big for loop
            var numOfBombsToSpawn = 3;
            var numOfBombsSpawned = 0;
            var randomPos = 0;
            while(numOfBombsSpawned <  numOfBombsToSpawn) {
                randomPos = Math.floor(Math.random() * this.potentialBombLocations.length);
                if (this.potentialBombLocations[randomPos] in this.bossBombLocations){
                    continue;
                } else {
                    numOfBombsSpawned++;
                    this.bossBombLocations.push(this.potentialBombLocations[randomPos]);
                }
            }
        }
        removeBombDropDisplays() {
            var tileInterpreter = new Game_Interpreter();
            for (var loc of this.potentialBombLocations){
                tileInterpreter.pluginCommand( 'REMOVETILE', [ loc[0], loc[1] ] );//removes all dash tiles
            }
        }
        lungeSequence() {
            if (this.lungeState == 0) {
                //console.log("Boss Dir: " + String(this.event._direction));
                if(this.event._direction == 2){
                    this.dashDirection = "down";
                } else if(this.event._direction == 4){
                    this.dashDirection = "left";
                }else if(this.event._direction == 6){
                    this.dashDirection = "right";
                } else {//it is 8
                    this.dashDirection = "up";
                }
                this.bossDashDisplayLoc = this.calcBossDashLoc(this.dashDirection);
                if (this.bossDashDisplayLoc != null) {
                    var tileInterpreter = new Game_Interpreter();
                    if (this.dashDirection == "up") {
                        tileInterpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '14', this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1]]);
                    } else if (this.dashDirection == "right") {
                        tileInterpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '12', this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1]]);
                    } else if (this.dashDirection == "down") {
                        tileInterpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '15', this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1]]);
                    } else {//direction is left
                        tileInterpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '13', this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1]]);
                    }
                } else {
                    this.nextActions.push(["log", "Failed to dash"]);
                }
                this.isLunge = true;
                this.lungeState++;
            } else {
                if (this.bossDashDisplayLoc != null) {
                    this.nextActions.push(["radiant_dash"]);
                }
                this.lungeState = 0;
                this.lungeCooldown = this.lungeMaxCooldown;
                this.isLunge = false;
            }
        }
        radiantLunge() {
            var tileInterpreter = new Game_Interpreter();
            tileInterpreter.pluginCommand( 'REMOVETILE', [ this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1] ] );//removes all dash tiles
            this.bossDashAndDamagePlayer();
            //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  RADIANT DASH")
        }
        bossDashAndDamagePlayer() {
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            var difference;
            //console.log("direction is: " + String(this.dashDirection));

            if (this.dashDirection == "up"){
                difference = this.y - playerY;
                if (playerX == this.x && difference > 0 && difference < this.bossDashDisplayLoc[2]){
                    //console.log("Player is in range. DAMAGE HIM");
                    BMM.HYB.playerDamage(1);
                }
            }else if (this.dashDirection == "right"){
                difference = playerX - this.x;
                //console.log("!!!!!!!!!!!!!!!!!: " + String(difference) + " " + String(this.bossDashDisplayLoc[2]) + " " + String(playerY)+ " " + String(this.y));
                if(playerY == this.y && difference > 0 && difference < this.bossDashDisplayLoc[2]){
                    //console.log("Player is in range. DAMAGE HIM");
                    BMM.HYB.playerDamage(1);
                }
            }else if (this.dashDirection == "down"){
                difference = playerY - this.y;
                if(playerX == this.x && difference > 0 && difference < this.bossDashDisplayLoc[2]){
                    //console.log("Player is in range. DAMAGE HIM");
                    BMM.HYB.playerDamage(1);
                }
            }else {//diection is left
                difference = this.x - playerX;
                if(playerY == this.y && difference > 0 && difference < this.bossDashDisplayLoc[2]){
                    //console.log("Player is in range. DAMAGE HIM");
                    BMM.HYB.playerDamage(1);
                }
            }

            //BMM.TRAN.level.moveEvent(this.x, this.y, this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1]);
            //console.log("DISPLAY LOC: " + this.bossDashDisplayLoc);
            this.event.setPosition(this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1]);
            this.x = this.event._x;
            this.y = this.event._y;

        }
        calcBossDashLoc(direction){
            var moveDist = 0;
            var maxDist = 5;
            var bossX = this.x;
            var bossY = this.y;
            var newX = bossX;
            var newY = bossY;
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            this.bossDashDisplayLoc = null; //set it to null in the event it cannot locate a place to dash to
            for (var i = 1; i <= maxDist; i++){ //check to see if you can move 5, 4, 3... spaces in direction

                //get location player is trying to dash to
                if (direction === "down") {
                    newY = bossY + i;
                }
                else if (direction === "left") {
                    newX = bossX - i;
                }
                else if (direction === "right") {
                    newX = bossX + i;
                }
                else if (direction === "up") {
                    newY = bossY - i;
                }

                if (newX < 0 || newY < 0 || newX >= BMM.TRAN.level.width || newY >= BMM.TRAN.level.height
                    || !BMM.TRAN.level.isMapPassable(newX, newY, true)) {//trying to dash off map or hitting a wall. End loop, as you can't go further.
                    break;
                }

                if (BMM.TRAN.level.isMapPassable(newX, newY)){//no wall or end of map here
                    var landingZoneEvent = BMM.TRAN.level.eventAt(newX, newY);
                    if(newX == playerX && newY == playerY){//cannot spawn on player
                        continue;
                    }
                    if (landingZoneEvent == null){//no event here. Can go here
                        moveDist = i;
                    }
                }
            }

            if (moveDist == 0){ //no events are in the way, but something is (wall most likely). 
                return null;
            }

            //return pos for dash in given direction
            if (direction === "down") {
                return [bossX, bossY + moveDist, moveDist];
            }
            else if (direction === "left") {
                return [bossX - moveDist, bossY, moveDist];
            }
            else if (direction === "right") {
                return [bossX + moveDist, bossY, moveDist];
            }
            else {//direction == up
                return [bossX, bossY - moveDist, moveDist];
            }
        }
        standardAttack() {
            if (this.attackState == 0) {
                this.attackDir = this.dirToPlayer();
                var pos = dirToMove(this.attackDir);
                this.nextActions.push(["face", this.attackDir]);
                this.nextActions.push(["warn", this.x + pos[0], this.y + pos[1], "attack"]);
                this.isAttack = true;
                this.attackState++;
            } else {
                var pos = dirToMove(this.attackDir);
                this.nextActions.push(["hit", this.x + pos[0], this.y + pos[1], this.atk, ["enemy"]]);
                this.isAttack = false;
                this.attackState = 0;
            }
        }
        getNextMove() {
            var direction = this.dirToPlayer();
            var move = dirToMove(direction);
            if (BMM.TRAN.level.isPassable(this.x + move[0], this.y + move[1])) {
               this.nextActions.push(["move", move[0], move[1], direction]);
            }
        }
        damage(amount) {
            this.hp -= amount;
            //this.nextActions = [];
            var soundToPlay = Math.floor(Math.random() * 2);//btw 0-1 inclusive
            if(soundToPlay == 0){
                AudioManager.playSe({name: 'RadiantDamaged', pan: 0, pitch: 100, volume: 70});
            }else {
                AudioManager.playSe({name: 'RadiantDamaged', pan: 0, pitch: 100, volume: 70});
            }
            if (this.hp <= 0) {
                this.stage += 1;
                //BMM.HYB.resetOverlays();
                if (this.stage > 2) {
                    this.death();
                } else {
                    this.hp = this.baseHP[this.stage];
                    if (this.stage == 1) {
                        AudioManager.playSe({name: 'BossPhase', pan: 0, pitch: 100, volume: 45});
                        $gameMessage.setFaceImage("Evil", 4);
                        $gameMessage.setBackground(0);
                        $gameMessage.setPositionType(2);
                        $gameMessage.add("The seal must remain intact!");
                    } else if (this.stage == 2) {
                        AudioManager.playSe({name: 'BossPhase', pan: 0, pitch: 100, volume: 45});
                        $gameMessage.setFaceImage("Evil", 4);
                        $gameMessage.setBackground(0);
                        $gameMessage.setPositionType(2);
                        $gameMessage.add("An eternity of sacrifice and you \nwould destroy it all!");
                    }
                }
            }
        }
        death() {
            $gameSelfSwitches.setValue([$gameMap._mapId, this.id, "A"], true);
            this.nextActions = [];
            AudioManager.playSe({name: 'RadiantDeath', pan: 0, pitch: 100, volume: 55});
            AudioManager.stopBgm();
        }
    }

    BMM.PT.BOSS_Deceiver = class extends Boss {
        constructor(event) {
            super(event, "deceiver");
            this.stage = 0;
            this.baseHP = [3, 4, 5, 1];
            //this.baseHP = [0,0,0,0];
            this.hp = this.baseHP[this.stage];
            this.state = 0;
            this.distance = 0;
            this.attackDir = 0;
            this.invulnerable = false;

            this.isBurrow = false;
            this.endBurrow = false; // BMM.TRAN.level.events[0].endBurrow = true;
            this.burrowState = 0;
            this.burrowCooldown = 2; // Must wait at least 2 turns at start before burrowing
            this.burrowMaxCooldown = 10;
            this.bossEmergeLoc = [];

            this.isAttack = false;
            this.attackState = 0;
            this.atk = 1;

            this.isLunge = false;
            this.lungeState = 0;
            this.lungeCooldown = 0;
            this.lungeMaxCooldown = 10;
            
            this.isBomb = false;
            this.bombState = 0;
            this.bombCooldown = 0;
            this.bombMaxCooldown = 10;
            this.potentialBombLocations = [];
            this.bossBombLocations = [];

            this.bossDashDisplayLoc = [];
            this.dashDirection = "up";

            this.spinAttackDisplayLocations = [];
            this.spinAttackStep = 0;

            this.tentacleAttackDisplayLocations = [];
            this.tentacleAttackStep = 0;
            this.tentacleAttackCount = 0;

            this.laserSoundEffectPlaying = false;
            /**
             * FOR GOLD, two audio files
             */
            // this.laserChargeSoundEffectPlaying = false;
            // this.laserDetoSoundEffectPlaying = false;
            this.allLaserAttackDisplayLocations = [];
            this.futureLaserAttackLocations = [];
            this.currentLaserFireLoc = [];
            this.laserAttackStep = 0;
            this.laserFiringStep = 0;
            this.lasterFireDirection = "down";
            this.stopFiringLaser = false;
            this.laserAttackCount = -1;//to account for first laser position
            this.warnLaserLocations = [];
            this.laserMaxLength = 1.2; // multiply by 5 for tile length
        }
        getNextActions() {
            if ($gameSelfSwitches.value([$gameMap._mapId, this.id, "C"]) == true) {
                this.event.setImage("", 0);
                this.destroy();
            }
            this.x = this.event._x;
            this.y = this.event._y;
            if (this.stage >= 3) {
                this.event.setImage("fisherman", 4);
                this.nextActions.push(["face", this.dirToPlayer()]);
                return;
            }
            this.distance = this.distToPlayer();
            if (this.burrowCooldown > 0) this.burrowCooldown--;
            if (!this.isBurrow && this.lungeCooldown > 0) this.lungeCooldown--;
            if (!this.isBurrow && this.bombCooldown > 0) this.bombCooldown--;
            if ((this.isBurrow || this.burrowCooldown <= 0) && !this.isBomb && !this.isLunge && !this.isAttack){
                this.burrowSequence();
            } else if ((this.isBomb && !this.isBurrow && !this.isLunge && !this.isAttack) || (this.stage >= 1 && this.bombCooldown <= 0)) {
                this.bombSequence();
                this.getNextMove();
            } else if ((this.isAttack && !this.isBurrow && !this.isLunge && !this.isBomb) || (this.stage >= 0 && this.distance[0] + this.distance[1] <= 1)) {
                this.standardAttack();
            } else if (!this.isBurrow) {
                this.getNextMove();
            }
        }
        burrowSequence() {
            if (this.burrowState == 0) {
                this.nextActions.push(["warn", this.x, this.y, "burrow"]);//#1
                this.isBurrow = true;
                this.burrowState++;
            } else if (this.burrowState == 1) {
                this.nextActions.push(["d_burrow"]);//#2
                this.burrowState++;
                //TODO: Have boss burrow into the ground (animation and correct sound)
                // AudioManager.playSe({name: 'DeceiverEmerge', pan: 0, pitch: 100, volume: 100});//warning
            } else if (this.burrowState == 2) {
                // AudioManager.playSe({name: 'DeceiverDig', pan: 0, pitch: 100, volume: 100});//he has burrowed and is gone -- i'm assuming this is burrowing
                //this.event.setPosition(this.x + dx, this.y + dy);
                this.event.setPosition(0, 0);
                this.x = this.event._x;
                this.y = this.event._y;
                this.burrowState++;
                this.event.setImage("",0);
            } else if(this.burrowState == 3){
                if (this.endBurrow) {//end burrow instantly. No need for warn
                    /*//this.nextActions.push(["log", "Warn Emerge"]);//#4
                    this.endBurrow = false;
                    //this.burrowState++;
                    //this.nextActions.push(["d_endburrow"]);//#5
                    this.burrowState = 0;
                    this.isBurrow = false;
                    this.burrowCooldown = this.burrowMaxCooldown;*/
                } else {
                    this.burrowedActions();
                }
            } /*else {
                this.nextActions.push(["d_endburrow"]);//#5
                this.burrowState = 0;
                this.isBurrow = false;
                this.burrowCooldown = this.burrowMaxCooldown;
            }*/
        }
        startBurrow() {
            // TODO: behaviour as the boss burrows
            //console.log("Burrowing");//#2.5
            AudioManager.playSe({name: 'DeceiverDig', pan: 0, pitch: 100, volume: 90});
            BMM.GLOBAL.interpreter.pluginCommand("REMOVETILE", [this.x, this.y]);
        }
        burrowedActions() {//BMM.TRAN.level.events[0].endBurrow = true;
            // TODO: select actions while burrowed
            this.nextActions.push(["log", "Burrowed"]);//#3
            if(this.stage == 0){
                this.sequenceOfSpinAttack();
            }else if(this.stage == 1){
                if(this.spinAttackStep != 0){
                    this.sequenceOfSpinAttack();//tentacle attack is done. resurface and spin attack
                } else {//Do tentacle attack first
                    this.sequenceOfTentacleAttack();
                }
            } else if(this.stage == 2){//stage is 3
                this.sequenceOfLaserAttack();
            }
            
        }
        emerge() {
            // TODO: behaviour as burrow ends
            //console.log("Emerging");//#5.5
            AudioManager.playSe({name: 'DeceiverEmerge', pan: 0, pitch: 100, volume: 90});
            if(this.spinAttackStep != 0){//We just did a spin attack. Remove display tiles
                this.removeSpinAttackDisplays();
                this.spinAttackStep = 0;
            }
            if(this.tentacleAttackStep != 0){//we just did tentacle attack. May not need this.

            }
            if(this.laserAttackStep != 0){
                this.stopFiringLaser = false;//reset it
                this.laserAttackStep = 0;
                this.laserFiringStep = 0;
                this.removeLaserAttackDisplays();
            }
            this.invulnerable = false;
        }
        endBurrowSequence() {
            this.endBurrow = false;
            //this.burrowState++;
            //this.nextActions.push(["d_endburrow"]);//#5
            this.burrowState = 0;
            this.isBurrow = false;
            this.burrowCooldown = this.burrowMaxCooldown;
            this.lungeCooldown = 4;
            this.bombCooldown = 8;
        }
        sequenceOfLaserAttack() {
            this.laserFiringSoundEffectPlaying = false;     // reinstantiating it here instead of player.death
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            var tileInterpreter = new Game_Interpreter();
            //var tileInterpreter = new Game_Interpreter();
            //tileInterpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '14', this.bossEmergeLoc[0], this.bossEmergeLoc[1]]);
            //tileInterpreter.pluginCommand( 'REMOVETILE', [ this.bossEmergeLoc[0], this.bossEmergeLoc[1] ] );
            if(this.laserAttackStep == 0){//wait one turn
                this.laserAttackStep++;
            }else if(this.laserAttackStep == 1){//warn that boss will emerge from ground
                this.findEmergeLocation();
                this.laserAttackStep++;
                tileInterpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '5', this.bossEmergeLoc[0], this.bossEmergeLoc[1]]);
            }else if(this.laserAttackStep == 2){//emerge and warn about firing laser
                // if( this.laserChargeSoundEffectPlaying == false )
                // {
                //     console.log( "laser chargins:)");
                //     AudioManager.playSe({name: 'DeceiverLaserCharge', pan: 0, pitch: 100, volume: 50});
                //     this.laserChargeSoundEffectPlaying = true;
                // }
                if( this.laserSoundEffectPlaying == false )
                {
                    AudioManager.playSe({name: 'DeceiverLaser', pan: 0, pitch: 100, volume: 50});
                    this.laserChargeSoundEffectPlaying = true;
                }
                this.event.setPosition(this.bossEmergeLoc[0], this.bossEmergeLoc[1]);
                tileInterpreter.pluginCommand( 'REMOVETILE', [ this.bossEmergeLoc[0], this.bossEmergeLoc[1] ] );
                this.x = this.event._x;
                this.y = this.event._y;
                this.laserAttackStep++;
                this.warnLaserAttack();
                //this.warnNextLaserAttack(this.x, this.y + 1);
                this.currentLaserFireLoc = [this.x, this.y + 1];//reset it to below boss location
                this.allLaserAttackDisplayLocations.push(this.currentLaserFireLoc);
                this.event.setImage("fisherman", 2);
            }else if(this.laserAttackStep == 3){//IMMA FIRING MY LASER!
                /**
                 * Attempt to do the two different audio files, for GOLD
                 */
                // AudioManager.stopSe({name: 'DeceiverLaserCharge', pan: 0, pitch: 100, volume: 100});
                // if( this.laserDetoSoundEffectPlaying == false )
                // {
                //     console.log( "detonate" );
                //     AudioManager.playSe({name: 'DeceiverLaserDetonate', pan: 0, pitch: 100, volume: 50});
                //     this.laserDetoSoundEffectPlaying = true;
                // }
                this.removeWarnLaserDisplays();
                if(this.laserAttackCount == 4){//two quarter rotations have happened. End laser attack
                    this.stopFiringLaser = true;
                    this.laserAttackCount = -1;//reset it
                }
                if(this.stopFiringLaser == false){//keep firing the laser
                    //this.fireLaser();
                    this.removeLaserAttackDisplays();
                    this.calcLaserPositions();
                    this.showLaserAttackDisplays();
                    this.doLaserAttack();
                } else {//laser firing is done. "emerge" and remove all laser displays
                    AudioManager.stopSe();
                    // this.laserChargeSoundEffectPlaying = false;
                    // this.laserDetoSoundEffectPlaying = false;
                    this.laserChargeSoundEffectPlaying = false;
                    this.emerge();
                    this.endBurrowSequence();
                }
            }
        }
        warnLaserAttack(){
            this.warnLaserLocations = [];

            var originalX = -1;
            var originalY = -1;
            var tempX = -1;
            var tempY = -1;
            var edgeCaseCounter = 1;

            var originalXDiagonal = -1;
            var originalYDiagonal = -1;
            var tempXDiagonal = -1;
            var tempYDiagonal = -1;

            for (var t = 0.2; t <= this.laserMaxLength; t+=0.2){ // TODO: change length (t = #tiles * 0.2)
                ///////////////////////////////////////////////////////////////Vertical and Horizontal laser spawn locations
                originalX = this.x;
                originalY = this.y - edgeCaseCounter;
                //edgeCaseCounter++;
                this.warnLaserLocations.push([originalX, originalY]);//up position

                var firstTempX = (originalY - this.y) + this.x;
                var firstTempY = -(originalX - this.x) + this.y;
                this.warnLaserLocations.push([firstTempX, firstTempY]);//counter-clock 90

                tempX = (firstTempY - this.y) + this.x;
                tempY = -(firstTempX - this.x) + this.y;
                this.warnLaserLocations.push([tempX, tempY]);//180

                tempX = -(originalY - this.y) + this.x;
                tempY = (originalX - this.x) + this.y;
                this.warnLaserLocations.push([tempX, tempY]);//clock 90
                ///////////////////////////////////////////////////////////////////////////


                ///////////////////////////////////////////////////////////////////Diagonal laser spawn locations
                originalXDiagonal = this.x + edgeCaseCounter;
                originalYDiagonal = this.y - edgeCaseCounter;
                edgeCaseCounter++;

                this.warnLaserLocations.push([originalXDiagonal, originalYDiagonal]);

                var firstTempXDiagonal = (originalYDiagonal - this.y) + this.x;
                var firstTempYDiagonal = -(originalXDiagonal - this.x) + this.y;
                this.warnLaserLocations.push([firstTempXDiagonal, firstTempYDiagonal]);//counter-clock 90

                tempXDiagonal = (firstTempYDiagonal - this.y) + this.x;
                tempYDiagonal = -(firstTempXDiagonal - this.x) + this.y;
                this.warnLaserLocations.push([tempXDiagonal, tempYDiagonal]);//180

                tempXDiagonal = -(originalYDiagonal - this.y) + this.x;
                tempYDiagonal = (originalXDiagonal - this.x) + this.y;
                this.warnLaserLocations.push([tempXDiagonal, tempYDiagonal]);//clock 90
                ///////////////////////////////////////////////////////////////////////////////////////////////  

            }



            var tileInterpreter = new Game_Interpreter();
            for(var loc of this.warnLaserLocations){
                if(testDisplayTileValidity(loc[0], loc[1])){//only if you can walk here would you draw a tile overlay here
                    tileInterpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '38', loc[0], loc[1]]);
                }
            }
        }
        calcLaserPositions(){
            var pi = [this.x, this.y];
            var pf = [];
            var pfDiagonal = [];
            if(this.laserFiringStep == 0){//for calculating pf. This goes from vertical to horizontal laser spawn locations
                pf = [this.x, this.y - 5];
                //this.laserFiringStep++;
            } else if(this.laserFiringStep == 1){
                pf = [this.x + 1, this.y - 5];
                //this.laserFiringStep++;
            }else if(this.laserFiringStep == 2){
                pf = [this.x + 2, this.y - 5];
                //this.laserFiringStep++;
            } else if(this.laserFiringStep == 3){
                pf = [this.x + 3, this.y - 5];
                //this.laserFiringStep++;
            }else if(this.laserFiringStep == 4) {
                pf = [this.x + 4, this.y - 5];
                //this.laserFiringStep++;
            }else if(this.laserFiringStep == 5){
                pf = [this.x + 5, this.y - 5];
                //this.laserFiringStep++;
            }else if(this.laserFiringStep == 6){
                pf = [this.x + 5, this.y - 4];
                //this.laserFiringStep++;
            }else if(this.laserFiringStep == 7){
                pf = [this.x + 5, this.y - 3];
                //this.laserFiringStep++;
            }else if(this.laserFiringStep == 8){//it's 8
                pf = [this.x + 5, this.y - 2];
                //this.laserFiringStep++;
            }else {
                pf = [this.x + 5, this.y - 1];
                //this.laserFiringStep = 0;
            }

            if(this.laserFiringStep == 0){//for calculating pf starting from a diagonal position
                pfDiagonal = [this.x + 5, this.y - 5];
                this.laserFiringStep++;
            } else if(this.laserFiringStep == 1){
                pfDiagonal = [this.x + 5, this.y - 4];
                this.laserFiringStep++;
            }else if(this.laserFiringStep == 2){
                pfDiagonal = [this.x + 5, this.y - 3];
                this.laserFiringStep++;
            } else if(this.laserFiringStep == 3){
                pfDiagonal = [this.x + 5, this.y - 2];
                this.laserFiringStep++;
            }else if(this.laserFiringStep == 4) {
                pfDiagonal = [this.x + 5, this.y - 1];
                this.laserFiringStep++;
            }else if(this.laserFiringStep == 5){
                pfDiagonal = [this.x + 5, this.y];
                this.laserFiringStep++;
            }else if(this.laserFiringStep == 6){
                pfDiagonal = [this.x + 5, this.y + 1];
                this.laserFiringStep++;
            }else if(this.laserFiringStep == 7){
                pfDiagonal = [this.x + 5, this.y + 2];
                this.laserFiringStep++;
            }else if(this.laserFiringStep == 8){//it's 8
                pfDiagonal = [this.x + 5, this.y + 3];
                this.laserFiringStep++;
            }else {
                pfDiagonal = [this.x + 5, this.y + 4];
                this.laserFiringStep = 0;
            }

            var xDiff = pf[0] - pi[0];
            var yDiff = pf[1] - pi[1];

            var xDiffDiagonal = pfDiagonal[0] - pi[0];
            var yDiffDiagonal = pfDiagonal[1] - pi[1];
            var originalXDiagonal = -1;
            var originalYDiagonal = -1;
            var tempXDiagonal = -1;
            var tempYDiagonal = -1;

            var originalX = -1;
            var originalY = -1;
            var tempX = -1;
            var tempY = -1;
            var edgeCaseCounter = 1;
            this.allLaserAttackDisplayLocations = [];
            this.futureLaserAttackLocations = [];

            if(this.x == pf[0]){//check for how when a quarter rotation occurs
                this.laserAttackCount++;
            }

            for (var t = 0.2; t <= this.laserMaxLength; t+=0.2){ // TODO: change length (t = #tiles * 0.2)

                ///////////////////////////////////////////////////////////////Vertical and Horizontal laser spawn locations
                if(this.x == pf[0]){//edge case where formula does not work
                    originalX = this.x;
                    originalY = this.y - edgeCaseCounter;
                    edgeCaseCounter++;
                }else{//normal case
                    originalX = Math.round(pi[0] + t*xDiff);
                    originalY = Math.round(pi[1] + t*yDiff);
                }
                this.allLaserAttackDisplayLocations.push([originalX, originalY]);//up position

                var firstTempX = (originalY - this.y) + this.x;
                var firstTempY = -(originalX - this.x) + this.y;
                this.allLaserAttackDisplayLocations.push([firstTempX, firstTempY]);//counter-clock 90

                tempX = (firstTempY - this.y) + this.x;
                tempY = -(firstTempX - this.x) + this.y;
                this.allLaserAttackDisplayLocations.push([tempX, tempY]);//180

                tempX = -(originalY - this.y) + this.x;
                tempY = (originalX - this.x) + this.y;
                this.allLaserAttackDisplayLocations.push([tempX, tempY]);//clock 90
                ///////////////////////////////////////////////////////////////////////////////////////////////



                ///////////////////////////////////////////////////////////////////Diagonal laser spawn locations
                originalXDiagonal = Math.round(pi[0] + t*xDiffDiagonal);
                originalYDiagonal = Math.round(pi[1] + t*yDiffDiagonal);

                this.allLaserAttackDisplayLocations.push([originalXDiagonal, originalYDiagonal]);

                var firstTempXDiagonal = (originalYDiagonal - this.y) + this.x;
                var firstTempYDiagonal = -(originalXDiagonal - this.x) + this.y;
                this.allLaserAttackDisplayLocations.push([firstTempXDiagonal, firstTempYDiagonal]);//counter-clock 90

                tempXDiagonal = (firstTempYDiagonal - this.y) + this.x;
                tempYDiagonal = -(firstTempXDiagonal - this.x) + this.y;
                this.allLaserAttackDisplayLocations.push([tempXDiagonal, tempYDiagonal]);//180

                tempXDiagonal = -(originalYDiagonal - this.y) + this.x;
                tempYDiagonal = (originalXDiagonal - this.x) + this.y;
                this.allLaserAttackDisplayLocations.push([tempXDiagonal, tempYDiagonal]);//clock 90
                ///////////////////////////////////////////////////////////////////////////////////////////////                



                /*//////////////////////////////////////////////////////////Warning laser display spawn locations
                var tFuture = t + 0.2;
                if(this.x == pf[0]){//edge case where formula does not work
                    originalX = this.x;
                    originalY = this.y - edgeCaseCounter - 1;//-1 to account for +1 above
                }else{//normal case
                    originalX = Math.round(pi[0] + t*xDiff);
                    originalY = Math.round(pi[1] + t*yDiff);
                }
                this.futureLaserAttackLocations.push([originalX, originalY]);//up position

                var firstTempX = (originalY - this.y) + this.x;
                var firstTempY = -(originalX - this.x) + this.y;
                this.futureLaserAttackLocations.push([firstTempX, firstTempY]);//counter-clock 90

                tempX = (firstTempY - this.y) + this.x;
                tempY = -(firstTempX - this.x) + this.y;
                this.futureLaserAttackLocations.push([tempX, tempY]);//180

                tempX = -(originalY - this.y) + this.x;
                tempY = (originalX - this.x) + this.y;
                this.futureLaserAttackLocations.push([tempX, tempY]);//clock 90
                ///////////////////////////////////////////////////////////////////////////////////////////////
                if(t == 1){//last laser attack doesn't need warn
                    this.futureLaserAttackLocations = [];
                }*/
            }
        }
        doLaserAttack() {
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            
            for(var loc of this.allLaserAttackDisplayLocations){
                if (playerX == loc[0] && playerY == loc[1]){
                    BMM.HYB.playerDamage(1);
                    break;
                }
            }
        }
        showLaserAttackDisplays() {
            var tileInterpreter = new Game_Interpreter();
            for(var loc of this.allLaserAttackDisplayLocations){
                if(testDisplayTileValidity(loc[0], loc[1])){//only if you can walk here would you draw a tile overlay here
                    tileInterpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '46', loc[0], loc[1]]);
                }
            }
        }
        removeLaserAttackDisplays() {
            var tileInterpreter = new Game_Interpreter();
            for(var loc of this.allLaserAttackDisplayLocations){
                if(testDisplayTileValidity(loc[0], loc[1])){//only if you can walk here would you draw a tile overlay here
                    tileInterpreter.pluginCommand( 'REMOVETILE', [ loc[0], loc[1] ] );
                }   
            }
        }
        removeWarnLaserDisplays(){
            var tileInterpreter = new Game_Interpreter();
            for(var loc of this.warnLaserLocations){
                if(testDisplayTileValidity(loc[0], loc[1])){//only if you can walk here would you draw a tile overlay here
                    tileInterpreter.pluginCommand( 'REMOVETILE', [ loc[0], loc[1] ] );
                }   
            }
        }

        sequenceOfTentacleAttack() {
           var playerX = $gamePlayer.x;
           var playerY = $gamePlayer.y;
           //var tileInterpreter = new Game_Interpreter();
           //tileInterpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '14', this.bossEmergeLoc[0], this.bossEmergeLoc[1]]);
           //tileInterpreter.pluginCommand( 'REMOVETILE', [ this.bossEmergeLoc[0], this.bossEmergeLoc[1] ] );
           if(this.tentacleAttackStep == 0){//he's undergorund. Wait 1 turn
               this.tentacleAttackStep++;
           } else if(this.tentacleAttackStep == 1){//warn tentacle attack
               this.removeTentacleDisplays();
               this.warnTentacleAttack();
               this.tentacleAttackStep++;
           } else if(this.tentacleAttackStep == 2){//Do tentacle attack
               this.doTentacleAttack();
               this.tentacleAttackStep++;
           } else if(this.tentacleAttackStep == 3){//warn tentacle attack
               this.removeTentacleDisplays();
               this.warnTentacleAttack();
               this.tentacleAttackStep++;
           } else if(this.tentacleAttackStep == 4){//do tentacle attack
               this.doTentacleAttack();
               //last tentacle attack was done. Now prepare for resurfacing and spin attack
               if(this.tentacleAttackCount == 1){
                    this.tentacleAttackCount = 0;
                    this.spinAttackStep = 1;//start from step 1 of spin atttack, and the rest will follow
                    this.tentacleAttackStep = 0;
               }else {
                    this.tentacleAttackCount++;
                    this.tentacleAttackStep = 1;
               }
           }
        }
        sequenceOfSpinAttack() {//this seqnence is only for spin attack, no combo of abilities
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            var tileInterpreter = new Game_Interpreter();
            if(this.spinAttackStep == 0){//he's undergorund. Wait 1 turn
                this.spinAttackStep++;
            } else if(this.spinAttackStep == 1){//warn he is about to come up
                //TODO: Warn he is about to come up
                this.findEmergeLocation();
                this.removeTentacleDisplays();
                tileInterpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '5', this.bossEmergeLoc[0], this.bossEmergeLoc[1]]);
                this.spinAttackStep++;
            } else if(this.spinAttackStep == 2){//Come up and Warn the spin attack
                //this.findEmergeLocation();
                this.event.setPosition(this.bossEmergeLoc[0], this.bossEmergeLoc[1]);
                tileInterpreter.pluginCommand( 'REMOVETILE', [ this.bossEmergeLoc[0], this.bossEmergeLoc[1] ] );
                this.x = this.event._x;
                this.y = this.event._y;
                this.warnSpinAttack();
                this.spinAttackStep++;
                this.event.setImage("fisherman", 2);
                this.invulnerable = true;
            } else if(this.spinAttackStep == 3){//do spin attack
                this.doSpinAttack();
                this.spinAttackStep++;
            } else if(this.spinAttackStep == 4){
                this.emerge();
                this.endBurrowSequence();
            }
        }
        findEmergeLocation() {
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            var newX = playerX;
            var newY = playerY;
            var randSpot = 0;
            var allPossibleEmergeLocations = [];
            this.bossEmergeLoc = [];

            for(var i = 0; i < 4; i++){

                if(i == 0){//top left
                   newX = playerX - 1;
                   newY = playerY - 1;
                }else if(i == 1){//top right
                    newX = playerX + 1;
                    newY = playerY - 1;
                }else if(i == 2){//bottom right
                    newX = playerX + 1;
                    newY = playerY + 1;
                }else {//bottom left
                    newX = playerX - 1;
                    newY = playerY + 1;
                }

                if (newX < 0 || newY < 0 || newX >= BMM.TRAN.level.width || newY >= BMM.TRAN.level.height
                    || !BMM.TRAN.level.isMapPassable(newX, newY, true)) {//trying to dash off map or hitting a wall. End loop, as you can't go further.
                    continue;
                }

                if (BMM.TRAN.level.isMapPassable(newX, newY)){//no wall or end of map here
                    var landingZoneEvent = BMM.TRAN.level.eventAt(newX, newY);
                    if(newX == playerX && newY == playerY){//cannot spawn on player
                        continue;
                    }
                    if (landingZoneEvent == null){//no event here. Can go here
                        allPossibleEmergeLocations.push([newX, newY]);
                    }
                }
            }//end of for

            var posFound = false;
            while (posFound == false){//spawn the boss at a random corner location
                randSpot = Math.floor(Math.random() * 4);//0-3 inclusive
                if(randSpot < allPossibleEmergeLocations.length){
                    this.bossEmergeLoc = allPossibleEmergeLocations[randSpot];
                    posFound = true;
                }
            }

        }
        //SPIN ATTACK
        warnSpinAttack() {

            this.spinAttackDisplayLocations = [];
            this.spinAttackDisplayLocations.push([this.x - 1, this.y]);
            this.spinAttackDisplayLocations.push([this.x - 1, this.y - 1]);
            this.spinAttackDisplayLocations.push([this.x, this.y - 1]);
            this.spinAttackDisplayLocations.push([this.x + 1, this.y - 1]);
            this.spinAttackDisplayLocations.push([this.x + 1, this.y]);
            this.spinAttackDisplayLocations.push([this.x + 1, this.y + 1]);
            this.spinAttackDisplayLocations.push([this.x, this.y + 1]);
            this.spinAttackDisplayLocations.push([this.x - 1, this.y + 1]);

            var tileInterpreter = new Game_Interpreter();
            for(var loc of this.spinAttackDisplayLocations){
                if(testDisplayTileValidity(loc[0], loc[1])){//only if you can walk here would you draw a tile overlay here
                    tileInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '8', loc[0], loc[1] ]);
                }
            }
            
        }
        doSpinAttack() {
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            var tileInterpreter = new Game_Interpreter();
            for(var loc of this.spinAttackDisplayLocations){
                if(testDisplayTileValidity(loc[0], loc[1])){//only if you can walk here would you draw a tile overlay here
                    tileInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '10', loc[0], loc[1] ]);
                    if (playerX == loc[0] && playerY == loc[1]){
                        BMM.HYB.playerDamage(1);
                    }
                }
            }
        }
        removeSpinAttackDisplays() {
            var tileInterpreter = new Game_Interpreter();
            for(var loc of this.spinAttackDisplayLocations){
                if(testDisplayTileValidity(loc[0], loc[1])){//only if you can walk here would you draw a tile overlay here
                    tileInterpreter.pluginCommand( 'REMOVETILE', [ loc[0], loc[1] ] );
                }
                
            }
        }

        //TENTACLE ATTACK
        warnTentacleAttack() {
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            var rand = Math.floor(Math.random() * 7);//0-1 inclusive

            this.tentacleAttackDisplayLocations = [];

            if(rand == 0){
                //first possible set of tentacle spawns
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX- 1, playerY- 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY - 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY + 2]);
            }else if(rand == 1){
                //second set of tentacle spawns
                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY - 1]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY - 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY - 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY + 2]);
            }else if(rand == 2){//up only
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX- 1, playerY- 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY - 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY]);

                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY + 1]);

                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY + 2]);
            }else if(rand == 3){//right only
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX- 1, playerY- 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY - 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY]);

                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY - 1]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY + 1]);

                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY + 2]);
            }else if(rand == 4){//down only
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX- 1, playerY- 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY - 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY]);

                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY - 1]);

                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY + 2]);
            }else if(rand == 5){//left only
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX- 1, playerY- 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY - 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY]);

                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY - 1]);

                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY + 2]);
            }else if(rand == 6){//up or left
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX- 1, playerY- 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY - 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY]);

                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY + 1]);

                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY + 2]);
            } else if(rand == 7){//down or right
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX- 1, playerY- 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY - 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY]);

                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY - 1]);

                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY + 2]);
            }else if(rand == 8){//up or down
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX- 1, playerY- 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY - 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY]);

                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY]);

                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY + 2]);
            }else if(rand == 9){//left or right
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY - 2]);
                this.tentacleAttackDisplayLocations.push([playerX- 1, playerY- 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY - 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY]);

                this.tentacleAttackDisplayLocations.push([playerX, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY - 1]);

                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY]);
                this.tentacleAttackDisplayLocations.push([playerX - 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX + 1, playerY + 1]);
                this.tentacleAttackDisplayLocations.push([playerX - 2, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX, playerY + 2]);
                this.tentacleAttackDisplayLocations.push([playerX + 2, playerY + 2]);
            }

            var tileInterpreter = new Game_Interpreter();
            for(var loc of this.tentacleAttackDisplayLocations){
                if(testDisplayTileValidity(loc[0], loc[1])){//only if you can walk here would you draw a tile overlay here
                    tileInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '8', loc[0], loc[1] ]);
                }  
            }
        }
        doTentacleAttack() {
            //console.log( "Deciever tentacles" );
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;

           var tileInterpreter = new Game_Interpreter();
            for(var loc of this.tentacleAttackDisplayLocations){
                if(testDisplayTileValidity(loc[0], loc[1])){//only if you can walk here would you draw a tile overlay here
                    tileInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '4', loc[0], loc[1] ]);
                    if (playerX == loc[0] && playerY == loc[1]){
                        BMM.HYB.playerDamage(1);
                    }
                }
                
            }
            AudioManager.playSe({name: 'DeceiverTentacles', pan: 0, pitch: 100, volume: 50});
        }
        removeTentacleDisplays() {
            var tileInterpreter = new Game_Interpreter();
            for(var loc of this.tentacleAttackDisplayLocations){
                if(testDisplayTileValidity(loc[0], loc[1])){//only if you can walk here would you draw a tile overlay here
                    tileInterpreter.pluginCommand( 'REMOVETILE', [ loc[0], loc[1] ] );
                }
            }
        }

        bombSequence() {
            if (this.bombState == 0) {
                // TODO: WARN FOR BOMBS (JORDON)
                this.findPotentialBombLoc();
                this.drawBombDropLocations();
                this.nextActions.push(["log", "WARN RADIANT BOMB"])
                this.isBomb = true;
                this.bombState++;
            } else {
                this.nextActions.push(["radiant_bomb"]);
                this.bombState = 0;
                this.bombCooldown = this.bombMaxCooldown;
            }
        }
        drawBombDropLocations() {
            var tileInterpreter = new Game_Interpreter();
            //console.log("DRAWING ready2");
            for(var loc of this.bossBombLocations){
                //console.log("DRAWING: " + String(loc[0]) + ":" + String(loc[1]));
                tileInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '8', loc[0], loc[1] ]);
            }
        }
        findPotentialBombLoc() {
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            var radius = 2;

            var bottomLeftX = playerX;
            var bottomLeftY = playerY;

            //console.log("Player pos now is: " + String(bottomLeftX) + ":" + String(bottomLeftY));

            for(var i = 0; i < radius; i++){
                if(bottomLeftX < 0){//going off the map now
                    break;
                }
                bottomLeftX--;
            }
            for(var i = 0; i < radius; i++){
                if(bottomLeftY >= BMM.TRAN.level.height){//going off the map now
                    break;
                }
                bottomLeftY++;
            }

            //console.log("BTMLEFT: " + String(bottomLeftX) + ":" + String(bottomLeftY));

            for(var posX = bottomLeftX; posX < bottomLeftX + (radius * 2) + 1; posX++){
                for(var posY = bottomLeftY; posY > bottomLeftY - (radius * 2) - 1; posY--){
                    //console.log("checking pos: " + String(posX) + ":" + String(posY));

                    if (posX < 0 || posY < 0 || posX >= BMM.TRAN.level.width || posY >= BMM.TRAN.level.height
                        || !BMM.TRAN.level.isMapPassable(posX, posY, true)) {//trying to drop bomb on a place you cannot. Skip location
                        //console.log("#1 CANNOT DO: " + String(posX) + ":" + String(posY));
                        continue;
                    }

                    if (BMM.TRAN.level.isMapPassable(posX, posY)){//no wall or end of map here
                        var landingZoneEvent = BMM.TRAN.level.eventAt(posX, posY);
                        //console.log("#2 CAN DO: " + String(posX) + ":" + String(posY));
                        if (landingZoneEvent == null){//no event here. Maybe can drop bomb here
                            //console.log("#3 CAN DO: " + String(posX) + ":" + String(posY));
                            if(posX == playerX && posY == playerY){//player is here. Skip
                                continue;
                            } else {//player is not here. Do not skip
                                //console.log("#4 CAN DO: " + String(posX) + ":" + String(posY));
                                this.potentialBombLocations.push([posX, posY]);
                            }
                        } 
                    }

                }
            }//end of big for loop
            var numOfBombsToSpawn = 3;
            var numOfBombsSpawned = 0;
            var randomPos = 0;
            while(numOfBombsSpawned <  numOfBombsToSpawn) {
                randomPos = Math.floor(Math.random() * this.potentialBombLocations.length);
                if (this.potentialBombLocations[randomPos] in this.bossBombLocations){
                    continue;
                } else {
                    numOfBombsSpawned++;
                    this.bossBombLocations.push(this.potentialBombLocations[randomPos]);
                }
            }
        }
        radiantBomb() {
            this.removeBombDropDisplays();
            for (var loc of this.bossBombLocations) {
                Galv.SPAWN.overlap = 'all';//Needs to be all to spawn bomb on player
                Galv.SPAWN.event(5, loc[0], loc[1]);
                Galv.SPAWN.overlap = 'none';//set back to default to prevent unwanted spawns
            }
            this.potentialBombLocations = [];//reset it
            this.bossBombLocations = [];
            this.isBomb = false;
        }
        removeBombDropDisplays() {
            var tileInterpreter = new Game_Interpreter();
            for (var loc of this.potentialBombLocations){
                tileInterpreter.pluginCommand( 'REMOVETILE', [ loc[0], loc[1] ] );//removes all dash tiles
            }
        }
        lungeSequence() {
            if (this.lungeState == 0) {
                //console.log("Boss Dir: " + String(this.event._direction));
                if(this.event._direction == 2){
                    this.dashDirection = "down";
                } else if(this.event._direction == 4){
                    this.dashDirection = "left";
                }else if(this.event._direction == 6){
                    this.dashDirection = "right";
                } else {//it is 8
                    this.dashDirection = "up";
                }
                this.bossDashDisplayLoc = this.calcBossDashLoc(this.dashDirection);
                if (this.bossDashDisplayLoc != null) {
                    var tileInterpreter = new Game_Interpreter();
                    if (this.dashDirection == "up") {
                        tileInterpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '14', this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1]]);
                    } else if (this.dashDirection == "right") {
                        tileInterpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '12', this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1]]);
                    } else if (this.dashDirection == "down") {
                        tileInterpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '15', this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1]]);
                    } else {//direction is left
                        tileInterpreter.pluginCommand('DISPLAYOVERLAYTILE', ['2386', '13', this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1]]);
                    }
                } else {
                    this.nextActions.push(["log", "Failed to dash"]);
                }
                this.isLunge = true;
                this.lungeState++;
            } else {
                if (this.bossDashDisplayLoc != null) {
                    this.nextActions.push(["radiant_dash"]);
                }
                this.lungeState = 0;
                this.lungeCooldown = this.lungeMaxCooldown;
                this.isLunge = false;
            }
        }
        radiantLunge() {
            var tileInterpreter = new Game_Interpreter();
            tileInterpreter.pluginCommand( 'REMOVETILE', [ this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1] ] );//removes all dash tiles
            this.bossDashAndDamagePlayer();
        }
        bossDashAndDamagePlayer() {
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            var difference;
            //console.log("direction is: " + String(this.dashDirection));

            if (this.dashDirection == "up"){
                difference = this.y - playerY;
                if (playerX == this.x && difference > 0 && difference < this.bossDashDisplayLoc[2]){
                    //console.log("Player is in range. DAMAGE HIM");
                    BMM.HYB.playerDamage(1);
                }
            }else if (this.dashDirection == "right"){
                difference = playerX - this.x;
                //console.log("!!!!!!!!!!!!!!!!!: " + String(difference) + " " + String(this.bossDashDisplayLoc[2]) + " " + String(playerY)+ " " + String(this.y));
                if(playerY == this.y && difference > 0 && difference < this.bossDashDisplayLoc[2]){
                    //console.log("Player is in range. DAMAGE HIM");
                    BMM.HYB.playerDamage(1);
                }
            }else if (this.dashDirection == "down"){
                difference = playerY - this.y;
                if(playerX == this.x && difference > 0 && difference < this.bossDashDisplayLoc[2]){
                    //console.log("Player is in range. DAMAGE HIM");
                    BMM.HYB.playerDamage(1);
                }
            }else {//direction is left
                difference = this.x - playerX;
                if(playerY == this.y && difference > 0 && difference < this.bossDashDisplayLoc[2]){
                    //console.log("Player is in range. DAMAGE HIM");
                    BMM.HYB.playerDamage(1);
                }
            }

            //BMM.TRAN.level.moveEvent(this.x, this.y, this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1]);
            //console.log("DISPLAY LOC: " + this.bossDashDisplayLoc);
            this.event.setPosition(this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1]);
            this.x = this.event._x;
            this.y = this.event._y;

        }
        calcBossDashLoc(direction){
            var moveDist = 0;
            var maxDist = 5;
            var bossX = this.x;
            var bossY = this.y;
            var newX = bossX;
            var newY = bossY;
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            this.bossDashDisplayLoc = null; //set it to null in the event it cannot locate a place to dash to
            for (var i = 1; i <= maxDist; i++){ //check to see if you can move 5, 4, 3... spaces in direction

                //get location player is trying to dash to
                if (direction === "down") {
                    newY = bossY + i;
                }
                else if (direction === "left") {
                    newX = bossX - i;
                }
                else if (direction === "right") {
                    newX = bossX + i;
                }
                else if (direction === "up") {
                    newY = bossY - i;
                }

                if (newX < 0 || newY < 0 || newX >= BMM.TRAN.level.width || newY >= BMM.TRAN.level.height
                    || !BMM.TRAN.level.isMapPassable(newX, newY, true)) {//trying to dash off map or hitting a wall. End loop, as you can't go further.
                    break;
                }

                if (BMM.TRAN.level.isMapPassable(newX, newY)){//no wall or end of map here
                    var landingZoneEvent = BMM.TRAN.level.eventAt(newX, newY);
                    if(newX == playerX && newY == playerY){//cannot spawn on player
                        continue;
                    }
                    if (landingZoneEvent == null){//no event here. Can go here
                        moveDist = i;
                    }
                }
            }

            if (moveDist == 0){ //no events are in the way, but something is (wall most likely). 
                return null;
            }

            //return pos for dash in given direction
            if (direction === "down") {
                return [bossX, bossY + moveDist, moveDist];
            }
            else if (direction === "left") {
                return [bossX - moveDist, bossY, moveDist];
            }
            else if (direction === "right") {
                return [bossX + moveDist, bossY, moveDist];
            }
            else {//direction == up
                return [bossX, bossY - moveDist, moveDist];
            }
        }
        standardAttack() {
            //console.log( "Deciever melee" );
            if (this.attackState == 0) {
                this.attackDir = this.dirToPlayer();
                var pos = dirToMove(this.attackDir);
                this.nextActions.push(["face", this.attackDir]);
                this.nextActions.push(["warn", this.x + pos[0], this.y + pos[1], "attack"]);
                this.isAttack = true;
                this.attackState++;
            } else {
                var pos = dirToMove(this.attackDir);
                this.nextActions.push(["play_se", "DeceiverMelee", 0, 0, 100]);
                this.nextActions.push(["hit", this.x + pos[0], this.y + pos[1], this.atk, ["enemy"]]);
                this.isAttack = false;
                this.attackState = 0;
            }
            AudioManager.playSe({name: 'DeceiverMelee', pan: 0, pitch: 100, volume: 100});
        }
        getNextMove() {
            var direction = this.dirToPlayer();
            var move = dirToMove(direction);
            if (BMM.TRAN.level.isPassable(this.x + move[0], this.y + move[1])) {
               this.nextActions.push(["move", move[0], move[1], direction]);
            }
        }
        damage(amount) {
            if (this.invulnerable) return;
            this.hp -= amount;
            var soundToPlay = Math.floor(Math.random() * 2);//btw 0-1 inclusive
            if(soundToPlay == 0){
                AudioManager.playSe({name: 'RadiantDamaged', pan: 0, pitch: 100, volume: 70});
            }else {
                AudioManager.playSe({name: 'RadiantDamaged', pan: 0, pitch: 100, volume: 70});
            }
            if (this.hp <= 0) {
                this.stage += 1;
                //this.nextActions = [];
                //BMM.HYB.resetOverlays();
                if (this.stage > 3) {
                    this.death();
                } else {
                    this.hp = this.baseHP[this.stage];
                    if (this.stage == 1) {
                        AudioManager.playSe({name: 'BossPhase', pan: 0, pitch: 100, volume: 45});
                        $gameMessage.setFaceImage("Evil", 2);
                        $gameMessage.setBackground(0);
                        $gameMessage.setPositionType(2);
                        $gameMessage.add("Time is getting faster, I'm almost free.\nJust give me the seal!");
                    } else if (this.stage == 2) {
                        AudioManager.playSe({name: 'BossPhase', pan: 0, pitch: 100, volume: 45});
                        $gameMessage.setFaceImage("Evil", 2);
                        $gameMessage.setBackground(0);
                        $gameMessage.setPositionType(2);
                        $gameMessage.add("YOU'LL PAY FOR THIS!");
                    } else if (this.stage == 3) {
                        AudioManager.stopBgm();
                        this.nextActions = [];
                        BMM.HYB.resetOverlays();
                        AudioManager.playSe({name: 'BossPhase', pan: 0, pitch: 100, volume: 100});
                        $gameMessage.setFaceImage("Evil", 1);
                        $gameMessage.setBackground(0);
                        $gameMessage.setPositionType(2);
                        $gameMessage.add("It hurts, oh god it hurts!");
                        $gameMessage.newPage();
                        $gameMessage.add("You ANIMAL!")
                        $gameMessage.newPage();
                        $gameMessage.add("How could you betray me after everything\nI did for you.")
                        $gameMessage.newPage();
                        $gameMessage.add("YOU RUINED EVERYTHING!");
                        $gameMessage.newPage();
                        $gameMessage.add("...");
                        $gameMessage.newPage();
                        $gameMessage.add("I'm sorry.");
                        $gameMessage.newPage();
                        $gameMessage.add("Please don't kill me...");
                        $gameMessage.newPage();
                        $gameMessage.add("I'm just a feeble old man.");
                        $gameMessage.newPage();
                        $gameMessage.add("If you kill me time will freeze again.");
                        $gameMessage.newPage();
                        $gameMessage.add("You'll be trapped here forever.");
                        $gameMessage.newPage();
                        $gameMessage.add("You don't understand what it means\nto be stuck in one moment for eternity.");
                        $gameMessage.newPage();
                        $gameMessage.add("It's worse than death.");
                        $gameMessage.newPage();
                        $gameMessage.add("It'll be the end of everything you know.");
                    }
                }
            }
        }
        death() {
            $gameSelfSwitches.setValue([$gameMap._mapId, this.id, "B"], true);
            AudioManager.playSe({name: 'RadiantDeath', pan: 0, pitch: 100, volume: 55});
            AudioManager.stopBgm();
        }
    }

    BMM.PT.PROJ_Bomb = class extends Projectile { // TODO
        constructor(event, fuse, radius, damage, neutral) {
            super(event, "bomb");
            this.neutral = neutral;
            this.damage = damage;
            this.fuse = fuse;
            this.radius = radius;
            this.ping = [];
        }
        damageEnemys(){
            var enemysInBlastRadius = [];
            var currentEvent = null;
            enemysInBlastRadius.push(BMM.TRAN.level.eventAt(this.x, this.y - 1));
            enemysInBlastRadius.push(BMM.TRAN.level.eventAt(this.x + 1, this.y - 1));
            enemysInBlastRadius.push(BMM.TRAN.level.eventAt(this.x + 1, this.y));
            enemysInBlastRadius.push(BMM.TRAN.level.eventAt(this.x + 1, this.y + 1));
            enemysInBlastRadius.push(BMM.TRAN.level.eventAt(this.x, this.y + 1));
            enemysInBlastRadius.push(BMM.TRAN.level.eventAt(this.x - 1, this.y + 1));
            enemysInBlastRadius.push(BMM.TRAN.level.eventAt(this.x - 1, this.y));
            enemysInBlastRadius.push(BMM.TRAN.level.eventAt(this.x - 1, this.y - 1));

            for(var i = 0; i < enemysInBlastRadius.length; i++){
                currentEvent = enemysInBlastRadius[i];
                if (currentEvent == null){//no event here
                    //console.log("No damage done");
                    continue;
                }
                if (currentEvent.type == "enemy" || currentEvent.type == "boss"){//event is enemy. Must damage them
                    //damage enemy
                    if (this.neutral == true){//player bomb
                        //console.log("D-D-D-DAMAGE!");
                        currentEvent.damage(2);
                    }
                }
            }
        }
        changeBombState(){
            if (this.fuse == -1){//bomb is not placed. Do nothing
                return;
            }
            if (this.fuse == 0){//remove remaining tiles and destroy event
                this.removeBlastRadiusDisplays();
                this.destroy();
            }else if (this.fuse == 1) {//detonate bomb
                //todo: add events or sprites to show bomb detonated. Make sure they're above/below player level
                //todo: damage enemy's in a 3x3 range
                this.damageEnemys();
                this.damagePlayer();
                AudioManager.playSe({name: 'BombDetonate', pan: 0, pitch: 100, volume: 100});
                this.fuse--;
                this.removeBlastRadiusDisplays();
                this.showSmokeBlastRadius();
                this.event.setImage('', 0);//remove image of bomb
            } else {//Bomb has been here for 1 turn. Change state
                // On the next tick it turns red and shows a warning over it’s threat range of 3x3 cells, centered around it’s position.
                this.fuse--;
                this.getBlastZoneLocations();
                this.event.setImage('!Other1', 6);
                AudioManager.playSe({name: 'BombReady', pan: 0, pitch: 100, volume: 100});
                this.showBlastRadius();
            }
        }
        damagePlayer(){
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            if (Math.abs(playerX - this.x) <= 1 && Math.abs(playerY - this.y) <= 1){//player is in range of bomb
                BMM.HYB.playerDamage(1);
            }
        }
        getBlastZoneLocations(){
            //console.log("GETTING");
            var locations = [];
            locations.push([this.x, this.y - 1]);
            locations.push([this.x + 1, this.y - 1]);
            locations.push([this.x + 1, this.y]);
            locations.push([this.x + 1, this.y + 1]);
            locations.push([this.x, this.y + 1]);
            locations.push([this.x - 1, this.y + 1]);
            locations.push([this.x - 1, this.y]);
            locations.push([this.x - 1, this.y - 1]);
            this.ping = locations;
        }
        showBlastRadius(){
            for (var i = 0; i < 8; i++){
                var tileInterpreter = new Game_Interpreter();
                tileInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '3', this.ping[i][0], this.ping[i][1] ]);
            }
        }
        showSmokeBlastRadius(){
            for (var i = 0; i < 8; i++){
                var tileInterpreter = new Game_Interpreter();
                tileInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '3382', '4', this.ping[i][0], this.ping[i][1] ]);
            }
        }
        removeBlastRadiusDisplays(){
            for (var i = 0; i < 8; i++){
                var tileInterpreter = new Game_Interpreter();
                tileInterpreter.pluginCommand( 'REMOVETILE', [ this.ping[i][0], this.ping[i][1] ]);
            }
        }
    }

    BMM.PT.PROJ_Arrow = class extends Projectile {
        constructor(event, direction, speed, damage, neutral) {
            super(event, "arrow");
            this.neutral = neutral;
            if (direction == "down") this.dir = 2;
            if (direction == "left") this.dir = 4;
            if (direction == "right") this.dir = 6;
            if (direction == "up") this.dir = 8;
            this.dx = dirToMove(this.dir)[0];
            this.dy = dirToMove(this.dir)[1];
            this.spd = speed;
            this.dmg = damage;
        }
        getNextActions() {
            this.nextActions.push(["fly", this.dx, this.dy, this.spd, this.dmg, this.neutral]);
        }
    }

    BMM.PT.TRAP_Spike = class extends Trap { //
        constructor(event) {
            super(event, "spiketrap");
            this.state = Math.floor(Math.random() * 7) - 1;//sets the state to a random position
        }
        changeState(){
            if (this.state == -1){
                this.state++;
            }
            else if (this.state == 3){//spike is down. Peek it.
                this.event.setImage('!Other1', 5);
                this.state++;
            } else if (this.state == 4){//spike is peeking. Go up and damage
                this.event.setImage('!Other1', 7);
                this.state++;
                var playerX = $gamePlayer.x;
                var playerY = $gamePlayer.y;
                if (playerX == this.x && playerY == this.y){
                    this.damagePlayer();
                    AudioManager.playSe({name: 'spikesound', pan: 0, pitch: 100, volume: 40});
                } else {
                    var target = BMM.TRAN.level.eventAt(this.x, this.y);
                    if (target != null && (target.type == "enemy" || target.type == "boss")) {
                        if (!target.flying) {
                            //target.damage(1); // TEMP: Enemies immune to spikes for now
                        }
                    }
                }
            } else if (this.state == 5) {//spike is up. Hide it
                this.event.setImage('!Other1', 4);
                this.state = 0;
            }
            else {
                this.state++;
            }
        }
        damagePlayer(){
            BMM.HYB.playerDamage(1);
        }
    }

    BMM.PT.TRAP_Arrow = class extends Trap { // TODO
        constructor(event, direction, projectile) {
            super(event, "arrowtrap");
            this.dir = direction;
            this.proj = projectile
        }
    }

    BMM.PT.ENEMY_Hitscan = class extends Enemy { // TODO
        constructor(event, baseHP, attack, range, mods) {
            super(event, "ranged", baseHP, mods);
            this.atk = attack;
            this.rng = range;
            this.attackInd = 0;
            this.attackDir = 0;
            this.state = 0; // 0 = moving, 1 = attacking
        }
    }

    BMM.PT.ENEMY_Bomb = class extends Enemy { // TODO
        constructor(event, baseHP, attack, mods) {
            super(event, "ranged", baseHP, mods);
            this.atk = attack;
            this.attackInd = 0;
            this.attackDir = 0;
            this.state = 0; // 0 = moving, 1 = exploding
        }
    }

    BMM.PT.ENEMY_Ranged = class extends Enemy { // TODO
        constructor(event, baseHP, up, down, left, right, mods) {
            super(event, "ranged", baseHP, mods);
            this.u = up;
            this.d = down;
            this.l = left;
            this.r = right;
            this.attackInd = 0;
            this.attackDir = 0;
            this.state = 0; // 0 = moving, 1 = attacking
        }
    }

    BMM.PT.ENEMY_Melee = class extends Enemy {
        constructor(event, baseHP, attack, mods) {
            super(event, "melee", baseHP, mods);
            this.atk = attack;
            this.attackInd = 0;
            this.attackDir = 0;
            this.state = 0; // 0 = moving, 1 = attacking
            this.distance = 999;
        }
        getNextActions() {
            this.getState();
            if (this.aggro == false) {
                // Hasn't seen player yet, do nothing
            } else {
                if (this.state == 0) {
                    this.getNextMove();
                } else {
                    this.attack();
                }
            }
        }
        getState() {
            this.distance = this.distToPlayer();
            if (this.distance[0] + this.distance[1] <= 5) {
                this.aggro = true;
            }
            if (this.distance[0] + this.distance[1] <= 1) this.state = 1;
        }
        getNextMove() {
            var direction = this.dirToPlayer();
            var move = dirToMove(direction);
            if (BMM.TRAN.level.isPassable(this.x + move[0], this.y + move[1])) {
               this.nextActions.push(["move", move[0], move[1], direction]);
            }
        }
        attack() {
            // Sequence: Warn, attack, pause
            if (this.attackInd == 0) {
                this.attackInd += 1;
                this.attackDir = this.dirToPlayer();
                var pos = dirToMove(this.attackDir);
                this.nextActions.push(["face", this.attackDir]);
                this.nextActions.push(["warn", this.x + pos[0], this.y + pos[1], "attack"]);
            } else if (this.attackInd == 1) {
                this.attackInd += 1;
                var pos = dirToMove(this.attackDir);
                this.nextActions.push(["hit", this.x + pos[0], this.y + pos[1], this.atk, ["boss", "enemy"]]);
                this.attackInd = 0;
                this.state = 0;
            }
        }
    }
})();