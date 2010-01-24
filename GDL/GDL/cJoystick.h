#ifndef CJOYSTICK_H
#define CJOYSTICK_H

#include <vector>
#include <string>
#include <iostream>
#include <sstream>
#include <iostream>

#include "GDL/Object.h"
#include "GDL/algo.h"
#include "GDL/RuntimeScene.h"

bool CondJoystickButtonDown( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondJoystickAxis( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );

#endif // CJOYSTICK_H
