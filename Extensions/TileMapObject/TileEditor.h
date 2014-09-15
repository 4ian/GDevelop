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
