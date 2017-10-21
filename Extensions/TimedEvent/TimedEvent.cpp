/**

GDevelop - Timed Event Extension
Copyright (c) 2011-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.

*/
#if defined(GD_IDE_ONLY)

#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "TimedEvent.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/TinyXml/tinyxml.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/ExpressionsCodeGeneration.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorItemsAreas.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorSelection.h"
#include "GDCore/Tools/Localization.h"
#include "TimedEventEditorDlg.h"

using namespace std;

std::vector< TimedEvent* > TimedEvent::codeGenerationCurrentParents;

TimedEvent::TimedEvent() :
BaseEvent()
{
}

TimedEvent::~TimedEvent()
{
}

vector < gd::InstructionsList* > TimedEvent::GetAllConditionsVectors()
{
    vector < gd::InstructionsList* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < gd::InstructionsList* > TimedEvent::GetAllActionsVectors()
{
    vector < gd::InstructionsList* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

vector < gd::Expression* > TimedEvent::GetAllExpressions()
{
    vector < gd::Expression* > allExpressions;
    allExpressions.push_back(&timeout);

    return allExpressions;
}

vector < const gd::InstructionsList* > TimedEvent::GetAllConditionsVectors() const
{
    vector < const gd::InstructionsList* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < const gd::InstructionsList* > TimedEvent::GetAllActionsVectors() const
{
    vector < const gd::InstructionsList* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

vector < const gd::Expression* > TimedEvent::GetAllExpressions() const
{
    vector < const gd::Expression* > allExpressions;
    allExpressions.push_back(&timeout);

    return allExpressions;
}

void TimedEvent::SerializeTo(gd::SerializerElement & element) const
{
    element.AddChild("name").SetValue(name);
    element.AddChild("timeout").SetValue(timeout.GetPlainString());
    gd::EventsListSerialization::SerializeInstructionsTo(conditions, element.AddChild("conditions"));
    gd::EventsListSerialization::SerializeInstructionsTo(actions, element.AddChild("actions"));
    gd::EventsListSerialization::SerializeEventsTo(events, element.AddChild("events"));
}

void TimedEvent::UnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    name = element.GetChild("name", 0, "Name").GetValue().GetString();
    timeout = element.GetChild("timeout", 0, "Timeout").GetValue().GetString();
    gd::EventsListSerialization::UnserializeInstructionsFrom(project, conditions, element.GetChild("conditions", 0, "Conditions"));
    gd::EventsListSerialization::UnserializeInstructionsFrom(project, actions, element.GetChild("actions", 0, "Actions"));
    gd::EventsListSerialization::UnserializeEventsFrom(project, events, element.GetChild("events", 0, "Events"));
}

/**
 * Render the event in the bitmap
 */
void TimedEvent::Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform)
{
#if !defined(GD_NO_WX_GUI)
    gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
    int border = renderingHelper->instructionsListBorder;
    const int functionTextHeight = 20;

    //Draw header rectangle
    wxRect headerRect(x, y, width, functionTextHeight);
    renderingHelper->DrawNiceRectangle(dc, headerRect);

    //Name
    dc.SetFont( renderingHelper->GetNiceFont().Bold()  );
    dc.SetTextForeground(wxColour(0,0,0));
    gd::String nameTxt;
    if ( !name.empty() ) nameTxt = _(" (Name: ")+name + ")";
    dc.DrawText( _("Delayed execution after ")+timeout.GetPlainString()+_(" seconds.")+" "+nameTxt, x + 4, y + 3 );

    //Draw conditions rectangle
    wxRect rect(x, y+functionTextHeight, renderingHelper->GetConditionsColumnWidth()+border, GetRenderedHeight(width, platform)-functionTextHeight);
    renderingHelper->DrawNiceRectangle(dc, rect);

    //Draw actions and conditions
    renderingHelper->DrawConditionsList(conditions, dc,
                                        x+border,
                                        y+functionTextHeight+border,
                                        renderingHelper->GetConditionsColumnWidth()-border, this, areas, selection, platform);
    renderingHelper->DrawActionsList(actions, dc,
                                     x+renderingHelper->GetConditionsColumnWidth()+border,
                                     y+functionTextHeight+border,
                                     width-renderingHelper->GetConditionsColumnWidth()-border*2, this, areas, selection, platform);
#endif
}

unsigned int TimedEvent::GetRenderedHeight(unsigned int width, const gd::Platform & platform) const
{
#if !defined(GD_NO_WX_GUI)
    if ( eventHeightNeedUpdate )
    {
        gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
        int border = renderingHelper->instructionsListBorder;
        const int functionTextHeight = 20;

        //Get maximum height needed
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth()-border*2, platform);
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth()-border*2, platform);

        renderedHeight = (( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + functionTextHeight)+border*2;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
#else
    return 0;
#endif
}

gd::BaseEvent::EditEventReturnType TimedEvent::EditEvent(wxWindow* parent, gd::Project & game, gd::Layout & scene, gd::MainFrameWrapper & mainFrameWrapper)
{
#if !defined(GD_NO_WX_GUI)
    TimedEventEditorDlg dialog(parent, *this, game, scene);
    if ( dialog.ShowModal() == 0 ) return Cancelled;
#endif

    return ChangesMade;
}

#endif
