/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "MemTrace.h"
extern MemTrace MemTracer;

//(*InternalHeaders(Game_Develop_EditorFrame)
#include <wx/bitmap.h>
#include <wx/icon.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "wx/aui/aui.h"
#include <wx/textctrl.h>
#include <wx/toolbar.h>
#include <wx/imaglist.h>
#include <wx/fileconf.h>
#include <wx/filename.h>
#include <wx/config.h>
#include <wx/msgdlg.h>
#include <wx/log.h>
#include <wx/fileconf.h>
#include <wx/artprov.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/gallery.h>
#include <wx/ribbon/toolbar.h>

#include <iostream>
#include <string>
#include <list>
#include <sstream>
#include "GDAuiTabArt.h"

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

#include "Game_Develop_EditorMain.h"
#include "GDL/CommonTools.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/EditorImages.h"
#include "GDL/ChooseObject.h"
#include "MyStatusBar.h"
#include "EditorObjets.h"
#include "EditorEvents.h"
#include "EditorScene.h"
#include "CodeEditor.h"
#include "EditorObjectList.h"
#include "DnDFileEditor.h"
#include "ConsoleManager.h"
#include "ProjectManager.h"
#include "StartHerePage.h"
#include "BuildToolsPnl.h"

//(*IdInit(Game_Develop_EditorFrame)
const long Game_Develop_EditorFrame::ID_PANEL3 = wxNewId();
const long Game_Develop_EditorFrame::ID_AUINOTEBOOK1 = wxNewId();
const long Game_Develop_EditorFrame::ID_PANEL1 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM1 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM8 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM2 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM3 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM4 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM5 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM6 = wxNewId();
const long Game_Develop_EditorFrame::ID_TIMER1 = wxNewId();
//*)
const long Game_Develop_EditorFrame::IDM_RECENTS = wxNewId();
const long Game_Develop_EditorFrame::idRibbonNew = wxNewId();
const long Game_Develop_EditorFrame::idRibbonOpen = wxNewId();
const long Game_Develop_EditorFrame::idRibbonSave = wxNewId();
const long Game_Develop_EditorFrame::idRibbonProjectsManager = wxNewId();
const long Game_Develop_EditorFrame::idRibbonSaveAs = wxNewId();
const long Game_Develop_EditorFrame::idRibbonSaveAll = wxNewId();
const long Game_Develop_EditorFrame::idRibbonPortable = wxNewId();
const long Game_Develop_EditorFrame::idRibbonCompil = wxNewId();
const long Game_Develop_EditorFrame::idRibbonImporter = wxNewId();
const long Game_Develop_EditorFrame::idRibbonEncoder = wxNewId();
const long Game_Develop_EditorFrame::idRibbonOptions = wxNewId();
const long Game_Develop_EditorFrame::idRibbonHelp = wxNewId();
const long Game_Develop_EditorFrame::idRibbonTuto = wxNewId();
const long Game_Develop_EditorFrame::idRibbonWiki = wxNewId();
const long Game_Develop_EditorFrame::idRibbonForum = wxNewId();
const long Game_Develop_EditorFrame::idRibbonUpdate = wxNewId();
const long Game_Develop_EditorFrame::idRibbonWebSite = wxNewId();
const long Game_Develop_EditorFrame::idRibbonCredits = wxNewId();
const long Game_Develop_EditorFrame::idRibbonStartPage = wxNewId();
const long Game_Develop_EditorFrame::idRibbonCppTools = wxNewId();


BEGIN_EVENT_TABLE( Game_Develop_EditorFrame, wxFrame )
    //(*EventTable(Game_Develop_EditorFrame)
    //*)
END_EVENT_TABLE()


/**
 * Constructor : Create window
 */
Game_Develop_EditorFrame::Game_Develop_EditorFrame( wxWindow* parent, string FileToOpen) :
gameCurrentlyEdited(0),
m_ribbon(NULL),
ribbonSceneEditorButtonBar(NULL),
buildToolsPnl(NULL)
{

    //(*Initialize(Game_Develop_EditorFrame)
    wxMenuItem* MenuItem1;
    wxMenuItem* MenuItem11;
    wxFlexGridSizer* FlexGridSizer2;
    wxMenuItem* MenuItem42;
    wxFlexGridSizer* FlexGridSizer8;
    wxMenuItem* MenuItem41;
    wxFlexGridSizer* FlexGridSizer1;
    wxMenuItem* MenuItem45;
    wxFlexGridSizer* ribbonSizer;

    Create(parent, wxID_ANY, _("Game Develop - Nouveau jeu"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_FRAME_STYLE, _T("wxID_ANY"));
    SetClientSize(wxSize(850,700));
    {
    	wxIcon FrameIcon;
    	FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/icon16.png"))));
    	SetIcon(FrameIcon);
    }
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(1);
    FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer8->AddGrowableCol(0);
    FlexGridSizer8->AddGrowableRow(0);
    ribbonPanel = new wxPanel(this, ID_PANEL3, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
    ribbonSizer = new wxFlexGridSizer(0, 1, 0, 0);
    ribbonSizer->AddGrowableCol(0);
    ribbonSizer->AddGrowableRow(0);
    ribbonPanel->SetSizer(ribbonSizer);
    ribbonSizer->Fit(ribbonPanel);
    ribbonSizer->SetSizeHints(ribbonPanel);
    FlexGridSizer8->Add(ribbonPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer1->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(629,484), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer2->AddGrowableCol(0);
    FlexGridSizer2->AddGrowableRow(0);
    editorsNotebook = new wxAuiNotebook(Panel1, ID_AUINOTEBOOK1, wxDefaultPosition, wxDefaultSize, wxAUI_NB_TAB_SPLIT|wxAUI_NB_TAB_MOVE|wxAUI_NB_SCROLL_BUTTONS|wxAUI_NB_TOP|wxNO_BORDER);
    FlexGridSizer2->Add(editorsNotebook, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Panel1->SetSizer(FlexGridSizer2);
    FlexGridSizer2->SetSizeHints(Panel1);
    FlexGridSizer1->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    MenuItem1 = new wxMenuItem((&openContextMenu), ID_MENUITEM1, _("Ouvrir un exemple"), wxEmptyString, wxITEM_NORMAL);
    openContextMenu.Append(MenuItem1);
    MenuItem45 = new wxMenuItem((&openContextMenu), ID_MENUITEM8, _("Importer un jeu"), wxEmptyString, wxITEM_NORMAL);
    MenuItem45->SetBitmap(wxBitmap(wxImage(_T("res/fusionicon.png"))));
    openContextMenu.Append(MenuItem45);
    wxMenu * contextMenuRecents =new wxMenu;
     openContextMenu.Append(IDM_RECENTS,_("Récemment ouvert"), contextMenuRecents);
    MenuItem10 = new wxMenuItem((&saveContextMenu), ID_MENUITEM2, _("Enregistrer sous..."), wxEmptyString, wxITEM_NORMAL);
    MenuItem10->SetBitmap(wxBitmap(wxImage(_T("res/saveasicon.png"))));
    saveContextMenu.Append(MenuItem10);
    MenuItem11 = new wxMenuItem((&saveContextMenu), ID_MENUITEM3, _("Enregistrer en version portable"), wxEmptyString, wxITEM_NORMAL);
    MenuItem11->SetBitmap(wxBitmap(wxImage(_T("res/portableicon.png"))));
    saveContextMenu.Append(MenuItem11);
    MenuItem41 = new wxMenuItem((&decomposerContextMenu), ID_MENUITEM4, _("Décomposer un GIF animé"), wxEmptyString, wxITEM_NORMAL);
    MenuItem41->SetBitmap(wxBitmap(wxImage(_T("res/importgif.png"))));
    decomposerContextMenu.Append(MenuItem41);
    MenuItem42 = new wxMenuItem((&decomposerContextMenu), ID_MENUITEM5, _("Décomposer un personnage RPG Maker"), wxEmptyString, wxITEM_NORMAL);
    MenuItem42->SetBitmap(wxBitmap(wxImage(_T("res/importrpgmaker.png"))));
    decomposerContextMenu.Append(MenuItem42);
    MenuItem43 = new wxMenuItem((&decomposerContextMenu), ID_MENUITEM6, _("Décomposer une feuille de sprite"), wxEmptyString, wxITEM_NORMAL);
    MenuItem43->SetBitmap(wxBitmap(wxImage(_T("res/spritesheet16.png"))));
    decomposerContextMenu.Append(MenuItem43);
    autoSaveTimer.SetOwner(this, ID_TIMER1);
    autoSaveTimer.Start(180000, false);
    FlexGridSizer1->SetSizeHints(this);
    Center();

    Connect(ID_AUINOTEBOOK1,wxEVT_COMMAND_AUINOTEBOOK_PAGE_CLOSE,(wxObjectEventFunction)&Game_Develop_EditorFrame::OneditorsNotebookPageClose);
    Connect(ID_AUINOTEBOOK1,wxEVT_COMMAND_AUINOTEBOOK_PAGE_CHANGED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnNotebook1PageChanged);
    Connect(ID_MENUITEM1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnOpenExampleSelected);
    Connect(ID_MENUITEM8,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuFusionSelected);
    Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuSaveAsSelected);
    Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuPortableSelected);
    Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnDecomposeGIFSelected);
    Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnDecomposeRPGSelected);
    Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnDecomposeSSSelected);
    Connect(ID_TIMER1,wxEVT_TIMER,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnautoSaveTimerTrigger);
    Connect(wxID_ANY,wxEVT_CLOSE_WINDOW,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnClose);
    //*)
    Connect( wxID_FILE1, wxID_FILE9, wxEVT_COMMAND_MENU_SELECTED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRecentClicked );
    Connect( idRibbonNew, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuNewSelected );
    Connect( idRibbonOpen, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuOpenSelected );
    Connect( idRibbonOpen, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonOpenDropDownClicked );
    Connect( idRibbonSave, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuSaveSelected );
    Connect( idRibbonSave, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonSaveDropDownClicked );
    Connect( idRibbonSaveAll, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonSaveAllClicked );
    Connect( idRibbonCompil, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuCompilationSelected );
    Connect( idRibbonProjectsManager, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnProjectsManagerClicked );
    Connect( idRibbonEncoder, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuItem23Selected );
    Connect( idRibbonImporter, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonDecomposerDropDownClicked );
    Connect( idRibbonOptions, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuPrefSelected );
    Connect( idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuAideSelected );
    Connect( idRibbonTuto, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuTutoSelected );
    Connect( idRibbonWiki, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuWikiSelected );
    Connect( idRibbonForum, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuForumSelected );
    Connect( idRibbonUpdate, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuItem36Selected );
    Connect( idRibbonWebSite, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuSiteSelected );
    Connect( idRibbonCredits, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnAbout );
    Connect( idRibbonStartPage, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonStartPageClicked );
    Connect( idRibbonCppTools, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonCppToolsClicked );

    SetDropTarget(new DnDFileEditor(*this));

    //Accès à la configuration
    wxConfigBase *pConfig = wxConfigBase::Get();

    //Deactivate menu
    SetMenuBar(NULL);

    //Prepare autosave
    PrepareAutosave();

    //Prepare recent list
    m_recentlist.SetMaxEntries( 9 );
    m_recentlist.SetAssociatedMenu( contextMenuRecents );
    for ( int i = 0;i < 9;i++ )
    {
        wxString result;
        pConfig->Read( wxString::Format( _T( "/Recent/%d" ), i ), &result );
        m_recentlist.Append( result );
    }

    //Create status bar
    MyStatusBar * myStatusBar = new MyStatusBar(this);
    myStatusBar->SetStatusText( "2008-2011 Compil Games", 1 );
    SetStatusBar(myStatusBar);

    //Ribbon setup
    long ribbonStyle = wxRIBBON_BAR_DEFAULT_STYLE;
    bool hidePageTabs = false;
    pConfig->Read( _T( "/Skin/HidePageTabs" ), &hidePageTabs );
    if ( hidePageTabs )
    {
        ribbonStyle &= ~wxRIBBON_BAR_SHOW_PAGE_LABELS;
    }
    m_ribbon = new wxRibbonBar(ribbonPanel, wxID_ANY, wxDefaultPosition, wxSize(-1, 75), ribbonStyle);
    bool hideLabels = false;
    pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );
    {

        wxRibbonPage* home = new wxRibbonPage(m_ribbon, wxID_ANY, _("Général"));

        wxRibbonPanel *filePanel = new wxRibbonPanel(home, wxID_ANY, _("Projets"), wxBitmap("res/openicon.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_EXT_BUTTON);
        wxRibbonButtonBar *file_bar = new wxRibbonButtonBar(filePanel, wxID_ANY);
        file_bar->AddButton(idRibbonNew, !hideLabels ? _("Nouveau") : "", wxBitmap("res/newicon24.png", wxBITMAP_TYPE_ANY));
        file_bar->AddHybridButton(idRibbonOpen, !hideLabels ? _("Ouvrir") : " ", wxBitmap("res/openicon24.png", wxBITMAP_TYPE_ANY));

        wxRibbonPanel *file2Panel = new wxRibbonPanel(home, wxID_ANY, _("Projet actuel"), wxBitmap("res/saveicon.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_EXT_BUTTON);
        wxRibbonButtonBar *file2_bar = new wxRibbonButtonBar(file2Panel, wxID_ANY);
        file2_bar->AddHybridButton(idRibbonSave, !hideLabels ? _("Enregistrer") : " ", wxBitmap("res/saveicon24.png", wxBITMAP_TYPE_ANY));
        file2_bar->AddButton(idRibbonSaveAll, !hideLabels ? _("Tout enregistrer") : " ", wxBitmap("res/save_all24.png", wxBITMAP_TYPE_ANY));
        file2_bar->AddButton(idRibbonCompil, !hideLabels ? _("Compilation") : "", wxBitmap("res/compilicon24.png", wxBITMAP_TYPE_ANY));

        wxRibbonPanel *affichagePanel = new wxRibbonPanel(home, wxID_ANY, _("Affichage"), wxBitmap("res/imageicon.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *affichage_bar = new wxRibbonButtonBar(affichagePanel, wxID_ANY);
        affichage_bar->AddButton(idRibbonProjectsManager, !hideLabels ? _("Projets") : "", wxBitmap("res/projectManager24.png", wxBITMAP_TYPE_ANY));
        affichage_bar->AddButton(idRibbonStartPage, !hideLabels ? _("Page de démarrage") : "", wxBitmap("res/startPage24.png", wxBITMAP_TYPE_ANY));
        affichage_bar->AddButton(idRibbonCppTools, !hideLabels ? _("Outils C++") : "", wxBitmap("res/source_cpp24.png", wxBITMAP_TYPE_ANY));

        wxRibbonPanel *toolsPanel = new wxRibbonPanel(home, wxID_ANY, _("Outils"), wxBitmap("res/tools24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *tools_bar = new wxRibbonButtonBar(toolsPanel, wxID_ANY);
        tools_bar->AddButton(idRibbonEncoder, !hideLabels ? _("Convertisseur") : "", wxBitmap("res/musicicon24.png", wxBITMAP_TYPE_ANY));
        tools_bar->AddDropdownButton(idRibbonImporter, !hideLabels ? _("Décomposeur") : "", wxBitmap("res/strip24.png", wxBITMAP_TYPE_ANY));

        wxRibbonPanel *optionsPanel = new wxRibbonPanel(home, wxID_ANY, _("Options"), wxBitmap("res/preficon.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *options_bar = new wxRibbonButtonBar(optionsPanel, wxID_ANY);
        options_bar->AddButton(idRibbonOptions, !hideLabels ? _("Préférences") : "", wxBitmap("res/pref24.png", wxBITMAP_TYPE_ANY));

        wxRibbonPanel *helpPanel = new wxRibbonPanel(home, wxID_ANY, _("Aide et support"), wxBitmap("res/helpicon.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *help_bar = new wxRibbonButtonBar(helpPanel, wxID_ANY);
        help_bar->AddButton(idRibbonHelp, !hideLabels ? _("Aide") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
        help_bar->AddButton(idRibbonTuto, !hideLabels ? _("Tutoriel") : "", wxBitmap("res/tutoicon24.png", wxBITMAP_TYPE_ANY));
        help_bar->AddButton(idRibbonWiki, !hideLabels ? _("Wiki") : "", wxBitmap("res/wiki.png", wxBITMAP_TYPE_ANY));
        help_bar->AddButton(idRibbonForum, !hideLabels ? _("Communauté") : "", wxBitmap("res/forumicon24.png", wxBITMAP_TYPE_ANY));

        wxRibbonPanel *creditsPanel = new wxRibbonPanel(home, wxID_ANY, _("A propos"), wxBitmap("res/icon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *credits_bar = new wxRibbonButtonBar(creditsPanel, wxID_ANY);
        credits_bar->AddButton(idRibbonUpdate, !hideLabels ? _("Mise à jour") : "", wxBitmap("res/maj24.png", wxBITMAP_TYPE_ANY));
        credits_bar->AddButton(idRibbonWebSite, !hideLabels ? _("Site officiel") : "", wxBitmap("res/siteicon24.png", wxBITMAP_TYPE_ANY));
        credits_bar->AddButton(idRibbonCredits, !hideLabels ? _("A propos...") : "", wxBitmap("res/icon24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Projets"));
        ProjectManager::CreateRibbonPage(ribbonEditorPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Banque d'images"));
        EditorImages::CreateRibbonPage(ribbonEditorPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Scène"));
        ribbonSceneEditorButtonBar = SceneCanvas::CreateRibbonPage(ribbonEditorPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Evènements"));
        EditorEvents::CreateRibbonPage(ribbonEditorPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Objets"));
        EditorObjectList::CreateRibbonPage(ribbonEditorPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Groupes"));
        EditorObjetsGroups::CreateRibbonPage(ribbonEditorPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Code"));
        CodeEditor::CreateRibbonPage(ribbonEditorPage);
    }
    ribbonSizer->Add(m_ribbon, 0, wxEXPAND);

    //Load wxAUI
    m_mgr.SetManagedWindow( this );

    LoadSkin(&m_mgr);
    LoadSkin(m_ribbon);

    editorsNotebook->SetArtProvider(new GDAuiTabArt());

    //Create start page
    startPage = new StartHerePage(editorsNotebook, *this);
    editorsNotebook->AddPage(startPage, _("Page de démarrage"));

    //Create project manager
    projectManager = new ProjectManager(this, *this);
    projectManager->ConnectEvents();

    buildToolsPnl = new BuildToolsPnl(this, projectManager);

    m_mgr.AddPane( projectManager, wxAuiPaneInfo().Name( wxT( "PM" ) ).Caption( _( "Gestionnaire de projets" ) ).Left().MaximizeButton( true ).MinimizeButton( false ).MinSize(170,100) );
    m_mgr.AddPane( Panel1, wxAuiPaneInfo().Name( wxT( "EP" ) ).Caption( _( "Editeur principal" ) ).Center().CaptionVisible(false).CloseButton( false ).MaximizeButton( true ).MinimizeButton( false ) );
    m_mgr.AddPane( ribbonPanel, wxAuiPaneInfo().Name( wxT( "RP" ) ).Caption( _( "Ruban" ) ).Top().PaneBorder(false).CaptionVisible(false).Movable(false).Floatable(false).CloseButton( false ).MaximizeButton( false ).MinimizeButton( false ).MinSize(1, 107).Resizable(false) );
    m_mgr.AddPane( buildToolsPnl, wxAuiPaneInfo().Name( wxT( "CT" ) ).Caption( _( "Outils de compilations" ) ).Bottom().MaximizeButton( true ).MinimizeButton( false ).Show(false).MinSize(120,130));

    wxString result;
    pConfig->Read( _T( "/Workspace/Actuel" ), &result );
    if ( result != "" )
        m_mgr.LoadPerspective( result , true );

    if ( !hideLabels )
        m_mgr.GetPane(ribbonPanel).MinSize(1, 107);
    else
        m_mgr.GetPane(ribbonPanel).MinSize(1, 100);

    m_mgr.SetFlags( wxAUI_MGR_ALLOW_FLOATING | wxAUI_MGR_ALLOW_ACTIVE_PANE | wxAUI_MGR_TRANSPARENT_HINT
                    | wxAUI_MGR_TRANSPARENT_DRAG | wxAUI_MGR_HINT_FADE | wxAUI_MGR_NO_VENETIAN_BLINDS_FADE );

    m_mgr.Update();
    UpdateNotebook();
    m_ribbon->Realize();

    SetSize(900,740);
    Center();
    Maximize(true);

    if ( !FileToOpen.empty() )
        Open(FileToOpen);
    else
    {
        games.push_back(boost::shared_ptr<RuntimeGame>(new RuntimeGame));
        projectManager->Refresh();
    }
}

/**
 * Destructor : Uninit
 */
Game_Develop_EditorFrame::~Game_Develop_EditorFrame()
{
    //(*Destroy(Game_Develop_EditorFrame)
    //*)

    //Deinitialize the frame manager
    m_mgr.UnInit();
}

/** Change current game
  */
void Game_Develop_EditorFrame::SetCurrentGame(unsigned int i)
{
    gameCurrentlyEdited = i;
    if ( i >= games.size())
    {
        wxString GD = "Game Develop";
        SetTitle( GD );
    }
    else
    {
        wxString GD = "Game Develop";
        SetTitle( GD + " - [" + games[i]->name + "] "+games[i]->gameFile );
    }

    return;
}

void Game_Develop_EditorFrame::UpdateNotebook()
{
    editorsNotebook->SetWindowStyleFlag(wxAUI_NB_TOP | wxAUI_NB_TAB_SPLIT | wxAUI_NB_TAB_MOVE | wxAUI_NB_SCROLL_BUTTONS | wxNO_BORDER );
}

/**
 * Show project manager
 */
void Game_Develop_EditorFrame::OnProjectsManagerClicked(wxRibbonButtonBarEvent& evt)
{
    m_mgr.GetPane(projectManager).Show(true);
    m_mgr.Update();
}

/**
 * Show project manager
 */
void Game_Develop_EditorFrame::OnRibbonCppToolsClicked(wxRibbonButtonBarEvent& evt)
{
    m_mgr.GetPane(buildToolsPnl).Show(true);
    m_mgr.Update();
}

/**
 * Show the start page
 */
void Game_Develop_EditorFrame::OnRibbonStartPageClicked(wxRibbonButtonBarEvent& evt)
{
    for (unsigned int i = 0;i<editorsNotebook->GetPageCount();++i)
    {
    	if ( dynamic_cast<StartHerePage*>(editorsNotebook->GetPage(i)) != NULL )
    	{
    	    editorsNotebook->SetSelection(i);
    	    return;
    	}
    }

    startPage = new StartHerePage(this, *this);
    editorsNotebook->AddPage(startPage, _("Page de démarrage"), true);
}

/**
 * Want to close Game Develop
 */
void Game_Develop_EditorFrame::OnClose( wxCloseEvent& event )
{
    if (wxMessageBox(_("Etes-vous sûr de vouloir quitter Game Develop ?"), _("Quitter Game Develop"), wxYES_NO ) == wxNO)
        return;

    wxConfigBase::Get()->Write( _T( "/Workspace/Actuel" ), m_mgr.SavePerspective() );

    //Close the editor close the program.
    //We have to destroy the other frames.
    ConsoleManager * consoleManager = ConsoleManager::GetInstance();
    consoleManager->DestroySingleton();

    Destroy();
}

/**
 * Add or remove the close button on tab
 */
void Game_Develop_EditorFrame::OnNotebook1PageChanged(wxAuiNotebookEvent& event)
{
    if ( false ) //All editors are closable currently
    {
        long style = editorsNotebook->GetWindowStyleFlag();
        style &= ~wxAUI_NB_CLOSE_ON_ACTIVE_TAB;
        editorsNotebook->SetWindowStyleFlag(style);
    }
    else
    {
        long style = editorsNotebook->GetWindowStyleFlag();
        style |= wxAUI_NB_CLOSE_ON_ACTIVE_TAB;
        editorsNotebook->SetWindowStyleFlag(style);
    }

    //Update ribbon for new selected editor
    EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(editorsNotebook->GetPage(event.GetSelection()));
    EditorImages * imagesEditorPtr = dynamic_cast<EditorImages*>(editorsNotebook->GetPage(event.GetSelection()));
    CodeEditor * codeEditorPtr = dynamic_cast<CodeEditor*>(editorsNotebook->GetPage(event.GetSelection()));

    if ( sceneEditorPtr != NULL ) sceneEditorPtr->ForceRefreshRibbonAndConnect();
    if ( imagesEditorPtr != NULL ) imagesEditorPtr->ForceRefreshRibbonAndConnect();
    if ( codeEditorPtr != NULL ) codeEditorPtr->ForceRefreshRibbonAndConnect();
}

void Game_Develop_EditorFrame::LoadSkin(wxRibbonBar * bar)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    wxString result;
    pConfig->Read( _T( "/Skin/RDefined" ), &result );

    //Ribbon skin
    if ( result == "true" )
    {
        int r = 120, v = 120, b = 120;
        int r2 = 120, v2 = 120, b2 = 120;

        wxRibbonArtProvider * ribbonArtProvider = NULL;
        pConfig->Read( _T( "/Skin/RibbonStyle" ), &result );

        //Style
        if ( result == "Office" )
            ribbonArtProvider = new wxRibbonMSWArtProvider();
        else if ( result == "AUI" )
            ribbonArtProvider = new wxRibbonAUIArtProvider();
        else
            ribbonArtProvider = new wxRibbonMSWArtProvider();

        bar->SetArtProvider(ribbonArtProvider);

        //Colors
        pConfig->Read( _T( "/Skin/Ribbon1R" ), &r );
        pConfig->Read( _T( "/Skin/Ribbon1G" ), &v );
        pConfig->Read( _T( "/Skin/Ribbon1B" ), &b );

        pConfig->Read( _T( "/Skin/Ribbon2R" ), &r2 );
        pConfig->Read( _T( "/Skin/Ribbon2G" ), &v2 );
        pConfig->Read( _T( "/Skin/Ribbon2B" ), &b2 );

        wxColour colour, secondary, tertiary;
        bar->GetArtProvider()->GetColourScheme(&colour, &secondary, &tertiary);
        bar->GetArtProvider()->SetColourScheme(wxColour(r, v, b), wxColour(r2, v2, b2), wxColour(0, 0, 0));

    }
    else
    {
        bar->SetArtProvider(new wxRibbonMSWArtProvider());
        bar->GetArtProvider()->SetColourScheme(wxColour(244, 245, 247), wxColour(231, 241, 254), wxColour(0, 0, 0));
    }
}

void Game_Develop_EditorFrame::LoadSkin(wxAuiManager * auiManager)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    wxString result;

    //DockArt skin
    wxAuiDefaultDockArt *dockArt = new wxAuiDefaultDockArt();
    pConfig->Read( _T( "/Skin/Defined" ), &result );
    if ( result == "true" )
    {
        int r = 120, v = 120, b = 120;

        pConfig->Read( _T( "/Skin/PaneA1R" ), &r );
        pConfig->Read( _T( "/Skin/PaneA1G" ), &v );
        pConfig->Read( _T( "/Skin/PaneA1B" ), &b );
        dockArt->SetColour( 7, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/PaneA2R" ), &r );
        pConfig->Read( _T( "/Skin/PaneA2G" ), &v );
        pConfig->Read( _T( "/Skin/PaneA2B" ), &b );
        dockArt->SetColour( 8, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/PaneI1R" ), &r );
        pConfig->Read( _T( "/Skin/PaneI1G" ), &v );
        pConfig->Read( _T( "/Skin/PaneI1B" ), &b );
        dockArt->SetColour( 9, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/PaneI2R" ), &r );
        pConfig->Read( _T( "/Skin/PaneI2G" ), &v );
        pConfig->Read( _T( "/Skin/PaneI2B" ), &b );
        dockArt->SetColour( 10, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/BorderR" ), &r );
        pConfig->Read( _T( "/Skin/BorderG" ), &v );
        pConfig->Read( _T( "/Skin/BorderB" ), &b );
        dockArt->SetColour( 13, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/BackR" ), &r );
        pConfig->Read( _T( "/Skin/BackG" ), &v );
        pConfig->Read( _T( "/Skin/BackB" ), &b );
        dockArt->SetColour( 6, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/ATextR" ), &r );
        pConfig->Read( _T( "/Skin/ATextG" ), &v );
        pConfig->Read( _T( "/Skin/ATextB" ), &b );
        dockArt->SetColour( 11, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/ITextR" ), &r );
        pConfig->Read( _T( "/Skin/ITextG" ), &v );
        pConfig->Read( _T( "/Skin/ITextB" ), &b );
        dockArt->SetColour( 12, wxColour( r, v, b ) );

    }
    else
    {
        dockArt->SetColour(6, wxColour(211,222,246));
        dockArt->SetColour(13, wxColour(172,183,208));
        dockArt->SetColour(9, wxColour(214,221,233));
        dockArt->SetColour(10, wxColour(214,221,233));
        dockArt->SetColour(7, wxColour(221,229,246));
        dockArt->SetColour(8, wxColour(221,229,246));
        dockArt->SetColour(11, wxColour(104,114,138));
        dockArt->SetColour(12, wxColour(104,114,138));

    }

    auiManager->SetArtProvider(dockArt);
}

void Game_Develop_EditorFrame::OneditorsNotebookPageClose(wxAuiNotebookEvent& event)
{
    if ( dynamic_cast<StartHerePage*>(editorsNotebook->GetPage(event.GetSelection())) != NULL )
        startPage = NULL;
    else if ( CodeEditor * editor = dynamic_cast<CodeEditor*>(editorsNotebook->GetPage(event.GetSelection())) )
    {
        if ( !editor->QueryClose() )
            event.Veto();
    }
}

/**
 * Configure autosaving according to preferences
 */
void Game_Develop_EditorFrame::PrepareAutosave()
{
    bool activated = true;
    wxConfigBase::Get()->Read( "/Autosave/Activated", &activated );

    if ( activated )
    {
        int time = 180000;
        wxConfigBase::Get()->Read( "/Autosave/Time", &time );
        autoSaveTimer.Start(time, false);
    }
    else autoSaveTimer.Stop();
}

/**
 * Autosave projects
 */
void Game_Develop_EditorFrame::OnautoSaveTimerTrigger(wxTimerEvent& event)
{
    for (unsigned int i = 0;i<games.size();++i)
    {
        if ( !games[i]->gameFile.empty() )
        {
            wxString filename = wxFileName(games[i]->gameFile).GetPath()+"/"+wxFileName(games[i]->gameFile).GetName()+".autosave.gdg";

            OpenSaveGame saveGame( *games[i] );
            if ( !saveGame.SaveToFile(string(filename.mb_str())) ) {wxLogStatus( "L'enregistrement automatique a échoué." );}
        }
    }
}

void Game_Develop_EditorFrame::OnKeyDown(wxKeyEvent& event)
{
    if ( !scenesLockingShortcuts.empty() )
    {
        event.Skip();
        return;
    }

    if(event.GetModifiers() == wxMOD_CMD)
    {
        switch(event.GetKeyCode()) {
            case 'S':
            {
                wxCommandEvent uselessEvent;
                OnMenuSaveSelected(uselessEvent);
                break;
            }
            case 'O':
            {
                wxCommandEvent uselessEvent;
                OnMenuOpenSelected(uselessEvent);
                break;
            }
            case 'N':
            {
                wxCommandEvent uselessEvent;
                OnMenuNewSelected(uselessEvent);
                break;
            }
            case 'W':
            {
                wxRibbonButtonBarEvent uselessEvent;
                if ( projectManager ) projectManager->OnRibbonCloseSelected(uselessEvent);
                break;
            }
            /*case 'G':
            {
                if ( editorsNotebook->GetSelection() == editorsNotebook->GetPageCount()-1 )
                    editorsNotebook->SetSelection(0);
                else
                    editorsNotebook->SetSelection(editorsNotebook->GetSelection()+1);

                break;
            }*/
            default:
                break;
        }
    }
    if(event.GetModifiers() == (wxMOD_CMD|wxMOD_SHIFT) )
    {
        switch(event.GetKeyCode()) {
            case 'S':
            {
                wxRibbonButtonBarEvent uselessEvent;
                OnRibbonSaveAllClicked(uselessEvent);
                break;
            }
            default:
                break;
        }
    }
    else
    {
        switch(event.GetKeyCode())
        {
            case WXK_F1:
            {
                wxCommandEvent uselessEvent;
                OnMenuAideSelected(uselessEvent);
                break;
            }
            default:
                break;
        }
    }

    //Not a shortcut, let the event propagates.
    event.Skip();
}
