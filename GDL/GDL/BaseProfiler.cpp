/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GDE)

#include "BaseProfiler.h"

BaseProfiler::BaseProfiler() :
lastEventsTime(0),
lastRenderingTime(0)
{
    //ctor
}

void BaseProfiler::Update()
{
    if ( timeInterval.GetElapsedTime() > 0.200 )
    {
        UpdateGUI();
        timeInterval.Reset();
    }
}
#endif
