/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

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
#include <wx/ribbon/buttonbar.h>

#include <iostream>
#include <string>
#include <list>
#include <sstream>
#include "GDAuiTabArt.h"

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

#include "Game_Develop_EditorMain.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDL/CommonTools.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/IDE/Dialogs/ResourcesEditor.h"
#include "GDL/IDE/Dialogs/ChooseObject.h"
#include "MyStatusBar.h"
#include "EditorObjets.h"
#include "EventsEditor.h"
#include "EditorScene.h"
#include "CodeEditor.h"
#include "EditorObjectList.h"
#include "DnDFileEditor.h"
#include "ConsoleManager.h"
#include "ProjectManager.h"
#include "LogFileManager.h"
#include "StartHerePage.h"
#include "BuildToolsPnl.h"
#include "ExternalEventsEditor.h"

//(*IdInit(Game_Develop_EditorFrame)
const long Game_Develop_EditorFrame::ID_CUSTOM1 = wxNewId();
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
const long Game_Develop_EditorFrame::ID_MENUITEM7 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM9 = wxNewId();
const long Game_Develop_EditorFrame::toBeDeletedMenuItem = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM26 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM10 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM11 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM12 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM18 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM13 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM16 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM15 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM19 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM17 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM14 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM20 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM23 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM22 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM25 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM24 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM21 = wxNewId();
//*)
const long Game_Develop_EditorFrame::IDM_RECENTS = wxNewId();
const long Game_Develop_EditorFrame::idRibbonNew = wxNewId();
const long Game_Develop_EditorFrame::idRibbonOpen = wxNewId();
const long Game_Develop_EditorFrame::idRibbonSave = wxNewId();
const long Game_Develop_EditorFrame::idRibbonSaveAs = wxNewId();
const long Game_Develop_EditorFrame::idRibbonSaveAll = wxNewId();
const long Game_Develop_EditorFrame::idRibbonPortable = wxNewId();
const long Game_Develop_EditorFrame::idRibbonCompil = wxNewId();
const long Game_Develop_EditorFrame::idRibbonOptions = wxNewId();
const long Game_Develop_EditorFrame::idRibbonHelp = wxNewId();
const long Game_Develop_EditorFrame::idRibbonTuto = wxNewId();
const long Game_Develop_EditorFrame::idRibbonWiki = wxNewId();
const long Game_Develop_EditorFrame::idRibbonForum = wxNewId();
const long Game_Develop_EditorFrame::idRibbonUpdate = wxNewId();
const long Game_Develop_EditorFrame::idRibbonWebSite = wxNewId();
const long Game_Develop_EditorFrame::idRibbonCredits = wxNewId();
const long Game_Develop_EditorFrame::idRibbonFileBt = wxNewId();
const long Game_Develop_EditorFrame::idRibbonHelpBt = wxNewId();


BEGIN_EVENT_TABLE( Game_Develop_EditorFrame, wxFrame )
    //(*EventTable(Game_Develop_EditorFrame)
    //*)
END_EVENT_TABLE()


/**
 * Constructor of the main frame.
 */
Game_Develop_EditorFrame::Game_Develop_EditorFrame( wxWindow* parent, bool createEmptyProject) :
gameCurrentlyEdited(0),
m_ribbon(NULL),
ribbonFileBt(NULL),
ribbonHelpBt(NULL),
ribbonSceneEditorButtonBar(NULL),
buildToolsPnl(NULL),
mainEditorCommand(NULL, NULL, this, NULL, NULL, NULL, &scenesLockingShortcuts),
startPage(NULL),
projectManager(NULL)
{

    //(*Initialize(Game_Develop_EditorFrame)
    wxBoxSizer* ribbonSizer;
    wxMenuItem* MenuItem1;
    wxMenuItem* MenuItem11;
    wxFlexGridSizer* FlexGridSizer2;
    wxMenuItem* MenuItem42;
    wxMenuItem* MenuItem41;
    wxFlexGridSizer* FlexGridSizer1;
    wxMenuItem* MenuItem45;

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
    ribbonSizer = new wxBoxSizer(wxVERTICAL);
    FlexGridSizer1->Add(ribbonSizer, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(629,484), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer2->AddGrowableCol(0);
    FlexGridSizer2->AddGrowableRow(1);
    infoBar = new wxInfoBar(Panel1,ID_CUSTOM1);
    FlexGridSizer2->Add(infoBar, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
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
    MenuItem2 = new wxMenuItem((&fileMenu), ID_MENUITEM7, _("Nouveau\tCtrl+N"), wxEmptyString, wxITEM_NORMAL);
    MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/newicon.png"))));
    fileMenu.Append(MenuItem2);
    fileMenu.AppendSeparator();
    MenuItem3 = new wxMenuItem((&fileMenu), ID_MENUITEM9, _("Ouvrir\tCtrl+O"), wxEmptyString, wxITEM_NORMAL);
    MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/openicon.png"))));
    fileMenu.Append(MenuItem3);
    menuRecentFiles = new wxMenu();
    MenuItem23 = new wxMenuItem(menuRecentFiles, toBeDeletedMenuItem, _("useless"), wxEmptyString, wxITEM_NORMAL);
    menuRecentFiles->Append(MenuItem23);
    fileMenu.Append(ID_MENUITEM26, _("Fichiers récemments ouverts"), menuRecentFiles, wxEmptyString);
    MenuItem4 = new wxMenuItem((&fileMenu), ID_MENUITEM10, _("Ouvrir un jeu d\'exemple"), wxEmptyString, wxITEM_NORMAL);
    fileMenu.Append(MenuItem4);
    MenuItem5 = new wxMenuItem((&fileMenu), ID_MENUITEM11, _("Importer un jeu"), wxEmptyString, wxITEM_NORMAL);
    MenuItem5->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
    fileMenu.Append(MenuItem5);
    fileMenu.AppendSeparator();
    MenuItem6 = new wxMenuItem((&fileMenu), ID_MENUITEM12, _("Enregistrer\tCtrl+S"), wxEmptyString, wxITEM_NORMAL);
    MenuItem6->SetBitmap(wxBitmap(wxImage(_T("res/saveicon.png"))));
    fileMenu.Append(MenuItem6);
    MenuItem14 = new wxMenuItem((&fileMenu), ID_MENUITEM18, _("Enregistrer en mode portable"), wxEmptyString, wxITEM_NORMAL);
    fileMenu.Append(MenuItem14);
    MenuItem7 = new wxMenuItem((&fileMenu), ID_MENUITEM13, _("Enregistrer sous..."), wxEmptyString, wxITEM_NORMAL);
    MenuItem7->SetBitmap(wxBitmap(wxImage(_T("res/saveasicon.png"))));
    fileMenu.Append(MenuItem7);
    MenuItem12 = new wxMenuItem((&fileMenu), ID_MENUITEM16, _("Enregistrer tous les projets ouverts\tCtrl+Shift+S"), wxEmptyString, wxITEM_NORMAL);
    MenuItem12->SetBitmap(wxBitmap(wxImage(_T("res/save_all16.png"))));
    fileMenu.Append(MenuItem12);
    fileMenu.AppendSeparator();
    MenuItem9 = new wxMenuItem((&fileMenu), ID_MENUITEM15, _("Compiler le projet en exécutable"), wxEmptyString, wxITEM_NORMAL);
    MenuItem9->SetBitmap(wxBitmap(wxImage(_T("res/compilationicon.png"))));
    fileMenu.Append(MenuItem9);
    fileMenu.AppendSeparator();
    MenuItem15 = new wxMenuItem((&fileMenu), ID_MENUITEM19, _("Fermer le projet"), wxEmptyString, wxITEM_NORMAL);
    fileMenu.Append(MenuItem15);
    fileMenu.AppendSeparator();
    MenuItem13 = new wxMenuItem((&fileMenu), ID_MENUITEM17, _("Préférences"), wxEmptyString, wxITEM_NORMAL);
    MenuItem13->SetBitmap(wxBitmap(wxImage(_T("res/preficon.png"))));
    fileMenu.Append(MenuItem13);
    fileMenu.AppendSeparator();
    MenuItem8 = new wxMenuItem((&fileMenu), ID_MENUITEM14, _("Quitter"), wxEmptyString, wxITEM_NORMAL);
    fileMenu.Append(MenuItem8);
    menuRecentFiles->Delete(toBeDeletedMenuItem);
    MenuItem16 = new wxMenuItem((&helpMenu), ID_MENUITEM20, _("Aide"), wxEmptyString, wxITEM_NORMAL);
    MenuItem16->SetBitmap(wxBitmap(wxImage(_T("res/helpicon.png"))));
    helpMenu.Append(MenuItem16);
    MenuItem19 = new wxMenuItem((&helpMenu), ID_MENUITEM23, _("Tutoriel"), wxEmptyString, wxITEM_NORMAL);
    MenuItem19->SetBitmap(wxBitmap(wxImage(_T("res/tutoicon.png"))));
    helpMenu.Append(MenuItem19);
    MenuItem18 = new wxMenuItem((&helpMenu), ID_MENUITEM22, _("Wiki"), wxEmptyString, wxITEM_NORMAL);
    MenuItem18->SetBitmap(wxBitmap(wxImage(_T("res/wikiicon.png"))));
    helpMenu.Append(MenuItem18);
    helpMenu.AppendSeparator();
    MenuItem21 = new wxMenuItem((&helpMenu), ID_MENUITEM25, _("Vérifier les mises à jour"), wxEmptyString, wxITEM_NORMAL);
    MenuItem21->SetBitmap(wxBitmap(wxImage(_T("res/update16.png"))));
    helpMenu.Append(MenuItem21);
    helpMenu.AppendSeparator();
    MenuItem20 = new wxMenuItem((&helpMenu), ID_MENUITEM24, _("Site officiel"), wxEmptyString, wxITEM_NORMAL);
    MenuItem20->SetBitmap(wxBitmap(wxImage(_T("res/siteicon.png"))));
    helpMenu.Append(MenuItem20);
    MenuItem17 = new wxMenuItem((&helpMenu), ID_MENUITEM21, _("A propos..."), wxEmptyString, wxITEM_NORMAL);
    MenuItem17->SetBitmap(wxBitmap(wxImage(_T("res/icon16.png"))));
    helpMenu.Append(MenuItem17);
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
    Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuNewSelected);
    Connect(ID_MENUITEM9,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuOpenSelected);
    Connect(ID_MENUITEM10,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnOpenExampleSelected);
    Connect(ID_MENUITEM11,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuFusionSelected);
    Connect(ID_MENUITEM12,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuSaveSelected);
    Connect(ID_MENUITEM18,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuPortableSelected);
    Connect(ID_MENUITEM13,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuSaveAsSelected);
    Connect(ID_MENUITEM16,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuSaveAllSelected);
    Connect(ID_MENUITEM15,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuCompilationSelected);
    Connect(ID_MENUITEM19,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnCloseCurrentProjectSelected);
    Connect(ID_MENUITEM17,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuPrefSelected);
    Connect(ID_MENUITEM14,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnQuit);
    Connect(ID_MENUITEM20,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuAideSelected);
    Connect(ID_MENUITEM23,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuTutoSelected);
    Connect(ID_MENUITEM22,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuWikiSelected);
    Connect(ID_MENUITEM25,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuItem36Selected);
    Connect(ID_MENUITEM24,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuSiteSelected);
    Connect(ID_MENUITEM21,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnAbout);
    Connect(wxID_ANY,wxEVT_CLOSE_WINDOW,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnClose);
    Connect(wxEVT_SIZE,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnResize);
    //*)
    Connect( wxID_FILE1, wxID_FILE9, wxEVT_COMMAND_MENU_SELECTED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRecentClicked );
    Connect( idRibbonNew, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuNewSelected );
    Connect( idRibbonOpen, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuOpenSelected );
    Connect( idRibbonOpen, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonOpenDropDownClicked );
    Connect( idRibbonSave, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuSaveSelected );
    Connect( idRibbonSave, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonSaveDropDownClicked );
    Connect( idRibbonSaveAll, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonSaveAllClicked );
    Connect( idRibbonCompil, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuCompilationSelected );
    Connect( idRibbonOptions, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuPrefSelected );
    Connect( idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuAideSelected );
    Connect( idRibbonTuto, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuTutoSelected );
    Connect( idRibbonWiki, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuWikiSelected );
    Connect( idRibbonForum, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuForumSelected );
    Connect( idRibbonUpdate, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuItem36Selected );
    Connect( idRibbonWebSite, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuSiteSelected );
    Connect( idRibbonCredits, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnAbout );


    wxIconBundle icons;
    icons.AddIcon("res/icon16.png");
    icons.AddIcon("res/icon24.png");
    #if defined(LINUX) || defined(MAC)
    icons.AddIcon("res/icon32linux.png");
    icons.AddIcon("res/icon48linux.png");
    icons.AddIcon("res/icon64linux.png");
    icons.AddIcon("res/icon128linux.png");
    #else
    icons.AddIcon("res/icon32.png");
    icons.AddIcon("res/icon48.png");
    icons.AddIcon("res/icon128.png");
    #endif
    SetIcons(icons);

    SetDropTarget(new DnDFileEditor(*this));

    //Accès à la configuration
    wxConfigBase *pConfig = wxConfigBase::Get();

    //Deactivate menu
    SetMenuBar(NULL);

    //Prepare autosave
    PrepareAutosave();

    //Prepare recent list
    m_recentlist.SetMaxEntries( 9 );
    m_recentlist.SetAssociatedMenu( menuRecentFiles );
    for ( int i = 0;i < 9;i++ )
    {
        wxString result;
        pConfig->Read( wxString::Format( _T( "/Recent/%d" ), i ), &result );
        m_recentlist.Append( result );
    }

    //Create status bar
    MyStatusBar * myStatusBar = new MyStatusBar(this);
    myStatusBar->SetStatusText( "2008-2012 Compil Games", 1 );
    SetStatusBar(myStatusBar);

    //Ribbon setup
    long ribbonStyle = wxRIBBON_BAR_DEFAULT_STYLE;
    bool hidePageTabs = false;
    pConfig->Read( _T( "/Skin/HidePageTabs" ), &hidePageTabs );
    if ( hidePageTabs )
    {
        ribbonStyle &= ~wxRIBBON_BAR_SHOW_PAGE_LABELS;
    }
    m_ribbon = new wxRibbonBar(this, wxID_ANY);
    m_ribbon->SetWindowStyle(ribbonStyle);
    bool hideLabels = false;
    pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Projets"));
        ProjectManager::CreateRibbonPage(ribbonEditorPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Banque d'images"));
        //
        {
            wxRibbonPanel *ribbonPanel = new wxRibbonPanel(ribbonEditorPage, wxID_ANY, _("Ajout de ressources"), wxBitmap("res/list24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
            wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
            ribbonBar->AddButton(ResourcesEditor::idRibbonAdd, !hideLabels ? _("Ajouter une image") : "", wxBitmap("res/add24.png", wxBITMAP_TYPE_ANY));
            ribbonBar->AddButton(ResourcesEditor::idRibbonAddDossier, !hideLabels ? _("Ajouter un dossier virtuel") : "", wxBitmap("res/dossier24.png", wxBITMAP_TYPE_ANY));
        }
        {
            wxRibbonPanel *ribbonPanel = new wxRibbonPanel(ribbonEditorPage, wxID_ANY, _("Gestion de la liste"), wxBitmap("res/list24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
            wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
            ribbonBar->AddButton(ResourcesEditor::idRibbonDel, !hideLabels ? _("Supprimer") : "", wxBitmap("res/delete24.png", wxBITMAP_TYPE_ANY));
            ribbonBar->AddButton(ResourcesEditor::idRibbonDeleteUnused, !hideLabels ? _("Supprimer les res. superflues") : "", wxBitmap("res/deleteunknown24.png", wxBITMAP_TYPE_ANY));
            ribbonBar->AddButton(ResourcesEditor::idRibbonUp, !hideLabels ? _("Déplacer vers le haut") : "", wxBitmap("res/up24.png", wxBITMAP_TYPE_ANY));
            ribbonBar->AddButton(ResourcesEditor::idRibbonDown, !hideLabels ? _("Déplacer vers le bas") : "", wxBitmap("res/down24.png", wxBITMAP_TYPE_ANY));
            ribbonBar->AddButton(ResourcesEditor::idRibbonRefresh, !hideLabels ? _("Rafraichir la liste") : "", wxBitmap("res/refreshicon24.png", wxBITMAP_TYPE_ANY));
        }

        {
            wxRibbonPanel *ribbonPanel = new wxRibbonPanel(ribbonEditorPage, wxID_ANY, _("Ressource sélectionnée"), wxBitmap("res/edit24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
            wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
            ribbonBar->AddButton(ResourcesEditor::idRibbonMod, !hideLabels ? _("Nom") : "", wxBitmap("res/editname24.png", wxBITMAP_TYPE_ANY));
            ribbonBar->AddButton(ResourcesEditor::idRibbonModFile, !hideLabels ? _("Modifier le fichier") : "", wxBitmap("res/openicon24.png", wxBITMAP_TYPE_ANY));
            ribbonBar->AddButton(ResourcesEditor::idRibbonModProp, !hideLabels ? _("Propriétés") : "", wxBitmap("res/editprop24.png", wxBITMAP_TYPE_ANY));
            ribbonBar->AddButton(ResourcesEditor::idRibbonPaintProgram, !hideLabels ? _("Editer") : "", wxBitmap("res/paint24.png", wxBITMAP_TYPE_ANY));
        }
        {
            wxRibbonPanel *ribbonPanel = new wxRibbonPanel(ribbonEditorPage, wxID_ANY, _("Aide"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
            wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
            ribbonBar->AddButton(ResourcesEditor::idRibbonHelp, !hideLabels ? _("Aide") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
        }
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Scène"));
        ribbonSceneEditorButtonBar = SceneCanvas::CreateRibbonPage(ribbonEditorPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Evènements"));
        EventsEditor::CreateRibbonPage(ribbonEditorPage);
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
    m_ribbon->Realize();
    ribbonSizer->Add(m_ribbon, 0, wxEXPAND);

    //Create ribbon "File" custom button
    ribbonFileBt = new wxStaticBitmap(m_ribbon, idRibbonFileBt, wxNullBitmap);
    ribbonFileBt->Connect(wxEVT_LEAVE_WINDOW, wxMouseEventHandler(Game_Develop_EditorFrame::OnRibbonFileBtLeave), NULL, this);
    ribbonFileBt->Connect(wxEVT_ENTER_WINDOW, wxMouseEventHandler(Game_Develop_EditorFrame::OnRibbonFileBtEnter), NULL, this);
    ribbonFileBt->Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(Game_Develop_EditorFrame::OnRibbonFileBtClick), NULL, this);

    //Create ribbon "Help" custom button
    ribbonHelpBt = new wxStaticBitmap(m_ribbon, idRibbonHelpBt, wxNullBitmap);
    ribbonHelpBt->Connect(wxEVT_LEAVE_WINDOW, wxMouseEventHandler(Game_Develop_EditorFrame::OnRibbonHelpBtLeave), NULL, this);
    ribbonHelpBt->Connect(wxEVT_ENTER_WINDOW, wxMouseEventHandler(Game_Develop_EditorFrame::OnRibbonHelpBtEnter), NULL, this);
    ribbonHelpBt->Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(Game_Develop_EditorFrame::OnRibbonHelpBtClick), NULL, this);

    //Load wxAUI
    m_mgr.SetManagedWindow( this );

    LoadSkin(&m_mgr, editorsNotebook);
    LoadSkin(m_ribbon);

    RealizeRibbonCustomButtons();

    //Create start page
    startPage = new StartHerePage(editorsNotebook, *this);
    editorsNotebook->AddPage(startPage, _("Page de démarrage"));

    //Create project manager
    projectManager = new ProjectManager(this, *this);
    projectManager->ConnectEvents();

    //Create build tools panel
    buildToolsPnl = new BuildToolsPnl(this, projectManager);

    //Setup panes and load user configuration
    m_mgr.AddPane( projectManager, wxAuiPaneInfo().Name( wxT( "PM" ) ).Caption( _( "Gestionnaire de projets" ) ).Left().MaximizeButton( true ).MinimizeButton( false ).MinSize(170,100) );
    m_mgr.AddPane( Panel1, wxAuiPaneInfo().Name( wxT( "EP" ) ).Caption( _( "Editeur principal" ) ).Center().CaptionVisible(false).CloseButton( false ).MaximizeButton( true ).MinimizeButton( false ) );
    m_mgr.AddPane( m_ribbon, wxAuiPaneInfo().Name( wxT( "RP" ) ).Caption( _( "Ruban" ) ).Top().PaneBorder(false).CaptionVisible(false).Movable(false).Floatable(false).CloseButton( false ).MaximizeButton( false ).MinimizeButton( false ).Resizable(false) );
    m_mgr.AddPane( buildToolsPnl, wxAuiPaneInfo().Name( wxT( "CT" ) ).Caption( _( "Outils de compilations" ) ).Bottom().MaximizeButton( true ).MinimizeButton( false ).Show(false).MinSize(120,130));

    wxString result;
    pConfig->Read( _T( "/Workspace/Actuel" ), &result );
    if ( result != "" )
        m_mgr.LoadPerspective( result , true );

    //Ensure that names are corrected ( Useful in particular to ensure that these name are in the selected language ).
    m_mgr.GetPane(projectManager).Caption(_( "Gestionnaire de projets" ));
    m_mgr.GetPane(buildToolsPnl).Caption(_( "Outils de compilations" ));

    //Change ribbon pane height.
    m_mgr.GetPane(m_ribbon).MinSize(1, m_ribbon->GetBestSize().GetHeight()+4);

    m_mgr.SetFlags( wxAUI_MGR_ALLOW_FLOATING | wxAUI_MGR_ALLOW_ACTIVE_PANE | wxAUI_MGR_TRANSPARENT_HINT
                    | wxAUI_MGR_TRANSPARENT_DRAG | wxAUI_MGR_HINT_FADE | wxAUI_MGR_NO_VENETIAN_BLINDS_FADE );

    m_mgr.Update();
    UpdateNotebook();

    infoBar->SetShowHideEffects(wxSHOW_EFFECT_SLIDE_TO_BOTTOM, wxSHOW_EFFECT_BLEND);

    mainEditorCommand = MainEditorCommand(m_ribbon, ribbonSceneEditorButtonBar, this, buildToolsPnl, &m_mgr, infoBar, &scenesLockingShortcuts);

    SetSize(900,740);
    Center();
    Maximize(true);

    if ( createEmptyProject )
    {
        games.push_back(boost::shared_ptr<RuntimeGame>(new RuntimeGame));
        projectManager->Refresh();
    }
}

void Game_Develop_EditorFrame::OnResize(wxSizeEvent& event)
{
    Layout();
    if ( ribbonHelpBt != NULL ) ribbonHelpBt->SetPosition(wxPoint(m_ribbon->GetSize().GetWidth()-ribbonHelpBt->GetSize().GetWidth()-2, 2));
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
        SetTitle( GD + " - [" + games[i]->GetName() + "] "+games[i]->gameFile );
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

    LogFileManager::GetInstance()->WriteToLogFile("Game Develop shutting down");
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

    if ( EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(editorsNotebook->GetPage(event.GetSelection())) )
    {
        sceneEditorPtr->ForceRefreshRibbonAndConnect();
        LogFileManager::GetInstance()->WriteToLogFile("Switched to the editor of layout \""+sceneEditorPtr->GetLayout().GetName()+"\"");
    }
    else if ( ResourcesEditor * imagesEditorPtr = dynamic_cast<ResourcesEditor*>(editorsNotebook->GetPage(event.GetSelection())) )
    {
        imagesEditorPtr->ForceRefreshRibbonAndConnect();
        LogFileManager::GetInstance()->WriteToLogFile("Switched to resources editor of project \""+imagesEditorPtr->game.GetName()+"\"");
    }
    else if ( CodeEditor * codeEditorPtr = dynamic_cast<CodeEditor*>(editorsNotebook->GetPage(event.GetSelection())) )
    {
        codeEditorPtr->ForceRefreshRibbonAndConnect();
        LogFileManager::GetInstance()->WriteToLogFile("Switched to code editor of file \""+codeEditorPtr->filename+"\"");
    }
    else if ( ExternalEventsEditor * externalEventsEditorPtr = dynamic_cast<ExternalEventsEditor*>(editorsNotebook->GetPage(event.GetSelection())) )
    {
        externalEventsEditorPtr->ForceRefreshRibbonAndConnect();
        LogFileManager::GetInstance()->WriteToLogFile("Switched to the editor of external events \""+externalEventsEditorPtr->events.GetName()+"\"");
    }
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

void Game_Develop_EditorFrame::LoadSkin(wxAuiManager * auiManager, wxAuiNotebook * notebook)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    wxString result;

    //DockArt skin
    wxAuiDefaultDockArt *dockArt = new wxAuiDefaultDockArt();
    GDAuiTabArt * tabArt = new GDAuiTabArt();
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

        wxColor tabColor;
        pConfig->Read( _T( "/Skin/TabColor" ), &tabColor );
        tabArt->SetColour(tabColor);

        wxColor activeTabColor;
        pConfig->Read( _T( "/Skin/ActiveTabColor" ), &activeTabColor );
        tabArt->SetActiveColour(activeTabColor);
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

        tabArt->SetColour(wxColour(220, 225, 232));
        tabArt->SetActiveColour(wxColour(220, 225, 232));
    }

    if (auiManager) auiManager->SetArtProvider(dockArt);
    if (notebook) notebook->SetArtProvider(tabArt);
}

void Game_Develop_EditorFrame::RealizeRibbonCustomButtons()
{
    wxRibbonArtProvider * artProvider = m_ribbon->GetArtProvider();
    if ( artProvider == NULL ) return;

    wxColor buttonColor;
    if ( !wxConfigBase::Get()->Read( _T( "/Skin/FileButtonColor" ), &buttonColor ) )
        buttonColor = wxColour(200, 200, 255);

    //Create a temporary fake ribbon used to render the button with a custom color
    wxRibbonBar * fakeRibbon = new wxRibbonBar(this);
    fakeRibbon->SetArtProvider(artProvider->Clone());
    fakeRibbon->GetArtProvider()->SetColourScheme(buttonColor, buttonColor, buttonColor);

    //The device context used to render the button in memory
    wxMemoryDC dc;

    //Compute width of the bitmap button
    int width; artProvider->GetBarTabWidth(dc, fakeRibbon, _("Fichier"), wxNullBitmap, &width, NULL, NULL, NULL);

    //Create a fake ribbon page...
    wxRibbonPage *page = new wxRibbonPage(fakeRibbon, wxID_ANY, _("Fichier"));
    //...and the associated wxRibbonPageTabInfo
    wxRibbonPageTabInfo tabInfo;
    tabInfo.rect = wxRect(0,0, width, 16 /*Will be changed later*/);
    tabInfo.ideal_width = width;
    tabInfo.small_begin_need_separator_width = width;
    tabInfo.small_must_have_separator_width = width;
    tabInfo.minimum_width = width;
    tabInfo.page = page;
    tabInfo.active = true;
    tabInfo.hovered = false;
    wxRibbonPageTabInfoArray pages;
    pages.Add(tabInfo);
    pages.Add(tabInfo); //Add page twice to ensure that tab have a correct height

    //Compite height of the bitmap button and create bitmap
    int height = artProvider->GetTabCtrlHeight(dc, m_ribbon, pages);
    wxBitmap bitmapLabel(width+2, height);
    dc.SelectObject(bitmapLabel);

    tabInfo.rect = wxRect(0,0, width, height+2); //We've got the correct height now.

    //Render the file button. Use the background of the real ribbon.
    artProvider->DrawTabCtrlBackground(dc, fakeRibbon, bitmapLabel.GetSize());
    fakeRibbon->GetArtProvider()->DrawTab(dc, fakeRibbon, tabInfo);
    ribbonFileNormalBitmap = wxBitmap(bitmapLabel);

    //Render the hovered file button
    wxBitmap bitmapHoveredLabel(ribbonFileNormalBitmap.ConvertToImage());
    dc.SelectObject(bitmapHoveredLabel);

    tabInfo.active = false;
    tabInfo.hovered = true;
    artProvider->DrawTabCtrlBackground(dc, fakeRibbon, bitmapHoveredLabel.GetSize());
    fakeRibbon->GetArtProvider()->DrawTab(dc, fakeRibbon, tabInfo);
    ribbonFileHoveredBitmap = bitmapHoveredLabel;

    //Cut a bit the bottom of the bitmaps
    if ( ribbonFileNormalBitmap.GetSize().GetHeight() > 3 )
        ribbonFileNormalBitmap.SetHeight(ribbonFileNormalBitmap.GetSize().GetHeight()-2);

    if ( ribbonFileHoveredBitmap.GetSize().GetHeight() > 3 )
        ribbonFileHoveredBitmap.SetHeight(ribbonFileHoveredBitmap.GetSize().GetHeight()-2);

    //Render help file button
    wxBitmap helpIcon("res/helpicon.png", wxBITMAP_TYPE_ANY);

    ribbonHelpNormalBitmap = wxBitmap(helpIcon.ConvertToImage());
    dc.SelectObject(ribbonHelpNormalBitmap);
    artProvider->DrawTabCtrlBackground(dc, fakeRibbon, ribbonHelpNormalBitmap.GetSize());
    dc.DrawBitmap(helpIcon, wxPoint(0,0), true /*Use mask*/);

    ribbonHelpHoveredBitmap = wxBitmap(ribbonHelpNormalBitmap.ConvertToImage());

    fakeRibbon->Destroy();

    //Finally create our bitmaps and make sure the ribbon is ready.
    ribbonFileBt->SetPosition(wxPoint(3,1));
    ribbonFileBt->SetBitmap(ribbonFileNormalBitmap);
    ribbonHelpBt->SetPosition(wxPoint(m_ribbon->GetSize().GetWidth()-ribbonHelpBt->GetSize().GetWidth()-2, 2));
    ribbonHelpBt->SetBitmap(ribbonHelpNormalBitmap);
    m_ribbon->SetTabCtrlMargins(bitmapLabel.GetSize().GetWidth()+3+3, ribbonHelpBt->GetSize().GetWidth()+2+3);
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
    else if ( EditorScene * editor = dynamic_cast<EditorScene*>(editorsNotebook->GetPage(event.GetSelection())) )
    {
        //Save the event to log file
        LogFileManager::GetInstance()->WriteToLogFile("Closed layout "+editor->GetLayout().GetName());
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

void Game_Develop_EditorFrame::OnRibbonFileBtLeave(wxMouseEvent& event)
{
    ribbonFileBt->SetBitmap(ribbonFileNormalBitmap);
    ribbonFileBt->Refresh();
    ribbonFileBt->Update();
}

void Game_Develop_EditorFrame::OnRibbonFileBtEnter(wxMouseEvent& event)
{
    ribbonFileBt->SetBitmap(ribbonFileHoveredBitmap);
    ribbonFileBt->Refresh();
    ribbonFileBt->Update();
}

void Game_Develop_EditorFrame::OnRibbonFileBtClick(wxMouseEvent& event)
{
    PopupMenu(&fileMenu, ribbonFileBt->GetPosition().x, ribbonFileBt->GetPosition().y+ribbonFileBt->GetSize().GetHeight());
}

void Game_Develop_EditorFrame::OnRibbonHelpBtLeave(wxMouseEvent& event)
{
    ribbonHelpBt->SetBitmap(ribbonHelpNormalBitmap);
    ribbonHelpBt->Refresh();
    ribbonHelpBt->Update();
}

void Game_Develop_EditorFrame::OnRibbonHelpBtEnter(wxMouseEvent& event)
{
    ribbonHelpBt->SetBitmap(ribbonHelpHoveredBitmap);
    ribbonHelpBt->Refresh();
    ribbonHelpBt->Update();
}

void Game_Develop_EditorFrame::OnRibbonHelpBtClick(wxMouseEvent& event)
{
    PopupMenu(&helpMenu, ribbonHelpBt->GetPosition().x, ribbonHelpBt->GetPosition().y+ribbonHelpBt->GetSize().GetHeight());
}
