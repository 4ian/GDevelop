/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2015 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
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
	gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/built_tilemap/tilemapconfig");
}
#endif
