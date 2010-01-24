#if defined(GDE)
#include "GDL/SpriteInitialPositionPanel.h"

//(*InternalHeaders(SpriteInitialPositionPanel)
#include <wx/intl.h>
#include <wx/string.h>
//*)

//(*IdInit(SpriteInitialPositionPanel)
const long SpriteInitialPositionPanel::ID_STATICTEXT6 = wxNewId();
const long SpriteInitialPositionPanel::ID_COMBOBOX2 = wxNewId();
const long SpriteInitialPositionPanel::ID_STATICTEXT5 = wxNewId();
const long SpriteInitialPositionPanel::ID_TEXTCTRL3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(SpriteInitialPositionPanel,wxPanel)
	//(*EventTable(SpriteInitialPositionPanel)
	//*)
END_EVENT_TABLE()

SpriteInitialPositionPanel::SpriteInitialPositionPanel(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size)
{
	//(*Initialize(SpriteInitialPositionPanel)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxStaticBoxSizer* StaticBoxSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;

	Create(parent, id, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("id"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Animation"));
	FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer10->AddGrowableCol(0);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT6, _("Numéro de l\'animation\ninitiale :"), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT6"));
	FlexGridSizer10->Add(StaticText5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	AnimationCombo = new wxComboBox(this, ID_COMBOBOX2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, 0, 0, wxDefaultValidator, _T("ID_COMBOBOX2"));
	AnimationCombo->SetToolTip(_("Numéro de l\'animation initiale de l\'objet"));
	FlexGridSizer10->Add(AnimationCombo, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer4->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Direction"));
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT5, _("Numéro de la direction\ninitiale :"), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT5"));
	FlexGridSizer5->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	DirectionEdit = new wxTextCtrl(this, ID_TEXTCTRL3, _("0"), wxDefaultPosition, wxSize(52,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	DirectionEdit->SetToolTip(_("Numéro de la direction initiale de l\'objet."));
	FlexGridSizer11->Add(DirectionEdit, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer11, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	//*)
}

SpriteInitialPositionPanel::~SpriteInitialPositionPanel()
{
	//(*Destroy(SpriteInitialPositionPanel)
	//*)
}

#endif