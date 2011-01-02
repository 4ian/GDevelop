#ifndef ALAYER_H
#define ALAYER_H

class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool ActShowLayer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActHideLayer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // ALAYER_H
