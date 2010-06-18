#ifndef AJOYSTICK_H
#define AJOYSTICK_H

#include <vector>
#include <string>
#include <iostream>
#include <sstream>
#include <iostream>
#include "GDL/CommonTools.h"
#include "GDL/RuntimeScene.h"

bool ActGetJoystickAxis( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // AJOYSTICK_H
