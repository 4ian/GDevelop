/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
 #include "HelpViewerDlg.h"
//(*InternalHeaders(HelpViewerDlg)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "HtmlViewerPnl.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"

//(*IdInit(HelpViewerDlg)
const long HelpViewerDlg::ID_AUITOOLBARITEM1 = wxNewId();
const long HelpViewerDlg::ID_AUITOOLBARITEM2 = wxNewId();
const long HelpViewerDlg::ID_AUITOOLBARITEM4 = wxNewId();
const long HelpViewerDlg::ID_AUITOOLBARITEM3 = wxNewId();
const long HelpViewerDlg::ID_TEXTCTRL1 = wxNewId();
const long HelpViewerDlg::ID_AUITOOLBAR1 = wxNewId();
const long HelpViewerDlg::ID_PANEL1 = wxNewId();
const long HelpViewerDlg::ID_CUSTOM1 = wxNewId();
const long HelpViewerDlg::ID_TIMER1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(HelpViewerDlg,wxDialog)
	//(*EventTable(HelpViewerDlg)
	//*)
END_EVENT_TABLE()

HelpProvider * HelpProvider::_singleton = NULL;

HelpViewerDlg::HelpViewerDlg(wxWindow* parent, wxString url)
{
	//(*Initialize(HelpViewerDlg)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Game Develop - Online help"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxCLOSE_BOX|wxMAXIMIZE_BOX|wxMINIMIZE_BOX, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxNO_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxColour(255,255,255));
	AuiManager1 = new wxAuiManager(Panel1, wxAUI_MGR_DEFAULT);
	AuiToolBar1 = new wxAuiToolBar(Panel1, ID_AUITOOLBAR1, wxDefaultPosition, wxDefaultSize, wxAUI_TB_DEFAULT_STYLE);
	searchCtrl = new wxSearchCtrl(AuiToolBar1, ID_TEXTCTRL1, wxEmptyString, wxPoint(-49,-5), wxSize(500,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	searchCtrl->SetToolTip(_("Enter a keyword to perform an search in the online help"));
	AuiToolBar1->AddTool(ID_AUITOOLBARITEM1, _("Previous page"), wxBitmap(wxImage(_T("res/left16.png"))), wxNullBitmap, wxITEM_NORMAL, _("Previous page"), wxEmptyString, NULL);
	AuiToolBar1->AddTool(ID_AUITOOLBARITEM2, _("Next page"), wxBitmap(wxImage(_T("res/right16.png"))), wxNullBitmap, wxITEM_NORMAL, _("Next page"), wxEmptyString, NULL);
	AuiToolBar1->AddSeparator();
	AuiToolBar1->AddTool(ID_AUITOOLBARITEM4, _("Go back to the table of content of the help"), wxBitmap(wxImage(_T("res/helpContent16.png"))), wxNullBitmap, wxITEM_NORMAL, _("Go back to the table of content of the help"), wxEmptyString, NULL);
	AuiToolBar1->AddTool(ID_AUITOOLBARITEM3, _("Go back to the home page of the wiki"), wxBitmap(wxImage(_T("res/home16.png"))), wxNullBitmap, wxITEM_NORMAL, _("Go back to the home page of the wiki"), wxEmptyString, NULL);
	AuiToolBar1->AddSeparator();
	AuiToolBar1->AddControl(searchCtrl, wxEmptyString);
	AuiToolBar1->Realize();
	AuiManager1->AddPane(AuiToolBar1, wxAuiPaneInfo().Name(_T("PaneName")).ToolbarPane().Caption(_("Pane caption")).Layer(10).Top().DockFixed().Floatable(false).Movable(false).Gripper(false));
	AuiManager1->Update();
	FlexGridSizer2->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	htmlViewerPanel = new HtmlViewerPnl(this,ID_CUSTOM1,wxDefaultPosition,wxDefaultSize);
	FlexGridSizer1->Add(htmlViewerPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	searchTimer.SetOwner(this, ID_TIMER1);
	searchTimer.Start(725, false);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_AUITOOLBARITEM1,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&HelpViewerDlg::OnpreviousItemBtClick);
	Connect(ID_AUITOOLBARITEM2,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&HelpViewerDlg::OnnextItemBtClick);
	Connect(ID_AUITOOLBARITEM4,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&HelpViewerDlg::OncontentsItemBtClick);
	Connect(ID_AUITOOLBARITEM3,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&HelpViewerDlg::OnhomeItemBtClick);
	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&HelpViewerDlg::OnsearchCtrlTextEnter);
	Connect(ID_TIMER1,wxEVT_TIMER,(wxObjectEventFunction)&HelpViewerDlg::OnsearchTimerTrigger);
	//*)

    gd::SkinHelper::ApplyCurrentSkin(*AuiToolBar1);
	SetSize(1024,640);
	htmlViewerPanel->OpenURL(url);
	searchCtrl->SetDescriptiveText(_("Type a word to search in the online help"));
	AuiToolBar1->Realize(); //Needed on linux to display the toolbar.
}

HelpViewerDlg::~HelpViewerDlg()
{
    AuiManager1->UnInit();
	//(*Destroy(HelpViewerDlg)
	//*)
}

void HelpViewerDlg::OpenURL(wxString url)
{
	htmlViewerPanel->OpenURL(url);
}

void HelpViewerDlg::OnpreviousItemBtClick(wxCommandEvent& event)
{
    htmlViewerPanel->GoBack();
}

void HelpViewerDlg::OnnextItemBtClick(wxCommandEvent& event)
{
    htmlViewerPanel->GoForward();
}

void HelpViewerDlg::OnhomeItemBtClick(wxCommandEvent& event)
{
	OpenURL(_("http://wiki.compilgames.net/doku.php/en/game_develop"));
}

void HelpViewerDlg::OncontentsItemBtClick(wxCommandEvent& event)
{
	OpenURL(_("http://wiki.compilgames.net/doku.php/en/game_develop/documentation"));
}

void HelpViewerDlg::OnsearchCtrlTextEnter(wxCommandEvent& event)
{
    searchTimer.Start(-1, true);
}

void HelpViewerDlg::OnsearchTimerTrigger(wxTimerEvent& event)
{
    searchTimer.Stop();
    if (  searchCtrl->GetValue().empty() ) return;

    wxString searchStr = searchCtrl->GetValue();
    searchStr.Replace(" ","+");
	OpenURL("http://wiki.compilgames.net/doku.php/start?do=search&id="+searchStr);
}
