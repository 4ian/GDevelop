/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ValueTypeMetadata.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

ValueTypeMetadata::ValueTypeMetadata() : optional(false) {}

void ValueTypeMetadata::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("type", name);
  if (!supplementaryInformation.empty()) {
    element.SetAttribute("supplementaryInformation", supplementaryInformation);
  }
  if (optional) {
    element.SetAttribute("optional", optional);
  }
  if (!defaultValue.empty()) {
    element.SetAttribute("defaultValue", defaultValue);
  }
}

void ValueTypeMetadata::UnserializeFrom(const SerializerElement& element) {
  name = element.GetStringAttribute("type");
  supplementaryInformation =
      element.GetStringAttribute("supplementaryInformation");
  optional = element.GetBoolAttribute("optional");
  defaultValue = element.GetStringAttribute("defaultValue");
}

const gd::String ValueTypeMetadata::numberType = "number";
const gd::String ValueTypeMetadata::stringType = "string";
const gd::String ValueTypeMetadata::variableType = "variable";
const gd::String ValueTypeMetadata::booleanType = "boolean";

const gd::String &ValueTypeMetadata::GetExpressionPrimitiveValueType(
    const gd::String &parameterType) {
  if (parameterType == "number" ||
      gd::ValueTypeMetadata::IsTypeExpression("number", parameterType)) {
    return ValueTypeMetadata::numberType;
  }
  if (parameterType == "string" ||
      gd::ValueTypeMetadata::IsTypeExpression("string", parameterType)) {
    return ValueTypeMetadata::stringType;
  }
  return parameterType;
}

const gd::String &
ValueTypeMetadata::GetPrimitiveValueType(const gd::String &parameterType) {
  if (parameterType == "number" ||
      gd::ValueTypeMetadata::IsTypeValue("number", parameterType)) {
    return ValueTypeMetadata::numberType;
  }
  if (parameterType == "string" ||
      gd::ValueTypeMetadata::IsTypeValue("string", parameterType)) {
    return ValueTypeMetadata::stringType;
  }
  if (parameterType == "variable" ||
      gd::ValueTypeMetadata::IsTypeValue("variable", parameterType)) {
    return ValueTypeMetadata::variableType;
  }
  if (parameterType == "boolean" ||
      gd::ValueTypeMetadata::IsTypeValue("boolean", parameterType)) {
    return ValueTypeMetadata::booleanType;
  }
  return parameterType;
}

const gd::String ValueTypeMetadata::numberValueType = "number";
const gd::String ValueTypeMetadata::booleanValueType = "boolean";
const gd::String ValueTypeMetadata::stringValueType = "string";
const gd::String ValueTypeMetadata::colorValueType = "color";
const gd::String ValueTypeMetadata::choiceValueType = "stringWithSelector";
const gd::String ValueTypeMetadata::behaviorValueType = "behavior";
const gd::String ValueTypeMetadata::leaderboardIdValueType = "leaderboardId";
const gd::String ValueTypeMetadata::objectAnimationNameValueType = "objectAnimationName";
const gd::String ValueTypeMetadata::keyboardKeyValueType = "keyboardKey";

const gd::String &ValueTypeMetadata::ConvertPropertyTypeToValueType(
    const gd::String &propertyType) {
  if (propertyType == "Number") {
    return numberValueType;
  } else if (propertyType == "Boolean") {
    return booleanValueType;
  } else if (propertyType == "Color") {
    return colorValueType;
  } else if (propertyType == "Choice") {
    return choiceValueType;
  } else if (propertyType == "Behavior") {
    return behaviorValueType;
  } else if (propertyType == "LeaderboardId") {
    return leaderboardIdValueType;
  } else if (propertyType == "ObjectAnimationName") {
    return objectAnimationNameValueType;
  } else if (propertyType == "KeyboardKey") {
    return keyboardKeyValueType;
  }
  // For "String", "Resource" or default
  return stringValueType;
};

}  // namespace gd
