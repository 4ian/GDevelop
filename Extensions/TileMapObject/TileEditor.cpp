/**

Game Develop - Tile Map Extension
Copyright (c) 2014 Victor Levasseur (victorlevasseur52@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "TileEditor.h"

#include <algorithm>
#include <wx/dcbuffer.h>
#include <wx/event.h>
#include "GDCore/IDE/CommonBitmapManager.h"

TileEditor::TileEditor(wxWindow* parent) : 
    TileEditorBase(parent),
    m_tileset(NULL),
    m_currentTile(0),
    m_predefinedShapesMenu(new wxMenu()),
    m_xOffset(0.f),
    m_yOffset(0.f),
    m_currentDraggingPoint(-1)
{
    m_tilePreviewPanel->SetBackgroundStyle(wxBG_STYLE_PAINT);
    UpdateScrollbars();

    //Create the predefined shape menu
    m_predefinedShapesMenu->Append(RECTANGLE_SHAPE_TOOL_ID, _("Rectangle Shape"));
    m_predefinedShapesMenu->AppendSeparator();
    m_predefinedShapesMenu->Append(TRIANGLE_TL_SHAPE_TOOL_ID, _("Triangle Shape (top-left)"));
    m_predefinedShapesMenu->Append(TRIANGLE_TR_SHAPE_TOOL_ID, _("Triangle Shape (top-right)"));
    m_predefinedShapesMenu->Append(TRIANGLE_BR_SHAPE_TOOL_ID, _("Triangle Shape (bottom-right)"));
    m_predefinedShapesMenu->Append(TRIANGLE_BL_SHAPE_TOOL_ID, _("Triangle Shape (bottom-left)"));
    m_predefinedShapesMenu->AppendSeparator();
    m_predefinedShapesMenu->Append(SEMIRECT_T_SHAPE_TOOL_ID, _("Half-rectangle (top)"));
    m_predefinedShapesMenu->Append(SEMIRECT_R_SHAPE_TOOL_ID, _("Half-rectangle (right)"));
    m_predefinedShapesMenu->Append(SEMIRECT_B_SHAPE_TOOL_ID, _("Half-rectangle (bottom)"));
    m_predefinedShapesMenu->Append(SEMIRECT_L_SHAPE_TOOL_ID, _("Half-rectangle (left)"));

    Connect(RECTANGLE_SHAPE_TOOL_ID, SEMIRECT_L_SHAPE_TOOL_ID, wxEVT_COMMAND_MENU_SELECTED, wxCommandEventHandler(TileEditor::OnPredefinedShapeMenuItemClicked), NULL, this);
}

TileEditor::~TileEditor()
{
}

void TileEditor::SetTileSet(TileSet *tileset)
{
    m_tileset = tileset;
    UpdateScrollbars();
    m_tilePreviewPanel->Refresh();

    //Update the tools according to the selected tile
    TileSelectionEvent event(TILE_SELECTION_CHANGED, -1, m_currentTile);
    OnTileSetSelectionChanged(event);
}

void TileEditor::OnTileSetSelectionChanged(TileSelectionEvent &event)
{
    if(!m_tileset || m_tileset->IsDirty())
        return;

    m_currentTile = event.GetSelectedTile();
    m_mainToolbar->ToggleTool(COLLIDABLE_TOOL_ID, m_tileset->GetTileHitbox(m_currentTile).collidable);
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

wxPoint TileEditor::GetRealPosition(wxPoint absolutePos)
{
    wxPoint realPoint(m_tilePreviewPanel->CalcUnscrolledPosition(absolutePos).x - m_xOffset,
                      m_tilePreviewPanel->CalcUnscrolledPosition(absolutePos).y - m_yOffset);

    return realPoint;
}

void TileEditor::OnPreviewPaint(wxPaintEvent& event)
{
    //Prepare the render
    wxAutoBufferedPaintDC dc(m_tilePreviewPanel);
    m_tilePreviewPanel->DoPrepareDC(dc);

    wxPoint minPos = m_tilePreviewPanel->GetViewStart();
    int width, height;
    m_tilePreviewPanel->GetClientSize(&width, &height);
    wxPoint maxPos = minPos + wxPoint(width, height);

    //Draw the background
    dc.SetBrush(gd::CommonBitmapManager::Get()->transparentBg);
    dc.DrawRectangle(minPos.x, minPos.y, width, height);

    if(!m_tileset || m_tileset->IsDirty()) //If no tileset, stop rendering here
        return;

    //Draw the tile and compute the drawing offset
    wxBitmap tileBitmap = m_tileset->GetTileBitmap(m_currentTile);
    m_xOffset = width/2 - tileBitmap.GetWidth()/2;
    m_yOffset = height/2 - tileBitmap.GetHeight()/2;
    dc.DrawBitmap(tileBitmap, m_xOffset, m_yOffset);

    //Draw the hitbox
    dc.SetBrush(wxBrush(wxColour(128,128,128), wxBRUSHSTYLE_FDIAGONAL_HATCH));
    dc.SetPen(wxPen(wxColour(100,100,100)));

    //List all points
    wxPointList list;
    for (unsigned int i = 0; i < m_tileset->GetTileHitbox(m_currentTile).hitbox.vertices.size();++i)
    {
        list.push_back(new wxPoint(m_tileset->GetTileHitbox(m_currentTile).hitbox.vertices[i].x, 
                                   m_tileset->GetTileHitbox(m_currentTile).hitbox.vertices[i].y));
    }

    //Draw the polygon
    dc.DrawPolygon(&list, m_xOffset, m_yOffset);

    //Draw all points
    for(unsigned int i = 0; i < list.size(); i++)
    {
        dc.DrawBitmap(gd::CommonBitmapManager::Get()->point, 
                      m_xOffset + list[i]->x - gd::CommonBitmapManager::Get()->point.GetWidth()/2,
                      m_yOffset + list[i]->y - gd::CommonBitmapManager::Get()->point.GetHeight()/2);
    }

    //Show a warning if the polygon isn't convex
    if(!m_tileset->GetTileHitbox(m_currentTile).hitbox.IsConvex())
    {
        dc.DrawBitmap(wxBitmap("res/warning.png", wxBITMAP_TYPE_PNG), 5, 5);
        dc.SetPen(wxPen(wxColour(0,0,0)));
        dc.DrawText(_("This polygon must be convex, it's not the case."), 25, 5);
    }
}

void TileEditor::OnCollidableToolToggled(wxCommandEvent& event)
{ 
    m_tileset->GetTileHitbox(m_currentTile).collidable = event.IsChecked();
}

void TileEditor::OnPredefinedShapeToolClicked(wxCommandEvent& event)
{
    PopupMenu(m_predefinedShapesMenu);
}

void TileEditor::OnPredefinedShapeMenuItemClicked(wxCommandEvent& event)
{
    if(!m_tileset || m_tileset->IsDirty())
        return;

    //Set the predefined shapes as hitbox
    switch(event.GetId())
    {
        case RECTANGLE_SHAPE_TOOL_ID:
            m_tileset->GetTileHitbox(m_currentTile) = TileHitbox::Rectangle(m_tileset->tileSize);
            break;
        case TRIANGLE_TL_SHAPE_TOOL_ID:
            m_tileset->GetTileHitbox(m_currentTile) = TileHitbox::Triangle(m_tileset->tileSize, TileHitbox::TopLeft);
            break;
        case TRIANGLE_TR_SHAPE_TOOL_ID:
            m_tileset->GetTileHitbox(m_currentTile) = TileHitbox::Triangle(m_tileset->tileSize, TileHitbox::TopRight);
            break;
        case TRIANGLE_BR_SHAPE_TOOL_ID:
            m_tileset->GetTileHitbox(m_currentTile) = TileHitbox::Triangle(m_tileset->tileSize, TileHitbox::BottomRight);
            break;
        case TRIANGLE_BL_SHAPE_TOOL_ID:
            m_tileset->GetTileHitbox(m_currentTile) = TileHitbox::Triangle(m_tileset->tileSize, TileHitbox::BottomLeft);
            break;
        case SEMIRECT_T_SHAPE_TOOL_ID:
            m_tileset->GetTileHitbox(m_currentTile) = TileHitbox::Rectangle(sf::Vector2f(m_tileset->tileSize.x, m_tileset->tileSize.y/2.f));
            break;
        case SEMIRECT_R_SHAPE_TOOL_ID:
            m_tileset->GetTileHitbox(m_currentTile) = TileHitbox::Rectangle(sf::Vector2f(m_tileset->tileSize.x/2.f, m_tileset->tileSize.y));
            m_tileset->GetTileHitbox(m_currentTile).hitbox.Move(m_tileset->tileSize.x/2.f, 0);
            break;
        case SEMIRECT_B_SHAPE_TOOL_ID:
            m_tileset->GetTileHitbox(m_currentTile) = TileHitbox::Rectangle(sf::Vector2f(m_tileset->tileSize.x, m_tileset->tileSize.y/2.f));
            m_tileset->GetTileHitbox(m_currentTile).hitbox.Move(0, m_tileset->tileSize.y/2.f);
            break;
        case SEMIRECT_L_SHAPE_TOOL_ID:
            m_tileset->GetTileHitbox(m_currentTile) = TileHitbox::Rectangle(sf::Vector2f(m_tileset->tileSize.x/2.f, m_tileset->tileSize.y));
            break;
    }

    //Update the tools according to the properties' changes
    TileSelectionEvent tileEvent(TILE_SELECTION_CHANGED, -1, m_currentTile);
    OnTileSetSelectionChanged(tileEvent);
}

void TileEditor::OnAddPointToolClicked(wxCommandEvent& event)
{

}

void TileEditor::OnEditPointToolClicked(wxCommandEvent& event)
{

}

void TileEditor::OnRemovePointToolClicked(wxCommandEvent& event)
{

}

void TileEditor::OnPreviewLeftDown(wxMouseEvent& event)
{
    if(!m_tileset || m_tileset->IsDirty())
        return;

    //Test if the mouse is hovering a point
    for (unsigned int i = 0; i < m_tileset->GetTileHitbox(m_currentTile).hitbox.vertices.size();++i)
    {
        list.push_back(new wxPoint(m_tileset->GetTileHitbox(m_currentTile).hitbox.vertices[i].x, 
                                   m_tileset->GetTileHitbox(m_currentTile).hitbox.vertices[i].y));
    }
}

void TileEditor::OnPreviewLeftUp(wxMouseEvent& event)
{
    m_currentDraggingPoint = -1; //Stop the point dragging
}

void TileEditor::OnPreviewMotion(wxMouseEvent& event)
{
    if(!m_tileset || m_tileset->IsDirty())
        return;

    if(m_currentDraggingPoint != -1) // Currently dragging a point
    {
        
    }
}
