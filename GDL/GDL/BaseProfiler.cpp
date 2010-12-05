/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GDE)

#include "BaseProfiler.h"

BaseProfiler::BaseProfiler() :
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
