#ifndef CFICHIER_H
#define CFICHIER_H

#include "GDL/tinyxml.h"
class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool CondFileExists( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondGroupExists( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

#endif // CFICHIER_H
