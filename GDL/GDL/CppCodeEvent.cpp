/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "CppCodeEvent.h"
#include <iostream>
#include "GDL/RuntimeScene.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/Events/EventsCodeGenerator.h"
#include "GDL/Events/ExpressionsCodeGeneration.h"
#include "GDL/Events/EventsCodeNameMangler.h"
#include "GDL/Events/EventsCodeGenerationContext.h"
#include "GDL/IDE/EventsRenderingHelper.h"
#include "GDL/IDE/Dialogs/EditCppCodeEvent.h"
#include "GDL/IDE/EventsEditorItemsAreas.h"
#include "GDL/IDE/EventsEditorSelection.h"
#include "GDL/XmlMacros.h"

CppCodeEvent::CppCodeEvent() :
BaseEvent()
{
}

std::string CppCodeEvent::GenerateEventCode(const Game & game, const Scene & scene, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & parentContext)
{
    //codeGenerator.AddIncludeFile(includeFile);

    std::string outputCode;

    outputCode += ""+functionToCall+"\n";

    return outputCode;
}

void CppCodeEvent::SaveToXml(TiXmlElement * elem) const
{
    //GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("IncludeFile", includeFile);//TODO
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("FunctionToCall", functionToCall);
}

void CppCodeEvent::LoadFromXml(const TiXmlElement * elem)
{
    //GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("IncludeFile", includeFile);//TODO
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("FunctionToCall", functionToCall);
}


/**
 * Render the event in the bitmap
 */
void CppCodeEvent::Render(wxDC & dc, int x, int y, unsigned int width, EventsEditorItemsAreas & areas, EventsEditorSelection & selection)
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();
    int border = renderingHelper->instructionsListBorder;
    const int titleTextHeight = 20;

    //Draw header rectangle
    wxRect headerRect(x, y, width, titleTextHeight);
    renderingHelper->DrawNiceRectangle(dc, headerRect);

    //Header
    dc.SetFont( renderingHelper->GetNiceFont().Bold()  );
    dc.SetTextForeground(wxColour(0,0,0));
    dc.DrawText( _("Code C++ :"), x + 4, y + 3 );
}

unsigned int CppCodeEvent::GetRenderedHeight(unsigned int width) const
{
    if ( eventHeightNeedUpdate )
    {
        EventsRenderingHelper * renderingHelper = EventsRenderingHelper::GetInstance();
        int border = renderingHelper->instructionsListBorder;
        const int titleTextHeight = 20;

        //Get maximum height needed
        /*int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth()-border);
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth()-border*2);

        renderedHeight = (( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + titleTextHeight)+border*2;
        eventHeightNeedUpdate = false;*/
    }

    return 20;
}

void CppCodeEvent::EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_)
{
    EditCppCodeEvent dialog(parent_, *this, game_, scene_);
    dialog.ShowModal();
}

/**
 * Initialize from another CppCodeEvent.
 * Used by copy ctor and assignement operator
 */
void CppCodeEvent::Init(const CppCodeEvent & event)
{
    includeFiles = event.includeFiles;
    functionToCall = event.functionToCall;
    associatedGDManagedSourceFile = event.associatedGDManagedSourceFile;
}

/**
 * Custom copy operator
 */
CppCodeEvent::CppCodeEvent(const CppCodeEvent & event) :
BaseEvent(event)
{
    Init(event);
}

/**
 * Custom assignement operator
 */
CppCodeEvent& CppCodeEvent::operator=(const CppCodeEvent & event)
{
    if ( this != &event )
    {
        BaseEvent::operator=(event);
        Init(event);
    }

    return *this;
}

#endif
