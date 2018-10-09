/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h>
#include <wx/file.h>
#endif
#include <algorithm>
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "InstructionMetadata.h"

namespace gd {
InstructionMetadata::InstructionMetadata()
    : sentence(_("Unknown or unsupported instruction")),
      canHaveSubInstructions(false),
      hidden(true) {}

InstructionMetadata::InstructionMetadata(const gd::String& extensionNamespace_,
                                         const gd::String& name_,
                                         const gd::String& fullname_,
                                         const gd::String& description_,
                                         const gd::String& sentence_,
                                         const gd::String& group_,
                                         const gd::String& icon_,
                                         const gd::String& smallIcon_)
    : fullname(fullname_),
      description(description_),
      helpPath(""),
      sentence(sentence_),
      group(group_),
      iconFilename(icon_),
      smallIconFilename(smallIcon_),
      canHaveSubInstructions(false),
      extensionNamespace(extensionNamespace_),
      hidden(false),
      usageComplexity(5) {
#if !defined(GD_NO_WX_GUI)
  if (wxFile::Exists(icon_)) {
    icon = wxBitmap(icon_, wxBITMAP_TYPE_ANY);
  } else {
    icon = wxBitmap(24, 24);
  }
  if (wxFile::Exists(smallIcon_)) {
    smallicon = wxBitmap(smallIcon_, wxBITMAP_TYPE_ANY);
  } else {
    smallicon = wxBitmap(16, 16);
  }
#endif
}

ParameterMetadata::ParameterMetadata() : optional(false), codeOnly(false) {}

InstructionMetadata& InstructionMetadata::AddParameter(
    const gd::String& type,
    const gd::String& description,
    const gd::String& optionalObjectType,
    bool parameterIsOptional) {
  ParameterMetadata info;
  info.type = type;
  info.description = description;
  info.codeOnly = false;
  info.optional = parameterIsOptional;
  info.supplementaryInformation =
      optionalObjectType.empty() ? "" : extensionNamespace + optionalObjectType;

  parameters.push_back(info);
  return *this;
}

InstructionMetadata& InstructionMetadata::AddCodeOnlyParameter(
    const gd::String& type, const gd::String& supplementaryInformation) {
  ParameterMetadata info;
  info.type = type;
  info.codeOnly = true;
  info.supplementaryInformation = supplementaryInformation;

  parameters.push_back(info);
  return *this;
}

void ParameterMetadata::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("type", type);
  element.SetAttribute("supplementaryInformation", supplementaryInformation);
  element.SetAttribute("optional", optional);
  element.SetAttribute("description", description);
  element.SetAttribute("codeOnly", codeOnly);
  element.SetAttribute("defaultValue", defaultValue);
  element.SetAttribute("name", name);
}

void ParameterMetadata::UnserializeFrom(const SerializerElement& element) {
  type = element.GetStringAttribute("type");
  supplementaryInformation = element.GetStringAttribute("supplementaryInformation");
  optional = element.GetBoolAttribute("optional");
  description = element.GetStringAttribute("description");
  codeOnly = element.GetBoolAttribute("codeOnly");
  defaultValue = element.GetStringAttribute("defaultValue");
  name = element.GetStringAttribute("name");
}
}  // namespace gd
