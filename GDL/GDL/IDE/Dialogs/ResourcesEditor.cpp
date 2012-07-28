/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "GDL/IDE/Dialogs/ResourcesEditor.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

//(*InternalHeaders(ResourcesEditor)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <boost/algorithm/string.hpp>
#include <wx/choicdlg.h>
#include <wx/toolbar.h>
#include <wx/config.h>
#include <wx/msgdlg.h>
#include <wx/aui/aui.h>
#include <wx/log.h>
#include <wx/filedlg.h>
#include <wx/image.h>
#include <wx/imaglist.h>
#include <wx/textdlg.h>
#include <wx/help.h>
#include <wx/file.h>
#include <wx/dcbuffer.h>
#include <wx/dnd.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/gallery.h>
#include <wx/ribbon/toolbar.h>
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/IDE/ImagesUsedInventorizer.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/Dialogs/ResourceLibraryDialog.h"

#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/Object.h"
#include "GDL/CommonTools.h"
#include "GDL/IDE/DndResourcesEditor.h"
#include "PlatformDefinition/Platform.h"
#include "GDL/IDE/gdTreeItemStringData.h"


#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

//(*IdInit(ResourcesEditor)
const long ResourcesEditor::ID_AUITOOLBAR1 = wxNewId();
const long ResourcesEditor::ID_PANEL2 = wxNewId();
const long ResourcesEditor::ID_TREECTRL1 = wxNewId();
const long ResourcesEditor::ID_TEXTCTRL1 = wxNewId();
const long ResourcesEditor::ID_PANEL4 = wxNewId();
const long ResourcesEditor::ID_PANEL3 = wxNewId();
const long ResourcesEditor::ID_SPLITTERWINDOW1 = wxNewId();
const long ResourcesEditor::ID_PANEL1 = wxNewId();
const long ResourcesEditor::idMenuModProp = wxNewId();
const long ResourcesEditor::idMenuMod = wxNewId();
const long ResourcesEditor::idMenuModFile = wxNewId();
const long ResourcesEditor::idMenuAjouter = wxNewId();
const long ResourcesEditor::idMenuDel = wxNewId();
const long ResourcesEditor::ID_MENUITEM9 = wxNewId();
const long ResourcesEditor::idMoveUp = wxNewId();
const long ResourcesEditor::idMoveDown = wxNewId();
const long ResourcesEditor::ID_MENUITEM1 = wxNewId();
const long ResourcesEditor::ID_MENUITEM2 = wxNewId();
const long ResourcesEditor::ID_MENUITEM3 = wxNewId();
const long ResourcesEditor::ID_MENUITEM5 = wxNewId();
const long ResourcesEditor::ID_MENUITEM6 = wxNewId();
const long ResourcesEditor::ID_MENUITEM4 = wxNewId();
const long ResourcesEditor::ID_MENUITEM7 = wxNewId();
const long ResourcesEditor::ID_MENUITEM8 = wxNewId();
//*)
const long ResourcesEditor::ID_BITMAPBUTTON1 = wxNewId();
const long ResourcesEditor::ID_BITMAPBUTTON5 = wxNewId();
const long ResourcesEditor::ID_BITMAPBUTTON4 = wxNewId();
const long ResourcesEditor::ID_BITMAPBUTTON2 = wxNewId();
const long ResourcesEditor::ID_BITMAPBUTTON3 = wxNewId();
const long ResourcesEditor::ID_BITMAPBUTTON6 = wxNewId();
const long ResourcesEditor::idRibbonAdd = wxNewId();
const long ResourcesEditor::idRibbonAddFromLibrary = wxNewId();
const long ResourcesEditor::idRibbonModProp= wxNewId();
const long ResourcesEditor::idRibbonMod= wxNewId();
const long ResourcesEditor::idRibbonModFile= wxNewId();
const long ResourcesEditor::idRibbonDel= wxNewId();
const long ResourcesEditor::idRibbonAddDossier= wxNewId();
const long ResourcesEditor::idRibbonRemoveDossier= wxNewId();
const long ResourcesEditor::idRibbonUp= wxNewId();
const long ResourcesEditor::idRibbonDown= wxNewId();
const long ResourcesEditor::idRibbonDirectories= wxNewId();
const long ResourcesEditor::idRibbonPaintProgram= wxNewId();
const long ResourcesEditor::idRibbonSearch= wxNewId();
const long ResourcesEditor::idRibbonHelp= wxNewId();
const long ResourcesEditor::idRibbonRefresh = wxNewId();
const long ResourcesEditor::idRibbonDeleteUnused = wxNewId();
const long ResourcesEditor::idMenuResourcesLibrary = wxNewId();


BEGIN_EVENT_TABLE( ResourcesEditor, wxPanel )
    //(*EventTable(ResourcesEditor)
    //*)
END_EVENT_TABLE()

ResourcesEditor::ResourcesEditor( wxWindow* parent, Game & game_, gd::MainFrameWrapper & mainFrameWrapper_, bool useRibbon_ ) :
game(game_),
toolbar(NULL),
filesWatcher(game),
mainFrameWrapper(mainFrameWrapper_),
useRibbon(useRibbon_),
resourceLibraryDialog(new gd::ResourceLibraryDialog(this))
{
    //(*Initialize(ResourcesEditor)
    wxFlexGridSizer* FlexGridSizer4;
    wxFlexGridSizer* FlexGridSizer3;
    wxMenuItem* MenuItem1;
    wxFlexGridSizer* FlexGridSizer2;
    wxMenuItem* MenuItem3;
    wxMenuItem* editMenuItem;
    wxMenuItem* deleteImageItem;
    wxFlexGridSizer* FlexGridSizer1;

    Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
    FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer2->AddGrowableCol(0);
    FlexGridSizer2->AddGrowableRow(0);
    Core = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer4->AddGrowableCol(0);
    FlexGridSizer4->AddGrowableRow(1);
    FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(0);
    toolbarPanel = new wxPanel(Core, ID_PANEL2, wxDefaultPosition, wxSize(-1,25), wxTAB_TRAVERSAL, _T("ID_PANEL2"));
    toolbarPanel->SetForegroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_HIGHLIGHT));
    toolbarPanel->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_HIGHLIGHT));
    if ( useRibbon ) toolbarPanel->Hide();
    AuiManager1 = new wxAuiManager(toolbarPanel, wxAUI_MGR_DEFAULT);
    toolbar = new wxAuiToolBar(toolbarPanel, ID_AUITOOLBAR1, wxDefaultPosition, wxDefaultSize, wxAUI_TB_DEFAULT_STYLE);
    toolbar->Realize();
    AuiManager1->AddPane(toolbar, wxAuiPaneInfo().Name(_T("PaneName")).ToolbarPane().Caption(_("Pane caption")).Layer(10).Top().Gripper(false));
    AuiManager1->Update();
    FlexGridSizer1->Add(toolbarPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer4->Add(FlexGridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SplitterWindow1 = new wxSplitterWindow(Core, ID_SPLITTERWINDOW1, wxDefaultPosition, wxSize(239,271), wxSP_3D, _T("ID_SPLITTERWINDOW1"));
    SplitterWindow1->SetMinSize(wxSize(10,10));
    SplitterWindow1->SetMinimumPaneSize(10);
    SplitterWindow1->SetSashGravity(0.5);
    treePanel = new wxPanel(SplitterWindow1, ID_PANEL4, wxPoint(24,64), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL4"));
    FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer3->AddGrowableCol(0);
    FlexGridSizer3->AddGrowableRow(0);
    resourcesTree = new wxTreeCtrl(treePanel, ID_TREECTRL1, wxDefaultPosition, wxSize(200,170), wxTR_EDIT_LABELS|wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
    resourcesTree->SetToolTip(_("Clic droit sur une image pour accéder aux options"));
    FlexGridSizer3->Add(resourcesTree, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    searchCtrl = new wxSearchCtrl(treePanel, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
    FlexGridSizer3->Add(searchCtrl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    treePanel->SetSizer(FlexGridSizer3);
    FlexGridSizer3->Fit(treePanel);
    FlexGridSizer3->SetSizeHints(treePanel);
    apercuPanel = new wxPanel(SplitterWindow1, ID_PANEL3, wxDefaultPosition, wxSize(200,120), wxSUNKEN_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL3"));
    SplitterWindow1->SplitVertically(treePanel, apercuPanel);
    FlexGridSizer4->Add(SplitterWindow1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Core->SetSizer(FlexGridSizer4);
    FlexGridSizer4->Fit(Core);
    FlexGridSizer4->SetSizeHints(Core);
    FlexGridSizer2->Add(Core, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer2);
    editMenuItem = new wxMenuItem((&ContextMenu), idMenuModProp, _("Modifier les propriétés de l\'image"), wxEmptyString, wxITEM_NORMAL);
    editMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editpropicon.png"))));
    ContextMenu.Append(editMenuItem);
    MenuItem3 = new wxMenuItem((&ContextMenu), idMenuMod, _("Modifier le nom de l\'image"), wxEmptyString, wxITEM_NORMAL);
    MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
    ContextMenu.Append(MenuItem3);
    MenuItem4 = new wxMenuItem((&ContextMenu), idMenuModFile, _("Modifier le fichier de l\'image"), wxEmptyString, wxITEM_NORMAL);
    MenuItem4->SetBitmap(wxBitmap(wxImage(_T("res/openicon.png"))));
    ContextMenu.Append(MenuItem4);
    ContextMenu.AppendSeparator();
    MenuItem1 = new wxMenuItem((&ContextMenu), idMenuAjouter, _("Ajouter une image"), wxEmptyString, wxITEM_NORMAL);
    MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
    ContextMenu.Append(MenuItem1);
    deleteImageItem = new wxMenuItem((&ContextMenu), idMenuDel, _("Supprimer l\'image"), wxEmptyString, wxITEM_NORMAL);
    deleteImageItem->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
    ContextMenu.Append(deleteImageItem);
    MenuItem14 = new wxMenuItem((&ContextMenu), ID_MENUITEM9, _("Supprimer seulement du dossier"), wxEmptyString, wxITEM_NORMAL);
    ContextMenu.Append(MenuItem14);
    ContextMenu.AppendSeparator();
    MenuItem7 = new wxMenuItem((&ContextMenu), idMoveUp, _("Déplacer vers le haut\tCtrl-P"), _("Déplacer l\'image vers le haut dans la liste"), wxITEM_NORMAL);
    MenuItem7->SetBitmap(wxBitmap(wxImage(_T("res/up.png"))));
    ContextMenu.Append(MenuItem7);
    MenuItem8 = new wxMenuItem((&ContextMenu), idMoveDown, _("Déplacer vers le bas"), _("Déplacer l\'image vers le bas dans la liste"), wxITEM_NORMAL);
    MenuItem8->SetBitmap(wxBitmap(wxImage(_T("res/down.png"))));
    ContextMenu.Append(MenuItem8);
    MenuItem2 = new wxMenuItem((&emptyMenu), ID_MENUITEM1, _("Ajouter une image"), wxEmptyString, wxITEM_NORMAL);
    MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
    emptyMenu.Append(MenuItem2);
    emptyMenu.AppendSeparator();
    MenuItem6 = new wxMenuItem((&emptyMenu), ID_MENUITEM2, _("Ajouter un dossier"), wxEmptyString, wxITEM_NORMAL);
    MenuItem6->SetBitmap(wxBitmap(wxImage(_T("res/dossier.png"))));
    emptyMenu.Append(MenuItem6);
    MenuItem9 = new wxMenuItem((&folderMenu), ID_MENUITEM3, _("Renommer"), wxEmptyString, wxITEM_NORMAL);
    MenuItem9->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
    folderMenu.Append(MenuItem9);
    MenuItem13 = new wxMenuItem((&folderMenu), ID_MENUITEM5, _("Supprimer"), wxEmptyString, wxITEM_NORMAL);
    MenuItem13->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
    folderMenu.Append(MenuItem13);
    folderMenu.AppendSeparator();
    MenuItem10 = new wxMenuItem((&folderMenu), ID_MENUITEM6, _("Ajouter une image"), wxEmptyString, wxITEM_NORMAL);
    MenuItem10->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
    folderMenu.Append(MenuItem10);
    folderMenu.AppendSeparator();
    MenuItem5 = new wxMenuItem((&folderMenu), ID_MENUITEM4, _("Ajouter un dossier"), wxEmptyString, wxITEM_NORMAL);
    folderMenu.Append(MenuItem5);
    folderMenu.AppendSeparator();
    MenuItem11 = new wxMenuItem((&folderMenu), ID_MENUITEM7, _("Déplacer vers le haut"), wxEmptyString, wxITEM_NORMAL);
    MenuItem11->SetBitmap(wxBitmap(wxImage(_T("res/up.png"))));
    folderMenu.Append(MenuItem11);
    MenuItem12 = new wxMenuItem((&folderMenu), ID_MENUITEM8, _("Déplacer vers le bas"), wxEmptyString, wxITEM_NORMAL);
    MenuItem12->SetBitmap(wxBitmap(wxImage(_T("res/down.png"))));
    folderMenu.Append(MenuItem12);
    FlexGridSizer2->Fit(this);
    FlexGridSizer2->SetSizeHints(this);

    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_DRAG,(wxObjectEventFunction)&ResourcesEditor::OnresourcesTreeBeginDrag);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_LABEL_EDIT,(wxObjectEventFunction)&ResourcesEditor::OnresourcesTreeBeginLabelEdit);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_END_LABEL_EDIT,(wxObjectEventFunction)&ResourcesEditor::OnresourcesTreeEndLabelEdit);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ResourcesEditor::OnresourcesTreeItemActivated);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ResourcesEditor::OnresourcesTreeSelectionChanged);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_MENU,(wxObjectEventFunction)&ResourcesEditor::OnresourcesTreeItemMenu);
    Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ResourcesEditor::OnsearchCtrlText);
    apercuPanel->Connect(wxEVT_PAINT,(wxObjectEventFunction)&ResourcesEditor::OnapercuPanelPaint,0,this);
    apercuPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&ResourcesEditor::OnapercuPanelResize,0,this);
    Core->Connect(wxEVT_SIZE,(wxObjectEventFunction)&ResourcesEditor::OnResize,0,this);
    Connect(idMenuModProp,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnModPropSelected);
    Connect(idMenuMod,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnModNameImageBtClick);
    Connect(idMenuModFile,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnModFileImage);
    Connect(idMenuAjouter,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnAddImageBtClick);
    Connect(idMenuDel,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnDelImageBtClick);
    Connect(ID_MENUITEM9,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnremoveFolderOnlySelected);
    Connect(idMoveUp,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnMoveUpSelected);
    Connect(idMoveDown,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnMoveDownSelected);
    Connect(ID_MENUITEM1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnAddImageBtClick);
    Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnAddFolderSelected);
    Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnModNameImageBtClick);
    Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnRemoveFolderSelected);
    Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnAddImageBtClick);
    Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnAddFolderSelected);
    Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnMoveUpSelected);
    Connect(ID_MENUITEM8,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ResourcesEditor::OnMoveDownSelected);
    //*)

    CreateToolbar();

    //ResourcesEditor can be used without ribbon
    if ( useRibbon )
    {
        ConnectEvents();
        toolbarPanel->Hide();
        Layout();
    }

    Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&ResourcesEditor::OnRefreshBtClick);
    Connect(ID_BITMAPBUTTON5,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&ResourcesEditor::OnOpenPaintProgramClick);
    Connect(ID_BITMAPBUTTON6,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&ResourcesEditor::OnMoreOptions);
    Connect(ID_BITMAPBUTTON4,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&ResourcesEditor::DossierBt);
    Connect(ID_BITMAPBUTTON2,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&ResourcesEditor::OnChercherBtClick);
    Connect(ID_BITMAPBUTTON3,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&ResourcesEditor::OnAideBtClick);
    Connect(idMenuResourcesLibrary,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&ResourcesEditor::OnAddFromLibraryBtClick);


    SetDropTarget(new DndTextResourcesEditor(*this));

    Refresh();

    SplitterWindow1->Unsplit(treePanel);
    SplitterWindow1->Unsplit(apercuPanel);
    if ( GetSize().GetWidth() > 350 )
        SplitterWindow1->SplitVertically(treePanel, apercuPanel);
    else
        SplitterWindow1->SplitHorizontally(treePanel, apercuPanel);
}

/**
 * Adapt splitterwindow and toolbar when resizing
 */
void ResourcesEditor::OnResize(wxSizeEvent& event)
{
    if ( !useRibbon )
        toolbarPanel->SetSize(event.GetSize().GetWidth(), toolbarPanel->GetSize().GetHeight());

    SplitterWindow1->Unsplit(treePanel);
    SplitterWindow1->Unsplit(apercuPanel);
    if ( GetSize().GetWidth() > 350 )
        SplitterWindow1->SplitVertically(treePanel, apercuPanel);
    else
        SplitterWindow1->SplitHorizontally(treePanel, apercuPanel);

    SplitterWindow1->SetSize(event.GetSize());

    apercuPanel->Refresh();
    apercuPanel->Update();
}

void ResourcesEditor::OnapercuPanelResize(wxSizeEvent& event)
{
    apercuPanel->Refresh();
    apercuPanel->Update();
}

ResourcesEditor::~ResourcesEditor()
{
    //(*Destroy(ResourcesEditor)
    //*)

    AuiManager1->UnInit();
}

void ResourcesEditor::ConnectEvents()
{
    if ( !useRibbon ) return;

    mainFrameWrapper.GetMainEditor()->Connect(idRibbonAdd, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnAddImageBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonAddFromLibrary, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnAddFromLibraryBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDel, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnDelImageBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonModProp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnModPropSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonMod, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnModNameImageBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonModFile, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnModFileImage, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonAddDossier, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnAddFolderSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonUp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnMoveUpSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDown, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnMoveDownSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDirectories, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::DossierBt, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonPaintProgram, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnOpenPaintProgramClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonSearch, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnChercherBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnAideBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonRefresh, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnRefreshBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDeleteUnused, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ResourcesEditor::OnDeleteUnusedFiles, NULL, this);
}

/*void ResourcesEditor::CreateRibbonPage(wxRibbonPage * page)
{
    //After updating to wxWidgets 2.9.2 ( SVN ), buttons are not created correctly if we create them from here.
}*/

////////////////////////////////////////////////////////////
/// Création de la toolbar
////////////////////////////////////////////////////////////
void ResourcesEditor::CreateToolbar()
{
    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( idMenuAjouter, _( "Ajouter une image" ), wxBitmap( wxImage( "res/addicon.png" ) ), _("Ajouter une image") );
    toolbar->AddTool( idMenuResourcesLibrary, _( "Ouvrir la bibliothèque de ressources" ), wxBitmap( wxImage( "res/package16.png" ) ), _("Ouvrir la bibliothèque de ressources") );
    toolbar->AddTool( idMenuDel, _( "Supprimer l'image selectionnée" ), wxBitmap( wxImage( "res/deleteicon.png" ) ), _("Supprimer l'image selectionnée") );
    toolbar->AddTool( idMenuModProp, _( "Modifier les propriétés de l'image" ), wxBitmap( wxImage( "res/editpropicon.png" ) ), _("Modifier les propriétés de l'image") );
    toolbar->AddTool( ID_BITMAPBUTTON6, _( "Plus d'options d'édition ( clic droit sur la liste )" ), wxBitmap( wxImage( "res/moreicon.png" ) ), _("Plus d'options d'édition ( clic droit sur la liste )") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_BITMAPBUTTON5, _( "Ouvrir l'image avec un éditeur" ), wxBitmap( wxImage( "res/paint.png" ) ), _("Ouvrir l'image avec un éditeur") );
    toolbar->AddTool( ID_BITMAPBUTTON4, _( "Naviguer dans les dossiers" ), wxBitmap( wxImage( "res/dossier.png" ) ), _("Naviguer dans les dossiers") );
    toolbar->AddTool( ID_BITMAPBUTTON2, _( "Rechercher une image" ), wxBitmap( wxImage( "res/searchicon.png" ) ), _("Rechercher une image") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_BITMAPBUTTON3, _( "Aide de l'éditeur de la banque d'images" ), wxBitmap( wxImage( "res/helpicon.png" ) ), _("Aide de l'éditeur de la banque d'images") );
    toolbar->Realize();
}

wxTreeItemId ResourcesEditor::GetSelectedFolderItem()
{
    wxTreeItemId item = m_itemSelected;

    if ( !item.IsOk() ) return resourcesTree->GetRootItem();

    gdTreeItemStringData * data = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(item));
    while ( item.IsOk() && data && data->GetString() != "Folder" && data->GetString() != "BaseFolder" )
    {
        item = resourcesTree->GetItemParent(item);
        data = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(item));
    }

    return item.IsOk() ? item : resourcesTree->GetRootItem();
}

/**
 * Add a new image
 */
void ResourcesEditor::OnAddImageBtClick( wxCommandEvent& event )
{
    wxFileDialog FileDialog( this, _("Choisissez une ou plusieurs images à ajouter"), "", "", _("Images supportées|*.bmp;*.gif;*.jpg;*.png;*.tga;*.dds|Tous les fichiers|*.*"), wxFD_MULTIPLE );

    if ( FileDialog.ShowModal() == wxID_OK )
    {
        wxLogStatus( _( "Ajout des images" ) );

        wxArrayString files;
        FileDialog.GetPaths( files );
        string imageNonAjoutees;

        //Find current folder, if any.
        ResourceFolder * currentFolder = NULL;
        wxTreeItemId currentFolderItem = GetSelectedFolderItem();
        gdTreeItemStringData * currentFolderData = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData( currentFolderItem ));
        if ( currentFolderData && currentFolderData->GetString() == "Folder" )
        {
            if ( game.resourceManager.HasFolder(currentFolderData->GetSecondString()) )
                currentFolder = &game.resourceManager.GetFolder(currentFolderData->GetSecondString());
        }

        //Add each image to images list and to folder if any
        std::vector < std::string > filenames;
        for ( unsigned int i = 0; i < files.GetCount();++i )
            filenames.push_back(ToString(files[i]));

        AddResources(filenames);

        wxLogStatus( _( "Ajouts des ressources effectué avec succès" ) );
    }

}

void ResourcesEditor::CopyAndAddResources(std::vector<std::string> filenames, const std::string & destinationDirStr)
{
    if ( !game.GetProjectFile().empty() ) //If game is not saved, we keep absolute filenames and do not copy resources.
    {
        //Copy all resources into the destination directory
        wxString projectDirectory = wxFileName::FileName(game.GetProjectFile()).GetPath();

        wxFileName destinationDir = wxFileName::FileName(destinationDirStr+"/");
        destinationDir.MakeAbsolute(projectDirectory);
        for (unsigned int i = 0;i<filenames.size();++i)
        {
            wxString name = wxFileName::FileName(filenames[i]).GetFullName();
            wxFileName destinationFile = wxFileName::FileName(destinationDir.GetPath()+"/"+name);

            wxLogStatus( _( "Copie de " ) + name );

            //Copy the resource
            wxCopyFile(filenames[i], destinationFile.GetFullPath(), true);
            filenames[i] = destinationFile.GetFullPath();
        }
    }

    AddResources(filenames);
}

void ResourcesEditor::AddResources(const std::vector<std::string> & filenames)
{
    string alreadyExistingResources;

    //Find current folder, if any.
    ResourceFolder * currentFolder = NULL;
    wxTreeItemId currentFolderItem = GetSelectedFolderItem();
    gdTreeItemStringData * currentFolderData = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData( currentFolderItem ));
    if ( currentFolderData && currentFolderData->GetString() == "Folder" )
    {
        if ( game.resourceManager.HasFolder(currentFolderData->GetSecondString()) )
            currentFolder = &game.resourceManager.GetFolder(currentFolderData->GetSecondString());
    }

    wxString projectDirectory = wxFileName::FileName(game.GetProjectFile()).GetPath();

    //Add each resource to the list and to the folder if any
    for ( unsigned int i = 0; i < filenames.size();++i )
    {
        wxFileName file = wxFileName::FileName(filenames[i]);
        if (!projectDirectory.empty())  //If game is not saved, we keep absolute filenames
            file.MakeRelativeTo(projectDirectory);

        std::string name = ToString(file.GetFullName());

        wxLogStatus( _( "Ajout de l'image " ) + name );

        boost::shared_ptr<ImageResource> image(new ImageResource);
        image->file = file.GetFullPath();
        image->name = name;

        //Add to all images
        if ( !game.resourceManager.HasResource(name) )
        {
            game.resourceManager.resources.push_back(image);
            game.imagesChanged.push_back(name);

            resourcesTree->AppendItem( allImagesItem, name, -1, -1, new gdTreeItemStringData("Image", name));
        }
        else
            alreadyExistingResources += "\n"+name;

        //Add image to folder if a folder is selected
        if ( currentFolder && !currentFolder->HasResource(name) )
        {
            currentFolder->resources.push_back(image);
            resourcesTree->AppendItem( currentFolderItem, name, -1, -1, new gdTreeItemStringData("Image", name));
        }
    }

    resourcesTree->ExpandAll();

    if ( !alreadyExistingResources.empty() )
        wxLogMessage(wxString(_("Des images portant le même nom sont déjà présentes, et n'ont pas été ajoutées à la liste de toutes les images :")+alreadyExistingResources));
}

void ResourcesEditor::OnAddFromLibraryBtClick( wxCommandEvent& event )
{
    resourceLibraryDialog->Show(true);
}

void ResourcesEditor::OnremoveFolderOnlySelected(wxCommandEvent& event)
{
    gdTreeItemStringData * itemData = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(m_itemSelected));

    wxTreeItemId folderItem = GetSelectedFolderItem();
    gdTreeItemStringData * folderData = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(folderItem));

    if ( itemData && folderItem.IsOk() && itemData->GetString() == "Image" && folderData && folderData->GetString() == "Folder" )
    {
        std::string folderName = folderData->GetSecondString();
        if ( !game.resourceManager.HasFolder(folderName) ) return;

        game.resourceManager.GetFolder(folderName).RemoveResource(itemData->GetSecondString());

        resourcesTree->Delete(m_itemSelected);
    }
    else
        wxLogStatus( _( "Aucune image sélectionnée" ) );
}

/**
 * Tool function
 */
void ResourcesEditor::RemoveImageFromTree(wxTreeItemId parent, std::string imageName)
{
    void * cookie;
    wxTreeItemId item = resourcesTree->GetFirstChild( parent, cookie );
    while ( item.IsOk() )
    {
        //Recurse if needed
        if ( resourcesTree->ItemHasChildren(item) )
            RemoveImageFromTree(item, imageName);

        //Delete item if needed
        gdTreeItemStringData * data = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(item));
        if ( data && data->GetSecondString() == imageName && data->GetString() == "Image")
        {
            wxTreeItemId next = resourcesTree->GetNextSibling( item );
            resourcesTree->Delete(item);
            item = next;
        }
        else
            item = resourcesTree->GetNextSibling( item );
    }
}

/**
 * Delete an image from folder/all images
 */
void ResourcesEditor::OnDelImageBtClick( wxCommandEvent& event )
{
    gdTreeItemStringData * itemData = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(m_itemSelected));
    if ( itemData && itemData->GetString() == "Image" )
    {
        std::string imageName = ToString(resourcesTree->GetItemText( m_itemSelected ));

        //Warn the user if the resource is still in use
        //TODO : Activate this when multiple selection is implemented.
        /*{
            //Search in scenes resources
            ImagesUsedInventorizer inventorizer;
            for ( unsigned int i = 0;i < game.GetLayoutCount();i++ )
            {
                for (unsigned int j = 0;j<game.GetLayouts()[i]->GetInitialObjects().size();++j)
                    game.GetLayouts()[i]->GetInitialObjects()[j]->ExposeResources(inventorizer);

                LaunchResourceWorkerOnEvents(game, game.GetLayout(i).GetEvents(), inventorizer);
            }
            //Search in global objects resources
            for (unsigned int j = 0;j<game.GetGlobalObjects().size();++j)
                game.GetGlobalObjects()[j]->ExposeResources(inventorizer);
            //Search in external events
            for ( unsigned int i = 0;i < game.GetExternalEventsCount();i++ )
                LaunchResourceWorkerOnEvents(game, game.GetExternalEvents(i).GetEvents(), inventorizer);

            std::set<std::string> & usedImages = inventorizer.GetAllUsedImages();
            if ( usedImages.find(imageName) != usedImages.end() )
            {
                if ( wxMessageBox(_("Certains élements du projet utilisent cette ressource.\nÊtes vous sûr de vouloir la supprimer ?"), _("Ressource utilisée"), wxYES_NO | wxICON_QUESTION, this) == wxNO )
                    return;
            }
        }*/

        game.resourceManager.RemoveResource(imageName),
        game.imagesChanged.push_back(imageName);
        RemoveImageFromTree( resourcesTree->GetRootItem(), imageName );

        return;

    }
    else if ( itemData && itemData->GetString() == "Folder" )
    {
        game.resourceManager.RemoveFolder(itemData->GetSecondString());
        resourcesTree->Delete(m_itemSelected);
    }
    else
    {
        wxLogStatus( _( "Aucune image sélectionnée" ) );
    }
}

////////////////////////////////////////////////////////////
/// Modification d'une image déjà existante
////////////////////////////////////////////////////////////
void ResourcesEditor::OnModNameImageBtClick( wxCommandEvent& event )
{
    if ( m_itemSelected.IsOk() && resourcesTree->GetChildrenCount( m_itemSelected ) == 0 )
    {
        resourcesTree->EditLabel( m_itemSelected );
    }
    else
    {
        wxLogStatus( _( "Aucune image sélectionnée" ) );
    }
}

////////////////////////////////////////////////////////////
/// Affichage du menu
////////////////////////////////////////////////////////////
void ResourcesEditor::OnresourcesTreeItemMenu( wxTreeEvent& event )
{
    //Editor have focus
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    m_itemSelected = event.GetItem();

    gdTreeItemStringData * data = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(event.GetItem()));
    if ( data && data->GetString() == "Image" )
        PopupMenu( &ContextMenu );
    else if ( data && data->GetString() == "Folder" )
        PopupMenu( &folderMenu);
    else
        PopupMenu( &emptyMenu );
}

////////////////////////////////////////////////////////////
/// Affichage du menu ( plus d'options )
////////////////////////////////////////////////////////////
void ResourcesEditor::OnMoreOptions( wxCommandEvent& event )
{
    PopupMenu( &ContextMenu );
}

////////////////////////////////////////////////////////////
/// Clic sur le bouton de rafraichissement
////////////////////////////////////////////////////////////
void ResourcesEditor::OnRefreshBtClick( wxCommandEvent& event )
{
    Refresh();
}

/**
 * Selecting an image
 */
void ResourcesEditor::OnresourcesTreeSelectionChanged( wxTreeEvent& event )
{
    //Editor have focus
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    string name = ToString(resourcesTree->GetItemText( event.GetItem() ));
    //Changement de l'item sélectionné
    m_itemSelected = event.GetItem();

    gdTreeItemStringData * data = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(event.GetItem()));
    if ( data && data->GetString() == "Image" )
    {
        //Update resource preview
        if ( !game.resourceManager.HasResource(name) )
            return;

        resourceSelected = game.resourceManager.GetResourceSPtr(name);
        apercuPanel->Refresh();
        apercuPanel->Update();
    }

}

/**
 * Tool function
 */
void ResourcesEditor::RenameInTree(wxTreeItemId parent, std::string oldName, std::string newName, std::string type)
{
    void * cookie;
    wxTreeItemId item = resourcesTree->GetFirstChild( parent, cookie );
    while ( item.IsOk() )
    {
        //Recurse if needed
        if ( resourcesTree->ItemHasChildren(item) )
            RenameInTree(item, oldName, newName, type);

        //Delete item if needed
        gdTreeItemStringData * data = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(item));
        if ( data && data->GetSecondString() == oldName && data->GetString() == type)
        {
            resourcesTree->SetItemText(item, newName);
            data->SetSecondString(newName);
        }

        item = resourcesTree->GetNextSibling( item );
    }
}

/**
 * End renaming something
 */
void ResourcesEditor::OnresourcesTreeEndLabelEdit( wxTreeEvent& event )
{
    gdTreeItemStringData * data = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(event.GetItem()));
    if ( !event.IsEditCancelled() && data )
    {
        std::string newName = string(event.GetLabel().mb_str());

        if ( data->GetString() == "Folder" )
        {
            if ( game.resourceManager.HasFolder(newName) )
            {
                wxLogWarning( _( "Impossible de renommer le dossier : un autre dossier porte déjà ce nom." ) );
                event.Veto();
                return;
            }

            if ( game.resourceManager.HasFolder(renamedItemOldName) )
                game.resourceManager.GetFolder(renamedItemOldName).name = newName;

            RenameInTree(resourcesTree->GetRootItem(), renamedItemOldName, newName, "Folder");
        }
        else if ( data->GetString() == "Image" )
        {
            if ( game.resourceManager.HasResource(newName) )
            {
                wxLogWarning( _( "Impossible de renommer l'image : une autre image porte déjà ce nom." ) );
                Refresh();
                return;
            }

            game.resourceManager.RenameResource(renamedItemOldName, newName);

            game.imagesChanged.push_back(renamedItemOldName);
            game.imagesChanged.push_back(newName);

            RenameInTree(resourcesTree->GetRootItem(), renamedItemOldName, newName, "Image");

            return;
        }
    }
}

/**
 * Rename something
 */
void ResourcesEditor::OnresourcesTreeBeginLabelEdit( wxTreeEvent& event )
{
    if ( gdTreeItemStringData * data = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(event.GetItem())) )
    {
        if ( data->GetString() == "BaseFolder" )
            resourcesTree->EndEditLabel( event.GetItem(), true );
        else
            renamedItemOldName = resourcesTree->GetItemText( event.GetItem() );
    }
    else
        resourcesTree->EndEditLabel( event.GetItem(), true );
}

/**
 * Refresh images lists
 */
void ResourcesEditor::Refresh()
{
    resourcesTree->DeleteAllItems();
    resourcesTree->AddRoot( "ImagesBank" );

    //Setup search
    std::string search = boost::to_upper_copy(ToString(searchCtrl->GetValue()));
    bool searching = search.empty() ? false : true;

    //Folders
    for (unsigned int i = 0;i< game.resourceManager.folders.size() ;++i)
    {
        wxTreeItemId folderItem = resourcesTree->AppendItem( resourcesTree->GetRootItem(), game.resourceManager.folders[i].name, -1, -1, new gdTreeItemStringData("Folder", game.resourceManager.folders[i].name ));
        for (unsigned int j=0;j<game.resourceManager.folders[i].resources.size();++j)
        {
            if ( game.resourceManager.folders[i].resources[j] != boost::shared_ptr<Resource>())
            {
                if ( searching && boost::to_upper_copy(game.resourceManager.folders[i].resources[j]->name).find(search) == string::npos)
                    continue;

                resourcesTree->AppendItem( folderItem, game.resourceManager.folders[i].resources[j]->name, -1,-1, new gdTreeItemStringData("Image", game.resourceManager.folders[i].resources[j]->name ));
            }
        }
    }

    //All images
    allImagesItem = resourcesTree->AppendItem( resourcesTree->GetRootItem(), _("Toutes les images"), -1,-1, new gdTreeItemStringData("BaseFolder", "" ));
    for ( unsigned int i = 0;i < game.resourceManager.resources.size();i++ )
    {
        if ( game.resourceManager.resources[i] != boost::shared_ptr<Resource>())
        {
            if ( searching && boost::to_upper_copy(game.resourceManager.resources[i]->name).find(search) == string::npos)
                continue;

            resourcesTree->AppendItem( allImagesItem, game.resourceManager.resources[i]->name, -1, -1, new gdTreeItemStringData("Image", game.resourceManager.resources[i]->name ));
        }
    }

    resourcesTree->Expand( allImagesItem );


    //Not working for now
    /*filesWatcher.RemoveAll();
    wxArrayString alreadyWatchedPaths;
    filesWatcher.GetWatchedPaths(&alreadyWatchedPaths);
    for ( unsigned int i = 0;i < game.resourceManager.resources.size();i++ )
    {
        bool alreadyWatched = false;
        for (unsigned int j = 0;j<alreadyWatchedPaths.size();++j)
        {
            if ( alreadyWatchedPaths[j]==wxFileName(game.resourceManager.resources[i]->GetAbsoluteFile(game)).GetPath() )
                alreadyWatched = true;
        }

        if ( !alreadyWatched )
            filesWatcher.Add(wxFileName(game.resourceManager.resources[i]->GetAbsoluteFile(game)).GetPath());
    }*/
}

void ResourcesEditor::OnDeleteUnusedFiles( wxCommandEvent& event )
{
    //Search in scenes resources
    ImagesUsedInventorizer inventorizer;
    for ( unsigned int i = 0;i < game.GetLayoutCount();i++ )
    {
        for (unsigned int j = 0;j<game.GetLayouts()[i]->GetInitialObjects().size();++j)
        	game.GetLayouts()[i]->GetInitialObjects()[j]->ExposeResources(inventorizer);

        LaunchResourceWorkerOnEvents(game, game.GetLayout(i).GetEvents(), inventorizer);
    }
    //Search in global objects resources
    for (unsigned int j = 0;j<game.GetGlobalObjects().size();++j)
        game.GetGlobalObjects()[j]->ExposeResources(inventorizer);
    //Search in external events
    for ( unsigned int i = 0;i < game.GetExternalEventsCount();i++ )
        LaunchResourceWorkerOnEvents(game, game.GetExternalEvents(i).GetEvents(), inventorizer);

    //Construct a wxArrayString with unused images
    wxArrayString imagesNotUsed;
    wxArrayInt initialSelection;
    std::set<std::string> & usedImages = inventorizer.GetAllUsedImages();
    for ( unsigned int i = 0;i < game.resourceManager.resources.size() ;i++ )
    {
        if ( game.resourceManager.resources[i] == boost::shared_ptr<Resource>() ||
             game.resourceManager.resources[i]->kind != "image" )
            continue;

        if ( usedImages.find(game.resourceManager.resources[i]->name) == usedImages.end() )
        {
            imagesNotUsed.push_back(game.resourceManager.resources[i]->name);
            initialSelection.push_back(imagesNotUsed.size()-1);
        }
    }

    //Request the user to choose which images to remove.
    wxMultiChoiceDialog dialog(this, _("Ces images ne semblent plus être utilisée dans le projet :\nCochez les images à supprimer."), _("Suppression d'images inutiles"), imagesNotUsed, wxDEFAULT_DIALOG_STYLE | wxRESIZE_BORDER | wxOK | wxCANCEL);
    dialog.SetSelections(initialSelection);
    dialog.ShowModal();

    //Remove selection
    wxArrayInt selection = dialog.GetSelections();
    for (unsigned int i = 0;i<selection.size();++i)
    {
        std::string imageName = ToString(imagesNotUsed[selection[i]]);

        game.resourceManager.RemoveResource(imageName);
        RemoveImageFromTree( resourcesTree->GetRootItem(), imageName );
    }
}

////////////////////////////////////////////////////////////
/// Modifier le fichier d'une image
////////////////////////////////////////////////////////////
void ResourcesEditor::OnModFileImage( wxCommandEvent& event )
{
    gdTreeItemStringData * data = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(m_itemSelected));
    if ( !data || data->GetString() != "Image" ) return;

    if ( !game.resourceManager.HasResource(data->GetSecondString()) )
    {
        wxLogStatus( _( "L'image à modifier n'a pas été trouvée." ) );
        return;
    }

    if ( game.resourceManager.GetResource(data->GetSecondString()).EditMainProperty(game) )
        game.imagesChanged.push_back(data->GetSecondString());
}

void ResourcesEditor::OnChercherBtClick( wxCommandEvent& event )
{
}

void ResourcesEditor::OnAideBtClick( wxCommandEvent& event )
{
    if ( GDpriv::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_FRENCH )
        gd::HelpFileAccess::GetInstance()->DisplaySection(9);
    else
        gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/edit_image"));
}

void ResourcesEditor::DossierBt( wxCommandEvent& event )
{
}

/**
 * Modify resource properties
 */
void ResourcesEditor::OnModPropSelected(wxCommandEvent& event)
{
    gdTreeItemStringData * data = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(m_itemSelected));
    if ( !data || data->GetString() != "Image" ) return;

    if ( !game.resourceManager.HasResource(data->GetSecondString()) )
    {
        wxLogWarning(_("La ressource est introuvable."));
        return;
    }

    Resource & resource = game.resourceManager.GetResource(data->GetSecondString());
    if ( resource.EditResource(game) )
        game.imagesChanged.push_back(resource.name);
}

void ResourcesEditor::OnresourcesTreeItemActivated(wxTreeEvent& event)
{
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    wxCommandEvent eventUseless;
    OnModPropSelected( eventUseless );
}

/**
 * Open an external image edition program
 */
void ResourcesEditor::OnOpenPaintProgramClick(wxCommandEvent& event)
{
    gdTreeItemStringData * data = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(m_itemSelected));
    if ( !data || data->GetString() != "Image" || !game.resourceManager.HasResource(data->GetSecondString()) ) return;

    Resource & resource = game.resourceManager.GetResource(data->GetSecondString());

    wxString result;
    wxConfigBase::Get()->Read( "/EditeursExternes/"+resource.kind , &result );

    if ( result.empty() )
    {
        wxFileDialog dialog(this, _("Choisissez le programme pour éditer ce type de ressource"), "", "", _("Programmes (*.exe)|*.exe"));
        dialog.ShowModal();

        wxConfigBase::Get()->Write( _T( "/EditeursExternes/"+resource.kind ), dialog.GetPath() );
        wxConfigBase::Get()->Read( _T( "/EditeursExternes/"+resource.kind ), &result );
    }

    if ( !result.empty() )
        wxExecute(result+" \""+resource.GetAbsoluteFile(game)+"\"");
}

/**
 * Display a preview of the selected image
 */
void ResourcesEditor::OnapercuPanelPaint(wxPaintEvent& event)
{
    wxPaintDC dc( apercuPanel ); //Création obligatoire du wxBufferedPaintDC

    boost::shared_ptr<Resource> resource = resourceSelected.lock();
    if ( resource != boost::shared_ptr<Resource>() )
        resource->RenderPreview(dc, *apercuPanel, game);
    else
    {
        wxSize size = apercuPanel->GetSize();
        dc.SetBrush(wxColour(255,255,255));
        dc.DrawRectangle(0,0, size.GetWidth(), size.GetHeight());

        wxString text = _("Choisissez une ressource dans\nla liste de gauche pour l'afficher.\n\n");
        text += useRibbon ? _("Vous pouvez ajouter et\nmodifier les ressources avec le ruban.") : _("Vous pouvez ajouter et\nmodifier les ressources avec la barre d'outils");
        dc.DrawLabel(text, wxRect(wxPoint(0,0), size),wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL);
    }
}

/**
 * Tool function
 */
void ResourcesEditor::ShiftUpElementOfTree()
{
    wxTreeItemId previous = resourcesTree->GetPrevSibling(m_itemSelected);
    wxString oldText = resourcesTree->GetItemText( m_itemSelected );
    wxTreeItemData * oldData = resourcesTree->GetItemData( m_itemSelected );

    resourcesTree->SetItemText( m_itemSelected, resourcesTree->GetItemText(previous) );
    resourcesTree->SetItemData( m_itemSelected, resourcesTree->GetItemData(previous) );
    resourcesTree->SetItemText( previous, oldText );
    resourcesTree->SetItemData( previous, oldData );

    resourcesTree->SelectItem(previous);
}

/**
 * Move up an image
 */
void ResourcesEditor::OnMoveUpSelected(wxCommandEvent& event)
{
    string name = static_cast< string > ( resourcesTree->GetItemText( m_itemSelected ));
    gdTreeItemStringData * data = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(m_itemSelected));
    if ( !data ) return;

    //Move an image
    if ( data->GetString() == "Image" )
    {
        gdTreeItemStringData * parentFolderData = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(GetSelectedFolderItem()));

        //Move image from base folder
        if ( !parentFolderData || parentFolderData->GetString() == "BaseFolder" )
        {
            int index = -1;
            for (unsigned int i = 0;i<game.resourceManager.resources.size();++i)
            {
                if ( game.resourceManager.resources[i]->name == name)
                {
                    index = i;
                    break;
                }
            }

            if ( index == -1 )
            {
                wxLogStatus( _( "L'image à déplacer n'a pas été trouvée." ) );
                return;
            }
            else if ( index > 0 )
            {
                swap (game.resourceManager.resources[index], game.resourceManager.resources[index-1]);
                ShiftUpElementOfTree();
            }
        }
        //Move an image of a folder
        else if ( parentFolderData && parentFolderData->GetString() == "Folder" )
        {
            for (unsigned int i = 0;i< game.resourceManager.folders.size();++i)
            {
                if ( game.resourceManager.folders[i].name == parentFolderData->GetSecondString() )
                {
                    for (unsigned int j = 1;j<game.resourceManager.folders[i].resources.size();++j)
                    {
                        if ( game.resourceManager.folders[i].resources[j]->name == name )
                        {
                            std::swap(game.resourceManager.folders[i].resources[j], game.resourceManager.folders[i].resources[j-1]);
                            ShiftUpElementOfTree();

                            return;
                        }
                    }
                }
            }
        }

    }
    //Move a folder
    else if ( data->GetString() == "Folder" )
    {
        for (unsigned int i =1;i<game.resourceManager.folders.size();++i)
        {
        	if ( game.resourceManager.folders[i].name == name )
            {
                std::swap(game.resourceManager.folders[i], game.resourceManager.folders[i-1]);
                Refresh();

                return;
            }
        }
    }
}

/**
 * Tool function
 */
void ResourcesEditor::ShiftDownElementOfTree()
{
    wxTreeItemId next = resourcesTree->GetNextSibling(m_itemSelected);
    wxString oldText = resourcesTree->GetItemText( m_itemSelected );
    wxTreeItemData * oldData = resourcesTree->GetItemData( m_itemSelected );

    resourcesTree->SetItemText( m_itemSelected, resourcesTree->GetItemText(next) );
    resourcesTree->SetItemData( m_itemSelected, resourcesTree->GetItemData(next) );
    resourcesTree->SetItemText( next, oldText );
    resourcesTree->SetItemData( next, oldData );

    resourcesTree->SelectItem(next);
}

/**
 * Move down an image
 */
void ResourcesEditor::OnMoveDownSelected(wxCommandEvent& event)
{
    string name = static_cast< string > ( resourcesTree->GetItemText( m_itemSelected ));
    gdTreeItemStringData * data = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(m_itemSelected));
    if ( !data ) return;

    //Move an image
    if ( data->GetString() == "Image" )
    {
        gdTreeItemStringData * parentFolderData = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(GetSelectedFolderItem()));

        //Move image from base folder
        if ( !parentFolderData || parentFolderData->GetString() == "BaseFolder" )
        {
            int index = -1;
            for (unsigned int i = 0;i<game.resourceManager.resources.size();++i)
            {
                if ( game.resourceManager.resources[i]->name == name)
                {
                    index = i;
                    break;
                }
            }

            if ( index == -1 )
            {
                wxLogStatus( _( "L'image à déplacer n'a pas été trouvée." ) );
                return;
            }
            else if ( index+1 < game.resourceManager.resources.size() )
            {
                swap (game.resourceManager.resources[index], game.resourceManager.resources[index+1]);
                ShiftDownElementOfTree();

                return;
            }
        }
        //Move an image of a folder
        else if ( parentFolderData && parentFolderData->GetString() == "Folder" )
        {
            for (unsigned int i = 0;i< game.resourceManager.folders.size();++i)
            {
                if ( game.resourceManager.folders[i].name == parentFolderData->GetSecondString() )
                {
                    for (unsigned int j = 0;j<game.resourceManager.folders[i].resources.size()-1;++j)
                    {
                        if ( game.resourceManager.folders[i].resources[j]->name == name )
                        {
                            std::swap(game.resourceManager.folders[i].resources[j], game.resourceManager.folders[i].resources[j+1]);
                            ShiftDownElementOfTree();

                            return;
                        }
                    }
                }
            }
        }

    }
    //Move a folder
    else if ( data->GetString() == "Folder" )
    {
        for (unsigned int i =0;i<game.resourceManager.folders.size()-1;++i)
        {
        	if ( game.resourceManager.folders[i].name == name )
            {
                std::swap(game.resourceManager.folders[i], game.resourceManager.folders[i+1]);
                Refresh();

                return;
            }
        }
    }
}


/**
 * Show appropriate ribbon page when get focus.
 */
void ResourcesEditor::OnSetFocus(wxFocusEvent& event)
{
    ForceRefreshRibbonAndConnect();
}

void ResourcesEditor::ForceRefreshRibbonAndConnect()
{
    if ( useRibbon )
    {
        mainFrameWrapper.GetRibbon()->SetActivePage(1);
        ConnectEvents();
    }
}

void ResourcesEditor::OnAddFolderSelected(wxCommandEvent& event)
{
    std::string newName = ToString(_("Nouveau dossier"));
    unsigned int i = 1;
    while( game.resourceManager.HasFolder(newName) )
    {
        newName = ToString(_("Nouveau dossier")) + " " + ToString(i);
        ++i;
    }

    game.resourceManager.CreateFolder(newName);

    wxTreeItemId newFolderItem = resourcesTree->AppendItem(resourcesTree->GetRootItem(), newName, -1, -1, new gdTreeItemStringData("Folder", newName));
    resourcesTree->EditLabel(newFolderItem);
}

void ResourcesEditor::OnRemoveFolderSelected(wxCommandEvent& event)
{
}

void ResourcesEditor::OnsearchCtrlText(wxCommandEvent& event)
{
    Refresh();
}

void ResourcesEditor::OnresourcesTreeBeginDrag(wxTreeEvent& event)
{
    gdTreeItemStringData * data = dynamic_cast<gdTreeItemStringData*>(resourcesTree->GetItemData(event.GetItem()));
    if ( !data ) return;

    //Move an image
    if ( data->GetString() == "Image" )
    {
        wxTextDataObject name(ToString( resourcesTree->GetItemText( event.GetItem() )));
        wxDropSource dragSource( this );
        dragSource.SetData( name );
        dragSource.DoDragDrop( true );
    }
}

#endif
