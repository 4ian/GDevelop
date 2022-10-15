/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "PropertyDescriptor.h"

#include <vector>

#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"

namespace gd {

PropertyDescriptor::~PropertyDescriptor() {}

void PropertyDescriptor::SerializeTo(SerializerElement& element) const {
  element.AddChild("value").SetStringValue(currentValue);
  element.AddChild("type").SetStringValue(type);
  element.AddChild("label").SetStringValue(label);
  element.AddChild("description").SetStringValue(description);
  element.AddChild("group").SetStringValue(group);
  SerializerElement& extraInformationElement =
      element.AddChild("extraInformation");
  extraInformationElement.ConsiderAsArray();
  for (const gd::String& information : extraInformation) {
    extraInformationElement.AddChild("").SetStringValue(information);
  }
  element.AddChild("hidden").SetBoolValue(hidden);
}

void PropertyDescriptor::UnserializeFrom(const SerializerElement& element) {
  currentValue = element.GetChild("value").GetStringValue();
  type = element.GetChild("type").GetStringValue();
  label = element.GetChild("label").GetStringValue();
  description = element.GetChild("description").GetStringValue();
  group = element.GetChild("group").GetStringValue();

  extraInformation.clear();
  const SerializerElement& extraInformationElement =
      element.GetChild("extraInformation");
  extraInformationElement.ConsiderAsArray();
  for (std::size_t i = 0; i < extraInformationElement.GetChildrenCount(); ++i)
    extraInformation.push_back(
        extraInformationElement.GetChild(i).GetStringValue());

  hidden = element.HasChild("hidden")
               ? element.GetChild("hidden").GetBoolValue()
               : false;
}

void PropertyDescriptor::SerializeValuesTo(SerializerElement& element) const {
  element.AddChild("value").SetStringValue(currentValue);
  SerializerElement& extraInformationElement =
      element.AddChild("extraInformation");
  extraInformationElement.ConsiderAsArray();
  for (const gd::String& information : extraInformation) {
    extraInformationElement.AddChild("").SetStringValue(information);
  }
}

void PropertyDescriptor::UnserializeValuesFrom(
    const SerializerElement& element) {
  currentValue = element.GetChild("value").GetStringValue();

  extraInformation.clear();
  const SerializerElement& extraInformationElement =
      element.GetChild("extraInformation");
  extraInformationElement.ConsiderAsArray();
  for (std::size_t i = 0; i < extraInformationElement.GetChildrenCount(); ++i)
    extraInformation.push_back(
        extraInformationElement.GetChild(i).GetStringValue());
}

}  // namespace gd
