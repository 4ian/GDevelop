/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Event.h"

vector <BaseEventSPtr> BaseEvent::badSubEvents;

BaseEvent::BaseEvent()
#ifdef GDE
: selected(false),
eventRenderingNeedUpdate(true),
renderedEventBitmap(1,1,-1),
renderedWidth(1)
#endif
{
}

std::vector < BaseEventSPtr > GD_API CloneVectorOfEvents(const vector < BaseEventSPtr > & events)
{
    std::vector < BaseEventSPtr > newVector;

    vector<BaseEventSPtr>::const_iterator e = events.begin();
    vector<BaseEventSPtr>::const_iterator end = events.end();

    for(;e != end;++e)
        newVector.push_back((*e)->Clone());

    return newVector;
}
