/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2015 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef TILEMAPOBJECTEDITORCOMMANDS_H
#define TILEMAPOBJECTEDITORCOMMANDS_H

#include <wx/cmdproc.h>

#include "TileSet.h"
#include "TileMap.h"

#include <map>
#include <vector>

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

/**
 * Command to flood fill an area with a tile
 */
class FloodFillCommand : public wxCommand
{
public:
    FloodFillCommand(TileMap &tileMap, int layer, int col, int row, int newTileId) :
        wxCommand(true), m_tileMap(tileMap), m_layer(layer), m_col(col), m_row(row), m_newTileId(newTileId), m_oldTileId(-1)
    {

    }

    virtual bool Do()
    {
        if (m_col < 0 || m_col >= m_tileMap.GetColumnsCount() || m_row < 0 || m_row >= m_tileMap.GetRowsCount())
            return true; //Out of bound position.

        m_tileChanged.clear();
        m_oldTileId = m_tileMap.GetTile(m_layer, m_col, m_row);

        if (m_newTileId != m_oldTileId) //Beware, flood fill will loop forever if replacing a tile with the same!
            FloodFill(m_col, m_row);

        return true;
    }

    virtual bool Undo()
    {
        //Undo the flood fill : set the old tile id to all the previously changed tiles
        for(int i = 0; i < m_tileChanged.size(); i++)
        {
            m_tileMap.SetTile(m_layer, m_tileChanged[i].first, m_tileChanged[i].second, m_oldTileId);
        }

        return true;
    }

private:
    void FloodFill(int col, int row)
    {
        int oldTileId = m_tileMap.GetTile(m_layer, col, row);
        m_tileMap.SetTile(m_layer, col, row, m_newTileId);

        m_tileChanged.push_back(std::make_pair(col, row)); //Add the tile to the list of changed tiles

        if(col + 1 < m_tileMap.GetColumnsCount() && m_tileMap.GetTile(m_layer, col + 1, row) == oldTileId)
        {
            FloodFill(col + 1, row);
        }
        if(col - 1 >= 0 && m_tileMap.GetTile(m_layer, col - 1, row) == oldTileId)
        {
            FloodFill(col - 1, row);
        }
        if(row + 1 < m_tileMap.GetRowsCount() && m_tileMap.GetTile(m_layer, col, row + 1) == oldTileId)
        {
            FloodFill(col, row + 1);
        }
        if(row - 1 >= 0 && m_tileMap.GetTile(m_layer, col, row - 1) == oldTileId)
        {
            FloodFill(col, row - 1);
        }
    }

    TileMap &m_tileMap;
    int m_layer;
    int m_col;
    int m_row;

    int m_newTileId;
    int m_oldTileId;
    std::vector<std::pair<int, int> > m_tileChanged;
};

#endif
#endif
