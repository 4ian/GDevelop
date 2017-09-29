/**

GDevelop - Function Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY)

#include "GDCore/Events/Serialization.h"
#include "FunctionEvent.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCpp/Runtime/TinyXml/tinyxml.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorItemsAreas.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorSelection.h"
#include "GDCore/Tools/Localization.h"
#include "FunctionEventEditorDlg.h"
namespace gd { class Project; }

using namespace std;

FunctionEvent::FunctionEvent() :
BaseEvent(),
name("MyFunction"),
nameSelected(false)
{
}

vector < gd::InstructionsList* > FunctionEvent::GetAllConditionsVectors()
{
    vector < gd::InstructionsList* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < gd::InstructionsList* > FunctionEvent::GetAllActionsVectors()
{
    vector < gd::InstructionsList* > allActions;
    allActions.push_back(&actions);

    return allActions;
}
vector < const gd::InstructionsList* > FunctionEvent::GetAllConditionsVectors() const
{
    vector < const gd::InstructionsList* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < const gd::InstructionsList* > FunctionEvent::GetAllActionsVectors() const
{
    vector < const gd::InstructionsList* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

void FunctionEvent::SerializeTo(gd::SerializerElement & element) const
{
    element.AddChild("name").SetValue(name);
    element.AddChild("objectsPassedAsArgument").SetValue(objectsPassedAsArgument);
    gd::EventsListSerialization::SerializeInstructionsTo(conditions, element.AddChild("conditions"));
    gd::EventsListSerialization::SerializeInstructionsTo(actions, element.AddChild("actions"));
    gd::EventsListSerialization::SerializeEventsTo(events, element.AddChild("events"));
}

void FunctionEvent::UnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    name = element.GetChild("name", 0, "Name").GetValue().GetString();
    objectsPassedAsArgument = element.GetChild("objectsPassedAsArgument").GetValue().GetString();
    gd::EventsListSerialization::UnserializeInstructionsFrom(project, conditions, element.GetChild("conditions", 0, "Conditions"));
    gd::EventsListSerialization::UnserializeInstructionsFrom(project, actions, element.GetChild("actions", 0, "Actions"));
    gd::EventsListSerialization::UnserializeEventsFrom(project, events, element.GetChild("events", 0, "Events"));
}

/**
 * Render the event in the bitmap
 */
void FunctionEvent::Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform)
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
    wxString caption = _("Function") + " " + name;
    if ( !objectsPassedAsArgument.empty() ) caption += " "+_("( Objects passed as parameters : ")+objectsPassedAsArgument+_(")");
    dc.DrawText( caption, x + 4, y + 3 );

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

unsigned int FunctionEvent::GetRenderedHeight(unsigned int width, const gd::Platform & platform) const
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

gd::BaseEvent::EditEventReturnType FunctionEvent::EditEvent(wxWindow* parent_, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_)
{
#if !defined(GD_NO_WX_GUI)
    FunctionEventEditorDlg dialog(parent_, *this, game_, scene_);
    if ( dialog.ShowModal() == 0 ) return Cancelled;
#endif

    return ChangesMade;
}

const FunctionEvent* FunctionEvent::SearchForFunctionInEvents(const gd::Project & project, const gd::EventsList & events, const gd::String & functionName)
{
    for (std::size_t i = 0;i<events.size();++i)
    {
        const FunctionEvent * functionEvent = dynamic_cast<const FunctionEvent*>(&events[i]);
        const gd::LinkEvent * linkEvent = dynamic_cast<const gd::LinkEvent*>(&events[i]);
        if (functionEvent)
        {
            if ( functionEvent->GetName() == functionName )
                return functionEvent;
        }
        else if (linkEvent && linkEvent->GetLinkedEvents(project))
        {
            const FunctionEvent* result = SearchForFunctionInEvents(project,
                *linkEvent->GetLinkedEvents(project), functionName);
            if (result) return result;
        }
        else if ( events[i].CanHaveSubEvents() )
        {
            const FunctionEvent * result = SearchForFunctionInEvents(project,
                events[i].GetSubEvents(), functionName);
            if (result) return result;
        }
    }

    return NULL;
}

gd::String FunctionEvent::MangleFunctionName(const gd::Layout & layout, const FunctionEvent & functionEvent)
{
    //To generate a "unique" name for the function, the name is mangled and suffixed with the
    //pointer to the (original) event of the function.
    const gd::BaseEvent * ptr = &functionEvent;
    std::shared_ptr<gd::BaseEvent> originalEvent = functionEvent.originalEvent.lock();
    if (originalEvent != std::shared_ptr<gd::BaseEvent>()) {
        ptr = originalEvent.get();
    }

    return "GDFunction"+layout.GetMangledName()
        +gd::SceneNameMangler::GetMangledSceneName(functionEvent.GetName())
        +gd::String::From(ptr);
};

#endif
