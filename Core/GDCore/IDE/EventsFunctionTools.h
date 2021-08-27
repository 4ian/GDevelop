/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef EventsFunctionTools_H
#define EventsFunctionTools_H
#include <vector>
#include "GDCore/String.h"
namespace gd {
class Project;
class ObjectsContainer;
class ParameterMetadata;
class EventsFunction;
class EventsBasedBehavior;
class Expression;
}  // namespace gd

namespace gd {
/**
 * Contains tools to use events functions.
 */
class GD_CORE_API EventsFunctionTools {
 public:
  /**
   * \brief Given a free events function, initialize the given objects container
   * with objects described in the events function parameters and in
   * the events function groups.
   *
   * This is useful to create the "context" of a function, before code
   * generation for example.
   */
  static void FreeEventsFunctionToObjectsContainer(
      gd::Project& project,
      const gd::EventsFunction& eventsFunction,
      gd::ObjectsContainer& outputGlobalObjectsContainer,
      gd::ObjectsContainer& outputObjectsContainer);
  /**
   * \brief Given a behavior events function, initialize the given objects container
   * with objects described in the events function parameters, in
   * the events function groups and in the behavior properties (for additional
   * required behaviors on the object).
   *
   * This is useful to create the "context" of a function, before code
   * generation for example.
   */
  static void BehaviorEventsFunctionToObjectsContainer(
      gd::Project& project,
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      const gd::EventsFunction& eventsFunction,
      gd::ObjectsContainer& outputGlobalObjectsContainer,
      gd::ObjectsContainer& outputObjectsContainer);
};
}  // namespace gd

#endif  // EventsFunctionTools_H
#endif
