#include "TileSetPanel.h"

#include <iostream>
#include <wx/dcbuffer.h>
#include "GDCore/IDE/CommonBitmapManager.h"

wxDEFINE_EVENT(TILE_SELECTION_CHANGED, TileSelectionEvent);

TileSetPanel::TileSetPanel(wxWindow* parent, wxWindowID id, const wxPoint &pos, const wxSize &size, long style) : 
    wxScrolledWindow(parent, id, pos, size, style),
    m_tileset(NULL),
    m_selectedCol(-1),
    m_selectedRow(-1)
{
    SetBackgroundStyle(wxBG_STYLE_PAINT);

    Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(TileSetPanel::OnLeftButtonPressed), NULL, this);
}

TileSetPanel::~TileSetPanel()
{

}

void TileSetPanel::SetTileSet(TileSet *tileset)
{
    m_tileset = tileset;
    Update();
}


void TileSetPanel::Update()
{
    SetScrollRate(1, 1);
    SetVirtualSize(m_tileset->GetSize().x, m_tileset->GetSize().y);
    Refresh();
}

void TileSetPanel::OnDraw(wxDC& dc)
{
    //Get the viewport
    wxPoint minPos = GetViewStart();
    int width, height;
    GetVirtualSize(&width, &height);
    wxPoint maxPos = minPos + wxPoint(width, height);

    //Draw the background
    dc.SetBrush(gd::CommonBitmapManager::Get()->transparentBg);
    dc.DrawRectangle(minPos.x, minPos.y, width, height);

    if(m_tileset && !m_tileset->IsDirty())
    {
        //Draw the bitmap
        dc.DrawBitmap(m_tileset->GetWxBitmap(), 0, 0, false);

        //Draw the lines
        dc.SetPen(wxPen(wxColor(128, 128, 128, 128), 1));
        for(int row = 1; row < m_tileset->GetRowsCount(); row++)
        {
            dc.DrawLine(minPos.x, row * m_tileset->tileSize.y + (row - 1) * m_tileset->tileSpacing.y,
                        maxPos.x, row * m_tileset->tileSize.y + (row - 1) * m_tileset->tileSpacing.y);

            dc.DrawLine(minPos.x, row * m_tileset->tileSize.y + (row) * m_tileset->tileSpacing.y - 1,
                        maxPos.x, row * m_tileset->tileSize.y + (row) * m_tileset->tileSpacing.y - 1);

            for(int col = 1; col < m_tileset->GetColumnsCount(); col++)
            {
                dc.DrawLine(col * m_tileset->tileSize.x + (col - 1) * m_tileset->tileSpacing.x, minPos.y,
                            col * m_tileset->tileSize.x + (col - 1) * m_tileset->tileSpacing.x, maxPos.y);

                dc.DrawLine(col * m_tileset->tileSize.x + (col) * m_tileset->tileSpacing.x - 1, minPos.y,
                            col * m_tileset->tileSize.x + (col) * m_tileset->tileSpacing.x - 1, maxPos.y);
            }
        }

        //Draw the selection
        if(m_selectedRow != -1 && m_selectedCol != -1)
        {
            dc.SetPen(wxPen(wxColor(0, 0, 255, 255), 4));
            dc.SetBrush(*wxTRANSPARENT_BRUSH);
            dc.DrawRectangle(GetPositionOfTile(m_selectedCol, m_selectedRow), wxSize(m_tileset->tileSize.x, m_tileset->tileSize.y));
        }
    }
}

void TileSetPanel::OnLeftButtonPressed(wxMouseEvent& event)
{
    if(!m_tileset)
        return;

    wxPoint mousePos = CalcUnscrolledPosition(event.GetPosition());

    //Select the tile
    GetTileAt(mousePos, m_selectedCol, m_selectedRow);

    //Send the event
    TileSelectionEvent newEvent(TILE_SELECTION_CHANGED, GetId(), m_tileset->GetTileIDFromCell(m_selectedCol, m_selectedRow));
    newEvent.SetEventObject(this);
    ProcessWindowEvent(newEvent);

    Refresh();
}

wxPoint TileSetPanel::GetPositionOfTile(int column, int row)
{
    return wxPoint(column *(m_tileset->tileSize.x + m_tileset->tileSpacing.x), row * (m_tileset->tileSize.y + m_tileset->tileSpacing.y));
}

void TileSetPanel::GetTileAt(wxPoint position, int &tileCol, int &tileRow)
{
    if(m_tileset->tileSize.x == 0 || m_tileset->tileSize.y == 0)
    {
        tileCol = 0;
        tileRow = 0;
        return;
    }

    tileCol = (int)(position.x / (m_tileset->tileSize.x + m_tileset->tileSpacing.x));
    tileRow = (int)(position.y / (m_tileset->tileSize.y + m_tileset->tileSpacing.y));
}