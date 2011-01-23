/**

Game Develop - Timed Event Extension
Copyright (c) 2011 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "GDL/OpenSaveGame.h"
#include "TimedEvent.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"
#include "GDL/tinyxml.h"

#if defined(GD_IDE_ONLY)
#include "GDL/EventsRenderingHelper.h"
#endif

std::map < const Scene* , std::map < std::string, TimedEvent* > > TimedEvent::timedEventsList;

TimedEvent::TimedEvent() :
BaseEvent(),
timer("")
{
}

/**
 * Unregister event when object is destroyed
 */
TimedEvent::~TimedEvent()
{
    UnreferenceEvent();
}

/**
 * Add event to timed event list
 */
void TimedEvent::ReferenceEvent(Scene * scene)
{
    timedEventsList[scene][name] = this;
}

/**
 * Suppress event from timed event list
 */
void TimedEvent::UnreferenceEvent()
{
    std::map < const Scene* , std::map < std::string, TimedEvent* > >::iterator siter = timedEventsList.begin();
    std::map < const Scene* , std::map < std::string, TimedEvent* > >::const_iterator send = timedEventsList.end();
    for (;siter!=send;++siter)
    {
        std::map < std::string, TimedEvent* >::iterator fiter = siter->second.begin();
        std::map < std::string, TimedEvent* >::const_iterator fend = siter->second.end();
        for (;fiter!=fend;++fiter)
        {
            if ( fiter->second == this ) fiter->second = NULL;
        }
    }
}
/**
 * Check the conditions, and launch actions and subevents if necessary
 */
void TimedEvent::Execute( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
{
    timer.UpdateTime(scene.GetElapsedTime());
    if ( timer.GetTime() > timeout.GetAsMathExpressionResult(scene, objectsConcerned))
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
}

/**
 * Check if all conditions are true
 */
bool TimedEvent::ExecuteConditions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
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
void TimedEvent::ExecuteActions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
{
    for ( unsigned int k = 0; k < actions.size();k++ )
    {
        if ( actions[k].function != NULL )
            actions[k].function( scene, objectsConcerned, actions[k]);
    }

    return;
}

vector < vector<Instruction>* > TimedEvent::GetAllConditionsVectors()
{
    vector < vector<Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < vector<Instruction>* > TimedEvent::GetAllActionsVectors()
{
    vector < vector<Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

vector < GDExpression* > TimedEvent::GetAllExpressions()
{
    vector < GDExpression* > allExpressions;
    allExpressions.push_back(&timeout);

    return allExpressions;
}

#if defined(GD_IDE_ONLY)
void TimedEvent::SaveToXml(TiXmlElement * eventElem) const
{
    TiXmlElement * objectElem = new TiXmlElement( "Name" );
    eventElem->LinkEndChild( objectElem );
    objectElem->SetAttribute("value", name.c_str());

    TiXmlElement * timeoutElem = new TiXmlElement( "Timeout" );
    eventElem->LinkEndChild( timeoutElem );
    timeoutElem->SetAttribute("value", timeout.GetPlainString().c_str());

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

void TimedEvent::LoadFromXml(const TiXmlElement * eventElem)
{
    if ( eventElem->FirstChildElement( "Name" ) != NULL )
        name = eventElem->FirstChildElement("Name")->Attribute("value");

    if ( eventElem->FirstChildElement( "Timeout" ) != NULL )
        timeout = GDExpression(eventElem->FirstChildElement("Timeout")->Attribute("value"));

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
 * Register function during preprocessing
 */
void TimedEvent::Preprocess(const Game & game, RuntimeScene & scene, std::vector < BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList)
{
    if ( !name.empty() ) ReferenceEvent(&scene);
    timer.Reset();
}

#if defined(GD_IDE_ONLY)
void TimedEvent::OnSingleClick(int x, int y, vector < boost::tuple< vector < BaseEventSPtr > *, unsigned int, vector < Instruction > *, unsigned int > > & eventsSelected,
                         bool & conditionsSelected, bool & instructionsSelected)
{
    const int forEachTextHeight = 20;
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();

    //Test selection for the name
    if ( y >= 0 && y <= forEachTextHeight )
    {
        nameSelected = true;
        return;
    }

    //Test selection of actions/conditions
    nameSelected = false;
    y -= forEachTextHeight; //Substract the height of the "For Each object ..." text so as to simplify the tests
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

/**
 * Render the event in the bitmap
 */
void TimedEvent::Render(wxBufferedPaintDC & dc, int x, int y, unsigned int width) const
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();
    const int functionTextHeight = 20;

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

    //Name Selection
    if ( selected && nameSelected )
    {
        dc.SetBrush(renderingHelper->GetSelectedRectangleFillBrush());
        dc.SetPen(renderingHelper->GetSelectedRectangleOutlinePen());
        dc.DrawRectangle(x+1, y+1, width-2, functionTextHeight-2);
    }

    //Name
    dc.SetFont( renderingHelper->GetBoldFont() );
    std::string nameTxt;
    if ( !name.empty() ) nameTxt = _(" (Nom : "+name + ")");
    dc.DrawText( _("Déclenchement retardé au bout de "+timeout.GetPlainString()+" secondes.")+" "+nameTxt, x + 2, y + 1 );

    //Draw actions and conditions
    renderingHelper->DrawConditionsList(conditions, dc, x, y+functionTextHeight, renderingHelper->GetConditionsColumnWidth(), IsDisabled());
    renderingHelper->DrawActionsList(actions, dc, x+renderingHelper->GetConditionsColumnWidth(), y+functionTextHeight, width-renderingHelper->GetConditionsColumnWidth(), IsDisabled());
}

unsigned int TimedEvent::GetRenderedHeight(unsigned int width) const
{
    if ( eventHeightNeedUpdate )
    {
        EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();
        const int functionTextHeight = 20;

        //Get maximum height needed
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth());
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth());

        renderedHeight = (( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + functionTextHeight);
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
}

void TimedEvent::EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_)
{
    string newName = string(wxGetTextFromUser(_("Entrez le nom"), _("Nom"), name).mb_str());
    if ( newName != "" ) name = newName;

    string newTimeout = string(wxGetTextFromUser(_("Timeout"), _("Timeout"), name).mb_str());
    if ( newTimeout != "" ) timeout = GDExpression(newTimeout);
}
#endif

/**
 * Initialize from another TimedEvent.
 * Used by copy ctor and assignement operator
 */
void TimedEvent::Init(const TimedEvent & event)
{
    events = CloneVectorOfEvents(event.events);

    name = event.name;
    timeout = event.timeout;
    timer = event.timer;
    conditions = event.conditions;
    actions = event.actions;
}

/**
 * Custom copy operator
 */
TimedEvent::TimedEvent(const TimedEvent & event) :
BaseEvent(event),
timer("")
{
    Init(event);
}

/**
 * Custom assignement operator
 */
TimedEvent& TimedEvent::operator=(const TimedEvent & event)
{
    if ( this != &event )
    {
        BaseEvent::operator=(event);
        Init(event);
    }

    return *this;
}
