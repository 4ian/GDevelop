/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsBasedObjectVariantHelper.h"

#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectGroup.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/ObjectsContainersList.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/String.h"

namespace gd {

void EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
    const gd::Project &project, gd::EventsBasedObject &eventsBasedObject) {
  auto &defaultObjects = eventsBasedObject.GetDefaultVariant().GetObjects();

  for (const auto &variant :
       eventsBasedObject.GetVariants().GetInternalVector()) {
    auto &objects = variant->GetObjects();

    // Delete extra objects
    for (auto it = objects.GetObjects().begin();
         it != objects.GetObjects().end(); ++it) {
      const auto &objectName = it->get()->GetName();
      if (!defaultObjects.HasObjectNamed(objectName)) {
        variant->GetInitialInstances().RemoveInitialInstancesOfObject(
            objectName);
        // Do it in last because it unalloc objectName.
        objects.RemoveObject(objectName);
        --it;
      }
    }
    for (const auto &defaultObject : defaultObjects.GetObjects()) {
      const auto &objectName = defaultObject->GetName();
      const auto &defaultVariables = defaultObject->GetVariables();
      const auto &defaultBehaviors = defaultObject->GetAllBehaviorContents();

      // Copy missing objects
      if (!objects.HasObjectNamed(objectName)) {
        objects.InsertObject(*defaultObject,
                             defaultObjects.GetObjectPosition(objectName));
        objects.AddMissingObjectsInRootFolder();
        continue;
      }
      // Change object types
      auto &object = objects.GetObject(objectName);
      if (object.GetType() != defaultObject->GetType()) {
        // Keep a copy of the old object.
        auto oldObject = objects.GetObject(objectName);
        objects.RemoveObject(objectName);
        objects.InsertObject(*defaultObject,
                             defaultObjects.GetObjectPosition(objectName));
        object.CopyWithoutConfiguration(oldObject);
        objects.AddMissingObjectsInRootFolder();
      }

      // Copy missing behaviors
      for (const auto &pair : defaultBehaviors) {
        const auto &behaviorName = pair.first;
        const auto &defaultBehavior = pair.second;

        if (object.HasBehaviorNamed(behaviorName) &&
            object.GetBehavior(behaviorName).GetTypeName() !=
                defaultBehavior->GetTypeName()) {
          object.RemoveBehavior(behaviorName);
        }
        if (!object.HasBehaviorNamed(behaviorName)) {
          auto *behavior = object.AddNewBehavior(
              project, defaultBehavior->GetTypeName(), behaviorName);
          gd::SerializerElement element;
          defaultBehavior->SerializeTo(element);
          behavior->UnserializeFrom(element);
        }
      }
      // Delete extra behaviors
      for (auto &behaviorName : object.GetAllBehaviorNames()) {
        if (!defaultObject->HasBehaviorNamed(behaviorName)) {
          object.RemoveBehavior(behaviorName);
        }
      }

      // Sort and copy missing variables
      auto &variables = object.GetVariables();
      for (size_t defaultVariableIndex = 0;
           defaultVariableIndex < defaultVariables.Count();
           defaultVariableIndex++) {
        const auto &variableName =
            defaultVariables.GetNameAt(defaultVariableIndex);
        const auto &defaultVariable =
            defaultVariables.Get(defaultVariableIndex);

        auto variableIndex = variables.GetPosition(variableName);
        if (variableIndex == gd::String::npos) {
          variables.Insert(variableName, defaultVariable, defaultVariableIndex);
        } else {
          variables.Move(variableIndex, defaultVariableIndex);
        }
        if (variables.Get(variableName).GetType() != defaultVariable.GetType()) {
          variables.Remove(variableName);
          variables.Insert(variableName, defaultVariable, defaultVariableIndex);
        }
      }
      // Remove extra variables
      auto variableToRemoveCount = variables.Count() - defaultVariables.Count();
      for (size_t iteration = 0; iteration < variableToRemoveCount;
           iteration++) {
        variables.Remove(variables.GetNameAt(variables.Count() - 1));
      }

      // Remove extra instance variables
      variant->GetInitialInstances().IterateOverInstances(
          [&objectName,
           &defaultVariables](gd::InitialInstance &initialInstance) {
            if (initialInstance.GetObjectName() != objectName) {
              return false;
            }
            auto &instanceVariables = initialInstance.GetVariables();
            for (size_t instanceVariableIndex = 0;
                 instanceVariableIndex < instanceVariables.Count();
                 instanceVariableIndex++) {
              const auto &variableName =
                  defaultVariables.GetNameAt(instanceVariableIndex);

              if (!defaultVariables.Has(variableName)) {
                instanceVariables.Remove(variableName);
              }
            }
            return false;
          });
    }
    auto &defaultObjectGroups =
        eventsBasedObject.GetDefaultVariant().GetObjects().GetObjectGroups();
    auto &objectGroups = variant->GetObjects().GetObjectGroups();
    auto objectGroupsCount = objectGroups.Count();
    // Clear groups
    for (size_t index = 0; index < objectGroupsCount; index++) {
      objectGroups.Remove(objectGroups.Get(0).GetName());
    }
    // Copy groups
    for (size_t index = 0; index < defaultObjectGroups.Count(); index++) {
      objectGroups.Insert(defaultObjectGroups.Get(index), index);
    }
  }
}

} // namespace gd
