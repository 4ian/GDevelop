#ifndef TILEMAPPANEL_H
#define TILEMAPPANEL_H

#include "wx/wx.h"

#include <iostream>
#include <map>
#include <vector>

#include "TileSetPanel.h"
#include "TileMap.h"
 
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

    //Tile to be inserted
    std::pair<int, int> m_tileToBeInserted;
    bool m_hideUpperLayers;

    TileMap *m_tilemap;
    int m_mapCurrentLayer;

    //Cache containing all tileset pre-separated wxBitmaps
    std::map<std::pair<int, int>, wxBitmap> m_bitmapCache; //First int represents the column, the second the row.

public:
    TileMapPanel(wxWindow* parent, wxWindowID id, const wxPoint &pos=wxDefaultPosition, const wxSize &size=wxDefaultSize, long style=wxHSCROLL|wxVSCROLL);
    ~TileMapPanel();

    /**
     * Set the tilemap edited by the TileMapPanel;
     */
    void SetTileMap(TileMap *tilemap);

    /**
     * Set the tileset to be used by the map
     */
    void SetTileSet(wxBitmap *tileSetBitmap);

    /**
     * Set the number of columns and rows of the tileset
     */
    void SetTileSetCount(int columns, int rows);

    /**
     * Set the size of tiles
     */
    void SetTileSetSize(wxSize tileSize);

    /**
     * Set the margins between tiles
     */
    void SetTileSetMargins(wxSize tileMargins);

    void HideUpperLayers(bool enable);
    bool AreUpperLayersHidden() const;

    /**
     * Get the current layer
     */
    int GetCurrentLayer() const {return m_mapCurrentLayer;};

    /**
     * Set the current layer for the map edition
     */
    void SetCurrentLayer(int currentLayer);

    /**
     * Refresh and recreate tile cache.
     */
    void Update();

    /**
     * Update the scrollbars.
     */
    void UpdateScrollBars();

    virtual void OnDraw(wxDC& dc);

    void OnTileSetSelectionChanged(TileSelectionEvent &event);

protected:
    void OnLeftButtonPressed(wxMouseEvent& event);

private:
    wxPoint GetPositionOfTile(int column, int row);
    void GetTileAt(wxPoint position, int &tileCol, int &tileRow);
};

#endif