#include "ExtensionBugReportDlg.h"

//(*InternalHeaders(ExtensionBugReportDlg)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)

//(*IdInit(ExtensionBugReportDlg)
const long ExtensionBugReportDlg::ID_STATICBITMAP1 = wxNewId();
const long ExtensionBugReportDlg::ID_STATICTEXT1 = wxNewId();
const long ExtensionBugReportDlg::ID_PANEL1 = wxNewId();
const long ExtensionBugReportDlg::ID_STATICLINE1 = wxNewId();
const long ExtensionBugReportDlg::ID_STATICTEXT5 = wxNewId();
const long ExtensionBugReportDlg::ID_STATICTEXT2 = wxNewId();
const long ExtensionBugReportDlg::ID_STATICTEXT3 = wxNewId();
const long ExtensionBugReportDlg::ID_STATICTEXT4 = wxNewId();
const long ExtensionBugReportDlg::ID_STATICLINE2 = wxNewId();
const long ExtensionBugReportDlg::ID_BUTTON1 = wxNewId();
const long ExtensionBugReportDlg::ID_BUTTON4 = wxNewId();
const long ExtensionBugReportDlg::ID_BUTTON3 = wxNewId();
const long ExtensionBugReportDlg::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ExtensionBugReportDlg,wxDialog)
	//(*EventTable(ExtensionBugReportDlg)
	//*)
END_EVENT_TABLE()

ExtensionBugReportDlg::ExtensionBugReportDlg(wxWindow* parent, wxString extensionFile)
{
	//(*Initialize(ExtensionBugReportDlg)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Une extension est incompatible"), wxDefaultPosition, wxDefaultSize, wxCAPTION|wxMINIMIZE_BOX, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap1 = new wxStaticBitmap(Panel1, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/bigextensionbug.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP1"));
	FlexGridSizer2->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Une extension semble être incompatible et faire crasher Game Develop."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
	wxFont StaticText1Font(11,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText1->SetFont(StaticText1Font);
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(Panel1);
	FlexGridSizer2->SetSizeHints(Panel1);
	FlexGridSizer1->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	errorTxt = new wxStaticText(this, ID_STATICTEXT5, _("Game Develop a crashé lors du chargement de ce fichier :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer6->Add(errorTxt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	fileTxt = new wxStaticText(this, ID_STATICTEXT2, _("Fichier inconnu"), wxDefaultPosition, wxSize(159,13), 0, _T("ID_STATICTEXT2"));
	wxFont fileTxtFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	fileTxt->SetFont(fileTxtFont);
	FlexGridSizer6->Add(fileTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("Pour lancer Game Develop correctement,\nsupprimez le fichier de l\'extension concernée et relancez Game Develop."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	wxFont StaticText3Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText3->SetFont(StaticText3Font);
	FlexGridSizer3->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Reportez si possible le problème au développeur de l\'extension."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer3->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 4, 0, 0);
	closeGDBt = new wxButton(this, ID_BUTTON1, _("Fermer Game Develop"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	closeGDBt->SetDefault();
	FlexGridSizer4->Add(closeGDBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	moreBt = new wxButton(this, ID_BUTTON4, _("Options"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer4->Add(moreBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	loadWithoutExtensionsBt = new wxButton(this, ID_BUTTON3, _("loadWithoutExtensionsBt"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer4->Add(loadWithoutExtensionsBt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	loadGDBt = new wxButton(this, ID_BUTTON2, _("Lancer tout de même Game Develop"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer4->Add(loadGDBt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ExtensionBugReportDlg::OncloseGDBtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ExtensionBugReportDlg::OnmoreBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ExtensionBugReportDlg::OnloadWithoutExtensionsBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ExtensionBugReportDlg::OnloadGDBtClick);
	//*)
    loadWithoutExtensionsBt->SetLabel(_("Lancer Game Develop sans aucune extension"));
    moreBt->SetLabel(_("Options supplémentaires"));

    loadGDBt->Show(false);
    loadWithoutExtensionsBt->Show(false);

    if ( !extensionFile.empty() )
        fileTxt->SetLabel(extensionFile);
}

ExtensionBugReportDlg::~ExtensionBugReportDlg()
{
	//(*Destroy(ExtensionBugReportDlg)
	//*)
}


void ExtensionBugReportDlg::OncloseGDBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void ExtensionBugReportDlg::OnmoreBtClick(wxCommandEvent& event)
{
    loadGDBt->Show(true);
    loadWithoutExtensionsBt->Show(true);
    moreBt->Show(false);
    Layout();
}

void ExtensionBugReportDlg::OnloadGDBtClick(wxCommandEvent& event)
{
    EndModal(2);
}

void ExtensionBugReportDlg::OnloadWithoutExtensionsBtClick(wxCommandEvent& event)
{
    EndModal(1);
}
