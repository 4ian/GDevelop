/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "RepeatEvent.h"
#include "GDCore/IDE/EventsEditorItemsAreas.h"
#include "GDCore/IDE/EventsEditorSelection.h"
#include "GDCore/IDE/EventsRenderingHelper.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/IDE/Dialogs/EditRepeatEvent.h"

using namespace std;

namespace gd
{

RepeatEvent::RepeatEvent() :
BaseEvent(),
repeatNumberExpression(""),
repeatNumberExpressionSelected(false)
{
}


vector < vector<gd::Instruction>* > RepeatEvent::GetAllConditionsVectors()
{
    vector < vector<gd::Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < vector<gd::Instruction>* > RepeatEvent::GetAllActionsVectors()
{
    vector < vector<gd::Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

vector < gd::Expression* > RepeatEvent::GetAllExpressions()
{
    vector < gd::Expression* > allExpressions;
    allExpressions.push_back(&repeatNumberExpression);

    return allExpressions;
}

vector < const vector<gd::Instruction>* > RepeatEvent::GetAllConditionsVectors() const
{
    vector < const vector<gd::Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < const vector<gd::Instruction>* > RepeatEvent::GetAllActionsVectors() const
{
    vector < const vector<gd::Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

vector < const gd::Expression* > RepeatEvent::GetAllExpressions() const
{
    vector < const gd::Expression* > allExpressions;
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
    gd::EventsListSerialization::SaveConditions(conditions, conditionsElem);

    //Les actions
    TiXmlElement * actionsElem = new TiXmlElement( "Actions" );
    eventElem->LinkEndChild( actionsElem );
    gd::EventsListSerialization::SaveActions(actions, actionsElem);

    //Sous évènements
    if ( !GetSubEvents().IsEmpty() )
    {
        TiXmlElement * subeventsElem;
        subeventsElem = new TiXmlElement( "Events" );
        eventElem->LinkEndChild( subeventsElem );

        gd::EventsListSerialization::SaveEventsToXml(events, subeventsElem);
    }
}

void RepeatEvent::LoadFromXml(gd::Project & project, const TiXmlElement * eventElem)
{
    if ( eventElem->FirstChildElement( "RepeatExpression" ) != NULL )
        repeatNumberExpression = gd::Expression(eventElem->FirstChildElement("RepeatExpression")->Attribute("value"));

    //Conditions
    if ( eventElem->FirstChildElement( "Conditions" ) != NULL )
        gd::EventsListSerialization::OpenConditions(project, conditions, eventElem->FirstChildElement( "Conditions" ));

    //Actions
    if ( eventElem->FirstChildElement( "Actions" ) != NULL )
        gd::EventsListSerialization::OpenActions(project, actions, eventElem->FirstChildElement( "Actions" ));

    //Subevents
    if ( eventElem->FirstChildElement( "Events" ) != NULL )
        gd::EventsListSerialization::LoadEventsFromXml(project, events, eventElem->FirstChildElement( "Events" ));
}

/**
 * Render the event in the bitmap
 */
void RepeatEvent::Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform)
{
#if !defined(GD_NO_WX_GUI)
    gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
    int border = renderingHelper->instructionsListBorder;
    const int repeatTextHeight = 20;

    //Draw header rectangle
    wxRect headerRect(x, y, width, repeatTextHeight);
    renderingHelper->DrawNiceRectangle(dc, headerRect);

    //Repeat text
    dc.SetFont( renderingHelper->GetNiceFont().Bold() );
    dc.SetTextForeground(wxColour(0,0,0));
    dc.DrawText( _("Repeat") + " " + repeatNumberExpression.GetPlainString() + " " + _("times :"), x + 4, y + 3 );

    //Draw conditions rectangle
    wxRect rect(x, y+repeatTextHeight, renderingHelper->GetConditionsColumnWidth()+border, GetRenderedHeight(width, platform)-repeatTextHeight);
    renderingHelper->DrawNiceRectangle(dc, rect);

    //Draw actions and conditions
    renderingHelper->DrawConditionsList(conditions, dc,
                                        x+border,
                                        y+repeatTextHeight+border,
                                        renderingHelper->GetConditionsColumnWidth()-border, this, areas, selection, platform);
    renderingHelper->DrawActionsList(actions, dc,
                                     x+renderingHelper->GetConditionsColumnWidth()+border,
                                     y+repeatTextHeight+border,
                                     width-renderingHelper->GetConditionsColumnWidth()-border*2, this, areas, selection, platform);
#endif
}

unsigned int RepeatEvent::GetRenderedHeight(unsigned int width, const gd::Platform & platform) const
{
#if !defined(GD_NO_WX_GUI)
    if ( eventHeightNeedUpdate )
    {
        gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
        int border = renderingHelper->instructionsListBorder;
        const int repeatTextHeight = 20;

        //Get maximum height needed
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth()-border, platform);
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth()-border*2, platform);

        renderedHeight = ( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + repeatTextHeight + border*2;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
#else
    return 0;
#endif
}

gd::BaseEvent::EditEventReturnType RepeatEvent::EditEvent(wxWindow* parent_, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_)
{
#if !defined(GD_NO_WX_GUI)
    EditRepeatEvent dialog(parent_, *this, game_, scene_);
    if ( dialog.ShowModal() == 0 ) return Cancelled;
#endif

    return ChangesMade;
}

/**
 * Initialize from another RepeatEvent.
 * Used by copy ctor and assignement operator
 */
void RepeatEvent::Init(const RepeatEvent & event)
{
    events = *event.events.Clone();

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

}
