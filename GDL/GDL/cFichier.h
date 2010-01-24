#ifndef CFICHIER_H
#define CFICHIER_H

#include "GDL/tinyxml.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"
#include "GDL/Access.h"
#include <vector>
#include <string>

bool CondFileExists( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondGroupExists( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );

#endif // CFICHIER_H
