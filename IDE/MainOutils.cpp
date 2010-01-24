#ifdef DEBUG
#define _MEMORY_TRACKER
#include "debugMem.h" //suivi mémoire
#endif
#include "MemTrace.h"
extern MemTrace MemTracer;

#include "Game_Develop_EditorMain.h"
#include "mp3ogg.h"
#include "ConvertJRC.h"
#include "ModeSimple.h"
#include "ImportImage.h"

////////////////////////////////////////////////////////////
/// Encoder fichier mp3 en ogg
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuItem23Selected(wxCommandEvent& event)
{
    mp3ogg dialog(this);
    dialog.ShowModal();
}

////////////////////////////////////////////////////////////
/// Convertir un jeu JRC 3.1.x
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuConvertirJRCSelected( wxCommandEvent& event )
{
    ConvertJRC dialog( this, &game );
    dialog.ShowModal();

    RefreshParaJeu();
    ReloadEditors();
    RefreshListScene();
}

////////////////////////////////////////////////////////////
/// Activer le mode simple de Game Develop
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuModeSimpleSelected(wxCommandEvent& event)
{
    ModeSimple dialog(this);
    dialog.ShowModal();
}

////////////////////////////////////////////////////////////
/// Décomposer un GIF en plusieurs images
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnDecomposeGIFSelected(wxCommandEvent& event)
{
    ImportImage dialog(this, 0);
    dialog.ShowModal();
}

////////////////////////////////////////////////////////////
/// Décomposer une feuille de sprite de personnage RPG Maker en plusieurs images
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnDecomposeRPGSelected(wxCommandEvent& event)
{
    ImportImage dialog(this, 1);
    dialog.ShowModal();
}

////////////////////////////////////////////////////////////
/// Décomposer une feuille de sprite générale en plusieurs images
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnDecomposeSSSelected(wxCommandEvent& event)
{
    ImportImage dialog(this, 2);
    dialog.ShowModal();
}

void Game_Develop_EditorFrame::OnRibbonDecomposerDropDownClicked(wxRibbonButtonBarEvent& evt)
{
    evt.PopupMenu(&decomposerContextMenu);
}
