
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

////////////////////////////////////////////////////////////
/// Test d'appui sur un bouton de la souris
///
/// Type : JoystickButtonDown
/// Paramètre 1 : Numéro du joystick
/// Paramètre 2 : Bouton à tester
////////////////////////////////////////////////////////////
bool CondJoystickButtonDown( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    unsigned int joystick = condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned);
    unsigned int button = condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned);

    bool Ok = scene->input->IsJoystickButtonDown(joystick, button);

    if ( condition.IsInverted() ) return !Ok;
    return Ok;
}

////////////////////////////////////////////////////////////
/// Test d'un axe d'un joystick
///
/// Type : JoystickAxis
/// Paramètre 1 : Numéro du joystick
/// Paramètre 2 : Axe
/// Paramètre 3 : Valeur à tester
/// Paramètre 4 : Signe du test
////////////////////////////////////////////////////////////
bool CondJoystickAxis( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    bool Ok = false;

    unsigned int joystick = condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned);
    string axisStr = eval.EvalTxt( condition.GetParameter( 1 ) );
    sf::Joy::Axis axis;
    if ( axisStr == "AxisX" ) axis = sf::Joy::AxisX;
    else if ( axisStr == "AxisY" ) axis = sf::Joy::AxisY;
    else if ( axisStr == "AxisZ" ) axis = sf::Joy::AxisZ;
    else if ( axisStr == "AxisR" ) axis = sf::Joy::AxisR;
    else if ( axisStr == "AxisU" ) axis = sf::Joy::AxisU;
    else if ( axisStr == "AxisV" ) axis = sf::Joy::AxisV;
    else if ( axisStr == "AxisPOV" ) axis = sf::Joy::AxisPOV;
    else return false;

    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && scene->input->GetJoystickAxis(joystick, axis) == condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && scene->input->GetJoystickAxis(joystick, axis) < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && scene->input->GetJoystickAxis(joystick, axis) > condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && scene->input->GetJoystickAxis(joystick, axis) <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && scene->input->GetJoystickAxis(joystick, axis) >= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && scene->input->GetJoystickAxis(joystick, axis) != condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned)
       )
       Ok = true;

    if ( condition.IsInverted() ) return !Ok;
    return Ok;
}
