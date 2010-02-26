#include "EditDossier.h"

//(*InternalHeaders(EditDossier)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/colordlg.h>
#include "GDL/Event.h"
#include "GDL/HelpFileAccess.h"

//(*IdInit(EditDossier)
const long EditDossier::ID_BUTTON1 = wxNewId();
const long EditDossier::ID_TEXTCTRL2 = wxNewId();
const long EditDossier::ID_TEXTCTRL1 = wxNewId();
const long EditDossier::ID_STATICLINE1 = wxNewId();
const long EditDossier::ID_BUTTON2 = wxNewId();
const long EditDossier::ID_BUTTON3 = wxNewId();
const long EditDossier::ID_BUTTON4 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditDossier,wxDialog)
	//(*EventTable(EditDossier)
	//*)
END_EVENT_TABLE()

EditDossier::EditDossier(wxWindow* parent, Event * pEvent)
{
	//(*Initialize(EditDossier)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxStaticBoxSizer* StaticBoxSizer3;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Editer le dossier"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Couleur du dossier"));
	ColorBt = new wxButton(this, ID_BUTTON1, _("Cliquez pour choisir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	StaticBoxSizer1->Add(ColorBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Texte du dossier"));
	Com2Edit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(180,120), wxTE_MULTILINE, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	StaticBoxSizer2->Add(Com2Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer4->AddGrowableRow(1);
	StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Nom du dossier"));
	Com1Edit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(127,24), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	Com1Edit->SetToolTip(_("Le nom du dossier doit être unique dans la scène."));
	StaticBoxSizer3->Add(Com1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(StaticBoxSizer3, 1, wxALL|wxALIGN_TOP|wxALIGN_CENTER_HORIZONTAL, 5);
	FlexGridSizer3->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
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

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditDossier::OnColorBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditDossier::OnOkBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditDossier::OnAnnulerBtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditDossier::OnAideBtClick);
	//*)
	m_event = pEvent;

	Com1Edit->SetValue( m_event->com1 );
	Com2Edit->SetValue( m_event->com2 );

	ColorBt->SetBackgroundColour(wxColour(m_event->r, m_event->v, m_event->b ));
}

EditDossier::~EditDossier()
{
	//(*Destroy(EditDossier)
	//*)
}


void EditDossier::OnColorBtClick(wxCommandEvent& event)
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

void EditDossier::OnOkBtClick(wxCommandEvent& event)
{
    m_event->com1 = static_cast<string> ( Com1Edit->GetValue() );
    m_event->com2 = static_cast<string> ( Com2Edit->GetValue() );

    m_event->r = ColorBt->GetBackgroundColour().Red();
    m_event->v = ColorBt->GetBackgroundColour().Green();
    m_event->b = ColorBt->GetBackgroundColour().Blue();

    EndModal(1);
}

void EditDossier::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void EditDossier::OnAideBtClick(wxCommandEvent& event)
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(22);
}
