/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsFunctionTools.h"

#include "GDCore/Events/Expression.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsBasedObject.h"
//#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

namespace gd {

void EventsFunctionTools::FreeEventsFunctionToObjectsContainer(
    const gd::Project& project,
    const gd::EventsFunctionsContainer& functionContainer,
    const gd::EventsFunction& eventsFunction,
    gd::ObjectsContainer& outputObjectsContainer) {
  // Functions scope for objects is defined according
  // to parameters
  outputObjectsContainer.GetObjects().clear();
  outputObjectsContainer.GetObjectGroups().Clear();

  auto &parameters = eventsFunction.GetParametersForEvents(functionContainer);
  gd::ParameterMetadataTools::ParametersToObjectsContainer(
      project,
      parameters,
      outputObjectsContainer);
  outputObjectsContainer.GetObjectGroups() = eventsFunction.GetObjectGroups();
}

void EventsFunctionTools::BehaviorEventsFunctionToObjectsContainer(
    const gd::Project& project,
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::EventsFunction& eventsFunction,
    gd::ObjectsContainer& outputObjectsContainer) {
  // The context is build the same way as free function...
  FreeEventsFunctionToObjectsContainer(project,
                                       eventsBasedBehavior.GetEventsFunctions(),
                                       eventsFunction,
                                       outputObjectsContainer);

  // ...and has an "Object" by convention...
  if (!outputObjectsContainer.HasObjectNamed("Object")) {
    gd::LogWarning("No \"Object\" in a function of an events based behavior: " +
                   eventsFunction.GetName() +
                   ". This means this function is likely misconfigured (check "
                   "its parameters).");
    return;
  }

  // ...with behaviors from properties.
  gd::Object& thisObject = outputObjectsContainer.GetObject("Object");
  for (size_t i = 0;
       i < eventsBasedBehavior.GetPropertyDescriptors().GetCount();
       i++) {
    const NamedPropertyDescriptor& propertyDescriptor =
        eventsBasedBehavior.GetPropertyDescriptors().Get(i);
    const std::vector<gd::String>& extraInfo =
        propertyDescriptor.GetExtraInfo();
    if (propertyDescriptor.GetType() == "Behavior" && extraInfo.size() > 0) {
      gd::String behaviorName = propertyDescriptor.GetName();
      thisObject.AddNewBehavior(project, extraInfo.at(0), behaviorName);
    }
  }
}

void EventsFunctionTools::ObjectEventsFunctionToObjectsContainer(
    const gd::Project& project,
    const gd::EventsBasedObject& eventsBasedObject,
    const gd::EventsFunction& eventsFunction,
    gd::ObjectsContainer& outputObjectsContainer) {
  // The context is build the same way as free function...
  FreeEventsFunctionToObjectsContainer(project,
                                       eventsBasedObject.GetEventsFunctions(),
                                       eventsFunction,
                                       outputObjectsContainer);

  // TODO EBO Use a constant instead a hard coded value "Object".
  // ...and has an "Object" by convention...
  if (!outputObjectsContainer.HasObjectNamed("Object")) {
    gd::LogWarning("No \"Object\" in a function of an events based object: " +
                   eventsFunction.GetName() +
                   ". This means this function is likely misconfigured (check "
                   "its parameters).");
    return;
  }
  if (eventsBasedObject.GetObjects().HasObjectNamed("Object")) {
    gd::LogWarning("Child-objects can't be named Object because it's reserved"
                  "for the parent. ");
    return;
  }

  // ...and its children.
  auto &children = eventsBasedObject.GetObjects().GetObjects();
  for (auto &childObject : children) {
    auto child = childObject.get();
    outputObjectsContainer.InsertObject(*child, children.size());
  }
}

}  // namespace gd
