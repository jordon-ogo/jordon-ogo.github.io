/**
 * abilities max pic id is 25
 * 
 * this starts at id 28 - 36
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
                $gameScreen.showPicture( 35, "BOSS", 1, 300, 50, 30, 20, 500, 0 );

                /**
                 * Show stage
                 */
                switch( bossAttackStage )
                {
                    case 1:
                        $gameScreen.showPicture( 36, "BOSS_STAGE1", 1, 280, 50, 10, 10, 500, 0 );
                        break;
                    case 2:
                        $gameScreen.erasePicture( 36 );
                        $gameScreen.showPicture( 28, "BOSS_STAGE2", 1, 280, 50, 10, 10, 500, 0 );
                        break;
                    case 3:
                        $gameScreen.erasePicture( 36 );
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
                for( var i = 28; i < 36; i++ )
                {
                    $gameScreen.erasePicture( i );
                }
                break;
            default:
                console.log( "Shouldn't reach here" );
        }


        
	};
})();  // dont touch this.
