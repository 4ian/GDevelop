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

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef TILEMAPOBJECTEDITORCOMMANDS_H
#define TILEMAPOBJECTEDITORCOMMANDS_H

#include <wx/cmdproc.h>

#include "TileSet.h"
#include "TileMap.h"

/**
 * Command to change a tile in a tilemap.
 * (It can also remove a tile using newTileId = -1)
 */
class ChangeTileCommand : public wxCommand
{
public:
    ChangeTileCommand(TileMap &tileMap, int layer, int col, int row, int newTileId) : 
        wxCommand(true), m_tileMap(tileMap), m_layer(layer), m_row(row), m_col(col), m_newTileId(newTileId), m_oldTileId(-1) {};

    virtual bool Do()
    {
        m_oldTileId = m_tileMap.GetTile(m_layer, m_col, m_row);
        m_tileMap.SetTile(m_layer, m_col, m_row, m_newTileId);

        return true;
    }

    virtual bool Undo()
    {
        m_tileMap.SetTile(m_layer, m_col, m_row, m_oldTileId);

        return true;
    }

private:
    TileMap &m_tileMap;
    int m_layer;
    int m_col;
    int m_row;
    int m_newTileId;

    int m_oldTileId;
};

#endif
#endif
