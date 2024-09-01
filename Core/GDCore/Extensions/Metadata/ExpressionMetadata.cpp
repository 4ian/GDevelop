/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ExpressionMetadata.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/String.h"

namespace gd {

ExpressionMetadata::ExpressionMetadata(const gd::String& returnType_,
  const gd::String& extensionNamespace_,
                                       const gd::String& name_,
                                       const gd::String& fullname_,
                                       const gd::String& description_,
                                       const gd::String& group_,
                                       const gd::String& smallicon_)
    : returnType(returnType_),
      fullname(fullname_),
      description(description_),
      group(group_),
      shown(true),
      smallIconFilename(smallicon_),
      extensionNamespace(extensionNamespace_),
      isPrivate(false),
      relevantContext("Any") {
}

ExpressionMetadata& ExpressionMetadata::SetHidden() {
  shown = false;
  return *this;
}

gd::ExpressionMetadata& ExpressionMetadata::AddParameter(
    const gd::String& type,
    const gd::String& description,
    const gd::String& supplementaryInformation,
    bool parameterIsOptional) {
  parameters.AddNewParameter("")
  .SetType(type)
  .SetDescription(description)
  .SetCodeOnly(false)
  .SetOptional(parameterIsOptional)
  .SetExtraInfo(
      // For objects/behavior, the supplementary information
      // parameter is an object/behavior type...
      ((gd::ParameterMetadata::IsObject(type) ||
        gd::ParameterMetadata::IsBehavior(type))
               // Prefix with the namespace if it's not already there.
               && (supplementaryInformation.find(
                       PlatformExtension::GetNamespaceSeparator()) == gd::String::npos)
           ? (supplementaryInformation.empty()
                  ? ""
                  : extensionNamespace + supplementaryInformation)
           : supplementaryInformation));

  // TODO: Assert against supplementaryInformation === "emsc" (when running with
  // Emscripten), and warn about a missing argument when calling addParameter.

  return *this;
}

gd::ExpressionMetadata &ExpressionMetadata::AddCodeOnlyParameter(
    const gd::String &type, const gd::String &supplementaryInformation) {
  parameters.AddNewParameter("").SetType(type).SetCodeOnly().SetExtraInfo(
      supplementaryInformation);
  return *this;
}

gd::ExpressionMetadata& ExpressionMetadata::SetRequiresBaseObjectCapability(
    const gd::String& capability) {
  requiredBaseObjectCapability = capability;
  return *this;
}

}  // namespace gd
