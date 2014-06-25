/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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