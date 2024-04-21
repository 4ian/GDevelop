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
  if (type == "Number" && !measurementUnit.IsUndefined()) {
    element.AddChild("unit").SetStringValue(measurementUnit.GetName());
  }
  element.AddChild("label").SetStringValue(label);
  element.AddChild("description").SetStringValue(description);
  element.AddChild("group").SetStringValue(group);
  SerializerElement& extraInformationElement =
      element.AddChild("extraInformation");
  extraInformationElement.ConsiderAsArray();
  for (const gd::String& information : extraInformation) {
    extraInformationElement.AddChild("").SetStringValue(information);
  }
  if (hidden) {
    element.AddChild("hidden").SetBoolValue(hidden);
  }
  if (deprecated) {
    element.AddChild("deprecated").SetBoolValue(deprecated);
  }
  if (advanced) {
    element.AddChild("advanced").SetBoolValue(advanced);
  }
}

void PropertyDescriptor::UnserializeFrom(const SerializerElement& element) {
  currentValue = element.GetChild("value").GetStringValue();
  type = element.GetChild("type").GetStringValue();
  if (type == "Number") {
    gd::String unitName = element.GetChild("unit").GetStringValue();
    measurementUnit =
        gd::MeasurementUnit::HasDefaultMeasurementUnitNamed(unitName)
            ? measurementUnit =
                  gd::MeasurementUnit::GetDefaultMeasurementUnitByName(unitName)
            : gd::MeasurementUnit::GetUndefined();
  }
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
  deprecated = element.HasChild("deprecated")
               ? element.GetChild("deprecated").GetBoolValue()
               : false;
  advanced = element.HasChild("advanced")
               ? element.GetChild("advanced").GetBoolValue()
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
