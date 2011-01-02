#ifndef ASCENE_H
#define ASCENE_H

class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool ActQuit( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActScene( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // ASCENE_H
