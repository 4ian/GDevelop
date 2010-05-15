#ifndef ASOURIS_H_INCLUDED
#define ASOURIS_H_INCLUDED

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
#include "GDL/Access.h"
#include <SFML/Graphics.hpp>
#include "GDL/RuntimeScene.h"

bool ActCentreSouris( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActCentreSourisX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActCentreSourisY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActSetSourisXY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActCacheSouris( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActMontreSouris( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // ASOURIS_H_INCLUDED
