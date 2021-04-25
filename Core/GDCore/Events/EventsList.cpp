/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "EventsList.h"

#include "GDCore/Events/Event.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Log.h"
#include "Serialization.h"

namespace gd {

EventsList::EventsList() {}

void EventsList::InsertEvents(const EventsList& otherEvents,
                              size_t begin,
                              size_t end,
                              size_t position) {
  if (begin >= otherEvents.size()) return;
  if (end < begin) return;
  if (end >= otherEvents.size()) end = otherEvents.size() - 1;

  for (std::size_t insertPos = 0; insertPos <= (end - begin); insertPos++) {
    auto event =
        CloneRememberingOriginalEvent(otherEvents.events[begin + insertPos]);
    event->SetParent(this);
    if (position != (size_t)-1 && position + insertPos < events.size())
      events.insert(events.begin() + position + insertPos, event);
    else
      events.push_back(event);
  }

  InvalidateCache();
}

gd::BaseEvent& EventsList::InsertEvent(const gd::BaseEvent& evt,
                                       size_t position) {
  std::shared_ptr<gd::BaseEvent> event(evt.Clone());
  event->SetParent(this);
  if (position < events.size())
    events.insert(events.begin() + position, event);
  else
    events.push_back(event);

  InvalidateCache();

  return *event;
}

void EventsList::InsertEvent(std::shared_ptr<gd::BaseEvent> event,
                             size_t position) {
  event->SetParent(this);
  if (position < events.size())
    events.insert(events.begin() + position, event);
  else
    events.push_back(event);
  InvalidateCache();
}

gd::BaseEvent& EventsList::InsertNewEvent(gd::Project& project,
                                          const gd::String& eventType,
                                          size_t position) {
  gd::BaseEventSPtr event = project.CreateEvent(eventType);
  if (event == std::shared_ptr<gd::BaseEvent>()) {
    std::cout << "Unknown event of type " << eventType;
    event = std::make_shared<EmptyEvent>();
  }

  InsertEvent(event, position);
  return *event;
}

void EventsList::RemoveEvent(size_t index) {
  events.erase(events.begin() + index);
  InvalidateCache();
}

void EventsList::RemoveEvent(const gd::BaseEvent& event) {
  for (size_t i = 0; i < events.size(); ++i) {
    if (events[i].get() == &event) {
      events.erase(events.begin() + i);
      InvalidateCache();
      return;
    }
  }
}

void EventsList::SerializeTo(SerializerElement& element) const {
  EventsListSerialization::SerializeEventsTo(*this, element);
}

void EventsList::UnserializeFrom(gd::Project& project,
                                 const SerializerElement& element) {
  EventsListSerialization::UnserializeEventsFrom(project, *this, element);
}

bool EventsList::Contains(const gd::BaseEvent& eventToSearch,
                          bool recursive) const {
  for (std::size_t i = 0; i < GetEventsCount(); ++i) {
    if (&GetEvent(i) == &eventToSearch) return true;
    if (recursive && GetEvent(i).CanHaveSubEvents() &&
        GetEvent(i).GetSubEvents().Contains(eventToSearch))
      return true;
  }

  return false;
}

bool EventsList::MoveEventToAnotherEventsList(const gd::BaseEvent& eventToMove,
                                              gd::EventsList& newEventsList,
                                              std::size_t newPosition) {
  for (std::size_t i = 0; i < GetEventsCount(); ++i) {
    if (events[i].get() == &eventToMove) {
      std::shared_ptr<BaseEvent> event = events[i];
      events.erase(events.begin() + i);
      InvalidateCache();

      newEventsList.InsertEvent(event, newPosition);
      return true;
    }
  }

  return false;
}

EventsList::EventsList(const EventsList& other) { Init(other); }

EventsList& EventsList::operator=(const EventsList& other) {
  if (this != &other) Init(other);

  return *this;
}

void EventsList::Init(const gd::EventsList& other) {
  events.clear();

  for (size_t i = 0; i < other.events.size(); ++i) {
    auto event = CloneRememberingOriginalEvent(other.events[i]);
    event->SetParent(this);
    events.push_back(event);
  }

  InvalidateCache();
}

}  // namespace gd
