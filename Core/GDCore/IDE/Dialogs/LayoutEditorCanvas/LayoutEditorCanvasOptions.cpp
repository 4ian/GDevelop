/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "LayoutEditorCanvasOptions.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/CommonTools.h"

namespace gd
{

LayoutEditorCanvasOptions::LayoutEditorCanvasOptions() :
    grid( false ),
    snap( true ),
    gridWidth( 32 ),
    gridHeight( 32 ),
    gridOffsetX( 0 ),
    gridOffsetY( 0 ),
    gridR( 158 ),
    gridG( 180 ),
    gridB( 255 ),
    zoomFactor(1),
    windowMask(false)
{

}

void LayoutEditorCanvasOptions::SerializeTo(SerializerElement & element) const
{
    element.SetAttribute( "grid", grid);
    element.SetAttribute( "snap", snap);
    element.SetAttribute( "gridWidth", gridWidth );
    element.SetAttribute( "gridHeight", gridHeight );
    element.SetAttribute( "gridOffsetX", gridOffsetX );
    element.SetAttribute( "gridOffsetY", gridOffsetY );
    element.SetAttribute( "gridR", gridR );
    element.SetAttribute( "gridG", gridG );
    element.SetAttribute( "gridB", gridB );
    element.SetAttribute( "zoomFactor", zoomFactor );
    element.SetAttribute( "windowMask", windowMask);
}

void LayoutEditorCanvasOptions::UnserializeFrom(const SerializerElement & element)
{
    grid = element.GetBoolAttribute("grid");
    snap = element.GetBoolAttribute("snap");
    windowMask = element.GetBoolAttribute("windowMask");
    gridWidth = element.GetIntAttribute("gridWidth", 32);
    gridHeight = element.GetIntAttribute("gridHeight", 32);
    gridOffsetX = element.GetIntAttribute("gridOffsetX", 0);
    gridOffsetY = element.GetIntAttribute("gridOffsetY", 0);
    gridR = element.GetIntAttribute("gridR", 158);
    gridG = element.GetIntAttribute("gridG", 180);
    gridB = element.GetIntAttribute("gridB", 255);
    zoomFactor = element.GetDoubleAttribute("zoomFactor", 1.0);
}

}
#endif
