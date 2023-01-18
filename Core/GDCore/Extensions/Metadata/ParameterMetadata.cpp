/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ParameterMetadata.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

ParameterMetadata::ParameterMetadata() : codeOnly(false) {}

void ParameterMetadata::SerializeTo(SerializerElement& element) const {
  valueTypeMetadata.SerializeTo(element);
  element.SetAttribute("description", description);
  if (!longDescription.empty()) {
    element.SetAttribute("longDescription", longDescription);
  }
  if (codeOnly) {
   element.SetAttribute("codeOnly", codeOnly);
  }
  element.SetAttribute("name", name);
}

void ParameterMetadata::UnserializeFrom(const SerializerElement& element) {
  valueTypeMetadata.UnserializeFrom(element);
  description = element.GetStringAttribute("description");
  longDescription = element.GetStringAttribute("longDescription");
  codeOnly = element.GetBoolAttribute("codeOnly");
  name = element.GetStringAttribute("name");
}

}  // namespace gd
