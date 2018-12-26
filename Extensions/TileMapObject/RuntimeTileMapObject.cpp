/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#include "RuntimeTileMapObject.h"

#include <SFML/Graphics.hpp>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/RuntimeGame.h"
#include "GDCpp/Runtime/ImageManager.h"
#include "GDCpp/Runtime/FontManager.h"
#include "GDCpp/Runtime/Project/InitialInstance.h"
#include "GDCpp/Runtime/Polygon2d.h"
#include "GDCpp/Runtime/PolygonCollision.h"
#include "GDCpp/Runtime/RuntimeObjectsListsTools.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "GDCpp/Runtime/CommonTools.h"

#include "TileMapObject.h"
#include "TileMap.h"
#include "TileSet.h"
#include "TileMapTools.h"

RuntimeTileMapObject::RuntimeTileMapObject(RuntimeScene & scene, const TileMapObject & tileMapObject) :
    RuntimeObject(scene, tileMapObject),
    tileSet(),
    tileMap(),
    vertexArray(sf::Quads),
    oldX(0),
    oldY(0),
    needGeneration(false)
{
    tileSet = tileMapObject.tileSet;
    tileMap = tileMapObject.tileMap;

    //Load the tileset and generate the vertex array
    tileSet.Get().LoadResources(*(scene.game));
    vertexArray = TileMapExtension::GenerateVertexArray(tileSet.Get(), tileMap.Get());
    hitboxes = TileMapExtension::GenerateHitboxes(tileSet.Get(), tileMap.Get());
}

/**
 * Render object at runtime
 */
bool RuntimeTileMapObject::Draw( sf::RenderTarget& window )
{
    if(needGeneration)
    {
        //Re-generate the vertex array and the hitboxes
        vertexArray = TileMapExtension::GenerateVertexArray(tileSet.Get(), tileMap.Get());
        hitboxes = TileMapExtension::GenerateHitboxes(tileSet.Get(), tileMap.Get());
        for(std::vector<Polygon2d>::iterator it = hitboxes.begin(); it != hitboxes.end(); it++)
        {
            it->Move(GetX(), GetY());
        }
        needGeneration = false;
    }

    //Don't draw anything if hidden
    if ( hidden ) return true;

    //Get the current view
    sf::View currentView = window.getView();
    sf::Vector2f centerPos = currentView.getCenter();

    //Construct the transform
    sf::Transform transform;
    transform.translate((int)GetX() + centerPos.x - floor(centerPos.x),
                        (int)GetY() + centerPos.y - floor(centerPos.y));

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
    //Moves all hitboxes (use the previous pos to move them)
    for(std::vector<Polygon2d>::iterator it = hitboxes.begin(); it != hitboxes.end(); it++)
    {
        it->Move(GetX() - oldX, GetY() - oldY);
    }

    oldX = GetX();
    oldY = GetY();
}

#ifdef GD_IDE_ONLY
void RuntimeTileMapObject::GetPropertyForDebugger(std::size_t propertyNb, gd::String & name, gd::String & value) const
{

}

bool RuntimeTileMapObject::ChangeProperty(std::size_t propertyNb, gd::String newValue)
{
    return true;
}

std::size_t RuntimeTileMapObject::GetNumberOfProperties() const
{
    return 0;
}
#endif

std::vector<Polygon2d> RuntimeTileMapObject::GetHitBoxes() const
{
    return hitboxes;
}

std::vector<Polygon2d> RuntimeTileMapObject::GetHitBoxes(sf::FloatRect hint) const
{
    std::vector<Polygon2d> polygons;

    if( !hint.intersects( sf::FloatRect(GetX(), GetY(), GetWidth(), GetHeight()) ) )
        return polygons;

    //Get the tiles coords according to the hint
    sf::Vector2u topLeft, bottomRight;

    if(hint.left < GetX())
        topLeft.x = 0;
    else
        topLeft.x = (hint.left - GetX()) / GetTileWidth();

    if(hint.top < GetY())
        topLeft.y = 0;
    else
        topLeft.y = (hint.top - GetY()) / GetTileHeight();

    if(hint.left + hint.width > GetX() + GetWidth())
        bottomRight.x = GetMapWidth() - 1;
    else
        bottomRight.x = (hint.left + hint.width - GetX()) / GetTileWidth();

    if(hint.top + hint.height > GetY() + GetHeight())
        bottomRight.y = GetMapHeight() - 1;
    else
        bottomRight.y = (hint.top + hint.height - GetY()) / GetTileHeight();

    //Add the polygons
    for( std::size_t i = topLeft.x; i <= bottomRight.x; ++i ) //Columns
    {
        for( std::size_t j = topLeft.y; j <= bottomRight.y; ++j ) //Rows
        {
            for(std::size_t k = 0; k < 3; ++k) //Layers
            {
                std::size_t tileIndex =
                    k * GetMapHeight() * GetMapWidth() +
                    i * GetMapHeight() +
                    j;

                polygons.push_back(hitboxes[tileIndex]);
            }
        }
    }

    return polygons;
}

float RuntimeTileMapObject::GetTileWidth() const
{
    return tileSet.Get().tileSize.x;
}

float RuntimeTileMapObject::GetTileHeight() const
{
    return tileSet.Get().tileSize.y;
}

float RuntimeTileMapObject::GetMapWidth() const
{
    return static_cast<float>(tileMap.Get().GetColumnsCount());
}

float RuntimeTileMapObject::GetMapHeight() const
{
    return static_cast<float>(tileMap.Get().GetRowsCount());
}

void RuntimeTileMapObject::SetMapSize(int width, int height)
{
    if(width < 0 || height < 0 || (GetMapWidth() == width && GetMapHeight() == height)) //Avoid changing the size if the same
        return;

    tileMap.Get().SetSize(width, height);
    vertexArray = TileMapExtension::GenerateVertexArray(tileSet.Get(), tileMap.Get());
    hitboxes = TileMapExtension::GenerateHitboxes(tileSet.Get(), tileMap.Get());
}

float RuntimeTileMapObject::GetTile(int layer, int column, int row)
{
    if(layer < 0 || layer > 2 || column < 0 || column >= tileMap.Get().GetColumnsCount() || row < 0 || row >= tileMap.Get().GetRowsCount())
        return -1.f;

    return static_cast<float>(tileMap.Get().GetTile(layer, column, row));
}

void RuntimeTileMapObject::SetTile(int layer, int column, int row, int tileId)
{
    if(layer < 0 || layer > 2 || column < 0 || column >= tileMap.Get().GetColumnsCount() || row < 0 || row >= tileMap.Get().GetRowsCount())
        return;

    //Just update a single tile in the tile map
    tileMap.Get().SetTile(layer, column, row, tileId);
    TileMapExtension::UpdateVertexArray(vertexArray, layer, column, row, tileSet.Get(), tileMap.Get());
    TileMapExtension::UpdateHitboxes(hitboxes, sf::Vector2f(GetX(), GetY()), layer, column, row, tileSet.Get(), tileMap.Get());
}

float RuntimeTileMapObject::GetColumnAt(float x)
{
    return static_cast<float>(floor((x - GetX())/tileSet.Get().tileSize.x));
}

float RuntimeTileMapObject::GetRowAt(float y)
{
    return static_cast<float>(floor((y - GetY())/tileSet.Get().tileSize.y));
}

gd::String RuntimeTileMapObject::SaveAsString() const
{
    return tileMap.Get().SerializeToString();
}

void RuntimeTileMapObject::LoadFromString(const gd::String &str)
{
    tileMap.Get().UnserializeFromString(str);
    needGeneration = true;
}

void RuntimeTileMapObject::ChangeTexture(const gd::String &textureName, RuntimeScene &scene)
{
    tileSet.Get().textureName = textureName;
    tileSet.Get().LoadResources(*(scene.game));
    needGeneration = true;
}

bool GD_EXTENSION_API SingleTileCollision(std::map<gd::String, std::vector<RuntimeObject*>*> tileMapList,
                         int layer,
                         int column,
                         int row,
                         std::map<gd::String, std::vector<RuntimeObject*>*> objectLists,
                         bool conditionInverted)
{
    return TwoObjectListsTest(tileMapList, objectLists, conditionInverted, [layer, column, row](RuntimeObject* tileMapObject_, RuntimeObject * object) {
        RuntimeTileMapObject *tileMapObject = dynamic_cast<RuntimeTileMapObject*>(tileMapObject_);
        if(!tileMapObject || tileMapObject->tileSet.Get().IsDirty())
            return false;

        //Get the tile hitbox
        int tileId = tileMapObject->tileMap.Get().GetTile(layer, column, row);
        if(tileId < 0 || tileId >= tileMapObject->tileSet.Get().GetTilesCount())
            return false;

        Polygon2d tileHitbox = tileMapObject->tileSet.Get().GetTileHitbox(tileId).hitbox;
        tileHitbox.Move(tileMapObject->GetX() + column * tileMapObject->tileSet.Get().tileSize.x,
                        tileMapObject->GetY() + row * tileMapObject->tileSet.Get().tileSize.y);

        //Get the object hitbox
        std::vector<Polygon2d> objectHitboxes = object->GetHitBoxes();

        for(std::vector<Polygon2d>::iterator hitboxIt = objectHitboxes.begin(); hitboxIt != objectHitboxes.end(); ++hitboxIt)
        {
            if(PolygonCollisionTest(tileHitbox, *hitboxIt, false).collision)
            {
                return true;
            }
        }

        return false;
    });
}
