#include "GDL/cScene.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"

bool CondSceneBegins( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    return scene->IsFirstLoop() ^ condition.IsInverted();
}

bool CondAlways( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    return !condition.IsInverted();
}
