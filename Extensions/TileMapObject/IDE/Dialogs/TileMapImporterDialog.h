#ifndef TILEMAPIMPORTERDIALOG_H
#define TILEMAPIMPORTERDIALOG_H
#include "TileMapDialogs.h"

class TileSet;
class TileMap;

class TileMapImporterDialog : public TileMapImporterDialogBase
{
public:
    TileMapImporterDialog(wxWindow* parent, TileSet tileset, TileMap tilemap);
    virtual ~TileMapImporterDialog();

    const TileSet& GetTileSet() const { return m_tileset; }
    const TileMap& GetTileMap() const { return m_tilemap; }

protected:
    virtual void OnBrowserBtClicked(wxCommandEvent& event);
    virtual void OnImportButtonClicked(wxCommandEvent& event);
    virtual void OnOkBtClicked(wxCommandEvent& event);
    virtual void OnCancelBtClicked(wxCommandEvent& event);

private:
    TileSet m_tileset;
    TileMap m_tilemap;
};
#endif // TILEMAPIMPORTERDIALOG_H
