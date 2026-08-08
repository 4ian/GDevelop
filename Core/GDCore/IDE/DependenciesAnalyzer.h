/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef DEPENDENCIESANALYZER_H
#define DEPENDENCIESANALYZER_H
#include <array>
#include <set>
#include <vector>
#include "GDCore/Project/SceneLifecycleEventsFunctions.h"
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
   * \brief Return scene dependencies reachable from one lifecycle role.
   */
  const std::set<gd::String>& GetScenesDependencies(
      gd::SceneLifecycleFunctionRole role) const {
    return scenesDependenciesByRole[GetRoleIndex(role)];
  }

  /**
   * \brief Return the external events being dependencies of the scene or
   * external events passed in the constructor.
   */
  const std::set<gd::String>& GetExternalEventsDependencies() const {
    return externalEventsDependencies;
  };

  /**
   * \brief Return External Events dependencies reachable from one lifecycle
   * role.
   */
  const std::set<gd::String>& GetExternalEventsDependencies(
      gd::SceneLifecycleFunctionRole role) const {
    return externalEventsDependenciesByRole[GetRoleIndex(role)];
  }

 private:
  enum class DependencyOwnerKind { Scene, ExternalEvents };

  struct DependencyNode {
    DependencyOwnerKind ownerKind;
    gd::String ownerName;
    gd::SceneLifecycleFunctionRole role;

    bool operator==(const DependencyNode& other) const {
      return ownerKind == other.ownerKind && ownerName == other.ownerName &&
             role == other.role;
    }

    bool operator<(const DependencyNode& other) const {
      if (ownerKind != other.ownerKind) {
        return static_cast<int>(ownerKind) <
               static_cast<int>(other.ownerKind);
      }
      if (ownerName != other.ownerName) return ownerName < other.ownerName;
      return static_cast<int>(role) < static_cast<int>(other.role);
    }
  };

  static std::size_t GetRoleIndex(gd::SceneLifecycleFunctionRole role) {
    return static_cast<std::size_t>(role);
  }

  /**
   * \brief Analyze the dependencies of the events.
   *
   * \param events The events to be analyzed
   * \param isOnTopLevel If true, assumes that the events are on the top level
   * (they have no parents). \return false if a circular dependency exists, true
   * otherwise.
   */
  bool Analyze(const gd::EventsList& events,
               gd::SceneLifecycleFunctionRole role);

  std::set<gd::String> scenesDependencies;
  std::set<gd::String> externalEventsDependencies;
  std::array<std::set<gd::String>, 4> scenesDependenciesByRole;
  std::array<std::set<gd::String>, 4> externalEventsDependenciesByRole;
  std::vector<DependencyNode> activePath;
  std::set<DependencyNode> visitedDependencies;

  const gd::Project& project;
  const gd::Layout* layout;
  const gd::ExternalEvents* externalEvents;
};

#endif  // DEPENDENCIESANALYZER_H
#endif
