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
#include "GDL/algo.h"
#include "GDL/Force.h"
#include "GDL/RuntimeScene.h"

bool CondCameraWidth( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondCameraHeight( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondCameraX( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondCameraY( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondCameraAngle( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );


#endif // CCAMERA_H_INCLUDED
