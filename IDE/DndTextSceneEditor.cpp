#include <wx/log.h>
#include <SFML/Window.hpp>

#include "DndTextSceneEditor.h"
#include "SceneCanvas.h"

bool DndTextSceneEditor::OnDropText(wxCoord x, wxCoord y, const wxString& text)
{
    sceneCanvas.scene.objectToAdd = text;

    sf::Event unusedEvent;
    sceneCanvas.GetEvent(unusedEvent); //So as to refresh mouse position

    wxCommandEvent unused;
    sceneCanvas.OnAddObjetSelected(unused);

    sceneCanvas.scene.objectToAdd = "";

    return true;
}
