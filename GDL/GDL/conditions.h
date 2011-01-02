/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef CONDITIONS_H_INCLUDED
#define CONDITIONS_H_INCLUDED

class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool CondEgal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

#endif // CONDITIONS_H_INCLUDED
