/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include "GDCore/String.h"

namespace gd {
class Project;
class EventsBasedObject;
} // namespace gd

namespace gd {

/**
 * \brief Find resource usages in several parts of the project.
 *
 * \ingroup IDE
 */
class EventsBasedObjectDependencyFinder {
public:
  static bool IsDependentFromEventsBasedObject(
      const gd::Project &project,
      const gd::EventsBasedObject &eventsBasedObject,
      const gd::EventsBasedObject &dependency);

private:
  static bool IsDependentFromEventsBasedObject(
      const gd::Project &project,
      const gd::EventsBasedObject &eventsBasedObject,
      const gd::EventsBasedObject &dependency, int depth);
};

} // namespace gd
