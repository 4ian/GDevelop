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

namespace {
bool IsExactStaticDataPlaceholderValue(const gd::String &value) {
  gd::String trimmedValue = value;
  trimmedValue = trimmedValue.Trim();
  if (trimmedValue.length() < 5) return false;
  if (trimmedValue.substr(0, 2) != "{{") return false;
  if (trimmedValue.substr(trimmedValue.length() - 2) != "}}") return false;

  return !trimmedValue.substr(2, trimmedValue.length() - 4).Trim().empty();
}

double GetNumberPropertyValue(const gd::String &value) {
  return value.empty() ? 0.0 : value.To<double>();
}

bool GetBooleanPropertyValue(const gd::String &value) {
  return value == "true" || value == "1";
}
} // namespace

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
    if (property->GetType() == "JsonObject") {
      element.SetStringValue(property->GetValue());
    } else if (primitiveType == "string" || valueType == "behavior") {
      element.SetStringValue(property->GetValue());
    } else if (primitiveType == "number") {
      if (IsExactStaticDataPlaceholderValue(property->GetValue())) {
        element.SetStringValue(property->GetValue());
      } else {
        element.SetDoubleValue(GetNumberPropertyValue(property->GetValue()));
      }
    } else if (primitiveType == "boolean") {
      if (IsExactStaticDataPlaceholderValue(property->GetValue())) {
        element.SetStringValue(property->GetValue());
      } else {
        element.SetBoolValue(GetBooleanPropertyValue(property->GetValue()));
      }
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
      auto &child = configurationContent.GetChild(propertyName);
      if (property->GetType() == "JsonObject") {
        newProperty.SetValue(child.GetStringValue());
      } else if (primitiveType == "string" || valueType == "behavior") {
        newProperty.SetValue(child.GetStringValue());
      } else if (primitiveType == "number") {
        newProperty.SetValue(child.GetValue().IsString()
                                 ? child.GetStringValue()
                                 : gd::String::From(child.GetDoubleValue()));
      } else if (primitiveType == "boolean") {
        newProperty.SetValue(child.GetValue().IsString()
                                 ? child.GetStringValue()
                                 : child.GetBoolValue() ? "true" : "false");
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
  if (property.GetType() == "JsonObject") {
    element.SetStringValue(newValue);
  } else if (primitiveType == "string" || valueType == "behavior") {
    element.SetStringValue(newValue);
  } else if (primitiveType == "number") {
    if (IsExactStaticDataPlaceholderValue(newValue)) {
      element.SetStringValue(newValue);
    } else {
      element.SetDoubleValue(GetNumberPropertyValue(newValue));
    }
  } else if (primitiveType == "boolean") {
    if (IsExactStaticDataPlaceholderValue(newValue)) {
      element.SetStringValue(newValue);
    } else {
      element.SetBoolValue(GetBooleanPropertyValue(newValue));
    }
  }

  return true;
}

bool CustomConfigurationHelper::RenameProperty(
    const gd::PropertiesContainer &properties,
    gd::SerializerElement &configurationContent, const gd::String &oldName,
    const gd::String &newName) {
  if (!configurationContent.HasChild(oldName)) {
    return false;
  }
  auto &oldElement = configurationContent.GetChild(oldName);
  auto &newElement = configurationContent.AddChild(newName);
  newElement = oldElement;
  configurationContent.RemoveChild(oldName);
  return true;
}
