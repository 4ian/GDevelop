/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include <iostream>
#include <sstream>
#include <iostream>

#include "GDL/Object.h"
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"

////////////////////////////////////////////////////////////
/// Enregistre la valeur d'un axe d'un joystick dans une variable
///
/// Type : GetJoystickAxis
/// Paramètre 1 : Numéro du joystick
/// Paramètre 2 : Axe
/// Paramètre 3 : Variable de la scène
////////////////////////////////////////////////////////////
bool ActGetJoystickAxis( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    //Obtain axis and joystick
    unsigned int joystick = action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned);
    string axisStr = action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned);
    sf::Joy::Axis axis;
    if ( axisStr == "AxisX" ) axis = sf::Joy::AxisX;
    else if ( axisStr == "AxisY" ) axis = sf::Joy::AxisY;
    else if ( axisStr == "AxisZ" ) axis = sf::Joy::AxisZ;
    else if ( axisStr == "AxisR" ) axis = sf::Joy::AxisR;
    else if ( axisStr == "AxisU" ) axis = sf::Joy::AxisU;
    else if ( axisStr == "AxisV" ) axis = sf::Joy::AxisV;
    else if ( axisStr == "AxisPOV" ) axis = sf::Joy::AxisPOV;
    else return false;

    //Update variable value
    scene.variables.ObtainVariable(action.GetParameter(2).GetAsTextExpressionResult(scene, objectsConcerned)) = scene.input->GetJoystickAxis(joystick, axis);

    return true;
}
