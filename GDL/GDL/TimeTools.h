#ifndef TIMETOOLS_H
#define TIMETOOLS_H

#include <string>
class RuntimeScene;

bool GD_API TimerElapsedTime( RuntimeScene & scene, float time, std::string timerName );
bool GD_API TimerPaused( RuntimeScene & scene, std::string timerName );
double GD_API GetTimeScale( RuntimeScene & scene );
void GD_API ResetTimer( RuntimeScene & scene, std::string timerName );
void GD_API ActPauseTimer( RuntimeScene & scene, std::string timerName );
void GD_API UnPauseTimer( RuntimeScene & scene, std::string timerName );
void GD_API RemoveTimer( RuntimeScene & scene, std::string timerName );
void GD_API SetTimeScale( RuntimeScene & scene, double value );
double GD_API GetElapsedTime(RuntimeScene & scene);
double GD_API GetTimeFromStart(RuntimeScene & scene);
double GD_API GetTimeScale(RuntimeScene & scene);
double GD_API GetTime( const RuntimeScene & scene, std::string parameter );

#endif // TIMETOOLS_H
