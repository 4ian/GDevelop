#ifndef CSCENE_H
#define CSCENE_H

class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;

bool CondSceneBegins( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondAlways( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );

#endif // CSCENE_H
