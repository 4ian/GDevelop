/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCore/CommonTools.h"
#include "DndTextSceneEditor.h"
#include "SceneCanvas.h"

bool DndTextSceneEditor::OnDropText(wxCoord x, wxCoord y, const wxString& text)
{
    sf::Vector2f dropPosition = sceneCanvas.convertCoords(sf::Vector2i(x,y));
    sceneCanvas.AddObject(gd::ToString(text), dropPosition.x, dropPosition.y);

    return true;
}

