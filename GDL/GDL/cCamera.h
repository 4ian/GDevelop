#ifndef CCAMERA_H_INCLUDED
#define CCAMERA_H_INCLUDED

#include <vector>
#include <string>
#include <iostream>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include "GDL/RuntimeScene.h"

bool CondCameraWidth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondCameraHeight( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondCameraX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondCameraY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondCameraAngle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );


#endif // CCAMERA_H_INCLUDED
