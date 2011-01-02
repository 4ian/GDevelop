#ifndef ANET_H
#define ANET_H

class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool ActEnvoiDataNet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActDownloadFile( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // ANET_H
