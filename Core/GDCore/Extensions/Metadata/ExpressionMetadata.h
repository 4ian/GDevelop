/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EXPRESSIONMETADATA_H
#define EXPRESSIONMETADATA_H
#if defined(GD_IDE_ONLY)
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

  /**
   * \brief Set the function name which will be used when generating the code.
   * \param functionName the name of the function to call
   */
  ExpressionCodeGenerationInformation& SetFunctionName(
      const gd::String& functionName) {
    functionCallName = functionName;
    return *this;
  }

  /**
   * \brief Set that the function is static
   */
  ExpressionCodeGenerationInformation& SetStatic() {
    staticFunction = true;
    return *this;
  }

  /**
   * \brief Erase any existing include file and add the specified include.
   */
  ExpressionCodeGenerationInformation& SetIncludeFile(
      const gd::String& includeFile) {
    includeFiles.clear();
    includeFiles.push_back(includeFile);
    return *this;
  }

  /**
   * \brief Add a file to the already existing include files.
   */
  ExpressionCodeGenerationInformation& AddIncludeFile(
      const gd::String& includeFile) {
    if (std::find(includeFiles.begin(), includeFiles.end(), includeFile) ==
        includeFiles.end())
      includeFiles.push_back(includeFile);

    return *this;
  }

  /**
   * \brief Get the files that must be included to use the instruction.
   */
  const std::vector<gd::String>& GetIncludeFiles() const {
    return includeFiles;
  };

  /**
   * \brief Set that the function must be generated using a custom code
   * generator.
   */
  ExpressionCodeGenerationInformation& SetCustomCodeGenerator(
      std::function<gd::String(const std::vector<gd::Expression>& parameters,
                               gd::EventsCodeGenerator& codeGenerator,
                               gd::EventsCodeGenerationContext& context)>
          codeGenerator) {
    hasCustomCodeGenerator = true;
    customCodeGenerator = codeGenerator;
    return *this;
  }

  ExpressionCodeGenerationInformation& RemoveCustomCodeGenerator() {
    hasCustomCodeGenerator = false;
    std::function<gd::String(const std::vector<gd::Expression>& parameters,
                             gd::EventsCodeGenerator& codeGenerator,
                             gd::EventsCodeGenerationContext& context)>
        emptyFunction;
    customCodeGenerator = emptyFunction;
    return *this;
  }

  bool HasCustomCodeGenerator() const { return hasCustomCodeGenerator; }

  bool staticFunction;
  gd::String functionCallName;
  bool hasCustomCodeGenerator;
  std::function<gd::String(const std::vector<gd::Expression>& parameters,
                           gd::EventsCodeGenerator& codeGenerator,
                           gd::EventsCodeGenerationContext& context)>
      customCodeGenerator;

 private:
  std::vector<gd::String> includeFiles;
};

/**
 * \brief Describe user-friendly information about an expression, its parameters
 * and the function name as well as other information for code generation.
 *
 * \ingroup Events
 */
class GD_CORE_API ExpressionMetadata {
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
      : returnType("unknown"), shown(false), isPrivate(false){};

  virtual ~ExpressionMetadata(){};

  /**
   * \brief Set the expression as not shown in the IDE.
   */
  ExpressionMetadata& SetHidden();

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
  ExpressionMetadata& SetPrivate() {
    isPrivate = true;
    return *this;
  }

  /**
   * \see gd::InstructionMetadata::AddParameter
   */
  gd::ExpressionMetadata& AddParameter(
      const gd::String& type,
      const gd::String& description,
      const gd::String& supplementaryInformation = "",
      bool parameterIsOptional = false);

  /**
   * \see gd::InstructionMetadata::AddCodeOnlyParameter
   */
  gd::ExpressionMetadata& AddCodeOnlyParameter(
      const gd::String& type, const gd::String& supplementaryInformation);

  /**
   * Set the default value used in editor (or if an optional parameter is empty
   * during code generation) for the latest added parameter.
   *
   * \see AddParameter
   */
  ExpressionMetadata& SetDefaultValue(gd::String defaultValue_) {
    if (!parameters.empty()) parameters.back().SetDefaultValue(defaultValue_);
    return *this;
  };

  /**
   * \brief Set the long description shown in the editor for the last added
   * parameter.
   *
   * \see AddParameter
   */
  ExpressionMetadata& SetParameterLongDescription(gd::String longDescription) {
    if (!parameters.empty())
      parameters.back().SetLongDescription(longDescription);
    return *this;
  };

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

  /**
   * \brief Set the function that should be called when generating the source
   * code from events.
   * \param functionName the name of the function to call
   * \note Shortcut for `codeExtraInformation.SetFunctionName`.
   */
  ExpressionCodeGenerationInformation& SetFunctionName(
      const gd::String& functionName) {
    return codeExtraInformation.SetFunctionName(functionName);
  }

  /**
   * \brief Return the structure containing the information about code
   * generation for the expression.
   */
  ExpressionCodeGenerationInformation& GetCodeExtraInformation() {
    return codeExtraInformation;
  };

  ExpressionCodeGenerationInformation codeExtraInformation;

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
};

}  // namespace gd

#endif
#endif  // EXPRESSIONMETADATA_H
