/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */
#include "RepeatEvent.h"
#include "RuntimeScene.h"
#include "ObjectsConcerned.h"
#include "GDL/OpenSaveGame.h"
#include <boost/serialization/export.hpp>

#if defined(GDE)
#include "GDL/EventsRenderingHelper.h"
#include "GDL/EditRepeatEvent.h"
#endif

//Declaration of serialization for xml archives
#include <boost/archive/xml_oarchive.hpp>
#include <boost/archive/xml_iarchive.hpp>

template void RepeatEvent::serialize(
    boost::archive::xml_oarchive & ar,
    const unsigned int version
);
template void RepeatEvent::serialize(
    boost::archive::xml_iarchive & ar,
    const unsigned int version
);

//This is used to make the serialization library aware that code should be instantiated for serialization
//of a given class even though the class hasn't been otherwise referred to by the program.
BOOST_CLASS_EXPORT_IMPLEMENT(RepeatEvent)

RepeatEvent::RepeatEvent() :
BaseEvent(),
repeatNumberExpression("")
#if defined(GDE)
,repeatNumberExpressionSelected(false)
#endif
{
}

/**
 * Check the conditions, and launch actions and subevents if necessary
 */
void RepeatEvent::Execute( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
{
    int nbRepeat = repeatNumberExpression.GetAsMathExpressionResult(scene, objectsConcerned);

    for (unsigned int r = 0;r<static_cast<unsigned>(nbRepeat);++r)
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
bool RepeatEvent::ExecuteConditions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
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
void RepeatEvent::ExecuteActions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
{
    for ( unsigned int k = 0; k < actions.size();k++ )
    {
        if ( actions[k].function != NULL )
            actions[k].function( scene, objectsConcerned, actions[k]);
    }

    return;
}

vector < vector<Instruction>* > RepeatEvent::GetAllConditionsVectors()
{
    vector < vector<Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < vector<Instruction>* > RepeatEvent::GetAllActionsVectors()
{
    vector < vector<Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

vector < GDExpression* > RepeatEvent::GetAllExpressions()
{
    vector < GDExpression* > allExpressions;
    allExpressions.push_back(&repeatNumberExpression);

    return allExpressions;
}

void RepeatEvent::SaveToXml(TiXmlElement * eventElem) const
{
    TiXmlElement * repeatElem = new TiXmlElement( "RepeatExpression" );
    eventElem->LinkEndChild( repeatElem );
    repeatElem->SetAttribute("value", repeatNumberExpression.GetPlainString().c_str());

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

void RepeatEvent::LoadFromXml(const TiXmlElement * eventElem)
{
    if ( eventElem->FirstChildElement( "RepeatExpression" ) != NULL )
        repeatNumberExpression = GDExpression(eventElem->FirstChildElement("RepeatExpression")->Attribute("value"));

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
void RepeatEvent::OnSingleClick(int x, int y, vector < boost::tuple< vector < BaseEventSPtr > *, unsigned int, vector < Instruction > *, unsigned int > > & eventsSelected,
                         bool & conditionsSelected, bool & instructionsSelected)
{
    const int repeatTextHeight = 20;
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();

    //Test selection for the "Repeat x times"
    if ( y <= repeatTextHeight )
    {
        repeatNumberExpressionSelected = true;
        return;
    }

    //Test selection of actions/conditions
    repeatNumberExpressionSelected = false;
    y -= repeatTextHeight; //Substract the height of the "Repeat x times" text so as to simplify the tests
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
void RepeatEvent::Render(wxBufferedPaintDC & dc, int x, int y, unsigned int width) const
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();
    const int repeatTextHeight = 20;

    //Draw event rectangle
    dc.SetPen(*wxTRANSPARENT_PEN);
    dc.SetBrush(wxBrush(wxColour(255, 255, 255), wxBRUSHSTYLE_SOLID));
    {
        wxRect rect(x, y, width, GetRenderedHeight(width));

        if ( !selected )
            renderingHelper->DrawNiceRectangle(dc, rect, renderingHelper->eventGradient1, renderingHelper->eventGradient2, renderingHelper->eventGradient3,
                                                renderingHelper->eventGradient4, renderingHelper->eventBorderColor);
        else
            renderingHelper->DrawNiceRectangle(dc, rect, renderingHelper->selectionColor, renderingHelper->eventGradient2, renderingHelper->eventGradient3,
                                                renderingHelper->selectionColor, renderingHelper->eventBorderColor);
    }

    //"Repeat" text selection
    if ( repeatNumberExpressionSelected )
    {
        dc.SetBrush(renderingHelper->GetSelectedRectangleFillBrush());
        dc.SetPen(renderingHelper->GetSelectedRectangleOutlinePen());
        dc.DrawRectangle(x+1, y+1, width-2, repeatTextHeight-2);
    }

    //Repeat text
    dc.SetFont( renderingHelper->GetBoldFont() );
    dc.DrawText( _("Répéter") + " " + repeatNumberExpression.GetPlainString() + " " + _("fois :"), x + 2, y + 1 );

    //Draw actions and conditions
    renderingHelper->DrawConditionsList(conditions, dc, x, y+repeatTextHeight, renderingHelper->GetConditionsColumnWidth());
    renderingHelper->DrawActionsList(actions, dc, x+renderingHelper->GetConditionsColumnWidth(), y+repeatTextHeight, width-renderingHelper->GetConditionsColumnWidth());
}

unsigned int RepeatEvent::GetRenderedHeight(unsigned int width) const
{
    if ( eventHeightNeedUpdate )
    {
        EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();
        const int repeatTextHeight = 20;

        //Get maximum height needed
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth());
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth());

        renderedHeight = (( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + repeatTextHeight);
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
}

void RepeatEvent::EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_)
{
    EditRepeatEvent dialog(parent_, *this, game_, scene_);
    dialog.ShowModal();
}
#endif

/**
 * Initialize from another RepeatEvent.
 * Used by copy ctor and assignement operator
 */
void RepeatEvent::Init(const RepeatEvent & event)
{
    events.clear();
    for (unsigned int i =0;i<event.events.size();++i)
    	events.push_back( event.events[i]->Clone() );

    conditions = event.conditions;
    actions = event.actions;
    repeatNumberExpression = event.repeatNumberExpression;
}

/**
 * Custom copy operator
 */
RepeatEvent::RepeatEvent(const RepeatEvent & event) :
BaseEvent(event),
repeatNumberExpression("")
{
    Init(event);
}

/**
 * Custom assignement operator
 */
RepeatEvent& RepeatEvent::operator=(const RepeatEvent & event)
{
    if ( this != &event )
    {
        BaseEvent::operator=(event);
        Init(event);
    }

    return *this;
}
