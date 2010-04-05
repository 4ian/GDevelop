#include "WhileEvent.h"
#include "tinyxml.h"
#include "RuntimeScene.h"
#include "ObjectsConcerned.h"
#include "Access.h"
#include "GDL/OpenSaveGame.h"

/**
 * Check the conditions, and launch actions and subevents if necessary
 */
void WhileEvent::Execute( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval )
{
    while (ExecuteWhileConditions( scene, objectsConcerned, eval))
    {
        ObjectsConcerned objectsConcernedForEvent;
        objectsConcernedForEvent.InheritsFrom(&objectsConcerned);

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
bool WhileEvent::ExecuteConditions( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval )
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
 * Check if "while conditions" are true
 */
bool WhileEvent::ExecuteWhileConditions( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval )
{
    for ( unsigned int k = 0; k < whileConditions.size(); ++k )
    {
        eval.SetObjectsConcerned(&objectsConcerned);
        if ( whileConditions[k].function != NULL &&
             !whileConditions[k].function( scene, objectsConcerned, whileConditions[k], eval ) )
            return false; //Return false as soon as a condition is false
    }

    return true;
}

/**
 * Run actions of the event
 */
void WhileEvent::ExecuteActions( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval )
{
    for ( unsigned int k = 0; k < actions.size();k++ )
    {
        eval.SetObjectsConcerned(&objectsConcerned);
        if ( actions[k].function != NULL )
            actions[k].function( scene, objectsConcerned, actions[k], eval );
    }

    return;
}

vector < vector<Instruction>* > WhileEvent::GetAllConditionsVectors()
{
    vector < vector<Instruction>* > allConditions;
    allConditions.push_back(&whileConditions);
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < vector<Instruction>* > WhileEvent::GetAllActionsVectors()
{
    vector < vector<Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

void WhileEvent::SaveToXml(TiXmlElement * eventElem) const
{
    //Save "While conditions"
    TiXmlElement * whileConditionsElem = new TiXmlElement( "WhileConditions" );
    eventElem->LinkEndChild( whileConditionsElem );
    OpenSaveGame::SaveConditions(whileConditions, whileConditionsElem);

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

void WhileEvent::LoadFromXml(const TiXmlElement * eventElem)
{
    if ( eventElem->FirstChildElement( "WhileConditions" ) != NULL )
        OpenSaveGame::OpenConditions(whileConditions, eventElem->FirstChildElement( "WhileConditions" ));
    else
        cout << "Aucune informations sur les while conditions d'un évènement While";

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
 * Initialize from another WhileEvent.
 * Used by copy ctor and assignement operator
 */
void WhileEvent::Init(const WhileEvent & event)
{
    events.clear();
    for (unsigned int i =0;i<event.events.size();++i)
    	events.push_back( event.events[i]->Clone() );

    whileConditions = event.whileConditions;
    conditions = event.conditions;
    actions = event.actions;
}

/**
 * Custom copy operator
 */
WhileEvent::WhileEvent(const WhileEvent & event) :
BaseEvent(event)
{
    Init(event);
}

/**
 * Custom assignement operator
 */
WhileEvent& WhileEvent::operator=(const WhileEvent & event)
{
    if ( this != &event )
    {
        BaseEvent::operator=(event);
        Init(event);
    }

    return *this;
}
