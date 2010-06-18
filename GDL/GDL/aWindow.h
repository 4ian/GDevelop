#ifndef AWINDOW_H
#define AWINDOW_H

#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"

#include <string>
#include <vector>

using namespace std;

bool ActSetWindowSize( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActSetFullScreen( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // AWINDOW_H
