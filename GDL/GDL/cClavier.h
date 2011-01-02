#ifndef CCLAVIER_H_INCLUDED
#define CCLAVIER_H_INCLUDED

class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool CondKeyPressed( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondKeyFromTextPressed( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondAnyKeyPressed( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
#endif // CCLAVIER_H_INCLUDED
