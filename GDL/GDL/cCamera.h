/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef CCAMERA_H_INCLUDED
#define CCAMERA_H_INCLUDED

class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool CondCameraWidth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondCameraHeight( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondCameraX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondCameraY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondCameraAngle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );


#endif // CCAMERA_H_INCLUDED
