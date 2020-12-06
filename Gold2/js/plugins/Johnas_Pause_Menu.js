/*=============================================================================
 * Johnas' Pause Menu Plugin
 * by Johnas Wong
 * Date: October 28, 2020 
 * Johnas_Pause_Menu.js
 * 
 * File dependencies:
 *   - BMM_TimingBelt.js
 *   - BMM_Globals.js
 *   - BMM_Transmission.js
 *   - BMM_Hybrid.js
 * 
 * Resources:
 *      - Based on code from Poryg the RPG Maker
 *        https://www.youtube.com/watch?v=nLCBVBy4dcY&list=PL3Fv4Z54bWaGjcORlYg6TKsnoQDf2no3d&index=4&t=2s
 *=============================================================================*/
/*:
 * @plugindesc Enables/replaces the default pause menu
 * @author Johnas
 */

var inPauseMenu = false;

_alias_scene_map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() 
{



    ImageManager.reservePicture( 'pause_map_smaller' );
    ImageManager.loadPicture( 'pause_map_smaller' );
    _alias_scene_map_update.call( this );


    // in a pause menu, 'esc' should pop that menu --> currently not working
    // if( Input.isTriggered( 27 ) && inPauseMenu == true )
    if( Input.isTriggered( 'cancel' ) || TouchInput.isCancelled() || Input.isTriggered( 'p' ) )
    {
        //console.log( "escape pressed" );
    }



    if( Input.isTriggered( 'cancel' ) || TouchInput.isCancelled() || Input.isTriggered( 'p' ) ) 
    {
        SceneManager.push( Scene_CustomMenu );
        inPauseMenu = true;
        BMM.GLOBAL.inMenu = true;
    }

    // if in the level area (not in a menu) set the in pause menu boolean to false

    // i dont' think this is right vv
    // if( SceneManager._scene instanceof Scene_Map && inPauseMenu == true )
    if( SceneManager._scene instanceof Scene_Map )
    {
        // console.log( "on level screen" );
        inPauseMenu = false;
    }
};


/**
 * https://forums.rpgmakerweb.com/index.php?threads/how-to-display-an-image-in-a-window.50171/
 * User Hudell ( second comment )
 */
Window_Base.prototype.drawPicture = function( filename, x, y ) 
{    
    var bitmap = ImageManager.loadPicture( filename );    
    this.contents.blt( bitmap, 0, 0, bitmap._canvas.width, bitmap._canvas.height, x, y );
};


function Scene_CustomMenu() 
{
    this.initialize.apply( this, arguments );
}


Scene_CustomMenu.prototype = Object.create( Scene_MenuBase.prototype );
Scene_CustomMenu.prototype.constructor = Scene_CustomMenu;

Scene_CustomMenu.prototype.initialize = function() 
{
    Scene_MenuBase.prototype.initialize.call( this );
};


Scene_CustomMenu.prototype.create = function() 
{
    Scene_MenuBase.prototype.create.call( this );

    this._customSelectableWindow = new Window_CustomSelectable( 20, 150, 180, 180 );
    this._customSelectableWindow.hide();
    this._customSelectableWindow.select( 0 );
    this._customSelectableWindow.setHandler( "ok", this.command1.bind( this ) );
    this._customSelectableWindow.setHandler( "cancel", this.popScene.bind( this ) );
    this.addWindow( this._customSelectableWindow );
    
    this._customCommandWindow = new Window_CustomCommand( 20, 150 );
    this._customCommandWindow.setHandler( "command1", this.command1.bind( this ) );
    this._customCommandWindow.setHandler( "command2", this.command2.bind( this ) );
    this._customCommandWindow.setHandler( "command3", this.command3.bind( this ) );
    this._customCommandWindow.setHandler( "command4", this.command4.bind( this ) );
    this.addWindow( this._customCommandWindow );

    this._customHorzCommandWindow = new Window_CustomHorzCommand( 20, 150 );
    this._customHorzCommandWindow.setHandler( "command1", this.command1.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command2", this.command2.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command3", this.command3.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command4", this.command4.bind( this ) );
    this.addWindow( this._customHorzCommandWindow );

    // this._pictureWindow = new Window_Custom( 260, 50, 1000, 1000 );
    // ImageManager.reservePicture( 'pause_map_smaller' );
    // ImageManager.loadPicture( 'pause_map_smaller' );
    // this.addWindow( this._pictureWindow );
}


/**
 * This is each of the different options' commands
 */
// Return to game screen WORKING
Scene_CustomMenu.prototype.command1 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else if( this._customHorzCommandWindow.visible ) this._customHorzCommandWindow.activate();
    else this._customSelectableWindow.activate();
    //console.log( "Returning to game screen" );
    inPauseMenu = false;
    SceneManager.goto( Scene_Map );
}


// Change timer length WORKING
Scene_CustomMenu.prototype.command2 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    //console.log( "Changing timer length" );
    //console.log( $gameVariables.value( 1 ) );
    SceneManager.push( Accessibility_Menu );
}


// Reload current stage WORKING
// in hybrid under player damage
Scene_CustomMenu.prototype.command3 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    SceneManager.push( Restart_Yes_No_Menu );
}


// Return to main menu WORKING
Scene_CustomMenu.prototype.command4 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    SceneManager.push( MainMenu_Yes_No_Menu );
}


Scene_CustomMenu.prototype.start = function() 
{
    Scene_MenuBase.prototype.start.call( this );
    this._customSelectableWindow.refresh();
    this._customCommandWindow.refresh();
};


Scene_CustomMenu.prototype.update = function() 
{
    Scene_MenuBase.prototype.update.call( this );
    // if( Input.isTriggered( "cancel" ) ) this.popScene();
    if( Input.isTriggered( "cancel" ) ) {
        //console.log("esc pressed");
    }
}


function Window_Custom() 
{
    this.initialize.apply( this, arguments );
}


Window_Custom.prototype = Object.create( Window_Base.prototype );
Window_Custom.prototype.constructor = Window_Custom;

Window_Custom.prototype.initialize = function( x, y, width, height ) 
{
    Window_Base.prototype.initialize.call( this, x, y, width, height );
    this.opacity = 0;
    this.refresh();
}


Window_Custom.prototype.refresh = function()
{
    this.contents.clear();
    //console.log( "Drawing map:" );
    this.drawPicture( 'pause_map_smaller', 0, 0 );
}


function Window_CustomSelectable() 
{
    this.initialize.apply( this, arguments );
}


Window_CustomSelectable.prototype = Object.create( Window_Selectable.prototype );
Window_CustomSelectable.prototype.constructor = Window_Selectable;

Window_CustomSelectable.prototype.initialize = function( x, y, width, height ) 
{
    Window_Selectable.prototype.initialize.call( this, x, y, width, height );
    this.refresh();
    this.hide();
}


Window_CustomSelectable.prototype.maxItems = function() 
{
    return 3;
}


Window_CustomSelectable.prototype.maxPageRows = function() 
{
    return 2;
}


Window_CustomSelectable.prototype.maxPageItems = function() 
{
    return this.maxPageRows() * this.maxCols();
}


Window_CustomSelectable.prototype.drawItem = function( index ) 
{
    var itemRect = this.itemRect( index );
}


Window_CustomSelectable.prototype.itemHeight = function() 
{
    return( this.height - this.padding * 2 ) / this.maxPageRows();
};


function Window_CustomCommand() 
{
    this.initialize.apply( this, arguments );
}


Window_CustomCommand.prototype = Object.create( Window_Command.prototype );
Window_CustomCommand.prototype.constructor = Window_CustomCommand;

Window_CustomCommand.prototype.initialize = function( x, y ) 
{
    Window_Command.prototype.initialize.call( this, x, y );
    this.opacity = 0;
} 


Window_CustomCommand.prototype.makeCommandList = function() 
{
    this.addCommand( "Return to game", "command1" );
    this.addCommand( "Difficulty Options", "command2" );
    this.addCommand( "Restart stage", "command3" );
    this.addCommand( "Return to main menu", "command4" );
};


Window_CustomCommand.prototype.drawItem = function( index ) 
{
    var itemRect = this.itemRect( index );
    Window_Command.prototype.drawItem.call( this, index );
}


Window_CustomCommand.prototype.windowWidth = function() 
{
    return Graphics.boxWidth;
}


Window_CustomCommand.prototype.windowHeight = function() 
{
    return Graphics.boxHeight;
}


Window_CustomCommand.prototype.itemRect = function( index ) 
{
    var rect = {};
    if( index == 0 ) 
    {
        rect.x = 0;
        rect.y = 0;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 1 ) {
        rect.x = 0;
        rect.y = 50;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 2 ) {
        rect.x = 0;
        rect.y = 100;
        rect.width = 260;
        rect.height = 40;
    } else {
        rect.x = 0;
        rect.y = 150;
        rect.width = 260;
        rect.height = 40;
    }
    return rect;
};


function Window_CustomHorzCommand() 
{
    this.initialize.apply( this, arguments );
}


Window_CustomHorzCommand.prototype = Object.create( Window_HorzCommand.prototype );
Window_CustomHorzCommand.prototype.constructor = Window_CustomHorzCommand;

Window_CustomHorzCommand.prototype.initialize = function( x, y ) 
{
    Window_HorzCommand.prototype.initialize.call( this, x, y );
    this.hide();
}


Window_CustomHorzCommand.prototype.makeCommandList = function() 
{
    this.addCommand( "Return to game", "command1" );
    this.addCommand( "Difficulty Options", "command2" );
    this.addCommand( "Restart stage", "command3", false );
    this.addCommand( "Return to main menu", "command4", false );
};


Window_CustomHorzCommand.prototype.windowWidth = function() 
{
    return Graphics.boxWidth;
}




/**
 * Accessibility menu, timer length change or change hearts amount
 * - 3 options
 *      - Change turn timer length
 *      - Change max hearts amount
 *      - Return to previous screen
 */
function Accessibility_Menu() 
{
    this.initialize.apply( this, arguments );
}


Accessibility_Menu.prototype = Object.create( Scene_MenuBase.prototype );
Accessibility_Menu.prototype.constructor = Accessibility_Menu;

Accessibility_Menu.prototype.initialize = function() 
{
    Scene_MenuBase.prototype.initialize.call( this );
};


Accessibility_Menu.prototype.create = function() 
{
    Scene_MenuBase.prototype.create.call( this );
    this._customSelectableWindow = new Window_Custom_AccessibilitySelectable( 0, 0, 180, 180 );
    this._customSelectableWindow.hide();

    this._customSelectableWindow.setHandler( "ok", this.command1.bind( this ) );
    this._customSelectableWindow.setHandler( "cancel", this.popScene.bind( this ) );
    this.addWindow( this._customSelectableWindow );
    
    this._customCommandWindow = new Window_Custom_AccessibilityCommand( 0, 0 );
    this._customCommandWindow.setHandler( "command1", this.command1.bind( this ) );
    this._customCommandWindow.setHandler( "command2", this.command2.bind( this ) );
    this._customCommandWindow.setHandler( "command3", this.command3.bind( this ) );

    this.addWindow( this._customCommandWindow );

    this._customHorzCommandWindow = new Window_Custom_AccessibilityHorzCommand( 0, 0 );
    this._customHorzCommandWindow.setHandler( "command1", this.command1.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command2", this.command2.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command3", this.command3.bind( this ) );

    this.addWindow( this._customHorzCommandWindow );
}


Accessibility_Menu.prototype.command1 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else if( this._customHorzCommandWindow.visible ) this._customHorzCommandWindow.activate();
    else this._customSelectableWindow.activate();
    //console.log( "Timer now 8 sec" );
    SceneManager.push( Change_Timer_Length_Menu );
}


Accessibility_Menu.prototype.command2 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    //console.log( "Timer now 4 sec" );
    SceneManager.push( Change_Hearts_Amount_Menu );
}


Accessibility_Menu.prototype.command3 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    //console.log( "Timer now 2 sec" );
    this.popScene();
}


Accessibility_Menu.prototype.start = function() 
{
    Scene_MenuBase.prototype.start.call( this );
    this._customSelectableWindow.refresh();
    this._customCommandWindow.refresh();
};


Accessibility_Menu.prototype.update = function() 
{
    Scene_MenuBase.prototype.update.call( this );
    if( Input.isTriggered( "cancel" ) ) this.popScene();
}


function Window_Custom_Accessibility() 
{
    this.initialize.apply( this, arguments );
}


Window_Custom_Accessibility.prototype = Object.create( Window_Base.prototype );
Window_Custom_Accessibility.prototype.constructor = Window_Custom_Accessibility;

Window_Custom_Accessibility.prototype.initialize = function( x, y, width, height ) 
{
    Window_Base.prototype.initialize.call( this, x, y, width, height );
}


Window_Custom_Accessibility.prototype.drawAllItems = function() 
{
    this.contents.clear();
    this.drawText( $gameVariables.value( 2 ), 0, 0, this.width - this.padding * 2, "center" );
}


function Window_Custom_AccessibilitySelectable() 
{
    this.initialize.apply( this, arguments );
}


Window_Custom_AccessibilitySelectable.prototype = Object.create( Window_Selectable.prototype );
Window_Custom_AccessibilitySelectable.prototype.constructor = Window_Selectable;

Window_Custom_AccessibilitySelectable.prototype.initialize = function( x, y, width, height ) {
    Window_Selectable.prototype.initialize.call( this, x, y, width, height );
    this.refresh();
    this.hide();
}


Window_Custom_AccessibilitySelectable.prototype.maxItems = function() 
{
    return 3;
}


Window_Custom_AccessibilitySelectable.prototype.maxPageRows = function() 
{
    return 2;
}


Window_Custom_AccessibilitySelectable.prototype.maxPageItems = function() 
{
    return this.maxPageRows() * this.maxCols();
}


Window_Custom_AccessibilitySelectable.prototype.drawItem = function( index ) 
{
    var itemRect = this.itemRect( index );
}


Window_Custom_AccessibilitySelectable.prototype.itemHeight = function() 
{
    return( this.height - this.padding * 2 ) / this.maxPageRows();
};


function Window_Custom_AccessibilityCommand() 
{
    this.initialize.apply( this, arguments );
}


Window_Custom_AccessibilityCommand.prototype = Object.create( Window_Command.prototype );
Window_Custom_AccessibilityCommand.prototype.constructor = Window_Custom_AccessibilityCommand;

Window_Custom_AccessibilityCommand.prototype.initialize = function( x, y ) 
{
    Window_Command.prototype.initialize.call( this, x, y );
    this.opacity = 0;
} 


Window_Custom_AccessibilityCommand.prototype.makeCommandList = function() 
{
    this.addCommand( "Change turn timer length", "command1" );
    this.addCommand( "Change amount of hearts", "command2" );
    this.addCommand( "Back", "command3" );
};


Window_Custom_AccessibilityCommand.prototype.drawItem = function( index ) 
{
    var itemRect = this.itemRect( index );
    Window_Command.prototype.drawItem.call( this, index );
}


Window_Custom_AccessibilityCommand.prototype.windowWidth = function() 
{
    return Graphics.boxWidth;
}


Window_Custom_AccessibilityCommand.prototype.windowHeight = function() 
{
    return Graphics.boxHeight;
}


Window_Custom_AccessibilityCommand.prototype.itemRect = function( index ) 
{
    var rect = {};
    if( index == 0 ) 
    {
        rect.x = 20;
        rect.y = 150;
        rect.width = 300;
        rect.height = 40;
    } else if( index == 1 ) {
        rect.x = 20;
        rect.y = 200;
        rect.width = 300;
        rect.height = 40;
    } else if( index == 2 ) {
        rect.x = 20;
        rect.y = 250;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 3 ) {
        rect.x = 20;
        rect.y = 300;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 4 ) {
        rect.x = 20;
        rect.y = 350;
        rect.width = 260;
        rect.height = 40;
    }


    return rect;
};


function Window_Custom_AccessibilityHorzCommand() 
{
    this.initialize.apply( this, arguments );
}


Window_Custom_AccessibilityHorzCommand.prototype = Object.create( Window_HorzCommand.prototype );
Window_Custom_AccessibilityHorzCommand.prototype.constructor = Window_Custom_AccessibilityHorzCommand;

Window_Custom_AccessibilityHorzCommand.prototype.initialize = function( x, y ) 
{
    Window_HorzCommand.prototype.initialize.call( this, x, y );
    this.hide();
}


Window_Custom_AccessibilityHorzCommand.prototype.makeCommandList = function() 
{
    this.addCommand( "Change turn timer length", "command1" );
    this.addCommand( "Change amount of hearts", "command2" );
    this.addCommand( "Back", "command3", false );
};


Window_Custom_AccessibilityHorzCommand.prototype.windowWidth = function() 
{
    return Graphics.boxWidth;
}








/**
 * Hearts amount change menu
 * - 6 options
 *      - (-2 Max HP) 5 Hearts
 *      - (-1 Max HP) 4 Hearts
 *      - (Default HP) 3 Hearts
 *      - (+1 Max HP) 2 Hearts
 *      - (+2 Max HP) 1 Hearts
 *      - Return to previous screen
 */
function Change_Hearts_Amount_Menu() 
{
    this.initialize.apply( this, arguments );
}


Change_Hearts_Amount_Menu.prototype = Object.create( Scene_MenuBase.prototype );
Change_Hearts_Amount_Menu.prototype.constructor = Change_Hearts_Amount_Menu;

Change_Hearts_Amount_Menu.prototype.initialize = function() 
{
    Scene_MenuBase.prototype.initialize.call( this );
};


Change_Hearts_Amount_Menu.prototype.create = function() 
{
    Scene_MenuBase.prototype.create.call( this );
    this._customSelectableWindow = new Window_Custom_HeartsSelectable( 0, 0, 180, 180 );
    this._customSelectableWindow.hide();
    switch( BMM.HYB.playerMaxHPmod )
    {
        case 2:
            this._customSelectableWindow.select( 0 );
            break;
        case 1:
            this._customSelectableWindow.select( 1 );
            break;
        case 0:
            this._customSelectableWindow.select( 2 );
            break;
        case -1:
            this._customSelectableWindow.select( 3 );
            break;
        case -2:
            this._customSelectableWindow.select( 4 );
            break;
    }


    this._customSelectableWindow.setHandler( "ok", this.command1.bind( this ) );
    this._customSelectableWindow.setHandler( "cancel", this.popScene.bind( this ) );
    this.addWindow( this._customSelectableWindow );
    
    this._customCommandWindow = new Window_Custom_HeartsCommand( 0, 0 );
    this._customCommandWindow.setHandler( "command1", this.command1.bind( this ) );
    this._customCommandWindow.setHandler( "command2", this.command2.bind( this ) );
    this._customCommandWindow.setHandler( "command3", this.command3.bind( this ) );
    this._customCommandWindow.setHandler( "command4", this.command4.bind( this ) );
    this._customCommandWindow.setHandler( "command5", this.command5.bind( this ) );
    this._customCommandWindow.setHandler( "command6", this.command6.bind( this ) );
    // this._customCommandWindow.setHandler( "command7", this.command5.bind( this ) );
    switch( BMM.HYB.playerMaxHPmod )
    {
        case 2:
            this._customCommandWindow.select( 0 );
            break;
        case 1:
            this._customCommandWindow.select( 1 );
            break;
        case 0:
            this._customCommandWindow.select( 2 );
            break;
        case -1:
            this._customCommandWindow.select( 3 );
            break;
        case -2:
            this._customCommandWindow.select( 4 );
            break;
    }


    this.addWindow( this._customCommandWindow );

    this._customHorzCommandWindow = new Window_Custom_HeartsHorzCommand( 0, 0 );
    this._customHorzCommandWindow.setHandler( "command1", this.command1.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command2", this.command2.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command3", this.command3.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command4", this.command4.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command5", this.command5.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command6", this.command6.bind( this ) );
    // this._customHorzCommandWindow.setHandler( "command7", this.command5.bind( this ) );
    switch( BMM.HYB.playerMaxHPmod )
    {
        case 2:
            this._customHorzCommandWindow.select( 0 );
            break;
        case 1:
            this._customHorzCommandWindow.select( 1 );
            break;
        case 0:
            this._customHorzCommandWindow.select( 2 );
            break;
        case -1:
            this._customHorzCommandWindow.select( 3 );
            break;
        case -2:
            this._customHorzCommandWindow.select( 4 );
            break;
    }


    this.addWindow( this._customHorzCommandWindow );
}


updateHearts = function()
{
    var totalMaxHP = BMM.HYB.playerMaxHP + BMM.HYB.playerMaxHPmod;
    switch( totalMaxHP )
    {
        case 5:
            $gameScreen.erasePicture( 6 );
            break;
        case 4:
            $gameScreen.erasePicture( 6 );
            $gameScreen.erasePicture( 5 );
            break;
        case 3:
            $gameScreen.erasePicture( 6 );
            $gameScreen.erasePicture( 5 );
            $gameScreen.erasePicture( 4 );
            break;
        case 2:
            $gameScreen.erasePicture( 6 );
            $gameScreen.erasePicture( 5 );
            $gameScreen.erasePicture( 4 );
            $gameScreen.erasePicture( 3 );
            break;
        case 1:
            $gameScreen.erasePicture( 6 );
            $gameScreen.erasePicture( 5 );
            $gameScreen.erasePicture( 4 );
            $gameScreen.erasePicture( 3 );
            $gameScreen.erasePicture( 2 );
            break;
    }
}


var timesHit;
var tempMod;


Change_Hearts_Amount_Menu.prototype.command1 = function() 
{
    // console.log( "command 1" );

    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else if( this._customHorzCommandWindow.visible ) this._customHorzCommandWindow.activate();
    else this._customSelectableWindow.activate();

    

    //console.log( "Timer now 8 sec" );
    // numTimesHit = old max - current hp
    // BMM.HYB.playerMaxHP = 6;
    timesHit = BMM.HYB.playerMaxHP + BMM.HYB.playerMaxHPmod - BMM.HYB.playerHP;
    // BMM.HYB.playerMaxHPmod = 2;
    tempMod = 2;
    SceneManager.push( Hearts_Refresh_Yes_No_Menu );
    // this.popScene();
}


Change_Hearts_Amount_Menu.prototype.command2 = function() 
{
    // console.log( "command 2" );

    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    //console.log( "Timer now 4 sec" );
    // BMM.HYB.playerMaxHP = 5;
    timesHit = BMM.HYB.playerMaxHP + BMM.HYB.playerMaxHPmod - BMM.HYB.playerHP;
    tempMod = 1;
    SceneManager.push( Hearts_Refresh_Yes_No_Menu );
    // this.popScene();
}


Change_Hearts_Amount_Menu.prototype.command3 = function() 
{
    // console.log( "command 3" );

    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    //console.log( "Timer now 2 sec" );
    // BMM.HYB.playerMaxHP = 4;
    timesHit = BMM.HYB.playerMaxHP + BMM.HYB.playerMaxHPmod - BMM.HYB.playerHP;
    tempMod = 0;
    SceneManager.push( Hearts_Refresh_Yes_No_Menu );
    // this.popScene();
}


Change_Hearts_Amount_Menu.prototype.command4 = function() 
{
    // console.log( "command 4" );


    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    //console.log( "No timer" );
    // BMM.HYB.playerMaxHP = 3;
    timesHit = BMM.HYB.playerMaxHP + BMM.HYB.playerMaxHPmod - BMM.HYB.playerHP;
    tempMod = -1;
    SceneManager.push( Hearts_Refresh_Yes_No_Menu );
    // this.popScene();
}


Change_Hearts_Amount_Menu.prototype.command5 = function() 
{
    // console.log( "command 5" );

    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    //console.log( "No timer" );
    // BMM.HYB.playerMaxHP = 2;
    timesHit = BMM.HYB.playerMaxHP + BMM.HYB.playerMaxHPmod - BMM.HYB.playerHP;
    tempMod = -2;
    SceneManager.push( Hearts_Refresh_Yes_No_Menu );
    // this.popScene();
}


Change_Hearts_Amount_Menu.prototype.command6 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    //console.log( "No timer" );
    // BMM.HYB.playerMaxHP = 1;
    // updateHearts();
    // console.log( "back" );
    this.popScene();
}


// Change_Hearts_Amount_Menu.prototype.command7 = function() 
// {
//     if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
//     else this._customHorzCommandWindow.activate();
//     //console.log( "Return to options menu" );
//     this.popScene();
// }


Change_Hearts_Amount_Menu.prototype.start = function() 
{
    Scene_MenuBase.prototype.start.call( this );
    this._customSelectableWindow.refresh();
    this._customCommandWindow.refresh();
};


Change_Hearts_Amount_Menu.prototype.update = function() 
{
    Scene_MenuBase.prototype.update.call( this );
    if( Input.isTriggered( "cancel" ) ) this.popScene();
}


function Window_Custom_Hearts() 
{
    this.initialize.apply( this, arguments );
}


Window_Custom_Hearts.prototype = Object.create( Window_Base.prototype );
Window_Custom_Hearts.prototype.constructor = Window_Custom_Hearts;

Window_Custom_Hearts.prototype.initialize = function( x, y, width, height ) 
{
    Window_Base.prototype.initialize.call( this, x, y, width, height );
}


Window_Custom_Hearts.prototype.drawAllItems = function() 
{
    this.contents.clear();
    this.drawText( $gameVariables.value( 2 ), 0, 0, this.width - this.padding * 2, "center" );
}


function Window_Custom_HeartsSelectable() 
{
    this.initialize.apply( this, arguments );
}


Window_Custom_HeartsSelectable.prototype = Object.create( Window_Selectable.prototype );
Window_Custom_HeartsSelectable.prototype.constructor = Window_Selectable;

Window_Custom_HeartsSelectable.prototype.initialize = function( x, y, width, height ) {
    Window_Selectable.prototype.initialize.call( this, x, y, width, height );
    this.refresh();
    this.hide();
}


Window_Custom_HeartsSelectable.prototype.maxItems = function() 
{
    return 3;
}


Window_Custom_HeartsSelectable.prototype.maxPageRows = function() 
{
    return 2;
}


Window_Custom_HeartsSelectable.prototype.maxPageItems = function() 
{
    return this.maxPageRows() * this.maxCols();
}


Window_Custom_HeartsSelectable.prototype.drawItem = function( index ) 
{
    var itemRect = this.itemRect( index );
}


Window_Custom_HeartsSelectable.prototype.itemHeight = function() 
{
    return( this.height - this.padding * 2 ) / this.maxPageRows();
};


function Window_Custom_HeartsCommand() 
{
    this.initialize.apply( this, arguments );
}


Window_Custom_HeartsCommand.prototype = Object.create( Window_Command.prototype );
Window_Custom_HeartsCommand.prototype.constructor = Window_Custom_HeartsCommand;

Window_Custom_HeartsCommand.prototype.initialize = function( x, y ) 
{
    Window_Command.prototype.initialize.call( this, x, y );
    this.opacity = 0;
} 


Window_Custom_HeartsCommand.prototype.makeCommandList = function() 
{
    this.addCommand( "+2 Max HP", "command1" );
    this.addCommand( "+1 Max HP", "command2" );
    this.addCommand( "Normal HP (Default)", "command3" );
    this.addCommand( "-1 Max HP", "command4" );
    this.addCommand( "-2 Max HP", "command5" );
    this.addCommand( "Back", "command6" );
    // this.addCommand( "Back", "command7" );
};


Window_Custom_HeartsCommand.prototype.drawItem = function( index ) 
{
    var itemRect = this.itemRect( index );
    Window_Command.prototype.drawItem.call( this, index );
}


Window_Custom_HeartsCommand.prototype.windowWidth = function() 
{
    return Graphics.boxWidth;
}


Window_Custom_HeartsCommand.prototype.windowHeight = function() 
{
    return Graphics.boxHeight;
}


Window_Custom_HeartsCommand.prototype.itemRect = function( index ) 
{
    var rect = {};
    if( index == 0 ) 
    {
        rect.x = 20;
        rect.y = 150;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 1 ) {
        rect.x = 20;
        rect.y = 200;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 2 ) {
        rect.x = 20;
        rect.y = 250;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 3 ) {
        rect.x = 20;
        rect.y = 300;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 4 ) {
        rect.x = 20;
        rect.y = 350;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 5 ) {
        rect.x = 20;
        rect.y = 400;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 6 ) {
        rect.x = 20;
        rect.y = 450;
        rect.width = 260;
        rect.height = 40;
    }


    return rect;
};


function Window_Custom_HeartsHorzCommand() 
{
    this.initialize.apply( this, arguments );
}


Window_Custom_HeartsHorzCommand.prototype = Object.create( Window_HorzCommand.prototype );
Window_Custom_HeartsHorzCommand.prototype.constructor = Window_Custom_HeartsHorzCommand;

Window_Custom_HeartsHorzCommand.prototype.initialize = function( x, y ) 
{
    Window_HorzCommand.prototype.initialize.call( this, x, y );
    this.hide();
}


Window_Custom_HeartsHorzCommand.prototype.makeCommandList = function() 
{
    // this.addCommand( "6 Hearts", "command1" );
    // this.addCommand( "5 Hearts", "command2" );
    // this.addCommand( "4 Hearts", "command3" );
    // this.addCommand( "3 Hearts", "command4" );
    // this.addCommand( "2 Hearts", "command5", false );
    // this.addCommand( "1 Hearts", "command6", false );
    // this.addCommand( "Back", "command7", false );
    this.addCommand( "+2 Max HP", "command1" );
    this.addCommand( "+1 Max HP", "command2" );
    this.addCommand( "Normal HP (Default)", "command3" );
    this.addCommand( "-1 Max HP", "command4" );
    this.addCommand( "-2 Max HP", "command5" );
    this.addCommand( "Back", "command6" );
};


Window_Custom_HeartsHorzCommand.prototype.windowWidth = function() 
{
    return Graphics.boxWidth;
}



















/**
 * Secondary menu, restart yes or no menu from hearts menu
 * - 2 options
 *      - yes, restart
 *      - no, don't restart
 */
function Hearts_Refresh_Yes_No_Menu() 
{
    this.initialize.apply( this, arguments );
}

Hearts_Refresh_Yes_No_Menu.prototype = Object.create( Scene_MenuBase.prototype );
Hearts_Refresh_Yes_No_Menu.prototype.constructor = Hearts_Refresh_Yes_No_Menu;

Hearts_Refresh_Yes_No_Menu.prototype.initialize = function() 
{
    Scene_MenuBase.prototype.initialize.call( this );
};

Hearts_Refresh_Yes_No_Menu.prototype.create = function() 
{
    Scene_MenuBase.prototype.create.call( this );
    this._customSelectableWindow = new Window_Hearts_Refresh_Yes_NoSelectable( 0, 0, 180, 180 );
    this._customSelectableWindow.hide();
    this._customSelectableWindow.select( 0 );
    this._customSelectableWindow.setHandler( "ok", this.command1.bind( this ) );
    this._customSelectableWindow.setHandler( "cancel", this.popScene.bind( this ) );
    this.addWindow( this._customSelectableWindow );
    
    this._customCommandWindow = new Window_Hearts_Refresh_Yes_NoCommand( 0, 0 );
    this._customCommandWindow.setHandler( "command1", this.command1.bind( this ) );
    this._customCommandWindow.setHandler( "command2", this.command2.bind( this ) );
    this.addWindow( this._customCommandWindow );

    this._customHorzCommandWindow = new Window_Hearts_Refresh_Yes_NoHorzCommand( 0, 0 );
    this._customHorzCommandWindow.setHandler( "command1", this.command1.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command2", this.command2.bind( this ) );
    this.addWindow( this._customHorzCommandWindow );
}


heartsRefresh = function( timesHit1, tempMod1 )
{
    BMM.HYB.playerMaxHPmod = tempMod1;

    if( BMM.HYB.playerMaxHP + BMM.HYB.playerMaxHPmod - timesHit1 <= 0 )
    {
        BMM.HYB.playerHP = 1;
    } else {
        BMM.HYB.playerHP = BMM.HYB.playerMaxHP + BMM.HYB.playerMaxHPmod - timesHit1;
    }
    // after setting new hp
    // tempCurrent hp = new max - numTimesHit
    // currenthp = tempcurrenthp
    updateHearts();
}


Hearts_Refresh_Yes_No_Menu.prototype.command1 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else if( this._customHorzCommandWindow.visible ) this._customHorzCommandWindow.activate();
    else this._customSelectableWindow.activate();
    //console.log( "Restarting stage" );


    heartsRefresh( timesHit, tempMod );


    BMM.GLOBAL.inMenu = false;
    BMM.HYB.resetStage();
    SceneManager.goto( Scene_Map );
    if( BMM.HYB.playerMaxHP + BMM.HYB.playerMaxHPmod == 2 )
    {
        $gameScreen.erasePicture( 3 );
    } else if( BMM.HYB.playerMaxHP + BMM.HYB.playerMaxHPmod == 1 ) {
        $gameScreen.erasePicture( 3 );
        $gameScreen.erasePicture( 2 );
    }
}


Hearts_Refresh_Yes_No_Menu.prototype.command2 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    this.popScene();
}


Hearts_Refresh_Yes_No_Menu.prototype.start = function() 
{
    Scene_MenuBase.prototype.start.call( this );
    this._customSelectableWindow.refresh();
    this._customCommandWindow.refresh();
};


Hearts_Refresh_Yes_No_Menu.prototype.update = function() 
{
    Scene_MenuBase.prototype.update.call( this );
    if( Input.isTriggered( "cancel" ) ) this.popScene();
}


function Window_Hearts_Refresh_Yes_No() 
{
    this.initialize.apply( this, arguments );
}


Window_Hearts_Refresh_Yes_No.prototype = Object.create( Window_Base.prototype );
Window_Hearts_Refresh_Yes_No.prototype.constructor = Window_Hearts_Refresh_Yes_No;

Window_Hearts_Refresh_Yes_No.prototype.initialize = function( x, y, width, height ) 
{
    Window_Base.prototype.initialize.call( this, x, y, width, height );
}


Window_Hearts_Refresh_Yes_No.prototype.drawAllItems = function() 
{
    this.contents.clear();
    this.drawText( $gameVariables.value( 2 ), 0, 0, this.width - this.padding * 2, "center" );
}


function Window_Hearts_Refresh_Yes_NoSelectable() 
{
    this.initialize.apply( this, arguments );
}


Window_Hearts_Refresh_Yes_NoSelectable.prototype = Object.create( Window_Selectable.prototype );
Window_Hearts_Refresh_Yes_NoSelectable.prototype.constructor = Window_Selectable;

Window_Hearts_Refresh_Yes_NoSelectable.prototype.initialize = function( x, y, width, height ) {
    Window_Selectable.prototype.initialize.call( this, x, y, width, height );
    this.refresh();
    this.hide();
}


Window_Hearts_Refresh_Yes_NoSelectable.prototype.maxItems = function() 
{
    return 3;
}


Window_Hearts_Refresh_Yes_NoSelectable.prototype.maxPageRows = function() 
{
    return 2;
}


Window_Hearts_Refresh_Yes_NoSelectable.prototype.maxPageItems = function() 
{
    return this.maxPageRows() * this.maxCols();
}


Window_Hearts_Refresh_Yes_NoSelectable.prototype.drawItem = function( index ) 
{
    var itemRect = this.itemRect( index );
}


Window_Hearts_Refresh_Yes_NoSelectable.prototype.itemHeight = function() {
    return( this.height - this.padding * 2 ) / this.maxPageRows();
};


function Window_Hearts_Refresh_Yes_NoCommand() 
{
    this.initialize.apply( this, arguments );
}


Window_Hearts_Refresh_Yes_NoCommand.prototype = Object.create( Window_Command.prototype );
Window_Hearts_Refresh_Yes_NoCommand.prototype.constructor = Window_Hearts_Refresh_Yes_NoCommand;

Window_Hearts_Refresh_Yes_NoCommand.prototype.initialize = function( x, y ) 
{
    Window_Command.prototype.initialize.call( this, x, y );
    this.opacity = 0;
} 


Window_Hearts_Refresh_Yes_NoCommand.prototype.makeCommandList = function() 
{
    this.addCommand( "Changing hearts amount will restart the level, continue?", "command1" );
    this.addCommand( "Back", "command2" );
};


Window_Hearts_Refresh_Yes_NoCommand.prototype.drawItem = function( index ) 
{
    var itemRect = this.itemRect( index );
    Window_Command.prototype.drawItem.call( this, index );
}


Window_Hearts_Refresh_Yes_NoCommand.prototype.windowWidth = function()
{
    return Graphics.boxWidth;
}


Window_Hearts_Refresh_Yes_NoCommand.prototype.windowHeight = function() 
{
    return Graphics.boxHeight;
}


Window_Hearts_Refresh_Yes_NoCommand.prototype.itemRect = function( index ) 
{
    var rect = {};
    if( index == 0 ) 
    {
        rect.x = 20;
        rect.y = 200;
        rect.width = 500;
        rect.height = 40;
    } else if( index == 1 ) {
        rect.x = 20;
        rect.y = 250;
        rect.width = 260;
        rect.height = 40;
    }
    return rect;
};


function Window_Hearts_Refresh_Yes_NoHorzCommand() 
{
    this.initialize.apply( this, arguments );
}


Window_Hearts_Refresh_Yes_NoHorzCommand.prototype = Object.create( Window_HorzCommand.prototype );
Window_Hearts_Refresh_Yes_NoHorzCommand.prototype.constructor = Window_Hearts_Refresh_Yes_NoHorzCommand;

Window_Hearts_Refresh_Yes_NoHorzCommand.prototype.initialize = function( x, y ) 
{
    Window_HorzCommand.prototype.initialize.call( this, x, y );
    this.hide();
}


Window_Hearts_Refresh_Yes_NoHorzCommand.prototype.makeCommandList = function() 
{
    this.addCommand( "Changing hearts amount will restart the level, continue?", "command1" );
    this.addCommand( "Back", "command2" );
};


Window_Hearts_Refresh_Yes_NoHorzCommand.prototype.windowWidth = function() 
{
    return Graphics.boxWidth;
}






























/**
 * Secondary menu, timer length change
 * - 5 options
 *      - 8 seconds
 *      - 4 seconds
 *      - 2 seconds
 *      - No timer
 *      - Return to previous screen
 */
function Change_Timer_Length_Menu() 
{
    this.initialize.apply( this, arguments );
}


Change_Timer_Length_Menu.prototype = Object.create( Scene_MenuBase.prototype );
Change_Timer_Length_Menu.prototype.constructor = Change_Timer_Length_Menu;

Change_Timer_Length_Menu.prototype.initialize = function() 
{
    Scene_MenuBase.prototype.initialize.call( this );
};


Change_Timer_Length_Menu.prototype.create = function() 
{
    Scene_MenuBase.prototype.create.call( this );
    this._customSelectableWindow = new Window_Custom_TimerSelectable( 0, 0, 180, 180 );
    this._customSelectableWindow.hide();
    switch( BMM.TIME.perTurn )
    {
        case 8000:
            //console.log( "_customSelectableWindow select 0 ");
            this._customSelectableWindow.select( 0 );
            break;
        case 4000:
            //console.log( "_customSelectableWindow select 1 ");

            this._customSelectableWindow.select( 1 );
            break;
        case 2000:
            //console.log( "_customSelectableWindow select 2 ");

            this._customSelectableWindow.select( 2 );
            break;
        case 1000000:
            //console.log( "_customSelectableWindow select 3 ");

            this._customSelectableWindow.select( 3 );
            break;
    }


    this._customSelectableWindow.setHandler( "ok", this.command1.bind( this ) );
    this._customSelectableWindow.setHandler( "cancel", this.popScene.bind( this ) );
    this.addWindow( this._customSelectableWindow );
    
    this._customCommandWindow = new Window_Custom_TimerCommand( 0, 0 );
    this._customCommandWindow.setHandler( "command1", this.command1.bind( this ) );
    this._customCommandWindow.setHandler( "command2", this.command2.bind( this ) );
    this._customCommandWindow.setHandler( "command3", this.command3.bind( this ) );
    this._customCommandWindow.setHandler( "command4", this.command4.bind( this ) );
    this._customCommandWindow.setHandler( "command5", this.command5.bind( this ) );
    switch( BMM.TIME.perTurn )
    {
        case 8000:
            //console.log( "_customCommandWindow select 0 ");
            this._customCommandWindow.select( 0 );
            break;
        case 4000:
            //console.log( "_customCommandWindow select 1 ");

            this._customCommandWindow.select( 1 );
            break;
        case 2000:
            //console.log( "_customCommandWindow select 2 ");

            this._customCommandWindow.select( 2 );
            break;
        case 1000000:
            //console.log( "_customCommandWindow select 3 ");

            this._customCommandWindow.select( 3 );
            break;
    }


    this.addWindow( this._customCommandWindow );

    this._customHorzCommandWindow = new Window_Custom_TimerHorzCommand( 0, 0 );
    this._customHorzCommandWindow.setHandler( "command1", this.command1.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command2", this.command2.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command3", this.command3.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command4", this.command4.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command5", this.command5.bind( this ) );
    switch( BMM.TIME.perTurn )
    {
        case 8000:
            //console.log( "_customHorzCommandWindow select 0 ");
            this._customHorzCommandWindow.select( 0 );
            break;
        case 4000:
            //console.log( "_customHorzCommandWindow select 1 ");

            this._customHorzCommandWindow.select( 1 );
            break;
        case 2000:
            //console.log( "_customHorzCommandWindow select 2 ");

            this._customHorzCommandWindow.select( 2 );
            break;
        case 1000000:
            //console.log( "_customHorzCommandWindow select 3 ");

            this._customHorzCommandWindow.select( 3 );
            break;
    }


    this.addWindow( this._customHorzCommandWindow );
}


Change_Timer_Length_Menu.prototype.command1 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else if( this._customHorzCommandWindow.visible ) this._customHorzCommandWindow.activate();
    else this._customSelectableWindow.activate();
    //console.log( "Timer now 8 sec" );
    BMM.TIME.perTurn = 8000; // 8 seconds
    this.popScene();
}


Change_Timer_Length_Menu.prototype.command2 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    //console.log( "Timer now 4 sec" );
    BMM.TIME.perTurn = 4000; // 4 seconds
    this.popScene();
}


Change_Timer_Length_Menu.prototype.command3 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    //console.log( "Timer now 2 sec" );
    BMM.TIME.perTurn = 2000; // 2 seconds
    this.popScene();
}


Change_Timer_Length_Menu.prototype.command4 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    //console.log( "No timer" );
    BMM.TIME.perTurn = 1000000; // 1000 seconds, "infinite time"
    this.popScene();
}


Change_Timer_Length_Menu.prototype.command5 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    //console.log( "Return to options menu" );
    this.popScene();
}


Change_Timer_Length_Menu.prototype.start = function() 
{
    Scene_MenuBase.prototype.start.call( this );
    this._customSelectableWindow.refresh();
    this._customCommandWindow.refresh();
};


Change_Timer_Length_Menu.prototype.update = function() 
{
    Scene_MenuBase.prototype.update.call( this );
    if( Input.isTriggered( "cancel" ) ) this.popScene();
}


function Window_Custom_Timer() 
{
    this.initialize.apply( this, arguments );
}


Window_Custom_Timer.prototype = Object.create( Window_Base.prototype );
Window_Custom_Timer.prototype.constructor = Window_Custom_Timer;

Window_Custom_Timer.prototype.initialize = function( x, y, width, height ) 
{
    Window_Base.prototype.initialize.call( this, x, y, width, height );
}


Window_Custom_Timer.prototype.drawAllItems = function() 
{
    this.contents.clear();
    this.drawText( $gameVariables.value( 2 ), 0, 0, this.width - this.padding * 2, "center" );
}


function Window_Custom_TimerSelectable() 
{
    this.initialize.apply( this, arguments );
}


Window_Custom_TimerSelectable.prototype = Object.create( Window_Selectable.prototype );
Window_Custom_TimerSelectable.prototype.constructor = Window_Selectable;

Window_Custom_TimerSelectable.prototype.initialize = function( x, y, width, height ) {
    Window_Selectable.prototype.initialize.call( this, x, y, width, height );
    this.refresh();
    this.hide();
}


Window_Custom_TimerSelectable.prototype.maxItems = function() 
{
    return 3;
}


Window_Custom_TimerSelectable.prototype.maxPageRows = function() 
{
    return 2;
}


Window_Custom_TimerSelectable.prototype.maxPageItems = function() 
{
    return this.maxPageRows() * this.maxCols();
}


Window_Custom_TimerSelectable.prototype.drawItem = function( index ) 
{
    var itemRect = this.itemRect( index );
}


Window_Custom_TimerSelectable.prototype.itemHeight = function() 
{
    return( this.height - this.padding * 2 ) / this.maxPageRows();
};


function Window_Custom_TimerCommand() 
{
    this.initialize.apply( this, arguments );
}


Window_Custom_TimerCommand.prototype = Object.create( Window_Command.prototype );
Window_Custom_TimerCommand.prototype.constructor = Window_Custom_TimerCommand;

Window_Custom_TimerCommand.prototype.initialize = function( x, y ) 
{
    Window_Command.prototype.initialize.call( this, x, y );
    this.opacity = 0;
} 


Window_Custom_TimerCommand.prototype.makeCommandList = function() 
{
    this.addCommand( "Timer: 8 seconds", "command1" );
    this.addCommand( "Timer: 4 seconds", "command2" );
    this.addCommand( "Timer: 2 seconds", "command3" );
    this.addCommand( "No timer", "command4" );
    this.addCommand( "Back", "command5" );
};


Window_Custom_TimerCommand.prototype.drawItem = function( index ) 
{
    var itemRect = this.itemRect( index );
    Window_Command.prototype.drawItem.call( this, index );
}


Window_Custom_TimerCommand.prototype.windowWidth = function() 
{
    return Graphics.boxWidth;
}


Window_Custom_TimerCommand.prototype.windowHeight = function() 
{
    return Graphics.boxHeight;
}


Window_Custom_TimerCommand.prototype.itemRect = function( index ) 
{
    var rect = {};
    if( index == 0 ) 
    {
        rect.x = 20;
        rect.y = 150;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 1 ) {
        rect.x = 20;
        rect.y = 200;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 2 ) {
        rect.x = 20;
        rect.y = 250;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 3 ) {
        rect.x = 20;
        rect.y = 300;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 4 ) {
        rect.x = 20;
        rect.y = 350;
        rect.width = 260;
        rect.height = 40;
    }


    return rect;
};


function Window_Custom_TimerHorzCommand() 
{
    this.initialize.apply( this, arguments );
}


Window_Custom_TimerHorzCommand.prototype = Object.create( Window_HorzCommand.prototype );
Window_Custom_TimerHorzCommand.prototype.constructor = Window_Custom_TimerHorzCommand;

Window_Custom_TimerHorzCommand.prototype.initialize = function( x, y ) 
{
    Window_HorzCommand.prototype.initialize.call( this, x, y );
    this.hide();
}


Window_Custom_TimerHorzCommand.prototype.makeCommandList = function() 
{
    this.addCommand( "Timer: 8 seconds", "command1" );
    this.addCommand( "Timer: 4 seconds", "command2" );
    this.addCommand( "Timer: 2 seconds", "command3", false );
    this.addCommand( "No timer", "command4", false );
    this.addCommand( "Back", "command5", false );
};


Window_Custom_TimerHorzCommand.prototype.windowWidth = function() 
{
    return Graphics.boxWidth;
}




/**
 * Secondary menu, restart yes or no menu
 * - 2 options
 *      - yes, restart
 *      - no, don't restart
 */
function Restart_Yes_No_Menu() 
{
    this.initialize.apply( this, arguments );
}

Restart_Yes_No_Menu.prototype = Object.create( Scene_MenuBase.prototype );
Restart_Yes_No_Menu.prototype.constructor = Restart_Yes_No_Menu;

Restart_Yes_No_Menu.prototype.initialize = function() 
{
    Scene_MenuBase.prototype.initialize.call( this );
};

Restart_Yes_No_Menu.prototype.create = function() 
{
    Scene_MenuBase.prototype.create.call( this );
    this._customSelectableWindow = new Window_Restart_Yes_NoSelectable( 0, 0, 180, 180 );
    this._customSelectableWindow.hide();
    this._customSelectableWindow.select( 0 );
    this._customSelectableWindow.setHandler( "ok", this.command1.bind( this ) );
    this._customSelectableWindow.setHandler( "cancel", this.popScene.bind( this ) );
    this.addWindow( this._customSelectableWindow );
    
    this._customCommandWindow = new Window_Restart_Yes_NoCommand( 0, 0 );
    this._customCommandWindow.setHandler( "command1", this.command1.bind( this ) );
    this._customCommandWindow.setHandler( "command2", this.command2.bind( this ) );
    this.addWindow( this._customCommandWindow );

    this._customHorzCommandWindow = new Window_Restart_Yes_NoHorzCommand( 0, 0 );
    this._customHorzCommandWindow.setHandler( "command1", this.command1.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command2", this.command2.bind( this ) );
    this.addWindow( this._customHorzCommandWindow );
}


Restart_Yes_No_Menu.prototype.command1 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else if( this._customHorzCommandWindow.visible ) this._customHorzCommandWindow.activate();
    else this._customSelectableWindow.activate();
    //console.log( "Restarting stage" );
    BMM.GLOBAL.inMenu = false;
    BMM.HYB.resetStage();
    SceneManager.goto( Scene_Map );
    if( BMM.HYB.playerMaxHP + BMM.HYB.playerMaxHPmod == 2 )
    {
        $gameScreen.erasePicture( 3 );
    } else if( BMM.HYB.playerMaxHP + BMM.HYB.playerMaxHPmod == 1 ) {
        $gameScreen.erasePicture( 3 );
        $gameScreen.erasePicture( 2 );
    }
}


Restart_Yes_No_Menu.prototype.command2 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    this.popScene();
}


Restart_Yes_No_Menu.prototype.start = function() 
{
    Scene_MenuBase.prototype.start.call( this );
    this._customSelectableWindow.refresh();
    this._customCommandWindow.refresh();
};


Restart_Yes_No_Menu.prototype.update = function() 
{
    Scene_MenuBase.prototype.update.call( this );
    if( Input.isTriggered( "cancel" ) ) this.popScene();
}


function Window_Restart_Yes_No() 
{
    this.initialize.apply( this, arguments );
}


Window_Restart_Yes_No.prototype = Object.create( Window_Base.prototype );
Window_Restart_Yes_No.prototype.constructor = Window_Restart_Yes_No;

Window_Restart_Yes_No.prototype.initialize = function( x, y, width, height ) 
{
    Window_Base.prototype.initialize.call( this, x, y, width, height );
}


Window_Restart_Yes_No.prototype.drawAllItems = function() 
{
    this.contents.clear();
    this.drawText( $gameVariables.value( 2 ), 0, 0, this.width - this.padding * 2, "center" );
}


function Window_Restart_Yes_NoSelectable() 
{
    this.initialize.apply( this, arguments );
}


Window_Restart_Yes_NoSelectable.prototype = Object.create( Window_Selectable.prototype );
Window_Restart_Yes_NoSelectable.prototype.constructor = Window_Selectable;

Window_Restart_Yes_NoSelectable.prototype.initialize = function( x, y, width, height ) {
    Window_Selectable.prototype.initialize.call( this, x, y, width, height );
    this.refresh();
    this.hide();
}


Window_Restart_Yes_NoSelectable.prototype.maxItems = function() 
{
    return 3;
}


Window_Restart_Yes_NoSelectable.prototype.maxPageRows = function() 
{
    return 2;
}


Window_Restart_Yes_NoSelectable.prototype.maxPageItems = function() 
{
    return this.maxPageRows() * this.maxCols();
}


Window_Restart_Yes_NoSelectable.prototype.drawItem = function( index ) 
{
    var itemRect = this.itemRect( index );
}


Window_Restart_Yes_NoSelectable.prototype.itemHeight = function() {
    return( this.height - this.padding * 2 ) / this.maxPageRows();
};


function Window_Restart_Yes_NoCommand() 
{
    this.initialize.apply( this, arguments );
}


Window_Restart_Yes_NoCommand.prototype = Object.create( Window_Command.prototype );
Window_Restart_Yes_NoCommand.prototype.constructor = Window_Restart_Yes_NoCommand;

Window_Restart_Yes_NoCommand.prototype.initialize = function( x, y ) 
{
    Window_Command.prototype.initialize.call( this, x, y );
    this.opacity = 0;
} 


Window_Restart_Yes_NoCommand.prototype.makeCommandList = function() 
{
    this.addCommand( "Are you sure?", "command1" );
    this.addCommand( "Back", "command2" );
};


Window_Restart_Yes_NoCommand.prototype.drawItem = function( index ) 
{
    var itemRect = this.itemRect( index );
    Window_Command.prototype.drawItem.call( this, index );
}


Window_Restart_Yes_NoCommand.prototype.windowWidth = function()
{
    return Graphics.boxWidth;
}


Window_Restart_Yes_NoCommand.prototype.windowHeight = function() 
{
    return Graphics.boxHeight;
}


Window_Restart_Yes_NoCommand.prototype.itemRect = function( index ) 
{
    var rect = {};
    if( index == 0 ) 
    {
        rect.x = 20;
        rect.y = 200;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 1 ) {
        rect.x = 20;
        rect.y = 250;
        rect.width = 260;
        rect.height = 40;
    }
    return rect;
};


function Window_Restart_Yes_NoHorzCommand() 
{
    this.initialize.apply( this, arguments );
}


Window_Restart_Yes_NoHorzCommand.prototype = Object.create( Window_HorzCommand.prototype );
Window_Restart_Yes_NoHorzCommand.prototype.constructor = Window_Restart_Yes_NoHorzCommand;

Window_Restart_Yes_NoHorzCommand.prototype.initialize = function( x, y ) 
{
    Window_HorzCommand.prototype.initialize.call( this, x, y );
    this.hide();
}


Window_Restart_Yes_NoHorzCommand.prototype.makeCommandList = function() 
{
    this.addCommand( "Are you sure?", "command1" );
    this.addCommand( "Back", "command2" );
};


Window_Restart_Yes_NoHorzCommand.prototype.windowWidth = function() 
{
    return Graphics.boxWidth;
}




/**
 * Secondary menu, return to main menu yes no
 * - 2 options
 *      - yes, return to main menu
 *      - no, don't return to main menu
 */
function MainMenu_Yes_No_Menu() 
{
    this.initialize.apply( this, arguments );
}


MainMenu_Yes_No_Menu.prototype = Object.create( Scene_MenuBase.prototype );
MainMenu_Yes_No_Menu.prototype.constructor = MainMenu_Yes_No_Menu;

MainMenu_Yes_No_Menu.prototype.initialize = function() 
{
    Scene_MenuBase.prototype.initialize.call( this );
};


MainMenu_Yes_No_Menu.prototype.create = function() 
{
    Scene_MenuBase.prototype.create.call( this );
    this._customSelectableWindow = new Window_MainMenu_Yes_NoSelectable( 0, 0, 180, 180 );
    this._customSelectableWindow.hide();
    this._customSelectableWindow.select( 0 );
    this._customSelectableWindow.setHandler( "ok", this.command1.bind( this ) );
    this._customSelectableWindow.setHandler( "cancel", this.popScene.bind( this ) );
    this.addWindow( this._customSelectableWindow );
    
    this._customCommandWindow = new Window_MainMenu_Yes_NoCommand( 0, 0 );
    this._customCommandWindow.setHandler( "command1", this.command1.bind( this ) );
    this._customCommandWindow.setHandler( "command2", this.command2.bind( this ) );
    this.addWindow( this._customCommandWindow );

    this._customHorzCommandWindow = new Window_MainMenu_Yes_NoHorzCommand( 0, 0 );
    this._customHorzCommandWindow.setHandler( "command1", this.command1.bind( this ) );
    this._customHorzCommandWindow.setHandler( "command2", this.command2.bind( this ) );
    this.addWindow( this._customHorzCommandWindow );
}


MainMenu_Yes_No_Menu.prototype.command1 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else if( this._customHorzCommandWindow.visible ) this._customHorzCommandWindow.activate();
    else this._customSelectableWindow.activate();
    //console.log( "Returning to main menu" );
    BMM.GLOBAL.inMenu = false;
    BMM.HYB.mapCleanup();
    SceneManager.goto( Scene_Title );
}


MainMenu_Yes_No_Menu.prototype.command2 = function() 
{
    if( this._customCommandWindow.visible ) this._customCommandWindow.activate();
    else this._customHorzCommandWindow.activate();
    this.popScene();
}


MainMenu_Yes_No_Menu.prototype.start = function() 
{
    Scene_MenuBase.prototype.start.call( this );
    this._customSelectableWindow.refresh();
    this._customCommandWindow.refresh();
};


MainMenu_Yes_No_Menu.prototype.update = function() 
{
    Scene_MenuBase.prototype.update.call( this );
    if( Input.isTriggered( "cancel" ) ) this.popScene();
}


function Window_MainMenu_Yes_No() 
{
    this.initialize.apply( this, arguments );
}


Window_MainMenu_Yes_No.prototype = Object.create( Window_Base.prototype );
Window_MainMenu_Yes_No.prototype.constructor = Window_MainMenu_Yes_No;

Window_MainMenu_Yes_No.prototype.initialize = function( x, y, width, height ) 
{
    Window_Base.prototype.initialize.call( this, x, y, width, height );
}


Window_MainMenu_Yes_No.prototype.drawAllItems = function() 
{
    this.contents.clear();
    this.drawText( $gameVariables.value( 2 ), 0, 0, this.width - this.padding * 2, "center" );
}


function Window_MainMenu_Yes_NoSelectable() 
{
    this.initialize.apply( this, arguments );
}


Window_MainMenu_Yes_NoSelectable.prototype = Object.create( Window_Selectable.prototype );
Window_MainMenu_Yes_NoSelectable.prototype.constructor = Window_Selectable;

Window_MainMenu_Yes_NoSelectable.prototype.initialize = function( x, y, width, height ) {
    Window_Selectable.prototype.initialize.call( this, x, y, width, height );
    this.refresh();
    this.hide();
}


Window_MainMenu_Yes_NoSelectable.prototype.maxItems = function() 
{
    return 3;
}


Window_MainMenu_Yes_NoSelectable.prototype.maxPageRows = function() 
{
    return 2;
}


Window_MainMenu_Yes_NoSelectable.prototype.maxPageItems = function() 
{
    return this.maxPageRows() * this.maxCols();
}


Window_MainMenu_Yes_NoSelectable.prototype.drawItem = function( index ) 
{
    var itemRect = this.itemRect( index );
}


Window_MainMenu_Yes_NoSelectable.prototype.itemHeight = function() {
    return( this.height - this.padding * 2 ) / this.maxPageRows();
};


function Window_MainMenu_Yes_NoCommand() 
{
    this.initialize.apply( this, arguments );
}


Window_MainMenu_Yes_NoCommand.prototype = Object.create( Window_Command.prototype );
Window_MainMenu_Yes_NoCommand.prototype.constructor = Window_MainMenu_Yes_NoCommand;

Window_MainMenu_Yes_NoCommand.prototype.initialize = function( x, y ) 
{
    Window_Command.prototype.initialize.call( this, x, y );
    this.opacity = 0;
} 


Window_MainMenu_Yes_NoCommand.prototype.makeCommandList = function() 
{
    this.addCommand( "Are you sure?", "command1" );
    this.addCommand( "Back", "command2" );
};


Window_MainMenu_Yes_NoCommand.prototype.drawItem = function( index ) 
{
    var itemRect = this.itemRect( index );
    Window_Command.prototype.drawItem.call( this, index );
}


Window_MainMenu_Yes_NoCommand.prototype.windowWidth = function()
{
    return Graphics.boxWidth;
}


Window_MainMenu_Yes_NoCommand.prototype.windowHeight = function() 
{
    return Graphics.boxHeight;
}


Window_MainMenu_Yes_NoCommand.prototype.itemRect = function( index ) 
{
    var rect = {};
    if( index == 0 ) 
    {
        rect.x = 20;
        rect.y = 200;
        rect.width = 260;
        rect.height = 40;
    } else if( index == 1 ) {
        rect.x = 20;
        rect.y = 250;
        rect.width = 260;
        rect.height = 40;
    }

    
    return rect;
};


function Window_MainMenu_Yes_NoHorzCommand() 
{
    this.initialize.apply( this, arguments );
}


Window_MainMenu_Yes_NoHorzCommand.prototype = Object.create( Window_HorzCommand.prototype );
Window_MainMenu_Yes_NoHorzCommand.prototype.constructor = Window_MainMenu_Yes_NoHorzCommand;

Window_MainMenu_Yes_NoHorzCommand.prototype.initialize = function( x, y ) 
{
    Window_HorzCommand.prototype.initialize.call( this, x, y );
    this.hide();
}


Window_MainMenu_Yes_NoHorzCommand.prototype.makeCommandList = function() 
{
    this.addCommand( "Are you sure?", "command1" );
    this.addCommand( "Back", "command2" );
};


Window_MainMenu_Yes_NoHorzCommand.prototype.windowWidth = function() 
{
    return Graphics.boxWidth;
}