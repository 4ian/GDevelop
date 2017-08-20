/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)
#include "WhileEvent.h"
#if !defined(GD_NO_WX_GUI)
#include <wx/msgdlg.h>
#include "GDCore/IDE/wxTools/CommonBitmapProvider.h"
#endif
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionsCodeGeneration.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorItemsAreas.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorSelection.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"

using namespace std;

namespace gd
{

vector < gd::InstructionsList* > WhileEvent::GetAllConditionsVectors()
{
    vector < gd::InstructionsList* > allConditions;
    allConditions.push_back(&whileConditions);
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < gd::InstructionsList* > WhileEvent::GetAllActionsVectors()
{
    vector < gd::InstructionsList* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

vector < const gd::InstructionsList* > WhileEvent::GetAllConditionsVectors() const
{
    vector < const gd::InstructionsList* > allConditions;
    allConditions.push_back(&whileConditions);
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < const gd::InstructionsList* > WhileEvent::GetAllActionsVectors() const
{
    vector < const gd::InstructionsList* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

void WhileEvent::SerializeTo(SerializerElement & element) const
{
    element.SetAttribute("infiniteLoopWarning", infiniteLoopWarning);
    gd::EventsListSerialization::SerializeInstructionsTo(whileConditions, element.AddChild("whileConditions"));
    gd::EventsListSerialization::SerializeInstructionsTo(conditions, element.AddChild("conditions"));
    gd::EventsListSerialization::SerializeInstructionsTo(actions, element.AddChild("actions"));
    gd::EventsListSerialization::SerializeEventsTo(events, element.AddChild("events"));
}

void WhileEvent::UnserializeFrom(gd::Project & project, const SerializerElement & element)
{
    justCreatedByTheUser = false;
    infiniteLoopWarning = element.GetBoolAttribute("infiniteLoopWarning");
    gd::EventsListSerialization::UnserializeInstructionsFrom(project, whileConditions, element.GetChild("whileConditions", 0, "WhileConditions"));
    gd::EventsListSerialization::UnserializeInstructionsFrom(project, conditions, element.GetChild("conditions", 0, "Conditions"));
    gd::EventsListSerialization::UnserializeInstructionsFrom(project, actions, element.GetChild("actions", 0, "Actions"));
    gd::EventsListSerialization::UnserializeEventsFrom(project, events, element.GetChild("events", 0, "Events"));
}

/**
 * Render the event in the bitmap
 */
void WhileEvent::Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform)
{
#if !defined(GD_NO_WX_GUI)
    gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
    int border = renderingHelper->instructionsListBorder;
    const int repeatHeight = 20;

    //Draw header rectangle
    int whileConditionsHeight = renderingHelper->GetRenderedConditionsListHeight(whileConditions, width-80-border*2, platform)+border*2;
    if (!infiniteLoopWarning && whileConditionsHeight < 32 ) whileConditionsHeight = 32;
    wxRect headerRect(x, y, width, whileConditionsHeight+repeatHeight);
    renderingHelper->DrawNiceRectangle(dc, headerRect);

    //While text
    dc.SetFont( renderingHelper->GetNiceFont().Bold()  );
    if ( !IsDisabled() )
        dc.SetTextForeground( wxColour( 0, 0, 0 ) );
    else
        dc.SetTextForeground( wxColour( 160, 160, 160 ) );
    dc.DrawText( _("While :"), x+5, y+5 );

    //Draw icon if infinite loop warning is deactivated.
    if (!infiniteLoopWarning)
    {
        if ( gd::CommonBitmapProvider::Get()->noProtection.IsOk() )
            dc.DrawBitmap(gd::CommonBitmapProvider::Get()->noProtection, wxPoint(x+5,y+5+18), /*useMask=*/true);
    }

    //Draw "while conditions"
    renderingHelper->DrawConditionsList(whileConditions, dc, x+80+border, y+border, width-80-border*2, this, areas, selection, platform);

    dc.SetFont( renderingHelper->GetNiceFont().Bold()  );
    if ( !IsDisabled() )
        dc.SetTextForeground( wxColour( 0, 0, 0 ) );
    else
        dc.SetTextForeground( wxColour( 160, 160, 160 ) );
    dc.DrawText( _("Repeat :"), x+4, y+whileConditionsHeight+3);
    whileConditionsHeight += repeatHeight;

    //Draw conditions rectangle
    wxRect rect(x, y+whileConditionsHeight, renderingHelper->GetConditionsColumnWidth()+border, GetRenderedHeight(width, platform)-whileConditionsHeight);
    renderingHelper->DrawNiceRectangle(dc, rect);

    renderingHelper->DrawConditionsList(conditions, dc,
                                        x+border,
                                        y+whileConditionsHeight+border,
                                        renderingHelper->GetConditionsColumnWidth()-border, this, areas, selection, platform);
    renderingHelper->DrawActionsList(actions, dc,
                                     x+renderingHelper->GetConditionsColumnWidth()+border,
                                     y+whileConditionsHeight+border,
                                     width-renderingHelper->GetConditionsColumnWidth()-border*2, this, areas, selection, platform);
#endif
}

unsigned int WhileEvent::GetRenderedHeight(unsigned int width, const gd::Platform & platform) const
{
#if !defined(GD_NO_WX_GUI)
    if ( eventHeightNeedUpdate )
    {
        gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
        int border = renderingHelper->instructionsListBorder;
        const int repeatHeight = 20;

        //Get maximum height needed
        int whileConditionsHeight = renderingHelper->GetRenderedConditionsListHeight(whileConditions, width-80-border*2, platform);
        if (!infiniteLoopWarning && whileConditionsHeight < 32 ) whileConditionsHeight = 32;
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth()-border, platform);
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth()-border*2, platform);

        renderedHeight = (( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + whileConditionsHeight + repeatHeight)+border*2+border*2;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
#else
    return 0;
#endif
}

gd::BaseEvent::EditEventReturnType WhileEvent::EditEvent(wxWindow* parent_, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_)
{
#if !defined(GD_NO_WX_GUI)
    if ( !justCreatedByTheUser )
    {
        wxMessageDialog dialog(parent_, _("Do you want to activate the display of a message if the event is repeated 100000 times? This message prevent the software from being frozen if you accidentally create an infinite loop ( by letting the conditions empty for example )."),
                               _("Protection against infinite loops."),
                               wxYES_NO|wxCANCEL|wxICON_INFORMATION);

        dialog.SetExtendedMessage(_("This message is activated by default for \"While\" events in the IDE, and is deactivated when the game is compiled to an executable."));
        dialog.SetYesNoCancelLabels(_("Activate"), _("Deactivate"), _("Cancel"));

        int answer = dialog.ShowModal();
        if ( answer == wxID_YES ) infiniteLoopWarning = true;
        else if ( answer == wxID_NO ) infiniteLoopWarning = false;
    }
    justCreatedByTheUser = false; //Show Message dialog next time.
#endif

    return ChangesMade;
}

}
#endif
