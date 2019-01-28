/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef INSTRUCTIONMETADATA_H
#define INSTRUCTIONMETADATA_H
#if defined(GD_IDE_ONLY)
#include <functional>
#include <map>
#include <memory>
#include "GDCore/Events/Instruction.h"
#include "GDCore/String.h"
#if !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h>
#endif
#include "GDCore/String.h"
class wxBitmap;
namespace gd {
class Project;
class Layout;
class EventsCodeGenerator;
class EventsCodeGenerationContext;
class SerializerElement;
}  // namespace gd

namespace gd {

/**
 * \brief Contains user-friendly info about a parameter, and information about
 * what a parameter need
 *
 * \ingroup Events
 */
class GD_CORE_API ParameterMetadata {
 public:
  ParameterMetadata();
  virtual ~ParameterMetadata(){};

  /**
   * \brief Return the type of the parameter.
   * \see gd::ParameterMetadata::IsObject
   */
  const gd::String &GetType() const { return type; }

  /**
   * \brief Set the type of the parameter.
   */
  ParameterMetadata &SetType(const gd::String &type_) {
    type = type_;
    return *this;
  }

  /**
   * \brief Return the name of the parameter.
   *
   * Name is optional, and won't be filled for most parameters of extensions.
   * It is useful when generating a function from events, where parameters must
   * be named.
   */
  const gd::String &GetName() const { return name; }

  /**
   * \brief Set the name of the parameter.
   *
   * Name is optional, and won't be filled for most parameters of extensions.
   * It is useful when generating a function from events, where parameters must
   * be named.
   */
  ParameterMetadata &SetName(const gd::String &name_) {
    name = name_;
    return *this;
  }

  /**
   * \brief Return an optional additional information, used for some parameters
   * with special type (For example, it can contains the type of object accepted
   * by the parameter).
   */
  const gd::String &GetExtraInfo() const { return supplementaryInformation; }

  /**
   * \brief Set an optional additional information, used for some parameters
   * with special type (For example, it can contains the type of object accepted
   * by the parameter).
   */
  ParameterMetadata &SetExtraInfo(const gd::String &supplementaryInformation_) {
    supplementaryInformation = supplementaryInformation_;
    return *this;
  }

  /**
   * \brief Return true if the parameter is optional.
   */
  bool IsOptional() const { return optional; }

  /**
   * \brief Set if the parameter is optional.
   */
  ParameterMetadata &SetOptional(bool optional_ = true) {
    optional = optional_;
    return *this;
  }

  /**
   * \brief Return the description of the parameter
   */
  const gd::String &GetDescription() const { return description; }

  /**
   * \brief Set the description of the parameter.
   */
  ParameterMetadata &SetDescription(const gd::String &description_) {
    description = description_;
    return *this;
  }

  /**
   * \brief Return true if the parameter is only meant to be completed during
   * compilation and must not be displayed to the user.
   */
  bool IsCodeOnly() const { return codeOnly; }

  /**
   * \brief Set if the parameter is only meant to be completed during
   * compilation and must not be displayed to the user.
   */
  ParameterMetadata &SetCodeOnly(bool codeOnly_ = true) {
    codeOnly = codeOnly_;
    return *this;
  }

  /**
   * \brief Get the default value for the parameter.
   */
  const gd::String &GetDefaultValue() const { return defaultValue; }

  /**
   * \brief Set the default value, if the parameter is optional.
   */
  ParameterMetadata &SetDefaultValue(const gd::String &defaultValue_) {
    defaultValue = defaultValue_;
    return *this;
  }

  /**
   * \brief Return true if the type of the parameter is "object", "objectPtr" or
   * "objectList".
   *
   * \see gd::ParameterMetadata::GetType
   */
  static bool IsObject(const gd::String &parameterType) {
    return parameterType == "object" || parameterType == "objectPtr" ||
           parameterType == "objectList" ||
           parameterType == "objectListWithoutPicking";
  }

  /**
   * \brief Return true if the type of the parameter is an expression of the
   * given type.
   */
  static bool IsExpression(const gd::String &type,
                           const gd::String &parameterType) {
    if (type == "number") {
      return parameterType == "expression" || parameterType == "camera" ||
             parameterType == "forceMultiplier";
    } else if (type == "string") {
      return parameterType == "string" || parameterType == "layer" ||
             parameterType == "color" || parameterType == "file" ||
             parameterType == "joyaxis";
    } else if (type == "variable") {
      return parameterType == "objectvar" || parameterType == "globalvar" ||
             parameterType == "scenevar";
    }
    return false;
  }

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the ParameterMetadata to the specified element
   */
  void SerializeTo(gd::SerializerElement &element) const;

  /**
   * \brief Load the ParameterMetadata from the specified element
   */
  void UnserializeFrom(const gd::SerializerElement &element);
  ///@}

  // TODO: Deprecated public fields. Any direct using should be moved to
  // getter/setter.
  gd::String type;                      ///< Parameter type
  gd::String supplementaryInformation;  ///< Used if needed
  bool optional;                        ///< True if the parameter is optional

  gd::String description;  ///< Description shown in editor
  bool codeOnly;  ///< True if parameter is relative to code generation only,
                  ///< i.e. must not be shown in editor
  gd::String defaultValue;  ///< Used as a default value in editor or if an
                            ///< optional parameter is empty.
 private:
  gd::String name;  ///< The name of the parameter to be used in code
                    ///< generation. Optional.
};

/**
 * \brief Contains user-friendly infos about actions/conditions, and members
 * needed to setup an instruction
 *
 * \ingroup Events
 */
class GD_CORE_API InstructionMetadata {
 public:
  InstructionMetadata(const gd::String &extensionNamespace,
                      const gd::String &name,
                      const gd::String &fullname,
                      const gd::String &description,
                      const gd::String &sentence,
                      const gd::String &group,
                      const gd::String &icon,
                      const gd::String &smallIcon);
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
#if !defined(GD_NO_WX_GUI)
  const wxBitmap &GetBitmapIcon() const { return icon; }
  const wxBitmap &GetSmallBitmapIcon() const { return smallicon; }
#endif
  const gd::String &GetIconFilename() const { return iconFilename; }
  const gd::String &GetSmallIconFilename() const { return smallIconFilename; }
  bool CanHaveSubInstructions() const { return canHaveSubInstructions; }

  /**
   * Get the help path of the instruction, relative to the documentation root.
   */
  const gd::String &GetHelpPath() const { return helpPath; }

  /**
   * Set the help path of the instruction, relative to the documentation root.
   */
  InstructionMetadata &SetHelpPath(const gd::String &path) {
    helpPath = path;
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
   * \brief Add a parameter to the instruction ( condition or action )
   * information class. \param type One of the type handled by GDevelop. This
   * will also determine the type of the argument used when calling the function
   * in the generated code. \see EventsCodeGenerator::GenerateParametersCodes
   * \param description Description for parameter
   * \param optionalObjectType If type is "object", this parameter will describe
   * which objects are allowed. If it is empty, all objects are allowed. \param
   * parameterIsOptional true if the parameter must be optional, false
   * otherwise.
   */
  InstructionMetadata &AddParameter(const gd::String &type,
                                    const gd::String &description,
                                    const gd::String &optionalObjectType = "",
                                    bool parameterIsOptional = false);

  /**
   * \brief Add a parameter not displayed in editor.
   * \param type One of the type handled by GDevelop. This will also determine
   * the type of the argument used when calling the function in C++ code. \see
   * EventsCodeGenerator::GenerateParametersCodes \param
   * supplementaryInformation Can be used if needed. For example, when type ==
   * "inlineCode", the content of supplementaryInformation is inserted in the
   * generated C++ code.
   */
  InstructionMetadata &AddCodeOnlyParameter(
      const gd::String &type, const gd::String &supplementaryInformation);

  /**
   * \brief Set the default value used in editor (or if an optional parameter is
   * empty during code generation) for the latest added parameter.
   *
   * \see AddParameter
   */
  InstructionMetadata &SetDefaultValue(gd::String defaultValue_) {
    if (!parameters.empty()) parameters.back().defaultValue = defaultValue_;
    return *this;
  };

  /**
   * \brief Consider that the instruction is easy for an user to understand.
   */
  InstructionMetadata &MarkAsSimple() {
    usageComplexity = 2;
    return *this;
  }

  /**
   * \brief Consider that the instruction is harder for an user to understand
   * than a normal instruction.
   */
  InstructionMetadata &MarkAsAdvanced() {
    usageComplexity = 7;
    return *this;
  }

  /**
   * \brief Consider that the instruction is complex for an user to understand.
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
     *                 _("Do _PARAM1__PARAM2_ to the string of _PARAM0_"),
     *                 _("Text"),
     *                 "CppPlatform/Extensions/text24.png",
     *                 "CppPlatform/Extensions/text.png");
     *
     *      .AddParameter("object", _("Object"), "Text", false)
     *      .AddParameter("operator", _("Modification operator"))
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

  /** \brief DefaultConstructor.
   * \warning Please do not use this constructor. Only here to fulfill std::map
   * requirements.
   */
  InstructionMetadata();

  std::vector<ParameterMetadata> parameters;

 private:
  gd::String fullname;
  gd::String description;
  gd::String helpPath;
  gd::String sentence;
  gd::String group;
#if !defined(GD_NO_WX_GUI)
  wxBitmap icon;
  wxBitmap smallicon;
#endif
  gd::String iconFilename;
  gd::String smallIconFilename;
  bool canHaveSubInstructions;
  gd::String extensionNamespace;
  bool hidden;
  int usageComplexity;  ///< Evaluate the instruction from 0 (simple&easy to
                        ///< use) to 10 (complex to understand)
};

}  // namespace gd

#endif
#endif  // INSTRUCTIONMETADATA_H
