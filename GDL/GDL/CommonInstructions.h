/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
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

bool ConditionOr( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool ConditionNot( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

#endif // COMMONINSTRUCTIONS_H
