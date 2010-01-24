#ifndef AJOYSTICK_H
#define AJOYSTICK_H

#include <vector>
#include <string>
#include <iostream>
#include <sstream>
#include <iostream>
#include "GDL/algo.h"
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"

bool ActGetJoystickAxis( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

#endif // AJOYSTICK_H
