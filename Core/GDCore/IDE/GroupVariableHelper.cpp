/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GroupVariableHelper.h"

#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectGroup.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/ObjectsContainersList.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/String.h"

namespace gd {

gd::VariablesContainer GroupVariableHelper::MergeVariableContainers(
    const gd::ObjectsContainersList &objectsContainersList,
    const gd::ObjectGroup &objectGroup) {
  gd::VariablesContainer mergedVariablesContainer;

  const auto &objectNames = objectGroup.GetAllObjectsNames();
  std::size_t objectIndex = 0;
  bool isFirstObjectFound = false;
  for (; objectIndex < objectNames.size() && !isFirstObjectFound;
       objectIndex++) {
    const gd::String &objectName = objectNames[objectIndex];
    if (!objectsContainersList.HasObjectOrGroupNamed(objectName)) {
      continue;
    }
    isFirstObjectFound = true;
    mergedVariablesContainer =
        *objectsContainersList.GetObjectOrGroupVariablesContainer(objectName);
  }
  for (; objectIndex < objectNames.size(); objectIndex++) {
    const gd::String &objectName = objectNames[objectIndex];
    if (!objectsContainersList.HasObjectOrGroupNamed(objectName)) {
      continue;
    }
    const auto &variablesContainer =
        *objectsContainersList.GetObjectOrGroupVariablesContainer(objectName);

    for (std::size_t variableIndex = 0;
         variableIndex < mergedVariablesContainer.Count(); ++variableIndex) {
      auto &mergedVariable = mergedVariablesContainer.Get(variableIndex);
      const auto &variableName =
          mergedVariablesContainer.GetNameAt(variableIndex);

      if (variablesContainer.Has(variableName)) {
        auto &variable = variablesContainer.Get(variableName);
        if (mergedVariable.GetType() != variable.GetType()) {
          mergedVariable.CastTo(gd::Variable::Type::MixedTypes);
        } else if (mergedVariable != variable) {
          mergedVariable.MarkAsMixedValues();
        }
      } else {
        mergedVariablesContainer.Remove(variableName);
        variableIndex--;
      }
    }
  }
  return mergedVariablesContainer;
}

void GroupVariableHelper::FillMissingGroupVariablesToObjects(
    gd::ObjectsContainer &globalObjectsContainer,
    gd::ObjectsContainer &objectsContainer,
    const gd::ObjectGroup &objectGroup,
    const gd::SerializerElement &originalSerializedVariables) {
  gd::VariablesContainer groupVariablesContainer;
  groupVariablesContainer.UnserializeFrom(originalSerializedVariables);
  // Add missing variables to objects added in the group.
  for (const gd::String &objectName : objectGroup.GetAllObjectsNames()) {
    const bool hasObject = objectsContainer.HasObjectNamed(objectName);
    if (!hasObject && !globalObjectsContainer.HasObjectNamed(objectName)) {
      continue;
    }
    auto &object = hasObject ? objectsContainer.GetObject(objectName)
                             : globalObjectsContainer.GetObject(objectName);
    auto &variablesContainer = object.GetVariables();
    for (std::size_t variableIndex = 0;
         variableIndex < groupVariablesContainer.Count(); ++variableIndex) {
      auto &groupVariable = groupVariablesContainer.Get(variableIndex);
      const auto &variableName =
          groupVariablesContainer.GetNameAt(variableIndex);

      if (!variablesContainer.Has(variableName)) {
        variablesContainer.Insert(variableName, groupVariable,
                                  variablesContainer.Count());
      }
    }
  }
};

// TODO Handle position changes.
void GroupVariableHelper::ApplyChangesToObjects(
    gd::ObjectsContainer &globalObjectsContainer,
    gd::ObjectsContainer &objectsContainer,
    const gd::VariablesContainer &groupVariablesContainer,
    const gd::ObjectGroup &objectGroup,
    const gd::VariablesChangeset &changeset) {
  for (const gd::String &objectName : objectGroup.GetAllObjectsNames()) {
    const bool hasObject = objectsContainer.HasObjectNamed(objectName);
    if (!hasObject && !globalObjectsContainer.HasObjectNamed(objectName)) {
      continue;
    }
    auto &object = hasObject ? objectsContainer.GetObject(objectName)
                             : globalObjectsContainer.GetObject(objectName);
    auto &variablesContainer = object.GetVariables();
    for (const gd::String &variableName : changeset.removedVariableNames) {
      variablesContainer.Remove(variableName);
    }
    for (const gd::String &variableName : changeset.addedVariableNames) {
      variablesContainer.Insert(variableName,
                                groupVariablesContainer.Get(variableName),
                                variablesContainer.Count());
    }
    for (const auto &pair : changeset.oldToNewVariableNames) {
      const gd::String &oldVariableName = pair.first;
      const gd::String &newVariableName = pair.second;
      variablesContainer.Rename(oldVariableName, newVariableName);
    }
    // Apply type and value changes
    for (const gd::String &variableName : changeset.valueChangedVariableNames) {
      size_t index = variablesContainer.GetPosition(variableName);
      variablesContainer.Remove(variableName);
      variablesContainer.Insert(
          variableName, groupVariablesContainer.Get(variableName), index);
    }
  }
}

} // namespace gd
