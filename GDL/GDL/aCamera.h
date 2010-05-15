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
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"

bool ActCameraViewport( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActCameraSize( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActAddCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActDeleteCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActFixCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActCentreCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActZoomCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActRotateCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // ACAMERA_H_INCLUDED
