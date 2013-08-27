/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
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

