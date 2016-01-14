/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "TileEditor.h"

#include <algorithm>
#include <wx/dcbuffer.h>
#include <wx/event.h>
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/wxTools/CommonBitmapProvider.h"

TileEditor::TileEditor(wxWindow* parent) :
    TileEditorBase(parent),
    m_tileset(NULL),
    m_currentTile(0),
    m_predefinedShapesMenu(new wxMenu()),
    m_xOffset(0.f),
    m_yOffset(0.f),
    m_polygonHelper()
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

    //Update the editor with the new tile
    m_currentTile = event.GetSelectedTile();
    m_mainToolbar->ToggleTool(COLLIDABLE_TOOL_ID, m_tileset->IsTileCollidable(m_currentTile));
    UpdateScrollbars();
    m_tilePreviewPanel->Refresh();

    m_tileIdLabel->SetLabel(_("Tile ID: ") + wxString::FromDouble(m_currentTile));
}

void TileEditor::OnPreviewErase(wxEraseEvent& event)
{

}

void TileEditor::UpdateScrollbars()
{
    if(!m_tileset || m_tileset->IsDirty()) //If no tileset, stop rendering here
        return;

    //Compute the virtual size and the default scroll position to have a centered tile.

    int virtualWidth = std::max(m_tilePreviewPanel->GetClientSize().GetWidth(), (int)m_tileset->tileSize.x);
    int virtualHeight = std::max(m_tilePreviewPanel->GetClientSize().GetHeight(), (int)m_tileset->tileSize.y);

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

    //Load the tileset
    wxBitmap btmp(m_tileset->GetWxBitmap());
    wxMemoryDC tilesetDC;
    tilesetDC.SelectObject(btmp);

    wxPoint minPos = m_tilePreviewPanel->GetViewStart();
    int width, height;
    m_tilePreviewPanel->GetClientSize(&width, &height);
    wxPoint maxPos = minPos + wxPoint(width, height);

    //Draw the background
    dc.SetBrush(gd::CommonBitmapProvider::Get()->transparentBg);
    dc.DrawRectangle(minPos.x, minPos.y, width, height);

    if(!m_tileset || m_tileset->IsDirty()) //If no tileset, stop rendering here
        return;

    //Draw the tile and compute the drawing offset
    m_xOffset = width/2 - m_tileset->tileSize.x/2;
    m_yOffset = height/2 - m_tileset->tileSize.y/2;
    dc.Blit(m_xOffset,
            m_yOffset,
            m_tileset->tileSize.x,
            m_tileset->tileSize.y,
            &tilesetDC,
            m_tileset->GetTileTextureCoords(m_currentTile).topLeft.x,
            m_tileset->GetTileTextureCoords(m_currentTile).topLeft.y,
            wxCOPY,
            true);

    //Draw the hitbox
    std::vector<Polygon2d> polygonList(1, m_tileset->GetTileHitbox(m_currentTile).hitbox);
    m_polygonHelper.OnPaint(polygonList, dc, wxPoint(m_xOffset, m_yOffset));

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
    m_tileset->SetTileCollidable(m_currentTile, event.IsChecked());
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
            m_tileset->GetTileHitboxRef(m_currentTile) = TileHitbox::Rectangle(m_tileset->tileSize);
            break;
        case TRIANGLE_TL_SHAPE_TOOL_ID:
            m_tileset->GetTileHitboxRef(m_currentTile) = TileHitbox::Triangle(m_tileset->tileSize, TileHitbox::TopLeft);
            break;
        case TRIANGLE_TR_SHAPE_TOOL_ID:
            m_tileset->GetTileHitboxRef(m_currentTile) = TileHitbox::Triangle(m_tileset->tileSize, TileHitbox::TopRight);
            break;
        case TRIANGLE_BR_SHAPE_TOOL_ID:
            m_tileset->GetTileHitboxRef(m_currentTile) = TileHitbox::Triangle(m_tileset->tileSize, TileHitbox::BottomRight);
            break;
        case TRIANGLE_BL_SHAPE_TOOL_ID:
            m_tileset->GetTileHitboxRef(m_currentTile) = TileHitbox::Triangle(m_tileset->tileSize, TileHitbox::BottomLeft);
            break;
        case SEMIRECT_T_SHAPE_TOOL_ID:
            m_tileset->GetTileHitboxRef(m_currentTile) = TileHitbox::Rectangle(sf::Vector2f(m_tileset->tileSize.x, m_tileset->tileSize.y/2.f));
            break;
        case SEMIRECT_R_SHAPE_TOOL_ID:
            m_tileset->GetTileHitboxRef(m_currentTile) = TileHitbox::Rectangle(sf::Vector2f(m_tileset->tileSize.x/2.f, m_tileset->tileSize.y));
            m_tileset->GetTileHitboxRef(m_currentTile).hitbox.Move(m_tileset->tileSize.x/2.f, 0);
            break;
        case SEMIRECT_B_SHAPE_TOOL_ID:
            m_tileset->GetTileHitboxRef(m_currentTile) = TileHitbox::Rectangle(sf::Vector2f(m_tileset->tileSize.x, m_tileset->tileSize.y/2.f));
            m_tileset->GetTileHitboxRef(m_currentTile).hitbox.Move(0, m_tileset->tileSize.y/2.f);
            break;
        case SEMIRECT_L_SHAPE_TOOL_ID:
            m_tileset->GetTileHitboxRef(m_currentTile) = TileHitbox::Rectangle(sf::Vector2f(m_tileset->tileSize.x/2.f, m_tileset->tileSize.y));
            break;
    }

    //Update the tools according to the properties' changes
    TileSelectionEvent tileEvent(TILE_SELECTION_CHANGED, -1, m_currentTile);
    OnTileSetSelectionChanged(tileEvent);
}

void TileEditor::OnAddPointToolClicked(wxCommandEvent& event)
{
    if(!m_tileset || m_tileset->IsDirty())
        return;

    Polygon2d &mask = m_tileset->GetTileHitboxRef(m_currentTile).hitbox;

    int selectedPoint = m_polygonHelper.GetSelectedPoint();
    if(selectedPoint >= mask.vertices.size() || selectedPoint < 0)
    {
        if(mask.vertices.size() <= 2)
            return;
        else
            selectedPoint = mask.vertices.size() - 1;
    }

    int nextToSelectedPoint = ( (selectedPoint == (mask.vertices.size() - 1) ) ? 0 : selectedPoint + 1 );

    sf::Vector2f newPoint = mask.vertices[selectedPoint] + mask.vertices[nextToSelectedPoint];
    newPoint.x /= 2.f;
    newPoint.y /= 2.f;

    mask.vertices.insert(mask.vertices.begin() + selectedPoint + 1, newPoint);

    m_tilePreviewPanel->Refresh();
}

void TileEditor::OnEditPointToolClicked(wxCommandEvent& event)
{
    if(!m_tileset || m_tileset->IsDirty())
        return;

    Polygon2d &mask = m_tileset->GetTileHitboxRef(m_currentTile).hitbox;
    int selectedPoint = m_polygonHelper.GetSelectedPoint();
    if(selectedPoint >= mask.vertices.size() || selectedPoint < 0)
        return;

    gd::String x_str = wxGetTextFromUser(_("Enter the X position of the point ( regarding the tile )."), _("X position"),gd::String::From(mask.vertices[selectedPoint].x));
    gd::String y_str = wxGetTextFromUser(_("Enter the Y position of the point ( regarding the tile )."), _("Y position"),gd::String::From(mask.vertices[selectedPoint].y));

    mask.vertices[selectedPoint].x = x_str.To<int>();
    mask.vertices[selectedPoint].y = y_str.To<int>();

    m_tilePreviewPanel->Refresh();
}

void TileEditor::OnRemovePointToolClicked(wxCommandEvent& event)
{
    if(!m_tileset || m_tileset->IsDirty())
        return;

    Polygon2d &mask = m_tileset->GetTileHitboxRef(m_currentTile).hitbox;
    if(mask.vertices.size() <= 3)
        return;

    int selectedPoint = m_polygonHelper.GetSelectedPoint();
    if(selectedPoint >= mask.vertices.size() || selectedPoint < 0)
        return;

    mask.vertices.erase(mask.vertices.begin() + selectedPoint);

    m_tilePreviewPanel->Refresh();
}

void TileEditor::OnPreviewLeftDown(wxMouseEvent& event)
{
    if(!m_tileset || m_tileset->IsDirty())
        return;

    event.SetX(m_tilePreviewPanel->CalcUnscrolledPosition(wxPoint(event.GetX(), event.GetY())).x);
    event.SetY(m_tilePreviewPanel->CalcUnscrolledPosition(wxPoint(event.GetX(), event.GetY())).y);

    std::vector<Polygon2d> polygonList(1, m_tileset->GetTileHitboxRef(m_currentTile).hitbox);
    m_polygonHelper.OnMouseLeftDown(polygonList, event, wxPoint(m_xOffset, m_yOffset));
    m_tileset->GetTileHitboxRef(m_currentTile).hitbox = polygonList[0];

    m_tilePreviewPanel->Refresh();
}

void TileEditor::OnPreviewLeftUp(wxMouseEvent& event)
{
    event.SetX(m_tilePreviewPanel->CalcUnscrolledPosition(wxPoint(event.GetX(), event.GetY())).x);
    event.SetY(m_tilePreviewPanel->CalcUnscrolledPosition(wxPoint(event.GetX(), event.GetY())).y);

    m_polygonHelper.OnMouseLeftUp(event);

    m_tilePreviewPanel->Refresh();
}

void TileEditor::OnPreviewMotion(wxMouseEvent& event)
{
    if(!m_tileset || m_tileset->IsDirty())
        return;

    event.SetX(m_tilePreviewPanel->CalcUnscrolledPosition(wxPoint(event.GetX(), event.GetY())).x);
    event.SetY(m_tilePreviewPanel->CalcUnscrolledPosition(wxPoint(event.GetX(), event.GetY())).y);

    std::vector<Polygon2d> polygonList(1, m_tileset->GetTileHitboxRef(m_currentTile).hitbox);
    m_polygonHelper.OnMouseMove(polygonList, event, wxPoint(m_xOffset, m_yOffset), 0.f, 0.f, m_tileset->tileSize.x, m_tileset->tileSize.y);
    m_tileset->GetTileHitboxRef(m_currentTile).hitbox = polygonList[0];

    m_tilePreviewPanel->Refresh();
}
#endif
