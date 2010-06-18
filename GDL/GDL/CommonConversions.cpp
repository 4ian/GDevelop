#include "GDL/CommonConversions.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/GDExpression.h"
#include "GDL/StrExpressionInstruction.h"
#include "GDL/ExpressionInstruction.h"

/**
 * Expression function for converting a math expression to a sting
 */
string ExpToStr(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction)
{
    return ToString(exprInstruction.parameters[0].GetAsMathExpressionResult(scene, objectsConcerned, obj1, obj2));
}

/**
 * Expression function for converting a text expression to a number
 */
double ExpToNumber(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction)
{
    return ToDouble(exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned, obj1, obj2));
}
