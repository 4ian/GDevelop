/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/StringExpressions.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"

/**
 * Expression function for getting a substring from a string
 */
string ExpSubStr(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction)
{
    size_t start = exprInstruction.parameters[1].GetAsMathExpressionResult(scene, objectsConcerned, obj1, obj2);
    size_t length = exprInstruction.parameters[2].GetAsMathExpressionResult(scene, objectsConcerned, obj1, obj2);
    std::string str = exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned, obj1, obj2);

    if ( start < str.length() )
        return str.substr(start, length);

    return "";
}
