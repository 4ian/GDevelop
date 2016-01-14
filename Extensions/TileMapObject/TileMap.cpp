/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
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

gd::String TileMap::SerializeToString() const
{
    gd::String tilesStr;
    for(int layer = 0; layer < 3; layer++)
    {
        tilesStr += SerializeLayer(layer);
        if(layer != 2)
            tilesStr += "#";
    }

    return tilesStr;
}

void TileMap::UnserializeFromString(const gd::String &str)
{
    std::vector<gd::String> tileMapVec = str.Split(U'#');
    for(int layer = 0; layer < std::min((int)tileMapVec.size(), 3); layer++)
    {
        UnserializeLayer(layer, tileMapVec[layer]);
    }
}

gd::String TileMap::SerializeLayer(int layer) const
{
    gd::String tileString; // Will contain a string representing the tiles
                            // (each column is separated by '|' and the rows by ',')
    for(int col = 0; col < m_width; col++)
    {
        for(int row = 0; row < m_height; row++)
        {
            tileString += gd::String::From(GetTile(layer, col, row));
            if(row != (m_height - 1))
                tileString.push_back(U',');
        }

        if(col != (m_width - 1))
            tileString.push_back(U'|');
    }

    return tileString;
}

void TileMap::UnserializeLayer(int layer, const gd::String &str)
{
    std::vector<gd::String> columnsVec = str.Split(U'|');
    for(int col = 0; col < columnsVec.size(); col++)
    {
        gd::String rowsStr = columnsVec[col];
        std::vector<gd::String> rowsVec = rowsStr.Split(U',');

        //Change the tilemap size if needed
        if(m_width < columnsVec.size() || m_height < rowsVec.size())
            SetSize(std::max((int)columnsVec.size(), m_width), std::max((int)rowsVec.size(), m_height));

        for(int row = 0; row < rowsVec.size(); row++)
        {
            SetTile(layer, col, row, rowsVec[row].To<int>());
        }
    }
}
