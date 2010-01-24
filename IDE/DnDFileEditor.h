#ifndef DNDFILEEDITOR_H
#define DNDFILEEDITOR_H

#include <wx/dnd.h>
#include <wx/log.h>
class Game_Develop_EditorFrame;

class DnDFileEditor : public wxFileDropTarget
{
public:
    DnDFileEditor(Game_Develop_EditorFrame & editor_) : mainEditor(editor_) {}

    virtual bool OnDropFiles(wxCoord x, wxCoord y, const wxArrayString& filenames);

private:
    Game_Develop_EditorFrame & mainEditor;
};

#endif // DNDFILEEDITOR_H
