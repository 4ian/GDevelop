/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef SCENECANVASPREVIEWDATA_H
#define SCENECANVASPREVIEWDATA_H
#include "GDL/RuntimeGame.h"
#include "GDL/RuntimeScene.h"
class SceneCanvas;

/**
 * \brief Contains data to be used by SceneCanvas when previewing a layout
 */
class SceneCanvasPreviewData
{
public:
    SceneCanvasPreviewData(SceneCanvas & parent, RuntimeGame & game);
    virtual ~SceneCanvasPreviewData() {};

    RuntimeGame game; ///< Runtime game used during preview.
    RuntimeScene scene; ///< Runtime scene used to render or preview the scene.
private:
};

#endif // SCENECANVASPREVIEWDATA_H
