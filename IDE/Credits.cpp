#include "Credits.h"

//(*InternalHeaders(Credits)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/mimetype.h> // mimetype support
#include "GDL/VersionWrapper.h"
#include <string>
#include <vector>
#include <iostream>

using namespace std;

//(*IdInit(Credits)
const long Credits::ID_STATICBITMAP1 = wxNewId();
const long Credits::ID_STATICTEXT1 = wxNewId();
const long Credits::ID_STATICTEXT4 = wxNewId();
const long Credits::ID_STATICTEXT2 = wxNewId();
const long Credits::ID_STATICTEXT3 = wxNewId();
const long Credits::ID_STATICTEXT5 = wxNewId();
const long Credits::ID_BITMAPBUTTON1 = wxNewId();
const long Credits::ID_BITMAPBUTTON7 = wxNewId();
const long Credits::ID_PANEL1 = wxNewId();
const long Credits::ID_TEXTCTRL1 = wxNewId();
const long Credits::ID_PANEL2 = wxNewId();
const long Credits::ID_STATICTEXT7 = wxNewId();
const long Credits::ID_BITMAPBUTTON2 = wxNewId();
const long Credits::ID_BITMAPBUTTON3 = wxNewId();
const long Credits::ID_BITMAPBUTTON4 = wxNewId();
const long Credits::ID_STATICTEXT6 = wxNewId();
const long Credits::ID_BITMAPBUTTON5 = wxNewId();
const long Credits::ID_BITMAPBUTTON6 = wxNewId();
const long Credits::ID_STATICTEXT8 = wxNewId();
const long Credits::ID_PANEL3 = wxNewId();
const long Credits::ID_NOTEBOOK1 = wxNewId();
const long Credits::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(Credits,wxDialog)
	//(*EventTable(Credits)
	//*)
END_EVENT_TABLE()

Credits::Credits(wxWindow* parent)
{
	//(*Initialize(Credits)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;
	
	Create(parent, wxID_ANY, _("A propos de Game Develop"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	SetClientSize(wxSize(271,351));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/gd-logo.png"))), wxDefaultPosition, wxDefaultSize, wxSIMPLE_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer1->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
	Panel1 = new wxPanel(Notebook1, ID_PANEL1, wxPoint(45,40), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer10->AddGrowableCol(0);
	FlexGridSizer10->AddGrowableRow(0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Game Develop"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	wxFont StaticText1Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText1->SetFont(StaticText1Font);
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText4 = new wxStaticText(Panel1, ID_STATICTEXT4, _("a été créé par"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer3->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText2 = new wxStaticText(Panel1, ID_STATICTEXT2, _("Florian \"4ian\" Rival de"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer4->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText3 = new wxStaticText(Panel1, ID_STATICTEXT3, _("Compil Games"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	wxFont StaticText3Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText3->SetFont(StaticText3Font);
	FlexGridSizer4->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 4);
	FlexGridSizer3->Add(FlexGridSizer4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer10->Add(FlexGridSizer3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxVERTICAL, Panel1, _("Aide et support"));
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	StaticText5 = new wxStaticText(Panel1, ID_STATICTEXT5, _("Support, aide, réponses aux suggestions sur notre site :"), wxDefaultPosition, wxSize(297,22), 0, _T("ID_STATICTEXT5"));
	FlexGridSizer5->Add(StaticText5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
	CompilGamesBt = new wxBitmapButton(Panel1, ID_BITMAPBUTTON1, wxBitmap(wxImage(_T("res/powered-cg.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON1"));
	FlexGridSizer9->Add(CompilGamesBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	DonBt = new wxBitmapButton(Panel1, ID_BITMAPBUTTON7, wxBitmap(wxImage(_T("res/don-logo.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON7"));
	DonBt->SetDefault();
	FlexGridSizer9->Add(DonBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer10->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer10);
	FlexGridSizer10->Fit(Panel1);
	FlexGridSizer10->SetSizeHints(Panel1);
	Panel2 = new wxPanel(Notebook1, ID_PANEL2, wxPoint(62,2), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer11->AddGrowableCol(0);
	FlexGridSizer11->AddGrowableRow(0);
	TextCtrl1 = new wxTextCtrl(Panel2, ID_TEXTCTRL1, _("·Game Develop\n\nGame Develop est un freeware, il est donc totalement gratuit.\n\n-Vous pouvez utiliser le logiciel pour n\'importe quelle utilisation, personnelle ou commerciale.\n-Le logiciel est livré \"tel quel\", sans aucune garantie.\n-Vous pouvez distribuer le logiciel tant que vous ne demandez pas d\'argent pour, que vous ne dites pas que vous en êtes l\'auteur, et tant que vous distribuez le logiciel entier avec son programme d\'installation.\n-Vous ne devez pas tenter de décompiler le programme.\n\n·Jeux créés avec Game Develop\n\n-L\'auteur de Game Develop n\'est aucunement lié aux jeux créés avec Game Develop.\n-Vous n\'êtes pas obligé de mentionner l\'utilisation de Game Develop dans votre jeu. Une mention sera appréciée, mais n\'est pas obligatoire.\n\n·Si vous avez des questions\n\nContactez l\'auteur : CompilGames@gmail.com\nAller sur le site officiel : http://www.compilgames.net"), wxDefaultPosition, wxSize(272,51), wxTE_MULTILINE|wxTE_READONLY, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer11->Add(TextCtrl1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel2->SetSizer(FlexGridSizer11);
	FlexGridSizer11->Fit(Panel2);
	FlexGridSizer11->SetSizeHints(Panel2);
	Panel3 = new wxPanel(Notebook1, ID_PANEL3, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	FlexGridSizer7->AddGrowableRow(4);
	StaticText7 = new wxStaticText(Panel3, ID_STATICTEXT7, _("Programmé en C++, compilé avec GCC, avec l\'aide de Code::Blocks"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer7->Add(StaticText7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer6->AddGrowableCol(1);
	CppBt = new wxBitmapButton(Panel3, ID_BITMAPBUTTON2, wxBitmap(wxImage(_T("res/powered-cpp.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON2"));
	FlexGridSizer6->Add(CppBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GccBt = new wxBitmapButton(Panel3, ID_BITMAPBUTTON3, wxBitmap(wxImage(_T("res/powered-gcc.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON3"));
	GccBt->SetDefault();
	FlexGridSizer6->Add(GccBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	CBBt = new wxBitmapButton(Panel3, ID_BITMAPBUTTON4, wxBitmap(wxImage(_T("res/powered-cb.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON4"));
	CBBt->SetDefault();
	FlexGridSizer6->Add(CBBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText6 = new wxStaticText(Panel3, ID_STATICTEXT6, _("Utilise les bibliothèques SFML et WxWidgets"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer7->Add(StaticText6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer8->AddGrowableCol(1);
	SFMLBt = new wxBitmapButton(Panel3, ID_BITMAPBUTTON5, wxBitmap(wxImage(_T("res/powered-sfml.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON5"));
	SFMLBt->SetDefault();
	FlexGridSizer8->Add(SFMLBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	WxBt = new wxBitmapButton(Panel3, ID_BITMAPBUTTON6, wxBitmap(wxImage(_T("res/powered-wx.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON6"));
	WxBt->SetDefault();
	FlexGridSizer8->Add(WxBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText8 = new wxStaticText(Panel3, ID_STATICTEXT8, _("Merci à toute la communauté et utilisateurs de Game Develop"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer7->Add(StaticText8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel3->SetSizer(FlexGridSizer7);
	FlexGridSizer7->Fit(Panel3);
	FlexGridSizer7->SetSizeHints(Panel3);
	Notebook1->AddPage(Panel1, _("A propos"), false);
	Notebook1->AddPage(Panel2, _("Licence"), false);
	Notebook1->AddPage(Panel3, _("Remerciements"), false);
	FlexGridSizer2->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->SetSizeHints(this);
	Center();
	
	Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnCompilGamesBtClick);
	Connect(ID_BITMAPBUTTON7,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnDonBtClick);
	Connect(ID_BITMAPBUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnCppBtClick);
	Connect(ID_BITMAPBUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnGccBtClick);
	Connect(ID_BITMAPBUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnCBBtClick);
	Connect(ID_BITMAPBUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnSFMLBtClick);
	Connect(ID_BITMAPBUTTON6,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnWxBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnOkBtClick);
	//*)

    string nbversion = GDLVersionWrapper::FullString();
    string status = GDLVersionWrapper::Status();
    string version ="Game Develop "+nbversion+" "+status+"";
	StaticText1->SetLabel(version);
	FlexGridSizer3->Layout();
}

Credits::~Credits()
{
	//(*Destroy(Credits)
	//*)
}


void Credits::OnOkBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void Credits::OnCppBtClick(wxCommandEvent& event)
{
    OpenLink("http://fr.wikipedia.org/wiki/C%2B%2B");
}

void Credits::OpenLink(wxString link)
{
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

void Credits::OnGccBtClick(wxCommandEvent& event)
{
    OpenLink("http://gcc.gnu.org/");
}

void Credits::OnCBBtClick(wxCommandEvent& event)
{
    OpenLink("http://www.codeblocks.org/");
}

void Credits::OnSFMLBtClick(wxCommandEvent& event)
{
    OpenLink("http://www.sfml-dev.org/index-fr.php");
}

void Credits::OnWxBtClick(wxCommandEvent& event)
{
    OpenLink("http://www.wxwidgets.org/");
}

void Credits::OnCompilGamesBtClick(wxCommandEvent& event)
{
    OpenLink("http://www.compilgames.net");
}

void Credits::OnDonBtClick(wxCommandEvent& event)
{
    OpenLink("http://www.compilgames.net/don.php");
}
