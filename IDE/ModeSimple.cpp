#include "ModeSimple.h"

#ifdef DEBUG
#include "nommgr.h"
#endif

//(*InternalHeaders(ModeSimple)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/config.h>
#include <wx/log.h>
#include <iostream>

#ifdef DEBUG

#endif

//(*IdInit(ModeSimple)
const long ModeSimple::ID_STATICBITMAP3 = wxNewId();
const long ModeSimple::ID_STATICTEXT3 = wxNewId();
const long ModeSimple::ID_PANEL1 = wxNewId();
const long ModeSimple::ID_STATICLINE2 = wxNewId();
const long ModeSimple::ID_CHECKBOX1 = wxNewId();
const long ModeSimple::ID_STATICTEXT1 = wxNewId();
const long ModeSimple::ID_STATICLINE1 = wxNewId();
const long ModeSimple::ID_BUTTON2 = wxNewId();
const long ModeSimple::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ModeSimple,wxDialog)
	//(*EventTable(ModeSimple)
	//*)
END_EVENT_TABLE()

ModeSimple::ModeSimple(wxWindow* parent)
{
	//(*Initialize(ModeSimple)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;
	
	Create(parent, wxID_ANY, _("Mode simple de Game Develop"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/modesimple.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(Panel1, ID_STATICTEXT3, _("Le mode simple permet de désactiver les fonctions\nde Game Develop qui n\'ont pas d\'utilité pour les\ndébutants, ou qui pourrait perdre l\'utilisateur."), wxDefaultPosition, wxSize(253,61), wxALIGN_CENTRE, _T("ID_STATICTEXT3"));
	FlexGridSizer6->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	ModeSimpleCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Activer le mode simple"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	ModeSimpleCheck->SetValue(false);
	FlexGridSizer17->Add(ModeSimpleCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Si vous débutez, activez ce mode pour voir plus\nfacilement les principales options de Game Develop.\nVous pourrez ensuite désactiver le mode Simple quand\nvous serez à l\'aise avec le programme."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer17->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	OkBt = new wxButton(this, ID_BUTTON2, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON1, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer17->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ModeSimple::OnOkBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ModeSimple::OnAnnulerBtClick);
	//*)

    wxConfigBase * pConfig = wxConfigBase::Get();

    bool result = false;
    pConfig->Read("/ModeSimple", &result);

    if ( result == true )
        ModeSimpleCheck->SetValue(true);
}

ModeSimple::~ModeSimple()
{
	//(*Destroy(ModeSimple)
	//*)
}


void ModeSimple::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void ModeSimple::OnOkBtClick(wxCommandEvent& event)
{
    wxConfigBase * pConfig = wxConfigBase::Get();

    if (ModeSimpleCheck->GetValue())
        pConfig->Write("/ModeSimple", true);
    else
        pConfig->Write("/ModeSimple", false);

    wxLogMessage(_("Vous devez redémarrer Game Develop afin de prendre en compte l'action ou désactivation du mode simple."));

    EndModal(1);
}
