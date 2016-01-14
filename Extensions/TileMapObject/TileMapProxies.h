/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#ifndef TILEMAPPROXIES_H
#define TILEMAPPROXIES_H

class TileMap;
class TileSet;

/**
 * \brief Lightweight proxy class for the TileMap
 * \note Needed because TileMap includes wx/bitmap.h which is not avaible when
 * compiling for runtime.
 */
class TileMapProxy
{
public:
    TileMapProxy();
    TileMapProxy(const TileMap &tilemap);
    TileMapProxy(const TileMapProxy &other);
    ~TileMapProxy();
    TileMapProxy& operator=(const TileMapProxy &other);

    TileMap& Get();
    const TileMap& Get() const;

private:
    TileMap *m_tilemap;
};

/**
 * \brief Lightweight proxy class for the TileSet
 * \note Needed because TileSet includes wx/bitmap.h which is not avaible when
 * compiling for runtime.
 */
class TileSetProxy
{
public:
    TileSetProxy();
    TileSetProxy(const TileSet &tileset);
    TileSetProxy(const TileSetProxy &other);
    ~TileSetProxy();
    TileSetProxy& operator=(const TileSetProxy &other);

    TileSet& Get();
    const TileSet& Get() const;

private:
    TileSet *m_tileset;
};

#endif
