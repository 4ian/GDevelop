/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef JOYSTICKTOOLS_H
#define JOYSTICKTOOLS_H
#include <string>
class RuntimeScene;

bool GD_API JoystickButtonDown( RuntimeScene & scene, unsigned int joystick, unsigned int button );
double GD_API GetJoystickAxisValue( RuntimeScene & scene, unsigned int joystick, const std::string & axisStr );
void GD_API JoystickAxisValueToVariable( RuntimeScene & scene, unsigned int joystick, const std::string & axisStr, const std::string & variable );

#endif // JOYSTICKTOOLS_H
