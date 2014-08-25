#ifndef TILEEDITOR_H
#define TILEEDITOR_H
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
protected:
    virtual void OnPreviewErase(wxEraseEvent& event);
    virtual void OnPreviewPaint(wxPaintEvent& event);
};
#endif // TILEEDITOR_H
