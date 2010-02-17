/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Contient une ou plusieurs conditions
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
#include "GDL/algo.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include <SFML/Window.hpp>
#include "GDL/RuntimeScene.h"

#include "GDL/Instruction.h"

////////////////////////////////////////////////////////////
/// Test de la position X de la caméra
///
/// Type : CameraX
/// Paramètre 1 : Position x à tester
/// Paramètre 2 : Signe du test
/// Paramètre 3 : Calque
////////////////////////////////////////////////////////////
bool CondCameraX( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( condition.GetParameters().size() >= 3 )
        layer = condition.GetParameter(2).GetPlainString();

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int camera = 0;
    if ( condition.GetParameters().size() >= 4 )
        camera = eval.EvalExp(condition.GetParameter(3));

    sf::View & view = scene->GetLayer(layer).GetCamera(camera).GetSFMLView();

    //Enfin, on teste vraiment.
    //optimisation : test du signe en premier
    if (( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Equal && (view.GetCenter().x - view.GetSize().x/2) == eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Inferior && (view.GetCenter().x - view.GetSize().x/2) < eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Superior && (view.GetCenter().x - view.GetSize().x/2) > eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && (view.GetCenter().x - view.GetSize().x/2) <= eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && (view.GetCenter().x - view.GetSize().x/2) >= eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Different && (view.GetCenter().x - view.GetSize().x/2) != eval.EvalExp( condition.GetParameter( 0 ) ) )
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
bool CondCameraY( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( condition.GetParameters().size() >= 3 )
        layer = condition.GetParameter(2).GetPlainString();

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int camera = 0;
    if ( condition.GetParameters().size() >= 4 )
        camera = eval.EvalExp(condition.GetParameter(3));

    sf::View & view = scene->GetLayer(layer).GetCamera(camera).GetSFMLView();

    //Enfin, on teste vraiment.
    //optimisation : test du signe en premier
    if (( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Equal && (view.GetCenter().y - view.GetSize().y/2) == eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Inferior && (view.GetCenter().y - view.GetSize().y/2) < eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Superior && (view.GetCenter().y - view.GetSize().y/2) > eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && (view.GetCenter().y - view.GetSize().y/2) <= eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && (view.GetCenter().y - view.GetSize().y/2) >= eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Different && (view.GetCenter().y - view.GetSize().y/2) != eval.EvalExp( condition.GetParameter( 0 ) ) )
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
bool CondCameraAngle( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( condition.GetParameters().size() >= 3 )
        layer = condition.GetParameter(2).GetPlainString();

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int camera = 0;
    if ( condition.GetParameters().size() >= 4 )
        camera = eval.EvalExp(condition.GetParameter(3));

    sf::View & view = scene->GetLayer(layer).GetCamera(camera).GetSFMLView();

    //Enfin, on teste vraiment.
    //optimisation : test du signe en premier
    if (( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Equal && (view.GetRotation()) == eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Inferior && (view.GetRotation()) < eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Superior && (view.GetRotation()) > eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && (view.GetRotation()) <= eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && (view.GetRotation()) >= eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Different && (view.GetRotation()) != eval.EvalExp( condition.GetParameter( 0 ) ) )
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
