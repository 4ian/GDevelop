/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "Demarrage.h"

//(*InternalHeaders(Demarrage)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/help.h>
#include <wx/fs_zip.h>
#include <wx/config.h>
#include <wx/log.h>
#include <wx/mimetype.h> // mimetype support
#include <string>
#include <vector>
#include "GDCore/Tools/HelpFileAccess.h"

using namespace std;

//(*IdInit(Demarrage)
const long Demarrage::ID_STATICBITMAP1 = wxNewId();
const long Demarrage::ID_PANEL4 = wxNewId();
const long Demarrage::ID_STATICLINE1 = wxNewId();
const long Demarrage::ID_STATICTEXT6 = wxNewId();
const long Demarrage::ID_STATICTEXT2 = wxNewId();
const long Demarrage::ID_STATICTEXT5 = wxNewId();
const long Demarrage::ID_STATICBITMAP2 = wxNewId();
const long Demarrage::ID_STATICTEXT3 = wxNewId();
const long Demarrage::ID_BUTTON6 = wxNewId();
const long Demarrage::ID_PANEL1 = wxNewId();
const long Demarrage::ID_STATICTEXT1 = wxNewId();
const long Demarrage::ID_CHECKBOX1 = wxNewId();
const long Demarrage::ID_STATICBITMAP3 = wxNewId();
const long Demarrage::ID_BUTTON7 = wxNewId();
const long Demarrage::ID_PANEL2 = wxNewId();
const long Demarrage::ID_STATICBITMAP4 = wxNewId();
const long Demarrage::ID_HYPERLINKCTRL1 = wxNewId();
const long Demarrage::ID_STATICTEXT4 = wxNewId();
const long Demarrage::ID_STATICBITMAP5 = wxNewId();
const long Demarrage::ID_HYPERLINKCTRL2 = wxNewId();
const long Demarrage::ID_HYPERLINKCTRL17 = wxNewId();
const long Demarrage::ID_STATICBITMAP11 = wxNewId();
const long Demarrage::ID_HYPERLINKCTRL8 = wxNewId();
const long Demarrage::ID_STATICBITMAP12 = wxNewId();
const long Demarrage::ID_HYPERLINKCTRL9 = wxNewId();
const long Demarrage::ID_STATICBITMAP13 = wxNewId();
const long Demarrage::ID_HYPERLINKCTRL10 = wxNewId();
const long Demarrage::ID_STATICTEXT7 = wxNewId();
const long Demarrage::ID_BUTTON4 = wxNewId();
const long Demarrage::ID_PANEL3 = wxNewId();
const long Demarrage::ID_NOTEBOOK1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(Demarrage,wxDialog)
	//(*EventTable(Demarrage)
	//*)
END_EVENT_TABLE()

Demarrage::Demarrage(wxWindow* parent)
{
	//(*Initialize(Demarrage)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer14;
	wxFlexGridSizer* FlexGridSizer13;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;

	Create(parent, wxID_ANY, _("First startup of Game Develop"), wxDefaultPosition, wxDefaultSize, wxCAPTION|wxSYSTEM_MENU, _T("wxID_ANY"));
	SetClientSize(wxSize(662,325));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	Panel4 = new wxPanel(this, ID_PANEL4, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL4"));
	Panel4->SetBackgroundColour(wxColour(67,52,84));
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(0);
	StaticBitmap1 = new wxStaticBitmap(Panel4, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/GD-logo.png"))), wxPoint(-56,-64), wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer4->Add(StaticBitmap1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	Panel4->SetSizer(FlexGridSizer4);
	FlexGridSizer4->Fit(Panel4);
	FlexGridSizer4->SetSizeHints(Panel4);
	FlexGridSizer1->Add(Panel4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
	Panel1 = new wxPanel(Notebook1, ID_PANEL1, wxPoint(32,47), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	FlexGridSizer7->AddGrowableRow(0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText6 = new wxStaticText(Panel1, ID_STATICTEXT6, _("This window is displayed at first startup"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	wxFont StaticText6Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText6->SetFont(StaticText6Font);
	FlexGridSizer5->Add(StaticText6, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(Panel1, ID_STATICTEXT2, _("Game Develop allows easy and fast game creation,\nfor beginners and advanced users."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	wxFont StaticText2Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText2->SetFont(StaticText2Font);
	FlexGridSizer5->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText5 = new wxStaticText(Panel1, ID_STATICTEXT5, _("You can setup some parameters and read\nsome advices to get started with Game Develop.\n\nClick on Next to continue."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer5->Add(StaticText5, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	StaticBitmap2 = new wxStaticBitmap(Panel1, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/presentation.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP2"));
	FlexGridSizer7->Add(StaticBitmap2, 1, wxALL|wxALIGN_LEFT|wxALIGN_TOP, 0);
	FlexGridSizer2->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	FlexGridSizer6->AddGrowableRow(0);
	StaticText3 = new wxStaticText(Panel1, ID_STATICTEXT3, _("Game Develop is a freeware. If you paid for it ( other than by a donation to the author )\nthen we recommend that you get a refund !"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	wxFont StaticText3Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText3->SetFont(StaticText3Font);
	FlexGridSizer6->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Button1 = new wxButton(Panel1, ID_BUTTON6, _("Next"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON6"));
	FlexGridSizer6->Add(Button1, 1, wxALL|wxALIGN_LEFT|wxALIGN_BOTTOM, 5);
	FlexGridSizer2->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel1->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(Panel1);
	FlexGridSizer2->SetSizeHints(Panel1);
	Panel2 = new wxPanel(Notebook1, ID_PANEL2, wxPoint(93,-1), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	FlexGridSizer8 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer8->AddGrowableCol(0);
	FlexGridSizer8->AddGrowableRow(0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer9->AddGrowableCol(1);
	FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText1 = new wxStaticText(Panel2, ID_STATICTEXT1, _("Game Develop checks by default at startup if new updates are\navailable. If you have a firewall, it is possible that it will ask\nif the software can access the internet. In this case, answer by yes."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer10->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	majCheck = new wxCheckBox(Panel2, ID_CHECKBOX1, _("Check for updates at startup"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	majCheck->SetValue(true);
	FlexGridSizer10->Add(majCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel2, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/maj.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP3"));
	FlexGridSizer9->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button2 = new wxButton(Panel2, ID_BUTTON7, _("Next"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON7"));
	FlexGridSizer8->Add(Button2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_BOTTOM, 5);
	Panel2->SetSizer(FlexGridSizer8);
	FlexGridSizer8->Fit(Panel2);
	FlexGridSizer8->SetSizeHints(Panel2);
	Panel3 = new wxPanel(Notebook1, ID_PANEL3, wxPoint(140,-3), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(2);
	FlexGridSizer11 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticBitmap4 = new wxStaticBitmap(Panel3, ID_STATICBITMAP4, wxBitmap(wxImage(_T("res/modesimpleicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP4"));
	FlexGridSizer11->Add(StaticBitmap4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(Panel3, ID_HYPERLINKCTRL1, _("To get started with Game Develop, read the \"Getting started manual\",\navailable in Help."), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	FlexGridSizer11->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText4 = new wxStaticText(Panel3, ID_STATICTEXT4, _("You can then:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer3->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer13 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticBitmap5 = new wxStaticBitmap(Panel3, ID_STATICBITMAP5, wxBitmap(wxImage(_T("res/tutoicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP5"));
	FlexGridSizer13->Add(StaticBitmap5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12 = new wxFlexGridSizer(0, 3, 0, 0);
	HyperlinkCtrl2 = new wxHyperlinkCtrl(Panel3, ID_HYPERLINKCTRL2, _("Read the tutorial"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL2"));
	FlexGridSizer12->Add(HyperlinkCtrl2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	secondTutoLink = new wxHyperlinkCtrl(Panel3, ID_HYPERLINKCTRL17, _("( Spanish tutorial also available )"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL17"));
	FlexGridSizer12->Add(secondTutoLink, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer13->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBitmap11 = new wxStaticBitmap(Panel3, ID_STATICBITMAP11, wxBitmap(wxImage(_T("res/openicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP11"));
	FlexGridSizer13->Add(StaticBitmap11, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl8 = new wxHyperlinkCtrl(Panel3, ID_HYPERLINKCTRL8, _("Open examples"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_LEFT|wxNO_BORDER, _T("ID_HYPERLINKCTRL8"));
	FlexGridSizer13->Add(HyperlinkCtrl8, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap12 = new wxStaticBitmap(Panel3, ID_STATICBITMAP12, wxBitmap(wxImage(_T("res/wikiicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP12"));
	FlexGridSizer13->Add(StaticBitmap12, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl9 = new wxHyperlinkCtrl(Panel3, ID_HYPERLINKCTRL9, _("Access to wiki ( Knowledge base )"), _("http://www.wiki.compilgames.net"), wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL9"));
	FlexGridSizer13->Add(HyperlinkCtrl9, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap13 = new wxStaticBitmap(Panel3, ID_STATICBITMAP13, wxBitmap(wxImage(_T("res/community.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP13"));
	FlexGridSizer13->Add(StaticBitmap13, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl10 = new wxHyperlinkCtrl(Panel3, ID_HYPERLINKCTRL10, _("Access to forum"), _("http://www.forum.compilgames.net"), wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL10"));
	FlexGridSizer13->Add(HyperlinkCtrl10, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer14 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer14->AddGrowableCol(1);
	FlexGridSizer14->AddGrowableRow(0);
	StaticText7 = new wxStaticText(Panel3, ID_STATICTEXT7, _("You can also access to this links from the Start Page which is\ndisplayed when Game Develop is launched."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	wxFont StaticText7Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText7->SetFont(StaticText7Font);
	FlexGridSizer14->Add(StaticText7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FermerBt = new wxButton(Panel3, ID_BUTTON4, _("Close"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer14->Add(FermerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_BOTTOM, 5);
	FlexGridSizer3->Add(FlexGridSizer14, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel3->SetSizer(FlexGridSizer3);
	FlexGridSizer3->Fit(Panel3);
	FlexGridSizer3->SetSizeHints(Panel3);
	Notebook1->AddPage(Panel1, _("Welcome"), false);
	Notebook1->AddPage(Panel2, _("Setup"), false);
	Notebook1->AddPage(Panel3, _("Getting started with Game Develop"), false);
	FlexGridSizer1->Add(Notebook1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	SetSizer(FlexGridSizer1);
	Layout();
	Center();

	Connect(ID_BUTTON6,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Demarrage::OnButton1Click);
	Connect(ID_BUTTON7,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Demarrage::OnButton2Click);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&Demarrage::OnGuideBtClick);
	Connect(ID_HYPERLINKCTRL2,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&Demarrage::OnTutorielBtClick);
	Connect(ID_HYPERLINKCTRL17,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&Demarrage::OnsecondTutoLinkClick);
	Connect(ID_HYPERLINKCTRL8,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&Demarrage::OnExempleBtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Demarrage::OnFermerBtClick);
	//*)

    if ( _("( Spanish tutorial also available )") == "(-Insert the name of the second tutorial or a blank text-)" )
        secondTutoLink->SetLabel("");
}

Demarrage::~Demarrage()
{
	//(*Destroy(Demarrage)
	//*)
}

void Demarrage::OnGuideBtClick(wxCommandEvent& event)
{
    if ( gd::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_FRENCH )
        gd::HelpFileAccess::GetInstance()->DisplaySection(16);
    else
        gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/edit_getstart"));
}

void Demarrage::OnForumBtClick(wxCommandEvent& event)
{
    wxString link = "http://forum.compilgames.net";
    wxString mimetype = wxEmptyString;
    if (link.StartsWith (_T("http://"))) {
        mimetype = _T("text/html");
    }else if (link.StartsWith (_T("ftp://"))) {
        mimetype = _T("text/html");
    }else if (link.StartsWith (_T("mailto:"))) {
        mimetype = _T("message/rfc822");
    }else{
        return;
    }
    wxFileType *filetype = wxTheMimeTypesManager->GetFileTypeFromMimeType (mimetype);
    if (filetype) {
        wxString cmd;
        if (filetype->GetOpenCommand (&cmd, wxFileType::MessageParameters (link))) {
            cmd.Replace(_T("file://"), wxEmptyString);
            ::wxExecute(cmd);
        }
        delete filetype;
    }
}

void Demarrage::OnExempleBtClick(wxCommandEvent& event)
{
    wxConfigBase *pConfig = wxConfigBase::Get();

    if ( majCheck->GetValue() )
        pConfig->Write("Démarrage/MAJ", "true");
    else
        pConfig->Write("Démarrage/MAJ", "false");

    EndModal(1);
}

void Demarrage::OnFermerBtClick(wxCommandEvent& event)
{
    wxConfigBase *pConfig = wxConfigBase::Get();

    if ( majCheck->GetValue() )
        pConfig->Write("Démarrage/MAJ", "true");
    else
        pConfig->Write("Démarrage/MAJ", "false");

    EndModal(0);
}

void Demarrage::OnTutorielBtClick(wxCommandEvent& event)
{
    wxString link = wxGetCwd() + "/Tutorial/"+_("Tutorial.pdf");
    wxString mimetype = "application/pdf";
    wxFileType *filetype = wxTheMimeTypesManager->GetFileTypeFromMimeType (mimetype);
    if (filetype) {
        wxString cmd;
        if (filetype->GetOpenCommand (&cmd, wxFileType::MessageParameters (link))) {
            cmd.Replace(_T("file://"), wxEmptyString);
            ::wxExecute(cmd);
        }
        delete filetype;
    }
}

void Demarrage::OnwikiBtClick(wxCommandEvent& event)
{
    wxString link = "http://wiki.compilgames.net";
    wxString mimetype = wxEmptyString;
    if (link.StartsWith (_T("http://"))) {
        mimetype = _T("text/html");
    }else if (link.StartsWith (_T("ftp://"))) {
        mimetype = _T("text/html");
    }else if (link.StartsWith (_T("mailto:"))) {
        mimetype = _T("message/rfc822");
    }else{
        return;
    }
    wxFileType *filetype = wxTheMimeTypesManager->GetFileTypeFromMimeType (mimetype);
    if (filetype) {
        wxString cmd;
        if (filetype->GetOpenCommand (&cmd, wxFileType::MessageParameters (link))) {
            cmd.Replace(_T("file://"), wxEmptyString);
            ::wxExecute(cmd);
        }
        delete filetype;
    }
}

void Demarrage::OnButton1Click(wxCommandEvent& event)
{
    Notebook1->SetSelection(1);
}

void Demarrage::OnButton2Click(wxCommandEvent& event)
{
    Notebook1->SetSelection(2);
}

void Demarrage::OnsecondTutoLinkClick(wxCommandEvent& event)
{
    if ( _("Spanish Tutorial.pdf") == "" ) return;

    wxString link = wxGetCwd() + "/Tutorial/"+_("Spanish Tutorial.pdf");
    wxString mimetype = "application/pdf";
    wxFileType *filetype = wxTheMimeTypesManager->GetFileTypeFromMimeType (mimetype);
    if (filetype) {
        wxString cmd;
        if (filetype->GetOpenCommand (&cmd, wxFileType::MessageParameters (link))) {
            cmd.Replace(_T("file://"), wxEmptyString);
            ::wxExecute(cmd);
        }
        delete filetype;
    }
    else
        wxLogMessage(_("Unable to launch the tutorial. Tutorials can be found in the directoy called \"Tutorial\", inside Game Develop directory."));
}

