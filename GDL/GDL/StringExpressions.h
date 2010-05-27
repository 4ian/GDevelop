/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef STRINGEXPRESSIONS_H
#define STRINGEXPRESSIONS_H

#include <string>
#include <boost/shared_ptr.hpp>
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Object;
class StrExpressionInstruction;
class ExpressionInstruction;
typedef boost::shared_ptr<Object> ObjSPtr;

std::string ExpSubStr(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction);


#endif // STRINGEXPRESSIONS_H
