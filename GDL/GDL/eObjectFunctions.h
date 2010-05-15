#ifndef EOBJECTFUNCTIONS_H
#define EOBJECTFUNCTIONS_H

#include <vector>
#include <string>

class RuntimeScene;
class Object;
class ExpressionInstruction;

const std::map<std::string, double (Object::*)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )> &
GetExpObjectBuiltinTable();

#endif // EOBJECTFUNCTIONS_H
