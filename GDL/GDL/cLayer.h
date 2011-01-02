#ifndef CLAYER_H
#define CLAYER_H

class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool CondLayerVisible( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

#endif // CLAYER_H
