/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
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
