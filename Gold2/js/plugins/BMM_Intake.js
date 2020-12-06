//=============================================================================
// BMM_Intake.js
//=============================================================================
var Imported = Imported || {};
Imported.BMM_Intake = true;
var BMM = BMM || {};
BMM.IN = BMM.IN || {};

/*:
 * @plugindesc Handles keyboard input and ability cooldowns
 *
 * @author NavrasK
 * 
 * [parameters]
 *
 * @help Call BMM.IN.getInput() to read and handle keyboard input
 * TERMS OF USE: No reuse without express permission of author
 * COMPATIBILITY: No known issues
 */
 
(function() {
	var parameters = PluginManager.parameters("BMM_Intake");

	class Key {
        constructor(keyString) {
			this.val = keyString.toString();
			this.isHeld = false;
            this.lock = false;
        }
        check() {
			if (Input.isPressed(this.val) && !this.isHeld) {
				this.isHeld = true;
			}
			if (!Input.isPressed(this.val) && this.isHeld) {
				this.isHeld = false;
			}
		}
    }

    class MoveKey extends Key {
		constructor(keyString, vector, direction) {
            super(keyString);
            this.x = vector[0];
            this.y = vector[1];
            this.dir = direction;
            this.exhausted = false;
		}
	}
	
	class AbilityKey extends Key {
		constructor(keyString, ability, cooldown) {
			super(keyString);
			this.ability = ability.toString();
			this.toggledOn = false;
			this.enabled = true;
			this.cd = cooldown;
			this.cdRemaining = 0;
		}
		toggle() {
			if (this.enabled) {
				this.toggledOn = !this.toggledOn;
				//console.log(this.ability + " toggled " + ((this.toggledOn) ? "on" : "off"));

				if (this.toggledOn == true && this.ability == "dash"){//toggled on and dash ability
					BMM.TIME.displayPotentialDashMoves();
					BMM.IN.zLevel = 1.25;
					BMM.GLOBAL.interpreter.pluginCommand("MapZoom", ["set", BMM.IN.zLevel, "duration", 15]);
				} else if (this.toggledOn == false && this.ability == "dash"){//remove dash location display
					//console.log("unspawn dash now");
					BMM.TIME.removeDashDisplays();
					BMM.IN.zLevel = 1.5;
					BMM.GLOBAL.interpreter.pluginCommand("MapZoom", ["set", BMM.IN.zLevel, "duration", 30]);
				}

				if (this.toggledOn == true && this.ability == "bomb"){//toggle on and bomb ability
					BMM.TIME.displayPotentialBomb();
					p_img = 6;
					$gamePlayer.setImage("fisherman", p_img);
				} else if (this.toggledOn == false && this.ability == "bomb"){//remove bomb display
					BMM.TIME.removePotentialBomb();
					p_img = 0;
					$gamePlayer.setImage("fisherman", p_img);
				}

			} else {
				this.toggledOn = false;
				//console.log(this.cdRemaining.toString() + " turns remaining for " + this.ability);
			}
		}
		useAbility(moveVal) {//moveVal is the direction player is moving in
			if (this.enabled) {
				//console.log(this.ability + " used");

				if (this.ability == "dash") {
					if (BMM.TIME.checkDashPossible(moveVal) == true){
						BMM.TIME.activateDash(moveVal);//move with dash when move button (up, down, left, right) is pressed
						BMM.IN.zLevel = 1.5;
						BMM.GLOBAL.interpreter.pluginCommand("MapZoom", ["set", BMM.IN.zLevel, "duration", 30]);
					} else{
						return;//cannot dash due to wall in way. Do not use ability
					}
				}else if (this.ability == "bomb"){
					BMM.TIME.activateBomb();
					p_img = 0;
					$gamePlayer.setImage("fisherman", p_img);
				}else {
					throw 'Invalid move passed to useAbility';
				}
				
				this.enabled = false;
				this.cdRemaining = this.cd;
			}
			this.toggledOn = false;
		}
		advanceCooldown() {
			if (this.cdRemaining > 0) {
				this.cdRemaining -= 1;
			}
			if (this.cdRemaining <= 0) {
				this.cdRemaining = 0;
				this.enabled = true;
			}
		}
	}

    // 2 = down, 4 = left, 6 = right, 8 = up
    var mvkeys = [ // Keycode, movement vector, direction
        new MoveKey("up",    [0, -1], 8),
        new MoveKey("down",  [0, 1],  2),
        new MoveKey("right", [1, 0],  6),
		new MoveKey("left",  [-1, 0], 4),
		new MoveKey("q",   [0, 0], 0)
	];
	
	var abkeys = [ // Keycode, ability name, cooldown + 1
		new AbilityKey("num1", "bomb", 9),
		new AbilityKey("num2", "dash", 7)
	];

	BMM.IN.getBombCooldown = function() {
		return abkeys[0].cdRemaining;
	}

	BMM.IN.getDashCooldown = function() {
		return abkeys[1].cdRemaining;
	}

	BMM.IN.getBombToggled = function() {
		return abkeys[0].toggledOn;
	}

	BMM.IN.getDashToggled = function() {
		return abkeys[1].toggledOn;
	}

	BMM.IN.advanceAbilities = function() {
		for (var ab of abkeys) {
			ab.advanceCooldown();
		}
	}

	BMM.IN.resetAbilities = function() {
		for (var ab of abkeys) {
			ab.cdRemaining = 0;
			if (ab.toggledOn) ab.toggle();
		}
	}

	function getMoveInput() {
		for (var key of mvkeys){
			key.check();
        }
        if (mvkeys.every((val) => val.lock === false)) {
            for (var key of mvkeys){
                if (key.isHeld){
                    key.lock = true;
                    //console.log(key.val + " locked");
                    break;
                }
            }
        } else {
            for (var key of mvkeys){
                if (key.lock && !key.isHeld){
                    key.lock = false;
                    key.exhausted = false;
                }
            }
        }
	}

	function getAbilityInput() {
		for (var ab of abkeys){
			if (ab.ability == "bomb" && !BMM.GLOBAL.bomb) continue;
			if (ab.ability == "dash" && !BMM.GLOBAL.dash) continue;
			ab.check();
			if (ab.isHeld && !ab.lock) {
				ab.lock = true;
				ab.toggle();
			}
			if (!ab.isHeld && ab.lock) {
				ab.lock = false;
			}
		}
	}

    BMM.IN.getInput = function() {
		if (BMM.GLOBAL.disableInput == false) {
			getAbilityInput();
			getMoveInput();
        	handleInput();
		}
	}
	
	var p_img = 0;
	BMM.IN.zLevel = 1.5;

    // As long all enemy calculations can be handled in ~50ms this shouldn't require a speed limit
	function handleInput() {
		var willUseDash = abkeys[1].toggledOn;
		for (var move of mvkeys) {
			if (move.lock && !move.exhausted) {
				if (move.val == "q") {
					BMM.HYB.advanceTurn();
					//BMM.HYB.advanceReady = true;
					move.exhausted = true;
					break;
				}
				$gamePlayer.setDirection(move.dir);
				if (BMM.TRAN.level.isPassable($gamePlayer.x + move.x, $gamePlayer.y + move.y) || (willUseDash && BMM.TIME.checkDashPossible(move.val))) {//if player uses dash and CAN, they can move
					for (var action of abkeys) {
						if (action.toggledOn) {
							action.useAbility(move.val);
						}
					}
					if (willUseDash === false) {//player is not dashing, so move normally
						//$gamePlayer.locate($gamePlayer.x + move.x, $gamePlayer.y + move.y);
						$gamePlayer.setMoveSpeed(4.75);
						//$gamePlayer.setPattern(pat);
						//pat = (pat === 0) ? 2 : 0;
						$gamePlayer.moveStraight(move.dir);
					}
					BMM.GLOBAL.interpreter.pluginCommand("CAM", [$gamePlayer.x.toString(), $gamePlayer.y.toString()]);
					BMM.HYB.advanceTurn();
					//BMM.HYB.advanceReady = true;
				} else {
					var target = BMM.TRAN.level.eventAt($gamePlayer.x + move.x, $gamePlayer.y + move.y);
					if (target != null) {
						if (target.type == "enemy" || target.type == "boss") {
							BMM.TIME.pushSpriteSwap($gamePlayer, "fisherman", 5, "fisherman", p_img, 150);
							if (target.type == "boss" && target.class == "radiant") {
								// TODO - JORDON / CODY: Play metal hit sound
								AudioManager.playSe({name: "RadiantImmune", pan: 0, pitch: 100, volume: 55});
								if (!BMM.PT.radiantTriedPunching) {
									BMM.PT.radiantTriedPunching = true;
									$gameMessage.setFaceImage("Evil", 4);
                					$gameMessage.setBackground(0);
									$gameMessage.setPositionType(2);
									$gameMessage.add("Your pathetic punches are futile against \nmy blessed armour!");
									$gameMessage.newPage();
									$gameMessage.add("Even your \\C[1]strongest attacks\\C will barely \nleave a mark!");
								}
							} else {
								target.damage(1);
							}
							BMM.HYB.advanceTurn();
						}
					}
				}
				move.exhausted = true;
			}
		}
	}
 })();