#if defined(GDE)
#include "EditComment.h"

//(*InternalHeaders(EditComment)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/colordlg.h>
#include "GDL/Event.h"
#include "GDL/HelpFileAccess.h"

//(*IdInit(EditComment)
const long EditComment::ID_BUTTON1 = wxNewId();
const long EditComment::ID_TEXTCTRL1 = wxNewId();
const long EditComment::ID_TEXTCTRL2 = wxNewId();
const long EditComment::ID_BUTTON2 = wxNewId();
const long EditComment::ID_BUTTON3 = wxNewId();
const long EditComment::ID_BUTTON4 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditComment,wxDialog)
	//(*EventTable(EditComment)
	//*)
END_EVENT_TABLE()

EditComment::EditComment(wxWindow* parent, CommentEvent & event_) :
commentEvent(event_)
{
	//(*Initialize(EditComment)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer2;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Editer le commentaire"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMINIMIZE_BOX, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Couleur du commentaire"));
	ColorBt = new wxButton(this, ID_BUTTON1, _("Cliquez pour choisir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	StaticBoxSizer1->Add(ColorBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Textes du commentaire"));
	Com1Edit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(180,120), wxTE_MULTILINE, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	StaticBoxSizer2->Add(Com1Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Com2Edit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(180,120), wxTE_MULTILINE, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	StaticBoxSizer2->Add(Com2Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	OkBt = new wxButton(this, ID_BUTTON2, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON3, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer2->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AideBt = new wxButton(this, ID_BUTTON4, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer2->Add(AideBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditComment::OnColorBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditComment::OnOkBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditComment::OnAnnulerBtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditComment::OnAideBtClick);
	//*)

	Com1Edit->ChangeValue( commentEvent.com1 );
	Com2Edit->ChangeValue( commentEvent.com2 );

	ColorBt->SetBackgroundColour(wxColour(commentEvent.r, commentEvent.v, commentEvent.b ));
}

EditComment::~EditComment()
{
	//(*Destroy(EditComment)
	//*)
}


void EditComment::OnColorBtClick(wxCommandEvent& event)
{
    wxColourData cData;
    cData.SetColour(ColorBt->GetBackgroundColour());
    wxColourDialog Dialog(this, &cData);
    if ( Dialog.ShowModal() == wxID_OK)
    {
        cData = Dialog.GetColourData();
        ColorBt->SetBackgroundColour(cData.GetColour());
        ColorBt->Refresh();
    }

}

void EditComment::OnOkBtClick(wxCommandEvent& event)
{
    commentEvent.com1 = static_cast<string> ( Com1Edit->GetValue() );
    commentEvent.com2 = static_cast<string> ( Com2Edit->GetValue() );

    commentEvent.r = ColorBt->GetBackgroundColour().Red();
    commentEvent.v = ColorBt->GetBackgroundColour().Green();
    commentEvent.b = ColorBt->GetBackgroundColour().Blue();

    EndModal(1);
}

void EditComment::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void EditComment::OnAideBtClick(wxCommandEvent& event)
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(21);
}
#endif
