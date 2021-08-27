/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "WholeProjectRefactorer.h"

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/DependenciesAnalyzer.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/Events/EventsRefactorer.h"
#include "GDCore/IDE/Events/ExpressionsParameterMover.h"
#include "GDCore/IDE/Events/ExpressionsRenamer.h"
#include "GDCore/IDE/Events/InstructionsParameterMover.h"
#include "GDCore/IDE/Events/InstructionsTypeRenamer.h"
#include "GDCore/IDE/EventsFunctionTools.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/ObjectGroup.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

namespace {
// These functions are doing the reverse of what is done when adding
// instructions/expression to extension/behaviors. If needed, they could be
// moved to gd::PlatformExtension to colocate the usage of the namespace
// separator?
gd::String GetEventsFunctionFullType(const gd::String& extensionName,
                                     const gd::String& functionName) {
  const auto& separator = gd::PlatformExtension::GetNamespaceSeparator();
  return extensionName + separator + functionName;
}
gd::String GetBehaviorEventsFunctionFullType(const gd::String& extensionName,
                                             const gd::String& behaviorName,
                                             const gd::String& functionName) {
  const auto& separator = gd::PlatformExtension::GetNamespaceSeparator();
  return extensionName + separator + behaviorName + separator + functionName;
}
gd::String GetBehaviorFullType(const gd::String& extensionName,
                               const gd::String& behaviorName) {
  const auto& separator = gd::PlatformExtension::GetNamespaceSeparator();
  return extensionName + separator + behaviorName;
}
}  // namespace

namespace gd {

void WholeProjectRefactorer::ExposeProjectEvents(
    gd::Project& project, gd::ArbitraryEventsWorker& worker) {
  // See also gd::Project::ExposeResources for a method that traverse the whole
  // project (this time for resources).

  // Add layouts events
  for (std::size_t s = 0; s < project.GetLayoutsCount(); s++) {
    worker.Launch(project.GetLayout(s).GetEvents());
  }
  // Add external events events
  for (std::size_t s = 0; s < project.GetExternalEventsCount(); s++) {
    worker.Launch(project.GetExternalEvents(s).GetEvents());
  }
  // Add events based extensions
  for (std::size_t e = 0; e < project.GetEventsFunctionsExtensionsCount();
       e++) {
    // Add (free) events functions
    auto& eventsFunctionsExtension = project.GetEventsFunctionsExtension(e);
    for (auto&& eventsFunction : eventsFunctionsExtension.GetInternalVector()) {
      worker.Launch(eventsFunction->GetEvents());
    }

    // Add (behavior) events functions
    for (auto&& eventsBasedBehavior :
         eventsFunctionsExtension.GetEventsBasedBehaviors()
             .GetInternalVector()) {
      auto& behaviorEventsFunctions = eventsBasedBehavior->GetEventsFunctions();
      for (auto&& eventsFunction :
           behaviorEventsFunctions.GetInternalVector()) {
        worker.Launch(eventsFunction->GetEvents());
      }
    }
  }
}

void WholeProjectRefactorer::ExposeProjectEvents(
    gd::Project& project, gd::ArbitraryEventsWorkerWithContext& worker) {
  // See also gd::Project::ExposeResources for a method that traverse the whole
  // project (this time for resources) and ExposeProjectEffects (this time for
  // effects).

  // Add layouts events
  for (std::size_t s = 0; s < project.GetLayoutsCount(); s++) {
    auto& layout = project.GetLayout(s);
    worker.Launch(layout.GetEvents(), project, layout);
  }
  // Add external events events
  for (std::size_t s = 0; s < project.GetExternalEventsCount(); s++) {
    const auto& externalEvents = project.GetExternalEvents(s);
    const gd::String& associatedLayout = externalEvents.GetAssociatedLayout();
    if (project.HasLayoutNamed(associatedLayout)) {
      worker.Launch(project.GetExternalEvents(s).GetEvents(),
                    project,
                    project.GetLayout(associatedLayout));
    }
  }
  // Add events based extensions
  for (std::size_t e = 0; e < project.GetEventsFunctionsExtensionsCount();
       e++) {
    // Add (free) events functions
    auto& eventsFunctionsExtension = project.GetEventsFunctionsExtension(e);
    for (auto&& eventsFunction : eventsFunctionsExtension.GetInternalVector()) {
      gd::ObjectsContainer globalObjectsAndGroups;
      gd::ObjectsContainer objectsAndGroups;
      gd::EventsFunctionTools::FreeEventsFunctionToObjectsContainer(
          project, *eventsFunction, globalObjectsAndGroups, objectsAndGroups);

      worker.Launch(eventsFunction->GetEvents(),
                    globalObjectsAndGroups,
                    objectsAndGroups);
    }

    // Add (behavior) events functions
    for (auto&& eventsBasedBehavior :
         eventsFunctionsExtension.GetEventsBasedBehaviors()
             .GetInternalVector()) {
      auto& behaviorEventsFunctions = eventsBasedBehavior->GetEventsFunctions();
      for (auto&& eventsFunction :
           behaviorEventsFunctions.GetInternalVector()) {
        gd::ObjectsContainer globalObjectsAndGroups;
        gd::ObjectsContainer objectsAndGroups;
        gd::EventsFunctionTools::BehaviorEventsFunctionToObjectsContainer(
            project,
            *eventsBasedBehavior,
            *eventsFunction,
            globalObjectsAndGroups,
            objectsAndGroups);

        worker.Launch(eventsFunction->GetEvents(),
                      globalObjectsAndGroups,
                      objectsAndGroups);
      }
    }
  }
}

void WholeProjectRefactorer::ExposeProjectObjects(
    gd::Project& project, gd::ArbitraryObjectsWorker& worker) {
  worker.Launch(project);
  for (size_t i = 0; i < project.GetLayoutsCount(); i++)
    worker.Launch(project.GetLayout(i));
};

std::set<gd::String>
WholeProjectRefactorer::GetAllObjectTypesUsingEventsBasedBehavior(
    const gd::Project& project,
    const gd::EventsFunctionsExtension& eventsFunctionsExtension,
    const gd::EventsBasedBehavior& eventsBasedBehavior) {
  std::set<gd::String> allTypes;
  const gd::String behaviorType = GetBehaviorFullType(
      eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName());

  auto addTypesOfObjectsIn =
      [&allTypes, &behaviorType](const gd::ObjectsContainer& objectsContainer) {
        for (auto& object : objectsContainer.GetObjects()) {
          for (auto& behaviorContent : object->GetAllBehaviorContents()) {
            if (behaviorContent.second->GetTypeName() == behaviorType) {
              allTypes.insert(object->GetType());
            }
          }
        }
      };

  addTypesOfObjectsIn(project);
  for (std::size_t s = 0; s < project.GetLayoutsCount(); s++) {
    auto& layout = project.GetLayout(s);
    addTypesOfObjectsIn(layout);
  }

  return allTypes;
}

void WholeProjectRefactorer::EnsureBehaviorEventsFunctionsProperParameters(
    const gd::EventsFunctionsExtension& eventsFunctionsExtension,
    const gd::EventsBasedBehavior& eventsBasedBehavior) {
  for (auto& eventsFunction :
       eventsBasedBehavior.GetEventsFunctions().GetInternalVector()) {
    auto& parameters = eventsFunction->GetParameters();
    while (parameters.size() < 2) {
      gd::ParameterMetadata newParameter;
      parameters.push_back(newParameter);
    }

    parameters[0]
        .SetType("object")
        .SetName("Object")
        .SetDescription("Object")
        .SetExtraInfo(eventsBasedBehavior.GetObjectType());
    parameters[1]
        .SetType("behavior")
        .SetName("Behavior")
        .SetDescription("Behavior")
        .SetExtraInfo(GetBehaviorFullType(eventsFunctionsExtension.GetName(),
                                          eventsBasedBehavior.GetName()));
  }
}

void WholeProjectRefactorer::RenameEventsFunctionsExtension(
    gd::Project& project,
    const gd::EventsFunctionsExtension& eventsFunctionsExtension,
    const gd::String& oldName,
    const gd::String& newName) {
  auto renameEventsFunction =
      [&project, &oldName, &newName](const gd::EventsFunction& eventsFunction) {
        DoRenameEventsFunction(
            project,
            eventsFunction,
            GetEventsFunctionFullType(oldName, eventsFunction.GetName()),
            GetEventsFunctionFullType(newName, eventsFunction.GetName()));
      };

  auto renameBehaviorEventsFunction =
      [&project, &eventsFunctionsExtension, &oldName, &newName](
          const gd::EventsBasedBehavior& eventsBasedBehavior,
          const gd::EventsFunction& eventsFunction) {
        if (eventsFunction.GetFunctionType() == gd::EventsFunction::Action ||
            eventsFunction.GetFunctionType() == gd::EventsFunction::Condition) {
          gd::InstructionsTypeRenamer renamer = gd::InstructionsTypeRenamer(
              project,
              GetBehaviorEventsFunctionFullType(oldName,
                                                eventsBasedBehavior.GetName(),
                                                eventsFunction.GetName()),
              GetBehaviorEventsFunctionFullType(newName,
                                                eventsBasedBehavior.GetName(),
                                                eventsFunction.GetName()));
          ExposeProjectEvents(project, renamer);
        } else if (eventsFunction.GetFunctionType() ==
                       gd::EventsFunction::Expression ||
                   eventsFunction.GetFunctionType() ==
                       gd::EventsFunction::StringExpression) {
          // Nothing to do, expressions are not including the extension name
        }
      };

  auto renameBehaviorPropertyFunctions =
      [&project, &eventsFunctionsExtension, &oldName, &newName](
          const gd::EventsBasedBehavior& eventsBasedBehavior,
          const gd::NamedPropertyDescriptor& property) {
        gd::InstructionsTypeRenamer actionRenamer = gd::InstructionsTypeRenamer(
            project,
            GetBehaviorEventsFunctionFullType(
                oldName,
                eventsBasedBehavior.GetName(),
                gd::EventsBasedBehavior::GetPropertyActionName(
                    property.GetName())),
            GetBehaviorEventsFunctionFullType(
                newName,
                eventsBasedBehavior.GetName(),
                gd::EventsBasedBehavior::GetPropertyActionName(
                    property.GetName())));
        ExposeProjectEvents(project, actionRenamer);

        gd::InstructionsTypeRenamer conditionRenamer =
            gd::InstructionsTypeRenamer(
                project,
                GetBehaviorEventsFunctionFullType(
                    oldName,
                    eventsBasedBehavior.GetName(),
                    gd::EventsBasedBehavior::GetPropertyConditionName(
                        property.GetName())),
                GetBehaviorEventsFunctionFullType(
                    newName,
                    eventsBasedBehavior.GetName(),
                    gd::EventsBasedBehavior::GetPropertyConditionName(
                        property.GetName())));
        ExposeProjectEvents(project, conditionRenamer);

        // Nothing to do for expressions, expressions are not including the
        // extension name
      };

  // Order is important: we first rename the expressions then the instructions,
  // to avoid being unable to fetch the metadata (the types of parameters) of
  // instructions after they are renamed.

  // Free expressions
  for (auto&& eventsFunction : eventsFunctionsExtension.GetInternalVector()) {
    if (eventsFunction->GetFunctionType() == gd::EventsFunction::Expression ||
        eventsFunction->GetFunctionType() ==
            gd::EventsFunction::StringExpression) {
      renameEventsFunction(*eventsFunction);
    }
  }
  // Behavior expressions
  for (auto&& eventsBasedBehavior :
       eventsFunctionsExtension.GetEventsBasedBehaviors().GetInternalVector()) {
    auto& behaviorEventsFunctions = eventsBasedBehavior->GetEventsFunctions();
    for (auto&& eventsFunction : behaviorEventsFunctions.GetInternalVector()) {
      if (eventsFunction->GetFunctionType() == gd::EventsFunction::Expression ||
          eventsFunction->GetFunctionType() ==
              gd::EventsFunction::StringExpression) {
        renameBehaviorEventsFunction(*eventsBasedBehavior, *eventsFunction);
      }
    }
  }

  // Free instructions
  for (auto&& eventsFunction : eventsFunctionsExtension.GetInternalVector()) {
    if (eventsFunction->GetFunctionType() == gd::EventsFunction::Action ||
        eventsFunction->GetFunctionType() == gd::EventsFunction::Condition) {
      renameEventsFunction(*eventsFunction);
    }
  }

  // Behavior instructions
  for (auto&& eventsBasedBehavior :
       eventsFunctionsExtension.GetEventsBasedBehaviors().GetInternalVector()) {
    auto& behaviorEventsFunctions = eventsBasedBehavior->GetEventsFunctions();
    for (auto&& eventsFunction : behaviorEventsFunctions.GetInternalVector()) {
      if (eventsFunction->GetFunctionType() == gd::EventsFunction::Action ||
          eventsFunction->GetFunctionType() == gd::EventsFunction::Condition) {
        renameBehaviorEventsFunction(*eventsBasedBehavior, *eventsFunction);
      }
    }
  }

  // Behavior properties
  for (auto&& eventsBasedBehavior :
       eventsFunctionsExtension.GetEventsBasedBehaviors().GetInternalVector()) {
    auto& behaviorProperties = eventsBasedBehavior->GetPropertyDescriptors();
    for (auto&& propertyDescriptor : behaviorProperties.GetInternalVector()) {
      renameBehaviorPropertyFunctions(*eventsBasedBehavior,
                                      *propertyDescriptor);
    }
  }

  // Finally, rename behaviors used in objects
  for (auto&& eventsBasedBehavior :
       eventsFunctionsExtension.GetEventsBasedBehaviors().GetInternalVector()) {
    DoRenameBehavior(
        project,
        GetBehaviorFullType(oldName, eventsBasedBehavior->GetName()),
        GetBehaviorFullType(newName, eventsBasedBehavior->GetName()));
  }
}

void WholeProjectRefactorer::RenameEventsFunction(
    gd::Project& project,
    const gd::EventsFunctionsExtension& eventsFunctionsExtension,
    const gd::String& oldFunctionName,
    const gd::String& newFunctionName) {
  if (!eventsFunctionsExtension.HasEventsFunctionNamed(oldFunctionName)) return;

  const gd::EventsFunction& eventsFunction =
      eventsFunctionsExtension.GetEventsFunction(oldFunctionName);

  DoRenameEventsFunction(
      project,
      eventsFunction,
      GetEventsFunctionFullType(eventsFunctionsExtension.GetName(),
                                oldFunctionName),
      GetEventsFunctionFullType(eventsFunctionsExtension.GetName(),
                                newFunctionName));
}

void WholeProjectRefactorer::RenameBehaviorEventsFunction(
    gd::Project& project,
    const gd::EventsFunctionsExtension& eventsFunctionsExtension,
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::String& oldFunctionName,
    const gd::String& newFunctionName) {
  auto& eventsFunctions = eventsBasedBehavior.GetEventsFunctions();
  if (!eventsFunctions.HasEventsFunctionNamed(oldFunctionName)) return;

  const gd::EventsFunction& eventsFunction =
      eventsFunctions.GetEventsFunction(oldFunctionName);

  if (eventsFunction.GetFunctionType() == gd::EventsFunction::Action ||
      eventsFunction.GetFunctionType() == gd::EventsFunction::Condition) {
    gd::InstructionsTypeRenamer renamer = gd::InstructionsTypeRenamer(
        project,
        GetBehaviorEventsFunctionFullType(eventsFunctionsExtension.GetName(),
                                          eventsBasedBehavior.GetName(),
                                          oldFunctionName),
        GetBehaviorEventsFunctionFullType(eventsFunctionsExtension.GetName(),
                                          eventsBasedBehavior.GetName(),
                                          newFunctionName));
    ExposeProjectEvents(project, renamer);
  } else if (eventsFunction.GetFunctionType() ==
                 gd::EventsFunction::Expression ||
             eventsFunction.GetFunctionType() ==
                 gd::EventsFunction::StringExpression) {
    gd::ExpressionsRenamer renamer =
        gd::ExpressionsRenamer(project.GetCurrentPlatform());
    renamer.SetReplacedBehaviorExpression(
        GetBehaviorFullType(eventsFunctionsExtension.GetName(),
                            eventsBasedBehavior.GetName()),
        oldFunctionName,
        newFunctionName);
    ExposeProjectEvents(project, renamer);
  }
}

void WholeProjectRefactorer::MoveEventsFunctionParameter(
    gd::Project& project,
    const gd::EventsFunctionsExtension& eventsFunctionsExtension,
    const gd::String& functionName,
    std::size_t oldIndex,
    std::size_t newIndex) {
  if (!eventsFunctionsExtension.HasEventsFunctionNamed(functionName)) return;

  const gd::EventsFunction& eventsFunction =
      eventsFunctionsExtension.GetEventsFunction(functionName);

  const gd::String& eventsFunctionType = GetEventsFunctionFullType(
      eventsFunctionsExtension.GetName(), functionName);

  if (eventsFunction.GetFunctionType() == gd::EventsFunction::Action ||
      eventsFunction.GetFunctionType() == gd::EventsFunction::Condition) {
    gd::InstructionsParameterMover mover = gd::InstructionsParameterMover(
        project, eventsFunctionType, oldIndex, newIndex);
    ExposeProjectEvents(project, mover);
  } else if (eventsFunction.GetFunctionType() ==
                 gd::EventsFunction::Expression ||
             eventsFunction.GetFunctionType() ==
                 gd::EventsFunction::StringExpression) {
    gd::ExpressionsParameterMover mover =
        gd::ExpressionsParameterMover(project.GetCurrentPlatform());
    mover.SetFreeExpressionMovedParameter(
        eventsFunctionType, oldIndex, newIndex);
    ExposeProjectEvents(project, mover);
  }
}

void WholeProjectRefactorer::MoveBehaviorEventsFunctionParameter(
    gd::Project& project,
    const gd::EventsFunctionsExtension& eventsFunctionsExtension,
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::String& functionName,
    std::size_t oldIndex,
    std::size_t newIndex) {
  auto& eventsFunctions = eventsBasedBehavior.GetEventsFunctions();
  if (!eventsFunctions.HasEventsFunctionNamed(functionName)) return;

  const gd::EventsFunction& eventsFunction =
      eventsFunctions.GetEventsFunction(functionName);

  const gd::String& eventsFunctionType =
      GetBehaviorEventsFunctionFullType(eventsFunctionsExtension.GetName(),
                                        eventsBasedBehavior.GetName(),
                                        functionName);

  if (eventsFunction.GetFunctionType() == gd::EventsFunction::Action ||
      eventsFunction.GetFunctionType() == gd::EventsFunction::Condition) {
    gd::InstructionsParameterMover mover = gd::InstructionsParameterMover(
        project, eventsFunctionType, oldIndex, newIndex);
    ExposeProjectEvents(project, mover);
  } else if (eventsFunction.GetFunctionType() ==
                 gd::EventsFunction::Expression ||
             eventsFunction.GetFunctionType() ==
                 gd::EventsFunction::StringExpression) {
    gd::ExpressionsParameterMover mover =
        gd::ExpressionsParameterMover(project.GetCurrentPlatform());
    mover.SetBehaviorExpressionMovedParameter(
        GetBehaviorFullType(eventsFunctionsExtension.GetName(),
                            eventsBasedBehavior.GetName()),
        functionName,
        oldIndex,
        newIndex);
    ExposeProjectEvents(project, mover);
  }
}

void WholeProjectRefactorer::RenameBehaviorProperty(
    gd::Project& project,
    const gd::EventsFunctionsExtension& eventsFunctionsExtension,
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::String& oldPropertyName,
    const gd::String& newPropertyName) {
  auto& properties = eventsBasedBehavior.GetPropertyDescriptors();
  if (!properties.Has(oldPropertyName)) return;

  // Order is important: we first rename the expressions then the instructions,
  // to avoid being unable to fetch the metadata (the types of parameters) of
  // instructions after they are renamed.
  gd::ExpressionsRenamer expressionRenamer =
      gd::ExpressionsRenamer(project.GetCurrentPlatform());
  expressionRenamer.SetReplacedBehaviorExpression(
      GetBehaviorFullType(eventsFunctionsExtension.GetName(),
                          eventsBasedBehavior.GetName()),
      EventsBasedBehavior::GetPropertyExpressionName(oldPropertyName),
      EventsBasedBehavior::GetPropertyExpressionName(newPropertyName));
  ExposeProjectEvents(project, expressionRenamer);

  gd::InstructionsTypeRenamer actionRenamer = gd::InstructionsTypeRenamer(
      project,
      GetBehaviorEventsFunctionFullType(
          eventsFunctionsExtension.GetName(),
          eventsBasedBehavior.GetName(),
          EventsBasedBehavior::GetPropertyActionName(oldPropertyName)),
      GetBehaviorEventsFunctionFullType(
          eventsFunctionsExtension.GetName(),
          eventsBasedBehavior.GetName(),
          EventsBasedBehavior::GetPropertyActionName(newPropertyName)));
  ExposeProjectEvents(project, actionRenamer);

  gd::InstructionsTypeRenamer conditionRenamer = gd::InstructionsTypeRenamer(
      project,
      GetBehaviorEventsFunctionFullType(
          eventsFunctionsExtension.GetName(),
          eventsBasedBehavior.GetName(),
          EventsBasedBehavior::GetPropertyConditionName(oldPropertyName)),
      GetBehaviorEventsFunctionFullType(
          eventsFunctionsExtension.GetName(),
          eventsBasedBehavior.GetName(),
          EventsBasedBehavior::GetPropertyConditionName(newPropertyName)));
  ExposeProjectEvents(project, conditionRenamer);
}

void WholeProjectRefactorer::RenameEventsBasedBehavior(
    gd::Project& project,
    const gd::EventsFunctionsExtension& eventsFunctionsExtension,
    const gd::String& oldBehaviorName,
    const gd::String& newBehaviorName) {
  auto& eventsBasedBehaviors =
      eventsFunctionsExtension.GetEventsBasedBehaviors();
  if (!eventsBasedBehaviors.Has(oldBehaviorName)) {
    gd::LogWarning("Warning, " + oldBehaviorName +
                   " was not found when calling RenameEventsBasedBehavior.");
    return;
  }
  auto& eventsBasedBehavior = eventsBasedBehaviors.Get(oldBehaviorName);

  auto renameBehaviorEventsFunction =
      [&project,
       &eventsFunctionsExtension,
       &eventsBasedBehavior,
       &oldBehaviorName,
       &newBehaviorName](const gd::EventsFunction& eventsFunction) {
        if (eventsFunction.GetFunctionType() == gd::EventsFunction::Action ||
            eventsFunction.GetFunctionType() == gd::EventsFunction::Condition) {
          gd::InstructionsTypeRenamer renamer = gd::InstructionsTypeRenamer(
              project,
              GetBehaviorEventsFunctionFullType(
                  eventsFunctionsExtension.GetName(),
                  oldBehaviorName,
                  eventsFunction.GetName()),
              GetBehaviorEventsFunctionFullType(
                  eventsFunctionsExtension.GetName(),
                  newBehaviorName,
                  eventsFunction.GetName()));
          ExposeProjectEvents(project, renamer);
        } else if (eventsFunction.GetFunctionType() ==
                       gd::EventsFunction::Expression ||
                   eventsFunction.GetFunctionType() ==
                       gd::EventsFunction::StringExpression) {
          // Nothing to do, expressions are not including the name of the
          // behavior
        }
      };

  auto renameBehaviorProperty = [&project,
                                 &eventsFunctionsExtension,
                                 &eventsBasedBehavior,
                                 &oldBehaviorName,
                                 &newBehaviorName](
                                    const gd::NamedPropertyDescriptor&
                                        property) {
    gd::InstructionsTypeRenamer actionRenamer = gd::InstructionsTypeRenamer(
        project,
        GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(),
            oldBehaviorName,
            EventsBasedBehavior::GetPropertyActionName(property.GetName())),
        GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(),
            newBehaviorName,
            EventsBasedBehavior::GetPropertyActionName(property.GetName())));
    ExposeProjectEvents(project, actionRenamer);

    gd::InstructionsTypeRenamer conditionRenamer = gd::InstructionsTypeRenamer(
        project,
        GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(),
            oldBehaviorName,
            EventsBasedBehavior::GetPropertyConditionName(property.GetName())),
        GetBehaviorEventsFunctionFullType(
            eventsFunctionsExtension.GetName(),
            newBehaviorName,
            EventsBasedBehavior::GetPropertyConditionName(property.GetName())));
    ExposeProjectEvents(project, conditionRenamer);

    // Nothing to do for expression, expressions are not including the name of
    // the behavior
  };

  // Order is important: we first rename the expressions then the instructions,
  // to avoid being unable to fetch the metadata (the types of parameters) of
  // instructions after they are renamed.
  auto& behaviorEventsFunctions = eventsBasedBehavior.GetEventsFunctions();

  // Behavior expressions
  for (auto&& eventsFunction : behaviorEventsFunctions.GetInternalVector()) {
    if (eventsFunction->GetFunctionType() == gd::EventsFunction::Expression ||
        eventsFunction->GetFunctionType() ==
            gd::EventsFunction::StringExpression) {
      renameBehaviorEventsFunction(*eventsFunction);
    }
  }

  // Behavior instructions
  for (auto&& eventsFunction : behaviorEventsFunctions.GetInternalVector()) {
    if (eventsFunction->GetFunctionType() == gd::EventsFunction::Action ||
        eventsFunction->GetFunctionType() == gd::EventsFunction::Condition) {
      renameBehaviorEventsFunction(*eventsFunction);
    }
  }

  // Behavior properties
  auto& properties = eventsBasedBehavior.GetPropertyDescriptors();
  for (auto&& property : properties.GetInternalVector()) {
    renameBehaviorProperty(*property);
  }

  DoRenameBehavior(
      project,
      GetBehaviorFullType(eventsFunctionsExtension.GetName(), oldBehaviorName),
      GetBehaviorFullType(eventsFunctionsExtension.GetName(), newBehaviorName));
}

void WholeProjectRefactorer::DoRenameEventsFunction(
    gd::Project& project,
    const gd::EventsFunction& eventsFunction,
    const gd::String& oldFullType,
    const gd::String& newFullType) {
  if (eventsFunction.GetFunctionType() == gd::EventsFunction::Action ||
      eventsFunction.GetFunctionType() == gd::EventsFunction::Condition) {
    gd::InstructionsTypeRenamer renamer =
        gd::InstructionsTypeRenamer(project, oldFullType, newFullType);
    ExposeProjectEvents(project, renamer);
  } else if (eventsFunction.GetFunctionType() ==
                 gd::EventsFunction::Expression ||
             eventsFunction.GetFunctionType() ==
                 gd::EventsFunction::StringExpression) {
    gd::ExpressionsRenamer renamer =
        gd::ExpressionsRenamer(project.GetCurrentPlatform());
    renamer.SetReplacedFreeExpression(oldFullType, newFullType);
    ExposeProjectEvents(project, renamer);
  }
}

void WholeProjectRefactorer::DoRenameBehavior(
    gd::Project& project,
    const gd::String& oldBehaviorType,
    const gd::String& newBehaviorType) {
  auto renameBehaviorTypeInBehaviorContent =
      [&oldBehaviorType,
       &newBehaviorType](gd::BehaviorContent& behaviorContent) {
        if (behaviorContent.GetTypeName() == oldBehaviorType) {
          behaviorContent.SetTypeName(newBehaviorType);
        }
      };
  auto renameBehaviorTypeInObjects =
      [&renameBehaviorTypeInBehaviorContent](
          std::vector<std::unique_ptr<gd::Object> >& objectsList) {
        for (auto& object : objectsList) {
          for (auto& behaviorContent : object->GetAllBehaviorContents()) {
            renameBehaviorTypeInBehaviorContent(*behaviorContent.second);
          }
        }
      };
  auto renameBehaviorTypeInParameters =
      [&oldBehaviorType, &newBehaviorType](gd::EventsFunction& eventsFunction) {
        for (auto& parameter : eventsFunction.GetParameters()) {
          if (gd::ParameterMetadata::IsBehavior(parameter.GetType()) &&
              parameter.GetExtraInfo() == oldBehaviorType) {
            parameter.SetExtraInfo(newBehaviorType);
          }
        }
      };

  // Rename behavior in global objects
  renameBehaviorTypeInObjects(project.GetObjects());

  // Rename behavior in layout objects and layout behavior shared data.
  for (std::size_t i = 0; i < project.GetLayoutsCount(); ++i) {
    gd::Layout& layout = project.GetLayout(i);

    renameBehaviorTypeInObjects(layout.GetObjects());
    for (auto& behaviorSharedDataContent : layout.GetAllBehaviorSharedData()) {
      renameBehaviorTypeInBehaviorContent(*behaviorSharedDataContent.second);
    }
  }

  // Rename in parameters of (free/behavior) events function
  for (std::size_t e = 0; e < project.GetEventsFunctionsExtensionsCount();
       e++) {
    auto& eventsFunctionsExtension = project.GetEventsFunctionsExtension(e);
    for (auto&& eventsFunction : eventsFunctionsExtension.GetInternalVector()) {
      renameBehaviorTypeInParameters(*eventsFunction);
    }

    for (auto&& eventsBasedBehavior :
         eventsFunctionsExtension.GetEventsBasedBehaviors()
             .GetInternalVector()) {
      auto& behaviorEventsFunctions = eventsBasedBehavior->GetEventsFunctions();
      for (auto&& eventsFunction :
           behaviorEventsFunctions.GetInternalVector()) {
        renameBehaviorTypeInParameters(*eventsFunction);
      }
    }
  }
}

void WholeProjectRefactorer::ObjectOrGroupRemovedInLayout(
    gd::Project& project,
    gd::Layout& layout,
    const gd::String& objectName,
    bool isObjectGroup,
    bool removeEventsAndGroups) {
  // Remove object in the current layout
  if (removeEventsAndGroups) {
    gd::EventsRefactorer::RemoveObjectInEvents(project.GetCurrentPlatform(),
                                               project,
                                               layout,
                                               layout.GetEvents(),
                                               objectName);
  }
  if (!isObjectGroup) {  // Object groups can't have instances or be in other
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
    DependenciesAnalyzer analyzer(project, layout);
    if (analyzer.Analyze()) {
      for (auto& externalEventsName :
           analyzer.GetExternalEventsDependencies()) {
        auto& externalEvents = project.GetExternalEvents(externalEventsName);
        gd::EventsRefactorer::RemoveObjectInEvents(project.GetCurrentPlatform(),
                                                   project,
                                                   layout,
                                                   externalEvents.GetEvents(),
                                                   objectName);
      }
      for (auto& layoutName : analyzer.GetScenesDependencies()) {
        auto& layout = project.GetLayout(layoutName);
        gd::EventsRefactorer::RemoveObjectInEvents(project.GetCurrentPlatform(),
                                                   project,
                                                   layout,
                                                   layout.GetEvents(),
                                                   objectName);
      }
    }
  }

  // Remove object in external layouts
  if (!isObjectGroup) {  // Object groups can't have instances
    std::vector<gd::String> externalLayoutsNames =
        GetAssociatedExternalLayouts(project, layout);
    for (gd::String name : externalLayoutsNames) {
      auto& externalLayout = project.GetExternalLayout(name);
      externalLayout.GetInitialInstances().RemoveInitialInstancesOfObject(
          objectName);
    }
  }
}

void WholeProjectRefactorer::ObjectOrGroupRenamedInLayout(
    gd::Project& project,
    gd::Layout& layout,
    const gd::String& oldName,
    const gd::String& newName,
    bool isObjectGroup) {
  // Rename object in the current layout
  gd::EventsRefactorer::RenameObjectInEvents(project.GetCurrentPlatform(),
                                             project,
                                             layout,
                                             layout.GetEvents(),
                                             oldName,
                                             newName);

  if (!isObjectGroup) {  // Object groups can't have instances or be in other
                         // groups
    layout.GetInitialInstances().RenameInstancesOfObject(oldName, newName);
    for (std::size_t g = 0; g < layout.GetObjectGroups().size(); ++g) {
      layout.GetObjectGroups()[g].RenameObject(oldName, newName);
    }
  }

  // Rename object in external events
  DependenciesAnalyzer analyzer(project, layout);
  if (analyzer.Analyze()) {
    for (auto& externalEventsName : analyzer.GetExternalEventsDependencies()) {
      auto& externalEvents = project.GetExternalEvents(externalEventsName);
      gd::EventsRefactorer::RenameObjectInEvents(project.GetCurrentPlatform(),
                                                 project,
                                                 layout,
                                                 externalEvents.GetEvents(),
                                                 oldName,
                                                 newName);
    }
    for (auto& layoutName : analyzer.GetScenesDependencies()) {
      auto& layout = project.GetLayout(layoutName);
      gd::EventsRefactorer::RenameObjectInEvents(project.GetCurrentPlatform(),
                                                 project,
                                                 layout,
                                                 layout.GetEvents(),
                                                 oldName,
                                                 newName);
    }
  }

  // Rename object in external layouts
  if (!isObjectGroup) {  // Object groups can't have instances
    std::vector<gd::String> externalLayoutsNames =
        GetAssociatedExternalLayouts(project, layout);
    for (gd::String name : externalLayoutsNames) {
      auto& externalLayout = project.GetExternalLayout(name);
      externalLayout.GetInitialInstances().RenameInstancesOfObject(oldName,
                                                                   newName);
    }
  }
}
void WholeProjectRefactorer::ObjectOrGroupRemovedInEventsFunction(
    gd::Project& project,
    gd::EventsFunction& eventsFunction,
    gd::ObjectsContainer& globalObjectsContainer,
    gd::ObjectsContainer& objectsContainer,
    const gd::String& objectName,
    bool isObjectGroup,
    bool removeEventsAndGroups) {
  // Remove object in the current layout
  if (removeEventsAndGroups) {
    gd::EventsRefactorer::RemoveObjectInEvents(project.GetCurrentPlatform(),
                                               globalObjectsContainer,
                                               objectsContainer,
                                               eventsFunction.GetEvents(),
                                               objectName);
  }
  if (!isObjectGroup) {  // Object groups can't be in other groups
    if (removeEventsAndGroups) {
      for (std::size_t g = 0; g < eventsFunction.GetObjectGroups().size();
           ++g) {
        if (eventsFunction.GetObjectGroups()[g].Find(objectName))
          eventsFunction.GetObjectGroups()[g].RemoveObject(objectName);
      }
    }
  }
}

void WholeProjectRefactorer::ObjectOrGroupRenamedInEventsFunction(
    gd::Project& project,
    gd::EventsFunction& eventsFunction,
    gd::ObjectsContainer& globalObjectsContainer,
    gd::ObjectsContainer& objectsContainer,
    const gd::String& oldName,
    const gd::String& newName,
    bool isObjectGroup) {
  // Rename object in the current layout
  gd::EventsRefactorer::RenameObjectInEvents(project.GetCurrentPlatform(),
                                             globalObjectsContainer,
                                             objectsContainer,
                                             eventsFunction.GetEvents(),
                                             oldName,
                                             newName);

  if (!isObjectGroup) {  // Object groups can't be in other groups
    for (std::size_t g = 0; g < eventsFunction.GetObjectGroups().size(); ++g) {
      eventsFunction.GetObjectGroups()[g].RenameObject(oldName, newName);
    }
  }
}

void WholeProjectRefactorer::GlobalObjectOrGroupRenamed(
    gd::Project& project,
    const gd::String& oldName,
    const gd::String& newName,
    bool isObjectGroup) {
  if (!isObjectGroup) {  // Object groups can't be in other groups
    for (std::size_t g = 0; g < project.GetObjectGroups().size(); ++g) {
      project.GetObjectGroups()[g].RenameObject(oldName, newName);
    }
  }

  for (std::size_t i = 0; i < project.GetLayoutsCount(); ++i) {
    gd::Layout& layout = project.GetLayout(i);
    if (layout.HasObjectNamed(oldName)) continue;

    ObjectOrGroupRenamedInLayout(
        project, layout, oldName, newName, isObjectGroup);
  }
}

void WholeProjectRefactorer::GlobalObjectOrGroupRemoved(
    gd::Project& project,
    const gd::String& objectName,
    bool isObjectGroup,
    bool removeEventsAndGroups) {
  if (!isObjectGroup) {  // Object groups can't be in other groups
    if (removeEventsAndGroups) {
      for (std::size_t g = 0; g < project.GetObjectGroups().size(); ++g) {
        project.GetObjectGroups()[g].RemoveObject(objectName);
      }
    }
  }

  for (std::size_t i = 0; i < project.GetLayoutsCount(); ++i) {
    gd::Layout& layout = project.GetLayout(i);
    if (layout.HasObjectNamed(objectName)) continue;

    ObjectOrGroupRemovedInLayout(
        project, layout, objectName, isObjectGroup, removeEventsAndGroups);
  }
}

std::vector<gd::String> WholeProjectRefactorer::GetAssociatedExternalLayouts(
    gd::Project& project, gd::Layout& layout) {
  std::vector<gd::String> results;
  for (std::size_t i = 0; i < project.GetExternalLayoutsCount(); ++i) {
    auto& externalLayout = project.GetExternalLayout(i);

    if (externalLayout.GetAssociatedLayout() == layout.GetName()) {
      results.push_back(externalLayout.GetName());
    }
  }

  return results;
}

}  // namespace gd
