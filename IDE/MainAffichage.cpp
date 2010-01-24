#ifdef DEBUG
#define _MEMORY_TRACKER
#include "debugMem.h" //suivi mémoire
#endif

#include "Game_Develop_EditorMain.h"
#include "wx/aui/aui.h"

////////////////////////////////////////////////////////////
/// Afficher l'éditeur de la banque d'image
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuImagesEditorSelected( wxCommandEvent& event )
{
    m_mgr.GetPane( EditorImagesPnl ).Show();
    m_mgr.Update();
}
/**
 * Adapter for the ribbon
 */
void Game_Develop_EditorFrame::OnRibbonImagesEditorClicked(wxRibbonButtonBarEvent& evt)
{
    wxCommandEvent uselessEvent;
    OnMenuImagesEditorSelected(uselessEvent);
}

////////////////////////////////////////////////////////////
/// Affichage toolbar
///
/// Afficher la toolbar commune
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnShowTBSelected( wxCommandEvent& event )
{
    m_mgr.GetPane( ToolBarDefaut ).ToolbarPane().Show();
    m_mgr.Update();
}

////////////////////////////////////////////////////////////
/// Affichage toolbar
///
/// Afficher la toolbar des éditeurs
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnShowTBEditorsSelected( wxCommandEvent& event )
{
    m_mgr.GetPane( ToolBarEditors ).ToolbarPane().Show();
    m_mgr.Update();
}

////////////////////////////////////////////////////////////
/// Affichage toolbar
///
/// Afficher la toolbar Compil Games
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnShowToolBarCGSelected(wxCommandEvent& event)
{
    m_mgr.GetPane( ToolBarCG ).ToolbarPane().Show();
    m_mgr.Update();
}

////////////////////////////////////////////////////////////
/// Affichage toolbar
///
/// Afficher la toolbar Aide
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnShowToolBarAideSelected(wxCommandEvent& event)
{
    m_mgr.GetPane( ToolBarAide ).ToolbarPane().Show();
    m_mgr.Update();
}
