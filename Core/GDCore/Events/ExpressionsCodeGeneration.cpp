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
#include "GDCore/Events/AutomatismMetadata.h"
#include "GDCore/CommonTools.h"

using namespace std;

namespace gd
{

CallbacksForGeneratingExpressionCode::CallbacksForGeneratingExpressionCode(string & plainExpression_,
                                                                           EventsCodeGenerator & codeGenerator_,
                                                                           EventsCodeGenerationContext & context_) :
    plainExpression(plainExpression_),
    codeGenerator(codeGenerator_),
    context(context_)
{

}

void CallbacksForGeneratingExpressionCode::OnConstantToken(string text)
{
    plainExpression += text;
};
void CallbacksForGeneratingExpressionCode::OnOperator(string text)
{
    plainExpression += text;
};
void CallbacksForGeneratingExpressionCode::OnNumber(string text)
{
    if (text.find_first_of(".e") == std::string::npos)
        text += ".0";

    plainExpression += text;
};

void CallbacksForGeneratingExpressionCode::OnStaticFunction(string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo)
{
    codeGenerator.AddIncludeFile(expressionInfo.codeExtraInformation.optionalIncludeFile);

    //Launch custom code generator if needed
    if ( expressionInfo.codeExtraInformation.optionalCustomCodeGenerator != std::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>() )
    { plainExpression += expressionInfo.codeExtraInformation.optionalCustomCodeGenerator->GenerateCode(parameters, codeGenerator, context); return; }

    //Special case: For strings expressions, function without name is a string.
    if ( GetReturnType() == "string" && functionName.empty() )
    {
        if ( parameters.empty() ) return;
        plainExpression += codeGenerator.ConvertToStringExplicit(parameters[0].GetPlainString());

        return;
    }

    //Prepare parameters
    vector<string> parametersCode = codeGenerator.GenerateParametersCodes(parameters, expressionInfo.parameters, context);
    string parametersStr;
    for (unsigned int i = 0;i<parametersCode.size();++i)
    {
        if ( i != 0 ) parametersStr += ", ";
        parametersStr += parametersCode[i];
    }

    if(GetReturnType() == "string" && !expressionInfo.returnUtf8)
        plainExpression += "gd::utf8::FromLocaleString("; //Add the conversion function if the expression returns locale strings

    plainExpression += expressionInfo.codeExtraInformation.functionCallName+"("+parametersStr+")";

    if(GetReturnType() == "string" && !expressionInfo.returnUtf8)
        plainExpression += ")";
};

void CallbacksForGeneratingExpressionCode::OnObjectFunction(string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo)
{
    const gd::Project & project = codeGenerator.GetProject();
    const gd::Layout & scene = codeGenerator.GetLayout();

    codeGenerator.AddIncludeFile(expressionInfo.codeExtraInformation.optionalIncludeFile);
    if ( parameters.empty() ) return;

    //Launch custom code generator if needed
    if ( expressionInfo.codeExtraInformation.optionalCustomCodeGenerator != std::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>() )
    { plainExpression += expressionInfo.codeExtraInformation.optionalCustomCodeGenerator->GenerateCode(parameters, codeGenerator, context); return; }

    //Prepare parameters
    vector<string> parametersCode = codeGenerator.GenerateParametersCodes(parameters, expressionInfo.parameters, context);
    string parametersStr;
    for (unsigned int i = 1;i<parametersCode.size();++i)
    {
        if ( i != 1 ) parametersStr += ", ";
        parametersStr += parametersCode[i];
    }

    std::string output = GetReturnType() == "string" ? "\"\"" : "0";

    //Get object(s) concerned by function call
    std::vector<std::string> realObjects = codeGenerator. ExpandObjectsName(parameters[0].GetPlainString(), context);
    for (unsigned int i = 0;i<realObjects.size();++i)
    {
        context.ObjectsListNeeded(realObjects[i]);

        string objectType = gd::GetTypeOfObject(project, scene, realObjects[i]);
        const ObjectMetadata & objInfo = MetadataProvider::GetObjectMetadata(codeGenerator.GetPlatform(), objectType);

        //Build string to access the object
        codeGenerator.AddIncludeFiles(objInfo.includeFiles);
        output = codeGenerator.GenerateObjectFunctionCall(realObjects[i], objInfo, expressionInfo.codeExtraInformation, parametersStr, output, context);
    }

    if(GetReturnType() == "string" && !expressionInfo.returnUtf8)
        plainExpression += "gd::utf8::FromLocaleString("; //Add the conversion function if the expression returns locale strings

    plainExpression += output;

    if(GetReturnType() == "string" && !expressionInfo.returnUtf8)
        plainExpression += ")";
};

void CallbacksForGeneratingExpressionCode::OnObjectAutomatismFunction(string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo)
{
    const gd::Project & project = codeGenerator.GetProject();
    const gd::Layout & scene = codeGenerator.GetLayout();

    codeGenerator.AddIncludeFile(expressionInfo.codeExtraInformation.optionalIncludeFile);
    if ( parameters.size() < 2 ) return;

    //Launch custom code generator if needed
    if ( expressionInfo.codeExtraInformation.optionalCustomCodeGenerator != std::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>() )
    { plainExpression += expressionInfo.codeExtraInformation.optionalCustomCodeGenerator->GenerateCode(parameters, codeGenerator, context); return; }

    //Prepare parameters
    vector<string> parametersCode = codeGenerator.GenerateParametersCodes(parameters, expressionInfo.parameters, context);
    string parametersStr;
    for (unsigned int i = 2;i<parametersCode.size();++i)
    {
        if ( i != 2 ) parametersStr += ", ";
        parametersStr += parametersCode[i];
    }

    //Get object(s) concerned by function call
    std::vector<std::string> realObjects = codeGenerator. ExpandObjectsName(parameters[0].GetPlainString(), context);

    std::string output = GetReturnType() == "string" ? "\"\"" : "0";
    for (unsigned int i = 0;i<realObjects.size();++i)
    {
        context.ObjectsListNeeded(realObjects[i]);

        //Cast the object if needed
        string automatismType = gd::GetTypeOfAutomatism(project, scene, parameters[1].GetPlainString());
        const AutomatismMetadata & autoInfo = MetadataProvider::GetAutomatismMetadata(codeGenerator.GetPlatform(), automatismType);

        //Build string to access the automatism
        codeGenerator.AddIncludeFiles(autoInfo.includeFiles);
        output = codeGenerator.GenerateObjectAutomatismFunctionCall(realObjects[i], parameters[1].GetPlainString(), autoInfo, expressionInfo.codeExtraInformation, parametersStr, output, context);
    }

    if(GetReturnType() == "string" && !expressionInfo.returnUtf8)
        plainExpression += "gd::utf8::FromLocaleString("; //Add the conversion function if the expression returns locale strings

    plainExpression += output;

    if(GetReturnType() == "string" && !expressionInfo.returnUtf8)
        plainExpression += ")";
};

bool CallbacksForGeneratingExpressionCode::OnSubMathExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression)
{
    string newExpression;

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
    string newExpression;

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
