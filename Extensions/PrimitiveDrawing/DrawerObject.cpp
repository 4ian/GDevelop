/**

Game Develop - Primitive Drawing Extension
Copyright (c) 2008-2011 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "DrawerObject.h"
#include <SFML/Graphics.hpp>
#include "GDL/Object.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ImageManager.h"
#include "GDL/RotatedRectangle.h"
#include "GDL/tinyxml.h"
#include "GDL/FontManager.h"
#include "GDL/Position.h"

#if defined(GD_IDE_ONLY)
#include <wx/wx.h>
#include "GDL/CommonTools.h"
#include "GDL/MainEditorCommand.h"
#include "DrawerObjectEditor.h"
#endif

#if defined(GD_IDE_ONLY)
sf::Image DrawerObject::edittimeIconImage;
sf::Sprite DrawerObject::edittimeIcon;
#endif

DrawerObject::DrawerObject(std::string name_) :
Object(name_),
fillColorR( 255 ),
fillColorG( 255 ),
fillColorB( 255 ),
fillOpacity( 255 ),
outlineSize(1),
outlineColorR(0),
outlineColorG(0),
outlineColorB(0),
outlineOpacity(255),
absoluteCoordinates(true)
{
}

void DrawerObject::LoadFromXml(const TiXmlElement * object)
{
    if ( object->FirstChildElement( "FillColor" ) == NULL ||
         object->FirstChildElement( "FillColor" )->Attribute("r") == NULL ||
         object->FirstChildElement( "FillColor" )->Attribute("g") == NULL ||
         object->FirstChildElement( "FillColor" )->Attribute("b") == NULL )
    {
        cout << "Les informations concernant la couleur de remplissage d'un objet Drawer manquent.";
    }
    else
    {
        int r = 255;
        int g = 255;
        int b = 255;
        object->FirstChildElement("FillColor")->QueryIntAttribute("r", &r);
        object->FirstChildElement("FillColor")->QueryIntAttribute("g", &g);
        object->FirstChildElement("FillColor")->QueryIntAttribute("b", &b);

        SetFillColor(r,g,b);
    }

    if ( object->FirstChildElement( "FillOpacity" ) == NULL ||
         object->FirstChildElement( "FillOpacity" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant l'opacité du remplissage d'un objet Drawer manquent.";
    }
    else
    {
        object->FirstChildElement("FillOpacity")->QueryFloatAttribute("value", &fillOpacity);
    }


    if ( object->FirstChildElement( "OutlineColor" ) == NULL ||
         object->FirstChildElement( "OutlineColor" )->Attribute("r") == NULL ||
         object->FirstChildElement( "OutlineColor" )->Attribute("g") == NULL ||
         object->FirstChildElement( "OutlineColor" )->Attribute("b") == NULL )
    {
        cout << "Les informations concernant la couleur du contour d'un objet Drawer manquent.";
    }
    else
    {
        int r = 255;
        int g = 255;
        int b = 255;
        object->FirstChildElement("OutlineColor")->QueryIntAttribute("r", &r);
        object->FirstChildElement("OutlineColor")->QueryIntAttribute("g", &g);
        object->FirstChildElement("OutlineColor")->QueryIntAttribute("b", &b);

        SetOutlineColor(r,g,b);
    }

    if ( object->FirstChildElement( "OutlineOpacity" ) == NULL ||
         object->FirstChildElement( "OutlineOpacity" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant l'opacité du contour d'un objet Drawer manquent.";
    }
    else
    {
        object->FirstChildElement("OutlineOpacity")->QueryFloatAttribute("value", &outlineOpacity);
    }

    if ( object->FirstChildElement( "OutlineSize" ) == NULL ||
         object->FirstChildElement( "OutlineSize" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant la taille du contour d'un objet Drawer manquent.";
    }
    else
    {
        object->FirstChildElement("OutlineSize")->QueryIntAttribute("value", &outlineSize);
    }

    absoluteCoordinates = true;
    if ( object->FirstChildElement( "AbsoluteCoordinates" ) == NULL ||
         object->FirstChildElement( "AbsoluteCoordinates" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant le type des coordonnées d'un objet Drawer manquent.";
    }
    else
    {
        string result = object->FirstChildElement("AbsoluteCoordinates")->Attribute("value");
        if ( result == "false" )
            absoluteCoordinates = false;
    }
}
#if defined(GD_IDE_ONLY)
void DrawerObject::SaveToXml(TiXmlElement * object)
{
    TiXmlElement * fillOpacityElem = new TiXmlElement( "FillOpacity" );
    object->LinkEndChild( fillOpacityElem );
    fillOpacityElem->SetDoubleAttribute("value", fillOpacity);

    TiXmlElement * fillColorElem = new TiXmlElement( "FillColor" );
    object->LinkEndChild( fillColorElem );
    fillColorElem->SetAttribute("r", fillColorR);
    fillColorElem->SetAttribute("g", fillColorG);
    fillColorElem->SetAttribute("b", fillColorB);

    TiXmlElement * outlineSizeElem = new TiXmlElement( "OutlineSize" );
    object->LinkEndChild( outlineSizeElem );
    outlineSizeElem->SetAttribute("value", outlineSize);

    TiXmlElement * outlineOpacityElem = new TiXmlElement( "OutlineOpacity" );
    object->LinkEndChild( outlineOpacityElem );
    outlineOpacityElem->SetDoubleAttribute("value", outlineOpacity);

    TiXmlElement * outlineColorElem = new TiXmlElement( "OutlineColor" );
    object->LinkEndChild( outlineColorElem );
    outlineColorElem->SetAttribute("r", outlineColorR);
    outlineColorElem->SetAttribute("g", outlineColorG);
    outlineColorElem->SetAttribute("b", outlineColorB);

    TiXmlElement * absoluteCoordinatesElem = new TiXmlElement( "AbsoluteCoordinates" );
    object->LinkEndChild( absoluteCoordinatesElem );
    if ( absoluteCoordinates )
        absoluteCoordinatesElem->SetAttribute("value", "true");
    else
        absoluteCoordinatesElem->SetAttribute("value", "false");
}
#endif

bool DrawerObject::LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr )
{
    #if defined(GD_IDE_ONLY)
    edittimeIconImage.LoadFromFile("Extensions/primitivedrawingicon.png");
    edittimeIcon.SetImage(edittimeIconImage);
    #endif

    return true;
}

/**
 * Update animation and direction from the inital position
 */
bool DrawerObject::InitializeFromInitialPosition(const InitialPosition & position)
{
    return true;
}

/**
 * Render object at runtime
 */
bool DrawerObject::Draw( sf::RenderWindow& window )
{
    //Don't draw anything if hidden
    if ( hidden )
    {
        shapesToDraw.clear();
        return true;
    }

    for (unsigned int i = 0;i<shapesToDraw.size();++i)
    	window.Draw(shapesToDraw[i]);

    shapesToDraw.clear();

    return true;
}

#if defined(GD_IDE_ONLY)
/**
 * Render object at edittime
 */
bool DrawerObject::DrawEdittime(sf::RenderWindow& renderWindow)
{
    edittimeIcon.SetPosition(GetX(), GetY());
    renderWindow.Draw(edittimeIcon);

    return true;
}

bool DrawerObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/primitivedrawingicon.png", wxBITMAP_TYPE_ANY);

    return true;
}

void DrawerObject::EditObject( wxWindow* parent, Game & game, MainEditorCommand & mainEditorCommand )
{
    DrawerObjectEditor dialog(parent, game, *this, mainEditorCommand);
    dialog.ShowModal();
}

wxPanel * DrawerObject::CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position )
{
    return NULL;
}

void DrawerObject::UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position)
{
}

void DrawerObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Couleur de remplissage");    value = ToString(fillColorR)+";"+ToString(fillColorG)+";"+ToString(fillColorB);}
    else if ( propertyNb == 1 ) {name = _("Opacité du remplissage");    value = ToString(fillOpacity);}
    else if ( propertyNb == 2 ) {name = _("Taille du contour");         value = ToString(outlineSize);}
    else if ( propertyNb == 3 ) {name = _("Couleur du contour");        value = ToString(outlineColorR)+";"+ToString(outlineColorG)+";"+ToString(outlineColorB);}
    else if ( propertyNb == 4 ) {name = _("Opacité du contour");        value = ToString(outlineOpacity);}
}

bool DrawerObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 )
    {
        string r, gb, g, b;
        {
            size_t separationPos = newValue.find(";");

            if ( separationPos > newValue.length())
                return false;

            r = newValue.substr(0, separationPos);
            gb = newValue.substr(separationPos+1, newValue.length());
        }

        {
            size_t separationPos = gb.find(";");

            if ( separationPos > gb.length())
                return false;

            g = gb.substr(0, separationPos);
            b = gb.substr(separationPos+1, gb.length());
        }

        SetFillColor(ToInt(r), ToInt(g), ToInt(b));
    }
    else if ( propertyNb == 1 ) { SetFillOpacity(ToFloat(newValue)); }
    else if ( propertyNb == 2 ) { SetOutlineSize(ToInt(newValue)); }
    else if ( propertyNb == 3 )
    {
        string r, gb, g, b;
        {
            size_t separationPos = newValue.find(";");

            if ( separationPos > newValue.length())
                return false;

            r = newValue.substr(0, separationPos);
            gb = newValue.substr(separationPos+1, newValue.length());
        }

        {
            size_t separationPos = gb.find(";");

            if ( separationPos > gb.length())
                return false;

            g = gb.substr(0, separationPos);
            b = gb.substr(separationPos+1, gb.length());
        }

        SetOutlineColor(ToInt(r), ToInt(g), ToInt(b));
    }
    else if ( propertyNb == 4 ) { SetOutlineOpacity(ToFloat(newValue)); }

    return true;
}

unsigned int DrawerObject::GetNumberOfProperties() const
{
    return 5;
}
#endif

/**
 * Get the real X position of the sprite
 */
float DrawerObject::GetDrawableX() const
{
    return GetX();
}

/**
 * Get the real Y position of the text
 */
float DrawerObject::GetDrawableY() const
{
    return GetY();
}

/**
 * Width
 */
float DrawerObject::GetWidth() const
{
    return 32;
}

/**
 * Height
 */
float DrawerObject::GetHeight() const
{
    return 32;
}

/**
 * X center is computed with text rectangle
 */
float DrawerObject::GetCenterX() const
{
    return 16;
}

/**
 * Y center is computed with text rectangle
 */
float DrawerObject::GetCenterY() const
{
    return 16;
}

/**
 * Nothing to do when updating time
 */
void DrawerObject::UpdateTime(float)
{
}

/**
 * Change the color filter of the sprite object
 */
void DrawerObject::SetFillColor( unsigned int r, unsigned int g, unsigned int b )
{
    fillColorR = r;
    fillColorG = g;
    fillColorB = b;
}

void DrawerObject::SetFillOpacity(float val)
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    fillOpacity = val;
}

/**
 * Change the color filter of the sprite object
 */
void DrawerObject::SetOutlineColor( unsigned int r, unsigned int g, unsigned int b )
{
    outlineColorR = r;
    outlineColorG = g;
    outlineColorB = b;
}

void DrawerObject::SetOutlineOpacity(float val)
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    outlineOpacity = val;
}

/**
 * Change the fill color
 */
void DrawerObject::SetFillColor( const std::string & color )
{
    vector < string > colors = SplitString <string> (color, ';');

    if ( colors.size() < 3 ) return;

    fillColorR = ToInt(colors[0]);
    fillColorG = ToInt(colors[1]);
    fillColorB = ToInt(colors[2]);
}

/**
 * Change the color of the outline
 */
void DrawerObject::SetOutlineColor( const std::string & color )
{
    vector < string > colors = SplitString <string> (color, ';');

    if ( colors.size() < 3 ) return; //La couleur est incorrecte

    outlineColorR = ToInt(colors[0]);
    outlineColorG = ToInt(colors[1]);
    outlineColorB = ToInt(colors[2]);
}

void DrawerObject::DrawRectangle( float x, float y, float x2, float y2 )
{
    float Xgap = absoluteCoordinates ? 0 : GetX();
    float Ygap = absoluteCoordinates ? 0 : GetY();

    shapesToDraw.push_back(sf::Shape::Rectangle(x+Xgap,
                                                y+Ygap,
                                                x2-x+Xgap,
                                                y2-y+Ygap,
                                                sf::Color(fillColorR, fillColorG, fillColorB, fillOpacity),
                                                outlineSize,
                                                sf::Color(outlineColorR, outlineColorG, outlineColorB, outlineOpacity)));
}

void DrawerObject::DrawLine( float x, float y, float x2, float y2, float thickness )
{
    float Xgap = absoluteCoordinates ? 0 : GetX();
    float Ygap = absoluteCoordinates ? 0 : GetY();

    shapesToDraw.push_back(sf::Shape::Line(x+Xgap,
                                                y+Ygap,
                                                x2+Xgap,
                                                y2+Ygap,
                                                thickness,
                                                sf::Color(fillColorR, fillColorG, fillColorB, fillOpacity),
                                                outlineSize,
                                                sf::Color(outlineColorR, outlineColorG, outlineColorB, outlineOpacity)));
}

void DrawerObject::DrawCircle( float x, float y, float radius )
{
    float Xgap = absoluteCoordinates ? 0 : GetX();
    float Ygap = absoluteCoordinates ? 0 : GetY();

    shapesToDraw.push_back(sf::Shape::Circle(x+Xgap, y+Ygap, radius,
                                             sf::Color(fillColorR, fillColorG, fillColorB, fillOpacity),
                                             outlineSize,
                                             sf::Color(outlineColorR, outlineColorG, outlineColorB, outlineOpacity)));
}

namespace GDpriv
{
namespace PrimitiveDrawingExtension
{

void GD_EXTENSION_API CopyImageOnAnother( const std::string & destName, const std::string & srcName, float destX, float destY, RuntimeScene & scene )
{
    if ( !scene.game->imageManager->HasImage(destName) ) return;
    if ( !scene.game->imageManager->HasImage(srcName) ) return;

    boost::shared_ptr<sf::Image> dest = scene.game->imageManager->GetSFMLImage(destName);

    //Make sure the coordinates are correct.
    if ( destX < 0 || static_cast<unsigned>(destX) >= dest->GetWidth()) return;
    if ( destY < 0 || static_cast<unsigned>(destY) >= dest->GetWidth()) return;

    dest->Copy(*scene.game->imageManager->GetSFMLImage(srcName), destX, destY);
}

}
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyDrawerObject(Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
Object * CreateDrawerObject(std::string name)
{
    return new DrawerObject(name);
}
