#ifndef CVARIABLES_H_INCLUDED
#define CVARIABLES_H_INCLUDED


#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/ListVariable.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Access.h"

bool CondVarScene( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondVarSceneTxt( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondVarSceneDef( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondVarGlobal( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondVarGlobalTxt( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondVarGlobalDef( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );

bool CondVar( const ListVariable & variables, string varName, short int compOperator, double valueToCompare );
bool CondVarTxt( const ListVariable & variables, string varName, short int compOperator, string valueToCompare );
bool CondVarDef( const ListVariable & variables, string varName);

#endif // CVARIABLES_H_INCLUDED
