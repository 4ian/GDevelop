/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ForEachEvent.h"
#include <iostream>
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/IDE/EventsRenderingHelper.h"
#include "GDCore/IDE/EventsEditorItemsAreas.h"
#include "GDCore/IDE/EventsEditorSelection.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/IDE/Dialogs/EditForEachEvent.h"

using namespace std;

namespace gd
{

ForEachEvent::ForEachEvent() :
BaseEvent(),
objectsToPick(""),
objectsToPickSelected(false)
{
}

vector < vector<gd::Instruction>* > ForEachEvent::GetAllConditionsVectors()
{
    vector < vector<gd::Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < vector<gd::Instruction>* > ForEachEvent::GetAllActionsVectors()
{
    vector < vector<gd::Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

vector < gd::Expression* > ForEachEvent::GetAllExpressions()
{
    vector < gd::Expression* > allExpressions;
    allExpressions.push_back(&objectsToPick);

    return allExpressions;
}
vector < const vector<gd::Instruction>* > ForEachEvent::GetAllConditionsVectors() const
{
    vector < const vector<gd::Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < const vector<gd::Instruction>* > ForEachEvent::GetAllActionsVectors() const
{
    vector < const vector<gd::Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

vector < const gd::Expression* > ForEachEvent::GetAllExpressions() const
{
    vector < const gd::Expression* > allExpressions;
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

void ForEachEvent::LoadFromXml(gd::Project & project, const TiXmlElement * eventElem)
{
    if ( eventElem->FirstChildElement( "Object" ) != NULL )
        objectsToPick = gd::Expression(eventElem->FirstChildElement("Object")->Attribute("value"));

    //Conditions
    if ( eventElem->FirstChildElement( "Conditions" ) != NULL )
        gd::EventsListSerialization::OpenConditions(project, conditions, eventElem->FirstChildElement( "Conditions" ));
    else
        cout << "Conditions missing for a \"For each\" event";

    //Actions
    if ( eventElem->FirstChildElement( "Actions" ) != NULL )
        gd::EventsListSerialization::OpenActions(project, actions, eventElem->FirstChildElement( "Actions" ));
    else
        cout << "Actions missing for a \"For each\" event";

    //Subevents
    if ( eventElem->FirstChildElement( "Events" ) != NULL )
        gd::EventsListSerialization::LoadEventsFromXml(project, events, eventElem->FirstChildElement( "Events" ));
}


/**
 * Render the event in the bitmap
 */
void ForEachEvent::Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform)
{
#if !defined(GD_NO_WX_GUI)
    gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::GetInstance();
    int border = renderingHelper->instructionsListBorder;
    const int forEachTextHeight = 20;

    //Draw header rectangle
    wxRect headerRect(x, y, width, forEachTextHeight);
    renderingHelper->DrawNiceRectangle(dc, headerRect);

    //For Each text
    dc.SetFont( renderingHelper->GetNiceFont().Bold()  );
    dc.SetTextForeground(wxColour(0,0,0));
    dc.DrawText( _("For each object") + " " + objectsToPick.GetPlainString() + _(", repeat :"), x + 4, y + 3 );

    //Draw conditions rectangle
    wxRect rect(x, y+forEachTextHeight, renderingHelper->GetConditionsColumnWidth()+border, GetRenderedHeight(width, platform)-forEachTextHeight);
    renderingHelper->DrawNiceRectangle(dc, rect);

    //Draw actions and conditions
    renderingHelper->DrawConditionsList(conditions, dc,
                                        x+border,
                                        y+forEachTextHeight+border,
                                        renderingHelper->GetConditionsColumnWidth()-border, this, areas, selection, platform);
    renderingHelper->DrawActionsList(actions, dc,
                                     x+renderingHelper->GetConditionsColumnWidth()+border,
                                     y+forEachTextHeight+border,
                                     width-renderingHelper->GetConditionsColumnWidth()-border*2, this, areas, selection, platform);
#endif
}

unsigned int ForEachEvent::GetRenderedHeight(unsigned int width, const gd::Platform & platform) const
{
#if !defined(GD_NO_WX_GUI)
    if ( eventHeightNeedUpdate )
    {
        gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::GetInstance();
        int border = renderingHelper->instructionsListBorder;
        const int forEachTextHeight = 20;

        //Get maximum height needed
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth()-border, platform);
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth()-border*2, platform);

        renderedHeight = (( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + forEachTextHeight)+border*2;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
#else
    return 0;
#endif
}

gd::BaseEvent::EditEventReturnType ForEachEvent::EditEvent(wxWindow* parent_, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_)
{
#if !defined(GD_NO_WX_GUI)
    EditForEachEvent dialog(parent_, *this, game_, scene_);
    if ( dialog.ShowModal() == 0 ) return Cancelled;
#endif

    return ChangesMade;
}

/**
 * Initialize from another ForEachEvent.
 * Used by copy ctor and assignement operator
 */
void ForEachEvent::Init(const ForEachEvent & event)
{
    events = *event.events.Clone();

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

}
