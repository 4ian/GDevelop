#include "AdvancedPasteDlg.h"

//(*InternalHeaders(AdvancedPasteDlg)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDL/CommonTools.h"

//(*IdInit(AdvancedPasteDlg)
const long AdvancedPasteDlg::ID_STATICTEXT9 = wxNewId();
const long AdvancedPasteDlg::ID_TEXTCTRL2 = wxNewId();
const long AdvancedPasteDlg::ID_STATICTEXT11 = wxNewId();
const long AdvancedPasteDlg::ID_TEXTCTRL3 = wxNewId();
const long AdvancedPasteDlg::ID_STATICTEXT1 = wxNewId();
const long AdvancedPasteDlg::ID_SPINCTRL1 = wxNewId();
const long AdvancedPasteDlg::ID_STATICTEXT2 = wxNewId();
const long AdvancedPasteDlg::ID_SPINCTRL2 = wxNewId();
const long AdvancedPasteDlg::ID_STATICTEXT3 = wxNewId();
const long AdvancedPasteDlg::ID_STATICTEXT6 = wxNewId();
const long AdvancedPasteDlg::ID_TEXTCTRL4 = wxNewId();
const long AdvancedPasteDlg::ID_STATICTEXT7 = wxNewId();
const long AdvancedPasteDlg::ID_TEXTCTRL5 = wxNewId();
const long AdvancedPasteDlg::ID_STATICTEXT8 = wxNewId();
const long AdvancedPasteDlg::ID_STATICTEXT4 = wxNewId();
const long AdvancedPasteDlg::ID_TEXTCTRL1 = wxNewId();
const long AdvancedPasteDlg::ID_STATICTEXT5 = wxNewId();
const long AdvancedPasteDlg::ID_STATICLINE1 = wxNewId();
const long AdvancedPasteDlg::ID_BUTTON1 = wxNewId();
const long AdvancedPasteDlg::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(AdvancedPasteDlg,wxDialog)
	//(*EventTable(AdvancedPasteDlg)
	//*)
END_EVENT_TABLE()

AdvancedPasteDlg::AdvancedPasteDlg(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size)
{
	//(*Initialize(AdvancedPasteDlg)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;

	Create(parent, id, _("Collage spécial"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("id"));
	SetClientSize(wxDefaultSize);
	Move(wxDefaultPosition);

		wxIcon FrameIcon;
		FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
		SetIcon(FrameIcon);
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Collage"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer8 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticText9 = new wxStaticText(this, ID_STATICTEXT9, _("Commencer le collage en :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer8->Add(StaticText9, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
	xStartEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(52,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer9->Add(xStartEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText11 = new wxStaticText(this, ID_STATICTEXT11, _(";"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT11"));
	FlexGridSizer9->Add(StaticText11, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	yStartEdit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(52,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	FlexGridSizer9->Add(yStartEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Nombre de copies de l\'objet :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer8->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	xCountEdit = new wxSpinCtrl(this, ID_SPINCTRL1, _T("1"), wxDefaultPosition, wxSize(56,21), 0, 1, 100000, 1, _T("ID_SPINCTRL1"));
	xCountEdit->SetValue(_T("1"));
	xCountEdit->SetFocus();
	FlexGridSizer11->Add(xCountEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("en largeur ( X )"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer11->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer8->Add(-1,-1,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10 = new wxFlexGridSizer(0, 3, 0, 0);
	yCountEdit = new wxSpinCtrl(this, ID_SPINCTRL2, _T("1"), wxDefaultPosition, wxSize(56,21), 0, 1, 100000, 1, _T("ID_SPINCTRL2"));
	yCountEdit->SetValue(_T("1"));
	FlexGridSizer10->Add(yCountEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("en hauteur ( Y )"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer10->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Options"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText6 = new wxStaticText(this, ID_STATICTEXT6, _("Espacer chaque objet de :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer3->Add(StaticText6, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5 = new wxFlexGridSizer(0, 4, 0, 0);
	xGapEdit = new wxTextCtrl(this, ID_TEXTCTRL4, _("0"), wxDefaultPosition, wxSize(52,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	FlexGridSizer5->Add(xGapEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText7 = new wxStaticText(this, ID_STATICTEXT7, _("pixels en largeur"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer5->Add(StaticText7, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	yGapEdit = new wxTextCtrl(this, ID_TEXTCTRL5, _("0"), wxDefaultPosition, wxSize(52,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
	FlexGridSizer5->Add(yGapEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText8 = new wxStaticText(this, ID_STATICTEXT8, _("pixels en hauteur"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer5->Add(StaticText8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Appliquer progressivement à chaque objet créé :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer3->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	rotationEdit = new wxTextCtrl(this, ID_TEXTCTRL1, _("0"), wxDefaultPosition, wxSize(44,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer4->Add(rotationEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT5, _("° de rotation"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer4->Add(StaticText5, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2->Add(FlexGridSizer3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer6->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer6->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer6, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&AdvancedPasteDlg::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&AdvancedPasteDlg::OncancelBtClick);
	//*)
}

AdvancedPasteDlg::~AdvancedPasteDlg()
{
	//(*Destroy(AdvancedPasteDlg)
	//*)
}


void AdvancedPasteDlg::OnokBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void AdvancedPasteDlg::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void AdvancedPasteDlg::SetStartX(float xStart)
{
    xStartEdit->SetValue(ToString(xStart));
}
void AdvancedPasteDlg::SetStartY(float yStart)
{
    yStartEdit->SetValue(ToString(yStart));
}
void AdvancedPasteDlg::SetXGap(float xGap)
{
    xGapEdit->SetValue(ToString(xGap));
}
void AdvancedPasteDlg::SetYGap(float yGap)
{
    yGapEdit->SetValue(ToString(yGap));
}

unsigned int AdvancedPasteDlg::GetXCount() const
{
    return xCountEdit->GetValue();
}

unsigned int AdvancedPasteDlg::GetYCount() const
{
    return yCountEdit->GetValue();
}

float AdvancedPasteDlg::GetStartX() const
{
    return ToFloat(ToString(xStartEdit->GetValue()));
}
float AdvancedPasteDlg::GetStartY() const
{
    return ToFloat(ToString(yStartEdit->GetValue()));
}
float AdvancedPasteDlg::GetXGap() const
{
    return ToFloat(ToString(xGapEdit->GetValue()));
}
float AdvancedPasteDlg::GetYGap() const
{
    return ToFloat(ToString(yGapEdit->GetValue()));
}
float AdvancedPasteDlg::GetRotationIncrementation() const
{
    return ToFloat(ToString(rotationEdit->GetValue()));
}
