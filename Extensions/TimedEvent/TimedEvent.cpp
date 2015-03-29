/**

GDevelop - Timed Event Extension
Copyright (c) 2011-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.

*/
#if defined(GD_IDE_ONLY)

#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "TimedEvent.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/tinyxml/tinyxml.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/IDE/EventsRenderingHelper.h"
#include "GDCore/IDE/EventsEditorItemsAreas.h"
#include "GDCore/IDE/EventsEditorSelection.h"
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

vector < vector<gd::Instruction>* > TimedEvent::GetAllConditionsVectors()
{
    vector < vector<gd::Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < vector<gd::Instruction>* > TimedEvent::GetAllActionsVectors()
{
    vector < vector<gd::Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

vector < gd::Expression* > TimedEvent::GetAllExpressions()
{
    vector < gd::Expression* > allExpressions;
    allExpressions.push_back(&timeout);

    return allExpressions;
}

vector < const vector<gd::Instruction>* > TimedEvent::GetAllConditionsVectors() const
{
    vector < const vector<gd::Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < const vector<gd::Instruction>* > TimedEvent::GetAllActionsVectors() const
{
    vector < const vector<gd::Instruction>* > allActions;
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
    gd::EventsListSerialization::SaveConditions(conditions, element.AddChild("conditions"));
    gd::EventsListSerialization::SaveActions(actions, element.AddChild("actions"));
    gd::EventsListSerialization::SerializeEventsTo(events, element.AddChild("events"));
}

void TimedEvent::UnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    name = element.GetChild("name", 0, "Name").GetValue().GetString();
    timeout = element.GetChild("timeout", 0, "Timeout").GetValue().GetString();
    gd::EventsListSerialization::OpenConditions(project, conditions, element.GetChild("conditions", 0, "Conditions"));
    gd::EventsListSerialization::OpenActions(project, actions, element.GetChild("actions", 0, "Actions"));
    gd::EventsListSerialization::UnserializeEventsFrom(project, events, element.GetChild("events", 0, "Events"));
}

/**
 * Render the event in the bitmap
 */
void TimedEvent::Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform)
{
    gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
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
    dc.DrawText( GD_T("Delayed execution after ")+timeout.GetPlainString()+GD_T(" seconds.")+" "+nameTxt, x + 4, y + 3 );

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
}

unsigned int TimedEvent::GetRenderedHeight(unsigned int width, const gd::Platform & platform) const
{
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
}

gd::BaseEvent::EditEventReturnType TimedEvent::EditEvent(wxWindow* parent, gd::Project & game, gd::Layout & scene, gd::MainFrameWrapper & mainFrameWrapper)
{
    TimedEventEditorDlg dialog(parent, *this, game, scene);
    if ( dialog.ShowModal() == 0 ) return Cancelled;

    return ChangesMade;
}

#endif
