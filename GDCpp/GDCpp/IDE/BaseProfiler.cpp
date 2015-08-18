/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
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
    if ( stepClock.getElapsedTime().asMilliseconds() > stepTime )
    {
        UpdateGUI();
        stepClock.restart();
    }
}

void BaseProfiler::Reset()
{
    lastEventsTime = 0;
    lastRenderingTime = 0;
    totalSceneTime = 0;
    totalEventsTime = 0;

    for (std::size_t i = 0;i<profileEventsInformation.size();++i)
    {
        profileEventsInformation[i].time = 0;
    }
}
#endif
