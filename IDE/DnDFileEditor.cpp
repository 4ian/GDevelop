#include "DnDFileEditor.h"
#include "Game_Develop_EditorMain.h"

bool DnDFileEditor::OnDropFiles(wxCoord x, wxCoord y,
                             const wxArrayString& filenames)
{

    size_t nFiles = filenames.GetCount();
    if ( nFiles < 1 ) return false;

    mainEditor.Open(filenames[0].mb_str());

    return true;
}
