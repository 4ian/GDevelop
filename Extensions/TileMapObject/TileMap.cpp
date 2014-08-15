#include "TileMap.h"

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
