/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include "AbstractFunctionMetadata.h"

#include <algorithm>
#include <functional>
#include <map>
#include <memory>

#include "GDCore/Events/Instruction.h"
#include "GDCore/String.h"
#include "ParameterMetadata.h"
#include "ParameterOptions.h"

namespace gd {
class Project;
class Layout;
class EventsCodeGenerator;
class EventsCodeGenerationContext;
class SerializerElement;
}  // namespace gd

namespace gd {

/**
 * \brief Describe user-friendly information about an instruction (action or
 * condition), its parameters and the function name as well as other information
 * for code generation.
 *
 * \ingroup Events
 */
class GD_CORE_API InstructionMetadata : public gd::AbstractFunctionMetadata {
 public:
  /**
   * Construct a new instruction metadata.
   */
  InstructionMetadata(const gd::String &extensionNamespace,
                      const gd::String &name,
                      const gd::String &fullname,
                      const gd::String &description,
                      const gd::String &sentence,
                      const gd::String &group,
                      const gd::String &icon,
                      const gd::String &smallIcon);

  /**
   * Construct an empty InstructionMetadata.
   * \warning Don't use this - only here to fullfil std::map requirements.
   */
  InstructionMetadata();

  virtual ~InstructionMetadata(){};

  const gd::String &GetFullName() const { return fullname; }
  const gd::String &GetDescription() const { return description; }
  const gd::String &GetSentence() const { return sentence; }
  const gd::String &GetGroup() const { return group; }
  ParameterMetadata &GetParameter(size_t i) { return parameters[i]; }
  const ParameterMetadata &GetParameter(size_t i) const {
    return parameters[i];
  }
  size_t GetParametersCount() const { return parameters.size(); }
  const std::vector<ParameterMetadata> &GetParameters() const {
    return parameters;
  }
  const gd::String &GetIconFilename() const { return iconFilename; }
  const gd::String &GetSmallIconFilename() const { return smallIconFilename; }
  bool CanHaveSubInstructions() const { return canHaveSubInstructions; }

  /**
   * Get the help path of the instruction, relative to the GDevelop
   * documentation root.
   */
  const gd::String &GetHelpPath() const { return helpPath; }

  /**
   * Set the help path of the instruction, relative to the GDevelop
   * documentation root.
   */
  InstructionMetadata &SetHelpPath(const gd::String &path) {
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
  InstructionMetadata &SetPrivate() override {
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
  InstructionMetadata &SetRelevantForLayoutEventsOnly() override {
    relevantContext = "Layout";
    return *this;
  }

  /**
   * Set that the instruction can be used in function events.
   */
  InstructionMetadata &SetRelevantForFunctionEventsOnly() override {
    relevantContext = "Function";
    return *this;
  }

  /**
   * Set that the instruction can be used in asynchronous function events.
   */
  InstructionMetadata &SetRelevantForAsynchronousFunctionEventsOnly() override {
    relevantContext = "AsynchronousFunction";
    return *this;
  }

  /**
   * Set that the instruction can be used in custom object events.
   */
  InstructionMetadata &SetRelevantForCustomObjectEventsOnly() override {
    relevantContext = "Object";
    return *this;
  }

  /**
   * Check if the instruction is asynchronous - it will be running in the
   * background, executing the instructions following it before the frame after
   * it resolved.
   */
  bool IsAsync() const {
    return !codeExtraInformation.asyncFunctionCallName.empty();
  }

  /**
   * Check if the instruction asynchronicity is optional. If it is, it can
   * either be used synchronously or asynchronously, with one function for each.
   */
  bool IsOptionallyAsync() const {
    return IsAsync() && !codeExtraInformation.functionCallName.empty();
  }

  /**
   * Notify that the instruction can have sub instructions.
   */
  InstructionMetadata &SetCanHaveSubInstructions() {
    canHaveSubInstructions = true;
    return *this;
  }

  /**
   * \brief Set the instruction to be hidden in the IDE.
   *
   * Used mainly when an instruction is deprecated.
   */
  InstructionMetadata &SetHidden() override {
    hidden = true;
    return *this;
  }

  /**
   * \brief Set the group of the instruction in the IDE.
   */
  InstructionMetadata &SetGroup(const gd::String &str) {
    group = str;
    return *this;
  }

  /**
   * \brief Return true if the instruction must be hidden in the IDE.
   */
  bool IsHidden() const { return hidden; }

  /**
   * \brief Add a parameter to the instruction metadata.
   *
   * \param type One of the type handled by GDevelop. This
   * will also determine the type of the argument used when calling the function
   * in the generated code.
   * \param description Description for parameter
   * \param supplementaryInformation Additional information that can be used for
   * rendering or logic. For example:
   * - If type is "object", this argument will describe which objects are
   * allowed. If this argument is empty, all objects are allowed.
   * - If type is "operator", this argument will be used to display only
   * pertinent operators. \param parameterIsOptional true if the parameter must
   * be optional, false otherwise.
   *
   * \see EventsCodeGenerator::GenerateParametersCodes
   */
  InstructionMetadata &AddParameter(
      const gd::String &type,
      const gd::String &label,
      const gd::String &supplementaryInformation = "",
      bool parameterIsOptional = false) override;

  /**
   * \brief Add a parameter not displayed in editor.
   *
   * \param type One of the type handled by GDevelop. This will also determine
   * the type of the argument used when calling the function in the generated
   * code. \param supplementaryInformation Depends on `type`. For example, when
   * `type == "inlineCode"`, the content of supplementaryInformation is inserted
   * in the generated code.
   *
   * \see EventsCodeGenerator::GenerateParametersCodes
   */
  InstructionMetadata &AddCodeOnlyParameter(
      const gd::String &type, const gd::String &supplementaryInformation) override;

  /**
   * \brief Set the default value used in editor (or if an optional parameter is
   * empty during code generation) for the last added parameter.
   *
   * \see AddParameter
   */
  InstructionMetadata &SetDefaultValue(const gd::String &defaultValue_) override {
    if (!parameters.empty()) parameters.back().SetDefaultValue(defaultValue_);
    return *this;
  };

  /**
   * \brief Set the long description shown in the editor for the last added
   * parameter.
   *
   * \see AddParameter
   */
  InstructionMetadata &SetParameterLongDescription(
      const gd::String &longDescription) override {
    if (!parameters.empty())
      parameters.back().SetLongDescription(longDescription);
    return *this;
  }

  /**
   * \brief Set the additional information, used for some parameters
   * with special type (for example, it can contains the type of object accepted
   * by the parameter), for the last added parameter.
   *
   * \see AddParameter
   */
  InstructionMetadata &SetParameterExtraInfo(const gd::String &extraInfo) override {
    if (!parameters.empty()) parameters.back().SetExtraInfo(extraInfo);
    return *this;
  }

  /**
   * \brief Add the default parameters for an instruction manipulating the
   * specified type ("string", "number") with the default operators.
   *
   * \note The type "string" can be declined in several subtypes.
   * \see ParameterMetadata
   */
  InstructionMetadata &UseStandardOperatorParameters(
      const gd::String &type, const ParameterOptions &options);

  /**
   * \brief Add the default parameters for an instruction comparing the
   * specified type ("string", "number") with the default relational operators.
   *
   * \note The type "string" can be declined in several subtypes.
   * \see ParameterMetadata
   */
  InstructionMetadata &UseStandardRelationalOperatorParameters(
      const gd::String &type, const ParameterOptions &options);

  /**
   * \brief Mark the instruction as an object instruction. Automatically called
   * when using `AddAction`/`AddCondition` on an `ObjectMetadata`.
   */
  InstructionMetadata &SetIsObjectInstruction() {
    isObjectInstruction = true;
    return *this;
  }

  /**
   * \brief Mark the instruction as a behavior instruction. Automatically called
   * when using `AddAction`/`AddCondition` on a `BehaviorMetadata`.
   */
  InstructionMetadata &SetIsBehaviorInstruction() {
    isBehaviorInstruction = true;
    return *this;
  }

  /**
   * \brief Check if the instruction is an object instruction.
   */
  bool IsObjectInstruction() const { return isObjectInstruction; }

  /**
   * \brief Check if the instruction is a behavior instruction.
   */
  bool IsBehaviorInstruction() const { return isBehaviorInstruction; }

  /**
   * \brief Mark this (object) instruction as requiring the specified
   * capability, offered by the base object. This is useful for some objects
   * that don't support this capability, so that the editor can hide the
   * instruction as it does not apply to them.
   */
  InstructionMetadata &SetRequiresBaseObjectCapability(
      const gd::String &capability);

  /**
   * \brief Get the required specified capability for this (object) instruction,
   * or an empty string if there is nothing specific required.
   */
  const gd::String &GetRequiredBaseObjectCapability() const {
    return requiredBaseObjectCapability;
  }

  /**
   * \brief Consider that the instruction is easy for a user to understand.
   */
  InstructionMetadata &MarkAsSimple() {
    usageComplexity = 2;
    return *this;
  }

  /**
   * \brief Consider that the instruction is harder for a user to understand
   * than a normal instruction.
   */
  InstructionMetadata &MarkAsAdvanced() {
    usageComplexity = 7;
    return *this;
  }

  /**
   * \brief Consider that the instruction is complex for a user to understand.
   */
  InstructionMetadata &MarkAsComplex() {
    usageComplexity = 9;
    return *this;
  }

  /**
   * \brief Return the usage complexity of this instruction for the user,
   * from 0 (simple&easy to use) to 10 (complex to understand).
   */
  int GetUsageComplexity() const { return usageComplexity; }

  /**
   * \brief Defines information about how generate the code for an instruction
   */
  class ExtraInformation { 
   public:
    enum AccessType { Reference, MutatorAndOrAccessor, Mutators };
    ExtraInformation() : accessType(Reference), hasCustomCodeGenerator(false){};
    virtual ~ExtraInformation(){};

    // TODO Move these attributes to InstructionMetadata.
    gd::String functionCallName;
    gd::String asyncFunctionCallName;
    gd::String type;
    AccessType accessType;
    gd::String optionalAssociatedInstruction;
    std::map<gd::String, gd::String> optionalMutators;
    bool hasCustomCodeGenerator;
    std::function<gd::String(Instruction &instruction,
                              gd::EventsCodeGenerator &codeGenerator,
                              gd::EventsCodeGenerationContext &context)>
        customCodeGenerator;
    std::vector<gd::String> includeFiles;
  };
  ExtraInformation codeExtraInformation;  ///< Information about how generate
                                          ///< code for the instruction

  /**
   * Set the name of the function which will be called in the generated code.
   * \param functionName the name of the function to call.
   */
  InstructionMetadata &SetFunctionName(const gd::String &functionName_) override {
    codeExtraInformation.functionCallName = functionName_;
    return *this;
  }

  /**
   * Set the name of the function, doing asynchronous work, which will be
   * called in the generated code. This function should return an asynchronous
   * task (i.e: `gdjs.AsyncTask` in the JavaScript runtime).
   *
   * \param functionName the name of the function doing asynchronous work to
   * call.
   */
  InstructionMetadata &SetAsyncFunctionName(const gd::String &functionName_) {
    codeExtraInformation.asyncFunctionCallName = functionName_;
    return *this;
  }

  /**
   * Return the name of the function which will be called in the generated code.
   */
  const gd::String &GetFunctionName() {
    return codeExtraInformation.functionCallName;
  }

  /**
   * Return the name of the function, doing asynchronous work, which will be
   * called in the generated code. This function should return an asynchronous
   * task (i.e: `gdjs.AsyncTask` in the JavaScript runtime).
   */
  const gd::String &GetAsyncFunctionName() {
    return codeExtraInformation.asyncFunctionCallName;
  }

/**
 * \brief Declare if the instruction being declared is somewhat manipulating
 * in a standard way.
 * 
 * \param type "number" or "string"
 */
  InstructionMetadata &SetManipulatedType(const gd::String &type_) {
    codeExtraInformation.type = type_;
    return *this;
  }

  /**
   * If InstructionMetadata::ExtraInformation::SetManipulatedType was called
   * with "number" or "string", this function will tell the code generator the
   * name of the getter function used to retrieve the data value.
   *
   * Usage example:
   * \code
   *  obj.AddAction("String",
   *                 _("Change the string"),
   *                 _("Change the string of a text"),
   *                 _("the string"),
   *                 _("Text"),
   *                 "CppPlatform/Extensions/text24.png",
   *                 "CppPlatform/Extensions/text_black.png");
   *
   *      .AddParameter("object", _("Object"), "Text", false)
   *      .AddParameter("operator", _("Modification operator"), "string")
   *      .AddParameter("string", _("String"))
   *      .SetFunctionName("SetString").SetManipulatedType("string").SetGetter("GetString");
   *
   *  DECLARE_END_OBJECT_ACTION()
   * \endcode
   */
  InstructionMetadata &SetGetter(const gd::String &getter) {
    codeExtraInformation.optionalAssociatedInstruction = getter;
    codeExtraInformation.accessType = codeExtraInformation.MutatorAndOrAccessor;
    return *this;
  }

  InstructionMetadata &SetMutators(
      const std::map<gd::String, gd::String> &mutators) {
    codeExtraInformation.optionalMutators = mutators;
    codeExtraInformation.accessType = codeExtraInformation.Mutators;
    return *this;
  }

  /**
   * \brief Erase any existing include file and add the specified include.
   * \deprecated Use `AddIncludeFile` instead as clearing the list is more
   * error prone.
   */
  InstructionMetadata &SetIncludeFile(const gd::String &includeFile) override {
    codeExtraInformation.includeFiles.clear();
    codeExtraInformation.includeFiles.push_back(includeFile);
    return *this;
  }

  /**
   * \brief Add a file to the already existing include files.
   */
  InstructionMetadata &AddIncludeFile(const gd::String &includeFile) override {
    if (std::find(codeExtraInformation.includeFiles.begin(), codeExtraInformation.includeFiles.end(), includeFile) ==
        codeExtraInformation.includeFiles.end())
      codeExtraInformation.includeFiles.push_back(includeFile);

    return *this;
  }

  /**
   * \brief Get the files that must be included to use the instruction.
   */
  const std::vector<gd::String> &GetIncludeFiles() const override {
    return codeExtraInformation.includeFiles;
  };

  InstructionMetadata &SetCustomCodeGenerator(
      std::function<gd::String(Instruction &instruction,
                                gd::EventsCodeGenerator &codeGenerator,
                                gd::EventsCodeGenerationContext &context)>
          codeGenerator) {
    codeExtraInformation.hasCustomCodeGenerator = true;
    codeExtraInformation.customCodeGenerator = codeGenerator;
    return *this;
  }

  InstructionMetadata &RemoveCustomCodeGenerator() {
    codeExtraInformation.hasCustomCodeGenerator = false;
    std::function<gd::String(Instruction & instruction,
                              gd::EventsCodeGenerator & codeGenerator,
                              gd::EventsCodeGenerationContext & context)>
        emptyFunction;
    codeExtraInformation.customCodeGenerator = emptyFunction;
    return *this;
  }

  bool HasCustomCodeGenerator() const { return codeExtraInformation.hasCustomCodeGenerator; }

  /**
   * \brief Return the structure containing the information about code
   * generation for the instruction.
   * 
   * \deprecated
   */
  InstructionMetadata &GetCodeExtraInformation() { return *this; }

  std::vector<ParameterMetadata> parameters;

 private:
  gd::String fullname;
  gd::String description;
  gd::String helpPath;
  gd::String sentence;
  gd::String group;
  gd::String iconFilename;
  gd::String smallIconFilename;
  bool canHaveSubInstructions;
  gd::String extensionNamespace;
  bool hidden;
  int usageComplexity;  ///< Evaluate the instruction from 0 (simple&easy to
                        ///< use) to 10 (complex to understand)
  bool isPrivate;
  bool isObjectInstruction;
  bool isBehaviorInstruction;
  gd::String requiredBaseObjectCapability;
  gd::String relevantContext;
};

}  // namespace gd
