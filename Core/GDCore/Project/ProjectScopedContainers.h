#pragma once
#include "ObjectsContainersList.h"
#include "VariablesContainersList.h"

namespace gd {
class Project;
class ObjectsContainer;
class ObjectsContainersList;
class VariablesContainersList;
}  // namespace gd

namespace gd {

class ProjectScopedContainers {
 public:
  ProjectScopedContainers(
      const gd::ObjectsContainersList &objectsContainersList_,
      const gd::VariablesContainersList &variablesContainersList_)
      : objectsContainersList(objectsContainersList_),
        variablesContainersList(variablesContainersList_){};
  virtual ~ProjectScopedContainers(){};

  static ProjectScopedContainers
  MakeNewProjectScopedContainersForProjectAndLayout(const gd::Project &project,
                                                    const gd::Layout &layout) {
    ProjectScopedContainers projectScopedContainers(
        ObjectsContainersList::MakeNewObjectsContainersListForProjectAndLayout(
            project, layout),
        VariablesContainersList::
            MakeNewVariablesContainersListForProjectAndLayout(project, layout));

    return projectScopedContainers;
  }

  static ProjectScopedContainers MakeNewProjectScopedContainersFor(
      const gd::ObjectsContainer &globalObjectsContainers,
      const gd::ObjectsContainer &objectsContainers) {
    ProjectScopedContainers projectScopedContainers(
        ObjectsContainersList::MakeNewObjectsContainersListForContainers(
            globalObjectsContainers, objectsContainers),
        VariablesContainersList::MakeNewEmptyVariablesContainersList());

    return projectScopedContainers;
  }

  const gd::ObjectsContainersList &GetObjectsContainersList() const {
    return objectsContainersList;
  };

  const gd::VariablesContainersList &GetVariablesContainersList() const {
    return variablesContainersList;
  };

 private:
  const gd::ObjectsContainersList &objectsContainersList;
  const gd::VariablesContainersList &variablesContainersList;
};

}  // namespace gd