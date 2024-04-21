/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "CustomConfigurationHelper.h"

#include <map>

#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertiesContainer.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"

using namespace gd;

void CustomConfigurationHelper::InitializeContent(
    const gd::PropertiesContainer &properties,
    gd::SerializerElement &configurationContent) {
  for (auto &&property : properties.GetInternalVector()) {
    auto &element = configurationContent.AddChild(property->GetName());
    auto propertyType = property->GetType();

    if (propertyType == "String" || propertyType == "Choice" ||
        propertyType == "Color" || propertyType == "Behavior" ||
        propertyType == "resource") {
      element.SetStringValue(property->GetValue());
    } else if (propertyType == "Number") {
      element.SetDoubleValue(property->GetValue().To<double>());
    } else if (propertyType == "Boolean") {
      element.SetBoolValue(property->GetValue() == "true");
    }
  }
}

std::map<gd::String, gd::PropertyDescriptor> CustomConfigurationHelper::GetProperties(
    const gd::PropertiesContainer &properties,
    const gd::SerializerElement &configurationContent) {
  auto behaviorProperties = std::map<gd::String, gd::PropertyDescriptor>();

  for (auto &property : properties.GetInternalVector()) {
    const auto &propertyName = property->GetName();
    const auto &propertyType = property->GetType();

    // Copy the property
    behaviorProperties[propertyName] = *property;

    auto &newProperty = behaviorProperties[propertyName];

    if (configurationContent.HasChild(propertyName)) {
      if (propertyType == "String" || propertyType == "Choice" ||
          propertyType == "Color" || propertyType == "Behavior" ||
          propertyType == "resource") {
        newProperty.SetValue(
            configurationContent.GetChild(propertyName).GetStringValue());
      } else if (propertyType == "Number") {
        newProperty.SetValue(gd::String::From(
            configurationContent.GetChild(propertyName).GetDoubleValue()));
      } else if (propertyType == "Boolean") {
        newProperty.SetValue(
            configurationContent.GetChild(propertyName).GetBoolValue()
                ? "true"
                : "false");
      }
    } else {
      // No value was serialized for this property. `newProperty`
      // will have the default value coming from `enumeratedProperty`.
    }
  }

  return behaviorProperties;
}

bool CustomConfigurationHelper::UpdateProperty(
    const gd::PropertiesContainer &properties,
    gd::SerializerElement &configurationContent,
    const gd::String &propertyName,
    const gd::String &newValue) {
  if (!properties.Has(propertyName)) {
    return false;
  }
  const auto &property = properties.Get(propertyName);

  auto &element = configurationContent.AddChild(propertyName);
  const gd::String &propertyType = property.GetType();

  if (propertyType == "String" || propertyType == "Choice" ||
      propertyType == "Color" || propertyType == "Behavior" ||
      propertyType == "resource") {
    element.SetStringValue(newValue);
  } else if (propertyType == "Number") {
    element.SetDoubleValue(newValue.To<double>());
  } else if (propertyType == "Boolean") {
    element.SetBoolValue(newValue == "1");
  }

  return true;
}