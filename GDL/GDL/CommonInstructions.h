/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef COMMONINSTRUCTIONS_H
#define COMMONINSTRUCTIONS_H

#include <string>
#include <boost/shared_ptr.hpp>
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Object;
class StrExpressionInstruction;
class ExpressionInstruction;
typedef boost::shared_ptr<Object> ObjSPtr;

bool ActionForEachObject( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ConditionForEachObject( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

bool AutomatismActionForEachObject( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool AutomatismConditionForEachObject( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

bool ConditionOr( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool ConditionAnd( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool ConditionNot( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

std::string ExpConstantText(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction);
double ExpObjectFunction( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction);
double ExpAutomatismFunction( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction);

std::string ExpObjectStrFunction( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction);
std::string ExpAutomatismStrFunction( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction);

#endif // COMMONINSTRUCTIONS_H
