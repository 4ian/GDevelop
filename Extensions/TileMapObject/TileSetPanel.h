#ifndef TILESETPANEL_H
#define TILESETPANEL_H

#include "wx/wx.h"

#include <iostream>
#include <map>

class TileSelectionEvent : public wxEvent
{
public:
    TileSelectionEvent(wxEventType eventType, int winid, const std::pair<int, int> &selectedTile) : wxEvent(winid, eventType), m_selectedTile(selectedTile)
    {
    }

    std::pair<int, int> GetSelectedTile() const { return m_selectedTile; }

    virtual wxEvent *Clone() const { return new TileSelectionEvent(*this); }

private:
    const std::pair<int, int> m_selectedTile;
};

wxDECLARE_EVENT(TILE_SELECTION_CHANGED, TileSelectionEvent);

typedef void (wxEvtHandler::*TileSelectionEventFunction)(TileSelectionEvent&);
#define TileSelectionEventHandler(func) wxEVENT_HANDLER_CAST(TileSelectionEventFunction, func)
 
class TileSetPanel : public wxScrolledWindow
{
    wxBitmap* m_tileSetBitmap;
    int m_columns;
    int m_rows;
    wxSize m_tileSize;
    wxSize m_tileMargins;

    int m_selectedCol;
    int m_selectedRow;

public:
    TileSetPanel(wxWindow* parent, wxWindowID id, const wxPoint &pos=wxDefaultPosition, const wxSize &size=wxDefaultSize, long style=wxHSCROLL|wxVSCROLL);
    ~TileSetPanel();

    void SetTileSet(wxBitmap *tileSetBitmap);
    void SetTileCount(int columns, int rows);
    void SetTileSize(wxSize tileSize);
    void SetTileMargins(wxSize tileMargins);

    void Update(); //Refresh.

    virtual void OnDraw(wxDC& dc);

protected:
    void OnLeftButtonPressed(wxMouseEvent& event);

private:
    wxPoint GetPositionOfTile(int column, int row);
    void GetTileAt(wxPoint position, int &tileCol, int &tileRow);
};

#endif