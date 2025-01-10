#include "VariablesContainersList.h"

#include <vector>

#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/IDE/EventsFunctionTools.h"

namespace gd {

Variable VariablesContainersList::badVariable;
VariablesContainer VariablesContainersList::badVariablesContainer;

VariablesContainersList
VariablesContainersList::MakeNewVariablesContainersListForProjectAndLayout(
    const gd::Project& project, const gd::Layout& layout) {
  VariablesContainersList variablesContainersList;
  variablesContainersList.Push(project.GetVariables());
  variablesContainersList.Push(layout.GetVariables());
  variablesContainersList.firstLocalVariableContainerIndex = 2;
  return variablesContainersList;
}

VariablesContainersList
VariablesContainersList::MakeNewVariablesContainersListForProject(
    const gd::Project& project) {
  VariablesContainersList variablesContainersList;
  variablesContainersList.Push(project.GetVariables());
  variablesContainersList.firstLocalVariableContainerIndex = 1;
  return variablesContainersList;
}

VariablesContainersList
VariablesContainersList::MakeNewVariablesContainersListForEventsFunctionsExtension(
    const gd::EventsFunctionsExtension &extension) {
  VariablesContainersList variablesContainersList;
  variablesContainersList.Push(extension.GetGlobalVariables());
  variablesContainersList.Push(extension.GetSceneVariables());
  variablesContainersList.firstLocalVariableContainerIndex = 2;
  return variablesContainersList;
}

VariablesContainersList
VariablesContainersList::MakeNewVariablesContainersListForFreeEventsFunction(
    const gd::EventsFunctionsExtension &extension,
    const gd::EventsFunction &eventsFunction,
    gd::VariablesContainer &parameterVariablesContainer) {
  VariablesContainersList variablesContainersList;
  variablesContainersList.Push(extension.GetGlobalVariables());
  variablesContainersList.Push(extension.GetSceneVariables());

  gd::EventsFunctionTools::ParametersToVariablesContainer(
      eventsFunction.GetParametersForEvents(extension),
      parameterVariablesContainer);
  variablesContainersList.Push(parameterVariablesContainer);

  variablesContainersList.firstLocalVariableContainerIndex = 3;
  return variablesContainersList;
}

VariablesContainersList VariablesContainersList::
    MakeNewVariablesContainersListForBehaviorEventsFunction(
        const gd::EventsFunctionsExtension &extension,
        const gd::EventsBasedBehavior &eventsBasedBehavior,
        const gd::EventsFunction &eventsFunction,
        gd::VariablesContainer &parameterVariablesContainer,
        gd::VariablesContainer &propertyVariablesContainer) {
  VariablesContainersList variablesContainersList;
  variablesContainersList.Push(extension.GetGlobalVariables());
  variablesContainersList.Push(extension.GetSceneVariables());

  gd::EventsFunctionTools::PropertiesToVariablesContainer(
      eventsBasedBehavior.GetSharedPropertyDescriptors(), propertyVariablesContainer);
  variablesContainersList.Push(propertyVariablesContainer);

  gd::EventsFunctionTools::PropertiesToVariablesContainer(
      eventsBasedBehavior.GetPropertyDescriptors(), propertyVariablesContainer);
  variablesContainersList.Push(propertyVariablesContainer);

  gd::EventsFunctionTools::ParametersToVariablesContainer(
      eventsFunction.GetParametersForEvents(
          eventsBasedBehavior.GetEventsFunctions()),
      parameterVariablesContainer);
  variablesContainersList.Push(parameterVariablesContainer);

  variablesContainersList.firstLocalVariableContainerIndex = 5;
  return variablesContainersList;
}

VariablesContainersList
VariablesContainersList::MakeNewVariablesContainersListForObjectEventsFunction(
    const gd::EventsFunctionsExtension &extension,
    const gd::EventsBasedObject &eventsBasedObject,
    const gd::EventsFunction &eventsFunction,
    gd::VariablesContainer &parameterVariablesContainer,
    gd::VariablesContainer &propertyVariablesContainer) {
  VariablesContainersList variablesContainersList;
  variablesContainersList.Push(extension.GetGlobalVariables());
  variablesContainersList.Push(extension.GetSceneVariables());

  gd::EventsFunctionTools::PropertiesToVariablesContainer(
      eventsBasedObject.GetPropertyDescriptors(), propertyVariablesContainer);
  variablesContainersList.Push(propertyVariablesContainer);

  gd::EventsFunctionTools::ParametersToVariablesContainer(
      eventsFunction.GetParametersForEvents(
          eventsBasedObject.GetEventsFunctions()),
      parameterVariablesContainer);
  variablesContainersList.Push(parameterVariablesContainer);

  variablesContainersList.firstLocalVariableContainerIndex = 4;
  return variablesContainersList;
}

VariablesContainersList
VariablesContainersList::MakeNewVariablesContainersListPushing(
    const VariablesContainersList& variablesContainersList, const gd::VariablesContainer& variablesContainer) {
  VariablesContainersList newVariablesContainersList(variablesContainersList);
  newVariablesContainersList.Push(variablesContainer);
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

std::size_t
VariablesContainersList::GetVariablesContainerPositionFromVariableName(
    const gd::String &variableName) const {
  for (std::size_t i = variablesContainers.size() - 1; i >= 0 ; --i) {
    if (variablesContainers[i]->Has(variableName))
      return i;
  }
  return gd::String::npos;
}

std::size_t VariablesContainersList::GetLocalVariablesContainerPosition(
    const gd::VariablesContainer &localVariableContainer) const {
  for (std::size_t i = firstLocalVariableContainerIndex;
       i < variablesContainers.size(); ++i) {
    if (variablesContainers[i] == &localVariableContainer)
      return i - firstLocalVariableContainerIndex;
  }
  return gd::String::npos;
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