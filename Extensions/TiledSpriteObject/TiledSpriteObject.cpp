/**

Game Develop - Tiled Sprite Extension
Copyright (c) 2012 Victor Levasseur (victorlevasseur01@orange.fr)

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

#if defined(GD_IDE_ONLY)
#include <wx/bitmap.h> //Must be placed first, otherwise we get errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#include <wx/panel.h>
#endif
#include "TiledSpriteObject.h"
#include <SFML/Graphics.hpp>
#include "GDL/Object.h"
#include "GDL/ImageManager.h"
#include "GDL/FontManager.h"
#include "GDL/Position.h"
#include "GDL/Polygon.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/CommonTools.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "TiledSpriteObjectEditor.h"
#include "TiledSpriteInitialPositionPanel.h"
#endif

TiledSpriteObject::TiledSpriteObject(std::string name_) :
Object(name_),
textureName(""),
width(32),
height(32),
angle(0)
{
}

TiledSpriteObject::~TiledSpriteObject()
{
}

void TiledSpriteObject::LoadFromXml(const TiXmlElement * object)
{
    if (!object) return;

    textureName = object->Attribute("texture") ? std::string(object->Attribute("texture")) : "";
    width = object->Attribute("width") ? ToFloat(object->Attribute("texture")) : 128;
    height = object->Attribute("height") ? ToFloat(object->Attribute("texture")) : 128;
}

#if defined(GD_IDE_ONLY)
void TiledSpriteObject::SaveToXml(TiXmlElement * object)
{
    if (!object) return;

    object->SetAttribute("texture", textureName.c_str());
    object->SetAttribute("width", width);
    object->SetAttribute("height", height);
}
#endif

bool TiledSpriteObject::LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr )
{
    texture =  imageMgr.GetSFMLTexture(textureName);

    return true;
}

/**
 * Update from the inital position
 */
bool TiledSpriteObject::InitializeFromInitialPosition(const InitialPosition & position)
{
    return true;
}

namespace
{
    sf::Vector2f RotatePoint(sf::Vector2f point, float angle)
    {
        float t,
              cosa = cos(-angle),
              sina = sin(-angle); //We want a clockwise rotation

        t = point.x;
        point.x = t*cosa + point.y*sina;
        point.y = -t*sina + point.y*cosa;

        return point;
    }
}

/**
 * Render object at runtime
 */
bool TiledSpriteObject::Draw( sf::RenderTarget& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;
    if(!texture) return true;

    sf::Vector2f centerPosition = sf::Vector2f(GetX()+GetCenterX(),GetY()+GetCenterY());
    float angleInRad = angle*3.14159/180.0;
    texture->texture.setRepeated(true);
    sf::Vertex vertices[] = {sf::Vertex( centerPosition+RotatePoint(sf::Vector2f(-width/2,-height/2), angleInRad), sf::Vector2f(0,0)),
                             sf::Vertex( centerPosition+RotatePoint(sf::Vector2f(+width/2,-height/2), angleInRad), sf::Vector2f(width,0)),
                             sf::Vertex( centerPosition+RotatePoint(sf::Vector2f(+width/2,+height/2), angleInRad), sf::Vector2f(width, height)),
                             sf::Vertex( centerPosition+RotatePoint(sf::Vector2f(-width/2,+height/2), angleInRad), sf::Vector2f(0, height))};

    window.draw(vertices, 4, sf::Quads, &texture->texture);
    texture->texture.setRepeated(false);

    return true;
}

#if defined(GD_IDE_ONLY)
/**
 * Render object at edittime
 */
bool TiledSpriteObject::DrawEdittime(sf::RenderTarget& window)
{
    return Draw(window);
}

void TiledSpriteObject::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    worker.ExposeImage(textureName);
}

bool TiledSpriteObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/TiledSpriteIcon24.png", wxBITMAP_TYPE_ANY);

    return true;
}

void TiledSpriteObject::EditObject( wxWindow* parent, Game & game, gd::MainFrameWrapper & mainFrameWrapper )
{
    TiledSpriteObjectEditor dialog(parent, game, *this, mainFrameWrapper);
    dialog.ShowModal();
}

wxPanel * TiledSpriteObject::CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position )
{
    TiledSpriteInitialPositionPanel * panel = new TiledSpriteInitialPositionPanel(parent);
    panel->angleTextCtrl->ChangeValue(ToString(position.GetAngle()));

    return panel;
}

void TiledSpriteObject::UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position)
{
    TiledSpriteInitialPositionPanel * tiledSpritePanel = dynamic_cast<TiledSpriteInitialPositionPanel*>(panel);
    if (tiledSpritePanel == NULL) return;

    position.SetAngle(ToFloat(ToString(tiledSpritePanel->angleTextCtrl->GetValue())));
}

void TiledSpriteObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Width");       value = ToString(width);}
    else if ( propertyNb == 1 ) {name = _("Height");       value = ToString(height);}
}

bool TiledSpriteObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) {width = ToFloat(newValue);}
    else if ( propertyNb == 1 ) {height = ToFloat(newValue);}

    return true;
}

unsigned int TiledSpriteObject::GetNumberOfProperties() const
{
    return 2;
}
#endif

/**
 * TiledSprite object provides a basic bounding box.
 */
std::vector<Polygon2d> TiledSpriteObject::GetHitBoxes() const
{
    std::vector<Polygon2d> mask;
    Polygon2d rectangle = Polygon2d::CreateRectangle(GetWidth(), GetHeight());
    rectangle.Rotate(GetAngle()/180*3.14159);
    rectangle.Move(GetX()+GetCenterX(), GetY()+GetCenterY());

    mask.push_back(rectangle);
    return mask;
}

/**
 * Get the real X position of the box
 */
float TiledSpriteObject::GetDrawableX() const
{
    return GetX();
}

/**
 * Get the real Y position of the box
 */
float TiledSpriteObject::GetDrawableY() const
{
    return GetY();
}

/**
 * Width is the width of the current sprite.
 */
float TiledSpriteObject::GetWidth() const
{
    return width;
}

/**
 * Height is the height of the current sprite.
 */
float TiledSpriteObject::GetHeight() const
{
    return height;
}

/**
 * X center
 */
float TiledSpriteObject::GetCenterX() const
{
    return width/2;
}

/**
 * Y center
 */
float TiledSpriteObject::GetCenterY() const
{
    return height/2;
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyTiledSpriteObject(Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
Object * CreateTiledSpriteObject(std::string name)
{
    return new TiledSpriteObject(name);
}

