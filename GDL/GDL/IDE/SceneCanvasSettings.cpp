/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "SceneCanvasSettings.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/XmlMacros.h"

SceneCanvasSettings::SceneCanvasSettings() :
    grid( false ),
    snap( false),
    gridWidth( 32 ),
    gridHeight( 32 ),
    gridR( 158 ),
    gridG( 180 ),
    gridB( 255 ),
    windowMask(false)
{

}

void SceneCanvasSettings::LoadFromXml(const TiXmlElement * elem)
{
    if (elem == NULL) return;

    if ( elem->Attribute( "grid" ) != NULL ) { GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("grid", grid); }
    if ( elem->Attribute( "snap" ) != NULL ) { GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("snap", snap); }
    if ( elem->Attribute( "windowMask" ) != NULL ) { GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("windowMask", windowMask); }
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("gridWidth", gridWidth);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("gridHeight", gridHeight);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("gridR", gridR);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("gridG", gridG);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("gridB", gridB);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("associatedLayout", associatedLayout);
}

void SceneCanvasSettings::SaveToXml(TiXmlElement * element) const
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
    element->SetAttribute( "windowMask", windowMask ? "true" : "false" );
    element->SetAttribute( "associatedLayout", associatedLayout.c_str() );
}
