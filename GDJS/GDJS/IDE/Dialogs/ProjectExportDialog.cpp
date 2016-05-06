/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "ProjectExportDialog.h"
#include <wx/dirdlg.h>
#include <wx/filename.h>
#include <wx/config.h>
 #include <wx/dir.h>
 #include <wx/msgdlg.h>
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/Project/Project.h"
#include "GDCore/CommonTools.h"
#include "GDJS/IDE/ExporterHelper.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"

namespace gdjs
{

ProjectExportDialog::ProjectExportDialog(wxWindow* parent, gd::Project & project_) :
    BaseProjectExportDialog(parent),
    project(project_)
{
    exportFolderEdit->AutoCompleteDirectories();
    cocosExportFolderEdit->AutoCompleteDirectories();
    if ( wxDirExists(project.GetLastCompilationDirectory()) )
    {
        exportFolderEdit->SetValue(project.GetLastCompilationDirectory());
        cocosExportFolderEdit->SetValue(project.GetLastCompilationDirectory());
    }
    else
    {
        exportFolderEdit->SetValue(wxFileName::GetHomeDir()+wxFileName::GetPathSeparator()+DeleteInvalidCharacters(project.GetName()));
        cocosExportFolderEdit->SetValue(wxFileName::GetHomeDir()+wxFileName::GetPathSeparator()+DeleteInvalidCharacters(project.GetName()));
    }

    //Open the latest used export type.
    int latestPage = 0;
    wxConfigBase::Get()->Read("Export/JS platform/LatestExportType", &latestPage, 0);
    exportChoice->SetSelection(latestPage);

    //Check if we last used debug mode.
    bool debugMode = false;
    wxConfigBase::Get()->Read("Export/JS platform/LatestDebugMode", &debugMode, false);
    cocosDebugCheck->SetValue(debugMode);

    hasNode = !ExporterHelper::GetNodeExecutablePath().empty();
    nodejsLink->Show(!hasNode);
    if ( !hasNode )
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
        case 1:
            return PixiCordova;
        case 2:
            return Cocos2d;
        default:
            return Pixi;
    }
}

wxString ProjectExportDialog::DeleteInvalidCharacters(const wxString & directoryName) const
{
    wxString result = directoryName;
    for (std::size_t i =0;i<result.size();)
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
    wxDir dir(GetExportDir());
    if (dir.IsOpened() && dir.HasFiles())
    {
        if (wxMessageBox(
            wxString::Format(wxString("The export folder (%s) is not empty: all files in this folder will be erased.\nAre you sure you want to continue?"),
            GetExportDir().c_str()),
            _("The export folder is not empty"), wxYES_NO | wxICON_WARNING) == wxNO)
            return;
    }

    project.SetLastCompilationDirectory(GetExportDir());
    wxConfigBase::Get()->Write("Export/JS platform/LatestExportType", exportChoice->GetSelection());
    wxConfigBase::Get()->Write("Export/JS platform/LatestDebugMode", IsDebugMode());
    EndModal(1);
}

void ProjectExportDialog::OnBrowseBtClick(wxCommandEvent& event)
{
    wxDirDialog dialog(this, _("Choose a folder, empty if possible, where the game should be exported."));
    if ( dialog.ShowModal() == wxID_OK )
        exportFolderEdit->SetValue(dialog.GetPath());
}

void ProjectExportDialog::OnCocosExportBrowseBtClick(wxCommandEvent& event)
{
    wxDirDialog dialog(this, _("Choose a folder, empty if possible, where the game should be exported."));
    if ( dialog.ShowModal() == wxID_OK )
        cocosExportFolderEdit->SetValue(dialog.GetPath());
}

gd::String ProjectExportDialog::GetExportDir()
{
    if ( GetExportType() == PixiCordova )
        return gd::String(wxFileName::GetHomeDir())+wxString(wxFileName::GetPathSeparator())+gd::String(DeleteInvalidCharacters(project.GetName()));
    if ( GetExportType() == Cocos2d )
        return gd::String(cocosExportFolderEdit->GetValue());
    else
        return gd::String(exportFolderEdit->GetValue());
}

bool ProjectExportDialog::RequestMinify()
{
    if (!hasNode) return false;
    return GetExportType() == PixiCordova || minifyCheck->GetValue();
}

bool ProjectExportDialog::IsDebugMode()
{
    return GetExportType() == Cocos2d && cocosDebugCheck->GetValue();
}

}
#endif
