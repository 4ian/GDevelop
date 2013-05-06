
#include <utility>
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/IDE/MetadataProvider.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/ExpressionParser.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ObjectMetadata.h"
#include "GDCore/Events/AutomatismMetadata.h"

using namespace std;

namespace gd
{

/**
 * Generate call using a relational operator.
 * Relational operator position is deduced from parameters type.
 * Rhs hand side expression is assumed to be placed just before the relational operator.
 *
 * \param Information about the instruction
 * \param Arguments, in their C++ form.
 * \param String to be placed at the start of the call ( the function to be called typically ). Example : MyObject->Get
 * \param Arguments will be generated starting from this number. For example, set this to 1 to skip the first argument.
 */
string EventsCodeGenerator::GenerateRelationalOperatorCall(const gd::InstructionMetadata & instrInfos, const vector<string> & arguments, const string & callStartString, unsigned int startFromArgument)
{
    unsigned int relationalOperatorIndex = 0;
    for (unsigned int i = startFromArgument+1;i<instrInfos.parameters.size();++i)
    {
        if ( instrInfos.parameters[i].type == "relationalOperator" )
            relationalOperatorIndex = i;
    }
    if ( relationalOperatorIndex == 0 )
    {
        ReportError();
        return "";
    }

    string relationalOperator = arguments[relationalOperatorIndex];
    if ( relationalOperator.size() > 2 ) relationalOperator = relationalOperator.substr(1, relationalOperator.length()-1-1); //Relational operator contains quote which must be removed.

    string rhs = arguments[relationalOperatorIndex-1];
    string argumentsStr;
    for (unsigned int i = startFromArgument;i<arguments.size();++i)
    {
        if ( i != relationalOperatorIndex && i != relationalOperatorIndex-1)
        {
            if ( !argumentsStr.empty() ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }
    }

    return callStartString+"("+argumentsStr+") "+relationalOperator+" "+rhs;
}

/**
 * Generate call using an operator ( =,+,-,*,/ ).
 * Operator position is deduced from parameters type.
 * Expression is assumed to be placed just before the operator.
 *
 * \param Information about the instruction
 * \param Arguments, in their C++ form.
 * \param String to be placed at the start of the call ( the function to be called typically ). Example : MyObject->Set
 * \param String to be placed at the start of the call of the getter ( the "getter" function to be called typically ). Example : MyObject->Get
 * \param Arguments will be generated starting from this number. For example, set this to 1 to skip the first argument.
 */
string EventsCodeGenerator::GenerateOperatorCall(const gd::InstructionMetadata & instrInfos, const vector<string> & arguments, const string & callStartString, const string & getterStartString, unsigned int startFromArgument)
{
    unsigned int operatorIndex = 0;
    for (unsigned int i = startFromArgument+1;i<instrInfos.parameters.size();++i)
    {
        if ( instrInfos.parameters[i].type == "operator" )
            operatorIndex = i;
    }

    if ( operatorIndex == 0 )
    {
        ReportError();
        return "";
    }

    string operatorStr = arguments[operatorIndex];
    if ( operatorStr.size() > 2 ) operatorStr = operatorStr.substr(1, operatorStr.length()-1-1); //Operator contains quote which must be removed.

    string rhs = arguments[operatorIndex-1];

    //Generate arguments for calling the "getter" function
    string getterArgumentsStr;
    for (unsigned int i = startFromArgument;i<arguments.size();++i)
    {
        if ( i != operatorIndex && i != operatorIndex-1)
        {
            if ( !getterArgumentsStr.empty() ) getterArgumentsStr += ", ";
            getterArgumentsStr += arguments[i];
        }
    }

    //Generate arguments for calling the function ("setter")
    string argumentsStr;
    for (unsigned int i = startFromArgument;i<arguments.size();++i)
    {
        if ( i != operatorIndex && i != operatorIndex-1) //Generate classic arguments
        {
            if ( !argumentsStr.empty() ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }
        if ( i == operatorIndex-1 )
        {
            if ( !argumentsStr.empty() ) argumentsStr += ", ";
            if ( operatorStr != "=" )
                argumentsStr += getterStartString+"("+getterArgumentsStr+") "+operatorStr+" ("+rhs+")";
            else
                argumentsStr += rhs;
        }
    }

    return callStartString+"("+argumentsStr+")";
}


/**
 * Generate call using a compound assignment operators ( =,+=,-=,*=,/= ).
 * Operator position is deduced from parameters type.
 * Expression is assumed to be placed just before the operator.
 *
 * \param Information about the instruction
 * \param Arguments, in their C++ form.
 * \param String to be placed at the start of the call ( the function to be called typically ). Example : MyObject->Set
 * \param Arguments will be generated starting from this number. For example, set this to 1 to skip the first argument.
 */
string EventsCodeGenerator::GenerateCompoundOperatorCall(const gd::InstructionMetadata & instrInfos, const vector<string> & arguments, const string & callStartString, unsigned int startFromArgument)
{
    unsigned int operatorIndex = 0;
    for (unsigned int i = startFromArgument+1;i<instrInfos.parameters.size();++i)
    {
        if ( instrInfos.parameters[i].type == "operator" )
            operatorIndex = i;
    }

    if ( operatorIndex == 0 )
    {
        ReportError();
        return "";
    }

    string operatorStr = arguments[operatorIndex];
    if ( operatorStr.size() > 2 ) operatorStr = operatorStr.substr(1, operatorStr.length()-1-1); //Operator contains quote which must be removed.

    string rhs = arguments[operatorIndex-1];

    //Generate real operator string.
    if ( operatorStr == "+" ) operatorStr = "+=";
    else if ( operatorStr == "-" ) operatorStr = "-=";
    else if ( operatorStr == "/" ) operatorStr = "/=";
    else if ( operatorStr == "*" ) operatorStr = "*=";

    //Generate arguments for calling the function ("setter")
    string argumentsStr;
    for (unsigned int i = startFromArgument;i<arguments.size();++i)
    {
        if ( i != operatorIndex && i != operatorIndex-1) //Generate classic arguments
        {
            if ( !argumentsStr.empty() ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }
    }

    return callStartString+"("+argumentsStr+") "+operatorStr+" ("+rhs+")";
}


std::string EventsCodeGenerator::GenerateConditionCode(gd::Instruction & condition, std::string returnBoolean, EventsCodeGenerationContext & context)
{
    std::string conditionCode;

    gd::InstructionMetadata instrInfos = MetadataProvider::GetConditionMetadata(platform, condition.GetType());

    if ( !instrInfos.codeExtraInformation.optionalIncludeFile.empty() )
        AddIncludeFile(instrInfos.codeExtraInformation.optionalIncludeFile);

    if ( instrInfos.codeExtraInformation.optionalCustomCodeGenerator != boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>() )
    {
        conditionCode += GenerateReferenceToBoolean("conditionTrue", returnBoolean);
        conditionCode += instrInfos.codeExtraInformation.optionalCustomCodeGenerator->GenerateCode(condition, *this, context);

        return GenerateScopeBegin(context, returnBoolean)+conditionCode+GenerateScopeEnd(context, returnBoolean);
    }

    //Insert code only parameters and be sure there is no lack of parameter.
    while(condition.GetParameters().size() < instrInfos.parameters.size())
    {
        vector < gd::Expression > parameters = condition.GetParameters();
        parameters.push_back(gd::Expression(""));
        condition.SetParameters(parameters);
    }

    //Verify that there are not mismatch between object type in parameters
    for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
    {
        if ( instrInfos.parameters[pNb].type == "object" && instrInfos.parameters[pNb].supplementaryInformation != "" )
        {
            string objectInParameter = condition.GetParameter(pNb).GetPlainString();
            if (gd::GetTypeOfObject(project, scene, objectInParameter) != instrInfos.parameters[pNb].supplementaryInformation )
            {
                cout << "Bad object type in a parameter of a condition " << condition.GetType() << endl;
                cout << "Condition wanted " << instrInfos.parameters[pNb].supplementaryInformation << endl;
                cout << "Condition wanted " << instrInfos.parameters[pNb].supplementaryInformation << " of type " << instrInfos.parameters[pNb].supplementaryInformation << endl;
                cout << "Condition has received " << objectInParameter << " of type " << gd::GetTypeOfObject(project, scene, objectInParameter) << endl;

                condition.SetParameter(pNb, gd::Expression(""));
                condition.SetType("");
            }
        }
    }

    //Generate static condition if available
    if ( MetadataProvider::HasCondition(platform, condition.GetType()))
    {
        //Prepare arguments
        std::vector < std::pair<std::string, std::string> > supplementaryParametersTypes;
        supplementaryParametersTypes.push_back(std::make_pair("conditionInverted", condition.IsInverted() ? "true" : "false"));
        vector<string> arguments = GenerateParametersCodes(condition.GetParameters(), instrInfos.parameters, context, &supplementaryParametersTypes);

        //Generate call
        string predicat;
        if ( instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string")
        {
            predicat = GenerateRelationalOperatorCall(instrInfos, arguments, instrInfos.codeExtraInformation.functionCallName);
        }
        else
        {
            string argumentsStr;
            for (unsigned int i = 0;i<arguments.size();++i)
            {
                if ( i != 0 ) argumentsStr += ", ";
                argumentsStr += arguments[i];
            }

            predicat = instrInfos.codeExtraInformation.functionCallName+"("+argumentsStr+")";
        }

        //Add logical not if needed
        bool conditionAlreadyTakeCareOfInversion = false;
        for (unsigned int i = 0;i<instrInfos.parameters.size();++i) //Some conditions already have a "conditionInverted" parameter
        {
            if( instrInfos.parameters[i].type == "conditionInverted" )
                conditionAlreadyTakeCareOfInversion = true;
        }
        if (!conditionAlreadyTakeCareOfInversion && condition.IsInverted()) predicat = GenerateNegatedPredicat(predicat);

        //Generate condition code
        conditionCode += returnBoolean+" = "+predicat+";\n";
    }

    //Generate object condition if available
    string objectName = condition.GetParameters().empty() ? "" : condition.GetParameter(0).GetPlainString();
    string objectType = gd::GetTypeOfObject(project, scene, objectName);
    if ( !objectName.empty() && MetadataProvider::HasObjectCondition(platform, objectType, condition.GetType()) && !instrInfos.parameters.empty())
    {
        std::vector<std::string> realObjects = ExpandObjectsName(objectName, context);
        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            //Set up the context
            const ObjectMetadata & objInfo = MetadataProvider::GetObjectMetadata(platform, objectType);
            AddIncludeFile(objInfo.optionalIncludeFile);
            context.SetCurrentObject(realObjects[i]);
            context.ObjectsListNeeded(realObjects[i]);

            //Prepare arguments and generate the condition whole code
            vector<string> arguments = GenerateParametersCodes(condition.GetParameters(), instrInfos.parameters, context);
            conditionCode += GenerateObjectListObjectCondition(realObjects[i], objInfo, arguments, instrInfos, returnBoolean, condition.IsInverted());

            context.SetNoCurrentObject();
        }
    }

    //Generate automatism condition if available
    string automatismType = gd::GetTypeOfAutomatism(project, scene, condition.GetParameters().size() < 2 ? "" : condition.GetParameter(1).GetPlainString());
    if (MetadataProvider::HasAutomatismCondition(platform, automatismType, condition.GetType()) && instrInfos.parameters.size() >= 2)
    {
        std::vector<std::string> realObjects = ExpandObjectsName(objectName, context);
        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            //Setup context
            const AutomatismMetadata & autoInfo = MetadataProvider::GetAutomatismMetadata(platform, automatismType);
            AddIncludeFile(autoInfo.optionalIncludeFile);
            context.SetCurrentObject(realObjects[i]);
            context.ObjectsListNeeded(realObjects[i]);

            //Prepare arguments and generate the whole condition code
            vector<string> arguments = GenerateParametersCodes(condition.GetParameters(), instrInfos.parameters, context);
            conditionCode += GenerateObjectListAutomatismCondition(realObjects[i], condition.GetParameter(1).GetPlainString(), autoInfo, arguments,
                                                               instrInfos, returnBoolean, condition.IsInverted());

            context.SetNoCurrentObject();
        }
    }

    return conditionCode;
}

/**
 * Generate code for a list of conditions.
 * Bools containing conditions results are named conditionXIsTrue.
 */
string EventsCodeGenerator::GenerateConditionsListCode(vector < gd::Instruction > & conditions, EventsCodeGenerationContext & context)
{
    string outputCode;

    for (unsigned int i = 0;i<conditions.size();++i)
        outputCode += GenerateBooleanInitializationToFalse("condition"+ToString(i)+"IsTrue");

    for (unsigned int cId =0;cId < conditions.size();++cId)
    {
        gd::InstructionMetadata instrInfos = MetadataProvider::GetConditionMetadata(platform, conditions[cId].GetType());

        string conditionCode = GenerateConditionCode(conditions[cId], "condition"+ToString(cId)+"IsTrue", context);
        if ( !conditions[cId].GetType().empty() )
        {
            for (unsigned int i = 0;i<cId;++i) //Skip conditions if one condition is false. //TODO : Can be optimized
            {
                if (i == 0) outputCode += "if ( "; else outputCode += " && ";
                outputCode += "condition"+ToString(i)+"IsTrue";
                if (i == cId-1) outputCode += ") ";
            }
            if ( !instrInfos.codeExtraInformation.doNotEncloseInstructionCodeWithinBrackets ) outputCode += GenerateScopeBegin(context);
            outputCode += conditionCode;
            if ( !instrInfos.codeExtraInformation.doNotEncloseInstructionCodeWithinBrackets ) outputCode += GenerateScopeEnd(context);
        }
    }

    return outputCode;
}

/**
 * Generate code for an action.
 */
std::string EventsCodeGenerator::GenerateActionCode(gd::Instruction & action, EventsCodeGenerationContext & context)
{
    string actionCode;

    gd::InstructionMetadata instrInfos = MetadataProvider::GetActionMetadata(platform, action.GetType());

    if ( !instrInfos.codeExtraInformation.optionalIncludeFile.empty() )
        AddIncludeFile(instrInfos.codeExtraInformation.optionalIncludeFile);

    if ( instrInfos.codeExtraInformation.optionalCustomCodeGenerator != boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>() )
    {
        return instrInfos.codeExtraInformation.optionalCustomCodeGenerator->GenerateCode(action, *this, context);
    }

    //Be sure there is no lack of parameter.
    while(action.GetParameters().size() < instrInfos.parameters.size())
    {
        vector < gd::Expression > parameters = action.GetParameters();
        parameters.push_back(gd::Expression(""));
        action.SetParameters(parameters);
    }

    //Verify that there are not mismatch between object type in parameters
    for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
    {
        if ( instrInfos.parameters[pNb].type == "object" && instrInfos.parameters[pNb].supplementaryInformation != "" )
        {
            string objectInParameter = action.GetParameter(pNb).GetPlainString();
            if (gd::GetTypeOfObject(project, scene, objectInParameter) != instrInfos.parameters[pNb].supplementaryInformation )
            {
                cout << "Bad object type in parameter "+ToString(pNb)+" of an action " << action.GetType() << endl;
                cout << "Action wanted " << instrInfos.parameters[pNb].supplementaryInformation << " of type " << instrInfos.parameters[pNb].supplementaryInformation << endl;
                cout << "Action has received " << objectInParameter << " of type " << gd::GetTypeOfObject(project, scene, objectInParameter) << endl;

                action.SetParameter(pNb, gd::Expression(""));
                action.SetType("");
            }
        }
    }

    //Call static function first if available
    if (MetadataProvider::HasAction(platform, action.GetType()))
    {
        vector<string> arguments = GenerateParametersCodes(action.GetParameters(), instrInfos.parameters, context);

        //Generate call
        string call;
        if ( instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string" )
        {
            if ( instrInfos.codeExtraInformation.accessType == gd::InstructionMetadata::ExtraInformation::MutatorAndOrAccessor )
                call = GenerateOperatorCall(instrInfos, arguments, instrInfos.codeExtraInformation.functionCallName, instrInfos.codeExtraInformation.optionalAssociatedInstruction);
            else
                call = GenerateCompoundOperatorCall(instrInfos, arguments, instrInfos.codeExtraInformation.functionCallName);
        }
        else
        {
            string argumentsStr;
            for (unsigned int i = 0;i<arguments.size();++i)
            {
                if ( i != 0 ) argumentsStr += ", ";
                argumentsStr += arguments[i];
            }

            call = instrInfos.codeExtraInformation.functionCallName+"("+argumentsStr+")";
        }

        actionCode += call+";\n";
    }

    //Call object function if available
    string objectName = action.GetParameters().empty() ? "" : action.GetParameter(0).GetPlainString();
    string objectType = gd::GetTypeOfObject(project, scene, objectName);
    if (MetadataProvider::HasObjectAction(platform, objectType, action.GetType()) && !instrInfos.parameters.empty())
    {
        std::vector<std::string> realObjects = ExpandObjectsName(objectName, context);
        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            //Setup context
            const ObjectMetadata & objInfo = MetadataProvider::GetObjectMetadata(platform, objectType);
            AddIncludeFile(objInfo.optionalIncludeFile);
            context.SetCurrentObject(realObjects[i]);
            context.ObjectsListNeeded(realObjects[i]);

            //Prepare arguments and generate the whole action code
            vector<string> arguments = GenerateParametersCodes(action.GetParameters(), instrInfos.parameters, context);
            actionCode += GenerateObjectListObjectAction(realObjects[i], objInfo, arguments, instrInfos);

            context.SetNoCurrentObject();
        }
    }

    //Affection to an automatism member function if found
    string automatismType = gd::GetTypeOfAutomatism(project, scene, action.GetParameters().size() < 2 ? "" : action.GetParameter(1).GetPlainString());
    if (MetadataProvider::HasAutomatismAction(platform, automatismType, action.GetType()) && instrInfos.parameters.size() >= 2)
    {
        std::vector<std::string> realObjects = ExpandObjectsName(objectName, context);
        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            //Setup context
            const AutomatismMetadata & autoInfo = MetadataProvider::GetAutomatismMetadata(platform, automatismType);
            AddIncludeFile(autoInfo.optionalIncludeFile);
            context.SetCurrentObject(realObjects[i]);
            context.ObjectsListNeeded(realObjects[i]);

            //Prepare arguments and generate the whole action code
            vector<string> arguments = GenerateParametersCodes(action.GetParameters(), instrInfos.parameters, context);
            actionCode += GenerateObjectListAutomatismAction(realObjects[i], action.GetParameter(1).GetPlainString(), autoInfo, arguments, instrInfos);

            context.SetNoCurrentObject();
        }
    }

    return actionCode;
}

/**
 * Generate actions code.
 */
string EventsCodeGenerator::GenerateActionsListCode(vector < gd::Instruction > & actions, EventsCodeGenerationContext & context)
{
    string outputCode;
    for (unsigned int aId =0;aId < actions.size();++aId)
    {
        gd::InstructionMetadata instrInfos = MetadataProvider::GetActionMetadata(platform, actions[aId].GetType());

        string actionCode = GenerateActionCode(actions[aId], context);

        if ( !instrInfos.codeExtraInformation.doNotEncloseInstructionCodeWithinBrackets ) outputCode += GenerateScopeBegin(context);
        if ( !actions[aId].GetType().empty() ) outputCode += actionCode;
        if ( !instrInfos.codeExtraInformation.doNotEncloseInstructionCodeWithinBrackets ) outputCode += GenerateScopeEnd(context);
    }

    return outputCode;
}

/**
 */
vector<string> EventsCodeGenerator::GenerateParametersCodes(vector < gd::Expression > parameters, const vector < gd::ParameterMetadata > & parametersInfo, EventsCodeGenerationContext & context, std::vector < std::pair<std::string, std::string> > * supplementaryParametersTypes)
{
    vector<string> arguments;

    while(parameters.size() < parametersInfo.size())
        parameters.push_back(gd::Expression(""));

    for (unsigned int pNb = 0;pNb < parametersInfo.size() && pNb < parameters.size();++pNb)
    {
        string argOutput;

        if ( parameters[pNb].GetPlainString().empty() && parametersInfo[pNb].optional  )
            parameters[pNb] = gd::Expression(parametersInfo[pNb].defaultValue);

        if ( parametersInfo[pNb].type == "expression" || parametersInfo[pNb].type == "camera" )
        {
            CallbacksForGeneratingExpressionCode callbacks(argOutput, *this, context);

            gd::ExpressionParser parser(parameters[pNb].GetPlainString());
            if ( !parser.ParseMathExpression(platform, project, scene, callbacks) )
            {
                cout << "Error :" << parser.firstErrorStr << " in: "<< parameters[pNb].GetPlainString() << endl;

                argOutput = "0";
            }

            if (argOutput.empty()) argOutput = "0";
        }
        else if ( parametersInfo[pNb].type == "string" || parametersInfo[pNb].type == "layer" || parametersInfo[pNb].type == "color" || parametersInfo[pNb].type == "file" || parametersInfo[pNb].type == "joyaxis" )
        {
            CallbacksForGeneratingExpressionCode callbacks(argOutput, *this, context);

            gd::ExpressionParser parser(parameters[pNb].GetPlainString());
            if ( !parser.ParseStringExpression(platform, project, scene, callbacks) )
            {
                cout << "Error in text expression" << parser.firstErrorStr << endl;

                argOutput = "\"\"";
            }

            if (argOutput.empty()) argOutput = "\"\"";
        }
        else if ( parametersInfo[pNb].type == "relationalOperator" )
        {
            argOutput += parameters[pNb].GetPlainString() == "=" ? "==" :parameters[pNb].GetPlainString();
            if ( argOutput != "==" && argOutput != "<" && argOutput != ">" && argOutput != "<=" && argOutput != ">=" && argOutput != "!=")
            {
                cout << "Warning: Bad relational operator: Set to == by default." << endl;
                argOutput = "==";
            }

            argOutput = "\""+argOutput+"\"";
        }
        else if ( parametersInfo[pNb].type == "operator" )
        {
            argOutput += parameters[pNb].GetPlainString();
            if ( argOutput != "=" && argOutput != "+" && argOutput != "-" && argOutput != "/" && argOutput != "*")
            {
                cout << "Warning: Bad operator: Set to = by default." << endl;
                argOutput = "=";
            }

            argOutput = "\""+argOutput+"\"";
        }
        else if ( parametersInfo[pNb].type == "object" || parametersInfo[pNb].type == "automatism" )
        {
            argOutput = "\""+ConvertToCppString(parameters[pNb].GetPlainString())+"\"";
        }
        else if ( parametersInfo[pNb].type == "key" )
        {
            argOutput = "\""+ConvertToCppString(parameters[pNb].GetPlainString())+"\"";
        }
        else if (parametersInfo[pNb].type == "objectvar" || parametersInfo[pNb].type == "scenevar" || parametersInfo[pNb].type == "globalvar" ||
                 parametersInfo[pNb].type == "password" || parametersInfo[pNb].type == "musicfile" || parametersInfo[pNb].type == "soundfile" ||
                 parametersInfo[pNb].type == "police")
        {
            argOutput = "\""+ConvertToCppString(parameters[pNb].GetPlainString())+"\"";
        }
        else if ( parametersInfo[pNb].type == "mouse" )
        {
            argOutput = "\""+ConvertToCppString(parameters[pNb].GetPlainString())+"\"";
        }
        else if ( parametersInfo[pNb].type == "yesorno" )
        {
            argOutput += (parameters[pNb].GetPlainString() == "yes" || parameters[pNb].GetPlainString() == "oui") ? "true" : "false";
        }
        else if ( parametersInfo[pNb].type == "trueorfalse" )
        {
            argOutput += (parameters[pNb].GetPlainString() == "True" || parameters[pNb].GetPlainString() == "Vrai") ? "true" : "false";
        }
        //Code only parameter type
        else if ( parametersInfo[pNb].type == "currentScene" )
        {
            argOutput += "*runtimeContext->scene";
        }
        //Code only parameter type
        else if ( parametersInfo[pNb].type == "inlineCode" )
        {
            argOutput += parametersInfo[pNb].supplementaryInformation;
        }
        //Code only parameter type
        else if ( parametersInfo[pNb].type == "mapOfObjectListsOfParameter" )
        {
            unsigned int i = ToInt(parametersInfo[pNb].supplementaryInformation);
            if ( i < parameters.size() )
            {
                std::vector<std::string> realObjects = ExpandObjectsName(parameters[i].GetPlainString(), context);

                argOutput += "runtimeContext->ClearObjectListsMap()";
                for (unsigned int i = 0;i<realObjects.size();++i)
                {
                    context.ObjectsListNeeded(realObjects[i]);
                    argOutput += ".AddObjectListToMap(\""+ConvertToCppString(realObjects[i])+"\", "+ManObjListName(realObjects[i])+")";
                }
                argOutput += ".ReturnObjectListsMap()";
            }
            else
            {
                argOutput += "runtimeContext->ClearObjectListsMap().ReturnObjectListsMap()";
                ReportError();
                cout << "Error: Could not get objects for a parameter" << endl;
            }
        }
        //Code only parameter type
        else if ( parametersInfo[pNb].type == "mapOfObjectListsOfParameterWithoutPicking" )
        {
            unsigned int i = ToInt(parametersInfo[pNb].supplementaryInformation);
            if ( i < parameters.size() )
            {
                std::vector<std::string> realObjects = ExpandObjectsName(parameters[i].GetPlainString(), context);

                argOutput += "runtimeContext->ClearObjectListsMap()";
                for (unsigned int i = 0;i<realObjects.size();++i)
                {
                    context.EmptyObjectsListNeeded(realObjects[i]);
                    argOutput += ".AddObjectListToMap(\""+ConvertToCppString(realObjects[i])+"\", "+ManObjListName(realObjects[i])+")";
                }
                argOutput += ".ReturnObjectListsMap()";
            }
            else
            {
                argOutput += "runtimeContext->ClearObjectListsMap().ReturnObjectListsMap()";
                ReportError();
                cout << "Error: Could not get objects for a parameter" << endl;
            }
        }
        //Code only parameter type
        else if ( parametersInfo[pNb].type == "ptrToObjectOfParameter")
        {
            unsigned int i = ToInt(parametersInfo[pNb].supplementaryInformation);
            if ( i < parameters.size() )
            {
                std::vector<std::string> realObjects = ExpandObjectsName(parameters[i].GetPlainString(), context);

                if ( find(realObjects.begin(), realObjects.end(), context.GetCurrentObject()) != realObjects.end() && !context.GetCurrentObject().empty())
                {
                    //If object currently used by instruction is available, use it directly.
                    argOutput += ManObjListName(context.GetCurrentObject())+"[i]";
                }
                else
                {
                    for (unsigned int i = 0;i<realObjects.size();++i)
                    {
                        context.ObjectsListNeeded(realObjects[i]);
                        argOutput += "(!"+ManObjListName(realObjects[i])+".empty() ? "+ManObjListName(realObjects[i])+"[0] : ";
                    }
                    argOutput += "NULL";
                    for (unsigned int i = 0;i<realObjects.size();++i)
                        argOutput += ")";
                }
            }
            else
            {
                argOutput += "NULL";
                ReportError();
                cout << "Error: Could not get objects for a parameter" << endl;
            }
        }
        else
        {
            //Try supplementary types if provided
            if ( supplementaryParametersTypes )
            {
                for (unsigned int i = 0;i<supplementaryParametersTypes->size();++i)
                {
                    if ( (*supplementaryParametersTypes)[i].first == parametersInfo[pNb].type )
                        argOutput += (*supplementaryParametersTypes)[i].second;
                }
            }

            //Type unknown
            if (argOutput.empty())
            {
                if ( !parametersInfo[pNb].type.empty() ) cout << "Warning: Unknown type of parameter \"" << parametersInfo[pNb].type << "\".";
                argOutput += "\""+ConvertToCppString(parameters[pNb].GetPlainString())+"\"";
            }
        }

        arguments.push_back(argOutput);
    }

    return arguments;
}

std::string EventsCodeGenerator::GenerateObjectsDeclarationCode(EventsCodeGenerationContext & context)
{
    std::string declarationsCode;
    for ( set<string>::iterator it = context.objectsListsToBeDeclared.begin() ; it != context.objectsListsToBeDeclared.end(); ++it )
    {
        if ( context.alreadyDeclaredObjectsLists.find(*it) == context.alreadyDeclaredObjectsLists.end() )
        {
            declarationsCode += "std::vector<RuntimeObject*> "+ManObjListName(*it)
                                +" = runtimeContext->GetObjectsRawPointers(\""+ConvertToCppString(*it)+"\");\n";
            context.alreadyDeclaredObjectsLists.insert(*it);
        }
        else
        {
            //Could normally be done in one line, but clang sometimes miscompile it.
            declarationsCode += "std::vector<RuntimeObject*> & "+ManObjListName(*it)+"T = "+ManObjListName(*it)+";\n";
            declarationsCode += "std::vector<RuntimeObject*> "+ManObjListName(*it)+" = "+ManObjListName(*it)+"T;\n";
        }
    }
    for ( set<string>::iterator it = context.emptyObjectsListsToBeDeclared.begin() ; it != context.emptyObjectsListsToBeDeclared.end(); ++it )
    {
        if ( context.alreadyDeclaredObjectsLists.find(*it) == context.alreadyDeclaredObjectsLists.end() )
        {
            declarationsCode += "std::vector<RuntimeObject*> "+ManObjListName(*it)+";\n";
            context.alreadyDeclaredObjectsLists.insert(*it);
        }
        else
        {
            //Could normally be done in one line, but clang sometimes miscompile it.
            declarationsCode += "std::vector<RuntimeObject*> & "+ManObjListName(*it)+"T = "+ManObjListName(*it)+";\n";
            declarationsCode += "std::vector<RuntimeObject*> "+ManObjListName(*it)+" = "+ManObjListName(*it)+"T;\n";
        }
    }

    return declarationsCode ;
}

/**
 * Generate events list code.
 */
string EventsCodeGenerator::GenerateEventsListCode(vector < gd::BaseEventSPtr > & events, const EventsCodeGenerationContext & parentContext)
{
    string output;

    for ( unsigned int eId = 0; eId < events.size();++eId )
    {
        //Each event has its own context : Objects picked in an event are totally different than the one picked in another.
        gd::EventsCodeGenerationContext context;
        context.InheritsFrom(parentContext); //Events in the same "level" share the same context as their parent.

        string eventCoreCode = events[eId]->GenerateEventCode(*this, context);
        string scopeBegin = GenerateScopeBegin(context);
        string scopeEnd = GenerateScopeEnd(context);
        string declarationsCode = GenerateObjectsDeclarationCode(context);

        output += "\n"+ scopeBegin +"\n" + declarationsCode + "\n" + eventCoreCode + "\n"+ scopeEnd +"\n";
    }

    return output;
}

std::string EventsCodeGenerator::ConvertToCppString(std::string plainString)
{
    for (size_t i = 0;i<plainString.length();++i)
    {
        if ( plainString[i] == '\n')
        {
            plainString.erase(plainString.begin()+i);

            if ( i < plainString.length() )
                plainString.insert(i, "\\n");
            else
                plainString += ("\\n");
        }
        else if ( plainString[i] == '\\' )
        {
            if ( i+1 >= plainString.length() || plainString[i+1] != '\"' )
            {
                if ( i+1 < plainString.length() )
                    plainString.insert(i+1, "\\");
                else
                    plainString += ("\\");

                ++i;
            }
        }
        else if ( plainString[i] == '"' )
        {
            plainString.insert(i, "\\");
            ++i;
        }
    }

    return plainString;
}

std::vector<std::string> EventsCodeGenerator::ExpandObjectsName(const std::string & objectName, const EventsCodeGenerationContext & context) const
{
    std::vector<std::string> realObjects;
    vector< gd::ObjectGroup >::const_iterator globalGroup = find_if(project.GetObjectGroups().begin(),
                                                                    project.GetObjectGroups().end(),
                                                                    bind2nd(gd::GroupHasTheSameName(), objectName));
    vector< gd::ObjectGroup >::const_iterator sceneGroup = find_if(scene.GetObjectGroups().begin(),
                                                                   scene.GetObjectGroups().end(),
                                                                   bind2nd(gd::GroupHasTheSameName(), objectName));

    if ( globalGroup != project.GetObjectGroups().end() )
        realObjects = (*globalGroup).GetAllObjectsNames();
    else if ( sceneGroup != scene.GetObjectGroups().end() )
        realObjects = (*sceneGroup).GetAllObjectsNames();
    else
        realObjects.push_back(objectName);

    //If current object is present, use it and only it.
    if ( find(realObjects.begin(), realObjects.end(), context.GetCurrentObject()) != realObjects.end() )
    {
        realObjects.clear();
        realObjects.push_back(context.GetCurrentObject());
    }

    return realObjects;
}

/**
 * Remove events not executed
 */
void EventsCodeGenerator::DeleteUselessEvents(vector < gd::BaseEventSPtr > & events)
{
    for ( unsigned int eId = events.size()-1; eId < events.size();--eId )
    {
        if ( events[eId]->CanHaveSubEvents() ) //Process sub events, if any
            DeleteUselessEvents(events[eId]->GetSubEvents());

        if ( !events[eId]->IsExecutable() || events[eId]->IsDisabled() ) //Delete events that are not executable
            events.erase(events.begin() + eId);
    }
}

/**
 * Call preprocessing method of each event
 */
void EventsCodeGenerator::PreprocessEventList( vector < gd::BaseEventSPtr > & listEvent )
{
    for ( unsigned int i = 0;i < listEvent.size();++i )
    {
        listEvent[i]->Preprocess(*this, listEvent, i);
        if ( listEvent[i]->CanHaveSubEvents() )
            PreprocessEventList( listEvent[i]->GetSubEvents());
    }
}

void EventsCodeGenerator::ReportError()
{
    errorOccurred = true;
}

std::string EventsCodeGenerator::GenerateCurrentObjectFunctionCall(std::string objectListName,
                                                      const gd::ObjectMetadata & objMetadata,
                                                      std::string functionCallName,
                                                      std::string parametersStr)
{
    return "TODO (GenerateCurrentObjectFunctionCall)";
}

std::string EventsCodeGenerator::GenerateNotPickedObjectFunctionCall(std::string objectListName,
                                                        const gd::ObjectMetadata & objMetadata,
                                                        std::string functionCallName,
                                                        std::string parametersStr,
                                                        std::string defaultOutput)
{
    return "TODO (GenerateNotPickedObjectFunctionCall)";
}

std::string EventsCodeGenerator::GenerateCurrentObjectAutomatismFunctionCall(std::string objectListName,
                                                                                       std::string automatismName,
                                                      const gd::AutomatismMetadata & autoInfo,
                                                      std::string functionCallName,
                                                      std::string parametersStr)
{
    return "TODO (GenerateCurrentObjectAutomatismFunctionCall)";
}

std::string EventsCodeGenerator::GenerateNotPickedObjectAutomatismFunctionCall(std::string objectListName,
                                                                                       std::string automatismName,
                                                        const gd::AutomatismMetadata & autoInfo,
                                                        std::string functionCallName,
                                                        std::string parametersStr,
                                                        std::string defaultOutput)
{
    return "TODO (GenerateNotPickedObjectAutomatismFunctionCall)";
}

std::string EventsCodeGenerator::GenerateObjectListObjectCondition(const std::string & objectName,
                                                                   const gd::ObjectMetadata & objInfo,
                                                                   const std::vector<std::string> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos,
                                                                   const std::string & returnBoolean,
                                                                   bool conditionInverted)
{
    std::string conditionCode;

    //Prepare call
    //Add a static_cast if necessary
    string objectFunctionCallNamePart =
    ( !instrInfos.parameters[0].supplementaryInformation.empty() ) ?
        "static_cast<"+objInfo.cppClassName+"*>("+ManObjListName(objectName)+"[i])->"+instrInfos.codeExtraInformation.functionCallName
    :   ManObjListName(objectName)+"[i]->"+instrInfos.codeExtraInformation.functionCallName;

    //Create call
    string predicat;
    if ( (instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string") )
    {
        predicat = GenerateRelationalOperatorCall(instrInfos, arguments, objectFunctionCallNamePart, 1);
    }
    else
    {
        string argumentsStr;
        for (unsigned int i = 1;i<arguments.size();++i)
        {
            if ( i != 1 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        predicat = objectFunctionCallNamePart+"("+argumentsStr+")";
    }
    if ( conditionInverted ) predicat = GenerateNegatedPredicat(predicat);

    return "For each picked object \""+objectName+"\", check "+predicat+".\n";
}

std::string EventsCodeGenerator::GenerateObjectListAutomatismCondition(const std::string & objectName,
                                                                       const std::string & automatismName,
                                                                   const gd::AutomatismMetadata & autoInfo,
                                                                   const std::vector<std::string> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos,
                                                                   const std::string & returnBoolean,
                                                                   bool conditionInverted)
{
    std::string conditionCode;

    //Create call
    string predicat;
    if ( (instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string") )
    {
        predicat = GenerateRelationalOperatorCall(instrInfos, arguments, "", 2);
    }
    else
    {
        string argumentsStr;
        for (unsigned int i = 2;i<arguments.size();++i)
        {
            if ( i != 2 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        predicat = "("+argumentsStr+")";
    }
    if ( conditionInverted ) predicat = GenerateNegatedPredicat(predicat);

    return "For each picked object \""+objectName+"\", check "+predicat+" for automatism \""+automatismName+"\".\n";
}

std::string EventsCodeGenerator::GenerateObjectListObjectAction(const std::string & objectName,
                                                                   const gd::ObjectMetadata & objInfo,
                                                                   const std::vector<std::string> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos)
{
    std::string actionCode;

    //Create call
    string call;
    if ( (instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string") )
    {
        if ( instrInfos.codeExtraInformation.accessType == gd::InstructionMetadata::ExtraInformation::MutatorAndOrAccessor )
            call = GenerateOperatorCall(instrInfos, arguments, instrInfos.codeExtraInformation.functionCallName, instrInfos.codeExtraInformation.optionalAssociatedInstruction,2);
        else
            call = GenerateCompoundOperatorCall(instrInfos, arguments, instrInfos.codeExtraInformation.functionCallName,2);

        return "For each picked object \""+objectName+"\", call "+call+".\n";
    }
    else
    {
        string argumentsStr;
        for (unsigned int i = 2;i<arguments.size();++i)
        {
            if ( i != 2 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        call = instrInfos.codeExtraInformation.functionCallName+"("+argumentsStr+")";
        return "For each picked object \""+objectName+"\", call "+call+"("+argumentsStr+").\n";
    }

}

std::string EventsCodeGenerator::GenerateObjectListAutomatismAction(const std::string & objectName,
                                                                    const std::string & automatismName,
                                                                   const gd::AutomatismMetadata & autoInfo,
                                                                   const std::vector<std::string> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos)
{
    std::string actionCode;

    //Create call
    string call;
    if ( (instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string") )
    {
        if ( instrInfos.codeExtraInformation.accessType == gd::InstructionMetadata::ExtraInformation::MutatorAndOrAccessor )
            call = GenerateOperatorCall(instrInfos, arguments, instrInfos.codeExtraInformation.functionCallName, instrInfos.codeExtraInformation.optionalAssociatedInstruction,2);
        else
            call = GenerateCompoundOperatorCall(instrInfos, arguments, instrInfos.codeExtraInformation.functionCallName,2);
        return "For each picked object \""+objectName+"\", call "+call
                +" for automatism \""+automatismName+"\".\n";
    }
    else
    {
        string argumentsStr;
        for (unsigned int i = 2;i<arguments.size();++i)
        {
            if ( i != 2 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        call = instrInfos.codeExtraInformation.functionCallName+"("+argumentsStr+")";
        return "For each picked object \""+objectName+"\", call "+call+"("+argumentsStr+")"
                +" for automatism \""+automatismName+"\".\n";
    }

}

}
