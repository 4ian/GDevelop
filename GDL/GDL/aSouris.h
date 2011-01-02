#ifndef ASOURIS_H_INCLUDED
#define ASOURIS_H_INCLUDED

class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool ActCentreSouris( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActCentreSourisX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActCentreSourisY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActSetSourisXY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActCacheSouris( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActMontreSouris( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // ASOURIS_H_INCLUDED
