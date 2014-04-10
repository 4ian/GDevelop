/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "StandardEvent.h"
#include "GDCore/IDE/EventsRenderingHelper.h"
#include "GDCore/IDE/EventsEditorItemsAreas.h"
#include "GDCore/IDE/EventsEditorSelection.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"

using namespace std;

namespace gd
{

StandardEvent::StandardEvent() :
BaseEvent()
{
}

StandardEvent::~StandardEvent()
{
};

vector < const vector<gd::Instruction>* > StandardEvent::GetAllConditionsVectors() const
{
    vector < const vector<gd::Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < const vector<gd::Instruction>* > StandardEvent::GetAllActionsVectors() const
{
    vector < const vector<gd::Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}
vector < vector<gd::Instruction>* > StandardEvent::GetAllConditionsVectors()
{
    vector < vector<gd::Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < vector<gd::Instruction>* > StandardEvent::GetAllActionsVectors()
{
    vector < vector<gd::Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

void StandardEvent::SaveToXml(TiXmlElement * eventElem) const
{
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

void StandardEvent::LoadFromXml(gd::Project & project, const TiXmlElement * eventElem)
{
    if ( eventElem == NULL ) return;

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
void StandardEvent::Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform)
{
#if !defined(GD_NO_WX_GUI)
    gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::GetInstance();
    int border = renderingHelper->instructionsListBorder;

    //Draw event rectangle
    wxRect rect(x, y, renderingHelper->GetConditionsColumnWidth()+border, GetRenderedHeight(width, platform));
    renderingHelper->DrawNiceRectangle(dc, rect);

    renderingHelper->DrawConditionsList(conditions, dc,
                                        x+border,
                                        y+border,
                                        renderingHelper->GetConditionsColumnWidth()-border, this, areas, selection, platform);
    renderingHelper->DrawActionsList(actions, dc,
                                     x+renderingHelper->GetConditionsColumnWidth()+border,
                                     y+border,
                                     width-renderingHelper->GetConditionsColumnWidth()-border*2, this, areas, selection, platform);

    //Make sure that Render is rendering an event with the same height as GetRenderedHeight : Use same values for border and similar calls to compute heights
#endif
}

unsigned int StandardEvent::GetRenderedHeight(unsigned int width, const gd::Platform & platform) const
{
#if !defined(GD_NO_WX_GUI)
    if ( eventHeightNeedUpdate )
    {
        gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::GetInstance();
        int border = renderingHelper->instructionsListBorder;

        //Get maximum height needed
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth()-border*2, platform);
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth()-border*2, platform);

        renderedHeight = (conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight)+border*2;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
#else
    return 0;
#endif
}

/**
 * Initialize from another StandardEvent.
 * Used by copy ctor and assignement operator
 */
void StandardEvent::Init(const StandardEvent & event)
{
    events = *event.events.Clone();

    conditions = event.conditions;
    actions = event.actions;
}

/**
 * Custom copy constructor
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

}