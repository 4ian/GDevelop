/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/aAdvanced.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include <string>
#include <vector>

using namespace std;

bool ActMoveObjects( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    ObjList allObjects = scene.objectsInstances.GetAllObjects();

    for (unsigned int id = 0;id < allObjects.size();++id)
    {
        allObjects[id]->SetX( allObjects[id]->GetX() + allObjects[id]->TotalForceX() * scene.GetElapsedTime() );
        allObjects[id]->SetY( allObjects[id]->GetY() + allObjects[id]->TotalForceY() * scene.GetElapsedTime() );

        allObjects[id]->UpdateForce( scene.GetElapsedTime() );
    }

    return true;
}
