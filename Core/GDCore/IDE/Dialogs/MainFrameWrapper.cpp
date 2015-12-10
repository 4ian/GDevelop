/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "MainFrameWrapper.h"
#include <wx/ribbon/bar.h>
#include <wx/aui/aui.h>

void gd::MainFrameWrapper::SetRibbonPage(wxString pageName)
{
    if (!ribbon) return;

    for (size_t pageIndex = 0;pageIndex < ribbon->GetPageCount();++pageIndex)
    {
        wxRibbonPage * page = ribbon->GetPage(pageIndex);
        if (!page) continue;

        if (page->GetLabel() == pageName)
        {
            ribbon->SetActivePage(pageIndex);
            return;
        }
    }
}

void gd::MainFrameWrapper::DisableControlsForScenePreviewing()
{
    unsigned int notebookCurrentPage =  editorsNotebook ? editorsNotebook->GetSelection() : 0;
    for (std::size_t i = 0;i<disableOnPreview.size();++i) disableOnPreview[i]->Disable();
    if ( editorsNotebook ) editorsNotebook->SetSelection(notebookCurrentPage);
}

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
