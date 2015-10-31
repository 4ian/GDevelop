/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if !defined(GD_NO_WX_GUI)
#include <wx/dcmemory.h>
#endif
#include "CommentEvent.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/IDE/Dialogs/EditComment.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorItemsAreas.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorSelection.h"
#include "GDCore/CommonTools.h"

using namespace std;

namespace gd
{

void CommentEvent::SerializeTo(SerializerElement & element) const
{
    element.AddChild("color")
        .SetAttribute("r", r)
        .SetAttribute("g", v)
        .SetAttribute("b", b)
        .SetAttribute("textR", textR)
        .SetAttribute("textG", textG)
        .SetAttribute("textB", textB);

    element.AddChild("comment").SetValue(com1);
    element.AddChild("comment2").SetValue(com2);
}

void CommentEvent::UnserializeFrom(gd::Project & project, const SerializerElement & element)
{
    const SerializerElement & colorElement = element.GetChild("color", 0, "Couleur");
    r = colorElement.GetIntAttribute("r");
    v = colorElement.GetIntAttribute("g", 0, "v");
    b = colorElement.GetIntAttribute("b");
    textR = colorElement.GetIntAttribute("textR");
    textG = colorElement.GetIntAttribute("textG");
    textB = colorElement.GetIntAttribute("textB");

    com1 = element.GetChild("comment", 0, "Com1").GetValue().GetString();
    com2 = element.GetChild("comment2", 0, "Com2").GetValue().GetString();
}

gd::BaseEvent::EditEventReturnType CommentEvent::EditEvent(wxWindow* parent_, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_)
{
#if !defined(GD_NO_WX_GUI)
    EditComment dialog(parent_, *this);
    if ( dialog.ShowModal() == 0) return Cancelled;
#endif

    return ChangesMadeButNoNeedForEventsRecompilation;
}

/**
 * Render the event
 */
void CommentEvent::Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform &)
{
#if !defined(GD_NO_WX_GUI)
    x += 1; //Small border

    gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
    renderingHelper->GetHTMLRenderer().SetDC(&dc);
    renderingHelper->GetHTMLRenderer().SetStandardFonts(renderingHelper->GetNiceFont().GetPointSize());

    //Prepare HTML texts
    gd::String str1 = "<FONT color="+wxColour(textR, textG, textB).GetAsString(wxC2S_HTML_SYNTAX)+">"+renderingHelper->GetHTMLText(com1)+"</FONT>";
    gd::String str2 = "<FONT color="+wxColour(textR, textG, textB).GetAsString(wxC2S_HTML_SYNTAX)+">"+renderingHelper->GetHTMLText(com2)+"</FONT>";

    //Calculate space constraints
    const int sideSeparation = 3; //Spacing between text and borders

    unsigned int textWidth = com2.empty() ? width-sideSeparation*2 : width/2-sideSeparation*2;
    renderingHelper->GetHTMLRenderer().SetSize(textWidth, 9999);

    renderingHelper->GetHTMLRenderer().SetHtmlText(str1);
    unsigned int text1Height = renderingHelper->GetHTMLRenderer().GetTotalHeight();

    renderingHelper->GetHTMLRenderer().SetHtmlText(str2);
    unsigned int text2Height = renderingHelper->GetHTMLRenderer().GetTotalHeight();

    //Prepare background
    dc.SetBrush(wxBrush(wxColour(r, v, b), wxTRANSPARENT));
    dc.SetPen(wxPen(wxColour(r/2, v/2, b/2), 1));

    //Draw the background
    unsigned int height = std::max(text1Height, text2Height)+sideSeparation*2;
    height = std::max(height, (unsigned int)15);
    wxRect rectangle(x, y, width-2, height);
    dc.GradientFillLinear(rectangle, wxColour(r+20 > 255 ? 255 : r+20, v+20 > 255 ? 255 : v+20, b+20 > 255 ? 255 : b+20), wxColour(r, v, b), wxSOUTH);
    dc.DrawRectangle(rectangle);

    //Draw text
    {
        renderingHelper->GetHTMLRenderer().SetHtmlText(str1);
        wxArrayInt neededArray;
        renderingHelper->GetHTMLRenderer().Render(x + sideSeparation, y+sideSeparation, neededArray);
    }
    if ( !com2.empty() ) //Optional text
    {
        renderingHelper->GetHTMLRenderer().SetHtmlText(str2);
        wxArrayInt neededArray;
        renderingHelper->GetHTMLRenderer().Render(x + sideSeparation + textWidth + sideSeparation, y+sideSeparation, neededArray);
    }
#endif
}

unsigned int CommentEvent::GetRenderedHeight(unsigned int width, const gd::Platform &) const
{
#if !defined(GD_NO_WX_GUI)
    if ( eventHeightNeedUpdate )
    {
        gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();

        wxMemoryDC dc;
        wxBitmap fakeBmp(1,1);
        dc.SelectObject(fakeBmp);

        renderingHelper->GetHTMLRenderer().SetDC(&dc);
        renderingHelper->GetHTMLRenderer().SetStandardFonts(renderingHelper->GetNiceFont().GetPointSize());

        gd::String str1 = "<FONT color="+wxColour(textR, textG, textB).GetAsString(wxC2S_HTML_SYNTAX)+">"+renderingHelper->GetHTMLText(com1)+"</FONT>";
        gd::String str2 = "<FONT color="+wxColour(textR, textG, textB).GetAsString(wxC2S_HTML_SYNTAX)+">"+renderingHelper->GetHTMLText(com2)+"</FONT>";

        //Calculate space constraints
        const int sideSeparation = 3; //Spacing between text and borders

        unsigned int textWidth = com2.empty() ? width-sideSeparation*2 : width/2-sideSeparation*2;
        renderingHelper->GetHTMLRenderer().SetSize(textWidth, 9999);

        renderingHelper->GetHTMLRenderer().SetHtmlText(str1);
        unsigned int text1Height = renderingHelper->GetHTMLRenderer().GetTotalHeight();

        renderingHelper->GetHTMLRenderer().SetHtmlText(str2);
        unsigned int text2Height = renderingHelper->GetHTMLRenderer().GetTotalHeight();

        unsigned int height = std::max(text1Height, text2Height)+sideSeparation*2;
        height = std::max(height, (unsigned int)15);
        renderedHeight = height;
    }
#endif
    return renderedHeight+2;//2 : 2 small borders
}

}
