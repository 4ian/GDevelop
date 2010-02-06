#ifndef AESACTIONS_H_INCLUDED
#define AESACTIONS_H_INCLUDED

class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;

bool ActEncryptFile( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActDecryptFile( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

#endif // AESACTIONS_H_INCLUDED
