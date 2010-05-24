#ifndef COMMONINSTRUCTIONS_H
#define COMMONINSTRUCTIONS_H

#include <string>
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class StrExpressionInstruction;
class ExpressionInstruction;

bool ActionForEachObject( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ConditionForEachObject( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

bool ConditionOr( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool ConditionNot( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

#endif // COMMONINSTRUCTIONS_H
