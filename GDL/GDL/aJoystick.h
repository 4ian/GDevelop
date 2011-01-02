#ifndef AJOYSTICK_H
#define AJOYSTICK_H

class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool ActGetJoystickAxis( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // AJOYSTICK_H
