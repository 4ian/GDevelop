/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "SceneCanvasEditionData.h"

SceneCanvasEditionData::SceneCanvasEditionData() :
    editing(true),
    isMovingObject( false ),
    isResizingX( false ),
    isResizingY( false ),
    xRectangleSelection(0),
    yRectangleSelection(0),
    xEndRectangleSelection(0),
    yEndRectangleSelection(0),
    isMoving( false ),
    isSelecting(false)
{
}
