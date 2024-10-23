/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "CustomObjectConfiguration.h"

#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Project/CustomConfigurationHelper.h"
#include "GDCore/Project/InitialInstance.h"

using namespace gd;

void CustomObjectConfiguration::Init(const gd::CustomObjectConfiguration& objectConfiguration) {
  project = objectConfiguration.project;
  objectContent = objectConfiguration.objectContent;
  animations = objectConfiguration.animations;
  isMarkedAsOverridingEventsBasedObjectChildrenConfiguration =
      objectConfiguration
          .isMarkedAsOverridingEventsBasedObjectChildrenConfiguration;

  // There is no default copy for a map of unique_ptr like childObjectConfigurations.
  childObjectConfigurations.clear();
  for (auto& it : objectConfiguration.childObjectConfigurations) {
    childObjectConfigurations[it.first] = it.second->Clone();
  }
}

gd::ObjectConfiguration CustomObjectConfiguration::badObjectConfiguration;

std::unique_ptr<gd::ObjectConfiguration> CustomObjectConfiguration::Clone() const {
  return gd::make_unique<gd::CustomObjectConfiguration>(*this);
}

const gd::EventsBasedObject* CustomObjectConfiguration::GetEventsBasedObject() const {
  if (!project->HasEventsBasedObject(GetType())) {
    return nullptr;
  }
  return &project->GetEventsBasedObject(GetType());
}

bool CustomObjectConfiguration::
    IsForcedToOverrideEventsBasedObjectChildrenConfiguration() const {
  const auto *eventsBasedObject = GetEventsBasedObject();
  if (!eventsBasedObject) {
    // True is safer because nothing will be lost when serializing.
    return true;
  }
  return eventsBasedObject->GetInitialInstances().GetInstancesCount() == 0;
}

bool CustomObjectConfiguration::
    IsOverridingEventsBasedObjectChildrenConfiguration() const {
  return isMarkedAsOverridingEventsBasedObjectChildrenConfiguration ||
         IsForcedToOverrideEventsBasedObjectChildrenConfiguration();
}

void CustomObjectConfiguration::ClearChildrenConfiguration() {
  childObjectConfigurations.clear();
}

gd::ObjectConfiguration &CustomObjectConfiguration::GetChildObjectConfiguration(const gd::String &objectName) {
  const auto *eventsBasedObject = GetEventsBasedObject();
  if (!eventsBasedObject) {
    return badObjectConfiguration;
  }

  if (!eventsBasedObject->GetObjects().HasObjectNamed(objectName)) {
    gd::LogError("Tried to get the configuration of a child-object: " + objectName
                + " that doesn't exist in the event-based object: " + GetType());
    return badObjectConfiguration;
  }

  auto &childObject = eventsBasedObject->GetObjects().GetObject(objectName);

  if (!IsOverridingEventsBasedObjectChildrenConfiguration()) {
    // It should be fine because the editor doesn't allow to edit values when
    // the default values from the events-based object is used.
    //
    // Resource refactor operations may modify it but they will do the same
    // thing on the custom object as on the event-based object children so it
    // shouldn't have any side effect.
    return const_cast<gd::ObjectConfiguration &>(
        childObject.GetConfiguration());
  }

  auto configurationPosition = childObjectConfigurations.find(objectName);
  if (configurationPosition == childObjectConfigurations.end()) {
    childObjectConfigurations.insert(std::make_pair(
        objectName,
        childObject.GetConfiguration().Clone()));
    return *(childObjectConfigurations[objectName]);
  }
  else {
    auto &pair = *configurationPosition;
    auto &configuration = pair.second;
    return *configuration;
  }
}

std::map<gd::String, gd::PropertyDescriptor> CustomObjectConfiguration::GetProperties() const {
    auto objectProperties = std::map<gd::String, gd::PropertyDescriptor>();
    if (!project->HasEventsBasedObject(GetType())) {
      return objectProperties;
    }
    const auto &eventsBasedObject = project->GetEventsBasedObject(GetType());
    const auto &properties = eventsBasedObject.GetPropertyDescriptors();

    return gd::CustomConfigurationHelper::GetProperties(properties, objectContent);
}

bool CustomObjectConfiguration::UpdateProperty(const gd::String& propertyName,
                                  const gd::String& newValue) {
    if (!project->HasEventsBasedObject(GetType())) {
      return false;
    }
    const auto &eventsBasedObject = project->GetEventsBasedObject(GetType());
    const auto &properties = eventsBasedObject.GetPropertyDescriptors();

    return gd::CustomConfigurationHelper::UpdateProperty(
        properties,
        objectContent,
        propertyName,
        newValue);
}

std::map<gd::String, gd::PropertyDescriptor>
CustomObjectConfiguration::GetInitialInstanceProperties(
    const gd::InitialInstance &initialInstance) {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  if (!animations.HasNoAnimations()) {
    properties["animation"] =
        gd::PropertyDescriptor(
            gd::String::From(initialInstance.GetRawDoubleProperty("animation")))
            .SetLabel(_("Animation"))
            .SetType("number");
  }
  return properties;
}

bool CustomObjectConfiguration::UpdateInitialInstanceProperty(
    gd::InitialInstance &initialInstance, const gd::String &name,
    const gd::String &value) {
  if (name == "animation") {
    initialInstance.SetRawDoubleProperty(
        "animation", std::max(0, value.empty() ? 0 : value.To<int>()));
  }

  return true;
}

void CustomObjectConfiguration::DoSerializeTo(SerializerElement& element) const {
  element.AddChild("content") = objectContent;

  const auto *eventsBasedObject = GetEventsBasedObject();
  if (!animations.HasNoAnimations() ||
      (eventsBasedObject && eventsBasedObject->IsAnimatable())) {
    auto &animatableElement = element.AddChild("animatable");
    animations.SerializeTo(animatableElement);
  }

  if (IsOverridingEventsBasedObjectChildrenConfiguration()) {
    auto &childrenContentElement = element.AddChild("childrenContent");
    for (auto &pair : childObjectConfigurations) {
      auto &childName = pair.first;
      auto &childConfiguration = pair.second;
      auto &childElement = childrenContentElement.AddChild(childName);
      childConfiguration->SerializeTo(childElement);
    }
  }
}
void CustomObjectConfiguration::DoUnserializeFrom(Project& project,
                                               const SerializerElement& element) {
  objectContent = element.GetChild("content");

  if (element.HasChild("animatable")) {
    auto &animatableElement = element.GetChild("animatable");
    animations.UnserializeFrom(animatableElement);
  }

  isMarkedAsOverridingEventsBasedObjectChildrenConfiguration =
      element.HasChild("childrenContent");
  if (isMarkedAsOverridingEventsBasedObjectChildrenConfiguration) {
    auto &childrenContentElement = element.GetChild("childrenContent");
    for (auto &pair : childrenContentElement.GetAllChildren()) {
      auto &childName = pair.first;
      auto &childElement = pair.second;
      auto &childConfiguration = GetChildObjectConfiguration(childName);
      childConfiguration.UnserializeFrom(project, *childElement);
    }
  }
}

void CustomObjectConfiguration::ExposeResources(gd::ArbitraryResourceWorker& worker) {
  animations.ExposeResources(worker);

  std::map<gd::String, gd::PropertyDescriptor> properties = GetProperties();

  for (auto& property : properties) {
    const String& propertyName = property.first;
    const gd::PropertyDescriptor &propertyDescriptor = property.second;
    if (propertyDescriptor.GetType().LowerCase() == "resource") {
      auto& extraInfo = propertyDescriptor.GetExtraInfo();
      const gd::String& resourceType = extraInfo.empty() ? "" : extraInfo[0];
      const gd::String& oldPropertyValue = propertyDescriptor.GetValue();

      gd::String newPropertyValue = oldPropertyValue;
      if (resourceType == "image") {
        worker.ExposeImage(newPropertyValue);
      } else if (resourceType == "audio") {
        worker.ExposeAudio(newPropertyValue);
      } else if (resourceType == "font") {
        worker.ExposeFont(newPropertyValue);
      } else if (resourceType == "video") {
        worker.ExposeVideo(newPropertyValue);
      } else if (resourceType == "json") {
        worker.ExposeJson(newPropertyValue);
      } else if (resourceType == "tilemap") {
        worker.ExposeTilemap(newPropertyValue);
      } else if (resourceType == "tileset") {
        worker.ExposeTileset(newPropertyValue);
      } else if (resourceType == "bitmapFont") {
        worker.ExposeBitmapFont(newPropertyValue);
      } else if (resourceType == "model3D") {
        worker.ExposeModel3D(newPropertyValue);
      } else if (resourceType == "atlas") {
        worker.ExposeAtlas(newPropertyValue);
      } else if (resourceType == "spine") {
        worker.ExposeSpine(newPropertyValue);
      }

      if (newPropertyValue != oldPropertyValue) {
        UpdateProperty(propertyName, newPropertyValue);
      }
    }
  }

  auto objectProperties = std::map<gd::String, gd::PropertyDescriptor>();
  if (!project->HasEventsBasedObject(GetType())) {
    return;
  }
  const auto &eventsBasedObject = project->GetEventsBasedObject(GetType());

  for (auto& childObject : eventsBasedObject.GetObjects().GetObjects()) {
    auto &configuration = GetChildObjectConfiguration(childObject->GetName());
    configuration.ExposeResources(worker);
  }
}

std::size_t CustomObjectConfiguration::GetAnimationsCount() const {
  return animations.GetAnimationsCount();
}

const gd::String &
CustomObjectConfiguration::GetAnimationName(size_t index) const {
  return animations.GetAnimation(index).GetName();
}

bool CustomObjectConfiguration::HasAnimationNamed(
    const gd::String &name) const {
  return animations.HasAnimationNamed(name);
}

const SpriteAnimationList& CustomObjectConfiguration::GetAnimations() const {
  return animations;
}

SpriteAnimationList& CustomObjectConfiguration::GetAnimations() {
  return animations;
}

const gd::CustomObjectConfiguration::EdgeAnchor
CustomObjectConfiguration::GetEdgeAnchorFromString(const gd::String &value) {
  return (value == _("Window left") || value == _("Window top"))
             ? gd::CustomObjectConfiguration::EdgeAnchor::MinEdge
         : (value == _("Window right") || value == _("Window bottom"))
             ? gd::CustomObjectConfiguration::EdgeAnchor::MaxEdge
         : value == _("Proportional")
             ? gd::CustomObjectConfiguration::EdgeAnchor::Proportional
         : value == _("Window center")
             ? gd::CustomObjectConfiguration::EdgeAnchor::Center
             : gd::CustomObjectConfiguration::EdgeAnchor::NoAnchor;
}
