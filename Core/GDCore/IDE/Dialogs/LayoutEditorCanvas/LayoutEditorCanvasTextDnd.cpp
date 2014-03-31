/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "GDCore/CommonTools.h"
#include "LayoutEditorCanvasTextDnd.h"

namespace gd
{

bool LayoutEditorCanvasTextDnd::OnDropText(wxCoord x, wxCoord y, const wxString& text)
{
    layoutCanvas.AddObject(gd::ToString(text));

    return true;
}

}
#endif