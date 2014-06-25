/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef EXPRESSIONMETADATA_H
#define EXPRESSIONMETADATA_H
#if defined(GD_IDE_ONLY)
#include <string>
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/InstructionMetadata.h"
#include <boost/shared_ptr.hpp>
#if !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h>
#endif
class wxBitmap;
namespace gd { class Layout; }

namespace gd
{

/**
 * \brief Defines information about how generate code for an expression
 */
class ExpressionCodeGenerationInformation
{
public:
    ExpressionCodeGenerationInformation() : staticFunction(false) {};
    virtual ~ExpressionCodeGenerationInformation() {};

    /**
     * \brief Set the function name which will be used when generating the code.
     */
    ExpressionCodeGenerationInformation & SetFunctionName(const std::string & cppCallingName_)
    {
        functionCallName = cppCallingName_;
        return *this;
    }

    /**
     * \brief Set that the function is static
     */
    ExpressionCodeGenerationInformation & SetStatic()
    {
        staticFunction = true;
        return *this;
    }

    /**
     * \brief Set that the function is located in a specific include file
     */
    ExpressionCodeGenerationInformation & SetIncludeFile(const std::string & optionalIncludeFile_)
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

    /**
     * \brief Set that the function must be generated using a custom code generator.
     */
    ExpressionCodeGenerationInformation & SetCustomCodeGenerator(boost::shared_ptr<CustomCodeGenerator> codeGenerator)
    {
        optionalCustomCodeGenerator = codeGenerator;
        return *this;
    }

    bool staticFunction;
    std::string functionCallName;
    std::string optionalIncludeFile;
    boost::shared_ptr<CustomCodeGenerator> optionalCustomCodeGenerator;
};

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
     * \brief Set the expression as not shown in the IDE.
     */
    ExpressionMetadata & SetHidden();

    /**
     * \brief Set the group of the instruction in the IDE.
     */
    ExpressionMetadata & SetGroup(const std::string & str)
    {
        group = str;
        return *this;
    }

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

    ExpressionCodeGenerationInformation codeExtraInformation;

    /** Don't use this constructor. Only here to fullfil std::map requirements
     */
    ExpressionMetadata() : shown(false) {};

    bool IsShown() const { return shown; }
    const std::string & GetFullName() const { return fullname; }
    const std::string & GetDescription() const { return description; }
    const std::string & GetGroup() const { return group; }
#if !defined(GD_NO_WX_GUI)
    const wxBitmap & GetBitmapIcon() const { return smallicon; }
#endif

private:
    std::string fullname;
    std::string description;
    std::string group;
    bool shown;
#if !defined(GD_NO_WX_GUI)
    wxBitmap smallicon;
#endif
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
     * \brief Set the expression as not shown in the IDE.
     */
    StrExpressionMetadata & SetHidden();

    /**
     * \brief Set the group of the instruction in the IDE.
     */
    StrExpressionMetadata & SetGroup(const std::string & str)
    {
        group = str;
        return *this;
    }

    std::vector < gd::ParameterMetadata > parameters;

    /**
     * \see gd::InstructionMetadata::AddParameter
     */
    gd::StrExpressionMetadata & AddParameter(const std::string & type, const std::string & description, const std::string & optionalObjectType = "", bool parameterIsOptional = false);

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

    ExpressionCodeGenerationInformation codeExtraInformation;

    /** Don't use this constructor. Only here to fulfill std::map requirements
     */
    StrExpressionMetadata() : shown(false) {};

    bool IsShown() const { return shown; }
    const std::string & GetFullName() const { return fullname; }
    const std::string & GetDescription() const { return description; }
    const std::string & GetGroup() const { return group; }
#if !defined(GD_NO_WX_GUI)
    const wxBitmap & GetBitmapIcon() const { return smallicon; }
#endif

private:
    std::string fullname;
    std::string description;
    std::string group;
    bool shown;
#if !defined(GD_NO_WX_GUI)
    wxBitmap smallicon;
#endif
    std::string extensionNamespace;
};

}

#endif
#endif // EXPRESSIONMETADATA_H
