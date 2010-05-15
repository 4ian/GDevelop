#ifndef CTIME_H_INCLUDED
#define CTIME_H_INCLUDED


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
#include "GDL/RuntimeScene.h"
#include "GDL/Access.h"

bool CondTimer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondTimerPaused( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondTimeScale( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

#endif // CTIME_H_INCLUDED
