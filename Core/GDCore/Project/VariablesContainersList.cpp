#include "VariablesContainersList.h"

#include <vector>

#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"

namespace gd {

Variable VariablesContainersList::badVariable;
VariablesContainer VariablesContainersList::badVariablesContainer;

VariablesContainersList
VariablesContainersList::MakeNewVariablesContainersListForProjectAndLayout(
    const gd::Project& project, const gd::Layout& layout) {
  VariablesContainersList variablesContainersList;
  variablesContainersList.Add(project.GetVariables());
  variablesContainersList.Add(layout.GetVariables());
  variablesContainersList.firstLocalVariableContainerIndex = 2;
  return variablesContainersList;
}

VariablesContainersList
VariablesContainersList::MakeNewVariablesContainersListPushing(
    const VariablesContainersList& variablesContainersList, const gd::VariablesContainer& variablesContainer) {
  VariablesContainersList newVariablesContainersList(variablesContainersList);
  newVariablesContainersList.Add(variablesContainer);
  return newVariablesContainersList;
}

VariablesContainersList
VariablesContainersList::MakeNewEmptyVariablesContainersList() {
  VariablesContainersList variablesContainersList;
  return variablesContainersList;
}

bool VariablesContainersList::Has(const gd::String& name) const {
  for (auto it = variablesContainers.rbegin(); it != variablesContainers.rend();
       ++it) {
    if ((*it)->Has(name)) return true;
  }

  return false;
}

const Variable& VariablesContainersList::Get(const gd::String& name) const {
  for (auto it = variablesContainers.rbegin(); it != variablesContainers.rend();
       ++it) {
    if ((*it)->Has(name)) return (*it)->Get(name);
  }

  return badVariable;
}

const VariablesContainer &
VariablesContainersList::GetVariablesContainerFromVariableName(
    const gd::String &variableName) const {
  for (auto it = variablesContainers.rbegin(); it != variablesContainers.rend();
       ++it) {
    if ((*it)->Has(variableName))
      return **it;
  }
  return badVariablesContainer;
}

bool VariablesContainersList::HasVariablesContainer(const gd::VariablesContainer& variablesContainer) const {
  for (auto it = variablesContainers.rbegin(); it != variablesContainers.rend();
       ++it) {
    if (*it == &variablesContainer) return true;
  }

  return false;
}

void VariablesContainersList::ForEachVariableMatchingSearch(
    const gd::String& search,
    std::function<void(const gd::String& name, const gd::Variable& variable)> fn) const {
  for (auto it = variablesContainers.rbegin(); it != variablesContainers.rend();
       ++it) {
    (*it)->ForEachVariableMatchingSearch(search, fn);
  }
}

}  // namespace gd