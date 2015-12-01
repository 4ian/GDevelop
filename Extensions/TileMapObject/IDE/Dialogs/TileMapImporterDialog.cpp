#include "TileMapImporterDialog.h"

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GDCore/Tools/Log.h"
#include "IDE/TMXImport/TileMapImporter.h"
#include "TileSet.h"
#include "TileMap.h"

TileMapImporterDialog::TileMapImporterDialog(wxWindow* parent, TileSet tileset, TileMap tilemap, gd::Project &project)
    : TileMapImporterDialogBase(parent),
    m_tileset(tileset),
    m_tilemap(tilemap),
    m_project(project)
{
    m_okBt->Disable();
}

TileMapImporterDialog::~TileMapImporterDialog()
{
}

void TileMapImporterDialog::OnBrowserBtClicked(wxCommandEvent& event)
{
    wxFileDialog openFileDialog(this, _("Import .tmx file"), "", "", "Tiled file (*.tmx)|*.tmx", wxFD_OPEN|wxFD_FILE_MUST_EXIST);
    if (openFileDialog.ShowModal() == wxID_CANCEL)
        return;

    m_fileTextCtrl->SetValue(openFileDialog.GetPath());
}

void TileMapImporterDialog::OnImportButtonClicked(wxCommandEvent& event)
{
    try
    {
        m_okBt->Enable();
        TileMapImporter importer(m_fileTextCtrl->GetValue());

        //TODO: Check the checkboxes :) !
        if(!importer.ImportTileMap(m_tileset, m_tilemap,
            m_tilemapCheckBox->GetValue(),
            m_tilesetConfCheckBox->GetValue(),
            m_tilesetImageCheckBox->GetValue(),
            m_hitboxesCheckBox->GetValue(),
            m_project))
        {
            m_okBt->Disable();
        }
    }
    catch (const std::runtime_error &exc)
    {
        gd::LogError(_("Unable to read the file !"));
        m_okBt->Disable();
    }
}

void TileMapImporterDialog::OnOkBtClicked(wxCommandEvent& event)
{
    EndModal(1);
}

void TileMapImporterDialog::OnCancelBtClicked(wxCommandEvent& event)
{
    EndModal(0);
}

#endif
