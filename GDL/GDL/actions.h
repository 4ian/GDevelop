/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *  actions.h
 *
 *  Header de actions.cpp
 */

#ifndef ACTIONS_H_INCLUDED
#define ACTIONS_H_INCLUDED

//Toutes les actions
#include "GDL/ObjectsConcerned.h"
#include "GDL/aADS.h"
#include "GDL/aMove.h"
#include "GDL/aObjet.h"
#include "GDL/aPosition.h"
#include "GDL/aVariables.h"
#include "GDL/aPlans.h"
#include "GDL/aCamera.h"
#include "GDL/aSouris.h"
#include "GDL/aTime.h"
#include "GDL/aVisibilite.h"
#include "GDL/aMusic.h"
#include "GDL/aScene.h"
#include "GDL/aTexte.h"
#include "GDL/aEffects.h"
#include "GDL/aFichier.h"
#include "GDL/aGUI.h"
#include "GDL/aNet.h"
#include "GDL/aAdvanced.h"
#include "GDL/aJoystick.h"
#include "GDL/aLayer.h"
#include "GDL/aScale.h"

bool ActSceneBackground( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

#endif // ACTIONS_H_INCLUDED
