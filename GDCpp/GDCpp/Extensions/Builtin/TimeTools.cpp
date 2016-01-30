#include "TimeTools.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/ManualTimer.h"

bool GD_API TimerElapsedTime( RuntimeScene & scene, double timeInSeconds, const gd::String & timerName )
{
    if (!scene.GetTimeManager().HasTimer(timerName)) 
        return true; //Inconsistency to keep compatibility with games relying on this behavior.

    return scene.GetTimeManager().GetTimer(timerName).GetTime() >= timeInSeconds*1000000.0;
}

double GD_API GetTimerElapsedTimeInSeconds( RuntimeScene & scene, const gd::String & timerName )
{
    return static_cast<double>(scene.GetTimeManager().GetTimer(timerName).GetTime())/1000000.0;
}

bool GD_API TimerPaused( RuntimeScene & scene, const gd::String & timerName )
{
    if (!scene.GetTimeManager().HasTimer(timerName)) return false;

    return scene.GetTimeManager().GetTimer(timerName).IsPaused();
}

double GD_API GetTimeScale( RuntimeScene & scene )
{
    return scene.GetTimeManager().GetTimeScale();
}

void GD_API ResetTimer( RuntimeScene & scene, const gd::String & timerName )
{
    if (!scene.GetTimeManager().HasTimer(timerName))
        scene.GetTimeManager().AddTimer(timerName);

    scene.GetTimeManager().GetTimer(timerName).Reset();
}

void GD_API PauseTimer( RuntimeScene & scene, const gd::String & timerName )
{
    if (!scene.GetTimeManager().HasTimer(timerName))
        scene.GetTimeManager().AddTimer(timerName);

    scene.GetTimeManager().GetTimer(timerName).SetPaused(true);
}

void GD_API UnPauseTimer( RuntimeScene & scene, const gd::String & timerName )
{
    if (!scene.GetTimeManager().HasTimer(timerName))
        scene.GetTimeManager().AddTimer(timerName);

    scene.GetTimeManager().GetTimer(timerName).SetPaused(false);
}

void GD_API RemoveTimer( RuntimeScene & scene, const gd::String & timerName )
{
    scene.GetTimeManager().RemoveTimer(timerName);
}

void GD_API SetTimeScale( RuntimeScene & scene, double value )
{
    scene.GetTimeManager().SetTimeScale(value);
}

double GD_API GetElapsedTimeInSeconds(RuntimeScene & scene)
{
    return scene.GetTimeManager().GetElapsedTime()/1000000.0;
}

double GD_API GetTimeFromStartInSeconds(RuntimeScene & scene)
{
    return static_cast<double>(scene.GetTimeManager().GetTimeFromStart())/1000000.0;
}

double GD_API GetTime( const RuntimeScene & scene, const gd::String & parameter )
{
    time_t rawtime = time(0);
    struct tm * timeinfo = localtime ( &rawtime );

    if ( parameter == "hour" )
        return timeinfo->tm_hour;
    else if ( parameter == "min" )
        return timeinfo->tm_min;
    else if ( parameter == "sec" )
        return timeinfo->tm_sec;
    else if ( parameter == "mday" )
        return timeinfo->tm_mday;
    else if ( parameter == "mon" )
        return timeinfo->tm_mon;
    else if ( parameter == "year" )
        return timeinfo->tm_year;
    else if ( parameter == "wday" )
        return timeinfo->tm_wday;
    else if ( parameter == "yday" )
        return timeinfo->tm_yday;

    return 0;
}
