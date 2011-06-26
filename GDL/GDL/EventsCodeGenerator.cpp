/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/EventsCodeGenerator.h"
#include "GDL/conditions.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/StrExpressionInstruction.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/CommonInstructions.h"
#include "GDL/CommonTools.h"
#include "GDL/GDExpressionParser.h"
#include "GDL/EventsCodeGenerationContext.h"

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
 * Generate conditions code.
 * Bools containing conditions results are named conditionXIsTrue.
 */
string EventsCodeGenerator::GenerateConditionsListCode(const RuntimeScene & scene, vector < Instruction > & conditions, EventsCodeGenerationContext & context)
{
    string outputCode;

    for (unsigned int i = 0;i<conditions.size();++i)
        outputCode += "bool condition"+ToString(i)+"IsTrue = false;\n";

    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    for (unsigned int cId =0;cId < conditions.size();++cId)
    {
        outputCode += "{\n";
        string conditionCode;

        InstructionInfos instrInfos = extensionsManager->GetConditionInfos(conditions[cId].GetType());

        if ( !instrInfos.cppCallingInformation.optionalIncludeFile.empty() )
            context.AddIncludeFile(instrInfos.cppCallingInformation.optionalIncludeFile);

        //Insert code only parameters and be sure there is no lack of parameter.
        while(conditions[cId].GetParameters().size() < instrInfos.parameters.size())
        {
            vector < GDExpression > parameters = conditions[cId].GetParameters();
            parameters.push_back(GDExpression(""));
            conditions[cId].SetParameters(parameters);
        }

        //Verify that there are not mismatch between object type in parameters
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            if ( instrInfos.parameters[pNb].type == "object" && instrInfos.parameters[pNb].supplementaryInformation != "" )
            {
                string objectInParameter = conditions[cId].GetParameter(pNb).GetPlainString();
                if (GetTypeOfObject(*scene.game, scene, objectInParameter) != instrInfos.parameters[pNb].supplementaryInformation )
                {
                    cout << "Bad object type in a parameter of a condition " << conditions[cId].GetType() << endl;
                    cout << "Condition wanted " << instrInfos.parameters[pNb].supplementaryInformation << endl;
                    cout << "Condition wanted " << instrInfos.parameters[pNb].supplementaryInformation << " of type " << instrInfos.parameters[pNb].supplementaryInformation << endl;
                    cout << "Condition has received " << objectInParameter << " of type " << GetTypeOfObject(*scene.game, scene, objectInParameter) << endl;

                    conditions[cId].SetParameter(pNb, GDExpression(""));
                    conditions[cId].SetType("");
                }
            }
        }

        //Generate static condition if available
        if ( extensionsManager->HasCondition(conditions[cId].GetType()))
        {
            //Prepare arguments
            vector<string> arguments = GenerateParametersCodes(*scene.game, scene, conditions[cId].GetParameters(), instrInfos.parameters, context);

            //Generate call
            string predicat;
            if ( instrInfos.cppCallingInformation.type == "number")
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

            //Generate condition code
            conditionCode += "condition"+ToString(cId)+"IsTrue = "+predicat+";\n";
        }

        //Generate object condition if available
        string objectName = conditions[cId].GetParameters().empty() ? "" : conditions[cId].GetParameter(0).GetPlainString();
        string objectType = GetTypeOfObject(*scene.game, scene, objectName);

        if ( !objectName.empty() && extensionsManager->HasObjectCondition(objectType, conditions[cId].GetType()))
        {
            const ExtensionObjectInfos & objInfo = extensionsManager->GetObjectInfo(objectType);

            context.currentObject = objectName;
            context.ObjectNeeded(objectName);

            //Prepare arguments
            vector<string> arguments = GenerateParametersCodes(*scene.game, scene, conditions[cId].GetParameters(), instrInfos.parameters, context);

            //Add a static_cast if necessary
            string objectFunctionCallNamePart =
            ( !objInfo.cppClassName.empty() ) ?
                "static_cast<"+objInfo.cppClassName+"*>("+objectName+"objects[i])->"+instrInfos.cppCallingInformation.cppCallingName
            :   objectName+"objects[i]->"+instrInfos.cppCallingInformation.cppCallingName;

            //Create call
            string predicat;
            if ( instrInfos.cppCallingInformation.type == "number" && arguments.size() >= 3)
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

            //Generate whole condition code
            conditionCode += "for(unsigned int i = 0;i < "+objectName+"objects.size();)\n";
            conditionCode += "{\n";
            conditionCode += "    if ( "+predicat+" )\n";
            conditionCode += "    {\n";
            conditionCode += "        condition"+ToString(cId)+"IsTrue = true;\n";
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
        string automatismType = GetTypeOfAutomatism(*scene.game, scene,
                                                              conditions[cId].GetParameters().size() < 2 ? "" : conditions[cId].GetParameter(1).GetPlainString());

        if (extensionsManager->HasAutomatismCondition(automatismType,
                                                   conditions[cId].GetType()))
        {
            const ExtensionObjectInfos & objInfo = extensionsManager->GetObjectInfo(objectType);

            context.currentObject = objectName;
            context.ObjectNeeded(objectName);

            //Prepare arguments
            vector<string> arguments = GenerateParametersCodes(*scene.game, scene, conditions[cId].GetParameters(), instrInfos.parameters, context);

            //Add a static_cast if necessary
            string objectFunctionCallNamePart =
            ( !objInfo.cppClassName.empty() ) ?
                "static_cast<"+objInfo.cppClassName+"*>("+objectName+"objects[i])->GetAutomatism(\""+conditions[cId].GetParameter(1).GetPlainString()+"\")->"+instrInfos.cppCallingInformation.cppCallingName
            :   objectName+"objects[i]->GetAutomatism(\""+conditions[cId].GetParameter(1).GetPlainString()+"\")->"+instrInfos.cppCallingInformation.cppCallingName;

            //Create call
            string predicat;
            if ( instrInfos.cppCallingInformation.type == "number" && arguments.size() >= 3)
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

            //Verify that object has automatism.
            vector < string > automatisms = GetAutomatismsOfObject(*scene.game, scene, objectName);
            if ( find(automatisms.begin(), automatisms.end(), conditions[cId].GetParameter(1).GetPlainString()) == automatisms.end() )
            {
                cout << "Bad automatism requested" << endl;
                conditions[cId].SetType("");
            }
            else
            {
                conditionCode += "for(unsigned int i = 0;i < "+objectName+"objects.size();)\n";
                conditionCode += "{\n";
                conditionCode += "    if ( "+predicat+" )\n";
                conditionCode += "    {\n";
                conditionCode += "        condition"+ToString(cId)+"IsTrue = true;\n";
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

        if ( !conditions[cId].GetType().empty() ) outputCode += conditionCode;

        //Preprocess subconditions
        /*if ( !conditions[cId].GetSubInstructions().empty() )
            PreprocessConditions(scene, conditions[cId].GetSubInstructions(), eventHasToBeDeleted);*/

        outputCode += "}\n";
    }

    return outputCode;
}

/**
 * Generate actions code.
 */
string EventsCodeGenerator::GenerateActionsListCode(const RuntimeScene & scene, vector < Instruction > & actions, EventsCodeGenerationContext & context)
{
    string outputCode;

    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    for (unsigned int aId =0;aId < actions.size();++aId)
    {
        outputCode += "{\n";
        string actionCode;

        InstructionInfos instrInfos = extensionsManager->GetActionInfos(actions[aId].GetType());

        if ( !instrInfos.cppCallingInformation.optionalIncludeFile.empty() )
            context.AddIncludeFile(instrInfos.cppCallingInformation.optionalIncludeFile);

        //Be sure there is no lack of parameter.
        while(actions[aId].GetParameters().size() < instrInfos.parameters.size())
        {
            vector < GDExpression > parameters = actions[aId].GetParameters();
            parameters.push_back(GDExpression(""));
            actions[aId].SetParameters(parameters);
        }

        //Verify that there are not mismatch between object type in parameters
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            if ( instrInfos.parameters[pNb].type == "object" && instrInfos.parameters[pNb].supplementaryInformation != "" )
            {
                string objectInParameter = actions[aId].GetParameter(pNb).GetPlainString();
                if (GetTypeOfObject(*scene.game, scene, objectInParameter) != instrInfos.parameters[pNb].supplementaryInformation )
                {
                    cout << "Bad object type in parameter "+ToString(pNb)+" of an action " << actions[aId].GetType() << endl;
                    cout << "Action wanted " << instrInfos.parameters[pNb].supplementaryInformation << " of type " << instrInfos.parameters[pNb].supplementaryInformation << endl;
                    cout << "Action has received " << objectInParameter << " of type " << GetTypeOfObject(*scene.game, scene, objectInParameter) << endl;

                    actions[aId].SetParameter(pNb, GDExpression(""));
                    actions[aId].SetType("");
                }
            }
        }

        //Call static function first if available
        if ( extensionsManager->HasAction(actions[aId].GetType()))
        {
            vector<string> arguments = GenerateParametersCodes(*scene.game, scene, actions[aId].GetParameters(), instrInfos.parameters, context);

            //Generate call
            string call;
            if ( instrInfos.cppCallingInformation.type == "number")
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
        string objectName = actions[aId].GetParameters().empty() ? "" : actions[aId].GetParameter(0).GetPlainString();
        string objectType = GetTypeOfObject(*scene.game, scene, objectName);

        if ( extensionsManager->HasObjectAction(objectType,
                                                actions[aId].GetType()))
        {
            const ExtensionObjectInfos & objInfo = extensionsManager->GetObjectInfo(objectType);

            context.currentObject = objectName;
            context.ObjectNeeded(objectName);

            vector<string> arguments = GenerateParametersCodes(*scene.game, scene, actions[aId].GetParameters(), instrInfos.parameters, context);

            //Add a static_cast if necessary
            string objectPart =
            ( !objInfo.cppClassName.empty() ) ? "static_cast<"+objInfo.cppClassName+"*>("+objectName+"objects[i])->" : objectName+"objects[i]->" ;

            //Create call
            string call;
            if ( instrInfos.cppCallingInformation.type == "number")
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
        string automatismType = GetTypeOfAutomatism(*scene.game, scene,
                                                              actions[aId].GetParameters().size() < 2 ? "" : actions[aId].GetParameter(1).GetPlainString());

        if (extensionsManager->HasAutomatismAction(automatismType, actions[aId].GetType()))
        {
            const ExtensionObjectInfos & objInfo = extensionsManager->GetObjectInfo(objectType);

            context.currentObject = objectName;
            context.ObjectNeeded(objectName);

            vector<string> arguments = GenerateParametersCodes(*scene.game, scene, actions[aId].GetParameters(), instrInfos.parameters, context);

            //Add a static_cast if necessary
            string objectPart =
            ( !objInfo.cppClassName.empty() ) ?
                "static_cast<"+objInfo.cppClassName+"*>("+objectName+"objects[i])->GetAutomatism(\""+actions[aId].GetParameter(1).GetPlainString()+"\")->"
            :   objectName+"objects[i]->GetAutomatism(\""+actions[aId].GetParameter(1).GetPlainString()+"\")->";

            //Create call
            string call;
            if ( instrInfos.cppCallingInformation.type == "number" && arguments.size() >= 4)
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
            if ( find(automatisms.begin(), automatisms.end(), actions[aId].GetParameter(1).GetPlainString()) == automatisms.end() )
            {
                cout << "Bad automatism requested" << endl;
                actions[aId].SetType("");
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


        //Preprocess subactions
        /*if ( !actions[aId].GetSubInstructions().empty() )
            PreprocessActions(scene, actions[aId].GetSubInstructions());*/

        if ( !actions[aId].GetType().empty() ) outputCode += actionCode;

        outputCode += "}\n";
    }

    return outputCode;
}

/**
 * Generate C++ code from expressions.
 */
class CallbacksForGeneratingExpressionCode : public ParserCallbacks
{
    public:

    CallbacksForGeneratingExpressionCode(string & plainExpression_, const Game & game_, const Scene & scene_, EventsCodeGenerationContext & context_) :
    plainExpression(plainExpression_),
    game(game_),
    scene(scene_),
    context(context_)
    {};
    virtual ~CallbacksForGeneratingExpressionCode() {};

    virtual void OnConstantToken(string text)
    {
        plainExpression += text;
    };

    virtual void OnStaticFunction(string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo)
    {
        vector<string> parameters = EventsCodeGenerator::GenerateParametersCodes(game, scene, instruction.parameters, expressionInfo.parameters, context );

        string parametersStr;
        for (unsigned int i = 0;i<parameters.size();++i)
        {
            if ( i != 0 ) parametersStr += ", ";
            parametersStr += parameters[i];
        }

        plainExpression += expressionInfo.cppCallingName+"("+parametersStr+")";
    };

    virtual void OnStaticFunction(string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo)
    {
        //TODO : A bit of hack here..
        //Special case : Function without name is a litteral string.
        if ( functionName.empty() )
        {
            if ( instruction.parameters.empty() ) return;
            plainExpression += "\""+instruction.parameters[0].GetPlainString()+"\"";

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

        plainExpression += expressionInfo.cppCallingName+"("+parametersStr+")";
    };

    virtual void OnObjectFunction(string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo)
    {
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

        //Access to the object
        string objectStr;
        if ( context.currentObject == instruction.parameters[0].GetPlainString() )
            objectStr = ""+instruction.parameters[0].GetPlainString()+"objects[i]";
        else
            objectStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? 0 :"+ instruction.parameters[0].GetPlainString()+"objects[0]";

        //Cast the object if needed
        string objectType = GetTypeOfObject(game, scene, instruction.parameters[0].GetPlainString());
        const ExtensionObjectInfos & objInfo = GDpriv::ExtensionsManager::GetInstance()->GetObjectInfo(objectType);

        if ( !objInfo.cppClassName.empty() )
            plainExpression += "static_cast<"+objInfo.cppClassName+"*>("+objectStr+")->"+expressionInfo.cppCallingName+"("+parametersStr+")";
        else
            plainExpression += objectStr+"->"+expressionInfo.cppCallingName+"("+parametersStr+")";
    };

    virtual void OnObjectFunction(string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo)
    {
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

        //Access to the object
        string objectStr;
        if ( context.currentObject == instruction.parameters[0].GetPlainString() )
            objectStr = ""+instruction.parameters[0].GetPlainString()+"objects[i]";
        else
            objectStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? \"\" :"+ instruction.parameters[0].GetPlainString()+"objects[0]";

        //Cast the object if needed
        string objectType = GetTypeOfObject(game, scene, instruction.parameters[0].GetPlainString());
        const ExtensionObjectInfos & objInfo = GDpriv::ExtensionsManager::GetInstance()->GetObjectInfo(objectType);

        if ( !objInfo.cppClassName.empty() )
            plainExpression += "static_cast<"+objInfo.cppClassName+"*>("+objectStr+")->"+expressionInfo.cppCallingName+"("+parametersStr+")";
        else
            plainExpression += objectStr+"->"+expressionInfo.cppCallingName+"("+parametersStr+")";
    };

    virtual void OnObjectAutomatismFunction(string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo)
    {
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

        //Access to the object
        string objectStr;
        if ( context.currentObject == instruction.parameters[0].GetPlainString() )
            objectStr = ""+instruction.parameters[0].GetPlainString()+"objects[i]";
        else
            objectStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? 0 :"+ instruction.parameters[0].GetPlainString()+"objects[0]";

        //Cast the object if needed
        string objectType = GetTypeOfObject(game, scene, instruction.parameters[0].GetPlainString());
        const ExtensionObjectInfos & objInfo = GDpriv::ExtensionsManager::GetInstance()->GetObjectInfo(objectType);

        if ( !objInfo.cppClassName.empty() )
            plainExpression += "static_cast<"+objInfo.cppClassName+"*>("+objectStr+")->"+instruction.parameters[1].GetPlainString()+"::"+expressionInfo.cppCallingName+"("+parametersStr+")";
        else
            plainExpression += objectStr+"->"+instruction.parameters[1].GetPlainString()+"::"+expressionInfo.cppCallingName+"("+parametersStr+")";

    };

    virtual void OnObjectAutomatismFunction(string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo)
    {
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

        //Access to the object
        string objectStr;
        if ( context.currentObject == instruction.parameters[0].GetPlainString() )
            objectStr = ""+instruction.parameters[0].GetPlainString()+"objects[i]";
        else
            objectStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? \"\" :"+ instruction.parameters[0].GetPlainString()+"objects[0]";

        //Cast the object if needed
        string objectType = GetTypeOfObject(game, scene, instruction.parameters[0].GetPlainString());
        const ExtensionObjectInfos & objInfo = GDpriv::ExtensionsManager::GetInstance()->GetObjectInfo(objectType);

        if ( !objInfo.cppClassName.empty() )
            plainExpression += "static_cast<"+objInfo.cppClassName+"*>("+objectStr+")->"+instruction.parameters[1].GetPlainString()+"::"+expressionInfo.cppCallingName+"("+parametersStr+")";
        else
            plainExpression += objectStr+"->"+instruction.parameters[1].GetPlainString()+"::"+expressionInfo.cppCallingName+"("+parametersStr+")";
    };

    virtual bool OnSubMathExpression(const Game & game, const Scene & scene, GDExpression & expression)
    {
        string newExpression;

        CallbacksForGeneratingExpressionCode callbacks(newExpression, game, scene, context);

        GDExpressionParser parser(expression.GetPlainString());
        if ( !parser.ParseMathExpression(game, scene, callbacks) )
            return false;

        expression = GDExpression(newExpression);
        return true;
    }

    virtual bool OnSubTextExpression(const Game & game, const Scene & scene, GDExpression & expression)
    {
        string newExpression;

        CallbacksForGeneratingExpressionCode callbacks(newExpression, game, scene, context);

        GDExpressionParser parser(expression.GetPlainString());
        if ( !parser.ParseTextExpression(game, scene, callbacks) )
            return false;

        expression = GDExpression(newExpression);
        return true;
    }


    private :
        string & plainExpression;
        const Game & game;
        const Scene & scene;
        EventsCodeGenerationContext & context;
};


vector<string> EventsCodeGenerator::GenerateParametersCodes(const Game & game, const Scene & scene, const vector < GDExpression > & parameters, const vector < ParameterInfo > & parametersInfo, EventsCodeGenerationContext & context)
{
    vector<string> arguments;

    //TODO : Handle bad parameters size ?
    for (unsigned int pNb = 0;pNb < parametersInfo.size() && parameters.size();++pNb)
    {
        string argOutput;

        if ( parametersInfo[pNb].type == "expression" )
        {
            CallbacksForGeneratingExpressionCode callbacks(argOutput, game, scene, context);

            GDExpressionParser parser(parameters[pNb].GetPlainString());
            parser.ParseMathExpression(game, scene, callbacks);
        }
        else if ( parametersInfo[pNb].type == "string" )
        {
            CallbacksForGeneratingExpressionCode callbacks(argOutput, game, scene, context);

            GDExpressionParser parser(parameters[pNb].GetPlainString());
            parser.ParseTextExpression(game, scene, callbacks);
        }
        else if ( parametersInfo[pNb].type == "relationalOperator" )
        {
            argOutput += parameters[pNb].GetPlainString() == "=" ? "==" :parameters[pNb].GetPlainString();
            if ( argOutput != "==" && argOutput != "<" && argOutput != ">" && argOutput != "<=" && argOutput != ">=" && argOutput != "!=")
                cout << "Warning: Bad relational operator." << endl;
        }
        else if ( parametersInfo[pNb].type == "operator" )
        {
            argOutput += parameters[pNb].GetPlainString();
            if ( argOutput != "=" && argOutput != "+" && argOutput != "-" && argOutput != "/" && argOutput != "*")
                cout << "Warning: Bad operator." << endl;
        }
        else if ( parametersInfo[pNb].type == "object" )
        {
            context.ObjectNeeded(parameters[pNb].GetPlainString());

            if ( context.currentObject == parameters[pNb].GetPlainString() )
                argOutput = ""+parameters[pNb].GetPlainString()+"objects[i]";
            else
                argOutput = "( "+parameters[pNb].GetPlainString()+"objects.empty() ) ? NULL :"+ parameters[pNb].GetPlainString()+"objects[0]";
        }
        //Code only parameter type
        else if ( parametersInfo[pNb].type == "currentScene" )
        {
            argOutput += "*runtimeScene";
        }
        //Code only parameter type
        else if ( parametersInfo[pNb].type == "inlineCode" )
        {
            argOutput += parametersInfo[pNb].supplementaryInformation;
        }
        //Code only parameter type
        else if ( parametersInfo[pNb].type == "objectsOfParameter" )
        {
            unsigned int i = ToInt(parametersInfo[pNb].supplementaryInformation);
            if ( i < parameters.size() )
                argOutput += parameters[i].GetPlainString()+"objects";
            else
            {
                context.errorOccured = true;
                cout << "Error: Could not get objects for a parameter" << endl;
            }
        }
        else
        {
            cout << "Warning: Unknown type of parameter \"" << parametersInfo[pNb].type << "\".";
            argOutput += "\""+parameters[pNb].GetPlainString()+"\"";
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
        EventsCodeGenerationContext context = parentContext;

        string eventCoreCode = events[eId]->GenerateEventCode(scene, context);
        string declarationsCode;
        for ( set<string>::iterator it = context.objectsToBeDeclared.begin() ; it != context.objectsToBeDeclared.end(); ++it )
        {
            if ( context.objectsAlreadyDeclared.find(*it) == context.objectsAlreadyDeclared.end() )
            {
                declarationsCode += "vector<Object*> "+*it+"objects = runtimeScene->objectsInstances.GetObjectsRawPointers(\""+*it+"\");\n";
                context.objectsAlreadyDeclared.insert(*it);
            }
        }
        context.objectsToBeDeclared.clear();

        output += "\n{\n" + declarationsCode + "\n" + eventCoreCode + "\n}\n";
    }

    return output;
}

string EventsCodeGenerator::GenerateEventsCompleteCode(const RuntimeScene & scene, vector < BaseEventSPtr > & events)
{
    string output;

    EventsCodeGenerationContext context;
    context.includeFiles = boost::shared_ptr< set<string> >(new set<string>);
    string wholeEventsCode = EventsCodeGenerator::GenerateEventsListCode(scene, events, context);

    output +=
    "#include <stdio.h>\n"
    "#include <iostream>\n"
    "#include <vector>\n"
    "#include \"GDL/RuntimeScene.h\"\n";
    for ( set<string>::iterator include = context.includeFiles->begin() ; include != context.includeFiles->end(); ++include )
        output += "#include \""+*include+"\"\n";

    output +=
    "extern void * pointerToRuntimeScene;\nint _CRT_MT = 1; //Required, when using O3, but not exported by any dlls?\n\n"

    "int main()\n"
    "{\n"
	"RuntimeScene * runtimeScene = static_cast< RuntimeScene *> (pointerToRuntimeScene);"
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
