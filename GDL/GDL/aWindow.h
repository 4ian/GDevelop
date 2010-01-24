#ifndef AWINDOW_H
#define AWINDOW_H

#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"
#include "GDL/Access.h"
#include <string>
#include <vector>

using namespace std;

bool ActSetWindowSize( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActSetFullScreen( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

#endif // AWINDOW_H
