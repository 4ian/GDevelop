#ifndef TILEMAPCONFIGURATIONEDITOR_H
#define TILEMAPCONFIGURATIONEDITOR_H
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
    virtual void OnCancelPressed(wxCommandEvent& event);
    virtual void OnOkPressed(wxCommandEvent& event);
};
#endif // TILEMAPCONFIGURATIONEDITOR_H
