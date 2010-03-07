#include "GDL/EventsPreprocessor.h"
#include "GDL/conditions.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"

EventsPreprocessor::EventsPreprocessor()
{
    //ctor
}

EventsPreprocessor::~EventsPreprocessor()
{
    //dtor
}

/**
 * Common instruction for executing instruction on each object "Foo".
 */
bool ActionForEachObject( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    ObjList list = objectsConcerned.Pick(action.GetParameter( 0 ).GetAsObjectIdentifier(), action.IsGlobal());

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
        ((*obj).get()->*action.objectFunction)(scene, objectsConcerned, action, eval);

    return true;
}

/**
 * Common instruction for testing instruction on each object "Foo".
 */
bool ConditionForEachObject( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //Need to copy the old objectsConcerned object to evaluate properly the arguments
    ObjectsConcerned originalObjectsConcerned = objectsConcerned;
    eval.SetObjectsConcerned(&originalObjectsConcerned);

    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetAsObjectIdentifier(), condition.IsGlobal());
    bool isTrue = false;

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        if ( ((*obj).get()->*condition.objectFunction)(scene, objectsConcerned, condition, eval) ^ condition.IsInverted())
        {
            isTrue = true;
            objectsConcerned.objectsPicked.AddObject( *obj );
        }
    }

    return isTrue;
}

/**
 * Link each actions/conditions to its function.
 * Check the validity of objects type passed to parameters
 */
void EventsPreprocessor::PreprocessEvents(const RuntimeScene & scene, vector < Event > & events)
{
    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();

    for ( unsigned int eId = 0; eId < events.size();++eId )
    {
        bool eventInvalid = false;

        for (unsigned int cId =0;cId < events[eId].conditions.size();++cId)
        {
            //Affection en premier à une fonction statique si possible
            if ( extensionsManager->HasCondition(events[eId].conditions[cId].GetType()))
                events[eId].conditions[cId].function = extensionsManager->GetConditionFunctionPtr(events[eId].conditions[cId].GetType());

            //Affection à une fonction membre d'un objet si trouvé
            string objectName = events[eId].conditions[cId].GetParameter(0).GetPlainString();
            unsigned int objectTypeId = GetTypeIdOfObject(*scene.game, scene, objectName);

            if ( extensionsManager->HasObjectCondition(objectTypeId,
                                                    events[eId].conditions[cId].GetType()))
            {
                events[eId].conditions[cId].function = &ConditionForEachObject;
                events[eId].conditions[cId].objectFunction = extensionsManager->GetObjectConditionFunctionPtr(objectTypeId,
                                                                                                        events[eId].conditions[cId].GetType());
            }

            //Verify that there are not mismatch between object type in parameters
            InstructionInfos instrInfos = extensionsManager->GetConditionInfos(events[eId].conditions[cId].GetType());
            for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
            {
            	if ( instrInfos.parameters[pNb].useObject && instrInfos.parameters[pNb].objectType != "" )
            	{
                    string objectInParameter = events[eId].conditions[cId].GetParameter(pNb).GetPlainString();
                    if (GetTypeIdOfObject(*scene.game, scene, objectInParameter) !=
                        extensionsManager->GetTypeIdFromString(instrInfos.parameters[pNb].objectType) )
                    {
                        cout << "Bad object type in a parameter of a condition " << events[eId].conditions[cId].GetType() << endl;
                        cout << "Condition wanted " << instrInfos.parameters[pNb].objectType << endl;
                        cout << "Condition wanted " << instrInfos.parameters[pNb].objectType << " of typeId " << extensionsManager->GetTypeIdFromString(instrInfos.parameters[pNb].objectType) << endl;
                        cout << "Condition has received " << objectInParameter << " of typeId " << GetTypeIdOfObject(*scene.game, scene, objectInParameter) << endl;

                        events[eId].conditions[cId].SetParameter(pNb, GDExpression(""));
                        events[eId].conditions[cId].SetType("");
                    }
            	}
            }

            //Preprocessing expressions
            for( unsigned int instrId=0;instrId<events[eId].conditions[cId].GetParameters().size();++instrId)
                Evaluateur::PreprocessExpression(events[eId].conditions[cId].GetParameter(instrId), scene);

            if (events[eId].conditions[cId].GetType() == "")
                eventInvalid = true;
        }
        for (unsigned int aId =0;aId < events[eId].actions.size();++aId)
        {
            //Affection en premier à une fonction statique si possible
            if ( extensionsManager->HasAction(events[eId].actions[aId].GetType()))
                events[eId].actions[aId].function = extensionsManager->GetActionFunctionPtr(events[eId].actions[aId].GetType());

            //Affection à une fonction membre d'un objet si trouvé
            string objectName = events[eId].actions[aId].GetParameter(0).GetPlainString();
            unsigned int objectTypeId = GetTypeIdOfObject(*scene.game, scene, objectName);

            if ( extensionsManager->HasObjectAction(objectTypeId,
                                                    events[eId].actions[aId].GetType()))
            {
                events[eId].actions[aId].function = &ActionForEachObject;
                events[eId].actions[aId].objectFunction = extensionsManager->GetObjectActionFunctionPtr(objectTypeId,
                                                                                                        events[eId].actions[aId].GetType());
            }

            //Verify that there are not mismatch between object type in parameters
            InstructionInfos instrInfos = extensionsManager->GetActionInfos(events[eId].actions[aId].GetType());
            for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
            {
            	if ( instrInfos.parameters[pNb].useObject && instrInfos.parameters[pNb].objectType != "" )
            	{
                    string objectInParameter = events[eId].actions[aId].GetParameter(pNb).GetPlainString();
                    if (GetTypeIdOfObject(*scene.game, scene, objectInParameter) !=
                        extensionsManager->GetTypeIdFromString(instrInfos.parameters[pNb].objectType) )
                    {
                        cout << "Bad object type in a parameter of an action " << events[eId].actions[aId].GetType() << endl;
                        cout << "Action wanted " << instrInfos.parameters[pNb].objectType << " of typeId " << extensionsManager->GetTypeIdFromString(instrInfos.parameters[pNb].objectType) << endl;
                        cout << "Action has received " << objectInParameter << " of typeId " << GetTypeIdOfObject(*scene.game, scene, objectInParameter) << endl;

                        events[eId].actions[aId].SetParameter(pNb, GDExpression(""));
                        events[eId].actions[aId].SetType("");
                    }
            	}
            }

            //Preprocessing expressions
            for( unsigned int instrId=0;instrId<events[eId].actions[aId].GetParameters().size();++instrId)
                Evaluateur::PreprocessExpression(events[eId].actions[aId].GetParameter(instrId), scene);

            //Note that if an action is invalid, the entire event is _not_ invalid
        }

        //Sous évènements
        if ( !events[eId].events.empty() )
            PreprocessEvents(scene, events[eId].events);

        if ( eventInvalid ) //If the event is invalid, we need to delete it.
        {
            events.erase(events.begin()+eId);
            eId--;
        }
    }
}

void EventsPreprocessor::DeleteUselessEvents(vector < Event > & events)
{
    for ( unsigned int eId = events.size()-1; eId < events.size();--eId )
    {
        if ( events[eId].type == "Commentaire" ) //Suppression des commentaires
            events.erase(events.begin() + eId);
        else if ( !events[eId].events.empty() ) //Sous évènements
            DeleteUselessEvents(events[eId].events);
    }
}
