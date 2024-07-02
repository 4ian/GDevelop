/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsBasedObjectDependencyFinder.h"

#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"

namespace gd {
bool EventsBasedObjectDependencyFinder::IsDependentFromEventsBasedObject(
    const gd::Project &project, const gd::EventsBasedObject &eventsBasedObject,
    const gd::EventsBasedObject &dependency) {

  if (&eventsBasedObject == &dependency) {
    return true;
  }
  for (auto &object : eventsBasedObject.GetObjects().GetObjects()) {
    const gd::String &objectType = object->GetType();
    if (project.HasEventsBasedObject(objectType) &&
        gd::EventsBasedObjectDependencyFinder::IsDependentFromEventsBasedObject(
            project, project.GetEventsBasedObject(objectType), dependency)) {
      return true;
    }
  }
  return false;
}

bool EventsBasedObjectDependencyFinder::IsDependentFromObjectType(
    const gd::Project &project, const gd::EventsBasedObject &eventsBasedObject,
    const gd::String &dependencyObjectType) {
  if (!project.HasEventsBasedObject(dependencyObjectType)) {
    return false;
  }
  return gd::EventsBasedObjectDependencyFinder::IsDependentFromEventsBasedObject(
      project, eventsBasedObject,
      project.GetEventsBasedObject(dependencyObjectType));
}

} // namespace gd
