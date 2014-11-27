#include "GroupEventDialog.h"
#include "GDCore/Events/Builtin/GroupEvent.h"
#include "GDCore/CommonTools.h"
#include <wx/colordlg.h>

GroupEventDialog::GroupEventDialog(wxWindow* parent, gd::GroupEvent & event_)
    : BaseGroupEventDialog(parent),
    event(event_)
{
	groupNameEdit->SetValue(event.GetName());
	backColorBt->SetBackgroundColour(wxColour(event.getBackgroundColorR(), event.getBackgroundColorG(), event.getBackgroundColorB() ));
	backColorBt->SetForegroundColour(wxColour(255-event.getBackgroundColorR(), 255-event.getBackgroundColorG(), 255-event.getBackgroundColorB() ));
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
