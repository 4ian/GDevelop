
#ifndef EXPRESSIONMETADATA_H
#define EXPRESSIONMETADATA_H
#include <string>
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/InstructionMetadata.h"
#include <boost/shared_ptr.hpp>
#include <wx/bitmap.h>
class wxString;
class Game;
class Scene;

namespace gd
{

/**
 * \brief Contains user-friendly infos about expressions and members needed to setup an expression
 *
 * \ingroup Events
 */
class GD_CORE_API ExpressionMetadata
{
    public:

    ExpressionMetadata(std::string extensionNamespace);
    virtual ~ExpressionMetadata() {};

    /**
     * When called, the expression will not be displayed in the editor
     */
    ExpressionMetadata & SetHidden();

    std::string fullname;
    std::string description;
    std::string group;
    bool shown;
    wxBitmap smallicon;
    std::vector < gd::ParameterMetadata > parameters;

    /**
     * \see gd::InstructionMetadata::AddParameter
     */
    gd::ParameterMetadata & AddParameter(const std::string & type, const wxString & description, const std::string & optionalObjectType, bool parameterIsOptional);

    /**
     * \see gd::InstructionMetadata::AddCodeOnlyParameter
     */
    gd::ParameterMetadata & AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation);

    /**
     * \brief Defines information about how generate C++ code for an instruction
     */
    class CppCallingInformation
    {
    public:
        /**
         * Set the C++ function name which will be used when generating the C++ code.
         */
        CppCallingInformation & SetFunctionName(const std::string & cppCallingName_)
        {
            cppCallingName = cppCallingName_;
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

        /** \brief Class used to redefine instruction code generation
         */
        class CustomCodeGenerator
        {
        public:
            virtual std::string GenerateCode(const Game & game, const Scene & scene, const std::vector<gd::Expression> & parameters, EventsCodeGenerator & codeGenerator_, EventsCodeGenerationContext & context) {return "";};
        };

        CppCallingInformation & SetCustomCodeGenerator(boost::shared_ptr<CustomCodeGenerator> codeGenerator)
        {
            optionalCustomCodeGenerator = codeGenerator;
            return *this;
        }

        std::string cppCallingName;
        std::string optionalIncludeFile;
        boost::shared_ptr<CustomCodeGenerator> optionalCustomCodeGenerator;
    };
    CppCallingInformation cppCallingInformation;

    /** Don't use this constructor. Only here to fullfil std::map requirements
     */
    ExpressionMetadata() {};

    private:
        std::string extensionNamespace;
};

/**
 * \brief Contains user-friendly infos about expressions, only at edittime, and members needed to setup an expression
 */
class GD_CORE_API StrExpressionMetadata
{
    public:

    StrExpressionMetadata(std::string extensionNamespace);
    virtual ~StrExpressionMetadata() {};

    /**
     * When called, the expression will not be displayed in the editor
     */
    StrExpressionMetadata & SetHidden();

    std::string fullname;
    std::string description;
    std::string group;
    bool shown;
    wxBitmap smallicon;
    std::vector < gd::ParameterMetadata > parameters;

    /**
     * \see gd::InstructionMetadata::AddParameter
     */
    gd::ParameterMetadata & AddParameter(const std::string & type, const wxString & description, const std::string & optionalObjectType, bool parameterIsOptional);

    /**
     * \see gd::InstructionMetadata::AddCodeOnlyParameter
     */
    gd::ParameterMetadata & AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation);

    /**
     * \brief Defines information about how generate C++ code for an instruction
     */
    class CppCallingInformation
    {
    public:
        /**
         * Set the C++ function name which will be used when generating the C++ code.
         */
        CppCallingInformation & SetFunctionName(const std::string & cppCallingName_)
        {
            cppCallingName = cppCallingName_;
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

        /** \brief Class used to redefine instruction code generation
         */
        class CustomCodeGenerator
        {
        public:
            virtual std::string GenerateCode(const Game & game, const Scene & scene, const std::vector<gd::Expression> & parameters, EventsCodeGenerator & codeGenerator_ ,EventsCodeGenerationContext & context) {return "";};
        };

        CppCallingInformation & SetCustomCodeGenerator(boost::shared_ptr<CustomCodeGenerator> codeGenerator)
        {
            optionalCustomCodeGenerator = codeGenerator;
            return *this;
        }

        std::string cppCallingName;
        std::string optionalIncludeFile;
        boost::shared_ptr<CustomCodeGenerator> optionalCustomCodeGenerator;
    };
    CppCallingInformation cppCallingInformation;

    /** Don't use this constructor. Only here to fulfill std::map requirements
     */
    StrExpressionMetadata() {};

    private:
        std::string extensionNamespace;
};

}

#endif // EXPRESSIONMETADATA_H
