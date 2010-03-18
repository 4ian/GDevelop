#ifndef ACAMERA_H_INCLUDED
#define ACAMERA_H_INCLUDED


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
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"

bool ActCameraViewport( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActCameraSize( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActAddCamera( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActDeleteCamera( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActFixCamera( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActCentreCamera( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActZoomCamera( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActRotateCamera( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

#endif // ACAMERA_H_INCLUDED
