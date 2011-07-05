#include "GDL/cScene.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"

bool CondAlways( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    return !condition.IsInverted();
}
