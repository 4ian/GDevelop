/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/EventsCodeGenerator.h"
#include "GDL/conditions.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/CommonInstructions.h"
#include "GDL/CommonTools.h"
#include "GDL/ObjectIdentifiersManager.h"
#include "GDL/GDExpressionParser.h"
#include "GDL/EventsCodeGenerationContext.h"

/**
 * Link each condition to its function.
 * Check the validity of objects type passed to parameters
 */
std::string EventsCodeGenerator::GenerateConditionsListCode(const RuntimeScene & scene, vector < Instruction > & conditions, EventsCodeGenerationContext & context)
{
    std::string outputCode;

    for (unsigned int i = 0;i<conditions.size();++i)
        outputCode += "bool condition"+ToString(i)+"IsTrue = false;\n";

    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    for (unsigned int cId =0;cId < conditions.size();++cId)
    {
        outputCode += "{\n";
        std::string conditionCode;

        //Be sure there is no lack of parameter.
        InstructionInfos instrInfos = extensionsManager->GetConditionInfos(conditions[cId].GetType());
        while(conditions[cId].GetParameters().size() < instrInfos.parameters.size())
        {
            vector < GDExpression > parameters = conditions[cId].GetParameters();
            parameters.push_back(GDExpression(""));
            conditions[cId].SetParameters(parameters);
        }

        //Verify that there are not mismatch between object type in parameters
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            if ( instrInfos.parameters[pNb].useObject && instrInfos.parameters[pNb].objectType != "" )
            {
                string objectInParameter = conditions[cId].GetParameter(pNb).GetPlainString();
                if (GetTypeIdOfObject(*scene.game, scene, objectInParameter) !=
                    extensionsManager->GetTypeIdFromString(instrInfos.parameters[pNb].objectType) )
                {
                    cout << "Bad object type in a parameter of a condition " << conditions[cId].GetType() << endl;
                    cout << "Condition wanted " << instrInfos.parameters[pNb].objectType << endl;
                    cout << "Condition wanted " << instrInfos.parameters[pNb].objectType << " of typeId " << extensionsManager->GetTypeIdFromString(instrInfos.parameters[pNb].objectType) << endl;
                    cout << "Condition has received " << objectInParameter << " of typeId " << GetTypeIdOfObject(*scene.game, scene, objectInParameter) << endl;

                    conditions[cId].SetParameter(pNb, GDExpression(""));
                    conditions[cId].SetType("");
                }
            }
        }

        //Generate static condition if available
        if ( extensionsManager->HasCondition(conditions[cId].GetType()))
        {
            std::vector<std::string> arguments = GenerateParametersCodes(*scene.game, scene, conditions[cId].GetParameters(), instrInfos.parameters, context);
            std::string argumentsStr;
            for (unsigned int i = 0;i<arguments.size();++i)
            {
                if ( i != 0 ) argumentsStr += ", ";
                argumentsStr += arguments[i];
            }

            conditionCode += "condition"+ToString(cId)+"IsTrue = "+ instrInfos.cppCallingName+"("+argumentsStr+");\n";
        }

        //Generate object condition if available
        string objectName = conditions[cId].GetParameters().empty() ? "" : conditions[cId].GetParameter(0).GetPlainString();
        unsigned int objectTypeId = GetTypeIdOfObject(*scene.game, scene, objectName);

        if ( !objectName.empty() && extensionsManager->HasObjectCondition(objectTypeId, conditions[cId].GetType()))
        {
            context.currentObject = objectName;
            context.ObjectNeeded(objectName);

            std::vector<std::string> arguments = GenerateParametersCodes(*scene.game, scene, conditions[cId].GetParameters(), instrInfos.parameters, context);
            std::string argumentsStr;
            for (unsigned int i = 1;i<arguments.size();++i)
            {
                if ( i != 1 ) argumentsStr += ", ";
                argumentsStr += arguments[i];
            }

            conditionCode += "for(unsigned int i = 0;i < "+objectName+"objects.size();)\n";
            conditionCode += "{\n";
            conditionCode += "    if ( objects[i]->"+instrInfos.cppCallingName+"("+argumentsStr+") )\n";
            conditionCode += "    {\n";
            conditionCode += "        condition"+ToString(cId)+"IsTrue = true;\n";
            conditionCode += "        ++i;\n";
            conditionCode += "    }\n";
            conditionCode += "    else\n";
            conditionCode += "    {\n";
            conditionCode += "        "+objectName+"objects.erase("+objectName+"objects.begin()+i);";
            conditionCode += "    }\n";

            context.currentObject = "";
        }

        //Affection to an automatism member function if found
        unsigned int automatismTypeId = GetTypeIdOfAutomatism(*scene.game, scene,
                                                              conditions[cId].GetParameters().size() < 2 ? "" : conditions[cId].GetParameter(1).GetPlainString());

        if (extensionsManager->HasAutomatismCondition(automatismTypeId,
                                                   conditions[cId].GetType()))
        {
            context.currentObject = objectName;
            context.ObjectNeeded(objectName);

            std::vector<std::string> arguments = GenerateParametersCodes(*scene.game, scene, conditions[cId].GetParameters(), instrInfos.parameters, context);
            std::string argumentsStr;
            for (unsigned int i = 2;i<arguments.size();++i)
            {
                if ( i != 2 ) argumentsStr += ", ";
                argumentsStr += arguments[i];
            }

            //Verify that object has automatism.
            unsigned int automatismNameId = conditions[cId].GetParameter(1).GetAsObjectIdentifier();
            vector < unsigned int > automatisms = GetAutomatismsOfObject(*scene.game, scene, objectName);
            if ( find(automatisms.begin(), automatisms.end(), automatismNameId) == automatisms.end() )
            {
                cout << "Bad automatism requested" << endl;
                conditions[cId].SetType("");
            }
            else
            {
                conditionCode += "for(unsigned int i = 0;i < "+objectName+"objects.size();)\n";
                conditionCode += "{\n";
                conditionCode += "    if ( objects[i]->GetAutomatism("+ToString(conditions[cId].GetParameter(1).GetAsObjectIdentifier())+")->"+instrInfos.cppCallingName+"("+argumentsStr+") )\n";
                conditionCode += "    {\n";
                conditionCode += "        condition"+ToString(cId)+"IsTrue = true;\n";
                conditionCode += "        ++i;\n";
                conditionCode += "    }\n";
                conditionCode += "    else\n";
                conditionCode += "    {\n";
                conditionCode += "        "+objectName+"objects.erase("+objectName+"objects.begin()+i);";
                conditionCode += "    }\n";
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
 * Generate code for actions list
 */
std::string EventsCodeGenerator::GenerateActionsListCode(const RuntimeScene & scene, vector < Instruction > & actions, EventsCodeGenerationContext & context)
{
    std::string outputCode;

    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    for (unsigned int aId =0;aId < actions.size();++aId)
    {
        outputCode += "{\n";
        std::string actionCode;

        //Be sure there is no lack of parameter.
        InstructionInfos instrInfos = extensionsManager->GetActionInfos(actions[aId].GetType());
        while(actions[aId].GetParameters().size() < instrInfos.parameters.size())
        {
            vector < GDExpression > parameters = actions[aId].GetParameters();
            parameters.push_back(GDExpression(""));
            actions[aId].SetParameters(parameters);
        }

        //Verify that there are not mismatch between object type in parameters
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            if ( instrInfos.parameters[pNb].useObject && instrInfos.parameters[pNb].objectType != "" )
            {
                string objectInParameter = actions[aId].GetParameter(pNb).GetPlainString();
                if (GetTypeIdOfObject(*scene.game, scene, objectInParameter) !=
                    extensionsManager->GetTypeIdFromString(instrInfos.parameters[pNb].objectType) )
                {
                    cout << "Bad object type in parameter "+ToString(pNb)+" of an action " << actions[aId].GetType() << endl;
                    cout << "Action wanted " << instrInfos.parameters[pNb].objectType << " of typeId " << extensionsManager->GetTypeIdFromString(instrInfos.parameters[pNb].objectType) << endl;
                    cout << "Action has received " << objectInParameter << " of typeId " << GetTypeIdOfObject(*scene.game, scene, objectInParameter) << endl;

                    actions[aId].SetParameter(pNb, GDExpression(""));
                    actions[aId].SetType("");
                }
            }
        }

        //Preprocessing parameters
        std::vector<std::string> arguments = GenerateParametersCodes(*scene.game, scene, actions[aId].GetParameters(), instrInfos.parameters, context);

        //Call static function first if available
        if ( extensionsManager->HasAction(actions[aId].GetType()))
        {
            std::vector<std::string> arguments = GenerateParametersCodes(*scene.game, scene, actions[aId].GetParameters(), instrInfos.parameters, context);
            std::string argumentsStr;
            for (unsigned int i = 0;i<arguments.size();++i)
            {
                if ( i != 0 ) argumentsStr += ", ";
                argumentsStr += arguments[i];
            }

            actionCode += instrInfos.cppCallingName+"("+argumentsStr+");\n";
        }

        //ACall object function if available
        string objectName = actions[aId].GetParameters().empty() ? "" : actions[aId].GetParameter(0).GetPlainString();
        unsigned int objectTypeId = GetTypeIdOfObject(*scene.game, scene, objectName);

        if ( extensionsManager->HasObjectAction(objectTypeId,
                                                actions[aId].GetType()))
        {
            context.currentObject = objectName;
            context.ObjectNeeded(objectName);

            std::vector<std::string> arguments = GenerateParametersCodes(*scene.game, scene, actions[aId].GetParameters(), instrInfos.parameters, context);
            std::string argumentsStr;
            for (unsigned int i = 1;i<arguments.size();++i)
            {
                if ( i != 1 ) argumentsStr += ", ";
                argumentsStr += arguments[i];
            }

            actionCode += "for(unsigned int i = 0;i < "+objectName+"objects.size();++i)\n";
            actionCode += "{\n";
            actionCode += "    "+objectName+"objects[i]->"+instrInfos.cppCallingName+"("+argumentsStr+");\n";
            actionCode += "}\n";

            context.currentObject = "";
        }

        //Affection to an automatism member function if found
        unsigned int automatismTypeId = GetTypeIdOfAutomatism(*scene.game, scene,
                                                              actions[aId].GetParameters().size() < 2 ? "" : actions[aId].GetParameter(1).GetPlainString());

        if (extensionsManager->HasAutomatismAction(automatismTypeId,
                                                   actions[aId].GetType()))
        {
            context.currentObject = objectName;
            context.ObjectNeeded(objectName);

            std::vector<std::string> arguments = GenerateParametersCodes(*scene.game, scene, actions[aId].GetParameters(), instrInfos.parameters, context);
            std::string argumentsStr;
            for (unsigned int i = 2;i<arguments.size();++i)
            {
                if ( i != 2 ) argumentsStr += ", ";
                argumentsStr += arguments[i];
            }

            //Verify that object has automatism.
            unsigned int automatismNameId = actions[aId].GetParameter(1).GetAsObjectIdentifier();
            vector < unsigned int > automatisms = GetAutomatismsOfObject(*scene.game, scene, objectName);
            if ( find(automatisms.begin(), automatisms.end(), automatismNameId) == automatisms.end() )
            {
                cout << "Bad automatism requested" << endl;
                actions[aId].SetType("");
            }
            else
            {
                actionCode += "for(unsigned int i = 0;i < "+objectName+"objects.size();++i)\n";
                actionCode += "{\n";
                //TODO : Using GetAsObjIdentifier is not appropriate here.
                actionCode += "    "+objectName+"objects[i]->GetAutomatism("+ToString(actions[aId].GetParameter(1).GetAsObjectIdentifier())+")->"+instrInfos.cppCallingName+"("+argumentsStr+");\n";
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

class CallbacksForGeneratingExpressionCode : public ParserCallbacks
{
    public:

    CallbacksForGeneratingExpressionCode(std::string & plainExpression_, const Game & game_, const Scene & scene_, EventsCodeGenerationContext & context_) :
    plainExpression(plainExpression_),
    game(game_),
    scene(scene_),
    context(context_)
    {};
    virtual ~CallbacksForGeneratingExpressionCode() {};

    virtual void OnConstantToken(std::string text)
    {
        plainExpression += text;
    };

    virtual void OnStaticFunction(std::string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo)
    {
        std::vector<std::string> parameters = EventsCodeGenerator::GenerateParametersCodes(game, scene, instruction.parameters, expressionInfo.parameters, context );

        std::string parametersStr;
        for (unsigned int i = 0;i<parameters.size();++i)
        {
            if ( i != 0 ) parametersStr += ", ";
            parametersStr += parameters[i];
        }

        plainExpression += expressionInfo.cppCallingName+"("+parametersStr+")";
    };

    virtual void OnStaticFunction(std::string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo)
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
        std::vector<std::string> parameters = EventsCodeGenerator::GenerateParametersCodes(game, scene, instruction.parameters, expressionInfo.parameters, context);
        std::string parametersStr;
        for (unsigned int i = 0;i<parameters.size();++i)
        {
            if ( i != 0 ) parametersStr += ", ";
            parametersStr += parameters[i];
        }

        plainExpression += expressionInfo.cppCallingName+"("+parametersStr+")";
    };

    virtual void OnObjectFunction(std::string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo)
    {
        if ( instruction.parameters.empty() ) return;

        //Prepare parameters
        std::vector<std::string> parameters = EventsCodeGenerator::GenerateParametersCodes(game, scene, instruction.parameters, expressionInfo.parameters, context);
        std::string parametersStr;
        for (unsigned int i = 1;i<parameters.size();++i)
        {
            if ( i != 1 ) parametersStr += ", ";
            parametersStr += parameters[i];
        }

        context.ObjectNeeded(instruction.parameters[0].GetPlainString());

        //Access to the object
        std::string objectStr;
        if ( context.currentObject == instruction.parameters[0].GetPlainString() )
            objectStr = ""+instruction.parameters[0].GetPlainString()+"objects[i]";
        else
            objectStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? 0 :"+ instruction.parameters[0].GetPlainString()+"objects[0]";

        plainExpression += objectStr+"->"+expressionInfo.cppCallingName+"("+parametersStr+")";
    };

    virtual void OnObjectFunction(std::string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo)
    {
        if ( instruction.parameters.empty() ) return;

        //Prepare parameters
        std::vector<std::string> parameters = EventsCodeGenerator::GenerateParametersCodes(game, scene, instruction.parameters, expressionInfo.parameters, context);
        std::string parametersStr;
        for (unsigned int i = 1;i<parameters.size();++i)
        {
            if ( i != 1 ) parametersStr += ", ";
            parametersStr += parameters[i];
        }

        context.ObjectNeeded(instruction.parameters[0].GetPlainString());

        //Access to the object
        std::string objectStr;
        if ( context.currentObject == instruction.parameters[0].GetPlainString() )
            objectStr = ""+instruction.parameters[0].GetPlainString()+"objects[i]";
        else
            objectStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? \"\" :"+ instruction.parameters[0].GetPlainString()+"objects[0]";

        plainExpression += objectStr+"->"+expressionInfo.cppCallingName+"("+parametersStr+")";
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo)
    {
        if ( instruction.parameters.size() < 2 ) return;

        //Prepare parameters
        std::vector<std::string> parameters = EventsCodeGenerator::GenerateParametersCodes(game, scene, instruction.parameters, expressionInfo.parameters, context);
        std::string parametersStr;
        for (unsigned int i = 2;i<parameters.size();++i)
        {
            if ( i != 2 ) parametersStr += ", ";
            parametersStr += parameters[i];
        }

        context.ObjectNeeded(instruction.parameters[0].GetPlainString());

        //Access to the object
        std::string objectStr;
        if ( context.currentObject == instruction.parameters[0].GetPlainString() )
            objectStr = ""+instruction.parameters[0].GetPlainString()+"objects[i]";
        else
            objectStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? 0 :"+ instruction.parameters[0].GetPlainString()+"objects[0]";


        plainExpression += objectStr+"->"+instruction.parameters[1].GetPlainString()+"::"+expressionInfo.cppCallingName+"("+parametersStr+")";
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo)
    {
        if ( instruction.parameters.size() < 2 ) return;

        //Prepare parameters
        std::vector<std::string> parameters = EventsCodeGenerator::GenerateParametersCodes(game, scene, instruction.parameters, expressionInfo.parameters, context);
        std::string parametersStr;
        for (unsigned int i = 2;i<parameters.size();++i)
        {
            if ( i != 2 ) parametersStr += ", ";
            parametersStr += parameters[i];
        }

        context.ObjectNeeded(instruction.parameters[0].GetPlainString());

        //Access to the object
        std::string objectStr;
        if ( context.currentObject == instruction.parameters[0].GetPlainString() )
            objectStr = ""+instruction.parameters[0].GetPlainString()+"objects[i]";
        else
            objectStr = "( "+instruction.parameters[0].GetPlainString()+"objects.empty() ) ? \"\" :"+ instruction.parameters[0].GetPlainString()+"objects[0]";

        plainExpression += objectStr+"->"+instruction.parameters[1].GetPlainString()+"::"+expressionInfo.cppCallingName+"("+parametersStr+")";
    };

    virtual bool OnSubMathExpression(const Game & game, const Scene & scene, GDExpression & expression)
    {
        std::string newExpression;

        CallbacksForGeneratingExpressionCode callbacks(newExpression, game, scene, context);

        GDExpressionParser parser(expression.GetPlainString());
        if ( !parser.ParseMathExpression(game, scene, callbacks) )
            return false;

        expression = GDExpression(newExpression);
        return true;
    }

    virtual bool OnSubTextExpression(const Game & game, const Scene & scene, GDExpression & expression)
    {
        std::string newExpression;

        CallbacksForGeneratingExpressionCode callbacks(newExpression, game, scene, context);

        GDExpressionParser parser(expression.GetPlainString());
        if ( !parser.ParseTextExpression(game, scene, callbacks) )
            return false;

        expression = GDExpression(newExpression);
        return true;
    }


    private :
        std::string & plainExpression;
        const Game & game;
        const Scene & scene;
        EventsCodeGenerationContext & context;
};


std::vector<std::string> EventsCodeGenerator::GenerateParametersCodes(const Game & game, const Scene & scene, const vector < GDExpression > & parameters, const std::vector < ParameterInfo > & parametersInfo, EventsCodeGenerationContext & context)
{
    std::vector<std::string> arguments;

    //TODO : Handle bad parameters size ?
    for (unsigned int pNb = 0;pNb < parametersInfo.size() && parameters.size();++pNb)
    {
        std::string argOutput;

        if ( parametersInfo[pNb].type == "expression" )
        {
            CallbacksForGeneratingExpressionCode callbacks(argOutput, game, scene, context);

            GDExpressionParser parser(parameters[pNb].GetPlainString());
            parser.ParseMathExpression(game, scene, callbacks);
        }
        else if ( parametersInfo[pNb].type == "text" )
        {
            CallbacksForGeneratingExpressionCode callbacks(argOutput, game, scene, context);

            GDExpressionParser parser(parameters[pNb].GetPlainString());
            parser.ParseTextExpression(game, scene, callbacks);
        }
        else
        {
            cout << "Warning: Unknown type of parameter" << parametersInfo[pNb].type;
            argOutput += "\""+parameters[pNb].GetPlainString()+"\"";
        }

        arguments.push_back(argOutput);
    }

    return arguments;
}
/**
 * Generate events list code.
 */
std::string EventsCodeGenerator::GenerateEventsListCode(const RuntimeScene & scene, vector < BaseEventSPtr > & events, EventsCodeGenerationContext /*&*/ context)
{
    std::string output;

    for ( unsigned int eId = 0; eId < events.size();++eId )
    {
        std::string eventCoreCode = events[eId]->GenerateEventCode(scene, context);
        std::string declarationsCode;
        for ( std::set<std::string>::iterator it = context.objectsToBeDeclared.begin() ; it != context.objectsToBeDeclared.end(); ++it )
        {
            if ( context.objectsAlreadyDeclared.find(*it) == context.objectsAlreadyDeclared.end() )
            {
                //TODO : Object identifier is not appropriate here.
                declarationsCode += "std::vector<Object*> "+*it+"objects = runtimeScene->objectsInstances.GetObjectsRawPointers("+ToString(ObjectIdentifiersManager::GetInstance()->GetOIDfromName(*it))+");\n";
                context.objectsAlreadyDeclared.insert(*it);
            }
        }
        context.objectsToBeDeclared.clear();

        output += "\n{\n" + declarationsCode + "\n" + eventCoreCode + "\n}\n";
    }

    return output;
}

std::string EventsCodeGenerator::GenerateEventsCompleteCode(const RuntimeScene & scene, std::vector < BaseEventSPtr > & events)
{
    std::string output;

    output +=
    "#include <iostream>\n"
    "#include <vector>\n"
    "#include \"GDL/RuntimeScene.h\"\n"
    "#include \"GDL/cVariables.h\"\n"

    "extern void * pointerToRuntimeScene;\n\n"

    "int main()\n"
    "{\n"
	"RuntimeScene * runtimeScene = static_cast< RuntimeScene *> (pointerToRuntimeScene);\n";

    EventsCodeGenerationContext context;
    output += EventsCodeGenerator::GenerateEventsListCode(scene, events, context);

    output +=
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
