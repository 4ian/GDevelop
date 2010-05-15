#ifndef CCLAVIER_H_INCLUDED
#define CCLAVIER_H_INCLUDED

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

bool CondKeyPressed( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

#endif // CCLAVIER_H_INCLUDED
