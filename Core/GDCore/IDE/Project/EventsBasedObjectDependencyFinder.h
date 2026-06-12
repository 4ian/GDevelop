/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include <set>
#include <vector>

#include "GDCore/String.h"

namespace gd {
class Project;
class EventsBasedObject;
} // namespace gd

namespace gd {

/**
 * \brief Find dependencies between events-based objects and between
 * the extensions declaring them.
 *
 * \ingroup IDE
 */
class EventsBasedObjectDependencyFinder {
public:
  static bool IsDependentFromEventsBasedObject(
      const gd::Project &project,
      const gd::EventsBasedObject &eventsBasedObject,
      const gd::EventsBasedObject &dependency);

  /**
   * \brief Check if adding an object of the given type as a child of an
   * events-based object of the given extension would create a dependency
   * cycle between events functions extensions.
   *
   * Extensions are unserialized in dependency order when the project is
   * opened (see `Project::GetUnserializingOrderExtensionNames`), and
   * extensions forming a cycle can't be ordered: their entire content would
   * be skipped at loading (and erased for good at the next save).
   *
   * \return the extension names forming the cycle, starting and ending with
   * the given extension (e.g: ["A", "B", "A"]), or an empty vector if no
   * cycle would be created.
   */
  static std::vector<gd::String> GetExtensionDependencyCycleCreatedByObject(
      const gd::Project &project,
      const gd::String &parentExtensionName,
      const gd::String &objectType);

private:
  static bool IsDependentFromEventsBasedObject(
      const gd::Project &project,
      const gd::EventsBasedObject &eventsBasedObject,
      const gd::EventsBasedObject &dependency, int depth);

  static bool FindExtensionDependencyPath(
      const gd::Project &project,
      const gd::String &fromExtensionName,
      const gd::String &toExtensionName,
      std::set<gd::String> &visitedExtensionNames,
      std::vector<gd::String> &path);
};

} // namespace gd
