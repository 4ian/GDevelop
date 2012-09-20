/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCore/CommonTools.h"
#include "DndTextSceneEditor.h"
#include "SceneCanvas.h"

bool DndTextSceneEditor::OnDropText(wxCoord x, wxCoord y, const wxString& text)
{
    sceneCanvas.AddObject(gd::ToString(text), sceneCanvas.ConvertCoords(x, 0).x, sceneCanvas.ConvertCoords(0, y).y);

    return true;
}

