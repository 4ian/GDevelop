/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "ExternalLayoutEditor.h"

//(*InternalHeaders(ExternalLayoutEditor)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/config.h>
#include "../SceneCanvas.h"
#include "../Game_Develop_EditorMain.h"

//(*IdInit(ExternalLayoutEditor)
const long ExternalLayoutEditor::ID_STATICTEXT1 = wxNewId();
const long ExternalLayoutEditor::ID_COMBOBOX1 = wxNewId();
const long ExternalLayoutEditor::ID_PANEL1 = wxNewId();
const long ExternalLayoutEditor::ID_SCROLLBAR2 = wxNewId();
const long ExternalLayoutEditor::ID_SCROLLBAR1 = wxNewId();
const long ExternalLayoutEditor::ID_CUSTOM1 = wxNewId();
const long ExternalLayoutEditor::ID_PANEL5 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ExternalLayoutEditor,wxPanel)
	//(*EventTable(ExternalLayoutEditor)
	//*)
END_EVENT_TABLE()

ExternalLayoutEditor::ExternalLayoutEditor(wxWindow* parent, RuntimeGame & game_, gd::ExternalLayout & externalLayout_, const MainEditorCommand & mainEditorCommand_) :
externalLayout(externalLayout_),
game(game_),
mainEditorCommand(mainEditorCommand_)
{
	//(*Initialize(ExternalLayoutEditor)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	contextPanel = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	contextPanel->SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	FlexGridSizer2->AddGrowableRow(0);
	StaticText1 = new wxStaticText(contextPanel, ID_STATICTEXT1, _("Editer comme si les objets étaient inclus à la scène :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	parentSceneComboBox = new wxComboBox(contextPanel, ID_COMBOBOX1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, 0, 0, wxDefaultValidator, _T("ID_COMBOBOX1"));
	parentSceneComboBox->SetSelection( parentSceneComboBox->Append(_("Aucune scène")) );
	FlexGridSizer2->Add(parentSceneComboBox, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 3);
	contextPanel->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(contextPanel);
	FlexGridSizer2->SetSizeHints(contextPanel);
	FlexGridSizer1->Add(contextPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	scenePanel = new wxPanel(this, ID_PANEL5, wxDefaultPosition, wxDefaultSize, wxNO_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL5"));
	scenePanel->SetBackgroundColour(wxColour(255,255,255));
	scrollBar2 = new wxScrollBar(scenePanel, ID_SCROLLBAR2, wxDefaultPosition, wxDefaultSize, wxSB_VERTICAL, wxDefaultValidator, _T("ID_SCROLLBAR2"));
	scrollBar2->SetScrollbar(2500, 10, 5000, 10);
	scrollBar1 = new wxScrollBar(scenePanel, ID_SCROLLBAR1, wxDefaultPosition, wxDefaultSize, wxSB_HORIZONTAL, wxDefaultValidator, _T("ID_SCROLLBAR1"));
	scrollBar1->SetScrollbar(2500, 10, 5000, 10);
	sceneCanvas = new SceneCanvas(scenePanel, game, emptyScene, mainEditorCommand, ID_CUSTOM1,wxPoint(0,0),wxSize(800,600), wxWANTS_CHARS | wxBORDER_SIMPLE);
	FlexGridSizer3->Add(scenePanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_SCROLLBAR2,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&ExternalLayoutEditor::OnscrollBar2Scroll);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&ExternalLayoutEditor::OnscrollBar1Scroll);
	sceneCanvas->Connect(wxEVT_SET_FOCUS,(wxObjectEventFunction)&ExternalLayoutEditor::OnsceneCanvasSetFocus,0,this);
	scenePanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&ExternalLayoutEditor::OnscenePanelResize,0,this);
	Connect(wxEVT_SIZE,(wxObjectEventFunction)&ExternalLayoutEditor::OnResize);
	//*)
	//Prepare pane manager
    m_mgr.SetManagedWindow( this );

    //Create all editors linked to scene canvas.
    sceneCanvas->SetParentPanelAndDockManager( scenePanel, &m_mgr );
    sceneCanvas->SetScrollbars(scrollBar1, scrollBar2);

    //Display editors in panes
    m_mgr.AddPane( scenePanel, wxAuiPaneInfo().Name( wxT( "LayoutPanel" ) ).Center().CloseButton( false ).Caption( _( "Editeur de scène" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(false) );

    //Load preferences
    Game_Develop_EditorFrame::LoadSkin(&m_mgr, NULL);

    wxString perspective;
	wxConfigBase::Get()->Read("/ExternalLayoutEditor/LastWorkspace", &perspective);
	m_mgr.LoadPerspective(perspective);

    mainEditorCommand.GetRibbon()->SetActivePage(2);
    sceneCanvas->ConnectEvents();
    m_mgr.Update();
    sceneCanvas->Reload();
}

ExternalLayoutEditor::~ExternalLayoutEditor()
{
	//(*Destroy(ExternalLayoutEditor)
	//*)

	wxConfigBase::Get()->Write("/ExternalLayoutEditor/LastWorkspace", m_mgr.SavePerspective());
	m_mgr.UnInit();
}

void ExternalLayoutEditor::OnResize(wxSizeEvent& event)
{
    Layout();

    //We're managing ourselves the size:
    contextPanel->SetSize(GetSize().GetWidth(), contextPanel->GetSize().GetHeight());
    scenePanel->SetPosition(wxPoint(0,contextPanel->GetSize().GetHeight()));
    scenePanel->SetSize(GetSize().GetWidth(),GetSize().GetHeight()-contextPanel->GetSize().GetHeight());
}

void ExternalLayoutEditor::OnscenePanelResize(wxSizeEvent& event)
{
    //Manual resizing of scene's panel
    sceneCanvas->UpdateSize();

    scrollBar1->SetSize(0, scenePanel->GetSize().GetHeight()-scrollBar1->GetSize().GetHeight(), scenePanel->GetSize().GetWidth()-scrollBar2->GetSize().GetWidth(), scrollBar1->GetSize().GetHeight());
    scrollBar2->SetSize(scenePanel->GetSize().GetWidth()-scrollBar2->GetSize().GetWidth(), 0, scrollBar2->GetSize().GetWidth(), scenePanel->GetSize().GetHeight()-scrollBar1->GetSize().GetHeight());
}

void ExternalLayoutEditor::OnscrollBar2Scroll(wxScrollEvent& event)
{
    int position = event.GetPosition();

    int newY = position-(scrollBar2->GetRange()/2)+(sceneCanvas->GetHeight()/2);
    sceneCanvas->edittimeRenderer.view.SetCenter( sceneCanvas->edittimeRenderer.view.GetCenter().x, newY);

    sceneCanvas->ManualRefresh();
}

void ExternalLayoutEditor::OnscrollBar1Scroll(wxScrollEvent& event)
{
    int position = event.GetPosition();

    int newX = position-(scrollBar1->GetRange()/2)+(sceneCanvas->GetWidth()/2);
    sceneCanvas->edittimeRenderer.view.SetCenter( newX,  sceneCanvas->edittimeRenderer.view.GetCenter().y);

    sceneCanvas->ManualRefresh();
}

void ExternalLayoutEditor::ForceRefreshRibbonAndConnect()
{
    sceneCanvas->CreateToolsBar(mainEditorCommand.GetRibbonSceneEditorButtonBar(), sceneCanvas->edittimeRenderer.editing);
    mainEditorCommand.GetRibbon()->SetActivePage(2);
    sceneCanvas->ConnectEvents();
}

void ExternalLayoutEditor::OnsceneCanvasSetFocus(wxFocusEvent& event)
{
    sceneCanvas->CreateToolsBar(mainEditorCommand.GetRibbonSceneEditorButtonBar(), sceneCanvas->edittimeRenderer.editing);
    mainEditorCommand.GetRibbon()->SetActivePage(2);
    sceneCanvas->ConnectEvents();
}
