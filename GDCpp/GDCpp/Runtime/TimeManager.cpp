/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "TimeManager.h"

void TimeManager::Reset()
{
    firstLoop = true;
    firstUpdateDone = false;
    elapsedTime = 0;
    timeScale = 1;
    timeFromStart = 0;
    pauseTime = 0;

    timers.clear();
}

bool TimeManager::Update(signed int realElapsedTime, double minimumFPS)
{
    if (firstUpdateDone) firstLoop = false;
    firstUpdateDone = true;

    //Update time elapsed since last frame
    realElapsedTime -= pauseTime;
    if (realElapsedTime < 0) realElapsedTime = 0;

    //Make sure that the elapsed time is not beyond the limit (slow down the game if necessary)
    if ( minimumFPS != 0 && realElapsedTime > 1000000.0/minimumFPS )
        realElapsedTime = 1000000.0/minimumFPS;

    //Apply time scale
    elapsedTime = realElapsedTime*timeScale;

    //Update timers
    timeFromStart += elapsedTime;
    pauseTime = 0;

    for (auto it = timers.begin();it != timers.end();++it)
        it->second.UpdateTime(elapsedTime);

    return true;
}

void TimeManager::AddTimer(gd::String name)
{
    ManualTimer newTimer;
    timers[name] = newTimer;
}

bool TimeManager::HasTimer(gd::String name) const
{
    return timers.find(name) != timers.end();
}

ManualTimer & TimeManager::GetTimer(gd::String name)
{
    if (!HasTimer(name)) return nullTimer;

    return timers[name];
}

void TimeManager::RemoveTimer(gd::String name)
{
    if (!HasTimer(name)) return;

    timers.erase(name);
}
