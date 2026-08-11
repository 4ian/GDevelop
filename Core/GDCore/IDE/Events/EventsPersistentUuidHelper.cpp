/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/EventsPersistentUuidHelper.h"

#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/ProjectBrowserHelper.h"

namespace {

class EnsureEventsPersistentUuidsWorker : public gd::ArbitraryEventsWorker {
 public:
  bool assignedAny = false;

 private:
  bool DoVisitEvent(gd::BaseEvent &event) override {
    if (event.GetPersistentUuid().empty()) assignedAny = true;
    event.GetOrCreatePersistentUuid();
    return false;
  }
};

class ResetEventsPersistentUuidsWorker : public gd::ArbitraryEventsWorker {
 private:
  bool DoVisitEvent(gd::BaseEvent &event) override {
    event.ResetPersistentUuid();
    return false;
  }
};

void CopyPersistentUuid(const gd::BaseEvent &source,
                        gd::BaseEvent &destination) {
  destination.SetPersistentUuid(source.GetPersistentUuid());
  if (source.CanHaveSubEvents() && destination.CanHaveSubEvents()) {
    gd::EventsPersistentUuidHelper::CopyPersistentUuids(
        source.GetSubEvents(), destination.GetSubEvents());
  }
}

}  // namespace

namespace gd {

bool EventsPersistentUuidHelper::EnsureProjectEventsPersistentUuids(
    gd::Project &project) {
  EnsureEventsPersistentUuidsWorker worker;
  gd::ProjectBrowserHelper::ExposeProjectEvents(project, worker);
  return worker.assignedAny;
}

bool EventsPersistentUuidHelper::EnsurePersistentUuids(gd::EventsList &events) {
  EnsureEventsPersistentUuidsWorker worker;
  worker.Launch(events);
  return worker.assignedAny;
}

void EventsPersistentUuidHelper::ResetPersistentUuids(gd::EventsList &events) {
  ResetEventsPersistentUuidsWorker worker;
  worker.Launch(events);
}

void EventsPersistentUuidHelper::CopyPersistentUuids(
    const gd::EventsList &source, gd::EventsList &destination) {
  for (std::size_t i = 0;
       i < source.GetEventsCount() && i < destination.GetEventsCount();
       ++i) {
    CopyPersistentUuid(source[i], destination[i]);
  }
}

}  // namespace gd
