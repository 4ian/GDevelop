#ifndef DNDTEXTOBJECTSEDITOR_H
#define DNDTEXTOBJECTSEDITOR_H

#include <wx/dnd.h>
class EditorObjectList;

/**
 * Class for drag'n'dropping a text to a EditorObjectList, and automatically
 * create a new object
 */
class DndTextObjectsEditor : public wxTextDropTarget
{
public:
    DndTextObjectsEditor(EditorObjectList & editor_) : editor(editor_) {}

    virtual bool OnDropText(wxCoord x, wxCoord y, const wxString& text);

private:
    EditorObjectList & editor;
};

#endif // DNDTEXTOBJECTSEDITOR_H

