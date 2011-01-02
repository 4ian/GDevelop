#ifndef CTIME_H_INCLUDED
#define CTIME_H_INCLUDED

class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool CondTimer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondTimerPaused( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondTimeScale( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

#endif // CTIME_H_INCLUDED
