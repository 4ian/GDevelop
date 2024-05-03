/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef DEPENDENCIESANALYZER_H
#define DEPENDENCIESANALYZER_H
#include <memory>
#include <set>
#include <string>
#include <vector>
#include "GDCore/String.h"
namespace gd {
class EventsList;
}
namespace gd {
class BaseEvent;
}
namespace gd {
class Project;
}
namespace gd {
class Layout;
}
namespace gd {
class ExternalEvents;
}

/**
 * \brief Compute the dependencies of a scene or external events.
 */
class GD_CORE_API DependenciesAnalyzer {
 public:
  /**
   * \brief Constructor for analyzing the dependencies of a layout
   */
  DependenciesAnalyzer(const gd::Project& project_, const gd::Layout& layout_);

  /**
   * \brief Constructor for analyzing the dependencies of external events.
   */
  DependenciesAnalyzer(const gd::Project& project_,
                       const gd::ExternalEvents& externalEvents);

  virtual ~DependenciesAnalyzer();

  /**
   * \brief Search the dependencies and return true if there are no circular
   * dependencies in the events of the layout or external events passed in the
   * constructor.
   *
   * \return true if there are no circular dependencies, false otherwise (in
   * this case, no events code generation must done).
   */
  bool Analyze();

  /**
   * \brief Return the scenes being dependencies of the scene or external events
   * passed in the constructor.
   */
  const std::set<gd::String>& GetScenesDependencies() const {
    return scenesDependencies;
  };

  /**
   * \brief Return the external events being dependencies of the scene or
   * external events passed in the constructor.
   */
  const std::set<gd::String>& GetExternalEventsDependencies() const {
    return externalEventsDependencies;
  };

  /**
   * \brief Return the source files being dependencies of the scene or external
   * events passed in the constructor.
   */
  const std::set<gd::String>& GetSourceFilesDependencies() const {
    return sourceFilesDependencies;
  };

 private:
  /**
   * \brief Analyze the dependencies of the events.
   *
   * \param events The events to be analyzed
   * \param isOnTopLevel If true, assumes that the events are on the top level
   * (they have no parents). \return false if a circular dependency exists, true
   * otherwise.
   */
  bool Analyze(const gd::EventsList& events);

  std::set<gd::String> scenesDependencies;
  std::set<gd::String> externalEventsDependencies;
  std::set<gd::String> sourceFilesDependencies;
  std::vector<gd::String>
      parentScenes;  ///< Used to check for circular dependencies.
  std::vector<gd::String>
      parentExternalEvents;  ///< Used to check for circular dependencies.

  const gd::Project& project;
  const gd::Layout* layout;
  const gd::ExternalEvents* externalEvents;
};

#endif  // DEPENDENCIESANALYZER_H
#endif
