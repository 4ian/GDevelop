/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#include "LayoutEditorCanvasOptions.h"
#include "GDCore/TinyXml/tinyxml.h"
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

void LayoutEditorCanvasOptions::LoadFromXml(const TiXmlElement * elem)
{
    if (elem == NULL) return;

    grid = elem->Attribute("grid") ? (ToString(elem->Attribute("grid")) == "true") : false;
    snap = elem->Attribute("snap") ? (ToString(elem->Attribute("snap")) == "true") : false;
    windowMask = elem->Attribute("windowMask") ? (ToString(elem->Attribute("windowMask")) == "true") : false;
    gridWidth = elem->Attribute("gridWidth") ? ToInt(elem->Attribute("gridWidth")) : 32;
    gridHeight = elem->Attribute("gridHeight") ? ToInt(elem->Attribute("gridHeight")) : 32;
    gridR = elem->Attribute("gridR") ? ToInt(elem->Attribute("gridR")) : 158;
    gridG = elem->Attribute("gridG") ? ToInt(elem->Attribute("gridG")) : 180;
    gridB = elem->Attribute("gridB") ? ToInt(elem->Attribute("gridB")) : 255;
    zoomFactor = elem->Attribute("zoomFactor") ? ToFloat(elem->Attribute("zoomFactor")) : 1;
    associatedLayout = elem->Attribute("associatedLayout") ? ToString(elem->Attribute("associatedLayout")) : "";
}

void LayoutEditorCanvasOptions::SaveToXml(TiXmlElement * element) const
{
    if (element == NULL) return;

    element->SetDoubleAttribute( "gridWidth", gridWidth );
    element->SetAttribute( "grid", grid ? "true" : "false" );
    element->SetAttribute( "snap", snap ? "true" : "false" );
    element->SetDoubleAttribute( "gridWidth", gridWidth );
    element->SetDoubleAttribute( "gridHeight", gridHeight );
    element->SetDoubleAttribute( "gridR", gridR );
    element->SetDoubleAttribute( "gridG", gridG );
    element->SetDoubleAttribute( "gridB", gridB );
    element->SetDoubleAttribute( "zoomFactor", zoomFactor );
    element->SetAttribute( "windowMask", windowMask ? "true" : "false" );
    element->SetAttribute( "associatedLayout", associatedLayout.c_str() );
}

}
