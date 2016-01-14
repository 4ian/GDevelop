/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef DNDRESOURCESEDITOR_H
#define DNDRESOURCESEDITOR_H
#include <wx/dnd.h>
class ResourcesEditor;

/**
 * \brief Tool class used by ResourcesEditor to enable inserting resources using drag'n'drop
 */
class DndTextResourcesEditor : public wxTextDropTarget
{
public:
    DndTextResourcesEditor(ResourcesEditor & editor_) : editor(editor_) {}

    /**
     * The dropped text must be a gd::String formatted like this (without quotes):
     * "COPYANDADDRESOURCES;subfolderwherefilesshouldbeinserted;file1;file2..."
     */
    virtual bool OnDropText(wxCoord x, wxCoord y, const wxString& text);

private:

    ResourcesEditor & editor;
};

#endif // DNDRESOURCESEDITOR_H
#endif

