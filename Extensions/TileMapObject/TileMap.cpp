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
    for(int layer = 0; layer < 3; layer++)
    {
        gd::SerializerElement &layerElement = tilesElement.AddChild("layer" + gd::ToString(layer));
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

        layerElement.SetValue(tileString);
    }
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
        for(int layer = 0; layer < 3; layer++)
        {
            if(tilesElement.HasChild("layer" + gd::ToString(layer)))
            {
                gd::SerializerElement &layerElement = tilesElement.GetChild("layer" + gd::ToString(layer));
                std::string columnsStr = layerElement.GetValue().GetString();
                std::vector<std::string> columnsVec = gd::SplitString<std::string>(columnsStr, '|');
                for(int col = 0; col < columnsVec.size(); col++)
                {
                    std::string rowsStr = columnsVec[col];
                    std::vector<std::string> rowsVec = gd::SplitString<std::string>(rowsStr, ',');
                    for(int row = 0; row < rowsVec.size(); row++)
                    {
                        SetTile(layer, col, row, gd::ToInt(rowsVec[row]));
                    }
                }
            }
        }
    }
}
