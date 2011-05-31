/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "WhileEvent.h"
#include "GDL/tinyxml.h"
#include "RuntimeScene.h"
#include "ObjectsConcerned.h"
#include "GDL/OpenSaveGame.h"

#if defined(GD_IDE_ONLY)
#include "GDL/EventsRenderingHelper.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/TranslateAction.h"
#include "GDL/TranslateCondition.h"
#endif

#include "GDL/profile.h" //Profiling

/**
 * Check the conditions, and launch actions and subevents if necessary
 */
void WhileEvent::Execute( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
{
    BT_PROFILE("WhileEvent");
    while (ExecuteWhileConditions( scene, objectsConcerned))
    {
        ObjectsConcerned objectsConcernedForEvent;
        objectsConcernedForEvent.InheritsFrom(&objectsConcerned);

        if ( ExecuteConditions( scene, objectsConcernedForEvent) == true )
        {
            ExecuteActions( scene, objectsConcernedForEvent);

            for (unsigned int i = 0;i<events.size();++i)
            {
                ObjectsConcerned objectsConcernedForSubEvent;
                objectsConcernedForSubEvent.InheritsFrom(&objectsConcernedForEvent);

                events[i]->Execute(scene, objectsConcernedForSubEvent);
            }
        }
    }
}

/**
 * Check if all conditions are true
 */
bool WhileEvent::ExecuteConditions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
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
 * Check if "while conditions" are true
 */
bool WhileEvent::ExecuteWhileConditions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
{
    for ( unsigned int k = 0; k < whileConditions.size(); ++k )
    {
        if ( whileConditions[k].function != NULL &&
             !whileConditions[k].function( scene, objectsConcerned, whileConditions[k]) )
            return false; //Return false as soon as a condition is false
    }

    return true;
}

/**
 * Run actions of the event
 */
void WhileEvent::ExecuteActions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
{
    for ( unsigned int k = 0; k < actions.size();k++ )
    {
        if ( actions[k].function != NULL )
            actions[k].function( scene, objectsConcerned, actions[k]);
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
#if defined(GD_IDE_ONLY)
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
#endif

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

#if defined(GD_IDE_ONLY)

void WhileEvent::OnSingleClick(int x, int y, vector < boost::tuple< vector < BaseEventSPtr > *, unsigned int, vector < Instruction > *, unsigned int > > & eventsSelected,
                         bool & conditionsSelected, bool & instructionsSelected)
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();
    const int repeatHeight = 20;

    if ( y>0 && static_cast<unsigned int>(y) <= whileConditionsHeight)
    {
        conditionsSelected = true;

        vector < Instruction > * conditionsListSelected = NULL;
        unsigned int conditionIdInList = 0;

        bool found = renderingHelper->GetConditionAt(whileConditions, x-0, y-0, conditionsListSelected, conditionIdInList);

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
            boost::tuples::get<2>(eventsSelected.back()) = &whileConditions;
            boost::tuples::get<3>(eventsSelected.back()) = 0;

            return;
        }
    }

    y -= whileConditionsHeight+repeatHeight; //Substract the height of the "For Each object ..." text so as to simplify the tests
    if ( y < 0 ) return;

    if ( x < 0 || static_cast<unsigned int>(x) <= renderingHelper->GetConditionsColumnWidth())
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

/**
 * Render the event in the bitmap
 */
void WhileEvent::Render(wxBufferedPaintDC & dc, int x, int y, unsigned int width) const
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();
    const int repeatHeight = 20;

    //Draw event rectangle
    dc.SetPen(*wxTRANSPARENT_PEN);
    dc.SetBrush(wxBrush(wxColour(255, 255, 255), wxBRUSHSTYLE_SOLID));
    wxRect rect(x, y, width, GetRenderedHeight(width));
    wxColor color1 = selected ? renderingHelper->selectionColor : (IsDisabled() ? renderingHelper->disabledColor2 :renderingHelper->eventGradient1);
    wxColor color2 = IsDisabled() ? renderingHelper->disabledColor : renderingHelper->eventGradient2;
    wxColor color3 = IsDisabled() ? renderingHelper->disabledColor : renderingHelper->eventGradient3;
    wxColor color4 = selected ? renderingHelper->selectionColor : (IsDisabled() ? renderingHelper->disabledColor2 :renderingHelper->eventGradient4);

    renderingHelper->DrawNiceRectangle(dc, rect, color1, color2, color3, color4, renderingHelper->eventBorderColor);

    //While text
    dc.SetFont( renderingHelper->GetBoldFont() );
    dc.DrawText( _T("Tant que :"), x+2, y+1 );

    //Draw "while conditions"
    whileConditionsHeight = 2;
    whileConditionsHeight += renderingHelper->DrawConditionsList(whileConditions, dc, x+80, y+2, width-80, IsDisabled());

    dc.SetFont( renderingHelper->GetBoldFont() );
    dc.DrawText( _T("Répéter :"), x+2, y+whileConditionsHeight);

    renderingHelper->DrawConditionsList(conditions, dc, x, y+whileConditionsHeight+repeatHeight, renderingHelper->GetConditionsColumnWidth(), IsDisabled());
    renderingHelper->DrawActionsList(actions, dc, x+renderingHelper->GetConditionsColumnWidth(), y+whileConditionsHeight+repeatHeight, width-renderingHelper->GetConditionsColumnWidth(), IsDisabled());
}

unsigned int WhileEvent::GetRenderedHeight(unsigned int width) const
{
    if ( eventHeightNeedUpdate )
    {
        EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();
        const int repeatHeight = 20;

        //Get maximum height needed
        whileConditionsHeight = renderingHelper->GetRenderedConditionsListHeight(whileConditions, width-80);
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth());
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth());

        renderedHeight = (( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + whileConditionsHeight + repeatHeight);
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
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
    events = CloneVectorOfEvents(event.events);

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
