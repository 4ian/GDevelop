/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#ifndef TILESETCONFIGURATIONEDITOR_H
#define TILESETCONFIGURATIONEDITOR_H
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
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

	void UpdatePreviewTileSetPanel(bool newTexture = false);

protected:
    virtual void OnHelpButtonClicked(wxHyperlinkEvent& event);
    virtual void OnTileSetParameterUpdated(wxSpinEvent& event);
    virtual void OnTileSetTextureUpdated(wxCommandEvent& event);
    virtual void OnCancelButtonClicked(wxCommandEvent& event);
    virtual void OnOkButtonClicked(wxCommandEvent& event);
    virtual void OnSetTextureButtonClicked(wxCommandEvent& event);
};
#endif
#endif // TILESETCONFIGURATIONEDITOR_H
