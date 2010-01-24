#include "EditLayer.h"

//(*InternalHeaders(EditLayer)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/log.h>

//(*IdInit(EditLayer)
const long EditLayer::ID_STATICTEXT1 = wxNewId();
const long EditLayer::ID_TEXTCTRL1 = wxNewId();
const long EditLayer::ID_CHECKBOX1 = wxNewId();
const long EditLayer::ID_STATICLINE1 = wxNewId();
const long EditLayer::ID_BUTTON2 = wxNewId();
const long EditLayer::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditLayer,wxDialog)
	//(*EventTable(EditLayer)
	//*)
END_EVENT_TABLE()

EditLayer::EditLayer(wxWindow* parent, Layer & layer_) :
layer(layer_)
{
	//(*Initialize(EditLayer)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;
	
	Create(parent, wxID_ANY, _("Modifier les paramètres du calque"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Nom :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	nameEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(129,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer2->Add(nameEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	visibilityCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Visible"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	visibilityCheck->SetValue(false);
	FlexGridSizer1->Add(visibilityCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON2, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON1, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditLayer::OnokBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditLayer::OncancelBtClick);
	//*)

	nameEdit->SetValue(layer.GetName());
	visibilityCheck->SetValue(layer.GetVisibility());

	//Impossible de modifier le nom du calque de base
	if ( layer.GetName() == "" )
        nameEdit->SetEditable(false);
}

EditLayer::~EditLayer()
{
	//(*Destroy(EditLayer)
	//*)
}


void EditLayer::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void EditLayer::OnokBtClick(wxCommandEvent& event)
{
    //Obligation d'avoir un nom sauf pour le calque de base
    if ( nameEdit->GetValue() == "" && nameEdit->IsEditable() )
    {
        wxLogWarning(_("Le nom entré est incorrect."));
        return;
    }

    layer.SetName(static_cast<string>(nameEdit->GetValue()));
    layer.SetVisibility(visibilityCheck->GetValue());
    EndModal(1);
}
