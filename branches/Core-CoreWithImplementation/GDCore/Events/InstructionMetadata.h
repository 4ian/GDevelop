/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef INSTRUCTIONMETADATA_H
#define INSTRUCTIONMETADATA_H
#include <string>
#include "GDCore/Events/Instruction.h"
#include <boost/shared_ptr.hpp>
#include <wx/bitmap.h>
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

    std::string type; ///< Parameter type
    std::string supplementaryInformation; ///< Used if needed
    bool optional; ///< True if the parameter is optional

    std::string description; ///< Description shown in editor
    bool codeOnly; ///< True if parameter is relative to code generation only, i.e. must not be shown in editor
    std::string defaultValue; ///< Used as a default value in editor or if an optional parameter is empty.
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
                        const std::string & smallicon);
    virtual ~InstructionMetadata() {};

    const std::string & GetFullName() const { return fullname; }
    const std::string & GetDescription() const { return description; }
    const std::string & GetSentence() const { return sentence; }
    const std::string & GetGroup() const { return group; }
    const wxBitmap & GetBitmapIcon() const { return icon; }
    const wxBitmap & GetSmallBitmapIcon() const { return smallicon; }
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
     * \brief Return true if the instruction must be hidden in the IDE.
     */
    bool IsHidden() const { return hidden; }

    /**
     * Add a parameter to the instruction ( condition or action ) information class.
     * \param type One of the type handled by Game Develop. This will also determine the type of the argument used when calling the function in C++ code. \see EventsCodeGenerator::GenerateParametersCodes
     * \param description Edittime only description for parameter
     * \param optionalObjectType If type is "object", this parameter will describe which objects are allowed. If it is empty, all objects are allowed.
     * \param parameterIsOptional true if the parameter must be optional, false otherwise.
     */
    InstructionMetadata & AddParameter(const std::string & type, const wxString & description, const std::string & optionalObjectType = "", bool parameterIsOptional = false);

    /**
     * Add a parameter not displayed in editor.
     * \param type One of the type handled by Game Develop. This will also determine the type of the argument used when calling the function in C++ code. \see EventsCodeGenerator::GenerateParametersCodes
     * \param supplementaryInformation Can be used if needed. For example, when type == "inlineCode", the content of supplementaryInformation is inserted in the generated C++ code.
     */
    InstructionMetadata & AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation);

    /**
     * Set the default value used in editor ( or if an optional parameter is empty during code generation ) for the latest added parameter.
     *
     * \see AddParameter
     */
    InstructionMetadata & SetDefaultValue(std::string defaultValue_)
    {
        if ( !parameters.empty() ) parameters.back().defaultValue = defaultValue_;
        return *this;
    };

    /**
     * \brief Defines information about how generate C++ code for an instruction
     */
    class ExtraInformation
    {
    public:
        enum AccessType {Reference, MutatorAndOrAccessor};
        ExtraInformation() : accessType(Reference), doNotEncloseInstructionCodeWithinBrackets(false) {};

        /**
         * Set the C++ function name which will be used when generating the C++ code.
         */
        ExtraInformation & SetFunctionName(const std::string & cppCallingName_)
        {
            functionCallName = cppCallingName_;
            return *this;
        }

        /**
         * Declare if the instruction ( condition or action ) being declared is manipulating something in a standard way.
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
         *                 _("Do _PARAM2__PARAM1_ to the string of _PARAM0_"),
         *                 _("Text"),
         *                 "CppPlatform/Extensions/text24.png",
         *                 "CppPlatform/Extensions/text.png");
         *
         *      .AddParameter("object", _("Object"), "Text", false);
         *      .AddParameter("string", _("String"))
         *      .AddParameter("operator", _("Modification operator"))
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

        /**
         * Set that the instruction should not be enclose within brackets ( { } )
         */
        ExtraInformation & DoNotEncloseInstructionCodeWithinBrackets(bool disableBrackets = true)
        {
            doNotEncloseInstructionCodeWithinBrackets = disableBrackets;
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
        bool doNotEncloseInstructionCodeWithinBrackets;
        std::string optionalIncludeFile;
        boost::shared_ptr<CustomCodeGenerator> optionalCustomCodeGenerator;
    };
    ExtraInformation codeExtraInformation; ///< Information about how generate code for the instruction

    /** Don't use this constructor. Only here to fulfill std::map requirements
     */
    InstructionMetadata() {};

    std::vector < ParameterMetadata > parameters;
private:

    std::string fullname;
    std::string description;
    std::string sentence;
    std::string group;
    wxBitmap icon;
    wxBitmap smallicon;
    bool canHaveSubInstructions;
    std::string extensionNamespace;
    bool hidden;
};

}

#endif // INSTRUCTIONMETADATA_H


