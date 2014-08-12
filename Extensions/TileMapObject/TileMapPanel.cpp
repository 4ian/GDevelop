#include "TileMapPanel.h"

#include <iostream>

TileMapPanel::TileMapPanel(wxWindow* parent, wxWindowID id, const wxPoint &pos, const wxSize &size, long style) :
    wxScrolledWindow(parent, id, pos, size, style),
    m_tileSetInfo(),
    m_tileToBeInserted(-1, -1),
    m_map()
{
    SetMapSize(0, 0);

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
    for(int col = 0; col < m_map.size(); col++)
    {
        m_map[col].resize(rows, std::make_pair<int, int>(-1, -1));
    }
    m_map.resize(columns, std::vector< std::pair<int, int> >(rows, std::make_pair<int, int>(-1, -1)));

    SetScrollbars(1, 1, columns * m_tileSetInfo.tileSize.GetWidth(), rows * m_tileSetInfo.tileSize.GetHeight());
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
    for(int col = 0; col < m_map.size(); col++)
    {
        for(int row = 0; row < m_map[0].size(); row++)
        {
            if(m_map[col][row].first == -1 || m_map[col][row].second == -1)
                continue;

            dc.DrawBitmap(m_bitmapCache[m_map[col][row]], GetPositionOfTile(col, row).x, GetPositionOfTile(col, row).y);
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

    if(currentColumn >= m_map.size() || currentRow >= m_map[0].size())
        return;

    m_map[currentColumn][currentRow] = m_tileToBeInserted;

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