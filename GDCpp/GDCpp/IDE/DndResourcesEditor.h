/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)
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
     * The dropped text must be a string formatted like this (without quotes):
     * "COPYANDADDRESOURCES;subfolderwherefilesshouldbeinserted;file1;file2..."
     */
    virtual bool OnDropText(wxCoord x, wxCoord y, const wxString& text);

private:

    ResourcesEditor & editor;
};

#endif // DNDRESOURCESEDITOR_H
#endif

