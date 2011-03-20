#include <wx/log.h>
#include <SFML/Window.hpp>

#include "DndTextSceneEditor.h"
#include "SceneCanvas.h"

bool DndTextSceneEditor::OnDropText(wxCoord x, wxCoord y, const wxString& text)
{
    sceneCanvas.edittimeRenderer.objectToAdd = text;

    sceneCanvas.AddObjetSelected(   sceneCanvas.ConvertCoords(x, 0).x,
                                    sceneCanvas.ConvertCoords(0, y).y);

    sceneCanvas.edittimeRenderer.objectToAdd = "";

    return true;
}
