#include "GDL/aWindow.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"

#include "GDL/ObjectsConcerned.h"
#include <string>
#include <vector>

using namespace std;

////////////////////////////////////////////////////////////
/// Met la fenêtre en plein écran ou non
///
/// Type : SetFullScreen
/// Paramètre 1 : Oui ou non ( non si vide )
////////////////////////////////////////////////////////////
bool ActSetFullScreen( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    #ifdef GDP
    if ( action.GetParameter(0).GetAsBool() && !scene.RenderWindowIsFullScreen() )
    {
        scene.SetRenderWindowIsFullScreen();
        scene.renderWindow->Create( sf::VideoMode( scene.game->windowWidth, scene.game->windowHeight, 32 ), scene.title, sf::Style::Close | sf::Style::Fullscreen );
        scene.ChangeRenderWindow(scene.renderWindow);
    }
    else if ( !action.GetParameter(0).GetAsBool() && scene.RenderWindowIsFullScreen() )
    {
        scene.SetRenderWindowIsFullScreen(false);
        scene.renderWindow->Create( sf::VideoMode( scene.game->windowWidth, scene.game->windowHeight, 32 ), scene.title, sf::Style::Close );
        scene.ChangeRenderWindow(scene.renderWindow);
    }
    #endif

    return true;
}

/**
 * Change window size
 */
bool ActSetWindowSize( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    #ifdef GDP
    int windowWidth = action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned);
    int windowHeight = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned);

    if ( scene.RenderWindowIsFullScreen() )
    {
        scene.renderWindow->Create( sf::VideoMode( windowWidth, windowHeight, 32 ), scene.title, sf::Style::Close | sf::Style::Fullscreen );
        scene.ChangeRenderWindow(scene.renderWindow);
    }
    else
    {
        scene.renderWindow->Create( sf::VideoMode( windowWidth, windowHeight, 32 ), scene.title, sf::Style::Close );
        scene.ChangeRenderWindow(scene.renderWindow);
    }
    #endif

    return true;
}
