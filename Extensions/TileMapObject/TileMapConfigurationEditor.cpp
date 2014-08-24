#include "TileMapConfigurationEditor.h"

#include <wx/msgdlg.h> 

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
