#include "GDL/Object.h"
#include "GDL/Automatism.h"

bool Object::ActActivateAutomatism( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    GetAutomatism(action.GetParameter(1).GetAsObjectIdentifier())->Activate(action.GetParameter(2).GetAsBool());
    return true;
}
