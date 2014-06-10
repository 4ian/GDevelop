/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef INSTRUCTIONMETADATA_H
#define INSTRUCTIONMETADATA_H
#if defined(GD_IDE_ONLY)
#include <string>
#include "GDCore/Events/Instruction.h"
#include <boost/shared_ptr.hpp>
#if !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h>
#endif
class wxBitmap;
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class EventsCodeGenerator; }
namespace gd { class EventsCodeGenerationContext; }

namespace gd
{

/**
 * \brief Contains user-friendly info about a parameter, and information about what a parameter need
 *
 * \ingroup Events
 */
class GD_CORE_API ParameterMetadata
{
public:
    ParameterMetadata();
    virtual ~ParameterMetadata() {};

    /**
     * \brief Return the type of the parameter.
     * \see gd::ParameterMetadata::IsObject
     */
    const std::string & GetType() const { return type; }

    /**
     * \brief Return an optional additional information, used for some parameters with special
     * type (For example, it can contains the type of object accepted by the parameter).
     */
    const std::string & GetExtraInfo() const { return supplementaryInformation; }

    /**
     * \brief Return true if the parameter is optional.
     */
    bool IsOptional() const { return optional; }

    /**
     * \brief Return the description of the parameter
     */
    const std::string & GetDescription() const { return description; }

    /**
     * \brief Return true if the parameter is only meant to be completed during compilation
     * and must not be displayed to the user.
     */
    bool IsCodeOnly() const { return codeOnly; }

    /**
     * \brief Get the default value for the parameter.
     */
    const std::string & GetDefaultValue() const { return defaultValue; }

    std::string type; ///< Parameter type
    std::string supplementaryInformation; ///< Used if needed
    bool optional; ///< True if the parameter is optional

    std::string description; ///< Description shown in editor
    bool codeOnly; ///< True if parameter is relative to code generation only, i.e. must not be shown in editor
    std::string defaultValue; ///< Used as a default value in editor or if an optional parameter is empty.

    /**
     * \brief Return true if the type of the parameter is "object", "objectPtr" or "objectList".
     * \see gd::ParameterMetadata::GetType
     */
    static bool IsObject(const std::string & type) { return type == "object" || type == "objectPtr" || type == "objectList" || type == "objectListWithoutPicking"; }
};

/**
 * \brief Contains user-friendly infos about actions/conditions, and members needed to setup an instruction
 *
 * \ingroup Events
 */
class GD_CORE_API InstructionMetadata
{
public:

    InstructionMetadata(const std::string & extensionNamespace,
                        const std::string & name,
                        const std::string & fullname,
                        const std::string & description,
                        const std::string & sentence,
                        const std::string & group,
                        const std::string & icon,
                        const std::string & smallIcon);
    virtual ~InstructionMetadata() {};

    const std::string & GetFullName() const { return fullname; }
    const std::string & GetDescription() const { return description; }
    const std::string & GetSentence() const { return sentence; }
    const std::string & GetGroup() const { return group; }
    const ParameterMetadata & GetParameter(size_t i) const { return parameters[i]; }
    size_t GetParametersCount() const { return parameters.size(); }
#if !defined(GD_NO_WX_GUI)
    const wxBitmap & GetBitmapIcon() const { return icon; }
    const wxBitmap & GetSmallBitmapIcon() const { return smallicon; }
#endif
    const std::string & GetIconFilename() const { return iconFilename; }
    const std::string & GetSmallIconFilename() const { return smallIconFilename; }
    bool CanHaveSubInstructions() const { return canHaveSubInstructions; }

    /**
     * Notify that the instruction can have sub instructions.
     */
    InstructionMetadata & SetCanHaveSubInstructions()
    {
        canHaveSubInstructions = true;
        return *this;
    }

    /**
     * \brief Set the instruction to be hidden in the IDE.
     *
     * Used mainly when an instruction is deprecated.
     */
    InstructionMetadata & SetHidden()
    {
        hidden = true;
        return *this;
    }

    /**
     * \brief Set the group of the instruction in the IDE.
     */
    InstructionMetadata & SetGroup(const std::string & str)
    {
        group = str;
        return *this;
    }

    /**
     * \brief Return true if the instruction must be hidden in the IDE.
     */
    bool IsHidden() const { return hidden; }

    /**
     * \brief Add a parameter to the instruction ( condition or action ) information class.
     * \param type One of the type handled by Game Develop.
     * This will also determine the type of the argument used when calling the function in the generated code. \see EventsCodeGenerator::GenerateParametersCodes
     * \param description Description for parameter
     * \param optionalObjectType If type is "object", this parameter will describe which objects are allowed. If it is empty, all objects are allowed.
     * \param parameterIsOptional true if the parameter must be optional, false otherwise.
     */
    InstructionMetadata & AddParameter(const std::string & type, const std::string & description, const std::string & optionalObjectType = "", bool parameterIsOptional = false);

    /**
     * \brief Add a parameter not displayed in editor.
     * \param type One of the type handled by Game Develop. This will also determine the type of the argument used when calling the function in C++ code. \see EventsCodeGenerator::GenerateParametersCodes
     * \param supplementaryInformation Can be used if needed. For example, when type == "inlineCode", the content of supplementaryInformation is inserted in the generated C++ code.
     */
    InstructionMetadata & AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation);

    /**
     * \brief Set the default value used in editor (or if an optional parameter is empty during code generation) for the latest added parameter.
     *
     * \see AddParameter
     */
    InstructionMetadata & SetDefaultValue(std::string defaultValue_)
    {
        if ( !parameters.empty() ) parameters.back().defaultValue = defaultValue_;
        return *this;
    };

    /**
     * \brief Defines information about how generate the code for an instruction
     */
    class ExtraInformation
    {
    public:
        enum AccessType {Reference, MutatorAndOrAccessor};
        ExtraInformation() : accessType(Reference) {};
        virtual ~ExtraInformation() {};

        /**
         * Set the function name which will be used when generating the code.
         */
        ExtraInformation & SetFunctionName(const std::string & cppCallingName_)
        {
            functionCallName = cppCallingName_;
            return *this;
        }

        /**
         * Declare if the instruction being declared is somewhat manipulating in a standard way.
         */
        ExtraInformation & SetManipulatedType(const std::string & type_)
        {
            type = type_;
            return *this;
        }

        /**
         * If InstructionMetadata::ExtraInformation::SetManipulatedType was called with "number" or "string", this function will tell the code generator
         * the name of the getter function used to retrieve the data value.
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
         *
         *      .codeExtraInformation.SetFunctionName("SetString").SetManipulatedType("string").SetAssociatedGetter("GetString").SetIncludeFile("MyExtension/TextObject.h");
         *
         *  DECLARE_END_OBJECT_ACTION()
         * \endcode
         */
        ExtraInformation & SetAssociatedGetter(const std::string & getter)
        {
            optionalAssociatedInstruction = getter;
            accessType = MutatorAndOrAccessor;
            return *this;
        }

        /**
         * Set that the function is located in a specific include file
         */
        ExtraInformation & SetIncludeFile(const std::string & optionalIncludeFile_)
        {
            optionalIncludeFile = optionalIncludeFile_;
            return *this;
        }

        /** \brief Class used to redefine instruction code generation
         */
        class CustomCodeGenerator
        {
        public:
            virtual std::string GenerateCode(Instruction & instruction, gd::EventsCodeGenerator & codeGenerator_, gd::EventsCodeGenerationContext & context) {return "";};
        };

        ExtraInformation & SetCustomCodeGenerator(boost::shared_ptr<CustomCodeGenerator> codeGenerator)
        {
            optionalCustomCodeGenerator = codeGenerator;
            return *this;
        }

        std::string functionCallName;
        std::string type;
        AccessType accessType;
        std::string optionalAssociatedInstruction;
        std::string optionalIncludeFile;
        boost::shared_ptr<CustomCodeGenerator> optionalCustomCodeGenerator;
    };
    ExtraInformation codeExtraInformation; ///< Information about how generate code for the instruction

    /**
     * \brief Declare if the instruction being declared is somewhat manipulating in a standard way.
     *
     * Shortcut for "codeExtraInformation.SetManipulatedType(type)".
     */
    ExtraInformation & SetManipulatedType(const std::string & type_)
    {
        return codeExtraInformation.SetManipulatedType(type_);
    }

    /** \brief DefaultConstructor.
     *
     * Please do not use this constructor. Only here to fulfill std::map requirements
     */
    InstructionMetadata();

    std::vector < ParameterMetadata > parameters;
private:

    std::string fullname;
    std::string description;
    std::string sentence;
    std::string group;
#if !defined(GD_NO_WX_GUI)
    wxBitmap icon;
    wxBitmap smallicon;
#endif
    std::string iconFilename;
    std::string smallIconFilename;
    bool canHaveSubInstructions;
    std::string extensionNamespace;
    bool hidden;
};

}

#endif
#endif // INSTRUCTIONMETADATA_H


