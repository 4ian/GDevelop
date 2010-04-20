/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

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

using namespace std;

bool ActQuit( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    scene->GotoSceneWhenEventsAreFinished(-2);
    return true;
}

bool ActScene( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    string returnNom = eval.EvalTxt(action.GetParameter(0));

    for ( unsigned int i = 0;i < scene->game->scenes.size() ; ++i )
    {
        if ( scene->game->scenes[i]->GetName() == returnNom )
        {
            scene->GotoSceneWhenEventsAreFinished(i);
            return true;
        }
    }

   return false;
}
