/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "MainFrameWrapper.h"
#include <wx/aui/aui.h>

void gd::MainFrameWrapper::DisableControlsForScenePreviewing()
{
    unsigned int notebookCurrentPage =  editorsNotebook ? editorsNotebook->GetSelection() : 0;
    for (std::size_t i = 0;i<disableOnPreview.size();++i) disableOnPreview[i]->Disable();
    if ( editorsNotebook ) editorsNotebook->SetSelection(notebookCurrentPage);
};

/**
 * Remove a control to the list of controls to be disabled on preview
 */
void gd::MainFrameWrapper::RemoveControlToBeDisabledOnPreview(wxWindow * control)
{
    for (std::size_t i = 0;i<disableOnPreview.size();++i)
    {
        if ( disableOnPreview[i] == control )
        {
            disableOnPreview.erase(disableOnPreview.begin()+i);
            return;
        }
    }
}


#endif
