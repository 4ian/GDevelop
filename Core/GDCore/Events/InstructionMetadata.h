/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef INSTRUCTIONMETADATA_H
#define INSTRUCTIONMETADATA_H
#include <string>
#include "GDCore/Events/Instruction.h"
#include <boost/shared_ptr.hpp>
#include <wx/bitmap.h>
class Game;
class Scene;
class EventsCodeGenerator;
class EventsCodeGenerationContext;

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

    /**
     * Set the default value used in editor or if an optional parameter is empty during code generation.
     */
    ParameterMetadata & SetDefaultValue(std::string defaultValue_) {
        defaultValue = defaultValue_;
        return *this; };
};

/**
 * \brief Contains user-friendly infos about actions/conditions, and members needed to setup an instruction
 *
 * \ingroup Events
 */
class GD_CORE_API InstructionMetadata
{
public:

    InstructionMetadata(std::string extensionNamespace);
    virtual ~InstructionMetadata() {};

    std::string fullname;
    std::string description;
    std::string sentence;
    std::string group;
    wxBitmap icon;
    wxBitmap smallicon;
    bool canHaveSubInstructions;
    std::vector < ParameterMetadata > parameters;

    /**
     * Notify that the instruction can have sub instructions.
     */
    InstructionMetadata & SetCanHaveSubInstructions()
    {
        canHaveSubInstructions = true;
        return *this;
    }

    /**
     * Add a parameter to the instruction ( condition or action ) information class.
     * \param type One of the type handled by Game Develop. This will also determine the type of the argument used when calling the function in C++ code. \see EventsCodeGenerator::GenerateParametersCodes
     * \param description Edittime only description for parameter
     * \param optionalObjectType If type is "object", this parameter will describe which objects are allowed. If it is empty, all objects are allowed.
     * \param parameterIsOptional true if the parameter must be optional, false otherwise.
     */
    ParameterMetadata & AddParameter(const std::string & type, const wxString & description, const std::string & optionalObjectType, bool parameterIsOptional);

    /**
     * Add a parameter not displayed in editor.
     * \param type One of the type handled by Game Develop. This will also determine the type of the argument used when calling the function in C++ code. \see EventsCodeGenerator::GenerateParametersCodes
     * \param supplementaryInformation Can be used if needed. For example, when type == "inlineCode", the content of supplementaryInformation is inserted in the generated C++ code.
     */
    ParameterMetadata & AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation);

    /**
     * \brief Defines information about how generate C++ code for an instruction
     */
    class CppCallingInformation
    {
    public:
        enum AccessType {Reference, MutatorAndOrAccessor};
        CppCallingInformation() : accessType(Reference), doNotEncloseInstructionCodeWithinBrackets(false) {};

        /**
         * Set the C++ function name which will be used when generating the C++ code.
         */
        CppCallingInformation & SetFunctionName(const std::string & cppCallingName_)
        {
            cppCallingName = cppCallingName_;
            return *this;
        }

        /**
         * Declare if the instruction ( condition or action ) being declared is manipulating something in a standard way.
         */
        CppCallingInformation & SetManipulatedType(const std::string & type_)
        {
            type = type_;
            return *this;
        }

        /**
         * If InstructionMetadata::CppCallingInformation::SetManipulatedType was called with "number" or "string", this function will tell the code generator
         * the name of the getter function used to retrieve the data value.
         *
         * Usage example:
         * \code
         *  DECLARE_OBJECT_ACTION("String",
         *                 _("Change the string"),
         *                 _("Change the string of a text"),
         *                 _("Do _PARAM2__PARAM1_ to the string of _PARAM0_"),
         *                 _("Text"),
         *                 "Extensions/text24.png",
         *                 "Extensions/text.png");
         *
         *      instrInfo.AddParameter("object", _("Object"), "Text", false);
         *      instrInfo.AddParameter("string", _("String"), "", false);
         *      instrInfo.AddParameter("operator", _("Modification operator"), "", false);
         *
         *      instrInfo.cppCallingInformation.SetFunctionName("SetString").SetManipulatedType("string").SetAssociatedGetter("GetString").SetIncludeFile("MyExtension/TextObject.h");
         *
         *  DECLARE_END_OBJECT_ACTION()
         * \endcode
         */
        CppCallingInformation & SetAssociatedGetter(const std::string & getter)
        {
            optionalAssociatedInstruction = getter;
            accessType = MutatorAndOrAccessor;
            return *this;
        }

        /**
         * Set that the function is located in a specific include file
         */
        CppCallingInformation & SetIncludeFile(const std::string & optionalIncludeFile_)
        {
            optionalIncludeFile = optionalIncludeFile_;
            return *this;
        }

        /**
         * Set that the instruction should not be enclose within brackets ( { } )
         */
        CppCallingInformation & DoNotEncloseInstructionCodeWithinBrackets(bool disableBrackets = true)
        {
            doNotEncloseInstructionCodeWithinBrackets = disableBrackets;
            return *this;
        }

        /** \brief Class used to redefine instruction code generation
         */
        class CustomCodeGenerator
        {
        public:
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerator & codeGenerator_, EventsCodeGenerationContext & context) {return "";};
        };

        CppCallingInformation & SetCustomCodeGenerator(boost::shared_ptr<CustomCodeGenerator> codeGenerator)
        {
            optionalCustomCodeGenerator = codeGenerator;
            return *this;
        }

        std::string cppCallingName;
        std::string type;
        AccessType accessType;
        std::string optionalAssociatedInstruction;
        bool doNotEncloseInstructionCodeWithinBrackets;
        std::string optionalIncludeFile;
        boost::shared_ptr<CustomCodeGenerator> optionalCustomCodeGenerator;
    };
    CppCallingInformation cppCallingInformation; ///< Information about how generate C++ code for the instruction

    /** Don't use this constructor. Only here to fulfill std::map requirements
     */
    InstructionMetadata() {};

private:
    std::string extensionNamespace;
};

#endif // INSTRUCTIONMETADATA_H
