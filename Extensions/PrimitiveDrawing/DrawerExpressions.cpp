#include "GDL/Object.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "DrawerObject.h"

double DrawerObject::ExpFillOpacity( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return fillOpacity;
}

double DrawerObject::ExpOutlineOpacity( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return outlineOpacity;
}
