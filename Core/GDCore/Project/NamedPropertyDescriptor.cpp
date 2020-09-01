/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "NamedPropertyDescriptor.h"
#include <vector>
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"

namespace gd {

NamedPropertyDescriptor::~NamedPropertyDescriptor() {}

void NamedPropertyDescriptor::SerializeTo(SerializerElement& element) const {
  PropertyDescriptor::SerializeTo(element);
  element.AddChild("name").SetStringValue(name);
}

void NamedPropertyDescriptor::UnserializeFrom(
    const SerializerElement& element) {
  PropertyDescriptor::UnserializeFrom(element);
  name = element.GetChild("name").GetStringValue();
}

void NamedPropertyDescriptor::SerializeValuesTo(SerializerElement& element) const {
  PropertyDescriptor::SerializeValuesTo(element);
  element.AddChild("name").SetStringValue(name);
}

void NamedPropertyDescriptor::UnserializeValuesFrom(const SerializerElement& element) {
  PropertyDescriptor::UnserializeValuesFrom(element);
  name = element.GetChild("name").GetStringValue();
}

}  // namespace gd
