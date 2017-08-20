/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "RepeatEvent.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorItemsAreas.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorSelection.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionsCodeGeneration.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/IDE/Dialogs/EditRepeatEvent.h"

using namespace std;

namespace gd
{

RepeatEvent::RepeatEvent() :
BaseEvent(),
repeatNumberExpression(""),
repeatNumberExpressionSelected(false)
{
}


vector < gd::InstructionsList* > RepeatEvent::GetAllConditionsVectors()
{
    vector < gd::InstructionsList* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < gd::InstructionsList* > RepeatEvent::GetAllActionsVectors()
{
    vector < gd::InstructionsList* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

vector < gd::Expression* > RepeatEvent::GetAllExpressions()
{
    vector < gd::Expression* > allExpressions;
    allExpressions.push_back(&repeatNumberExpression);

    return allExpressions;
}

vector < const gd::InstructionsList* > RepeatEvent::GetAllConditionsVectors() const
{
    vector < const gd::InstructionsList* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < const gd::InstructionsList* > RepeatEvent::GetAllActionsVectors() const
{
    vector < const gd::InstructionsList* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

vector < const gd::Expression* > RepeatEvent::GetAllExpressions() const
{
    vector < const gd::Expression* > allExpressions;
    allExpressions.push_back(&repeatNumberExpression);

    return allExpressions;
}

void RepeatEvent::SerializeTo(SerializerElement & element) const
{
    element.AddChild("repeatExpression").SetValue(repeatNumberExpression.GetPlainString());
    gd::EventsListSerialization::SerializeInstructionsTo(conditions, element.AddChild("conditions"));
    gd::EventsListSerialization::SerializeInstructionsTo(actions, element.AddChild("actions"));
    gd::EventsListSerialization::SerializeEventsTo(events, element.AddChild("events"));
}

void RepeatEvent::UnserializeFrom(gd::Project & project, const SerializerElement & element)
{
    repeatNumberExpression = gd::Expression(element.GetChild("repeatExpression", 0, "RepeatExpression").GetValue().GetString());
    gd::EventsListSerialization::UnserializeInstructionsFrom(project, conditions, element.GetChild("conditions", 0, "Conditions"));
    gd::EventsListSerialization::UnserializeInstructionsFrom(project, actions, element.GetChild("actions", 0, "Actions"));
    gd::EventsListSerialization::UnserializeEventsFrom(project, events, element.GetChild("events", 0, "Events"));
}

/**
 * Render the event in the bitmap
 */
void RepeatEvent::Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform)
{
#if !defined(GD_NO_WX_GUI)
    gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
    int border = renderingHelper->instructionsListBorder;
    const int repeatTextHeight = 20;

    //Draw header rectangle
    wxRect headerRect(x, y, width, repeatTextHeight);
    renderingHelper->DrawNiceRectangle(dc, headerRect);

    //Repeat text
    dc.SetFont( renderingHelper->GetNiceFont().Bold() );
    if ( !IsDisabled() )
        dc.SetTextForeground( wxColour( 0, 0, 0 ) );
    else
        dc.SetTextForeground( wxColour( 160, 160, 160 ) );
    dc.DrawText( _("Repeat") + " " + repeatNumberExpression.GetPlainString() + " " + _("times :"), x + 4, y + 3 );

    //Draw conditions rectangle
    wxRect rect(x, y+repeatTextHeight, renderingHelper->GetConditionsColumnWidth()+border, GetRenderedHeight(width, platform)-repeatTextHeight);
    renderingHelper->DrawNiceRectangle(dc, rect);

    //Draw actions and conditions
    renderingHelper->DrawConditionsList(conditions, dc,
                                        x+border,
                                        y+repeatTextHeight+border,
                                        renderingHelper->GetConditionsColumnWidth()-border, this, areas, selection, platform);
    renderingHelper->DrawActionsList(actions, dc,
                                     x+renderingHelper->GetConditionsColumnWidth()+border,
                                     y+repeatTextHeight+border,
                                     width-renderingHelper->GetConditionsColumnWidth()-border*2, this, areas, selection, platform);
#endif
}

unsigned int RepeatEvent::GetRenderedHeight(unsigned int width, const gd::Platform & platform) const
{
#if !defined(GD_NO_WX_GUI)
    if ( eventHeightNeedUpdate )
    {
        gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
        int border = renderingHelper->instructionsListBorder;
        const int repeatTextHeight = 20;

        //Get maximum height needed
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth()-border, platform);
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth()-border*2, platform);

        renderedHeight = ( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + repeatTextHeight + border*2;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
#else
    return 0;
#endif
}

gd::BaseEvent::EditEventReturnType RepeatEvent::EditEvent(wxWindow* parent_, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_)
{
#if !defined(GD_NO_WX_GUI)
    EditRepeatEvent dialog(parent_, *this, game_, scene_);
    if ( dialog.ShowModal() == 0 ) return Cancelled;
#endif

    return ChangesMade;
}

}
