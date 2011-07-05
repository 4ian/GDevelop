/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <utility>
#include "GDL/EventsCodeGenerator.h"
#include "GDL/conditions.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/RuntimeScene.h"
#include "GDL/CommonInstructions.h"
#include "GDL/CommonTools.h"
#include "GDL/GDExpressionParser.h"
#include "GDL/EventsCodeGenerationContext.h"
#include "GDL/ExpressionsCodeGeneration.h"

using namespace std;

/**
 * Generate call using a relational operator.
 * Relational operator position is deduced from parameters type.
 * Rhs hand side expression is assumed to be placed just before the relational operator.
 *
 * \param Information about the instruction
 * \param Arguments, in their C++ form.
 * \param String to be placed at the start of the call ( the function to be called typically ). Example : MyObject->Get
 * \param Generation context. Used for example to report error.
 * \param Arguments will be generated starting from this number. For example, set this to 1 to skip the first argument.
 */
string GenerateRelationalOperatorCall(const InstructionInfos & instrInfos, vector<string> & arguments, const string & callStartString, EventsCodeGenerationContext & context, unsigned int startFromArgument = 0)
{
    unsigned int relationalOperatorIndex = 0;
    for (unsigned int i = startFromArgument+1;i<instrInfos.parameters.size();++i)
    {
        if ( instrInfos.parameters[i].type == "relationalOperator" )
            relationalOperatorIndex = i;
    }
    if ( relationalOperatorIndex == 0 )
    {
        context.errorOccured = true;
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
 * \param Generation context. Used for example to report error.
 * \param Arguments will be generated starting from this number. For example, set this to 1 to skip the first argument.
 */
string GenerateOperatorCall(const InstructionInfos & instrInfos, vector<string> & arguments, const string & callStartString, const string & getterStartString, EventsCodeGenerationContext & context, unsigned int startFromArgument = 0)
{
    unsigned int operatorIndex = 0;
    for (unsigned int i = startFromArgument+1;i<instrInfos.parameters.size();++i)
    {
        if ( instrInfos.parameters[i].type == "operator" )
            operatorIndex = i;
    }

    if ( operatorIndex == 0 )
    {
        context.errorOccured = true;
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
 * Generate call using an compound assignment operators ( =,+=,-=,*=,/= ).
 * Operator position is deduced from parameters type.
 * Expression is assumed to be placed just before the operator.
 *
 * \param Information about the instruction
 * \param Arguments, in their C++ form.
 * \param String to be placed at the start of the call ( the function to be called typically ). Example : MyObject->Set
 * \param Generation context. Used for example to report error.
 * \param Arguments will be generated starting from this number. For example, set this to 1 to skip the first argument.
 */
string GenerateCompoundOperatorCall(const InstructionInfos & instrInfos, vector<string> & arguments, const string & callStartString, EventsCodeGenerationContext & context, unsigned int startFromArgument = 0)
{
    unsigned int operatorIndex = 0;
    for (unsigned int i = startFromArgument+1;i<instrInfos.parameters.size();++i)
    {
        if ( instrInfos.parameters[i].type == "operator" )
            operatorIndex = i;
    }

    if ( operatorIndex == 0 )
    {
        context.errorOccured = true;
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

/**
 * Generate code for a condition. Result of condition is stored in conditionXIsTrue, with X = conditionIndexInList
 */
std::string EventsCodeGenerator::GenerateConditionCode(const RuntimeScene & scene, Instruction & condition, std::string returnBoolean, EventsCodeGenerationContext & context)
{
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    std::string conditionCode;

    InstructionInfos instrInfos = extensionsManager->GetConditionInfos(condition.GetType());

    if ( !instrInfos.cppCallingInformation.optionalIncludeFile.empty() )
        context.AddIncludeFile(instrInfos.cppCallingInformation.optionalIncludeFile);

    if ( instrInfos.cppCallingInformation.optionalCustomCodeGenerator != boost::shared_ptr<InstructionInfos::CppCallingInformation::CustomCodeGenerator>() )
    {
        conditionCode += "bool & conditionTrue = "+returnBoolean+";\n";
        conditionCode += instrInfos.cppCallingInformation.optionalCustomCodeGenerator->GenerateCode(scene, condition, context);

        return conditionCode;
    }

    //Insert code only parameters and be sure there is no lack of parameter.
    while(condition.GetParameters().size() < instrInfos.parameters.size())
    {
        vector < GDExpression > parameters = condition.GetParameters();
        parameters.push_back(GDExpression(""));
        condition.SetParameters(parameters);
    }

    //Verify that there are not mismatch between object type in parameters
    for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
    {
        if ( instrInfos.parameters[pNb].type == "object" && instrInfos.parameters[pNb].supplementaryInformation != "" )
        {
            string objectInParameter = condition.GetParameter(pNb).GetPlainString();
            if (GetTypeOfObject(*scene.game, scene, objectInParameter) != instrInfos.parameters[pNb].supplementaryInformation )
            {
                cout << "Bad object type in a parameter of a condition " << condition.GetType() << endl;
                cout << "Condition wanted " << instrInfos.parameters[pNb].supplementaryInformation << endl;
                cout << "Condition wanted " << instrInfos.parameters[pNb].supplementaryInformation << " of type " << instrInfos.parameters[pNb].supplementaryInformation << endl;
                cout << "Condition has received " << objectInParameter << " of type " << GetTypeOfObject(*scene.game, scene, objectInParameter) << endl;

                condition.SetParameter(pNb, GDExpression(""));
                condition.SetType("");
            }
        }
    }

    //Generate static condition if available
    if ( extensionsManager->HasCondition(condition.GetType()))
    {
        //Prepare arguments
        std::vector < std::pair<std::string, std::string> > supplementaryParametersTypes;
        supplementaryParametersTypes.push_back(std::make_pair("conditionInverted", condition.IsInverted() ? "true" : "false"));
        vector<string> arguments = GenerateParametersCodes(*scene.game, scene, condition.GetParameters(), instrInfos.parameters, context, &supplementaryParametersTypes);

        //Generate call
        string predicat;
        if ( instrInfos.cppCallingInformation.type == "number" || instrInfos.cppCallingInformation.type == "string")
        {
            predicat = GenerateRelationalOperatorCall(instrInfos, arguments, instrInfos.cppCallingInformation.cppCallingName, context);
        }
        else
        {
            string argumentsStr;
            for (unsigned int i = 0;i<arguments.size();++i)
            {
                if ( i != 0 ) argumentsStr += ", ";
                argumentsStr += arguments[i];
            }

            predicat = instrInfos.cppCallingInformation.cppCallingName+"("+argumentsStr+")";
        }

        //Add logical not if needed
        bool conditionAlreadyTakeCareOfInversion = false;
        for (unsigned int i = 0;i<instrInfos.parameters.size();++i) //Some conditions already have a "conditionInverted" parameter
        {
            if( instrInfos.parameters[i].type == "conditionInverted" )
                conditionAlreadyTakeCareOfInversion = true;
        }
        if (!conditionAlreadyTakeCareOfInversion && condition.IsInverted()) predicat = "!("+predicat+")";

        //Generate condition code
        conditionCode += returnBoolean+" = "+predicat+";\n";
    }

    //Generate object condition if available
    string objectName = condition.GetParameters().empty() ? "" : condition.GetParameter(0).GetPlainString();
    string objectType = GetTypeOfObject(*scene.game, scene, objectName);

    if ( !objectName.empty() && extensionsManager->HasObjectCondition(objectType, condition.GetType()))
    {
        const ExtensionObjectInfos & objInfo = extensionsManager->GetObjectInfo(objectType);

        context.currentObject = objectName;
        context.ObjectNeeded(objectName);

        //Prepare arguments
        vector<string> arguments = GenerateParametersCodes(*scene.game, scene, condition.GetParameters(), instrInfos.parameters, context);

        //Add a static_cast if necessary
        string objectFunctionCallNamePart =
        ( !objInfo.cppClassName.empty() ) ?
            "static_cast<"+objInfo.cppClassName+"*>("+objectName+"objects[i])->"+instrInfos.cppCallingInformation.cppCallingName
        :   objectName+"objects[i]->"+instrInfos.cppCallingInformation.cppCallingName;

        //Create call
        string predicat;
        if ( (instrInfos.cppCallingInformation.type == "number" || instrInfos.cppCallingInformation.type == "string") )
        {
            predicat = GenerateRelationalOperatorCall(instrInfos, arguments, objectFunctionCallNamePart, context, 1);
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
        if ( condition.IsInverted() ) predicat = "!("+predicat+")";

        //Generate whole condition code
        conditionCode += "for(unsigned int i = 0;i < "+objectName+"objects.size();)\n";
        conditionCode += "{\n";
        conditionCode += "    if ( "+predicat+" )\n";
        conditionCode += "    {\n";
        conditionCode += "        "+returnBoolean+" = true;\n";
        conditionCode += "        ++i;\n";
        conditionCode += "    }\n";
        conditionCode += "    else\n";
        conditionCode += "    {\n";
        conditionCode += "        "+objectName+"objects.erase("+objectName+"objects.begin()+i);\n";
        conditionCode += "    }\n";
        conditionCode += "}\n";

        context.currentObject = "";
    }

    //Affection to an automatism member function if found
    string automatismType = GetTypeOfAutomatism(*scene.game, scene, condition.GetParameters().size() < 2 ? "" : condition.GetParameter(1).GetPlainString());

    if (extensionsManager->HasAutomatismCondition(automatismType, condition.GetType()))
    {
        const ExtensionObjectInfos & objInfo = extensionsManager->GetObjectInfo(objectType);

        context.currentObject = objectName;
        context.ObjectNeeded(objectName);

        //Prepare arguments
        vector<string> arguments = GenerateParametersCodes(*scene.game, scene, condition.GetParameters(), instrInfos.parameters, context);

        //Add a static_cast if necessary
        string objectFunctionCallNamePart =
        ( !objInfo.cppClassName.empty() ) ?
            "static_cast<"+objInfo.cppClassName+"*>("+objectName+"objects[i])->GetAutomatism(\""+condition.GetParameter(1).GetPlainString()+"\")->"+instrInfos.cppCallingInformation.cppCallingName
        :   objectName+"objects[i]->GetAutomatism(\""+condition.GetParameter(1).GetPlainString()+"\")->"+instrInfos.cppCallingInformation.cppCallingName;

        //Create call
        string predicat;
        if ( (instrInfos.cppCallingInformation.type == "number" || instrInfos.cppCallingInformation.type == "string") )
        {
            predicat = GenerateRelationalOperatorCall(instrInfos, arguments, objectFunctionCallNamePart, context, 2);
        }
        else
        {
            string argumentsStr;
            for (unsigned int i = 2;i<arguments.size();++i)
            {
                if ( i != 2 ) argumentsStr += ", ";
                argumentsStr += arguments[i];
            }

            predicat = objectFunctionCallNamePart+"("+argumentsStr+")";
        }
        if ( condition.IsInverted() ) predicat = "!("+predicat+")";

        //Verify that object has automatism.
        vector < string > automatisms = GetAutomatismsOfObject(*scene.game, scene, objectName);
        if ( find(automatisms.begin(), automatisms.end(), condition.GetParameter(1).GetPlainString()) == automatisms.end() )
        {
            cout << "Bad automatism requested" << endl;
            condition.SetType("");
        }
        else
        {
            conditionCode += "for(unsigned int i = 0;i < "+objectName+"objects.size();)\n";
            conditionCode += "{\n";
            conditionCode += "    if ( "+predicat+" )\n";
            conditionCode += "    {\n";
            conditionCode += "        "+returnBoolean+" = true;\n";
            conditionCode += "        ++i;\n";
            conditionCode += "    }\n";
            conditionCode += "    else\n";
            conditionCode += "    {\n";
            conditionCode += "        "+objectName+"objects.erase("+objectName+"objects.begin()+i);\n";
            conditionCode += "    }\n";
            conditionCode += "}";
        }

        context.currentObject = "";
    }

    return conditionCode;
}

/**
 * Generate code for a list of conditions.
 * Bools containing conditions results are named conditionXIsTrue.
 */
string EventsCodeGenerator::GenerateConditionsListCode(const RuntimeScene & scene, vector < Instruction > & conditions, EventsCodeGenerationContext & context)
{
    string outputCode;

    for (unsigned int i = 0;i<conditions.size();++i)
        outputCode += "bool condition"+ToString(i)+"IsTrue = false;\n";

    for (unsigned int cId =0;cId < conditions.size();++cId)
    {
        string conditionCode = GenerateConditionCode(scene, conditions[cId], "condition"+ToString(cId)+"IsTrue", context);

        for (unsigned int i = 0;i<cId;++i) //Skip conditions if one condition is false. //TODO : Can be optimized
        {
            if (i == 0) outputCode += "if ( "; else outputCode += " && ";
            outputCode += "condition"+ToString(i)+"IsTrue";
            if (i == cId-1) outputCode += ") ";
        }
        outputCode += "{\n";
        if ( !conditions[cId].GetType().empty() ) outputCode += conditionCode;
        outputCode += "}\n";
    }

    return outputCode;
}

/**
 * Generate code for an action.
 */
std::string EventsCodeGenerator::GenerateActionCode(const RuntimeScene & scene, Instruction & action, EventsCodeGenerationContext & context)
{
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    string actionCode;

    InstructionInfos instrInfos = extensionsManager->GetActionInfos(action.GetType());

    if ( !instrInfos.cppCallingInformation.optionalIncludeFile.empty() )
        context.AddIncludeFile(instrInfos.cppCallingInformation.optionalIncludeFile);

    if ( instrInfos.cppCallingInformation.optionalCustomCodeGenerator != boost::shared_ptr<InstructionInfos::CppCallingInformation::CustomCodeGenerator>() )
    {
        return instrInfos.cppCallingInformation.optionalCustomCodeGenerator->GenerateCode(scene, action, context);
    }

    //Be sure there is no lack of parameter.
    while(action.GetParameters().size() < instrInfos.parameters.size())
    {
        vector < GDExpression > parameters = action.GetParameters();
        parameters.push_back(GDExpression(""));
        action.SetParameters(parameters);
    }

    //Verify that there are not mismatch between object type in parameters
    for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
    {
        if ( instrInfos.parameters[pNb].type == "object" && instrInfos.parameters[pNb].supplementaryInformation != "" )
        {
            string objectInParameter = action.GetParameter(pNb).GetPlainString();
            if (GetTypeOfObject(*scene.game, scene, objectInParameter) != instrInfos.parameters[pNb].supplementaryInformation )
            {
                cout << "Bad object type in parameter "+ToString(pNb)+" of an action " << action.GetType() << endl;
                cout << "Action wanted " << instrInfos.parameters[pNb].supplementaryInformation << " of type " << instrInfos.parameters[pNb].supplementaryInformation << endl;
                cout << "Action has received " << objectInParameter << " of type " << GetTypeOfObject(*scene.game, scene, objectInParameter) << endl;

                action.SetParameter(pNb, GDExpression(""));
                action.SetType("");
            }
        }
    }

    //Call static function first if available
    if ( extensionsManager->HasAction(action.GetType()))
    {
        vector<string> arguments = GenerateParametersCodes(*scene.game, scene, action.GetParameters(), instrInfos.parameters, context);

        //Generate call
        string call;
        if ( instrInfos.cppCallingInformation.type == "number" || instrInfos.cppCallingInformation.type == "string" )
        {
            if ( instrInfos.cppCallingInformation.accessType == InstructionInfos::CppCallingInformation::MutatorAndOrAccessor )
                call = GenerateOperatorCall(instrInfos, arguments, instrInfos.cppCallingInformation.cppCallingName, instrInfos.cppCallingInformation.optionalAssociatedInstruction, context);
            else
                call = GenerateCompoundOperatorCall(instrInfos, arguments, instrInfos.cppCallingInformation.cppCallingName, context);
        }
        else
        {
            string argumentsStr;
            for (unsigned int i = 0;i<arguments.size();++i)
            {
                if ( i != 0 ) argumentsStr += ", ";
                argumentsStr += arguments[i];
            }

            call = instrInfos.cppCallingInformation.cppCallingName+"("+argumentsStr+")";
        }

        actionCode += call+";\n";
    }

    //Call object function if available
    string objectName = action.GetParameters().empty() ? "" : action.GetParameter(0).GetPlainString();
    string objectType = GetTypeOfObject(*scene.game, scene, objectName);

    if ( extensionsManager->HasObjectAction(objectType,
                                            action.GetType()))
    {
        const ExtensionObjectInfos & objInfo = extensionsManager->GetObjectInfo(objectType);

        context.currentObject = objectName;
        context.ObjectNeeded(objectName);

        vector<string> arguments = GenerateParametersCodes(*scene.game, scene, action.GetParameters(), instrInfos.parameters, context);

        //Add a static_cast if necessary
        string objectPart =
        ( !objInfo.cppClassName.empty() ) ? "static_cast<"+objInfo.cppClassName+"*>("+objectName+"objects[i])->" : objectName+"objects[i]->" ;

        //Create call
        string call;
        if ( instrInfos.cppCallingInformation.type == "number" || instrInfos.cppCallingInformation.type == "string")
        {
            if ( instrInfos.cppCallingInformation.accessType == InstructionInfos::CppCallingInformation::MutatorAndOrAccessor )
                call = GenerateOperatorCall(instrInfos, arguments, objectPart+instrInfos.cppCallingInformation.cppCallingName, objectPart+instrInfos.cppCallingInformation.optionalAssociatedInstruction, context,1);
            else
                call = GenerateCompoundOperatorCall(instrInfos, arguments, objectPart+instrInfos.cppCallingInformation.cppCallingName, context,1);
        }
        else
        {
            string argumentsStr;
            for (unsigned int i = 1;i<arguments.size();++i)
            {
                if ( i != 1 ) argumentsStr += ", ";
                argumentsStr += arguments[i];
            }

            call = objectPart+instrInfos.cppCallingInformation.cppCallingName+"("+argumentsStr+")";
        }

        actionCode += "for(unsigned int i = 0;i < "+objectName+"objects.size();++i)\n";
        actionCode += "{\n";
        actionCode += "    "+call+";\n";
        actionCode += "}\n";

        context.currentObject = "";
    }

    //Affection to an automatism member function if found
    string automatismType = GetTypeOfAutomatism(*scene.game, scene, action.GetParameters().size() < 2 ? "" : action.GetParameter(1).GetPlainString());

    if (extensionsManager->HasAutomatismAction(automatismType, action.GetType()))
    {
        const ExtensionObjectInfos & objInfo = extensionsManager->GetObjectInfo(objectType);

        context.currentObject = objectName;
        context.ObjectNeeded(objectName);

        vector<string> arguments = GenerateParametersCodes(*scene.game, scene, action.GetParameters(), instrInfos.parameters, context);

        //Add a static_cast if necessary
        string objectPart =
        ( !objInfo.cppClassName.empty() ) ?
            "static_cast<"+objInfo.cppClassName+"*>("+objectName+"objects[i])->GetAutomatism(\""+action.GetParameter(1).GetPlainString()+"\")->"
        :   objectName+"objects[i]->GetAutomatism(\""+action.GetParameter(1).GetPlainString()+"\")->";

        //Create call
        string call;
        if ( (instrInfos.cppCallingInformation.type == "number" || instrInfos.cppCallingInformation.type == "string") )
        {
            if ( instrInfos.cppCallingInformation.accessType == InstructionInfos::CppCallingInformation::MutatorAndOrAccessor )
                call = GenerateOperatorCall(instrInfos, arguments, objectPart+instrInfos.cppCallingInformation.cppCallingName, objectPart+instrInfos.cppCallingInformation.optionalAssociatedInstruction, context,2);
            else
                call = GenerateCompoundOperatorCall(instrInfos, arguments, objectPart+instrInfos.cppCallingInformation.cppCallingName, context,2);
        }
        else
        {
            string argumentsStr;
            for (unsigned int i = 2;i<arguments.size();++i)
            {
                if ( i != 2 ) argumentsStr += ", ";
                argumentsStr += arguments[i];
            }

            call = objectPart+instrInfos.cppCallingInformation.cppCallingName+"("+argumentsStr+")";
        }

        //Verify that object has automatism.
        vector < string > automatisms = GetAutomatismsOfObject(*scene.game, scene, objectName);
        if ( find(automatisms.begin(), automatisms.end(), action.GetParameter(1).GetPlainString()) == automatisms.end() )
        {
            cout << "Bad automatism requested" << endl;
            action.SetType("");
        }
        else
        {
            actionCode += "for(unsigned int i = 0;i < "+objectName+"objects.size();++i)\n";
            actionCode += "{\n";
            actionCode += "    "+call+";\n";
            actionCode += "}\n";
        }

        context.currentObject = "";
    }

    return actionCode;
}

/**
 * Generate actions code.
 */
string EventsCodeGenerator::GenerateActionsListCode(const RuntimeScene & scene, vector < Instruction > & actions, EventsCodeGenerationContext & context)
{
    string outputCode;
    for (unsigned int aId =0;aId < actions.size();++aId)
    {
        string actionCode = GenerateActionCode(scene, actions[aId], context);

        outputCode += "{\n";
        if ( !actions[aId].GetType().empty() ) outputCode += actionCode;
        outputCode += "}\n";
    }

    return outputCode;
}

vector<string> EventsCodeGenerator::GenerateParametersCodes(const Game & game, const Scene & scene, vector < GDExpression > parameters, const vector < ParameterInfo > & parametersInfo, EventsCodeGenerationContext & context, std::vector < std::pair<std::string, std::string> > * supplementaryParametersTypes)
{
    vector<string> arguments;

    while(parameters.size() < parametersInfo.size())
        parameters.push_back(GDExpression(""));

    for (unsigned int pNb = 0;pNb < parametersInfo.size() && pNb < parameters.size();++pNb)
    {
        string argOutput;

        if ( parametersInfo[pNb].type == "expression" || parametersInfo[pNb].type == "camera" )
        {
            CallbacksForGeneratingExpressionCode callbacks(argOutput, game, scene, context);

            GDExpressionParser parser(parameters[pNb].GetPlainString());
            parser.ParseMathExpression(game, scene, callbacks);

            if (argOutput.empty()) argOutput = "0";
        }
        else if ( parametersInfo[pNb].type == "string" || parametersInfo[pNb].type == "layer" || parametersInfo[pNb].type == "color" || parametersInfo[pNb].type == "file" || parametersInfo[pNb].type == "joyaxis" )
        {
            CallbacksForGeneratingExpressionCode callbacks(argOutput, game, scene, context);

            GDExpressionParser parser(parameters[pNb].GetPlainString());
            parser.ParseTextExpression(game, scene, callbacks);

            if (argOutput.empty()) argOutput = "\"\"";
        }
        else if ( parametersInfo[pNb].type == "relationalOperator" )
        {
            argOutput += parameters[pNb].GetPlainString() == "=" ? "==" :parameters[pNb].GetPlainString();
            if ( argOutput != "==" && argOutput != "<" && argOutput != ">" && argOutput != "<=" && argOutput != ">=" && argOutput != "!=")
                cout << "Warning: Bad relational operator." << endl;

            argOutput = "\""+argOutput+"\"";
        }
        else if ( parametersInfo[pNb].type == "operator" )
        {
            argOutput += parameters[pNb].GetPlainString();
            if ( argOutput != "=" && argOutput != "+" && argOutput != "-" && argOutput != "/" && argOutput != "*")
                cout << "Warning: Bad operator." << endl;

            argOutput = "\""+argOutput+"\"";
        }
        else if ( parametersInfo[pNb].type == "object" )
        {
            argOutput = "\""+parameters[pNb].GetPlainString()+"\"";
        }
        else if ( parametersInfo[pNb].type == "objectvar" || parametersInfo[pNb].type == "scenevar" || parametersInfo[pNb].type == "globalvar" )
        {
            argOutput = "\""+parameters[pNb].GetPlainString()+"\"";
        }
        else if ( parametersInfo[pNb].type == "mouse" )
        {
            argOutput = "\""+parameters[pNb].GetPlainString()+"\"";
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
        else if ( parametersInfo[pNb].type == "listOfObjectsOfParameter" )
        {
            unsigned int i = ToInt(parametersInfo[pNb].supplementaryInformation);
            if ( i < parameters.size() )
            {
                context.ObjectNeeded(parameters[i].GetPlainString());
                argOutput += parameters[i].GetPlainString()+"objects";

            }
            else
            {
                context.errorOccured = true;
                cout << "Error: Could not get objects for a parameter" << endl;
            }
        }
        //Code only parameter type
        else if ( parametersInfo[pNb].type == "listOfObjectsOfParameterWithoutPickingThem" )
        {
            unsigned int i = ToInt(parametersInfo[pNb].supplementaryInformation);
            if ( i < parameters.size() )
            {
                //Get a list of object without picking them from scene.
                context.EmptyObjectsListNeeded(parameters[i].GetPlainString());
                argOutput += parameters[i].GetPlainString()+"objects";

            }
            else
            {
                context.errorOccured = true;
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
                argOutput += "\""+parameters[pNb].GetPlainString()+"\"";
            }
        }

        arguments.push_back(argOutput);
    }

    return arguments;
}

/**
 * Generate events list code.
 */
string EventsCodeGenerator::GenerateEventsListCode(const RuntimeScene & scene, vector < BaseEventSPtr > & events, const EventsCodeGenerationContext & parentContext)
{
    string output;

    for ( unsigned int eId = 0; eId < events.size();++eId )
    {
        //Each event has its own context : Objects picked in an event are totally differents than the one picked in another.
        EventsCodeGenerationContext context;
        context.InheritsFrom(parentContext); //Events in the same "level" share the same context as their parent.

        string eventCoreCode = events[eId]->GenerateEventCode(scene, context);
        string declarationsCode = context.GenerateObjectsDeclarationCode();

        output += "\n{\n" + declarationsCode + "\n" + eventCoreCode + "\n}\n";
    }

    return output;
}

string EventsCodeGenerator::GenerateEventsCompleteCode(const RuntimeScene & scene, vector < BaseEventSPtr > & events)
{
    string output;

    //Prepare the global context ( Used to get needed header files )
    EventsCodeGenerationContext context;
    context.includeFiles = boost::shared_ptr< set<string> >(new set<string>);

    //Generate whole events code
    string wholeEventsCode = EventsCodeGenerator::GenerateEventsListCode(scene, events, context);

    //Generate default code around events
    for ( set<string>::iterator include = context.includeFiles->begin() ; include != context.includeFiles->end(); ++include )
        output += "#include \""+*include+"\"\n";

    output +=
    "#include <stdio.h>\nextern void * pointerToRuntimeContext;\nint _CRT_MT = 1; //Required, when using O3, but not exported by any dlls?\n\n"

    "int main()\n"
    "{\n"
	"RuntimeContext * runtimeContext = static_cast< RuntimeContext *> (pointerToRuntimeContext);"
    +wholeEventsCode+
    "return 0;\n"
    "}\n";

    return output;
}

/**
 * Remove events not executed
 */
void EventsCodeGenerator::DeleteUselessEvents(vector < BaseEventSPtr > & events)
{
    for ( unsigned int eId = events.size()-1; eId < events.size();--eId )
    {
        if ( events[eId]->CanHaveSubEvents() ) //Process sub events, if any
            DeleteUselessEvents(events[eId]->GetSubEvents());

        if ( !events[eId]->IsExecutable() || events[eId]->IsDisabled() ) //Delete events that are not executable
            events.erase(events.begin() + eId);
    }
}
