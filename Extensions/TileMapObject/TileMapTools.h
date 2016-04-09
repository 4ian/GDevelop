/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#ifndef TILEMAPTOOLS_H
#define TILEMAPTOOLS_H

#include <vector>
#include <SFML/Graphics.hpp>
#include "GDCpp/Runtime/Polygon2d.h"

class TileSet;
class TileMap;

namespace TileMapExtension
{
	sf::VertexArray GenerateVertexArray(TileSet &tileSet, TileMap &tileMap);
	std::vector<Polygon2d> GenerateHitboxes(TileSet &tileSet, TileMap &tileMap);

    void UpdateVertexArray(sf::VertexArray &vertexArray, int layer, int col, int row, TileSet &tileSet, TileMap &tileMap);
    void UpdateHitboxes(std::vector<Polygon2d> &polygons, sf::Vector2f position, int layer, int col, int row, TileSet &tileSet, TileMap &tileMap);
}

#endif
