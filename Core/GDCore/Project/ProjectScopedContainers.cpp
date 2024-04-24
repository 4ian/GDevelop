#include "ProjectScopedContainers.h"

namespace gd {

ProjectScopedContainers
ProjectScopedContainers::MakeNewProjectScopedContainersWithLocalVariables(
    const ProjectScopedContainers &projectScopedContainers,
    const gd::BaseEvent &event) {
  ProjectScopedContainers newProjectScopedContainers = projectScopedContainers;
  newProjectScopedContainers.variablesContainersList =
      VariablesContainersList::MakeNewVariablesContainersListPushing(
          projectScopedContainers.GetVariablesContainersList(),
          event.GetVariables());
  return newProjectScopedContainers;
}

} // namespace gd