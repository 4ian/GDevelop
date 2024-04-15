#include "ProjectScopedContainers.h"

#include <functional>
#include <vector>

namespace gd {

std::vector<ProjectScopedContainers> ProjectScopedContainers::test;

  ProjectScopedContainers& ProjectScopedContainers::MakeNewProjectScopedContainersWithLocalVariables(
      const ProjectScopedContainers &projectScopedContainers,
      const gd::BaseEvent &event) {
    ProjectScopedContainers newProjectScopedContainers(
        projectScopedContainers.GetObjectsContainersList(),
        VariablesContainersList::MakeNewVariablesContainersListPushing(
            projectScopedContainers.GetVariablesContainersList(),
            event.GetVariables()),
        projectScopedContainers.GetPropertiesContainersList());

    test.push_back(newProjectScopedContainers);
    return test.at(test.size() - 1);
  }

}  // namespace gd