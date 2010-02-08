#include "GDL/Object.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "TextObject.h"

double TextObject::ExpOpacity( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return opacity;
}

double TextObject::ExpAngle( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return angle;
}

