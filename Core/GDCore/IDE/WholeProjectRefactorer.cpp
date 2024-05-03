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
#include "GDCore/IDE/EventBasedBehaviorBrowser.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/Events/BehaviorTypeRenamer.h"
#include "GDCore/IDE/Events/CustomObjectTypeRenamer.h"
#include "GDCore/IDE/Events/EventsBehaviorRenamer.h"
#include "GDCore/IDE/Events/EventsPropertyReplacer.h"
#include "GDCore/IDE/Events/EventsRefactorer.h"
#include "GDCore/IDE/Events/EventsVariableReplacer.h"
#include "GDCore/IDE/Events/ExpressionsParameterMover.h"
#include "GDCore/IDE/Events/ExpressionsRenamer.h"
#include "GDCore/IDE/Events/InstructionsParameterMover.h"
#include "GDCore/IDE/Events/InstructionsTypeRenamer.h"
#include "GDCore/IDE/Events/LinkEventTargetRenamer.h"
#include "GDCore/IDE/Events/ProjectElementRenamer.h"
#include "GDCore/IDE/EventsFunctionTools.h"
#include "GDCore/IDE/Project/ArbitraryBehaviorSharedDataWorker.h"
#include "GDCore/IDE/Project/ArbitraryEventBasedBehaviorsWorker.h"
#include "GDCore/IDE/Project/ArbitraryEventsFunctionsWorker.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
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

  addTypesOfObjectsIn(project);
  for (std::size_t s = 0; s < project.GetLayoutsCount(); s++) {
    auto &layout = project.GetLayout(s);
    addTypesOfObjectsIn(layout);
  }

  return allTypes;
}

void WholeProjectRefactorer::EnsureBehaviorEventsFunctionsProperParameters(
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedBehavior &eventsBasedBehavior) {
  for (auto &eventsFunction :
       eventsBasedBehavior.GetEventsFunctions().GetInternalVector()) {
    auto &parameters = eventsFunction->GetParameters();
    while (parameters.size() < 2) {
      gd::ParameterMetadata newParameter;
      parameters.push_back(newParameter);
    }

    parameters[0]
        .SetType("object")
        .SetName(behaviorObjectParameterName)
        .SetDescription("Object")
        .SetExtraInfo(eventsBasedBehavior.GetObjectType());
    parameters[1]
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
    while (parameters.size() < 1) {
      gd::ParameterMetadata newParameter;
      parameters.push_back(newParameter);
    }

    parameters[0]
        .SetType("object")
        .SetName(parentObjectParameterName)
        .SetDescription("Object")
        .SetExtraInfo(gd::PlatformExtension::GetObjectFullType(
            eventsFunctionsExtension.GetName(), eventsBasedObject.GetName()));
  }
}

VariablesChangeset
WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
    gd::Project &project,
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
    } else {
      const gd::String &oldName = existingOldVariableUuidAndName->second;

      if (oldName != variableName) {
        // This is a renamed variable.
        changeset.oldToNewVariableNames[oldName] = variableName;
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

void WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
    gd::Project &project, const gd::VariablesContainer &newVariablesContainer,
    const gd::VariablesChangeset &changeset) {
  gd::EventsVariableReplacer eventsVariableReplacer(
      project.GetCurrentPlatform(), newVariablesContainer,
      changeset.oldToNewVariableNames, changeset.removedVariableNames);
  gd::ProjectBrowserHelper::ExposeProjectEvents(project,
                                                eventsVariableReplacer);
}

void WholeProjectRefactorer::UpdateExtensionNameInEventsBasedBehavior(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::String &sourceExtensionName) {
  const EventBasedBehaviorBrowser eventBasedBehaviorExposer(
      eventsBasedBehavior);
  WholeProjectRefactorer::RenameEventsFunctionsExtension(
      project, eventsFunctionsExtension, sourceExtensionName,
      eventsFunctionsExtension.GetName(), eventBasedBehaviorExposer);
}

void WholeProjectRefactorer::RenameEventsFunctionsExtension(
    gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::String &oldName, const gd::String &newName) {
  const WholeProjectBrowser wholeProjectExposer;
  RenameEventsFunctionsExtension(project, eventsFunctionsExtension, oldName,
                                 newName, wholeProjectExposer);
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
        project, eventsBasedBehavior, behaviorRenamer);
  } else {
    // Properties that represent primitive values will be used through
    // their related actions/conditions/expressions. Rename these.

    // Order is important: we first rename the expressions then the
    // instructions, to avoid being unable to fetch the metadata (the types of
    // parameters) of instructions after they are renamed.
    gd::ExpressionsRenamer expressionRenamer =
        gd::ExpressionsRenamer(project.GetCurrentPlatform());
    expressionRenamer.SetReplacedBehaviorExpression(
        gd::PlatformExtension::GetBehaviorFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName()),
        EventsBasedBehavior::GetPropertyExpressionName(oldPropertyName),
        EventsBasedBehavior::GetPropertyExpressionName(newPropertyName));
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, expressionRenamer);

    std::unordered_map<gd::String, gd::String> oldToNewPropertyNames = {
        {oldPropertyName, newPropertyName}};
    std::unordered_set<gd::String> removedPropertyNames;
    gd::EventsPropertyReplacer eventsPropertyReplacer(
        project.GetCurrentPlatform(), properties, oldToNewPropertyNames,
        removedPropertyNames);
    gd::ProjectBrowserHelper::ExposeProjectEvents(project,
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
        project, eventsBasedBehavior, behaviorRenamer);
  } else {
    // Properties that represent primitive values will be used through
    // their related actions/conditions/expressions. Rename these.

    // Order is important: we first rename the expressions then the
    // instructions, to avoid being unable to fetch the metadata (the types of
    // parameters) of instructions after they are renamed.
    gd::ExpressionsRenamer expressionRenamer =
        gd::ExpressionsRenamer(project.GetCurrentPlatform());
    expressionRenamer.SetReplacedBehaviorExpression(
        gd::PlatformExtension::GetBehaviorFullType(
            eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName()),
        EventsBasedBehavior::GetSharedPropertyExpressionName(oldPropertyName),
        EventsBasedBehavior::GetSharedPropertyExpressionName(newPropertyName));
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, expressionRenamer);

    std::unordered_map<gd::String, gd::String> oldToNewPropertyNames = {
        {oldPropertyName, newPropertyName}};
    std::unordered_set<gd::String> removedPropertyNames;
    gd::EventsPropertyReplacer eventsPropertyReplacer(
        project.GetCurrentPlatform(), properties, oldToNewPropertyNames,
        removedPropertyNames);
    gd::ProjectBrowserHelper::ExposeProjectEvents(project,
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
  gd::ExpressionsRenamer expressionRenamer =
      gd::ExpressionsRenamer(project.GetCurrentPlatform());
  expressionRenamer.SetReplacedObjectExpression(
      gd::PlatformExtension::GetObjectFullType(
          eventsFunctionsExtension.GetName(), eventsBasedObject.GetName()),
      EventsBasedObject::GetPropertyExpressionName(oldPropertyName),
      EventsBasedObject::GetPropertyExpressionName(newPropertyName));
  gd::ProjectBrowserHelper::ExposeProjectEvents(project, expressionRenamer);

  std::unordered_map<gd::String, gd::String> oldToNewPropertyNames = {
      {oldPropertyName, newPropertyName}};
  std::unordered_set<gd::String> removedPropertyNames;
  gd::EventsPropertyReplacer eventsPropertyReplacer(
      project.GetCurrentPlatform(), properties, oldToNewPropertyNames,
      removedPropertyNames);
  gd::ProjectBrowserHelper::ExposeProjectEvents(project,
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
  findInvalidRequiredBehaviorPropertiesInObjects(project.GetObjects());

  // Find in layout objects.
  for (std::size_t i = 0; i < project.GetLayoutsCount(); ++i) {
    const gd::Layout &layout = project.GetLayout(i);
    findInvalidRequiredBehaviorPropertiesInObjects(layout.GetObjects());
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

  auto renameBehaviorEventsFunction =
      [&project, &eventsFunctionsExtension, &oldBehaviorName,
       &newBehaviorName](const gd::EventsFunction &eventsFunction) {
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
          gd::ProjectBrowserHelper::ExposeProjectEvents(project, renamer);
        }
      };

  auto renameBehaviorProperty = [&project, &eventsFunctionsExtension,
                                 &oldBehaviorName, &newBehaviorName](
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
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, actionRenamer);

    gd::InstructionsTypeRenamer conditionRenamer = gd::InstructionsTypeRenamer(
        project,
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), oldBehaviorName,
            EventsBasedBehavior::GetPropertyConditionName(property.GetName())),
        gd::PlatformExtension::GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), newBehaviorName,
            EventsBasedBehavior::GetPropertyConditionName(property.GetName())));
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, conditionRenamer);

    // Nothing to do for expression, expressions are not including the name of
    // the behavior
  };

  auto renameBehaviorSharedProperty =
      [&project, &eventsFunctionsExtension, &oldBehaviorName,
       &newBehaviorName](const gd::NamedPropertyDescriptor &property) {
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
        gd::ProjectBrowserHelper::ExposeProjectEvents(project, actionRenamer);

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
        gd::ProjectBrowserHelper::ExposeProjectEvents(project,
                                                      conditionRenamer);

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

  const WholeProjectBrowser wholeProjectExposer;
  DoRenameBehavior(project,
                   gd::PlatformExtension::GetBehaviorFullType(
                       eventsFunctionsExtension.GetName(), oldBehaviorName),
                   gd::PlatformExtension::GetBehaviorFullType(
                       eventsFunctionsExtension.GetName(), newBehaviorName),
                   wholeProjectExposer);
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

  auto renameObjectEventsFunction =
      [&project, &eventsFunctionsExtension, &oldObjectName,
       &newObjectName](const gd::EventsFunction &eventsFunction) {
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
          gd::ProjectBrowserHelper::ExposeProjectEvents(project, renamer);
        }
      };

  auto renameObjectProperty = [&project, &eventsFunctionsExtension,
                               &oldObjectName, &newObjectName](
                                  const gd::NamedPropertyDescriptor &property) {
    gd::InstructionsTypeRenamer actionRenamer = gd::InstructionsTypeRenamer(
        project,
        gd::PlatformExtension::GetObjectEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), oldObjectName,
            EventsBasedObject::GetPropertyActionName(property.GetName())),
        gd::PlatformExtension::GetObjectEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), newObjectName,
            EventsBasedObject::GetPropertyActionName(property.GetName())));
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, actionRenamer);

    gd::InstructionsTypeRenamer conditionRenamer = gd::InstructionsTypeRenamer(
        project,
        gd::PlatformExtension::GetObjectEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), oldObjectName,
            EventsBasedObject::GetPropertyConditionName(property.GetName())),
        gd::PlatformExtension::GetObjectEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), newObjectName,
            EventsBasedObject::GetPropertyConditionName(property.GetName())));
    gd::ProjectBrowserHelper::ExposeProjectEvents(project, conditionRenamer);

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

  const WholeProjectBrowser wholeProjectExposer;
  DoRenameObject(project,
                 gd::PlatformExtension::GetObjectFullType(
                     eventsFunctionsExtension.GetName(), oldObjectName),
                 gd::PlatformExtension::GetObjectFullType(
                     eventsFunctionsExtension.GetName(), newObjectName),
                 wholeProjectExposer);
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

void WholeProjectRefactorer::ObjectOrGroupRemovedInLayout(
    gd::Project &project, gd::Layout &layout, const gd::String &objectName,
    bool isObjectGroup, bool removeEventsAndGroups) {
  auto projectScopedContainers = gd::ProjectScopedContainers::
      MakeNewProjectScopedContainersForProjectAndLayout(project, layout);

  // Remove object in the current layout
  if (removeEventsAndGroups) {
    gd::EventsRefactorer::RemoveObjectInEvents(project.GetCurrentPlatform(),
                                               projectScopedContainers,
                                               layout.GetEvents(), objectName);
  }
  if (!isObjectGroup) { // Object groups can't have instances or be in other
                        // groups
    if (removeEventsAndGroups) {
      for (std::size_t g = 0; g < layout.GetObjectGroups().size(); ++g) {
        if (layout.GetObjectGroups()[g].Find(objectName))
          layout.GetObjectGroups()[g].RemoveObject(objectName);
      }
    }
    layout.GetInitialInstances().RemoveInitialInstancesOfObject(objectName);
  }

  // Remove object in external events
  if (removeEventsAndGroups) {
    for (auto &externalEventsName :
         GetAssociatedExternalEvents(project, layout.GetName())) {
      auto &externalEvents = project.GetExternalEvents(externalEventsName);

      gd::EventsRefactorer::RemoveObjectInEvents(
          project.GetCurrentPlatform(), projectScopedContainers,
          externalEvents.GetEvents(), objectName);
    }
  }

  // Remove object in external layouts
  if (!isObjectGroup) { // Object groups can't have instances
    std::vector<gd::String> externalLayoutsNames =
        GetAssociatedExternalLayouts(project, layout);
    for (gd::String name : externalLayoutsNames) {
      auto &externalLayout = project.GetExternalLayout(name);
      externalLayout.GetInitialInstances().RemoveInitialInstancesOfObject(
          objectName);
    }
  }
}

void WholeProjectRefactorer::ObjectOrGroupRenamedInLayout(
    gd::Project &project, gd::Layout &layout, const gd::String &oldName,
    const gd::String &newName, bool isObjectGroup) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;

  auto projectScopedContainers = gd::ProjectScopedContainers::
      MakeNewProjectScopedContainersForProjectAndLayout(project, layout);

  // Rename object in the current layout
  gd::EventsRefactorer::RenameObjectInEvents(
      project.GetCurrentPlatform(), projectScopedContainers, layout.GetEvents(),
      oldName, newName);

  if (!isObjectGroup) { // Object groups can't have instances or be in other
                        // groups
    layout.GetInitialInstances().RenameInstancesOfObject(oldName, newName);
    for (std::size_t g = 0; g < layout.GetObjectGroups().size(); ++g) {
      layout.GetObjectGroups()[g].RenameObject(oldName, newName);
    }
  }

  // Rename object in external events
  for (auto &externalEventsName :
       GetAssociatedExternalEvents(project, layout.GetName())) {
    auto &externalEvents = project.GetExternalEvents(externalEventsName);
    gd::EventsRefactorer::RenameObjectInEvents(
        project.GetCurrentPlatform(), projectScopedContainers,
        externalEvents.GetEvents(), oldName, newName);
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

void WholeProjectRefactorer::RenameLayer(gd::Project &project,
                                         gd::Layout &layout,
                                         const gd::String &oldName,
                                         const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;

  gd::ProjectElementRenamer projectElementRenamer(project.GetCurrentPlatform(),
                                                  "layer", oldName, newName);
  gd::ProjectBrowserHelper::ExposeLayoutEventsAndExternalEvents(
      project, layout, projectElementRenamer);
  layout.GetInitialInstances().MoveInstancesToLayer(oldName, newName);

  std::vector<gd::String> externalLayoutsNames =
      GetAssociatedExternalLayouts(project, layout);
  for (gd::String name : externalLayoutsNames) {
    auto &externalLayout = project.GetExternalLayout(name);
    externalLayout.GetInitialInstances().MoveInstancesToLayer(oldName, newName);
  }
}

void WholeProjectRefactorer::RenameLayerEffect(gd::Project &project,
                                               gd::Layout &layout,
                                               gd::Layer &layer,
                                               const gd::String &oldName,
                                               const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;
  gd::ProjectElementRenamer projectElementRenamer(
      project.GetCurrentPlatform(), "layerEffectName", oldName, newName);
  projectElementRenamer.SetLayerConstraint(layer.GetName());
  gd::ProjectBrowserHelper::ExposeLayoutEventsAndExternalEvents(
      project, layout, projectElementRenamer);
}

void WholeProjectRefactorer::RenameObjectAnimation(gd::Project &project,
                                                   gd::Layout &layout,
                                                   gd::Object &object,
                                                   const gd::String &oldName,
                                                   const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;
  gd::ProjectElementRenamer projectElementRenamer(
      project.GetCurrentPlatform(), "objectAnimationName", oldName, newName);
  projectElementRenamer.SetObjectConstraint(object.GetName());
  gd::ProjectBrowserHelper::ExposeLayoutEventsAndExternalEvents(
      project, layout, projectElementRenamer);
}

void WholeProjectRefactorer::RenameObjectPoint(gd::Project &project,
                                               gd::Layout &layout,
                                               gd::Object &object,
                                               const gd::String &oldName,
                                               const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;
  gd::ProjectElementRenamer projectElementRenamer(
      project.GetCurrentPlatform(), "objectPointName", oldName, newName);
  projectElementRenamer.SetObjectConstraint(object.GetName());
  gd::ProjectBrowserHelper::ExposeLayoutEventsAndExternalEvents(
      project, layout, projectElementRenamer);
}

void WholeProjectRefactorer::RenameObjectEffect(gd::Project &project,
                                                gd::Layout &layout,
                                                gd::Object &object,
                                                const gd::String &oldName,
                                                const gd::String &newName) {
  if (oldName == newName || newName.empty() || oldName.empty())
    return;
  gd::ProjectElementRenamer projectElementRenamer(
      project.GetCurrentPlatform(), "objectEffectName", oldName, newName);
  projectElementRenamer.SetObjectConstraint(object.GetName());
  gd::ProjectBrowserHelper::ExposeLayoutEventsAndExternalEvents(
      project, layout, projectElementRenamer);
}

void WholeProjectRefactorer::ObjectOrGroupRemovedInEventsBasedObject(
    gd::Project &project, gd::EventsBasedObject &eventsBasedObject,
    gd::ObjectsContainer &globalObjectsContainer,
    gd::ObjectsContainer &objectsContainer, const gd::String &objectName,
    bool isObjectGroup, bool removeEventsAndGroups) {
  for (auto &functionUniquePtr :
       eventsBasedObject.GetEventsFunctions().GetInternalVector()) {
    auto function = functionUniquePtr.get();
    WholeProjectRefactorer::ObjectOrGroupRemovedInEventsFunction(
        project, *function, globalObjectsContainer, objectsContainer,
        objectName, isObjectGroup, isObjectGroup);
  }
}

void WholeProjectRefactorer::ObjectOrGroupRemovedInEventsFunction(
    gd::Project &project, gd::EventsFunction &eventsFunction,
    gd::ObjectsContainer &globalObjectsContainer,
    gd::ObjectsContainer &objectsContainer, const gd::String &objectName,
    bool isObjectGroup, bool removeEventsAndGroups) {
  // In theory we should pass a ProjectScopedContainers to this function so it
  // does not have to construct one. In practice, this is ok because we only
  // deal with objects.
  auto projectScopedContainers =
      gd::ProjectScopedContainers::MakeNewProjectScopedContainersFor(
          globalObjectsContainer, objectsContainer);

  if (removeEventsAndGroups) {
    gd::EventsRefactorer::RemoveObjectInEvents(
        project.GetCurrentPlatform(), projectScopedContainers,
        eventsFunction.GetEvents(), objectName);
  }
  if (!isObjectGroup) { // Object groups can't be in other groups
    if (removeEventsAndGroups) {
      for (std::size_t g = 0; g < eventsFunction.GetObjectGroups().size();
           ++g) {
        if (eventsFunction.GetObjectGroups()[g].Find(objectName))
          eventsFunction.GetObjectGroups()[g].RemoveObject(objectName);
      }
    }
  }
}

void WholeProjectRefactorer::ObjectOrGroupRenamedInEventsBasedObject(
    gd::Project &project, gd::ObjectsContainer &globalObjectsContainer,
    gd::EventsBasedObject &eventsBasedObject, const gd::String &oldName,
    const gd::String &newName, bool isObjectGroup) {
  for (auto &functionUniquePtr :
       eventsBasedObject.GetEventsFunctions().GetInternalVector()) {
    auto *function = functionUniquePtr.get();
    WholeProjectRefactorer::ObjectOrGroupRenamedInEventsFunction(
        project, *function, globalObjectsContainer, eventsBasedObject, oldName,
        newName, isObjectGroup);
  }
}

void WholeProjectRefactorer::ObjectOrGroupRenamedInEventsFunction(
    gd::Project &project, gd::EventsFunction &eventsFunction,
    gd::ObjectsContainer &globalObjectsContainer,
    gd::ObjectsContainer &objectsContainer, const gd::String &oldName,
    const gd::String &newName, bool isObjectGroup) {
  // In theory we should pass a ProjectScopedContainers to this function so it
  // does not have to construct one. In practice, this is ok because we only
  // deal with objects.
  auto projectScopedContainers =
      gd::ProjectScopedContainers::MakeNewProjectScopedContainersFor(
          globalObjectsContainer, objectsContainer);

  gd::EventsRefactorer::RenameObjectInEvents(
      project.GetCurrentPlatform(), projectScopedContainers,
      eventsFunction.GetEvents(), oldName, newName);

  if (!isObjectGroup) { // Object groups can't be in other groups
    for (std::size_t g = 0; g < eventsFunction.GetObjectGroups().size(); ++g) {
      eventsFunction.GetObjectGroups()[g].RenameObject(oldName, newName);
    }
  }
}

void WholeProjectRefactorer::GlobalObjectOrGroupRenamed(
    gd::Project &project, const gd::String &oldName, const gd::String &newName,
    bool isObjectGroup) {
  if (!isObjectGroup) { // Object groups can't be in other groups
    for (std::size_t g = 0; g < project.GetObjectGroups().size(); ++g) {
      project.GetObjectGroups()[g].RenameObject(oldName, newName);
    }
  }

  for (std::size_t i = 0; i < project.GetLayoutsCount(); ++i) {
    gd::Layout &layout = project.GetLayout(i);
    if (layout.HasObjectNamed(oldName))
      continue;

    ObjectOrGroupRenamedInLayout(project, layout, oldName, newName,
                                 isObjectGroup);
  }
}

void WholeProjectRefactorer::GlobalObjectOrGroupRemoved(
    gd::Project &project, const gd::String &objectName, bool isObjectGroup,
    bool removeEventsAndGroups) {
  if (!isObjectGroup) { // Object groups can't be in other groups
    if (removeEventsAndGroups) {
      for (std::size_t g = 0; g < project.GetObjectGroups().size(); ++g) {
        project.GetObjectGroups()[g].RemoveObject(objectName);
      }
    }
  }

  for (std::size_t i = 0; i < project.GetLayoutsCount(); ++i) {
    gd::Layout &layout = project.GetLayout(i);
    if (layout.HasObjectNamed(objectName))
      continue;

    ObjectOrGroupRemovedInLayout(project, layout, objectName, isObjectGroup,
                                 removeEventsAndGroups);
  }
}

void WholeProjectRefactorer::RemoveLayer(gd::Project &project,
                                         gd::Layout &layout,
                                         const gd::String &layerName) {
  if (layerName.empty())
    return;

  layout.GetInitialInstances().RemoveAllInstancesOnLayer(layerName);

  std::vector<gd::String> externalLayoutsNames =
      GetAssociatedExternalLayouts(project, layout);
  for (gd::String name : externalLayoutsNames) {
    auto &externalLayout = project.GetExternalLayout(name);
    externalLayout.GetInitialInstances().RemoveAllInstancesOnLayer(layerName);
  }
}

void WholeProjectRefactorer::MergeLayers(gd::Project &project,
                                         gd::Layout &layout,
                                         const gd::String &originLayerName,
                                         const gd::String &targetLayerName) {
  if (originLayerName == targetLayerName || originLayerName.empty())
    return;

  layout.GetInitialInstances().MoveInstancesToLayer(originLayerName,
                                                    targetLayerName);

  std::vector<gd::String> externalLayoutsNames =
      GetAssociatedExternalLayouts(project, layout);
  for (gd::String name : externalLayoutsNames) {
    auto &externalLayout = project.GetExternalLayout(name);
    externalLayout.GetInitialInstances().MoveInstancesToLayer(originLayerName,
                                                              targetLayerName);
  }
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

} // namespace gd
