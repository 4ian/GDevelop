#ifndef ACAMERA_H_INCLUDED
#define ACAMERA_H_INCLUDED

class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool ActCameraViewport( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActCameraSize( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActAddCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActDeleteCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActFixCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActCentreCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActZoomCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActRotateCamera( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // ACAMERA_H_INCLUDED
