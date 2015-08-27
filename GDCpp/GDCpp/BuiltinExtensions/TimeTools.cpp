#include "TimeTools.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/ManualTimer.h"

bool GD_API TimerElapsedTime( RuntimeScene & scene, double time, const gd::String & timerName )
{
    if ( timerName.empty() ) return false;

    //Le timer existe il ? on parcourt la liste.
    for ( std::size_t i = 0;i < scene.timers.size();i++ )
    {
        //On cherche le nom du timer
        if ( scene.timers[i].GetName() == timerName )
        {
            return ( scene.timers[i].GetTime() >= time*1000000.0 );
        }

    }

    return true;
}

double GD_API GetTimerElapsedTimeInSeconds( RuntimeScene & scene, const gd::String & timerName )
{
    if ( timerName.empty() ) return 0;

    for ( std::size_t i = 0;i < scene.timers.size();i++ )
    {
        if ( scene.timers[i].GetName() == timerName )
        {
            return ( static_cast<double>(scene.timers[i].GetTime())/1000000.0 );
        }
    }

    return 0;
}

bool GD_API TimerPaused( RuntimeScene & scene, const gd::String & timerName )
{
    if ( timerName.empty() ) return false;

    //Le timer existe il ? on parcourt la liste.
    for ( std::size_t i = 0;i < scene.timers.size();i++ )
    {
        //On cherche le nom du timer
        if ( scene.timers[i].GetName() == timerName )
        {
            return scene.timers[i].IsPaused();
        }

    }

    return false;
}

double GD_API GetTimeScale( RuntimeScene & scene )
{
    return scene.GetTimeScale();
}

void GD_API ResetTimer( RuntimeScene & scene, const gd::String & timerName )
{
    if ( timerName.empty() ) return;

    //Le timer existe il ? on parcourt la liste.
    for ( std::size_t i = 0;i < scene.timers.size();i++ )
    {
        //On cherche le nom du timer
        if ( scene.timers[i].GetName() == timerName )
        {
            //On l'a trouv� !
            scene.timers[i].Reset();
            return;
        }
    }

    //Il n'existe pas, on l'ajoute
    scene.timers.push_back( ManualTimer(timerName) );

    return;
}

void GD_API PauseTimer( RuntimeScene & scene, const gd::String & timerName )
{
    if ( timerName.empty() ) return;

    //Le timer existe il ? on parcourt la liste.
    for ( std::size_t i = 0;i < scene.timers.size();i++ )
    {
        //On cherche le nom du timer
        if ( scene.timers[i].GetName() == timerName )
        {
            //On l'a trouv� !
            scene.timers[i].SetPaused(true);
            return;
        }
    }

    //Il n'existe pas, on l'ajoute
    scene.timers.push_back( ManualTimer(timerName) );
    scene.timers.back().SetPaused(true);

    return;
}

void GD_API UnPauseTimer( RuntimeScene & scene, const gd::String & timerName )
{
    if ( timerName.empty() ) return;

    //Le timer existe il ? on parcourt la liste.
    for ( std::size_t i = 0;i < scene.timers.size();i++ )
    {
        //On cherche le nom du timer
        if ( scene.timers[i].GetName() == timerName )
        {
            //On l'a trouv� !
            scene.timers[i].SetPaused(false);
            return;
        }
    }

    //Il n'existe pas, on l'ajoute
    scene.timers.push_back( ManualTimer(timerName) );
    scene.timers.back().SetPaused(false);

    return;
}

/**
 * Remove a timer from memory
 */
void GD_API RemoveTimer( RuntimeScene & scene, const gd::String & timerName )
{
    if ( timerName.empty() ) return;

    for ( std::size_t i = 0;i < scene.timers.size();i++ )
    {
        if ( scene.timers[i].GetName() == timerName )
        {
            scene.timers.erase(scene.timers.begin() + i);
            return;
        }
    }
}

void GD_API SetTimeScale( RuntimeScene & scene, double value )
{
    scene.SetTimeScale(value);
}

double GD_API GetElapsedTimeInSeconds(RuntimeScene & scene)
{
    return scene.GetElapsedTime()/1000000.0;
}

double GD_API GetTimeFromStartInSeconds(RuntimeScene & scene)
{
    return static_cast<double>(scene.GetTimeFromStart())/1000000.0;
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
