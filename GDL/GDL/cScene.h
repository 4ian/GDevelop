#ifndef CSCENE_H
#define CSCENE_H

class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;

bool CondSceneBegins( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondAlways( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

#endif // CSCENE_H
