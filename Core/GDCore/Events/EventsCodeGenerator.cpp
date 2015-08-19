#include <algorithm>
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
#include "GDCore/Events/BehaviorMetadata.h"

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
gd::String EventsCodeGenerator::GenerateRelationalOperatorCall(const gd::InstructionMetadata & instrInfos, const vector<gd::String>  & arguments, const gd::String & callStartString, unsigned int startFromArgument)
{
    unsigned int relationalOperatorIndex = instrInfos.parameters.size();
    for (unsigned int i = startFromArgument;i<instrInfos.parameters.size();++i)
    {
        if ( instrInfos.parameters[i].type == "relationalOperator" )
            relationalOperatorIndex = i;
    }
    //Ensure that there is at least one parameter after the relational operator
    if ( relationalOperatorIndex+1 >= instrInfos.parameters.size() )
    {
        ReportError();
        return "";
    }

    gd::String relationalOperator = arguments[relationalOperatorIndex];
    if ( relationalOperator.size() > 2 ) relationalOperator = relationalOperator.substr(1, relationalOperator.length()-1-1); //Relational operator contains quote which must be removed.

    gd::String rhs = arguments[relationalOperatorIndex+1];
    gd::String argumentsStr;
    for (unsigned int i = startFromArgument;i<arguments.size();++i)
    {
        if ( i != relationalOperatorIndex && i != relationalOperatorIndex+1)
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
gd::String EventsCodeGenerator::GenerateOperatorCall(const gd::InstructionMetadata & instrInfos, const vector<gd::String>  & arguments, const gd::String & callStartString, const gd::String & getterStartString, unsigned int startFromArgument)
{
    unsigned int operatorIndex = instrInfos.parameters.size();
    for (unsigned int i = startFromArgument;i<instrInfos.parameters.size();++i)
    {
        if ( instrInfos.parameters[i].type == "operator" )
            operatorIndex = i;
    }

    //Ensure that there is at least one parameter after the operator
    if ( operatorIndex+1 >= instrInfos.parameters.size() )
    {
        ReportError();
        return "";
    }

    gd::String operatorStr = arguments[operatorIndex];
    if ( operatorStr.size() > 2 ) operatorStr = operatorStr.substr(1, operatorStr.length()-1-1); //Operator contains quote which must be removed.

    gd::String rhs = arguments[operatorIndex+1];

    //Generate arguments for calling the "getter" function
    gd::String getterArgumentsStr;
    for (unsigned int i = startFromArgument;i<arguments.size();++i)
    {
        if ( i != operatorIndex && i != operatorIndex+1)
        {
            if ( !getterArgumentsStr.empty() ) getterArgumentsStr += ", ";
            getterArgumentsStr += arguments[i];
        }
    }

    //Generate arguments for calling the function ("setter")
    gd::String argumentsStr;
    for (unsigned int i = startFromArgument;i<arguments.size();++i)
    {
        if ( i != operatorIndex && i != operatorIndex+1) //Generate classic arguments
        {
            if ( !argumentsStr.empty() ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }
        if ( i == operatorIndex+1 )
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
gd::String EventsCodeGenerator::GenerateCompoundOperatorCall(const gd::InstructionMetadata & instrInfos, const vector<gd::String>  & arguments, const gd::String & callStartString, unsigned int startFromArgument)
{
    unsigned int operatorIndex = instrInfos.parameters.size();
    for (unsigned int i = startFromArgument;i<instrInfos.parameters.size();++i)
    {
        if ( instrInfos.parameters[i].type == "operator" )
            operatorIndex = i;
    }

    //Ensure that there is at least one parameter after the operator
    if ( operatorIndex+1 >= instrInfos.parameters.size() )
    {
        ReportError();
        return "";
    }

    gd::String operatorStr = arguments[operatorIndex];
    if ( operatorStr.size() > 2 ) operatorStr = operatorStr.substr(1, operatorStr.length()-1-1); //Operator contains quote which must be removed.

    gd::String rhs = arguments[operatorIndex+1];

    //Generate real operator string.
    if ( operatorStr == "+" ) operatorStr = "+=";
    else if ( operatorStr == "-" ) operatorStr = "-=";
    else if ( operatorStr == "/" ) operatorStr = "/=";
    else if ( operatorStr == "*" ) operatorStr = "*=";

    //Generate arguments for calling the function ("setter")
    gd::String argumentsStr;
    for (unsigned int i = startFromArgument;i<arguments.size();++i)
    {
        if ( i != operatorIndex && i != operatorIndex+1) //Generate classic arguments
        {
            if ( !argumentsStr.empty() ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }
    }

    return callStartString+"("+argumentsStr+") "+operatorStr+" ("+rhs+")";
}

gd::String EventsCodeGenerator::GenerateConditionCode(gd::Instruction & condition, gd::String returnBoolean, EventsCodeGenerationContext & context)
{
    gd::String conditionCode;

    gd::InstructionMetadata instrInfos = MetadataProvider::GetConditionMetadata(platform, condition.GetType());

    AddIncludeFile(instrInfos.codeExtraInformation.optionalIncludeFile);
    maxConditionsListsSize = std::max(maxConditionsListsSize, condition.GetSubInstructions().size());

    if ( instrInfos.codeExtraInformation.HasCustomCodeGenerator())
    {
        context.EnterCustomCondition();
        conditionCode += GenerateReferenceToUpperScopeBoolean("conditionTrue", returnBoolean, context);
        conditionCode += instrInfos.codeExtraInformation.customCodeGenerator(condition, *this, context);
        maxCustomConditionsDepth = std::max(maxCustomConditionsDepth, context.GetCurrentConditionDepth());
        context.LeaveCustomCondition();

        return "{"+conditionCode+"}\n";
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
        if ( ParameterMetadata::IsObject(instrInfos.parameters[pNb].type) )
        {
            gd::String objectInParameter = condition.GetParameter(pNb).GetPlainString();

            if ( !scene.HasObjectNamed(objectInParameter) && !project.HasObjectNamed(objectInParameter)
                 && find_if(scene.GetObjectGroups().begin(), scene.GetObjectGroups().end(), bind2nd(gd::GroupHasTheSameName(), objectInParameter) ) == scene.GetObjectGroups().end()
                 && find_if(project.GetObjectGroups().begin(), project.GetObjectGroups().end(), bind2nd(gd::GroupHasTheSameName(), objectInParameter) ) == project.GetObjectGroups().end() )
            {
                cout << "Bad object (" << objectInParameter << ") in a parameter of a condition " << condition.GetType() << endl;
                condition.SetParameter(pNb, gd::Expression(""));
                condition.SetType("");
            }
            else if ( !instrInfos.parameters[pNb].supplementaryInformation.empty()
                      && gd::GetTypeOfObject(project, scene, objectInParameter) != instrInfos.parameters[pNb].supplementaryInformation )
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
        std::vector < std::pair<gd::String, gd::String> > supplementaryParametersTypes;
        supplementaryParametersTypes.push_back(std::make_pair("conditionInverted", condition.IsInverted() ? "true" : "false"));
        vector<gd::String>  arguments = GenerateParametersCodes(condition.GetParameters(), instrInfos.parameters, context, &supplementaryParametersTypes);

        conditionCode += GenerateFreeCondition(arguments, instrInfos, returnBoolean, condition.IsInverted(), context);
    }

    //Generate object condition if available
    gd::String objectName = condition.GetParameters().empty() ? "" : condition.GetParameter(0).GetPlainString();
    gd::String objectType = gd::GetTypeOfObject(project, scene, objectName);
    if ( !objectName.empty() && MetadataProvider::HasObjectCondition(platform, objectType, condition.GetType()) && !instrInfos.parameters.empty())
    {
        std::vector<gd::String> realObjects = ExpandObjectsName(objectName, context);
        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            //Set up the context
            const ObjectMetadata & objInfo = MetadataProvider::GetObjectMetadata(platform, objectType);
            AddIncludeFiles(objInfo.includeFiles);
            context.SetCurrentObject(realObjects[i]);
            context.ObjectsListNeeded(realObjects[i]);

            //Prepare arguments and generate the condition whole code
            vector<gd::String>  arguments = GenerateParametersCodes(condition.GetParameters(), instrInfos.parameters, context);
            conditionCode += GenerateObjectCondition(realObjects[i], objInfo, arguments, instrInfos, returnBoolean, condition.IsInverted(), context);

            context.SetNoCurrentObject();
        }
    }

    //Generate behavior condition if available
    gd::String behaviorType = gd::GetTypeOfBehavior(project, scene, condition.GetParameters().size() < 2 ? "" : condition.GetParameter(1).GetPlainString());
    if (MetadataProvider::HasBehaviorCondition(platform, behaviorType, condition.GetType()) && instrInfos.parameters.size() >= 2)
    {
        std::vector<gd::String> realObjects = ExpandObjectsName(objectName, context);
        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            //Setup context
            const BehaviorMetadata & autoInfo = MetadataProvider::GetBehaviorMetadata(platform, behaviorType);
            AddIncludeFiles(autoInfo.includeFiles);
            context.SetCurrentObject(realObjects[i]);
            context.ObjectsListNeeded(realObjects[i]);

            //Prepare arguments and generate the whole condition code
            vector<gd::String>  arguments = GenerateParametersCodes(condition.GetParameters(), instrInfos.parameters, context);
            conditionCode += GenerateBehaviorCondition(realObjects[i], condition.GetParameter(1).GetPlainString(), autoInfo, arguments,
                                                               instrInfos, returnBoolean, condition.IsInverted(), context);

            context.SetNoCurrentObject();
        }
    }

    return conditionCode;
}

/**
 * Generate code for a list of conditions.
 * Bools containing conditions results are named conditionXIsTrue.
 */
gd::String EventsCodeGenerator::GenerateConditionsListCode(gd::InstructionsList & conditions, EventsCodeGenerationContext & context)
{
    gd::String outputCode;

    for (unsigned int i = 0;i<conditions.size();++i)
        outputCode += GenerateBooleanInitializationToFalse("condition"+gd::String::From(i) +"IsTrue", context);

    for (unsigned int cId =0;cId < conditions.size();++cId)
    {
        gd::InstructionMetadata instrInfos = MetadataProvider::GetConditionMetadata(platform, conditions[cId].GetType());

        gd::String conditionCode = GenerateConditionCode(conditions[cId], "condition"+gd::String::From(cId) +"IsTrue", context);
        if ( !conditions[cId].GetType().empty() )
        {
            for (unsigned int i = 0;i<cId;++i) //Skip conditions if one condition is false. //TODO : Can be optimized
            {
                if (i == 0) outputCode += "if ( "; else outputCode += " && ";
                outputCode += "condition"+gd::String::From(i) +"IsTrue";
                if (i == cId-1) outputCode += ") ";
            }

            outputCode += "{\n";
            outputCode += conditionCode;
            outputCode += "}";
        }
    }

    maxConditionsListsSize = std::max(maxConditionsListsSize, conditions.size());

    return outputCode;
}

/**
 * Generate code for an action.
 */
gd::String EventsCodeGenerator::GenerateActionCode(gd::Instruction & action, EventsCodeGenerationContext & context)
{
    gd::String actionCode;

    gd::InstructionMetadata instrInfos = MetadataProvider::GetActionMetadata(platform, action.GetType());

    AddIncludeFile(instrInfos.codeExtraInformation.optionalIncludeFile);

    if ( instrInfos.codeExtraInformation.HasCustomCodeGenerator() )
    {
        return instrInfos.codeExtraInformation.customCodeGenerator(action, *this, context);
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
        if ( ParameterMetadata::IsObject(instrInfos.parameters[pNb].type) )
        {
            gd::String objectInParameter = action.GetParameter(pNb).GetPlainString();
            if ( !scene.HasObjectNamed(objectInParameter) && !project.HasObjectNamed(objectInParameter)
                 && find_if(scene.GetObjectGroups().begin(), scene.GetObjectGroups().end(), bind2nd(gd::GroupHasTheSameName(), objectInParameter) ) == scene.GetObjectGroups().end()
                 && find_if(project.GetObjectGroups().begin(), project.GetObjectGroups().end(), bind2nd(gd::GroupHasTheSameName(), objectInParameter) ) == project.GetObjectGroups().end() )
            {
                cout << "Bad object (" << objectInParameter << ") in a parameter of an action " << action.GetType() << endl;
                action.SetParameter(pNb, gd::Expression(""));
                action.SetType("");
            }
            else if ( !instrInfos.parameters[pNb].supplementaryInformation.empty()
                     && gd::GetTypeOfObject(project, scene, objectInParameter) != instrInfos.parameters[pNb].supplementaryInformation )
            {
                cout << "Bad object type in parameter "+gd::String::From(pNb)+" of an action " << action.GetType() << endl;
                cout << "Action wanted " << instrInfos.parameters[pNb].supplementaryInformation << " of type " << instrInfos.parameters[pNb].supplementaryInformation << endl;
                cout << "Action has received " << objectInParameter << " of type " << gd::GetTypeOfObject(project, scene, objectInParameter) << endl;

                action.SetParameter(pNb, gd::Expression(""));
                action.SetType("");
            }
        }
    }

    //Call free function first if available
    if (MetadataProvider::HasAction(platform, action.GetType()))
    {
        vector<gd::String>  arguments = GenerateParametersCodes(action.GetParameters(), instrInfos.parameters, context);
        actionCode += GenerateFreeAction(arguments, instrInfos, context);
    }

    //Call object function if available
    gd::String objectName = action.GetParameters().empty() ? "" : action.GetParameter(0).GetPlainString();
    gd::String objectType = gd::GetTypeOfObject(project, scene, objectName);
    if (MetadataProvider::HasObjectAction(platform, objectType, action.GetType()) && !instrInfos.parameters.empty())
    {
        std::vector<gd::String> realObjects = ExpandObjectsName(objectName, context);
        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            //Setup context
            const ObjectMetadata & objInfo = MetadataProvider::GetObjectMetadata(platform, objectType);
            AddIncludeFiles(objInfo.includeFiles);
            context.SetCurrentObject(realObjects[i]);
            context.ObjectsListNeeded(realObjects[i]);

            //Prepare arguments and generate the whole action code
            vector<gd::String>  arguments = GenerateParametersCodes(action.GetParameters(), instrInfos.parameters, context);
            actionCode += GenerateObjectAction(realObjects[i], objInfo, arguments, instrInfos, context);

            context.SetNoCurrentObject();
        }
    }

    //Assign to a behavior member function if found
    gd::String behaviorType = gd::GetTypeOfBehavior(project, scene, action.GetParameters().size() < 2 ? "" : action.GetParameter(1).GetPlainString());
    if (MetadataProvider::HasBehaviorAction(platform, behaviorType, action.GetType()) && instrInfos.parameters.size() >= 2)
    {
        std::vector<gd::String> realObjects = ExpandObjectsName(objectName, context);
        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            //Setup context
            const BehaviorMetadata & autoInfo = MetadataProvider::GetBehaviorMetadata(platform, behaviorType);
            AddIncludeFiles(autoInfo.includeFiles);
            context.SetCurrentObject(realObjects[i]);
            context.ObjectsListNeeded(realObjects[i]);

            //Prepare arguments and generate the whole action code
            vector<gd::String>  arguments = GenerateParametersCodes(action.GetParameters(), instrInfos.parameters, context);
            actionCode += GenerateBehaviorAction(realObjects[i], action.GetParameter(1).GetPlainString(), autoInfo, arguments, instrInfos, context);

            context.SetNoCurrentObject();
        }
    }

    return actionCode;
}

/**
 * Generate actions code.
 */
gd::String EventsCodeGenerator::GenerateActionsListCode(gd::InstructionsList & actions, EventsCodeGenerationContext & context)
{
    gd::String outputCode;
    for (unsigned int aId =0;aId < actions.size();++aId)
    {
        gd::InstructionMetadata instrInfos = MetadataProvider::GetActionMetadata(platform, actions[aId].GetType());

        gd::String actionCode = GenerateActionCode(actions[aId], context);

        outputCode += "{";
        if ( !actions[aId].GetType().empty() ) outputCode += actionCode;
        outputCode += "}";
    }

    return outputCode;
}

gd::String EventsCodeGenerator::GenerateParameterCodes(const gd::String & parameter, const gd::ParameterMetadata & metadata,
                                                        gd::EventsCodeGenerationContext & context,
                                                        const gd::String & previousParameter,
                                                        std::vector < std::pair<gd::String, gd::String> > * supplementaryParametersTypes)
{
    gd::String argOutput;

    if ( metadata.type == "expression" || metadata.type == "camera" )
    {
        CallbacksForGeneratingExpressionCode callbacks(argOutput, *this, context);

        gd::ExpressionParser parser(parameter);
        if ( !parser.ParseMathExpression(platform, project, scene, callbacks) )
        {
            cout << "Error :" << parser.firstErrorStr << " in: "<< parameter << endl;

            argOutput = "0";
        }

        if (argOutput.empty()) argOutput = "0";
    }
    else if ( metadata.type == "string" || metadata.type == "layer" || metadata.type == "color" || metadata.type == "file" || metadata.type == "joyaxis" )
    {
        CallbacksForGeneratingExpressionCode callbacks(argOutput, *this, context);

        gd::ExpressionParser parser(parameter);
        if ( !parser.ParseStringExpression(platform, project, scene, callbacks) )
        {
            cout << "Error in text expression" << parser.firstErrorStr << endl;

            argOutput = "\"\"";
        }

        if (argOutput.empty()) argOutput = "\"\"";
    }
    else if ( metadata.type == "relationalOperator" )
    {
        argOutput += parameter == "=" ? "==" :parameter;
        if ( argOutput != "==" && argOutput != "<" && argOutput != ">" && argOutput != "<=" && argOutput != ">=" && argOutput != "!=")
        {
            cout << "Warning: Bad relational operator: Set to == by default." << endl;
            argOutput = "==";
        }

        argOutput = "\""+argOutput+"\"";
    }
    else if ( metadata.type == "operator" )
    {
        argOutput += parameter;
        if ( argOutput != "=" && argOutput != "+" && argOutput != "-" && argOutput != "/" && argOutput != "*")
        {
            cout << "Warning: Bad operator: Set to = by default." << endl;
            argOutput = "=";
        }

        argOutput = "\""+argOutput+"\"";
    }
    else if ( metadata.type == "object" || metadata.type == "behavior" )
    {
        argOutput = "\""+ConvertToString(parameter)+"\"";
    }
    else if ( metadata.type == "key" )
    {
        argOutput = "\""+ConvertToString(parameter)+"\"";
    }
    else if (metadata.type == "objectvar" || metadata.type == "scenevar" || metadata.type == "globalvar" ||
             metadata.type == "password" || metadata.type == "musicfile" || metadata.type == "soundfile" ||
             metadata.type == "police")
    {
        argOutput = "\""+ConvertToString(parameter)+"\"";
    }
    else if ( metadata.type == "mouse" )
    {
        argOutput = "\""+ConvertToString(parameter)+"\"";
    }
    else if ( metadata.type == "yesorno" )
    {
        argOutput += (parameter == "yes" || parameter == "oui") ? GenerateTrue() : GenerateFalse();
    }
    else if ( metadata.type == "trueorfalse" )
    {
        argOutput += (parameter == "True" || parameter == "Vrai") ? GenerateTrue() : GenerateFalse();
    }
    //Code only parameter type
    else if ( metadata.type == "inlineCode" )
    {
        argOutput += metadata.supplementaryInformation;
    }
    else
    {
        //Try supplementary types if provided
        if ( supplementaryParametersTypes )
        {
            for (unsigned int i = 0;i<supplementaryParametersTypes->size();++i)
            {
                if ( (*supplementaryParametersTypes)[i].first == metadata.type )
                    argOutput += (*supplementaryParametersTypes)[i].second;
            }
        }

        //Type unknown
        if (argOutput.empty())
        {
            if ( !metadata.type.empty() ) cout << "Warning: Unknown type of parameter \"" << metadata.type << "\".";
            argOutput += "\""+ConvertToString(parameter)+"\"";
        }
    }

    return argOutput;
}

vector<gd::String>  EventsCodeGenerator::GenerateParametersCodes(vector < gd::Expression > parameters, const vector < gd::ParameterMetadata > & parametersInfo, EventsCodeGenerationContext & context, std::vector < std::pair<gd::String, gd::String> > * supplementaryParametersTypes)
{
    vector<gd::String>  arguments;

    while(parameters.size() < parametersInfo.size())
        parameters.push_back(gd::Expression(""));

    for (unsigned int pNb = 0;pNb < parametersInfo.size() && pNb < parameters.size();++pNb)
    {
        if ( parameters[pNb].GetPlainString().empty() && parametersInfo[pNb].optional  )
            parameters[pNb] = gd::Expression(parametersInfo[pNb].defaultValue);

        gd::String argOutput = GenerateParameterCodes(parameters[pNb].GetPlainString(), parametersInfo[pNb], context,
            pNb == 0 ? "" : parameters[pNb-1].GetPlainString(), supplementaryParametersTypes);

        arguments.push_back(argOutput);
    }

    return arguments;
}

gd::String EventsCodeGenerator::GenerateObjectsDeclarationCode(EventsCodeGenerationContext & context)
{
    gd::String declarationsCode;
    for ( set<gd::String>::iterator it = context.objectsListsToBeDeclared.begin() ; it != context.objectsListsToBeDeclared.end(); ++it )
    {
        if ( context.alreadyDeclaredObjectsLists.find(*it) == context.alreadyDeclaredObjectsLists.end() )
        {
            declarationsCode += "std::vector<RuntimeObject*> "+GetObjectListName(*it, context)
                                +" = runtimeContext->GetObjectsRawPointers(\""+ConvertToString(*it)+"\");\n";
            context.alreadyDeclaredObjectsLists.insert(*it);
        }
        else
        {
            //Could normally be done in one line, but clang sometimes miscompile it.
            declarationsCode += "std::vector<RuntimeObject*> & "+GetObjectListName(*it, context)+"T = "+GetObjectListName(*it, context)+";\n";
            declarationsCode += "std::vector<RuntimeObject*> "+GetObjectListName(*it, context)+" = "+GetObjectListName(*it, context)+"T;\n";
        }
    }
    for ( set<gd::String>::iterator it = context.emptyObjectsListsToBeDeclared.begin() ; it != context.emptyObjectsListsToBeDeclared.end(); ++it )
    {
        if ( context.alreadyDeclaredObjectsLists.find(*it) == context.alreadyDeclaredObjectsLists.end() )
        {
            declarationsCode += "std::vector<RuntimeObject*> "+GetObjectListName(*it, context)+";\n";
            context.alreadyDeclaredObjectsLists.insert(*it);
        }
        else
        {
            //Could normally be done in one line, but clang sometimes miscompile it.
            declarationsCode += "std::vector<RuntimeObject*> & "+GetObjectListName(*it, context)+"T = "+GetObjectListName(*it, context)+";\n";
            declarationsCode += "std::vector<RuntimeObject*> "+GetObjectListName(*it, context)+" = "+GetObjectListName(*it, context)+"T;\n";
        }
    }

    return declarationsCode ;
}

/**
 * Generate events list code.
 */
gd::String EventsCodeGenerator::GenerateEventsListCode(gd::EventsList & events, const EventsCodeGenerationContext & parentContext)
{
    gd::String output;

    for ( unsigned int eId = 0; eId < events.size();++eId )
    {
        //Each event has its own context : Objects picked in an event are totally different than the one picked in another.
        gd::EventsCodeGenerationContext context;
        context.InheritsFrom(parentContext); //Events in the same "level" share the same context as their parent.

        gd::String eventCoreCode = events[eId].GenerateEventCode(*this, context);
        gd::String scopeBegin = GenerateScopeBegin(context);
        gd::String scopeEnd = GenerateScopeEnd(context);
        gd::String declarationsCode = GenerateObjectsDeclarationCode(context);

        output += "\n"+ scopeBegin +"\n" + declarationsCode + "\n" + eventCoreCode + "\n"+ scopeEnd +"\n";
    }

    return output;
}

gd::String EventsCodeGenerator::ConvertToString(gd::String plainString)
{
    for (size_t i = 0;i<plainString.length();++i)
    {
        if ( plainString[i] == '\\' )
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

    while ( plainString.find('\n') != gd::String::npos)
        plainString.replace(plainString.find('\n'), 1, "\\n");


    return plainString;
}

gd::String EventsCodeGenerator::ConvertToStringExplicit(gd::String plainString)
{
    return "\""+ConvertToString(plainString)+"\"";
}

std::vector<gd::String> EventsCodeGenerator::ExpandObjectsName(const gd::String & objectName, const EventsCodeGenerationContext & context) const
{
    std::vector<gd::String> realObjects;
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

    //Ensure that all returned objects actually exists.
    for (unsigned int i = 0; i < realObjects.size();)
    {
        if ( !scene.HasObjectNamed(realObjects[i]) && !project.HasObjectNamed(realObjects[i]) )
            realObjects.erase(realObjects.begin()+i);
        else
            ++i;
    }

    return realObjects;
}

void EventsCodeGenerator::DeleteUselessEvents(gd::EventsList & events)
{
    for ( unsigned int eId = events.size()-1; eId < events.size();--eId )
    {
        if ( events[eId].CanHaveSubEvents() ) //Process sub events, if any
            DeleteUselessEvents(events[eId].GetSubEvents());

        if ( !events[eId].IsExecutable() || events[eId].IsDisabled() ) //Delete events that are not executable
            events.RemoveEvent(eId);
    }
}

/**
 * Call preprocessing method of each event
 */
void EventsCodeGenerator::PreprocessEventList(gd::EventsList & listEvent)
{
    for ( unsigned int i = 0;i < listEvent.GetEventsCount();++i )
    {
        listEvent[i].Preprocess(*this, listEvent, i);
        if ( i < listEvent.GetEventsCount() ) { //Be sure that that there is still an event! ( Preprocess can remove it. )
            if ( listEvent[i].CanHaveSubEvents() )
                PreprocessEventList( listEvent[i].GetSubEvents());
        }
    }
}

void EventsCodeGenerator::ReportError()
{
    errorOccurred = true;
}

gd::String EventsCodeGenerator::GenerateObjectFunctionCall(gd::String objectListName,
                                                      const gd::ObjectMetadata & objMetadata,
                                                      const gd::ExpressionCodeGenerationInformation & codeInfo,
                                                      gd::String parametersStr,
                                                      gd::String defaultOutput,
                                                      gd::EventsCodeGenerationContext & context)
{
    return "TODO (GenerateObjectFunctionCall)";
}

gd::String EventsCodeGenerator::GenerateObjectBehaviorFunctionCall(gd::String objectListName,
                                                      gd::String behaviorName,
                                                      const gd::BehaviorMetadata & autoInfo,
                                                      const gd::ExpressionCodeGenerationInformation & codeInfo,
                                                      gd::String parametersStr,
                                                      gd::String defaultOutput,
                                                      gd::EventsCodeGenerationContext & context)
{
    return "TODO (GenerateObjectBehaviorFunctionCall)";
}


gd::String EventsCodeGenerator::GenerateFreeCondition(const std::vector<gd::String> & arguments,
                                                             const gd::InstructionMetadata & instrInfos,
                                                             const gd::String & returnBoolean,
                                                             bool conditionInverted,
                                                             gd::EventsCodeGenerationContext & context)
{
    //Generate call
    gd::String predicat;
    if ( instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string")
    {
        predicat = GenerateRelationalOperatorCall(instrInfos, arguments, instrInfos.codeExtraInformation.functionCallName);
    }
    else
    {
        gd::String argumentsStr;
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
    if (!conditionAlreadyTakeCareOfInversion && conditionInverted) predicat = GenerateNegatedPredicat(predicat);

    //Generate condition code
    return returnBoolean+" = "+predicat+";\n";
}

gd::String EventsCodeGenerator::GenerateObjectCondition(const gd::String & objectName,
                                                                   const gd::ObjectMetadata & objInfo,
                                                                   const std::vector<gd::String> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos,
                                                                   const gd::String & returnBoolean,
                                                                   bool conditionInverted,
                                                                   gd::EventsCodeGenerationContext & context)
{
    //Prepare call
    //Add a static_cast if necessary
    gd::String objectFunctionCallNamePart =
    ( !instrInfos.parameters[0].supplementaryInformation.empty() ) ?
        "static_cast<"+objInfo.className+"*>("+GetObjectListName(objectName, context)+"[i])->"+instrInfos.codeExtraInformation.functionCallName
    :   GetObjectListName(objectName, context)+"[i]->"+instrInfos.codeExtraInformation.functionCallName;

    //Create call
    gd::String predicat;
    if ( (instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string") )
    {
        predicat = GenerateRelationalOperatorCall(instrInfos, arguments, objectFunctionCallNamePart, 1);
    }
    else
    {
        gd::String argumentsStr;
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

gd::String EventsCodeGenerator::GenerateBehaviorCondition(const gd::String & objectName,
                                                                       const gd::String & behaviorName,
                                                                   const gd::BehaviorMetadata & autoInfo,
                                                                   const std::vector<gd::String> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos,
                                                                   const gd::String & returnBoolean,
                                                                   bool conditionInverted,
                                                                   gd::EventsCodeGenerationContext & context)
{
    //Create call
    gd::String predicat;
    if ( (instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string") )
    {
        predicat = GenerateRelationalOperatorCall(instrInfos, arguments, "", 2);
    }
    else
    {
        gd::String argumentsStr;
        for (unsigned int i = 2;i<arguments.size();++i)
        {
            if ( i != 2 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        predicat = "("+argumentsStr+")";
    }
    if ( conditionInverted ) predicat = GenerateNegatedPredicat(predicat);

    return "For each picked object \""+objectName+"\", check "+predicat+" for behavior \""+behaviorName+"\".\n";
}

gd::String EventsCodeGenerator::GenerateFreeAction(const std::vector<gd::String> & arguments, const gd::InstructionMetadata & instrInfos,
                                                    gd::EventsCodeGenerationContext & context)
{
    //Generate call
    gd::String call;
    if ( instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string" )
    {
        if ( instrInfos.codeExtraInformation.accessType == gd::InstructionMetadata::ExtraInformation::MutatorAndOrAccessor )
            call = GenerateOperatorCall(instrInfos, arguments, instrInfos.codeExtraInformation.functionCallName, instrInfos.codeExtraInformation.optionalAssociatedInstruction);
        else
            call = GenerateCompoundOperatorCall(instrInfos, arguments, instrInfos.codeExtraInformation.functionCallName);
    }
    else
    {
        gd::String argumentsStr;
        for (unsigned int i = 0;i<arguments.size();++i)
        {
            if ( i != 0 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        call = instrInfos.codeExtraInformation.functionCallName+"("+argumentsStr+")";
    }
    return call+";\n";
}

gd::String EventsCodeGenerator::GenerateObjectAction(const gd::String & objectName,
                                                      const gd::ObjectMetadata & objInfo,
                                                      const std::vector<gd::String> & arguments,
                                                      const gd::InstructionMetadata & instrInfos,
                                                      gd::EventsCodeGenerationContext & context)
{
    //Create call
    gd::String call;
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
        gd::String argumentsStr;
        for (unsigned int i = 2;i<arguments.size();++i)
        {
            if ( i != 2 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        call = instrInfos.codeExtraInformation.functionCallName+"("+argumentsStr+")";
        return "For each picked object \""+objectName+"\", call "+call+"("+argumentsStr+").\n";
    }

}

gd::String EventsCodeGenerator::GenerateBehaviorAction(const gd::String & objectName,
                                                                   const gd::String & behaviorName,
                                                                   const gd::BehaviorMetadata & autoInfo,
                                                                   const std::vector<gd::String> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos,
                                                                   gd::EventsCodeGenerationContext & context)
{
    //Create call
    gd::String call;
    if ( (instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string") )
    {
        if ( instrInfos.codeExtraInformation.accessType == gd::InstructionMetadata::ExtraInformation::MutatorAndOrAccessor )
            call = GenerateOperatorCall(instrInfos, arguments, instrInfos.codeExtraInformation.functionCallName, instrInfos.codeExtraInformation.optionalAssociatedInstruction,2);
        else
            call = GenerateCompoundOperatorCall(instrInfos, arguments, instrInfos.codeExtraInformation.functionCallName,2);
        return "For each picked object \""+objectName+"\", call "+call
                +" for behavior \""+behaviorName+"\".\n";
    }
    else
    {
        gd::String argumentsStr;
        for (unsigned int i = 2;i<arguments.size();++i)
        {
            if ( i != 2 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        call = instrInfos.codeExtraInformation.functionCallName+"("+argumentsStr+")";
        return "For each picked object \""+objectName+"\", call "+call+"("+argumentsStr+")"
                +" for behavior \""+behaviorName+"\".\n";
    }

}

gd::String EventsCodeGenerator::GetObjectListName(const gd::String & name, const gd::EventsCodeGenerationContext & context)
{
    return ManObjListName(name);
}

EventsCodeGenerator::EventsCodeGenerator(gd::Project & project_, const gd::Layout & layout, const gd::Platform & platform_) :
    project(project_),
    scene(layout),
    platform(platform_),
    errorOccurred(false),
    compilationForRuntime(false),
    maxCustomConditionsDepth(0),
    maxConditionsListsSize(0)
{
};

}
