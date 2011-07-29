/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */
#include "GDL/ExpressionsCodeGeneration.h"
#include "GDL/StrExpressionInstruction.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/GDExpressionParser.h"
#include "GDL/EventsCodeGenerator.h"
#include "GDL/ExtensionBase.h"
#include "GDL/Scene.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/EventsCodeGenerationContext.h"
#include "GDL/CommonTools.h"

using namespace std;

CallbacksForGeneratingExpressionCode::CallbacksForGeneratingExpressionCode(string & plainExpression_, const Game & game_, const Scene & scene_, EventsCodeGenerationContext & context_) :
    plainExpression(plainExpression_),
    game(game_),
    scene(scene_),
    context(context_)
{

}

void CallbacksForGeneratingExpressionCode::OnConstantToken(string text)
{
    plainExpression += text;
};

void CallbacksForGeneratingExpressionCode::OnStaticFunction(string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo)
{
    context.AddIncludeFile(expressionInfo.cppCallingInformation.optionalIncludeFile);
    vector<string> parameters = EventsCodeGenerator::GenerateParametersCodes(game, scene, instruction.parameters, expressionInfo.parameters, context);

    string parametersStr;
    for (unsigned int i = 0;i<parameters.size();++i)
    {
        if ( i != 0 ) parametersStr += ", ";
        parametersStr += parameters[i];
    }

    plainExpression += expressionInfo.cppCallingInformation.cppCallingName+"("+parametersStr+")";
};

void CallbacksForGeneratingExpressionCode::OnStaticFunction(string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo)
{
    context.AddIncludeFile(expressionInfo.cppCallingInformation.optionalIncludeFile);

    //TODO : A bit of hack here..
    //Special case : Function without name is a litteral string.
    if ( functionName.empty() )
    {
        if ( instruction.parameters.empty() ) return;
        plainExpression += "\""+EventsCodeGenerator::ConvertToCppString(instruction.parameters[0].GetPlainString())+"\"";

        return;
    }

    //Prepare parameters
    vector<string> parameters = EventsCodeGenerator::GenerateParametersCodes(game, scene, instruction.parameters, expressionInfo.parameters, context);
    string parametersStr;
    for (unsigned int i = 0;i<parameters.size();++i)
    {
        if ( i != 0 ) parametersStr += ", ";
        parametersStr += parameters[i];
    }

    plainExpression += expressionInfo.cppCallingInformation.cppCallingName+"("+parametersStr+")";
};

void CallbacksForGeneratingExpressionCode::OnObjectFunction(string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo)
{
    context.AddIncludeFile(expressionInfo.cppCallingInformation.optionalIncludeFile);
    if ( instruction.parameters.empty() ) return;

    //Prepare parameters
    vector<string> parameters = EventsCodeGenerator::GenerateParametersCodes(game, scene, instruction.parameters, expressionInfo.parameters, context);
    string parametersStr;
    for (unsigned int i = 1;i<parameters.size();++i)
    {
        if ( i != 1 ) parametersStr += ", ";
        parametersStr += parameters[i];
    }

    context.ObjectNeeded(instruction.parameters[0].GetPlainString());

    //Cast the object if needed
    string objectType = GetTypeOfObject(game, scene, instruction.parameters[0].GetPlainString());
    const ExtensionObjectInfos & objInfo = GDpriv::ExtensionsManager::GetInstance()->GetObjectInfo(objectType);
    bool castNeeded = !objInfo.cppClassName.empty();

    //Build string to access the object
    context.AddIncludeFile(objInfo.optionalIncludeFile);
    string objectStr;
    if ( context.currentObject == instruction.parameters[0].GetPlainString() )
    {
        if ( !castNeeded )
            objectStr = instruction.parameters[0].GetPlainString()+"objects[i]";
        else
            objectStr = "static_cast<"+objInfo.cppClassName+"*>("+instruction.parameters[0].GetPlainString()+"objects[i])";
    }
    else
    {
        if ( !castNeeded )
            objectStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? 0 :"+ instruction.parameters[0].GetPlainString()+"objects[0]";
        else
            objectStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? 0 : "+"static_cast<"+objInfo.cppClassName+"*>("+instruction.parameters[0].GetPlainString()+"objects[0])";
    }

    plainExpression += "("+objectStr+"->"+expressionInfo.cppCallingInformation.cppCallingName+"("+parametersStr+"))";
};

void CallbacksForGeneratingExpressionCode::OnObjectFunction(string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo)
{
    context.AddIncludeFile(expressionInfo.cppCallingInformation.optionalIncludeFile);
    if ( instruction.parameters.empty() ) return;

    //Prepare parameters
    vector<string> parameters = EventsCodeGenerator::GenerateParametersCodes(game, scene, instruction.parameters, expressionInfo.parameters, context);
    string parametersStr;
    for (unsigned int i = 1;i<parameters.size();++i)
    {
        if ( i != 1 ) parametersStr += ", ";
        parametersStr += parameters[i];
    }

    context.ObjectNeeded(instruction.parameters[0].GetPlainString());

    //Cast the object if needed
    string objectType = GetTypeOfObject(game, scene, instruction.parameters[0].GetPlainString());
    const ExtensionObjectInfos & objInfo = GDpriv::ExtensionsManager::GetInstance()->GetObjectInfo(objectType);
    bool castNeeded = !objInfo.cppClassName.empty();

    //Build string to access the object
    context.AddIncludeFile(objInfo.optionalIncludeFile);
    string objectStr;
    if ( context.currentObject == instruction.parameters[0].GetPlainString() )
    {
        if ( !castNeeded )
            objectStr = instruction.parameters[0].GetPlainString()+"objects[i]";
        else
            objectStr = "static_cast<"+objInfo.cppClassName+"*>("+instruction.parameters[0].GetPlainString()+"objects[i])";
    }
    else
    {
        if ( !castNeeded )
            objectStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? 0 :"+ instruction.parameters[0].GetPlainString()+"objects[0]";
        else
            objectStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? 0 : "+"static_cast<"+objInfo.cppClassName+"*>("+instruction.parameters[0].GetPlainString()+"objects[0])";
    }

    plainExpression += "("+objectStr+"->"+expressionInfo.cppCallingInformation.cppCallingName+"("+parametersStr+"))";
};

void CallbacksForGeneratingExpressionCode::OnObjectAutomatismFunction(string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo)
{
    context.AddIncludeFile(expressionInfo.cppCallingInformation.optionalIncludeFile);
    if ( instruction.parameters.size() < 2 ) return;

    //Prepare parameters
    vector<string> parameters = EventsCodeGenerator::GenerateParametersCodes(game, scene, instruction.parameters, expressionInfo.parameters, context);
    string parametersStr;
    for (unsigned int i = 2;i<parameters.size();++i)
    {
        if ( i != 2 ) parametersStr += ", ";
        parametersStr += parameters[i];
    }

    context.ObjectNeeded(instruction.parameters[0].GetPlainString());

    //Cast the automatism
    string automatismType = GetTypeOfAutomatism(game, scene, instruction.parameters[1].GetPlainString());
    const AutomatismInfo & autoInfo = GDpriv::ExtensionsManager::GetInstance()->GetAutomatismInfo(automatismType);
    bool castNeeded = !autoInfo.cppClassName.empty();

    //Build string to access the automatism
    context.AddIncludeFile(autoInfo.optionalIncludeFile);
    string autoStr;
    if ( context.currentObject == instruction.parameters[0].GetPlainString() )
    {
        if ( !castNeeded )
            autoStr = instruction.parameters[0].GetPlainString()+"objects[i]->GetAutomatismRawPointer(\""+instruction.parameters[1].GetPlainString()+"\")";
        else
            autoStr = "static_cast<"+autoInfo.cppClassName+"*>("+instruction.parameters[0].GetPlainString()+"objects[i]->GetAutomatismRawPointer(\""+instruction.parameters[1].GetPlainString()+"\"))";
    }
    else
    {
        if ( !castNeeded )
            autoStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? 0 :"+ instruction.parameters[0].GetPlainString()+"objects[0]->GetAutomatismRawPointer(\""+instruction.parameters[1].GetPlainString()+"\")";
        else
            autoStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? 0 : "+"static_cast<"+autoInfo.cppClassName+"*>("+instruction.parameters[0].GetPlainString()+"objects[0]->GetAutomatismRawPointer(\""+instruction.parameters[1].GetPlainString()+"\"))";
    }

    plainExpression += "("+autoStr+"->"+expressionInfo.cppCallingInformation.cppCallingName+"("+parametersStr+"))";
};

void CallbacksForGeneratingExpressionCode::OnObjectAutomatismFunction(string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo)
{
    context.AddIncludeFile(expressionInfo.cppCallingInformation.optionalIncludeFile);
    if ( instruction.parameters.size() < 2 ) return;

    //Prepare parameters
    vector<string> parameters = EventsCodeGenerator::GenerateParametersCodes(game, scene, instruction.parameters, expressionInfo.parameters, context);
    string parametersStr;
    for (unsigned int i = 2;i<parameters.size();++i)
    {
        if ( i != 2 ) parametersStr += ", ";
        parametersStr += parameters[i];
    }

    context.ObjectNeeded(instruction.parameters[0].GetPlainString());

    //Cast the automatism
    string automatismType = GetTypeOfAutomatism(game, scene, instruction.parameters[1].GetPlainString());
    const AutomatismInfo & autoInfo = GDpriv::ExtensionsManager::GetInstance()->GetAutomatismInfo(automatismType);
    bool castNeeded = !autoInfo.cppClassName.empty();

    //Build string to access the automatism
    context.AddIncludeFile(autoInfo.optionalIncludeFile);
    string autoStr;
    if ( context.currentObject == instruction.parameters[0].GetPlainString() )
    {
        if ( !castNeeded )
            autoStr = instruction.parameters[0].GetPlainString()+"objects[i]->GetAutomatismRawPointer(\""+instruction.parameters[1].GetPlainString()+"\")";
        else
            autoStr = "static_cast<"+autoInfo.cppClassName+"*>("+instruction.parameters[0].GetPlainString()+"objects[i]->GetAutomatismRawPointer(\""+instruction.parameters[1].GetPlainString()+"\"))";
    }
    else
    {
        if ( !castNeeded )
            autoStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? 0 :"+ instruction.parameters[0].GetPlainString()+"objects[0]->GetAutomatismRawPointer(\""+instruction.parameters[1].GetPlainString()+"\")";
        else
            autoStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? 0 : "+"static_cast<"+autoInfo.cppClassName+"*>("+instruction.parameters[0].GetPlainString()+"objects[0]->GetAutomatismRawPointer(\""+instruction.parameters[1].GetPlainString()+"\"))";
    }

    plainExpression += "("+autoStr+"->"+expressionInfo.cppCallingInformation.cppCallingName+"("+parametersStr+"))";
};

bool CallbacksForGeneratingExpressionCode::OnSubMathExpression(const Game & game, const Scene & scene, GDExpression & expression)
{
    string newExpression;

    CallbacksForGeneratingExpressionCode callbacks(newExpression, game, scene, context);

    GDExpressionParser parser(expression.GetPlainString());
    if ( !parser.ParseMathExpression(game, scene, callbacks) )
    {
        #if defined(GD_IDE_ONLY)
        firstErrorStr = callbacks.firstErrorStr;
        firstErrorPos = callbacks.firstErrorPos;
        #endif
        return false;
    }

    expression = GDExpression(newExpression);
    return true;
}

bool CallbacksForGeneratingExpressionCode::OnSubTextExpression(const Game & game, const Scene & scene, GDExpression & expression)
{
    string newExpression;

    CallbacksForGeneratingExpressionCode callbacks(newExpression, game, scene, context);

    GDExpressionParser parser(expression.GetPlainString());
    if ( !parser.ParseTextExpression(game, scene, callbacks) )
    {
        cout << expression.GetPlainString() << endl;
        #if defined(GD_IDE_ONLY)
        firstErrorStr = callbacks.firstErrorStr;
        firstErrorPos = callbacks.firstErrorPos;
        #endif
        return false;
    }

    expression = GDExpression(newExpression);
    return true;
}
