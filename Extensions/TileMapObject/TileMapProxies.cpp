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

#include "TileMapProxies.h"

#include "TileMap.h"
#include "TileSet.h"

/**
 * TileMapProxy
 */

TileMapProxy::TileMapProxy() : m_tilemap(new TileMap())
{

}

TileMapProxy::TileMapProxy(const TileMap &tilemap) : m_tilemap(new TileMap(tilemap))
{

}

TileMapProxy::TileMapProxy(const TileMapProxy &other) : m_tilemap(new TileMap(*other.m_tilemap))
{

}

TileMapProxy::~TileMapProxy()
{
    if(m_tilemap)
        delete m_tilemap;
}

TileMapProxy& TileMapProxy::operator=(const TileMapProxy &other)
{
    if(m_tilemap)
        delete m_tilemap;
    m_tilemap = new TileMap(*other.m_tilemap);

    return *this;
}

TileMap& TileMapProxy::Get()
{
    return *m_tilemap;
}

const TileMap& TileMapProxy::Get() const
{
    return *m_tilemap;
}

/**
 * TileMapProxy
 */

TileSetProxy::TileSetProxy() : m_tileset(new TileSet())
{

}

TileSetProxy::TileSetProxy(const TileSet &tileset) : m_tileset(new TileSet(tileset))
{

}

TileSetProxy::TileSetProxy(const TileSetProxy &other) : m_tileset(new TileSet(*other.m_tileset))
{

}

TileSetProxy::~TileSetProxy()
{
    if(m_tileset)
        delete m_tileset;
}

TileSetProxy& TileSetProxy::operator=(const TileSetProxy &other)
{
    if(m_tileset)
        delete m_tileset;
    m_tileset = new TileSet(*other.m_tileset);

    return *this;
}

TileSet& TileSetProxy::Get()
{
    return *m_tileset;
}

const TileSet& TileSetProxy::Get() const
{
    return *m_tileset;
}
