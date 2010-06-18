#ifndef CFICHIER_H
#define CFICHIER_H

#include "GDL/tinyxml.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"

#include <vector>
#include <string>

bool CondFileExists( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondGroupExists( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

#endif // CFICHIER_H
