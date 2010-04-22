/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "StandardEvent.h"
#include "ObjectsConcerned.h"
#include "Access.h"
#include "tinyxml.h"
#include "GDL/OpenSaveGame.h"

#if defined(GDE)
#include "EventsRenderingHelper.h"
#endif

StandardEvent::StandardEvent() :
BaseEvent()
{
}

/**
 * Check the conditions, and launch actions and subevents if necessary
 */
void StandardEvent::Execute( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval )
{
    if ( ExecuteConditions( scene, objectsConcerned, eval ) == true )
    {
        ExecuteActions( scene, objectsConcerned, eval );

        for (unsigned int i = 0;i<events.size();++i)
        {
            ObjectsConcerned objectsConcernedForSubEvent;
            objectsConcernedForSubEvent.InheritsFrom(&objectsConcerned);

            events[i]->Execute(scene, objectsConcernedForSubEvent, eval);
        }
    }
}

/**
 * Check if all conditions are true
 */
bool StandardEvent::ExecuteConditions( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval )
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
//TODO : Make "Scene" and "Quit" real actions
void StandardEvent::ExecuteActions( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval )
{
    for ( unsigned int k = 0; k < actions.size();k++ )
    {
        eval.SetObjectsConcerned(&objectsConcerned);
        if ( actions[k].function != NULL )
            actions[k].function( scene, objectsConcerned, actions[k], eval );
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

#if defined(GDE)
/**
 * Render the event in the bitmap
 */
void StandardEvent::RenderInBitmap() const
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();

    //Get sizes and recreate the bitmap
    int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth());
    int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, renderedWidth-renderingHelper->GetConditionsColumnWidth());
    renderedEventBitmap.Create(renderedWidth, conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight, -1);

    //Prepare renderers and constants
    wxMemoryDC dc;
    dc.SelectObject(renderedEventBitmap);

    //Draw event rectangle
    dc.SetPen(*wxTRANSPARENT_PEN);
    dc.SetBrush(wxBrush(wxColour(255, 255, 255), wxBRUSHSTYLE_SOLID));
    dc.Clear();
    {
        wxRect rect(0, 0, renderedWidth, renderedEventBitmap.GetHeight());

        if ( !selected )
            renderingHelper->DrawNiceRectangle(dc, rect, renderingHelper->eventGradient1, renderingHelper->eventGradient2, renderingHelper->eventGradient3,
                                                renderingHelper->eventGradient4, renderingHelper->eventBorderColor);
        else
            renderingHelper->DrawNiceRectangle(dc, rect, renderingHelper->selectionColor, renderingHelper->eventGradient2, renderingHelper->eventGradient3,
                                                renderingHelper->selectionColor, renderingHelper->eventBorderColor);
    }

    renderingHelper->DrawConditionsList(conditions, dc, 0, 0, renderingHelper->GetConditionsColumnWidth());
    renderingHelper->DrawActionsList(actions, dc, renderingHelper->GetConditionsColumnWidth(), 0, renderedWidth-renderingHelper->GetConditionsColumnWidth());

    eventRenderingNeedUpdate = false;
}

void StandardEvent::OnSingleClick(int x, int y, vector < boost::tuple< vector < BaseEventSPtr > *, unsigned int, vector < Instruction > *, unsigned int > > & eventsSelected,
                         bool & conditionsSelected, bool & instructionsSelected)
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();

    if ( x <= renderingHelper->GetConditionsColumnWidth())
    {
        conditionsSelected = true;

        int cId = renderingHelper->GetConditionAt(conditions, x-0, y-0);

        if ( cId >= 0 && cId < conditions.size() )
        {
            //Update event and conditions selection information
            conditions[cId].selected = true;
            eventRenderingNeedUpdate = true;

            //Update editor selection information
            instructionsSelected = true;
            boost::tuples::get<2>(eventsSelected.back()) = &conditions;
            boost::tuples::get<3>(eventsSelected.back()) = cId;

            return;
        }
        else if ( y <= 18 )
        {
            //Update event selection information
            eventRenderingNeedUpdate = true;

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

        int aId = renderingHelper->GetActionAt(actions, x-0, y-0);

        if ( aId >= 0 && aId < actions.size()  )
        {
            //Update event and action selection information
            actions[aId].selected = true;
            eventRenderingNeedUpdate = true;

            //Update selection information
            instructionsSelected = true;
            boost::tuples::get<2>(eventsSelected.back()) = &actions;
            boost::tuples::get<3>(eventsSelected.back()) = aId;
        }
        else
        {
            //Update event selection information
            eventRenderingNeedUpdate = true;

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
    events.clear();
    for (unsigned int i =0;i<event.events.size();++i)
    	events.push_back( event.events[i]->Clone() );

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
