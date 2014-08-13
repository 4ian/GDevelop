#include "TileMapPanel.h"

#include <iostream>

TileMapPanel::TileMapPanel(wxWindow* parent, wxWindowID id, const wxPoint &pos, const wxSize &size, long style) :
    wxScrolledWindow(parent, id, pos, size, style),
    m_tileSetInfo(),
    m_tileToBeInserted(-1, -1),
    m_hideUpperLayers(false),
    m_map(),
    m_mapCurrentLayer(),
    m_bitmapCache()
{
    SetMapSize(0, 0);
    AddLayer(0);

    Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(TileMapPanel::OnLeftButtonPressed), NULL, this);
}

TileMapPanel::~TileMapPanel()
{

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

void TileMapPanel::SetMapSize(int columns, int rows)
{
    m_mapWidth = columns;
    m_mapHeight = rows;

    UpdateMapSize();
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

int TileMapPanel::GetLayersCount() const
{
    return m_map.size();
}

void TileMapPanel::AddLayer(int pos, int asCopyOf)
{
    if(asCopyOf == -1)
    {
        //New layer
        m_map.insert(m_map.begin() + pos, TileMapLayer());
    }
    else
    {
        //Copy of another layer
        m_map.insert(m_map.begin() + pos, TileMapLayer(m_map[asCopyOf]));
    }

    UpdateMapSize();
    Refresh();
}

void TileMapPanel::RemoveLayer(int pos)
{
    m_map.erase(m_map.begin() + pos);

    UpdateMapSize();
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

void TileMapPanel::OnDraw(wxDC& dc)
{
    dc.SetPen(wxPen(wxColor(128, 128, 128, 128), 1));

    //Draw the tiles
    for(int layer = 0; m_hideUpperLayers ? layer <= GetCurrentLayer() : layer < m_map.size(); layer++)
    {
        for(int col = 0; col < m_map[layer].tiles.size(); col++)
        {
            for(int row = 0; row < m_map[layer].tiles[0].size(); row++)
            {
                if(m_map[layer].tiles[col][row].first == -1 || m_map[layer].tiles[col][row].second == -1)
                    continue;
    
                dc.DrawBitmap(m_bitmapCache[m_map[layer].tiles[col][row]], GetPositionOfTile(col, row).x, GetPositionOfTile(col, row).y);
            }
        }
    }

    //Draw the grid
    wxPoint minPos = GetViewStart();
    int width, height;
    GetVirtualSize(&width, &height);
    wxPoint maxPos = minPos + wxPoint(width, height);
    if(m_map.size() != 0)
    {
        for(int col = 0; col < m_mapWidth; col++)
        {
            dc.DrawLine(col * m_tileSetInfo.tileSize.GetWidth(), minPos.y,
                        col * m_tileSetInfo.tileSize.GetWidth(), maxPos.y);
    
            for(int row = 0; row < m_mapHeight; row++)
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

    if(currentColumn >= m_mapWidth || currentRow >= m_mapHeight)
        return;

    m_map[m_mapCurrentLayer].tiles[currentColumn][currentRow] = m_tileToBeInserted;

    Refresh();
}

void TileMapPanel::UpdateMapSize()
{
    for(int layer = 0; layer < m_map.size(); layer++)
    {
        for(int col = 0; col < m_map[layer].tiles.size(); col++)
        {
            m_map[layer].tiles[col].resize(m_mapHeight, std::make_pair<int, int>(-1, -1));
        }
        m_map[layer].tiles.resize(m_mapWidth, std::vector< std::pair<int, int> >(m_mapHeight, std::make_pair<int, int>(-1, -1)));

        SetScrollbars(1, 1, m_mapWidth * m_tileSetInfo.tileSize.GetWidth(), m_mapHeight * m_tileSetInfo.tileSize.GetHeight());
    }
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