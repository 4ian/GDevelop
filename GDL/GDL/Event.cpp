/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "GDL/Event.h"

vector <BaseEventSPtr> BaseEvent::badSubEvents;

BaseEvent::BaseEvent() :
folded(false),
eventHeightNeedUpdate(true),
totalTimeDuringLastSession(0),
percentDuringLastSession(0),
disabled(false)
{
}

BaseEvent::~BaseEvent()
{
}

std::vector < BaseEventSPtr > GD_API CloneVectorOfEvents(const vector < BaseEventSPtr > & events)
{
    std::vector < BaseEventSPtr > newVector;

    vector<BaseEventSPtr>::const_iterator e = events.begin();
    vector<BaseEventSPtr>::const_iterator end = events.end();

    for(;e != end;++e)
    {
        //Profiling can be enabled
        newVector.push_back(CloneRememberingOriginalEvent(*e));
    }

    return newVector;
}

BaseEventSPtr CloneRememberingOriginalEvent(BaseEventSPtr event)
{
    BaseEventSPtr copy = event->Clone();
    //Original event is either the original event of the copied event, or the event copied.
    copy->originalEvent = event->originalEvent.expired() ? event : event->originalEvent;

    return copy;
}

#endif
