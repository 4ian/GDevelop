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
class EventsFunctionsContainer;
class EventsFunction;
class EventsBasedBehavior;
class EventsBasedObject;
} // namespace gd

namespace gd {
/**
 * \brief Check if functions are only calling themselves.
 *
 * It allows to detect mistakes when implementing functions for compatibility
 * after a function renaming.
 * Infinite loops can happens when the legacy function call itself instead of
 * the new function.
 * 
 * \note Only the first instruction or the expressions of the first action is
 * checked.
 */
class GD_CORE_API EventsFunctionSelfCallChecker {
public:
  /**
   * \brief Check if a free function is only calling itself.
   */
  static bool IsFreeFunctionOnlyCallingItself(
      const gd::Project &project,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsFunction &eventsFunction);

  /**
   * \brief Check if a behavior function is only calling itself.
   */
  static bool IsBehaviorFunctionOnlyCallingItself(
      const gd::Project &project,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsBasedBehavior &eventsBasedBehavior,
      const gd::EventsFunction &eventsFunction);

  /**
   * \brief Check if an object function is only calling itself.
   */
  static bool IsObjectFunctionOnlyCallingItself(
      const gd::Project &project,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsBasedObject &eventsBasedObject,
      const gd::EventsFunction &eventsFunction);

private:
  static bool IsOnlyCallingItself(const gd::Project &project,
                                  const gd::String &functionFullType,
                                  const gd::EventsFunction &eventsFunction);
};
} // namespace gd
