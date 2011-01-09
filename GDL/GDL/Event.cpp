/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Event.h"

vector <BaseEventSPtr> BaseEvent::badSubEvents;

BaseEvent::BaseEvent() :
#if defined(GD_IDE_ONLY)
selected(false),
eventHeightNeedUpdate(true),
totalTimeDuringLastSession(0),
#endif
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
        #if defined(GD_IDE_ONLY) //Profiling can be enabled in editor
        newVector.push_back(CloneRememberingOriginalEvent(*e));
        #else
        newVector.push_back((*e)->Clone());
        #endif
    }

    return newVector;
}

BaseEventSPtr CloneRememberingOriginalEvent(BaseEventSPtr event)
{
    BaseEventSPtr copy = event->Clone();
    #if defined(GD_IDE_ONLY)
    //Original event is either the original event of the copied event, or the event copied.
    copy->originalEvent = event->originalEvent.expired() ? event : event->originalEvent;
    #endif

    return copy;
}
