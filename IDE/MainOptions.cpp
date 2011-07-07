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

    PrepareAutosave();

    UpdateNotebook();
    m_ribbon->Realize();
    m_mgr.Update();
}
