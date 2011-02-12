/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
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

/**
 * Expression function for getting a character from a string
 */
string ExpStrAt(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction)
{
    size_t pos = exprInstruction.parameters[1].GetAsMathExpressionResult(scene, objectsConcerned, obj1, obj2);
    std::string str = exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned, obj1, obj2);

    if ( pos < str.length() )
        return str.substr(pos, 1);

    return "";
}

/**
 * Expression function for getting a substring from a string
 */
double ExpStrLen(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction)
{
    std::string str = exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned, obj1, obj2);

    return str.length();
}

/**
 * Expression function for finding a string in another
 */
double ExpStrFind(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction)
{
    std::string str = exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned, obj1, obj2);

    size_t pos = str.find(exprInstruction.parameters[1].GetAsTextExpressionResult(scene, objectsConcerned, obj1, obj2));

    if ( pos != string::npos ) return pos;
    return -1;
}

/**
 * Expression function for finding a string in another
 */
double ExpStrRFind(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction)
{
    std::string str = exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned, obj1, obj2);

    size_t pos = str.rfind(exprInstruction.parameters[1].GetAsTextExpressionResult(scene, objectsConcerned, obj1, obj2));

    if ( pos != string::npos ) return pos;
    return -1;
}

/**
 * Expression function for finding a string in another
 */
double ExpStrFindFrom(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction)
{
    std::string str = exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned, obj1, obj2);

    size_t pos = str.find(exprInstruction.parameters[1].GetAsTextExpressionResult(scene, objectsConcerned, obj1, obj2), exprInstruction.parameters[2].GetAsMathExpressionResult(scene, objectsConcerned, obj1, obj2));

    if ( pos != string::npos ) return pos;
    return -1;
}

/**
 * Expression function for finding a string in another
 */
double ExpStrRFindFrom(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction)
{
    std::string str = exprInstruction.parameters[0].GetAsTextExpressionResult(scene, objectsConcerned, obj1, obj2);

    size_t pos = str.rfind(exprInstruction.parameters[1].GetAsTextExpressionResult(scene, objectsConcerned, obj1, obj2), exprInstruction.parameters[2].GetAsMathExpressionResult(scene, objectsConcerned, obj1, obj2));

    if ( pos != string::npos ) return pos;
    return -1;
}
