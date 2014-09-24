/**

GDevelop - Tile Map Extension
Copyright (c) 2014 Victor Levasseur (victorlevasseur52@gmail.com)

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

#include "RuntimeTileMapObject.h"

#include <SFML/Graphics.hpp>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Object.h"
#include "GDCpp/Project.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/ImageManager.h"
#include "GDCpp/FontManager.h"
#include "GDCpp/Position.h"
#include "GDCpp/Polygon2d.h"
#include "GDCpp/PolygonCollision.h"
#include "GDCpp/BuiltinExtensions/ObjectTools.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/CommonTools.h"

#include "TileMapObject.h"
#include "TileMap.h"
#include "TileSet.h"
#include "TileMapTools.h"

RuntimeTileMapObject::RuntimeTileMapObject(RuntimeScene & scene, const gd::Object & object) :
    RuntimeObject(scene, object),
    tileSet(),
    tileMap(),
    vertexArray(sf::Quads),
    oldX(0),
    oldY(0),
    needGeneration(false)
{
    const TileMapObject & tileMapObject = static_cast<const TileMapObject&>(object);

    tileSet = tileMapObject.tileSet;
    tileMap = tileMapObject.tileMap;

    //Load the tileset and generate the vertex array
    tileSet.Get().LoadResources(*(scene.game));
    tileSet.Get().Generate();
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
void RuntimeTileMapObject::GetPropertyForDebugger(unsigned int propertyNb, std::string & name, std::string & value) const
{

}

bool RuntimeTileMapObject::ChangeProperty(unsigned int propertyNb, std::string newValue)
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

    needGeneration = true; //The tilemap object will be re-generated before the next rendering
    tileMap.Get().SetTile(layer, column, row, tileId);
}

float RuntimeTileMapObject::GetColumnAt(float x)
{
    return static_cast<float>(floor((x - GetX())/tileSet.Get().tileSize.x));
}

float RuntimeTileMapObject::GetRowAt(float y)
{
    return static_cast<float>(floor((y - GetY())/tileSet.Get().tileSize.y));
}

std::string RuntimeTileMapObject::SaveAsString() const
{
    return tileMap.Get().SerializeToString();
}

void RuntimeTileMapObject::LoadFromString(const std::string &str)
{
    tileMap.Get().UnserializeFromString(str);
    needGeneration = true;
}

void RuntimeTileMapObject::ChangeTexture(const std::string &textureName, RuntimeScene &scene)
{
    tileSet.Get().textureName = textureName;
    tileSet.Get().LoadResources(*(scene.game));
    tileSet.Get().Generate();
    needGeneration = true;
}

namespace
{
    /**
     * Extra parameter struct for the TwoObjectListsTest.
     */
    struct TileExtraParameter : public ListsTestFuncExtraParameter
    {
        TileExtraParameter(int layer_, int column_, int row_) : ListsTestFuncExtraParameter(), layer(layer_), column(column_), row(row_) {};

        int layer;
        int column;
        int row;
    };

    bool TileCollisionInnerTest(RuntimeObject *tileMapObject_, RuntimeObject *object, const ListsTestFuncExtraParameter &extraParameter)
    {
        RuntimeTileMapObject *tileMapObject = dynamic_cast<RuntimeTileMapObject*>(tileMapObject_);
        if(!tileMapObject || tileMapObject->tileSet.Get().IsDirty())
            return false;

        const TileExtraParameter &tileExtraParam = dynamic_cast<const TileExtraParameter&>(extraParameter);

        //Get the tile hitbox
        Polygon2d tileHitbox = tileMapObject->tileSet.Get().GetTileHitbox(tileMapObject->tileMap.Get().GetTile(tileExtraParam.layer, tileExtraParam.column, tileExtraParam.row)).hitbox;
        tileHitbox.Move(tileMapObject->GetX() + tileExtraParam.column * tileMapObject->tileSet.Get().tileSize.x,
                        tileMapObject->GetY() + tileExtraParam.row * tileMapObject->tileSet.Get().tileSize.y);

        //Get the object hitbox
        std::vector<Polygon2d> objectHitboxes = object->GetHitBoxes();

        for(std::vector<Polygon2d>::iterator hitboxIt = objectHitboxes.begin(); hitboxIt != objectHitboxes.end(); ++hitboxIt)
        {
            if(PolygonCollisionTest(tileHitbox, *hitboxIt).collision)
            {
                return true;
            }
        }

        return false;
    }
}

bool GD_EXTENSION_API SingleTileCollision(std::map<std::string, std::vector<RuntimeObject*>*> tileMapList,
                         int layer,
                         int column,
                         int row,
                         std::map<std::string, std::vector<RuntimeObject*>*> objectLists,
                         bool conditionInverted)
{
    return TwoObjectListsTest(tileMapList, objectLists, conditionInverted, &TileCollisionInnerTest, TileExtraParameter(layer, column, row));
}

void DestroyRuntimeTileMapObject(RuntimeObject * object)
{
    delete object;
}

RuntimeObject * CreateRuntimeTileMapObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeTileMapObject(scene, object);
}
