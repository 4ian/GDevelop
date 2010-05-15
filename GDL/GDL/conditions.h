/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef CONDITIONS_H_INCLUDED
#define CONDITIONS_H_INCLUDED

#include <vector>
#include <string>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include <iostream>

//Toutes les conditions
#include "GDL/cADS.h"
#include "GDL/cClavier.h"
#include "GDL/cCollisions.h"
#include "GDL/cTime.h"
#include "GDL/cVariables.h"
#include "GDL/cPlans.h"
#include "GDL/cCamera.h"
#include "GDL/cSouris.h"
#include "GDL/RuntimeScene.h"
#include "GDL/cVisibilite.h"
#include "GDL/cObjet.h"
#include "GDL/cScene.h"
#include "GDL/cPos.h"
#include "GDL/cMove.h"
#include "GDL/cFichier.h"
#include "GDL/cMusic.h"
#include "GDL/cJoystick.h"
#include "GDL/cLayer.h"
#include "GDL/cScale.h"

//Les "autres" conditions
bool CondEgal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

#endif // CONDITIONS_H_INCLUDED
