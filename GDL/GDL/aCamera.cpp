/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <SFML/System.hpp>
#include <iostream>
#include <SFML/Graphics.hpp>
#include <cmath>
#include "GDL/aCamera.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"

/**
 * Change the render zone of a camera
 */
bool ActCameraViewport( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    std::string layer = action.GetParameter(0).GetPlainString();
    unsigned int cameraNb = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned);

    RuntimeCamera & camera = scene.GetLayer(layer).GetCamera(cameraNb);

    camera.GetCameraInfo().defaultViewport = false;
    camera.GetCameraInfo().viewport.Left = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned);
    camera.GetCameraInfo().viewport.Top = action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned);
    camera.GetCameraInfo().viewport.Right = action.GetParameter( 4 ).GetAsMathExpressionResult(scene, objectsConcerned);
    camera.GetCameraInfo().viewport.Bottom = action.GetParameter( 5 ).GetAsMathExpressionResult(scene, objectsConcerned);
    camera.GetSFMLView().SetViewport(camera.GetCameraInfo().viewport);
    return true;
}

/**
 * Change the size of a camera ( reset zoom )
 */
bool ActCameraSize( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    std::string layer = action.GetParameter(0).GetPlainString();
    unsigned int cameraNb = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned);

    RuntimeCamera & camera = scene.GetLayer(layer).GetCamera(cameraNb);

    camera.GetCameraInfo().defaultSize = false;
    camera.GetCameraInfo().size.x = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned);
    camera.GetCameraInfo().size.y = action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned);
    camera.GetSFMLView().SetSize(camera.GetCameraInfo().size);
    return true;
}

/**
 * Add a camera to a layer
 */
bool ActAddCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    RuntimeLayer & layer = scene.GetLayer(action.GetParameter(0).GetPlainString());

    Camera cameraInfo;

    //Set the size of the camera
    if ( !action.GetParameter(1).GetPlainString().empty() || !action.GetParameter(2).GetPlainString().empty() )
        cameraInfo.defaultSize = false;

    cameraInfo.size.x = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned);
    cameraInfo.size.y = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned);

    //Set the viewport
    if ( !action.GetParameter(3).GetPlainString().empty() || !action.GetParameter(4).GetPlainString().empty() ||
         !action.GetParameter(5).GetPlainString().empty() || !action.GetParameter(6).GetPlainString().empty())
        cameraInfo.defaultViewport = false;

    cameraInfo.viewport.Left = action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned);
    cameraInfo.viewport.Top = action.GetParameter( 4 ).GetAsMathExpressionResult(scene, objectsConcerned);
    cameraInfo.viewport.Right = action.GetParameter( 5 ).GetAsMathExpressionResult(scene, objectsConcerned);
    cameraInfo.viewport.Bottom = action.GetParameter( 6 ).GetAsMathExpressionResult(scene, objectsConcerned);

    //Create a runtime camera from the camera
    const sf::RenderWindow * window = scene.renderWindow;
    RuntimeCamera camera(cameraInfo, window ? window->GetDefaultView() : sf::View() );

    //Add the runtime camera to the layer
    layer.AddCamera(camera);
    return true;
}


/**
 * Delete a camera of a layer
 */
bool ActDeleteCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    unsigned int cameraNb = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned);

    RuntimeLayer & layer = scene.GetLayer(action.GetParameter(0).GetPlainString());

    layer.DeleteCamera(cameraNb);

    return true;
}

////////////////////////////////////////////////////////////
/// Fixe la caméra sur un objet, sans dépasser un cadre
///
/// Type : FixCamera
/// Paramètre 1 : Objet
/// Paramètre 2 : Xmin
/// Paramètre 3 : Ymin
/// Paramètre 4 : Xmax
/// Paramètre 5 : Ymax
/// Paramètre 6 : Calque
////////////////////////////////////////////////////////////
bool ActFixCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    ObjList list = objectsConcerned.Pick(action.GetParameter( 0 ).GetAsObjectIdentifier(), action.IsGlobal());

    if ( list.empty() ) return false;

    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( action.GetParameters().size() >= 7 )
        layer = action.GetParameter(6).GetPlainString();

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int camera = 0;
    if ( action.GetParameters().size() >= 8 )
        camera = action.GetParameter(7).GetAsMathExpressionResult(scene, objectsConcerned);

    sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();

    float decalementX = 0;
    float decalementY = 0;

    //Prise en compte des déplacements de l'objet
    if ( action.GetParameters().size() < 6 )
    {
        decalementX = ( list[0]->TotalForceX() * scene.GetElapsedTime() );
        decalementY = ( list[0]->TotalForceY() * scene.GetElapsedTime() );
    }
    else if ( action.GetParameter(5).GetPlainString() != "no" && action.GetParameter(5).GetPlainString() != "non")
    {
        decalementX = ( list[0]->TotalForceX() * scene.GetElapsedTime() );
        decalementY = ( list[0]->TotalForceY() * scene.GetElapsedTime() );
    }

    //Si on est dans le cadre
    if ( list[0]->GetX() > action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned)
        && list[0]->GetX() < action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned)
        && list[0]->GetY() > action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned)
        && list[0]->GetY() < action.GetParameter( 4 ).GetAsMathExpressionResult(scene, objectsConcerned)
        )
    {
        view.SetCenter(list[0]->GetX() + decalementX, list[0]->GetY() + decalementY);
    }

    //Si on n'est pas dedans.
    if ( ( list[0]->GetX() < action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned)
        || list[0]->GetX() > action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned) )
        && list[0]->GetY() > action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned)
        && list[0]->GetY() < action.GetParameter( 4 ).GetAsMathExpressionResult(scene, objectsConcerned) )

    {
        view.SetCenter(view.GetCenter().x, list[0]->GetY() + decalementY);
    }
    if ( ( list[0]->GetY() < action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned)
        || list[0]->GetY() > action.GetParameter( 4 ).GetAsMathExpressionResult(scene, objectsConcerned) )
        && list[0]->GetX() > action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned)
        && list[0]->GetX() < action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned))
    {
        view.SetCenter(list[0]->GetX() + decalementX, view.GetCenter().y);
    }

    return true;
}


////////////////////////////////////////////////////////////
/// Fixe la caméra sur un objet
///
/// Type : FixCamera
/// Paramètre 1 : Objet
/// Paramètre 2 : Prise en compte du déplacement ( Oui/Non )
/// Paramètre 3 : Calque
////////////////////////////////////////////////////////////
bool ActCentreCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    ObjList list = objectsConcerned.Pick(action.GetParameter( 0 ).GetAsObjectIdentifier(), action.IsGlobal());

    if ( list.empty() ) return false;

    float decalementX = 0;
    float decalementY = 0;

    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( action.GetParameters().size() >= 3 )
        layer = action.GetParameter(2).GetPlainString();

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int camera = 0;
    if ( action.GetParameters().size() >= 4 )
        camera = action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned);

    sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();

    //Prise en compte des déplacements de l'objet
    if ( action.GetParameters().size() < 2 )
    {
        decalementX = ( list[0]->TotalForceX() * scene.GetElapsedTime() );
        decalementY = ( list[0]->TotalForceY() * scene.GetElapsedTime() );
    }
    else if ( action.GetParameter(1).GetPlainString() != "no" && action.GetParameter(1).GetPlainString() != "non")
    {
        decalementX = ( list[0]->TotalForceX() * scene.GetElapsedTime() );
        decalementY = ( list[0]->TotalForceY() * scene.GetElapsedTime() );
    }

    view.SetCenter(list[0]->GetX() + decalementX,
                    list[0]->GetY() + decalementY);

    return true;
}

////////////////////////////////////////////////////////////
/// Zoomer / Dézoomer
///
/// Type : ZoomCamera
/// Paramètre 1 : Nouvelle valeur
/// Paramètre 2 : Calque
////////////////////////////////////////////////////////////
bool ActZoomCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( action.GetParameters().size() >= 2 )
        layer = action.GetParameter(1).GetPlainString();

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int cameraNb = 0;
    if ( action.GetParameters().size() >= 3 )
        cameraNb = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned);

    RuntimeCamera & camera = scene.GetLayer(layer).GetCamera(cameraNb);

    float newZoom = action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned);
    if ( newZoom == 0 ) return false;

    camera.GetSFMLView().SetSize((camera.GetCameraInfo().size.x/newZoom), (camera.GetCameraInfo().size.y/newZoom));

    return true;
}

////////////////////////////////////////////////////////////
/// Faire tourner la caméra
///
/// Type : RotateCamera
/// Paramètre 1 : Nouvelle valeur
/// Paramètre 2 : Signe de la modification
/// Paramètre 3 : Calque
////////////////////////////////////////////////////////////
bool ActRotateCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( action.GetParameters().size() >= 3 )
        layer = action.GetParameter(2).GetPlainString();

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int camera = 0;
    if ( action.GetParameters().size() >= 4 )
        camera = action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned);

    sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();

    float value = action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned);
    if ( action.GetParameter( 1 ).GetPlainString().empty() || action.GetParameter( 1 ).GetAsModOperator() == GDExpression::Set ) view.SetRotation(value);
    else if ( action.GetParameter( 1 ).GetAsModOperator() == GDExpression::Add ) view.SetRotation(view.GetRotation()+value);
    else if ( action.GetParameter( 1 ).GetAsModOperator() == GDExpression::Substract ) view.SetRotation(view.GetRotation()-value);
    else if ( action.GetParameter( 1 ).GetAsModOperator() == GDExpression::Multiply ) view.SetRotation(view.GetRotation()*value);
    else if ( action.GetParameter( 1 ).GetAsModOperator() == GDExpression::Divide ) view.SetRotation(view.GetRotation()/value);

    return true;
}
