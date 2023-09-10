#pragma once
#include "ObjectsContainersList.h"
#include "VariablesContainersList.h"
#include "PropertiesContainersList.h"

namespace gd {
class Project;
class ObjectsContainer;
class ObjectsContainersList;
class VariablesContainersList;
class PropertiesContainersList;
}  // namespace gd

namespace gd {

class ProjectScopedContainers {
 public:
  ProjectScopedContainers(
      const gd::ObjectsContainersList &objectsContainersList_,
      const gd::VariablesContainersList &variablesContainersList_,
      const gd::PropertiesContainersList &namedPropertyDescriptorsContainersList_)
      : objectsContainersList(objectsContainersList_),
        variablesContainersList(variablesContainersList_),
        namedPropertyDescriptorsContainersList(namedPropertyDescriptorsContainersList_){};
  virtual ~ProjectScopedContainers(){};

  static ProjectScopedContainers
  MakeNewProjectScopedContainersForProjectAndLayout(const gd::Project &project,
                                                    const gd::Layout &layout) {
    ProjectScopedContainers projectScopedContainers(
        ObjectsContainersList::MakeNewObjectsContainersListForProjectAndLayout(
            project, layout),
        VariablesContainersList::
            MakeNewVariablesContainersListForProjectAndLayout(project, layout),
        PropertiesContainersList::MakeNewEmptyPropertiesContainersList());

    return projectScopedContainers;
  }

  static ProjectScopedContainers MakeNewProjectScopedContainersFor(
      const gd::ObjectsContainer &globalObjectsContainers,
      const gd::ObjectsContainer &objectsContainers) {
    ProjectScopedContainers projectScopedContainers(
        ObjectsContainersList::MakeNewObjectsContainersListForContainers(
            globalObjectsContainers, objectsContainers),
        VariablesContainersList::MakeNewEmptyVariablesContainersList(),
        PropertiesContainersList::MakeNewEmptyPropertiesContainersList());

    return projectScopedContainers;
  }

  ProjectScopedContainers& AddPropertiesContainer(
    const gd::PropertiesContainer& container
  ) {
    namedPropertyDescriptorsContainersList.Add(container);

    return *this;
  }

  const gd::ObjectsContainersList &GetObjectsContainersList() const {
    return objectsContainersList;
  };

  const gd::VariablesContainersList &GetVariablesContainersList() const {
    return variablesContainersList;
  };

  const gd::PropertiesContainersList &GetPropertiesContainersList() const {
    return namedPropertyDescriptorsContainersList;
  };

  /** Do not use - should be private but accessible to let Emscripten create a temporary. */
  ProjectScopedContainers(){};
 private:
  gd::ObjectsContainersList objectsContainersList;
  gd::VariablesContainersList variablesContainersList;
  gd::PropertiesContainersList namedPropertyDescriptorsContainersList;
};

}  // namespace gd