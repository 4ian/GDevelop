/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)

#include "BaseProfiler.h"

BaseProfiler::BaseProfiler() :
profilingActivated(false),
lastEventsTime(0),
lastRenderingTime(0),
totalSceneTime(0),
totalEventsTime(0),
stepTime(0.050f)
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
}
#endif
