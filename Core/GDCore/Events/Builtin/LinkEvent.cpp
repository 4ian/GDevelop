/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include <fstream>
#include <iostream>
#include "GDCore/CommonTools.h"
#include "GDCore/Events/Builtin/GroupEvent.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Events/EventVisitor.h"

using namespace std;

namespace gd {

const EventsList* LinkEvent::GetLinkedEvents(const gd::Project& project) const {
  const EventsList* events = nullptr;
  if (project.HasExternalEventsNamed(GetTarget())) {
    const gd::ExternalEvents& linkedExternalEvents = project.GetExternalEvents(GetTarget());
    events = &linkedExternalEvents.GetEvents();
  } else if (project.HasLayoutNamed(GetTarget())) {
    const gd::Layout& linkedLayout = project.GetLayout(GetTarget());
    events = &linkedLayout.GetEvents();
  }

  // If the link only includes an events group, search it inside the
  // layout/external events
  if (events != nullptr && includeConfig == INCLUDE_EVENTS_GROUP) {
    std::size_t i = 0;
    std::size_t eventsCount = events->GetEventsCount();
    for (; i < eventsCount; ++i) {
      std::shared_ptr<const GroupEvent> groupEvent =
          std::dynamic_pointer_cast<const GroupEvent>(
              events->GetEventSmartPtr(i));
      if (groupEvent && groupEvent->GetName() == eventsGroupName) {
        // Get its sub-events
        events = &groupEvent->GetSubEvents();
        break;
      }
    }

    if (i >= eventsCount)  // We didn't find the events group, return nullptr
      events = nullptr;
  }

  return events;
}

void LinkEvent::ReplaceLinkByLinkedEvents(
    const gd::Project& project,
    EventsList& eventList,
    std::size_t indexOfTheEventInThisList) {
  linkWasInvalid = false;
  // Finding what to link to.
  const EventsList* eventsToInclude = GetLinkedEvents(project);
  if (eventsToInclude != NULL) {
    std::size_t firstEvent =
        includeConfig == INCLUDE_BY_INDEX ? GetIncludeStart() : 0;
    std::size_t lastEvent = includeConfig == INCLUDE_BY_INDEX
                                ? GetIncludeEnd()
                                : eventsToInclude->size() - 1;

    // Check bounds
    if (firstEvent >= eventsToInclude->size()) {
      std::cout << "Unable to get events from a link ( Invalid start )"
                << std::endl;
      linkWasInvalid = true;
      return;
    }
    if (lastEvent >= eventsToInclude->size()) {
      std::cout << "Unable to get events from a link ( Invalid end )"
                << std::endl;
      linkWasInvalid = true;
      return;
    }
    if (firstEvent > lastEvent) {
      std::cout << "Unable to get events from a link ( End is before start )"
                << std::endl;
      linkWasInvalid = true;
      return;
    }

    // Insert an empty event to replace the link event ( we'll delete the link
    // event at the end ) ( If we just erase the link event without adding a
    // blank event to replace it, the first event inserted by the link will not
    // be preprocessed ( and it can be annoying if it require preprocessing,
    // such as another link event ). )
    gd::EmptyEvent emptyEvent;
    eventList.InsertEvent(emptyEvent, indexOfTheEventInThisList);
    eventList.InsertEvents(
        *eventsToInclude, firstEvent, lastEvent, indexOfTheEventInThisList + 1);

    // Delete the link event ( which is now at the end of the list of events
    // we've just inserted )
    eventList.RemoveEvent(indexOfTheEventInThisList + 1 +
                          static_cast<unsigned>(lastEvent - firstEvent) + 1);
  } else {
    std::cout << "Unable to get events from a link." << std::endl;
    linkWasInvalid = true;

    // Delete the link event
    eventList.RemoveEvent(indexOfTheEventInThisList);
    return;
  }
}

LinkEvent::~LinkEvent() {}

void LinkEvent::SerializeTo(SerializerElement& element) const {
  SerializerElement& includeElement = element.AddChild("include").SetAttribute(
      "includeConfig", static_cast<int>(GetIncludeConfig()));

  if (GetIncludeConfig() == INCLUDE_EVENTS_GROUP) {
    includeElement.SetAttribute("eventsGroup", GetEventsGroupName());
  } else if (GetIncludeConfig() == INCLUDE_BY_INDEX) {
    includeElement.SetAttribute("start", static_cast<int>(GetIncludeStart()));
    includeElement.SetAttribute("end", static_cast<int>(GetIncludeEnd()));
  }

  element.AddChild("target").SetValue(GetTarget());
}

void LinkEvent::UnserializeFrom(gd::Project& project,
                                const SerializerElement& element) {
  SetTarget(element.GetChild("target", 0, "Scene").GetValue().GetString());

  // Compatibility with GD <= 5
  if (element.HasChild("include", "Limites")) {
    SerializerElement& includeElement = element.GetChild("include", 0, "Limites");
    if (includeElement.HasAttribute("includeAll")) {
      // Compatibility with GDevelop <= 4.0.92
      if (includeElement.GetBoolAttribute("includeAll", true)) {
        SetIncludeAllEvents();
      } else {
        SetIncludeStartAndEnd(includeElement.GetIntAttribute("start"),
                              includeElement.GetIntAttribute("end"));
      }
    } else {
      // GDevelop > 4.0.92
      IncludeConfig config = static_cast<IncludeConfig>(
          includeElement.GetIntAttribute("includeConfig", 0));
      if (config == INCLUDE_ALL)
        SetIncludeAllEvents();
      else if (config == INCLUDE_EVENTS_GROUP)
        SetIncludeEventsGroup(includeElement.GetStringAttribute("eventsGroup"));
      else if (config == INCLUDE_BY_INDEX)
        SetIncludeStartAndEnd(includeElement.GetIntAttribute("start"),
                              includeElement.GetIntAttribute("end"));
    }
  } else {
    // Since GDevelop 5, links always include all events.
    SetIncludeAllEvents();
  }
  // end of compatibility code
}

bool LinkEvent::AcceptVisitor(gd::EventVisitor &eventVisitor) {
  return BaseEvent::AcceptVisitor(eventVisitor) ||
         eventVisitor.VisitLinkEvent(*this);
}

void LinkEvent::AcceptVisitor(gd::ReadOnlyEventVisitor &eventVisitor) const {
  BaseEvent::AcceptVisitor(eventVisitor);
  eventVisitor.VisitLinkEvent(*this);
}

}  // namespace gd
