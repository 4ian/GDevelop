/**

Game Develop - Tile Map Extension
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

#include "TileMap.h"

#include <GDCore/CommonTools.h>

TileMap::TileMap() : 
	m_layers(3, TileMapLayer()), 
	m_width(10),
	m_height(5)
{
	UpdateMapSize();
}

TileMap::~TileMap()
{

}

int TileMap::GetTile(int layer, int col, int row) const
{
	return m_layers[layer].tiles[col][row];
}

void TileMap::SetTile(int layer, int col, int row, int tile)
{
	m_layers[layer].tiles[col][row] = tile;
}

int TileMap::GetRowsCount() const
{
	return m_height;
}

int TileMap::GetColumnsCount() const
{
	return m_width;
}

void TileMap::SetSize(int columns, int rows)
{
	m_width = columns;
	m_height = rows;

	UpdateMapSize();
}

void TileMap::UpdateMapSize()
{
    for(int layer = 0; layer < m_layers.size(); layer++)
    {
        for(int col = 0; col < m_layers[layer].tiles.size(); col++)
        {
            m_layers[layer].tiles[col].resize(m_height, -1);
        }
        m_layers[layer].tiles.resize(m_width, std::vector< int >(m_height, -1));
    }
}

#if defined(GD_IDE_ONLY)
void TileMap::SerializeTo(gd::SerializerElement &element) const
{
    element.SetAttribute("columns", m_width);
    element.SetAttribute("rows", m_height);

    //Save the tiles
    gd::SerializerElement &tilesElement = element.AddChild("tiles");
    tilesElement.SetValue(SerializeToString());
}
#endif

void TileMap::UnserializeFrom(const gd::SerializerElement &element)
{
    m_width = element.GetIntAttribute("columns", 10);
    m_height = element.GetIntAttribute("rows", 5);
    UpdateMapSize();

    if(element.HasChild("tiles"))
    {
        gd::SerializerElement &tilesElement = element.GetChild("tiles");
        UnserializeFromString(tilesElement.GetValue().GetString());
    }
}

std::string TileMap::SerializeToString() const
{
    std::string tilesStr;
    for(int layer = 0; layer < 3; layer++)
    {
        tilesStr += SerializeLayer(layer);
        if(layer != 2)
            tilesStr += "#";
    }

    return tilesStr;
}

void TileMap::UnserializeFromString(const std::string &str)
{
    std::vector<std::string> tileMapVec = gd::SplitString<std::string>(str, '#');
    for(int layer = 0; layer < std::min((int)tileMapVec.size(), 3); layer++)
    {
        UnserializeLayer(layer, tileMapVec[layer]);
    }
}

std::string TileMap::SerializeLayer(int layer) const
{
    std::string tileString; // Will contain a string representing the tiles 
                            // (each column is separated by '|' and the rows by ',')
    for(int col = 0; col < m_width; col++)
    {
        for(int row = 0; row < m_height; row++)
        {
            tileString += gd::ToString(GetTile(layer, col, row));
            if(row != (m_height - 1))
                tileString += ",";
        }

        if(col != (m_width - 1))
            tileString += "|";
    }

    return tileString;
}

void TileMap::UnserializeLayer(int layer, const std::string &str)
{
    std::vector<std::string> columnsVec = gd::SplitString<std::string>(str, '|');
    for(int col = 0; col < columnsVec.size(); col++)
    {
        std::string rowsStr = columnsVec[col];
        std::vector<std::string> rowsVec = gd::SplitString<std::string>(rowsStr, ',');

        //Change the tilemap size if needed
        if(m_width < columnsVec.size() || m_height < rowsVec.size())
            SetSize(std::max((int)columnsVec.size(), m_width), std::max((int)rowsVec.size(), m_height));

        for(int row = 0; row < rowsVec.size(); row++)
        {
            SetTile(layer, col, row, gd::ToInt(rowsVec[row]));
        }
    }
}
