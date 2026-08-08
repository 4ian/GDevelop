/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "DependenciesAnalyzer.h"
#include <algorithm>
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"

DependenciesAnalyzer::DependenciesAnalyzer(const gd::Project& project_,
                                           const gd::Layout& layout_)
    : project(project_), layout(&layout_), externalEvents(NULL) {}

DependenciesAnalyzer::DependenciesAnalyzer(const gd::Project& project_,
                                           const gd::ExternalEvents& externalEvents_)
    : project(project_), layout(NULL), externalEvents(&externalEvents_) {}

bool DependenciesAnalyzer::Analyze() {
  scenesDependencies.clear();
  externalEventsDependencies.clear();
  for (auto& dependencies : scenesDependenciesByRole) dependencies.clear();
  for (auto& dependencies : externalEventsDependenciesByRole)
    dependencies.clear();
  activePath.clear();
  visitedDependencies.clear();

  bool hasNoCircularDependency = true;
  if (layout) {
    layout->GetLifecycleEventsFunctions().ForEach(
        [&](gd::SceneLifecycleFunctionRole role,
            const gd::EventsFunction& eventsFunction) {
          if (!hasNoCircularDependency) return;
          activePath = {{DependencyOwnerKind::Scene, layout->GetName(), role}};
          hasNoCircularDependency = Analyze(eventsFunction.GetEvents(), role);
        });
    activePath.clear();
    return hasNoCircularDependency;
  } else if (externalEvents) {
    externalEvents->GetLifecycleEventsFunctions().ForEach(
        [&](gd::SceneLifecycleFunctionRole role,
            const gd::EventsFunction& eventsFunction) {
          if (!hasNoCircularDependency) return;
          activePath = {{DependencyOwnerKind::ExternalEvents,
                         externalEvents->GetName(), role}};
          hasNoCircularDependency = Analyze(eventsFunction.GetEvents(), role);
        });
    activePath.clear();
    return hasNoCircularDependency;
  }

  std::cout << "ERROR: DependenciesAnalyzer called without any layout or "
               "external events.";
  return false;
}

DependenciesAnalyzer::~DependenciesAnalyzer() {}

namespace {
const gd::String& GetLifecycleRoleName(
    gd::SceneLifecycleFunctionRole role) {
  static const gd::String sceneLoad = "sceneLoad";
  static const gd::String sceneSignal = "sceneSignal";
  static const gd::String sceneUpdate = "sceneUpdate";
  static const gd::String sceneUnload = "sceneUnload";

  switch (role) {
    case gd::SceneLifecycleFunctionRole::SceneLoad:
      return sceneLoad;
    case gd::SceneLifecycleFunctionRole::SceneSignal:
      return sceneSignal;
    case gd::SceneLifecycleFunctionRole::SceneUpdate:
      return sceneUpdate;
    case gd::SceneLifecycleFunctionRole::SceneUnload:
      return sceneUnload;
  }
  return sceneUpdate;
}
}  // namespace

bool DependenciesAnalyzer::Analyze(
    const gd::EventsList& events,
    gd::SceneLifecycleFunctionRole role) {
  for (unsigned int i = 0; i < events.size(); ++i) {
    const gd::LinkEvent* linkEvent = dynamic_cast<const gd::LinkEvent*>(&events[i]);
    if (linkEvent) {
      gd::String linked = linkEvent->GetTarget();
      DependencyNode dependencyNode;
      bool hasDependency = false;
      if (project.HasExternalEventsNamed(linked)) {
        externalEventsDependencies.insert(linked);
        externalEventsDependenciesByRole[GetRoleIndex(role)].insert(linked);
        dependencyNode = {DependencyOwnerKind::ExternalEvents, linked, role};
        hasDependency = true;
      } else if (project.HasLayoutNamed(linked)) {
        scenesDependencies.insert(linked);
        scenesDependenciesByRole[GetRoleIndex(role)].insert(linked);
        dependencyNode = {DependencyOwnerKind::Scene, linked, role};
        hasDependency = true;
      }

      if (hasDependency) {
        if (std::find(activePath.begin(), activePath.end(), dependencyNode) !=
            activePath.end()) {
          return false;
        }

        if (visitedDependencies.find(dependencyNode) ==
            visitedDependencies.end()) {
          activePath.push_back(dependencyNode);
          const gd::EventsList* linkedEvents = linkEvent->GetLinkedEvents(
              project, GetLifecycleRoleName(role));
          if (linkedEvents && !Analyze(*linkedEvents, role)) return false;
          activePath.pop_back();
          visitedDependencies.insert(dependencyNode);
        }
      }
    }

    // Analyze sub events dependencies
    if (events[i].CanHaveSubEvents()) {
      if (!Analyze(events[i].GetSubEvents(), role)) return false;
    }
  }

  return true;
}
