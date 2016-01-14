/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef LAYOUTEDITORCANVASTEXTDND_H
#define LAYOUTEDITORCANVASTEXTDND_H
#include <wx/dnd.h>

namespace gd
{

/**
 * \brief Tool class used by LayoutEditorCanvas to enable inserting object using drag'n'drop
 *
 * \see gd::LayoutEditorCanvas
 */
class LayoutEditorCanvasTextDnd : public wxTextDropTarget
{
public:
    LayoutEditorCanvasTextDnd(LayoutEditorCanvas & layoutCanvas_) : layoutCanvas(layoutCanvas_) {}

    virtual bool OnDropText(wxCoord x, wxCoord y, const wxString& text);

private:
    LayoutEditorCanvas & layoutCanvas;
};

}
#endif // LAYOUTEDITORCANVASTEXTDND_H
#endif
