/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef JOYSTICKTOOLS_H
#define JOYSTICKTOOLS_H
#include <string>
class RuntimeScene;
namespace gd { class Variable; }

bool GD_API JoystickButtonDown( RuntimeScene & scene, unsigned int joystick, unsigned int button );
double GD_API GetJoystickAxisValue( RuntimeScene & scene, unsigned int joystick, const std::string & axisStr );
void GD_API JoystickAxisValueToVariable( RuntimeScene & scene, unsigned int joystick, const std::string & axisStr, gd::Variable & variable );

#endif // JOYSTICKTOOLS_H
