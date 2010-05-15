#ifndef ATIME_H_INCLUDED
#define ATIME_H_INCLUDED

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"

bool ActResetTimer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActPauseTimer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActUnPauseTimer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActChangeTimeScale( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // ATIME_H_INCLUDED
