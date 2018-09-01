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
class ClassWithObjects;
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
  EventsContext(gd::ClassWithObjects& project_, gd::ClassWithObjects& layout_)
      : project(project_), layout(layout_){};
  virtual ~EventsContext(){};

  void AddObjectName(const gd::String& objectName);

  std::vector<gd::String> ExpandObjectsName(const gd::String& objectName);

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

 private:
  std::set<gd::String> objectOrGroupNames;
  std::set<gd::String> objectNames;
  gd::ClassWithObjects& project;
  gd::ClassWithObjects& layout;
};

/**
 * \brief Analyze events to list all the objects being used in them.
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsContextAnalyzer : public ArbitraryEventsWorker {
 public:
  EventsContextAnalyzer(const gd::Platform& platform_,
                        gd::ClassWithObjects& project_,
                        gd::ClassWithObjects& layout_)
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
                               const gd::ClassWithObjects& project,
                               const gd::ClassWithObjects& layout,
                               const gd::ParameterMetadata& metadata,
                               const gd::Expression& parameter,
                               EventsContext& context);

 private:
  virtual bool DoVisitInstruction(gd::Instruction& instruction,
                                  bool isCondition);

  const gd::Platform& platform;
  gd::ClassWithObjects& project;
  gd::ClassWithObjects& layout;
  EventsContext context;
};

}  // namespace gd

#endif  // EventsContextAnalyzer_H
