
#include "GDL/aAdvanced.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Access.h"
#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include <string>
#include <vector>

using namespace std;

bool ActMoveObjects( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    for (unsigned int i = 0;i<scene->objets.size();++i)
    {
        scene->objets.at( i )->SetX( scene->objets.at( i )->GetX() + scene->objets.at( i )->TotalForceX() * scene->GetElapsedTime() );
        scene->objets.at( i )->SetY( scene->objets.at( i )->GetY() + scene->objets.at( i )->TotalForceY() * scene->GetElapsedTime() );

        scene->objets.at( i )->UpdateForce( scene->GetElapsedTime() );
    }

    return true;
}
