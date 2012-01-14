#include "SetupCompilerToolchainDlg.h"

//(*InternalHeaders(SetupCompilerToolchainDlg)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/dirdlg.h>
#include <wx/config.h>
#include <wx/msgdlg.h>
#include "GDL/IDE/CompilerToolchainPathManager.h"

using namespace GDpriv;

//(*IdInit(SetupCompilerToolchainDlg)
const long SetupCompilerToolchainDlg::ID_STATICBITMAP2 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICTEXT1 = wxNewId();
const long SetupCompilerToolchainDlg::ID_PANEL1 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICLINE1 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICBITMAP1 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICTEXT5 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICBITMAP3 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICTEXT6 = wxNewId();
const long SetupCompilerToolchainDlg::ID_HYPERLINKCTRL2 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICBITMAP4 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICTEXT7 = wxNewId();
const long SetupCompilerToolchainDlg::ID_PANEL2 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICLINE3 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICTEXT2 = wxNewId();
const long SetupCompilerToolchainDlg::ID_TEXTCTRL1 = wxNewId();
const long SetupCompilerToolchainDlg::ID_BUTTON3 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICTEXT3 = wxNewId();
const long SetupCompilerToolchainDlg::ID_HYPERLINKCTRL1 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICTEXT4 = wxNewId();
const long SetupCompilerToolchainDlg::ID_TEXTCTRL2 = wxNewId();
const long SetupCompilerToolchainDlg::ID_BUTTON4 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICTEXT8 = wxNewId();
const long SetupCompilerToolchainDlg::ID_HYPERLINKCTRL3 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICTEXT9 = wxNewId();
const long SetupCompilerToolchainDlg::ID_TEXTCTRL3 = wxNewId();
const long SetupCompilerToolchainDlg::ID_BUTTON5 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICTEXT10 = wxNewId();
const long SetupCompilerToolchainDlg::ID_HYPERLINKCTRL4 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICTEXT11 = wxNewId();
const long SetupCompilerToolchainDlg::ID_TEXTCTRL4 = wxNewId();
const long SetupCompilerToolchainDlg::ID_BUTTON6 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICTEXT12 = wxNewId();
const long SetupCompilerToolchainDlg::ID_HYPERLINKCTRL5 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICTEXT13 = wxNewId();
const long SetupCompilerToolchainDlg::ID_TEXTCTRL5 = wxNewId();
const long SetupCompilerToolchainDlg::ID_BUTTON7 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICTEXT14 = wxNewId();
const long SetupCompilerToolchainDlg::ID_HYPERLINKCTRL6 = wxNewId();
const long SetupCompilerToolchainDlg::ID_STATICLINE2 = wxNewId();
const long SetupCompilerToolchainDlg::ID_BUTTON1 = wxNewId();
const long SetupCompilerToolchainDlg::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(SetupCompilerToolchainDlg,wxDialog)
	//(*EventTable(SetupCompilerToolchainDlg)
	//*)
END_EVENT_TABLE()

SetupCompilerToolchainDlg::SetupCompilerToolchainDlg(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size)
{
	//(*Initialize(SetupCompilerToolchainDlg)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer16;
	wxFlexGridSizer* FlexGridSizer19;
	wxFlexGridSizer* FlexGridSizer23;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer22;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer15;
	wxFlexGridSizer* FlexGridSizer18;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer21;
	wxFlexGridSizer* FlexGridSizer14;
	wxFlexGridSizer* FlexGridSizer20;
	wxFlexGridSizer* FlexGridSizer13;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Paramétrage de la compilation des sources C++"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap2 = new wxStaticBitmap(Panel1, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/source_cpp64.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer4->Add(StaticBitmap2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Afin de pouvoir compiler du code C++ pour les jeux, Game Develop nécessite des fichiers supplémentaires."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer4->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer4);
	FlexGridSizer4->Fit(Panel1);
	FlexGridSizer4->SetSizeHints(Panel1);
	FlexGridSizer1->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel2 = new wxPanel(this, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	Panel2->SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBitmap1 = new wxStaticBitmap(Panel2, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/downloadSDKScreen.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer9->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText5 = new wxStaticText(Panel2, ID_STATICTEXT5, _("Pour chaque fichier requis,\ntéléchargez le avec le lien indiqué."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT5"));
	FlexGridSizer9->Add(StaticText5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel2, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/uncompress32.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	FlexGridSizer10->Add(StaticBitmap3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText6 = new wxStaticText(Panel2, ID_STATICTEXT6, _("Une fois le téléchargement terminé,\ndécompressez le fichier avec un logiciel"), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT6"));
	FlexGridSizer10->Add(StaticText6, 1, wxTOP|wxLEFT|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl2 = new wxHyperlinkCtrl(Panel2, ID_HYPERLINKCTRL2, _("comme 7zip."), _("http://www.clubic.com/telecharger-fiche11161-7-zip.html"), wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL2"));
	FlexGridSizer10->Add(HyperlinkCtrl2, 1, wxBOTTOM|wxLEFT|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBitmap4 = new wxStaticBitmap(Panel2, ID_STATICBITMAP4, wxBitmap(wxImage(_T("res/fillFolderField.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP4"));
	FlexGridSizer11->Add(StaticBitmap4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText7 = new wxStaticText(Panel2, ID_STATICTEXT7, _("Relevez l\'emplacement où vous avez\ndecompressé le dossier et indiquez le ici."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT7"));
	FlexGridSizer11->Add(StaticText7, 1, wxTOP|wxLEFT|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel2->SetSizer(FlexGridSizer8);
	FlexGridSizer8->Fit(Panel2);
	FlexGridSizer8->SetSizeHints(Panel2);
	FlexGridSizer1->Add(Panel2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine3 = new wxStaticLine(this, ID_STATICLINE3, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE3"));
	FlexGridSizer1->Add(StaticLine3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5->AddGrowableCol(1);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Répertoire du compilateur GCC :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer5->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	gccDirEdit = new wxTextCtrl(this, ID_TEXTCTRL1, _("C:\\MinGW"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer5->Add(gccDirEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	browseGCC = new wxButton(this, ID_BUTTON3, _("Parcourir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer5->Add(browseGCC, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("Avant de spécifier le répertoire, "), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer7->Add(StaticText3, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("téléchargez le compilateur ici."), _("http://www.compilgames.net"), wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	FlexGridSizer7->Add(HyperlinkCtrl1, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer12 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer12->AddGrowableCol(1);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Répertoire de la bibliothèque SFML :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer12->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	sfmlDirEdit = new wxTextCtrl(this, ID_TEXTCTRL2, _("C:\\Libs\\SFML"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer12->Add(sfmlDirEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	browseSFMLBt = new wxButton(this, ID_BUTTON4, _("Parcourir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer12->Add(browseSFMLBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer13 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer14 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText8 = new wxStaticText(this, ID_STATICTEXT8, _("Avant de spécifier le répertoire, "), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer14->Add(StaticText8, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl3 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL3, _("téléchargez SFML ici."), _("http://www.compilgames.net"), wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL3"));
	FlexGridSizer14->Add(HyperlinkCtrl3, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer13->Add(FlexGridSizer14, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer15 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer15->AddGrowableCol(1);
	StaticText9 = new wxStaticText(this, ID_STATICTEXT9, _("Répertoire de la bibliothèque wxWidgets :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer15->Add(StaticText9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	wxDirEdit = new wxTextCtrl(this, ID_TEXTCTRL3, _("C:\\Libs\\wxWidgets"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	FlexGridSizer15->Add(wxDirEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	browseWxBt = new wxButton(this, ID_BUTTON5, _("Parcourir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON5"));
	FlexGridSizer15->Add(browseWxBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer15, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer16 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText10 = new wxStaticText(this, ID_STATICTEXT10, _("Avant de spécifier le répertoire, "), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT10"));
	FlexGridSizer17->Add(StaticText10, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl4 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL4, _("téléchargez wxWidgets ici."), _("http://www.compilgames.net"), wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL4"));
	FlexGridSizer17->Add(HyperlinkCtrl4, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer16->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer16, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer18 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer18->AddGrowableCol(1);
	StaticText11 = new wxStaticText(this, ID_STATICTEXT11, _("Répertoire de la bibliothèque Boost :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT11"));
	FlexGridSizer18->Add(StaticText11, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	boostDirEdit = new wxTextCtrl(this, ID_TEXTCTRL4, _("C:\\Libs\\Boost"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	FlexGridSizer18->Add(boostDirEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	browseBoostBt = new wxButton(this, ID_BUTTON6, _("Parcourir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON6"));
	FlexGridSizer18->Add(browseBoostBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer18, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer19 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer20 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText12 = new wxStaticText(this, ID_STATICTEXT12, _("Avant de spécifier le répertoire, "), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT12"));
	FlexGridSizer20->Add(StaticText12, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl5 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL5, _("téléchargez Boost ici."), _("http://www.compilgames.net"), wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL5"));
	FlexGridSizer20->Add(HyperlinkCtrl5, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer19->Add(FlexGridSizer20, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer19, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer21 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer21->AddGrowableCol(1);
	StaticText13 = new wxStaticText(this, ID_STATICTEXT13, _("Répertoire de la bibliothèque Game Develop Library :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT13"));
	FlexGridSizer21->Add(StaticText13, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	gdlDirEdit = new wxTextCtrl(this, ID_TEXTCTRL5, _("C:\\Libs\\GDL"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
	FlexGridSizer21->Add(gdlDirEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	browseGDLBt = new wxButton(this, ID_BUTTON7, _("Parcourir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON7"));
	FlexGridSizer21->Add(browseGDLBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer21, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer22 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer23 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText14 = new wxStaticText(this, ID_STATICTEXT14, _("Avant de spécifier le répertoire, "), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT14"));
	FlexGridSizer23->Add(StaticText14, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl6 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL6, _("téléchargez GDL ici."), _("http://www.compilgames.net"), wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL6"));
	FlexGridSizer23->Add(HyperlinkCtrl6, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer22->Add(FlexGridSizer23, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer22, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(okBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SetupCompilerToolchainDlg::OnbrowseGCCClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SetupCompilerToolchainDlg::OnbrowseSFMLBtClick);
	Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SetupCompilerToolchainDlg::OnbrowseWxBtClick);
	Connect(ID_BUTTON6,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SetupCompilerToolchainDlg::OnbrowseBoostBtClick);
	Connect(ID_BUTTON7,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SetupCompilerToolchainDlg::OnbrowseGDLBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SetupCompilerToolchainDlg::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SetupCompilerToolchainDlg::OncancelBtClick);
	//*)

	wxString gccBaseDir;
    wxConfigBase::Get()->Read("gccBaseDir", &gccBaseDir);
    gccDirEdit->SetValue(gccBaseDir);
	wxString sfmlBaseDir;
    wxConfigBase::Get()->Read("sfmlBaseDir", &sfmlBaseDir);
    sfmlDirEdit->SetValue(sfmlBaseDir);
	wxString wxWidgetsBaseDir;
    wxConfigBase::Get()->Read("wxWidgetsBaseDir", &wxWidgetsBaseDir);
    wxDirEdit->SetValue(wxWidgetsBaseDir);
	wxString boostBaseDir;
    wxConfigBase::Get()->Read("boostBaseDir", &boostBaseDir);
    boostDirEdit->SetValue(boostBaseDir);
	wxString gdlBaseDir;
    wxConfigBase::Get()->Read("gdlBaseDir", &gdlBaseDir);
    gdlDirEdit->SetValue(gdlBaseDir);
}

SetupCompilerToolchainDlg::~SetupCompilerToolchainDlg()
{
	//(*Destroy(SetupCompilerToolchainDlg)
	//*)
}


void SetupCompilerToolchainDlg::OnbrowseGCCClick(wxCommandEvent& event)
{
    wxDirDialog dialog(this, _("Choisissez le dossier où as été extrait GCC ( Le dossier est habituellement nommé MinGW )."));
    dialog.ShowModal();
    if ( !dialog.GetPath().empty() ) gccDirEdit->SetValue( dialog.GetPath() );
}

void SetupCompilerToolchainDlg::OnbrowseSFMLBtClick(wxCommandEvent& event)
{
    wxDirDialog dialog(this, _("Choisissez le dossier où as été extrait SFML ( Le dossier est habituellement nommé SFML )."));
    dialog.ShowModal();
    if ( !dialog.GetPath().empty() ) sfmlDirEdit->SetValue( dialog.GetPath() );
}

void SetupCompilerToolchainDlg::OnbrowseWxBtClick(wxCommandEvent& event)
{
    wxDirDialog dialog(this, _("Choisissez le dossier où as été extrait wxWidgets ( Le dossier est habituellement nommé wxWidgets )."));
    dialog.ShowModal();
    if ( !dialog.GetPath().empty() ) wxDirEdit->SetValue( dialog.GetPath() );
}

void SetupCompilerToolchainDlg::OnbrowseBoostBtClick(wxCommandEvent& event)
{
    wxDirDialog dialog(this, _("Choisissez le dossier où as été extrait Boost ( Le dossier est habituellement nommé Boost )."));
    dialog.ShowModal();
    if ( !dialog.GetPath().empty() ) boostDirEdit->SetValue( dialog.GetPath() );
}

void SetupCompilerToolchainDlg::OnbrowseGDLBtClick(wxCommandEvent& event)
{
    wxDirDialog dialog(this, _("Choisissez le dossier où as été extrait Game Develop Library ( Le dossier est habituellement nommé GDLSDK )."));
    dialog.ShowModal();
    if ( !dialog.GetPath().empty() ) gdlDirEdit->SetValue( dialog.GetPath() );
}

void SetupCompilerToolchainDlg::OnokBtClick(wxCommandEvent& event)
{
    wxConfigBase::Get()->Write("gccBaseDir", gccDirEdit->GetValue());
    wxConfigBase::Get()->Write("sfmlBaseDir", sfmlDirEdit->GetValue());
    wxConfigBase::Get()->Write("wxwidgetsBaseDir", wxDirEdit->GetValue());
    wxConfigBase::Get()->Write("boostBaseDir", boostDirEdit->GetValue());
    wxConfigBase::Get()->Write("gdlBaseDir", gdlDirEdit->GetValue());
    wxConfigBase::Get()->Write("gccCompilerExecutablePath", gccDirEdit->GetValue()+"/bin/mingw32-g++.exe");
    wxConfigBase::Get()->Write("wxwidgetsLibDir", wxDirEdit->GetValue()+"/lib/gcc_dll/");
    wxConfigBase::Get()->Write("wxwidgetsLibDir2", wxDirEdit->GetValue()+"/lib/gcc_dll/msw/");
    wxConfigBase::Get()->Write("wxwidgetsIncludeDir", wxDirEdit->GetValue()+"/include/");
    wxConfigBase::Get()->Write("wxwidgetsIncludeDir2", wxDirEdit->GetValue()+"/lib/gcc_dll/msw/");
    wxConfigBase::Get()->Write("sfmlLibDir", sfmlDirEdit->GetValue()+"/bin-mingw-release/lib/");
    wxConfigBase::Get()->Write("sfmlIncludeDir", sfmlDirEdit->GetValue()+"/include/");
    wxConfigBase::Get()->Write("boostIncludeDir", boostDirEdit->GetValue()+"/");
    wxConfigBase::Get()->Write("gdlIncludeDir", gdlDirEdit->GetValue()+"/GDL/");
    #if defined(RELEASE)
    wxConfigBase::Get()->Write("gdlLibDir", gdlDirEdit->GetValue()+"/IDE/bin/release");
    #elif defined(DEV)
    wxConfigBase::Get()->Write("gdlLibDir", gdlDirEdit->GetValue()+"/IDE/bin/dev");
    #elif defined(DEBUG)
    wxConfigBase::Get()->Write("gdlLibDir", gdlDirEdit->GetValue()+"/IDE/bin/debug");
    #endif

    std::string report;
    CompilerToolchainPathManager pathManager;
    if ( !pathManager.AllPathsAreValid(report) )
    {
        if ( wxMessageBox(_("Certaines bibliothèques ou outils semble manquer :\n\n")+report+"\n"+_("Utiliser quand même les répertoires indiqués ?"), _("Configuration incorrecte."), wxYES_NO | wxICON_EXCLAMATION, this) == wxNO )
            return;
    }

    EndModal(1);
}

void SetupCompilerToolchainDlg::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}
