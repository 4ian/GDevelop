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
#if defined(GD_IDE_ONLY)

#include "GDL/OpenSaveGame.h"
#include "TimedEvent.h"
#include "GDL/RuntimeScene.h"
#include "GDL/tinyxml.h"
#include "GDL/EventsCodeGenerator.h"
#include "GDL/EventsCodeGenerationContext.h"
#include "GDL/ExpressionsCodeGeneration.h"
#include "GDL/EventsRenderingHelper.h"
#include "GDL/EventsEditorItemsAreas.h"
#include "GDL/EventsEditorSelection.h"
#include "TimedEventEditorDlg.h"

std::vector< TimedEvent* > TimedEvent::codeGenerationCurrentParents;

TimedEvent::TimedEvent() :
BaseEvent()
{
}

TimedEvent::~TimedEvent()
{
}

std::string TimedEvent::GenerateEventCode(const Game & game, const Scene & scene, EventsCodeGenerationContext & context)
{
    context.AddIncludeFile("TimedEvent/TimedEventTools.h");

    //Notify parent timed event that they have a child
    for (unsigned int i = 0;i<codeGenerationCurrentParents.size();++i)
        codeGenerationCurrentParents[i]->codeGenerationChildren.push_back(this);

    //And register this event as potential parent
    codeGenerationCurrentParents.push_back(this);
    codeGenerationChildren.clear();

    //Prepare code for computing timeout
    std::string timeOutCode;
    CallbacksForGeneratingExpressionCode callbacks(timeOutCode, game, scene, context);
    GDExpressionParser parser(timeout.GetPlainString());
    parser.ParseMathExpression(game, scene, callbacks);
    if (timeOutCode.empty()) timeOutCode = "0";

    //Prepare name
    std::string codeName = !name.empty() ? "GDNamedTimedEvent_"+name : "GDTimedEvent_"+ToString(this);

    std::string outputCode;

    outputCode += "if ( GDpriv::TimedEvents::UpdateAndGetTimeOf(*runtimeContext->scene, \""+codeName+"\") > "+timeOutCode+")";
    outputCode += "{";

    outputCode += EventsCodeGenerator::GenerateConditionsListCode(game, scene, conditions, context);

    std::string ifPredicat;
    for (unsigned int i = 0;i<conditions.size();++i)
    {
        if (i!=0) ifPredicat += " && ";
        ifPredicat += "condition"+ToString(i)+"IsTrue";
    }

    if ( !ifPredicat.empty() ) outputCode += "if (" +ifPredicat+ ")\n";
    outputCode += "{\n";
    outputCode += EventsCodeGenerator::GenerateActionsListCode(game, scene, actions, context);
    if ( !events.empty() ) //Sub events
    {
        outputCode += "\n{\n";
        outputCode += EventsCodeGenerator::GenerateEventsListCode(game, scene, events, context);
        outputCode += "}\n";
    }

    outputCode += "}\n";

    outputCode += "}";

    //This event cannot be a parent of other TimedEvent anymore
    if (codeGenerationCurrentParents.empty())
        codeGenerationCurrentParents.pop_back();
    else
        std::cout << "Error! CodeGenerationCurrentParents cannot be empty!";

    return outputCode;
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
 * Render the event in the bitmap
 */
void TimedEvent::Render(wxDC & dc, int x, int y, unsigned int width, EventsEditorItemsAreas & areas, EventsEditorSelection & selection)
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();
    int border = renderingHelper->instructionsListBorder;
    const int functionTextHeight = 20;

    //Draw header rectangle
    wxRect headerRect(x, y, width, functionTextHeight);
    renderingHelper->DrawNiceRectangle(dc, headerRect);

    //Name
    dc.SetFont( renderingHelper->GetNiceFont().Bold()  );
    dc.SetTextForeground(wxColour(0,0,0));
    std::string nameTxt;
    if ( !name.empty() ) nameTxt = _T(" (Nom : "+name + ")");
    dc.DrawText( _T("Déclenchement retardé au bout de "+timeout.GetPlainString()+" secondes.")+" "+nameTxt, x + 4, y + 3 );

    //Draw conditions rectangle
    wxRect rect(x, y+functionTextHeight, renderingHelper->GetConditionsColumnWidth()+border, GetRenderedHeight(width)-functionTextHeight);
    renderingHelper->DrawNiceRectangle(dc, rect);

    //Draw actions and conditions
    renderingHelper->DrawConditionsList(conditions, dc, x, y+functionTextHeight, renderingHelper->GetConditionsColumnWidth(), this, areas, selection);
    renderingHelper->DrawActionsList(actions, dc, x+renderingHelper->GetConditionsColumnWidth(), y+functionTextHeight, width-renderingHelper->GetConditionsColumnWidth(), this, areas, selection);
}

unsigned int TimedEvent::GetRenderedHeight(unsigned int width) const
{
    if ( eventHeightNeedUpdate )
    {
        EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();
        const int functionTextHeight = 20;

        //Get maximum height needed
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth());
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth());

        renderedHeight = (( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + functionTextHeight);
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
}

void TimedEvent::EditEvent(wxWindow* parent, Game & game, Scene & scene, MainEditorCommand & mainEditorCommand)
{
    TimedEventEditorDlg dialog(parent, *this, game, scene);
    dialog.ShowModal();
}

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

#endif
