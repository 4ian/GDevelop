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

    const auto &valueType =
        gd::ValueTypeMetadata::ConvertPropertyTypeToValueType(
            property->GetType());
    const auto &primitiveType =
        gd::ValueTypeMetadata::GetPrimitiveValueType(valueType);
    if (primitiveType == "string" || valueType == "behavior") {
      element.SetStringValue(property->GetValue());
    } else if (primitiveType == "number") {
      element.SetDoubleValue(property->GetValue().To<double>());
    } else if (primitiveType == "boolean") {
      element.SetBoolValue(property->GetValue() == "true");
    }
  }
}

std::map<gd::String, gd::PropertyDescriptor> CustomConfigurationHelper::GetProperties(
    const gd::PropertiesContainer &properties,
    const gd::SerializerElement &configurationContent) {
  auto objectProperties = std::map<gd::String, gd::PropertyDescriptor>();

  for (auto &property : properties.GetInternalVector()) {
    const auto &propertyName = property->GetName();

    // Copy the property
    objectProperties[propertyName] = *property;

    auto &newProperty = objectProperties[propertyName];

    const auto &valueType =
        gd::ValueTypeMetadata::ConvertPropertyTypeToValueType(
            property->GetType());
    const auto &primitiveType =
        gd::ValueTypeMetadata::GetPrimitiveValueType(valueType);
    if (configurationContent.HasChild(propertyName)) {
      if (primitiveType == "string" || valueType == "behavior") {
        newProperty.SetValue(
            configurationContent.GetChild(propertyName).GetStringValue());
      } else if (primitiveType == "number") {
        newProperty.SetValue(gd::String::From(
            configurationContent.GetChild(propertyName).GetDoubleValue()));
      } else if (primitiveType == "boolean") {
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

  return objectProperties;
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

  const auto &valueType =
      gd::ValueTypeMetadata::ConvertPropertyTypeToValueType(property.GetType());
  const auto &primitiveType =
      gd::ValueTypeMetadata::GetPrimitiveValueType(valueType);
  if (primitiveType == "string" || valueType == "behavior") {
    element.SetStringValue(newValue);
  } else if (primitiveType == "number") {
    element.SetDoubleValue(newValue.To<double>());
  } else if (primitiveType == "boolean") {
    element.SetBoolValue(newValue == "1");
  }

  return true;
}