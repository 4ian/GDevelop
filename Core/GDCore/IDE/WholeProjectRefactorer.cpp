/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "WholeProjectRefactorer.h"

#include <unordered_map>

#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/DependenciesAnalyzer.h"
#include "GDCore/IDE/GroupVariableHelper.h"
#include "GDCore/IDE/EventBasedBehaviorBrowser.h"
#include "GDCore/IDE/EventBasedObjectBrowser.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/Events/BehaviorParametersFiller.h"
#include "GDCore/IDE/Events/BehaviorTypeRenamer.h"
#include "GDCore/IDE/Events/CustomObjectTypeRenamer.h"
#include "GDCore/IDE/Events/EventsBehaviorRenamer.h"
#include "GDCore/IDE/Events/EventsParameterReplacer.h"
#include "GDCore/IDE/Events/EventsPropertyReplacer.h"
#include "GDCore/IDE/Events/EventsRefactorer.h"
#include "GDCore/IDE/Events/EventsVariableInstructionTypeSwitcher.h"
#include "GDCore/IDE/Events/EventsVariableReplacer.h"
#include "GDCore/IDE/Events/ExpressionsParameterMover.h"
#include "GDCore/IDE/Events/ExpressionsRenamer.h"
#include "GDCore/IDE/Events/InstructionsParameterMover.h"
#include "GDCore/IDE/Events/InstructionsTypeRenamer.h"
#include "GDCore/IDE/Events/LinkEventTargetRenamer.h"
#include "GDCore/IDE/Events/LeaderboardIdRenamer.h"
#include "GDCore/IDE/Events/ProjectElementRenamer.h"
#include "GDCore/IDE/Project/BehaviorObjectTypeRenamer.h"
#include "GDCore/IDE/Project/BehaviorsSharedDataBehaviorTypeRenamer.h"
#include "GDCore/IDE/Project/FunctionParameterBehaviorTypeRenamer.h"
#include "GDCore/IDE/Project/FunctionParameterObjectTypeRenamer.h"
#include "GDCore/IDE/Project/RequiredBehaviorRenamer.h"
#include "GDCore/IDE/ProjectBrowser.h"
#include "GDCore/IDE/ProjectBrowserHelper.h"
#include "GDCore/IDE/UnfilledRequiredBehaviorPropertyProblem.h"
#include "GDCore/IDE/WholeProjectBrowser.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/BehaviorConfigurationContainer.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/ObjectGroup.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

namespace gd {

// By convention, the first parameter of an events based behavior method is
// always called "Object".
const gd::String WholeProjectRefactorer::behaviorObjectParameterName = "Object";
// By convention, the first parameter of an events based object method is
// always called "Object".
const gd::String WholeProjectRefactorer::parentObjectParameterName = "Object";

std::set<gd::String>
WholeProjectRefactorer::GetAllObjectTypesUsingEventsBasedBehavior(
    const gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedBehavior &eventsBasedBehavior) {
  std::set<gd::String> allTypes;
  const gd::String behaviorType = gd::PlatformExtension::GetBehaviorFullType(
      eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName());

  auto addTypesOfObjectsIn =
      [&allTypes, &behaviorType](const gd::ObjectsContainer &objectsContainer) {
        for (auto &object : objectsContainer.GetObjects()) {
          for (auto &behavior : object->GetAllBehaviorContents()) {
            if (behavior.second->GetTypeName() == behaviorType) {
              allTypes.insert(object->GetType());
            }
          }
        }
      };

  addTypesOfObjectsIn(project.GetObjects());
  for (std::size_t s = 0; s < project.GetLayoutsCount(); s++) {
    auto &layout = project.GetLayout(s);
    addTypesOfObjectsIn(layout.GetObjects());
  }

  return allTypes;
}

void WholeProjectRefactorer::EnsureBehaviorEventsFunctionsProperParameters(
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedBehavior &eventsBasedBehavior) {
  for (auto &eventsFunction :
       eventsBasedBehavior.GetEventsFunctions().GetInternalVector()) {
    auto &parameters = eventsFunction->GetParameters();
    while (parameters.GetParametersCount() < 2) {
      gd::ParameterMetadata newParameter;
      parameters.AddParameter(newParameter);
    }

    parameters.GetParameter(0)
        .SetType("object")
        .SetName(behaviorObjectParameterName)
        .SetDescription("Object")
        .SetExtraInfo(eventsBasedBehavior.GetObjectType());
    parameters.GetParameter(1)
        .SetType("behavior")
        .SetName("Behavior")
        .SetDescription("Behavior")
        .SetExtraInfo(gd::PlatformExtension::GetBehaviorFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName()));
  }
}

void WholeProjectRefactorer::EnsureObjectEventsFunctionsProperParameters(
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedObject &eventsBasedObject) {
  for (auto &eventsFunction :
       eventsBasedObject.GetEventsFunctions().GetInternalVector()) {
    auto &parameters = eventsFunction->GetParameters();
    while (parameters.GetParametersCount() < 1) {
      gd::ParameterMetadata newParameter;
      parameters.AddParameter(newParameter);
    }

    parameters.GetParameter(0)
        .SetType("object")
        .SetName(parentObjectParameterName)
        .SetDescription("Object")
        .SetExtraInfo(gd::PlatformExtension::GetObjectFullType(
            eventsFunctionsExtension.GetName(), eventsBasedObject.GetName()));
  }
}

VariablesChangeset
WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
    const gd::SerializerElement &oldSerializedVariablesContainer,
    const gd::VariablesContainer &newVariablesContainer) {
  gd::VariablesChangeset changeset;

  gd::VariablesContainer oldVariablesContainer;
  oldVariablesContainer.UnserializeFrom(oldSerializedVariablesContainer);

  if (oldVariablesContainer.GetPersistentUuid() !=
      newVariablesContainer.GetPersistentUuid()) {
    gd::LogWarning(_(
        "Called ComputeChangesetForVariablesContainer on variables containers "
        "that are different - they can't be compared."));
    return changeset;
  }

  std::unordered_map<gd::String, gd::String> removedUuidAndNames;
  for (std::size_t i = 0; i < oldVariablesContainer.Count(); ++i) {
    const auto &variable = oldVariablesContainer.Get(i);
    const auto &variableName = oldVariablesContainer.GetNameAt(i);

    // All variables are candidate to be removed.
    removedUuidAndNames[variable.GetPersistentUuid()] = variableName;
  }
  for (std::size_t i = 0; i < newVariablesContainer.Count(); ++i) {
    const auto &variable = newVariablesContainer.Get(i);
    const auto &variableName = newVariablesContainer.GetNameAt(i);

    auto existingOldVariableUuidAndName =
        removedUuidAndNames.find(variable.GetPersistentUuid());
    if (existingOldVariableUuidAndName == removedUuidAndNames.end()) {
      // This is a new variable.
      changeset.addedVariableNames.insert(variableName);
    } else {
      const gd::String &oldName = existingOldVariableUuidAndName->second;

      if (oldName != variableName) {
        // This is a renamed variable.
        changeset.oldToNewVariableNames[oldName] = variableName;
      }

      const auto &oldVariable = oldVariablesContainer.Get(oldName);
      if (gd::WholeProjectRefactorer::HasAnyVariableTypeChanged(oldVariable,
                                                                variable)) {
        changeset.typeChangedVariableNames.insert(variableName);
      }
      if (oldVariable != variable
        // Mixed values are never equals, but they must not override anything.
        && !variable.HasMixedValues()) {
        changeset.valueChangedVariableNames.insert(variableName);
      }

      const auto &variablesRenamingChangesetNode =
          gd::WholeProjectRefactorer::ComputeChangesetForVariable(oldVariable,
                                                                  variable);

      if (variablesRenamingChangesetNode) {
        changeset.modifiedVariables[oldName] =
            std::move(variablesRenamingChangesetNode);
      }

      // Renamed or not, this is not a removed variable.
      removedUuidAndNames.erase(variable.GetPersistentUuid());
    }
  }

  for (const auto &removedUuidAndName : removedUuidAndNames) {
    changeset.removedVariableNames.insert(removedUuidAndName.second);
  }

  return changeset;
}

std::shared_ptr<VariablesRenamingChangesetNode>
WholeProjectRefactorer::ComputeChangesetForVariable(
    const gd::Variable &oldVariable, const gd::Variable &newVariable) {

  if (newVariable.GetChildrenCount() == 0 ||
      oldVariable.GetChildrenCount() == 0) {
    return std::shared_ptr<VariablesRenamingChangesetNode>(nullptr);
  }

  std::unordered_map<gd::String, gd::String> oldVariableNamesByUuid;
  for (const auto &pair : oldVariable.GetAllChildren()) {
    const auto &oldName = pair.first;
    const auto oldChild = pair.second;

    // All variables are candidate to be removed.
    oldVariableNamesByUuid[oldChild->GetPersistentUuid()] = oldName;
  }

  auto changeset = std::make_shared<VariablesRenamingChangesetNode>();
  for (const auto &pair : newVariable.GetAllChildren()) {
    const auto &newName = pair.first;
    const auto newChild = pair.second;

    auto existingOldVariableUuidAndName =
        oldVariableNamesByUuid.find(newChild->GetPersistentUuid());
    if (existingOldVariableUuidAndName == oldVariableNamesByUuid.end()) {
      // This is a new variable.
      continue;
    }
    const gd::String &oldName = existingOldVariableUuidAndName->second;
    const auto &oldChild = oldVariable.GetChild(oldName);

    if (oldName != newName) {
      // This is a renamed child.
      changeset->oldToNewVariableNames[oldName] = newName;
    }

    const auto &childChangeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariable(oldChild,
                                                                *newChild);
    if (childChangeset) {
      changeset->modifiedVariables[oldName] = std::move(childChangeset);
    }
  }
  if (changeset->modifiedVariables.size() == 0 &&
      changeset->oldToNewVariableNames.size() == 0) {
    return std::shared_ptr<VariablesRenamingChangesetNode>(nullptr);
  }
  return std::move(changeset);
};

bool WholeProjectRefactorer::HasAnyVariableTypeChanged(
    const gd::Variable &oldVariable, const gd::Variable &newVariable) {
  if (newVariable.GetType() != oldVariable.GetType()) {
    return true;
  }

  if (newVariable.GetChildrenCount() == 0 ||
      oldVariable.GetChildrenCount() == 0) {
    return false;
  }

  std::unordered_map<gd::String, gd::String> oldVariableNamesByUuid;
  for (const auto &pair : oldVariable.GetAllChildren()) {
    const auto &oldName = pair.first;
    const auto oldChild = pair.second;

    // All variables are candidate to be removed.
    oldVariableNamesByUuid[oldChild->GetPersistentUuid()] = oldName;
  }

  for (const auto &pair : newVariable.GetAllChildren()) {
    const auto &newName = pair.first;
    const auto newChild = pair.second;

    auto existingOldVariableUuidAndName =
        oldVariableNamesByUuid.find(newChild->GetPersistentUuid());
    if (existingOldVariableUuidAndName == oldVariableNamesByUuid.end()) {
      // This is a new variable.
      continue;
    }
    const gd::String &oldName = existingOldVariableUuidAndName->second;
    const auto &oldChild = oldVariable.GetChild(oldName);

    if (gd::WholeProjectRefactorer::HasAnyVariableTypeChanged(oldChild,
                                                              *newChild)) {
      return true;
    }
  }
  return false;
}

void WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
    gd::Project &project, gd::VariablesContainer &variablesContainer,
    const gd::VariablesChangeset &changeset,
    const gd::SerializerElement &originalSerializedVariables) {
  // Revert changes
  gd::SerializerElement editedSerializedVariables;
  variablesContainer.SerializeTo(editedSerializedVariables);
  variablesContainer.UnserializeFrom(originalSerializedVariables);

  // Rename and remove variables
  gd::EventsVariableReplacer eventsVariableReplacer(
      project.GetCurrentPlatform(), changeset, changeset.removedVariableNames,
      variablesContainer);
  gd::ProjectBrowserHelper::ExposeProjectEvents(project,
                                                eventsVariableReplacer);

  // Apply back changes
  variablesContainer.UnserializeFrom(editedSerializedVariables);

  // Switch types of instructions
  gd::EventsVariableInstructionTypeSwitcher
      eventsVariableInstructionTypeSwitcher(project.GetCurrentPlatform(),
                                            changeset.typeChangedVariableNames,
                                            variablesContainer);
  gd::ProjectBrowserHelper::ExposeProjectEvents(
      project, eventsVariableInstructionTypeSwitcher);
}

void WholeProjectRefactorer::ApplyRefactoringForGroupVariablesContainer(
    gd::Project &project, gd::ObjectsContainer &globalObjectsContainer,
    gd::ObjectsContainer &objectsContainer,
    const gd::VariablesContainer &groupVariablesContainer,
    const gd::ObjectGroup &objectGroup,
    const gd::VariablesChangeset &changeset,
    const gd::SerializerElement &originalSerializedVariables) {

  // While we support refactoring that would remove all references (actions, conditions...)
  // it's both a bit dangerous for the user and we would need to show the user what
  // will be removed before doing so. For now, just clear the removed variables so they don't
  // trigger any refactoring.
  std::unordered_set<gd::String> removedVariableNames;

  // Rename variables in events for the objects of the group.
  for (const gd::String &objectName : objectGroup.GetAllObjectsNames()) {
    const bool hasObject = objectsContainer.HasObjectNamed(objectName);
    if (!hasObject && !globalObjectsContainer.HasObjectNamed(objectName)) {
      continue;
    }
    auto &object = hasObject ? objectsContainer.GetObject(objectName)
                             : globalObjectsContainer.GetObject(objectName);
    auto &variablesContainer = object.GetVariables();

    gd::EventsVariableReplacer eventsVariableReplacer(
        project.GetCurrentPlatform(), changeset,
        removedVariableNames, variablesContainer);
    gd::ProjectBrowserHelper::ExposeProjectEvents(project,
                                                  eventsVariableReplacer);
  }

  // Rename variables in events for the group.
  gd::EventsVariableReplacer eventsVariableReplacer(
      project.GetCurrentPlatform(), changeset, removedVariableNames,
      objectGroup.GetName());
  gd::ProjectBrowserHelper::ExposeProjectEvents(project,
                                                eventsVariableReplacer);

  // Apply changes to objects.
  gd::GroupVariableHelper::FillMissingGroupVariablesToObjects(
      globalObjectsContainer,
      objectsContainer,
      objectGroup,
      originalSerializedVariables);
  gd::GroupVariableHelper::ApplyChangesToObjects(
      globalObjectsContainer, objectsContainer, groupVariablesContainer,
      objectGroup, changeset);

  // Switch types of instructions for the group objects.
  for (const gd::String &objectName : objectGroup.GetAllObjectsNames()) {
    const bool hasObject = objectsContainer.HasObjectNamed(objectName);
    if (!hasObject && !globalObjectsContainer.HasObjectNamed(objectName)) {
      continue;
    }
    auto &object = hasObject ? objectsContainer.GetObject(objectName)
                             : globalObjectsContainer.GetObject(objectName);
    auto &variablesContainer = object.GetVariables();

    gd::EventsVariableInstructionTypeSwitcher
        eventsVariableInstructionTypeSwitcher(
            project.GetCurrentPlatform(), changeset.typeChangedVariableNames,
            variablesContainer);
    gd::ProjectBrowserHelper::ExposeProjectEvents(
        project, eventsVariableInstructionTypeSwitcher);
  }

  // Switch types of instructions for the group.
  gd::EventsVariableInstructionTypeSwitcher
      eventsVariableInstructionTypeSwitcher(project.GetCurrentPlatform(),
                                            changeset.typeChangedVariableNames,
                                            objectGroup.GetName());
  gd::ProjectBrowserHelper::ExposeProjectEvents(
      project, eventsVariableInstructionTypeSwitcher);
}

void WholeProjectRefactorer::UpdateExtensionNameInEventsBasedBehavior(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::String &sourceExtensionName) {
  const EventBasedBehaviorBrowser eventBasedBehaviorBrowser(
      eventsFunctionsExtension, eventsBasedBehavior);
  WholeProjectRefactorer::RenameEventsFunctionsExtension(
      project, eventsFunctionsExtension, sourceExtensionName,
      eventsFunctionsExtension.GetName(), eventBasedBehaviorBrowser);
}

void WholeProjectRefactorer::UpdateExtensionNameInEventsBasedObject(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    gd::EventsBasedObject &eventsBasedObject,
    const gd::String &sourceExtensionName) {
  const EventBasedObjectBrowser eventBasedObjectBrowser(
      eventsFunctionsExtension, eventsBasedObject);
  WholeProjectRefactorer::RenameEventsFunctionsExtension(
      project, eventsFunctionsExtension, sourceExtensionName,
      eventsFunctionsExtension.GetName(), eventBasedObjectBrowser);
}

void WholeProjectRefactorer::RenameEventsFunctionsExtension(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::String &oldName, const gd::String &newName) {
  const WholeProjectBrowser wholeProjectBrowser;
  RenameEventsFunctionsExtension(project, eventsFunctionsExtension, oldName,
                                 newName, wholeProjectBrowser);
}

void WholeProjectRefactorer::RenameEventsFunctionsExtension(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::String &oldName, const gd::String &newName,
    const gd::ProjectBrowser &projectBrowser) {
  auto renameEventsFunction = [&project, &oldName, &newName, &projectBrowser](
                                  const gd::EventsFunction &eventsFunction) {
    DoRenameEventsFunction(project, eventsFunction,
                           gd::PlatformExtension::GetEventsFunctionFullType(
                               oldName, eventsFunction.GetName()),
                           gd::PlatformExtension::GetEventsFunctionFullType(
                               newName, eventsFunction.GetName()),
                           projectBrowser);
  };

  auto renameBehaviorEventsFunction =
      [&project, &oldName, &newName,
       &projectBrowser](const gd::EventsBasedBehavior &eventsBasedBehavior,
                        const gd::EventsFunction &eventsFunction) {
        if (eventsFunction.IsExpression()) {
          // Nothing to do, expressions are not including the extension name
        }
        if (eventsFunction.IsAction() || eventsFunction.IsCondition()) {
          gd::InstructionsTypeRenamer renamer = gd::InstructionsTypeRenamer(
              project,
              gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                  oldName, eventsBasedBehavior.GetName(),
                  eventsFunction.GetName()),
              gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                  newName, eventsBasedBehavior.GetName(),
                  eventsFunction.GetName()));
          projectBrowser.ExposeEvents(project, renamer);
        }
      };

  auto renameBehaviorPropertyFunctions =
      [&project, &oldName, &newName,
       &projectBrowser](const gd::EventsBasedBehavior &eventsBasedBehavior,
                        const gd::NamedPropertyDescriptor &property) {
        gd::InstructionsTypeRenamer actionRenamer = gd::InstructionsTypeRenamer(
            project,
            gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                oldName, eventsBasedBehavior.GetName(),
                gd::EventsBasedBehavior::GetPropertyActionName(
                    property.GetName())),
            gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                newName, eventsBasedBehavior.GetName(),
                gd::EventsBasedBehavior::GetPropertyActionName(
                    property.GetName())));
        projectBrowser.ExposeEvents(project, actionRenamer);

        gd::InstructionsTypeRenamer conditionRenamer =
            gd::InstructionsTypeRenamer(
                project,
                gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                    oldName, eventsBasedBehavior.GetName(),
                    gd::EventsBasedBehavior::GetPropertyConditionName(
                        property.GetName())),
                gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                    newName, eventsBasedBehavior.GetName(),
                    gd::EventsBasedBehavior::GetPropertyConditionName(
                        property.GetName())));
        projectBrowser.ExposeEvents(project, conditionRenamer);

        // Nothing to do for expressions, expressions are not including the
        // extension name
      };

  auto renameBehaviorSharedPropertyFunctions =
      [&project, &oldName, &newName,
       &projectBrowser](const gd::EventsBasedBehavior &eventsBasedBehavior,
                        const gd::NamedPropertyDescriptor &property) {
        gd::InstructionsTypeRenamer actionRenamer = gd::InstructionsTypeRenamer(
            project,
            gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                oldName, eventsBasedBehavior.GetName(),
                gd::EventsBasedBehavior::GetSharedPropertyActionName(
                    property.GetName())),
            gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                newName, eventsBasedBehavior.GetName(),
                gd::EventsBasedBehavior::GetSharedPropertyActionName(
                    property.GetName())));
        projectBrowser.ExposeEvents(project, actionRenamer);

        gd::InstructionsTypeRenamer conditionRenamer =
            gd::InstructionsTypeRenamer(
                project,
                gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                    oldName, eventsBasedBehavior.GetName(),
                    gd::EventsBasedBehavior::GetSharedPropertyConditionName(
                        property.GetName())),
                gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                    newName, eventsBasedBehavior.GetName(),
                    gd::EventsBasedBehavior::GetSharedPropertyConditionName(
                        property.GetName())));
        projectBrowser.ExposeEvents(project, conditionRenamer);

        // Nothing to do for expressions, expressions are not including the
        // extension name
      };

  auto renameObjectEventsFunction =
      [&project, &oldName, &newName,
       &projectBrowser](const gd::EventsBasedObject &eventsBasedObject,
                        const gd::EventsFunction &eventsFunction) {
        if (eventsFunction.IsExpression()) {
          // Nothing to do, expressions are not including the extension name
        }
        if (eventsFunction.IsAction() || eventsFunction.IsCondition()) {
          gd::InstructionsTypeRenamer renamer = gd::InstructionsTypeRenamer(
              project,
              gd::PlatformExtension::GetObjectEventsFunctionFullType(
                  oldName, eventsBasedObject.GetName(),
                  eventsFunction.GetName()),
              gd::PlatformExtension::GetObjectEventsFunctionFullType(
                  newName, eventsBasedObject.GetName(),
                  eventsFunction.GetName()));
          projectBrowser.ExposeEvents(project, renamer);
        }
      };

  auto renameObjectPropertyFunctions =
      [&project, &oldName, &newName,
       &projectBrowser](const gd::EventsBasedObject &eventsBasedObject,
                        const gd::NamedPropertyDescriptor &property) {
        gd::InstructionsTypeRenamer actionRenamer = gd::InstructionsTypeRenamer(
            project,
            gd::PlatformExtension::GetObjectEventsFunctionFullType(
                oldName, eventsBasedObject.GetName(),
                gd::EventsBasedObject::GetPropertyActionName(
                    property.GetName())),
            gd::PlatformExtension::GetObjectEventsFunctionFullType(
                newName, eventsBasedObject.GetName(),
                gd::EventsBasedObject::GetPropertyActionName(
                    property.GetName())));
        projectBrowser.ExposeEvents(project, actionRenamer);

        gd::InstructionsTypeRenamer conditionRenamer =
            gd::InstructionsTypeRenamer(
                project,
                gd::PlatformExtension::GetObjectEventsFunctionFullType(
                    oldName, eventsBasedObject.GetName(),
                    gd::EventsBasedObject::GetPropertyConditionName(
                        property.GetName())),
                gd::PlatformExtension::GetObjectEventsFunctionFullType(
                    newName, eventsBasedObject.GetName(),
                    gd::EventsBasedObject::GetPropertyConditionName(
                        property.GetName())));
        projectBrowser.ExposeEvents(project, conditionRenamer);

        // Nothing to do for expressions, expressions are not including the
        // extension name
      };

  // Order is important: we first rename the expressions then the instructions,
  // to avoid being unable to fetch the metadata (the types of parameters) of
  // instructions after they are renamed.

  // Free expressions
  for (auto &&eventsFunction : eventsFunctionsExtension.GetInternalVector()) {
    if (eventsFunction->IsExpression()) {
      renameEventsFunction(*eventsFunction);
    }
  }
  // Behavior expressions
  for (auto &&eventsBasedBehavior :
       eventsFunctionsExtension.GetEventsBasedBehaviors().GetInternalVector()) {
    auto &behaviorEventsFunctions = eventsBasedBehavior->GetEventsFunctions();
    for (auto &&eventsFunction : behaviorEventsFunctions.GetInternalVector()) {
      if (eventsFunction->IsExpression()) {
        renameBehaviorEventsFunction(*eventsBasedBehavior, *eventsFunction);
      }
    }
  }

  // Free instructions
  for (auto &&eventsFunction : eventsFunctionsExtension.GetInternalVector()) {
    if (eventsFunction->IsAction() || eventsFunction->IsCondition()) {
      renameEventsFunction(*eventsFunction);
    }
  }

  // Behavior instructions
  for (auto &&eventsBasedBehavior :
       eventsFunctionsExtension.GetEventsBasedBehaviors().GetInternalVector()) {
    auto &behaviorEventsFunctions = eventsBasedBehavior->GetEventsFunctions();
    for (auto &&eventsFunction : behaviorEventsFunctions.GetInternalVector()) {
      if (eventsFunction->IsAction() || eventsFunction->IsCondition()) {
        renameBehaviorEventsFunction(*eventsBasedBehavior, *eventsFunction);
      }
    }
  }

  // Behavior properties
  for (auto &&eventsBasedBehavior :
       eventsFunctionsExtension.GetEventsBasedBehaviors().GetInternalVector()) {
    for (auto &&propertyDescriptor :
         eventsBasedBehavior->GetPropertyDescriptors().GetInternalVector()) {
      renameBehaviorPropertyFunctions(*eventsBasedBehavior,
                                      *propertyDescriptor);
    }
    for (auto &&propertyDescriptor :
         eventsBasedBehavior->GetSharedPropertyDescriptors()
             .GetInternalVector()) {
      renameBehaviorSharedPropertyFunctions(*eventsBasedBehavior,
                                            *propertyDescriptor);
    }
  }

  // Object instructions
  for (auto &&eventsBasedObject :
       eventsFunctionsExtension.GetEventsBasedObjects().GetInternalVector()) {
    auto &objectEventsFunctions = eventsBasedObject->GetEventsFunctions();
    for (auto &&eventsFunction : objectEventsFunctions.GetInternalVector()) {
      if (eventsFunction->IsAction() || eventsFunction->IsCondition()) {
        renameObjectEventsFunction(*eventsBasedObject, *eventsFunction);
      }
    }
  }

  // Object properties
  for (auto &&eventsBasedObject :
       eventsFunctionsExtension.GetEventsBasedObjects().GetInternalVector()) {
    auto &objectProperties = eventsBasedObject->GetPropertyDescriptors();
    for (auto &&propertyDescriptor : objectProperties.GetInternalVector()) {
      renameObjectPropertyFunctions(*eventsBasedObject, *propertyDescriptor);
    }
  }

  // Finally, rename behaviors used in objects
  for (auto &&eventsBasedBehavior :
       eventsFunctionsExtension.GetEventsBasedBehaviors().GetInternalVector()) {
    DoRenameBehavior(project,
                     gd::PlatformExtension::GetBehaviorFullType(
                         oldName, eventsBasedBehavior->GetName()),
                     gd::PlatformExtension::GetBehaviorFullType(
                         newName, eventsBasedBehavior->GetName()),
                     projectBrowser);
  }

  // Finally, rename custom objects type
  for (auto &&eventsBasedObject :
       eventsFunctionsExtension.GetEventsBasedObjects().GetInternalVector()) {
    DoRenameObject(project,
                   gd::PlatformExtension::GetObjectFullType(
                       oldName, eventsBasedObject->GetName()),
                   gd::PlatformExtension::GetObjectFullType(
                       newName, eventsBasedObject->GetName()),
                   projectBrowser);
  }
}

void WholeProjectRefactorer::RenameEventsFunction(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::String &oldFunctionName, const gd::String &newFunctionName) {
  if (!eventsFunctionsExtension.HasEventsFunctionNamed(oldFunctionName))
    return;

  const gd::EventsFunction &eventsFunction =
      eventsFunctionsExtension.GetEventsFunction(oldFunctionName);

  const WholeProjectBrowser wholeProjectExposer;
  DoRenameEventsFunction(
      project, eventsFunction,
      gd::PlatformExtension::GetEventsFunctionFullType(
          eventsFunctionsExtension.GetName(), oldFunctionName),
      gd::PlatformExtension::GetEventsFunctionFullType(
          eventsFunctionsExtension.GetName(), newFunctionName),
      wholeProjectExposer);

  if (eventsFunction.GetFunctionType() ==
      gd::EventsFunction::ExpressionAndCondition) {
    for (auto &&otherFunction : eventsFunctionsExtension.GetInternalVector()) {
      if (otherFunction->GetFunctionType() ==
              gd::EventsFunction::ActionWithOperator &&
          otherFunction->GetGetterName() == oldFunctionName) {
        otherFunction->SetGetterName(newFunctionName);
      }
    }
  }
}

void WholeProjectRefactorer::RenameBehaviorEventsFunction(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::String &oldFunctionName, const gd::String &newFunctionName) {
  auto &eventsFunctions = eventsBasedBehavior.GetEventsFunctions();
  if (!eventsFunctions.HasEventsFunctionNamed(oldFunctionName))
    return;

  const gd::EventsFunction &eventsFunction =
      eventsFunctions.GetEventsFunction(oldFunctionName);

  // Order is important: we first rename the expressions then the instructions,
  // to avoid being unable to fetch the metadata (the types of parameters) of
  // instructions after they are renamed.
  if (eventsFunction.IsExpression()) {
    gd::ExpressionsRenamer renamer =
        gd::ExpressionsRenamer(project.GetCurrentPlatform());
    renamer.SetReplacedBehaviorExpression(
        gd::PlatformExtension::GetBehaviorFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName()),
        oldFunctionName, newFunctionName);
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, renamer);
  }
  if (eventsFunction.IsAction() || eventsFunction.IsCondition()) {
    gd::InstructionsTypeRenamer renamer = gd::InstructionsTypeRenamer(
        project,
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName(),
            oldFunctionName),
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName(),
            newFunctionName));
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, renamer);
  }
  if (eventsFunction.GetFunctionType() ==
      gd::EventsFunction::ExpressionAndCondition) {
    for (auto &&otherFunction :
         eventsBasedBehavior.GetEventsFunctions().GetInternalVector()) {
      if (otherFunction->GetFunctionType() ==
              gd::EventsFunction::ActionWithOperator &&
          otherFunction->GetGetterName() == oldFunctionName) {
        otherFunction->SetGetterName(newFunctionName);
      }
    }
  }
}

void WholeProjectRefactorer::RenameObjectEventsFunction(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedObject &eventsBasedObject,
    const gd::String &oldFunctionName, const gd::String &newFunctionName) {
  auto &eventsFunctions = eventsBasedObject.GetEventsFunctions();
  if (!eventsFunctions.HasEventsFunctionNamed(oldFunctionName))
    return;

  const gd::EventsFunction &eventsFunction =
      eventsFunctions.GetEventsFunction(oldFunctionName);

  if (eventsFunction.IsExpression()) {
    gd::ExpressionsRenamer renamer =
        gd::ExpressionsRenamer(project.GetCurrentPlatform());
    renamer.SetReplacedObjectExpression(
        gd::PlatformExtension::GetObjectFullType(
            eventsFunctionsExtension.GetName(), eventsBasedObject.GetName()),
        oldFunctionName, newFunctionName);
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, renamer);
  }
  if (eventsFunction.IsAction() || eventsFunction.IsCondition()) {
    gd::InstructionsTypeRenamer renamer = gd::InstructionsTypeRenamer(
        project,
        gd::PlatformExtension::GetObjectEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), eventsBasedObject.GetName(),
            oldFunctionName),
        gd::PlatformExtension::GetObjectEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), eventsBasedObject.GetName(),
            newFunctionName));
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, renamer);
  }
  if (eventsFunction.GetFunctionType() ==
      gd::EventsFunction::ExpressionAndCondition) {
    for (auto &&otherFunction :
         eventsBasedObject.GetEventsFunctions().GetInternalVector()) {
      if (otherFunction->GetFunctionType() ==
              gd::EventsFunction::ActionWithOperator &&
          otherFunction->GetGetterName() == oldFunctionName) {
        otherFunction->SetGetterName(newFunctionName);
      }
    }
  }
}

void WholeProjectRefactorer::RenameParameter(
    gd::Project &project, gd::ProjectScopedContainers &projectScopedContainers,
    gd::EventsFunction &eventsFunction,
    const gd::ObjectsContainer &parameterObjectsContainer,
    const gd::String &oldParameterName, const gd::String &newParameterName) {
  auto &parameters = eventsFunction.GetParameters();
  if (!parameters.HasParameterNamed(oldParameterName))
    return;
  auto &parameter = parameters.GetParameter(oldParameterName);
  if (parameter.GetValueTypeMetadata().IsObject()) {
    gd::WholeProjectRefactorer::ObjectOrGroupRenamedInEventsFunction(
        project, projectScopedContainers, eventsFunction,
        parameterObjectsContainer, oldParameterName, newParameterName, false);
  } else if (parameter.GetValueTypeMetadata().IsBehavior()) {
    size_t behaviorParameterIndex = parameters.GetParameterPosition(parameter);
    size_t objectParameterIndex =
        gd::ParameterMetadataTools::GetObjectParameterIndexFor(
            parameters, behaviorParameterIndex);
    if (objectParameterIndex == gd::String::npos) {
      return;
    }
    const gd::String &objectName =
        parameters.GetParameter(objectParameterIndex).GetName();
    gd::EventsBehaviorRenamer behaviorRenamer(project.GetCurrentPlatform(),
                                              objectName, oldParameterName,
                                              newParameterName);
    behaviorRenamer.Launch(eventsFunction.GetEvents(), projectScopedContainers);
  } else {
    // Rename parameter names directly used as an identifier.
    std::unordered_map<gd::String, gd::String> oldToNewParameterNames = {
        {oldParameterName, newParameterName}};
    gd::EventsParameterReplacer eventsParameterReplacer(
        project.GetCurrentPlatform(), oldToNewParameterNames);
    eventsParameterReplacer.Launch(eventsFunction.GetEvents(),
                                   projectScopedContainers);

    // Rename parameter names in legacy expressions and instructions
    gd::ProjectElementRenamer projectElementRenamer(
        project.GetCurrentPlatform(), "functionParameterName", oldParameterName,
        newParameterName);
    projectElementRenamer.Launch(eventsFunction.GetEvents(),
                                 projectScopedContainers);
  }
}

void WholeProjectRefactorer::ChangeParameterType(
    gd::Project &project, gd::ProjectScopedContainers &projectScopedContainers,
    gd::EventsFunction &eventsFunction,
    const gd::ObjectsContainer &parameterObjectsContainer,
    const gd::String &parameterName) {
  std::unordered_set<gd::String> typeChangedPropertyNames;
  typeChangedPropertyNames.insert(parameterName);
  gd::VariablesContainer propertyVariablesContainer(
      gd::VariablesContainer::SourceType::Properties);
  gd::EventsVariableInstructionTypeSwitcher
      eventsVariableInstructionTypeSwitcher(project.GetCurrentPlatform(),
                                            typeChangedPropertyNames,
                                            propertyVariablesContainer);
  eventsVariableInstructionTypeSwitcher.Launch(eventsFunction.GetEvents(),
                                               projectScopedContainers);
}

void WholeProjectRefactorer::MoveEventsFunctionParameter(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::String &functionName, std::size_t oldIndex,
    std::size_t newIndex) {
  if (!eventsFunctionsExtension.HasEventsFunctionNamed(functionName))
    return;

  const gd::EventsFunction &eventsFunction =
      eventsFunctionsExtension.GetEventsFunction(functionName);

  const gd::String &eventsFunctionType =
      gd::PlatformExtension::GetEventsFunctionFullType(
          eventsFunctionsExtension.GetName(), functionName);

  if (eventsFunction.IsExpression()) {
    gd::ExpressionsParameterMover mover =
        gd::ExpressionsParameterMover(project.GetCurrentPlatform());
    mover.SetFreeExpressionMovedParameter(eventsFunctionType, oldIndex,
                                          newIndex);
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, mover);
  }
  if (eventsFunction.IsAction() || eventsFunction.IsCondition()) {
    const int operatorIndexOffset = eventsFunction.IsExpression() ? 2 : 0;
    gd::InstructionsParameterMover mover = gd::InstructionsParameterMover(
        project, eventsFunctionType, oldIndex + operatorIndexOffset,
        newIndex + operatorIndexOffset);
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, mover);
  }
}

void WholeProjectRefactorer::MoveBehaviorEventsFunctionParameter(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::String &functionName, std::size_t oldIndex,
    std::size_t newIndex) {
  auto &eventsFunctions = eventsBasedBehavior.GetEventsFunctions();
  if (!eventsFunctions.HasEventsFunctionNamed(functionName))
    return;

  const gd::EventsFunction &eventsFunction =
      eventsFunctions.GetEventsFunction(functionName);

  const gd::String &eventsFunctionType =
      gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
          eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName(),
          functionName);

  if (eventsFunction.IsExpression()) {
    gd::ExpressionsParameterMover mover =
        gd::ExpressionsParameterMover(project.GetCurrentPlatform());
    mover.SetBehaviorExpressionMovedParameter(
        gd::PlatformExtension::GetBehaviorFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName()),
        functionName, oldIndex, newIndex);
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, mover);
  }
  if (eventsFunction.IsAction() || eventsFunction.IsCondition()) {
    const int operatorIndexOffset = eventsFunction.IsExpression() ? 2 : 0;
    gd::InstructionsParameterMover mover = gd::InstructionsParameterMover(
        project, eventsFunctionType, oldIndex + operatorIndexOffset,
        newIndex + operatorIndexOffset);
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, mover);
  }
}

void WholeProjectRefactorer::MoveObjectEventsFunctionParameter(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedObject &eventsBasedObject,
    const gd::String &functionName, std::size_t oldIndex,
    std::size_t newIndex) {
  auto &eventsFunctions = eventsBasedObject.GetEventsFunctions();
  if (!eventsFunctions.HasEventsFunctionNamed(functionName))
    return;

  const gd::EventsFunction &eventsFunction =
      eventsFunctions.GetEventsFunction(functionName);

  const gd::String &eventsFunctionType =
      gd::PlatformExtension::GetObjectEventsFunctionFullType(
          eventsFunctionsExtension.GetName(), eventsBasedObject.GetName(),
          functionName);

  if (eventsFunction.IsExpression()) {
    gd::ExpressionsParameterMover mover =
        gd::ExpressionsParameterMover(project.GetCurrentPlatform());
    mover.SetObjectExpressionMovedParameter(
        gd::PlatformExtension::GetObjectFullType(
            eventsFunctionsExtension.GetName(), eventsBasedObject.GetName()),
        functionName, oldIndex, newIndex);
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, mover);
  }
  if (eventsFunction.IsAction() || eventsFunction.IsCondition()) {
    const int operatorIndexOffset = eventsFunction.IsExpression() ? 2 : 0;
    gd::InstructionsParameterMover mover = gd::InstructionsParameterMover(
        project, eventsFunctionType, oldIndex + operatorIndexOffset,
        newIndex + operatorIndexOffset);
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, mover);
  }
}

void WholeProjectRefactorer::RenameEventsBasedBehaviorProperty(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::String &oldPropertyName, const gd::String &newPropertyName) {
  auto &properties = eventsBasedBehavior.GetPropertyDescriptors();
  if (!properties.Has(oldPropertyName))
    return;

  if (properties.Get(oldPropertyName).GetType() == "Behavior") {
    // This is a property representing another behavior that must exist on the
    // object.

    // This other "required behavior" uses the property name, that is about to
    // change, as its name.
    // So we must change all reference to this name in the events of the
    // behavior functions.
    gd::EventsBehaviorRenamer behaviorRenamer(project.GetCurrentPlatform(),
                                              behaviorObjectParameterName,
                                              oldPropertyName, newPropertyName);

    gd::ProjectBrowserHelper::ExposeEventsBasedBehaviorEvents(
        project, eventsFunctionsExtension, eventsBasedBehavior,
        behaviorRenamer);
  } else {
    // Properties that represent primitive values will be used through
    // their related actions/conditions/expressions. Rename these.

    // Order is important: we first rename the expressions then the
    // instructions, to avoid being unable to fetch the metadata (the types of
    // parameters) of instructions after they are renamed.

    // Rename legacy expressions like: Object.Behavior::PropertyMyPropertyName()
    gd::ExpressionsRenamer expressionRenamer =
        gd::ExpressionsRenamer(project.GetCurrentPlatform());
    expressionRenamer.SetReplacedBehaviorExpression(
        gd::PlatformExtension::GetBehaviorFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName()),
        EventsBasedBehavior::GetPropertyExpressionName(oldPropertyName),
        EventsBasedBehavior::GetPropertyExpressionName(newPropertyName));
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, expressionRenamer);

    // Rename property names directly used as an identifier.
    std::unordered_map<gd::String, gd::String> oldToNewPropertyNames = {
        {oldPropertyName, newPropertyName}};
    std::unordered_set<gd::String> removedPropertyNames;
    gd::EventsPropertyReplacer eventsPropertyReplacer(
        project.GetCurrentPlatform(), properties, oldToNewPropertyNames,
        removedPropertyNames);
    gd::ProjectBrowserHelper::ExposeEventsBasedBehaviorEvents(
        project, eventsFunctionsExtension, eventsBasedBehavior,
        eventsPropertyReplacer);

    gd::InstructionsTypeRenamer actionRenamer = gd::InstructionsTypeRenamer(
        project,
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName(),
            EventsBasedBehavior::GetPropertyActionName(oldPropertyName)),
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName(),
            EventsBasedBehavior::GetPropertyActionName(newPropertyName)));
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, actionRenamer);

    gd::InstructionsTypeRenamer conditionRenamer = gd::InstructionsTypeRenamer(
        project,
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName(),
            EventsBasedBehavior::GetPropertyConditionName(oldPropertyName)),
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName(),
            EventsBasedBehavior::GetPropertyConditionName(newPropertyName)));
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, conditionRenamer);
  }
}

void WholeProjectRefactorer::RenameEventsBasedBehaviorSharedProperty(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::String &oldPropertyName, const gd::String &newPropertyName) {
  auto &properties = eventsBasedBehavior.GetSharedPropertyDescriptors();
  if (!properties.Has(oldPropertyName))
    return;

  if (properties.Get(oldPropertyName).GetType() == "Behavior") {
    // This is a property representing another behavior that must exist on the
    // object.

    // This other "required behavior" uses the property name, that is about to
    // change, as its name.
    // So we must change all reference to this name in the events of the
    // behavior functions.
    gd::EventsBehaviorRenamer behaviorRenamer(project.GetCurrentPlatform(),
                                              behaviorObjectParameterName,
                                              oldPropertyName, newPropertyName);

    gd::ProjectBrowserHelper::ExposeEventsBasedBehaviorEvents(
        project, eventsFunctionsExtension, eventsBasedBehavior,
        behaviorRenamer);
  } else {
    // Properties that represent primitive values will be used through
    // their related actions/conditions/expressions. Rename these.

    // Order is important: we first rename the expressions then the
    // instructions, to avoid being unable to fetch the metadata (the types of
    // parameters) of instructions after they are renamed.

    // Rename legacy expressions like: Object.Behavior::SharedPropertyMyPropertyName()
    gd::ExpressionsRenamer expressionRenamer =
        gd::ExpressionsRenamer(project.GetCurrentPlatform());
    expressionRenamer.SetReplacedBehaviorExpression(
        gd::PlatformExtension::GetBehaviorFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName()),
        EventsBasedBehavior::GetSharedPropertyExpressionName(oldPropertyName),
        EventsBasedBehavior::GetSharedPropertyExpressionName(newPropertyName));
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, expressionRenamer);

    // Rename property names directly used as an identifier.
    std::unordered_map<gd::String, gd::String> oldToNewPropertyNames = {
        {oldPropertyName, newPropertyName}};
    std::unordered_set<gd::String> removedPropertyNames;
    gd::EventsPropertyReplacer eventsPropertyReplacer(
        project.GetCurrentPlatform(), properties, oldToNewPropertyNames,
        removedPropertyNames);
    gd::ProjectBrowserHelper::ExposeEventsBasedBehaviorEvents(
        project, eventsFunctionsExtension, eventsBasedBehavior,
        eventsPropertyReplacer);

    gd::InstructionsTypeRenamer actionRenamer = gd::InstructionsTypeRenamer(
        project,
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName(),
            EventsBasedBehavior::GetSharedPropertyActionName(oldPropertyName)),
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName(),
            EventsBasedBehavior::GetSharedPropertyActionName(newPropertyName)));
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, actionRenamer);

    gd::InstructionsTypeRenamer conditionRenamer = gd::InstructionsTypeRenamer(
        project,
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName(),
            EventsBasedBehavior::GetSharedPropertyConditionName(
                oldPropertyName)),
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName(),
            EventsBasedBehavior::GetSharedPropertyConditionName(
                newPropertyName)));
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, conditionRenamer);
  }
}

void WholeProjectRefactorer::RenameEventsBasedObjectProperty(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedObject &eventsBasedObject,
    const gd::String &oldPropertyName, const gd::String &newPropertyName) {
  auto &properties = eventsBasedObject.GetPropertyDescriptors();
  if (!properties.Has(oldPropertyName))
    return;

  // Properties that represent primitive values will be used through
  // their related actions/conditions/expressions. Rename these.

  // Order is important: we first rename the expressions then the
  // instructions, to avoid being unable to fetch the metadata (the types of
  // parameters) of instructions after they are renamed.

  // Rename legacy expressions like: Object.PropertyMyPropertyName()
  gd::ExpressionsRenamer expressionRenamer =
      gd::ExpressionsRenamer(project.GetCurrentPlatform());
  expressionRenamer.SetReplacedObjectExpression(
      gd::PlatformExtension::GetObjectFullType(
          eventsFunctionsExtension.GetName(), eventsBasedObject.GetName()),
      EventsBasedObject::GetPropertyExpressionName(oldPropertyName),
      EventsBasedObject::GetPropertyExpressionName(newPropertyName));
  gd::ProjectBrowserHelper::ExposeProjectEvents(project, expressionRenamer);

  // Rename property names directly used as an identifier.
  std::unordered_map<gd::String, gd::String> oldToNewPropertyNames = {
      {oldPropertyName, newPropertyName}};
  std::unordered_set<gd::String> removedPropertyNames;
  gd::EventsPropertyReplacer eventsPropertyReplacer(
      project.GetCurrentPlatform(), properties, oldToNewPropertyNames,
      removedPropertyNames);
  gd::ProjectBrowserHelper::ExposeEventsBasedObjectEvents(
      project, eventsFunctionsExtension, eventsBasedObject,
      eventsPropertyReplacer);

  gd::InstructionsTypeRenamer actionRenamer = gd::InstructionsTypeRenamer(
      project,
      gd::PlatformExtension::GetObjectEventsFunctionFullType(
          eventsFunctionsExtension.GetName(), eventsBasedObject.GetName(),
          EventsBasedObject::GetPropertyActionName(oldPropertyName)),
      gd::PlatformExtension::GetObjectEventsFunctionFullType(
          eventsFunctionsExtension.GetName(), eventsBasedObject.GetName(),
          EventsBasedObject::GetPropertyActionName(newPropertyName)));
  gd::ProjectBrowserHelper::ExposeProjectEvents(project, actionRenamer);

  gd::InstructionsTypeRenamer conditionRenamer = gd::InstructionsTypeRenamer(
      project,
      gd::PlatformExtension::GetObjectEventsFunctionFullType(
          eventsFunctionsExtension.GetName(), eventsBasedObject.GetName(),
          EventsBasedObject::GetPropertyConditionName(oldPropertyName)),
      gd::PlatformExtension::GetObjectEventsFunctionFullType(
          eventsFunctionsExtension.GetName(), eventsBasedObject.GetName(),
          EventsBasedObject::GetPropertyConditionName(newPropertyName)));
  gd::ProjectBrowserHelper::ExposeProjectEvents(project, conditionRenamer);
}

void WholeProjectRefactorer::ChangeEventsBasedBehaviorPropertyType(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::String &propertyName) {
  std::unordered_set<gd::String> typeChangedPropertyNames;
  typeChangedPropertyNames.insert(propertyName);
  gd::VariablesContainer propertyVariablesContainer(
      gd::VariablesContainer::SourceType::Properties);
  gd::EventsVariableInstructionTypeSwitcher
      eventsVariableInstructionTypeSwitcher(project.GetCurrentPlatform(),
                                            typeChangedPropertyNames,
                                            propertyVariablesContainer);
  gd::ProjectBrowserHelper::ExposeEventsBasedBehaviorEvents(
      project, eventsFunctionsExtension, eventsBasedBehavior,
      propertyVariablesContainer, eventsVariableInstructionTypeSwitcher);
}

void WholeProjectRefactorer::ChangeEventsBasedObjectPropertyType(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedObject &eventsBasedObject,
    const gd::String &propertyName) {
  std::unordered_set<gd::String> typeChangedPropertyNames;
  typeChangedPropertyNames.insert(propertyName);
  gd::VariablesContainer propertyVariablesContainer(
      gd::VariablesContainer::SourceType::Properties);
  gd::EventsVariableInstructionTypeSwitcher
      eventsVariableInstructionTypeSwitcher(project.GetCurrentPlatform(),
                                            typeChangedPropertyNames,
                                            propertyVariablesContainer);
  gd::ProjectBrowserHelper::ExposeEventsBasedObjectEvents(
      project, eventsFunctionsExtension, eventsBasedObject,
      propertyVariablesContainer, eventsVariableInstructionTypeSwitcher);
}

void WholeProjectRefactorer::AddBehaviorAndRequiredBehaviors(
    gd::Project &project, gd::Object &object, const gd::String &behaviorType,
    const gd::String &behaviorName) {
  if (object.AddNewBehavior(project, behaviorType, behaviorName) == nullptr) {
    // The behavior type/metadata can't be found.
    return;
  };

  AddRequiredBehaviorsFor(project, object, behaviorName);
}

void WholeProjectRefactorer::AddRequiredBehaviorsFor(
    gd::Project &project, gd::Object &object, const gd::String &behaviorName) {
  if (!object.HasBehaviorNamed(behaviorName)) {
    return;
  };
  gd::Behavior &behavior = object.GetBehavior(behaviorName);

  const gd::Platform &platform = project.GetCurrentPlatform();
  const gd::BehaviorMetadata &behaviorMetadata =
      MetadataProvider::GetBehaviorMetadata(platform, behavior.GetTypeName());
  if (MetadataProvider::IsBadBehaviorMetadata(behaviorMetadata)) {
    // Should not happen because the behavior was added successfully (so its
    // metadata are valid) - but double check anyway and bail out if the
    // behavior metadata are invalid.
    return;
  }

  for (auto const &keyValue : behavior.GetProperties()) {
    const gd::String &propertyName = keyValue.first;
    const gd::PropertyDescriptor &property = keyValue.second;
    if (property.GetType().LowerCase() == "behavior") {
      const std::vector<gd::String> &extraInfo = property.GetExtraInfo();
      if (extraInfo.size() == 0) {
        // very unlikely
        continue;
      }
      const gd::String &requiredBehaviorType = extraInfo.at(0);
      const auto behaviorNames = WholeProjectRefactorer::GetBehaviorsWithType(
          object, requiredBehaviorType);
      const gd::String *defaultBehaviorName = nullptr;
      if (behaviorNames.size() == 0) {
        const gd::BehaviorMetadata &requiredBehaviorMetadata =
            MetadataProvider::GetBehaviorMetadata(platform,
                                                  requiredBehaviorType);
        const gd::String &requiredBehaviorName =
            requiredBehaviorMetadata.GetDefaultName();
        WholeProjectRefactorer::AddBehaviorAndRequiredBehaviors(
            project, object, requiredBehaviorType, requiredBehaviorName);
        defaultBehaviorName = &requiredBehaviorName;
      } else {
        defaultBehaviorName = &behaviorNames.at(0);
      }
      behavior.UpdateProperty(propertyName, *defaultBehaviorName);
    }
  }
}

std::vector<gd::String>
WholeProjectRefactorer::GetBehaviorsWithType(const gd::Object &object,
                                             const gd::String &type) {
  std::vector<gd::String> behaviors;
  for (auto &behaviorName : object.GetAllBehaviorNames()) {
    const gd::Behavior &behavior = object.GetBehavior(behaviorName);
    if (behavior.GetTypeName() == type) {
      behaviors.push_back(behaviorName);
    }
  }
  return behaviors;
}

std::vector<gd::String> WholeProjectRefactorer::FindDependentBehaviorNames(
    const gd::Project &project, const gd::Object &object,
    const gd::String &behaviorName) {
  std::unordered_set<gd::String> dependentBehaviorNames;
  WholeProjectRefactorer::FindDependentBehaviorNames(
      project, object, behaviorName, dependentBehaviorNames);
  std::vector<gd::String> results;
  results.insert(results.end(), dependentBehaviorNames.begin(),
                 dependentBehaviorNames.end());
  return results;
}

void WholeProjectRefactorer::FindDependentBehaviorNames(
    const gd::Project &project, const gd::Object &object,
    const gd::String &behaviorName,
    std::unordered_set<gd::String> &dependentBehaviorNames) {
  const gd::Platform &platform = project.GetCurrentPlatform();
  for (auto const &objectBehaviorName : object.GetAllBehaviorNames()) {
    const gd::Behavior &behavior = object.GetBehavior(objectBehaviorName);
    const auto &behaviorMetadata =
        MetadataProvider::GetBehaviorMetadata(platform, behavior.GetTypeName());
    if (MetadataProvider::IsBadBehaviorMetadata(behaviorMetadata)) {
      // Ignore this behavior as it's unknown.
      continue;
    }

    for (auto const &keyValue : behavior.GetProperties()) {
      const gd::String &propertyName = keyValue.first;
      const gd::PropertyDescriptor &property = keyValue.second;
      if (property.GetType().LowerCase() == "behavior" &&
          property.GetValue() == behaviorName &&
          dependentBehaviorNames.find(objectBehaviorName) ==
              dependentBehaviorNames.end()) {
        dependentBehaviorNames.insert(objectBehaviorName);
        WholeProjectRefactorer::FindDependentBehaviorNames(
            project, object, objectBehaviorName, dependentBehaviorNames);
      }
    }
  }
};

std::vector<gd::UnfilledRequiredBehaviorPropertyProblem>
WholeProjectRefactorer::FindInvalidRequiredBehaviorProperties(
    const gd::Project &project) {
  std::vector<gd::UnfilledRequiredBehaviorPropertyProblem>
      invalidRequiredBehaviorProperties;
  auto findInvalidRequiredBehaviorPropertiesInObjects =
      [&project, &invalidRequiredBehaviorProperties](
          const std::vector<std::unique_ptr<gd::Object>> &objectsList) {
        for (auto &object : objectsList) {
          for (auto &behaviorKeyValuePair : object->GetAllBehaviorContents()) {
            gd::Behavior &behavior = *behaviorKeyValuePair.second;

            for (auto const &keyValue : behavior.GetProperties()) {
              const gd::String &propertyName = keyValue.first;
              const gd::PropertyDescriptor &property = keyValue.second;
              if (property.GetType().LowerCase() != "behavior") {
                continue;
              }
              const gd::String &requiredBehaviorName = property.GetValue();
              const std::vector<gd::String> &extraInfo =
                  property.GetExtraInfo();
              if (extraInfo.size() == 0) {
                // very unlikely
                continue;
              }
              const gd::String &requiredBehaviorType = extraInfo.at(0);

              if (requiredBehaviorName == "" ||
                  !object->HasBehaviorNamed(requiredBehaviorName) ||
                  object->GetBehavior(requiredBehaviorName).GetTypeName() !=
                      requiredBehaviorType) {
                auto problem = UnfilledRequiredBehaviorPropertyProblem(
                    project, *object, behavior, propertyName,
                    requiredBehaviorType);
                invalidRequiredBehaviorProperties.push_back(problem);
              }
            }
          }
        }
      };

  // Find in global objects
  findInvalidRequiredBehaviorPropertiesInObjects(
      project.GetObjects().GetObjects());

  // Find in layout objects.
  for (std::size_t i = 0; i < project.GetLayoutsCount(); ++i) {
    const gd::Layout &layout = project.GetLayout(i);
    findInvalidRequiredBehaviorPropertiesInObjects(
        layout.GetObjects().GetObjects());
  }
  return invalidRequiredBehaviorProperties;
}

bool WholeProjectRefactorer::FixInvalidRequiredBehaviorProperties(
    gd::Project &project) {
  const auto &invalidRequiredBehaviorProblems =
      FindInvalidRequiredBehaviorProperties(project);
  for (const auto &problem : invalidRequiredBehaviorProblems) {
    auto &object = problem.GetSourceObject();
    auto suggestedBehaviorNames =
        GetBehaviorsWithType(object, problem.GetExpectedBehaviorTypeName());
    auto &behavior = problem.GetSourceBehaviorContent();

    if (suggestedBehaviorNames.empty()) {
      // No matching behavior on the object.
      // Add required behaviors on the object.

      auto &expectedBehaviorMetadata = MetadataProvider::GetBehaviorMetadata(
          project.GetCurrentPlatform(), problem.GetExpectedBehaviorTypeName());
      if (MetadataProvider::IsBadBehaviorMetadata(expectedBehaviorMetadata)) {
        continue;
      }

      const gd::String &newBehaviorName =
          expectedBehaviorMetadata.GetDefaultName();
      AddBehaviorAndRequiredBehaviors(project, object,
                                      problem.GetExpectedBehaviorTypeName(),
                                      newBehaviorName);
      behavior.UpdateProperty(problem.GetSourcePropertyName(), newBehaviorName);
    } else {
      // There is a matching behavior on the object use it by default.
      behavior.UpdateProperty(
          problem.GetSourcePropertyName(),
          // It's unlikely the object has 2 behaviors of the same type.
          suggestedBehaviorNames[0]);
    }
  }

  return !invalidRequiredBehaviorProblems.empty();
}

void WholeProjectRefactorer::UpdateBehaviorNameInEventsBasedBehavior(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::String &sourceBehaviorName) {
  const EventBasedBehaviorBrowser eventBasedBehaviorExposer(
      eventsFunctionsExtension, eventsBasedBehavior);
  WholeProjectRefactorer::RenameEventsBasedBehavior(
      project, eventsFunctionsExtension, eventsBasedBehavior,
      sourceBehaviorName, eventsBasedBehavior.GetName(),
      eventBasedBehaviorExposer);
}

void WholeProjectRefactorer::RenameEventsBasedBehavior(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::String &oldBehaviorName, const gd::String &newBehaviorName) {
  auto &eventsBasedBehaviors =
      eventsFunctionsExtension.GetEventsBasedBehaviors();
  if (!eventsBasedBehaviors.Has(oldBehaviorName)) {
    gd::LogWarning("Warning, " + oldBehaviorName +
                   " was not found when calling RenameEventsBasedBehavior.");
    return;
  }
  auto &eventsBasedBehavior = eventsBasedBehaviors.Get(oldBehaviorName);
  const WholeProjectBrowser projectBrowser;
  WholeProjectRefactorer::RenameEventsBasedBehavior(
      project, eventsFunctionsExtension, eventsBasedBehavior, oldBehaviorName,
      newBehaviorName, projectBrowser);
}

void WholeProjectRefactorer::RenameEventsBasedBehavior(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::String &oldBehaviorName,
    const gd::String &newBehaviorName,
    const gd::ProjectBrowser &projectBrowser) {
  auto renameBehaviorEventsFunction =
      [&project, &eventsFunctionsExtension, &oldBehaviorName,
       &newBehaviorName, &projectBrowser](const gd::EventsFunction &eventsFunction) {
        if (eventsFunction.IsExpression()) {
          // Nothing to do, expressions are not including the name of the
          // behavior
        }
        if (eventsFunction.IsAction() || eventsFunction.IsCondition()) {
          gd::InstructionsTypeRenamer renamer = gd::InstructionsTypeRenamer(
              project,
              gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                  eventsFunctionsExtension.GetName(), oldBehaviorName,
                  eventsFunction.GetName()),
              gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                  eventsFunctionsExtension.GetName(), newBehaviorName,
                  eventsFunction.GetName()));
          projectBrowser.ExposeEvents(project, renamer);
        }
      };

  auto renameBehaviorProperty = [&project, &eventsFunctionsExtension,
                                 &oldBehaviorName, &newBehaviorName, &projectBrowser](
                                    const gd::NamedPropertyDescriptor
                                        &property) {
    gd::InstructionsTypeRenamer actionRenamer = gd::InstructionsTypeRenamer(
        project,
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), oldBehaviorName,
            EventsBasedBehavior::GetPropertyActionName(property.GetName())),
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), newBehaviorName,
            EventsBasedBehavior::GetPropertyActionName(property.GetName())));
    projectBrowser.ExposeEvents(project, actionRenamer);

    gd::InstructionsTypeRenamer conditionRenamer = gd::InstructionsTypeRenamer(
        project,
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), oldBehaviorName,
            EventsBasedBehavior::GetPropertyConditionName(property.GetName())),
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), newBehaviorName,
            EventsBasedBehavior::GetPropertyConditionName(property.GetName())));
    projectBrowser.ExposeEvents(project, conditionRenamer);

    // Nothing to do for expression, expressions are not including the name of
    // the behavior
  };

  auto renameBehaviorSharedProperty =
      [&project, &eventsFunctionsExtension, &oldBehaviorName,
       &newBehaviorName, &projectBrowser](const gd::NamedPropertyDescriptor &property) {
        gd::InstructionsTypeRenamer actionRenamer = gd::InstructionsTypeRenamer(
            project,
            gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                eventsFunctionsExtension.GetName(), oldBehaviorName,
                EventsBasedBehavior::GetSharedPropertyActionName(
                    property.GetName())),
            gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                eventsFunctionsExtension.GetName(), newBehaviorName,
                EventsBasedBehavior::GetSharedPropertyActionName(
                    property.GetName())));
        projectBrowser.ExposeEvents(project, actionRenamer);

        gd::InstructionsTypeRenamer conditionRenamer =
            gd::InstructionsTypeRenamer(
                project,
                gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                    eventsFunctionsExtension.GetName(), oldBehaviorName,
                    EventsBasedBehavior::GetSharedPropertyConditionName(
                        property.GetName())),
                gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
                    eventsFunctionsExtension.GetName(), newBehaviorName,
                    EventsBasedBehavior::GetSharedPropertyConditionName(
                        property.GetName())));
        projectBrowser.ExposeEvents(project, conditionRenamer);

        // Nothing to do for expression, expressions are not including the name
        // of the behavior
      };

  // Order is important: we first rename the expressions then the instructions,
  // to avoid being unable to fetch the metadata (the types of parameters) of
  // instructions after they are renamed.
  auto &behaviorEventsFunctions = eventsBasedBehavior.GetEventsFunctions();

  // Behavior expressions
  for (auto &&eventsFunction : behaviorEventsFunctions.GetInternalVector()) {
    if (eventsFunction->IsExpression()) {
      renameBehaviorEventsFunction(*eventsFunction);
    }
  }

  // Behavior instructions
  for (auto &&eventsFunction : behaviorEventsFunctions.GetInternalVector()) {
    if (eventsFunction->IsAction() || eventsFunction->IsCondition()) {
      renameBehaviorEventsFunction(*eventsFunction);
    }
  }

  // Behavior properties
  for (auto &&property :
       eventsBasedBehavior.GetPropertyDescriptors().GetInternalVector()) {
    renameBehaviorProperty(*property);
  }
  for (auto &&property :
       eventsBasedBehavior.GetSharedPropertyDescriptors().GetInternalVector()) {
    renameBehaviorSharedProperty(*property);
  }

  DoRenameBehavior(project,
                   gd::PlatformExtension::GetBehaviorFullType(
                       eventsFunctionsExtension.GetName(), oldBehaviorName),
                   gd::PlatformExtension::GetBehaviorFullType(
                       eventsFunctionsExtension.GetName(), newBehaviorName),
                   projectBrowser);
}

void WholeProjectRefactorer::UpdateObjectNameInEventsBasedObject(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    gd::EventsBasedObject &eventsBasedObject,
    const gd::String &sourceObjectName) {
  const EventBasedObjectBrowser eventBasedObjectBrowser(
      eventsFunctionsExtension, eventsBasedObject);
  WholeProjectRefactorer::RenameEventsBasedObject(
      project, eventsFunctionsExtension, eventsBasedObject,
      sourceObjectName, eventsBasedObject.GetName(),
      eventBasedObjectBrowser);
}

void WholeProjectRefactorer::RenameEventsBasedObject(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::String &oldObjectName, const gd::String &newObjectName) {
  auto &eventsBasedObjects = eventsFunctionsExtension.GetEventsBasedObjects();
  if (!eventsBasedObjects.Has(oldObjectName)) {
    gd::LogWarning("Warning, " + oldObjectName +
                   " was not found when calling RenameEventsBasedObject.");
    return;
  }
  auto &eventsBasedObject = eventsBasedObjects.Get(oldObjectName);
  const WholeProjectBrowser projectBrowser;
  WholeProjectRefactorer::RenameEventsBasedObject(
      project, eventsFunctionsExtension, eventsBasedObject, oldObjectName,
      newObjectName, projectBrowser);
}

void WholeProjectRefactorer::RenameEventsBasedObject(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedObject &eventsBasedObject,
    const gd::String &oldObjectName, const gd::String &newObjectName,
    const gd::ProjectBrowser &projectBrowser) {
  auto renameObjectEventsFunction =
      [&project, &eventsFunctionsExtension, &oldObjectName, &newObjectName,
       &projectBrowser](const gd::EventsFunction &eventsFunction) {
        if (eventsFunction.IsExpression()) {
          // Nothing to do, expressions are not including the name of the
          // object
        }
        if (eventsFunction.IsAction() || eventsFunction.IsCondition()) {
          gd::InstructionsTypeRenamer renamer = gd::InstructionsTypeRenamer(
              project,
              gd::PlatformExtension::GetObjectEventsFunctionFullType(
                  eventsFunctionsExtension.GetName(), oldObjectName,
                  eventsFunction.GetName()),
              gd::PlatformExtension::GetObjectEventsFunctionFullType(
                  eventsFunctionsExtension.GetName(), newObjectName,
                  eventsFunction.GetName()));
          projectBrowser.ExposeEvents(project, renamer);
        }
      };

  auto renameObjectProperty = [&project, &eventsFunctionsExtension,
                               &oldObjectName, &newObjectName, &projectBrowser](
                                  const gd::NamedPropertyDescriptor &property) {
    gd::InstructionsTypeRenamer actionRenamer = gd::InstructionsTypeRenamer(
        project,
        gd::PlatformExtension::GetObjectEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), oldObjectName,
            EventsBasedObject::GetPropertyActionName(property.GetName())),
        gd::PlatformExtension::GetObjectEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), newObjectName,
            EventsBasedObject::GetPropertyActionName(property.GetName())));
    projectBrowser.ExposeEvents(project, actionRenamer);

    gd::InstructionsTypeRenamer conditionRenamer = gd::InstructionsTypeRenamer(
        project,
        gd::PlatformExtension::GetObjectEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), oldObjectName,
            EventsBasedObject::GetPropertyConditionName(property.GetName())),
        gd::PlatformExtension::GetObjectEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), newObjectName,
            EventsBasedObject::GetPropertyConditionName(property.GetName())));
    projectBrowser.ExposeEvents(project, conditionRenamer);

    // Nothing to do for expression, expressions are not including the name of
    // the object
  };

  // Order is important: we first rename the expressions then the instructions,
  // to avoid being unable to fetch the metadata (the types of parameters) of
  // instructions after they are renamed.
  auto &objectEventsFunctions = eventsBasedObject.GetEventsFunctions();

  // Object expressions
  for (auto &&eventsFunction : objectEventsFunctions.GetInternalVector()) {
    if (eventsFunction->IsExpression()) {
      renameObjectEventsFunction(*eventsFunction);
    }
  }

  // Object instructions
  for (auto &&eventsFunction : objectEventsFunctions.GetInternalVector()) {
    if (eventsFunction->IsAction() || eventsFunction->IsCondition()) {
      renameObjectEventsFunction(*eventsFunction);
    }
  }

  // Object properties
  auto &properties = eventsBasedObject.GetPropertyDescriptors();
  for (auto &&property : properties.GetInternalVector()) {
    renameObjectProperty(*property);
  }

  DoRenameObject(project,
                 gd::PlatformExtension::GetObjectFullType(
                     eventsFunctionsExtension.GetName(), oldObjectName),
                 gd::PlatformExtension::GetObjectFullType(
                     eventsFunctionsExtension.GetName(), newObjectName),
                 projectBrowser);
}

void WholeProjectRefactorer::DoRenameEventsFunction(
    gd::Project &project, const gd::EventsFunction &eventsFunction,
    const gd::String &oldFullType, const gd::String &newFullType,
    const gd::ProjectBrowser &projectBrowser) {
  // Order is important: we first rename the expressions then the instructions,
  // to avoid being unable to fetch the metadata (the types of parameters) of
  // instructions after they are renamed.
  if (eventsFunction.IsExpression()) {
    gd::ExpressionsRenamer renamer =
        gd::ExpressionsRenamer(project.GetCurrentPlatform());
    renamer.SetReplacedFreeExpression(oldFullType, newFullType);
    projectBrowser.ExposeEvents(project, renamer);
  }
  if (eventsFunction.IsAction() || eventsFunction.IsCondition()) {
    gd::InstructionsTypeRenamer renamer =
        gd::InstructionsTypeRenamer(project, oldFullType, newFullType);
    projectBrowser.ExposeEvents(project, renamer);
  }
}

void WholeProjectRefactorer::DoRenameBehavior(
    gd::Project &project, const gd::String &oldBehaviorType,
    const gd::String &newBehaviorType,
    const gd::ProjectBrowser &projectBrowser) {
  // Rename behavior in required behavior properties
  auto requiredBehaviorRenamer =
      gd::RequiredBehaviorRenamer(oldBehaviorType, newBehaviorType);
  projectBrowser.ExposeEventBasedBehaviors(project, requiredBehaviorRenamer);

  // Rename behavior in objects lists.
  auto behaviorTypeRenamer =
      gd::BehaviorTypeRenamer(oldBehaviorType, newBehaviorType);
  projectBrowser.ExposeObjects(project, behaviorTypeRenamer);

  // Rename behavior in layout behavior shared data.
  auto sharedDataBehaviorTypeRenamer =
      gd::BehaviorsSharedDataBehaviorTypeRenamer(oldBehaviorType,
                                                 newBehaviorType);
  projectBrowser.ExposeBehaviorSharedDatas(project,
                                           sharedDataBehaviorTypeRenamer);

  // Rename in parameters of (free/behavior) events function
  auto behaviorParameterRenamer = gd::FunctionParameterBehaviorTypeRenamer(
      oldBehaviorType, newBehaviorType);
  projectBrowser.ExposeFunctions(project, behaviorParameterRenamer);
}

void WholeProjectRefactorer::DoRenameObject(
    gd::Project &project, const gd::String &oldObjectType,
    const gd::String &newObjectType, const gd::ProjectBrowser &projectBrowser) {
  // Rename object type in objects lists.
  auto customObjectTypeRenamer =
      gd::CustomObjectTypeRenamer(oldObjectType, newObjectType);
  projectBrowser.ExposeObjects(project, customObjectTypeRenamer);

  // Rename in behaviors object type.
  auto behaviorObjectTypeRenamer =
      gd::BehaviorObjectTypeRenamer(oldObjectType, newObjectType);
  projectBrowser.ExposeEventBasedBehaviors(project, behaviorObjectTypeRenamer);

  // Rename in parameters of (free/behavior) events function
  auto objectParameterRenamer =
      gd::FunctionParameterObjectTypeRenamer(oldObjectType, newObjectType);
  projectBrowser.ExposeFunctions(project, objectParameterRenamer);
}

void WholeProjectRefactorer::ObjectRemovedInScene(
    gd::Project &project, gd::Layout &layout, const gd::String &objectName) {
  auto projectScopedContainers = gd::ProjectScopedContainers::
      MakeNewProjectScopedContainersForProjectAndLayout(project, layout);

  auto &groups = layout.GetObjects().GetObjectGroups();
  for (std::size_t g = 0; g < groups.size(); ++g) {
    if (groups[g].Find(objectName))
      groups[g].RemoveObject(objectName);
  }
  layout.GetInitialInstances().RemoveInitialInstancesOfObject(objectName);

  // Remove object in external layouts
  std::vector<gd::String> externalLayoutsNames =
      GetAssociatedExternalLayouts(project, layout);
  for (gd::String name : externalLayoutsNames) {
    auto &externalLayout = project.GetExternalLayout(name);
    externalLayout.GetInitialInstances().RemoveInitialInstancesOfObject(
        objectName);
  }
}

void WholeProjectRefactorer::BehaviorsAddedToObjectInScene(
    gd::Project &project, gd::Layout &layout, const gd::String &objectName) {
  auto projectScopedContainers = gd::ProjectScopedContainers::
      MakeNewProjectScopedContainersForProjectAndLayout(project, layout);
  gd::BehaviorParametersFiller behaviorParameterFiller(
      project.GetCurrentPlatform(), projectScopedContainers);
  gd::ProjectBrowserHelper::ExposeLayoutEventsAndExternalEvents(
      project, layout, behaviorParameterFiller);
}

void WholeProjectRefactorer::ObjectOrGroupRenamedInScene(
    gd::Project &project, gd::Layout &layout, const gd::String &oldName,
    const gd::String &newName, bool isObjectGroup) {
  gd::WholeProjectRefactorer::ObjectOrGroupRenamedInScene(
      project, layout, layout.GetObjects(), oldName, newName, isObjectGroup);
}

void WholeProjectRefactorer::ObjectOrGroupRenamedInScene(
    gd::Project &project, gd::Layout &layout,
    const gd::ObjectsContainer &targetedObjectsContainer,
    const gd::String &oldName, const gd::String &newName, bool isObjectGroup) {

  if (oldName == newName || newName.empty() || oldName.empty())
    return;

  auto projectScopedContainers = gd::ProjectScopedContainers::
      MakeNewProjectScopedContainersForProjectAndLayout(project, layout);

  // Rename object in the current layout
  gd::EventsRefactorer::RenameObjectInEvents(
      project.GetCurrentPlatform(), projectScopedContainers, layout.GetEvents(),
      layout.GetObjects(), oldName, newName);

  // Object groups can't have instances or be in other groups
  if (!isObjectGroup) {
    auto &groups = layout.GetObjects().GetObjectGroups();
    layout.GetInitialInstances().RenameInstancesOfObject(oldName, newName);
    for (std::size_t g = 0; g < groups.size(); ++g) {
      groups[g].RenameObject(oldName, newName);
    }
  }

  // Rename object in external events
  for (auto &externalEventsName :
       GetAssociatedExternalEvents(project, layout.GetName())) {
    auto &externalEvents = project.GetExternalEvents(externalEventsName);
    gd::EventsRefactorer::RenameObjectInEvents(
        project.GetCurrentPlatform(), projectScopedContainers,
        externalEvents.GetEvents(), layout.GetObjects(), oldName, newName);
  }

  // Rename object in external layouts
  if (!isObjectGroup) { // Object groups can't have instances
    std::vector<gd::String> externalLayoutsNames =
        GetAssociatedExternalLayouts(project, layout);
    for (gd::String name : externalLayoutsNames) {
      auto &externalLayout = project.GetExternalLayout(name);
      externalLayout.GetInitialInstances().RenameInstancesOfObject(oldName,
                                                                   newName);
    }
  }
}

void WholeProjectRefactorer::RenameLayout(gd::Project &project,
                                          const gd::String &oldName,
                                          const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;
  gd::ProjectElementRenamer projectElementRenamer(
      project.GetCurrentPlatform(), "sceneName", oldName, newName);
  gd::ProjectBrowserHelper::ExposeProjectEvents(project, projectElementRenamer);

  for (gd::String externalLayoutName :
       GetAssociatedExternalLayouts(project, oldName)) {
    auto &externalLayout = project.GetExternalLayout(externalLayoutName);
    externalLayout.SetAssociatedLayout(newName);
  }
  for (gd::String externalEventsName :
       GetAssociatedExternalEvents(project, oldName)) {
    auto &externalEvents = project.GetExternalEvents(externalEventsName);
    externalEvents.SetAssociatedLayout(newName);
  }

  gd::LinkEventTargetRenamer linkEventTargetRenamer(
      project.GetCurrentPlatform(), oldName, newName);
  gd::ProjectBrowserHelper::ExposeProjectEvents(project,
                                                linkEventTargetRenamer);
}

void WholeProjectRefactorer::RenameExternalLayout(gd::Project &project,
                                                  const gd::String &oldName,
                                                  const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;
  gd::ProjectElementRenamer projectElementRenamer(
      project.GetCurrentPlatform(), "externalLayoutName", oldName, newName);
  gd::ProjectBrowserHelper::ExposeProjectEvents(project, projectElementRenamer);
}

void WholeProjectRefactorer::RenameExternalEvents(gd::Project &project,
                                                  const gd::String &oldName,
                                                  const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;
  gd::LinkEventTargetRenamer linkEventTargetRenamer(
      project.GetCurrentPlatform(), oldName, newName);
  gd::ProjectBrowserHelper::ExposeProjectEvents(project,
                                                linkEventTargetRenamer);
}

void WholeProjectRefactorer::RenameLayerInScene(gd::Project &project,
                                                gd::Layout &scene,
                                                const gd::String &oldName,
                                                const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;

  gd::ProjectElementRenamer projectElementRenamer(project.GetCurrentPlatform(),
                                                  "layer", oldName, newName);
  gd::ProjectBrowserHelper::ExposeLayoutEventsAndExternalEvents(
      project, scene, projectElementRenamer);
  scene.GetInitialInstances().MoveInstancesToLayer(oldName, newName);

  std::vector<gd::String> externalLayoutsNames =
      GetAssociatedExternalLayouts(project, scene);
  for (gd::String name : externalLayoutsNames) {
    auto &externalLayout = project.GetExternalLayout(name);
    externalLayout.GetInitialInstances().MoveInstancesToLayer(oldName, newName);
  }
}

void WholeProjectRefactorer::RenameLayerInEventsBasedObject(
    gd::Project &project,
    gd::EventsFunctionsExtension &eventsFunctionsExtension,
    gd::EventsBasedObject &eventsBasedObject, const gd::String &oldName,
    const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;

  gd::ProjectElementRenamer projectElementRenamer(project.GetCurrentPlatform(),
                                                  "layer", oldName, newName);
  gd::ProjectBrowserHelper::ExposeEventsBasedObjectEvents(
      project, eventsFunctionsExtension, eventsBasedObject,
      projectElementRenamer);
  eventsBasedObject.GetInitialInstances().MoveInstancesToLayer(oldName,
                                                               newName);
}

void WholeProjectRefactorer::RenameLayerEffectInScene(
    gd::Project &project, gd::Layout &scene, gd::Layer &layer,
    const gd::String &oldName, const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;
  gd::ProjectElementRenamer projectElementRenamer(
      project.GetCurrentPlatform(), "layerEffectName", oldName, newName);
  projectElementRenamer.SetLayerConstraint(layer.GetName());
  gd::ProjectBrowserHelper::ExposeLayoutEventsAndExternalEvents(
      project, scene, projectElementRenamer);
}

void WholeProjectRefactorer::RenameLayerEffectInEventsBasedObject(
    gd::Project &project,
    gd::EventsFunctionsExtension &eventsFunctionsExtension,
    gd::EventsBasedObject &eventsBasedObject, gd::Layer &layer,
    const gd::String &oldName, const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;
  gd::ProjectElementRenamer projectElementRenamer(
      project.GetCurrentPlatform(), "layerEffectName", oldName, newName);
  projectElementRenamer.SetLayerConstraint(layer.GetName());
  gd::ProjectBrowserHelper::ExposeEventsBasedObjectEvents(
      project, eventsFunctionsExtension, eventsBasedObject,
      projectElementRenamer);
}

void WholeProjectRefactorer::RenameObjectAnimationInScene(
    gd::Project &project, gd::Layout &scene, gd::Object &object,
    const gd::String &oldName, const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;
  gd::ProjectElementRenamer projectElementRenamer(
      project.GetCurrentPlatform(), "objectAnimationName", oldName, newName);
  projectElementRenamer.SetObjectConstraint(object.GetName());
  gd::ProjectBrowserHelper::ExposeLayoutEventsAndExternalEvents(
      project, scene, projectElementRenamer);
}

void WholeProjectRefactorer::RenameObjectAnimationInEventsBasedObject(
    gd::Project &project,
    gd::EventsFunctionsExtension &eventsFunctionsExtension,
    gd::EventsBasedObject &eventsBasedObject, gd::Object &object,
    const gd::String &oldName, const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;
  gd::ProjectElementRenamer projectElementRenamer(
      project.GetCurrentPlatform(), "objectAnimationName", oldName, newName);
  projectElementRenamer.SetObjectConstraint(object.GetName());
  gd::ProjectBrowserHelper::ExposeEventsBasedObjectEvents(
      project, eventsFunctionsExtension, eventsBasedObject,
      projectElementRenamer);
}

void WholeProjectRefactorer::RenameObjectPointInScene(
    gd::Project &project, gd::Layout &scene, gd::Object &object,
    const gd::String &oldName, const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;
  gd::ProjectElementRenamer projectElementRenamer(
      project.GetCurrentPlatform(), "objectPointName", oldName, newName);
  projectElementRenamer.SetObjectConstraint(object.GetName());
  gd::ProjectBrowserHelper::ExposeLayoutEventsAndExternalEvents(
      project, scene, projectElementRenamer);
}

void WholeProjectRefactorer::RenameObjectPointInEventsBasedObject(
    gd::Project &project,
    gd::EventsFunctionsExtension &eventsFunctionsExtension,
    gd::EventsBasedObject &eventsBasedObject, gd::Object &object,
    const gd::String &oldName, const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;
  gd::ProjectElementRenamer projectElementRenamer(
      project.GetCurrentPlatform(), "objectPointName", oldName, newName);
  projectElementRenamer.SetObjectConstraint(object.GetName());
  gd::ProjectBrowserHelper::ExposeEventsBasedObjectEvents(
      project, eventsFunctionsExtension, eventsBasedObject,
      projectElementRenamer);
}

void WholeProjectRefactorer::RenameObjectEffectInScene(
    gd::Project &project, gd::Layout &scene, gd::Object &object,
    const gd::String &oldName, const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;
  gd::ProjectElementRenamer projectElementRenamer(
      project.GetCurrentPlatform(), "objectEffectName", oldName, newName);
  projectElementRenamer.SetObjectConstraint(object.GetName());
  gd::ProjectBrowserHelper::ExposeLayoutEventsAndExternalEvents(
      project, scene, projectElementRenamer);
}

void WholeProjectRefactorer::RenameObjectEffectInEventsBasedObject(
    gd::Project &project,
    gd::EventsFunctionsExtension &eventsFunctionsExtension,
    gd::EventsBasedObject &eventsBasedObject, gd::Object &object,
    const gd::String &oldName, const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;
  gd::ProjectElementRenamer projectElementRenamer(
      project.GetCurrentPlatform(), "objectEffectName", oldName, newName);
  projectElementRenamer.SetObjectConstraint(object.GetName());
  gd::ProjectBrowserHelper::ExposeEventsBasedObjectEvents(
      project, eventsFunctionsExtension, eventsBasedObject,
      projectElementRenamer);
}

void WholeProjectRefactorer::ObjectRemovedInEventsBasedObject(
    gd::Project &project, gd::EventsBasedObject &eventsBasedObject,
    const gd::String &objectName) {
  for (auto &functionUniquePtr :
       eventsBasedObject.GetEventsFunctions().GetInternalVector()) {
    auto function = functionUniquePtr.get();
    WholeProjectRefactorer::ObjectRemovedInEventsFunction(project, *function,
                                                          objectName);
  }

  auto &groups = eventsBasedObject.GetObjects().GetObjectGroups();
  for (std::size_t g = 0; g < groups.size(); ++g) {
    if (groups[g].Find(objectName))
      groups[g].RemoveObject(objectName);
  }
  eventsBasedObject.GetInitialInstances().RemoveInitialInstancesOfObject(
      objectName);
}

void WholeProjectRefactorer::ObjectRemovedInEventsFunction(
    gd::Project &project, gd::EventsFunction &eventsFunction,
    const gd::String &objectName) {

  for (std::size_t g = 0; g < eventsFunction.GetObjectGroups().size(); ++g) {
    if (eventsFunction.GetObjectGroups()[g].Find(objectName))
      eventsFunction.GetObjectGroups()[g].RemoveObject(objectName);
  }
}

void WholeProjectRefactorer::ObjectOrGroupRenamedInEventsBasedObject(
    gd::Project &project,
    const gd::ProjectScopedContainers &projectScopedContainers,
    gd::EventsBasedObject &eventsBasedObject, const gd::String &oldName,
    const gd::String &newName, bool isObjectGroup) {
  for (auto &functionUniquePtr :
       eventsBasedObject.GetEventsFunctions().GetInternalVector()) {
    auto *function = functionUniquePtr.get();
    WholeProjectRefactorer::ObjectOrGroupRenamedInEventsFunction(
        project, projectScopedContainers, *function,
        eventsBasedObject.GetObjects(), oldName, newName, isObjectGroup);
  }

  // Object groups can't have instances or be in other groups
  if (!isObjectGroup) {
    eventsBasedObject.GetInitialInstances().RenameInstancesOfObject(oldName,
                                                                    newName);
    auto &groups = eventsBasedObject.GetObjects().GetObjectGroups();
    for (std::size_t g = 0; g < groups.size(); ++g) {
      groups[g].RenameObject(oldName, newName);
    }
  }
}

void WholeProjectRefactorer::ObjectOrGroupRenamedInEventsFunction(
    gd::Project &project,
    const gd::ProjectScopedContainers &projectScopedContainers,
    gd::EventsFunction &eventsFunction,
    const gd::ObjectsContainer &targetedObjectsContainer,
    const gd::String &oldName, const gd::String &newName, bool isObjectGroup) {
  gd::EventsRefactorer::RenameObjectInEvents(
      project.GetCurrentPlatform(), projectScopedContainers,
      eventsFunction.GetEvents(), targetedObjectsContainer, oldName, newName);

  // Object groups can't be in other groups
  if (!isObjectGroup) {
    for (std::size_t g = 0; g < eventsFunction.GetObjectGroups().size(); ++g) {
      eventsFunction.GetObjectGroups()[g].RenameObject(oldName, newName);
    }
  }
}

void WholeProjectRefactorer::GlobalObjectOrGroupRenamed(
    gd::Project &project, const gd::String &oldName, const gd::String &newName,
    bool isObjectGroup) {
  // Object groups can't be in other groups
  if (!isObjectGroup) {
    for (std::size_t g = 0; g < project.GetObjects().GetObjectGroups().size();
         ++g) {
      project.GetObjects().GetObjectGroups()[g].RenameObject(oldName, newName);
    }
  }

  for (std::size_t i = 0; i < project.GetLayoutsCount(); ++i) {
    gd::Layout &layout = project.GetLayout(i);
    if (layout.GetObjects().HasObjectNamed(oldName))
      continue;

    ObjectOrGroupRenamedInScene(project, layout, project.GetObjects(), oldName, newName,
                                 isObjectGroup);
  }
}

void WholeProjectRefactorer::GlobalObjectRemoved(gd::Project &project,
                                                 const gd::String &objectName) {
  auto &globalGroups = project.GetObjects().GetObjectGroups();
  for (std::size_t g = 0; g < globalGroups.size(); ++g) {
    globalGroups[g].RemoveObject(objectName);
  }

  for (std::size_t i = 0; i < project.GetLayoutsCount(); ++i) {
    gd::Layout &layout = project.GetLayout(i);
    if (layout.GetObjects().HasObjectNamed(objectName))
      continue;

    ObjectRemovedInScene(project, layout, objectName);
  }
}

void WholeProjectRefactorer::BehaviorsAddedToGlobalObject(
    gd::Project &project, const gd::String &objectName) {
  for (std::size_t i = 0; i < project.GetLayoutsCount(); ++i) {
    gd::Layout &layout = project.GetLayout(i);
    if (layout.GetObjects().HasObjectNamed(objectName))
      continue;

    BehaviorsAddedToObjectInScene(project, layout, objectName);
  }
}

void WholeProjectRefactorer::RemoveLayerInScene(gd::Project &project,
                                                gd::Layout &scene,
                                                const gd::String &layerName) {
  if (layerName.empty())
    return;

  scene.GetInitialInstances().RemoveAllInstancesOnLayer(layerName);

  std::vector<gd::String> externalLayoutsNames =
      GetAssociatedExternalLayouts(project, scene);
  for (gd::String name : externalLayoutsNames) {
    auto &externalLayout = project.GetExternalLayout(name);
    externalLayout.GetInitialInstances().RemoveAllInstancesOnLayer(layerName);
  }
}

void WholeProjectRefactorer::MergeLayersInScene(
    gd::Project &project, gd::Layout &scene, const gd::String &originLayerName,
    const gd::String &targetLayerName) {
  if (originLayerName == targetLayerName || originLayerName.empty())
    return;

  scene.GetInitialInstances().MoveInstancesToLayer(originLayerName,
                                                   targetLayerName);

  std::vector<gd::String> externalLayoutsNames =
      GetAssociatedExternalLayouts(project, scene);
  for (gd::String name : externalLayoutsNames) {
    auto &externalLayout = project.GetExternalLayout(name);
    externalLayout.GetInitialInstances().MoveInstancesToLayer(originLayerName,
                                                              targetLayerName);
  }
}

void WholeProjectRefactorer::RemoveLayerInEventsBasedObject(
    gd::EventsBasedObject &eventsBasedObject, const gd::String &layerName) {
  if (layerName.empty())
    return;

  eventsBasedObject.GetInitialInstances().RemoveAllInstancesOnLayer(layerName);
}

void WholeProjectRefactorer::MergeLayersInEventsBasedObject(
    gd::EventsBasedObject &eventsBasedObject, const gd::String &originLayerName,
    const gd::String &targetLayerName) {
  if (originLayerName == targetLayerName || originLayerName.empty())
    return;

  eventsBasedObject.GetInitialInstances().MoveInstancesToLayer(originLayerName,
                                                               targetLayerName);
}

size_t WholeProjectRefactorer::GetLayoutAndExternalLayoutLayerInstancesCount(
    gd::Project &project, gd::Layout &layout, const gd::String &layerName) {
  size_t count = layout.GetInitialInstances().GetLayerInstancesCount(layerName);

  std::vector<gd::String> externalLayoutsNames =
      GetAssociatedExternalLayouts(project, layout);
  for (gd::String name : externalLayoutsNames) {
    auto &externalLayout = project.GetExternalLayout(name);
    count +=
        externalLayout.GetInitialInstances().GetLayerInstancesCount(layerName);
  }
  return count;
}

std::vector<gd::String>
WholeProjectRefactorer::GetAssociatedExternalLayouts(gd::Project &project,
                                                     gd::Layout &layout) {
  return GetAssociatedExternalLayouts(project, layout.GetName());
}

std::vector<gd::String> WholeProjectRefactorer::GetAssociatedExternalLayouts(
    gd::Project &project, const gd::String &layoutName) {
  std::vector<gd::String> results;
  for (std::size_t i = 0; i < project.GetExternalLayoutsCount(); ++i) {
    auto &externalLayout = project.GetExternalLayout(i);

    if (externalLayout.GetAssociatedLayout() == layoutName) {
      results.push_back(externalLayout.GetName());
    }
  }

  return results;
}

std::vector<gd::String> WholeProjectRefactorer::GetAssociatedExternalEvents(
    gd::Project &project, const gd::String &layoutName) {
  std::vector<gd::String> results;
  for (std::size_t i = 0; i < project.GetExternalEventsCount(); ++i) {
    auto &externalEvents = project.GetExternalEvents(i);

    if (externalEvents.GetAssociatedLayout() == layoutName) {
      results.push_back(externalEvents.GetName());
    }
  }

  return results;
}

void WholeProjectRefactorer::RenameLeaderboards(
    gd::Project &project,
    const std::map<gd::String, gd::String> &leaderboardIdMap) {
  gd::LeaderboardIdRenamer leaderboardIdRenamer(project);
  leaderboardIdRenamer.SetLeaderboardIdsToReplace(leaderboardIdMap);

  gd::ProjectBrowserHelper::ExposeProjectEvents(project, leaderboardIdRenamer);
  gd::ProjectBrowserHelper::ExposeProjectObjects(project, leaderboardIdRenamer);
}

std::set<gd::String> WholeProjectRefactorer::FindAllLeaderboardIds(gd::Project &project) {
  gd::LeaderboardIdRenamer leaderboardIdRenamer(project);

  gd::ProjectBrowserHelper::ExposeProjectEvents(project, leaderboardIdRenamer);
  gd::ProjectBrowserHelper::ExposeProjectObjects(project, leaderboardIdRenamer);

  return leaderboardIdRenamer.GetAllLeaderboardIds();
}

} // namespace gd
