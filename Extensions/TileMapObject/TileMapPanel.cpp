#include "TileMapPanel.h"

#include <iostream>
#include <algorithm> 
#include <wx/dcbuffer.h>
#include "GDCore/IDE/CommonBitmapManager.h"

TileMapPanel::TileMapPanel(wxWindow* parent, wxWindowID id, const wxPoint &pos, const wxSize &size, long style) :
    wxScrolledWindow(parent, id, pos, size, style),
    m_tileToBeInserted(-1),
    m_hideUpperLayers(false),
    m_tileset(NULL),
    m_tilemap(NULL),
    m_mapCurrentLayer(0)
{
    Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(TileMapPanel::OnLeftButtonPressed), NULL, this);
}

TileMapPanel::~TileMapPanel()
{

}

void TileMapPanel::SetTileMap(TileMap *tilemap)
{
    m_tilemap = tilemap;
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

void TileMapPanel::Update()
{
    if(!m_tilemap || !m_tileset)
        return;
    SetScrollRate(1, 1);
    SetVirtualSize(m_tilemap->GetColumnsCount() * m_tileset->tileSize.x, m_tilemap->GetRowsCount() * m_tileset->tileSize.y);
    
    Refresh();
}

void TileMapPanel::OnDraw(wxDC& dc)
{
    wxPoint minPos = GetViewStart();
    int width, height;
    GetVirtualSize(&width, &height);
    wxPoint maxPos = minPos + wxPoint(width, height);

    dc.SetBrush(gd::CommonBitmapManager::Get()->transparentBg);
    dc.DrawRectangle(minPos.x, minPos.y, width, height);

    if(!m_tilemap || !m_tileset || m_tileset->IsDirty())
        return;

    dc.SetPen(wxPen(wxColor(128, 128, 128, 128), 1));

    //Draw the tiles
    for(int layer = 0; m_hideUpperLayers ? layer <= GetCurrentLayer() : layer < 3; layer++)
    {
        for(int col = 0; col < m_tilemap->GetColumnsCount(); col++)
        {
            for(int row = 0; row < m_tilemap->GetRowsCount(); row++)
            {
                if(m_tilemap->GetTile(layer, col, row) == -1)
                    continue;
    
                dc.DrawBitmap(m_tileset->GetTileBitmap(m_tilemap->GetTile(layer, col, row)), GetPositionOfTile(col, row).x, GetPositionOfTile(col, row).y);
            }
        }
    }

    //Draw the grid
    for(int col = 0; col < m_tilemap->GetColumnsCount(); col++)
    {
        dc.DrawLine(col * m_tileset->tileSize.x, minPos.y,
                    col * m_tileset->tileSize.x, maxPos.y);

        for(int row = 0; row < m_tilemap->GetRowsCount(); row++)
        {
            dc.DrawLine(minPos.x, row * m_tileset->tileSize.y,
                        maxPos.x, row * m_tileset->tileSize.y);
        }
    }
}

void TileMapPanel::OnTileSetSelectionChanged(TileSelectionEvent &event)
{
    m_tileToBeInserted = event.GetSelectedTile();
}

void TileMapPanel::OnLeftButtonPressed(wxMouseEvent& event)
{
    if(!m_tilemap || !m_tileset)
        return;

    int currentColumn, currentRow;
    wxPoint mousePos = CalcUnscrolledPosition(event.GetPosition());
    GetTileAt(mousePos, currentColumn, currentRow);

    if(currentColumn >= m_tilemap->GetColumnsCount() || currentRow >= m_tilemap->GetRowsCount())
        return;

    m_tilemap->SetTile(m_mapCurrentLayer, currentColumn, currentRow, m_tileToBeInserted);

    Refresh();
}

wxPoint TileMapPanel::GetPositionOfTile(int column, int row)
{
    return wxPoint(column *(m_tileset->tileSize.x), row * (m_tileset->tileSize.y));
}

void TileMapPanel::GetTileAt(wxPoint position, int &tileCol, int &tileRow)
{
    tileCol = (int)(position.x / m_tileset->tileSize.x);
    tileRow = (int)(position.y / m_tileset->tileSize.y);
}