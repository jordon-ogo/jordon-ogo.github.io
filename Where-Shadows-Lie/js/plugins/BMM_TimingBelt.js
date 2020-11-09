//=============================================================================
// BMM_TimingBelt.js
//=============================================================================
var Imported = Imported || {};
Imported.BMM_TimingBelt = true;
var BMM = BMM || {};
BMM.TIME = BMM.TIME || {};

/*:
 * @plugindesc Handles timing system
 *
 * @author NavrasK
 * 
 * [parameters]
 *
 * @help This includes turn timer functions and the definition of most entities in the game
 * TERMS OF USE: No reuse without express permission of author
 * COMPATIBILITY: No issues known
 */
 
(function() {
    var parameters = PluginManager.parameters("BMM_TimingBelt");

    var useDash = false;
    var potentialDashMove = {down: [], "left": [], "right": [], "up": []};//Pos: 0=x 1=y 2=moveDist for given direction
    var allDirections = ["down", "left", "right", "up"];
    var enemysInDashPath = {down: [], "left": [], "right": [], "up": []};//all events in potential dash path
    var dashDisplayed = false;
    var dashTileDisplaysLoc = [];

    var bombLocation = [-1, -1];
    var bombActive = false;
    var bombObject = null;

    //##########################BOMB START#####################################

    BMM.TIME.displayPotentialBomb = function() {
        console.log("display potential bomb");
        //todo: somehow display that player is about to drop bomb
    }

    BMM.TIME.removePotentialBomb = function() {
        //todo: remove bomb display
    }

    BMM.TIME.activateBomb = function() {
        bombActive = true;//so the turn progressor can check its status
        console.log("drop bomb now");

        var playerX = $gamePlayer.x;
        var playerY = $gamePlayer.y;
        bombLocation = [playerX, playerY];

        Galv.SPAWN.overlap = 'all';//Needs to be all to spawn bomb on player
        Galv.SPAWN.event(3, playerX, playerY);
        Galv.SPAWN.overlap = 'none';//set back to default to prevent unwanted spawns

        bombObject = BMM.TRAN.level.eventAt(bombLocation[0], bombLocation[1]);
        AudioManager.playSe({name: 'BombDropped', pan: 0, pitch: 100, volume: 100});
        //BMM.TIME.bossBombs();
    }

    BMM.TIME.bossBombs = function() {
        var playerX = $gamePlayer.x;
        var playerY = $gamePlayer.y;
        var radius = 2;
        var potentialBombLocations = [];

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
                            potentialBombLocations.push([posX, posY]);
                        }
                    } 
                }

            }
        }//end of big for loop
        var numOfBombsToSpawn = 3;
        var numOfBombsSpawned = 0;
        var bossBombLocs = [];
        var randomPos = 0;
        while(numOfBombsSpawned <  numOfBombsToSpawn) {
            randomPos = Math.floor(Math.random() * potentialBombLocations.length);
            if (potentialBombLocations[randomPos] in bossBombLocs){
                continue;
            } else {
                Galv.SPAWN.overlap = 'all';//Needs to be all to spawn bomb on player
                Galv.SPAWN.event(3, potentialBombLocations[randomPos][0], potentialBombLocations[randomPos][1]);
                Galv.SPAWN.overlap = 'none';//set back to default to prevent unwanted spawns
                numOfBombsSpawned++;
                bossBombLocs.push(potentialBombLocations[randomPos]);
            }
        }

        //console.log("POS FOR BOSS BOMB DROP: " + String(potentialBombLocations));

    }

    /*function checkBombStatus() {//archived and outdated
        console.log("BOMB in timingbelt active. THIS SHOULD NOT HAPPEN");
        //var bombEvent = BMM.TRAN.level.eventAt(bombLocation[0], bombLocation[1]);

        if (bombObject.fuse == -1){//bomb is not placed. Do nothing
            //remove all evnts of smoke or whatever we use
            return;
        }
        if (bombObject.fuse == 0){//detonate bomb
            //todo: add events or sprites to show bomb detonated. Make sure they're above/below player level
            //todo: damage enemy's in a 3x3 range
            bombObject.damageEnemys();
            bombObject.destroy();
            AudioManager.playSe({name: 'BombDetonateEdited', pan: 0, pitch: 100, volume: 100});
            bombObject.fuse--;
            bombActive = false;

        }else if (bombObject.fuse == 1) {//timer is at one. Decrease it and display warning
            // On the next tick it turns red and shows a warning over it’s threat range of 3x3 cells, centered around it’s position.
            bombObject.fuse--;
            bombObject.event.setImage('!Other1', 6);
            AudioManager.playSe({name: 'BombReadyEdited', pan: 0, pitch: 100, volume: 100});
        } else {//bomb timer is at two
            bombObject.fuse--;
        }
    }*/

    //##########################BOMB END#####################################    


    //##########################DASH START#####################################
    BMM.TIME.displayPotentialDashMoves = function() {
        dashTileDisplaysLoc = [];//reset

        dashDisplayed = true;
        enemysInDashPath = {down: [], "left": [], "right": [], "up": []};//reset for new calculations

        //Galv.SPAWN.overlap = 'all';
        var tileInterpreter = new Game_Interpreter();

        for(singleDirection of allDirections) {//display dash locations, if available
            potentialDashMove[singleDirection] = calcDashPos(singleDirection);
            if (potentialDashMove[singleDirection][0] != -1){//if it is -1, do not spawn display
                if(singleDirection == "up"){
                    tileInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '14', potentialDashMove[singleDirection][0], potentialDashMove[singleDirection][1] ] );
                }else if(singleDirection == "right"){
                    tileInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '12', potentialDashMove[singleDirection][0], potentialDashMove[singleDirection][1] ] );
                } else if (singleDirection == "down"){
                    tileInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '15', potentialDashMove[singleDirection][0], potentialDashMove[singleDirection][1] ] );
                }else {//direction is left
                    tileInterpreter.pluginCommand( 'DISPLAYOVERLAYTILE', [ '2386', '13', potentialDashMove[singleDirection][0], potentialDashMove[singleDirection][1] ] );
                }
                dashTileDisplaysLoc.push([potentialDashMove[singleDirection][0], potentialDashMove[singleDirection][1]])
            }
        }

        //Galv.SPAWN.overlap = 'none';//set back to default to prevent unwanted spawns
        //BMM.TRAN.level.scanEvents();

    }

    BMM.TIME.removeDashDisplays = function(resetingDisplays = false){

        dashDisplayed = false;
        var tileInterpreter = new Game_Interpreter();

        for (loc of dashTileDisplaysLoc){
            tileInterpreter.pluginCommand( 'REMOVETILE', [ loc[0], loc[1] ] );//removes all dash tiles
        }

        /*var dashDisplayDown = null;//archived and outdated
        var dashDisplayLeft = null;
        var dashDisplayUp = null;
        var dashDisplayRight = null;
        
        if(potentialDashMove["down"][0] != -1){
            dashDisplayDown = BMM.TRAN.level.eventAt(potentialDashMove["down"][0], potentialDashMove["down"][1]);
        }
        if(potentialDashMove["left"][0] != -1){
            dashDisplayLeft = BMM.TRAN.level.eventAt(potentialDashMove["left"][0], potentialDashMove["left"][1]);
        }
        if(potentialDashMove["up"][0] != -1){
            dashDisplayUp = BMM.TRAN.level.eventAt(potentialDashMove["up"][0], potentialDashMove["up"][1]);
        }
        if(potentialDashMove["right"][0] != -1){
            dashDisplayRight = BMM.TRAN.level.eventAt(potentialDashMove["right"][0], potentialDashMove["right"][1]);
        }

        if (dashDisplayDown != null){
            dashDisplayDown.destroy();
        }
        if (dashDisplayLeft != null){
            dashDisplayLeft.destroy();
        }
        if (dashDisplayUp != null){
            dashDisplayUp.destroy();
        }
        if (dashDisplayRight != null){
            dashDisplayRight.destroy();
        }
        BMM.TRAN.level.scanEvents();*/
    }

    function resetDashDisplay() {
        BMM.TIME.removeDashDisplays(true);
        BMM.TIME.displayPotentialDashMoves();

    }

    function calcDashPos(direction) {

        var moveDist = 0;
        var event;
        var maxDist = 5;
        var playerX = $gamePlayer.x;
        var playerY = $gamePlayer.y;
        var newX = playerX;
        var newY = playerY;
        potentialDashMove[direction] = [-1, -1]//set it to [-1, -1] in the event it cannot locate a place to dash to
        for(i = 1; i <= maxDist; i++){//check to see if you can move 5, 4, 3... spaces in direction

            //get location player is trying to dash to
            if (direction === "down") {
                newY = playerY + i;
            }
            else if (direction === "left") {
                newX = playerX - i;
            }
            else if (direction === "right") {
                newX = playerX + i;
            }
            else if (direction === "up") {
                newY = playerY - i;
            }

            if (newX < 0 || newY < 0 || newX >= BMM.TRAN.level.width || newY >= BMM.TRAN.level.height
                || !BMM.TRAN.level.isMapPassable(newX, newY, true)) {//trying to dash off map or hitting a wall. End loop, as you can't go further.
                break;
            }

            if (BMM.TRAN.level.isMapPassable(newX, newY)){//no wall or end of map here
                var landingZoneEvent = BMM.TRAN.level.eventAt(newX, newY);
                if (landingZoneEvent == null){//no event here. Can go here
                    moveDist = i;
                } else {//might be enemy event.
                    if (landingZoneEvent.type == "enemy" || landingZoneEvent.type == "boss"){//event is enemy. Must damage them
                        enemysInDashPath[direction].push(landingZoneEvent); // TODO: This is just temporary
                        //moveDist = i;//disabled until destroy() bug is fixed
                    } else if(landingZoneEvent.type == "trap"){
                        moveDist = i;
                    }
                }
            }
        }

        if (moveDist == 0){//no events are in the way, but something is (wall most likely). 
            return [-1, -1, -1];
        }

        //return pos for dash in given direction
        if (direction === "down") {
            return [playerX, playerY + moveDist, moveDist];
        }
        else if (direction === "left") {
            return [playerX - moveDist, playerY, moveDist];
        }
        else if (direction === "right") {
            return [playerX + moveDist, playerY, moveDist];
        }
        else {//direction == up
            return [playerX, playerY - moveDist, moveDist];
        }
    }

    function damageEnemysInWay(oldPlayerX, oldPlayerY, direction, moveDist) {
        //playerX and playerY are values before the dash occurs
        var amountOfEnemys = enemysInDashPath[direction].length;

        for(i = 0; i < amountOfEnemys; i++){
            //var eventInfo = JSON.parse(enemysInDashPath[direction][i].event().note);
            var currentEnemy = enemysInDashPath[direction][i];
            currentEnemy.damage(1);
        }
    }

    BMM.TIME.activateDash = function(direction) {
        if (potentialDashMove[direction][0] != -1){//if it equals -1, cannot dash in direction
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            BMM.TIME.removeDashDisplays();
            //BMM.TRAN.level.scanEvents();
            //checkNewPosForEnemy(direction);
            //BMM.TRAN.level.scanEvents();
            damageEnemysInWay(playerX, playerY, direction, potentialDashMove[direction][2]);//damages enemy's in way during dash
            $gamePlayer.locate(potentialDashMove[direction][0], potentialDashMove[direction][1]);//move player to new spot
            AudioManager.playSe({name: 'Warp', pan: 0, pitch: 100, volume: 100});
        }
    }

    function checkNewPosForEnemy(direction) {//Not working due to destroy() bug
        var dashX = potentialDashMove[direction][0];
        var dashY = potentialDashMove[direction][1];

        var possibleEnemy = BMM.TRAN.level.eventAt(dashX, dashY);
        if (possibleEnemy == null){//no enemy to move. Return
            return;
        }

        //player dashed ontop an enemy. Push them back, or kill them
        var nextSpace;
        if (direction === "down") {
            nextSpace = BMM.TRAN.level.eventAt(dashX, dashY + 1);
        }
        else if (direction === "left") {
            nextSpace = BMM.TRAN.level.eventAt(dashX - 1, dashY);
        }
        else if (direction === "right") {
            nextSpace = BMM.TRAN.level.eventAt(dashX + 1, dashY);
        }
        else {//direction == up
            nextSpace = BMM.TRAN.level.eventAt(dashX, dashY - 1);
        }

        console.log("type is: " + String(possibleEnemy.type));

        if (nextSpace == null){//nothing is in the way. Move enemy here.
            
            if (direction === "down") {
                possibleEnemy.move(0, 1);
            }
            else if (direction === "left") {
                possibleEnemy.move(-1, 0);
            }
            else if (direction === "right") {
                possibleEnemy.move(1, 0);
            }
            else {//direction == up
                possibleEnemy.move(0, -1);
                console.log("movedr enemy up");
            }

        } else {//cannot move enemy here. Insta-kill them
            possibleEnemy.death();
            console.log("DEATH COMES");
        }

    }

    BMM.TIME.checkDashPossible = function(direction) {
        if (potentialDashMove[direction][0] != -1) {
            return true;
        }

        return false;
    }
    //##############################DASH END##########################################

    class Time {
        constructor() {
            this.d = new Date;
            this.startTime = this.d.getTime();
            this.offset = 0;
            this.offsetDate = null;
        }
        deltaTime() {
            if (this.offsetDate != null) {
                this.offset += this.offsetDate.getTime() - this.d.getTime();
                this.offsetDate = null;
            }
            this.d = new Date;
            return this.d.getTime() - this.startTime - this.offset;
        }
        paused() {
            this.offsetDate = new Date;
            return this.d.getTime() - this.startTime - this.offset;
        }
        get() {
            if (BMM.GLOBAL.pauseTime) {
                return this.paused();
            } else {
                return this.deltaTime();
            }
        }
    }

    var spriteSwaps = [];
    var mapspaceImages = [];
    var mapspaceFIFO = [];
    var reservedImageIDs = null;
    var maxImages = 25; // IMAGE IDs 40-64 are RESERVED!

    function initReservedIDs() {
        reservedImageIDs = {};
        for (i = 40; i < 40 + maxImages; i++) {
            reservedImageIDs[i] = false;
        }
    }

    class TempSpriteSwap extends Time {
        constructor(ev, newimg, newind, oldimg, oldind, exp) {
            super();
            this.event = ev;
            this.oldimg = oldimg;
            this.oldind = oldind;
            this.event.setImage(newimg, newind);
            this.expiry = exp;
        }
        update() {
            if (this.get() >= this.expiry) {
                this.remove();
                return true;
            } else {
                return false;
            }
        }
        remove() {
            this.event.setImage(this.oldimg, this.oldind);
        }
    }

    class TempMapImage extends Time {
        constructor(ev, dir, xs, ys, op, exp) {
            super();
            this.event = ev;
            this.img = dir;
            this.scale = [xs, ys];
            this.opacity = op;
            this.expiry = exp;
            this.id = null;
            for (var val in reservedImageIDs) {
                if (!reservedImageIDs[val]) {
                    this.id = val;
                    reservedImageIDs[val] = true;
                    break;
                }
            }
        }
        update() {
            if (this.get() >= this.expiry) {
                this.remove();
                return true;
            } else {
                $gameScreen.erasePicture(this.id);
                $gameScreen.showPicture(this.id, this.img, 1, this.event.screenX() * $gameMap.zoom.x, (this.event.screenY() * $gameMap.zoom.y) - 90, this.scale[0], this.scale[1], this.opacity, 0);
                return false;
            }
        }
        remove() {
            $gameScreen.erasePicture(this.id);
            reservedImageIDs[this.id] = false;
        }
    }

    BMM.TIME.pushSpriteSwap = function(ev, path, ind, oldpath, oldind, exp) { // event, new image path, new image index, time to expire (ms)
        spriteSwaps.push(new TempSpriteSwap(ev, path, ind, oldpath, oldind, exp));
    }

    BMM.TIME.pushMapImage = function(ev, path, xscale, yscale, opacity, expiry) {
        if (mapspaceImages.length < maxImages) {
            mapspaceImages.push(new TempMapImage(ev, path, xscale, yscale, opacity, expiry));
        } else {
            mapspaceFIFO.push([ev, path, xscale, yscale, opacity, expiry]);
        }
    }

    BMM.TIME.expiry = function() {
        if (reservedImageIDs == null) initReservedIDs();
        for (var i = 0; i < spriteSwaps.length; i++) {
            if (spriteSwaps[i].update()) spriteSwaps.splice(i,1);
        }
        while (mapspaceImages.length < maxImages && mapspaceFIFO.length > 0) {
            var temp = mapspaceFIFO.shift();
            mapspaceImages.push(new TempMapImage(temp[0], temp[1], temp[2], temp[3], temp[4], temp[5]));
        }
        for (var i = 0; i < mapspaceImages.length; i++) {
            if (mapspaceImages[i].update()) mapspaceImages.splice(i,1);
        }
    }

    BMM.TIME.purgeExpiry = function() {
        for (var i = 0; i < spriteSwaps.length; i++) {
            spriteSwaps[i].remove();
        }
        spriteSwaps = [];
        for (var i = 0; i < mapspaceImages.length; i++) {
            mapspaceImages[i].remove();
        }
        mapspaceImages = [];
        initReservedIDs();
    }

    BMM.TIME.t = new Time();
    BMM.TIME.perTurn = 4000; // ms
    BMM.TIME.turnCount = 1;
    BMM.TIME.nextTurn = -1;

    BMM.TIME.time = function() {
        return BMM.TIME.t.get();
    }

    BMM.TIME.turnTimer = function() {
        //console.log("Time: " + String(BMM.TIME.time()));
        if (BMM.TIME.nextTurn === -1){
            BMM.TIME.reset();
        }
        // SPECTRE SCREEN DARKEN ABILITY
        if (BMM.PT.isBoss() && BMM.PT.bossClass() == "spectre" && BMM.PT.bossStage() == 3 && BMM.PT.bossHP() > 0) {
            var p = -255 * (1 - Math.pow(1 - ((BMM.TIME.perTurn - BMM.TIME.remaining()) / BMM.TIME.perTurn), 2));
            $gameScreen.startTint([p, p, p, 0], 1);
        }
        if (BMM.TIME.time() >= BMM.TIME.nextTurn) {
            console.log("TIME OUT");
            BMM.HYB.advanceTurn();
        }
    }

    BMM.TIME.remaining = function() {
        return BMM.TIME.nextTurn - BMM.TIME.time();
    }

    BMM.TIME.reset = function() {
        //console.log("Var set to: " + String(bombActive));
        /*if (bombActive){//archived and outdated
            checkBombStatus();
            console.log("Checked Bomb status");
        }*/
        if (dashDisplayed){
            console.log("updated dash display");
            resetDashDisplay();
        }
        // SPECTRE SCREEN DARKEN RESET
        if (BMM.PT.isBoss() && BMM.PT.bossClass() == "spectre") {
            $gameScreen.startTint([0,0,0,0],1);
        }
        // DECIEVER TIME MECHANIC: half time after stage 1
        if (BMM.PT.isBoss() && BMM.PT.bossClass() == "deceiver" && BMM.PT.bossStage() > 1 && BMM.PT.bossHP() > 0) {
            BMM.TIME.nextTurn = BMM.TIME.time() + BMM.TIME.perTurn / 2;
        } else {
            BMM.TIME.nextTurn = BMM.TIME.time() + BMM.TIME.perTurn;
        }
        BMM.TIME.turnCount++;
    }
})();