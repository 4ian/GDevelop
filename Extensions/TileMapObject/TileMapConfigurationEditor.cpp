/**

GDevelop - Tile Map Extension
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

#include "TileMapConfigurationEditor.h"

#include <wx/msgdlg.h>
#include "GDCore/Tools/HelpFileAccess.h"

TileMapConfigurationEditor::TileMapConfigurationEditor(wxWindow* parent, TileMap &tileMap_) :
	TileMapConfigurationEditorBase(parent),
	tileMap(tileMap_)
{
	m_mapWidthSpin->SetValue(tileMap.GetColumnsCount());
	m_mapHeightSpin->SetValue(tileMap.GetRowsCount());
}

TileMapConfigurationEditor::~TileMapConfigurationEditor()
{

}

void TileMapConfigurationEditor::OnCancelPressed(wxCommandEvent& event)
{
	EndModal(0);
}

void TileMapConfigurationEditor::OnOkPressed(wxCommandEvent& event)
{
	int newMapWidth(m_mapWidthSpin->GetValue());
	int newMapHeight(m_mapHeightSpin->GetValue());

	if(newMapWidth < tileMap.GetColumnsCount() || newMapHeight < tileMap.GetRowsCount())
	{
		//The tilemap will be smaller (less columns, less rows or both),
		//warn the user about the possible loss of data
		if(wxMessageBox(_("The map will be smaller after that change. You can possibly lose data.\nAre you sure to continue ?"),
						_("Map size"),
						wxYES_NO|wxNO_DEFAULT|wxICON_EXCLAMATION,
						this) == wxNO)
		{
			return;
		}
	}

	tileMap.SetSize(newMapWidth, newMapHeight);
	EndModal(1);
}

void TileMapConfigurationEditor::OnHelpButtonClicked(wxHyperlinkEvent& event)
{
	gd::HelpFileAccess::Get()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/built_tilemap/tilemapconfig"));
}
