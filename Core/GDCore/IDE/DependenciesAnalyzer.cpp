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
    return Analyze(layout->GetEvents());
  else if (externalEvents)
    return Analyze(externalEvents->GetEvents());

  std::cout << "ERROR: DependenciesAnalyzer called without any layout or "
               "external events.";
  return false;
}

DependenciesAnalyzer::~DependenciesAnalyzer() {}

bool DependenciesAnalyzer::Analyze(const gd::EventsList& events) {
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
        analyzer.AddParentExternalEvents(linked);
        if (!analyzer.Analyze(project.GetExternalEvents(linked).GetEvents()))
          return false;

      } else if (project.HasLayoutNamed(linked)) {
        if (std::find(parentScenes.begin(), parentScenes.end(), linked) !=
            parentScenes.end())
          return false;  // Circular dependency!

        scenesDependencies.insert(linked);  // There is a direct dependency
        analyzer.AddParentScene(linked);
        if (!analyzer.Analyze(project.GetLayout(linked).GetEvents()))
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
      if (!Analyze(events[i].GetSubEvents())) return false;
    }
  }

  return true;
}
