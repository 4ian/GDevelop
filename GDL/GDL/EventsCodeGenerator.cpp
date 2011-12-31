/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include <utility>
#include "GDL/EventsCodeGenerator.h"
#include "GDL/ExtensionBase.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/CommonInstructions.h"
#include "GDL/CommonTools.h"
#include "GDL/GDExpressionParser.h"
#include "GDL/EventsCodeNameMangler.h"
#include "GDL/EventsCodeGenerationContext.h"
#include "GDL/ExpressionsCodeGeneration.h"

#include "GDL/ProfileEvent.h"
#include "GDL/BaseProfiler.h"

using namespace std;

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
string EventsCodeGenerator::GenerateRelationalOperatorCall(const InstructionInfos & instrInfos, vector<string> & arguments, const string & callStartString, unsigned int startFromArgument)
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
string EventsCodeGenerator::GenerateOperatorCall(const InstructionInfos & instrInfos, vector<string> & arguments, const string & callStartString, const string & getterStartString, unsigned int startFromArgument)
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
 * Generate call using an compound assignment operators ( =,+=,-=,*=,/= ).
 * Operator position is deduced from parameters type.
 * Expression is assumed to be placed just before the operator.
 *
 * \param Information about the instruction
 * \param Arguments, in their C++ form.
 * \param String to be placed at the start of the call ( the function to be called typically ). Example : MyObject->Set
 * \param Arguments will be generated starting from this number. For example, set this to 1 to skip the first argument.
 */
string EventsCodeGenerator::GenerateCompoundOperatorCall(const InstructionInfos & instrInfos, vector<string> & arguments, const string & callStartString, unsigned int startFromArgument)
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


std::string EventsCodeGenerator::GenerateConditionCode(const Game & game, const Scene & scene, Instruction & condition, std::string returnBoolean, EventsCodeGenerationContext & context)
{
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    std::string conditionCode;

    InstructionInfos instrInfos = extensionsManager->GetConditionInfos(condition.GetType());

    if ( !instrInfos.cppCallingInformation.optionalIncludeFile.empty() )
        AddIncludeFile(instrInfos.cppCallingInformation.optionalIncludeFile);

    if ( instrInfos.cppCallingInformation.optionalCustomCodeGenerator != boost::shared_ptr<InstructionInfos::CppCallingInformation::CustomCodeGenerator>() )
    {
        conditionCode += "{\nbool & conditionTrue = "+returnBoolean+";\n";
        conditionCode += instrInfos.cppCallingInformation.optionalCustomCodeGenerator->GenerateCode(game, scene, condition, *this, context);
        conditionCode += "}\n";

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
            if (GetTypeOfObject(game, scene, objectInParameter) != instrInfos.parameters[pNb].supplementaryInformation )
            {
                cout << "Bad object type in a parameter of a condition " << condition.GetType() << endl;
                cout << "Condition wanted " << instrInfos.parameters[pNb].supplementaryInformation << endl;
                cout << "Condition wanted " << instrInfos.parameters[pNb].supplementaryInformation << " of type " << instrInfos.parameters[pNb].supplementaryInformation << endl;
                cout << "Condition has received " << objectInParameter << " of type " << GetTypeOfObject(game, scene, objectInParameter) << endl;

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
        vector<string> arguments = GenerateParametersCodes(game, scene, condition.GetParameters(), instrInfos.parameters, context, &supplementaryParametersTypes);

        //Generate call
        string predicat;
        if ( instrInfos.cppCallingInformation.type == "number" || instrInfos.cppCallingInformation.type == "string")
        {
            predicat = GenerateRelationalOperatorCall(instrInfos, arguments, instrInfos.cppCallingInformation.cppCallingName);
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
    string objectType = GetTypeOfObject(game, scene, objectName);
    if ( !objectName.empty() && extensionsManager->HasObjectCondition(objectType, condition.GetType()) && !instrInfos.parameters.empty())
    {
        vector< ObjectGroup >::const_iterator globalGroup = find_if(game.objectGroups.begin(), game.objectGroups.end(), bind2nd(HasTheSameName(), objectName));
        vector< ObjectGroup >::const_iterator sceneGroup = find_if(scene.objectGroups.begin(), scene.objectGroups.end(), bind2nd(HasTheSameName(), objectName));

        std::vector<std::string> realObjects; //With groups, we may have to generate condition for more than one object list.
        if ( globalGroup != game.objectGroups.end() )
            realObjects = (*globalGroup).GetAllObjectsNames();
        else if ( sceneGroup != scene.objectGroups.end() )
            realObjects = (*sceneGroup).GetAllObjectsNames();
        else
            realObjects.push_back(objectName);

        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            std::string realObjectName = realObjects[i];

            context.SetCurrentObject(realObjectName);
            context.ObjectsListNeeded(realObjectName);

            //Prepare arguments
            vector<string> arguments = EventsCodeGenerator::GenerateParametersCodes(game, scene, condition.GetParameters(), instrInfos.parameters, context);

            //Add a static_cast if necessary
            const ExtensionObjectInfos & objInfo = extensionsManager->GetObjectInfo(objectType);
            AddIncludeFile(objInfo.optionalIncludeFile);
            string objectFunctionCallNamePart =
            ( !instrInfos.parameters[0].supplementaryInformation.empty() ) ?
                "static_cast<"+objInfo.cppClassName+"*>("+ManObjListName(realObjectName)+"[i])->"+instrInfos.cppCallingInformation.cppCallingName
            :   ManObjListName(realObjectName)+"[i]->"+instrInfos.cppCallingInformation.cppCallingName;

            //Create call
            string predicat;
            if ( (instrInfos.cppCallingInformation.type == "number" || instrInfos.cppCallingInformation.type == "string") )
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
            if ( condition.IsInverted() ) predicat = "!("+predicat+")";

            //Generate whole condition code
            conditionCode += "for(unsigned int i = 0;i < "+ManObjListName(realObjectName)+".size();)\n";
            conditionCode += "{\n";
            conditionCode += "    if ( "+predicat+" )\n";
            conditionCode += "    {\n";
            conditionCode += "        "+returnBoolean+" = true;\n";
            conditionCode += "        ++i;\n";
            conditionCode += "    }\n";
            conditionCode += "    else\n";
            conditionCode += "    {\n";
            conditionCode += "        "+ManObjListName(realObjectName)+".erase("+ManObjListName(realObjectName)+".begin()+i);\n";
            conditionCode += "    }\n";
            conditionCode += "}\n";
            context.SetNoCurrentObject();
        }
    }

    //Generate automatism condition if available
    string automatismType = GetTypeOfAutomatism(game, scene, condition.GetParameters().size() < 2 ? "" : condition.GetParameter(1).GetPlainString());
    if (extensionsManager->HasAutomatismCondition(automatismType, condition.GetType()) && instrInfos.parameters.size() >= 2)
    {
        vector< ObjectGroup >::const_iterator globalGroup = find_if(game.objectGroups.begin(), game.objectGroups.end(), bind2nd(HasTheSameName(), objectName));
        vector< ObjectGroup >::const_iterator sceneGroup = find_if(scene.objectGroups.begin(), scene.objectGroups.end(), bind2nd(HasTheSameName(), objectName));

        std::vector<std::string> realObjects; //With groups, we may have to generate condition for more than one object list.
        if ( globalGroup != game.objectGroups.end() )
            realObjects = (*globalGroup).GetAllObjectsNames();
        else if ( sceneGroup != scene.objectGroups.end() )
            realObjects = (*sceneGroup).GetAllObjectsNames();
        else
            realObjects.push_back(objectName);

        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            std::string realObjectName = realObjects[i];

            context.SetCurrentObject(realObjectName);
            context.ObjectsListNeeded(realObjectName);

            //Prepare arguments
            vector<string> arguments = GenerateParametersCodes(game, scene, condition.GetParameters(), instrInfos.parameters, context);

            //Add a static_cast if necessary
            const AutomatismInfo & autoInfo = extensionsManager->GetAutomatismInfo(automatismType);
            AddIncludeFile(autoInfo.optionalIncludeFile);
            string objectFunctionCallNamePart =
            ( !instrInfos.parameters[1].supplementaryInformation.empty() ) ?
                "static_cast<"+autoInfo.cppClassName+"*>("+ManObjListName(realObjectName)+"[i]->GetAutomatismRawPointer(\""+condition.GetParameter(1).GetPlainString()+"\"))->"+instrInfos.cppCallingInformation.cppCallingName
            :   ManObjListName(realObjectName)+"[i]->GetAutomatism(\""+condition.GetParameter(1).GetPlainString()+"\")->"+instrInfos.cppCallingInformation.cppCallingName;

            //Create call
            string predicat;
            if ( (instrInfos.cppCallingInformation.type == "number" || instrInfos.cppCallingInformation.type == "string") )
            {
                predicat = GenerateRelationalOperatorCall(instrInfos, arguments, objectFunctionCallNamePart, 2);
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
            vector < string > automatisms = GetAutomatismsOfObject(game, scene, realObjectName);
            if ( find(automatisms.begin(), automatisms.end(), condition.GetParameter(1).GetPlainString()) == automatisms.end() )
            {
                cout << "Bad automatism requested" << endl;
                condition.SetType("");
            }
            else
            {
                conditionCode += "for(unsigned int i = 0;i < "+ManObjListName(realObjectName)+".size();)\n";
                conditionCode += "{\n";
                conditionCode += "    if ( "+predicat+" )\n";
                conditionCode += "    {\n";
                conditionCode += "        "+returnBoolean+" = true;\n";
                conditionCode += "        ++i;\n";
                conditionCode += "    }\n";
                conditionCode += "    else\n";
                conditionCode += "    {\n";
                conditionCode += "        "+ManObjListName(realObjectName)+".erase("+ManObjListName(realObjectName)+".begin()+i);\n";
                conditionCode += "    }\n";
                conditionCode += "}";
            }

            context.SetNoCurrentObject();
        }
    }

    return conditionCode;
}

/**
 * Generate code for a list of conditions.
 * Bools containing conditions results are named conditionXIsTrue.
 */
string EventsCodeGenerator::GenerateConditionsListCode(const Game & game, const Scene & scene, vector < Instruction > & conditions, EventsCodeGenerationContext & context)
{
    string outputCode;

    for (unsigned int i = 0;i<conditions.size();++i)
        outputCode += "bool condition"+ToString(i)+"IsTrue = false;\n";

    for (unsigned int cId =0;cId < conditions.size();++cId)
    {
        string conditionCode = GenerateConditionCode(game, scene, conditions[cId], "condition"+ToString(cId)+"IsTrue", context);
        if ( !conditions[cId].GetType().empty() )
        {
            for (unsigned int i = 0;i<cId;++i) //Skip conditions if one condition is false. //TODO : Can be optimized
            {
                if (i == 0) outputCode += "if ( "; else outputCode += " && ";
                outputCode += "condition"+ToString(i)+"IsTrue";
                if (i == cId-1) outputCode += ") ";
            }
            outputCode += "{\n";
            outputCode += conditionCode;
            outputCode += "}\n";
        }
    }

    return outputCode;
}

/**
 * Generate code for an action.
 */
std::string EventsCodeGenerator::GenerateActionCode(const Game & game, const Scene & scene, Instruction & action, EventsCodeGenerationContext & context)
{
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    string actionCode;

    InstructionInfos instrInfos = extensionsManager->GetActionInfos(action.GetType());

    if ( !instrInfos.cppCallingInformation.optionalIncludeFile.empty() )
        AddIncludeFile(instrInfos.cppCallingInformation.optionalIncludeFile);

    if ( instrInfos.cppCallingInformation.optionalCustomCodeGenerator != boost::shared_ptr<InstructionInfos::CppCallingInformation::CustomCodeGenerator>() )
    {
        return instrInfos.cppCallingInformation.optionalCustomCodeGenerator->GenerateCode(game, scene, action, *this, context);
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
            if (GetTypeOfObject(game, scene, objectInParameter) != instrInfos.parameters[pNb].supplementaryInformation )
            {
                cout << "Bad object type in parameter "+ToString(pNb)+" of an action " << action.GetType() << endl;
                cout << "Action wanted " << instrInfos.parameters[pNb].supplementaryInformation << " of type " << instrInfos.parameters[pNb].supplementaryInformation << endl;
                cout << "Action has received " << objectInParameter << " of type " << GetTypeOfObject(game, scene, objectInParameter) << endl;

                action.SetParameter(pNb, GDExpression(""));
                action.SetType("");
            }
        }
    }

    //Call static function first if available
    if ( extensionsManager->HasAction(action.GetType()))
    {
        vector<string> arguments = GenerateParametersCodes(game, scene, action.GetParameters(), instrInfos.parameters, context);

        //Generate call
        string call;
        if ( instrInfos.cppCallingInformation.type == "number" || instrInfos.cppCallingInformation.type == "string" )
        {
            if ( instrInfos.cppCallingInformation.accessType == InstructionInfos::CppCallingInformation::MutatorAndOrAccessor )
                call = GenerateOperatorCall(instrInfos, arguments, instrInfos.cppCallingInformation.cppCallingName, instrInfos.cppCallingInformation.optionalAssociatedInstruction);
            else
                call = GenerateCompoundOperatorCall(instrInfos, arguments, instrInfos.cppCallingInformation.cppCallingName);
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
    string objectType = GetTypeOfObject(game, scene, objectName);
    if ( extensionsManager->HasObjectAction(objectType, action.GetType()) && !instrInfos.parameters.empty())
    {
        vector< ObjectGroup >::const_iterator globalGroup = find_if(game.objectGroups.begin(), game.objectGroups.end(), bind2nd(HasTheSameName(), objectName));
        vector< ObjectGroup >::const_iterator sceneGroup = find_if(scene.objectGroups.begin(), scene.objectGroups.end(), bind2nd(HasTheSameName(), objectName));

        std::vector<std::string> realObjects; //With groups, we may have to generate condition for more than one object list.
        if ( globalGroup != game.objectGroups.end() )
            realObjects = (*globalGroup).GetAllObjectsNames();
        else if ( sceneGroup != scene.objectGroups.end() )
            realObjects = (*sceneGroup).GetAllObjectsNames();
        else
            realObjects.push_back(objectName);

        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            std::string realObjectName = realObjects[i];

            context.SetCurrentObject(realObjectName);
            context.ObjectsListNeeded(realObjectName);

            vector<string> arguments = GenerateParametersCodes(game, scene, action.GetParameters(), instrInfos.parameters, context);

            //Add a static_cast if necessary
            const ExtensionObjectInfos & objInfo = extensionsManager->GetObjectInfo(objectType);
            AddIncludeFile(objInfo.optionalIncludeFile);
            string objectPart = ( !instrInfos.parameters[0].supplementaryInformation.empty() ) ? "static_cast<"+objInfo.cppClassName+"*>("+ManObjListName(realObjectName)+"[i])->" : ManObjListName(realObjectName)+"[i]->" ;

            //Create call
            string call;
            if ( instrInfos.cppCallingInformation.type == "number" || instrInfos.cppCallingInformation.type == "string")
            {
                if ( instrInfos.cppCallingInformation.accessType == InstructionInfos::CppCallingInformation::MutatorAndOrAccessor )
                    call = GenerateOperatorCall(instrInfos, arguments, objectPart+instrInfos.cppCallingInformation.cppCallingName, objectPart+instrInfos.cppCallingInformation.optionalAssociatedInstruction,1);
                else
                    call = GenerateCompoundOperatorCall(instrInfos, arguments, objectPart+instrInfos.cppCallingInformation.cppCallingName,1);
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

            actionCode += "for(unsigned int i = 0;i < "+ManObjListName(realObjectName)+".size();++i)\n";
            actionCode += "{\n";
            actionCode += "    "+call+";\n";
            actionCode += "}\n";

            context.SetNoCurrentObject();
        }
    }

    //Affection to an automatism member function if found
    string automatismType = GetTypeOfAutomatism(game, scene, action.GetParameters().size() < 2 ? "" : action.GetParameter(1).GetPlainString());
    if (extensionsManager->HasAutomatismAction(automatismType, action.GetType()) && instrInfos.parameters.size() >= 2)
    {
        vector< ObjectGroup >::const_iterator globalGroup = find_if(game.objectGroups.begin(), game.objectGroups.end(), bind2nd(HasTheSameName(), objectName));
        vector< ObjectGroup >::const_iterator sceneGroup = find_if(scene.objectGroups.begin(), scene.objectGroups.end(), bind2nd(HasTheSameName(), objectName));

        std::vector<std::string> realObjects; //With groups, we may have to generate condition for more than one object list.
        if ( globalGroup != game.objectGroups.end() )
            realObjects = (*globalGroup).GetAllObjectsNames();
        else if ( sceneGroup != scene.objectGroups.end() )
            realObjects = (*sceneGroup).GetAllObjectsNames();
        else
            realObjects.push_back(objectName);

        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            std::string realObjectName = realObjects[i];

            context.SetCurrentObject(realObjectName);
            context.ObjectsListNeeded(realObjectName);

            vector<string> arguments = GenerateParametersCodes(game, scene, action.GetParameters(), instrInfos.parameters, context);

            //Add a static_cast if necessary
            const AutomatismInfo & autoInfo = extensionsManager->GetAutomatismInfo(automatismType);
            AddIncludeFile(autoInfo.optionalIncludeFile);
            string objectPart =
            ( !instrInfos.parameters[1].supplementaryInformation.empty() ) ?
                "static_cast<"+autoInfo.cppClassName+"*>("+ManObjListName(realObjectName)+"[i]->GetAutomatismRawPointer(\""+action.GetParameter(1).GetPlainString()+"\"))->"
            :   ManObjListName(realObjectName)+"[i]->GetAutomatismRawPointer(\""+action.GetParameter(1).GetPlainString()+"\")->";

            //Create call
            string call;
            if ( (instrInfos.cppCallingInformation.type == "number" || instrInfos.cppCallingInformation.type == "string") )
            {
                if ( instrInfos.cppCallingInformation.accessType == InstructionInfos::CppCallingInformation::MutatorAndOrAccessor )
                    call = GenerateOperatorCall(instrInfos, arguments, objectPart+instrInfos.cppCallingInformation.cppCallingName, objectPart+instrInfos.cppCallingInformation.optionalAssociatedInstruction,2);
                else
                    call = GenerateCompoundOperatorCall(instrInfos, arguments, objectPart+instrInfos.cppCallingInformation.cppCallingName,2);
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
            vector < string > automatisms = GetAutomatismsOfObject(game, scene, realObjectName);
            if ( find(automatisms.begin(), automatisms.end(), action.GetParameter(1).GetPlainString()) == automatisms.end() )
            {
                cout << "Bad automatism requested" << endl;
                action.SetType("");
            }
            else
            {
                actionCode += "for(unsigned int i = 0;i < "+ManObjListName(realObjectName)+".size();++i)\n";
                actionCode += "{\n";
                actionCode += "    "+call+";\n";
                actionCode += "}\n";
            }

            context.SetNoCurrentObject();
        }
    }

    return actionCode;
}

/**
 * Generate actions code.
 */
string EventsCodeGenerator::GenerateActionsListCode(const Game & game, const Scene & scene, vector < Instruction > & actions, EventsCodeGenerationContext & context)
{
    string outputCode;
    for (unsigned int aId =0;aId < actions.size();++aId)
    {
        string actionCode = GenerateActionCode(game, scene, actions[aId], context);

        outputCode += "{\n";
        if ( !actions[aId].GetType().empty() ) outputCode += actionCode;
        outputCode += "}\n";
    }

    return outputCode;
}

/**
 */
vector<string> EventsCodeGenerator::GenerateParametersCodes(const Game & game, const Scene & scene, vector < GDExpression > parameters, const vector < ParameterInfo > & parametersInfo, EventsCodeGenerationContext & context, std::vector < std::pair<std::string, std::string> > * supplementaryParametersTypes)
{
    vector<string> arguments;

    while(parameters.size() < parametersInfo.size())
        parameters.push_back(GDExpression(""));

    for (unsigned int pNb = 0;pNb < parametersInfo.size() && pNb < parameters.size();++pNb)
    {
        string argOutput;

        if ( parameters[pNb].GetPlainString().empty() && parametersInfo[pNb].optional  )
            parameters[pNb] = GDExpression(parametersInfo[pNb].defaultValue);

        if ( parametersInfo[pNb].type == "expression" || parametersInfo[pNb].type == "camera" )
        {
            CallbacksForGeneratingExpressionCode callbacks(argOutput, game, scene, *this, context);

            GDExpressionParser parser(parameters[pNb].GetPlainString());
            if ( !parser.ParseMathExpression(game, scene, callbacks) )
            {
                cout << "Error :" << parser.firstErrorStr << " in: "<< parameters[pNb].GetPlainString() << endl;

                argOutput = "0";
            }

            if (argOutput.empty()) argOutput = "0";
        }
        else if ( parametersInfo[pNb].type == "string" || parametersInfo[pNb].type == "layer" || parametersInfo[pNb].type == "color" || parametersInfo[pNb].type == "file" || parametersInfo[pNb].type == "joyaxis" )
        {
            CallbacksForGeneratingExpressionCode callbacks(argOutput, game, scene, *this, context);

            GDExpressionParser parser(parameters[pNb].GetPlainString());
            if ( !parser.ParseTextExpression(game, scene, callbacks) )
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
                vector< ObjectGroup >::const_iterator globalGroup = find_if(game.objectGroups.begin(), game.objectGroups.end(), bind2nd(HasTheSameName(), parameters[i].GetPlainString()));
                vector< ObjectGroup >::const_iterator sceneGroup = find_if(scene.objectGroups.begin(), scene.objectGroups.end(), bind2nd(HasTheSameName(), parameters[i].GetPlainString()));

                std::vector<std::string> realObjects;
                if ( globalGroup != game.objectGroups.end() )
                    realObjects = (*globalGroup).GetAllObjectsNames();
                else if ( sceneGroup != scene.objectGroups.end() )
                    realObjects = (*sceneGroup).GetAllObjectsNames();
                else
                    realObjects.push_back(parameters[i].GetPlainString());

                argOutput += "runtimeContext->ClearObjectListsMap()";
                for (unsigned int i = 0;i<realObjects.size();++i)
                {
                    context.ObjectsListNeeded(realObjects[i]);
                    argOutput += ".AddObjectListToMap(\""+realObjects[i]+"\", "+ManObjListName(realObjects[i])+")";
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
                vector< ObjectGroup >::const_iterator globalGroup = find_if(game.objectGroups.begin(), game.objectGroups.end(), bind2nd(HasTheSameName(), parameters[i].GetPlainString()));
                vector< ObjectGroup >::const_iterator sceneGroup = find_if(scene.objectGroups.begin(), scene.objectGroups.end(), bind2nd(HasTheSameName(), parameters[i].GetPlainString()));

                std::vector<std::string> realObjects;
                if ( globalGroup != game.objectGroups.end() )
                    realObjects = (*globalGroup).GetAllObjectsNames();
                else if ( sceneGroup != scene.objectGroups.end() )
                    realObjects = (*sceneGroup).GetAllObjectsNames();
                else
                    realObjects.push_back(parameters[i].GetPlainString());

                argOutput += "runtimeContext->ClearObjectListsMap()";
                for (unsigned int i = 0;i<realObjects.size();++i)
                {
                    context.EmptyObjectsListNeeded(realObjects[i]);
                    argOutput += ".AddObjectListToMap(\""+realObjects[i]+"\", "+ManObjListName(realObjects[i])+")";
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
                vector< ObjectGroup >::const_iterator globalGroup = find_if(game.objectGroups.begin(), game.objectGroups.end(), bind2nd(HasTheSameName(), parameters[i].GetPlainString()));
                vector< ObjectGroup >::const_iterator sceneGroup = find_if(scene.objectGroups.begin(), scene.objectGroups.end(), bind2nd(HasTheSameName(), parameters[i].GetPlainString()));

                std::vector<std::string> realObjects;
                if ( globalGroup != game.objectGroups.end() ) //With groups, more than one object list can be needed
                    realObjects = (*globalGroup).GetAllObjectsNames();
                else if ( sceneGroup != scene.objectGroups.end() )
                    realObjects = (*sceneGroup).GetAllObjectsNames();
                else
                    realObjects.push_back(parameters[i].GetPlainString());

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

/**
 * Generate events list code.
 */
string EventsCodeGenerator::GenerateEventsListCode(const Game & game, const Scene & scene, vector < BaseEventSPtr > & events, const EventsCodeGenerationContext & parentContext)
{
    string output;

    for ( unsigned int eId = 0; eId < events.size();++eId )
    {
        //Each event has its own context : Objects picked in an event are totally different than the one picked in another.
        EventsCodeGenerationContext context;
        context.InheritsFrom(parentContext); //Events in the same "level" share the same context as their parent.

        string eventCoreCode = events[eId]->GenerateEventCode(game, scene, *this, context);
        string declarationsCode = context.GenerateObjectsDeclarationCode();

        output += "\n{\n" + declarationsCode + "\n" + eventCoreCode + "\n}\n";
    }

    return output;
}

string EventsCodeGenerator::GenerateEventsCompleteCode(const Game & game, const Scene & scene, vector < BaseEventSPtr > & events)
{
    string output;

    //Prepare the global context ( Used to get needed header files )
    EventsCodeGenerationContext context;
    EventsCodeGenerator codeGenerator;

    //Generate whole events code
    string wholeEventsCode = codeGenerator.GenerateEventsListCode(game, scene, events, context);

    //Generate default code around events
    for ( set<string>::iterator include = codeGenerator.GetIncludeFiles().begin() ; include != codeGenerator.GetIncludeFiles().end(); ++include )
        output += "#include \""+*include+"\"\n";

    output +=
    "#include <vector>\n#include <map>\n#include <string>\n#include <stdio.h>\n#include <SFML/System/Clock.hpp>\n#include <SFML/System/Vector2.hpp>\n#include <SFML/Graphics/Color.hpp>\n#include \"GDL/RuntimeContext.h\"\n#include \"GDL/Object.h\"\n#include \"GDL/AudioTools.h\"\n#include \"GDL/CommonInstructions.h\"\n#include \"GDL/LightweightCommonTools.h\"\n#include \"GDL/FileTools.h\"\n#include \"GDL/KeyboardTools.h\"\n#include \"GDL/MouseTools.h\"\n#include \"GDL/NetworkTools.h\"\n#include \"GDL/ObjectTools.h\"\n#include \"GDL/RuntimeSceneCameraTools.h\"\n#include \"GDL/RuntimeSceneTools.h\"\n#include \"GDL/SpriteObject.h\"\n#include \"GDL/SpriteTools.h\"\n#include \"GDL/TimeTools.h\"\nextern void * pointerToRuntimeContext;\nint _CRT_MT = 1; //Required, when using O3, but not exported by any dlls?\n\n";

    for ( set<string>::iterator declaration = codeGenerator.GetCustomGlobalDeclaration().begin() ; declaration != codeGenerator.GetCustomGlobalDeclaration().end(); ++declaration )
        output += *declaration+"\n";

    output +=
    codeGenerator.GetCustomCodeOutsideMain()+
    "\n"
    "int main()\n"
    "{\n"
	"RuntimeContext * runtimeContext = static_cast< RuntimeContext *> (pointerToRuntimeContext);"
	+codeGenerator.GetCustomCodeInMain()
    +wholeEventsCode+
    "return 0;\n"
    "}\n";

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

/**
 * Call preprocession method of each event
 */
void EventsCodeGenerator::PreprocessEventList( const Game & game, const Scene & scene, vector < BaseEventSPtr > & listEvent )
{
    #if defined(GD_IDE_ONLY)
    boost::shared_ptr<ProfileEvent> previousProfileEvent;
    #endif

    for ( unsigned int i = 0;i < listEvent.size();++i )
    {
        listEvent[i]->Preprocess(game, scene, listEvent, i);
        if ( listEvent[i]->CanHaveSubEvents() )
            PreprocessEventList( game, scene, listEvent[i]->GetSubEvents());

        #if defined(GD_IDE_ONLY)
        if ( scene.profiler && scene.profiler->profilingActivated && listEvent[i]->IsExecutable() )
        {
            //Define a new profile event
            boost::shared_ptr<ProfileEvent> profileEvent = boost::shared_ptr<ProfileEvent>(new ProfileEvent);
            profileEvent->originalEvent = listEvent[i]->originalEvent;
            profileEvent->SetPreviousProfileEvent(previousProfileEvent);

            //Add it before the event to profile
            listEvent.insert(listEvent.begin()+i, profileEvent);

            previousProfileEvent = profileEvent;
            ++i; //Don't preprocess the newly added profile event
        }
        #endif
    }
    #if defined(GD_IDE_ONLY)
    if ( !listEvent.empty() && scene.profiler && scene.profiler->profilingActivated )
    {
        //Define a new profile event
        boost::shared_ptr<ProfileEvent> profileEvent = boost::shared_ptr<ProfileEvent>(new ProfileEvent);
        profileEvent->SetPreviousProfileEvent(previousProfileEvent);

        //Add it at the end of the events list
        listEvent.push_back(profileEvent);
    }
    #endif
}

void EventsCodeGenerator::ReportError()
{
    errorOccurred = true;
}

#endif
