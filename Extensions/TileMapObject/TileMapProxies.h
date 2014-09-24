/**

GDevelop - Tile Map Extension
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
