#ifndef AVARIABLES_H_INCLUDED
#define AVARIABLES_H_INCLUDED

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/Collisions.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include "GDL/ListVariable.h"
#include "GDL/RuntimeScene.h"

bool ActModVarScene( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActModVarGlobal( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActModVarSceneTxt( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActModVarGlobalTxt( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

/**
 * Helper function, only for internal ( ActModVarScene, ActModVarGlobal ) use.
 */
bool ModVar( ListVariable & variables, string varName, string modOperator, double value );

/**
 * Helper function, only for internal ( ActModVarSceneTxt, ActModVarGlobalTxt ) use.
 */
bool ModVarTxt( ListVariable & variables, string varName, string modOperator, string value );

#endif // AVARIABLES_H_INCLUDED
