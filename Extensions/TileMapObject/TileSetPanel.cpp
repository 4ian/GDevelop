#include "TileSetPanel.h"

#include <iostream>

wxDEFINE_EVENT(TILE_SELECTION_CHANGED, TileSelectionEvent);

TileSetPanel::TileSetPanel(wxWindow* parent, wxWindowID id, const wxPoint &pos, const wxSize &size, long style) : 
    wxScrolledWindow(parent, id, pos, size, style),
    m_tileSetBitmap(NULL),
    m_columns(0),
    m_rows(0),
    m_tileSize(0, 0),
    m_tileMargins(0, 0),
    m_selectedCol(-1),
    m_selectedRow(-1)
{
    Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(TileSetPanel::OnLeftButtonPressed), NULL, this);
}

TileSetPanel::~TileSetPanel()
{

}

void TileSetPanel::SetTileSet(wxBitmap *tileSetBitmap)
{
    m_tileSetBitmap = tileSetBitmap;

    if(m_tileSetBitmap)
    {
        SetScrollbars(1, 1, m_tileSetBitmap->GetWidth(), m_tileSetBitmap->GetHeight());
    }
}

void TileSetPanel::SetTileCount(int columns, int rows)
{
    m_columns = columns;
    m_rows = rows;
}

void TileSetPanel::SetTileSize(wxSize tileSize)
{
    m_tileSize = tileSize;
}

void TileSetPanel::SetTileMargins(wxSize tileMargins)
{
    m_tileMargins = tileMargins;
}

void TileSetPanel::Update()
{
    Refresh();
}

void TileSetPanel::OnDraw(wxDC& dc)
{
    if(m_tileSetBitmap)
    {
        //Draw the bitmap
        dc.DrawBitmap(*m_tileSetBitmap, 0, 0, false);

        wxPoint minPos = GetViewStart();
        int width, height;
        GetVirtualSize(&width, &height);
        wxPoint maxPos = minPos + wxPoint(width, height);

        //Draw the lines
        dc.SetPen(wxPen(wxColor(128, 128, 128, 128), 1));
        for(int row = 1; row < m_rows; row++)
        {
            dc.DrawLine(minPos.x, row * m_tileSize.GetHeight() + (row - 1) * m_tileMargins.GetHeight(),
                        maxPos.x, row * m_tileSize.GetHeight() + (row - 1) * m_tileMargins.GetHeight());

            dc.DrawLine(minPos.x, row * m_tileSize.GetHeight() + (row) * m_tileMargins.GetHeight() - 1,
                        maxPos.x, row * m_tileSize.GetHeight() + (row) * m_tileMargins.GetHeight() - 1);

            for(int col = 1; col < m_columns; col++)
            {
                dc.DrawLine(col * m_tileSize.GetWidth() + (col - 1) * m_tileMargins.GetWidth(), minPos.y,
                            col * m_tileSize.GetWidth() + (col - 1) * m_tileMargins.GetWidth(), maxPos.y);

                dc.DrawLine(col * m_tileSize.GetWidth() + (col) * m_tileMargins.GetWidth() - 1, minPos.y,
                            col * m_tileSize.GetWidth() + (col) * m_tileMargins.GetWidth() - 1, maxPos.y);
            }
        }

        //Draw the selection
        if(m_selectedRow != -1 && m_selectedCol != -1)
        {
            dc.SetPen(wxPen(wxColor(0, 0, 255, 255), 4));
            dc.SetBrush(*wxTRANSPARENT_BRUSH);
            dc.DrawRectangle(GetPositionOfTile(m_selectedCol, m_selectedRow), m_tileSize);
        }
    }
}

void TileSetPanel::OnLeftButtonPressed(wxMouseEvent& event)
{
    wxPoint mousePos = CalcUnscrolledPosition(event.GetPosition());

    //Select the tile
    GetTileAt(mousePos, m_selectedCol, m_selectedRow);

    //Send the event
    TileSelectionEvent newEvent(TILE_SELECTION_CHANGED, GetId(), std::make_pair<int, int>(m_selectedCol, m_selectedRow));
    newEvent.SetEventObject(this);
    ProcessWindowEvent(newEvent);

    Refresh();
}

wxPoint TileSetPanel::GetPositionOfTile(int column, int row)
{
    return wxPoint(column *(m_tileSize.GetWidth() + m_tileMargins.GetWidth()), row * (m_tileSize.GetHeight() + m_tileMargins.GetHeight()));
}

void TileSetPanel::GetTileAt(wxPoint position, int &tileCol, int &tileRow)
{
    if(m_tileSize.GetWidth() == 0 || m_tileSize.GetHeight() == 0)
    {
        tileCol = 0;
        tileRow = 0;
        return;
    }

    tileCol = (int)(position.x / (m_tileSize.GetWidth() + m_tileMargins.GetWidth()));
    tileRow = (int)(position.y / (m_tileSize.GetHeight() + m_tileMargins.GetHeight()));
}