#if defined(GD_IDE_ONLY)

#include "AdvancedTextEntryDlg.h"
#include "GDL/IDE/Dialogs/EditExpression.h"
#include "GDL/IDE/Dialogs/EditTextDialog.h"

//(*InternalHeaders(AdvancedTextEntryDlg)
#include <wx/intl.h>
#include <wx/string.h>
//*)

//(*IdInit(AdvancedTextEntryDlg)
const long AdvancedTextEntryDlg::ID_STATICTEXT1 = wxNewId();
const long AdvancedTextEntryDlg::ID_TEXTCTRL1 = wxNewId();
const long AdvancedTextEntryDlg::ID_STATICLINE1 = wxNewId();
const long AdvancedTextEntryDlg::ID_BUTTON1 = wxNewId();
const long AdvancedTextEntryDlg::ID_BUTTON2 = wxNewId();
const long AdvancedTextEntryDlg::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(AdvancedTextEntryDlg,wxDialog)
	//(*EventTable(AdvancedTextEntryDlg)
	//*)
END_EVENT_TABLE()

AdvancedTextEntryDlg::AdvancedTextEntryDlg(wxWindow* parent, std::string caption, std::string description, std::string defaultText, MoreButtonType moreButtonType_, Game * game_, Scene * scene_ ):
    moreButtonType(moreButtonType_),
    game(game_),
    scene(scene_)
{
	//(*Initialize(AdvancedTextEntryDlg)
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
	cancelBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	okBt = new wxButton(this, ID_BUTTON3, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	okBt->SetDefault();
	FlexGridSizer2->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&AdvancedTextEntryDlg::OnmoreBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&AdvancedTextEntryDlg::OncancelBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&AdvancedTextEntryDlg::OnokBtClick);
	//*)

	SetTitle(caption);
	descriptionTxt->SetLabel(description);
	textEdit->SetValue(defaultText);
	if ( moreButtonType == None )
        moreBt->Show(false);
    else if ( moreButtonType == MathExpression )
        moreBt->SetLabel(_("Ouvrir un éditeur d'expression"));
    else if ( moreButtonType == TextExpression )
        moreBt->SetLabel(_("Ouvrir un éditeur de texte"));
}

AdvancedTextEntryDlg::~AdvancedTextEntryDlg()
{
	//(*Destroy(AdvancedTextEntryDlg)
	//*)
}


void AdvancedTextEntryDlg::OnmoreBtClick(wxCommandEvent& event)
{
    if ( moreButtonType == MathExpression && game && scene)
    {
        EditExpression dialog(this, string( textEdit->GetValue().mb_str() ), *game, *scene);
        if ( dialog.ShowModal() == 1 ) textEdit->ChangeValue(dialog.expression);
    }
    else if ( moreButtonType == TextExpression && game && scene)
    {
        EditTextDialog dialog(this, string( textEdit->GetValue().mb_str() ), *game, *scene);
        if ( dialog.ShowModal() == 1 ) textEdit->ChangeValue(dialog.returnedText);
    }
}

void AdvancedTextEntryDlg::OnokBtClick(wxCommandEvent& event)
{
    text = string( textEdit->GetValue().mb_str() );

    EndModal(wxOK);
}

void AdvancedTextEntryDlg::OncancelBtClick(wxCommandEvent& event)
{
    text.clear();

    EndModal(wxCANCEL);
}
#endif
