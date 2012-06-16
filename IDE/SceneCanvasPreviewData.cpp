/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include <wx/wx.h> //Otherwise we get nice error relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#include "SceneCanvasPreviewData.h"
#include "SceneCanvas.h"

SceneCanvasPreviewData::SceneCanvasPreviewData(SceneCanvas & parent, RuntimeGame & game_) :
    game(game_),
    scene(&parent, &game)
{

}
