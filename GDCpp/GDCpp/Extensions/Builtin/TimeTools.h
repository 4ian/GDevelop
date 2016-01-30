#ifndef TIMETOOLS_H
#define TIMETOOLS_H

#include <string>
#include "GDCpp/Runtime/String.h"

class RuntimeScene;

bool GD_API TimerElapsedTime( RuntimeScene & scene, double time, const gd::String & timerName );
bool GD_API TimerPaused( RuntimeScene & scene, const gd::String & timerName );
double GD_API GetTimeScale( RuntimeScene & scene );
double GD_API GetTimerElapsedTimeInSeconds( RuntimeScene & scene, const gd::String & timerName );
void GD_API ResetTimer( RuntimeScene & scene, const gd::String & timerName );
void GD_API PauseTimer( RuntimeScene & scene, const gd::String & timerName );
void GD_API UnPauseTimer( RuntimeScene & scene, const gd::String & timerName );
void GD_API RemoveTimer( RuntimeScene & scene, const gd::String & timerName );
void GD_API SetTimeScale( RuntimeScene & scene, double value );
double GD_API GetElapsedTimeInSeconds(RuntimeScene & scene);
double GD_API GetTimeFromStartInSeconds(RuntimeScene & scene);
double GD_API GetTimeScale(RuntimeScene & scene);
double GD_API GetTime( const RuntimeScene & scene, const gd::String & parameter );

#endif // TIMETOOLS_H
