/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <wx/progdlg.h>
#include <wx/richmsgdlg.h>
#include <wx/filedlg.h>
#include <boost/shared_ptr.hpp>
#include <SFML/System.hpp>
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/IDE/ProjectResourcesCopier.h"
#include "GDCore/IDE/wxTools/RecursiveMkDir.h"
#include "GDCore/CommonTools.h"
#include "GDL/Project.h"
#include "GDL/Project.h"
#include "GDL/IDE/CompilerMessagesParser.h"
#include "GDL/IDE/CodeCompiler.h"
#include "GDL/CommonTools.h"
#include "Dialogs/NewProjectDialog.h"
#include "BuildMessagesPnl.h"
#include "MainFrame.h"
#include "BuildToolsPnl.h"
#include "BuildProgressPnl.h"
#include "Compilation.h"
#include "GDCore/IDE/PlatformManager.h"
#include "Fusion.h"
#include "ProjectManager.h"
#include "StartHerePage.h"

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
        boost::shared_ptr<gd::Platform> associatedPlatform = gd::PlatformManager::GetInstance()->GetPlatform(dialog.GetChosenTemplatePlatform());
        if ( associatedPlatform != boost::shared_ptr<gd::Platform>() )
        {
            boost::shared_ptr<gd::Project> newProject(new gd::Project);
            newProject->AddPlatform(associatedPlatform);

            //Be sure that the directory of the target exists
            wxString targetDirectory = wxFileName::FileName(dialog.GetChosenFilename()).GetPath();
            if ( !wxDirExists(targetDirectory) ) gd::RecursiveMkDir::MkDir(targetDirectory);

            if ( !dialog.GetChosenTemplateFile().empty() )
            {
                newProject->SetProjectFile(dialog.GetChosenTemplateFile());
                newProject->LoadFromFile(newProject->GetProjectFile());
                gd::ProjectResourcesCopier::CopyAllResourcesTo(*newProject, ToString(targetDirectory), false);
            }
            else
                newProject->InsertNewLayout(gd::ToString(_("New scene")), 0);

            newProject->SetProjectFile(dialog.GetChosenFilename());
            newProject->SaveToFile(newProject->GetProjectFile());

            games.push_back(newProject);
            SetCurrentGame(games.size()-1);
            if ( startPage ) startPage->Refresh();

            if ( newProject->GetLayoutCount() > 0 ) projectManager->EditLayout(*newProject, newProject->GetLayout(0));
        }
        else wxLogError(_("Unable to find the platform associated with the template.\n\nPlease report this error to Game Develop developer."));
    }
    else if ( dialog.UserWantToBrowseExamples() )
    {
        wxCommandEvent uselessEvent;
        OnOpenExampleSelected(uselessEvent);
    }
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

    wxFileDialog openFileDialog( this, _( "Choose the project to open" ), "", "", "\"Game Develop\" Project(*.gdg)|*.gdg|\"Game Develop\" Project Autosave (*.gdg.autosave)|*.gdg.autosave" );

    if (openFileDialog.ShowModal() != wxID_CANCEL && !openFileDialog.GetPath().empty() )
        Open( ToString(openFileDialog.GetPath()) );
}

/**
 * Open an example file
 */
void MainFrame::OnOpenExampleSelected(wxCommandEvent& event)
{
    sf::Lock lock(CodeCompiler::openSaveDialogMutex);

    #if defined(WINDOWS)
    wxString examplesDir = wxGetCwd()+"\\Examples";
    std::cout << examplesDir;
    #else
    wxString examplesDir = wxGetCwd()+"/Examples/";
    #endif

    wxFileDialog open( NULL, _( "Open an example" ), examplesDir, "", "\"Game Develop\" Project (*.gdg)|*.gdg" );

    if ( open.ShowModal() != wxID_CANCEL && !open.GetPath().empty() )
        Open(ToString(open.GetPath()));
}
/**
 * Adapter for the ribbon
 */
void MainFrame::OnRibbonOpenClicked(wxRibbonButtonBarEvent& evt)
{
    wxCommandEvent uselessEvent;
    OnMenuOpenSelected(uselessEvent);
}
void MainFrame::OnRibbonOpenDropDownClicked(wxRibbonButtonBarEvent& evt)
{
    evt.PopupMenu(&openContextMenu);
}

void MainFrame::SetLastUsedFile(wxString file)
{
    m_recentlist.SetLastUsed( file );
    for ( unsigned int i = 0;i < 9;i++ )
        wxConfigBase::Get()->Write( wxString::Format( _T( "/Recent/%d" ), i ), m_recentlist.GetEntry( i ) );
}

/**
 * Open a file
 */
void MainFrame::Open( string file )
{
    sf::Lock lock(CodeCompiler::openSaveDialogMutex);

    boost::shared_ptr<gd::Project> newProject(new gd::Project);
    if ( newProject->LoadFromFile(file) )
    {
        //Ensure working directory is set to the IDE one.
        wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());

        games.push_back(newProject);

        //Sauvegarde fichiers récents
        SetLastUsedFile( file );

        //Mise à jour des éditeurs
        SetCurrentGame(games.size()-1);
        if ( startPage ) startPage->Refresh();

        string unknownExtensions = "";
        for (unsigned int i = 0;i<newProject->GetUsedPlatformExtensions().size();++i)
        {
            bool extensionFound = false;

            for(unsigned int p = 0;p<newProject->GetUsedPlatforms().size();++p)
            {
                gd::Platform & platform = *newProject->GetUsedPlatforms()[p];
                std::vector < boost::shared_ptr<gd::PlatformExtension> > allExtensions = platform.GetAllPlatformExtensions();
                for (unsigned int e = 0;e<allExtensions.size();++e)
                {
                    if ( allExtensions[e]->GetName() == newProject->GetUsedPlatformExtensions()[i])
                    {
                        extensionFound = true;
                        break;
                    }
                }
                if ( extensionFound ) break;
            }

            if ( !extensionFound )
                unknownExtensions += newProject->GetUsedPlatformExtensions()[i]+"\n";
        }

        if (unknownExtensions != "")
        {
            wxString errorMsg = _("One or ore extensions are used by the project but are not installed for the platform used by the project :\n")
                                + unknownExtensions
                                + _("\nSome objects, actions, conditions or expressions can be unavailable or not working.");
            wxLogWarning(errorMsg);
        }
    }
    //Ensure working directory is set to the IDE one.
    wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());
}

void MainFrame::OnMenuSaveSelected( wxCommandEvent& event )
{
    if ( !CurrentGameIsValid() ) return;

    if ( GetCurrentGame()->GetProjectFile().empty() )
        SaveAs();
    else
    {
        if ( !GetCurrentGame()->SaveToFile(GetCurrentGame()->GetProjectFile()) )
            wxLogError( "L'enregistrement a échoué." );
        else
            wxLogStatus(_("Save ended."));

        SetLastUsedFile( GetCurrentGame()->GetProjectFile() );

        return;
    }
}
/**
 * Adapter for the ribbon
 */
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
void MainFrame::OnRibbonSaveAllClicked(wxRibbonButtonBarEvent& evt)
{
    for (unsigned int i = 0;i<games.size();++i)
    {
        if ( games[i]->GetProjectFile().empty() )
        {
            sf::Lock lock(CodeCompiler::openSaveDialogMutex);

            wxFileDialog FileDialog( this, _( "Choose where to save the project" ), "", "", "\"Game Develop\" Project (*.gdg)|*.gdg", wxFD_SAVE );
            FileDialog.ShowModal();

            std::string path = ToString(FileDialog.GetPath());

            #if defined(LINUX) //Extension seems not be added with wxGTK?
            if ( FileDialog.GetFilterIndex() == 0 && !path.empty() )
                path += ".gdg";
            #endif

            //A t on  un fichier à enregistrer ?
            if ( !path.empty() )
            {
                //oui, donc on l'enregistre
                games[i]->SetProjectFile(path);

                if ( !games[i]->SaveToFile(games[i]->GetProjectFile()) ) {wxLogError( "L'enregistrement a échoué." );}
                SetLastUsedFile( games[i]->GetProjectFile() );

                if ( games[i] == GetCurrentGame() )
                    SetCurrentGame(i);
            }
        }
        else
        {
            if ( !games[i]->SaveToFile(games[i]->GetProjectFile()) ) {wxLogError( "L'enregistrement a échoué." );}
        }
    }

    wxLogStatus(_("Saves ended."));
}
void MainFrame::OnMenuSaveAllSelected(wxCommandEvent& event)
{
    wxRibbonButtonBarEvent uselessEvent;
    OnRibbonSaveAllClicked(uselessEvent);
}

void MainFrame::OnMenuSaveAsSelected( wxCommandEvent& event )
{
    SaveAs();
}

void MainFrame::SaveAs()
{
    sf::Lock lock(CodeCompiler::openSaveDialogMutex);

    if ( !CurrentGameIsValid() ) return;

    //Affichage de la boite de dialogue
    wxFileDialog fileDialog( this, _( "Choose where save the project" ), "", "", "\"Game Develop\" Project (*.gdg)|*.gdg", wxFD_SAVE );
    fileDialog.ShowModal();

    std::string file = ToString(fileDialog.GetPath());
    #if defined(LINUX) //Extension seems not be added with wxGTK?
    if ( fileDialog.GetFilterIndex() == 0 && !file.empty() )
        file += ".gdg";
    #endif

    //A t on  un fichier à enregistrer ?
    if ( !file.empty() )
    {
        wxString oldPath = !GetCurrentGame()->GetProjectFile().empty() ? wxFileName::FileName(GetCurrentGame()->GetProjectFile()).GetPath() : "";

        //Warn the user that resources should maybe be also moved.
        bool avertOnSaveCheck;
        wxConfigBase::Get()->Read("/Save/AvertOnSaveAs", &avertOnSaveCheck, true);
        wxString newPath = wxFileName::FileName(file).GetPath();
        if ( avertOnSaveCheck && newPath != oldPath && oldPath != "" )
        {
            wxRichMessageDialog dlg(this, _("Project has been saved in a new folder.\nDo you want to also copy its resources into this new folder?"), _("Saving in a new directory"), wxYES_NO|wxICON_INFORMATION );
            dlg.ShowCheckBox(_("Do not show again"));
            //dlg.ShowDetailedText(_("Since the last versions of Game Develop, resources filenames are relative\nto the project folder, allowing to copy or move a project simply by moving the directory\nof the project, provided that resources are also in this directory."));

            if ( dlg.ShowModal() == wxID_YES )
            {
                wxProgressDialog progressDialog(_("Save progress"), _("Exporting resources..."));
                gd::ProjectResourcesCopier::CopyAllResourcesTo(*GetCurrentGame(), ToString(newPath), true, &progressDialog);
            }

            if ( dlg.IsCheckBoxChecked() )
                wxConfigBase::Get()->Write("/Save/AvertOnSaveAs", "false");
        }

        GetCurrentGame()->SetProjectFile(file);

        if ( !GetCurrentGame()->SaveToFile(GetCurrentGame()->GetProjectFile()) )
        {
            wxLogError( _("The project could not be saved properly!") );
        }

        SetLastUsedFile( GetCurrentGame()->GetProjectFile() );
        SetCurrentGame(projectCurrentlyEdited, false);

        return;
    }
}

void MainFrame::OnMenuCompilationSelected( wxCommandEvent& event )
{
    if ( !CurrentGameIsValid() ) return;

    Compilation Dialog( this, * dynamic_cast<Game*>(GetCurrentGame().get()) ); //TODO : Abstract
    Dialog.ShowModal();
}

void MainFrame::OnRecentClicked( wxCommandEvent& event )
{
    wxString last;

    switch ( event.GetId() )
    {
    case wxID_FILE1:
        last = m_recentlist.GetEntry( 0 );
        break;
    case wxID_FILE2:
        last = m_recentlist.GetEntry( 1 );
        break;
    case wxID_FILE3:
        last = m_recentlist.GetEntry( 2 );
        break;
    case wxID_FILE4:
        last = m_recentlist.GetEntry( 3 );
        break;
    case wxID_FILE5:
        last = m_recentlist.GetEntry( 4 );
        break;
    case wxID_FILE6:
        last = m_recentlist.GetEntry( 5 );
        break;
    case wxID_FILE7:
        last = m_recentlist.GetEntry( 6 );
        break;
    case wxID_FILE8:
        last = m_recentlist.GetEntry( 7 );
        break;
    case wxID_FILE9:
        last = m_recentlist.GetEntry( 8 );
        break;

    default:
        break;
    }

    Open( ToString(last) );
}

/**
 * Open import file dialog
 */
void MainFrame::OnMenuFusionSelected(wxCommandEvent& event)
{
    if ( !CurrentGameIsValid() ) return;

    Fusion dialog(this, *GetCurrentGame());
    dialog.ShowModal();

    projectManager->Refresh();
    if ( startPage ) startPage->Refresh();
}

