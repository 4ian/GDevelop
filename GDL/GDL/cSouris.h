#ifndef CSOURIS_H_INCLUDED
#define CSOURIS_H_INCLUDED

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

bool CondSourisX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondSourisY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondSourisBouton( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );


#endif // CSOURIS_H_INCLUDED
