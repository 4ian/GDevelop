/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#include "GroupEvent.h"
#if !defined(GD_NO_WX_GUI)
#include <wx/dcmemory.h>
#include <wx/renderer.h>
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#endif
#include "GDCore/IDE/EventsRenderingHelper.h"
#include "GDCore/IDE/EventsEditorItemsAreas.h"
#include "GDCore/IDE/EventsEditorSelection.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/IDE/Dialogs/GroupEventDialog.h"

using namespace std;

namespace gd
{

GroupEvent::GroupEvent() :
    BaseEvent(),
    colorR(221),
    colorG(216),
    colorB(255)
{
}

void GroupEvent::SerializeTo(SerializerElement & element) const
{
    element.SetAttribute("name", name);
    element.SetAttribute("colorR", (int)colorR);
    element.SetAttribute("colorG", (int)colorG);
    element.SetAttribute("colorB", (int)colorB);
    gd::EventsListSerialization::SerializeEventsTo(events, element.AddChild("events"));
}

void GroupEvent::UnserializeFrom(gd::Project & project, const SerializerElement & element)
{
    name = element.GetStringAttribute("name");
    colorR = element.GetIntAttribute("colorR");
    colorG = element.GetIntAttribute("colorG");
    colorB = element.GetIntAttribute("colorB");
    gd::EventsListSerialization::UnserializeEventsFrom(project, events, element.GetChild("events"));
}

gd::BaseEvent::EditEventReturnType GroupEvent::EditEvent(wxWindow* parent_, gd::Project & project, gd::Layout & scene, gd::MainFrameWrapper & mainFrameWrapper)
{
    if (events.IsEmpty())
        events.InsertNewEvent(project, "BuiltinCommonInstructions::Standard");

#if !defined(GD_NO_WX_GUI)
    GroupEventDialog dialog(parent_, *this);
    dialog.ShowModal();
#endif

    return ChangesMadeButNoNeedForEventsRecompilation;
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
    wxString groupTitle = name.empty() ? _("Untitled group") : name;
    wxColour backgroundColor = wxColour(colorR, colorG, colorB);
    wxColour textColor = wxColour(0, 0, 0);
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

        wxString groupTitle = name.empty() ? _("Untitled group") : name;

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
