/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EventsContextAnalyzer_H
#define EventsContextAnalyzer_H
#include <map>
#include <memory>
#include <set>
#include <vector>
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/String.h"
namespace gd {
class BaseEvent;
class Platform;
class ObjectsContainer;
class ObjectsContainersList;
class Project;
class Layout;
class EventsList;
class ParameterMetadata;
class Expression;
}  // namespace gd

namespace gd {

/**
 * \brief Store the results of a search done by EventsContextAnalyzer.
 */
class GD_CORE_API EventsContext {
 public:
  EventsContext(){};
  virtual ~EventsContext(){};

  void AddObjectName(const gd::ProjectScopedContainers& projectScopedContainers,
                     const gd::String& objectOrGroupName);
  void AddBehaviorName(const gd::ProjectScopedContainers& projectScopedContainers,
                       const gd::String& objectOrGroupName,
                       const gd::String& behaviorName);

  /**
   * \brief Get object or group names being referenced in the events.
   */
  const std::set<gd::String>& GetReferencedObjectOrGroupNames() {
    return referencedObjectOrGroupNames;
  }

  /**
   * \brief Get objects referenced in the events, without groups (all groups
   * have been "expanded" to the real objects being referenced by the group).
   */
  const std::set<gd::String>& GetObjectNames() { return objectNames; }

  /**
   * \brief Get behaviors referenced in the events for the given object (or
   * group) name.
   */
  const std::set<gd::String>& GetBehaviorNamesOfObjectOrGroup(const gd::String& objectOrGroupName) {
    return objectOrGroupBehaviorNames[objectOrGroupName];
  }

 private:
  std::set<gd::String> referencedObjectOrGroupNames;
  std::set<gd::String> objectNames;
  std::map<gd::String, std::set<gd::String>> objectOrGroupBehaviorNames;
};

/**
 * \brief Analyze events to list all the objects being used in them.
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsContextAnalyzer : public ArbitraryEventsWorkerWithContext {
 public:
  EventsContextAnalyzer(const gd::Platform& platform_)
      : platform(platform_) {};
  virtual ~EventsContextAnalyzer(){};

  /**
   * Get the context containing the objects that are used in the events.
   */
  const EventsContext& GetEventsContext() { return context; }

  static void AnalyzeParameter(const gd::Platform& platform,
                               const gd::ProjectScopedContainers& projectScopedContainers,
                               const gd::ParameterMetadata& metadata,
                               const gd::Expression& parameter,
                               EventsContext& context,
                               const gd::String& lastObjectName);

 private:
  virtual bool DoVisitInstruction(gd::Instruction& instruction,
                                  bool isCondition);

  const gd::Platform& platform;
  EventsContext context;
};

}  // namespace gd

#endif  // EventsContextAnalyzer_H
