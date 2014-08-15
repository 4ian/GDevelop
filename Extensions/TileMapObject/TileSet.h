#ifndef TILESET_H
#define TILESET_H

#ifdef GD_IDE_ONLY
#include <wx/bitmap.h>
#endif

#include <string>
#include <vector>
#include <SFML/System/Vector2.hpp>
#include <GDCore/PlatformDefinition/ImageManager.h>
#include <GDCore/PlatformDefinition/Project.h>

struct TileTextureCoords
{
    sf::Vector2f topLeft;
    sf::Vector2f topRight;
    sf::Vector2f bottomRight;
    sf::Vector2f bottomLeft;
};

class TileSet
{

public:
    TileSet();
    TileSet(const TileSet &other);
    ~TileSet();

    std::string textureName; ///< The texture name.
    sf::Vector2f tileSize; ///< Tile size
    sf::Vector2f tileSpacing; ///< Space between tile on the tileset texture.

    /**
     * Load the image for the tilemap.
     */
    void LoadResources(gd::Project &game);

    /**
     * Generate the tile texture coords and temporary bitmaps for the IDE.
     */
    void Generate();

    /**
     * Return the tile ID according to its position
     */
    int GetTileIDFromPosition(sf::Vector2f position);
    int GetTileIDFromCell(int col, int row);

#ifdef GD_IDE_ONLY
    /**
     * Returns the tileset bitmap
     */
    const wxBitmap& GetWxBitmap() const;

    /**
     * Get a tile bitmap from its ID (only available in the IDE)
     */
    const wxBitmap& GetTileBitmap(int id) const;
#endif

    /**
     * Get the tile texture coords (four sf::Vector2f) from its ID
     */
    TileTextureCoords GetTileTextureCoords(int id) const;

    /**
     * Returns the size of the tileset (in pixels)
     */
    sf::Vector2u GetSize() const;

    /**
     * Returns the number of columns of the tileset
     */
    int GetColumnsCount() const;

    /**
     * Returns the number of rows of the tileset
     */
    int GetRowsCount() const;

private:

    boost::shared_ptr<SFMLTextureWrapper> m_tilesetTexture;
    std::vector<TileTextureCoords> m_coords;
    
    #ifdef GD_IDE_ONLY
    wxBitmap m_tilesetBitmap;
    std::vector<wxBitmap> m_bitmaps;
    #endif

};

#endif