/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "TileSetPanel.h"

#include <iostream>
#include <wx/dcbuffer.h>
#include "GDCore/IDE/wxTools/CommonBitmapProvider.h"

wxDEFINE_EVENT(TILE_SELECTION_CHANGED, TileSelectionEvent);

TileSetPanel::TileSetPanel(wxWindow* parent, wxWindowID id, const wxPoint &pos, const wxSize &size, long style) :
    wxScrolledWindow(parent, id, pos, size, style),
    m_tileset(NULL),
    m_selectedCol(0),
    m_selectedRow(0)
{
    SetBackgroundStyle(wxBG_STYLE_PAINT);

    Connect(wxEVT_PAINT, wxPaintEventHandler(TileSetPanel::OnPaint), NULL, this);
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

int TileSetPanel::GetSelectedTile() const
{
    if(!m_tileset || m_tileset->IsDirty())
        return -1;

    return m_tileset->GetTileIDFromCell(m_selectedCol, m_selectedRow);
}

void TileSetPanel::Update()
{
    SetScrollRate(1, 1);
    SetVirtualSize(m_tileset->GetSize().x, m_tileset->GetSize().y);
    Refresh();
}

void TileSetPanel::OnPaint(wxPaintEvent& event)
{
    wxAutoBufferedPaintDC dc(this);
    DoPrepareDC(dc);

    //Get the viewport
    wxPoint minPos = GetViewStart();
    int width, height;
    GetClientSize(&width, &height);
    wxPoint maxPos = minPos + wxPoint(width, height);

    if(m_tileset && !m_tileset->IsDirty())
    {
        //Determine the first and last columns and rows to draw
        int firstCol = std::max((int)(minPos.x / (m_tileset->tileSize.x + m_tileset->tileSpacing.x) - 1), 1);
        int firstRow = std::max((int)(minPos.y / (m_tileset->tileSize.y + m_tileset->tileSpacing.y) - 1), 1);
        int lastCol = std::min((int)(maxPos.x / (m_tileset->tileSize.x + m_tileset->tileSpacing.x) + 1), m_tileset->GetColumnsCount());
        int lastRow = std::min((int)(maxPos.y / (m_tileset->tileSize.y + m_tileset->tileSpacing.y) + 1), m_tileset->GetRowsCount());

        //Draw the background
        dc.SetBrush(gd::CommonBitmapProvider::Get()->transparentBg);
        dc.DrawRectangle(minPos.x, minPos.y, width, height);

        //Draw the bitmap
        dc.DrawBitmap(m_tileset->GetWxBitmap(), 0, 0, true);

        //Draw the lines
        dc.SetPen(wxPen(wxColor(128, 128, 128, 255), 1));
        for(int row = firstRow; row < lastRow; row++)
        {
            dc.DrawLine(minPos.x, row * m_tileset->tileSize.y + (row - 1) * m_tileset->tileSpacing.y,
                        maxPos.x, row * m_tileset->tileSize.y + (row - 1) * m_tileset->tileSpacing.y);

            dc.DrawLine(minPos.x, row * m_tileset->tileSize.y + (row) * m_tileset->tileSpacing.y - 1,
                        maxPos.x, row * m_tileset->tileSize.y + (row) * m_tileset->tileSpacing.y - 1);

            for(int col = firstCol; col < lastCol; col++)
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
    else
    {
        //Draw a white background with a text
        dc.SetBrush(*wxWHITE_BRUSH);
        dc.DrawRectangle(minPos.x, minPos.y, width, height);
        dc.DrawText(_("You haven't selected a tileset yet."), minPos.x + 16, minPos.y + 16);
    }
}

void TileSetPanel::OnLeftButtonPressed(wxMouseEvent& event)
{
    if (!m_tileset || m_tileset->IsDirty())
        return;

    wxPoint mousePos = CalcUnscrolledPosition(event.GetPosition());

    //Select the tile
    int selectedCol, selectedRow;
    GetTileAt(mousePos, selectedCol, selectedRow);
    if (selectedCol >= m_tileset->GetColumnsCount() || selectedRow >= m_tileset->GetRowsCount())
        return;
    m_selectedCol = selectedCol;
    m_selectedRow = selectedRow;

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
    if (m_tileset->tileSize.x == 0 || m_tileset->tileSize.y == 0)
    {
        tileCol = 0;
        tileRow = 0;
        return;
    }

    tileCol = (int)(position.x / (m_tileset->tileSize.x + m_tileset->tileSpacing.x));
    tileRow = (int)(position.y / (m_tileset->tileSize.y + m_tileset->tileSpacing.y));
}
#endif
