/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "ForEachEvent.h"
#include <iostream>
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorItemsAreas.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorSelection.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionsCodeGeneration.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
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

vector < gd::InstructionsList* > ForEachEvent::GetAllConditionsVectors()
{
    vector < gd::InstructionsList* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < gd::InstructionsList* > ForEachEvent::GetAllActionsVectors()
{
    vector < gd::InstructionsList* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

vector < gd::Expression* > ForEachEvent::GetAllExpressions()
{
    vector < gd::Expression* > allExpressions;
    allExpressions.push_back(&objectsToPick);

    return allExpressions;
}
vector < const gd::InstructionsList* > ForEachEvent::GetAllConditionsVectors() const
{
    vector < const gd::InstructionsList* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < const gd::InstructionsList* > ForEachEvent::GetAllActionsVectors() const
{
    vector < const gd::InstructionsList* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

vector < const gd::Expression* > ForEachEvent::GetAllExpressions() const
{
    vector < const gd::Expression* > allExpressions;
    allExpressions.push_back(&objectsToPick);

    return allExpressions;
}

void ForEachEvent::SerializeTo(SerializerElement & element) const
{
    element.AddChild("object").SetValue(objectsToPick.GetPlainString());
    gd::EventsListSerialization::SerializeInstructionsTo(conditions, element.AddChild("conditions"));
    gd::EventsListSerialization::SerializeInstructionsTo(actions, element.AddChild("actions"));
    gd::EventsListSerialization::SerializeEventsTo(events, element.AddChild("events"));
}

void ForEachEvent::UnserializeFrom(gd::Project & project, const SerializerElement & element)
{
    objectsToPick = gd::Expression(element.GetChild("object", 0, "Object").GetValue().GetString());
    gd::EventsListSerialization::UnserializeInstructionsFrom(project, conditions, element.GetChild("conditions", 0, "Conditions"));
    gd::EventsListSerialization::UnserializeInstructionsFrom(project, actions, element.GetChild("actions", 0, "Actions"));
    gd::EventsListSerialization::UnserializeEventsFrom(project, events, element.GetChild("events", 0, "Events"));
}

/**
 * Render the event in the bitmap
 */
void ForEachEvent::Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform)
{
#if !defined(GD_NO_WX_GUI)
    gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
    int border = renderingHelper->instructionsListBorder;
    const int forEachTextHeight = 20;

    //Draw header rectangle
    wxRect headerRect(x, y, width, forEachTextHeight);
    renderingHelper->DrawNiceRectangle(dc, headerRect);

    //For Each text
    dc.SetFont( renderingHelper->GetNiceFont().Bold()  );
    if ( !IsDisabled() )
        dc.SetTextForeground( wxColour( 0, 0, 0 ) );
    else
        dc.SetTextForeground( wxColour( 160, 160, 160 ) );
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
        gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
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

}
