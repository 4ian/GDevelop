/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsFunctionTools.h"
#include "GDCore/Events/Expression.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

void EventsFunctionTools::FreeEventsFunctionToObjectsContainer(
    gd::Project& project,
    const gd::EventsFunction& eventsFunction,
    gd::ObjectsContainer& outputGlobalObjectsContainer,
    gd::ObjectsContainer& outputObjectsContainer) {
  // Functions don't have access to objects from the "outer" scope.
  outputGlobalObjectsContainer.GetObjects().clear();
  outputGlobalObjectsContainer.GetObjectGroups().Clear();

  // Functions scope for objects is defined according
  // to parameters
  outputObjectsContainer.GetObjects().clear();
  outputObjectsContainer.GetObjectGroups().Clear();
  gd::ParameterMetadataTools::ParametersToObjectsContainer(
      project, eventsFunction.GetParameters(), outputObjectsContainer);
  outputObjectsContainer.GetObjectGroups() = eventsFunction.GetObjectGroups();
}

void EventsFunctionTools::BehaviorEventsFunctionToObjectsContainer(
    gd::Project& project,
      const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::EventsFunction& eventsFunction,
    gd::ObjectsContainer& outputGlobalObjectsContainer,
    gd::ObjectsContainer& outputObjectsContainer) {
  // The context is build the same way as free fuction...
  FreeEventsFunctionToObjectsContainer(
      project,
      eventsFunction,
      outputGlobalObjectsContainer,
      outputObjectsContainer);
  
  // ...but with behaviors from properties
  gd::Object& thisObject = outputObjectsContainer.GetObject(0);
  for (size_t i = 0; i < eventsBasedBehavior.GetPropertyDescriptors().GetCount(); i++)
  {
    const NamedPropertyDescriptor& propertyDescriptor = eventsBasedBehavior.GetPropertyDescriptors().Get(i);
    const std::vector<gd::String>& extraInfo = propertyDescriptor.GetExtraInfo();
    if (propertyDescriptor.GetType() == "Behavior" && extraInfo.size() > 0) {
      gd::String behaviorName = propertyDescriptor.GetName();
      thisObject.AddNewBehavior(
          project,
          extraInfo.at(0),
          behaviorName);
    }
  }
}

}  // namespace gd
