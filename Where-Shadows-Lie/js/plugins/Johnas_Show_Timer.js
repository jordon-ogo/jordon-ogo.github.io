/*=============================================================================
 * Johnas' Show Timer Plugin
 * by Johnas Wong
 * Date: October 21, 2020 
 * Johnas_Show_Timer.js
 * 
 * File dependencies:
 *   - BMM_TimingBelt.js
 *=============================================================================*/
/*:
 * @plugindesc Shows the turn timer and time remaining
 * @author Johnas
 */

/**
 * grab the cdRemaining object from the file BMM_Intake (line 75)
 * 
 * PICTURE IDS 30 - 
 */

( function() 
{  
    var parameters = PluginManager.parameters('Show_Timer');



// 
	_alias_scene_map_turntimer = Scene_Map.prototype.update;
	Scene_Map.prototype.update = function() 
	{


        //BMM.TIME.perTurn is max turn time
        var timeRemaining = BMM.TIME.remaining();


        _alias_scene_map_turntimer.call( this );

        // console.log( "MATHFLOOR: ", Math.floor( timeRemaining / 1000 ) );
        
        

        /**
         * Case for timer = 10 sec
         */
        // switch( Math.floor( timeRemaining / 1000 ) )
        // {
        //     case 10:
        //         $gameScreen.showPicture( 30, "timer0", 1, 20, 120, 27, 27, 500, 0 );
        //         break;
        //     case 9:
        //         $gameScreen.showPicture( 30, "timer1", 1, 20, 120, 27, 27, 500, 0 );
        //         break;
        //     case 7:
        //         $gameScreen.showPicture( 30, "timer2", 1, 20, 120, 27, 27, 500, 0 );
        //         break;
        //     case 6:
        //         $gameScreen.showPicture( 30, "timer3", 1, 20, 120, 27, 27, 500, 0 );
        //         break;
        //     case 5:
        //         $gameScreen.showPicture( 30, "timer4", 1, 20, 120, 27, 27, 500, 0 );
        //         break;
        //     case 4:
        //         $gameScreen.showPicture( 30, "timer5", 1, 20, 120, 27, 27, 500, 0 );
        //         break;
        //     case 3:
        //         $gameScreen.showPicture( 30, "timer6", 1, 20, 120, 27, 27, 500, 0 );
        //         break;
        //     case 2:
        //         $gameScreen.showPicture( 30, "timer7", 1, 20, 120, 27, 27, 500, 0 );
        //         break;
        //     case 1:
        //         $gameScreen.showPicture( 30, "timer8", 1, 20, 120, 27, 27, 500, 0 );
        //         break;
        //     case 0:
        //         $gameScreen.showPicture( 30, "timer9", 1, 20, 120, 27, 27, 500, 0 );
        //         break;
        //     default:
        //         console.log( "Shouldn't reach here" );
        // }

        switch( Math.floor( timeRemaining / 1000 ) )
        {
            case 3:
                $gameScreen.showPicture( 30, "timer0", 1, 780, 40, 50, 50, 500, 0 );
                break;
                // there's actually 2.56 seconds left
            case 2:
                $gameScreen.showPicture( 30, "timer4", 1, 780, 40, 50, 50, 500, 0 );
                break;
            case 1:
                $gameScreen.showPicture( 30, "timer6", 1, 780, 40, 50, 50, 500, 0 );
                break;
            case 0:
                $gameScreen.showPicture( 30, "timer9", 1, 780, 40, 50, 50, 500, 0 );
                break;
            default:
        }

	};
})();  // dont touch this.
