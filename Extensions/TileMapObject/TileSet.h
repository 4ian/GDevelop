/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#ifndef TILESET_H
#define TILESET_H

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h>
#endif

#include <map>
#include <string>
#include <vector>
#include <SFML/System/Vector2.hpp>
#include "GDCore/Project/ImageManager.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCpp/Runtime/Polygon2d.h"
#include "GDCpp/Runtime/RuntimeGame.h"

/**
 * \brief Contains the coordinates of the texture sub-rect
 */
struct TileTextureCoords
{
    TileTextureCoords() : topLeft(0,0), topRight(0,0), bottomRight(0,0), bottomLeft(0,0) {};

    sf::Vector2f topLeft;
    sf::Vector2f topRight;
    sf::Vector2f bottomRight;
    sf::Vector2f bottomLeft;
};

struct TileHitbox
{
    /**
     * Used to specify the position of the right angle of a right-angled triangle
     */
    enum TriangleOrientation
    {
        TopLeft, ///< In the top-left hand corner
        TopRight, ///< In the top-right hand corner
        BottomRight, ///< In the bottom-right hand corner
        BottomLeft ///< In the bottom-left hand corner
    };

    Polygon2d hitbox; ///< The polygonal hitbox

    bool operator==(const TileHitbox &other) const;
    bool operator!=(const TileHitbox &other) const;

    /**
     * Generates a default hitbox (rectangle of the size of the tile).
     */
    static TileHitbox Rectangle(sf::Vector2f tileSize);

    /**
     * Generates a right-angled triangle (which fit in a tile).
     * \param tileSize the size of the tile
     * \param orientation specify where the right angle should be
     */
    static TileHitbox Triangle(sf::Vector2f tileSize, TriangleOrientation orientation);

    /**
     * Serialize the TileHitbox into the given gd::SerializerElement.
     */
    void SerializeTo(gd::SerializerElement &element) const;

    /**
     * Unserialize the TileHitBox from the giver gd::SerializerElement.
     * \param element the serializer element
     * \param defaultTileSize the tile size to create a default collision rectangle if the collision polygon is not set.
     */
    void UnserializeFrom(const gd::SerializerElement &element, sf::Vector2f defaultTileSize);
};

/**
 * \brief Contains all the stuff related to the tileset (the texture containing all tiles).
 *
 * The TileSet class contains the texture name (path), the tile size and the tile spacing (space between tiles on the texture).
 *
 * Before the first use or after a texture change, you will need to call TileSet::LoadResources to load the texture from the ImageManager.
 */
class TileSet
{

public:
    TileSet();
    ~TileSet();

    gd::String textureName; ///< The texture name.
    sf::Vector2f tileSize; ///< Tile size
    sf::Vector2f tileSpacing; ///< Space between tile on the tileset texture.

    /**
     * \name Loading and computations
     */
    ///\{
    /**
     * Returns true if the tileset hasn't been loaded (texture not loaded) or have an invalid tile size.
     * \warning Can return true even if the loaded texture doesn't correspond to the TileSet::textureName
     */
    bool IsDirty() const
    {
        return (!m_tilesetTexture || m_tilesetTexture->texture.getSize().x == 0.f || m_tilesetTexture->texture.getSize().y == 0.f || tileSize.x == 0.f || tileSize.y == 0.f);
    }

    /**
     * Load the image for the tilemap. Need to be called when using the TileSet for the first or after a texture change.
     * \note This function overload is used to load the texture before using the TileSet
     * at edit time or in the TileMapObjectEditor because it also loads the texture as a wxBitmap.
     */
    void LoadResources(gd::Project &game);

    /**
     * Load the image for the tilemap. Need to be called when using the TileSet for the first or after a texture change.
     * \note This function overload is used to load the texture before using the TileSet
     * in the scene preview or in a release game.
     */
    void LoadResources(RuntimeGame &game);
    ///\}

    /**
     * \name Textures
     */
    ///\{
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    /**
     * Returns the tileset bitmap
     */
    const wxBitmap& GetWxBitmap() const;
#endif

    /**
     * \return the SFML texture.
     */
    sf::Texture& GetTexture();

    /**
     * \return the SFML texture (read-only).
     */
    const sf::Texture& GetTexture() const;

    /**
     * \return the tile texture coords (four sf::Vector2f) from its ID
     */
    TileTextureCoords GetTileTextureCoords(int id) const;

    /**
     * \return the size of the tileset (in pixels)
     */
    sf::Vector2u GetSize() const;
    ///\}

    /**
     * \name Hitbox
     */
    ///\{
    /**
     * Reset the hitbox for all tiles. Set a rectangular hitbox for each available tiles.
     */
    void ResetHitboxes();

    bool IsTileCollidable(int id) const;

    void SetTileCollidable(int id, bool collidable);

    /**
     * \return a reference to the hitbox of a tile.
     * Allows the edition of the hitbox.
     */
    TileHitbox& GetTileHitboxRef(int id);

    /**
     * \return the hitbox of a tile.
     */
    TileHitbox GetTileHitbox(int id) const;

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Strips useless hitboxes (the default rectangle hitbox) from the hitboxes data of the tileset.
     * The tileset keeps only non-default hitboxes in memory (the default hitbox for tiles is a rectangle with the same size as tiles).
     * This method checks if the tileset stores default hitbox and remove them as they are useless.
     */
    void StripUselessHitboxes();
    #endif
    ///\}

    /**
     * \name Tiles
     */
    ///\{
    /**
     * Return the tile ID according to its position.
     */
    int GetTileIDFromPosition(sf::Vector2f position) const;

    /**
     * Return the tile ID according to its row and column.
     */
    int GetTileIDFromCell(int col, int row) const;

    /**
     * Return the tile cell (col, row) from its ID.
     */
    sf::Vector2u GetTileCellFromID(int id) const;

    /**
     * \return the number of tiles of the tileset.
     */
    int GetTilesCount() const {return GetColumnsCount()*GetRowsCount();};

    /**
     * \return the number of columns of the tileset
     */
    int GetColumnsCount() const;

    /**
     * \return the number of rows of the tileset
     */
    int GetRowsCount() const;
    ///\}

    /**
     * \name Serialization
     */
    ///\{
    #if defined(GD_IDE_ONLY)
    /**
     * Serialize the tileset into the given element
     * \param element the element to serialize the TileSet into
     */
    void SerializeTo(gd::SerializerElement &element) const;
    #endif

    /**
     * Unserialize the tileset from the given element
     * \param element the element to unserialize the TileSet from
     */
    void UnserializeFrom(const gd::SerializerElement &element);
    ///\}

private:

    std::shared_ptr<SFMLTextureWrapper> m_tilesetTexture; ///< The tileset texture (SFML)

    std::vector<bool> m_collidable;
    std::map<int, TileHitbox> m_hitboxes;

    #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    wxBitmap m_tilesetBitmap; ///< The tileset texture
    static wxBitmap m_invalidBitmap;
    #endif

};

#endif
