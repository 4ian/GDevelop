#include <boost/shared_ptr.hpp>
#include "GDL/OpenSaveGame.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Game.h"

#include "Game_Develop_EditorMain.h"
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
    wxString GD = _( "Game Develop - Nouveau jeu" );
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
    wxFileDialog FileDialog( this, _( "Choisissez le jeu à ouvrir" ), "", "", "*.jgd" );
    FileDialog.ShowModal();

    //A t on  un fichier à ouvrir ?
    if ( FileDialog.GetPath() != "" )
    {
        Open( static_cast<string>( FileDialog.GetPath() ) );

    }

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
        gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();
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

    if ( GetCurrentGame()->gameFile == "" )
    {
        SaveAs();
    }
    else
    {
        OpenSaveGame saveGame( *GetCurrentGame() );
        if ( !saveGame.SaveToFile(GetCurrentGame()->gameFile) )
        {
            wxLogError( "L'enregistrement a échoué." );
        }

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
    wxFileDialog FileDialog( this, _( "Choisissez le nom et le répertoire du jeu à enregistrer" ), "", "", "*.jgd", wxFD_SAVE );
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
    Compilation Dialog( this, GetCurrentGame().get() );
    Dialog.ShowModal();
}

////////////////////////////////////////////////////////////
/// Ouverture de la fenêtre d'enregistrement en version portable
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuPortableSelected( wxCommandEvent& event )
{
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
    Fusion dialog(this, *GetCurrentGame());
    dialog.ShowModal();

    projectManager->Refresh();
    if ( startPage ) startPage->Refresh();
}
