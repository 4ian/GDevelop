#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include "AndroidExportDialog.h"

#include <wx/dirdlg.h>

#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/HelpFileAccess.h"

AndroidExportDialog::AndroidExportDialog(wxWindow* parent)
    : AndroidExportDialogBase(parent)
{
    Fit();
}

AndroidExportDialog::~AndroidExportDialog()
{

}

wxString AndroidExportDialog::GetExportPath() const
{
    return m_exportFolderTextCtrl->GetValue();
}

void AndroidExportDialog::OnHelpButtonClicked(wxHyperlinkEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/native_android_export");
}

void AndroidExportDialog::OnBrowseButtonClicked(wxCommandEvent& event)
{
    wxDirDialog dialog(this, _("Choose a folder, empty if possible, where create your game."));
    if ( dialog.ShowModal() == wxID_OK )
        m_exportFolderTextCtrl->SetValue(dialog.GetPath());
}

#endif
