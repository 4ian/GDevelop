/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#ifndef DNDFILEEDITOR_H
#define DNDFILEEDITOR_H

#include <wx/dnd.h>
#include "GDCore/Tools/Log.h"
class MainFrame;

/**
 * \brief Used to open files dropped on the editor
 */
class DnDFileEditor : public wxFileDropTarget
{
public:
    DnDFileEditor(MainFrame & editor_) : mainEditor(editor_) {}

    virtual bool OnDropFiles(wxCoord x, wxCoord y, const wxArrayString& filenames);

private:
    MainFrame & mainEditor;
};

#endif // DNDFILEEDITOR_H

