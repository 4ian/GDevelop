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
    const gd::ObjectGroup objectGroup) {
  gd::VariablesContainer mergedVariablesContainer;

  for (const gd::String &objectName : objectGroup.GetAllObjectsNames()) {
    if (!objectsContainersList.HasObjectOrGroupNamed(objectName)) {
      continue;
    }
    const auto &variablesContainer =
        *objectsContainersList.GetObjectOrGroupVariablesContainer(objectName);

    for (std::size_t i = 0; i < variablesContainer.Count(); ++i) {
      const auto &variable = variablesContainer.Get(i);
      const auto &variableName = variablesContainer.GetNameAt(i);

      if (mergedVariablesContainer.Has(variableName)) {
        auto &mergedVariable = mergedVariablesContainer.Get(variableName);
        if (mergedVariable.GetType() != variable.GetType()) {
          mergedVariable.CastTo(gd::Variable::Type::MixedTypes);
        } else if (mergedVariable != variable) {
          mergedVariable.MarkAsMixedValues();
        }
      } else {
        mergedVariablesContainer.Insert(variableName, variable,
                                        mergedVariablesContainer.Count());
      }
    }
  }
  return mergedVariablesContainer;
}

// TODO Handle position changes.
void GroupVariableHelper::ApplyChangesToObjects(
    gd::ObjectsContainer &globalObjectsContainer,
    gd::ObjectsContainer &objectsContainer,
    gd::VariablesContainer &groupVariablesContainer,
    gd::ObjectGroup objectGroup, const gd::VariablesChangeset &changeset) {
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
                                groupVariablesContainer.Get(variableName), variablesContainer.Count());
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
