/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include <wx/progdlg.h>
#include <boost/shared_ptr.hpp>
#include <SFML/System.hpp>
#include "GDL/OpenSaveGame.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Game.h"
#include "GDL/IDE/CompilerMessagesParser.h"
#include "GDL/IDE/CodeCompiler.h"
#include "GDL/CommonTools.h"
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

/**
 * Request close
 */
void Game_Develop_EditorFrame::OnQuit( wxCommandEvent& event )
{
    Close();
}

void Game_Develop_EditorFrame::OnCloseCurrentProjectSelected(wxCommandEvent& event)
{
    wxRibbonButtonBarEvent uselessEvent;
    if ( projectManager ) projectManager->OnRibbonCloseSelected(uselessEvent);
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

/**
 * Open a file
 */
void Game_Develop_EditorFrame::OnMenuOpenSelected( wxCommandEvent& event )
{
    sf::Lock lock(CodeCompiler::openSaveDialogMutex);

    wxFileDialog openFileDialog( this, _( "Choisissez le jeu à ouvrir" ), "", "", "*\"Game Develop\" Game (*.gdg;*.jgd)|*.jgd;*.gdg" );

    if (openFileDialog.ShowModal() != wxID_CANCEL && !openFileDialog.GetPath().empty() )
        Open( ToString(openFileDialog.GetPath()) );
}

/**
 * Open an example file
 */
void Game_Develop_EditorFrame::OnOpenExampleSelected(wxCommandEvent& event)
{
    sf::Lock lock(CodeCompiler::openSaveDialogMutex);

    wxFileDialog open( NULL, _( "Ouvrir un exemple" ), wxGetCwd()+"/Examples/", "", "\"Game Develop\" Game (*.gdg;*.jgd)|*.jgd;*.gdg" );

    if ( open.ShowModal() != wxID_CANCEL && !open.GetPath().empty() )
        Open(ToString(open.GetPath()));
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
    sf::Lock lock(CodeCompiler::openSaveDialogMutex);

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
        ExtensionsManager * extensionsManager = ExtensionsManager::GetInstance();
        for (unsigned int i = 0;i<newGame->GetUsedPlatformExtensions().size();++i)
        {
            if ( extensionsManager->GetExtension(newGame->GetUsedPlatformExtensions()[i]) == boost::shared_ptr<ExtensionBase> () )
            {
                unknownExtensions += newGame->GetUsedPlatformExtensions()[i]+"\n";
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
            sf::Lock lock(CodeCompiler::openSaveDialogMutex);

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
void Game_Develop_EditorFrame::OnMenuSaveAllSelected(wxCommandEvent& event)
{
    wxRibbonButtonBarEvent uselessEvent;
    OnRibbonSaveAllClicked(uselessEvent);
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
    sf::Lock lock(CodeCompiler::openSaveDialogMutex);

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
void Game_Develop_EditorFrame::OnMenuFusionSelected(wxCommandEvent& event)
{
    if ( !CurrentGameIsValid() ) return;

    Fusion dialog(this, *GetCurrentGame());
    dialog.ShowModal();

    projectManager->Refresh();
    if ( startPage ) startPage->Refresh();
}
