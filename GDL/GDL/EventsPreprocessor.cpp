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
void EventsPreprocessor::PreprocessConditions(const RuntimeScene & scene, vector < Instruction > & conditions, bool & eventHasToBeDeleted)
{/*
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    for (unsigned int cId =0;cId < conditions.size();++cId)
    {
        //Affection en premier à une fonction statique si possible
        if ( extensionsManager->HasCondition(conditions[cId].GetType()))
            conditions[cId].function = extensionsManager->GetConditionFunctionPtr(conditions[cId].GetType());

        //Affection à une fonction membre d'un objet si trouvé
        string objectName = conditions[cId].GetParameters().empty() ? "" : conditions[cId].GetParameter(0).GetPlainString();
        unsigned int objectTypeId = GetTypeIdOfObject(*scene.game, scene, objectName);

        if ( extensionsManager->HasObjectCondition(objectTypeId,
                                                conditions[cId].GetType()))
        {
            conditions[cId].function = &ConditionForEachObject;
            conditions[cId].objectFunction = extensionsManager->GetObjectConditionFunctionPtr(objectTypeId,
                                                                                                    conditions[cId].GetType());
        }

        //Affection to an automatism member function if found
        unsigned int automatismTypeId = GetTypeIdOfAutomatism(*scene.game, scene,
                                                              conditions[cId].GetParameters().size() < 2 ? "" : conditions[cId].GetParameter(1).GetPlainString());

        if (extensionsManager->HasAutomatismCondition(automatismTypeId,
                                                   conditions[cId].GetType()))
        {
            conditions[cId].function = &AutomatismConditionForEachObject;
            conditions[cId].automatismFunction = extensionsManager->GetAutomatismConditionFunctionPtr(automatismTypeId,
                                                                                                    conditions[cId].GetType());

            //Verify that object has automatism.
            unsigned int automatismNameId = conditions[cId].GetParameter(1).GetAsObjectIdentifier();
            vector < unsigned int > automatisms = GetAutomatismsOfObject(*scene.game, scene, objectName);
            if ( find(automatisms.begin(), automatisms.end(), automatismNameId) == automatisms.end() )
            {
                cout << "Bad automatism requested" << endl;
                conditions[cId].SetType("");
            }
        }

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


        //Preprocessing expressions
        for( unsigned int instrId=0;instrId<conditions[cId].GetParameters().size();++instrId)
            conditions[cId].GetParameter(instrId).PrepareForEvaluation(*scene.game, scene);

        if (conditions[cId].GetType() == "")
            eventHasToBeDeleted = true;

        //Preprocess subconditions
        if ( !conditions[cId].GetSubInstructions().empty() )
            PreprocessConditions(scene, conditions[cId].GetSubInstructions(), eventHasToBeDeleted);
    }*/
}

/**
 * Link each action to its function.
 * Check the validity of objects type passed to parameters
 */
void EventsPreprocessor::PreprocessActions(const RuntimeScene & scene, vector < Instruction > & actions)
{/*
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    for (unsigned int aId =0;aId < actions.size();++aId)
    {
        //Affection en premier à une fonction statique si possible
        if ( extensionsManager->HasAction(actions[aId].GetType()))
            actions[aId].function = extensionsManager->GetActionFunctionPtr(actions[aId].GetType());

        //Affection à une fonction membre d'un objet si trouvé
        string objectName = actions[aId].GetParameters().empty() ? "" : actions[aId].GetParameter(0).GetPlainString();
        unsigned int objectTypeId = GetTypeIdOfObject(*scene.game, scene, objectName);

        if ( extensionsManager->HasObjectAction(objectTypeId,
                                                actions[aId].GetType()))
        {
            actions[aId].function = &ActionForEachObject;
            actions[aId].objectFunction = extensionsManager->GetObjectActionFunctionPtr(objectTypeId,
                                                                                                    actions[aId].GetType());
        }

        //Affection to an automatism member function if found
        unsigned int automatismTypeId = GetTypeIdOfAutomatism(*scene.game, scene,
                                                              actions[aId].GetParameters().size() < 2 ? "" : actions[aId].GetParameter(1).GetPlainString());

        if (extensionsManager->HasAutomatismAction(automatismTypeId,
                                                   actions[aId].GetType()))
        {
            actions[aId].function = &AutomatismActionForEachObject;
            actions[aId].automatismFunction = extensionsManager->GetAutomatismActionFunctionPtr(automatismTypeId,
                                                                                                    actions[aId].GetType());

            //Verify that object has automatism.
            unsigned int automatismNameId = actions[aId].GetParameter(1).GetAsObjectIdentifier();
            vector < unsigned int > automatisms = GetAutomatismsOfObject(*scene.game, scene, objectName);
            if ( find(automatisms.begin(), automatisms.end(), automatismNameId) == automatisms.end() )
            {
                cout << "Bad automatism requested" << endl;
                actions[aId].SetType("");
            }
        }

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

        //Preprocessing expressions
        for( unsigned int instrId=0;instrId<actions[aId].GetParameters().size();++instrId)
            actions[aId].GetParameter(instrId).PrepareForEvaluation(*scene.game, scene);

        //Preprocess subactions
        if ( !actions[aId].GetSubInstructions().empty() )
            PreprocessActions(scene, actions[aId].GetSubInstructions());

        //Note that if an action is invalid, the entire event is _not_ invalid
    }*/
}

/**
 * Link each actions/conditions to its function.
 * Check the validity of objects type passed to parameters
 */
void EventsPreprocessor::PreprocessEvents(const RuntimeScene & scene, vector < BaseEventSPtr > & events)
{/*
    for ( unsigned int eId = 0; eId < events.size();++eId )
    {
        bool eventInvalid = false;

        //Preprocess actions and conditions
        vector < vector<Instruction>* > allConditionsVectors = events[eId]->GetAllConditionsVectors();
        for (unsigned int i = 0;i<allConditionsVectors.size();++i)
            PreprocessConditions(scene, *allConditionsVectors[i], eventInvalid);

        vector < vector<Instruction>* > allActionsVectors = events[eId]->GetAllActionsVectors();
        for (unsigned int i = 0;i<allActionsVectors.size();++i)
            PreprocessActions(scene, *allActionsVectors[i]);

        //Preprocess internal expressions used by the event
        vector < GDExpression* > allExpressions = events[eId]->GetAllExpressions();
        for (unsigned int i = 0;i<allExpressions.size();++i)
            allExpressions[i]->PrepareForEvaluation(*scene.game, scene);

        //Preprocess Sub events
        if ( events[eId]->CanHaveSubEvents() )
            PreprocessEvents(scene, events[eId]->GetSubEvents());

        if ( eventInvalid ) //If the event is invalid, we need to delete it.
        {
            events.erase(events.begin()+eId);
            eId--;
        }
    }*/
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
