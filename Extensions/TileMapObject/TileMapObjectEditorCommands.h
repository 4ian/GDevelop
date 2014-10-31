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

#include <iostream>

/**
 * Command to change a tile (or a whole rectangle) in a tilemap.
 * (It can also remove a tile using newTileId = -1)
 */
class ChangeTileCommand : public wxCommand
{
public:
    ChangeTileCommand(TileMap &tileMap, int layer, int col, int row, int newTileId) : 
        wxCommand(true), m_tileMap(tileMap), m_layer(layer), m_row(row), m_col(col), m_endCol(col), m_endRow(row), m_newTileId(newTileId) 
    {
        m_oldTileId.resize(1);
    };

    ChangeTileCommand(TileMap &tileMap, int layer, int col, int row, int endCol, int endRow, int newTileId) : 
        wxCommand(true), m_tileMap(tileMap), m_layer(layer), m_row(row), m_col(col), m_endCol(endCol), m_endRow(endRow), m_newTileId(newTileId)
    {
        m_oldTileId.resize((m_endCol - m_col + 1) * (m_endRow - m_row + 1));
    };

    virtual bool Do()
    {
        for(int col = m_col; col <= m_endCol; col++)
        {
            for(int row = m_row; row <= m_endRow; row++)
            {
                m_oldTileId[(m_endRow - m_row + 1) * (col - m_col) + row - m_row] = m_tileMap.GetTile(m_layer, col, row);
                m_tileMap.SetTile(m_layer, col, row, m_newTileId);
            }
        }

        return true;
    }

    virtual bool Undo()
    {
        for(int col = m_col; col <= m_endCol; col++)
        {
            for(int row = m_row; row <= m_endRow; row++)
            {
                m_tileMap.SetTile(m_layer, col, row, m_oldTileId[(m_endRow - m_row + 1) * (col - m_col) + row - m_row]);
            }
        }

        return true;
    }

private:
    TileMap &m_tileMap;
    int m_layer;
    int m_col;
    int m_row;
    int m_endCol;
    int m_endRow;
    int m_newTileId;

    std::vector<int> m_oldTileId;
};

#endif
#endif
