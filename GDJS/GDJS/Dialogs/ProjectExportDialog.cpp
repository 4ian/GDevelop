/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "ProjectExportDialog.h"
#include <wx/dirdlg.h>
#include <wx/filename.h>
#include <wx/config.h>
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/CommonTools.h"
#include "GDJS/Exporter.h"
#include "GDCore/IDE/SkinHelper.h"

namespace gdjs
{

ProjectExportDialog::ProjectExportDialog(wxWindow* parent, gd::Project & project_) :
    BaseProjectExportDialog(parent),
    project(project_)
{
    //TODO: Remove when CocoonJS and IntelXDK support is fully working.
    exportChoice->RemovePage(3);
    exportChoice->RemovePage(2);

    exportFolderEdit->AutoCompleteDirectories();
    if ( wxDirExists(project.GetLastCompilationDirectory()) )
        exportFolderEdit->SetValue(project.GetLastCompilationDirectory());
    else
    {
        exportFolderEdit->SetValue(wxFileName::GetHomeDir()+wxFileName::GetPathSeparator()+DeleteInvalidCharacters(project.GetName()));
    }

    //Open the latest used export type.
    int latestPage = 0;
    wxConfigBase::Get()->Read("Export/JS platform/LatestExportType", &latestPage, 0);
    exportChoice->SetSelection(latestPage);

    hasJava = !Exporter::GetJavaExecutablePath().empty();
    if ( !hasJava )
    {
        minifyCheck->Disable();
        minifyCheck->SetValue(false);
    }
}

ProjectExportDialog::~ProjectExportDialog()
{
}

ProjectExportDialog::ExportType ProjectExportDialog::GetExportType()
{
    switch(exportChoice->GetSelection())
    {
        case 0:
            return GameDevShare;
        case 2:
            return IntelXDK;
        case 3:
            return CocoonJS;
        default:
            return Normal;
    }
}

wxString ProjectExportDialog::DeleteInvalidCharacters(const wxString & directoryName) const
{
    wxString result = directoryName;
    for (unsigned int i =0;i<result.size();)
    {
        wxChar character = result[i];
        if ( character == '/' || character == '\\' || character == '"' || character == '*' || character == ':' || character == '|' || character == '<' || character == '>' || character == '?' )
            result.erase(result.begin()+i);
        else
            ++i;
    }

    return result;
}

void ProjectExportDialog::OnCloseBtClicked(wxCommandEvent& event)
{
    EndModal(0);
}
void ProjectExportDialog::OnExportBtClicked(wxCommandEvent& event)
{
    wxConfigBase::Get()->Write("Export/JS platform/LatestExportType", exportChoice->GetSelection());
    EndModal(1);
}

void ProjectExportDialog::OnBrowseBtClick(wxCommandEvent& event)
{
    wxDirDialog dialog(this, _("Choose a folder, empty if possible, where create your game."));
    if ( dialog.ShowModal() == wxID_OK )
        exportFolderEdit->SetValue(dialog.GetPath());
}

std::string ProjectExportDialog::GetExportDir()
{
    if ( GetExportType() == Normal )
        return std::string(exportFolderEdit->GetValue().mb_str());
    else
        return gd::ToString(wxFileName::GetHomeDir()+wxFileName::GetPathSeparator()+DeleteInvalidCharacters(project.GetName()));
}

bool ProjectExportDialog::RequestMinify()
{
    if (!hasJava) return false;
    return GetExportType() != Normal || minifyCheck->GetValue();
}

}
#endif