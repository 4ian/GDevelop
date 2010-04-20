#ifndef ASCENE_H
#define ASCENE_H

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/aScene.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"
#include <string>
#include <vector>

using namespace std;

bool ActQuit( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActScene( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

#endif // ASCENE_H
