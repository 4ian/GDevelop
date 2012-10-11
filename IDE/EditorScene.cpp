/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "EditorScene.h"

//(*InternalHeaders(EditorScene)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/aui/aui.h>
#include <wx/toolbar.h>
#include <wx/config.h>
#include <wx/brush.h>
#include <wx/log.h>
#include <wx/dcclient.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/toolbar.h>

#include "GDCore/PlatformDefinition/Layout.h"
#include "GDL/Game.h"
#include "GDL/RuntimeGame.h"
#include "MainFrame.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "SceneCanvas.h"
#include "DebuggerGUI.h"
#include "EditorObjets.h"
#include "EditorLayers.h"
#include "InitialPositionBrowserDlg.h"
#include "ProfileDlg.h"
#include "GDCore/IDE/Dialogs/ChooseLayerDialog.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "EventsEditor.h"
#include "GridSetup.h"
#include "GDAuiTabArt.h"

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

//(*IdInit(EditorScene)
const long EditorScene::ID_SCROLLBAR2 = wxNewId();
const long EditorScene::ID_SCROLLBAR1 = wxNewId();
const long EditorScene::ID_CUSTOM1 = wxNewId();
const long EditorScene::ID_PANEL5 = wxNewId();
const long EditorScene::ID_CUSTOM2 = wxNewId();
const long EditorScene::ID_PANEL6 = wxNewId();
const long EditorScene::ID_AUINOTEBOOK1 = wxNewId();
//*)


BEGIN_EVENT_TABLE(EditorScene,wxPanel)
	//(*EventTable(EditorScene)
	//*)
END_EVENT_TABLE()

EditorScene::EditorScene(wxWindow* parent, gd::Project & project_, gd::Layout & layout_, const gd::MainFrameWrapper & mainFrameWrapper_) :
project(project_),
layout(layout_),
mainFrameWrapper(mainFrameWrapper_)
{
    //TODO: GD C++ Platform specific code
    try
    {
        Scene & scene = dynamic_cast<Scene&>(layout);
        Game & game = dynamic_cast<Game&>(project);
    }
    catch (...) { std::cout << "Scene editor is not adapted to arbitrary gd::Layout, GD will crash."; std::cout << char(7); /*Not a GD C++ Platform scene*/ }

    Scene & scene = dynamic_cast<Scene&>(layout);
    RuntimeGame & game = dynamic_cast<RuntimeGame&>(project);

	//(*Initialize(EditorScene)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, 0, _T("wxID_ANY"));
	SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	notebook = new wxAuiNotebook(this, ID_AUINOTEBOOK1, wxDefaultPosition, wxDefaultSize, wxAUI_NB_TAB_SPLIT|wxAUI_NB_TAB_MOVE|wxAUI_NB_SCROLL_BUTTONS|wxAUI_NB_BOTTOM|wxNO_BORDER);
	notebook->SetArtProvider(new GDAuiTabArt);
	scenePanel = new wxPanel(notebook, ID_PANEL5, wxDefaultPosition, wxDefaultSize, wxNO_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL5"));
	scenePanel->SetBackgroundColour(wxColour(255,255,255));
	scrollBar2 = new wxScrollBar(scenePanel, ID_SCROLLBAR2, wxDefaultPosition, wxDefaultSize, wxSB_VERTICAL, wxDefaultValidator, _T("ID_SCROLLBAR2"));
	scrollBar2->SetScrollbar(2500, 10, 5000, 10);
	scrollBar1 = new wxScrollBar(scenePanel, ID_SCROLLBAR1, wxDefaultPosition, wxDefaultSize, wxSB_HORIZONTAL, wxDefaultValidator, _T("ID_SCROLLBAR1"));
	scrollBar1->SetScrollbar(2500, 10, 5000, 10);
	sceneCanvas = new SceneCanvas(scenePanel, game, scene, scene.GetInitialInstances(), scene.GetAssociatedSceneCanvasSettings(), mainFrameWrapper);
	eventsPanel = new wxPanel(notebook, ID_PANEL6, wxDefaultPosition, wxDefaultSize, wxNO_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL6"));
	eventsPanel->SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	eventsEditor = new EventsEditor(eventsPanel, game, scene, &scene.GetEvents(), mainFrameWrapper);
	FlexGridSizer3->Add(eventsEditor, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	eventsPanel->SetSizer(FlexGridSizer3);
	FlexGridSizer3->Fit(eventsPanel);
	FlexGridSizer3->SetSizeHints(eventsPanel);
	notebook->AddPage(scenePanel, _("Scene"), false, wxBitmap(wxImage(_T("res/sceneeditor.png"))));
	notebook->AddPage(eventsPanel, _("Events"), false, wxBitmap(wxImage(_T("res/events16.png"))));
	FlexGridSizer1->Add(notebook, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_SCROLLBAR2,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorScene::OnScrollBar2Scroll);
	Connect(ID_SCROLLBAR2,wxEVT_SCROLL_THUMBTRACK,(wxObjectEventFunction)&EditorScene::OnScrollBar2Scroll);
	Connect(ID_SCROLLBAR2,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorScene::OnScrollBar2Scroll);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorScene::OnScrollBar1Scroll);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_THUMBTRACK,(wxObjectEventFunction)&EditorScene::OnScrollBar1Scroll);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorScene::OnScrollBar1Scroll);
	sceneCanvas->Connect(wxEVT_SET_FOCUS,(wxObjectEventFunction)&EditorScene::OnsceneCanvasSetFocus,0,this);
	scenePanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorScene::OnscenePanelResize,0,this);
	Connect(ID_AUINOTEBOOK1,wxEVT_COMMAND_AUINOTEBOOK_PAGE_CHANGED,(wxObjectEventFunction)&EditorScene::OnnotebookPageChanged);
	//*)

	//Prepare pane manager
    m_mgr.SetManagedWindow( this );

    //Create all editors linked to scene canvas.
    sceneCanvas->SetOwnedObjectsEditor( boost::shared_ptr<EditorObjets>(new EditorObjets(this, game, scene, mainFrameWrapper) ));
    sceneCanvas->SetOwnedLayersEditor( boost::shared_ptr<EditorLayers>(new EditorLayers(this, game, scene, mainFrameWrapper) ));
    sceneCanvas->SetOwnedDebugger( boost::shared_ptr<DebuggerGUI>(new DebuggerGUI(this, sceneCanvas->GetRuntimeScene()) ));
    sceneCanvas->SetOwnedExternalWindow( boost::shared_ptr<RenderDialog>(new RenderDialog(this, sceneCanvas) ));
    sceneCanvas->SetOwnedInitialPositionBrowser( boost::shared_ptr<InitialPositionBrowserDlg>(new InitialPositionBrowserDlg(this, scene.GetInitialInstances(), *sceneCanvas) ));
    sceneCanvas->SetOwnedProfileDialog( boost::shared_ptr<ProfileDlg>(new ProfileDlg(this) ));
    sceneCanvas->SetParentPanelAndDockManager( scenePanel, &m_mgr );
    sceneCanvas->SetScrollbars(scrollBar1, scrollBar2);
    sceneCanvas->Reload();

    eventsEditor->SetAssociatedSceneCanvas(sceneCanvas);

    //Display editors in panes
    m_mgr.AddPane( notebook, wxAuiPaneInfo().Name( wxT( "ESCenter" ) ).PaneBorder(false).Center().CloseButton( false ).Caption( _( "Scene's editor" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(false) );
    m_mgr.AddPane( sceneCanvas->GetOwnedObjectsEditor().get(), wxAuiPaneInfo().Name( wxT( "EO" ) ).Right().CloseButton( true ).Caption( _( "Objects' editor" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(208, 100) );
    m_mgr.AddPane( sceneCanvas->GetOwnedLayersEditor().get(), wxAuiPaneInfo().Name( wxT( "EL" ) ).Float().CloseButton( true ).Caption( _( "Layers' editor" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(200, 100).Show(false) );
    m_mgr.AddPane( sceneCanvas->GetOwnedDebugger().get(), wxAuiPaneInfo().Name( wxT( "DBG" ) ).Float().CloseButton( true ).Caption( _( "Debugger" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(200, 100).Show(false) );
    m_mgr.AddPane( sceneCanvas->GetOwnedInitialPositionBrowser().get(), wxAuiPaneInfo().Name( wxT( "IPB" ) ).Float().CloseButton( true ).Caption( _( "Initial positions of objects" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(200, 100).Show(false) );
    m_mgr.AddPane( sceneCanvas->GetOwnedProfileDialog().get(), wxAuiPaneInfo().Name( wxT( "PROFILER" ) ).Float().CloseButton( true ).Caption( _( "Profiling" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(50, 50).BestSize(230,100).Show(false) );

    //Load preferences
    {
        int position = 1;
        wxConfigBase::Get()->Read("/SceneEditor/SceneEventsTab", &position);
        if (position == 0)
        {
            long style = notebook->GetWindowStyleFlag();
            style |= wxAUI_NB_TOP;
            style &= ~wxAUI_NB_BOTTOM;
            notebook->SetWindowStyleFlag(style);
        }
    }

    MainFrame::LoadSkin(&m_mgr, notebook);

    mainFrameWrapper.GetRibbon()->SetActivePage(2);
    sceneCanvas->ConnectEvents();

    wxString perspective;
	wxConfigBase::Get()->Read("/SceneEditor/LastWorkspace", &perspective);
	m_mgr.LoadPerspective(perspective);

    m_mgr.Update();
}
void EditorScene::OnscenePanelResize(wxSizeEvent& event)
{
    //Manual resizing of scene's panel
    sceneCanvas->UpdateSize();

    scrollBar1->SetSize(0, scenePanel->GetSize().GetHeight()-scrollBar1->GetSize().GetHeight(), scenePanel->GetSize().GetWidth()-scrollBar2->GetSize().GetWidth(), scrollBar1->GetSize().GetHeight());
    scrollBar2->SetSize(scenePanel->GetSize().GetWidth()-scrollBar2->GetSize().GetWidth(), 0, scrollBar2->GetSize().GetWidth(), scenePanel->GetSize().GetHeight()-scrollBar1->GetSize().GetHeight());
}

EditorScene::~EditorScene()
{
	//(*Destroy(EditorScene)
	//*)

	wxConfigBase::Get()->Write("/SceneEditor/LastWorkspace", m_mgr.SavePerspective());
	m_mgr.UnInit();
}

////////////////////////////////////////////////////////////
/// Change la vue en fonction de la scrollbar, et agrandit celle ci si besoin.
////////////////////////////////////////////////////////////
void EditorScene::OnScrollBar2Scroll(wxScrollEvent& event)
{
    int position = event.GetPosition();

    int newY = position-(scrollBar2->GetRange()/2)+(sceneCanvas->GetHeight()/2);
    sceneCanvas->GetEditionView().SetCenter( sceneCanvas->GetEditionView().GetCenter().x, newY);

    sceneCanvas->ManualRefresh();
}

////////////////////////////////////////////////////////////
/// Change la vue en fonction de la scrollbar, et agrandit celle ci si besoin.
////////////////////////////////////////////////////////////
void EditorScene::OnScrollBar1Scroll(wxScrollEvent& event)
{
    int position = event.GetPosition();

    int newX = position-(scrollBar1->GetRange()/2)+(sceneCanvas->GetWidth()/2);
    sceneCanvas->GetEditionView().SetCenter( newX,  sceneCanvas->GetEditionView().GetCenter().y);

    sceneCanvas->ManualRefresh();
}

void EditorScene::ForceRefreshRibbonAndConnect()
{
    if ( notebook->GetPageText(notebook->GetSelection()) == _("Scene") )
    {
        sceneCanvas->CreateToolsBar(mainFrameWrapper.GetRibbonSceneEditorButtonBar(), sceneCanvas->IsEditing());
        mainFrameWrapper.GetRibbon()->SetActivePage(2);
        sceneCanvas->ConnectEvents();
    }
    else if ( notebook->GetPageText(notebook->GetSelection()) == _("Events") )
    {
        mainFrameWrapper.GetRibbon()->SetActivePage(3);
        eventsEditor->ConnectEvents();
    }
}

/**
 * Return true if the editor can be closed, false otherwise ( i.e. Scene is being previewed )
 */
bool EditorScene::CanBeClosed()
{
    if ( !sceneCanvas ) return true;

    return sceneCanvas->IsEditing();
}

/**
 * Update ribbon
 */
void EditorScene::OnnotebookPageChanged(wxAuiNotebookEvent& event)
{
    ForceRefreshRibbonAndConnect();
}

void EditorScene::OnsceneCanvasSetFocus(wxFocusEvent& event)
{
    sceneCanvas->CreateToolsBar(mainFrameWrapper.GetRibbonSceneEditorButtonBar(), sceneCanvas->IsEditing());
    mainFrameWrapper.GetRibbon()->SetActivePage(2);
    sceneCanvas->ConnectEvents();
}

