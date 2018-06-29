/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#include <iostream>
#include <string>
#include <list>
#include <sstream>
//(*InternalHeaders(MainFrame)
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
#include "GDCore/Tools/Log.h"
#include <wx/fileconf.h>
#include <wx/artprov.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/gallery.h>
#include <wx/ribbon/toolbar.h>
#include <wx/ribbon/buttonbar.h>

#include "MainFrame.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/IDE/wxTools/GUIContentScaleFactor.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasAssociatedEditor.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/IDE/ProjectFileWriter.h"
#include "GDCore/IDE/ProjectExporter.h"
#include "GDCore/IDE/PlatformManager.h"
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/Dialogs/ResourcesEditor.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include "Dialogs/ObjectsEditor.h"
#include "EventsEditor.h"
#include "EditorScene.h"
#include "CodeEditor.h"
#include "DnDFileEditor.h"
#include "ProjectManager.h"
#include "LogFileManager.h"
#include "BuildToolsPnl.h"
#include "Preferences.h"
#include "ExternalEventsEditor.h"
#include "Dialogs/ExternalLayoutEditor.h"
#include "mp3ogg.h"
#include "ImportImage.h"
#include "Dialogs/StartHerePage.h"
#include "Dialogs/ProjectPropertiesPnl.h"

//(*IdInit(MainFrame)
const long MainFrame::ID_AUINOTEBOOK1 = wxNewId();
const long MainFrame::ID_CUSTOM1 = wxNewId();
const long MainFrame::ID_PANEL1 = wxNewId();
const long MainFrame::ID_MENUITEM1 = wxNewId();
const long MainFrame::ID_MENUITEM2 = wxNewId();
const long MainFrame::ID_MENUITEM4 = wxNewId();
const long MainFrame::ID_MENUITEM5 = wxNewId();
const long MainFrame::ID_MENUITEM6 = wxNewId();
const long MainFrame::ID_TIMER1 = wxNewId();
const long MainFrame::ID_MENUITEM7 = wxNewId();
const long MainFrame::ID_MENUITEM9 = wxNewId();
const long MainFrame::ID_MENUITEM10 = wxNewId();
const long MainFrame::toBeDeletedMenuItem = wxNewId();
const long MainFrame::ID_MENUITEM26 = wxNewId();
const long MainFrame::ID_MENUITEM12 = wxNewId();
const long MainFrame::ID_MENUITEM13 = wxNewId();
const long MainFrame::ID_MENUITEM8 = wxNewId();
const long MainFrame::ID_MENUITEM16 = wxNewId();
const long MainFrame::ID_MENUITEM19 = wxNewId();
const long MainFrame::ID_MENUITEM17 = wxNewId();
const long MainFrame::ID_MENUITEM27 = wxNewId();
const long MainFrame::ID_MENUITEM14 = wxNewId();
const long MainFrame::ID_MENUITEM20 = wxNewId();
const long MainFrame::ID_MENUITEM23 = wxNewId();
const long MainFrame::ID_MENUITEM25 = wxNewId();
const long MainFrame::ID_MENUITEM24 = wxNewId();
const long MainFrame::ID_MENUITEM21 = wxNewId();
const long MainFrame::ID_MENUITEM3 = wxNewId();
//*)
const long MainFrame::ID_RIBBON = wxNewId();
const long MainFrame::IDM_RECENTS = wxNewId();
const long MainFrame::idRibbonNew = wxNewId();
const long MainFrame::idRibbonOpen = wxNewId();
const long MainFrame::idRibbonSave = wxNewId();
const long MainFrame::idRibbonSaveAs = wxNewId();
const long MainFrame::idRibbonSaveAll = wxNewId();
const long MainFrame::idRibbonPortable = wxNewId();
const long MainFrame::idRibbonCompil = wxNewId();
const long MainFrame::idRibbonOptions = wxNewId();
const long MainFrame::idRibbonHelp = wxNewId();
const long MainFrame::idRibbonTuto = wxNewId();
const long MainFrame::idRibbonForum = wxNewId();
const long MainFrame::idRibbonUpdate = wxNewId();
const long MainFrame::idRibbonWebSite = wxNewId();
const long MainFrame::idRibbonCredits = wxNewId();
const long MainFrame::idRibbonFileBt = wxNewId();
const long MainFrame::idRibbonHelpBt = wxNewId();


BEGIN_EVENT_TABLE( MainFrame, wxFrame )
    //(*EventTable(MainFrame)
    //*)
END_EVENT_TABLE()


/**
 * Constructor of the main frame.
 */
MainFrame::MainFrame( wxWindow* parent ) :
    projectCurrentlyEdited(0),
    baseTitle("GDevelop"),
    ribbon(NULL),
    ribbonFileBt(NULL),
    ribbonSceneEditorButtonBar(NULL),
    buildToolsPnl(NULL),
    mainFrameWrapper(NULL, NULL, this, NULL, NULL, NULL, &scenesLockingShortcuts, wxGetCwd()),
    projectManager(NULL)
{
    //(*Initialize(MainFrame)
    wxBoxSizer* ribbonSizer;
    wxMenuItem* MenuItem1;
    wxFlexGridSizer* FlexGridSizer2;
    wxMenuItem* MenuItem42;
    wxMenuItem* MenuItem41;
    wxFlexGridSizer* FlexGridSizer1;

    Create(parent, wxID_ANY, _("GDevelop"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_FRAME_STYLE, _T("wxID_ANY"));
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
    Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer2->AddGrowableCol(0);
    FlexGridSizer2->AddGrowableRow(0);
    editorsNotebook = new wxAuiNotebook(Panel1, ID_AUINOTEBOOK1, wxDefaultPosition, wxDefaultSize, wxAUI_NB_TAB_SPLIT|wxAUI_NB_TAB_MOVE|wxAUI_NB_SCROLL_BUTTONS|wxAUI_NB_TOP|wxNO_BORDER);
    FlexGridSizer2->Add(editorsNotebook, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    infoBar = new wxInfoBar(Panel1,ID_CUSTOM1);
    FlexGridSizer2->Add(infoBar, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Panel1->SetSizer(FlexGridSizer2);
    FlexGridSizer2->Fit(Panel1);
    FlexGridSizer2->SetSizeHints(Panel1);
    FlexGridSizer1->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    MenuItem1 = new wxMenuItem((&openContextMenu), ID_MENUITEM1, _("Open an example"), wxEmptyString, wxITEM_NORMAL);
    openContextMenu.Append(MenuItem1);
    MenuItem10 = new wxMenuItem((&saveContextMenu), ID_MENUITEM2, _("Save as..."), wxEmptyString, wxITEM_NORMAL);
    MenuItem10->SetBitmap(gd::SkinHelper::GetIcon("saveas", 16));
    saveContextMenu.Append(MenuItem10);
    MenuItem41 = new wxMenuItem((&decomposerContextMenu), ID_MENUITEM4, _("Decompose an animated GIF"), wxEmptyString, wxITEM_NORMAL);
    MenuItem41->SetBitmap(wxBitmap(wxImage(_T("res/importgif.png"))));
    decomposerContextMenu.Append(MenuItem41);
    MenuItem42 = new wxMenuItem((&decomposerContextMenu), ID_MENUITEM5, _("Decompose an RPG Maker character"), wxEmptyString, wxITEM_NORMAL);
    MenuItem42->SetBitmap(wxBitmap(wxImage(_T("res/importrpgmaker.png"))));
    decomposerContextMenu.Append(MenuItem42);
    MenuItem43 = new wxMenuItem((&decomposerContextMenu), ID_MENUITEM6, _("Decompose a spritesheet"), wxEmptyString, wxITEM_NORMAL);
    MenuItem43->SetBitmap(wxBitmap(wxImage(_T("res/spritesheet16.png"))));
    decomposerContextMenu.Append(MenuItem43);
    autoSaveTimer.SetOwner(this, ID_TIMER1);
    autoSaveTimer.Start(180000, false);
    MenuItem2 = new wxMenuItem((&fileMenu), ID_MENUITEM7, _("New\tCtrl+N"), wxEmptyString, wxITEM_NORMAL);
    MenuItem2->SetBitmap(gd::SkinHelper::GetIcon("new", 16));
    fileMenu.Append(MenuItem2);
    fileMenu.AppendSeparator();
    MenuItem3 = new wxMenuItem((&fileMenu), ID_MENUITEM9, _("Open\tCtrl+O"), wxEmptyString, wxITEM_NORMAL);
    MenuItem3->SetBitmap(gd::SkinHelper::GetIcon("open", 16));
    fileMenu.Append(MenuItem3);
    MenuItem4 = new wxMenuItem((&fileMenu), ID_MENUITEM10, _("Open an example"), wxEmptyString, wxITEM_NORMAL);
    fileMenu.Append(MenuItem4);
    menuRecentFiles = new wxMenu();
    MenuItem23 = new wxMenuItem(menuRecentFiles, toBeDeletedMenuItem, _("useless"), wxEmptyString, wxITEM_NORMAL);
    menuRecentFiles->Append(MenuItem23);
    fileMenu.Append(ID_MENUITEM26, _("Recently opened"), menuRecentFiles, wxEmptyString);
    fileMenu.AppendSeparator();
    MenuItem6 = new wxMenuItem((&fileMenu), ID_MENUITEM12, _("Save\tCtrl+S"), wxEmptyString, wxITEM_NORMAL);
    MenuItem6->SetBitmap(gd::SkinHelper::GetIcon("save", 16));
    fileMenu.Append(MenuItem6);
    MenuItem7 = new wxMenuItem((&fileMenu), ID_MENUITEM13, _("Save as..."), wxEmptyString, wxITEM_NORMAL);
    MenuItem7->SetBitmap(gd::SkinHelper::GetIcon("saveas", 16));
    fileMenu.Append(MenuItem7);
    MenuItem5 = new wxMenuItem((&fileMenu), ID_MENUITEM8, _("Save as folder project"), wxEmptyString, wxITEM_NORMAL);
    MenuItem5->SetBitmap(gd::SkinHelper::GetIcon("open", 16));
    fileMenu.Append(MenuItem5);
    MenuItem12 = new wxMenuItem((&fileMenu), ID_MENUITEM16, _("Save all\tCtrl+Shift+S"), wxEmptyString, wxITEM_NORMAL);
    MenuItem12->SetBitmap(gd::SkinHelper::GetIcon("save_all", 16));
    fileMenu.Append(MenuItem12);
    fileMenu.AppendSeparator();
    fileMenu.AppendSeparator();
    MenuItem15 = new wxMenuItem((&fileMenu), ID_MENUITEM19, _("Close the current project"), wxEmptyString, wxITEM_NORMAL);
    MenuItem15->SetBitmap(gd::SkinHelper::GetIcon("close", 16));
    fileMenu.Append(MenuItem15);
    fileMenu.AppendSeparator();
    MenuItem13 = new wxMenuItem((&fileMenu), ID_MENUITEM17, _("Options"), wxEmptyString, wxITEM_NORMAL);
    MenuItem13->SetBitmap(gd::SkinHelper::GetIcon("options", 16));
    fileMenu.Append(MenuItem13);
    fileMenu.AppendSeparator();
    MenuItem22 = new wxMenuItem((&fileMenu), ID_MENUITEM27, _("Help\tF1"), wxEmptyString, wxITEM_NORMAL);
    MenuItem22->SetBitmap(gd::SkinHelper::GetIcon("help", 16));
    fileMenu.Append(MenuItem22);
    fileMenu.AppendSeparator();
    MenuItem8 = new wxMenuItem((&fileMenu), ID_MENUITEM14, _("Quit"), _("Quit GDevelop"), wxITEM_NORMAL);
    fileMenu.Append(MenuItem8);
    menuRecentFiles->Delete(toBeDeletedMenuItem);
    MenuItem16 = new wxMenuItem((&helpMenu), ID_MENUITEM20, _("Help"), wxEmptyString, wxITEM_NORMAL);
    MenuItem16->SetBitmap(gd::SkinHelper::GetIcon("help", 16));
    helpMenu.Append(MenuItem16);
    MenuItem19 = new wxMenuItem((&helpMenu), ID_MENUITEM23, _("Tutorial"), wxEmptyString, wxITEM_NORMAL);
    helpMenu.Append(MenuItem19);
    helpMenu.AppendSeparator();
    MenuItem21 = new wxMenuItem((&helpMenu), ID_MENUITEM25, _("Check for updates"), wxEmptyString, wxITEM_NORMAL);
    helpMenu.Append(MenuItem21);
    helpMenu.AppendSeparator();
    MenuItem20 = new wxMenuItem((&helpMenu), ID_MENUITEM24, _("Official web site"), wxEmptyString, wxITEM_NORMAL);
    MenuItem20->SetBitmap(gd::SkinHelper::GetIcon("site", 16));
    helpMenu.Append(MenuItem20);
    MenuItem17 = new wxMenuItem((&helpMenu), ID_MENUITEM21, _("About..."), wxEmptyString, wxITEM_NORMAL);
    MenuItem17->SetBitmap(wxBitmap(wxImage(_T("res/icon16.png"))));
    helpMenu.Append(MenuItem17);
    MenuItem11 = new wxMenuItem((&disabledFileMenu), ID_MENUITEM3, _("Please stop the preview before continuing"), wxEmptyString, wxITEM_NORMAL);
    disabledFileMenu.Append(MenuItem11);
    MenuItem11->Enable(false);
    SetSizer(FlexGridSizer1);
    Layout();
    Center();

    Connect(ID_AUINOTEBOOK1,wxEVT_COMMAND_AUINOTEBOOK_PAGE_CLOSE,(wxObjectEventFunction)&MainFrame::OneditorsNotebookPageClose);
    Connect(ID_AUINOTEBOOK1,wxEVT_COMMAND_AUINOTEBOOK_PAGE_CHANGED,(wxObjectEventFunction)&MainFrame::OnNotebook1PageChanged);
    Connect(ID_MENUITEM1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnOpenExampleSelected);
    Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnMenuSaveAsSelected);
    Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnDecomposeGIFSelected);
    Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnDecomposeRPGSelected);
    Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnDecomposeSSSelected);
    Connect(ID_TIMER1,wxEVT_TIMER,(wxObjectEventFunction)&MainFrame::OnautoSaveTimerTrigger);
    Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnMenuNewSelected);
    Connect(ID_MENUITEM9,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnMenuOpenSelected);
    Connect(ID_MENUITEM10,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnOpenExampleSelected);
    Connect(ID_MENUITEM12,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnMenuSaveSelected);
    Connect(ID_MENUITEM13,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnMenuSaveAsSelected);
    Connect(ID_MENUITEM8,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnMenuSaveAsFolderSelected);
    Connect(ID_MENUITEM16,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnMenuSaveAllSelected);
    Connect(ID_MENUITEM19,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnCloseCurrentProjectSelected);
    Connect(ID_MENUITEM17,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnMenuPrefSelected);
    Connect(ID_MENUITEM27,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnMenuAideSelected);
    Connect(ID_MENUITEM14,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnQuit);
    Connect(ID_MENUITEM20,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnMenuAideSelected);
    Connect(ID_MENUITEM23,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnMenuTutoSelected);
    Connect(ID_MENUITEM25,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnMenuItem36Selected);
    Connect(ID_MENUITEM24,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnMenuSiteSelected);
    Connect(ID_MENUITEM21,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&MainFrame::OnAbout);
    Connect(wxID_ANY,wxEVT_CLOSE_WINDOW,(wxObjectEventFunction)&MainFrame::OnClose);
    Connect(wxEVT_SIZE,(wxObjectEventFunction)&MainFrame::OnResize);
    //*)
    Connect( wxID_FILE1, wxID_FILE9, wxEVT_COMMAND_MENU_SELECTED, ( wxObjectEventFunction )&MainFrame::OnRecentClicked );
    Connect( idRibbonNew, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnMenuNewSelected );
    Connect( idRibbonOpen, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnMenuOpenSelected );
    Connect( idRibbonOpen, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&MainFrame::OnRibbonOpenDropDownClicked );
    Connect( idRibbonSave, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnMenuSaveSelected );
    Connect( idRibbonSave, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&MainFrame::OnRibbonSaveDropDownClicked );
    Connect( idRibbonSaveAll, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnRibbonSaveAllClicked );
    Connect( idRibbonOptions, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnMenuPrefSelected );
    Connect( idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnMenuAideSelected );
    Connect( idRibbonTuto, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnMenuTutoSelected );
    Connect( idRibbonForum, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnMenuForumSelected );
    Connect( idRibbonUpdate, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnMenuItem36Selected );
    Connect( idRibbonWebSite, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnMenuSiteSelected );
    Connect( idRibbonCredits, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnAbout );
    Connect( ID_RIBBON, wxEVT_COMMAND_RIBBONBAR_PAGE_CHANGING, ( wxObjectEventFunction )&MainFrame::OnRibbonPageChanging );
    Connect( ID_RIBBON, wxEVT_COMMAND_RIBBONBAR_HELP_CLICKED, ( wxObjectEventFunction )&MainFrame::OnRibbonHelpBtClick );
    Connect( ID_RIBBON, wxEVT_COMMAND_RIBBONBAR_TOGGLED, ( wxObjectEventFunction )&MainFrame::OnRibbonToggleBtClick );
    Connect( wxID_ANY, wxEVT_ACTIVATE, ( wxObjectEventFunction )&MainFrame::OnActivate );

    #ifdef GD_NO_UPDATE_CHECKER //Remove the menu item to check for updates
    helpMenu.Delete(MenuItem21); //(useful when GD is distributed on a system managing updates by itself).
    #endif

    editorsManager.SetNotebook(editorsNotebook);
    editorsManager.ShouldDisplayPrefix([this]() {
        return games.size() > 1;
    });

    //Update the file menu with exporting items
    for ( std::size_t i = 0; i < gd::PlatformManager::Get()->GetAllPlatforms().size(); ++i )
    {
        auto exporters = gd::PlatformManager::Get()->GetAllPlatforms()[i]->GetProjectExporters();
        for( std::size_t j = 0; j < exporters.size(); ++j )
        {
            auto exporter = exporters[j];
            if ( exporter != std::shared_ptr<gd::ProjectExporter>()
                 && !exporter->GetProjectExportButtonLabel().empty() )
            {
                long id = wxNewId();

                fileMenu.Insert(11, id, exporter->GetProjectExportButtonLabel());
                Connect( id, wxEVT_COMMAND_MENU_SELECTED, ( wxObjectEventFunction )&MainFrame::OnMenuCompilationSelected );
                idToPlatformExportMenuMap[id] = std::make_pair(gd::PlatformManager::Get()->GetAllPlatforms()[i].get(), j);
            }
        }
    }

    wxIconBundle icons;
    icons.AddIcon("res/icon16.png");
    icons.AddIcon("res/icon24.png");
    #if defined(LINUX) || defined(MACOS)
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

    //Set the content scale factor, for "retina" screens support.
    gd::GUIContentScaleFactor::Set(GetContentScaleFactor());

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
    wxStatusBar * statusBar = new wxStatusBar(this);
    static int widths[2] = { -1, 175 };
    statusBar->SetFieldsCount(2);
    statusBar->SetStatusWidths(2, widths);
    statusBar->SetStatusText("2008-2017", 1);
    SetStatusBar(statusBar);

    std::vector<wxWindow*> controlsToBeDisabledOnPreview; //Used below:

    //Ribbon setup
    ribbon = new wxRibbonBar(this, ID_RIBBON);
    ribbon->SetWindowStyle(wxRIBBON_BAR_DEFAULT_STYLE);
    bool hideLabels = false;
    pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );
    {
        wxRibbonPage * ribbonProjectPage = new wxRibbonPage(ribbon, wxID_ANY, _("Projects"));
        ProjectManager::CreateRibbonPage(ribbonProjectPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(ribbon, wxID_ANY, _("Images bank"));
        //
        {
            wxRibbonPanel *ribbonPanel = new wxRibbonPanel(ribbonEditorPage, wxID_ANY, _("Adding resources"), gd::SkinHelper::GetRibbonIcon("list"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
            wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
            ribbonBar->AddButton(ResourcesEditor::idRibbonAdd, !hideLabels ? _("Add an image") : gd::String(), gd::SkinHelper::GetRibbonIcon("add"), _("Add an image to the resources"));
            ribbonBar->AddButton(ResourcesEditor::idRibbonAddFromLibrary, !hideLabels ? _("Add from the library") : gd::String(), gd::SkinHelper::GetRibbonIcon("addFromLibrary"), _("Add an image from a library of images"));
            ribbonBar->AddButton(ResourcesEditor::idRibbonAddDossier, !hideLabels ? _("Add a virtual folder") : gd::String(), gd::SkinHelper::GetRibbonIcon("virtualfolderadd"), _("Add a virtual folder to organize resources"));
            controlsToBeDisabledOnPreview.push_back(ribbonBar);
        }
        {
            wxRibbonPanel *ribbonPanel = new wxRibbonPanel(ribbonEditorPage, wxID_ANY, _("List management"), gd::SkinHelper::GetRibbonIcon("list"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
            wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
            ribbonBar->AddButton(ResourcesEditor::idRibbonDel, !hideLabels ? _("Delete") : gd::String(), gd::SkinHelper::GetRibbonIcon("delete"), _("Delete the selected resource"));
            ribbonBar->AddButton(ResourcesEditor::idRibbonDeleteUnused, !hideLabels ? _("Remove useless resources") : gd::String(), gd::SkinHelper::GetRibbonIcon("deleteunknown"), _("Check if there are useless resources that can be removed"));
            ribbonBar->AddButton(ResourcesEditor::idRibbonUp, !hideLabels ? _("Move up") : gd::String(), gd::SkinHelper::GetRibbonIcon("up"));
            ribbonBar->AddButton(ResourcesEditor::idRibbonDown, !hideLabels ? _("Move down") : gd::String(), gd::SkinHelper::GetRibbonIcon("down"));
            ribbonBar->AddButton(ResourcesEditor::idRibbonRefresh, !hideLabels ? _("Refresh") : gd::String(), gd::SkinHelper::GetRibbonIcon("refresh"), _("Refresh the list, if you've done changes in another window"));
            controlsToBeDisabledOnPreview.push_back(ribbonBar);
        }

        {
            wxRibbonPanel *ribbonPanel = new wxRibbonPanel(ribbonEditorPage, wxID_ANY, _("View"), gd::SkinHelper::GetRibbonIcon("edit"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
            wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
            ribbonBar->AddButton(ResourcesEditor::idRibbonShowPreview, !hideLabels ? _("Preview") : gd::String(), gd::SkinHelper::GetRibbonIcon("view"), _("Show a panel with the image displayed inside"));
            ribbonBar->AddButton(ResourcesEditor::idRibbonShowPropertyGrid, !hideLabels ? _("Properties") : gd::String(), gd::SkinHelper::GetRibbonIcon("editprop"), _("Show the properties of the resource"));
            controlsToBeDisabledOnPreview.push_back(ribbonBar);
        }
        {
            wxRibbonPanel *ribbonPanel = new wxRibbonPanel(ribbonEditorPage, wxID_ANY, _("Help"), gd::SkinHelper::GetRibbonIcon("help"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
            wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
            ribbonBar->AddButton(ResourcesEditor::idRibbonHelp, !hideLabels ? _("Help") : gd::String(), gd::SkinHelper::GetRibbonIcon("help"), _("Open the online help"));
            controlsToBeDisabledOnPreview.push_back(ribbonBar);
        }
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(ribbon, wxID_ANY, _("Scene"));
        ribbonSceneEditorButtonBar = gd::LayoutEditorCanvas::CreateRibbonPage(ribbonEditorPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(ribbon, wxID_ANY, _("Events"));
        EventsEditor::CreateRibbonPage(ribbonEditorPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(ribbon, wxID_ANY, _("Objects"));
        gd::ObjectsEditor::CreateRibbonPage(ribbonEditorPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(ribbon, wxID_ANY, _("Code"));
        CodeEditor::CreateRibbonPage(ribbonEditorPage);
    }
    ribbon->Realize();
    ribbonSizer->Add(ribbon, 0, wxEXPAND);

    //Create ribbon "File" custom button
    ribbonFileBt = new wxStaticBitmap(ribbon, idRibbonFileBt, wxNullBitmap);
    ribbonFileBt->Connect(wxEVT_LEAVE_WINDOW, wxMouseEventHandler(MainFrame::OnRibbonFileBtLeave), NULL, this);
    ribbonFileBt->Connect(wxEVT_ENTER_WINDOW, wxMouseEventHandler(MainFrame::OnRibbonFileBtEnter), NULL, this);
    ribbonFileBt->Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(MainFrame::OnRibbonFileBtClick), NULL, this);

    //Load wxAUI
    m_mgr.SetManagedWindow( this );

    gd::SkinHelper::ApplyCurrentSkin(m_mgr);
    gd::SkinHelper::ApplyCurrentSkin(*editorsNotebook);
    gd::SkinHelper::ApplyCurrentSkin(*ribbon);

    RealizeRibbonCustomButtons();

    //Create start page
    editorsManager.AddPage(new StartHerePage(editorsNotebook, *this));

    //Create project manager
    projectManager = new ProjectManager(this, *this);
    projectManager->ConnectEvents();

    //Create project properties panel
    projectPropertiesPnl = new ProjectPropertiesPnl(this);

    //Create build tools panel
    buildToolsPnl = new BuildToolsPnl(this, projectManager);

    //Setup panes and load user configuration
    m_mgr.AddPane( projectManager, wxAuiPaneInfo().Name( wxT( "PM" ) ).Caption( _( "Project manager" ) ).Left().MaximizeButton( true ).MinimizeButton( false ).MinSize(170,100) );
    m_mgr.AddPane( Panel1, wxAuiPaneInfo().Name( wxT( "EP" ) ).Caption( _( "Main editor" ) ).Center().CaptionVisible(false).CloseButton( false ).MaximizeButton( true ).MinimizeButton( false ) );
    m_mgr.AddPane( ribbon, wxAuiPaneInfo().Name( wxT( "RP" ) ).Caption( _( "Ribbon" ) ).Top().PaneBorder(false).CaptionVisible(false).Movable(false).Floatable(false).CloseButton( false ).MaximizeButton( false ).MinimizeButton( false ).Resizable(false) );
    m_mgr.AddPane( buildToolsPnl, wxAuiPaneInfo().Name( wxT( "CT" ) ).Caption( _( "Compilation tools" ) ).Bottom().MaximizeButton( true ).MinimizeButton( false ).Show(false).MinSize(120,130));
    m_mgr.AddPane( projectPropertiesPnl, wxAuiPaneInfo().Name( wxT( "PP" ) ).Caption( _( "Project properties" ) ).Float().Show(false) );

    wxString result;
    pConfig->Read( _T( "/Workspace/Actuel" ), &result );
    if ( result != "" )
        m_mgr.LoadPerspective( result , true );

    //Ensure that names are corrected ( Useful in particular to ensure that these name are in the selected language ).
    m_mgr.GetPane(projectManager).Caption(_( "Project manager" ));
    m_mgr.GetPane(buildToolsPnl).Caption(_( "Compilation tools" ));
    m_mgr.GetPane(projectPropertiesPnl).Caption(_( "Project properties" ));

    //Change ribbon pane height.
    bool hidePanels = false;
    pConfig->Read( _T( "/Skin/HidePanels" ), &hidePanels );
    ribbon->ShowPanels(!hidePanels);
    m_mgr.GetPane(ribbon).MinSize(1, ribbon->GetBestSize().GetHeight()+4);

    m_mgr.SetFlags( wxAUI_MGR_ALLOW_FLOATING | wxAUI_MGR_ALLOW_ACTIVE_PANE | wxAUI_MGR_TRANSPARENT_HINT
                    | wxAUI_MGR_TRANSPARENT_DRAG | wxAUI_MGR_HINT_FADE | wxAUI_MGR_NO_VENETIAN_BLINDS_FADE );

    m_mgr.Update();
    UpdateNotebook();

    infoBar->SetShowHideEffects(wxSHOW_EFFECT_SLIDE_TO_BOTTOM, wxSHOW_EFFECT_BLEND);

    //Construct the lightweight wrapper used by editors to access to the main frame.
    mainFrameWrapper = gd::MainFrameWrapper(ribbon, ribbonSceneEditorButtonBar, this, &m_mgr, editorsNotebook, infoBar, &scenesLockingShortcuts, wxGetCwd());
    mainFrameWrapper.AddControlToBeDisabledOnPreview(projectManager);
    for (std::size_t i = 0;i<controlsToBeDisabledOnPreview.size();++i) mainFrameWrapper.AddControlToBeDisabledOnPreview(controlsToBeDisabledOnPreview[i]);

    SetSize(900,740);
    Center();
    Maximize(true);
}

void MainFrame::OnResize(wxSizeEvent& event)
{
    Layout();
}

/**
 * Destructor : Uninit
 */
MainFrame::~MainFrame()
{
    //(*Destroy(MainFrame)
    //*)
    editorsManager.SetNotebook(NULL);
    Disconnect( wxID_ANY, wxEVT_ACTIVATE, ( wxObjectEventFunction )&MainFrame::OnActivate );

    //Deinitialize the frame manager
    m_mgr.UnInit();
}

void MainFrame::UpdateTitle()
{
    std::shared_ptr<gd::Project> project = GetCurrentGame();
    if (project == std::shared_ptr<gd::Project>())
    {
        SetTitle(baseTitle);
        return;
    }

    SetTitle(baseTitle + " - [" + project->GetName() + "] "+project->GetProjectFile());
}

void MainFrame::SetCurrentGame(std::size_t i, bool refreshProjectManager)
{
    projectCurrentlyEdited = i;
    if ( i >= games.size())
        projectPropertiesPnl->SetProject(NULL); //Update editors displaying current project properties
    else
        projectPropertiesPnl->SetProject(games[i].get()); //Update editors displaying current project properties

    if ( refreshProjectManager ) projectManager->Refresh();
    UpdateTitle();
    return;
}

void MainFrame::UpdateNotebook()
{
    editorsNotebook->SetWindowStyleFlag(wxAUI_NB_TOP | wxAUI_NB_TAB_SPLIT | wxAUI_NB_TAB_MOVE | wxAUI_NB_SCROLL_BUTTONS | wxNO_BORDER );
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
}

/**
 * Show project manager
 */
void MainFrame::OnProjectsManagerClicked(wxRibbonButtonBarEvent& evt)
{
    m_mgr.GetPane(projectManager).Show(true);
    m_mgr.Update();
}

/**
 * Show project manager
 */
void MainFrame::OnRibbonCppToolsClicked(wxRibbonButtonBarEvent& evt)
{
    m_mgr.GetPane(buildToolsPnl).Show(true);
    m_mgr.Update();
}

/**
 * Show the start page
 */
void MainFrame::OnRibbonStartPageClicked(wxRibbonButtonBarEvent& evt)
{
    if (editorsManager.SelectStartHerePage())
        return;

    editorsManager.AddPage(new StartHerePage(this, *this), "", true);
}

void MainFrame::UpdateOpenedProjectsLogFile()
{
    wxTextFile projectsLogFile(wxFileName::GetTempDir()+"/GameDevelopRunning.log");
    if ( projectsLogFile.Exists() ) projectsLogFile.Open();
    else projectsLogFile.Create();

    if ( !projectsLogFile.IsOpened() ) return;
    projectsLogFile.Clear();

    for(std::size_t i = 0;i<games.size();++i)
        projectsLogFile.AddLine(games[i]->GetProjectFile());

    projectsLogFile.Write();
    projectsLogFile.Close();
}

/**
 * Want to close GDevelop
 */
void MainFrame::OnClose( wxCloseEvent& event )
{
    for(std::size_t i = 0;i<games.size();++i) {
        if ( games[i]->IsDirty() ) {
            wxString fullMessage = wxString::Format(wxString(_("Project \"%s\" has been changed.\n\n")), games[i]->GetName().ToWxString());
            fullMessage += wxString::Format(wxString(_("Do you want to save it in %s?")), games[i]->GetProjectFile().ToWxString());
            int whatToDo = wxMessageBox(fullMessage, _("Project not saved"), wxYES_NO|wxCANCEL|wxCANCEL_DEFAULT);

            if (whatToDo == wxCANCEL) return;
            else if ( whatToDo == wxYES ) {
                if (!Save(*games[i], games[i]->GetProjectFile()))
                    gd::LogError( _("Save failed!") );
                else
                    gd::LogStatus( _("Project properly saved.") );
            }
        }

        if (projectManager) projectManager->CloseGame(games[i].get());
    }

    wxConfigBase::Get()->Write( _T( "/Workspace/Actuel" ), m_mgr.SavePerspective() );

    //Log the shutdown
    LogFileManager::Get()->WriteToLogFile("GDevelop shutting down");
    Destroy();
}

/**
 * Add or remove the close button on tab
 */
void MainFrame::OnNotebook1PageChanged(wxAuiNotebookEvent& event)
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

    editorsManager.PageChanged(editorsNotebook->GetPage(event.GetSelection()));
}

void MainFrame::OnRibbonPageChanging(wxRibbonBarEvent& evt)
{
    if ( !scenesLockingShortcuts.empty() )
    {
        evt.Veto();
        infoBar->ShowMessage(_("Please stop the preview before continuing"));
    }
}

void MainFrame::RealizeRibbonCustomButtons()
{
    wxRibbonArtProvider * artProvider = ribbon->GetArtProvider();
    if ( artProvider == NULL ) return;

    wxColor buttonColor;
    if ( !wxConfigBase::Get()->Read( _T( "/Skin/FileButtonColor" ), &buttonColor ) )
        buttonColor = wxColour(145, 0, 206);

    //Create a temporary fake ribbon used to render the button with a custom color
    wxRibbonBar * fakeRibbon = new wxRibbonBar(this);
    fakeRibbon->SetArtProvider(artProvider->Clone());
    fakeRibbon->GetArtProvider()->SetColourScheme(buttonColor, buttonColor, buttonColor);

    //The device context used to render the button in memory
    wxMemoryDC dc;
    double scale = gd::GUIContentScaleFactor::Get();
    dc.SetLogicalScale(scale, scale);
    dc.SetUserScale(1.0/scale, 1.0/scale);

    //Compute width of the bitmap button
    int width; artProvider->GetBarTabWidth(dc, fakeRibbon, _("File"), wxNullBitmap, &width, NULL, NULL, NULL);

    //Create a fake ribbon page...
    wxRibbonPage *page = new wxRibbonPage(fakeRibbon, wxID_ANY, _("File"));
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

    //Compute height of the bitmap button and create bitmap
    int height = artProvider->GetTabCtrlHeight(dc, ribbon, pages);
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
    wxColour backgroundColour = wxColor(bitmapHoveredLabel.ConvertToImage().GetRed(0,0), bitmapHoveredLabel.ConvertToImage().GetGreen(0,0), bitmapHoveredLabel.ConvertToImage().GetBlue(0,0)); //For later use...
    fakeRibbon->GetArtProvider()->DrawTab(dc, fakeRibbon, tabInfo);
    ribbonFileHoveredBitmap = bitmapHoveredLabel;

    //Cut a bit the bottom of the bitmaps
    if ( ribbonFileNormalBitmap.GetSize().GetHeight() > 3 )
        ribbonFileNormalBitmap.SetHeight(ribbonFileNormalBitmap.GetSize().GetHeight()-2);

    if ( ribbonFileHoveredBitmap.GetSize().GetHeight() > 3 )
        ribbonFileHoveredBitmap.SetHeight(ribbonFileHoveredBitmap.GetSize().GetHeight()-2);

    fakeRibbon->Destroy();

    //Finally create our bitmaps and make sure the ribbon is ready.
    ribbonFileBt->SetPosition(wxPoint(3,1));
    ribbonFileBt->SetBitmap(ribbonFileNormalBitmap);
    ribbon->SetTabCtrlMargins(bitmapLabel.GetSize().GetWidth()+3+3, 0);
}

void MainFrame::OneditorsNotebookPageClose(wxAuiNotebookEvent& event)
{
    if ( CodeEditor * editor = dynamic_cast<CodeEditor*>(editorsNotebook->GetPage(event.GetSelection())) )
    {
        if ( !editor->QueryClose() )
            event.Veto();
    }
    else if ( EditorScene * editor = dynamic_cast<EditorScene*>(editorsNotebook->GetPage(event.GetSelection())) )
    {
        if ( !editor->CanBeClosed() )
        {
            event.Veto();
            infoBar->ShowMessage(_("Please close the preview before closing the editor."));
        }

        //Save the event to log file
        LogFileManager::Get()->WriteToLogFile("Closed layout "+editor->GetLayout().GetName());
    }
}

/**
 * Configure autosaving according to preferences
 */
void MainFrame::PrepareAutosave()
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
void MainFrame::OnautoSaveTimerTrigger(wxTimerEvent& event)
{
    for (std::size_t i = 0;i<games.size();++i)
    {
        wxFileName filename(games[i]->GetProjectFile());
        if (games[i]->GetProjectFile().empty()) continue;
        if (!filename.IsFileWritable()) continue;

        wxString autosaveFilename = filename.GetPath() + "/" + filename.GetName()+".gdg.autosave";
        if (!gd::ProjectFileWriter::SaveToFile(*games[i], autosaveFilename, true))
            gd::LogStatus( _("Autosave failed!") );
    }
}

void MainFrame::OnKeyDown(wxKeyEvent& event)
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
            case 'Q':
            {
                wxCloseEvent uselessEvent;
                OnClose(uselessEvent);
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

void MainFrame::OnRibbonFileBtLeave(wxMouseEvent& event)
{
    ribbonFileBt->SetBitmap(ribbonFileNormalBitmap);
    ribbonFileBt->Refresh();
    ribbonFileBt->Update();
}

void MainFrame::OnRibbonFileBtEnter(wxMouseEvent& event)
{
    ribbonFileBt->SetBitmap(ribbonFileHoveredBitmap);
    ribbonFileBt->Refresh();
    ribbonFileBt->Update();
}

void MainFrame::OnRibbonFileBtClick(wxMouseEvent& event)
{
    if ( scenesLockingShortcuts.empty() )
    {
        for ( auto it = idToPlatformExportMenuMap.cbegin(); it != idToPlatformExportMenuMap.cend(); ++it )
        {
            fileMenu.Enable(it->first, false);
        }

        if ( CurrentGameIsValid() )
        {
            const std::vector<gd::Platform*> & usedPlaftorms = GetCurrentGame()->GetUsedPlatforms();
            for ( auto it = idToPlatformExportMenuMap.cbegin(); it != idToPlatformExportMenuMap.end(); ++it )
            {
                if ( std::find(usedPlaftorms.begin(), usedPlaftorms.end(), it->second.first) != usedPlaftorms.end() )
                    fileMenu.Enable(it->first, true);
            }
        }

        PopupMenu(&fileMenu, ribbonFileBt->GetPosition().x, ribbonFileBt->GetPosition().y+ribbonFileBt->GetSize().GetHeight());
    }
    else
        PopupMenu(&disabledFileMenu, ribbonFileBt->GetPosition().x, ribbonFileBt->GetPosition().y+ribbonFileBt->GetSize().GetHeight());
}

void MainFrame::OnRibbonHelpBtClick(wxRibbonBarEvent & event)
{
    PopupMenu(&helpMenu, ribbon->GetSize().GetWidth()-16, 16);
}

void MainFrame::OnRibbonToggleBtClick(wxRibbonBarEvent & event)
{
    wxConfigBase::Get()->Write(_T( "/Skin/HidePanels" ), !ribbon->ArePanelsShown() );
    m_mgr.GetPane(ribbon).MinSize(1, ribbon->GetBestSize().GetHeight()+4);
    m_mgr.Update();
}

void MainFrame::OnMenuPrefSelected( wxCommandEvent& event )
{
    Preferences Dialog( this );
    Dialog.ShowModal();

    //Reload skins and update controls
    gd::SkinHelper::ApplyCurrentSkin(m_mgr);
    gd::SkinHelper::ApplyCurrentSkin(*editorsNotebook);
    gd::SkinHelper::ApplyCurrentSkin(*ribbon);

    PrepareAutosave();

    UpdateNotebook();
    RealizeRibbonCustomButtons();
    ribbon->Realize();
    m_mgr.Update();
}

void MainFrame::RefreshNews()
{
    if (GetStartPage()) GetStartPage()->RefreshNewsUsingUpdateChecker();
}

StartHerePage* MainFrame::GetStartPage()
{
    int page = editorsManager.GetPageOfStartHerePage();
    if (page != -1)
    {
        if (StartHerePage* startPage = dynamic_cast<StartHerePage*>(editorsNotebook->GetPage(page)))
        {
            return startPage;
        }
    }

    return NULL;
}

void MainFrame::OnMenuItem23Selected(wxCommandEvent& event)
{
    mp3ogg dialog(this);
    dialog.ShowModal();
}

void MainFrame::OnDecomposeGIFSelected(wxCommandEvent& event)
{
    ImportImage dialog(this, 0);
    dialog.ShowModal();
}

void MainFrame::OnDecomposeRPGSelected(wxCommandEvent& event)
{
    ImportImage dialog(this, 1);
    dialog.ShowModal();
}

void MainFrame::OnDecomposeSSSelected(wxCommandEvent& event)
{
    ImportImage dialog(this, 2);
    dialog.ShowModal();
}

void MainFrame::OnRibbonDecomposerDropDownClicked(wxRibbonButtonBarEvent& evt)
{
    evt.PopupMenu(&decomposerContextMenu);
}

void MainFrame::OnActivate(wxActivateEvent& event)
{
    if (event.GetActive())
        editorsManager.PageChanged(editorsNotebook->GetCurrentPage());
    else if (!event.GetActive())
        editorsManager.MainFrameNotDisplayed();

    event.Skip();
}
