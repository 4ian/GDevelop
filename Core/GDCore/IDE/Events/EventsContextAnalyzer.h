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
  EventsContext(gd::ObjectsContainer& project_, gd::ObjectsContainer& layout_)
      : project(project_), layout(layout_){};
  virtual ~EventsContext(){};

  void AddObjectName(const gd::String& objectOrGroupName);
  void AddBehaviorName(const gd::String& objectOrGroupName,
                       const gd::String& behaviorName);

  std::vector<gd::String> ExpandObjectsName(const gd::String& objectOrGroupName);

  /**
   * \brief Get object or group names being referenced in the events.
   */
  const std::set<gd::String>& GetObjectOrGroupNames() {
    return objectOrGroupNames;
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
  const std::set<gd::String>& GetBehaviorNamesOf(const gd::String& objectOrGroupName) {
    return objectOrGroupBehaviorNames[objectOrGroupName];
  }

 private:
  std::set<gd::String> objectOrGroupNames;
  std::set<gd::String> objectNames;
  std::map<gd::String, std::set<gd::String>> objectOrGroupBehaviorNames;
  gd::ObjectsContainer& project;
  gd::ObjectsContainer& layout;
};

/**
 * \brief Analyze events to list all the objects being used in them.
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsContextAnalyzer : public ArbitraryEventsWorker {
 public:
  EventsContextAnalyzer(const gd::Platform& platform_,
                        gd::ObjectsContainer& project_,
                        gd::ObjectsContainer& layout_)
      : platform(platform_),
        project(project_),
        layout(layout_),
        context(project, layout){};
  virtual ~EventsContextAnalyzer(){};

  /**
   * Get the context containing the objects that are used in the events.
   */
  const EventsContext& GetEventsContext() { return context; }

  static void AnalyzeParameter(const gd::Platform& platform,
                               const gd::ObjectsContainer& project,
                               const gd::ObjectsContainer& layout,
                               const gd::ParameterMetadata& metadata,
                               const gd::Expression& parameter,
                               EventsContext& context,
                               const gd::String& lastObjectName);

 private:
  virtual bool DoVisitInstruction(gd::Instruction& instruction,
                                  bool isCondition);

  const gd::Platform& platform;
  gd::ObjectsContainer& project;
  gd::ObjectsContainer& layout;
  EventsContext context;
};

}  // namespace gd

#endif  // EventsContextAnalyzer_H
