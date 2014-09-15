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
    virtual void OnHelpButtonClicked(wxHyperlinkEvent& event);
    virtual void OnTileSetParameterUpdated(wxSpinEvent& event);
    virtual void OnTileSetTextureUpdated(wxCommandEvent& event);
    virtual void OnCancelButtonClicked(wxCommandEvent& event);
    virtual void OnOkButtonClicked(wxCommandEvent& event);
    virtual void OnSetTextureButtonClicked(wxCommandEvent& event);
};
#endif // TILESETCONFIGURATIONEDITOR_H
