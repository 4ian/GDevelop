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
#include <GDCore/Serialization/SerializerElement.h>
#include <GDCpp/Polygon.h>
#include <GDCpp/RuntimeGame.h>

struct TileTextureCoords
{
    sf::Vector2f topLeft;
    sf::Vector2f topRight;
    sf::Vector2f bottomRight;
    sf::Vector2f bottomLeft;
};

struct TileHitbox
{
    bool collidable;
    Polygon2d hitbox;

    /**
     * Generates a default hitbox (rectangle of the size of the tile).
     */
    static TileHitbox Rectangle(sf::Vector2f tileSize);

    /**
     * Serialize the TileHitbox into the given gd::SerializerElement.
     */
    void SerializeTo(gd::SerializerElement &element) const;

    /**
     * Unserialize the TileHitBox from the giver gd::SerializerElement.
     * \param element the serializer element
     * \param the tile size to create a default collision rectangle if the collision polygon is not set.
     */
    void UnserializeFrom(const gd::SerializerElement &element, sf::Vector2f defaultTileSize);
};

class TileSet
{

public:
    TileSet();
    ~TileSet();

    std::string textureName; ///< The texture name.
    sf::Vector2f tileSize; ///< Tile size
    sf::Vector2f tileSpacing; ///< Space between tile on the tileset texture.

    /**
     * Returns true if the tileset hasn't been loaded and generated from a picture.
     */
    bool IsDirty() const {return m_dirty;};

    /**
     * Load the image for the tilemap.
     */
    void LoadResources(gd::Project &game);
    void LoadResources(RuntimeGame &game);

    /**
     * Generate the tile texture coords and temporary bitmaps for the IDE.
     */
    void Generate();

    /**
     * Reset the hitbox for all tiles
     */
    void ResetHitboxes();

    /**
     * Return the tile ID according to its position.
     */
    int GetTileIDFromPosition(sf::Vector2f position);

    /**
     * Return the tile ID according to its row and column.
     */
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
     * Returns the SFML texture.
     */
    sf::Texture& GetTexture();

    /**
     * Returns the SFML texture (read-only).
     */
    const sf::Texture& GetTexture() const;

    /**
     * Get the tile texture coords (four sf::Vector2f) from its ID
     */
    TileTextureCoords GetTileTextureCoords(int id) const;

    /**
     * Returns the size of the tileset (in pixels)
     */
    sf::Vector2u GetSize() const;

    /**
     * Get the hitbox of a tile.
     */
    TileHitbox& GetTileHitbox(int id);
    const TileHitbox& GetTileHitbox(int id) const;

    /**
     * Returns the number of tiles of the tileset.
     */
    int GetTilesCount() const {return GetColumnsCount()*GetRowsCount();};

    /**
     * Returns the number of columns of the tileset
     */
    int GetColumnsCount() const;

    /**
     * Returns the number of rows of the tileset
     */
    int GetRowsCount() const;

    #if defined(GD_IDE_ONLY)
    /**
     * Serialize the tileset into the given element
     */
    void SerializeTo(gd::SerializerElement &element) const;
    #endif

    /**
     * Unserialize the tileset from the given element
     */
    void UnserializeFrom(const gd::SerializerElement &element);

private:

    boost::shared_ptr<SFMLTextureWrapper> m_tilesetTexture; ///< The tileset texture (SFML)
    std::vector<TileTextureCoords> m_coords; ///< The tileset coords

    std::vector<TileHitbox> m_hitboxes;
    
    #ifdef GD_IDE_ONLY
    wxBitmap m_tilesetBitmap; ///< The tileset texture
    std::vector<wxBitmap> m_bitmaps;
    static wxBitmap m_invalidBitmap;
    #endif

    bool m_dirty;

};

#endif