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

    int vertexs = 0;

    for(int layer = 0; layer < 3; layer++)
    {
        for(int col = 0; col < tileMap.GetColumnsCount(); col++)
        {
            for(int row = 0; row < tileMap.GetRowsCount(); row++)
            {
                vertexs += 4;

                TileTextureCoords coords = tileMap.GetTile(layer, col, row) != -1 ? tileSet.GetTileTextureCoords(tileMap.GetTile(layer, col, row)) : TileTextureCoords();
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

                if(tileMap.GetTile(layer, col, row) != -1 && tileSet.GetTileHitbox(tileMap.GetTile(layer, col, row)).collidable)
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
    std::cout << "Updating Vertex Array" << std::endl;

    if(tileSet.IsDirty())
        return;

    const int vertexPos = 4 * (layer * tileMap.GetColumnsCount() * tileMap.GetRowsCount() + col * tileMap.GetRowsCount() + row);
    std::cout << " at " << vertexPos << std::endl;

    TileTextureCoords newCoords = tileMap.GetTile(layer, col, row) != -1 ? tileSet.GetTileTextureCoords(tileMap.GetTile(layer, col, row)) : TileTextureCoords();
    vertexArray[vertexPos].texCoords = newCoords.topLeft;
    vertexArray[vertexPos + 1].texCoords = newCoords.bottomLeft;
    vertexArray[vertexPos + 2].texCoords = newCoords.bottomRight;
    vertexArray[vertexPos + 3].texCoords = newCoords.topRight;

    std::cout << " [Done]" << std::endl;
}

void UpdateHitboxes(std::vector<Polygon2d> &polygons, sf::Vector2f position, int layer, int col, int row, TileSet &tileSet, TileMap &tileMap)
{
    if(tileSet.IsDirty())
        return;

    const int vertexPos = layer * tileMap.GetColumnsCount() * tileMap.GetRowsCount() + col * tileMap.GetRowsCount() + row;

    const int tileWidth = tileSet.tileSize.x;
    const int tileHeight = tileSet.tileSize.y;

    if(tileMap.GetTile(layer, col, row) != -1 && tileSet.GetTileHitbox(tileMap.GetTile(layer, col, row)).collidable)
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
