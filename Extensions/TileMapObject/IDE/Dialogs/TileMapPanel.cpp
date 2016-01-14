/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "TileMapPanel.h"

#include <iostream>
#include <algorithm>
#include <wx/dcbuffer.h>
#include "GDCore/IDE/wxTools/CommonBitmapProvider.h"
#include "TileMapObjectEditorCommands.h"

TileMapPanel::TileMapPanel(wxWindow* parent, wxWindowID id, const wxPoint &pos, const wxSize &size, long style) :
    wxScrolledWindow(parent, id, pos, size, style),
    m_tileToBeInserted(0),
    m_hideUpperLayers(false),
    m_tileset(NULL),
    m_tilemap(NULL),
    m_mapCurrentLayer(0),
    m_insertionMode(PencilMode),
    m_isDrawingRectangle(false),
    m_commandProcessor()
{
    SetBackgroundStyle(wxBG_STYLE_PAINT);

    Connect(wxEVT_PAINT, wxPaintEventHandler(TileMapPanel::OnPaint), NULL, this);
    Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(TileMapPanel::OnMouseEvent), NULL, this);
    Connect(wxEVT_RIGHT_DOWN, wxMouseEventHandler(TileMapPanel::OnMouseEvent), NULL, this);
    Connect(wxEVT_LEFT_UP, wxMouseEventHandler(TileMapPanel::OnMouseEvent), NULL, this);
    Connect(wxEVT_RIGHT_UP, wxMouseEventHandler(TileMapPanel::OnMouseEvent), NULL, this);
    Connect(wxEVT_MOTION, wxMouseEventHandler(TileMapPanel::OnMouseEvent), NULL, this);
}

TileMapPanel::~TileMapPanel()
{

}

void TileMapPanel::SetTileMap(TileMap *tilemap)
{
    m_commandProcessor.ClearCommands();
    m_tilemap = tilemap;
    Update();
}

void TileMapPanel::SetTileSet(TileSet *tileset)
{
    m_tileset = tileset;
}

void TileMapPanel::HideUpperLayers(bool enable)
{
    m_hideUpperLayers = enable;
    Refresh();
}

bool TileMapPanel::AreUpperLayersHidden() const
{
    return m_hideUpperLayers;
}

void TileMapPanel::SetCurrentLayer(int currentLayer)
{
    m_mapCurrentLayer = currentLayer;
    Refresh();
}

void TileMapPanel::FillLayer(int layer, int tile)
{
    if(!m_tilemap)
        return;

    for (unsigned int col = 0; col < m_tilemap->GetColumnsCount(); col++)
    {
        for (unsigned int row = 0; row < m_tilemap->GetRowsCount(); row++)
        {
            m_tilemap->SetTile(layer, col, row, tile);
        }
    }

    Refresh();
}

void TileMapPanel::Update()
{
    if (!m_tilemap || !m_tileset)
        return;
    SetScrollRate(1, 1);
    SetVirtualSize(m_tilemap->GetColumnsCount() * m_tileset->tileSize.x, m_tilemap->GetRowsCount() * m_tileset->tileSize.y);

    Refresh();
}

void TileMapPanel::SetInsertionMode(InsertionMode newInsertionMode)
{
    m_insertionMode = newInsertionMode;
    Update();
}

void TileMapPanel::OnTileSetSelectionChanged(TileSelectionEvent &event)
{
    m_tileToBeInserted = event.GetSelectedTile();
}

void TileMapPanel::OnPaint(wxPaintEvent& event)
{
    wxBitmap btmp(m_tileset->GetWxBitmap());
    wxMemoryDC tilesetDC;
    tilesetDC.SelectObject(btmp);

    wxAutoBufferedPaintDC dc(this);
    DoPrepareDC(dc);

    wxPoint minPos = GetViewStart();
    int width, height;
    GetClientSize(&width, &height);
    wxPoint maxPos = minPos + wxPoint(width, height);

    dc.SetBrush(gd::CommonBitmapProvider::Get()->transparentBg);
    dc.DrawRectangle(minPos.x, minPos.y, width, height);

    if(!m_tilemap || !m_tileset || m_tileset->IsDirty())
        return;

    dc.SetPen(wxPen(wxColor(128, 128, 128, 255), 1));

    //Determine the first and last columns and rows to draw
    int firstCol = std::max((int)(minPos.x / m_tileset->tileSize.x - 1), 0);
    int firstRow = std::max((int)(minPos.y / m_tileset->tileSize.y - 1), 0);
    int lastCol = std::min((int)(maxPos.x / m_tileset->tileSize.x + 1), m_tilemap->GetColumnsCount());
    int lastRow = std::min((int)(maxPos.y / m_tileset->tileSize.y + 1), m_tilemap->GetRowsCount());

    //Draw the tiles
    for(int layer = 0; m_hideUpperLayers ? layer <= GetCurrentLayer() : layer < 3; layer++)
    {
        for(int col = firstCol; col < lastCol; col++)
        {
            for(int row = firstRow; row < lastRow; row++)
            {
                if(m_tilemap->GetTile(layer, col, row) == -1)
                    continue;

                dc.Blit(GetPositionOfTile(col, row).x,
                        GetPositionOfTile(col, row).y,
                        m_tileset->tileSize.x,
                        m_tileset->tileSize.y,
                        &tilesetDC,
                        m_tileset->GetTileTextureCoords(m_tilemap->GetTile(layer, col, row)).topLeft.x,
                        m_tileset->GetTileTextureCoords(m_tilemap->GetTile(layer, col, row)).topLeft.y,
                        wxCOPY,
                        true);
            }
        }
    }

    //Draw the rectangle (when the mode is RectangleMode)
    if(m_insertionMode == RectangleMode && m_isDrawingRectangle)
    {
        dc.SetBrush(wxBrush(wxColour(128, 128, 255, 128)));
        dc.SetPen(wxPen(wxColor(128, 128, 255, 255), 1));

        wxPoint topLeftPos(GetPositionOfTile(std::min(m_beginCol, m_endCol),
                                             std::min(m_beginRow, m_endRow)));

        wxPoint bottomRightPos(GetPositionOfTile(std::max(m_beginCol + 1, m_endCol + 1),
                                                 std::max(m_beginRow + 1, m_endRow + 1)));

        wxSize rectSize(bottomRightPos.x - topLeftPos.x, bottomRightPos.y - topLeftPos.y);

        dc.DrawRectangle(topLeftPos, rectSize);
    }

    dc.SetPen(wxPen(wxColor(128, 128, 128, 255), 1));

    //Draw the grid
    for(int col = firstCol; col < lastCol; col++)
    {
        dc.DrawLine(col * m_tileset->tileSize.x, minPos.y,
                    col * m_tileset->tileSize.x, maxPos.y);

        for(int row = firstRow; row < lastRow; row++)
        {
            dc.DrawLine(minPos.x, row * m_tileset->tileSize.y,
                        maxPos.x, row * m_tileset->tileSize.y);
        }
    }

    //Draw a gray rectangle outside the map
    dc.SetBrush(wxColor(128, 128, 128, 255));
    if(maxPos.x > (m_tilemap->GetColumnsCount() * m_tileset->tileSize.x))
    {
        dc.DrawRectangle(m_tilemap->GetColumnsCount() * m_tileset->tileSize.x,
                         minPos.y,
                         maxPos.x - m_tilemap->GetColumnsCount() * m_tileset->tileSize.x,
                         maxPos.y - minPos.y);
    }
    if(maxPos.y > (m_tilemap->GetRowsCount() * m_tileset->tileSize.y))
    {
        dc.DrawRectangle(minPos.x,
                         m_tilemap->GetRowsCount() * m_tileset->tileSize.y,
                         maxPos.x - minPos.x,
                         maxPos.y - m_tilemap->GetRowsCount() * m_tileset->tileSize.y);
    }
}

void TileMapPanel::OnMouseEvent(wxMouseEvent &event)
{
    if(!m_tilemap || !m_tileset)
        return;

    //Get the current tile position (column and row)
    unsigned int currentColumn, currentRow;
    wxPoint mousePos = CalcUnscrolledPosition(event.GetPosition());
    GetTileAt(mousePos, currentColumn, currentRow);

    if(currentColumn >= m_tilemap->GetColumnsCount() || currentRow >= m_tilemap->GetRowsCount())
        return; //Stop if the position is out of range

    if(m_insertionMode == PencilMode)
    {
        if(event.GetEventType() == wxEVT_LEFT_DOWN || event.GetEventType() == wxEVT_RIGHT_DOWN || event.GetEventType() == wxEVT_MOTION)
        {
            if(event.LeftIsDown()) //Left mouse button pressed
            {
                //Add a tile to the current position (only if the tile has not been set before)
                if(m_tilemap->GetTile(m_mapCurrentLayer, currentColumn, currentRow) != m_tileToBeInserted)
                    m_commandProcessor.Submit(new ChangeTileCommand(*m_tilemap, m_mapCurrentLayer, currentColumn, currentRow, m_tileToBeInserted));
                Refresh();
            }
            else if(event.RightIsDown())
            {
                //Remove the tile
                m_commandProcessor.Submit(new ChangeTileCommand(*m_tilemap, m_mapCurrentLayer, currentColumn, currentRow, -1));
                Refresh();
            }
        }
    }
    else if(m_insertionMode == RectangleMode)
    {
        if(event.GetEventType() == wxEVT_LEFT_DOWN || event.GetEventType() == wxEVT_RIGHT_DOWN)
        {
            m_isDrawingRectangle = true;
            m_beginCol = m_endCol = currentColumn;
            m_beginRow = m_endRow = currentRow;

            Update();
        }
        else if(event.GetEventType() == wxEVT_MOTION)
        {
            m_endCol = currentColumn;
            m_endRow = currentRow;
            Update();
        }
        else if(event.GetEventType() == wxEVT_LEFT_UP)
        {
            m_endCol = currentColumn;
            m_endRow = currentRow;
            m_isDrawingRectangle = false;

            m_commandProcessor.Submit(new ChangeTileCommand(*m_tilemap, m_mapCurrentLayer, std::min(m_beginCol, m_endCol),
                                                                                           std::min(m_beginRow, m_endRow),
                                                                                           std::max(m_beginCol, m_endCol),
                                                                                           std::max(m_beginRow, m_endRow),
                                                                                           m_tileToBeInserted));

            Update();
        }
        else if(event.GetEventType() == wxEVT_RIGHT_UP)
        {
            m_endCol = currentColumn;
            m_endRow = currentRow;
            m_isDrawingRectangle = false;

            m_commandProcessor.Submit(new ChangeTileCommand(*m_tilemap, m_mapCurrentLayer, std::min(m_beginCol, m_endCol),
                                                                                           std::min(m_beginRow, m_endRow),
                                                                                           std::max(m_beginCol, m_endCol),
                                                                                           std::max(m_beginRow, m_endRow),
                                                                                           -1));

            Update();
        }
    }
    else if(m_insertionMode == FillMode)
    {
        if(event.GetEventType() == wxEVT_LEFT_DOWN)
        {
            m_commandProcessor.Submit(new FloodFillCommand(*m_tilemap, m_mapCurrentLayer, currentColumn, currentRow, m_tileToBeInserted));

            Update();
        }
    }
}

wxPoint TileMapPanel::GetPositionOfTile(int column, int row)
{
    return wxPoint(column *(m_tileset->tileSize.x), row * (m_tileset->tileSize.y));
}

void TileMapPanel::GetTileAt(wxPoint position, unsigned int &tileCol, unsigned int &tileRow)
{
    tileCol = (int)(position.x / m_tileset->tileSize.x);
    tileRow = (int)(position.y / m_tileset->tileSize.y);
}
#endif
