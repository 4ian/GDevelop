/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Event.h"
/*
//This is used to make the serialization library aware that code should be instantiated for serialization
//of a given class even though the class hasn't been otherwise referred to by the program.
#include <boost/serialization/export.hpp>
BOOST_CLASS_EXPORT_IMPLEMENT(BaseEvent)*/
//TODO : Maybe declare serialization for xml_archives ?

vector <BaseEventSPtr> BaseEvent::badSubEvents;

BaseEvent::BaseEvent() :
#ifdef GDE
selected(false),
eventHeightNeedUpdate(true),
#endif
disabled(false)
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
