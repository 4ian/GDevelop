/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "JoystickTools.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/Project/Variable.h"
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>

bool GD_API JoystickButtonDown( RuntimeScene & scene, unsigned int joystick, unsigned int button )
{
    return sf::Joystick::isButtonPressed(joystick, button);
}

double GD_API GetJoystickAxisValue( RuntimeScene & scene, unsigned int joystick, const gd::String & axisStr )
{
    sf::Joystick::Axis axis;
    if ( axisStr == "AxisX" ) axis = sf::Joystick::X;
    else if ( axisStr == "AxisY" ) axis = sf::Joystick::Y;
    else if ( axisStr == "AxisZ" ) axis = sf::Joystick::Z;
    else if ( axisStr == "AxisR" ) axis = sf::Joystick::R;
    else if ( axisStr == "AxisU" ) axis = sf::Joystick::U;
    else if ( axisStr == "AxisV" ) axis = sf::Joystick::V;
    else if ( axisStr == "AxisPOV" ) axis = sf::Joystick::PovX; //Deprecated
    else if ( axisStr == "AxisPovX" ) axis = sf::Joystick::PovX;
    else if ( axisStr == "AxisPovY" ) axis = sf::Joystick::PovY;
    else return 0;

    return sf::Joystick::getAxisPosition(joystick, axis);
}

void GD_API JoystickAxisValueToVariable( RuntimeScene & scene, unsigned int joystick, const gd::String & axisStr, gd::Variable & variable )
{
    //Obtain axis and joystick
    sf::Joystick::Axis axis;
    if ( axisStr == "AxisX" ) axis = sf::Joystick::X;
    else if ( axisStr == "AxisY" ) axis = sf::Joystick::Y;
    else if ( axisStr == "AxisZ" ) axis = sf::Joystick::Z;
    else if ( axisStr == "AxisR" ) axis = sf::Joystick::R;
    else if ( axisStr == "AxisU" ) axis = sf::Joystick::U;
    else if ( axisStr == "AxisV" ) axis = sf::Joystick::V;
    else if ( axisStr == "AxisPOV" ) axis = sf::Joystick::PovX; //Deprecated
    else if ( axisStr == "AxisPovX" ) axis = sf::Joystick::PovX;
    else if ( axisStr == "AxisPovY" ) axis = sf::Joystick::PovY;
    else return;

    //Update variable value
    variable.SetValue(sf::Joystick::getAxisPosition(joystick, axis));

    return;
}
