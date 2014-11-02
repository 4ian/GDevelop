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

#ifndef TILEMAPPANEL_H
#define TILEMAPPANEL_H

#include "wx/wx.h"
#include <wx/cmdproc.h>

#include <iostream>
#include <map>
#include <vector>

#include "TileSetPanel.h"
#include "TileMap.h"
#include "TileSet.h"

class TileMapPanel : public wxScrolledWindow
{
public:
    enum InsertionMode
    {
        PencilMode,
        RectangleMode,
        FillMode
    };

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
     * Fill a layer with the given tile
     */
    void FillLayer(int layer, int tile);

    /**
     * Refresh and recreate tile cache.
     */
    void Update();

    /**
     * Change the insertion mode
     */
    void SetInsertionMode(InsertionMode newInsertionMode);

    /**
     * Undo the last command
     */
    void Undo() {m_commandProcessor.Undo(); Update();};

    /**
     * Redo the last undone command
     */
    void Redo() {m_commandProcessor.Redo(); Update();};

    /**
     * Clear the undo/redo historic
     */
    void ClearCommands() {m_commandProcessor.ClearCommands();};

    //React to the selection change in TileSetPanel
    void OnTileSetSelectionChanged(TileSelectionEvent &event);

protected:
    void OnPaint(wxPaintEvent &event);
    void OnMouseEvent(wxMouseEvent &event);

private:
    wxPoint GetPositionOfTile(int column, int row);
    void GetTileAt(wxPoint position, int &tileCol, int &tileRow);

    //Tile to be inserted
    int m_tileToBeInserted;
    bool m_hideUpperLayers;

    TileSet *m_tileset;
    TileMap *m_tilemap;
    int m_mapCurrentLayer;

    InsertionMode m_insertionMode;

    //Some parameters for the Rectangle Mode
    bool m_isDrawingRectangle;
    int m_beginCol;
    int m_beginRow;
    int m_endCol;
    int m_endRow;

    //Command processor, to be able to undo/redo actions
    wxCommandProcessor m_commandProcessor;

};

#endif
