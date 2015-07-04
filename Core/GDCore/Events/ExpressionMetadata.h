/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef EXPRESSIONMETADATA_H
#define EXPRESSIONMETADATA_H
#if defined(GD_IDE_ONLY)
#include <GDCore/Utf8String.h>
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
    ExpressionCodeGenerationInformation & SetFunctionName(const gd::String & functionName)
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
    ExpressionCodeGenerationInformation & SetIncludeFile(const gd::String & optionalIncludeFile_)
    {
        optionalIncludeFile = optionalIncludeFile_;
        return *this;
    }

    /** \brief Class used to redefine instruction code generation
     */
    class CustomCodeGenerator
    {
    public:
        virtual gd::String GenerateCode(const std::vector<gd::Expression> & parameters, gd::EventsCodeGenerator & codeGenerator_, gd::EventsCodeGenerationContext & context) {return "";};
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
    gd::String functionCallName;
    gd::String optionalIncludeFile;
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

    ExpressionMetadata(const gd::String & extensionNamespace,
                        const gd::String & name,
                        const gd::String & fullname,
                        const gd::String & description,
                        const gd::String & group,
                        const gd::String & smallicon);
    virtual ~ExpressionMetadata() {};

    /**
     * \brief Set the expression as not shown in the IDE.
     */
    ExpressionMetadata & SetHidden();

    /**
     * \brief Set the group of the instruction in the IDE.
     */
    ExpressionMetadata & SetGroup(const gd::String & str)
    {
        group = str;
        return *this;
    }

    std::vector < gd::ParameterMetadata > parameters;

    /**
     * \see gd::InstructionMetadata::AddParameter
     */
    gd::ExpressionMetadata & AddParameter(const gd::String & type, const gd::String & description, const gd::String & optionalObjectType = "", bool parameterIsOptional = false);

    /**
     * \see gd::InstructionMetadata::AddCodeOnlyParameter
     */
    gd::ExpressionMetadata & AddCodeOnlyParameter(const gd::String & type, const gd::String & supplementaryInformation);

    /**
     * Set the default value used in editor (or if an optional parameter is empty during code generation) for the latest added parameter.
     *
     * \see AddParameter
     */
    ExpressionMetadata & SetDefaultValue(gd::String defaultValue_)
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
    ExpressionCodeGenerationInformation & SetFunctionName(const gd::String & functionName)
    {
        return codeExtraInformation.SetFunctionName(functionName);
    }

    ExpressionCodeGenerationInformation codeExtraInformation;

    /** Don't use this constructor. Only here to fullfil std::map requirements
     */
    ExpressionMetadata() : shown(false) {};

    bool IsShown() const { return shown; }
    const gd::String & GetFullName() const { return fullname; }
    const gd::String & GetDescription() const { return description; }
    const gd::String & GetGroup() const { return group; }
    const gd::String & GetSmallIconFilename() const { return smallIconFilename; }
#if !defined(GD_NO_WX_GUI)
    const wxBitmap & GetBitmapIcon() const { return smallicon; }
#endif

private:
    gd::String fullname;
    gd::String description;
    gd::String group;
    bool shown;
    
#if !defined(GD_NO_WX_GUI)
    wxBitmap smallicon;
#endif
    gd::String smallIconFilename;
    gd::String extensionNamespace;
};

}

#endif
#endif // EXPRESSIONMETADATA_H
