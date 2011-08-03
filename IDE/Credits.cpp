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
const long Credits::ID_HYPERLINKCTRL1 = wxNewId();
const long Credits::ID_STATICTEXT5 = wxNewId();
const long Credits::ID_BITMAPBUTTON1 = wxNewId();
const long Credits::ID_BITMAPBUTTON7 = wxNewId();
const long Credits::ID_PANEL1 = wxNewId();
const long Credits::ID_TEXTCTRL1 = wxNewId();
const long Credits::ID_PANEL2 = wxNewId();
const long Credits::ID_HTMLWINDOW1 = wxNewId();
const long Credits::ID_PANEL3 = wxNewId();
const long Credits::ID_STATICTEXT3 = wxNewId();
const long Credits::ID_BITMAPBUTTON8 = wxNewId();
const long Credits::ID_BITMAPBUTTON9 = wxNewId();
const long Credits::ID_BITMAPBUTTON10 = wxNewId();
const long Credits::ID_STATICTEXT8 = wxNewId();
const long Credits::ID_BITMAPBUTTON11 = wxNewId();
const long Credits::ID_BITMAPBUTTON2 = wxNewId();
const long Credits::ID_BITMAPBUTTON12 = wxNewId();
const long Credits::ID_BITMAPBUTTON3 = wxNewId();
const long Credits::ID_PANEL4 = wxNewId();
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
	wxGridSizer* GridSizer1;
	wxFlexGridSizer* FlexGridSizer13;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;

	Create(parent, wxID_ANY, _("A propos de Game Develop"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	SetClientSize(wxSize(271,351));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/gd-logo.png"))), wxDefaultPosition, wxDefaultSize, wxSIMPLE_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer1->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
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
	florianRival = new wxHyperlinkCtrl(Panel1, ID_HYPERLINKCTRL1, _("Florian \"4ian\" Rival"), _("http://www.florianrival.com"), wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	FlexGridSizer4->Add(florianRival, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(FlexGridSizer4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer10->Add(FlexGridSizer3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxVERTICAL, Panel1, _("Aide et support"));
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	StaticText5 = new wxStaticText(Panel1, ID_STATICTEXT5, _("Support, aide, réponses aux suggestions sur notre site :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer5->Add(StaticText5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
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
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	FlexGridSizer6->AddGrowableRow(0);
	HtmlWindow1 = new wxHtmlWindow(Panel3, ID_HTMLWINDOW1, wxDefaultPosition, wxDefaultSize, wxHW_SCROLLBAR_AUTO, _T("ID_HTMLWINDOW1"));
	HtmlWindow1->SetBorders(1);
	FlexGridSizer6->Add(HtmlWindow1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel3->SetSizer(FlexGridSizer6);
	FlexGridSizer6->Fit(Panel3);
	FlexGridSizer6->SetSizeHints(Panel3);
	Panel4 = new wxPanel(Notebook1, ID_PANEL4, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL4"));
	FlexGridSizer12 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer12->AddGrowableCol(0);
	StaticText3 = new wxStaticText(Panel4, ID_STATICTEXT3, _("Programmé en C++, compilé avec TDM-GCC, avec l\'aide de Code::Blocks"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer12->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer13 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer13->AddGrowableCol(1);
	BitmapButton1 = new wxBitmapButton(Panel4, ID_BITMAPBUTTON8, wxBitmap(wxImage(_T("res/powered-cpp.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON8"));
	FlexGridSizer13->Add(BitmapButton1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BitmapButton2 = new wxBitmapButton(Panel4, ID_BITMAPBUTTON9, wxBitmap(wxImage(_T("res/powered-gcc.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON9"));
	BitmapButton2->SetDefault();
	FlexGridSizer13->Add(BitmapButton2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BitmapButton3 = new wxBitmapButton(Panel4, ID_BITMAPBUTTON10, wxBitmap(wxImage(_T("res/powered-cb.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON10"));
	BitmapButton3->SetDefault();
	FlexGridSizer13->Add(BitmapButton3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText8 = new wxStaticText(Panel4, ID_STATICTEXT8, _("Game Develop utilise les bibliothèques SFML, LLVM, wxWidgets et TinyXml."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer12->Add(StaticText8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1 = new wxGridSizer(0, 4, 0, 0);
	BitmapButton4 = new wxBitmapButton(Panel4, ID_BITMAPBUTTON11, wxBitmap(wxImage(_T("res/powered-sfml.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON11"));
	BitmapButton4->SetDefault();
	GridSizer1->Add(BitmapButton4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BitmapButton6 = new wxBitmapButton(Panel4, ID_BITMAPBUTTON2, wxBitmap(wxImage(_T("res/powered-llvm.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON2"));
	BitmapButton6->SetDefault();
	GridSizer1->Add(BitmapButton6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BitmapButton5 = new wxBitmapButton(Panel4, ID_BITMAPBUTTON12, wxBitmap(wxImage(_T("res/powered-wx.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON12"));
	BitmapButton5->SetDefault();
	GridSizer1->Add(BitmapButton5, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	BitmapButton7 = new wxBitmapButton(Panel4, ID_BITMAPBUTTON3, wxBitmap(wxImage(_T("res/powered-tinyxml.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON3"));
	BitmapButton7->SetDefault();
	GridSizer1->Add(BitmapButton7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(GridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel4->SetSizer(FlexGridSizer12);
	FlexGridSizer12->Fit(Panel4);
	FlexGridSizer12->SetSizeHints(Panel4);
	Notebook1->AddPage(Panel1, _("A propos"), false);
	Notebook1->AddPage(Panel2, _("Licence"), false);
	Notebook1->AddPage(Panel3, _("Remerciements"), false);
	Notebook1->AddPage(Panel4, _("Technologies utilisées"), false);
	FlexGridSizer2->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnCompilGamesBtClick);
	Connect(ID_BITMAPBUTTON7,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnDonBtClick);
	Connect(ID_BITMAPBUTTON8,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnCppBtClick);
	Connect(ID_BITMAPBUTTON9,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnGccBtClick);
	Connect(ID_BITMAPBUTTON10,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnCBBtClick);
	Connect(ID_BITMAPBUTTON11,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnSFMLBtClick);
	Connect(ID_BITMAPBUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnLLVMBtClick);
	Connect(ID_BITMAPBUTTON12,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnWxBtClick);
	Connect(ID_BITMAPBUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnTinyXmlBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnOkBtClick);
	//*)

	//Be sure that my name has not been translated ;)
	florianRival->SetLabel("Florian \"4ian\" Rival");

    //Format Game Develop version
    string nbversion = GDLVersionWrapper::FullString();
    string status = GDLVersionWrapper::Status();
    string version ="Game Develop "+nbversion+" "+status+"";
	StaticText1->SetLabel(version);
	HtmlWindow1->SetPage("<html>\n<body>\n<h5>"+_("Contributeurs :")+"</h5><br>\n"+

                      _("François Dumortier : Conception du logo et graphismes divers.")
                      +"<br>( <a href=http://www.fdumortier.com>http://www.fdumortier.com</a> )"

                      +"\n<center><h5>"+_("Merci à toute la communauté et utilisateurs de Game Develop")+"</h5><br></center>\n</body>\n</html>");

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
    OpenLink("http://tdm-gcc.tdragon.net/");
}

void Credits::OnCBBtClick(wxCommandEvent& event)
{
    OpenLink("http://www.codeblocks.org/");
}

void Credits::OnSFMLBtClick(wxCommandEvent& event)
{
    OpenLink("http://www.sfml-dev.org");
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
    OpenLink(_("http://www.compilgames.net/\?file=kop8.php"));
}

void Credits::OnLLVMBtClick(wxCommandEvent& event)
{
    OpenLink(_("http://llvm.org/"));
}

void Credits::OnTinyXmlBtClick(wxCommandEvent& event)
{
    OpenLink(_("http://www.grinninglizard.com/tinyxml/"));
}
