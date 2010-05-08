#include "StartHerePage.h"

//(*InternalHeaders(StartHerePage)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/config.h>
#include "GDL/HelpFileAccess.h"
#include <wx/mimetype.h> // mimetype support
#include "Game_Develop_EditorMain.h"

//(*IdInit(StartHerePage)
const long StartHerePage::ID_STATICBITMAP1 = wxNewId();
const long StartHerePage::ID_STATICLINE1 = wxNewId();
const long StartHerePage::ID_STATICTEXT2 = wxNewId();
const long StartHerePage::ID_STATICTEXT1 = wxNewId();
const long StartHerePage::ID_STATICTEXT3 = wxNewId();
const long StartHerePage::ID_STATICTEXT4 = wxNewId();
const long StartHerePage::ID_BUTTON10 = wxNewId();
const long StartHerePage::ID_BUTTON11 = wxNewId();
const long StartHerePage::ID_BUTTON12 = wxNewId();
const long StartHerePage::ID_BUTTON13 = wxNewId();
const long StartHerePage::ID_BUTTON1 = wxNewId();
const long StartHerePage::ID_BUTTON2 = wxNewId();
const long StartHerePage::ID_BUTTON3 = wxNewId();
const long StartHerePage::ID_BUTTON4 = wxNewId();
const long StartHerePage::ID_BUTTON9 = wxNewId();
const long StartHerePage::ID_BUTTON8 = wxNewId();
const long StartHerePage::ID_BUTTON7 = wxNewId();
const long StartHerePage::ID_BUTTON6 = wxNewId();
const long StartHerePage::ID_BUTTON5 = wxNewId();
//*)

BEGIN_EVENT_TABLE(StartHerePage,wxPanel)
	//(*EventTable(StartHerePage)
	//*)
END_EVENT_TABLE()

StartHerePage::StartHerePage(wxWindow* parent, Game_Develop_EditorFrame & mainEditor_) :
mainEditor(mainEditor_)
{
	//(*Initialize(StartHerePage)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxGridSizer* GridSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxGridSizer* GridSizer2;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(3);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/GD-logo-simple.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP1"));
	FlexGridSizer1->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1 = new wxGridSizer(0, 2, 0, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Commencer"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	StaticText2->SetForegroundColour(wxColour(45,105,247));
	wxFont StaticText2Font(10,wxSWISS,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText2->SetFont(StaticText2Font);
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Projets récents"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	StaticText1->SetForegroundColour(wxColour(45,105,247));
	wxFont StaticText1Font(10,wxSWISS,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText1->SetFont(StaticText1Font);
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(GridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	GridSizer2 = new wxGridSizer(0, 2, 0, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("Pour commencer, utilisez le gestionnaire de\nprojet à gauche ( par défaut ) pour ajouter\nune scène ( clic droit sur \"Scènes\" ) et pour\nmodifier les images ( double clic sur \"Images\" )."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer4->Add(StaticText3, 1, wxBOTTOM|wxLEFT|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Si vous débutez ou avez besoin d\'aide :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer4->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	guideBt = new wxButton(this, ID_BUTTON10, _("Lire le guide démarrage"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON10"));
	FlexGridSizer4->Add(guideBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	tutoBt = new wxButton(this, ID_BUTTON11, _("Lire le tutoriel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON11"));
	FlexGridSizer4->Add(tutoBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	wikiBt = new wxButton(this, ID_BUTTON12, _("Accéder au wiki"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON12"));
	FlexGridSizer4->Add(wikiBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	forumBt = new wxButton(this, ID_BUTTON13, _("Accéder au forum"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON13"));
	FlexGridSizer4->Add(forumBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer2->Add(FlexGridSizer4, 0, wxALL|wxALIGN_TOP|wxALIGN_CENTER_HORIZONTAL, 0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	recent1Bt = new wxButton(this, ID_BUTTON1, _("-"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer5->Add(recent1Bt, 1, wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	recent2Bt = new wxButton(this, ID_BUTTON2, _("-"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer5->Add(recent2Bt, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	recent3Bt = new wxButton(this, ID_BUTTON3, _("-"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer5->Add(recent3Bt, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	recent4Bt = new wxButton(this, ID_BUTTON4, _("-"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer5->Add(recent4Bt, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	recent5Bt = new wxButton(this, ID_BUTTON9, _("-"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON9"));
	FlexGridSizer5->Add(recent5Bt, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	recent6Bt = new wxButton(this, ID_BUTTON8, _("-"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON8"));
	FlexGridSizer5->Add(recent6Bt, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	recent7Bt = new wxButton(this, ID_BUTTON7, _("-"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON7"));
	FlexGridSizer5->Add(recent7Bt, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	recent8Bt = new wxButton(this, ID_BUTTON6, _("-"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON6"));
	FlexGridSizer5->Add(recent8Bt, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	recent9Bt = new wxButton(this, ID_BUTTON5, _("-"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON5"));
	FlexGridSizer5->Add(recent9Bt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer2->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(GridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON10,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&StartHerePage::OnguideBtClick);
	Connect(ID_BUTTON11,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&StartHerePage::OntutoBtClick);
	Connect(ID_BUTTON12,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&StartHerePage::OnwikiBtClick);
	Connect(ID_BUTTON13,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&StartHerePage::OnforumBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&StartHerePage::Onrecent1BtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&StartHerePage::Onrecent2BtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&StartHerePage::Onrecent3BtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&StartHerePage::Onrecent4BtClick);
	Connect(ID_BUTTON9,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&StartHerePage::Onrecent5BtClick);
	Connect(ID_BUTTON8,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&StartHerePage::Onrecent6BtClick);
	Connect(ID_BUTTON7,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&StartHerePage::Onrecent7BtClick);
	Connect(ID_BUTTON6,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&StartHerePage::Onrecent8BtClick);
	Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&StartHerePage::Onrecent9BtClick);
	//*)

    Refresh();
}

StartHerePage::~StartHerePage()
{
	//(*Destroy(StartHerePage)
	//*)
}

void StartHerePage::Refresh()
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    {
        wxString result;
        pConfig->Read( _T( "/Recent/0" ), &result );
        recent1Bt->SetLabel( result );
    }
    {
        wxString result;
        pConfig->Read( _T( "/Recent/1" ), &result );
        recent2Bt->SetLabel( result );
    }
    {
        wxString result;
        pConfig->Read( _T( "/Recent/2" ), &result );
        recent3Bt->SetLabel( result );
    }
    {
        wxString result;
        pConfig->Read( _T( "/Recent/3" ), &result );
        recent4Bt->SetLabel( result );
    }
    {
        wxString result;
        pConfig->Read( _T( "/Recent/4" ), &result );
        recent5Bt->SetLabel( result );
    }
    {
        wxString result;
        pConfig->Read( _T( "/Recent/5" ), &result );
        recent6Bt->SetLabel( result );
    }
    {
        wxString result;
        pConfig->Read( _T( "/Recent/6" ), &result );
        recent7Bt->SetLabel( result );
    }
    {
        wxString result;
        pConfig->Read( _T( "/Recent/7" ), &result );
        recent8Bt->SetLabel( result );
    }
    {
        wxString result;
        pConfig->Read( _T( "/Recent/8" ), &result );
        recent9Bt->SetLabel( result );
    }
}

void StartHerePage::Onrecent1BtClick(wxCommandEvent& event)
{
    mainEditor.Open(string(recent1Bt->GetLabel().mb_str()));
}

void StartHerePage::Onrecent2BtClick(wxCommandEvent& event)
{
    mainEditor.Open(string(recent2Bt->GetLabel().mb_str()));
}

void StartHerePage::Onrecent3BtClick(wxCommandEvent& event)
{
    mainEditor.Open(string(recent3Bt->GetLabel().mb_str()));
}

void StartHerePage::Onrecent4BtClick(wxCommandEvent& event)
{
    mainEditor.Open(string(recent4Bt->GetLabel().mb_str()));
}

void StartHerePage::Onrecent5BtClick(wxCommandEvent& event)
{
    mainEditor.Open(string(recent5Bt->GetLabel().mb_str()));
}

void StartHerePage::Onrecent6BtClick(wxCommandEvent& event)
{
    mainEditor.Open(string(recent6Bt->GetLabel().mb_str()));
}

void StartHerePage::Onrecent7BtClick(wxCommandEvent& event)
{
    mainEditor.Open(string(recent7Bt->GetLabel().mb_str()));
}

void StartHerePage::Onrecent8BtClick(wxCommandEvent& event)
{
    mainEditor.Open(string(recent8Bt->GetLabel().mb_str()));
}

void StartHerePage::Onrecent9BtClick(wxCommandEvent& event)
{
    mainEditor.Open(string(recent9Bt->GetLabel().mb_str()));
}

void StartHerePage::OnguideBtClick(wxCommandEvent& event)
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(16);
}

void StartHerePage::OntutoBtClick(wxCommandEvent& event)
{
    wxString link = wxGetCwd() + "\\Tutoriel\\Tutoriel.pdf";
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

void StartHerePage::OnwikiBtClick(wxCommandEvent& event)
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

void StartHerePage::OnforumBtClick(wxCommandEvent& event)
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
