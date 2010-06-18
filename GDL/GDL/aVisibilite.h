#ifndef AVISIBILITE_H_INCLUDED
#define AVISIBILITE_H_INCLUDED


#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/Collisions.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include <iostream>

#include "GDL/RuntimeScene.h"

bool ActModOpacityObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // AVISIBILITE_H_INCLUDED
