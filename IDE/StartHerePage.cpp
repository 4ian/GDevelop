#include "StartHerePage.h"

//(*InternalHeaders(StartHerePage)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/config.h>
#include "GDCore/Tools/HelpFileAccess.h"
#include <wx/mimetype.h> // mimetype support
#include "Game_Develop_EditorMain.h"

//(*IdInit(StartHerePage)
const long StartHerePage::ID_STATICBITMAP1 = wxNewId();
const long StartHerePage::ID_STATICLINE1 = wxNewId();
const long StartHerePage::ID_STATICTEXT2 = wxNewId();
const long StartHerePage::ID_STATICTEXT1 = wxNewId();
const long StartHerePage::ID_STATICTEXT3 = wxNewId();
const long StartHerePage::ID_STATICTEXT4 = wxNewId();
const long StartHerePage::ID_STATICBITMAP2 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL1 = wxNewId();
const long StartHerePage::ID_STATICBITMAP3 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL2 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL17 = wxNewId();
const long StartHerePage::ID_STATICBITMAP4 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL14 = wxNewId();
const long StartHerePage::ID_STATICBITMAP5 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL3 = wxNewId();
const long StartHerePage::ID_STATICBITMAP6 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL4 = wxNewId();
const long StartHerePage::ID_STATICBITMAP7 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL15 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL5 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL6 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL7 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL9 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL8 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL10 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL11 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL12 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL13 = wxNewId();
const long StartHerePage::ID_STATICBITMAP8 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL16 = wxNewId();
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
	wxFlexGridSizer* FlexGridSizer7;
	wxGridSizer* GridSizer1;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer6;
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
	FlexGridSizer1->Add(StaticLine1, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1 = new wxGridSizer(0, 2, 0, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Commencer"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	StaticText2->SetForegroundColour(wxColour(45,105,247));
	wxFont StaticText2Font(10,wxSWISS,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText2->SetFont(StaticText2Font);
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Projets récents"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	StaticText1->SetForegroundColour(wxColour(45,105,247));
	wxFont StaticText1Font(10,wxSWISS,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText1->SetFont(StaticText1Font);
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(GridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	GridSizer2 = new wxGridSizer(0, 2, 0, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("Pour commencer, utilisez le gestionnaire de projet, à gauche\npar défaut, pour ajouter une scène ( clic droit sur \"Scènes\" )\net pour modifier les images ( double clic sur \"Images\" )."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer4->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Si vous débutez ou avez besoin d\'aide :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer4->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticBitmap2 = new wxStaticBitmap(this, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/modesimpleicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer7->Add(StaticBitmap2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Lire le guide de démarrage"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	FlexGridSizer7->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap3 = new wxStaticBitmap(this, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/tutoicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	FlexGridSizer7->Add(StaticBitmap3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
	HyperlinkCtrl2 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL2, _("Lire le tutoriel"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL2"));
	FlexGridSizer8->Add(HyperlinkCtrl2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	secondTutoLink = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL17, _("(-Insert the name of the second tutorial or a blank text-)"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL17"));
	FlexGridSizer8->Add(secondTutoLink, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBitmap4 = new wxStaticBitmap(this, ID_STATICBITMAP4, wxBitmap(wxImage(_T("res/openicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP4"));
	FlexGridSizer7->Add(StaticBitmap4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	openExamplesLink = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL14, _("Ouvrir les exemples"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_LEFT|wxNO_BORDER, _T("ID_HYPERLINKCTRL14"));
	FlexGridSizer7->Add(openExamplesLink, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap5 = new wxStaticBitmap(this, ID_STATICBITMAP5, wxBitmap(wxImage(_T("res/wikiicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP5"));
	FlexGridSizer7->Add(StaticBitmap5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl3 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL3, _("Accéder au wiki ( Base d\'articles et de connaissance )"), _("http://www.wiki.compilgames.net"), wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL3"));
	FlexGridSizer7->Add(HyperlinkCtrl3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap6 = new wxStaticBitmap(this, ID_STATICBITMAP6, wxBitmap(wxImage(_T("res/community.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP6"));
	FlexGridSizer7->Add(StaticBitmap6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl4 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL4, _("Accéder au forum"), _("http://www.forum.compilgames.net"), wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL4"));
	FlexGridSizer7->Add(HyperlinkCtrl4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap7 = new wxStaticBitmap(this, ID_STATICBITMAP7, wxBitmap(wxImage(_T("res/paint.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP7"));
	FlexGridSizer7->Add(StaticBitmap7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	resourcesLink = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL15, _("Accéder aux ressources pour jeux"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_LEFT|wxNO_BORDER, _T("ID_HYPERLINKCTRL15"));
	FlexGridSizer7->Add(resourcesLink, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer2->Add(FlexGridSizer4, 0, wxALL|wxALIGN_TOP|wxALIGN_CENTER_HORIZONTAL, 5);
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	recent1Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL5, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL5"));
	FlexGridSizer5->Add(recent1Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	recent2Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL6, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL6"));
	FlexGridSizer5->Add(recent2Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	recent3Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL7, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL7"));
	FlexGridSizer5->Add(recent3Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	recent4Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL9, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL9"));
	FlexGridSizer5->Add(recent4Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	recent5Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL8, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL8"));
	FlexGridSizer5->Add(recent5Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	recent6Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL10, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL10"));
	FlexGridSizer5->Add(recent6Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	recent7Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL11, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL11"));
	FlexGridSizer5->Add(recent7Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	recent8Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL12, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL12"));
	FlexGridSizer5->Add(recent8Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	recent9Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL13, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL13"));
	FlexGridSizer5->Add(recent9Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer2->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(GridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 0, 0, 0);
	FlexGridSizer6->AddGrowableCol(1);
	FlexGridSizer6->AddGrowableRow(0);
	StaticBitmap8 = new wxStaticBitmap(this, ID_STATICBITMAP8, wxBitmap(wxImage(_T("res/donateicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP8"));
	FlexGridSizer6->Add(StaticBitmap8, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl5 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL16, _("Vous appréciez Game Develop \? Aidez l\'auteur en faisant un don."), _("http://www.compilgames.net/\?file=kop8.php"), wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_LEFT|wxNO_BORDER, _T("ID_HYPERLINKCTRL16"));
	FlexGridSizer6->Add(HyperlinkCtrl5, 1, wxALL|wxALIGN_BOTTOM|wxALIGN_CENTER_HORIZONTAL, 5);
	FlexGridSizer1->Add(FlexGridSizer6, 1, wxALL|wxALIGN_BOTTOM|wxALIGN_CENTER_HORIZONTAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::OnguideBtClick);
	Connect(ID_HYPERLINKCTRL2,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::OntutoBtClick);
	Connect(ID_HYPERLINKCTRL17,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::OnTutorial2BtClick);
	Connect(ID_HYPERLINKCTRL14,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::OnopenExamplesLinkClick);
	Connect(ID_HYPERLINKCTRL15,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::OnresourcesLinkClick);
	Connect(ID_HYPERLINKCTRL5,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent1BtClick);
	Connect(ID_HYPERLINKCTRL6,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent2BtClick);
	Connect(ID_HYPERLINKCTRL7,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent3BtClick);
	Connect(ID_HYPERLINKCTRL9,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent4BtClick);
	Connect(ID_HYPERLINKCTRL8,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent5BtClick);
	Connect(ID_HYPERLINKCTRL10,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent6BtClick);
	Connect(ID_HYPERLINKCTRL11,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent7BtClick);
	Connect(ID_HYPERLINKCTRL12,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent8BtClick);
	Connect(ID_HYPERLINKCTRL13,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent9BtClick);
	//*)

    if ( _("(-Insert the name of the second tutorial or a blank text-)") == "(-Insert the name of the second tutorial or a blank text-)" )
        secondTutoLink->SetLabel("");

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
    gd::HelpFileAccess * helpFileAccess = gd::HelpFileAccess::GetInstance();
    helpFileAccess->DisplaySection(16);
}

void StartHerePage::OntutoBtClick(wxCommandEvent& event)
{
    wxString link = wxGetCwd() + "/Tutorial/"+_("Tutoriel.pdf");
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
        wxLogMessage(_("Impossible de lancer le tutoriel. Vous pouvez le consulter en allant dans le dossier Game Develop, puis dans le répertoire Tutoriel et en ouvrant le fichier Tutoriel.pdf"));
}

void StartHerePage::OnTutorial2BtClick(wxCommandEvent& event)
{
    if ( _("(-Insert filename of the second tutorial or a blank text if there is no second tutorial-)") == "" ) return;

    wxString link = wxGetCwd() + "/Tutorial/"+_("(-Insert filename of the second tutorial or a blank text if there is no second tutorial-)");
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
        wxLogMessage(_("Impossible de lancer le tutoriel. Vous pouvez le consulter en allant dans le dossier Game Develop, puis dans le répertoire Tutoriel et en ouvrant le fichier Tutoriel.pdf"));
}

void StartHerePage::OnopenExamplesLinkClick(wxCommandEvent& event)
{
    wxFileDialog open( NULL, _( "Ouvrir un exemple" ), wxGetCwd()+"/Examples/", "", "\"Game Develop\" Game (*.gdg;*.jgd)|*.jgd;*.gdg" );
    open.ShowModal();

    if ( !open.GetPath().empty() ) mainEditor.Open(string(open.GetPath().mb_str()));
}

void StartHerePage::OnresourcesLinkClick(wxCommandEvent& event)
{
    #if defined(WINDOWS)
    wxExecute("explorer.exe \""+wxGetCwd()+"\\Ressources\\\"");
    #elif defined(LINUX)
    system(string("xdg-open \""+string(wxGetCwd().mb_str())+"/Ressources/\"").c_str());
    #elif defined(MAC)
    system(string("open \""+string(wxGetCwd().mb_str())+"/Ressources/\"").c_str());
    #endif

}
