/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "StandardEvent.h"
#include "PlatformDefinition/InstructionsMetadataHolder.h"
#include "GDCore/IDE/EventsRenderingHelper.h"
#include "GDCore/IDE/EventsEditorItemsAreas.h"
#include "GDCore/IDE/EventsEditorSelection.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/CommonTools.h"
#include "GDL/Events/EventsCodeGenerator.h"
#include "GDL/Events/EventsCodeGenerationContext.h"

StandardEvent::StandardEvent() :
BaseEvent()
{
}

std::string StandardEvent::GenerateEventCode(Game & game, Scene & scene, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
{
    std::string outputCode;

    outputCode += codeGenerator.GenerateConditionsListCode(game, scene, conditions, context);

    std::string ifPredicat;
    for (unsigned int i = 0;i<conditions.size();++i)
    {
        if (i!=0) ifPredicat += " && ";
        ifPredicat += "condition"+ToString(i)+"IsTrue";
    }

    if ( !ifPredicat.empty() ) outputCode += "if (" +ifPredicat+ ")\n";
    outputCode += "{\n";
    outputCode += codeGenerator.GenerateActionsListCode(game, scene, actions, context);
    if ( !events.empty() ) //Sub events
    {
        outputCode += "\n{\n";
        outputCode += codeGenerator.GenerateEventsListCode(game, scene, events, context);
        outputCode += "}\n";
    }

    outputCode += "}\n";

    return outputCode;
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
    if ( eventElem == NULL ) return;

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
 * Render the event in the bitmap
 */
void StandardEvent::Render(wxDC & dc, int x, int y, unsigned int width, EventsEditorItemsAreas & areas, EventsEditorSelection & selection)
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();
    int border = renderingHelper->instructionsListBorder;

    //Draw event rectangle
    wxRect rect(x, y, renderingHelper->GetConditionsColumnWidth()+border, GetRenderedHeight(width));
    renderingHelper->DrawNiceRectangle(dc, rect);

    InstructionsMetadataHolder metadataHolder; //TODO : For now, construct a wrapper around ExtensionsManager
    renderingHelper->DrawConditionsList(conditions, dc,
                                        x+border,
                                        y+border,
                                        renderingHelper->GetConditionsColumnWidth()-border, this, areas, selection, metadataHolder);
    renderingHelper->DrawActionsList(actions, dc,
                                     x+renderingHelper->GetConditionsColumnWidth()+border,
                                     y+border,
                                     width-renderingHelper->GetConditionsColumnWidth()-border*2, this, areas, selection, metadataHolder);

    //Make sure that Render is rendering an event with the same height as GetRenderedHeight : Use same values for border and similar calls to compute heights
}

unsigned int StandardEvent::GetRenderedHeight(unsigned int width) const
{
    if ( eventHeightNeedUpdate )
    {
        EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();
        int border = renderingHelper->instructionsListBorder;

        //Get maximum height needed
    InstructionsMetadataHolder metadataHolder; //TODO : For now, construct a wrapper around ExtensionsManager
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth()-border*2, metadataHolder);
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth()-border*2, metadataHolder);

        renderedHeight = (conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight)+border*2;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
}

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

#endif
