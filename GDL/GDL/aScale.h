#ifndef ASCALE_H
#define ASCALE_H

#include <vector>
#include <string>
#include <iostream>
#include <sstream>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/RuntimeScene.h"

bool ActChangeScale( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActChangeScaleWidth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActChangeScaleHeight( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // ASCALE_H
