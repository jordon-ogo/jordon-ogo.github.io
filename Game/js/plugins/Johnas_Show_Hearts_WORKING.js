/*=============================================================================
 * Johnas' Hearts Bar Plugin
 * by Johnas Wong
 * Date: September 28, 2020 
 * Johnas_Show_Hearts_WORKING.js
 *=============================================================================*/
/*:
 * @plugindesc Shows the number of hearts the player has (Currently 0 - 3)
 * @author Johnas
 *
 * @param heartsVariable
 * @desc The variable which stores how many hearts the player has
 * @default 1
 */

 /**
  * TO DO LIST:

	- gonna have to make it so that there's a global variable for number of heart containers
	otherwise every time picks up hp, can go past the max

	- For further polish, if can't find way to animate could do janky animation
	by using .showPicture and using broken heart pngs

	- Currently hard coded for in game variable 1: Need to modularize it so that
	it takes in the parameter and uses that variable

	- numHearts is the game variable number aka in game variable 1 is the
	  variable that holds the heart numbers
  */
( function() 
{  
	var parameters = PluginManager.parameters('Show_Hearts');

	_alias_scene_map_update_hearts = Scene_Map.prototype.update;
	Scene_Map.prototype.update = function( numHearts ) 
	{
		numHearts = 1;

		_alias_scene_map_update_hearts.call( this );
		if( $gameVariables.value( numHearts ) == 3 )
		{
			$gameScreen.erasePicture( 3 );
			$gameScreen.erasePicture( 2 );
			$gameScreen.erasePicture( 1 );

			$gameScreen.showPicture( 1, "pixel_heart", 1, 20, 20, 5, 5, 500, 0 );

			$gameScreen.showPicture( 2, "pixel_heart", 1, 60, 20, 5, 5, 500, 0 );

			$gameScreen.showPicture( 3, "pixel_heart", 1, 100, 20, 5, 5, 500, 0 );

		} else if( $gameVariables.value( numHearts ) == 2 ) {
			$gameScreen.erasePicture( 3 );

			$gameScreen.showPicture( 1, "pixel_heart", 1, 20, 20, 5, 5, 500, 0 );

			$gameScreen.showPicture( 2, "pixel_heart", 1, 60, 20, 5, 5, 500, 0 );
		} else if( $gameVariables.value( numHearts ) == 1 ) {
			$gameScreen.erasePicture( 3 );
			$gameScreen.erasePicture( 2 );
			$gameScreen.showPicture( 1, "pixel_heart", 1, 20, 20, 5, 5, 500, 0 );
		} else if( $gameVariables.value( numHearts ) == 0 ) {
			$gameScreen.erasePicture( 3 );
			$gameScreen.erasePicture( 2 );
			$gameScreen.erasePicture( 1 );
		} else if( $gameVariables.value( numHearts ) < 0 ) {
			$gameVariables.setValue( 1, 0 ) 
		} else if( $gameVariables.value( numHearts ) > 3 ) {
			$gameVariables.setValue( 1, 3 ) 
		}
	};

       
})();  // dont touch this.