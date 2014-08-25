#include "TileEditor.h"

#include <algorithm>
#include <wx/dcbuffer.h>
#include "GDCore/IDE/CommonBitmapManager.h"

TileEditor::TileEditor(wxWindow* parent) : 
	TileEditorBase(parent),
	m_tileset(NULL),
	m_currentTile(0)
{
	m_tilePreviewPanel->SetBackgroundStyle(wxBG_STYLE_PAINT);
	UpdateScrollbars();
}

TileEditor::~TileEditor()
{
}

void TileEditor::SetTileSet(TileSet *tileset)
{
	m_tileset = tileset;
	UpdateScrollbars();
	m_tilePreviewPanel->Refresh();
}

void TileEditor::OnTileSetSelectionChanged(TileSelectionEvent &event)
{
	if(!m_tileset || m_tileset->IsDirty())
		return;

	m_currentTile = event.GetSelectedTile();
	UpdateScrollbars();
	m_tilePreviewPanel->Refresh();
}

void TileEditor::OnPreviewErase(wxEraseEvent& event)
{

}

void TileEditor::UpdateScrollbars()
{
	if(!m_tileset || m_tileset->IsDirty()) //If no tileset, stop rendering here
        return;

    //Compute the virtual size and the default scroll position to have a centered tile.
    wxBitmap tileBitmap = m_tileset->GetTileBitmap(m_currentTile);

    int virtualWidth = std::max(m_tilePreviewPanel->GetClientSize().GetWidth(), tileBitmap.GetWidth());
    int virtualHeight = std::max(m_tilePreviewPanel->GetClientSize().GetHeight(), tileBitmap.GetHeight());

    m_tilePreviewPanel->SetVirtualSize(virtualWidth, virtualHeight);

    m_tilePreviewPanel->Scroll(virtualWidth/2 - m_tilePreviewPanel->GetClientSize().GetWidth()/2,
    						   virtualHeight/2 - m_tilePreviewPanel->GetClientSize().GetHeight()/2);
}

void TileEditor::OnPreviewPaint(wxPaintEvent& event)
{
	//Prepare the render
	wxAutoBufferedPaintDC dc(m_tilePreviewPanel);
    m_tilePreviewPanel->DoPrepareDC(dc);

    wxPoint minPos = m_tilePreviewPanel->GetViewStart();
    int width, height;
    m_tilePreviewPanel->GetVirtualSize(&width, &height);
    wxPoint maxPos = minPos + wxPoint(width, height);

    //Draw the background
    dc.SetBrush(gd::CommonBitmapManager::Get()->transparentBg);
    dc.DrawRectangle(minPos.x, minPos.y, width, height);

    if(!m_tileset || m_tileset->IsDirty()) //If no tileset, stop rendering here
        return;

    wxBitmap tileBitmap = m_tileset->GetTileBitmap(m_currentTile);

    dc.DrawBitmap(tileBitmap, width/2 - tileBitmap.GetWidth()/2, height/2 - tileBitmap.GetHeight()/2);
}
