/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)

#include "BaseProfiler.h"

/**
 * Reset() only reset the profile clock, not the time registered.
 */
void ProfileLink::Reset()
{
    profileClock.reset();
}

/**
 * Add the time of the profile clock to the total time.
 */
void ProfileLink::Stop()
{
    time += profileClock.getTimeMicroseconds();
}

BaseProfiler::BaseProfiler() :
profilingActivated(false),
lastEventsTime(0),
lastRenderingTime(0),
totalSceneTime(0),
totalEventsTime(0),
stepTime(50)
{
    //ctor
}

void BaseProfiler::Update()
{
    if ( stepClock.GetElapsedTime() > stepTime )
    {
        UpdateGUI();
        stepClock.Reset();
    }
}

void BaseProfiler::Reset()
{
    lastEventsTime = 0;
    lastRenderingTime = 0;
    totalSceneTime = 0;
    totalEventsTime = 0;

    for (unsigned int i = 0;i<profileEventsInformation.size();++i)
    {
        profileEventsInformation[i].time = 0;
    }
}
#endif
