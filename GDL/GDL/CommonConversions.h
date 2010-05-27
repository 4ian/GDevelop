#ifndef COMMONCONVERSIONS_H
#define COMMONCONVERSIONS_H

#include <string>
#include <boost/shared_ptr.hpp>
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class StrExpressionInstruction;
class ExpressionInstruction;
class Object;
typedef boost::shared_ptr<Object> ObjSPtr;

std::string ExpToStr(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction);
double ExpToNumber(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction);


#endif // COMMONCONVERSIONS_H
