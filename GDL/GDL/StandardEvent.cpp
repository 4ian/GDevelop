/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "StandardEvent.h"
#include "ObjectsConcerned.h"
#include "GDL/tinyxml.h"
#include "GDL/OpenSaveGame.h"

#if defined(GD_IDE_ONLY)
#include "EventsRenderingHelper.h"
#endif

StandardEvent::StandardEvent() :
BaseEvent()
{
}

/**
 * Check the conditions, and launch actions and subevents if necessary
 */
void StandardEvent::Execute( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
{
    if ( ExecuteConditions( scene, objectsConcerned) == true )
    {
        ExecuteActions( scene, objectsConcerned);

        for (unsigned int i = 0;i<events.size();++i)
        {
            ObjectsConcerned objectsConcernedForSubEvent;
            objectsConcernedForSubEvent.InheritsFrom(&objectsConcerned);

            events[i]->Execute(scene, objectsConcernedForSubEvent);
        }
    }
}

/**
 * Check if all conditions are true
 */
bool StandardEvent::ExecuteConditions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
{
    for ( unsigned int k = 0; k < conditions.size(); ++k )
    {
        if ( conditions[k].function != NULL &&
             !conditions[k].function( scene, objectsConcerned, conditions[k]) )
            return false; //Return false as soon as a condition is false
    }

    return true;
}

/**
 * Run actions of the event
 */
void StandardEvent::ExecuteActions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
{
    for ( unsigned int k = 0; k < actions.size();k++ )
    {
        if ( actions[k].function != NULL )
            actions[k].function( scene, objectsConcerned, actions[k]);
    }

    return;
}

vector < vector<Instruction>* > StandardEvent::GetAllConditionsVectors()
{
    vector < vector<Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < vector<Instruction>* > StandardEvent::GetAllActionsVectors()
{
    vector < vector<Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}
#if defined(GD_IDE_ONLY)
void StandardEvent::SaveToXml(TiXmlElement * eventElem) const
{
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
#endif

void StandardEvent::LoadFromXml(const TiXmlElement * eventElem)
{
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

#if defined(GD_IDE_ONLY)
/**
 * Render the event in the bitmap
 */
void StandardEvent::Render(wxBufferedPaintDC & dc, int x, int y, unsigned int width) const
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();

    //Draw event rectangle
    dc.SetPen(*wxTRANSPARENT_PEN);
    dc.SetBrush(wxBrush(wxColour(255, 255, 255), wxBRUSHSTYLE_SOLID));
    {
        wxRect rect(x, y, width, GetRenderedHeight(width));
        wxColor color1 = selected ? renderingHelper->selectionColor : (IsDisabled() ? renderingHelper->disabledColor2 :renderingHelper->eventGradient1);
        wxColor color2 = IsDisabled() ? renderingHelper->disabledColor : renderingHelper->eventGradient2;
        wxColor color3 = IsDisabled() ? renderingHelper->disabledColor : renderingHelper->eventGradient3;
        wxColor color4 = selected ? renderingHelper->selectionColor : (IsDisabled() ? renderingHelper->disabledColor2 :renderingHelper->eventGradient4);

        renderingHelper->DrawNiceRectangle(dc, rect, color1, color2, color3, color4, renderingHelper->eventBorderColor);
    }

    renderingHelper->DrawConditionsList(conditions, dc, x, y, renderingHelper->GetConditionsColumnWidth(), IsDisabled());
    renderingHelper->DrawActionsList(actions, dc, x+renderingHelper->GetConditionsColumnWidth(), y, width-renderingHelper->GetConditionsColumnWidth(), IsDisabled());
}

unsigned int StandardEvent::GetRenderedHeight(unsigned int width) const
{
    if ( eventHeightNeedUpdate )
    {
        EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();

        //Get maximum height needed
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth());
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth());

        renderedHeight = (conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight);
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
}

void StandardEvent::OnSingleClick(int x, int y, vector < boost::tuple< vector < BaseEventSPtr > *, unsigned int, vector < Instruction > *, unsigned int > > & eventsSelected,
                         bool & conditionsSelected, bool & instructionsSelected)
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();

    if ( x <= renderingHelper->GetConditionsColumnWidth())
    {
        conditionsSelected = true;

        vector < Instruction > * conditionsListSelected = NULL;
        unsigned int conditionIdInList = 0;

        bool found = renderingHelper->GetConditionAt(conditions, x-0, y-0, conditionsListSelected, conditionIdInList);

        if ( found )
        {
            //Update event and conditions selection information
            if ( conditionIdInList < conditionsListSelected->size() ) (*conditionsListSelected)[conditionIdInList].selected = true;

            //Update editor selection information
            instructionsSelected = true;
            boost::tuples::get<2>(eventsSelected.back()) = conditionsListSelected;
            boost::tuples::get<3>(eventsSelected.back()) = conditionIdInList;

            return;
        }
        else if ( y <= 18 )
        {
            //Update selection information
            instructionsSelected = true;
            boost::tuples::get<2>(eventsSelected.back()) = &conditions;
            boost::tuples::get<3>(eventsSelected.back()) = 0;

            return;
        }
    }
    else
    {
        conditionsSelected = false;

        vector < Instruction > * actionsListSelected = NULL;
        unsigned int actionIdInList = 0;

        bool found = renderingHelper->GetActionAt(actions, x-0, y-0, actionsListSelected, actionIdInList);

        if ( found )
        {
            //Update event and action selection information
            if ( actionIdInList < actionsListSelected->size() ) (*actionsListSelected)[actionIdInList].selected = true;

            //Update selection information
            instructionsSelected = true;
            boost::tuples::get<2>(eventsSelected.back()) = actionsListSelected;
            boost::tuples::get<3>(eventsSelected.back()) = actionIdInList;
        }
        else
        {
            //Update selection information
            instructionsSelected = true;
            boost::tuples::get<2>(eventsSelected.back()) = &actions;
            boost::tuples::get<3>(eventsSelected.back()) = 0;
        }
    }
}
#endif

/**
 * Initialize from another StandardEvent.
 * Used by copy ctor and assignement operator
 */
void StandardEvent::Init(const StandardEvent & event)
{
    events = CloneVectorOfEvents(event.events);

    conditions = event.conditions;
    actions = event.actions;
}

/**
 * Custom copy operator
 */
StandardEvent::StandardEvent(const StandardEvent & event) :
BaseEvent(event)
{
    Init(event);
}

/**
 * Custom assignement operator
 */
StandardEvent& StandardEvent::operator=(const StandardEvent & event)
{
    if ( this != &event )
    {
        BaseEvent::operator=(event);
        Init(event);
    }

    return *this;
}
#endif
