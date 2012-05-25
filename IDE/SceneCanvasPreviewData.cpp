/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "SceneCanvasPreviewData.h"
#include "SceneCanvas.h"

SceneCanvasPreviewData::SceneCanvasPreviewData(SceneCanvas & parent, RuntimeGame & game_) :
    game(game_),
    scene(&parent, &game)
{

}
