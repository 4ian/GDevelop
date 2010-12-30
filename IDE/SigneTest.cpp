#include "SigneTest.h"

//(*InternalHeaders(SigneTest)
#include <wx/intl.h>
#include <wx/string.h>
//*)

//(*IdInit(SigneTest)
const long SigneTest::ID_RADIOBOX1 = wxNewId();
const long SigneTest::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(SigneTest,wxDialog)
	//(*EventTable(SigneTest)
	//*)
END_EVENT_TABLE()

SigneTest::SigneTest(wxWindow* parent)
{
	//(*Initialize(SigneTest)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Choisir le signe du test"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	wxString __wxRadioBoxChoices_1[6] =
	{
		_("= ( égal )"),
		_("> ( supérieur à )"),
		_("< ( inférieur à )"),
		_(">= ( supérieur ou égal à )"),
		_("<= ( inférieur ou égal à )"),
		_("!= ( différent de )")
	};
	SigneRadio = new wxRadioBox(this, ID_RADIOBOX1, _("Signe du test"), wxDefaultPosition, wxDefaultSize, 6, __wxRadioBoxChoices_1, 1, 0, wxDefaultValidator, _T("ID_RADIOBOX1"));
	FlexGridSizer1->Add(SigneRadio, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer1->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SigneTest::OnOkBtClick);
	//*)
}

SigneTest::~SigneTest()
{
	//(*Destroy(SigneTest)
	//*)
}


void SigneTest::OnOkBtClick(wxCommandEvent& event)
{
    EndModal( 1+SigneRadio->GetSelection());
}
