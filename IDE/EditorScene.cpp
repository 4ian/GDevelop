#include "EditorScene.h"

//(*InternalHeaders(EditorScene)
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/aui/aui.h>
#include <wx/toolbar.h>
#include <wx/config.h>
#include <wx/brush.h>
#include <wx/log.h>
#include <wx/dcclient.h>

#include "GDL/Game.h"
#include "GDL/RuntimeGame.h"
#include "GDL/ImageManager.h"
#include "Game_Develop_EditorMain.h"
#include "GDL/MainEditorCommand.h"
#include "SceneCanvas.h"
#include "GDL/ChooseObject.h"
#include "EditorEvents.h"
#include "GDL/HelpFileAccess.h"
#include "GridSetup.h"
#include "ChoixLayer.h"
#include "GDAuiTabArt.h"
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/toolbar.h>

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

//(*IdInit(EditorScene)
const long EditorScene::ID_PANEL2 = wxNewId();
const long EditorScene::ID_SCROLLBAR2 = wxNewId();
const long EditorScene::ID_SCROLLBAR1 = wxNewId();
const long EditorScene::ID_CUSTOM1 = wxNewId();
const long EditorScene::ID_PANEL4 = wxNewId();
const long EditorScene::ID_PANEL5 = wxNewId();
const long EditorScene::ID_PANEL1 = wxNewId();
const long EditorScene::ID_CUSTOM2 = wxNewId();
const long EditorScene::ID_PANEL6 = wxNewId();
const long EditorScene::ID_AUINOTEBOOK1 = wxNewId();
//*)
const long EditorScene::ID_REFRESHBUTTON = wxNewId();
const long EditorScene::ID_PLAYBUTTON = wxNewId();
const long EditorScene::ID_PAUSEBUTTON = wxNewId();
const long EditorScene::ID_EDITIONBUTTON = wxNewId();
const long EditorScene::ID_APERCUBUTTON = wxNewId();
const long EditorScene::ID_ORIGINEBUTTON = wxNewId();

const long EditorScene::ID_CHOISIROBJBUTTON = wxNewId();
const long EditorScene::ID_CHOISIRLAYERBUTTON = wxNewId();
const long EditorScene::ID_ZOOMINITBUTTON = wxNewId();
const long EditorScene::ID_GRIDBUTTON = wxNewId();
const long EditorScene::ID_GRIDSETUPBUTTON = wxNewId();

const long EditorScene::ID_DEBUGBUTTON = wxNewId();
const long EditorScene::ID_VARRAZBUTTON = wxNewId();

const long EditorScene::ID_OBJECTSEDITOR = wxNewId();
const long EditorScene::ID_LAYERSEDITOR = wxNewId();

const long EditorScene::idRibbonEditMode = wxNewId();
const long EditorScene::idRibbonPreviewMode = wxNewId();

const long EditorScene::idRibbonObjectsEditor = wxNewId();
const long EditorScene::idRibbonLayersEditor = wxNewId();
const long EditorScene::idRibbonChooseObject = wxNewId();
const long EditorScene::idRibbonChooseLayer = wxNewId();
const long EditorScene::idRibbonOrigine = wxNewId();
const long EditorScene::idRibbonOriginalZoom = wxNewId();
const long EditorScene::idRibbonGrid = wxNewId();
const long EditorScene::idRibbonGridSetup = wxNewId();

const long EditorScene::idRibbonRefresh = wxNewId();
const long EditorScene::idRibbonPlay = wxNewId();
const long EditorScene::idRibbonPlayWin = wxNewId();
const long EditorScene::idRibbonPause = wxNewId();
const long EditorScene::idRibbonResetGlobalVars = wxNewId();
const long EditorScene::idRibbonDebugger = wxNewId();

const long EditorScene::idRibbonHelp = wxNewId();



BEGIN_EVENT_TABLE(EditorScene,wxPanel)
	//(*EventTable(EditorScene)
	//*)
END_EVENT_TABLE()

EditorScene::EditorScene(wxWindow* parent, RuntimeGame & game_, Scene & scene_, const MainEditorCommand & mainEditorCommand_) :
scene(scene_),
game(game_),
mainEditorCommand(mainEditorCommand_),
externalWindow(this)
{
	//(*Initialize(EditorScene)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, 0, _T("wxID_ANY"));
	SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	notebook = new wxAuiNotebook(this, ID_AUINOTEBOOK1, wxDefaultPosition, wxDefaultSize, wxAUI_NB_TAB_SPLIT|wxAUI_NB_TAB_MOVE|wxAUI_NB_SCROLL_BUTTONS|wxAUI_NB_BOTTOM|wxNO_BORDER);
	scenePanel = new wxPanel(notebook, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxNO_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	scenePanel->SetBackgroundColour(wxColour(255,255,255));
	scenePanel->SetToolTip(_("Editer l\'aspect initial de la scène"));
	Panel2 = new wxPanel(scenePanel, ID_PANEL2, wxDefaultPosition, wxSize(112,0), wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	Core = new wxPanel(scenePanel, ID_PANEL5, wxDefaultPosition, wxDefaultSize, wxNO_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL5"));
	ScrollBar2 = new wxScrollBar(Core, ID_SCROLLBAR2, wxDefaultPosition, wxDefaultSize, wxSB_VERTICAL, wxDefaultValidator, _T("ID_SCROLLBAR2"));
	ScrollBar2->SetScrollbar(2500, 10, 5000, 10);
	ScrollBar1 = new wxScrollBar(Core, ID_SCROLLBAR1, wxDefaultPosition, wxDefaultSize, wxSB_HORIZONTAL, wxDefaultValidator, _T("ID_SCROLLBAR1"));
	ScrollBar1->SetScrollbar(2500, 10, 5000, 10);
	Panel4 = new wxPanel(Core, ID_PANEL4, wxDefaultPosition, wxSize(1,1), 0, _T("ID_PANEL4"));
	sceneCanvas = new SceneCanvas(Panel4, game, scene, mainEditorCommand, ID_CUSTOM1,wxPoint(0,0),wxDefaultSize, wxWANTS_CHARS | wxBORDER_SIMPLE);
	Panel5 = new wxPanel(notebook, ID_PANEL6, wxDefaultPosition, wxDefaultSize, wxNO_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL6"));
	Panel5->SetBackgroundColour(wxColour(255,255,255));
	Panel5->SetToolTip(_("Editer les évènements de la scène."));
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	eventsEditor = new EditorEvents(Panel5, game, scene, &scene.events, mainEditorCommand);
	FlexGridSizer3->Add(eventsEditor, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel5->SetSizer(FlexGridSizer3);
	FlexGridSizer3->Fit(Panel5);
	FlexGridSizer3->SetSizeHints(Panel5);
	notebook->AddPage(scenePanel, _("Scène"));
	notebook->AddPage(Panel5, _("Evènements"));
	FlexGridSizer1->Add(notebook, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Panel2->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorScene::OnPanel2Resize,0,this);
	Connect(ID_SCROLLBAR2,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorScene::OnScrollBar2Scroll);
	Connect(ID_SCROLLBAR2,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorScene::OnScrollBar2Scroll);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorScene::OnScrollBar1Scroll);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorScene::OnScrollBar1Scroll);
	sceneCanvas->Connect(wxEVT_SET_FOCUS,(wxObjectEventFunction)&EditorScene::OnsceneCanvasSetFocus,0,this);
	Panel4->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorScene::OnPanel4Resize,0,this);
	Core->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorScene::OnCoreResize,0,this);
	scenePanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorScene::OnscenePanelResize,0,this);
	Connect(ID_AUINOTEBOOK1,wxEVT_COMMAND_AUINOTEBOOK_PAGE_CHANGED,(wxObjectEventFunction)&EditorScene::OnnotebookPageChanged);
	//*)
    Connect(ID_REFRESHBUTTON,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorScene::OnRefreshBtClick);
    Connect(ID_APERCUBUTTON,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorScene::OnPreviewBtClick);
    Connect(ID_EDITIONBUTTON,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorScene::OnEditionBtClick);

    Connect(ID_ORIGINEBUTTON,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorScene::OnOrigineBtClick);
    Connect(ID_CHOISIROBJBUTTON,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorScene::OnChoisirObjetBtClick);
    Connect(ID_CHOISIRLAYERBUTTON,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorScene::OnChoisirLayerBtClick);
    Connect(ID_ZOOMINITBUTTON,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorScene::OnZoomInitBtClick);
    Connect(ID_GRIDBUTTON,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorScene::OnGridBtClick);
    Connect(ID_GRIDSETUPBUTTON,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorScene::OnGridSetupBtClick);

    Connect(ID_PLAYBUTTON,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorScene::OnPlayBtClick);
    Connect(ID_PAUSEBUTTON,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorScene::OnPauseBtClick);

    Connect(ID_OBJECTSEDITOR,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorScene::OnObjectsEditor);
    Connect(ID_LAYERSEDITOR,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorScene::OnLayersEditor);

    Connect(ID_DEBUGBUTTON,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorScene::OnDebugBtClick);

	//Initialisation des éditeurs
    objectsEditor = new EditorObjets(this, game, scene, &scene.initialObjects, mainEditorCommand);
    layersEditor = new EditorLayers(this, game, scene, &scene.initialLayers, mainEditorCommand);
    sceneCanvas->SetScrollbars(ScrollBar1, ScrollBar2);
    debugger = new DebuggerGUI(this, sceneCanvas->scene);
    sceneCanvas->scene.debugger = debugger;

    notebook->SetArtProvider(new GDAuiTabArt);
    notebook->SetPageBitmap(0, wxBitmap( "res/sceneeditor.png", wxBITMAP_TYPE_ANY ) );
    notebook->SetPageBitmap(1, wxBitmap( "res/eventicon.png", wxBITMAP_TYPE_ANY ) );

    //notify wxAUI which frame to use
    m_mgr.SetManagedWindow( this );
    Game_Develop_EditorFrame::LoadSkin(&m_mgr);

    m_mgr.AddPane( notebook, wxAuiPaneInfo().Name( wxT( "ESCenter" ) ).Center().CloseButton( false ).Caption( _( "Editeur de scène" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(false) );
    m_mgr.AddPane( objectsEditor, wxAuiPaneInfo().Name( wxT( "EO" ) ).Right().CloseButton( true ).Caption( _( "Editeur d'objets" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(208, 100) );
    m_mgr.AddPane( layersEditor, wxAuiPaneInfo().Name( wxT( "EL" ) ).Float().CloseButton( true ).Caption( _( "Editeur de calques" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(200, 100).Show(false) );
    m_mgr.AddPane( debugger, wxAuiPaneInfo().Name( wxT( "DBG" ) ).Float().CloseButton( true ).Caption( _( "Debugger" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(200, 100).Show(false) );

    toolbar = new wxToolBar( Panel2, -1, wxDefaultPosition, wxDefaultSize,
                                   wxTB_FLAT | wxTB_NODIVIDER );
    SetToolbarEdition();

    CreateToolsBar(mainEditorCommand.GetRibbonSceneEditorButtonBar(), sceneCanvas->scene.editing);
    mainEditorCommand.GetRibbon()->SetActivePage(3);
    ConnectEvents();

    m_mgr.Update();
    sceneCanvas->Reload();
}

/**
 * Static method for creating the ribbon's page used by Images Editors
 */
wxRibbonButtonBar* EditorScene::CreateRibbonPage(wxRibbonPage * page)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    bool hideLabels = false;
    pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Mode"), wxBitmap("res/view24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonEditMode, !hideLabels ? _("Edition") : "", wxBitmap("res/edit24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonPreviewMode, !hideLabels ? _("Aperçu") : "", wxBitmap("res/view24.png", wxBITMAP_TYPE_ANY));
    }

    wxRibbonPanel *toolsPanel = new wxRibbonPanel(page, wxID_ANY, _("Outils"), wxBitmap("res/tools24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
    wxRibbonButtonBar *toolsBar = new wxRibbonButtonBar(toolsPanel, wxID_ANY);
    EditorScene::CreateToolsBar(toolsBar, true); //Create an initial tool bar

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Aide"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonHelp, !hideLabels ? _("Aide") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
    }

    return toolsBar; //Returned to the mainEditor, and will then be passed to Scene Editors with MainEditorCommand
}

void EditorScene::CreateToolsBar(wxRibbonButtonBar * bar, bool editing)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    bool hideLabels = false;
    pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );

    bar->ClearButtons();

    if ( editing )
    {
        bar->AddButton(idRibbonObjectsEditor, !hideLabels ? _("Editeur d'objets") : "", wxBitmap("res/objeticon24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonLayersEditor, !hideLabels ? _("Editeur de calques") : "", wxBitmap("res/layers24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonChooseObject, !hideLabels ? _("Choisir un objet") : "", wxBitmap("res/addobjet24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonChooseLayer, !hideLabels ? _("Choisir un calque") : "", wxBitmap("res/selectlayer24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonOrigine, !hideLabels ? _("Revenir à l'origine") : "", wxBitmap("res/center24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonOriginalZoom, !hideLabels ? _("Zoom initial") : "", wxBitmap("res/zoom24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonGrid, !hideLabels ? _("Grille") : "", wxBitmap("res/grid24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonGridSetup, !hideLabels ? _("Editer la grille") : "", wxBitmap("res/gridedit24.png", wxBITMAP_TYPE_ANY));
    }
    else
    {
        bar->AddButton(idRibbonRefresh, !hideLabels ? _("Rafraichir") : "", wxBitmap("res/refreshicon24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonPlay, !hideLabels ? _("Jouer") : "", wxBitmap("res/starticon24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonPlayWin, !hideLabels ? _("Jouer dans une fenêtre") : "", wxBitmap("res/startwindow24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonPause, !hideLabels ? _("Pause") : "", wxBitmap("res/pauseicon24.png", wxBITMAP_TYPE_ANY));
        //bar->AddButton(idRibbonResetGlobalVars, !hideLabels ? _("Effacer variables gbl.") : "", wxBitmap("res/resetVar24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonDebugger, !hideLabels ? _("Debugger") : "", wxBitmap("res/bug24.png", wxBITMAP_TYPE_ANY));
    }

    bar->Realize();
}

void EditorScene::ConnectEvents()
{
    mainEditorCommand.GetMainEditor()->Connect(idRibbonEditMode, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorScene::OnEditionBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonPreviewMode, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorScene::OnPreviewBtClick, NULL, this);

    mainEditorCommand.GetMainEditor()->Connect(idRibbonObjectsEditor, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorScene::OnObjectsEditor, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonLayersEditor, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorScene::OnLayersEditor, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonChooseObject, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorScene::OnChoisirObjetBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonChooseLayer, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorScene::OnChoisirLayerBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonOrigine, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorScene::OnOrigineBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonOriginalZoom, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorScene::OnZoomInitBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonGrid, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorScene::OnGridBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonGridSetup, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorScene::OnGridSetupBtClick, NULL, this);

    mainEditorCommand.GetMainEditor()->Connect(idRibbonRefresh, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorScene::OnRefreshBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonPlay, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorScene::OnPlayBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonPlayWin, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorScene::OnPlayWindowBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonPause, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorScene::OnPauseBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonDebugger, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorScene::OnDebugBtClick, NULL, this);
}

/**
 * Update the size of the toolbar
 */
void EditorScene::OnPanel2Resize(wxSizeEvent& event)
{
    toolbar->SetSize(Panel2->GetSize().x, -1);
}

void EditorScene::OnscenePanelResize(wxSizeEvent& event)
{
    //Manual resizing of toolbar's panel
    Panel2->SetSize(event.GetSize().GetX(), Panel2->GetSize().GetY());

    //Manual resizing of scene's panel
    Core->SetSize(0, Panel2->GetSize().GetY(), event.GetSize().GetX(), event.GetSize().GetY()-Panel2->GetSize().GetY());
}

void EditorScene::OnCoreResize(wxSizeEvent& event)
{
    UpdateScenePanelSize(event.GetSize().GetX(), event.GetSize().GetY());
}

void EditorScene::OnPanel4Resize(wxSizeEvent& event)
{
    UpdateSceneCanvasSize(event.GetSize().GetX(), event.GetSize().GetY());
}

/**
 * Update the size and position of the panel containing the scene, and the scrollbars
 */
void EditorScene::UpdateScenePanelSize(int parentPanelWidht, int parentPanelHeight)
{
    if ( sceneCanvas->scene.editing )
    {
        //Manual placement of scrollbars
        ScrollBar1->Show(true);
        ScrollBar2->Show(true);

        ScrollBar1->SetSize(0, parentPanelHeight-ScrollBar1->GetSize().GetY(),
                            parentPanelWidht-ScrollBar2->GetSize().GetX(), wxDefaultCoord);
        ScrollBar2->SetSize(parentPanelWidht-ScrollBar2->GetSize().GetX(), 0,
                            wxDefaultCoord, parentPanelHeight-ScrollBar1->GetSize().GetY());

        //In edition mode, panel containing the scene must not use scrollbars space.
        Panel4->SetSize(parentPanelWidht-ScrollBar2->GetSize().GetX(), parentPanelHeight-ScrollBar1->GetSize().GetY());

    }
    else
    {
        //Hide scrollbars
        ScrollBar1->Show(false);
        ScrollBar2->Show(false);

        //In preview mode, panel containing the scene can take all the space
        Panel4->SetSize(parentPanelWidht, parentPanelHeight);
    }
}

/**
 * Update the size and position of the canvas displaying the scene
 */
void EditorScene::UpdateSceneCanvasSize(int parentPanelWidht, int parentPanelHeight)
{
    if ( sceneCanvas->scene.editing )
    {
        //Scene takes all the space available in edition mode.
        sceneCanvas->Window::SetSize(parentPanelWidht, parentPanelHeight);
        sceneCanvas->wxWindowBase::SetSize(0,0, parentPanelWidht, parentPanelHeight);
        sceneCanvas->scene.view.SetSize(parentPanelWidht, parentPanelHeight);
    }
    else
    {
        //Scene has the size of the game's window size in preview mode.
        sceneCanvas->Window::SetSize(game.windowWidth, game.windowHeight);
        sceneCanvas->wxWindowBase::SetSize(game.windowWidth, game.windowHeight);

        externalWindow.SetSize(game.windowWidth, game.windowHeight);

        //Scene is centered in preview mode
        sceneCanvas->wxWindowBase::SetSize((parentPanelWidht-sceneCanvas->wxWindowBase::GetSize().GetX())/2,
                                            (parentPanelHeight-sceneCanvas->wxWindowBase::GetSize().GetY())/2,
                                            game.windowWidth, game.windowHeight);
    }
}

/**
 * Go in preview mode
 */
void EditorScene::OnPreviewBtClick( wxCommandEvent & event )
{
    sceneCanvas->scene.editing = false;
    sceneCanvas->scene.running = false;

    UpdateScenePanelSize(Core->GetSize().GetX(), Core->GetSize().GetY());

    debugger->Play();

    SetToolbarApercu();
    CreateToolsBar(mainEditorCommand.GetRibbonSceneEditorButtonBar(), false);
    mainEditorCommand.GetRibbonSceneEditorButtonBar()->Refresh();
}

/**
 * Go in edition mode
 */
void EditorScene::OnEditionBtClick( wxCommandEvent & event )
{
    sceneCanvas->scene.editing = true;
    sceneCanvas->scene.running = false;

    externalWindow.Show(false);

    sceneCanvas->scene.ChangeRenderWindow(sceneCanvas);

    UpdateScenePanelSize(Core->GetSize().GetX(), Core->GetSize().GetY());

    sceneCanvas->Reload();
    sceneCanvas->scene.RenderEdittimeScene(); //FIXME : Hack to make sure OpenGL Rendering is correct

    sceneCanvas->scene.ChangeRenderWindow(sceneCanvas);

    debugger->Pause();

    SetToolbarEdition();
    CreateToolsBar(mainEditorCommand.GetRibbonSceneEditorButtonBar(), true);
    mainEditorCommand.GetRibbonSceneEditorButtonBar()->Refresh();
}

EditorScene::~EditorScene()
{
	//(*Destroy(EditorScene)
	//*)
	m_mgr.UnInit();
	delete objectsEditor;
	delete layersEditor;
	delete debugger;
}

void EditorScene::SetToolbarEdition()
{
    toolbar->ClearTools();
    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( ID_EDITIONBUTTON, wxT( "Mode édition" ), wxBitmap( wxImage( "res/editicon.png" ) ), _("Passer en mode édition") );
    toolbar->AddTool( ID_APERCUBUTTON, wxT( "Mode aperçu" ), wxBitmap( wxImage( "res/viewicon.png" ) ), _("Passer en mode aperçu, pour tester la scène") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_OBJECTSEDITOR, wxT( "Editeur des objets" ), wxBitmap( wxImage( "res/objeticon.png" ) ), _("Afficher l'éditeur des objets de la scène") );
    toolbar->AddTool( ID_LAYERSEDITOR, wxT( "Editeur des calques" ), wxBitmap( wxImage( "res/layers16.png" ) ), _("Afficher l'éditeur des calques de la scène") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_CHOISIROBJBUTTON, wxT( "Choisir l'objet à ajouter" ), wxBitmap( wxImage( "res/addobjet.png" ) ), _("Choisir l'objet à ajouter par l'intermédiaire du double clic.") );
    toolbar->AddTool( ID_CHOISIRLAYERBUTTON, wxT( "Choisir le calque à éditer" ), wxBitmap( wxImage( "res/selectlayer.png" ) ), _("Choisir le calque sur lequel insérer l'objet.") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_ORIGINEBUTTON, wxT( "Origine" ), wxBitmap( wxImage( "res/center.png" ) ), _("Revenir à la position 0;0") );
    toolbar->AddTool( ID_ZOOMINITBUTTON, wxT( "Zoom initial" ), wxBitmap( wxImage( "res/zoom.png" ) ), _("Revenir au niveau de zoom initial") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_GRIDBUTTON, wxT( "Grille" ), wxBitmap( wxImage( "res/grid.png" ) ), _("Activer ou désactiver la grille") );
    toolbar->AddTool( ID_GRIDSETUPBUTTON, wxT( "Paramètre de la grille" ), wxBitmap( wxImage( "res/gridedit.png" ) ), _("Paramétrer la grille") );
    toolbar->Realize();

    //On vérifie si on est pas en mode simple.
    wxConfigBase * pConfig = wxConfigBase::Get();

    bool result = false;
    pConfig->Read("/ModeSimple", &result);

    if ( result )
    {
        toolbar->EnableTool(ID_REFRESHBUTTON, false);
    }

    //Obligatoire avec wxGTK, sinon la toolbar ne s'affiche pas
#ifdef __WXGTK__
    wxSize tbSize = toolbar->GetSize();
    gtk_widget_set_usize( toolbar->m_widget, tbSize.GetWidth(), tbSize.GetHeight() );
#endif
}

void EditorScene::SetToolbarApercu()
{
    toolbar->ClearTools();
    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( ID_EDITIONBUTTON, wxT( "Mode édition" ), wxBitmap( wxImage( "res/editicon.png" ) ), _("Mode édition") );
    toolbar->AddTool( ID_APERCUBUTTON, wxT( "Mode aperçu" ), wxBitmap( wxImage( "res/viewicon.png" ) ), _("Mode aperçu") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_REFRESHBUTTON, wxT( "Rafraichir" ), wxBitmap( wxImage( "res/refreshicon.png" ) ), _("Rafraichir") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_PLAYBUTTON, wxT( "Jouer" ), wxBitmap( wxImage( "res/starticon.png" ) ), _("Jouer") );
    toolbar->AddTool( ID_PAUSEBUTTON, wxT( "Pause" ), wxBitmap( wxImage( "res/pauseicon.png" ) ), _("Pause") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_VARRAZBUTTON, wxT( "Remise à zéro des variables globales" ), wxBitmap( wxImage( "res/varRAZ.png" ) ), _("Effacer toutes les variables globales actuelles du jeu") );
    toolbar->AddTool( ID_DEBUGBUTTON, wxT( "Debugger" ), wxBitmap( wxImage( "res/debuggericon.png" ) ), _("Afficher le debugger") );
    toolbar->Realize();

    //On vérifie si on est pas en mode simple.
    wxConfigBase * pConfig = wxConfigBase::Get();

    bool result = false;
    pConfig->Read("/ModeSimple", &result);

    if ( result )
    {
        toolbar->EnableTool(ID_REFRESHBUTTON, false);
        toolbar->EnableTool(ID_VARRAZBUTTON, false);
        toolbar->EnableTool(ID_DEBUGBUTTON, false);
    }

    //Obligatoire avec wxGTK, sinon la toolbar ne s'affiche pas
#ifdef __WXGTK__
    wxSize tbSize = toolbar->GetSize();
    gtk_widget_set_usize( toolbar->m_widget, tbSize.GetWidth(), tbSize.GetHeight() );
#endif
}


void EditorScene::Resize( int width, int height )
{
    if ( sceneCanvas != NULL )
        delete sceneCanvas;

	sceneCanvas = new SceneCanvas(Panel4, game, scene, mainEditorCommand, ID_CUSTOM1,wxPoint(0,0),wxSize(width, height), wxWANTS_CHARS | wxBORDER_SIMPLE);
    sceneCanvas->SetScrollbars(ScrollBar1, ScrollBar2);
    sceneCanvas->Reload();

	Refresh();
	Update();
	Layout();
}

void EditorScene::OnLayersEditor( wxCommandEvent & event )
{
    m_mgr.GetPane(layersEditor).Show();
    m_mgr.Update();
}

void EditorScene::OnObjectsEditor( wxCommandEvent & event )
{
    m_mgr.GetPane(objectsEditor).Show();
    m_mgr.Update();
}

void EditorScene::OnRefreshBtClick( wxCommandEvent & event )
{
    sceneCanvas->Reload();
}

////////////////////////////////////////////////////////////
/// Change la vue en fonction de la scrollbar, et agrandit celle ci si besoin.
////////////////////////////////////////////////////////////
void EditorScene::OnScrollBar2Scroll(wxScrollEvent& event)
{
    int position = event.GetPosition();

    int newY = position-(ScrollBar2->GetRange()/2)+(sceneCanvas->GetHeight()/2);
    sceneCanvas->scene.view.SetCenter( sceneCanvas->scene.view.GetCenter().x, newY);
}

////////////////////////////////////////////////////////////
/// Change la vue en fonction de la scrollbar, et agrandit celle ci si besoin.
////////////////////////////////////////////////////////////
void EditorScene::OnScrollBar1Scroll(wxScrollEvent& event)
{
    int position = event.GetPosition();

    int newX = position-(ScrollBar1->GetRange()/2)+(sceneCanvas->GetWidth()/2);
    sceneCanvas->scene.view.SetCenter( newX,  sceneCanvas->scene.view.GetCenter().y);
}

////////////////////////////////////////////////////////////
/// Retour aux coordonnées 0;0 de la scène
////////////////////////////////////////////////////////////
void EditorScene::OnOrigineBtClick(wxCommandEvent & event )
{
    sceneCanvas->scene.view.SetCenter( (sceneCanvas->GetWidth()/2),(sceneCanvas->GetHeight()/2));
}


////////////////////////////////////////////////////////////
/// Choisir un objet à ajouter
////////////////////////////////////////////////////////////
void EditorScene::OnChoisirObjetBtClick( wxCommandEvent & event )
{
    ChooseObject Dialog( this, game, scene, false );
    if ( Dialog.ShowModal() == 1 )
    {
        sceneCanvas->scene.objectToAdd = Dialog.objectChosen;
    }
}

////////////////////////////////////////////////////////////
/// Choisir le calque sur lequel ajouter l'objet
////////////////////////////////////////////////////////////
void EditorScene::OnChoisirLayerBtClick( wxCommandEvent & event )
{
    ChoixLayer Dialog( this, scene.initialLayers );
    if ( Dialog.ShowModal() == 1 )
    {
        sceneCanvas->scene.addOnLayer = Dialog.layerChosen;
    }
}

////////////////////////////////////////////////////////////
/// Retour au niveau de zoom 1:1
////////////////////////////////////////////////////////////
void EditorScene::OnZoomInitBtClick( wxCommandEvent & event )
{
    sceneCanvas->scene.view.SetSize(sceneCanvas->GetWidth(), sceneCanvas->GetHeight());
}

////////////////////////////////////////////////////////////
/// Activer/Desactiver la grille
////////////////////////////////////////////////////////////
void EditorScene::OnGridBtClick( wxCommandEvent & event )
{
    sceneCanvas->scene.grid = !sceneCanvas->scene.grid;
}

////////////////////////////////////////////////////////////
/// Activer/Desactiver la grille
////////////////////////////////////////////////////////////
void EditorScene::OnGridSetupBtClick( wxCommandEvent & event )
{
    GridSetup dialog(this, sceneCanvas->scene.gridWidth, sceneCanvas->scene.gridHeight, sceneCanvas->scene.snap, sceneCanvas->scene.gridR, sceneCanvas->scene.gridG, sceneCanvas->scene.gridB);
    dialog.ShowModal();
}

/**
 * Test scene in editor
 */
void EditorScene::OnPlayBtClick( wxCommandEvent & event )
{
    sceneCanvas->scene.running = true;
    sceneCanvas->scene.editing = false;

    externalWindow.Show(false);
    sceneCanvas->scene.ChangeRenderWindow(sceneCanvas);


    debugger->Play();
}

/**
 * Test scene in an external window
 */
void EditorScene::OnPlayWindowBtClick( wxCommandEvent & event )
{
    sceneCanvas->scene.running = true;
    sceneCanvas->scene.editing = false;

    externalWindow.Show(true);
    externalWindow.SetSize(sceneCanvas->GetWidth(), sceneCanvas->GetHeight());
    sceneCanvas->scene.ChangeRenderWindow(externalWindow.renderCanvas);

    sceneCanvas->scene.RenderAndStep(1);  //FIXME : Hack to make sure OpenGL Rendering is correct

    externalWindow.SetSize(sceneCanvas->GetWidth(), sceneCanvas->GetHeight());
    sceneCanvas->scene.ChangeRenderWindow(externalWindow.renderCanvas);

    debugger->Play();
}

////////////////////////////////////////////////////////////
/// Mettre la scène en pause
////////////////////////////////////////////////////////////
void EditorScene::OnPauseBtClick( wxCommandEvent & event )
{
    sceneCanvas->scene.running = false;
    sceneCanvas->scene.editing = false;

    debugger->Pause();
}

////////////////////////////////////////////////////////////
/// Afficher le debugger de la scène
////////////////////////////////////////////////////////////
void EditorScene::OnDebugBtClick( wxCommandEvent & event )
{
    m_mgr.GetPane(debugger).Show();
    m_mgr.Update();
}

void EditorScene::OnHelpBtClick( wxCommandEvent & event )
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(12);
}

/**
 * Update ribbon
 */
void EditorScene::OnnotebookPageChanged(wxAuiNotebookEvent& event)
{
    if ( notebook->GetPageText(notebook->GetSelection()) == _("Scène") )
    {
        CreateToolsBar(mainEditorCommand.GetRibbonSceneEditorButtonBar(), sceneCanvas->scene.editing);
        mainEditorCommand.GetRibbon()->SetActivePage(3);
        ConnectEvents();
    }
    else if ( notebook->GetPageText(notebook->GetSelection()) == _("Evènements") )
    {
        mainEditorCommand.GetRibbon()->SetActivePage(4);
        eventsEditor->ConnectEvents();
    }
}

void EditorScene::OnsceneCanvasSetFocus(wxFocusEvent& event)
{
    CreateToolsBar(mainEditorCommand.GetRibbonSceneEditorButtonBar(), sceneCanvas->scene.editing);
    mainEditorCommand.GetRibbon()->SetActivePage(3);
    ConnectEvents();
}
