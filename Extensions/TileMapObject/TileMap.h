#ifndef TILEMAP_H
#define TILEMAP_H

#include <map>
#include <vector>

/**
 * \brief Represents a TileMap layer.
 * This class represents a tilemap layer. It contains all tiles of the layer stored by column and row. 
 * Tiles are represented by two number corresponding to the position of the tile in the TileSet.
 * \sa TileMap
 */
struct TileMapLayer
{
    std::vector< std::vector< int > > tiles; ///< Contains all tiles, the column is the first index and the row is the second. 
    														 ///  the pair contains the tile position into the TileSet.
};

/**
 * \brief Represents a tilemap.
 * This class represents a tilemap
 */
class TileMap
{
public:
	TileMap();
	~TileMap();

    /**
     * Get a tile
     */
    int GetTile(int layer, int col, int row) const;

    /**
     * Set a tile
     */
    void SetTile(int layer, int col, int row, int tile);

    /**
     * \return the number of rows in the tilemap.
     */
    int GetRowsCount() const;

    /**
     * \return the number of columns in the tilemap.
     */
    int GetColumnsCount() const;

    /**
     * Set size of the tilemap.
     */
    void SetSize(int columns, int rows);

private:
	void UpdateMapSize();

	std::vector<TileMapLayer> m_layers;
	int m_width;
	int m_height;
};

#endif