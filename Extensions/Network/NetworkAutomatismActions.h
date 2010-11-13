#ifndef NETWORKAUTOMATISMACTIONS_H
#define NETWORKAUTOMATISMACTIONS_H
class Instruction;
class RuntimeScene;
class ObjectsConcerned;

bool ActGenereateObjectNetworkId( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // NETWORKAUTOMATISMACTIONS_H
