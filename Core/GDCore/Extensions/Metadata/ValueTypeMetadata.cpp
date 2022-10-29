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

const gd::String &ValueTypeMetadata::GetPrimitiveValueType(const gd::String &parameterType) {
  if (parameterType == "number" || gd::ValueTypeMetadata::IsTypeExpression("number", parameterType)) {
    return ValueTypeMetadata::numberType;
  }
  if (parameterType == "string" || gd::ValueTypeMetadata::IsTypeExpression("string", parameterType)) {
    return ValueTypeMetadata::stringType;
  }
  return parameterType;
}

}  // namespace gd
