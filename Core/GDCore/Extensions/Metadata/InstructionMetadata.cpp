/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "InstructionMetadata.h"

#include <algorithm>

#include "GDCore/CommonTools.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "ParameterMetadata.h"

namespace gd {
InstructionMetadata::InstructionMetadata()
    : sentence("Unknown or unsupported instruction"),  // Avoid translating this
                                                       // string, so that it's
                                                       // safe and *fast* to use
                                                       // a InstructionMetadata.
      canHaveSubInstructions(false),
      hidden(true),
      usageComplexity(5),
      isAsync(false),
      isPrivate(false),
      isObjectInstruction(false),
      isBehaviorInstruction(false) {}

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
      usageComplexity(5),
      isAsync(false),
      isPrivate(false),
      isObjectInstruction(false),
      isBehaviorInstruction(false) {}

InstructionMetadata& InstructionMetadata::AddParameter(
    const gd::String& type,
    const gd::String& description,
    const gd::String& supplementaryInformation,
    bool parameterIsOptional) {
  ParameterMetadata info;
  info.type = type;
  info.description = description;
  info.codeOnly = false;
  info.optional = parameterIsOptional;
  info.supplementaryInformation =
      // For objects/behavior, the supplementary information
      // parameter is an object/behavior type...
      (gd::ParameterMetadata::IsObject(type) ||
       gd::ParameterMetadata::IsBehavior(type))
          ? (supplementaryInformation.empty()
                 ? ""
                 : extensionNamespace +
                       supplementaryInformation  //... so prefix it with the
                                                 // extension
                                                 // namespace.
             )
          : supplementaryInformation;  // Otherwise don't change anything

  // TODO: Assert against supplementaryInformation === "emsc" (when running with
  // Emscripten), and warn about a missing argument when calling addParameter.

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

InstructionMetadata& InstructionMetadata::UseStandardOperatorParameters(
    const gd::String& type) {
  SetManipulatedType(type);

  if (type == "boolean") {
    AddParameter("yesorno", _("New value"));
    size_t valueParamIndex = parameters.size() - 1;

    if (isObjectInstruction || isBehaviorInstruction) {
      gd::String templateSentence = _("Set _PARAM0_ as <subject>: <value>");

      sentence =
          templateSentence
              .FindAndReplace("<subject>", sentence)
              .FindAndReplace("<value>",
                              "_PARAM" + gd::String::From(valueParamIndex) + "_");
    } else {
      gd::String templateSentence = _("Change <subject>: <value>");

      sentence =
          templateSentence
              .FindAndReplace("<subject>", sentence)
              .FindAndReplace("<value>",
                              "_PARAM" + gd::String::From(valueParamIndex) + "_");
    }
  } else {
    AddParameter("operator", _("Modification's sign"), type);
    AddParameter(type == "number" ? "expression" : type, _("Value"));

    size_t operatorParamIndex = parameters.size() - 2;
    size_t valueParamIndex = parameters.size() - 1;

    if (isObjectInstruction || isBehaviorInstruction) {
      gd::String templateSentence = _("Change <subject> of _PARAM0_: <operator> <value>");

      sentence =
          templateSentence.FindAndReplace("<subject>", sentence)
              .FindAndReplace(
                  "<operator>",
                  "_PARAM" + gd::String::From(operatorParamIndex) + "_")
              .FindAndReplace("<value>",
                              "_PARAM" + gd::String::From(valueParamIndex) + "_");
    } else {
      gd::String templateSentence = _("Change <subject>: <operator> <value>");

      sentence =
          templateSentence.FindAndReplace("<subject>", sentence)
              .FindAndReplace(
                  "<operator>",
                  "_PARAM" + gd::String::From(operatorParamIndex) + "_")
              .FindAndReplace("<value>",
                              "_PARAM" + gd::String::From(valueParamIndex) + "_");
    }
  }

  return *this;
}

InstructionMetadata&
InstructionMetadata::UseStandardRelationalOperatorParameters(
    const gd::String& type) {
  SetManipulatedType(type);

  if (type == "boolean") {
    if (isObjectInstruction || isBehaviorInstruction) {
      gd::String templateSentence = _("_PARAM0_ is <subject>");

      sentence =
          templateSentence
              .FindAndReplace("<subject>", sentence);
    } else {
      gd::String templateSentence = _("<subject>");

      sentence =
          templateSentence.FindAndReplace("<subject>", sentence);
    }
  } else {
    AddParameter("relationalOperator", _("Sign of the test"), type);
    AddParameter(type == "number" ? "expression" : type, _("Value to compare"));
    size_t operatorParamIndex = parameters.size() - 2;
    size_t valueParamIndex = parameters.size() - 1;

    if (isObjectInstruction || isBehaviorInstruction) {
      gd::String templateSentence = _("<subject> of _PARAM0_ <operator> <value>");

      sentence =
          templateSentence.FindAndReplace("<subject>", sentence)
              .FindAndReplace(
                  "<operator>",
                  "_PARAM" + gd::String::From(operatorParamIndex) + "_")
              .FindAndReplace("<value>",
                              "_PARAM" + gd::String::From(valueParamIndex) + "_");
    } else {
      gd::String templateSentence = _("<subject> <operator> <value>");

      sentence =
          templateSentence.FindAndReplace("<subject>", sentence)
              .FindAndReplace(
                  "<operator>",
                  "_PARAM" + gd::String::From(operatorParamIndex) + "_")
              .FindAndReplace("<value>",
                              "_PARAM" + gd::String::From(valueParamIndex) + "_");
    }
  }

  return *this;
}

InstructionMetadata& InstructionMetadata::SetRequiresBaseObjectCapability(
    const gd::String& capability) {
  if (!IsObjectInstruction() && !IsBehaviorInstruction()) {
    gd::LogError("Tried to add capability \"" + capability +
                 "\" to instruction named \"" + fullname +
                 "\", which is not an object or behavior instruction.");
    return *this;
  }

  requiredBaseObjectCapability = capability;
  return *this;
}

}  // namespace gd
