/**

Game Develop - Tiled Sprite Extension
Copyright (c) 2012 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2014 Florian Rival (Florian.Rival@gmail.com)

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

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h> //Must be placed first, otherwise we get errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#include <wx/panel.h>
#endif
#include "TileMapObject.h"
#include <SFML/Graphics.hpp>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Object.h"
#include "GDCpp/Project.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/ImageManager.h"
#include "GDCpp/FontManager.h"
#include "GDCpp/Position.h"
#include "GDCpp/Polygon.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/CommonTools.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "TileMapObjectEditor.h"
#endif

#include "TileMap.h"
#include "TileSet.h"

using namespace std;

namespace
{
    sf::VertexArray GenerateVertexArray(TileSet &tileSet, TileMap &tileMap)
    {
        sf::VertexArray vertexArray(sf::Quads);
        int tileWidth = tileSet.tileSize.x;
        int tileHeight = tileSet.tileSize.y;

        if(tileSet.IsDirty())
            return vertexArray;

        int vertexs = 0;

        for(int layer = 0; layer < 3; layer++)
        {
            for(int col = 0; col < tileMap.GetColumnsCount(); col++)
            {
                for(int row = 0; row < tileMap.GetRowsCount(); row++)
                {
                    if(tileMap.GetTile(layer, col, row) == -1)
                        continue;

                    vertexs += 4;

                    TileTextureCoords coords = tileSet.GetTileTextureCoords(tileMap.GetTile(layer, col, row));
                    {
                        sf::Vertex vertex(sf::Vector2f(col * tileWidth, row * tileHeight), coords.topLeft);
                        vertexArray.append(vertex);
                    }
                    {
                        sf::Vertex vertex(sf::Vector2f(col * tileWidth, (row + 1) * tileHeight), coords.bottomLeft);
                        vertexArray.append(vertex);
                    }
                    {
                        sf::Vertex vertex(sf::Vector2f((col + 1) * tileWidth, (row + 1) * tileHeight), coords.bottomRight);
                        vertexArray.append(vertex);
                    }
                    {
                        sf::Vertex vertex(sf::Vector2f((col + 1) * tileWidth, row * tileHeight), coords.topRight);
                        vertexArray.append(vertex);
                    }
                }
            }
        }

        std::cout << "Generated " << vertexs << " vertexes." << std::endl;

        return vertexArray;
    }

    std::vector<Polygon2d> GenerateHitboxes(TileSet &tileSet, TileMap &tileMap)
    {
        std::vector<Polygon2d> hitboxes;
        int tileWidth = tileSet.tileSize.x;
        int tileHeight = tileSet.tileSize.y;

        if(tileSet.IsDirty())
            return hitboxes;

        std::cout << "Generating Hitboxes" << std::endl;

        for(int layer = 0; layer < 3; layer++)
        {
            for(int col = 0; col < tileMap.GetColumnsCount(); col++)
            {
                for(int row = 0; row < tileMap.GetRowsCount(); row++)
                {
                    if(tileMap.GetTile(layer, col, row) == -1 || !tileSet.GetTileHitbox(tileMap.GetTile(layer, col, row)).collidable)
                        continue;

                    std::vector<Polygon2d>::iterator newHitboxIt = hitboxes.insert(hitboxes.begin(), tileSet.GetTileHitbox(tileMap.GetTile(layer, col, row)).hitbox);
                    std::cout << "Collision mask at " << col * tileWidth << ";" << row * tileHeight << std::endl;
                    newHitboxIt->Move(col * tileWidth, row * tileHeight);
                }
            }
        }

        std::cout << "Hitbox:OK" << std::endl;

        return hitboxes;
    }
}

/**
 * TileMapProxy
 */

TileMapProxy::TileMapProxy() : m_tilemap(new TileMap())
{

}

TileMapProxy::TileMapProxy(const TileMap &tilemap) : m_tilemap(new TileMap(tilemap))
{

}

TileMapProxy::TileMapProxy(const TileMapProxy &other) : m_tilemap(new TileMap(*other.m_tilemap))
{

}

TileMapProxy::~TileMapProxy()
{
    if(m_tilemap)
        delete m_tilemap;
}

TileMapProxy& TileMapProxy::operator=(const TileMapProxy &other)
{
    if(m_tilemap)
        delete m_tilemap;
    m_tilemap = new TileMap(*other.m_tilemap);

    return *this;
}

TileMap& TileMapProxy::Get()
{
    return *m_tilemap;
}

const TileMap& TileMapProxy::Get() const
{
    return *m_tilemap;
}

/**
 * TileMapProxy
 */

TileSetProxy::TileSetProxy() : m_tileset(new TileSet())
{

}

TileSetProxy::TileSetProxy(const TileSet &tileset) : m_tileset(new TileSet(tileset))
{

}

TileSetProxy::TileSetProxy(const TileSetProxy &other) : m_tileset(new TileSet(*other.m_tileset))
{

}

TileSetProxy::~TileSetProxy()
{
    if(m_tileset)
        delete m_tileset;
}

TileSetProxy& TileSetProxy::operator=(const TileSetProxy &other)
{
    if(m_tileset)
        delete m_tileset;
    m_tileset = new TileSet(*other.m_tileset);

    return *this;
}

TileSet& TileSetProxy::Get()
{
    return *m_tileset;
}

const TileSet& TileSetProxy::Get() const
{
    return *m_tileset;
}

/**
 * TileMapObject
 */

TileMapObject::TileMapObject(std::string name_) :
    Object(name_),
    tileSet(),
    tileMap(),
    vertexArray(sf::Quads)
{
}

void TileMapObject::DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    if(element.HasChild("tileSet"))
    {
        tileSet.Get().UnserializeFrom(element.GetChild("tileSet"));
    }
    if(element.HasChild("tileMap"))
    {
        tileMap.Get().UnserializeFrom(element.GetChild("tileMap"));
    }
}

float TileMapObject::GetWidth() const
{
    if(tileSet.Get().IsDirty() || tileMap.Get().GetColumnsCount() == 0 || tileMap.Get().GetRowsCount() == 0)
        return 200.f;
    else
        return tileMap.Get().GetColumnsCount() * tileSet.Get().tileSize.x;
}

float TileMapObject::GetHeight() const
{
    if(tileSet.Get().IsDirty() || tileMap.Get().GetColumnsCount() == 0 || tileMap.Get().GetRowsCount() == 0)
        return 150.f;
    else
        return tileMap.Get().GetRowsCount() * tileSet.Get().tileSize.y;
}

#if defined(GD_IDE_ONLY)
void TileMapObject::DoSerializeTo(gd::SerializerElement & element) const
{
    tileSet.Get().SerializeTo(element.AddChild("tileSet"));
    tileMap.Get().SerializeTo(element.AddChild("tileMap"));
}

void TileMapObject::LoadResources(gd::Project & project, gd::Layout & layout)
{
    tileSet.Get().LoadResources(project);
    tileSet.Get().Generate();
    vertexArray = GenerateVertexArray(tileSet.Get(), tileMap.Get());
}
#endif

RuntimeTileMapObject::RuntimeTileMapObject(RuntimeScene & scene, const gd::Object & object) :
    RuntimeObject(scene, object),
    tileSet(),
    tileMap(),
    vertexArray(sf::Quads),
    oldX(0),
    oldY(0)
{
    const TileMapObject & tileMapObject = static_cast<const TileMapObject&>(object);

    tileSet = tileMapObject.tileSet;
    tileMap = tileMapObject.tileMap;

    //Load the tileset and generate the vertex array
    tileSet.Get().LoadResources(*(scene.game));
    tileSet.Get().Generate();
    vertexArray = GenerateVertexArray(tileSet.Get(), tileMap.Get());
    hitboxes = GenerateHitboxes(tileSet.Get(), tileMap.Get());
}

/**
 * Render object at runtime
 */
bool RuntimeTileMapObject::Draw( sf::RenderTarget& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    //Construct the transform
    sf::Transform transform;
    transform.translate(GetX(), GetY());
    
    //Unsmooth the texture
    bool wasSmooth = tileSet.Get().GetTexture().isSmooth();
    tileSet.Get().GetTexture().setSmooth(false);

    //Draw the tilemap
    window.draw(vertexArray, sf::RenderStates(sf::BlendAlpha, transform, &tileSet.Get().GetTexture(), NULL));

    tileSet.Get().GetTexture().setSmooth(wasSmooth);

    return true;
}


float RuntimeTileMapObject::GetWidth() const
{
    if(tileSet.Get().IsDirty() || tileMap.Get().GetColumnsCount() == 0 || tileMap.Get().GetRowsCount() == 0)
        return 200.f;
    else
        return tileMap.Get().GetColumnsCount() * tileSet.Get().tileSize.x;
}

float RuntimeTileMapObject::GetHeight() const
{
    if(tileSet.Get().IsDirty() || tileMap.Get().GetColumnsCount() == 0 || tileMap.Get().GetRowsCount() == 0)
        return 150.f;
    else
        return tileMap.Get().GetRowsCount() * tileSet.Get().tileSize.y;
}

void RuntimeTileMapObject::OnPositionChanged()
{
    std::cout << "Moving by " << GetX() - oldX << " pixels (X)" << std::endl;

    //Moves all hitboxes (use the previous pos to move them)
    for(std::vector<Polygon2d>::iterator it = hitboxes.begin(); it != hitboxes.end(); it++)
    {
        it->Move(GetX() - oldX, GetY() - oldY);
    }

    oldX = GetX();
    oldY = GetY();
}

#if defined(GD_IDE_ONLY)
sf::Vector2f TileMapObject::GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const
{
    if(tileSet.Get().IsDirty() || tileMap.Get().GetColumnsCount() == 0 || tileMap.Get().GetRowsCount() == 0)
        return sf::Vector2f(200.f, 150.f);
    else
        return sf::Vector2f(tileMap.Get().GetColumnsCount() * tileSet.Get().tileSize.x, tileMap.Get().GetRowsCount() * tileSet.Get().tileSize.y);
}

/**
 * Render object at edittime
 */
void TileMapObject::DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout)
{
    if(tileSet.Get().IsDirty())
        return;

    //Construct the transform
    sf::Transform transform;
    transform.translate(instance.GetX(), instance.GetY());

    //Unsmooth the texture
    bool wasSmooth = tileSet.Get().GetTexture().isSmooth();
    tileSet.Get().GetTexture().setSmooth(false);

    //Draw the tilemap
    renderTarget.draw(vertexArray, sf::RenderStates(sf::BlendAlpha, transform, &tileSet.Get().GetTexture(), NULL));

    tileSet.Get().GetTexture().setSmooth(wasSmooth);
}

void TileMapObject::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    worker.ExposeImage(tileSet.Get().textureName);
}

bool TileMapObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const
{
#if !defined(GD_NO_WX_GUI)
    thumbnail = wxBitmap("CppPlatform/Extensions/TileMapIcon24.png", wxBITMAP_TYPE_ANY);
#endif

    return true;
}

void TileMapObject::EditObject( wxWindow* parent, gd::Project & game, gd::MainFrameWrapper & mainFrameWrapper )
{
#if !defined(GD_NO_WX_GUI)
    TileMapObjectEditor dialog(parent, game, *this, mainFrameWrapper);
    dialog.ShowModal();
#endif
}

void RuntimeTileMapObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{

}

bool RuntimeTileMapObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    return true;
}

unsigned int RuntimeTileMapObject::GetNumberOfProperties() const
{
    return 0;
}
#endif

std::vector<Polygon2d> RuntimeTileMapObject::GetHitBoxes() const
{
    return hitboxes;
}

void DestroyRuntimeTileMapObject(RuntimeObject * object)
{
    delete object;
}

RuntimeObject * CreateRuntimeTileMapObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeTileMapObject(scene, object);
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyTileMapObject(gd::Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
gd::Object * CreateTileMapObject(std::string name)
{
    return new TileMapObject(name);
}

