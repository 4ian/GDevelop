/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#include "TileMapTools.h"

#include "TileSet.h"
#include "TileMap.h"

namespace TileMapExtension
{

sf::VertexArray GenerateVertexArray(TileSet &tileSet, TileMap &tileMap)
{
    sf::VertexArray vertexArray(sf::Triangles);
    int tileWidth = tileSet.tileSize.x;
    int tileHeight = tileSet.tileSize.y;

    if(tileSet.IsDirty())
        return vertexArray;

    vertexArray.resize(3 * tileMap.GetColumnsCount() * tileMap.GetRowsCount() * 6);

    for(int layer = 0; layer < 3; layer++)
    {
        for(int col = 0; col < tileMap.GetColumnsCount(); col++)
        {
            for(int row = 0; row < tileMap.GetRowsCount(); row++)
            {
                unsigned int firstVertexIndex =
                    layer * (tileMap.GetColumnsCount() * tileMap.GetRowsCount() * 6) +
                    col * (tileMap.GetRowsCount() * 6) +
                    row * 6;

                TileTextureCoords coords;
                if(tileMap.GetTile(layer, col, row) != -1)
                {
                    coords = tileSet.GetTileTextureCoords(tileMap.GetTile(layer, col, row));
                }
                else
                {
                    coords = tileSet.GetTileTextureCoords(0);
                }

                sf::Vertex topLeftVertex(sf::Vector2f(col * tileWidth, row * tileHeight), coords.topLeft);
                if(tileMap.GetTile(layer, col, row) == -1)
                    topLeftVertex.color.a = 0;

                sf::Vertex bottomLeftVertex(sf::Vector2f(col * tileWidth, (row + 1) * tileHeight), coords.bottomLeft);
                if(tileMap.GetTile(layer, col, row) == -1)
                    bottomLeftVertex.color.a = 0;

                sf::Vertex bottomRightVertex(sf::Vector2f((col + 1) * tileWidth, (row + 1) * tileHeight), coords.bottomRight);
                if(tileMap.GetTile(layer, col, row) == -1)
                    bottomRightVertex.color.a = 0;

                sf::Vertex topRightVertex(sf::Vector2f((col + 1) * tileWidth, row * tileHeight), coords.topRight);
                if(tileMap.GetTile(layer, col, row) == -1)
                    topRightVertex.color.a = 0;

                vertexArray[firstVertexIndex] = topLeftVertex;
                vertexArray[firstVertexIndex + 1] = bottomLeftVertex;
                vertexArray[firstVertexIndex + 2] = bottomRightVertex;
                vertexArray[firstVertexIndex + 3] = topLeftVertex;
                vertexArray[firstVertexIndex + 4] = bottomRightVertex;
                vertexArray[firstVertexIndex + 5] = topRightVertex;
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

    const unsigned int vertexPos = 6 * (layer * tileMap.GetColumnsCount() * tileMap.GetRowsCount() + col * tileMap.GetRowsCount() + row);

    TileTextureCoords newCoords = tileMap.GetTile(layer, col, row) != -1 ? tileSet.GetTileTextureCoords(tileMap.GetTile(layer, col, row)) : tileSet.GetTileTextureCoords(0);
    vertexArray[vertexPos].texCoords = newCoords.topLeft;
    vertexArray[vertexPos + 1].texCoords = newCoords.bottomLeft;
    vertexArray[vertexPos + 2].texCoords = newCoords.bottomRight;
    vertexArray[vertexPos + 3].texCoords = newCoords.topLeft;
    vertexArray[vertexPos + 4].texCoords = newCoords.bottomRight;
    vertexArray[vertexPos + 5].texCoords = newCoords.topRight;
    for(int i = 0; i < 6; i++)
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
