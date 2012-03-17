/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef DNDTEXTSCENEEDITOR_H
#define DNDTEXTSCENEEDITOR_H

#include <wx/dnd.h>
class SceneCanvas;

class DndTextSceneEditor : public wxTextDropTarget
{
public:
    DndTextSceneEditor(SceneCanvas & sceneCanvas_) : sceneCanvas(sceneCanvas_) {}

    virtual bool OnDropText(wxCoord x, wxCoord y, const wxString& text);

private:
    SceneCanvas & sceneCanvas;
};

#endif // DNDTEXTSCENEEDITOR_H
