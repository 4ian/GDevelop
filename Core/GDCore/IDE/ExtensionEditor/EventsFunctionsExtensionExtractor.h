/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once 

#include <vector>
#include "GDCore/String.h"

namespace gd {
class Project;
class EventsBasedBehavior;
class EventsFunctionsExtension;
class Object;
}  // namespace gd

namespace gd {
/**
 * Contains tools to extract events function extensions.
 */
class GD_CORE_API EventsFunctionsExtensionExtractor {
 public:

  static EventsBasedBehavior& CreateCustomBehaviorForObject(
      const gd::Project& project,
      gd::EventsFunctionsExtension& eventsFunctionsExtension,
      gd::Object& object);

};
}  // namespace gd
