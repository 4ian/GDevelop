/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef JOYSTICKTOOLS_H
#define JOYSTICKTOOLS_H

#include <string>
#include "GDCpp/Runtime/String.h"

class RuntimeScene;
namespace gd { class Variable; }

bool GD_API JoystickButtonDown( RuntimeScene & scene, unsigned int joystick, unsigned int button );
double GD_API GetJoystickAxisValue( RuntimeScene & scene, unsigned int joystick, const gd::String & axisStr );
void GD_API JoystickAxisValueToVariable( RuntimeScene & scene, unsigned int joystick, const gd::String & axisStr, gd::Variable & variable );

#endif // JOYSTICKTOOLS_H
