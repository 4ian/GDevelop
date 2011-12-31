/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include <wx/progdlg.h>
#include <boost/shared_ptr.hpp>
#include <SFML/System.hpp>
#include "GDL/EventsCodeCompiler.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Game.h"
#include "GDL/DynamicExtensionsManager.h"
#include "GDL/CompilerMessagesParser.h"
#include "BuildMessagesPnl.h"

#include "Game_Develop_EditorMain.h"
#include "BuildToolsPnl.h"
#include "BuildProgressPnl.h"
#include "Compilation.h"
#include "Portable.h"
#include "Fusion.h"
#include "MessagePlus.h"
#include "ProjectManager.h"
#include "StartHerePage.h"

////////////////////////////////////////////////////////////
/// Fermeture avec le menu quitter
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnQuit( wxCommandEvent& event )
{
    Close();
}

////////////////////////////////////////////////////////////
/// Créer un nouveau jeu vierge
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuNewSelected( wxCommandEvent& event )
{
    games.push_back(boost::shared_ptr<RuntimeGame>(new RuntimeGame));
    wxString GD = "Game Develop - "+_( "Nouveau jeu" );
    SetTitle( GD );

    gameCurrentlyEdited = games.size()-1;

    //Mise à jour des éditeurs
    projectManager->Refresh();
    if ( startPage ) startPage->Refresh();
}

/**
 * Adapter for the ribbon
 */
void Game_Develop_EditorFrame::OnRibbonNewClicked(wxRibbonButtonBarEvent& evt)
{
    wxCommandEvent uselessEvent;
    OnMenuNewSelected(uselessEvent);
}

////////////////////////////////////////////////////////////
/// Ouvrir un jeu
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuOpenSelected( wxCommandEvent& event )
{
    sf::Lock lock(EventsCodeCompiler::openSaveDialogMutex);

    //Affichage de la boite de dialogue
    wxFileDialog openFileDialog( this, _( "Choisissez le jeu à ouvrir" ), "", "", "*\"Game Develop\" Game (*.gdg;*.jgd)|*.jgd;*.gdg" );

    //A t on  un fichier à ouvrir ?
    if (openFileDialog.ShowModal() == wxID_CANCEL)
        return;

    Open( string(openFileDialog.GetPath().mb_str()) );
}
void Game_Develop_EditorFrame::OnOpenExampleSelected(wxCommandEvent& event)
{
    sf::Lock lock(EventsCodeCompiler::openSaveDialogMutex);

    wxFileDialog open( NULL, _( "Ouvrir un exemple" ), wxGetCwd()+"/Examples/", "", "\"Game Develop\" Game (*.gdg;*.jgd)|*.jgd;*.gdg" );
    open.ShowModal();

    if ( !open.GetPath().empty() ) Open(string(open.GetPath().mb_str()));
}
/**
 * Adapter for the ribbon
 */
void Game_Develop_EditorFrame::OnRibbonOpenClicked(wxRibbonButtonBarEvent& evt)
{
    wxCommandEvent uselessEvent;
    OnMenuOpenSelected(uselessEvent);
}
void Game_Develop_EditorFrame::OnRibbonOpenDropDownClicked(wxRibbonButtonBarEvent& evt)
{
    evt.PopupMenu(&openContextMenu);
}


////////////////////////////////////////////////////////////
/// Ouverture du fichier, puis ajout à la RecentList et rafraichissement des éditeurs
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::Open( string file )
{
    sf::Lock lock(EventsCodeCompiler::openSaveDialogMutex);

    boost::shared_ptr<RuntimeGame> newGame(new RuntimeGame);

    OpenSaveGame openGame( *newGame );
    if ( openGame.OpenFromFile(file) )
    {
        games.push_back(newGame);

        //Sauvegarde fichiers récents
        m_recentlist.SetLastUsed( file );
        for ( int i = 0;i < 9;i++ )
        {
            wxConfigBase *pConfig = wxConfigBase::Get();
            pConfig->Write( wxString::Format( _T( "/Recent/%d" ), i ), m_recentlist.GetEntry( i ) );
        }

        //Mise à jour des éditeurs
        SetCurrentGame(games.size()-1);
        projectManager->Refresh();
        if ( startPage ) startPage->Refresh();

        string unknownExtensions = "";
        GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();
        for (unsigned int i = 0;i<newGame->extensionsUsed.size();++i)
        {
            if ( extensionsManager->GetExtension(newGame->extensionsUsed[i]) == boost::shared_ptr<ExtensionBase> () )
            {
                unknownExtensions += newGame->extensionsUsed[i]+"\n";
            }
        }

        if (unknownExtensions != "")
        {
            wxString errorMsg = _("Une ou plusieurs extensions sont utilisées par le jeu mais ne sont pas installées :\n")
                                + unknownExtensions
                                + _("\nCertains objets, actions, conditions ou expressions peuvent manquer ou être inconnues.");
            wxLogWarning(errorMsg);
        }
    }
}

////////////////////////////////////////////////////////////
/// Enregistrement du jeu
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuSaveSelected( wxCommandEvent& event )
{
    if ( !CurrentGameIsValid() ) return;

    if ( GetCurrentGame()->gameFile.empty() )
        SaveAs();
    else
    {
        OpenSaveGame saveGame( *GetCurrentGame() );
        if ( !saveGame.SaveToFile(GetCurrentGame()->gameFile) )
            wxLogError( "L'enregistrement a échoué." );
        else
            wxLogStatus(_("Enregistrement du fichier terminé."));

        m_recentlist.SetLastUsed( GetCurrentGame()->gameFile );

        return;
    }
}
/**
 * Adapter for the ribbon
 */
void Game_Develop_EditorFrame::OnRibbonSaveClicked(wxRibbonButtonBarEvent& evt)
{
    wxCommandEvent uselessEvent;
    OnMenuSaveSelected(uselessEvent);
}
void Game_Develop_EditorFrame::OnRibbonSaveDropDownClicked(wxRibbonButtonBarEvent& evt)
{
    evt.PopupMenu(&saveContextMenu);
}

/**
 * Save all
 */
void Game_Develop_EditorFrame::OnRibbonSaveAllClicked(wxRibbonButtonBarEvent& evt)
{
    for (unsigned int i = 0;i<games.size();++i)
    {
        if ( games[i]->gameFile.empty() )
        {
            sf::Lock lock(EventsCodeCompiler::openSaveDialogMutex);

            wxFileDialog FileDialog( this, _( "Choisissez où enregistrer le projet" ), "", "", "\"Game Develop\" Game (*.gdg)|*.gdg", wxFD_SAVE );
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
                games[i]->gameFile = path;
                OpenSaveGame saveGame( *games[i] );

                if ( !saveGame.SaveToFile(games[i]->gameFile) ) {wxLogError( "L'enregistrement a échoué." );}
                m_recentlist.SetLastUsed( games[i]->gameFile );

                if ( games[i] == GetCurrentGame() )
                {
                    wxString GD = "Game Develop";
                    wxString Fichier = GetCurrentGame()->gameFile;
                    SetTitle( GD + " - " + Fichier );
                }
            }
        }
        else
        {
            OpenSaveGame saveGame( *games[i] );
            if ( !saveGame.SaveToFile(games[i]->gameFile) ) {wxLogError( "L'enregistrement a échoué." );}
        }
    }

    wxLogStatus(_("Enregistrements des fichiers terminés."));
}

////////////////////////////////////////////////////////////
/// Enregistrer sous
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuSaveAsSelected( wxCommandEvent& event )
{
    SaveAs();
}

////////////////////////////////////////////////////////////
/// La véritable fonction Enregistrer sous
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::SaveAs()
{
    sf::Lock lock(EventsCodeCompiler::openSaveDialogMutex);

    if ( !CurrentGameIsValid() ) return;

    //Affichage de la boite de dialogue
    wxFileDialog FileDialog( this, _( "Choisissez où enregistrer le projet" ), "", "", "\"Game Develop\" Game (*.gdg)|*.gdg|All files|*.*", wxFD_SAVE );
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
        GetCurrentGame()->gameFile = path;
        OpenSaveGame saveGame( *GetCurrentGame() );

        if ( !saveGame.SaveToFile(GetCurrentGame()->gameFile) )
        {
            wxLogError( "L'enregistrement a échoué" );
        }

        m_recentlist.SetLastUsed( GetCurrentGame()->gameFile );

        wxString GD = "Game Develop";
        wxString Fichier = GetCurrentGame()->gameFile;
        SetTitle( GD + " - " + Fichier );

        return;
    }
}


////////////////////////////////////////////////////////////
/// Ouverture de la fenêtre de compilation
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuCompilationSelected( wxCommandEvent& event )
{
    if ( !CurrentGameIsValid() ) return;

    //Compile now source if there are not up to date ( and if game use C++ features ).
    if ( GetCurrentGame()->useExternalSourceFiles )
    {
        if ( !GetBuildToolsPanel()->buildProgressPnl->ChangeGameWithoutBuilding(*GetCurrentGame()) )
        {
            wxLogWarning(_("Game Develop est entrain de compiler les sources C++ et ne pourra compiler le jeu qu'une fois ce processus terminé."));
            return;
        }

        if ( true )
        {
            GDpriv::SourceFileBuilder builder(GetBuildToolsPanel()->buildProgressPnl->progressGauge, GetBuildToolsPanel()->buildProgressPnl->statusTxt, true);
            builder.SetFiles(GetCurrentGame()->externalSourceFiles);
            builder.SetExtensionsUsed(GetCurrentGame()->extensionsUsed);

            GDpriv::DynamicExtensionsManager::GetInstance()->UnloadAllDynamicExtensions();
            GetBuildToolsPanel()->notebook->SetSelection(0);

            //Be sure another build process is not running, and then launch build.
            if ( GetBuildToolsPanel()->buildProgressPnl->IsBuilding() || !builder.LaunchSourceFilesBuild() )
            {
                wxLogWarning(_("Game Develop est entrain de compiler les sources C++ et ne pourra compiler le jeu qu'une fois ce processus terminé."));
                return;
            }

            //Wait build to finish.
            wxProgressDialog progress(_("Compilation"),_("Veuillez patienter pendant la compilation des sources C++..."),100, NULL, wxPD_CAN_ABORT | wxPD_AUTO_HIDE | wxPD_APP_MODAL | wxPD_ELAPSED_TIME);
            while ( builder.IsBuilding() )
            {
                if ( !progress.Update(GetBuildToolsPanel()->buildProgressPnl->progressGauge->GetValue()) ) //Enable the user to stop compilation
                {
                    builder.AbordBuild();
                    return;
                }
            }

            GDpriv::CompilerMessagesParser errorsParser;
            errorsParser.ParseOutput(builder.GetErrors());
            GetBuildToolsPanel()->buildMessagesPnl->RefreshWith(&*GetCurrentGame(), errorsParser.parsedErrors);

            //Build failed, stop here and show errors
            if ( !builder.LastBuildSuccessed() )
            {
                m_mgr.GetPane(GetBuildToolsPanel()).Show(true);
                GetBuildToolsPanel()->notebook->SetSelection(1);
                GetBuildToolsPanel()->buildMessagesPnl->OpenFileContainingFirstError();
                RequestUserAttention();
                return;
            }
        }
    }

    //Be sure that we are able to compile all scenes of game.
    std::vector<Scene*> sceneWithCompilationPrevented = EventsCodeCompiler::GetInstance()->GetSceneWithCompilationDisallowed();
    for (unsigned int i = 0;i<GetCurrentGame()->scenes.size();++i)
    {
        if ( find(sceneWithCompilationPrevented.begin(), sceneWithCompilationPrevented.end(), GetCurrentGame()->scenes[i].get()) != sceneWithCompilationPrevented.end() )
        {
            wxLogMessage(_("La scène ")+GetCurrentGame()->scenes[i]->title+_(" ne peut être compilée : Fermez l'aperçu de celle ci avant de continuer."));
            return;
        }
    }

    Compilation Dialog( this, *GetCurrentGame() );
    Dialog.ShowModal();
}

////////////////////////////////////////////////////////////
/// Ouverture de la fenêtre d'enregistrement en version portable
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuPortableSelected( wxCommandEvent& event )
{
    if ( !CurrentGameIsValid() ) return;

    Portable dialog( this, GetCurrentGame().get() );
    dialog.ShowModal();
}

////////////////////////////////////////////////////////////
/// Fichier récemment ouverts
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnRecentClicked( wxCommandEvent& event )
{
    wxString Last;

    switch ( event.GetId() )
    {
    case wxID_FILE1:
        Last = m_recentlist.GetEntry( 0 );
        break;
    case wxID_FILE2:
        Last = m_recentlist.GetEntry( 1 );
        break;
    case wxID_FILE3:
        Last = m_recentlist.GetEntry( 2 );
        break;
    case wxID_FILE4:
        Last = m_recentlist.GetEntry( 3 );
        break;
    case wxID_FILE5:
        Last = m_recentlist.GetEntry( 4 );
        break;
    case wxID_FILE6:
        Last = m_recentlist.GetEntry( 5 );
        break;
    case wxID_FILE7:
        Last = m_recentlist.GetEntry( 6 );
        break;
    case wxID_FILE8:
        Last = m_recentlist.GetEntry( 7 );
        break;
    case wxID_FILE9:
        Last = m_recentlist.GetEntry( 8 );
        break;

    default:
        break;
    }

    Open( static_cast<string>( Last ) );

}


////////////////////////////////////////////////////////////
/// Ouvrir la fenêtre de fusion de jeux
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuFusionSelected(wxCommandEvent& event)
{
    if ( !CurrentGameIsValid() ) return;

    Fusion dialog(this, *GetCurrentGame());
    dialog.ShowModal();

    projectManager->Refresh();
    if ( startPage ) startPage->Refresh();
}
