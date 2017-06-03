/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#include <wx/progdlg.h>
#include <wx/richmsgdlg.h>
#include <wx/filedlg.h>
#include <memory>
#include <SFML/System.hpp>
#include "GDCore/Tools/Localization.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Project/ProjectResourcesCopier.h"
#include "GDCore/IDE/ProjectExporter.h"
#include "GDCore/IDE/wxTools/RecursiveMkDir.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/ProjectFileWriter.h"
#include "GDCore/IDE/PlatformManager.h"
#include "GDCore/CommonTools.h"
#include "Dialogs/NewProjectDialog.h"
#include "Dialogs/StartHerePage.h"
#include "BuildMessagesPnl.h"
#include "MainFrame.h"
#include "BuildToolsPnl.h"
#include "BuildProgressPnl.h"
#include "ProjectManager.h"
#include "GDCpp/IDE/CodeCompiler.h"

using namespace gd;

/**
 * Request close
 */
void MainFrame::OnQuit( wxCommandEvent& event )
{
    Close();
}

void MainFrame::OnCloseCurrentProjectSelected(wxCommandEvent& event)
{
    wxRibbonButtonBarEvent uselessEvent;
    if ( projectManager ) projectManager->OnRibbonCloseSelected(uselessEvent);
}

void MainFrame::CreateNewProject()
{
    NewProjectDialog dialog(this);
    if ( dialog.ShowModal() == 1 )
    {
        gd::Platform* associatedPlatform = gd::PlatformManager::Get()->GetPlatform(dialog.GetChosenTemplatePlatform());
        if ( associatedPlatform != NULL )
        {
            std::shared_ptr<gd::Project> newProject(new gd::Project);

            //Be sure that the directory of the target exists
            wxString targetDirectory = wxFileName::FileName(dialog.GetChosenFilename()).GetPath();
            if ( !wxDirExists(targetDirectory) ) gd::RecursiveMkDir::MkDir(targetDirectory);

            if ( !dialog.GetChosenTemplateFile().empty() )
            {
                gd::ProjectFileWriter::LoadFromFile(*newProject, dialog.GetChosenTemplateFile());
                gd::ProjectResourcesCopier::CopyAllResourcesTo(*newProject, gd::NativeFileSystem::Get(),
                    targetDirectory, false);
            }
            else
                newProject->InsertNewLayout(_("New scene"), 0);

            newProject->SetProjectFile(dialog.GetChosenFilename());
            newProject->AddPlatform(*associatedPlatform);
            Save(*newProject, newProject->GetProjectFile());

            games.push_back(newProject);
            SetCurrentGame(games.size()-1);
            UpdateOpenedProjectsLogFile();
            if (GetStartPage()) GetStartPage()->Refresh();

            //Ensure working directory is set to the IDE one.
            wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());
            if ( newProject->GetLayoutsCount() > 0 ) projectManager->EditLayout(*newProject, newProject->GetLayout(0));
        }
        else gd::LogError(_("Unable to find the platform associated with the template.\n\nPlease report this error to GDevelop developer."));
    }
    else if ( dialog.UserWantToBrowseExamples() )
    {
        wxCommandEvent uselessEvent;
        OnOpenExampleSelected(uselessEvent);
    }

    //Ensure working directory is set to the IDE one.
    wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());
}

void MainFrame::OnMenuNewSelected( wxCommandEvent& event )
{
    CreateNewProject();
}
void MainFrame::OnRibbonNewClicked(wxRibbonButtonBarEvent& evt)
{
    CreateNewProject();
}

/**
 * Open a file
 */
void MainFrame::OnMenuOpenSelected( wxCommandEvent& event )
{
    sf::Lock lock(CodeCompiler::openSaveDialogMutex);

    wxString oldWorkingDir = wxGetCwd();
    wxFileDialog openFileDialog( this, _( "Choose the project to open" ), "", "", "GDevelop Project (*.gdg, *.json)|*.gdg;*.json|GDevelop Project Autosave (*.gdg.autosave)|*.gdg.autosave" );
    wxSetWorkingDirectory(oldWorkingDir); //Ensure Windows does not mess up with the working directory.

    if (openFileDialog.ShowModal() != wxID_CANCEL && !openFileDialog.GetPath().empty() )
        Open(openFileDialog.GetPath());
}
void MainFrame::OnRibbonOpenClicked(wxRibbonButtonBarEvent& evt)
{
    wxCommandEvent uselessEvent;
    OnMenuOpenSelected(uselessEvent);
}

/**
 * Open an example file
 */
void MainFrame::OnOpenExampleSelected(wxCommandEvent& event)
{
    sf::Lock lock(CodeCompiler::openSaveDialogMutex);

    wxString examplesDir = wxGetCwd() + wxFileName::GetPathSeparator()
        + "Examples" + wxFileName::GetPathSeparator();

    wxString oldWorkingDir = wxGetCwd();
    wxFileDialog open(NULL, _("Open an example"), examplesDir, "", "GDevelop Project (*.gdg, *.json)|*.gdg;*.json");
    wxSetWorkingDirectory(oldWorkingDir); //Ensure Windows does not mess up with the working directory.

    if (open.ShowModal() != wxID_CANCEL && !open.GetPath().empty())
        Open(open.GetPath());
}

void MainFrame::OnRibbonOpenDropDownClicked(wxRibbonButtonBarEvent& evt)
{
    evt.PopupMenu(&openContextMenu);
}

void MainFrame::SetLastUsedFile(wxString file)
{
    if ( file.EndsWith(".autosave") ) return;

    m_recentlist.SetLastUsed( file );
    for ( std::size_t i = 0;i < 9;i++ )
        wxConfigBase::Get()->Write( wxString::Format( _T( "/Recent/%d" ), i ), m_recentlist.GetEntry( i ) );
}

/**
 * Open a file
 */
void MainFrame::Open( gd::String file )
{
    sf::Lock lock(CodeCompiler::openSaveDialogMutex);
    bool isJSON = wxString(file).EndsWith(".json");

    std::shared_ptr<gd::Project> newProject(new gd::Project);
    if ((!isJSON && gd::ProjectFileWriter::LoadFromFile(*newProject, file)) ||
        (isJSON  && gd::ProjectFileWriter::LoadFromJSONFile(*newProject, file)))
    {
        //Ensure working directory is set to the IDE one.
        wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());

        games.push_back(newProject);

        SetLastUsedFile( file );
        SetCurrentGame(games.size()-1);
        if (GetStartPage()) GetStartPage()->Refresh();

        //Update the file logging the opened project
        UpdateOpenedProjectsLogFile();

        gd::String unknownExtensions = "";
        for (std::size_t i = 0;i<newProject->GetUsedExtensions().size();++i)
        {
            bool extensionFound = false;

            for(std::size_t p = 0;p<newProject->GetUsedPlatforms().size();++p)
            {
                gd::Platform & platform = *newProject->GetUsedPlatforms()[p];
                std::vector < std::shared_ptr<gd::PlatformExtension> > allExtensions = platform.GetAllPlatformExtensions();
                for (std::size_t e = 0;e<allExtensions.size();++e)
                {
                    if ( allExtensions[e]->GetName() == newProject->GetUsedExtensions()[i])
                    {
                        extensionFound = true;
                        break;
                    }
                }
                if ( extensionFound ) break;
            }

            if ( !extensionFound )
                unknownExtensions += newProject->GetUsedExtensions()[i]+"\n";
        }

        if (unknownExtensions != "")
        {
            wxString errorMsg = _("One or more extensions are used by the project but are not installed for the platform used by the project :\n")
                + unknownExtensions
                + _("\nSome objects, actions, conditions or expressions can be unavailable or not working.");
            gd::LogWarning(errorMsg);
        }
    }

    //Ensure working directory is set to the IDE one.
    wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());
    m_mgr.GetPane("PM").Show();
    m_mgr.Update();
}

void MainFrame::OnMenuSaveSelected( wxCommandEvent& event )
{
    if ( !CurrentGameIsValid() ) return;

    if ( GetCurrentGame()->GetProjectFile().empty() || wxString(GetCurrentGame()->GetProjectFile()).EndsWith(".autosave") )
        SaveAs();
    else
    {
        if (!Save(*GetCurrentGame(), GetCurrentGame()->GetProjectFile()))
            gd::LogError( _("Save failed!") );
    }

    gd::LogStatus( _("Save ended."));
}
void MainFrame::OnRibbonSaveClicked(wxRibbonButtonBarEvent& evt)
{
    wxCommandEvent uselessEvent;
    OnMenuSaveSelected(uselessEvent);
}
void MainFrame::OnRibbonSaveDropDownClicked(wxRibbonButtonBarEvent& evt)
{
    evt.PopupMenu(&saveContextMenu);
}

/**
 * Save all
 */
void MainFrame::OnRibbonSaveAllClicked(wxRibbonButtonBarEvent&)
{
    for (std::size_t i = 0;i<games.size();++i)
    {
        if ( games[i]->GetProjectFile().empty() || wxString(games[i]->GetProjectFile()).EndsWith(".autosave") )
            SaveAs(games[i]);
        else
        {
            if (!Save(*games[i], games[i]->GetProjectFile()))
                gd::LogError( _("Save failed!") );
        }
    }

    gd::LogStatus( _("Saves ended."));
}
void MainFrame::OnMenuSaveAllSelected(wxCommandEvent&)
{
    wxRibbonButtonBarEvent uselessEvent;
    OnRibbonSaveAllClicked(uselessEvent);
}

void MainFrame::OnMenuSaveAsSelected(wxCommandEvent&)
{
    if ( !CurrentGameIsValid() ) return;

    GetCurrentGame()->SetFolderProject(false);
    SaveAs();
    SetCurrentGame(projectCurrentlyEdited);
}

void MainFrame::OnMenuSaveAsFolderSelected(wxCommandEvent&)
{
    if ( !CurrentGameIsValid() ) return;

    GetCurrentGame()->SetFolderProject();
    SaveAs();
    SetCurrentGame(projectCurrentlyEdited);
}


bool MainFrame::Save(gd::Project & project, wxString file)
{
    bool isJSON = file.EndsWith(".json");
    bool success =
        (!isJSON && gd::ProjectFileWriter::SaveToFile(project, file)) ||
        (isJSON  && gd::ProjectFileWriter::SaveToJSONFile(project, file));

    SetLastUsedFile(project.GetProjectFile());
    return success;
}

void MainFrame::SaveAs(std::shared_ptr<gd::Project> project)
{
    sf::Lock lock(CodeCompiler::openSaveDialogMutex);

    if (!project)
    {
        if (!CurrentGameIsValid()) return;
        project = GetCurrentGame();
    }

    //Display dialog box
    wxFileDialog fileDialog( this, _( "Choose where to save the project" ), "", "", "GDevelop Project (*.gdg, *.json)|*.gdg;*.json", wxFD_SAVE );
    fileDialog.ShowModal();

    gd::String file = fileDialog.GetPath();
    #if defined(LINUX) //Extension seems not be added with wxGTK?
    if ( fileDialog.GetFilterIndex() == 0 && !file.empty() && !fileDialog.GetPath().EndsWith(".json") )
        file += ".gdg";
    #endif

    if (file.empty()) return;

    wxString oldPath = !project->GetProjectFile().empty() ? wxFileName::FileName(project->GetProjectFile()).GetPath() : "";

    //Warn the user that resources should maybe be also moved.
    bool avertOnSaveCheck;
    wxConfigBase::Get()->Read("/Save/WarnOnSaveAs", &avertOnSaveCheck, true);
    wxString newPath = wxFileName::FileName(file).GetPath();
    if ( avertOnSaveCheck && newPath != oldPath && oldPath != "" )
    {
        wxRichMessageDialog dlg(this, _("Project has been saved in a new folder.\nDo you want to also copy its resources into this new folder?"), _("Saving in a new directory"), wxYES_NO|wxICON_INFORMATION );
        dlg.ShowCheckBox(_("Do not show again"));

        if ( dlg.ShowModal() == wxID_YES )
        {
            wxProgressDialog progressDialog(_("Save progress"), _("Exporting resources..."));
            gd::ProjectResourcesCopier::CopyAllResourcesTo(*project, NativeFileSystem::Get(),
                newPath, true, &progressDialog);
        }

        if ( dlg.IsCheckBoxChecked() )
            wxConfigBase::Get()->Write("/Save/WarnOnSaveAs", "false");
    }

    project->SetProjectFile(file);
    if (!Save(*project, project->GetProjectFile()))
    {
        gd::LogError(_("The project could not be saved properly!"));
    }

    SetLastUsedFile( GetCurrentGame()->GetProjectFile() );
    UpdateOpenedProjectsLogFile();
}

void MainFrame::OnMenuCompilationSelected( wxCommandEvent& event )
{
    if ( !CurrentGameIsValid() ) return;

    long id = event.GetId();
    if ( idToPlatformExportMenuMap.find(id) == idToPlatformExportMenuMap.end() )
        return;

    std::shared_ptr<gd::ProjectExporter> exporter =
        idToPlatformExportMenuMap[id].first->GetProjectExporters()[idToPlatformExportMenuMap[id].second];
    if ( !exporter ) return;

    exporter->ShowProjectExportDialog(*GetCurrentGame());
}

void MainFrame::OnRecentClicked( wxCommandEvent& event )
{
    wxString last;

    switch ( event.GetId() )
    {
    case wxID_FILE1:
        last = m_recentlist.GetEntry(0);
        break;
    case wxID_FILE2:
        last = m_recentlist.GetEntry(1);
        break;
    case wxID_FILE3:
        last = m_recentlist.GetEntry(2);
        break;
    case wxID_FILE4:
        last = m_recentlist.GetEntry(3);
        break;
    case wxID_FILE5:
        last = m_recentlist.GetEntry(4);
        break;
    case wxID_FILE6:
        last = m_recentlist.GetEntry(5);
        break;
    case wxID_FILE7:
        last = m_recentlist.GetEntry(6);
        break;
    case wxID_FILE8:
        last = m_recentlist.GetEntry(7);
        break;
    case wxID_FILE9:
        last = m_recentlist.GetEntry(8);
        break;

    default:
        break;
    }

    Open(last);
}
