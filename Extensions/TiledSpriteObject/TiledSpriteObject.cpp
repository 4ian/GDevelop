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
#include "GDCpp/Object.h"
#include "GDCpp/Project.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/ImageManager.h"
#include "GDCpp/FontManager.h"
#include "GDCpp/Position.h"
#include "GDCpp/Polygon.h"
#include "GDCpp/tinyxml/tinyxml.h"
#include "GDCpp/CommonTools.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "TiledSpriteObjectEditor.h"
#endif

using namespace std;

TiledSpriteObject::TiledSpriteObject(std::string name_) :
    Object(name_),
    textureName(""),
    width(32),
    height(32)
{
}

void TiledSpriteObject::DoLoadFromXml(gd::Project & project, const TiXmlElement * object)
{
    if (!object) return;

    textureName = object->Attribute("texture") ? std::string(object->Attribute("texture")) : "";
    width = object->Attribute("width") ? ToFloat(object->Attribute("width")) : 128;
    height = object->Attribute("height") ? ToFloat(object->Attribute("height")) : 128;
}

#if defined(GD_IDE_ONLY)
void TiledSpriteObject::DoSaveToXml(TiXmlElement * object)
{
    if (!object) return;

    object->SetAttribute("texture", textureName.c_str());
    object->SetAttribute("width", width);
    object->SetAttribute("height", height);
}

void TiledSpriteObject::LoadResources(gd::Project & project, gd::Layout & layout)
{
    texture = project.GetImageManager()->GetSFMLTexture(textureName);
}
#endif

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

RuntimeTiledSpriteObject::RuntimeTiledSpriteObject(RuntimeScene & scene, const gd::Object & object) :
    RuntimeObject(scene, object),
    width(32),
    height(32),
    xOffset(0),
    yOffset(),
    angle(0)
{
    const TiledSpriteObject & panelSpriteObject = static_cast<const TiledSpriteObject&>(object);

    SetWidth(panelSpriteObject.GetWidth());
    SetHeight(panelSpriteObject.GetHeight());

    textureName = panelSpriteObject.textureName;
    ChangeAndReloadImage(textureName, scene);
}

void RuntimeTiledSpriteObject::ChangeAndReloadImage(const std::string &txtName, const RuntimeScene &scene)
{
    textureName = txtName;
    texture = scene.game->GetImageManager()->GetSFMLTexture(textureName);
}

/**
 * Render object at runtime
 */
bool RuntimeTiledSpriteObject::Draw( sf::RenderTarget& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;
    if(!texture) return true;

    sf::Vector2f centerPosition = sf::Vector2f(GetX()+GetCenterX(),GetY()+GetCenterY());
    float angleInRad = angle*3.14159/180.0;
    texture->texture.setRepeated(true);
    sf::Vertex vertices[] = {sf::Vertex( centerPosition+RotatePoint(sf::Vector2f(-width/2,-height/2), angleInRad), sf::Vector2f(0+xOffset,0+yOffset)),
                             sf::Vertex( centerPosition+RotatePoint(sf::Vector2f(+width/2,-height/2), angleInRad), sf::Vector2f(width+xOffset,0+yOffset)),
                             sf::Vertex( centerPosition+RotatePoint(sf::Vector2f(+width/2,+height/2), angleInRad), sf::Vector2f(width+xOffset, height+yOffset)),
                             sf::Vertex( centerPosition+RotatePoint(sf::Vector2f(-width/2,+height/2), angleInRad), sf::Vector2f(0+xOffset, height+yOffset))};

    window.draw(vertices, 4, sf::Quads, &texture->texture);
    texture->texture.setRepeated(false);

    return true;
}

#if defined(GD_IDE_ONLY)
sf::Vector2f TiledSpriteObject::GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const
{
    return sf::Vector2f(width,height);
}

/**
 * Render object at edittime
 */
void TiledSpriteObject::DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout)
{
    if(!texture) return;

    float width = instance.HasCustomSize() ? instance.GetCustomWidth() : GetInitialInstanceDefaultSize(instance, project, layout).x;
    float height = instance.HasCustomSize() ? instance.GetCustomHeight() : GetInitialInstanceDefaultSize(instance, project, layout).y;
    float xOffset = 0;
    float yOffset = 0;

    sf::Vector2f centerPosition = sf::Vector2f(instance.GetX()+width/2, instance.GetY()+height/2);
    float angleInRad = instance.GetAngle()*3.14159/180.0;
    texture->texture.setRepeated(true);
    sf::Vertex vertices[] = {sf::Vertex( centerPosition+RotatePoint(sf::Vector2f(-width/2,-height/2), angleInRad), sf::Vector2f(0+xOffset,0+yOffset)),
                             sf::Vertex( centerPosition+RotatePoint(sf::Vector2f(+width/2,-height/2), angleInRad), sf::Vector2f(width+xOffset,0+yOffset)),
                             sf::Vertex( centerPosition+RotatePoint(sf::Vector2f(+width/2,+height/2), angleInRad), sf::Vector2f(width+xOffset, height+yOffset)),
                             sf::Vertex( centerPosition+RotatePoint(sf::Vector2f(-width/2,+height/2), angleInRad), sf::Vector2f(0+xOffset, height+yOffset))};

    renderTarget.draw(vertices, 4, sf::Quads, &texture->texture);
    texture->texture.setRepeated(false);
}

void TiledSpriteObject::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    worker.ExposeImage(textureName);
}

bool TiledSpriteObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("CppPlatform/Extensions/TiledSpriteIcon24.png", wxBITMAP_TYPE_ANY);

    return true;
}

void TiledSpriteObject::EditObject( wxWindow* parent, gd::Project & game, gd::MainFrameWrapper & mainFrameWrapper )
{
    TiledSpriteObjectEditor dialog(parent, game, *this, mainFrameWrapper);
    dialog.ShowModal();
}

void RuntimeTiledSpriteObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Width");       value = ToString(width);}
    else if ( propertyNb == 1 ) {name = _("Height");       value = ToString(height);}
    else if ( propertyNb == 2 ) {name = _("Angle");       value = ToString(angle);}
}

bool RuntimeTiledSpriteObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) {width = ToFloat(newValue);}
    else if ( propertyNb == 1 ) {height = ToFloat(newValue);}
    else if ( propertyNb == 2 ) {angle = ToFloat(newValue);}

    return true;
}

unsigned int RuntimeTiledSpriteObject::GetNumberOfProperties() const
{
    return 3;
}
#endif

void DestroyRuntimeTiledSpriteObject(RuntimeObject * object)
{
    delete object;
}

RuntimeObject * CreateRuntimeTiledSpriteObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeTiledSpriteObject(scene, object);
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyTiledSpriteObject(gd::Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
gd::Object * CreateTiledSpriteObject(std::string name)
{
    return new TiledSpriteObject(name);
}

