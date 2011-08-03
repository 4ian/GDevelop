/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ForEachEvent.h"
#include "GDL/RuntimeScene.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/tinyxml.h"
#include "GDL/EventsCodeGenerator.h"
#include "GDL/ExpressionsCodeGeneration.h"
#include "GDL/EventsCodeGenerationContext.h"
#include <iostream>

#if defined(GD_IDE_ONLY)
#include "GDL/EventsRenderingHelper.h"
#include "GDL/EditForEachEvent.h"
#endif

ForEachEvent::ForEachEvent() :
BaseEvent(),
objectsToPick("")
#if defined(GD_IDE_ONLY)
,objectsToPickSelected(false)
#endif
{
}

std::string ForEachEvent::GenerateEventCode(const Game & game, const Scene & scene, EventsCodeGenerationContext & parentContext)
{
    std::string outputCode;

    vector< ObjectGroup >::const_iterator globalGroup = find_if(game.objectGroups.begin(), game.objectGroups.end(), bind2nd(HasTheSameName(), objectsToPick.GetPlainString()));
    vector< ObjectGroup >::const_iterator sceneGroup = find_if(scene.objectGroups.begin(), scene.objectGroups.end(), bind2nd(HasTheSameName(), objectsToPick.GetPlainString()));

    std::vector<std::string> realObjects; //With groups, we may have to generate condition for more than one object list.
    if ( globalGroup != game.objectGroups.end() )
        realObjects = (*globalGroup).GetAllObjectsNames();
    else if ( sceneGroup != scene.objectGroups.end() )
        realObjects = (*sceneGroup).GetAllObjectsNames();
    else
        realObjects.push_back(objectsToPick.GetPlainString());

    for (unsigned int i = 0;i<realObjects.size();++i)
        parentContext.ObjectNeeded(realObjects[i]);

    //Context is "reset" each time the event is repeated ( i.e. objects are picked again )
    EventsCodeGenerationContext context;
    context.InheritsFrom(parentContext);

    //Prepare conditions/actions codes
    std::string conditionsCode = EventsCodeGenerator::GenerateConditionsListCode(game, scene, conditions, context);
    std::string actionsCode = EventsCodeGenerator::GenerateActionsListCode(game, scene, actions, context);
    std::string ifPredicat = "true"; for (unsigned int i = 0;i<conditions.size();++i) ifPredicat += " && condition"+ToString(i)+"IsTrue";

    //Prepare object declaration and sub events
    std::string subevents = EventsCodeGenerator::GenerateEventsListCode(game, scene, events, context);

    for (unsigned int i = 0;i<realObjects.size();++i)
        context.ObjectNotNeeded(realObjects[i]); //We take care of declaring this object

    std::string objectDeclaration = context.GenerateObjectsDeclarationCode()+"\n";

    for (unsigned int i = 0;i<realObjects.size();++i)
    {
        //Write final code
        outputCode += "for(unsigned int forEachIndex = 0;forEachIndex < "+realObjects[i]+"objects.size();++forEachIndex)\n";
        outputCode += "{\n";

        //Declare all lists of concerned objects empty
        for (unsigned int j = 0;j<realObjects.size();++j)
        {
            if ( j != i ) outputCode += "std::vector<Object*> "+realObjects[j]+"objects;\n";
        }

        //Pick only one object
        outputCode += "std::vector<Object*> temporaryForEachList; temporaryForEachList.push_back("+realObjects[i]+"objects[forEachIndex]);";
        outputCode += "std::vector<Object*> "+realObjects[i]+"objects = temporaryForEachList;\n";
        outputCode += objectDeclaration;
        if ( context.MapOfAllObjectsIsNeeded() ) outputCode += "objectsListsMap[\""+realObjects[i]+"\"] = &"+realObjects[i]+"objects;\n";

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
    }

    return outputCode;
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
#if defined(GD_IDE_ONLY)
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
#endif

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


#if defined(GD_IDE_ONLY)
void ForEachEvent::OnSingleClick(int x, int y, vector < boost::tuple< vector < BaseEventSPtr > *, unsigned int, vector < Instruction > *, unsigned int > > & eventsSelected,
                         bool & conditionsSelected, bool & instructionsSelected)
{
    const int forEachTextHeight = 20;
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();

    //Test selection for the "For Each object..."
    if ( y >= 0 && y <= forEachTextHeight )
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
void ForEachEvent::Render(wxDC & dc, int x, int y, unsigned int width) const
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();
    const int forEachTextHeight = 20;

    //Draw event rectangle
    wxRect rect(x, y, width, GetRenderedHeight(width));
    renderingHelper->DrawNiceRectangle(dc, rect);

    //"For Each" text selection
    if ( selected && objectsToPickSelected )
    {
        dc.SetBrush(renderingHelper->GetSelectedRectangleFillBrush());
        dc.SetPen(renderingHelper->GetSelectedRectangleOutlinePen());
        dc.DrawRectangle(x+1, y+1, width-2, forEachTextHeight-2);
    }

    //For Each text
    dc.SetFont( renderingHelper->GetBoldFont() );
    dc.DrawText( _("Pour chaque objet") + " " + objectsToPick.GetPlainString() + _(", répéter :"), x + 2, y + 1 );

    //Draw actions and conditions
    renderingHelper->DrawConditionsList(conditions, dc, x, y+forEachTextHeight, renderingHelper->GetConditionsColumnWidth(), IsDisabled());
    renderingHelper->DrawActionsList(actions, dc, x+renderingHelper->GetConditionsColumnWidth(), y+forEachTextHeight, width-renderingHelper->GetConditionsColumnWidth(), IsDisabled());
}

unsigned int ForEachEvent::GetRenderedHeight(unsigned int width) const
{
    if ( eventHeightNeedUpdate )
    {
        EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();
        const int forEachTextHeight = 20;

        //Get maximum height needed
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth());
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth());

        renderedHeight = (( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + forEachTextHeight);
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
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
    events = CloneVectorOfEvents(event.events);

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
