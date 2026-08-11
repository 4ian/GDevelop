/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <vector>

#include "GDCore/Project/NamedPropertyDescriptor.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Serialization/SerializerValue.h"

namespace gd {
namespace JsonObjectPropertyTools {

inline void ConvertSerializerElementToVariable(
    const gd::SerializerElement& element,
    gd::Variable& variable) {
  if (!element.IsValueUndefined()) {
    const gd::SerializerValue& value = element.GetValue();
    if (value.IsBoolean()) {
      variable.SetBool(value.GetBool());
    } else if (value.IsString()) {
      variable.SetString(value.GetRawString());
    } else {
      variable.SetValue(value.GetDouble());
    }
    return;
  }

  if (element.ConsideredAsArray()) {
    variable.CastTo(gd::Variable::Array);
    for (const auto& child : element.GetAllChildren()) {
      gd::Variable& childVariable = variable.PushNew();
      ConvertSerializerElementToVariable(*child.second, childVariable);
    }
    return;
  }

  variable.CastTo(gd::Variable::Structure);
  for (const auto& child : element.GetAllChildren()) {
    gd::Variable& childVariable = variable.GetChild(child.first);
    ConvertSerializerElementToVariable(*child.second, childVariable);
  }
}

inline gd::Variable ParseJsonExampleAsVariable(const gd::String& jsonExample) {
  gd::Variable variable;
  variable.CastTo(gd::Variable::Structure);

  gd::String trimmedJsonExample = jsonExample;
  if (trimmedJsonExample.Trim().empty()) {
    return variable;
  }

  gd::SerializerElement element = gd::Serializer::FromJSON(jsonExample);
  ConvertSerializerElementToVariable(element, variable);
  return variable;
}

inline gd::Variable ParseJsonExampleAsVariable(
    const gd::NamedPropertyDescriptor& property) {
  return ParseJsonExampleAsVariable(property.GetValue());
}

inline const gd::Variable* GetChildIfDefined(const gd::Variable& variable,
                                             const gd::String& childName) {
  if (variable.GetType() != gd::Variable::Structure ||
      !variable.HasChild(childName)) {
    return nullptr;
  }

  return &variable.GetChild(childName);
}

inline const gd::Variable* GetChildAtPath(
    const gd::Variable& rootVariable,
    const std::vector<gd::String>& childPath) {
  const gd::Variable* currentVariable = &rootVariable;
  for (const gd::String& childName : childPath) {
    currentVariable = GetChildIfDefined(*currentVariable, childName);
    if (!currentVariable) {
      return nullptr;
    }
  }

  return currentVariable;
}

}  // namespace JsonObjectPropertyTools
}  // namespace gd
