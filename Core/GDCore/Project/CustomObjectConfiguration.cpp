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

using namespace gd;

void CustomObjectConfiguration::Init(const gd::CustomObjectConfiguration& objectConfiguration) {
  project = objectConfiguration.project;
  objectContent = objectConfiguration.objectContent;

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

gd::ObjectConfiguration &CustomObjectConfiguration::GetChildObjectConfiguration(const gd::String &objectName) {
  if (!project->HasEventsBasedObject(GetType())) {
    return badObjectConfiguration;
  }
  const auto &eventsBasedObject = project->GetEventsBasedObject(GetType());
  
  if (!eventsBasedObject.HasObjectNamed(objectName)) {
    gd::LogError("Tried to get the configuration of a child-object:" + objectName
                + " that doesn't exist in the event-based object: " + GetType());
    return badObjectConfiguration;
  }

  auto &childObject = eventsBasedObject.GetObject(objectName);
  auto configurationPosition = childObjectConfigurations.find(objectName);
  if (configurationPosition == childObjectConfigurations.end()) {
    childObjectConfigurations.insert(std::make_pair(
        objectName,
        project->CreateObjectConfiguration(childObject.GetType())));
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

    for (auto &property : properties.GetInternalVector()) {
      const auto &propertyName = property->GetName();
      const auto &propertyType = property->GetType();

      // TODO Move this into a PropertyDescriptor copy method.
      auto &newProperty = objectProperties[propertyName]
            .SetType(property->GetType())
            .SetDescription(property->GetDescription())
            .SetGroup(property->GetGroup())
            .SetLabel(property->GetLabel())
            .SetValue(property->GetValue())
            .SetHidden(property->IsHidden());
      
      for (auto &extraInfo : property->GetExtraInfo()) {
        newProperty.AddExtraInfo(extraInfo);
      }

      if (objectContent.HasChild(propertyName)) {
        if (
          propertyType == "String" ||
          propertyType == "Choice" ||
          propertyType == "Color"
        ) {
          newProperty.SetValue(
            objectContent.GetChild(propertyName).GetStringValue()
          );
        } else if (propertyType == "Number") {
          newProperty.SetValue(
            gd::String::From(objectContent.GetChild(propertyName).GetDoubleValue())
          );
        } else if (propertyType == "Boolean") {
          newProperty.SetValue(
            objectContent.GetChild(propertyName).GetBoolValue()
              ? "true"
              : "false"
          );
        }
      } else {
        // No value was serialized for this property. `newProperty`
        // will have the default value coming from `enumeratedProperty`.
      }
    }

    return objectProperties;
}

bool CustomObjectConfiguration::UpdateProperty(const gd::String& propertyName,
                                  const gd::String& newValue) {
    if (!project->HasEventsBasedObject(GetType())) {
      return false;
    }
    const auto &eventsBasedObject = project->GetEventsBasedObject(GetType());
    const auto &properties = eventsBasedObject.GetPropertyDescriptors();
    if (!properties.Has(propertyName)) {
      return false;
    }
    const auto &property = properties.Get(propertyName);

    auto &element = objectContent.AddChild(propertyName);
    const gd::String &propertyType = property.GetType();

    if (
      propertyType == "String" ||
      propertyType == "Choice" ||
      propertyType == "Color"
    ) {
      element.SetStringValue(newValue);
    } else if (propertyType == "Number") {
      element.SetDoubleValue(newValue.To<double>());
    } else if (propertyType == "Boolean") {
      element.SetBoolValue(newValue == "1");
    }

    return true;
}

std::map<gd::String, gd::PropertyDescriptor>
CustomObjectConfiguration::GetInitialInstanceProperties(
    const gd::InitialInstance& instance,
    gd::Project& project,
    gd::Layout& scene) {
  return std::map<gd::String, gd::PropertyDescriptor>();
}

bool CustomObjectConfiguration::UpdateInitialInstanceProperty(
    gd::InitialInstance& instance,
    const gd::String& name,
    const gd::String& value,
    gd::Project& project,
    gd::Layout& scene) {
  return false;
}

void CustomObjectConfiguration::DoSerializeTo(SerializerElement& element) const {
  element.AddChild("content") = objectContent;
  auto &childrenContentElement = element.AddChild("childrenContent");
  for (auto &pair : childObjectConfigurations) {
    auto &childName = pair.first;
    auto &childConfiguration = pair.second;
    auto &childElement = childrenContentElement.AddChild(childName);
    childConfiguration->SerializeTo(childElement);
  }
}
void CustomObjectConfiguration::DoUnserializeFrom(Project& project,
                                               const SerializerElement& element) {
  objectContent = element.GetChild("content");
  auto &childrenContentElement = element.GetChild("childrenContent");
  for (auto &pair : childrenContentElement.GetAllChildren()) {
    auto &childName = pair.first;
    auto &childElement = pair.second;
    auto &childConfiguration = GetChildObjectConfiguration(childName);
    childConfiguration.UnserializeFrom(project, *childElement);
  }
}

void CustomObjectConfiguration::ExposeResources(
    gd::ArbitraryResourceWorker& worker) {
  std::map<gd::String, gd::PropertyDescriptor> properties = GetProperties();

  for (auto& property : properties) {
    const String& propertyName = property.first;
    const gd::PropertyDescriptor& propertyDescriptor = property.second;
    if (propertyDescriptor.GetType() == "resource") {
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
      } else if (resourceType == "bitmapFont") {
        worker.ExposeBitmapFont(newPropertyValue);
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

  for (auto& childObject : eventsBasedObject.GetObjects()) {
    auto &configuration = GetChildObjectConfiguration(childObject->GetName());
    configuration.ExposeResources(worker);
  }
}
