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
  return gd::EventsBasedObjectDependencyFinder::
      IsDependentFromEventsBasedObject(project, eventsBasedObject, dependency,
                                       0);
}
bool EventsBasedObjectDependencyFinder::IsDependentFromEventsBasedObject(
    const gd::Project &project, const gd::EventsBasedObject &eventsBasedObject,
    const gd::EventsBasedObject &dependency, int depth) {

  if (&eventsBasedObject == &dependency) {
    return true;
  }
  if (depth > 200) {
    return false;
  }
  for (auto &object : eventsBasedObject.GetObjects().GetObjects()) {
    const gd::String &objectType = object->GetType();
    if (project.HasEventsBasedObject(objectType) &&
        gd::EventsBasedObjectDependencyFinder::IsDependentFromEventsBasedObject(
            project, project.GetEventsBasedObject(objectType), dependency,
            depth + 1)) {
      return true;
    }
  }
  return false;
}
} // namespace gd
