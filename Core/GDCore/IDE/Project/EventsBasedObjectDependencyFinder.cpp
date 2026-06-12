/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsBasedObjectDependencyFinder.h"

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
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

std::vector<gd::String>
EventsBasedObjectDependencyFinder::GetExtensionDependencyCycleCreatedByObject(
    const gd::Project &project, const gd::String &parentExtensionName,
    const gd::String &objectType) {
  const gd::String usedExtensionName =
      gd::PlatformExtension::GetExtensionFromFullObjectType(objectType);
  if (usedExtensionName.empty() || usedExtensionName == parentExtensionName ||
      !project.HasEventsFunctionsExtensionNamed(usedExtensionName)) {
    // Objects from the platform (or from the same extension) can't create
    // a cycle between extensions.
    return {};
  }

  std::set<gd::String> visitedExtensionNames;
  std::vector<gd::String> path;
  if (!FindExtensionDependencyPath(project, usedExtensionName,
                                   parentExtensionName, visitedExtensionNames,
                                   path)) {
    return {};
  }
  std::vector<gd::String> cycle;
  cycle.push_back(parentExtensionName);
  cycle.insert(cycle.end(), path.begin(), path.end());
  return cycle;
}

bool EventsBasedObjectDependencyFinder::FindExtensionDependencyPath(
    const gd::Project &project, const gd::String &fromExtensionName,
    const gd::String &toExtensionName,
    std::set<gd::String> &visitedExtensionNames, std::vector<gd::String> &path) {
  if (fromExtensionName == toExtensionName) {
    path.push_back(fromExtensionName);
    return true;
  }
  if (visitedExtensionNames.find(fromExtensionName) !=
      visitedExtensionNames.end()) {
    return false;
  }
  visitedExtensionNames.insert(fromExtensionName);

  const auto &extension =
      project.GetEventsFunctionsExtension(fromExtensionName);
  path.push_back(fromExtensionName);
  for (auto &eventsBasedObject :
       extension.GetEventsBasedObjects().GetInternalVector()) {
    for (auto &object : eventsBasedObject->GetObjects().GetObjects()) {
      const gd::String childExtensionName =
          gd::PlatformExtension::GetExtensionFromFullObjectType(
              object->GetType());
      if (childExtensionName.empty() ||
          childExtensionName == fromExtensionName ||
          !project.HasEventsFunctionsExtensionNamed(childExtensionName)) {
        continue;
      }
      if (FindExtensionDependencyPath(project, childExtensionName,
                                      toExtensionName, visitedExtensionNames,
                                      path)) {
        return true;
      }
    }
  }
  path.pop_back();
  return false;
}
} // namespace gd
