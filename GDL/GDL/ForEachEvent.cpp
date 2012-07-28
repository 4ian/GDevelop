/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "ForEachEvent.h"
#include <iostream>
#include "GDL/RuntimeScene.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDCore/IDE/EventsRenderingHelper.h"
#include "GDCore/IDE/EventsEditorItemsAreas.h"
#include "GDCore/IDE/EventsEditorSelection.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Events/EventsCodeGenerator.h"
#include "GDL/Events/ExpressionsCodeGeneration.h"
#include "GDL/Events/EventsCodeNameMangler.h"
#include "GDL/Events/EventsCodeGenerationContext.h"
#include "GDL/IDE/Dialogs/EditForEachEvent.h"

ForEachEvent::ForEachEvent() :
BaseEvent(),
objectsToPick(""),
objectsToPickSelected(false)
{
}

std::string ForEachEvent::GenerateEventCode(Game & game, Scene & scene, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & parentContext)
{
    std::string outputCode;

    vector< gd::ObjectGroup >::const_iterator globalGroup = find_if(game.GetObjectGroups().begin(), game.GetObjectGroups().end(), bind2nd(gd::GroupHasTheSameName(), objectsToPick.GetPlainString()));
    vector< gd::ObjectGroup >::const_iterator sceneGroup = find_if(scene.GetObjectGroups().begin(), scene.GetObjectGroups().end(), bind2nd(gd::GroupHasTheSameName(), objectsToPick.GetPlainString()));

    std::vector<std::string> realObjects; //With groups, we may have to generate condition for more than one object list.
    if ( globalGroup != game.GetObjectGroups().end() )
        realObjects = (*globalGroup).GetAllObjectsNames();
    else if ( sceneGroup != scene.GetObjectGroups().end() )
        realObjects = (*sceneGroup).GetAllObjectsNames();
    else
        realObjects.push_back(objectsToPick.GetPlainString());

    if ( realObjects.empty() ) return "";

    for (unsigned int i = 0;i<realObjects.size();++i)
        parentContext.ObjectsListNeeded(realObjects[i]);

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

    if ( realObjects.size() != 1) //(We write a slighty more simple ( and optimized ) output code when only one object list is used.)
    {
        outputCode += "unsigned int forEachTotalCount = 0;";
        outputCode += "std::vector<Object*> forEachObjects;";
        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            outputCode += "unsigned int forEachCount"+ToString(i)+" = "+ManObjListName(realObjects[i])+".size(); forEachTotalCount += forEachCount"+ToString(i)+";";
            outputCode += "forEachObjects.insert("+ string(i == 0 ? "forEachObjects.begin()" : "forEachObjects.end()") +", "+ManObjListName(realObjects[i])+".begin(), "+ManObjListName(realObjects[i])+".end());";
        }
    }

    //Write final code :

    //For loop declaration
    if ( realObjects.size() == 1 ) //We write a slighty more simple ( and optimized ) output code when only one object list is used.
        outputCode += "for(unsigned int forEachIndex = 0;forEachIndex < "+ManObjListName(realObjects[0])+".size();++forEachIndex)\n";
    else
        outputCode += "for(unsigned int forEachIndex = 0;forEachIndex < forEachTotalCount;++forEachIndex)\n";

    outputCode += "{\n";

    //Clear all concerned objects lists and keep only one object
    if ( realObjects.size() == 1 )
    {
        outputCode += "std::vector<Object*> temporaryForEachList; temporaryForEachList.push_back("+ManObjListName(realObjects[0])+"[forEachIndex]);";
        outputCode += "std::vector<Object*> "+ManObjListName(realObjects[0])+" = temporaryForEachList;\n";
    }
    else
    {
        //Declare all lists of concerned objects empty
        for (unsigned int j = 0;j<realObjects.size();++j)
            outputCode += "std::vector<Object*> "+ManObjListName(realObjects[j])+";\n";

        for (unsigned int i = 0;i<realObjects.size();++i) //Pick then only one object
        {
            std::string count;
            for (unsigned int j = 0;j<=i;++j)
            {
                if (j!=0) count+= "+";
                count += "forEachCount"+ToString(j);
            }

            if ( i != 0 ) outputCode += "else ";
            outputCode += "if (forEachIndex < "+count+") {\n";
            outputCode += "    "+ManObjListName(realObjects[i])+".push_back(forEachObjects[forEachIndex]);\n";
            outputCode += "}\n";
        }
    }

    outputCode += "{"; //This scope is used as the for loop modified the objects list.
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

    outputCode += "}";

    outputCode += "}\n"; //End of for loop

    return outputCode;
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
        objectsToPick = gd::Expression(eventElem->FirstChildElement("Object")->Attribute("value"));

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
void ForEachEvent::Render(wxDC & dc, int x, int y, unsigned int width, EventsEditorItemsAreas & areas, EventsEditorSelection & selection)
{
    gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::GetInstance();
    int border = renderingHelper->instructionsListBorder;
    const int forEachTextHeight = 20;

    //Draw header rectangle
    wxRect headerRect(x, y, width, forEachTextHeight);
    renderingHelper->DrawNiceRectangle(dc, headerRect);

    //For Each text
    dc.SetFont( renderingHelper->GetNiceFont().Bold()  );
    dc.SetTextForeground(wxColour(0,0,0));
    dc.DrawText( _("Pour chaque objet") + " " + objectsToPick.GetPlainString() + _(", répéter :"), x + 4, y + 3 );

    //Draw conditions rectangle
    wxRect rect(x, y+forEachTextHeight, renderingHelper->GetConditionsColumnWidth()+border, GetRenderedHeight(width)-forEachTextHeight);
    renderingHelper->DrawNiceRectangle(dc, rect);

    //Draw actions and conditions
    renderingHelper->DrawConditionsList(conditions, dc,
                                        x+border,
                                        y+forEachTextHeight+border,
                                        renderingHelper->GetConditionsColumnWidth()-border, this, areas, selection, *ExtensionsManager::GetInstance());
    renderingHelper->DrawActionsList(actions, dc,
                                     x+renderingHelper->GetConditionsColumnWidth()+border,
                                     y+forEachTextHeight+border,
                                     width-renderingHelper->GetConditionsColumnWidth()-border*2, this, areas, selection, *ExtensionsManager::GetInstance());
}

unsigned int ForEachEvent::GetRenderedHeight(unsigned int width) const
{
    if ( eventHeightNeedUpdate )
    {
        gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::GetInstance();
        int border = renderingHelper->instructionsListBorder;
        const int forEachTextHeight = 20;

        //Get maximum height needed
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth()-border, *ExtensionsManager::GetInstance());
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth()-border*2, *ExtensionsManager::GetInstance());

        renderedHeight = (( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + forEachTextHeight)+border*2;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
}

gd::BaseEvent::EditEventReturnType ForEachEvent::EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, gd::MainFrameWrapper & mainFrameWrapper_)
{
    EditForEachEvent dialog(parent_, *this, game_, scene_);
    if ( dialog.ShowModal() == 0 ) return Cancelled;

    return ChangesMade;
}

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

#endif
