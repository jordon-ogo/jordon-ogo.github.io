/*:
* @plugindesc HealthBar
* @author mrcopra
* 
* @help 
* 
*/
 (function() {
	 

//////////////////////////////////////////////////////////////////////////////////////

var _Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
_Scene_Map_start.call(this);
this._myWindow = new My_Window(100,100);
this.addWindow(this._myWindow);
};

var _Scene_Map_update = Scene_Map.prototype.update;

Scene_Map.prototype.update = function() {
_Scene_Map_update.call(this);
this._myWindow.refresh();
};



 function My_Window() {
 	this.initialize.apply(this, arguments);
 }

    My_Window.prototype = Object.create(Window_Base.prototype);
    My_Window.prototype.constructor = My_Window;


    My_Window.prototype.initialize = function(x, y) {
      Window_Base.prototype.initialize.call(this, 0, 0, this.windowWidth(), this.windowHeight());
this._value = -1;
this.refresh();
    };

My_Window.prototype.refresh = function(){

      this.contents.clear();
    this.drawActorHp($gameParty.leader(), 0, 0, 200)
};

    My_Window.prototype.windowWidth = function(){
    	return 240;
    };
       My_Window.prototype.windowHeight = function(){
    	return 80;
    };
	
///////////////////////////////////////////////////////////////////////////////////////////////	 
 })();