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
    hideCheck->SetValue(event.folded);
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
	event.SetName(gd::ToString(groupNameEdit->GetValue()));
    event.SetBackgroundColor(backColorBt->GetBackgroundColour().Red(),
    	backColorBt->GetBackgroundColour().Green(), backColorBt->GetBackgroundColour().Blue());
    event.folded = hideCheck->GetValue();
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
