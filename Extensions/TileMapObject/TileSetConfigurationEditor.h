#ifndef TILESETCONFIGURATIONEDITOR_H
#define TILESETCONFIGURATIONEDITOR_H
#include "TileMapDialogs.h"

#include "TileSet.h"

class ResourcesEditor;
namespace gd {class MainFrameWrapper;}

class TileSetConfigurationEditor : public TileSetConfigurationEditorBase
{
public:
    TileSetConfigurationEditor(wxWindow* parent, TileSet &tileSet_, gd::Project & game, gd::MainFrameWrapper & mainFrameWrapper);
    virtual ~TileSetConfigurationEditor();

private:
	TileSet &tileSet;
	ResourcesEditor *resourcesEditorPnl;

protected:
    virtual void OnCancelButtonClicked(wxCommandEvent& event);
    virtual void OnOkButtonClicked(wxCommandEvent& event);
    virtual void OnSetTextureButtonClicked(wxCommandEvent& event);
};
#endif // TILESETCONFIGURATIONEDITOR_H
