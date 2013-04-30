
#ifndef EXPRESSIONMETADATA_H
#define EXPRESSIONMETADATA_H
#include <string>
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/InstructionMetadata.h"
#include <boost/shared_ptr.hpp>
#include <wx/bitmap.h>
class wxString;
namespace gd { class Layout; }

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

    ExpressionMetadata(const std::string & extensionNamespace,
                        const std::string & name,
                        const std::string & fullname,
                        const std::string & description,
                        const std::string & group,
                        const std::string & smallicon);
    virtual ~ExpressionMetadata() {};

    /**
     * When called, the expression will not be displayed in the editor
     */
    ExpressionMetadata & SetHidden();

    std::vector < gd::ParameterMetadata > parameters;

    /**
     * \see gd::InstructionMetadata::AddParameter
     */
    gd::ExpressionMetadata & AddParameter(const std::string & type, const std::string & description, const std::string & optionalObjectType = "", bool parameterIsOptional = false);

    /**
     * \see gd::InstructionMetadata::AddCodeOnlyParameter
     */
    gd::ExpressionMetadata & AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation);

    /**
     * Set the default value used in editor ( or if an optional parameter is empty during code generation ) for the latest added parameter.
     *
     * \see AddParameter
     */
    ExpressionMetadata & SetDefaultValue(std::string defaultValue_)
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
        /**
         * Set the C++ function name which will be used when generating the C++ code.
         */
        ExtraInformation & SetFunctionName(const std::string & cppCallingName_)
        {
            functionCallName = cppCallingName_;
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
            virtual std::string GenerateCode(const std::vector<gd::Expression> & parameters, gd::EventsCodeGenerator & codeGenerator_, gd::EventsCodeGenerationContext & context) {return "";};
        };

        ExtraInformation & SetCustomCodeGenerator(boost::shared_ptr<CustomCodeGenerator> codeGenerator)
        {
            optionalCustomCodeGenerator = codeGenerator;
            return *this;
        }

        std::string functionCallName;
        std::string optionalIncludeFile;
        boost::shared_ptr<CustomCodeGenerator> optionalCustomCodeGenerator;
    };
    ExtraInformation codeExtraInformation;

    /** Don't use this constructor. Only here to fullfil std::map requirements
     */
    ExpressionMetadata() {};

    bool IsShown() const { return shown; }
    const std::string & GetFullName() const { return fullname; }
    const std::string & GetDescription() const { return description; }
    const std::string & GetGroup() const { return group; }
    const wxBitmap & GetBitmapIcon() const { return smallicon; }

private:
    std::string fullname;
    std::string description;
    std::string group;
    bool shown;
    wxBitmap smallicon;
    std::string extensionNamespace;
};

/**
 * \brief Contains user-friendly infos about expressions, only at edittime, and members needed to setup an expression
 */
class GD_CORE_API StrExpressionMetadata
{
public:

    StrExpressionMetadata(const std::string & extensionNamespace,
                        const std::string & name,
                        const std::string & fullname,
                        const std::string & description,
                        const std::string & group,
                        const std::string & smallicon);
    virtual ~StrExpressionMetadata() {};

    /**
     * When called, the expression will not be displayed in the editor
     */
    StrExpressionMetadata & SetHidden();

    std::vector < gd::ParameterMetadata > parameters;

    /**
     * \see gd::InstructionMetadata::AddParameter
     */
    gd::StrExpressionMetadata & AddParameter(const std::string & type, const wxString & description, const std::string & optionalObjectType = "", bool parameterIsOptional = false);

    /**
     * \see gd::InstructionMetadata::AddCodeOnlyParameter
     */
    gd::StrExpressionMetadata & AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation);

    /**
     * Set the default value used in editor ( or if an optional parameter is empty during code generation ) for the latest added parameter.
     *
     * \see AddParameter
     */
    StrExpressionMetadata & SetDefaultValue(std::string defaultValue_)
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
        /**
         * Set the C++ function name which will be used when generating the C++ code.
         */
        ExtraInformation & SetFunctionName(const std::string & cppCallingName_)
        {
            functionCallName = cppCallingName_;
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
            virtual std::string GenerateCode(const std::vector<gd::Expression> & parameters, EventsCodeGenerator & codeGenerator_ ,EventsCodeGenerationContext & context) {return "";};
        };

        ExtraInformation & SetCustomCodeGenerator(boost::shared_ptr<CustomCodeGenerator> codeGenerator)
        {
            optionalCustomCodeGenerator = codeGenerator;
            return *this;
        }

        std::string functionCallName;
        std::string optionalIncludeFile;
        boost::shared_ptr<CustomCodeGenerator> optionalCustomCodeGenerator;
    };
    ExtraInformation codeExtraInformation;

    /** Don't use this constructor. Only here to fulfill std::map requirements
     */
    StrExpressionMetadata() {};

    bool IsShown() const { return shown; }
    const std::string & GetFullName() const { return fullname; }
    const std::string & GetDescription() const { return description; }
    const std::string & GetGroup() const { return group; }
    const wxBitmap & GetBitmapIcon() const { return smallicon; }

private:
    std::string fullname;
    std::string description;
    std::string group;
    bool shown;
    wxBitmap smallicon;
    std::string extensionNamespace;
};

}

#endif // EXPRESSIONMETADATA_H
