#ifndef AFICHIER_H
#define AFICHIER_H

#include "GDL/tinyxml.h"
class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool ActLaunchFile( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActExecuteCmd( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

bool ActLoadFile( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActUnloadFile( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

bool ActDeleteFichier( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

bool ActDeleteGroupFichier( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

bool ActEcrireFichierExp( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActEcrireFichierTxt( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

bool ActLireFichierExp( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActLireFichierTxt( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
#endif // AFICHIER_H
