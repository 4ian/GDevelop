#include "GDL/cScene.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"

bool CondSceneBegins( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    return scene.IsFirstLoop() ^ condition.IsInverted();
}

bool CondAlways( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    return !condition.IsInverted();
}
