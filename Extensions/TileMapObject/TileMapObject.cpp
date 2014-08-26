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
        tileSet.UnserializeFrom(element.GetChild("tileSet"));
    }
    if(element.HasChild("tileMap"))
    {
        tileMap.UnserializeFrom(element.GetChild("tileMap"));
    }
}

float TileMapObject::GetWidth() const
{
    if(tileSet.IsDirty() || tileMap.GetColumnsCount() == 0 || tileMap.GetRowsCount() == 0)
        return 200.f;
    else
        return tileMap.GetColumnsCount() * tileSet.tileSize.x;
}

float TileMapObject::GetHeight() const
{
    if(tileSet.IsDirty() || tileMap.GetColumnsCount() == 0 || tileMap.GetRowsCount() == 0)
        return 150.f;
    else
        return tileMap.GetRowsCount() * tileSet.tileSize.y;
}

#if defined(GD_IDE_ONLY)
void TileMapObject::DoSerializeTo(gd::SerializerElement & element) const
{
    tileSet.SerializeTo(element.AddChild("tileSet"));
    tileMap.SerializeTo(element.AddChild("tileMap"));
}

void TileMapObject::LoadResources(gd::Project & project, gd::Layout & layout)
{
    tileSet.LoadResources(project);
    tileSet.Generate();
    vertexArray = GenerateVertexArray(tileSet, tileMap);
}
#endif

RuntimeTileMapObject::RuntimeTileMapObject(RuntimeScene & scene, const gd::Object & object) :
    RuntimeObject(scene, object),
    tileSet(),
    tileMap(),
    vertexArray(sf::Quads)
{
    const TileMapObject & tileMapObject = static_cast<const TileMapObject&>(object);

    tileSet = tileMapObject.tileSet;
    tileMap = tileMapObject.tileMap;

    //Load the tileset and generate the vertex array
    tileSet.LoadResources(*(scene.game));
    tileSet.Generate();
    vertexArray = GenerateVertexArray(tileSet, tileMap);
    hitboxes = GenerateHitboxes(tileSet, tileMap);
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
    bool wasSmooth = tileSet.GetTexture().isSmooth();
    tileSet.GetTexture().setSmooth(false);

    //Draw the tilemap
    window.draw(vertexArray, sf::RenderStates(sf::BlendAlpha, transform, &tileSet.GetTexture(), NULL));

    tileSet.GetTexture().setSmooth(wasSmooth);

    return true;
}


float RuntimeTileMapObject::GetWidth() const
{
    if(tileSet.IsDirty() || tileMap.GetColumnsCount() == 0 || tileMap.GetRowsCount() == 0)
        return 200.f;
    else
        return tileMap.GetColumnsCount() * tileSet.tileSize.x;
}

float RuntimeTileMapObject::GetHeight() const
{
    if(tileSet.IsDirty() || tileMap.GetColumnsCount() == 0 || tileMap.GetRowsCount() == 0)
        return 150.f;
    else
        return tileMap.GetRowsCount() * tileSet.tileSize.y;
}

#if defined(GD_IDE_ONLY)
sf::Vector2f TileMapObject::GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const
{
    if(tileSet.IsDirty() || tileMap.GetColumnsCount() == 0 || tileMap.GetRowsCount() == 0)
        return sf::Vector2f(200.f, 150.f);
    else
        return sf::Vector2f(tileMap.GetColumnsCount() * tileSet.tileSize.x, tileMap.GetRowsCount() * tileSet.tileSize.y);
}

/**
 * Render object at edittime
 */
void TileMapObject::DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout)
{
    if(tileSet.IsDirty())
        return;

    //Construct the transform
    sf::Transform transform;
    transform.translate(instance.GetX(), instance.GetY());

    //Unsmooth the texture
    bool wasSmooth = tileSet.GetTexture().isSmooth();
    tileSet.GetTexture().setSmooth(false);

    //Draw the tilemap
    renderTarget.draw(vertexArray, sf::RenderStates(sf::BlendAlpha, transform, &tileSet.GetTexture(), NULL));

    tileSet.GetTexture().setSmooth(wasSmooth);
}

void TileMapObject::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    worker.ExposeImage(tileSet.textureName);
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

