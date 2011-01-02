/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
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
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/RuntimeScene.h"

using namespace std;

bool ActQuit( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    scene.GotoSceneWhenEventsAreFinished(-2);
    return true;
}

bool ActScene( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    string returnNom = action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned);

    for ( unsigned int i = 0;i < scene.game->scenes.size() ; ++i )
    {
        if ( scene.game->scenes[i]->GetName() == returnNom )
        {
            scene.GotoSceneWhenEventsAreFinished(i);
            return true;
        }
    }

   return false;
}
