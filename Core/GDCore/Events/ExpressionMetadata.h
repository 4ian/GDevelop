/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef EXPRESSIONMETADATA_H
#define EXPRESSIONMETADATA_H
#if defined(GD_IDE_ONLY)
#include <string>
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/InstructionMetadata.h"
#include <memory>
#if !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h>
#endif
class wxBitmap;
namespace gd { class Layout; }

namespace gd
{

/**
 * \brief Information about how generate code for an expression
 */
class ExpressionCodeGenerationInformation
{
public:
    ExpressionCodeGenerationInformation() : staticFunction(false) {};
    virtual ~ExpressionCodeGenerationInformation() {};

    /**
     * \brief Set the function name which will be used when generating the code.
     * \param functionName the name of the function to call
     */
    ExpressionCodeGenerationInformation & SetFunctionName(const std::string & functionName)
    {
        functionCallName = functionName;
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
    ExpressionCodeGenerationInformation & SetCustomCodeGenerator(std::shared_ptr<CustomCodeGenerator> codeGenerator)
    {
        optionalCustomCodeGenerator = codeGenerator;
        return *this;
    }

    bool staticFunction;
    std::string functionCallName;
    std::string optionalIncludeFile;
    std::shared_ptr<CustomCodeGenerator> optionalCustomCodeGenerator;
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
     * Set the default value used in editor (or if an optional parameter is empty during code generation) for the latest added parameter.
     *
     * \see AddParameter
     */
    ExpressionMetadata & SetDefaultValue(std::string defaultValue_)
    {
        if ( !parameters.empty() ) parameters.back().defaultValue = defaultValue_;
        return *this;
    };

    /**
     * \brief Declare the last added paramete not able to receivre UTF8 strings.
     *
     * \see AddParameter
     */
    ExpressionMetadata & CantUseUtf8()
    {
        if ( !parameters.empty() ) parameters.back().canUseUtf8 = false;
        return *this;
    };

    /**
     * \brief Declare that the expression returns a locale string (not encoded in UTF8)
     */
    ExpressionMetadata & DontReturnUtf8()
    {
        returnUtf8 = false;
        return *this;
    };
    bool returnUtf8;

    /**
     * \brief Set the function that should be called when generating the source
     * code from events.
     * \param functionName the name of the function to call
     * \note Shortcut for `codeExtraInformation.SetFunctionName`.
     */
    ExpressionCodeGenerationInformation & SetFunctionName(const std::string & functionName)
    {
        return codeExtraInformation.SetFunctionName(functionName);
    }

    ExpressionCodeGenerationInformation codeExtraInformation;

    /** Don't use this constructor. Only here to fullfil std::map requirements
     */
    ExpressionMetadata() : shown(false) {};

    bool IsShown() const { return shown; }
    const std::string & GetFullName() const { return fullname; }
    const std::string & GetDescription() const { return description; }
    const std::string & GetGroup() const { return group; }
    const std::string & GetSmallIconFilename() const { return smallIconFilename; }
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
    std::string smallIconFilename;
    std::string extensionNamespace;
};

}

#endif
#endif // EXPRESSIONMETADATA_H
