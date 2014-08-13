#ifndef TILEMAPPANEL_H
#define TILEMAPPANEL_H

#include "wx/wx.h"

#include <iostream>
#include <map>
#include <vector>

#include "TileSetPanel.h"

struct TileMapLayer
{
    ///Contains all tiles, the column is the first index and the row is the second. the pair contains the tile position into the TileSet.
    std::vector< std::vector< std::pair<int, int> > > tiles;
};
 
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

    //Info about the TileMap (the level map)
    // m_map[layer][column][row]
    std::vector<TileMapLayer> m_map;
    int m_mapWidth;
    int m_mapHeight;
    int m_mapCurrentLayer;

    //Cache containing all tileset pre-separated wxBitmaps
    std::map<std::pair<int, int>, wxBitmap> m_bitmapCache; //First int represents the column, the second the row.

public:
    TileMapPanel(wxWindow* parent, wxWindowID id, const wxPoint &pos=wxDefaultPosition, const wxSize &size=wxDefaultSize, long style=wxHSCROLL|wxVSCROLL);
    ~TileMapPanel();

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

    /**
     * Set the map size (columns, rows)
     */
    void SetMapSize(int columns, int rows);

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
     * Return the number of layers
    **/
    int GetLayersCount() const;

    /**
     * Add a new layer
     * \param pos Where to create the layer (next layers will be moved after)
     * \param asCopyOf Create the layer as a copy of that layer. (Set to -1 to create a blank layer)
     */
    void AddLayer(int pos, int asCopyOf = -1);

    /**
     * Remove a layer
     * \param pos The layer to delete
     */
    void RemoveLayer(int pos);

    /**
     * Refresh and recreate tile cache.
     */
    void Update();

    virtual void OnDraw(wxDC& dc);

    void OnTileSetSelectionChanged(TileSelectionEvent &event);

protected:
    void OnLeftButtonPressed(wxMouseEvent& event);

private:

    void UpdateMapSize();

    wxPoint GetPositionOfTile(int column, int row);
    void GetTileAt(wxPoint position, int &tileCol, int &tileRow);
};

#endif