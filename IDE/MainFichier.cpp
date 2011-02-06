/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <wx/progdlg.h>
#include <boost/shared_ptr.hpp>
#include "GDL/OpenSaveGame.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Game.h"
#include "GDL/DynamicExtensionsManager.h"

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
    //Affichage de la boite de dialogue
    wxFileDialog FileDialog( this, _( "Choisissez le jeu à ouvrir" ), "", "", "*\"Game Develop\" Game (*.gdg;*.jgd)|*.jgd;*.gdg" );
    FileDialog.ShowModal();

    //A t on  un fichier à ouvrir ?
    if ( FileDialog.GetPath() != "" )
    {
        Open( static_cast<string>( FileDialog.GetPath() ) );

    }

}
void Game_Develop_EditorFrame::OnOpenExampleSelected(wxCommandEvent& event)
{
    wxFileDialog open( NULL, _( "Ouvrir un exemple" ), wxGetCwd()+"/Exemples/", "", "\"Game Develop\" Game (*.gdg;*.jgd)|*.jgd;*.gdg" );
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
        GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::getInstance();
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
            wxFileDialog FileDialog( this, _( "Choisissez où enregistrer le projet" ), "", "", "\"Game Develop\" Game (*.gdg)|*.gdg", wxFD_SAVE );
            FileDialog.ShowModal();

            //A t on  un fichier à enregistrer ?
            if ( FileDialog.GetPath() != "" )
            {
                //oui, donc on l'enregistre
                games[i]->gameFile = FileDialog.GetPath();
                OpenSaveGame saveGame( *games[i] );

                if ( !saveGame.SaveToFile(games[i]->gameFile) ) {wxLogError( "L'enregistrement a échoué." );}

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
    if ( !CurrentGameIsValid() ) return;

    //Affichage de la boite de dialogue
    wxFileDialog FileDialog( this, _( "Choisissez où enregistrer le projet" ), "", "", "\"Game Develop\" Game (*.gdg)|*.gdg", wxFD_SAVE );
    FileDialog.ShowModal();

    //A t on  un fichier à enregistrer ?
    if ( FileDialog.GetPath() != "" )
    {
        //oui, donc on l'enregistre
        GetCurrentGame()->gameFile = FileDialog.GetPath();
        OpenSaveGame saveGame( *GetCurrentGame() );

        if ( !saveGame.SaveToFile(GetCurrentGame()->gameFile) )
        {
            wxLogError( "L'enregistrement a échoué" );
        }

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
    if ( GetCurrentGame()->useExternalSourceFiles && GetBuildToolsPanel()->buildProgressPnl->BuildNeeded() )
    {
        GDpriv::DynamicExtensionsManager::getInstance()->UnloadAllDynamicExtensions();
        GetBuildToolsPanel()->notebook->SetSelection(0);

        //Be sure another build process is not running, and then launch build.
        if ( GetBuildToolsPanel()->buildProgressPnl->IsBuilding() || !GetBuildToolsPanel()->buildProgressPnl->LaunchGameSourceFilesBuild(*GetCurrentGame()) )
        {
            wxLogWarning(_("Game Develop est entrain de compiler les sources C++ et ne pourra compiler le jeu qu'une fois ce processus terminé."));
            return;
        }

        //Wait build to finish.
        wxProgressDialog progress(_("Compilation"),_("Veuillez patienter pendant la compilation des sources C++..."),100, NULL, wxPD_CAN_ABORT | wxPD_AUTO_HIDE | wxPD_APP_MODAL | wxPD_ELAPSED_TIME);
        while (GetBuildToolsPanel()->buildProgressPnl->IsBuilding() )
        {
            if ( !progress.Update(GetBuildToolsPanel()->buildProgressPnl->progressGauge->GetValue()) ) //Enable the user to stop compilation
            {
                GetBuildToolsPanel()->buildProgressPnl->AbortBuild();
                return;
            }
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
