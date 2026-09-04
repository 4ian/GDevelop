/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/String.h"
#include <vector>

namespace gd {
class Project;
class EventsFunctionsExtension;
class EventsBasedObject;
class EventsFunction;
class Object;
} // namespace gd

namespace gd {
/**
 * Contains tools to extract events function extensions.
 */
class GD_CORE_API ChildObjectForwardFunctionGenerator {
public:
  static void GenerateChildObjectForwardFunctions(
      const gd::Project &project,
      const gd::EventsFunctionsExtension &parentEventsFunctionsExtension,
      gd::EventsBasedObject &parentEventsBasedObject,
      const gd::String &childObjectName);

  static void GenerateChildObjectForwardFunction(
      const gd::Project &project,
      const gd::EventsFunctionsExtension &parentEventsFunctionsExtension,
      gd::EventsBasedObject &parentEventsBasedObject,
      const gd::String &childObjectName,
      const gd::EventsFunction &eventsFunction);

  static bool HasAnyChildCustomObject(
      const gd::Project &project,
      gd::EventsBasedObject &eventsBasedObject);

  static std::vector<gd::String> GetChildCustomObjectNames(
      const gd::Project &project,
      gd::EventsBasedObject &eventsBasedObject);
};
} // namespace gd
