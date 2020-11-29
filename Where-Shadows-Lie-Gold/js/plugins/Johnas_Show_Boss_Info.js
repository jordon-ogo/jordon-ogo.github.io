/*=============================================================================
 * Johnas' Show Boss Information Plugin
 * by Johnas Wong
 * Date: October 7, 2020 
 * Johnas_Show_Boss_Info.js
 * 
 * File dependencies:
 *   - BMM_Powertrain.js
 *=============================================================================*/
/*:
 * @plugindesc Shows the Boss information
 * @author Johnas
 */

/**
 * grab the cdRemaining object from the file BMM_Intake (line 75)
 * 
 * PICTURE IDS 20 - 25
 * 
 * 
 * I want to change the positioning of the hearts
 * like the boss haed in the middle
 * if 5 max hearts, they're around it in an upside down arc
 * 
 * if 4, 2 on each side
 */
// "$gameScreen.showPicture(pictureId, name, origin, x, y,
//     scaleX, scaleY, opacity, blendMode)"

( function() 
{  
    var parameters = PluginManager.parameters('Show_Boss_Info');

	_alias_scene_map_update_boss_info = Scene_Map.prototype.update;
	Scene_Map.prototype.update = function() 
	{

        var bossOnScreen = BMM.PT.isBoss();
        var bossMaxHP = BMM.PT.bossMaxHP();
        var bossAttackStage = BMM.PT.bossStage();
        var bossCurrentHP = BMM.PT.bossHP();


        _alias_scene_map_update_boss_info.call( this );
        
        switch( bossOnScreen )
        {
            case true:
                /**
                 * Show stage
                 */
                switch( bossAttackStage )
                {
                    case 1:
                        $gameScreen.showPicture( 20, "BOSS_STAGE1", 1, 410, 29, 35, 35, 500, 0 );
                        break;
                    case 2:
                        $gameScreen.showPicture( 20, "BOSS_STAGE2", 1, 410, 29, 35, 35, 500, 0 );
                        break;
                    case 3:
                        $gameScreen.showPicture( 20, "BOSS_STAGE3", 1, 410, 29, 35, 35, 500, 0 );
                        break;
                    case 4:
                        $gameScreen.showPicture( 20, "BOSS_STAGE3", 1, 410, 29, 35, 35, 500, 0 );
                        break;
                }
                switch( bossMaxHP )
                {
                    case 5:
                        switch( bossCurrentHP )
                        {
                            case 5:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );

                                $gameScreen.showPicture( 21, "full_boss_heart", 1, 330, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 22, "full_boss_heart", 1, 370, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 23, "full_boss_heart", 1, 410, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 24, "full_boss_heart", 1, 450, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 25, "full_boss_heart", 1, 490, 75, 25, 25, 500, 0 );
                                break;
                            case 4:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );

                                $gameScreen.showPicture( 21, "full_boss_heart", 1, 330, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 22, "full_boss_heart", 1, 370, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 23, "full_boss_heart", 1, 410, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 24, "full_boss_heart", 1, 450, 75, 25, 25, 500, 0 );

                                $gameScreen.showPicture( 25, "empty_boss_heart", 1, 490, 75, 25, 25, 500, 0 );
                                break;
                            case 3:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );

                                $gameScreen.showPicture( 21, "full_boss_heart", 1, 330, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 22, "full_boss_heart", 1, 370, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 23, "full_boss_heart", 1, 410, 75, 25, 25, 500, 0 );

                                $gameScreen.showPicture( 24, "empty_boss_heart", 1, 450, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 25, "empty_boss_heart", 1, 490, 75, 25, 25, 500, 0 );
                                break;
                            case 2:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "full_boss_heart", 1, 330, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 22, "full_boss_heart", 1, 370, 75, 25, 25, 500, 0 );

                                $gameScreen.showPicture( 23, "empty_boss_heart", 1, 410, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 24, "empty_boss_heart", 1, 450, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 25, "empty_boss_heart", 1, 490, 75, 25, 25, 500, 0 );
                                break;
                            case 1:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "full_boss_heart", 1, 330, 75, 25, 25, 500, 0 );

                                $gameScreen.showPicture( 22, "empty_boss_heart", 1, 370, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 23, "empty_boss_heart", 1, 410, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 24, "empty_boss_heart", 1, 450, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 25, "empty_boss_heart", 1, 490, 75, 25, 25, 500, 0 );
                                break;
                            case 0:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "empty_boss_heart", 1, 330, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 22, "empty_boss_heart", 1, 370, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 23, "empty_boss_heart", 1, 410, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 24, "empty_boss_heart", 1, 450, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 25, "empty_boss_heart", 1, 490, 75, 25, 25, 500, 0 );
                                break;
                        }
                        break;
                    case 4:
                        switch( bossCurrentHP )
                        {
                            case 4:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "full_boss_heart", 1, 350, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 22, "full_boss_heart", 1, 390, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 23, "full_boss_heart", 1, 430, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 24, "full_boss_heart", 1, 470, 75, 25, 25, 500, 0 );
                                break;
                            case 3:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "full_boss_heart", 1, 350, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 22, "full_boss_heart", 1, 390, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 23, "full_boss_heart", 1, 430, 75, 25, 25, 500, 0 );

                                $gameScreen.showPicture( 24, "empty_boss_heart", 1, 470, 75, 25, 25, 500, 0 );
                                break;
                            case 2:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "full_boss_heart", 1, 350, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 22, "full_boss_heart", 1, 390, 75, 25, 25, 500, 0 );

                                $gameScreen.showPicture( 23, "empty_boss_heart", 1, 430, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 24, "empty_boss_heart", 1, 470, 75, 25, 25, 500, 0 );
                                break;
                            case 1:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "full_boss_heart", 1, 350, 75, 25, 25, 500, 0 );

                                $gameScreen.showPicture( 22, "empty_boss_heart", 1, 390, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 23, "empty_boss_heart", 1, 430, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 24, "empty_boss_heart", 1, 470, 75, 25, 25, 500, 0 );
                                break;
                            case 0:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "empty_boss_heart", 1, 350, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 22, "empty_boss_heart", 1, 390, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 23, "empty_boss_heart", 1, 430, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 24, "empty_boss_heart", 1, 470, 75, 25, 25, 500, 0 );
                                break;
                        }
                        break;
                    case 3:
                        switch( bossCurrentHP )
                        {
                            case 3:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "full_boss_heart", 1, 370, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 22, "full_boss_heart", 1, 410, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 23, "full_boss_heart", 1, 450, 75, 25, 25, 500, 0 );
                                break;
                            case 2:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "full_boss_heart", 1, 370, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 22, "full_boss_heart", 1, 410, 75, 25, 25, 500, 0 );

                                $gameScreen.showPicture( 23, "empty_boss_heart", 1, 450, 75, 25, 25, 500, 0 );
                                break;
                            case 1:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "full_boss_heart", 1, 370, 75, 25, 25, 500, 0 );

                                $gameScreen.showPicture( 22, "empty_boss_heart", 1, 410, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 23, "empty_boss_heart", 1, 450, 75, 25, 25, 500, 0 );
                                break;
                            case 0:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "empty_boss_heart", 1, 370, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 22, "empty_boss_heart", 1, 410, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 23, "empty_boss_heart", 1, 450, 75, 25, 25, 500, 0 );
                                break;
                        }
                        break;
                    case 2:
                        switch( bossCurrentHP )
                        {
                            case 2:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "full_boss_heart", 1, 390, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 22, "full_boss_heart", 1, 430, 75, 25, 25, 500, 0 );
                                break;
                            case 1:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "full_boss_heart", 1, 390, 75, 25, 25, 500, 0 );

                                $gameScreen.showPicture( 22, "empty_boss_heart", 1, 430, 75, 25, 25, 500, 0 );
                                break;
                            case 0:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "empty_boss_heart", 1, 390, 75, 25, 25, 500, 0 );
                                $gameScreen.showPicture( 22, "empty_boss_heart", 1, 430, 75, 25, 25, 500, 0 );
                                break;
                        }
                        break;
                    case 1:
                        switch( bossCurrentHP )
                        {
                            case 1:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "full_boss_heart", 1, 410, 75, 25, 25, 500, 0 );
                                break;
                            case 0:
                                $gameScreen.erasePicture( 21 );
                                $gameScreen.erasePicture( 22 );
                                $gameScreen.erasePicture( 23 );
                                $gameScreen.erasePicture( 24 );
                                $gameScreen.erasePicture( 25 );
                                
                                $gameScreen.showPicture( 21, "empty_boss_heart", 1, 410, 75, 25, 25, 500, 0 );
                                break;
                        }
                        break;
                }
                break;
            case false:
                $gameScreen.erasePicture( 20 );
                $gameScreen.erasePicture( 21 );
                $gameScreen.erasePicture( 22 );
                $gameScreen.erasePicture( 23 );
                $gameScreen.erasePicture( 24 );
                $gameScreen.erasePicture( 25 );
                break;
            default:
                // console.log( "Shouldn't reach here" );
        }


        
	};
})();  // dont touch this.
