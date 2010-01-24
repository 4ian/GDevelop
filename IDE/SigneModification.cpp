#include "SigneModification.h"

//(*InternalHeaders(SigneModification)
#include <wx/intl.h>
#include <wx/string.h>
//*)

//(*IdInit(SigneModification)
const long SigneModification::ID_RADIOBOX1 = wxNewId();
const long SigneModification::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(SigneModification,wxDialog)
	//(*EventTable(SigneModification)
	//*)
END_EVENT_TABLE()

SigneModification::SigneModification(wxWindow* parent)
{
	//(*Initialize(SigneModification)
	wxFlexGridSizer* FlexGridSizer1;
	
	Create(parent, wxID_ANY, _("Choisir le signe de la modification"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	wxString __wxRadioBoxChoices_1[5] = 
	{
		_("= ( Mettre à )"),
		_("+ ( Ajouter )"),
		_("- ( Soustraire )"),
		_("* ( Multiplier par )"),
		_("/ ( Division par )")
	};
	SigneRadio = new wxRadioBox(this, ID_RADIOBOX1, _("Signe de la modification"), wxDefaultPosition, wxSize(140,121), 5, __wxRadioBoxChoices_1, 1, 0, wxDefaultValidator, _T("ID_RADIOBOX1"));
	FlexGridSizer1->Add(SigneRadio, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer1->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SigneModification::OnOkBtClick);
	//*)
}

SigneModification::~SigneModification()
{
	//(*Destroy(SigneModification)
	//*)
}


void SigneModification::OnOkBtClick(wxCommandEvent& event)
{
    int nb = SigneRadio->GetSelection();

    EndModal(nb+1);
}
