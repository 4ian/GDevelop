/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2015 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#ifndef TILEMAPCONFIGURATIONEDITOR_H
#define TILEMAPCONFIGURATIONEDITOR_H
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "TileMapDialogs.h"

#include "TileMap.h"

class TileMapConfigurationEditor : public TileMapConfigurationEditorBase
{
public:
    TileMapConfigurationEditor(wxWindow* parent, TileMap &tileMap_);
    virtual ~TileMapConfigurationEditor();

private:
	TileMap &tileMap;
protected:
    virtual void OnHelpButtonClicked(wxHyperlinkEvent& event);
    virtual void OnCancelPressed(wxCommandEvent& event);
    virtual void OnOkPressed(wxCommandEvent& event);
};
#endif
#endif // TILEMAPCONFIGURATIONEDITOR_H
