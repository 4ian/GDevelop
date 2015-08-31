/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2015 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#include "TileMapTools.h"

#include "TileSet.h"
#include "TileMap.h"

namespace TileMapExtension
{

sf::VertexArray GenerateVertexArray(TileSet &tileSet, TileMap &tileMap)
{
    sf::VertexArray vertexArray(sf::Quads);
    int tileWidth = tileSet.tileSize.x;
    int tileHeight = tileSet.tileSize.y;

    if(tileSet.IsDirty())
        return vertexArray;

    for(int layer = 0; layer < 3; layer++)
    {
        for(int col = 0; col < tileMap.GetColumnsCount(); col++)
        {
            for(int row = 0; row < tileMap.GetRowsCount(); row++)
            {
                TileTextureCoords coords;
                if(tileMap.GetTile(layer, col, row) != -1)
                {
                    coords = tileSet.GetTileTextureCoords(tileMap.GetTile(layer, col, row));
                }
                else
                {
                    coords = tileSet.GetTileTextureCoords(0);
                }

                {
                    sf::Vertex vertex(sf::Vector2f(col * tileWidth, row * tileHeight), coords.topLeft);
                    if(tileMap.GetTile(layer, col, row) == -1)
                        vertex.color.a = 0;
                    vertexArray.append(vertex);
                }
                {
                    sf::Vertex vertex(sf::Vector2f(col * tileWidth, (row + 1) * tileHeight), coords.bottomLeft);
                    if(tileMap.GetTile(layer, col, row) == -1)
                        vertex.color.a = 0;
                    vertexArray.append(vertex);
                }
                {
                    sf::Vertex vertex(sf::Vector2f((col + 1) * tileWidth, (row + 1) * tileHeight), coords.bottomRight);
                    if(tileMap.GetTile(layer, col, row) == -1)
                        vertex.color.a = 0;
                    vertexArray.append(vertex);
                }
                {
                    sf::Vertex vertex(sf::Vector2f((col + 1) * tileWidth, row * tileHeight), coords.topRight);
                    if(tileMap.GetTile(layer, col, row) == -1)
                        vertex.color.a = 0;
                    vertexArray.append(vertex);
                }
            }
        }
    }

    return vertexArray;
}

std::vector<Polygon2d> GenerateHitboxes(TileSet &tileSet, TileMap &tileMap)
{
    std::vector<Polygon2d> hitboxes;
    const int tileWidth = tileSet.tileSize.x;
    const int tileHeight = tileSet.tileSize.y;

    if(tileSet.IsDirty())
        return hitboxes;

    for(int layer = 0; layer < 3; layer++)
    {
        for(int col = 0; col < tileMap.GetColumnsCount(); col++)
        {
            for(int row = 0; row < tileMap.GetRowsCount(); row++)
            {
                //Note : a hitbox is also added for empty/non-collidable tiles to ease the hitbox update when changing a tile
                Polygon2d newPolygon;

                if(tileMap.GetTile(layer, col, row) != -1 && tileSet.IsTileCollidable(tileMap.GetTile(layer, col, row)))
                {
                    newPolygon = tileSet.GetTileHitbox(tileMap.GetTile(layer, col, row)).hitbox;
                }

                newPolygon.Move(col * tileWidth, row * tileHeight);
                hitboxes.push_back(newPolygon);
            }
        }
    }

    return hitboxes;
}

void UpdateVertexArray(sf::VertexArray &vertexArray, int layer, int col, int row, TileSet &tileSet, TileMap &tileMap)
{
    if(tileSet.IsDirty())
        return;

    const int vertexPos = 4 * (layer * tileMap.GetColumnsCount() * tileMap.GetRowsCount() + col * tileMap.GetRowsCount() + row);

    TileTextureCoords newCoords = tileMap.GetTile(layer, col, row) != -1 ? tileSet.GetTileTextureCoords(tileMap.GetTile(layer, col, row)) : tileSet.GetTileTextureCoords(0);
    vertexArray[vertexPos].texCoords = newCoords.topLeft;
    vertexArray[vertexPos + 1].texCoords = newCoords.bottomLeft;
    vertexArray[vertexPos + 2].texCoords = newCoords.bottomRight;
    vertexArray[vertexPos + 3].texCoords = newCoords.topRight;
    for(int i = 0; i < 4; i++)
    {
        if(tileMap.GetTile(layer, col, row) == -1)
        {
            vertexArray[vertexPos + i].color.a = 0;
        }
        else
        {
            vertexArray[vertexPos + i].color.a = 255;
        }
    }
}

void UpdateHitboxes(std::vector<Polygon2d> &polygons, sf::Vector2f position, int layer, int col, int row, TileSet &tileSet, TileMap &tileMap)
{
    if(tileSet.IsDirty())
        return;

    const int vertexPos = layer * tileMap.GetColumnsCount() * tileMap.GetRowsCount() + col * tileMap.GetRowsCount() + row;

    const int tileWidth = tileSet.tileSize.x;
    const int tileHeight = tileSet.tileSize.y;

    if(tileMap.GetTile(layer, col, row) != -1 && tileSet.IsTileCollidable(tileMap.GetTile(layer, col, row)))
    {
        polygons[vertexPos] = tileSet.GetTileHitbox(tileMap.GetTile(layer, col, row)).hitbox;
    }
    else
    {
        polygons[vertexPos] = Polygon2d();
    }

    polygons[vertexPos].Move(position.x + col * tileWidth, position.y + row * tileHeight);
}

}
