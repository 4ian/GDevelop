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
    if ( ( action.GetParameter(0).GetPlainString() == "yes" || action.GetParameter(0).GetPlainString() == "oui" ) && !scene.game->fullscreen )
    {
        scene.game->fullscreen = true;
        scene.renderWindow->Create( sf::VideoMode( scene.game->windowWidth, scene.game->windowHeight, 32 ), scene.title, sf::Style::Close | sf::Style::Fullscreen );
        scene.ChangeRenderWindow(scene.renderWindow);
    }
    else if ( ( action.GetParameter(0).GetPlainString() == "no" || action.GetParameter(0).GetPlainString() == "non" ) && scene.game->fullscreen )
    {
        scene.game->fullscreen = false;
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
    scene.game->windowWidth = action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned);
    scene.game->windowHeight = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned);

    if ( scene.game->fullscreen )
    {
        scene.renderWindow->Create( sf::VideoMode( scene.game->windowWidth, scene.game->windowHeight, 32 ), scene.title, sf::Style::Close | sf::Style::Fullscreen );
        scene.ChangeRenderWindow(scene.renderWindow);
    }
    else
    {
        scene.renderWindow->Create( sf::VideoMode( scene.game->windowWidth, scene.game->windowHeight, 32 ), scene.title, sf::Style::Close );
        scene.ChangeRenderWindow(scene.renderWindow);
    }
    #endif

    return true;
}
