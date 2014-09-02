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

#ifndef TILESETPANEL_H
#define TILESETPANEL_H

#include "wx/wx.h"

#include <iostream>
#include <map>

#include "TileSet.h"

class TileSelectionEvent : public wxEvent
{
public:
    TileSelectionEvent(wxEventType eventType, int winid, int selectedTile) : wxEvent(winid, eventType), m_selectedTile(selectedTile)
    {
    }

    int GetSelectedTile() const { return m_selectedTile; }

    virtual wxEvent *Clone() const { return new TileSelectionEvent(*this); }

private:
    const int m_selectedTile;
};

wxDECLARE_EVENT(TILE_SELECTION_CHANGED, TileSelectionEvent);

typedef void (wxEvtHandler::*TileSelectionEventFunction)(TileSelectionEvent&);
#define TileSelectionEventHandler(func) wxEVENT_HANDLER_CAST(TileSelectionEventFunction, func)
 
class TileSetPanel : public wxScrolledWindow
{
    TileSet *m_tileset;;

    int m_selectedCol;
    int m_selectedRow;

public:
    TileSetPanel(wxWindow* parent, wxWindowID id, const wxPoint &pos=wxDefaultPosition, const wxSize &size=wxDefaultSize, long style=wxHSCROLL|wxVSCROLL);
    ~TileSetPanel();

    void SetTileSet(TileSet *tileset);

    void Update(); //Refresh.

protected:
    void OnPaint(wxPaintEvent& event);
    void OnLeftButtonPressed(wxMouseEvent& event);

private:
    wxPoint GetPositionOfTile(int column, int row);
    void GetTileAt(wxPoint position, int &tileCol, int &tileRow);
};

#endif