#include "WhileEvent.h"
#include "tinyxml.h"
#include "RuntimeScene.h"
#include "ObjectsConcerned.h"
#include "Access.h"
#include "GDL/OpenSaveGame.h"

#if defined(GDE)
#include "GDL/EventsRenderingHelper.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/TranslateAction.h"
#include "GDL/TranslateCondition.h"
#endif

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

#if defined(GDE)

void WhileEvent::OnSingleClick(int x, int y, vector < boost::tuple< vector < BaseEventSPtr > *, unsigned int, vector < Instruction > *, unsigned int > > & eventsSelected,
                         bool & conditionsSelected, bool & instructionsSelected)
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();
    const int repeatHeight = 20;

    if ( y <= whileConditionsHeight)
    {
        conditionsSelected = true;

        int cId = renderingHelper->GetConditionAt(whileConditions, x-0, y-0);
        if ( cId >= 0 && static_cast<unsigned>(cId) < whileConditions.size() )
        {
            //Update event and condition selection information
            whileConditions[cId].selected = true;
            eventRenderingNeedUpdate = true;

            //Update editor selection information
            instructionsSelected = true;
            boost::tuples::get<2>(eventsSelected.back()) = &whileConditions;
            boost::tuples::get<3>(eventsSelected.back()) = cId;

            return;
        }
        else if ( y <= 18 )
        {
            //Update event selection information
            eventRenderingNeedUpdate = true;

            //Update selection information
            instructionsSelected = true;
            boost::tuples::get<2>(eventsSelected.back()) = &whileConditions;
            boost::tuples::get<3>(eventsSelected.back()) = 0;

            return;
        }
    }

    y -= whileConditionsHeight+repeatHeight; //Substract the height of the "For Each object ..." text so as to simplify the tests
    if ( y < 0 ) return;

    if ( static_cast<unsigned>(x) <= renderingHelper->GetConditionsColumnWidth())
    {
        conditionsSelected = true;

        int cId = renderingHelper->GetConditionAt(conditions, x-0, y-0);

        if ( cId >= 0 && static_cast<unsigned>(cId) < conditions.size() )
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

        if ( aId >= 0 && static_cast<unsigned>(aId) < actions.size()  )
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

/**
 * Render the event in the bitmap
 */
void WhileEvent::RenderInBitmap() const
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();
    const int repeatHeight = 20;

    //Get sizes and recreate the bitmap
    int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth());
    int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, renderedWidth-renderingHelper->GetConditionsColumnWidth());
    whileConditionsHeight = renderingHelper->GetRenderedConditionsListHeight(whileConditions, renderedWidth-80);
    renderedEventBitmap.Create(renderedWidth, ( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + whileConditionsHeight + repeatHeight +2, -1);

    //Prepare renderers and constants
    wxMemoryDC dc;
    dc.SelectObject(renderedEventBitmap);

    //Draw event rectangle
    dc.SetPen(*wxTRANSPARENT_PEN);
    dc.SetBrush(wxBrush(wxColour(255, 255, 255), wxBRUSHSTYLE_SOLID));
    dc.Clear();
    wxRect rect(0, 0, renderedWidth, renderedEventBitmap.GetHeight());

    if ( !selected )
        renderingHelper->DrawNiceRectangle(dc, rect, renderingHelper->eventGradient1, renderingHelper->eventGradient2, renderingHelper->eventGradient3, renderingHelper->eventGradient4, renderingHelper->eventBorderColor);
    else
        renderingHelper->DrawNiceRectangle(dc, rect, renderingHelper->selectionColor, renderingHelper->eventGradient2, renderingHelper->eventGradient3, renderingHelper->selectionColor, renderingHelper->eventBorderColor);

    //While text
    dc.SetFont( renderingHelper->GetBoldFont() );
    dc.DrawText( _("Tant que :"), 2, 1 );

    //Draw "while conditions"
    whileConditionsHeight = 2;
    whileConditionsHeight += renderingHelper->DrawConditionsList(whileConditions, dc, 80, 2, renderedWidth-80);

    dc.SetFont( renderingHelper->GetBoldFont() );
    dc.DrawText( _("Répéter :"), 2, whileConditionsHeight);

    renderingHelper->DrawConditionsList(conditions, dc, 0, whileConditionsHeight+repeatHeight, renderingHelper->GetConditionsColumnWidth());
    renderingHelper->DrawActionsList(actions, dc, renderingHelper->GetConditionsColumnWidth(), whileConditionsHeight+repeatHeight, renderedWidth-renderingHelper->GetConditionsColumnWidth());

    eventRenderingNeedUpdate = false;
}

void WhileEvent::EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_)
{
}
#endif

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
