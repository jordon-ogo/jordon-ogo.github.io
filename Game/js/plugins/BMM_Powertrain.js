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

    BMM.PT.Generic = class {
        constructor(event) {
            this.event = event;
            this.x = event._x;
            this.y = event._y;
            this.id = event._eventId;
            this.name = event.event().name;
            this.note = event.event().note;
            this.dir = event._direction;
            this.type = "generic";
            this.event._sequenced = true;
        }
        advance() { return null; }
        destroy() {
            this.event._erased = true;
            this.event._sequenced = false;
            this.event.refresh();
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
            this.executeActions();
            this.nextActions = [];
            this.getNextActions();
        }
        executeActions() {
            if (this.nextActions.length > 0) {
               console.log("> " + this.name);
            }
            for (var action of this.nextActions) {
                console.log("\t" + action);
                if (action[0] == "move") {
                    this.move(action[1], action[2]);
                    this.face(action[3])
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
                } else if (action[0] == "destroy") {
                    this.destroy();
                }
            }
        }
        move(dx, dy) {
            if (BMM.TRAN.level.isPassable(this.x + dx, this.y + dy)) {
                BMM.TRAN.level.moveEvent(this.x, this.y, this.x + dx, this.y + dy);
                this.event.setPosition(this.x + dx, this.y + dy);
                this.x = this.event._x;
                this.y = this.event._y;
            }
        }
        face(dir) {
            this.event.setDirection(dir);
            this.dir = this.event._direction;
        }
        warn(xpos, ypos, warntype){
            this.spawn(xpos, ypos, 4); //TEMP
            if (warntype == "move") {
                // TODO
            } else if (warntype == "attack") {
                // TODO
            } else if (warntype == "spawn") {
                // TODO
            } else {
                // TODO
            }
        }
        hit(xpos, ypos, dmg, exclude) {
            var hitTarget = BMM.TRAN.level.eventAt(xpos, ypos);
            if (hitTarget == null || hitTarget.type == "warning") {
                if ($gamePlayer.x == xpos && $gamePlayer.y == ypos) {
                    BMM.HYB.playerDamage(dmg);
                }
            } else {
                if ((hitTarget.type == "enemy" && !("enemy" in exclude)) || (hitTarget.type == "boss" && !("boss" in exclude))) {
                    hitTarget.damage(dmg);
                }
            }
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
                    console.log("WARNING @ [" + this.x + dx * i2 + ", " + this.y + dy * i2 + "]")
                    this.warn(this.x + dx * i2, this.y + dy * i2, "attack");
                }
            }
        }
        spawn(xpos, ypos, spawnId) {
            if (xpos >= 0 && ypos >= 0 && xpos < BMM.TRAN.level.width && ypos < BMM.TRAN.level.height) {
                Galv.SPAWN.event(spawnId,xpos,ypos);
            }
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

    class Enemy extends Sequenced {
        constructor(event, subtype, baseHP) {
            super(event);
            this.type = "enemy";
            this.class = subtype;
            this.baseHP = baseHP;
            this.hp = baseHP;
            this.getNextActions();
        }
        damage(amount) {
            this.hp -= amount;
            if (this.hp <= 0) {
                this.death();
            }
        }
        death() {
            try {
                $gameVariables.setValue(2, $gameVariables.value(2) - 1);
            } catch (e) {
                // TODO: DELETE THIS AFTER TECH DEMO
            }
            this.destroy(); // TODO: this is a placeholder, will probably need some death indicator before destroying
            console.log("Main death function called");
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

    BMM.PT.BOSS_Golem = class extends Boss { // TODO
        constructor(event) {
            super(event, "golem");
        }
    }

    BMM.PT.BOSS_Spectre = class extends Boss { // TODO
        constructor(event) {
            super(event, "spectre");
        }
    }

    BMM.PT.BOSS_Radiant = class extends Boss { // TODO
        constructor(event) {
            super(event, "radiant");
            this.stage = 0;
            this.baseHP = [3, 4, 4];
            this.hp = this.baseHP[0];
            this.state = 0; // 0 = move, 1 = std attack, 2 = lunge, 3 = swipe
            this.attackDir = 0;
            this.attackInd = 0;
            this.lungeCooldown = 0;
            this.lungeInd = 0;
            this.swipeCooldown = 0;
            this.swipeInd = 0;
        }
        getNextActions() {
            this.x = this.event._x;
            this.y = this.event._y;
            if (this.stage == 0) {
                this.getMoveStage1();
            } else if (this.stage == 1) {
                this.getMoveStage2();
            } else if (this.stage == 2) {
                this.getMoveStage3();
            }
        }
        getMoveStage1() {
            if (this.distToPlayer[0] + this.distToPlayer[1] <= 1) {
                this.state = 1;
            }
            if (this.state == 0) {
                // move
            } else {
                // attack
            }
        }
        getMoveStage2() {
            // TODO
        }
        getMoveStage3() {
            // TODO
        }
        damage(amount) {
            this.hp -= amount;
            if (this.hp <= 0) {
                this.stage += 1;
                if (this.stage > 2) {
                    this.death();
                } else {
                    this.hp = this.baseHP[this.stage];
                    if (this.stage == 1) {
                        $gameMessage.setFaceImage("Evil", 4);
                        $gameMessage.setBackground(0);
                        $gameMessage.setPositionType(2);
                        $gameMessage.add("I'm just getting started!");
                    } else if (this.stage == 2) {
                        $gameMessage.setFaceImage("Evil", 4);
                        $gameMessage.setBackground(0);
                        $gameMessage.setPositionType(2);
                        $gameMessage.add("NO! You can't break the curse!");
                    }
                }
            }
        }
        death() {
            $gameMessage.setFaceImage("Evil", 4);
            $gameMessage.setBackground(0);
            $gameMessage.setPositionType(2);
            $gameMessage.add("ACK! You've killed me!");
            $gameMessage.newPage();
            $gameMessage.add("...");
            $gameMessage.newPage();
            $gameMessage.add("Wait a minute... this is just a demo!");
            $gameMessage.newPage();
            $gameMessage.add("I guess the world is fine after all.");
            $gameMessage.newPage();
            $gameMessage.add("At least for now.");
            $gameMessage.newPage();
            $gameMessage.add("A WINRAR IS YOU");
            this.destroy(); // TODO this is just a placeholder
            AudioManager.stopBgm();
        }
    }

    BMM.PT.BOSS_Deceiver = class extends Boss { // TODO
        constructor(event) {
            super(event, "deceiver");
        }
    }

    BMM.PT.PROJ_Bomb = class extends Projectile { // TODO
        constructor(event, fuse, radius, damage, neutral) {
            super(event, "bomb");
            this.neutral = neutral;
            this.damage = damage;
            this.fuse = fuse;
            this.radius = radius;
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
                    console.log("No damage done");
                    continue;
                }
                if (currentEvent.type == "enemy" || currentEvent.type == "boss"){//event is enemy. Must damage them
                    //damage enemy
                    console.log("D-D-D-DAMAGE!");
                    currentEvent.damage(1);
                }
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

    BMM.PT.TRAP_Spike = class extends Trap { // TODO//////////////////////////////////////////////////////////////////////////////////////
        constructor(event) {
            super(event, "spiketrap");
            this.state = -1;//-1 is to account for first turn when loading. 0 is down. 1 is peaking. 2 is up and damaging
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
                    AudioManager.playSe({name: 'spikesound', pan: 0, pitch: 100, volume: 70});
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
        }
        getNextActions() {
            this.getState();
            if (this.state == 0) {
                this.getNextMove();
            } else {
                this.attack();
            }
        }
        getState() {
            var distance = this.distToPlayer();
            if (distance[0] <= 1 && distance[1] <= 1) {
                this.state = 1;
            }
        }
        getNextMove() {
            var direction;
            if (randInt(1,3) == 1) {
                direction = randomDir();
            } else {
                direction = this.dirToPlayer();
            }
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
            } else if (this.attackInd == 2) {
                this.attackInd = 0;
                this.state = 0;
            }
        }
    }
})();