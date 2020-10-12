/**
 * abilities max pic id is 25
 * 
 * this starts at id 26 - 34
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
                console.log( "BOSS ON SCREEN ", bossMaxHP, " ", bossAttackStage, " ", bossCurrentHP );
                $gameScreen.showPicture( 26, "BOSS", 1, 300, 50, 30, 20, 500, 0 );

                /**
                 * Show stage
                 */
                switch( bossAttackStage )
                {
                    case 1:
                        $gameScreen.showPicture( 27, "BOSS_STAGE1", 1, 280, 50, 10, 10, 500, 0 );
                        break;
                    case 2:
                        $gameScreen.erasePicture( 27 );
                        $gameScreen.showPicture( 28, "BOSS_STAGE2", 1, 280, 50, 10, 10, 500, 0 );
                        break;
                    case 3:
                        $gameScreen.erasePicture( 27 );
                        $gameScreen.erasePicture( 28 );
                        $gameScreen.showPicture( 29, "BOSS_STAGE3", 1, 280, 50, 10, 10, 500, 0 );
                        break;
                }




                switch( bossCurrentHP )
                {
                    case 5:
                        $gameScreen.showPicture( 30, "BOSS_HEARTS", 1, 330, 50, 5, 5, 500, 0 );
                        $gameScreen.showPicture( 31, "BOSS_HEARTS", 1, 370, 50, 5, 5, 500, 0 );
                        $gameScreen.showPicture( 32, "BOSS_HEARTS", 1, 410, 50, 5, 5, 500, 0 );
                        $gameScreen.showPicture( 33, "BOSS_HEARTS", 1, 450, 50, 5, 5, 500, 0 );
                        $gameScreen.showPicture( 34, "BOSS_HEARTS", 1, 490, 50, 5, 5, 500, 0 );
                        break;
                    case 4:
                        $gameScreen.showPicture( 30, "BOSS_HEARTS", 1, 330, 50, 5, 5, 500, 0 );
                        $gameScreen.showPicture( 31, "BOSS_HEARTS", 1, 370, 50, 5, 5, 500, 0 );
                        $gameScreen.showPicture( 32, "BOSS_HEARTS", 1, 410, 50, 5, 5, 500, 0 );
                        $gameScreen.showPicture( 33, "BOSS_HEARTS", 1, 450, 50, 5, 5, 500, 0 );
                        $gameScreen.erasePicture( 34 );
                        break;
                    case 3:
                        $gameScreen.showPicture( 30, "BOSS_HEARTS", 1, 330, 50, 5, 5, 500, 0 );
                        $gameScreen.showPicture( 31, "BOSS_HEARTS", 1, 370, 50, 5, 5, 500, 0 );
                        $gameScreen.showPicture( 32, "BOSS_HEARTS", 1, 410, 50, 5, 5, 500, 0 );
                        $gameScreen.erasePicture( 34 );
                        $gameScreen.erasePicture( 33 );
                        break;
                    case 2:
                        $gameScreen.showPicture( 30, "BOSS_HEARTS", 1, 330, 50, 5, 5, 500, 0 );
                        $gameScreen.showPicture( 31, "BOSS_HEARTS", 1, 370, 50, 5, 5, 500, 0 );
                        $gameScreen.erasePicture( 34 );
                        $gameScreen.erasePicture( 33 );
                        $gameScreen.erasePicture( 32 );
                        break;
                    case 1:
                        $gameScreen.showPicture( 30, "BOSS_HEARTS", 1, 330, 50, 5, 5, 500, 0 );
                        $gameScreen.erasePicture( 34 );
                        $gameScreen.erasePicture( 33 );
                        $gameScreen.erasePicture( 32 );
                        $gameScreen.erasePicture( 31 );
                        break;
                    case 0:
                        $gameScreen.erasePicture( 34 );
                        $gameScreen.erasePicture( 33 );
                        $gameScreen.erasePicture( 32 );
                        $gameScreen.erasePicture( 31 );
                        $gameScreen.erasePicture( 30 );
                        break;
                }












                break;
            case false:
                console.log( "BOSS NOT ON SCREEN" );
                for( var i = 26; i < 34; i++ )
                {
                    $gameScreen.erasePicture( i );
                }
                break;
            default:
                console.log( "Shouldn't reach here" );
        }



        // switch( dashToggledValue )
        // {
        //     case true:
        //         $gameScreen.showPicture( 27, "TOGGLED", 1, 120, 100, 15, 10, 500, 0 );
        //         break;
        //     case false:
        //         $gameScreen.erasePicture( 27 );
        //         break;
        //     default:
        //         console.log( "Shouldn't reach here" );
        // }

        // switch( bombCooldownValue )
        // {
        //     case 8:
        //         $gameScreen.showPicture( 12, "BOMB_TICKS", 1, 10, 70, 5, 10, 500, 0 );
        //         $gameScreen.showPicture( 13, "BOMB_TICKS", 1, 40, 70, 5, 10, 500, 0 );
        //         $gameScreen.showPicture( 14, "BOMB_TICKS", 1, 70, 70, 5, 10, 500, 0 );
        //         $gameScreen.showPicture( 15, "BOMB_TICKS", 1, 100, 70, 5, 10, 500, 0 );
        //         $gameScreen.showPicture( 16, "BOMB_TICKS", 1, 130, 70, 5, 10, 500, 0 );
        //         $gameScreen.showPicture( 17, "BOMB_TICKS", 1, 160, 70, 5, 10, 500, 0 );
        //         $gameScreen.showPicture( 18, "BOMB_TICKS", 1, 190, 70, 5, 10, 500, 0 );
        //         $gameScreen.showPicture( 19, "BOMB_TICKS", 1, 220, 70, 5, 10, 500, 0 );
        //         break;
        //     case 7:
        //         $gameScreen.erasePicture( 19 );
        //         break;
        //     case 6:
        //         $gameScreen.erasePicture( 18 );
        //         break;
        //     case 5:
		// 	    $gameScreen.erasePicture( 17 );
        //         break;
        //     case 4:
        //         $gameScreen.erasePicture( 16 );
        //         break;
        //     case 3:
        //         $gameScreen.erasePicture( 15 );
        //         break;
        //     case 2:
        //         $gameScreen.erasePicture( 14 );
        //         break;
        //     case 1:
        //         $gameScreen.erasePicture( 13 );
        //         break;     
        //     case 0:
		// 	    $gameScreen.erasePicture( 12 );
        //         break;
        //     default:
        //         console.log( "Shouldn't reach this" );
        // }

        
	};
})();  // dont touch this.
