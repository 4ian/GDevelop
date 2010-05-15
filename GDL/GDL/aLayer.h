#ifndef ALAYER_H
#define ALAYER_H

#include <vector>
#include <string>
#include <iostream>
#include <cmath>
#include <sstream>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"

bool ActShowLayer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActHideLayer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // ALAYER_H
