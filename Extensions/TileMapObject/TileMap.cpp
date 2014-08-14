#include "TileMap.h"

TileMap::TileMap() : 
	m_layers(), 
	m_width(10),
	m_height(5)
{
	AddLayer(0);
}

TileMap::~TileMap()
{

}

void TileMap::AddLayer(int pos, int asCopyOf)
{
    if(asCopyOf == -1)
    {
        //New layer
        m_layers.insert(m_layers.begin() + pos, TileMapLayer());
    }
    else
    {
        //Copy of another layer
        m_layers.insert(m_layers.begin() + pos, TileMapLayer(m_layers[asCopyOf]));
    }

    UpdateMapSize();
}

void TileMap::RemoveLayer(int pos)
{
    m_layers.erase(m_layers.begin() + pos);

    UpdateMapSize();
}

std::pair<int, int> TileMap::GetTile(int layer, int col, int row) const
{
	return m_layers[layer].tiles[col][row];
}

void TileMap::SetTile(int layer, int col, int row, std::pair<int, int> tile)
{
	m_layers[layer].tiles[col][row] = tile;
}

int TileMap::GetLayersCount() const
{
	return m_layers.size();
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
            m_layers[layer].tiles[col].resize(m_height, std::make_pair<int, int>(-1, -1));
        }
        m_layers[layer].tiles.resize(m_width, std::vector< std::pair<int, int> >(m_height, std::make_pair<int, int>(-1, -1)));
    }
}
