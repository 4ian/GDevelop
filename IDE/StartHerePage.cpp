#include "StartHerePage.h"

//(*InternalHeaders(StartHerePage)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/config.h>
#include <wx/dcclient.h>
#include <wx/dcbuffer.h>
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/CommonTools.h"
#include <wx/mimetype.h> // mimetype support
#include "MainFrame.h"

using namespace gd;

//(*IdInit(StartHerePage)
const long StartHerePage::ID_STATICBITMAP1 = wxNewId();
const long StartHerePage::ID_STATICTEXT2 = wxNewId();
const long StartHerePage::ID_STATICTEXT3 = wxNewId();
const long StartHerePage::ID_STATICBITMAP9 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL18 = wxNewId();
const long StartHerePage::ID_STATICBITMAP10 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL19 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL20 = wxNewId();
const long StartHerePage::ID_STATICTEXT5 = wxNewId();
const long StartHerePage::ID_STATICBITMAP5 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL3 = wxNewId();
const long StartHerePage::ID_STATICBITMAP6 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL4 = wxNewId();
const long StartHerePage::ID_STATICBITMAP7 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL15 = wxNewId();
const long StartHerePage::ID_STATICBITMAP16 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL1 = wxNewId();
const long StartHerePage::ID_STATICBITMAP17 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL2 = wxNewId();
const long StartHerePage::ID_STATICTEXT1 = wxNewId();
const long StartHerePage::ID_STATICBITMAP2 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL5 = wxNewId();
const long StartHerePage::ID_STATICBITMAP3 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL6 = wxNewId();
const long StartHerePage::ID_STATICBITMAP4 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL7 = wxNewId();
const long StartHerePage::ID_STATICBITMAP12 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL9 = wxNewId();
const long StartHerePage::ID_STATICBITMAP13 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL8 = wxNewId();
const long StartHerePage::ID_STATICBITMAP14 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL10 = wxNewId();
const long StartHerePage::ID_STATICBITMAP15 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL11 = wxNewId();
const long StartHerePage::ID_STATICTEXT4 = wxNewId();
const long StartHerePage::ID_STATICBITMAP11 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL21 = wxNewId();
const long StartHerePage::ID_STATICBITMAP8 = wxNewId();
const long StartHerePage::ID_HYPERLINKCTRL16 = wxNewId();
//*)

BEGIN_EVENT_TABLE(StartHerePage,wxPanel)
	//(*EventTable(StartHerePage)
	//*)
END_EVENT_TABLE()

StartHerePage::StartHerePage(wxWindow* parent, MainFrame & mainEditor_) :
mainEditor(mainEditor_)
{
	//(*Initialize(StartHerePage)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer8;
	wxBoxSizer* BoxSizer1;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer1 = new wxFlexGridSizer(3, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(2);
	FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer10->AddGrowableCol(0);
	FlexGridSizer10->AddGrowableRow(0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/GD-logo-simple.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer10->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer10, 1, wxTOP|wxBOTTOM|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer9->AddGrowableCol(0);
	FlexGridSizer9->AddGrowableRow(0);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Getting started"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	StaticText2->SetForegroundColour(wxColour(95,95,95));
	wxFont StaticText2Font(12,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText2->SetFont(StaticText2Font);
	FlexGridSizer4->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("To begin, use the project manager\nto add a scene ( right click on \"Scenes\" ).\nDouble click then on the new scene to edit it."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer4->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticBitmap9 = new wxStaticBitmap(this, ID_STATICBITMAP9, wxBitmap(wxImage(_T("res/modesimpleicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP9"));
	FlexGridSizer3->Add(StaticBitmap9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl6 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL18, _("Read Getting Started Guide"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL18"));
	FlexGridSizer3->Add(HyperlinkCtrl6, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap10 = new wxStaticBitmap(this, ID_STATICBITMAP10, wxBitmap(wxImage(_T("res/tutoicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP10"));
	FlexGridSizer3->Add(StaticBitmap10, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	HyperlinkCtrl7 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL19, _("Read the tutorial"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL19"));
	FlexGridSizer11->Add(HyperlinkCtrl7, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	secondTutoLink = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL20, _("( Spanish tutorial also available )"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL20"));
	FlexGridSizer11->Add(secondTutoLink, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4->Add(384,9,1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT5, _("Links"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	StaticText5->SetForegroundColour(wxColour(95,95,95));
	wxFont StaticText5Font(12,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText5->SetFont(StaticText5Font);
	FlexGridSizer4->Add(StaticText5, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticBitmap5 = new wxStaticBitmap(this, ID_STATICBITMAP5, wxBitmap(wxImage(_T("res/wikiicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP5"));
	FlexGridSizer7->Add(StaticBitmap5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl3 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL3, _("Access to wiki ( Knowledge base )"), _("http://www.wiki.compilgames.net"), wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL3"));
	FlexGridSizer7->Add(HyperlinkCtrl3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap6 = new wxStaticBitmap(this, ID_STATICBITMAP6, wxBitmap(wxImage(_T("res/community.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP6"));
	FlexGridSizer7->Add(StaticBitmap6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl4 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL4, _("Access to forum"), _("http://www.forum.compilgames.net"), wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL4"));
	FlexGridSizer7->Add(HyperlinkCtrl4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap7 = new wxStaticBitmap(this, ID_STATICBITMAP7, wxBitmap(wxImage(_T("res/paint.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP7"));
	FlexGridSizer7->Add(StaticBitmap7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	resourcesLink = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL15, _("Access to resources"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_LEFT|wxNO_BORDER, _T("ID_HYPERLINKCTRL15"));
	FlexGridSizer7->Add(resourcesLink, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap16 = new wxStaticBitmap(this, ID_STATICBITMAP16, wxBitmap(wxImage(_T("res/fb16.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP16"));
	FlexGridSizer7->Add(StaticBitmap16, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12 = new wxFlexGridSizer(0, 3, 0, 0);
	fbLink = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Facebook page"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_LEFT|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	FlexGridSizer12->Add(fbLink, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap17 = new wxStaticBitmap(this, ID_STATICBITMAP17, wxBitmap(wxImage(_T("res/gp16.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP17"));
	FlexGridSizer12->Add(StaticBitmap17, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	googleplusLink = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL2, _("Google+ page"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_LEFT|wxNO_BORDER, _T("ID_HYPERLINKCTRL2"));
	FlexGridSizer12->Add(googleplusLink, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer1->Add(FlexGridSizer4, 7, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Recent projects"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	StaticText1->SetForegroundColour(wxColour(95,95,95));
	wxFont StaticText1Font(13,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText1->SetFont(StaticText1Font);
	FlexGridSizer5->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticBitmap2 = new wxStaticBitmap(this, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/gdfile16.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer8->Add(StaticBitmap2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	recent1Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL5, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL5"));
	FlexGridSizer8->Add(recent1Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap3 = new wxStaticBitmap(this, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/gdfile16.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	FlexGridSizer8->Add(StaticBitmap3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	recent2Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL6, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL6"));
	FlexGridSizer8->Add(recent2Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap4 = new wxStaticBitmap(this, ID_STATICBITMAP4, wxBitmap(wxImage(_T("res/gdfile16.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP4"));
	FlexGridSizer8->Add(StaticBitmap4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	recent3Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL7, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL7"));
	FlexGridSizer8->Add(recent3Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap12 = new wxStaticBitmap(this, ID_STATICBITMAP12, wxBitmap(wxImage(_T("res/gdfile16.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP12"));
	FlexGridSizer8->Add(StaticBitmap12, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	recent4Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL9, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL9"));
	FlexGridSizer8->Add(recent4Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap13 = new wxStaticBitmap(this, ID_STATICBITMAP13, wxBitmap(wxImage(_T("res/gdfile16.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP13"));
	FlexGridSizer8->Add(StaticBitmap13, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	recent5Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL8, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL8"));
	FlexGridSizer8->Add(recent5Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap14 = new wxStaticBitmap(this, ID_STATICBITMAP14, wxBitmap(wxImage(_T("res/gdfile16.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP14"));
	FlexGridSizer8->Add(StaticBitmap14, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	recent6Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL10, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL10"));
	FlexGridSizer8->Add(recent6Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap15 = new wxStaticBitmap(this, ID_STATICBITMAP15, wxBitmap(wxImage(_T("res/gdfile16.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP15"));
	FlexGridSizer8->Add(StaticBitmap15, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	recent7Bt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL11, _("-"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL11"));
	FlexGridSizer8->Add(recent7Bt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5->Add(1,9,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Examples"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	StaticText4->SetForegroundColour(wxColour(95,95,95));
	wxFont StaticText4Font(12,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText4->SetFont(StaticText4Font);
	FlexGridSizer5->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap11 = new wxStaticBitmap(this, ID_STATICBITMAP11, wxBitmap(wxImage(_T("res/openicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP11"));
	FlexGridSizer2->Add(StaticBitmap11, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl9 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL21, _("Open examples"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_LEFT|wxNO_BORDER, _T("ID_HYPERLINKCTRL21"));
	FlexGridSizer2->Add(HyperlinkCtrl9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer1->Add(FlexGridSizer5, 3, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9->Add(BoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer9, 1, wxTOP|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 20);
	FlexGridSizer6 = new wxFlexGridSizer(0, 0, 0, 0);
	FlexGridSizer6->AddGrowableCol(1);
	FlexGridSizer6->AddGrowableRow(0);
	StaticBitmap8 = new wxStaticBitmap(this, ID_STATICBITMAP8, wxBitmap(wxImage(_T("res/donateicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP8"));
	FlexGridSizer6->Add(StaticBitmap8, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl5 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL16, _("If you like Game Develop, you can make a donation to the author."), _("http://www.compilgames.net/contactEN.html"), wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_LEFT|wxNO_BORDER, _T("ID_HYPERLINKCTRL16"));
	FlexGridSizer6->Add(HyperlinkCtrl5, 1, wxALL|wxALIGN_BOTTOM|wxALIGN_CENTER_HORIZONTAL, 5);
	FlexGridSizer1->Add(FlexGridSizer6, 1, wxALL|wxALIGN_BOTTOM|wxALIGN_CENTER_HORIZONTAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_HYPERLINKCTRL18,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::OnguideBtClick);
	Connect(ID_HYPERLINKCTRL19,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::OntutoBtClick);
	Connect(ID_HYPERLINKCTRL20,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::OnTutorial2BtClick);
	Connect(ID_HYPERLINKCTRL15,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::OnresourcesLinkClick);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::OnfbLinkClick);
	Connect(ID_HYPERLINKCTRL2,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::OngoogleplusLinkClick);
	Connect(ID_HYPERLINKCTRL5,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent1BtClick);
	Connect(ID_HYPERLINKCTRL6,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent2BtClick);
	Connect(ID_HYPERLINKCTRL7,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent3BtClick);
	Connect(ID_HYPERLINKCTRL9,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent4BtClick);
	Connect(ID_HYPERLINKCTRL8,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent5BtClick);
	Connect(ID_HYPERLINKCTRL10,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent6BtClick);
	Connect(ID_HYPERLINKCTRL11,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::Onrecent7BtClick);
	Connect(ID_HYPERLINKCTRL21,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&StartHerePage::OnopenExamplesLinkClick);
	//*)

    if ( _("( Spanish tutorial also available )") == "(-Insert the name of the second tutorial or a blank text-)" )
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
    {
        wxString result;
        wxConfigBase::Get()->Read( _T( "/Recent/0" ), &result );
        recent1Bt->SetLabel( wxFileName::FileName(result).GetFullName() );
    }
    {
        wxString result;
        wxConfigBase::Get()->Read( _T( "/Recent/1" ), &result );
        recent2Bt->SetLabel( wxFileName::FileName(result).GetFullName() );
    }
    {
        wxString result;
        wxConfigBase::Get()->Read( _T( "/Recent/2" ), &result );
        recent3Bt->SetLabel( wxFileName::FileName(result).GetFullName() );
    }
    {
        wxString result;
        wxConfigBase::Get()->Read( _T( "/Recent/3" ), &result );
        recent4Bt->SetLabel( wxFileName::FileName(result).GetFullName() );
    }
    {
        wxString result;
        wxConfigBase::Get()->Read( _T( "/Recent/4" ), &result );
        recent5Bt->SetLabel( wxFileName::FileName(result).GetFullName() );
    }
    {
        wxString result;
        wxConfigBase::Get()->Read( _T( "/Recent/5" ), &result );
        recent6Bt->SetLabel( wxFileName::FileName(result).GetFullName() );
    }
    {
        wxString result;
        wxConfigBase::Get()->Read( _T( "/Recent/6" ), &result );
        recent7Bt->SetLabel( wxFileName::FileName(result).GetFullName() );
    }
}

void StartHerePage::Onrecent1BtClick(wxCommandEvent& event)
{
    wxString result;
    wxConfigBase::Get()->Read( _T( "/Recent/0" ), &result );
    mainEditor.Open(gd::ToString(result));
}

void StartHerePage::Onrecent2BtClick(wxCommandEvent& event)
{
    wxString result;
    wxConfigBase::Get()->Read( _T( "/Recent/1" ), &result );
    mainEditor.Open(gd::ToString(result));
}

void StartHerePage::Onrecent3BtClick(wxCommandEvent& event)
{
    wxString result;
    wxConfigBase::Get()->Read( _T( "/Recent/2" ), &result );
    mainEditor.Open(gd::ToString(result));
}

void StartHerePage::Onrecent4BtClick(wxCommandEvent& event)
{
    wxString result;
    wxConfigBase::Get()->Read( _T( "/Recent/3" ), &result );
    mainEditor.Open(gd::ToString(result));
}

void StartHerePage::Onrecent5BtClick(wxCommandEvent& event)
{
    wxString result;
    wxConfigBase::Get()->Read( _T( "/Recent/4" ), &result );
    mainEditor.Open(gd::ToString(result));
}

void StartHerePage::Onrecent6BtClick(wxCommandEvent& event)
{
    wxString result;
    wxConfigBase::Get()->Read( _T( "/Recent/5" ), &result );
    mainEditor.Open(gd::ToString(result));
}

void StartHerePage::Onrecent7BtClick(wxCommandEvent& event)
{
    wxString result;
    wxConfigBase::Get()->Read( _T( "/Recent/6" ), &result );
    mainEditor.Open(gd::ToString(result));
}

void StartHerePage::OnguideBtClick(wxCommandEvent& event)
{
    if ( gd::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_FRENCH )
        gd::HelpFileAccess::GetInstance()->DisplaySection(16);
    else
        gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/edit_getstart"));
}

void StartHerePage::OntutoBtClick(wxCommandEvent& event)
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
    else
        wxLogMessage(_("Unable to launch the tutorial. Tutorials can be found in the directoy called \"Tutorial\", inside Game Develop directory."));
}

void StartHerePage::OnTutorial2BtClick(wxCommandEvent& event)
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

void StartHerePage::OnopenExamplesLinkClick(wxCommandEvent& event)
{
    #if defined(WINDOWS)
    wxString examplesDir = wxGetCwd()+"\\Examples";
    std::cout << examplesDir;
    #else
    wxString examplesDir = wxGetCwd()+"/Examples/";
    #endif

    wxFileDialog open( NULL, _( "Open an example" ), examplesDir, "", "\"Game Develop\" Game (*.gdg;*.jgd)|*.jgd;*.gdg" );
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

void StartHerePage::OnfbLinkClick(wxCommandEvent& event)
{
    wxString link = "http://www.facebook.com/GameDevelop";
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

void StartHerePage::OngoogleplusLinkClick(wxCommandEvent& event)
{
    wxString link = "http://plus.google.com/b/115765205668071442683/115765205668071442683/";
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

