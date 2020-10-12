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

    var bombLocation = [-1, -1];
    var bombActive = false;
    var bombObject = null;

    class Time {
        constructor() {
            this.d = new Date;
            this.startTime = this.d.getTime();
        }
        getTime() { // returns time since start of program in ms
            this.d = new Date;
            return this.d.getTime() - this.startTime;
        }
    }

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

        BMM.TRAN.level.scanEvents();
        bombObject = BMM.TRAN.level.eventAt(bombLocation[0], bombLocation[1]);
        AudioManager.playSe({name: 'BombDroppedEdited', pan: 0, pitch: 100, volume: 100});
    }

    function checkBombStatus() {
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
    }

    //##########################BOMB END#####################################    


    //##########################DASH START#####################################
    BMM.TIME.displayPotentialDashMoves = function() {

        dashDisplayed = true;
        enemysInDashPath = {down: [], "left": [], "right": [], "up": []};//reset for new calculations

        Galv.SPAWN.overlap = 'all';

        for(singleDirection of allDirections) {//display dash locations, if available
            potentialDashMove[singleDirection] = calcDashPos(singleDirection);
            if (potentialDashMove[singleDirection][0] != -1){//if it is -1, do not spawn display
                Galv.SPAWN.event(2, potentialDashMove[singleDirection][0], potentialDashMove[singleDirection][1]);
            }
        }

        Galv.SPAWN.overlap = 'none';//set back to default to prevent unwanted spawns
        BMM.TRAN.level.scanEvents();

    }

    BMM.TIME.removeDashDisplays = function(resetingDisplays = false){

        dashDisplayed = false;
        var dashDisplayDown = null;
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
        BMM.TRAN.level.scanEvents();
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
        if (potentialDashMove[direction][0] != -1){//if it equals -1, canmnot dash in direction
            var playerX = $gamePlayer.x;
            var playerY = $gamePlayer.y;
            BMM.TIME.removeDashDisplays();
            BMM.TRAN.level.scanEvents();
            //checkNewPosForEnemy(direction);
            //BMM.TRAN.level.scanEvents();
            damageEnemysInWay(playerX, playerY, direction, potentialDashMove[direction][2]);//damages enemy's in way during dash
            $gamePlayer.locate(potentialDashMove[direction][0], potentialDashMove[direction][1]);//move player to new spot
            AudioManager.playSe({name: 'WarpEdited', pan: 0, pitch: 100, volume: 100});
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

    //##############################SPIKE START########################################



    //##############################SPIKE END########################################

    BMM.TIME.t = new Time();
    var nextTurn = -1;
    var timePerTurn = 5000; // milliseconds

    BMM.TIME.time = function() {
        return BMM.TIME.t.getTime();
    }

    BMM.TIME.turnTimer = function() {
        //console.log("Time: " + String(BMM.TIME.time()));
        if (nextTurn === -1){
            nextTurn = BMM.TIME.time() + timePerTurn;
        }
        if (BMM.TIME.time() >= nextTurn) {
            console.log("TIME OUT");
            BMM.TIME.resetTimer();
        }
    }

    BMM.TIME.setTimePerTurn = function(newTime) {
        timePerTurn = newTime;
    }

    BMM.TIME.resetTimer = function() {
        BMM.TRAN.advanceTurn();
        //console.log("Var set to: " + String(bombActive));
        if (bombActive){
            checkBombStatus();
            console.log("Checked Bomb status");
        }
        if (dashDisplayed){
            console.log("updated dash display");
            //resetDashDisplay();
        }
        nextTurn = BMM.TIME.time() + timePerTurn;
    }
})();