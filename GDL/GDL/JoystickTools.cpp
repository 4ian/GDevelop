/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "JoystickTools.h"
#include "GDL/RuntimeScene.h"
#include <SFML/System.hpp>

bool JoystickButtonDown( RuntimeScene & scene, unsigned int joystick, unsigned int button )
{
    return scene.input->IsJoystickButtonDown(joystick, button);
}

double GetJoystickAxisValue( RuntimeScene & scene, unsigned int joystick, const std::string & axisStr )
{
    sf::Joy::Axis axis;
    if ( axisStr == "AxisX" ) axis = sf::Joy::AxisX;
    else if ( axisStr == "AxisY" ) axis = sf::Joy::AxisY;
    else if ( axisStr == "AxisZ" ) axis = sf::Joy::AxisZ;
    else if ( axisStr == "AxisR" ) axis = sf::Joy::AxisR;
    else if ( axisStr == "AxisU" ) axis = sf::Joy::AxisU;
    else if ( axisStr == "AxisV" ) axis = sf::Joy::AxisV;
    else if ( axisStr == "AxisPOV" ) axis = sf::Joy::AxisPOV;
    else return 0;

    return scene.input->GetJoystickAxis(joystick, axis);
}

void JoystickAxisValueToVariable( RuntimeScene & scene, unsigned int joystick, const std::string & axisStr, const std::string & variable )
{
    //Obtain axis and joystick
    sf::Joy::Axis axis;
    if ( axisStr == "AxisX" ) axis = sf::Joy::AxisX;
    else if ( axisStr == "AxisY" ) axis = sf::Joy::AxisY;
    else if ( axisStr == "AxisZ" ) axis = sf::Joy::AxisZ;
    else if ( axisStr == "AxisR" ) axis = sf::Joy::AxisR;
    else if ( axisStr == "AxisU" ) axis = sf::Joy::AxisU;
    else if ( axisStr == "AxisV" ) axis = sf::Joy::AxisV;
    else if ( axisStr == "AxisPOV" ) axis = sf::Joy::AxisPOV;
    else return;

    //Update variable value
    scene.variables.ObtainVariable(variable) = scene.input->GetJoystickAxis(joystick, axis);

    return;
}
