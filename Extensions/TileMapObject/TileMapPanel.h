#ifndef TILEMAPPANEL_H
#define TILEMAPPANEL_H

#include "wx/wx.h"

#include <iostream>
#include <map>
#include <vector>

#include "TileSetPanel.h"
#include "TileMap.h"
#include "TileSet.h"
 
class TileMapPanel : public wxScrolledWindow
{
    //Tile to be inserted
    int m_tileToBeInserted;
    bool m_hideUpperLayers;

    TileSet *m_tileset;
    TileMap *m_tilemap;
    int m_mapCurrentLayer;

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
    void SetTileSet(TileSet *tileset);

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

    void OnTileSetSelectionChanged(TileSelectionEvent &event);

protected:
    void OnPaint(wxPaintEvent &event);
    void OnMouseEvent(wxMouseEvent &event);

private:
    wxPoint GetPositionOfTile(int column, int row);
    void GetTileAt(wxPoint position, int &tileCol, int &tileRow);
};

#endif