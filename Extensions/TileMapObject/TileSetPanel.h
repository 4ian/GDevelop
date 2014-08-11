#ifndef TILESETPANEL_H
#define TILESETPANEL_H

#include "wx/wx.h"
#include <iostream>
 
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