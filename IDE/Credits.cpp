/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#include "Credits.h"

//(*InternalHeaders(Credits)
#include <wx/string.h>
#include <wx/intl.h>
#include <wx/font.h>
#include <wx/bitmap.h>
#include <wx/image.h>
//*)
#include <wx/mimetype.h> // mimetype support
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/VersionWrapper.h"
#include <string>
#include <vector>
#include <iostream>

using namespace std;

//(*IdInit(Credits)
const long Credits::ID_STATICBITMAP1 = wxNewId();
const long Credits::ID_STATICTEXT1 = wxNewId();
const long Credits::ID_STATICTEXT4 = wxNewId();
const long Credits::ID_HYPERLINKCTRL1 = wxNewId();
const long Credits::ID_STATICBITMAP2 = wxNewId();
const long Credits::ID_STATICTEXT5 = wxNewId();
const long Credits::ID_HYPERLINKCTRL2 = wxNewId();
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
const long Credits::ID_BITMAPBUTTON12 = wxNewId();
const long Credits::ID_BITMAPBUTTON3 = wxNewId();
const long Credits::ID_STATICTEXT6 = wxNewId();
const long Credits::ID_BITMAPBUTTON1 = wxNewId();
const long Credits::ID_BITMAPBUTTON5 = wxNewId();
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
	wxGridSizer* GridSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer2;
	wxGridSizer* GridSizer3;
	wxFlexGridSizer* FlexGridSizer11;
	wxGridSizer* GridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer12;

	Create(parent, wxID_ANY, _("About GDevelop"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/GD-logo.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer1->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
	Panel1 = new wxPanel(Notebook1, ID_PANEL1, wxPoint(45,40), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer10->AddGrowableCol(0);
	FlexGridSizer10->AddGrowableRow(0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("GDevelop"), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
	StaticText1->SetMinSize(wxSize(-1,-1));
	wxFont StaticText1Font(wxDEFAULT,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_BOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText1->SetFont(StaticText1Font);
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText4 = new wxStaticText(Panel1, ID_STATICTEXT4, _("was created by"), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT4"));
	FlexGridSizer3->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	florianRival = new wxHyperlinkCtrl(Panel1, ID_HYPERLINKCTRL1, _("Florian \"4ian\" Rival"), _("http://www.florianrival.com"), wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	FlexGridSizer4->Add(florianRival, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(FlexGridSizer4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer10->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 20);
	FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer7->AddGrowableRow(0);
	StaticBitmap2 = new wxStaticBitmap(Panel1, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/website16.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer7->Add(StaticBitmap2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText5 = new wxStaticText(Panel1, ID_STATICTEXT5, _("Contribute and get help on:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer7->Add(StaticText5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(Panel1, ID_HYPERLINKCTRL2, _("www.compilgames.net"), _("http://www.compilgames.net"), wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL2"));
	FlexGridSizer7->Add(HyperlinkCtrl1, 1, wxTOP|wxBOTTOM|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel1->SetSizer(FlexGridSizer10);
	FlexGridSizer10->Fit(Panel1);
	FlexGridSizer10->SetSizeHints(Panel1);
	Panel2 = new wxPanel(Notebook1, ID_PANEL2, wxPoint(62,2), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer11->AddGrowableCol(0);
	FlexGridSizer11->AddGrowableRow(0);
	TextCtrl1 = new wxTextCtrl(Panel2, ID_TEXTCTRL1, _("GDevelop is an open source software:\n\n  * The Core library, the native and HTML5 platforms and all extensions (respectively Core, GDCpp, GDJS and Extensions folders) are under the MIT license.\n  * The IDE (in the IDE folder) is licensed with GPL v3.\n  * The name, GDevelop, and its logo are the exclusive property of Florian Rival.\n\nAbout games created with GDevelop\n\nGames exported with GDevelop are based on the native and/or HTML5 platforms: these platforms are distributed under the MIT license, so that you can distribute, sell or do anything with the games you created with GDevelop. In particular, you are not forced to make your game open source."), wxDefaultPosition, wxSize(272,51), wxTE_MULTILINE|wxTE_READONLY, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer11->Add(TextCtrl1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel2->SetSizer(FlexGridSizer11);
	FlexGridSizer11->Fit(Panel2);
	FlexGridSizer11->SetSizeHints(Panel2);
	Panel3 = new wxPanel(Notebook1, ID_PANEL3, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	FlexGridSizer6->AddGrowableRow(0);
	HtmlWindow1 = new CustomHtmlWindow(Panel3, ID_HTMLWINDOW1, wxDefaultPosition, wxDefaultSize, wxHW_SCROLLBAR_AUTO, _T("ID_HTMLWINDOW1"));
	HtmlWindow1->SetBorders(1);
	FlexGridSizer6->Add(HtmlWindow1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel3->SetSizer(FlexGridSizer6);
	FlexGridSizer6->Fit(Panel3);
	FlexGridSizer6->SetSizeHints(Panel3);
	Panel4 = new wxPanel(Notebook1, ID_PANEL4, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL4"));
	FlexGridSizer12 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer12->AddGrowableCol(0);
	StaticText3 = new wxStaticText(Panel4, ID_STATICTEXT3, _("Programmed in C++, compiled with GCC, written with Sublime Text"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer12->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer2 = new wxGridSizer(0, 3, 0, 0);
	BitmapButton1 = new wxBitmapButton(Panel4, ID_BITMAPBUTTON8, wxBitmap(wxImage(_T("res/powered-cpp.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON8"));
	GridSizer2->Add(BitmapButton1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BitmapButton2 = new wxBitmapButton(Panel4, ID_BITMAPBUTTON9, wxBitmap(wxImage(_T("res/powered-gcc.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON9"));
	BitmapButton2->SetDefault();
	GridSizer2->Add(BitmapButton2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BitmapButton3 = new wxBitmapButton(Panel4, ID_BITMAPBUTTON10, wxBitmap(wxImage(_T("res/powered-st.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON10"));
	BitmapButton3->SetDefault();
	GridSizer2->Add(BitmapButton3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(GridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText8 = new wxStaticText(Panel4, ID_STATICTEXT8, _("Use SFML, wxWidgets and TinyXml libraries."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer12->Add(StaticText8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1 = new wxGridSizer(0, 3, 0, 0);
	BitmapButton4 = new wxBitmapButton(Panel4, ID_BITMAPBUTTON11, wxBitmap(wxImage(_T("res/powered-sfml.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON11"));
	BitmapButton4->SetDefault();
	GridSizer1->Add(BitmapButton4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BitmapButton5 = new wxBitmapButton(Panel4, ID_BITMAPBUTTON12, wxBitmap(wxImage(_T("res/powered-wx.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON12"));
	BitmapButton5->SetDefault();
	GridSizer1->Add(BitmapButton5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BitmapButton7 = new wxBitmapButton(Panel4, ID_BITMAPBUTTON3, wxBitmap(wxImage(_T("res/powered-tinyxml.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON3"));
	BitmapButton7->SetDefault();
	GridSizer1->Add(BitmapButton7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(GridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText6 = new wxStaticText(Panel4, ID_STATICTEXT6, _("The Web platform is written in Javascript and uses Pixi.js"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer12->Add(StaticText6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer3 = new wxGridSizer(0, 2, 0, 0);
	BitmapButton8 = new wxBitmapButton(Panel4, ID_BITMAPBUTTON1, wxBitmap(wxImage(_T("res/powered-js.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON1"));
	BitmapButton8->SetDefault();
	GridSizer3->Add(BitmapButton8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BitmapButton10 = new wxBitmapButton(Panel4, ID_BITMAPBUTTON5, wxBitmap(wxImage(_T("res/powered-pixijs.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON5"));
	BitmapButton10->SetDefault();
	GridSizer3->Add(BitmapButton10, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(GridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel4->SetSizer(FlexGridSizer12);
	FlexGridSizer12->Fit(Panel4);
	FlexGridSizer12->SetSizeHints(Panel4);
	Notebook1->AddPage(Panel1, _("About"), false);
	Notebook1->AddPage(Panel2, _("Licence"), false);
	Notebook1->AddPage(Panel3, _("Thanks"), false);
	Notebook1->AddPage(Panel4, _("Used technologies"), false);
	FlexGridSizer2->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	Connect(ID_BITMAPBUTTON8,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnCppBtClick);
	Connect(ID_BITMAPBUTTON9,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnGccBtClick);
	Connect(ID_BITMAPBUTTON10,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnCBBtClick);
	Connect(ID_BITMAPBUTTON11,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnSFMLBtClick);
	Connect(ID_BITMAPBUTTON12,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnWxBtClick);
	Connect(ID_BITMAPBUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnTinyXmlBtClick);
	Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnJSBtClick);
	Connect(ID_BITMAPBUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnPixiJsBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Credits::OnOkBtClick);
	//*)

	//Be sure that my name has not been translated ;)
	florianRival->SetLabel("Florian \"4ian\" Rival");

    //Format GDevelop version
    gd::String nbversion = gd::VersionWrapper::FullString();
    gd::String status = gd::VersionWrapper::Status();
    gd::String version ="GDevelop " + nbversion + " " + status + " (UTF8)";
	StaticText1->SetLabel(version);
	HtmlWindow1->SetPage(gd::String("<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" /></head>\n<body>\n<h5>"
					  +_("Contributors: (No special order)")+"</h5>\n"
                      +"<br>"
                      +_("Fran\303\247ois Dumortier : GDevelop logo design and website conception.")+"<br>"
                      +"( <a href=\"http://www.fdumortier.com\">http://www.fdumortier.com</a> )"+"<br>"
                      +"<br>"
                      +_("Victor Levasseur: Advanced XML, Tiled Sprite and Tile Map extensions and contributions to Physics Engine, Text object, Video object, Path behavior and Sound object extension.")+"<br>"
                      +"( <a href=\"http://www.victorlevasseur.com/\">http://www.victorlevasseur.com</a> )"+"<br>"
                      +"<br>"
                      +_("Constantine Shvetsov: Awesome design of icons")+"<br>"
                      +"<br>"
                      +_("Airvikar: Russian translation")+"<br>"
                      +"( <a href=\"http://ubuntu-wine.ru\">http://ubuntu-wine.ru</a> )"+"<br>"
                      +"<br>"
                      +_("Franco Maciel: Spanish translation")+"<br>"
                      +"<br>"
                      +_("MillionthVector : Graphics of various examples.")+"<br>"
                      +"( <a href=\"http://pixelhoot.x10.mx\">http://pixelhoot.x10.mx</a> )"+"<br>"
                      +"<br>"
                      +_("Diego Schiavon : English translation of the tutorial and Indiegogo Ubuntu contributor")+"<br>"
                      +"<br>"
                      +_("Thomas Flecy: Original Sound object extension")+"<br>"
                      +"<br>"
                      +_("Fernando Jos\303\251 Mart\303\255nez L\303\263pez : Spanish translation of the tutorial")+"<br>"
                      +"<br>"
                      +_("conceptgame : Indiegogo super contributor. Thanks!")+"<br>"
                      +"<br>"
                      +"<h5>"+_("Images and other icons:")+"</h5>\n"
                      +"<br>"
                      +_("Some icons came from Crystal Project Icons by Everaldo Coelho")+"<br>"
                      +"( <a href=\"http://www.everaldo.com\">http://www.everaldo.com</a> )"+"<br>"
                      +_("Some icons came from Fugue Icons by Yusuke Kamiyamane")+"<br>"
                      +"( <a href=\"http://p.yusukekamiyamane.com/\">http://p.yusukekamiyamane.com/</a> )"+"<br>"
                      +_("Some images of examples came from images pack by Daniel Cook")+"<br>"
                      +"( <a href=\"http://www.lostgarden.com\">http://www.lostgarden.com</a> )"+"<br>"
                      +_("Some images of examples came from images pack by Ari Feldman")+"<br>"
                      +"( <a href=\"http://www.widgetworx.com/widgetworx/portfolio/spritelib.html\">http://www.widgetworx.com/widgetworx/portfolio/spritelib.html</a> )"+"<br>"
                      +"<br>"
                      +"\n<center><h5>"+_("Thanks to all the community and users of GDevelop")+"</h5><br></center>\n</body>\n</html>"));

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
    OpenLink("http://en.wikipedia.org/wiki/C%2B%2B");
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
    wxString donateLink = _("http://www.compilgames.net/donate.php");
    if ( !donateLink.StartsWith("http://www.compilgames.net/") ) donateLink = "http://www.compilgames.net/donate.php";
    donateLink += "?utm_source=GD&utm_medium=AboutDialogLink&utm_campaign=paywhatyouwant";

    OpenLink(donateLink);
}

void Credits::OnLLVMBtClick(wxCommandEvent& event)
{
    OpenLink(_("http://clang.llvm.org/"));
}

void Credits::OnTinyXmlBtClick(wxCommandEvent& event)
{
    OpenLink(_("http://www.grinninglizard.com/tinyxml/"));
}

void Credits::OnBoostBtClick(wxCommandEvent& event)
{
    OpenLink(_("http://www.boost.org/"));
}


void Credits::OnJSBtClick(wxCommandEvent& event)
{
    OpenLink(_("https://en.wikipedia.org/wiki/JavaScript"));
}

void Credits::OnJQueryBtClick(wxCommandEvent& event)
{
    OpenLink(_("http://jquery.com/"));
}

void Credits::OnPixiJsBtClick(wxCommandEvent& event)
{
    OpenLink(_("http://www.pixijs.com/"));
}
