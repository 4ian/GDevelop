#ifndef TILEMAPPANEL_H
#define TILEMAPPANEL_H

#include "wx/wx.h"

#include <iostream>
#include <map>
#include <vector>
 
class TileMapPanel : public wxScrolledWindow
{
    //Info about the TileSet (the texture containing all tiles);
    struct TileSetInfo
    {
        TileSetInfo() : tileSetBitmap(NULL), tileColumns(0), tileRows(0), tileSize(0, 0), tileMargins(0, 0) {};

        wxBitmap* tileSetBitmap;
        int tileColumns;
        int tileRows;
        wxSize tileSize;
        wxSize tileMargins;

    } m_tileSetInfo;

    //Info about the TileMap (the level map)
    std::vector< std::vector< std::pair<int, int> > > m_map;

    //Cache containing all tileset pre-separated wxBitmaps
    std::map<std::pair<int, int>, wxBitmap> m_bitmapCache; //First int represents the column, the second the row.

public:
    TileMapPanel(wxWindow* parent, wxWindowID id, const wxPoint &pos=wxDefaultPosition, const wxSize &size=wxDefaultSize, long style=wxHSCROLL|wxVSCROLL);
    ~TileMapPanel();

    void SetTileSet(wxBitmap *tileSetBitmap);
    void SetTileSetCount(int columns, int rows);
    void SetTileSetSize(wxSize tileSize);
    void SetTileSetMargins(wxSize tileMargins);

    void SetMapSize(int columns, int rows);

    void Update(); //Refresh and recreate tile cache.

    virtual void OnDraw(wxDC& dc);

protected:
    void OnLeftButtonPressed(wxMouseEvent& event);

private:
    wxPoint GetPositionOfTile(int column, int row);
    void GetTileAt(wxPoint position, int &tileCol, int &tileRow);
};

#endif