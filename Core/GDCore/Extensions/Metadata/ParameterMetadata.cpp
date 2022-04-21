/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ParameterMetadata.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

ParameterMetadata::ParameterMetadata() : optional(false), codeOnly(false), usageComplexity(5) {}

void ParameterMetadata::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("type", type);
  element.SetAttribute("supplementaryInformation", supplementaryInformation);
  element.SetAttribute("optional", optional);
  element.SetAttribute("description", description);
  element.SetAttribute("longDescription", longDescription);
  element.SetAttribute("codeOnly", codeOnly);
  element.SetAttribute("defaultValue", defaultValue);
  element.SetAttribute("name", name);
  element.SetAttribute("usageComplexity", usageComplexity);
}

void ParameterMetadata::UnserializeFrom(const SerializerElement& element) {
  type = element.GetStringAttribute("type");
  supplementaryInformation =
      element.GetStringAttribute("supplementaryInformation");
  optional = element.GetBoolAttribute("optional");
  description = element.GetStringAttribute("description");
  longDescription = element.GetStringAttribute("longDescription");
  codeOnly = element.GetBoolAttribute("codeOnly");
  defaultValue = element.GetStringAttribute("defaultValue");
  name = element.GetStringAttribute("name");
  usageComplexity = element.GetIntAttribute("usageComplexity");
}

}  // namespace gd
