#ifndef ATIME_H_INCLUDED
#define ATIME_H_INCLUDED

class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool ActResetTimer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActPauseTimer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActUnPauseTimer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActRemoveTimer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActChangeTimeScale( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // ATIME_H_INCLUDED
