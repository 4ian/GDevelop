
#include "GDL/OpenSaveGame.h"
#include "ForEachEvent.h"
#include "Access.h"
#include "ObjectsConcerned.h"
#include "RuntimeScene.h"
#include "tinyxml.h"

#if defined(GDE)
#include "GDL/EventsRenderingHelper.h"
#include "GDL/EditForEachEvent.h"
#endif

ForEachEvent::ForEachEvent() :
BaseEvent(),
objectsToPick("")
#if defined(GDE)
,objectsToPickSelected(false)
#endif
{
}

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


#if defined(GDE)
void ForEachEvent::OnSingleClick(int x, int y, vector < boost::tuple< vector < BaseEventSPtr > *, unsigned int, vector < Instruction > *, unsigned int > > & eventsSelected,
                         bool & conditionsSelected, bool & instructionsSelected)
{
    const int forEachTextHeight = 20;
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();

    //Test selection for the "For Each object..."
    if ( y <= forEachTextHeight )
    {
        objectsToPickSelected = true;
        return;
    }

    //Test selection of actions/conditions
    objectsToPickSelected = false;
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
            eventRenderingNeedUpdate = true;

            //Update editor selection information
            instructionsSelected = true;
            boost::tuples::get<2>(eventsSelected.back()) = conditionsListSelected;
            boost::tuples::get<3>(eventsSelected.back()) = conditionIdInList;

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

        vector < Instruction > * actionsListSelected = NULL;
        unsigned int actionIdInList = 0;

        bool found = renderingHelper->GetActionAt(actions, x-0, y-0, actionsListSelected, actionIdInList);

        if ( found )
        {
            //Update event and action selection information
            if ( actionIdInList < actionsListSelected->size() ) (*actionsListSelected)[actionIdInList].selected = true;
            eventRenderingNeedUpdate = true;

            //Update selection information
            instructionsSelected = true;
            boost::tuples::get<2>(eventsSelected.back()) = actionsListSelected;
            boost::tuples::get<3>(eventsSelected.back()) = actionIdInList;
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
void ForEachEvent::RenderInBitmap() const
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();
    const int forEachTextHeight = 20;

    //Get sizes and recreate the bitmap
    int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth());
    int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, renderedWidth-renderingHelper->GetConditionsColumnWidth());
    renderedEventBitmap.Create(renderedWidth, ( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + forEachTextHeight, -1);

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

    //"For Each" text selection
    if ( objectsToPickSelected )
    {
        dc.SetBrush(renderingHelper->GetSelectedRectangleFillBrush());
        dc.SetPen(renderingHelper->GetSelectedRectangleOutlinePen());
        dc.DrawRectangle(1, 1, renderedWidth-2, forEachTextHeight-2);
    }

    //For Each text
    dc.SetFont( renderingHelper->GetBoldFont() );
    dc.DrawText( _("Pour chaque objet") + " " + objectsToPick.GetPlainString() + _(", répéter :"), 0 + 2, 0 + 1 );

    //Draw actions and conditions
    renderingHelper->DrawConditionsList(conditions, dc, 0, forEachTextHeight, renderingHelper->GetConditionsColumnWidth());
    renderingHelper->DrawActionsList(actions, dc, renderingHelper->GetConditionsColumnWidth(), forEachTextHeight, renderedWidth-renderingHelper->GetConditionsColumnWidth());

    eventRenderingNeedUpdate = false;
}

void ForEachEvent::EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_)
{
    EditForEachEvent dialog(parent_, *this, game_, scene_);
    dialog.ShowModal();
}
#endif

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
