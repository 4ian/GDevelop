/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/EventsPreprocessor.h"
#include "GDL/conditions.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/CommonInstructions.h"
#include "GDL/CommonTools.h"
#include "GDL/ObjectIdentifiersManager.h"

/**
 * Link each condition to its function.
 * Check the validity of objects type passed to parameters
 */
std::string EventsPreprocessor::GenerateConditionsListCode(const RuntimeScene & scene, vector < Instruction > & conditions)
{
    std::string outputCode;

    for (unsigned int i = 0;i<conditions.size();++i)
        outputCode += "bool condition"+ToString(i)+"IsTrue = false;\n";

    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    for (unsigned int cId =0;cId < conditions.size();++cId)
    {
        outputCode += "{\n";
        std::string conditionCode;

        //Generate static condition if available
        if ( extensionsManager->HasCondition(conditions[cId].GetType()))
            conditionCode += conditions[cId].GetType()+";\n";

        //Generate object condition if available
        string objectName = conditions[cId].GetParameters().empty() ? "" : conditions[cId].GetParameter(0).GetPlainString();
        unsigned int objectTypeId = GetTypeIdOfObject(*scene.game, scene, objectName);

        if ( !objectName.empty() && extensionsManager->HasObjectCondition(objectTypeId, conditions[cId].GetType()))
        {
            conditionCode += "std::vector<Object*> "+objectName+"objects = runtimeScene->objectsInstances.GetAllObjectsRawPointers();\n";
            conditionCode += "for(unsigned int i = 0;i < "+objectName+"objects.size();)\n";
            conditionCode += "{\n";
            conditionCode += "    if ( objects[i] ?? )\n";
            conditionCode += "    {\n";
            conditionCode += "        condition"+ToString(cId)+"IsTrue = true;\n";
            conditionCode += "        ++i;\n";
            conditionCode += "    }\n";
            conditionCode += "    else\n";
            conditionCode += "    {\n";
            conditionCode += "        "+objectName+"objects.erase("+objectName+"objects.begin()+i);";
            conditionCode += "    }\n";
        }

        //Affection to an automatism member function if found
        unsigned int automatismTypeId = GetTypeIdOfAutomatism(*scene.game, scene,
                                                              conditions[cId].GetParameters().size() < 2 ? "" : conditions[cId].GetParameter(1).GetPlainString());

        if (extensionsManager->HasAutomatismCondition(automatismTypeId,
                                                   conditions[cId].GetType()))
        {
            /*conditions[cId].function = &AutomatismConditionForEachObject;
            conditions[cId].automatismFunction = extensionsManager->GetAutomatismConditionFunctionPtr(automatismTypeId,
                                                                                                    conditions[cId].GetType());

            //Verify that object has automatism.
            unsigned int automatismNameId = conditions[cId].GetParameter(1).GetAsObjectIdentifier();
            vector < unsigned int > automatisms = GetAutomatismsOfObject(*scene.game, scene, objectName);
            if ( find(automatisms.begin(), automatisms.end(), automatismNameId) == automatisms.end() )
            {
                cout << "Bad automatism requested" << endl;
                conditions[cId].SetType("");
            }*/
        }

        InstructionInfos instrInfos = extensionsManager->GetConditionInfos(conditions[cId].GetType());

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


        if ( !conditions[cId].GetType().empty() ) outputCode += conditionCode;

        //Preprocess subconditions
        /*if ( !conditions[cId].GetSubInstructions().empty() )
            PreprocessConditions(scene, conditions[cId].GetSubInstructions(), eventHasToBeDeleted);*/

        outputCode += "}\n";
    }

    return outputCode;
}

/**
 * Link each action to its function.
 * Check the validity of objects type passed to parameters
 */
std::string EventsPreprocessor::GenerateActionsListCode(const RuntimeScene & scene, vector < Instruction > & actions)
{
    std::string outputCode;

    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    for (unsigned int aId =0;aId < actions.size();++aId)
    {
        outputCode += "{\n";
        std::string actionCode;

        //Affection en premier à une fonction statique si possible
        if ( extensionsManager->HasAction(actions[aId].GetType()))
            actionCode += actions[aId].GetType()+";\n";

        //Affection à une fonction membre d'un objet si trouvé
        string objectName = actions[aId].GetParameters().empty() ? "" : actions[aId].GetParameter(0).GetPlainString();
        unsigned int objectTypeId = GetTypeIdOfObject(*scene.game, scene, objectName);

        if ( extensionsManager->HasObjectAction(objectTypeId,
                                                actions[aId].GetType()))
        {
            actionCode += "for(unsigned int i = 0;i < "+objectName+"objects.size();)\n";
            actionCode += "{\n";
            actionCode += "    objects[i]."+actions[aId].GetType()+";\n";
            actionCode += "}\n";
        }

        //Affection to an automatism member function if found
        unsigned int automatismTypeId = GetTypeIdOfAutomatism(*scene.game, scene,
                                                              actions[aId].GetParameters().size() < 2 ? "" : actions[aId].GetParameter(1).GetPlainString());

        if (extensionsManager->HasAutomatismAction(automatismTypeId,
                                                   actions[aId].GetType()))
        {
            /*actions[aId].function = &AutomatismActionForEachObject;
            actions[aId].automatismFunction = extensionsManager->GetAutomatismActionFunctionPtr(automatismTypeId,
                                                                                                    actions[aId].GetType());

            //Verify that object has automatism.
            unsigned int automatismNameId = actions[aId].GetParameter(1).GetAsObjectIdentifier();
            vector < unsigned int > automatisms = GetAutomatismsOfObject(*scene.game, scene, objectName);
            if ( find(automatisms.begin(), automatisms.end(), automatismNameId) == automatisms.end() )
            {
                cout << "Bad automatism requested" << endl;
                actions[aId].SetType("");
            }*/
        }

        InstructionInfos instrInfos = extensionsManager->GetActionInfos(actions[aId].GetType());

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

        //Preprocessing expressions
        /*for( unsigned int instrId=0;instrId<actions[aId].GetParameters().size();++instrId)
            actions[aId].GetParameter(instrId).PrepareForEvaluation(*scene.game, scene);*/


        //Preprocess subactions
        /*if ( !actions[aId].GetSubInstructions().empty() )
            PreprocessActions(scene, actions[aId].GetSubInstructions());*/

        if ( !actions[aId].GetType().empty() ) outputCode += actionCode;

        outputCode += "}\n";
    }

    return outputCode;
}

/**
 * Link each actions/conditions to its function.
 * Check the validity of objects type passed to parameters
 */
void EventsPreprocessor::GenerateEventsCode(const RuntimeScene & scene, vector < BaseEventSPtr > & events, std::string & output)
{
    for ( unsigned int eId = 0; eId < events.size();++eId )
    {
        std::string eventCode = "\n{\n";
        bool eventInvalid = false;

        eventCode += events[eId]->GenerateEventCode(scene);

        //Preprocess Sub events
        if ( events[eId]->CanHaveSubEvents() )
            GenerateEventsCode(scene, events[eId]->GetSubEvents(), output);

        eventCode += "\n}\n";
        output += eventCode;
    }
}

/**
 * Remove events not executed
 */
void EventsPreprocessor::DeleteUselessEvents(vector < BaseEventSPtr > & events)
{
    for ( unsigned int eId = events.size()-1; eId < events.size();--eId )
    {
        if ( events[eId]->CanHaveSubEvents() ) //Process sub events, if any
            DeleteUselessEvents(events[eId]->GetSubEvents());

        if ( !events[eId]->IsExecutable() || events[eId]->IsDisabled() ) //Delete events that are not executable
            events.erase(events.begin() + eId);
    }
}
