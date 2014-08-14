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
    std::vector< std::vector< std::pair<int, int> > > tiles; ///< Contains all tiles, the column is the first index and the row is the second. 
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
     * Add a new layer
     * \param pos Where to create the layer (next layers will be moved after)
     * \param asCopyOf Create the layer as a copy of that layer. (Set to -1 to create a blank layer)
     */
    void AddLayer(int pos, int asCopyOf = -1);

    /**
     * Remove a layer
     * \param pos The layer to delete
     */
    void RemoveLayer(int pos);

    /**
     * Get a tile
     */
    std::pair<int, int> GetTile(int layer, int col, int row) const;

    /**
     * Set a tile
     */
    void SetTile(int layer, int col, int row, std::pair<int, int> tile);

    /**
     * \return the number of layers in the tilemap.
     */
    int GetLayersCount() const;

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