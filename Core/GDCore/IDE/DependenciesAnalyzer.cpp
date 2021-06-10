/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)
#include "DependenciesAnalyzer.h"
#include <algorithm>
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/SourceFile.h"

DependenciesAnalyzer::DependenciesAnalyzer(const gd::Project& project_,
                                           const gd::Layout& layout_)
    : project(project_), layout(&layout_), externalEvents(NULL) {
  parentScenes.push_back(layout->GetName());
}

DependenciesAnalyzer::DependenciesAnalyzer(const gd::Project& project_,
                                           const gd::ExternalEvents& externalEvents_)
    : project(project_), layout(NULL), externalEvents(&externalEvents_) {
  parentExternalEvents.push_back(externalEvents->GetName());
}

bool DependenciesAnalyzer::Analyze() {
  if (layout)
    return Analyze(layout->GetEvents(), true);
  else if (externalEvents)
    return Analyze(externalEvents->GetEvents(), true);

  std::cout << "ERROR: DependenciesAnalyzer called without any layout or "
               "external events.";
  return false;
}

DependenciesAnalyzer::~DependenciesAnalyzer() {}

bool DependenciesAnalyzer::Analyze(const gd::EventsList& events, bool isOnTopLevel) {
  for (unsigned int i = 0; i < events.size(); ++i) {
    const gd::LinkEvent* linkEvent = dynamic_cast<const gd::LinkEvent*>(&events[i]);
    if (linkEvent) {
      DependenciesAnalyzer analyzer(*this);

      gd::String linked = linkEvent->GetTarget();
      if (project.HasExternalEventsNamed(linked)) {
        if (std::find(parentExternalEvents.begin(),
                      parentExternalEvents.end(),
                      linked) != parentExternalEvents.end())
          return false;  // Circular dependency!

        externalEventsDependencies.insert(
            linked);  // There is a direct dependency
        if (!isOnTopLevel) notTopLevelExternalEventsDependencies.insert(linked);
        analyzer.AddParentExternalEvents(linked);
        if (!analyzer.Analyze(project.GetExternalEvents(linked).GetEvents(),
                              isOnTopLevel))
          return false;

      } else if (project.HasLayoutNamed(linked)) {
        if (std::find(parentScenes.begin(), parentScenes.end(), linked) !=
            parentScenes.end())
          return false;  // Circular dependency!

        scenesDependencies.insert(linked);  // There is a direct dependency
        if (!isOnTopLevel) notTopLevelScenesDependencies.insert(linked);
        analyzer.AddParentScene(linked);
        if (!analyzer.Analyze(project.GetLayout(linked).GetEvents(),
                              isOnTopLevel))
          return false;
      }

      // Update with indirect dependencies.
      scenesDependencies.insert(analyzer.GetScenesDependencies().begin(),
                                analyzer.GetScenesDependencies().end());
      externalEventsDependencies.insert(
          analyzer.GetExternalEventsDependencies().begin(),
          analyzer.GetExternalEventsDependencies().end());
      sourceFilesDependencies.insert(
          analyzer.GetSourceFilesDependencies().begin(),
          analyzer.GetSourceFilesDependencies().end());
      notTopLevelScenesDependencies.insert(
          analyzer.GetNotTopLevelScenesDependencies().begin(),
          analyzer.GetNotTopLevelScenesDependencies().end());
      notTopLevelExternalEventsDependencies.insert(
          analyzer.GetNotTopLevelExternalEventsDependencies().begin(),
          analyzer.GetNotTopLevelExternalEventsDependencies().end());

      if (!isOnTopLevel) {
        notTopLevelScenesDependencies.insert(
            analyzer.GetScenesDependencies().begin(),
            analyzer.GetScenesDependencies().end());
        notTopLevelExternalEventsDependencies.insert(
            analyzer.GetExternalEventsDependencies().begin(),
            analyzer.GetExternalEventsDependencies().end());
      }
    }

    // Search for source files dependencies
    std::vector<gd::String> dependencies =
        events[i].GetSourceFileDependencies();
    sourceFilesDependencies.insert(dependencies.begin(), dependencies.end());

    const gd::String& associatedSourceFile =
        events[i].GetAssociatedGDManagedSourceFile(const_cast<gd::Project&>(project));
    if (!associatedSourceFile.empty())
      sourceFilesDependencies.insert(associatedSourceFile);

    // Analyze sub events dependencies
    if (events[i].CanHaveSubEvents()) {
      if (!Analyze(events[i].GetSubEvents(), false)) return false;
    }
  }

  return true;
}

gd::String DependenciesAnalyzer::ExternalEventsCanBeCompiledForAScene() {
  if (!externalEvents) {
    std::cout << "ERROR: ExternalEventsCanBeCompiledForAScene called without "
                 "external events set!"
              << std::endl;
    return "";
  }

  gd::String sceneName;
  for (unsigned int i = 0; i < project.GetLayoutsCount(); ++i) {
    // For each layout, compute the dependencies and the dependencies which are
    // not coming from a top level event.
    DependenciesAnalyzer analyzer(project, project.GetLayout(i));
    if (!analyzer.Analyze()) continue;  // Analyze failed -> Cyclic dependencies
    const std::set<gd::String>& dependencies =
        analyzer.GetExternalEventsDependencies();
    const std::set<gd::String>& notTopLevelDependencies =
        analyzer.GetNotTopLevelExternalEventsDependencies();

    // Check if the external events is a dependency, and that is is only present
    // as a link on the top level.
    if (dependencies.find(externalEvents->GetName()) != dependencies.end() &&
        notTopLevelDependencies.find(externalEvents->GetName()) ==
            notTopLevelDependencies.end()) {
      if (!sceneName.empty())
        return "";  // External events can be compiled only if one scene is
                    // including them.
      else
        sceneName = project.GetLayout(i).GetName();
    }
  }

  return sceneName;  // External events can be compiled and used for the scene.
}
#endif
