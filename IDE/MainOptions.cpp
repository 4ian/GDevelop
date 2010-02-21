#ifdef DEBUG
#define _MEMORY_TRACKER
#include "debugMem.h" //suivi mémoire
#endif

#include "MemTrace.h"
extern MemTrace MemTracer;

#include "Game_Develop_EditorMain.h"
#include "Preferences.h"
#include "wx/aui/aui.h"

////////////////////////////////////////////////////////////
/// Accéder aux préférences
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuPrefSelected( wxCommandEvent& event )
{
    Preferences Dialog( this );
    Dialog.ShowModal();

    LoadSkin(&m_mgr);
    LoadSkin(m_ribbon);

    UpdateNotebook();
    m_ribbon->Realize();
    m_mgr.Update();
}

////////////////////////////////////////////////////////////
/// Sauver l'espace de travail actuel
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuSaveWSSelected( wxCommandEvent& event )
{
}

////////////////////////////////////////////////////////////
/// Espaces de travail pré-conçu
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnWSDefautSelected(wxCommandEvent& event)
{

}

void Game_Develop_EditorFrame::OnWSDetacheSelected(wxCommandEvent& event)
{
}

void Game_Develop_EditorFrame::OnWSSimpleSelected1(wxCommandEvent& event)
{
}

void Game_Develop_EditorFrame::OnWSChronoSelected(wxCommandEvent& event)
{
}
