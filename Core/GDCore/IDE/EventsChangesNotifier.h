/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef GDCORE_EVENTSCHANGENOTIFIER_H
#define GDCORE_EVENTSCHANGENOTIFIER_H
#include <vector>
#include "GDCore/String.h"
#include <memory>
#include <memory>
namespace gd { class Layout; }
namespace gd { class EventsList; }
namespace gd { class Project; }
namespace gd { class ExternalEvents; }
namespace gd { class Platform; }
namespace gd { class BaseEvent; }
namespace gd { class Instruction; }
namespace gd {typedef std::shared_ptr<gd::BaseEvent> BaseEventSPtr;}

namespace gd
{

/**
 * \brief Tools functions that must be used by the IDE (especially the events editors) when changes occurred in the events
 * of a layout or in external events.
 */
class GD_CORE_API EventsChangesNotifier
{
public:
    static void NotifyChangesInEventsOfScene(gd::Project & project, gd::Layout & layout);
    static void NotifyChangesInEventsOfExternalEvents(gd::Project & project, gd::ExternalEvents & externalEvents);

private:
    /**
     * Fill layouts and externalEvents vector with pointers to layouts and external events linked (even indirectly) by the events.
     *
     * \see EventsChangesNotifier::NotifyChangesInEventsOfScene
     * \see EventsChangesNotifier::NotifyChangesInEventsOfExternalEvents
     */
    static void GetScenesAndExternalEventsLinkedTo(const gd::EventsList & events, gd::Project & project, std::vector< gd::Layout * > & layouts, std::vector< gd::ExternalEvents * > & externalEvents);

    EventsChangesNotifier() {};
    virtual ~EventsChangesNotifier() {};
};

}

#endif // GDCORE_EVENTSCHANGENOTIFIER_H
