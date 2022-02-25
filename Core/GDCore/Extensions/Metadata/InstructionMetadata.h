/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef INSTRUCTIONMETADATA_H
#define INSTRUCTIONMETADATA_H
#include <functional>
#include <map>
#include <memory>

#include "GDCore/Events/Instruction.h"
#include "GDCore/String.h"
#include "ParameterMetadata.h"
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
class GD_CORE_API InstructionMetadata {
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
  InstructionMetadata &SetPrivate() {
    isPrivate = true;
    return *this;
  }

  /**
   * Check if the instruction is asynchronous - it will be running in the
   * background, executing the instructions following it before the frame after
   * it resolved.
   */
  bool IsAsync() const { return isAsync; }

  /**
   * Set that the instruction is asynchronous - it will be running in the
   * background, executing the instructions following it before the frame after
   * it resolved.
   */
  InstructionMetadata &SetAsync() {
    isAsync = true;
    return *this;
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
  InstructionMetadata &SetHidden() {
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
      bool parameterIsOptional = false);

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
      const gd::String &type, const gd::String &supplementaryInformation);

  /**
   * \brief Set the default value used in editor (or if an optional parameter is
   * empty during code generation) for the last added parameter.
   *
   * \see AddParameter
   */
  InstructionMetadata &SetDefaultValue(const gd::String &defaultValue_) {
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
      const gd::String &longDescription) {
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
  InstructionMetadata &SetParameterExtraInfo(const gd::String &extraInfo) {
    if (!parameters.empty()) parameters.back().SetExtraInfo(extraInfo);
    return *this;
  };

  /**
   * \brief Add the default parameters for an instruction manipulating the
   * specified type ("string", "number") with the default operators.
   */
  InstructionMetadata &UseStandardOperatorParameters(const gd::String &type);

  /**
   * \brief Add the default parameters for an instruction comparing the
   * specified type ("string", "number") with the default relational operators.
   */
  InstructionMetadata &UseStandardRelationalOperatorParameters(
      const gd::String &type);

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
  };

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

    /**
     * Set the function name which will be used when generating the code.
     * \param functionName the name of the function to call
     */
    ExtraInformation &SetFunctionName(const gd::String &functionName_) {
      functionCallName = functionName_;
      return *this;
    }

    /**
     * Declare if the instruction being declared is somewhat manipulating in a
     * standard way.
     */
    ExtraInformation &SetManipulatedType(const gd::String &type_) {
      type = type_;
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
     *                 "CppPlatform/Extensions/text.png");
     *
     *      .AddParameter("object", _("Object"), "Text", false)
     *      .AddParameter("operator", _("Modification operator"), "string")
     *      .AddParameter("string", _("String"))
     *      .SetFunctionName("SetString").SetManipulatedType("string").SetGetter("GetString").SetIncludeFile("MyExtension/TextObject.h");
     *
     *  DECLARE_END_OBJECT_ACTION()
     * \endcode
     */
    ExtraInformation &SetGetter(const gd::String &getter) {
      optionalAssociatedInstruction = getter;
      accessType = MutatorAndOrAccessor;
      return *this;
    }

    ExtraInformation &SetMutators(
        const std::map<gd::String, gd::String> &mutators) {
      optionalMutators = mutators;
      accessType = Mutators;
      return *this;
    }

    /**
     * \brief Erase any existing include file and add the specified include.
     */
    ExtraInformation &SetIncludeFile(const gd::String &includeFile) {
      includeFiles.clear();
      includeFiles.push_back(includeFile);
      return *this;
    }

    /**
     * \brief Add a file to the already existing include files.
     */
    ExtraInformation &AddIncludeFile(const gd::String &includeFile) {
      if (std::find(includeFiles.begin(), includeFiles.end(), includeFile) ==
          includeFiles.end())
        includeFiles.push_back(includeFile);

      return *this;
    }

    /**
     * \brief Get the files that must be included to use the instruction.
     */
    const std::vector<gd::String> &GetIncludeFiles() const {
      return includeFiles;
    };

    ExtraInformation &SetCustomCodeGenerator(
        std::function<gd::String(Instruction &instruction,
                                 gd::EventsCodeGenerator &codeGenerator,
                                 gd::EventsCodeGenerationContext &context)>
            codeGenerator) {
      hasCustomCodeGenerator = true;
      customCodeGenerator = codeGenerator;
      return *this;
    }

    ExtraInformation &RemoveCustomCodeGenerator() {
      hasCustomCodeGenerator = false;
      std::function<gd::String(Instruction & instruction,
                               gd::EventsCodeGenerator & codeGenerator,
                               gd::EventsCodeGenerationContext & context)>
          emptyFunction;
      customCodeGenerator = emptyFunction;
      return *this;
    }

    bool HasCustomCodeGenerator() const { return hasCustomCodeGenerator; }

    gd::String functionCallName;
    gd::String type;
    AccessType accessType;
    gd::String optionalAssociatedInstruction;
    std::map<gd::String, gd::String> optionalMutators;
    bool hasCustomCodeGenerator;
    std::function<gd::String(Instruction &instruction,
                             gd::EventsCodeGenerator &codeGenerator,
                             gd::EventsCodeGenerationContext &context)>
        customCodeGenerator;

   private:
    std::vector<gd::String> includeFiles;
  };
  ExtraInformation codeExtraInformation;  ///< Information about how generate
                                          ///< code for the instruction

  /**
   * \brief Return the structure containing the information about code
   * generation for the instruction.
   */
  ExtraInformation &GetCodeExtraInformation() { return codeExtraInformation; }

  /**
   * \brief Declare if the instruction being declared is somewhat manipulating
   * in a standard way. \param type "number" or "string" \note Shortcut for
   * `codeExtraInformation.SetManipulatedType(type)`.
   */
  ExtraInformation &SetManipulatedType(const gd::String &type_) {
    return codeExtraInformation.SetManipulatedType(type_);
  }

  /**
   * \brief Set the function that should be called when generating the source
   * code from events.
   * \param functionName the name of the function to call
   * \note Shortcut for `codeExtraInformation.SetFunctionName`.
   */
  ExtraInformation &SetFunctionName(const gd::String &functionName) {
    return codeExtraInformation.SetFunctionName(functionName);
  }

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
  bool isAsync;
  bool isObjectInstruction;
  bool isBehaviorInstruction;
  gd::String requiredBaseObjectCapability;
};

}  // namespace gd

#endif  // INSTRUCTIONMETADATA_H
