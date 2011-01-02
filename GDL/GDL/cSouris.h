#ifndef CSOURIS_H_INCLUDED
#define CSOURIS_H_INCLUDED

class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool CondSourisX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondSourisY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondSourisBouton( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );


#endif // CSOURIS_H_INCLUDED
