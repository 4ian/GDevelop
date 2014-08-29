#ifndef TILEEDITOR_H
#define TILEEDITOR_H

#include <wx/menu.h>

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

protected:
    virtual void OnPredefinedShapeToolClicked(wxCommandEvent& event);
    virtual void OnCollidableToolToggled(wxCommandEvent& event);
    virtual void OnPreviewErase(wxEraseEvent& event);
    virtual void OnPreviewPaint(wxPaintEvent& event);

    void OnPredefinedShapeMenuItemClicked(wxCommandEvent& event);
};
#endif // TILEEDITOR_H
