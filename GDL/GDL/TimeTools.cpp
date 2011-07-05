#include "TimeTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ManualTimer.h"

bool TimerElapsedTime( RuntimeScene & scene, float time, std::string timerName )
{
    if ( timerName.empty() ) return false;

    //Le timer existe il ? on parcourt la liste.
    for ( unsigned int i = 0;i < scene.timers.size();i++ )
    {
        //On cherche le nom du timer
        if ( scene.timers[i].GetName() == timerName )
        {
            return ( scene.timers[i].GetTime() >= time );
        }

    }

    return true;
}

bool TimerPaused( RuntimeScene & scene, std::string timerName )
{
    if ( timerName.empty() ) return false;

    //Le timer existe il ? on parcourt la liste.
    for ( unsigned int i = 0;i < scene.timers.size();i++ )
    {
        //On cherche le nom du timer
        if ( scene.timers[i].GetName() == timerName )
        {
            return scene.timers[i].IsPaused();
        }

    }

    return false;
}

double GetTimeScale( RuntimeScene & scene )
{
    return scene.GetTimeScale();
}

void ResetTimer( RuntimeScene & scene, std::string timerName )
{
    if ( timerName.empty() ) return;

    //Le timer existe il ? on parcourt la liste.
    for ( unsigned int i = 0;i < scene.timers.size();i++ )
    {
        //On cherche le nom du timer
        if ( scene.timers[i].GetName() == timerName )
        {
            //On l'a trouvé !
            scene.timers[i].Reset();
            return;
        }
    }

    //Il n'existe pas, on l'ajoute
    scene.timers.push_back( ManualTimer(timerName) );

    return;
}

void ActPauseTimer( RuntimeScene & scene, std::string timerName )
{
    if ( timerName.empty() ) return;

    //Le timer existe il ? on parcourt la liste.
    for ( unsigned int i = 0;i < scene.timers.size();i++ )
    {
        //On cherche le nom du timer
        if ( scene.timers[i].GetName() == timerName )
        {
            //On l'a trouvé !
            scene.timers[i].SetPaused(true);
            return;
        }
    }

    //Il n'existe pas, on l'ajoute
    scene.timers.push_back( ManualTimer(timerName) );
    scene.timers.back().SetPaused(true);

    return;
}

void UnPauseTimer( RuntimeScene & scene, std::string timerName )
{
    if ( timerName.empty() ) return;

    //Le timer existe il ? on parcourt la liste.
    for ( unsigned int i = 0;i < scene.timers.size();i++ )
    {
        //On cherche le nom du timer
        if ( scene.timers[i].GetName() == timerName )
        {
            //On l'a trouvé !
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
void RemoveTimer( RuntimeScene & scene, std::string timerName )
{
    if ( timerName.empty() ) return;

    for ( unsigned int i = 0;i < scene.timers.size();i++ )
    {
        if ( scene.timers[i].GetName() == timerName )
        {
            scene.timers.erase(scene.timers.begin() + i);
            return;
        }
    }
}

void SetTimeScale( RuntimeScene & scene, double value )
{
    scene.SetTimeScale(value);
}

double GetElapsedTime(RuntimeScene & scene)
{
    return scene.GetElapsedTime();
}

double GetTimeFromStart(RuntimeScene & scene)
{
    return scene.GetTimeFromStart();
}

double GetTime( const RuntimeScene & scene, std::string parameter )
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
