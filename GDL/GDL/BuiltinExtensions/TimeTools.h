#ifndef TIMETOOLS_H
#define TIMETOOLS_H

#include <string>
class RuntimeScene;

bool GD_API TimerElapsedTime( RuntimeScene & scene, float time, const std::string & timerName );
bool GD_API TimerPaused( RuntimeScene & scene, const std::string & timerName );
double GD_API GetTimeScale( RuntimeScene & scene );
double GD_API GetTimerElapsedTimeInSeconds( RuntimeScene & scene, const std::string & timerName );
void GD_API ResetTimer( RuntimeScene & scene, const std::string & timerName );
void GD_API PauseTimer( RuntimeScene & scene, const std::string & timerName );
void GD_API UnPauseTimer( RuntimeScene & scene, const std::string & timerName );
void GD_API RemoveTimer( RuntimeScene & scene, const std::string & timerName );
void GD_API SetTimeScale( RuntimeScene & scene, double value );
double GD_API GetElapsedTimeInSeconds(RuntimeScene & scene);
double GD_API GetTimeFromStartInSeconds(RuntimeScene & scene);
double GD_API GetTimeScale(RuntimeScene & scene);
double GD_API GetTime( const RuntimeScene & scene, const std::string & parameter );

#endif // TIMETOOLS_H

