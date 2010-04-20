#if defined(GDE)
#include "EditForEachEvent.h"

//(*InternalHeaders(EditForEachEvent)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDL/ForEachEvent.h"

//(*IdInit(EditForEachEvent)
const long EditForEachEvent::ID_STATICTEXT1 = wxNewId();
const long EditForEachEvent::ID_TEXTCTRL1 = wxNewId();
const long EditForEachEvent::ID_STATICLINE1 = wxNewId();
const long EditForEachEvent::ID_BUTTON1 = wxNewId();
const long EditForEachEvent::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditForEachEvent,wxDialog)
	//(*EventTable(EditForEachEvent)
	//*)
END_EVENT_TABLE()

EditForEachEvent::EditForEachEvent(wxWindow* parent, ForEachEvent & event_) :
eventEdited(event_)
{
	//(*Initialize(EditForEachEvent)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Répeter l\'évènement pour chaque objet :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	objectEdit = new wxTextCtrl(this, ID_TEXTCTRL1, _("Text"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer2->Add(objectEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	//*)
}

EditForEachEvent::~EditForEachEvent()
{
	//(*Destroy(EditForEachEvent)
	//*)
}


void EditForEachEvent::OnokBtClick(wxCommandEvent& event)
{
    eventEdited.SetObjectToPick(string(objectEdit->GetValue().mb_str()));
    EndModal(1);
}

void EditForEachEvent::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

#endif
