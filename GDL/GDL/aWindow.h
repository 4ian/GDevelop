#ifndef AWINDOW_H
#define AWINDOW_H

class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool ActSetWindowSize( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActSetFullScreen( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // AWINDOW_H
