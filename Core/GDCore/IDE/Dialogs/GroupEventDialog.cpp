/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GroupEventDialog.h"
#include "GDCore/Events/Builtin/GroupEvent.h"
#include "GDCore/CommonTools.h"
#include <wx/colordlg.h>

GroupEventDialog::GroupEventDialog(wxWindow* parent, gd::GroupEvent & event_)
    : BaseGroupEventDialog(parent),
    event(event_)
{
	groupNameEdit->SetValue(event.GetName());
	backColorBt->SetBackgroundColour(wxColour(event.GetBackgroundColorR(), event.GetBackgroundColorG(), event.GetBackgroundColorB() ));
	backColorBt->SetForegroundColour(wxColour(255-event.GetBackgroundColorR(), 255-event.GetBackgroundColorG(), 255-event.GetBackgroundColorB() ));
    hideCheck->SetValue(event.IsFolded());
}

GroupEventDialog::~GroupEventDialog()
{
}

void GroupEventDialog::onCancelBtClick(wxCommandEvent& )
{
	EndModal(0);
}
void GroupEventDialog::onOkBtClick(wxCommandEvent& )
{
	event.SetName(groupNameEdit->GetValue());
    event.SetBackgroundColor(backColorBt->GetBackgroundColour().Red(),
    	backColorBt->GetBackgroundColour().Green(), backColorBt->GetBackgroundColour().Blue());
    event.SetFolded(hideCheck->GetValue());
	EndModal(1);
}

void GroupEventDialog::onChooseBackgroundBtClick(wxCommandEvent& )
{
    wxColourData cData;
    cData.SetColour(backColorBt->GetBackgroundColour());
    wxColourDialog dialog(this, &cData);
    if (dialog.ShowModal() == wxID_OK)
    {
        cData = dialog.GetColourData();
        backColorBt->SetBackgroundColour(cData.GetColour());
        backColorBt->Refresh();
    }

}
#endif
