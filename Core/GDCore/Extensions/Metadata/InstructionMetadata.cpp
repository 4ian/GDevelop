/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "InstructionMetadata.h"

#include <algorithm>

#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/PlatformExtension.h"
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
      isPrivate(false),
      isObjectInstruction(false),
      isBehaviorInstruction(false),
      relevantContext("Any") {}

InstructionMetadata& InstructionMetadata::AddParameter(
    const gd::String& type,
    const gd::String& description,
    const gd::String& supplementaryInformation,
    bool parameterIsOptional) {
  ParameterMetadata info;
  info.SetType(type);
  info.description = description;
  info.codeOnly = false;
  info.SetOptional(parameterIsOptional);
  info.SetExtraInfo(
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

  parameters.push_back(info);
  return *this;
}

InstructionMetadata& InstructionMetadata::AddCodeOnlyParameter(
    const gd::String& type, const gd::String& supplementaryInformation) {
  ParameterMetadata info;
  info.SetType(type);
  info.codeOnly = true;
  info.SetExtraInfo(supplementaryInformation);

  parameters.push_back(info);
  return *this;
}

InstructionMetadata& InstructionMetadata::UseStandardOperatorParameters(
    const gd::String& type, const ParameterOptions &options) {
  const gd::String& expressionValueType =
      gd::ValueTypeMetadata::GetPrimitiveValueType(type);
  SetManipulatedType(expressionValueType);

  if (type == "boolean") {
    AddParameter(
        "yesorno",
        options.description.empty() ? _("New value") : options.description);
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
    AddParameter("operator", _("Modification's sign"), expressionValueType);
    AddParameter(type,
                 options.description.empty() ? _("Value") : options.description,
                 options.typeExtraInfo);

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
    const gd::String& type, const ParameterOptions &options) {
  const gd::String& expressionValueType =
      gd::ValueTypeMetadata::GetPrimitiveValueType(type);
  SetManipulatedType(expressionValueType);

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
    AddParameter("relationalOperator", _("Sign of the test"), expressionValueType);
    AddParameter(type,
                 options.description.empty() ? _("Value to compare") : options.description,
                 options.typeExtraInfo);
    size_t operatorParamIndex = parameters.size() - 2;
    size_t valueParamIndex = parameters.size() - 1;

    if (isObjectInstruction || isBehaviorInstruction) {
      gd::String templateSentence = _("<subject> of _PARAM0_ <operator> <value>");

      sentence =
          templateSentence.FindAndReplace("<subject>", sentence.CapitalizeFirstLetter())
              .FindAndReplace(
                  "<operator>",
                  "_PARAM" + gd::String::From(operatorParamIndex) + "_")
              .FindAndReplace("<value>",
                              "_PARAM" + gd::String::From(valueParamIndex) + "_");
    } else {
      gd::String templateSentence = _("<subject> <operator> <value>");

      sentence =
          templateSentence.FindAndReplace("<subject>", sentence.CapitalizeFirstLetter())
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
