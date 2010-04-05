
#include "GDL/OpenSaveGame.h"
#include "ForEachEvent.h"
#include "Access.h"
#include "ObjectsConcerned.h"
#include "RuntimeScene.h"
#include "tinyxml.h"

/**
 * Check the conditions, and launch actions and subevents if necessary
 */
void ForEachEvent::Execute( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval )
{
    eval.SetObjectsConcerned(&objectsConcerned);
    ObjList list = objectsConcerned.PickAndRemove(objectsToPick.GetAsObjectIdentifier(), false);

    ObjList::iterator obj = list.begin();
    ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        ObjectsConcerned objectsConcernedForEvent;
        objectsConcernedForEvent.InheritsFrom(&objectsConcerned);
        objectsConcernedForEvent.objectsPicked.AddObject(*obj);

        if ( ExecuteConditions( scene, objectsConcernedForEvent, eval ) == true )
        {
            ExecuteActions( scene, objectsConcernedForEvent, eval );

            for (unsigned int i = 0;i<events.size();++i)
            {
                ObjectsConcerned objectsConcernedForSubEvent;
                objectsConcernedForSubEvent.InheritsFrom(&objectsConcernedForEvent);

                events[i]->Execute(scene, objectsConcernedForSubEvent, eval);
            }
        }
    }
}

/**
 * Check if all conditions are true
 */
bool ForEachEvent::ExecuteConditions( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval )
{
    for ( unsigned int k = 0; k < conditions.size(); ++k )
    {
        eval.SetObjectsConcerned(&objectsConcerned);
        if ( conditions[k].function != NULL &&
             !conditions[k].function( scene, objectsConcerned, conditions[k], eval ) )
            return false; //Return false as soon as a condition is false
    }

    return true;
}

/**
 * Run actions of the event
 */
void ForEachEvent::ExecuteActions( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval )
{
    for ( unsigned int k = 0; k < actions.size();k++ )
    {
        eval.SetObjectsConcerned(&objectsConcerned);
        if ( actions[k].function != NULL )
            actions[k].function( scene, objectsConcerned, actions[k], eval );
    }

    return;
}

vector < vector<Instruction>* > ForEachEvent::GetAllConditionsVectors()
{
    vector < vector<Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < vector<Instruction>* > ForEachEvent::GetAllActionsVectors()
{
    vector < vector<Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

vector < GDExpression* > ForEachEvent::GetAllExpressions()
{
    vector < GDExpression* > allExpressions;
    allExpressions.push_back(&objectsToPick);

    return allExpressions;
}

void ForEachEvent::SaveToXml(TiXmlElement * eventElem) const
{
    TiXmlElement * objectElem = new TiXmlElement( "Object" );
    eventElem->LinkEndChild( objectElem );
    objectElem->SetAttribute("value", objectsToPick.GetPlainString().c_str());

    //Les conditions
    TiXmlElement * conditionsElem = new TiXmlElement( "Conditions" );
    eventElem->LinkEndChild( conditionsElem );
    OpenSaveGame::SaveConditions(conditions, conditionsElem);

    //Les actions
    TiXmlElement * actionsElem = new TiXmlElement( "Actions" );
    eventElem->LinkEndChild( actionsElem );
    OpenSaveGame::SaveActions(actions, actionsElem);

    //Sous évènements
    if ( !GetSubEvents().empty() )
    {
        TiXmlElement * subeventsElem;
        subeventsElem = new TiXmlElement( "Events" );
        eventElem->LinkEndChild( subeventsElem );

        OpenSaveGame::SaveEvents(events, subeventsElem);
    }
}

void ForEachEvent::LoadFromXml(const TiXmlElement * eventElem)
{
    if ( eventElem->FirstChildElement( "Object" ) != NULL )
        objectsToPick = GDExpression(eventElem->FirstChildElement("Object")->Attribute("value"));

    //Conditions
    if ( eventElem->FirstChildElement( "Conditions" ) != NULL )
        OpenSaveGame::OpenConditions(conditions, eventElem->FirstChildElement( "Conditions" ));
    else
        cout << "Aucune informations sur les conditions d'un évènement";

    //Actions
    if ( eventElem->FirstChildElement( "Actions" ) != NULL )
        OpenSaveGame::OpenActions(actions, eventElem->FirstChildElement( "Actions" ));
    else
        cout << "Aucune informations sur les actions d'un évènement";

    //Subevents
    if ( eventElem->FirstChildElement( "Events" ) != NULL )
        OpenSaveGame::OpenEvents(events, eventElem->FirstChildElement( "Events" ));
}

/**
 * Initialize from another ForEachEvent.
 * Used by copy ctor and assignement operator
 */
void ForEachEvent::Init(const ForEachEvent & event)
{
    events.clear();
    for (unsigned int i =0;i<event.events.size();++i)
    	events.push_back( event.events[i]->Clone() );

    conditions = event.conditions;
    actions = event.actions;
    objectsToPick = event.objectsToPick;
}

/**
 * Custom copy operator
 */
ForEachEvent::ForEachEvent(const ForEachEvent & event) :
BaseEvent(event),
objectsToPick("")
{
    Init(event);
}

/**
 * Custom assignement operator
 */
ForEachEvent& ForEachEvent::operator=(const ForEachEvent & event)
{
    if ( this != &event )
    {
        BaseEvent::operator=(event);
        Init(event);
    }

    return *this;
}
