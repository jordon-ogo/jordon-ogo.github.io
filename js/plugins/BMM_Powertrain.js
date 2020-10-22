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
            this.warningLoc = {};
        }
        advance() { return null; }
        destroy() {
            var tileInterpreter = new Game_Interpreter();
            for (var loc in this.warningLoc) {//any tiles the event may have displayed need to be removed
                tileInterpreter.pluginCommand( 'REMOVETILE', this.warningLoc[loc]);
                delete this.warningLoc[loc];
            }
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
                console.log("\t" + action[0]);
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
                } else if (action[0] == "destroy") {
                    this.destroy();
                } else if (action[0] == "log") {
                    console.log(action[1]);
                } else if (action[0] == "radiant_dash") {
                    this.radiantLunge();
                } else if (action[0] == "radiant_bomb") {
                    this.radiantBomb();
                }
            }
        }
        move(dx, dy, dir) {
            if (BMM.TRAN.level.isPassable(this.x + dx, this.y + dy)) {
                BMM.TRAN.level.moveEvent(this.x, this.y, this.x + dx, this.y + dy);
                //this.event.setPosition(this.x + dx, this.y + dy);
                this.event.setMoveSpeed(6);
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
            console.log("WARNING ENEMY ATTACK");
            //this.spawn(xpos, ypos, 4); //TEMP
            var tileInterpreter = new Game_Interpreter();
            if (warntype == "move") {
                // TODO
            } else if (warntype == "attack") {
                // TODO
                tileInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '11', xpos, ypos]);//display enemy attacking on tile
                console.log("HASHMAP Before add: " + String(Object.keys(this.warningLoc)));
                this.warningLoc[[xpos, ypos]] = [xpos, ypos];//add tile display loc to hasmap
                console.log("HASHMAP after add: " + String(Object.keys(this.warningLoc)));
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
                if ((hitTarget.type == "enemy" && !exclude.includes("enemy")) || (hitTarget.type == "boss" && !exclude.includes("boss"))) {
                    hitTarget.damage(dmg);
                }
            }
            //regarlesss if hit connects or not, remove warning tile
            var tileInterpreter = new Game_Interpreter();
            tileInterpreter.pluginCommand( 'REMOVETILE', [xpos, ypos] );
            console.log("HASHMAP Before remove: " + String(Object.keys(this.warningLoc)));
            delete this.warningLoc[[xpos, ypos]];
            console.log("HASHMAP after remove: " + String(Object.keys(this.warningLoc)));
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
        }
        damage(amount) {
            this.hp -= amount;
            var soundToPlay = Math.floor(Math.random() * 3);//btw 0-2 inclusive
            if(soundToPlay == 0){
                AudioManager.playSe({name: 'EnemyDamage1', pan: 0, pitch: 100, volume: 100});
            }else if(soundToPlay == 1){
                AudioManager.playSe({name: 'EnemyDamage2', pan: 0, pitch: 100, volume: 100});
            }else {
                AudioManager.playSe({name: 'EnemyDamage3', pan: 0, pitch: 100, volume: 100});
            }
            if (this.hp <= 0) {
                this.death();
            }
        }
        death() {
            var soundToPlay = Math.floor(Math.random() * 2);//btw 0-1 inclusive
            if(soundToPlay == 0){
                AudioManager.playSe({name: 'EnemyDeath', pan: 0, pitch: 100, volume: 100});
            }else {
                AudioManager.playSe({name: 'EnemyDeath2', pan: 0, pitch: 100, volume: 100});
            }
            // try {
            //     //$gameVariables.setValue(2, $gameVariables.value(2) - 1);
            // } catch (e) {
            //     // TODO: DELETE THIS AFTER TECH DEMO
            // }
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
            // NOTE boss sequence is temporary (for VS2)
            if (this.isLunge || (this.stage >= 2 && this.lungeCooldown <= 0)) {
                this.lungeSequence();
            } else if (this.isBomb || (this.stage >= 1 && this.bombCooldown <= 0)) {
                this.bombSequence();
            } else if (this.isAttack || (this.stage >= 0 && this.distance[0] + this.distance[1] <= 2)) {
                this.standardAttack();
            } else {
                this.getNextMove();
            }
        }
        bombSequence() {
            if (this.bombState == 0) {
                // TODO: WARN FOR BOMBS (JORDON)
                this.findPotentialBombLoc();
                this.drawBombDropLocations();
                this.nextActions.push(["log", ">>>>>>>>>>>>>>>>> WARN RADIANT BOMB"])
                this.isBomb = true;
                this.bombState++;
            } else {
                this.nextActions.push(["radiant_bomb"]);
                this.bombState = 0;
                this.bombCooldown = this.bombMaxCooldown;
                this.isBomb = false;
            }
        }
        drawBombDropLocations() {
            var tileInterpreter = new Game_Interpreter();
            console.log("DRAWING ready2");
            for(var loc of this.bossBombLocations){
                console.log("DRAWING: " + String(loc[0]) + ":" + String(loc[1]));
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
            // TODO: EXECUTE BOMB ATTACK (JORDON)
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
        removeBombDropDisplays() {
            var tileInterpreter = new Game_Interpreter();
            for (var loc of this.potentialBombLocations){
                tileInterpreter.pluginCommand( 'REMOVETILE', [ loc[0], loc[1] ] );//removes all dash tiles
            }
        }
        lungeSequence() {
            if (this.lungeState == 0) {
                // TODO: WARN FOR DASH (JORDON)
                console.log("Boss Dir: " + String(this.event._direction));
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
            // TODO: EXECUTE DASH (JORDON)
            var tileInterpreter = new Game_Interpreter();
            tileInterpreter.pluginCommand( 'REMOVETILE', [ this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1] ] );//removes all dash tiles
            this.bossDashAndDamagePlayer();
            //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  RADIANT DASH")
        }
        bossDashAndDamagePlayer() {
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            var difference;
            console.log("direction is: " + String(this.dashDirection));

            if (this.dashDirection == "up"){
                difference = this.y - playerY;
                if (playerX == this.x && difference > 0 && difference < this.bossDashDisplayLoc[2]){
                    console.log("Player is in range. DAMAGE HIM");
                    BMM.HYB.playerDamage(1);
                }
            }else if (this.dashDirection == "right"){
                difference = playerX - this.x;
                //console.log("!!!!!!!!!!!!!!!!!: " + String(difference) + " " + String(this.bossDashDisplayLoc[2]) + " " + String(playerY)+ " " + String(this.y));
                if(playerY == this.y && difference > 0 && difference < this.bossDashDisplayLoc[2]){
                    console.log("Player is in range. DAMAGE HIM");
                    BMM.HYB.playerDamage(1);
                }
            }else if (this.dashDirection == "down"){
                difference = playerY - this.y;
                if(playerX == this.x && difference > 0 && difference < this.bossDashDisplayLoc[2]){
                    console.log("Player is in range. DAMAGE HIM");
                    BMM.HYB.playerDamage(1);
                }
            }else {//diection is left
                difference = this.x - playerX;
                if(playerY == this.y && difference > 0 && difference < this.bossDashDisplayLoc[2]){
                    console.log("Player is in range. DAMAGE HIM");
                    BMM.HYB.playerDamage(1);
                }
            }

            //BMM.TRAN.level.moveEvent(this.x, this.y, this.bossDashDisplayLoc[0], this.bossDashDisplayLoc[1]);
            console.log("DISPLAY LOC: " + this.bossDashDisplayLoc);
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
            var soundToPlay = Math.floor(Math.random() * 2);//btw 0-1 inclusive
            if(soundToPlay == 0){
                AudioManager.playSe({name: 'BossDamage1', pan: 0, pitch: 100, volume: 100});
            }else {
                AudioManager.playSe({name: 'BossDamage2', pan: 0, pitch: 100, volume: 100});
            }
            if (this.hp <= 0) {
                this.stage += 1;
                if (this.stage > 2) {
                    this.death();
                } else {
                    this.hp = this.baseHP[this.stage];
                    if (this.stage == 1) {
                        AudioManager.playSe({name: 'BossPhase', pan: 0, pitch: 100, volume: 100});
                        $gameMessage.setFaceImage("Evil", 4);
                        $gameMessage.setBackground(0);
                        $gameMessage.setPositionType(2);
                        $gameMessage.add("The spell must survive!");
                    } else if (this.stage == 2) {
                        AudioManager.playSe({name: 'BossPhase', pan: 0, pitch: 100, volume: 100});
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
            AudioManager.playSe({name: 'BossDeath', pan: 0, pitch: 100, volume: 100});
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
                    console.log("No damage done");
                    continue;
                }
                if (currentEvent.type == "enemy" || currentEvent.type == "boss"){//event is enemy. Must damage them
                    //damage enemy
                    if (this.neutral == true){//player bomb
                        console.log("D-D-D-DAMAGE!");
                        currentEvent.damage(1);
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
            console.log("GETTING");
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
                    AudioManager.playSe({name: 'spikesound', pan: 0, pitch: 100, volume: 70});
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
                this.attackInd = 0;
                this.state = 0;
            }
        }
    }
})();