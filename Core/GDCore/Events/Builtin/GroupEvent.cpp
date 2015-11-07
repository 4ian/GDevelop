/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GroupEvent.h"
#if !defined(GD_NO_WX_GUI)
#include <wx/dcmemory.h>
#include <wx/renderer.h>
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#endif
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorItemsAreas.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorSelection.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/IDE/Dialogs/GroupEventDialog.h"
#include "GDCore/IDE/Dialogs/EventStoreDialog.h"

using namespace std;

namespace gd
{

GroupEvent::GroupEvent() :
    BaseEvent(),
    creationTime(0),
    colorR(74),
    colorG(176),
    colorB(228)
{
}

void GroupEvent::SerializeTo(SerializerElement & element) const
{
    element.SetAttribute("name", name);
    element.SetAttribute("source", source);
    element.SetAttribute("creationTime", (int)creationTime);
    element.SetAttribute("colorR", (int)colorR);
    element.SetAttribute("colorG", (int)colorG);
    element.SetAttribute("colorB", (int)colorB);
    gd::EventsListSerialization::SerializeEventsTo(events, element.AddChild("events"));

    gd::SerializerElement & parametersElement = element.AddChild("parameters");
    parametersElement.ConsiderAsArrayOf("parameter");
    for ( std::size_t i = 0;i < parameters.size();++i)
        parametersElement.AddChild("parameter").SetValue(parameters[i]);
}

void GroupEvent::UnserializeFrom(gd::Project & project, const SerializerElement & element)
{
    name = element.GetStringAttribute("name");
    source = element.GetStringAttribute("source");
    creationTime = element.GetIntAttribute("creationTime");
    colorR = element.GetIntAttribute("colorR");
    colorG = element.GetIntAttribute("colorG");
    colorB = element.GetIntAttribute("colorB");
    gd::EventsListSerialization::UnserializeEventsFrom(project, events, element.GetChild("events"));

    parameters.clear();
    gd::SerializerElement & parametersElement = element.GetChild("parameters");
    parametersElement.ConsiderAsArrayOf("parameters");
    for ( std::size_t i = 0;i < parametersElement.GetChildrenCount();++i)
        parameters.push_back(parametersElement.GetChild(i).GetValue().GetString());
}

gd::BaseEvent::EditEventReturnType GroupEvent::EditEvent(wxWindow* parent_, gd::Project & project, gd::Layout & scene, gd::MainFrameWrapper & mainFrameWrapper)
{
    if (events.IsEmpty())
        events.InsertNewEvent(project, "BuiltinCommonInstructions::Standard");

#if !defined(GD_NO_WX_GUI)
    if (source.empty())
    {
        GroupEventDialog dialog(parent_, *this);
        dialog.ShowModal();
        return ChangesMadeButNoNeedForEventsRecompilation;
    }
    else
    {
        gd::EventStoreDialog dialog(parent_, project, scene);

        size_t found = source.rfind("/");
        if (found != gd::String::npos && found < source.size()-1) {
            gd::String sourceId = source.substr(found+1, source.size());
            dialog.RefreshWith(sourceId, parameters);
        }

        if (dialog.ShowModal() != 1) return Cancelled;

        //Insert new events
        *this = dialog.GetGroupEvent();
        return ChangesMade;
    }
#else
    return Cancelled;
#endif

}

void GroupEvent::SetBackgroundColor(unsigned int colorR_, unsigned int colorG_, unsigned int colorB_)
{
    colorR = colorR_;
    colorG = colorG_;
    colorB = colorB_;
}

/**
 * Render the event in the bitmap
 */
void GroupEvent::Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform)
{
#if !defined(GD_NO_WX_GUI)
    wxString groupTitle = name.empty() ? _("Untitled group") : wxString(name);
    wxColour backgroundColor = wxColour(colorR, colorG, colorB);
    wxColour textColor = colorR + colorG + colorB > 200*3 ? *wxBLACK : *wxWHITE;
    if (IsDisabled())
    {
        backgroundColor.MakeDisabled();
        textColor = wxColour(160, 160, 160);
    }

    dc.SetBrush(wxBrush(backgroundColor));
    dc.SetPen(wxPen(backgroundColor.ChangeLightness(70)));
    wxRect rect(x+1, y, width-2, GetRenderedHeight(width, platform)-2);
    dc.DrawRectangle(rect);

    dc.SetTextBackground(backgroundColor);
    dc.SetTextForeground(textColor);
    dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxFONTWEIGHT_BOLD ) );
    dc.DrawText( groupTitle, x+5, y + 5 );
#endif
}

unsigned int GroupEvent::GetRenderedHeight(unsigned int width, const gd::Platform & platform) const
{
#if !defined(GD_NO_WX_GUI)
    if ( eventHeightNeedUpdate )
    {
        wxMemoryDC dc;
        wxBitmap fakeBmp(1,1);
        dc.SelectObject(fakeBmp);

        wxString groupTitle = name.empty() ? _("Untitled group") : wxString(name);

        dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxNORMAL ) );
        wxRect text = dc.GetTextExtent(groupTitle);

        renderedHeight = text.GetHeight()+10;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
#else
    return 0;
#endif
}

}
