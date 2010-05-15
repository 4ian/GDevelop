#ifndef COMMONINSTRUCTIONS_H
#define COMMONINSTRUCTIONS_H

class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;

bool ActionForEachObject( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ConditionForEachObject( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

bool ConditionOr( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool ConditionNot( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

#endif // COMMONINSTRUCTIONS_H
