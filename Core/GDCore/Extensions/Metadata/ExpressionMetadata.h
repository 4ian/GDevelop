/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "AbstractFunctionMetadata.h"

#include <functional>
#include <memory>

#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/String.h"
namespace gd {
class Layout;
}

namespace gd {
/**
 * \brief Information about how generate code for an expression
 */
class ExpressionCodeGenerationInformation {
 public:
  ExpressionCodeGenerationInformation()
      : staticFunction(false), hasCustomCodeGenerator(false){};
  virtual ~ExpressionCodeGenerationInformation(){};

  // TODO Move these attributes to ExpressionMetadata.
  bool staticFunction;
  gd::String functionCallName;
  bool hasCustomCodeGenerator;
  std::function<gd::String(const std::vector<gd::Expression>& parameters,
                           gd::EventsCodeGenerator& codeGenerator,
                           gd::EventsCodeGenerationContext& context)>
      customCodeGenerator;
  std::vector<gd::String> includeFiles;
};

/**
 * \brief Describe user-friendly information about an expression, its parameters
 * and the function name as well as other information for code generation.
 *
 * \ingroup Events
 */
class GD_CORE_API ExpressionMetadata : public gd::AbstractFunctionMetadata {
 public:
  /**
   * Construct a new expression metadata.
   */
  ExpressionMetadata(const gd::String& returnType,
                     const gd::String& extensionNamespace,
                     const gd::String& name,
                     const gd::String& fullname,
                     const gd::String& description,
                     const gd::String& group,
                     const gd::String& smallicon);

  /**
   * Construct an empty ExpressionMetadata.
   * \warning Don't use this - only here to construct a "bad" ExpressionData and
   * to fulfill std::map requirements.
   */
  ExpressionMetadata()
      : returnType("unknown"), shown(false), isPrivate(false), relevantContext("Any"){};

  virtual ~ExpressionMetadata(){};

  /**
   * \brief Set the expression as not shown in the IDE.
   */
  ExpressionMetadata& SetHidden() override;

  /**
   * \brief Set the group of the instruction in the IDE.
   */
  ExpressionMetadata& SetGroup(const gd::String& str) {
    group = str;
    return *this;
  }

  /**
   * Get the help path of the expression, relative to the GDevelop documentation
   * root.
   */
  const gd::String& GetHelpPath() const { return helpPath; }

  /**
   * Set the help path of the expression, relative to the GDevelop documentation
   * root.
   */
  ExpressionMetadata& SetHelpPath(const gd::String& path) {
    helpPath = path;
    return *this;
  }

  /**
   * Check if the instruction is private - it can't be used outside of the
   * object/ behavior that it is attached too.
   */
  bool IsPrivate() const { return isPrivate; }

  /**
   * Set that the instruction is private - it can't be used outside of the
   * object/ behavior that it is attached too.
   */
  ExpressionMetadata& SetPrivate() override {
    isPrivate = true;
    return *this;
  }

  /**
   * Check if the instruction can be used in layouts or external events.
   */
  bool IsRelevantForLayoutEvents() const {
    return relevantContext == "Any" || relevantContext == "Layout";
  }

  /**
   * Check if the instruction can be used in function events.
   */
  bool IsRelevantForFunctionEvents() const {
    return relevantContext == "Any" || relevantContext == "Function";
  }

  /**
   * Check if the instruction can be used in asynchronous function events.
   */
  bool IsRelevantForAsynchronousFunctionEvents() const {
    return relevantContext == "Any" || relevantContext == "Function" ||
           relevantContext == "AsynchronousFunction";
  }

  /**
   * Check if the instruction can be used in custom object events.
   */
  bool IsRelevantForCustomObjectEvents() const {
    return relevantContext == "Any" || relevantContext == "Object";
  }

  /**
   * Set that the instruction can be used in layouts or external events.
   */
  ExpressionMetadata &SetRelevantForLayoutEventsOnly() override {
    relevantContext = "Layout";
    return *this;
  }

  /**
   * Set that the instruction can be used in function events.
   */
  ExpressionMetadata &SetRelevantForFunctionEventsOnly() override {
    relevantContext = "Function";
    return *this;
  }

  /**
   * Set that the instruction can be used in asynchronous function events.
   */
  ExpressionMetadata &SetRelevantForAsynchronousFunctionEventsOnly() override {
    relevantContext = "AsynchronousFunction";
    return *this;
  }

  /**
   * Set that the instruction can be used in custom object events.
   */
  ExpressionMetadata &SetRelevantForCustomObjectEventsOnly() override {
    relevantContext = "Object";
    return *this;
  }

  /**
   * \see gd::InstructionMetadata::AddParameter
   */
  gd::ExpressionMetadata &
  AddParameter(const gd::String &type, const gd::String &label,
               const gd::String &supplementaryInformation = "",
               bool parameterIsOptional = false) override;

  /**
   * \see gd::InstructionMetadata::AddCodeOnlyParameter
   */
  gd::ExpressionMetadata &
  AddCodeOnlyParameter(const gd::String &type,
                       const gd::String &supplementaryInformation) override;

  /**
   * Set the default value used in editor (or if an optional parameter is empty
   * during code generation) for the latest added parameter.
   *
   * \see AddParameter
   */
  ExpressionMetadata &SetDefaultValue(const gd::String &defaultValue) override {
    if (!parameters.empty())
      parameters.back().SetDefaultValue(defaultValue);
    return *this;
  };

  /**
   * \brief Set the long description shown in the editor for the last added
   * parameter.
   *
   * \see AddParameter
   */
  ExpressionMetadata &
  SetParameterLongDescription(const gd::String &longDescription) override {
    if (!parameters.empty())
      parameters.back().SetLongDescription(longDescription);
    return *this;
  };

  /**
   * \brief Set the additional information, used for some parameters
   * with special type (for example, it can contains the type of object accepted
   * by the parameter), for the last added parameter.
   *
   * \see AddParameter
   */
  ExpressionMetadata &SetParameterExtraInfo(
      const gd::String &extraInfo) override {
    if (!parameters.empty()) parameters.back().SetExtraInfo(extraInfo);
    return *this;
  }

  /**
   * \brief Mark this (object) expression as requiring the specified capability,
   * offered by the base object.
   * This is useful for some objects that don't support this capability, so that
   * the editor can hide the expression as it does not apply to them.
   */
  ExpressionMetadata& SetRequiresBaseObjectCapability(
      const gd::String& capability);

  /**
   * \brief Get the required specified capability for this (object) expression,
   * or an empty string if there is nothing specific required.
   */
  const gd::String& GetRequiredBaseObjectCapability() const {
    return requiredBaseObjectCapability;
  };

  bool IsShown() const { return shown; }
  const gd::String& GetReturnType() const { return returnType; }
  const gd::String& GetFullName() const { return fullname; }
  const gd::String& GetDescription() const { return description; }
  const gd::String& GetGroup() const { return group; }
  const gd::String& GetSmallIconFilename() const { return smallIconFilename; }
  const gd::ParameterMetadata& GetParameter(std::size_t id) const {
    return parameters[id];
  };
  gd::ParameterMetadata& GetParameter(std::size_t id) {
    return parameters[id];
  };
  std::size_t GetParametersCount() const { return parameters.size(); };
  const std::vector<gd::ParameterMetadata>& GetParameters() const {
    return parameters;
  };

  std::vector<gd::ParameterMetadata> parameters;

  
  /**
   * \brief Set the function name which will be used when generating the code.
   * \param functionName the name of the function to call
   */
  ExpressionMetadata& SetFunctionName(
      const gd::String& functionName) override {
    codeExtraInformation.functionCallName = functionName;
    return *this;
  }


  /**
   * \brief Return the name of the function which will be called in the generated code.
   */
  const gd::String &GetFunctionName() {
    return codeExtraInformation.functionCallName;
  }
  /**
   * \brief Set that the function is static
   */
  ExpressionMetadata& SetStatic() {
    codeExtraInformation.staticFunction = true;
    return *this;
  }

  /**
   * \brief Erase any existing include file and add the specified include.
   * \deprecated Use `AddIncludeFile` instead as clearing the list is more
   * error prone.
   */
  ExpressionMetadata& SetIncludeFile(
      const gd::String& includeFile) override {
    codeExtraInformation.includeFiles.clear();
    codeExtraInformation.includeFiles.push_back(includeFile);
    return *this;
  }

  /**
   * \brief Add a file to the already existing include files.
   */
  ExpressionMetadata& AddIncludeFile(
      const gd::String& includeFile) override {
    if (std::find(codeExtraInformation.includeFiles.begin(), codeExtraInformation.includeFiles.end(), includeFile) ==
        codeExtraInformation.includeFiles.end())
      codeExtraInformation.includeFiles.push_back(includeFile);

    return *this;
  }

  /**
   * \brief Get the files that must be included to use the instruction.
   */
  const std::vector<gd::String>& GetIncludeFiles() const override {
    return codeExtraInformation.includeFiles;
  };

  /**
   * \brief Set that the function must be generated using a custom code
   * generator.
   */
  ExpressionMetadata& SetCustomCodeGenerator(
      std::function<gd::String(const std::vector<gd::Expression>& parameters,
                               gd::EventsCodeGenerator& codeGenerator,
                               gd::EventsCodeGenerationContext& context)>
          codeGenerator) {
    codeExtraInformation.hasCustomCodeGenerator = true;
    codeExtraInformation.customCodeGenerator = codeGenerator;
    return *this;
  }

  ExpressionMetadata& RemoveCustomCodeGenerator() {
    codeExtraInformation.hasCustomCodeGenerator = false;
    std::function<gd::String(const std::vector<gd::Expression>& parameters,
                             gd::EventsCodeGenerator& codeGenerator,
                             gd::EventsCodeGenerationContext& context)>
        emptyFunction;
    codeExtraInformation.customCodeGenerator = emptyFunction;
    return *this;
  }

  bool HasCustomCodeGenerator() const { return codeExtraInformation.hasCustomCodeGenerator; }

  /**
   * \brief Return the structure containing the information about code
   * generation for the expression.
   * 
   * \deprecated
   */
  ExpressionMetadata& GetCodeExtraInformation() {
    return *this;
  }

  ExpressionCodeGenerationInformation codeExtraInformation;

 private:
  gd::String returnType;
  gd::String fullname;
  gd::String description;
  gd::String helpPath;
  gd::String group;
  bool shown;

  gd::String smallIconFilename;
  gd::String extensionNamespace;
  bool isPrivate;
  gd::String requiredBaseObjectCapability;
  gd::String relevantContext;
};

}  // namespace gd
