#include "TileMapPanel.h"

#include <iostream>
#include <wx/dcbuffer.h>
#include "GDCore/IDE/CommonBitmapManager.h"

TileMapPanel::TileMapPanel(wxWindow* parent, wxWindowID id, const wxPoint &pos, const wxSize &size, long style) :
    wxScrolledWindow(parent, id, pos, size, style),
    m_tileSetInfo(),
    m_tileToBeInserted(-1, -1),
    m_hideUpperLayers(false),
    m_tilemap(NULL),
    m_mapCurrentLayer(),
    m_bitmapCache()
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

void TileMapPanel::SetTileSet(wxBitmap *tileSetBitmap)
{
    m_tileSetInfo.tileSetBitmap = tileSetBitmap;
}

void TileMapPanel::SetTileSetCount(int columns, int rows)
{
    m_tileSetInfo.tileColumns = columns;
    m_tileSetInfo.tileRows = rows;
}

void TileMapPanel::SetTileSetSize(wxSize tileSize)
{
    m_tileSetInfo.tileSize = tileSize;
}

void TileMapPanel::SetTileSetMargins(wxSize tileMargins)
{
    m_tileSetInfo.tileMargins = tileMargins;
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
    m_bitmapCache.clear();

    for(int col = 0; col < m_tileSetInfo.tileColumns; col++)
    {
        for(int row = 0; row < m_tileSetInfo.tileRows; row++)
        {
            wxRect subBitmapRect(col *(m_tileSetInfo.tileSize.GetWidth() + m_tileSetInfo.tileMargins.GetWidth()),
                                 row *(m_tileSetInfo.tileSize.GetHeight() + m_tileSetInfo.tileMargins.GetHeight()),
                                 m_tileSetInfo.tileSize.GetWidth(),
                                 m_tileSetInfo.tileSize.GetHeight());

            m_bitmapCache[std::make_pair<int, int>(col, row)] = m_tileSetInfo.tileSetBitmap->GetSubBitmap(subBitmapRect);
        }
    }

    Refresh();
}

void TileMapPanel::UpdateScrollBars()
{
    SetScrollbars(1, 1, m_tilemap->GetColumnsCount() * m_tileSetInfo.tileSize.GetWidth(), m_tilemap->GetRowsCount() * m_tileSetInfo.tileSize.GetHeight());
}

void TileMapPanel::OnDraw(wxDC& dc)
{
    wxPoint minPos = GetViewStart();
    int width, height;
    GetVirtualSize(&width, &height);
    wxPoint maxPos = minPos + wxPoint(width, height);

    dc.SetBrush(gd::CommonBitmapManager::Get()->transparentBg);
    dc.DrawRectangle(minPos.x, minPos.y, width, height);

    dc.SetPen(wxPen(wxColor(128, 128, 128, 128), 1));

    //Draw the tiles
    for(int layer = 0; m_hideUpperLayers ? layer <= GetCurrentLayer() : layer < m_tilemap->GetLayersCount(); layer++)
    {
        for(int col = 0; col < m_tilemap->GetColumnsCount(); col++)
        {
            for(int row = 0; row < m_tilemap->GetRowsCount(); row++)
            {
                if(m_tilemap->GetTile(layer, col, row).first == -1 || m_tilemap->GetTile(layer, col, row).second == -1)
                    continue;
    
                dc.DrawBitmap(m_bitmapCache[m_tilemap->GetTile(layer, col, row)], GetPositionOfTile(col, row).x, GetPositionOfTile(col, row).y);
            }
        }
    }

    //Draw the grid
    if(m_tilemap->GetLayersCount() != 0)
    {
        for(int col = 0; col < m_tilemap->GetColumnsCount(); col++)
        {
            dc.DrawLine(col * m_tileSetInfo.tileSize.GetWidth(), minPos.y,
                        col * m_tileSetInfo.tileSize.GetWidth(), maxPos.y);
    
            for(int row = 0; row < m_tilemap->GetRowsCount(); row++)
            {
                dc.DrawLine(minPos.x, row * m_tileSetInfo.tileSize.GetHeight(),
                            maxPos.x, row * m_tileSetInfo.tileSize.GetHeight());
            }
        }
    }
}

void TileMapPanel::OnTileSetSelectionChanged(TileSelectionEvent &event)
{
    std::cout << event.GetSelectedTile().first << ";" << event.GetSelectedTile().second << std::endl;
    m_tileToBeInserted = event.GetSelectedTile();
}

void TileMapPanel::OnLeftButtonPressed(wxMouseEvent& event)
{
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
    return wxPoint(column *(m_tileSetInfo.tileSize.GetWidth()), row * (m_tileSetInfo.tileSize.GetHeight()));
}

void TileMapPanel::GetTileAt(wxPoint position, int &tileCol, int &tileRow)
{
    tileCol = (int)(position.x / m_tileSetInfo.tileSize.GetWidth());
    tileRow = (int)(position.y / m_tileSetInfo.tileSize.GetHeight());
}