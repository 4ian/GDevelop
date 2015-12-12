/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2015 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef TILEEDITOR_H
#define TILEEDITOR_H

#include <wx/menu.h>
#include "GDCore/IDE/Dialogs/PolygonEditionHelper.h"

#include "TileMapDialogs.h"
#include "TileSet.h"

class TileEditor : public TileEditorBase
{
public:
    TileEditor(wxWindow* parent);
    virtual ~TileEditor();

    void SetTileSet(TileSet *tileset);
    void UpdateScrollbars();

    void OnTileSetSelectionChanged(TileSelectionEvent &event);

private:
	TileSet *m_tileset;
	int m_currentTile;

	wxMenu *m_predefinedShapesMenu;

    float m_xOffset;
    float m_yOffset;

    gd::PolygonEditionHelper m_polygonHelper;

    wxPoint GetRealPosition(wxPoint absolutePos);

protected:
    virtual void OnPreviewLeftDown(wxMouseEvent& event);
    virtual void OnPreviewLeftUp(wxMouseEvent& event);
    virtual void OnPreviewMotion(wxMouseEvent& event);
    virtual void OnAddPointToolClicked(wxCommandEvent& event);
    virtual void OnEditPointToolClicked(wxCommandEvent& event);
    virtual void OnRemovePointToolClicked(wxCommandEvent& event);
    virtual void OnPredefinedShapeToolClicked(wxCommandEvent& event);
    virtual void OnCollidableToolToggled(wxCommandEvent& event);
    virtual void OnPreviewErase(wxEraseEvent& event);
    virtual void OnPreviewPaint(wxPaintEvent& event);

    void OnPredefinedShapeMenuItemClicked(wxCommandEvent& event);
};
#endif // TILEEDITOR_H
#endif
