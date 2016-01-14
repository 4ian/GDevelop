/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

//(*InternalHeaders(AdvancedTextEntryDialog)
#include "GDCore/Tools/Localization.h"
#include <wx/string.h>
//*)
#include "AdvancedEntryDialog.h"
#include "GDCore/IDE/Dialogs/EditExpressionDialog.h"
#include "GDCore/IDE/Dialogs/EditStrExpressionDialog.h"
#include "GDCore/CommonTools.h"
namespace gd { class Project; }
namespace gd { class Layout; }

namespace gd
{

//(*IdInit(AdvancedTextEntryDialog)
const long AdvancedTextEntryDialog::ID_STATICTEXT1 = wxNewId();
const long AdvancedTextEntryDialog::ID_TEXTCTRL1 = wxNewId();
const long AdvancedTextEntryDialog::ID_STATICLINE1 = wxNewId();
const long AdvancedTextEntryDialog::ID_BUTTON1 = wxNewId();
const long AdvancedTextEntryDialog::ID_BUTTON2 = wxNewId();
const long AdvancedTextEntryDialog::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(AdvancedTextEntryDialog,wxDialog)
	//(*EventTable(AdvancedTextEntryDialog)
	//*)
END_EVENT_TABLE()

AdvancedTextEntryDialog::AdvancedTextEntryDialog(wxWindow* parent, gd::String caption, gd::String description, gd::String defaultText, MoreButtonType moreButtonType_, gd::Project * project_, gd::Layout * layout_ ):
    moreButtonType(moreButtonType_),
    project(project_),
    layout(layout_)
{
	//(*Initialize(AdvancedTextEntryDialog)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	descriptionTxt = new wxStaticText(this, ID_STATICTEXT1, _("Label"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer1->Add(descriptionTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	textEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer1->Add(textEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	moreBt = new wxButton(this, ID_BUTTON1, wxEmptyString, wxDefaultPosition, wxSize(199,23), 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(moreBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	okBt = new wxButton(this, ID_BUTTON3, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	okBt->SetDefault();
	FlexGridSizer2->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&AdvancedTextEntryDialog::OnmoreBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&AdvancedTextEntryDialog::OncancelBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&AdvancedTextEntryDialog::OnokBtClick);
	//*)

	SetTitle(caption);
	descriptionTxt->SetLabel(description);
	textEdit->SetValue(defaultText);
	if ( moreButtonType == None )
        moreBt->Show(false);
    else if ( moreButtonType == MathExpression )
        moreBt->SetLabel(_("Open an expression editor"));
    else if ( moreButtonType == TextExpression )
        moreBt->SetLabel(_("Open a text editor"));
}

AdvancedTextEntryDialog::~AdvancedTextEntryDialog()
{
	//(*Destroy(AdvancedTextEntryDialog)
	//*)
}

void AdvancedTextEntryDialog::OnmoreBtClick(wxCommandEvent& event)
{
    if ( moreButtonType == MathExpression && project && layout)
    {
        EditExpressionDialog dialog(this, textEdit->GetValue(), *project, *layout);
        if ( dialog.ShowModal() == 1 ) textEdit->ChangeValue(dialog.GetExpression());
    }
    else if ( moreButtonType == TextExpression && project && layout)
    {
        EditStrExpressionDialog dialog(this, textEdit->GetValue(), *project, *layout);
        if ( dialog.ShowModal() == 1 ) textEdit->ChangeValue(dialog.GetExpression());
    }
}

void AdvancedTextEntryDialog::OnokBtClick(wxCommandEvent& event)
{
    text = textEdit->GetValue();

    EndModal(wxOK);
}

void AdvancedTextEntryDialog::OncancelBtClick(wxCommandEvent& event)
{
    text.clear();

    EndModal(wxCANCEL);
}

}
#endif
