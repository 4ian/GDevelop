/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "ExternalEvents.h"

ExternalEvents::ExternalEvents()
{
    //ctor
}

ExternalEvents::ExternalEvents(const ExternalEvents & externalEvents)
{
    Init(externalEvents);
}

ExternalEvents& ExternalEvents::operator=(const ExternalEvents & rhs)
{
    if ( this != &rhs )
        Init(rhs);

    return *this;
}

void ExternalEvents::Init(const ExternalEvents & externalEvents)
{
    name = externalEvents.GetName();
    events = CloneVectorOfEvents(externalEvents.events);
}

#endif
