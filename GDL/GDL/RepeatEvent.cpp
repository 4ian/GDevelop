/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "RepeatEvent.h"
#include "GDCore/IDE/EventsEditorItemsAreas.h"
#include "GDCore/IDE/EventsEditorSelection.h"
#include "GDCore/IDE/EventsRenderingHelper.h"
#include "GDL/RuntimeScene.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/Events/EventsCodeGenerator.h"
#include "GDL/Events/ExpressionsCodeGeneration.h"
#include "GDL/Events/EventsCodeGenerationContext.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/IDE/Dialogs/EditRepeatEvent.h"

RepeatEvent::RepeatEvent() :
BaseEvent(),
repeatNumberExpression(""),
repeatNumberExpressionSelected(false)
{
}

std::string RepeatEvent::GenerateEventCode(Game & game, Scene & scene, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & parentContext)
{
    std::string outputCode;

    //Prepare expression containing how many times event must be repeated
    std::string repeatCountCode;
    CallbacksForGeneratingExpressionCode callbacks(repeatCountCode, game, scene, codeGenerator, parentContext);
    gd::ExpressionParser parser(repeatNumberExpression.GetPlainString());
    if (!parser.ParseMathExpression(game, scene, callbacks) || repeatCountCode.empty()) repeatCountCode = "0";

    //Context is "reset" each time the event is repeated ( i.e. objects are picked again )
    EventsCodeGenerationContext context;
    context.InheritsFrom(parentContext);

    //Prepare conditions/actions codes
    std::string conditionsCode = codeGenerator.GenerateConditionsListCode(game, scene, conditions, context);
    std::string actionsCode = codeGenerator.GenerateActionsListCode(game, scene, actions, context);
    std::string ifPredicat = "true"; for (unsigned int i = 0;i<conditions.size();++i) ifPredicat += " && condition"+ToString(i)+"IsTrue";

    //Prepare object declaration and sub events
    std::string subevents = codeGenerator.GenerateEventsListCode(game, scene, events, context);
    std::string objectDeclaration = context.GenerateObjectsDeclarationCode()+"\n";

    //Write final code
    outputCode += "int repeatCount = "+repeatCountCode+";\n";
    outputCode += "for(unsigned int repeatIndex = 0;repeatIndex < repeatCount;++repeatIndex)\n";
    outputCode += "{\n";
    outputCode += objectDeclaration;
    outputCode += conditionsCode;
    outputCode += "if (" +ifPredicat+ ")\n";
    outputCode += "{\n";
    outputCode += actionsCode;
    if (!events.empty())
    {
        outputCode += "\n{ //Subevents: \n";
        outputCode += subevents;
        outputCode += "} //Subevents end.\n";
    }
    outputCode += "}\n";

    outputCode += "}\n";

    return outputCode;
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
        repeatNumberExpression = gd::Expression(eventElem->FirstChildElement("RepeatExpression")->Attribute("value"));

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
void RepeatEvent::Render(wxDC & dc, int x, int y, unsigned int width, EventsEditorItemsAreas & areas, EventsEditorSelection & selection)
{
    gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::GetInstance();
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
    wxRect rect(x, y+repeatTextHeight, renderingHelper->GetConditionsColumnWidth()+border, GetRenderedHeight(width)-repeatTextHeight);
    renderingHelper->DrawNiceRectangle(dc, rect);

    //Draw actions and conditions
    renderingHelper->DrawConditionsList(conditions, dc,
                                        x+border,
                                        y+repeatTextHeight+border,
                                        renderingHelper->GetConditionsColumnWidth()-border, this, areas, selection, *ExtensionsManager::GetInstance());
    renderingHelper->DrawActionsList(actions, dc,
                                     x+renderingHelper->GetConditionsColumnWidth()+border,
                                     y+repeatTextHeight+border,
                                     width-renderingHelper->GetConditionsColumnWidth()-border*2, this, areas, selection, *ExtensionsManager::GetInstance());
}

unsigned int RepeatEvent::GetRenderedHeight(unsigned int width) const
{
    if ( eventHeightNeedUpdate )
    {
        gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::GetInstance();
        int border = renderingHelper->instructionsListBorder;
        const int repeatTextHeight = 20;

        //Get maximum height needed
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth()-border, *ExtensionsManager::GetInstance());
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth()-border*2, *ExtensionsManager::GetInstance());

        renderedHeight = ( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + repeatTextHeight + border*2;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
}

gd::BaseEvent::EditEventReturnType RepeatEvent::EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, gd::MainFrameWrapper & mainFrameWrapper_)
{
    EditRepeatEvent dialog(parent_, *this, game_, scene_);
    if ( dialog.ShowModal() == 0 ) return Cancelled;

    return ChangesMade;
}

/**
 * Initialize from another RepeatEvent.
 * Used by copy ctor and assignement operator
 */
void RepeatEvent::Init(const RepeatEvent & event)
{
    events = CloneVectorOfEvents(event.events);

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

#endif

