#ifndef NetworkEXPRESSIONS_H
#define NetworkEXPRESSIONS_H

#include <string>
#include "GDL/Object.h"
class RuntimeScene;
class ObjectsConcerned;
class StrExpressionInstruction;
class ExpressionInstruction;

std::string ExpGetReceivedDataString( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction );
double ExpGetReceivedDataValue( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
std::string ExpGetLastError( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction );

#endif // NetworkEXPRESSIONS_H
