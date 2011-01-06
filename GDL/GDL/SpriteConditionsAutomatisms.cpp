#include "GDL/Object.h"
#include "GDL/Automatism.h"

bool Object::CondAutomatismActivated( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    return GetAutomatism(condition.GetParameter(1).GetAsObjectIdentifier())->Activated();
}
