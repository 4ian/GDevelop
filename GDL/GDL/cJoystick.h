#ifndef CJOYSTICK_H
#define CJOYSTICK_H

class RuntimeScene;
class ObjectsConcerned;
class Instruction;


bool CondJoystickButtonDown( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondJoystickAxis( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

#endif // CJOYSTICK_H
