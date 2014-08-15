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

    virtual void OnDraw(wxDC& dc);

protected:
    void OnLeftButtonPressed(wxMouseEvent& event);

private:
    wxPoint GetPositionOfTile(int column, int row);
    void GetTileAt(wxPoint position, int &tileCol, int &tileRow);
};

#endif