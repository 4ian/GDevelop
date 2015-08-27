/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include "ChooseBehaviorDialog.h"

//(*InternalHeaders(ChooseBehaviorDialog)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include "GDCore/Tools/Localization.h"
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <algorithm>
#include "GDCore/Tools/Log.h"

#include "GDCore/IDE/SkinHelper.h"
#include "GDCore/CommonTools.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/Events/BehaviorMetadata.h"
#include "GDCore/IDE/MetadataProvider.h"

namespace gd
{

//(*IdInit(ChooseBehaviorDialog)
const long ChooseBehaviorDialog::ID_STATICBITMAP3 = wxNewId();
const long ChooseBehaviorDialog::ID_STATICTEXT1 = wxNewId();
const long ChooseBehaviorDialog::ID_PANEL1 = wxNewId();
const long ChooseBehaviorDialog::ID_STATICLINE2 = wxNewId();
const long ChooseBehaviorDialog::ID_LISTBOX1 = wxNewId();
const long ChooseBehaviorDialog::ID_TEXTCTRL1 = wxNewId();
const long ChooseBehaviorDialog::ID_BUTTON1 = wxNewId();
const long ChooseBehaviorDialog::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChooseBehaviorDialog,wxDialog)
	//(*EventTable(ChooseBehaviorDialog)
	//*)
END_EVENT_TABLE()

ChooseBehaviorDialog::ChooseBehaviorDialog(wxWindow* parent, Project & project_, gd::Layout & layout_, gd::String parentObject_, gd::String behaviorTypeAllowed_) :
project(project_),
layout(layout_),
parentObject(parentObject_),
behaviorTypeAllowed(behaviorTypeAllowed_)
{
	//(*Initialize(ChooseBehaviorDialog)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Choose a behavior"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/behavior64.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Choose a behavior of the object."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->Fit(Panel1);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	behaviorsList = new wxListBox(this, ID_LISTBOX1, wxDefaultPosition, wxSize(255,128), 0, 0, 0, wxDefaultValidator, _T("ID_LISTBOX1"));
	FlexGridSizer1->Add(behaviorsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	searchCtrl = new wxSearchCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer1->Add(searchCtrl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	ChoisirBt = new wxButton(this, ID_BUTTON1, _("Choose"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(ChoisirBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_LISTBOX1,wxEVT_COMMAND_LISTBOX_DOUBLECLICKED,(wxObjectEventFunction)&ChooseBehaviorDialog::OnChoisirBtClick);
	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ChooseBehaviorDialog::OnsearchCtrlText);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseBehaviorDialog::OnChoisirBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseBehaviorDialog::OnCancelBtClick);
	//*)

	searchCtrl->SetFocus();

    RefreshList();
}

ChooseBehaviorDialog::~ChooseBehaviorDialog()
{
	//(*Destroy(ChooseBehaviorDialog)
	//*)
}

bool ChooseBehaviorDialog::DeduceBehavior()
{
	if (behaviorsList->GetCount() == 1)
	{
    	behaviorChosen = behaviorsList->GetString(0);
    	return true;
	}
	else if (behaviorsList->GetCount() == 0)
	{
		const BehaviorMetadata & metadata =
			MetadataProvider::GetBehaviorMetadata(project.GetCurrentPlatform(), behaviorTypeAllowed);

		if (metadata.GetFullName().empty())
			gd::LogMessage(_("This object doesn't have the appropriate behavior attached to it.\nCheck that you selected the right object or add the behavior in the object properties."));
		else
		{
			gd::LogMessage(
				wxString::Format(wxString(_("This object doesn't have behavior \"%s\" attached to it.\nCheck that you selected the right object or add this behavior in the object properties.")),
            	metadata.GetFullName().c_str()));
		}

		return true;
	}

	return false;
}

void ChooseBehaviorDialog::RefreshList()
{
    gd::String search = searchCtrl->GetValue();
    bool searching = search.empty() ? false : true;

	std::vector <gd::String> behaviors = gd::GetBehaviorsOfObject(project, layout, parentObject);

	behaviorsList->Clear();
	for (std::size_t i = 0;i<behaviors.size();++i)
	{
	    gd::String behaviorName = behaviors[i];

		if ( (behaviorTypeAllowed.empty() || behaviorTypeAllowed == gd::GetTypeOfBehavior(project, layout, behaviorName)) &&
             (!searching || (searching && behaviorName.CaseFold().find(search.CaseFold()) != gd::String::npos) ))
            behaviorsList->Append(behaviorName);
	}

	if ( behaviorsList->GetCount() == 1)
        behaviorsList->SetSelection(0);
}

void ChooseBehaviorDialog::OnChoisirBtClick(wxCommandEvent& event)
{
    behaviorChosen = behaviorsList->GetStringSelection();
    EndModal(1);
}

void ChooseBehaviorDialog::OnCancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void ChooseBehaviorDialog::OnsearchCtrlText(wxCommandEvent& event)
{
    RefreshList();
}

}
#endif
