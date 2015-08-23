/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef EXPRESSIONMETADATA_H
#define EXPRESSIONMETADATA_H
#if defined(GD_IDE_ONLY)
#include "GDCore/String.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/InstructionMetadata.h"
#include <memory>
#include <functional>
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
    ExpressionCodeGenerationInformation() : staticFunction(false), hasCustomCodeGenerator(false) {};
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

    /**
     * \brief Set that the function must be generated using a custom code generator.
     */
    ExpressionCodeGenerationInformation & SetCustomCodeGenerator(std::function<gd::String(const std::vector<gd::Expression> & parameters,
        gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)> codeGenerator)
    {
        hasCustomCodeGenerator = true;
        customCodeGenerator = codeGenerator;
        return *this;
    }

    ExpressionCodeGenerationInformation & RemoveCustomCodeGenerator()
    {
        hasCustomCodeGenerator = false;
        std::function<gd::String(const std::vector<gd::Expression> & parameters,
        gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)> emptyFunction;
        customCodeGenerator = emptyFunction;
        return *this;
    }

    bool HasCustomCodeGenerator() const { return hasCustomCodeGenerator; }

    bool staticFunction;
    gd::String functionCallName;
    gd::String optionalIncludeFile;
    bool hasCustomCodeGenerator;
    std::function<gd::String(
        const std::vector<gd::Expression> & parameters,
        gd::EventsCodeGenerator & codeGenerator,
        gd::EventsCodeGenerationContext & context)> customCodeGenerator;
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
    const gd::ParameterMetadata & GetParameter(std::size_t id) const { return parameters[id]; };
    gd::ParameterMetadata & GetParameter(std::size_t id) { return parameters[id]; };
    std::size_t GetParametersCount() const { return parameters.size(); };

    std::vector < gd::ParameterMetadata > parameters;
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
