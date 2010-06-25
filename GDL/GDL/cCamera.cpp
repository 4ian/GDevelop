/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/cADS.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include <iostream>

#include <SFML/Window.hpp>
#include "GDL/RuntimeScene.h"

#include "GDL/Instruction.h"

/**
 * Test camera width
 */
bool CondCameraWidth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    std::string layer = condition.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned);;
    unsigned int camera = condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned);

    float width = scene.GetLayer(layer).GetCamera(camera).GetCameraInfo().size.x;

    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && width == condition.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && width < condition.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && width > condition.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && width <= condition.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && width >= condition.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && width != condition.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned) )
        )
    {
        if ( !condition.IsInverted() ) return true;
    }
    else
    {
        if ( condition.IsInverted() ) return true;
    }

    return false;
}

/**
 * Test camera height
 */
bool CondCameraHeight( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    std::string layer = condition.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned);;
    unsigned int camera = condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned);

    float height = scene.GetLayer(layer).GetCamera(camera).GetCameraInfo().size.y;

    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && height == condition.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && height < condition.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && height > condition.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && height <= condition.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && height >= condition.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && height != condition.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned) )
        )
    {
        if ( !condition.IsInverted() ) return true;
    }
    else
    {
        if ( condition.IsInverted() ) return true;
    }

    return false;
}

////////////////////////////////////////////////////////////
/// Test de la position X de la caméra
///
/// Type : CameraX
/// Paramètre 1 : Position x à tester
/// Paramètre 2 : Signe du test
/// Paramètre 3 : Calque
////////////////////////////////////////////////////////////
bool CondCameraX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( condition.GetParameters().size() >= 3 )
        layer = condition.GetParameter(2).GetAsTextExpressionResult(scene, objectsConcerned);;

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int camera = 0;
    if ( condition.GetParameters().size() >= 4 )
        camera = condition.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned);

    sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();

    //Enfin, on teste vraiment.
    //optimisation : test du signe en premier
    if (( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Equal && (view.GetCenter().x - view.GetSize().x/2) == condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Inferior && (view.GetCenter().x - view.GetSize().x/2) < condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Superior && (view.GetCenter().x - view.GetSize().x/2) > condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && (view.GetCenter().x - view.GetSize().x/2) <= condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && (view.GetCenter().x - view.GetSize().x/2) >= condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Different && (view.GetCenter().x - view.GetSize().x/2) != condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) )
        )
    {
        if ( !condition.IsInverted() ) return true;
    }
    else
    {
        if ( condition.IsInverted() ) return true;
    }

    return false;
}


////////////////////////////////////////////////////////////
/// Test de la position Y de la caméra
///
/// Type : CameraY
/// Paramètre 1 : Position x à tester
/// Paramètre 2 : Signe du test
/// Paramètre 3 : Calque
////////////////////////////////////////////////////////////
bool CondCameraY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( condition.GetParameters().size() >= 3 )
        layer = condition.GetParameter(2).GetAsTextExpressionResult(scene, objectsConcerned);;

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int camera = 0;
    if ( condition.GetParameters().size() >= 4 )
        camera = condition.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned);

    sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();

    //Enfin, on teste vraiment.
    //optimisation : test du signe en premier
    if (( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Equal && (view.GetCenter().y - view.GetSize().y/2) == condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Inferior && (view.GetCenter().y - view.GetSize().y/2) < condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Superior && (view.GetCenter().y - view.GetSize().y/2) > condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && (view.GetCenter().y - view.GetSize().y/2) <= condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && (view.GetCenter().y - view.GetSize().y/2) >= condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Different && (view.GetCenter().y - view.GetSize().y/2) != condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) )
       )
    {
        if ( !condition.IsInverted() ) return true;
    }
    else
    {
        if ( condition.IsInverted() ) return true;
    }

    return false;
}

////////////////////////////////////////////////////////////
/// Test de l'angle de la caméra
///
/// Type : CameraAngle
/// Paramètre 1 : Angle à tester
/// Paramètre 2 : Signe du test
/// Paramètre 3 : Calque
////////////////////////////////////////////////////////////
bool CondCameraAngle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( condition.GetParameters().size() >= 3 )
        layer = condition.GetParameter(2).GetAsTextExpressionResult(scene, objectsConcerned);;

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int camera = 0;
    if ( condition.GetParameters().size() >= 4 )
        camera = condition.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned);

    sf::View & view = scene.GetLayer(layer).GetCamera(camera).GetSFMLView();

    //Enfin, on teste vraiment.
    //optimisation : test du signe en premier
    if (( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Equal && (view.GetRotation()) == condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Inferior && (view.GetRotation()) < condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Superior && (view.GetRotation()) > condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && (view.GetRotation()) <= condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && (view.GetRotation()) >= condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Different && (view.GetRotation()) != condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) )
       )
    {
        if ( !condition.IsInverted() ) return true;
    }
    else
    {
        if ( condition.IsInverted() ) return true;
    }

    return false;
}
