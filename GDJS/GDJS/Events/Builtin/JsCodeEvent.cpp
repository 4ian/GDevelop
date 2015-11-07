/** \file
 *  GDevelop
 *  2008-2015 Florian Rival (Florian.Rival@gmail.com)
 */

#include "JsCodeEvent.h"
#include <iostream>
#include <fstream>
#if !defined(GD_NO_WX_GUI)
#include <wx/filename.h>
#include <wx/dcmemory.h>
#endif
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionsCodeGeneration.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorItemsAreas.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorSelection.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Project/SourceFile.h"
#include "GDCore/CommonTools.h"
#include "GDJS/IDE/Dialogs/JsCodeEventDialog.h"

using namespace std;

namespace gdjs
{

/**
 * Render the event in the bitmap
 */
void JsCodeEvent::Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform)
{
#if !defined(GD_NO_WX_GUI)
    gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
    const int titleTextHeight = 20;

    //Draw header rectangle
    wxRect headerRect(x, y, width, GetRenderedHeight(width, platform));
    renderingHelper->DrawNiceRectangle(dc, headerRect);

    //Header
    dc.SetFont( renderingHelper->GetNiceFont().Bold()  );
    dc.SetTextForeground(wxColour(0,0,0));
    dc.DrawText(_("Javascript code"), x + 4, y + 3 );

    dc.SetFont( renderingHelper->GetFont() );
    dc.SetBrush(renderingHelper->GetActionsRectangleFillBrush());
    dc.SetPen(renderingHelper->GetActionsRectangleOutlinePen());

    dc.DrawRectangle(wxRect(x + 4, y + 3 + titleTextHeight + 2, width-8, GetRenderedHeight(width, platform)-(3 + titleTextHeight + 5)));
    dc.DrawLabel( inlineCode, wxNullBitmap, wxRect(x + 4, y + 3 + titleTextHeight + 4, width-2, GetRenderedHeight(width, platform)));
#endif
}

unsigned int JsCodeEvent::GetRenderedHeight(unsigned int width, const gd::Platform & platform) const
{
#if !defined(GD_NO_WX_GUI)
    if ( eventHeightNeedUpdate )
    {
        gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
        renderedHeight = 20;

        wxMemoryDC fakeDC;
        fakeDC.SetFont(renderingHelper->GetFont());
        renderedHeight += fakeDC.GetMultiLineTextExtent(inlineCode).GetHeight();
        renderedHeight += 15; //Borders

        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
#else
    return 0;
#endif
}

gd::BaseEvent::EditEventReturnType JsCodeEvent::EditEvent(wxWindow* parent_, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_)
{
#if !defined(GD_NO_WX_GUI)
    JsCodeEventDialog dialog(parent_, *this, game_, scene_);
    if (dialog.ShowModal() == 0)
        return Cancelled;
#endif

    return ChangesMade;
}

void JsCodeEvent::SerializeTo(gd::SerializerElement & element) const
{
    element.AddChild("inlineCode").SetValue(inlineCode);
    element.AddChild("parameterObjects").SetValue(parameterObjects);
}

void JsCodeEvent::UnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    inlineCode = element.GetChild("inlineCode").GetValue().GetString();
    parameterObjects = element.GetChild("parameterObjects").GetValue().GetString();
}

JsCodeEvent::JsCodeEvent() :
    BaseEvent(),
    inlineCode("runtimeScene.setBackgroundColor(100,100,240);\n")
{
}

}
