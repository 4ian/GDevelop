/**

Game Develop - Function Extension
Copyright (c) 2008-2011 Florian Rival (Florian.Rival@gmail.com)

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
#include "FunctionEvent.h"
#include "GDL/RuntimeScene.h"
#include "GDL/CommonTools.h"
#include "GDL/EventsCodeGenerationContext.h"
#include "GDL/EventsCodeGenerator.h"
#include "GDL/EventsCodeNameMangler.h"
#include "GDL/XmlMacros.h"
#include "GDL/tinyxml.h"
#include "GDL/EventsRenderingHelper.h"
#include "GDL/EventsEditorItemsAreas.h"
#include "GDL/EventsEditorSelection.h"
#include "FunctionEventEditorDlg.h"
#include <wx/textdlg.h>

FunctionEvent::FunctionEvent() :
BaseEvent(),
name("MyFunction"),
useCallerContext(false)
,nameSelected(false)
{
}

//Functions need some additionals "tools"
const std::string FunctionEvent::globalDeclaration = "typedef void (*GDEventsFunctionsType)(RuntimeContext *, std::map <std::string, std::vector<Object*> *> &, std::vector <std::string> &);\n"
                                                     "std::map <std::string, GDEventsFunctionsType> * functionEventsMap;\n"
                                                     "std::vector<std::string> * currentFunctionParameters;\n";

std::string FunctionEvent::GenerateEventCode(const Game & game, const Scene & scene, EventsCodeGenerationContext & callerContext)
{
    //Declaring the maps containing pointers to functions. We can't use a global object directly ( The execution engine does not initialize static/global objects ), so we use a pointer.
    callerContext.AddGlobalDeclaration(globalDeclaration);

    //Declaring function prototype.
    callerContext.AddGlobalDeclaration("void GDEventsGeneratedFunction"+name+ToString(this)+"(RuntimeContext *, std::map <std::string, std::vector<Object*> *> & , std::vector <std::string> &);\n");

    //We take care of initializing ourselves the map and the pointer to current function parameters
    callerContext.AddCustomCodeInMain("if ( functionEventsMap == NULL ) functionEventsMap = new std::map <std::string, GDEventsFunctionsType>;\ncurrentFunctionParameters = NULL;");

    //Registering the function.
    callerContext.AddCustomCodeInMain("(*functionEventsMap)[\""+name+"\"] = GDEventsGeneratedFunction"+name+ToString(this)+";");

    //Generating function code :
    std::string functionCode;
    EventsCodeGenerationContext context;
    context.includeFiles = callerContext.includeFiles;


    //Function declaration
    if ( useCallerContext )
    {
        context.NeedObjectListsDynamicDeclaration();
        functionCode += "\nvoid GDEventsGeneratedFunction"+name+ToString(this)+"(RuntimeContext * runtimeContext, std::map <std::string, std::vector<Object*> *> & objectsListsMap, std::vector <std::string> & objectsAlreadyDeclared)\n{\n";
    }
    else
        functionCode += "\nvoid GDEventsGeneratedFunction"+name+ToString(this)+"(RuntimeContext * runtimeContext, std::map <std::string, std::vector<Object*> *> & , std::vector <std::string> &)\n{\n";

    //Generating function body code
    std::string conditionsCode = EventsCodeGenerator::GenerateConditionsListCode(game, scene, conditions, context);
    std::string actionsCode = EventsCodeGenerator::GenerateActionsListCode(game, scene, actions, context);
    std::string subeventsCode = EventsCodeGenerator::GenerateEventsListCode(game, scene, events, context);

    //Object declaration :
    if ( useCallerContext ) //Using functions parameters to initalize objects list if we use caller context
    {
        for (unsigned int i = 0;i<game.globalObjects.size();++i)
        {
            functionCode += "std::vector<Object*> "+ManObjListName(game.globalObjects[i]->GetName()) + ";\n";
            functionCode += "if ( objectsListsMap[\""+game.globalObjects[i]->GetName()+"\"] != NULL ) "+ManObjListName(game.globalObjects[i]->GetName())+" = *objectsListsMap[\""+game.globalObjects[i]->GetName()+"\"];\n";
            functionCode += "objectsListsMap[\""+game.globalObjects[i]->GetName()+"\"] = &"+ManObjListName(game.globalObjects[i]->GetName())+";\n";
        }
        for (unsigned int i = 0;i<scene.initialObjects.size();++i)
        {
            functionCode += "std::vector<Object*> "+ManObjListName(scene.initialObjects[i]->GetName()) + ";\n";
            functionCode += "if ( objectsListsMap[\""+scene.initialObjects[i]->GetName()+"\"] != NULL ) "+ManObjListName(scene.initialObjects[i]->GetName())+" = *objectsListsMap[\""+scene.initialObjects[i]->GetName()+"\"];\n";
            functionCode += "objectsListsMap[\""+scene.initialObjects[i]->GetName()+"\"] = &"+ManObjListName(scene.initialObjects[i]->GetName())+";\n";
        }
    }
    else //Or make standard declaration if we do not use the caller context
        functionCode += context.GenerateObjectsDeclarationCode();

    std::string ifPredicat = "true";
    for (unsigned int i = 0;i<conditions.size();++i)
        ifPredicat += " && condition"+ToString(i)+"IsTrue";

    functionCode += conditionsCode;
    functionCode += "if (" +ifPredicat+ ")\n";
    functionCode += "{\n";
    functionCode += actionsCode;
    if ( !events.empty() ) //Sub events
    {
        functionCode += "\n{\n";
        functionCode += subeventsCode;
        functionCode += "}\n";
    }
    functionCode += "}\n";


    functionCode += "}\n";
    callerContext.AddCustomCodeOutsideMain(functionCode);

    return "";
}

vector < vector<Instruction>* > FunctionEvent::GetAllConditionsVectors()
{
    vector < vector<Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < vector<Instruction>* > FunctionEvent::GetAllActionsVectors()
{
    vector < vector<Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

void FunctionEvent::SaveToXml(TiXmlElement * elem) const
{
    TiXmlElement * objectElem = new TiXmlElement( "Name" );
    elem->LinkEndChild( objectElem );
    objectElem->SetAttribute("value", name.c_str());

    //Les conditions
    TiXmlElement * conditionsElem = new TiXmlElement( "Conditions" );
    elem->LinkEndChild( conditionsElem );
    OpenSaveGame::SaveConditions(conditions, conditionsElem);

    //Les actions
    TiXmlElement * actionsElem = new TiXmlElement( "Actions" );
    elem->LinkEndChild( actionsElem );
    OpenSaveGame::SaveActions(actions, actionsElem);

    //Sous évènements
    if ( !GetSubEvents().empty() )
    {
        TiXmlElement * subeventsElem;
        subeventsElem = new TiXmlElement( "Events" );
        elem->LinkEndChild( subeventsElem );

        OpenSaveGame::SaveEvents(events, subeventsElem);
    }

    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("useCallerContext", useCallerContext);
}

void FunctionEvent::LoadFromXml(const TiXmlElement * elem)
{
    if ( elem->FirstChildElement( "Name" ) != NULL )
        name = elem->FirstChildElement("Name")->Attribute("value");

    //Conditions
    if ( elem->FirstChildElement( "Conditions" ) != NULL )
        OpenSaveGame::OpenConditions(conditions, elem->FirstChildElement( "Conditions" ));
    else
        cout << "Aucune informations sur les conditions d'un évènement";

    //Actions
    if ( elem->FirstChildElement( "Actions" ) != NULL )
        OpenSaveGame::OpenActions(actions, elem->FirstChildElement( "Actions" ));
    else
        cout << "Aucune informations sur les actions d'un évènement";

    //Subevents
    if ( elem->FirstChildElement( "Events" ) != NULL )
        OpenSaveGame::OpenEvents(events, elem->FirstChildElement( "Events" ));

    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("useCallerContext", useCallerContext);
    if ( elem->FirstChildElement( "useCallerContext" ) == NULL ) useCallerContext = true;
}


/**
 * Unregister function when object is destroyed
 */
FunctionEvent::~FunctionEvent()
{
}

/**
 * Render the event in the bitmap
 */
void FunctionEvent::Render(wxDC & dc, int x, int y, unsigned int width, EventsEditorItemsAreas & areas, EventsEditorSelection & selection)
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
    dc.DrawText( _("Fonction") + " " + name, x + 4, y + 3 );

    //Draw conditions rectangle
    wxRect rect(x, y+functionTextHeight, renderingHelper->GetConditionsColumnWidth()+border, GetRenderedHeight(width)-functionTextHeight);
    renderingHelper->DrawNiceRectangle(dc, rect);

    //Draw actions and conditions
    renderingHelper->DrawConditionsList(conditions, dc,
                                        x+border,
                                        y+functionTextHeight+border,
                                        renderingHelper->GetConditionsColumnWidth()-border, this, areas, selection);
    renderingHelper->DrawActionsList(actions, dc,
                                     x+renderingHelper->GetConditionsColumnWidth()+border,
                                     y+functionTextHeight+border,
                                     width-renderingHelper->GetConditionsColumnWidth()-border*2, this, areas, selection);
}

unsigned int FunctionEvent::GetRenderedHeight(unsigned int width) const
{
    if ( eventHeightNeedUpdate )
    {
        EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();
        int border = renderingHelper->instructionsListBorder;
        const int functionTextHeight = 20;

        //Get maximum height needed
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth()-border*2);
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth()-border*2);

        renderedHeight = (( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + functionTextHeight)+border*2;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
}

void FunctionEvent::EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_)
{
    FunctionEventEditorDlg dialog(parent_, *this, game_, scene_);
    dialog.ShowModal();
}

/**
 * Initialize from another FunctionEvent.
 * Used by copy ctor and assignement operator
 */
void FunctionEvent::Init(const FunctionEvent & event)
{
    events = CloneVectorOfEvents(event.events);
    useCallerContext = event.useCallerContext;
    name = event.name;
    conditions = event.conditions;
    actions = event.actions;
}

/**
 * Custom copy operator
 */
FunctionEvent::FunctionEvent(const FunctionEvent & event) :
BaseEvent(event)
{
    Init(event);
}

/**
 * Custom assignement operator
 */
FunctionEvent& FunctionEvent::operator=(const FunctionEvent & event)
{
    if ( this != &event )
    {
        BaseEvent::operator=(event);
        Init(event);
    }

    return *this;
}

#endif
