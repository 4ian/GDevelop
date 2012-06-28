/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef DNDFILEEDITOR_H
#define DNDFILEEDITOR_H

#include <wx/dnd.h>
#include <wx/log.h>
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
