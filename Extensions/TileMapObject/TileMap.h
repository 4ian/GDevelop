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

#ifndef TILEMAP_H
#define TILEMAP_H

#include <map>
#include <vector>
#include <GDCore/Serialization/SerializerElement.h>

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

    #if defined(GD_IDE_ONLY)
    /**
     * Serialize the tilemap into the given element
     */
    void SerializeTo(gd::SerializerElement &element) const;
    #endif

    /**
     * Unserialize the tilemap from the given element
     */
    void UnserializeFrom(const gd::SerializerElement &element);

    /**
     * Returns a std::string representing the whole tilemap content
     */
    std::string SerializeToString() const;

    /**
     * Loads the tilemap from a std::string.
     */
    void UnserializeFromString(const std::string &str);

private:
	void UpdateMapSize();

    /**
     * Returns a std::string representing the content of the layer
     */
    std::string SerializeLayer(int layer) const;

    /**
     * Load a layer from its std::string representation
     */
    void UnserializeLayer(int layer, const std::string &str);

	std::vector<TileMapLayer> m_layers;
	int m_width;
	int m_height;
};

#endif