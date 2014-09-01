#ifndef TILESETCONFIGURATIONEDITOR_H
#define TILESETCONFIGURATIONEDITOR_H
#include "TileMapDialogs.h"

#include "TileSet.h"

class ResourcesEditor;
namespace gd {class MainFrameWrapper;}

class TileSetConfigurationEditor : public TileSetConfigurationEditorBase
{
public:
    TileSetConfigurationEditor(wxWindow* parent, TileSet &tileSet_, gd::Project & game_, gd::MainFrameWrapper & mainFrameWrapper);
    virtual ~TileSetConfigurationEditor();

private:
	TileSet &tileSet; ///< Ref to the current TileMapObject tileset
	gd::Project &game;

	TileSet previewTileSet;
	ResourcesEditor *resourcesEditorPnl;

	void UpdatePreviewTileSetPanel();

protected:
    virtual void OnTileSetParameterUpdated(wxSpinEvent& event);
    virtual void OnTileSetTextureUpdated(wxCommandEvent& event);
    virtual void OnCancelButtonClicked(wxCommandEvent& event);
    virtual void OnOkButtonClicked(wxCommandEvent& event);
    virtual void OnSetTextureButtonClicked(wxCommandEvent& event);
};
#endif // TILESETCONFIGURATIONEDITOR_H
