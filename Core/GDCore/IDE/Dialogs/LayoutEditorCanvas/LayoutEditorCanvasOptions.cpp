/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
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
    element.SetAttribute( "gridR", gridR );
    element.SetAttribute( "gridG", gridG );
    element.SetAttribute( "gridB", gridB );
    element.SetAttribute( "zoomFactor", zoomFactor );
    element.SetAttribute( "windowMask", windowMask);
    element.SetAttribute( "associatedLayout", associatedLayout);
}

void LayoutEditorCanvasOptions::UnserializeFrom(const SerializerElement & element)
{
    grid = element.GetBoolAttribute("grid");
    snap = element.GetBoolAttribute("snap");
    windowMask = element.GetBoolAttribute("windowMask");
    gridWidth = element.GetIntAttribute("gridWidth", 32);
    gridHeight = element.GetIntAttribute("gridHeight", 32);
    gridR = element.GetIntAttribute("gridR", 158);
    gridG = element.GetIntAttribute("gridG", 180);
    gridB = element.GetIntAttribute("gridB", 255);
    zoomFactor = element.GetDoubleAttribute("zoomFactor", 1);
    associatedLayout = element.GetStringAttribute("associatedLayout");
}

}
#endif