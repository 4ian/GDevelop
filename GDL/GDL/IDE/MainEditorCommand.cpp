/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#include <wx/aui/aui.h>
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"

void gd::MainFrameWrapper::DisableControlsForScenePreviewing()
{
    unsigned int notebookCurrentPage =  editorsNotebook ? editorsNotebook->GetSelection() : 0;
    for (unsigned int i = 0;i<disableOnPreview.size();++i) disableOnPreview[i]->Disable();
    if ( editorsNotebook ) editorsNotebook->SetSelection(notebookCurrentPage);
};

#endif

