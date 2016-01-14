/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "GDCore/CommonTools.h"
#include "LayoutEditorCanvasTextDnd.h"

namespace gd
{

bool LayoutEditorCanvasTextDnd::OnDropText(wxCoord x, wxCoord y, const wxString& text)
{
    //Try to workaround a wxMac making string not ending properly
    //See: http://trac.wxwidgets.org/ticket/9522#comment:4
    wxString objectName = text;
    gd::String allowedCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
    objectName = objectName.substr(0, objectName.find_first_not_of(allowedCharacters));

    layoutCanvas.AddObject(objectName);

    return true;
}

}
#endif
