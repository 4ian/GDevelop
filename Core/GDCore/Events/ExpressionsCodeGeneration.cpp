/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "ExpressionsCodeGeneration.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/IDE/MetadataProvider.h"
#include "GDCore/Events/ExpressionParser.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/Events/ObjectMetadata.h"
#include "GDCore/Events/BehaviorMetadata.h"
#include "GDCore/CommonTools.h"

using namespace std;

namespace gd
{

CallbacksForGeneratingExpressionCode::CallbacksForGeneratingExpressionCode(gd::String & plainExpression_,
                                                                           EventsCodeGenerator & codeGenerator_,
                                                                           EventsCodeGenerationContext & context_) :
    plainExpression(plainExpression_),
    codeGenerator(codeGenerator_),
    context(context_)
{

}

void CallbacksForGeneratingExpressionCode::OnConstantToken(gd::String text)
{
    plainExpression += text;
};

void CallbacksForGeneratingExpressionCode::OnStaticFunction(gd::String functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo)
{
    codeGenerator.AddIncludeFile(expressionInfo.codeExtraInformation.optionalIncludeFile);

    //Launch custom code generator if needed
    if (expressionInfo.codeExtraInformation.HasCustomCodeGenerator())
    {
        plainExpression += expressionInfo.codeExtraInformation.customCodeGenerator(parameters, codeGenerator, context);
        return;
    }

    //Special case: For strings expressions, function without name is a string.
    if ( GetReturnType() == "string" && functionName.empty() )
    {
        if ( parameters.empty() ) return;
        plainExpression += codeGenerator.ConvertToStringExplicit(parameters[0].GetPlainString());

        return;
    }

    //Prepare parameters
    std::vector<gd::String> parametersCode = codeGenerator.GenerateParametersCodes(parameters, expressionInfo.parameters, context);
    gd::String parametersStr;
    for (std::size_t i = 0;i<parametersCode.size();++i)
    {
        if ( i != 0 ) parametersStr += ", ";
        parametersStr += parametersCode[i];
    }


    plainExpression += expressionInfo.codeExtraInformation.functionCallName+"("+parametersStr+")";
};

void CallbacksForGeneratingExpressionCode::OnObjectFunction(gd::String functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo)
{
    const gd::Project & project = codeGenerator.GetProject();
    const gd::Layout & scene = codeGenerator.GetLayout();

    codeGenerator.AddIncludeFile(expressionInfo.codeExtraInformation.optionalIncludeFile);
    if ( parameters.empty() ) return;

    //Launch custom code generator if needed
    if ( expressionInfo.codeExtraInformation.HasCustomCodeGenerator() )
    {
        plainExpression += expressionInfo.codeExtraInformation.customCodeGenerator(parameters, codeGenerator, context);
        return;
    }

    //Prepare parameters
    std::vector<gd::String> parametersCode = codeGenerator.GenerateParametersCodes(parameters, expressionInfo.parameters, context);
    gd::String parametersStr;
    for (std::size_t i = 1;i<parametersCode.size();++i)
    {
        if ( i != 1 ) parametersStr += ", ";
        parametersStr += parametersCode[i];
    }

    gd::String output = GetReturnType() == "string" ? "\"\"" : "0";

    //Get object(s) concerned by function call
    std::vector<gd::String> realObjects = codeGenerator. ExpandObjectsName(parameters[0].GetPlainString(), context);
    for (std::size_t i = 0;i<realObjects.size();++i)
    {
        context.ObjectsListNeeded(realObjects[i]);

        gd::String objectType = gd::GetTypeOfObject(project, scene, realObjects[i]);
        const ObjectMetadata & objInfo = MetadataProvider::GetObjectMetadata(codeGenerator.GetPlatform(), objectType);

        //Build gd::String to access the object
        codeGenerator.AddIncludeFiles(objInfo.includeFiles);
        output = codeGenerator.GenerateObjectFunctionCall(realObjects[i], objInfo, expressionInfo.codeExtraInformation, parametersStr, output, context);
    }

    plainExpression += output;
};

void CallbacksForGeneratingExpressionCode::OnObjectBehaviorFunction(gd::String functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo)
{
    const gd::Project & project = codeGenerator.GetProject();
    const gd::Layout & scene = codeGenerator.GetLayout();

    codeGenerator.AddIncludeFile(expressionInfo.codeExtraInformation.optionalIncludeFile);
    if ( parameters.size() < 2 ) return;

    //Launch custom code generator if needed
    if ( expressionInfo.codeExtraInformation.HasCustomCodeGenerator() )
    {
        plainExpression += expressionInfo.codeExtraInformation.customCodeGenerator(parameters, codeGenerator, context);
        return;
    }

    //Prepare parameters
    std::vector<gd::String> parametersCode = codeGenerator.GenerateParametersCodes(parameters, expressionInfo.parameters, context);
    gd::String parametersStr;
    for (std::size_t i = 2;i<parametersCode.size();++i)
    {
        if ( i != 2 ) parametersStr += ", ";
        parametersStr += parametersCode[i];
    }

    //Get object(s) concerned by function call
    std::vector<gd::String> realObjects = codeGenerator. ExpandObjectsName(parameters[0].GetPlainString(), context);

    gd::String output = GetReturnType() == "string" ? "\"\"" : "0";
    for (std::size_t i = 0;i<realObjects.size();++i)
    {
        context.ObjectsListNeeded(realObjects[i]);

        //Cast the object if needed
        gd::String behaviorType = gd::GetTypeOfBehavior(project, scene, parameters[1].GetPlainString());
        const BehaviorMetadata & autoInfo = MetadataProvider::GetBehaviorMetadata(codeGenerator.GetPlatform(), behaviorType);

        //Build gd::String to access the behavior
        codeGenerator.AddIncludeFiles(autoInfo.includeFiles);
        output = codeGenerator.GenerateObjectBehaviorFunctionCall(realObjects[i], parameters[1].GetPlainString(), autoInfo, expressionInfo.codeExtraInformation, parametersStr, output, context);
    }


    plainExpression += output;
};

bool CallbacksForGeneratingExpressionCode::OnSubMathExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression)
{
    gd::String newExpression;

    CallbacksForGeneratingExpressionCode callbacks(newExpression, codeGenerator, context);

    gd::ExpressionParser parser(expression.GetPlainString());
    if ( !parser.ParseMathExpression(platform, project, layout, callbacks) )
    {
        #if defined(GD_IDE_ONLY)
        firstErrorStr = callbacks.firstErrorStr;
        firstErrorPos = callbacks.firstErrorPos;
        #endif
        return false;
    }

    return true;
}

bool CallbacksForGeneratingExpressionCode::OnSubTextExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression)
{
    gd::String newExpression;

    CallbacksForGeneratingExpressionCode callbacks(newExpression, codeGenerator, context);

    gd::ExpressionParser parser(expression.GetPlainString());
    if ( !parser.ParseStringExpression(platform, project, layout, callbacks) )
    {
        #if defined(GD_IDE_ONLY)
        firstErrorStr = callbacks.firstErrorStr;
        firstErrorPos = callbacks.firstErrorPos;
        #endif
        return false;
    }

    return true;
}

}
