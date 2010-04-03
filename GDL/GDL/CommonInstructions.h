#ifndef COMMONINSTRUCTIONS_H
#define COMMONINSTRUCTIONS_H

class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;

bool ActionForEachObject( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ConditionForEachObject( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

bool ConditionOr( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

#endif // COMMONINSTRUCTIONS_H
