#include "EditorObjectList.h"

//(*InternalHeaders(EditorObjectList)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/toolbar.h>
#include <wx/log.h>
#include <wx/textdlg.h>
#include <wx/help.h>
#include <wx/config.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/gallery.h>
#include <wx/ribbon/toolbar.h>
#include <wx/textdlg.h>
#include <wx/choicdlg.h>
#include <wx/imaglist.h>

#include <string>
#include <vector>

#include "Game_Develop_EditorMain.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/Object.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ExtensionBase.h"
#include "GDL/CommonTools.h"
#include "GDL/Events/CodeCompilationHelpers.h"
#include "Clipboard.h"
#include <algorithm>
#include <numeric>
#include "EditorObjetsGroups.h"
#include "GDL/IDE/Dialogs/BitmapGUIManager.h"
#include "GDL/Automatism.h"
#include "GDL/CommonTools.h"
#include "DndTextObjectsEditor.h"
#include "ObjectTypeChoice.h"
#include "InitialVariablesDialog.h"
#include "GDL/IDE/HelpFileAccess.h"
#include "GDL/AutomatismsSharedDatas.h"
#include "AutomatismTypeChoice.h"
#include "EventsRefactorer.h"

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#include <wx/msw/uxtheme.h>
#endif

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

//(*IdInit(EditorObjectList)
const long EditorObjectList::ID_PANEL4 = wxNewId();
const long EditorObjectList::ID_TREECTRL1 = wxNewId();
const long EditorObjectList::idMenuModObj = wxNewId();
const long EditorObjectList::idMenuModVar = wxNewId();
const long EditorObjectList::ID_MENUITEM2 = wxNewId();
const long EditorObjectList::ID_MENUITEM5 = wxNewId();
const long EditorObjectList::ID_MENUITEM3 = wxNewId();
const long EditorObjectList::ID_MENUITEM1 = wxNewId();
const long EditorObjectList::idMenuEffects = wxNewId();
const long EditorObjectList::idMenuModName = wxNewId();
const long EditorObjectList::idMenuAddObj = wxNewId();
const long EditorObjectList::idMenuDelObj = wxNewId();
const long EditorObjectList::idMoveUp = wxNewId();
const long EditorObjectList::idMoveDown = wxNewId();
const long EditorObjectList::idMenuCopy = wxNewId();
const long EditorObjectList::idMenuCut = wxNewId();
const long EditorObjectList::idMenuPaste = wxNewId();
const long EditorObjectList::ID_MENUITEM4 = wxNewId();
const long EditorObjectList::ID_MENUITEM6 = wxNewId();
const long EditorObjectList::ID_MENUITEM7 = wxNewId();
//*)
const long EditorObjectList::ID_BITMAPBUTTON1 = wxNewId();
const long EditorObjectList::ID_BITMAPBUTTON2 = wxNewId();
const long EditorObjectList::ID_BITMAPBUTTON3 = wxNewId();
const long EditorObjectList::ID_BITMAPBUTTON6 = wxNewId();
const long EditorObjectList::ID_BITMAPBUTTON7 = wxNewId();
const long EditorObjectList::idRibbonAdd = wxNewId();
const long EditorObjectList::idRibbonDel = wxNewId();
const long EditorObjectList::idRibbonUp = wxNewId();
const long EditorObjectList::idRibbonDown = wxNewId();
const long EditorObjectList::idRibbonSearch = wxNewId();
const long EditorObjectList::idRibbonModProp = wxNewId();
const long EditorObjectList::idRibbonModName = wxNewId();
const long EditorObjectList::idRibbonCopy = wxNewId();
const long EditorObjectList::idRibbonCut = wxNewId();
const long EditorObjectList::idRibbonPaste = wxNewId();
const long EditorObjectList::idRibbonHelp = wxNewId();
const long EditorObjectList::idRibbonRefresh = wxNewId();

BEGIN_EVENT_TABLE(EditorObjectList,wxPanel)
	//(*EventTable(EditorObjectList)
	//*)
END_EVENT_TABLE()

EditorObjectList::EditorObjectList(wxWindow* parent, Game & game_, vector < boost::shared_ptr<Object> > * objects_, MainEditorCommand & mainEditorCommand_, Scene * scene_) :
objects(objects_),
game(game_),
scene(scene_),
mainEditorCommand(mainEditorCommand_)
{
	//(*Initialize(EditorObjectList)
	wxMenuItem* delObjMenuI;
	wxMenuItem* editNameMenuI;
	wxMenuItem* editVarMenuI;
	wxMenuItem* editMenuI;
	wxFlexGridSizer* FlexGridSizer1;
	wxMenuItem* addObjMenuI;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	toolbarPanel = new wxPanel(this, ID_PANEL4, wxDefaultPosition, wxSize(-1,0), wxTAB_TRAVERSAL, _T("ID_PANEL4"));
	FlexGridSizer1->Add(toolbarPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	objectsList = new wxTreeCtrl(this, ID_TREECTRL1, wxPoint(-72,-72), wxSize(179,170), wxTR_EDIT_LABELS|wxTR_MULTIPLE|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer1->Add(objectsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	editMenuI = new wxMenuItem((&ContextMenu), idMenuModObj, _("Modifier les propriétés de l\'objet"), wxEmptyString, wxITEM_NORMAL);
	editMenuI->SetBitmap(wxBitmap(wxImage(_T("res/editicon.png"))));
	ContextMenu.Append(editMenuI);
	editVarMenuI = new wxMenuItem((&ContextMenu), idMenuModVar, _("Variables initiales"), wxEmptyString, wxITEM_NORMAL);
	editVarMenuI->SetBitmap(wxBitmap(wxImage(_T("res/var.png"))));
	ContextMenu.Append(editVarMenuI);
	automatismsMenu = new wxMenu();
	automatismsMenu->AppendSeparator();
	addAutomatismItem = new wxMenuItem(automatismsMenu, ID_MENUITEM2, _("Ajouter un automatisme"), wxEmptyString, wxITEM_NORMAL);
	addAutomatismItem->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	automatismsMenu->Append(addAutomatismItem);
	renameAutomatism = new wxMenuItem(automatismsMenu, ID_MENUITEM5, _("Renommer un automatisme"), wxEmptyString, wxITEM_NORMAL);
	renameAutomatism->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
	automatismsMenu->Append(renameAutomatism);
	deleteAutomatismItem = new wxMenuItem(automatismsMenu, ID_MENUITEM3, _("Supprimer un automatisme"), wxEmptyString, wxITEM_NORMAL);
	deleteAutomatismItem->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	automatismsMenu->Append(deleteAutomatismItem);
	ContextMenu.Append(ID_MENUITEM1, _("Automatismes"), automatismsMenu, wxEmptyString);
	effectsMenuI = new wxMenuItem((&ContextMenu), idMenuEffects, _("Effets"), wxEmptyString, wxITEM_NORMAL);
	ContextMenu.Append(effectsMenuI);
	editNameMenuI = new wxMenuItem((&ContextMenu), idMenuModName, _("Modifier le nom de l\'objet"), wxEmptyString, wxITEM_NORMAL);
	editNameMenuI->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
	ContextMenu.Append(editNameMenuI);
	ContextMenu.AppendSeparator();
	addObjMenuI = new wxMenuItem((&ContextMenu), idMenuAddObj, _("Ajouter un objet"), wxEmptyString, wxITEM_NORMAL);
	addObjMenuI->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	ContextMenu.Append(addObjMenuI);
	delObjMenuI = new wxMenuItem((&ContextMenu), idMenuDelObj, _("Supprimer l\'objet\tDel"), wxEmptyString, wxITEM_NORMAL);
	delObjMenuI->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	ContextMenu.Append(delObjMenuI);
	ContextMenu.AppendSeparator();
	moveUpMenuI = new wxMenuItem((&ContextMenu), idMoveUp, _("Déplacer vers le haut\tCtrl-Up"), wxEmptyString, wxITEM_NORMAL);
	moveUpMenuI->SetBitmap(wxBitmap(wxImage(_T("res/up.png"))));
	ContextMenu.Append(moveUpMenuI);
	moveDownMenuI = new wxMenuItem((&ContextMenu), idMoveDown, _("Déplacer vers le bas\tCtrl-Down"), wxEmptyString, wxITEM_NORMAL);
	moveDownMenuI->SetBitmap(wxBitmap(wxImage(_T("res/down.png"))));
	ContextMenu.Append(moveDownMenuI);
	ContextMenu.AppendSeparator();
	copyMenuI = new wxMenuItem((&ContextMenu), idMenuCopy, _("Copier\tCtrl-C"), wxEmptyString, wxITEM_NORMAL);
	copyMenuI->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
	ContextMenu.Append(copyMenuI);
	cutMenuI = new wxMenuItem((&ContextMenu), idMenuCut, _("Couper\tCtrl-X"), wxEmptyString, wxITEM_NORMAL);
	cutMenuI->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
	ContextMenu.Append(cutMenuI);
	pasteMenuI = new wxMenuItem((&ContextMenu), idMenuPaste, _("Coller\tCtrl-V"), wxEmptyString, wxITEM_NORMAL);
	pasteMenuI->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	ContextMenu.Append(pasteMenuI);
	MenuItem1 = new wxMenuItem((&rootContextMenu), ID_MENUITEM4, _("Ajouter un objet"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	rootContextMenu.Append(MenuItem1);
	rootContextMenu.AppendSeparator();
	MenuItem3 = new wxMenuItem((&rootContextMenu), ID_MENUITEM6, _("Coller\tCtrl-V"), wxEmptyString, wxITEM_NORMAL);
	MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	rootContextMenu.Append(MenuItem3);
	MenuItem2 = new wxMenuItem((&multipleContextMenu), ID_MENUITEM7, _("Supprimer les objets\tDEL"), _("Supprimer tous les objets selectionnés"), wxITEM_NORMAL);
	MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	multipleContextMenu.Append(MenuItem2);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	toolbarPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorObjectList::OntoolbarPanelResize,0,this);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_DRAG,(wxObjectEventFunction)&EditorObjectList::OnobjectsListBeginDrag);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_LABEL_EDIT,(wxObjectEventFunction)&EditorObjectList::OnobjectsListBeginLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_END_LABEL_EDIT,(wxObjectEventFunction)&EditorObjectList::OnobjectsListEndLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditorObjectList::OnobjectsListItemActivated);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&EditorObjectList::OnobjectsListItemRightClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditorObjectList::OnobjectsListSelectionChanged);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_KEY_DOWN,(wxObjectEventFunction)&EditorObjectList::OnobjectsListKeyDown);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_MENU,(wxObjectEventFunction)&EditorObjectList::OnobjectsListItemMenu);
	Connect(idMenuModObj,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OneditMenuISelected);
	Connect(idMenuModVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OneditVarMenuISelected);
	Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnaddAutomatismItemSelected);
	Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnrenameAutomatismSelected);
	Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OndeleteAutomatismItemSelected);
	Connect(idMenuModName,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OneditNameMenuISelected);
	Connect(idMenuAddObj,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnaddObjMenuISelected);
	Connect(idMenuDelObj,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OndelObjMenuISelected);
	Connect(idMoveUp,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnMoveUpSelected);
	Connect(idMoveDown,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnMoveDownSelected);
	Connect(idMenuCopy,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnCopySelected);
	Connect(idMenuCut,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnCutSelected);
	Connect(idMenuPaste,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnPasteSelected);
	Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnaddObjMenuISelected);
	Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnPasteSelected);
	Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OndelObjMenuISelected);
	Connect(wxEVT_SET_FOCUS,(wxObjectEventFunction)&EditorObjectList::OnSetFocus);
	//*)

    #if defined(__WXMSW__) //Offer nice look to wxTreeCtrl
    wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
    if(theme) theme->SetWindowTheme((HWND) objectsList->GetHWND(), L"EXPLORER", NULL);
    #endif

    CreateToolbar();

    objectsImagesList = new wxImageList(24,24, true);
    objectsList->AssignImageList(objectsImagesList);

    Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorObjectList::OnRefreshBtClick);
    Connect(ID_BITMAPBUTTON2,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorObjectList::OnChercherBtClick);
    Connect(ID_BITMAPBUTTON3,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorObjectList::OnAideBtClick);
    Connect(ID_BITMAPBUTTON6,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorObjectList::OnMoreOptions);

    SetDropTarget(new DndTextObjectsEditor(*this));

    Refresh();
}

EditorObjectList::~EditorObjectList()
{
	//(*Destroy(EditorObjectList)
	//*)
}

/**
 * Static method for creating ribbon page for this kind of editor
 */
void EditorObjectList::CreateRibbonPage(wxRibbonPage * page)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    bool hideLabels = false;
    pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Liste d'objets"), wxBitmap("res/list24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonAdd, !hideLabels ? _("Ajouter un objet") : "", wxBitmap("res/add24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonDel, !hideLabels ? _("Supprimer") : "", wxBitmap("res/delete24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonUp, !hideLabels ? _("Déplacer vers le haut") : "", wxBitmap("res/up24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonDown, !hideLabels ? _("Déplacer vers le bas") : "", wxBitmap("res/down24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonSearch, !hideLabels ? _("Rechercher") : "", wxBitmap("res/search24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonRefresh, !hideLabels ? _("Rafraichir") : "", wxBitmap("res/refreshicon24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Objet sélectionné"), wxBitmap("res/edit24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonModProp, !hideLabels ? _("Edition") : "", wxBitmap("res/editprop24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonModName, !hideLabels ? _("Editer le nom") : "", wxBitmap("res/editname24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Presse papiers"), wxBitmap("res/copy24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonCopy, !hideLabels ? _("Copier") : "", wxBitmap("res/copy24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonCut, !hideLabels ? _("Couper") : "", wxBitmap("res/cut24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonPaste, !hideLabels ? _("Coller") : "", wxBitmap("res/paste24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Aide"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonHelp, !hideLabels ? _("Aide") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
    }

}

void EditorObjectList::ConnectEvents()
{
    mainEditorCommand.GetMainEditor()->Connect(idRibbonAdd, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OnaddObjMenuISelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonDel, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OndelObjMenuISelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonUp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OnMoveUpSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonDown, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OnMoveDownSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonSearch, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OnChercherBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonModProp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OneditMenuISelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonModName, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OneditNameMenuISelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonCopy, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OnCopySelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonCut, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OnCutSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonPaste, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OnPasteSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OnAideBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonRefresh, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::Refresh, NULL, this);
}

////////////////////////////////////////////////////////////
/// Création de la toolbar
////////////////////////////////////////////////////////////
void EditorObjectList::CreateToolbar()
{
    toolbar = new wxToolBar( toolbarPanel, -1, wxDefaultPosition, wxDefaultSize,
                                   wxTB_FLAT | wxTB_NODIVIDER );

    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( ID_BITMAPBUTTON1, wxT( "Rafraichir" ), wxBitmap( wxImage( "res/refreshicon.png" ) ), _("Rafraichir la liste d'images") );
    toolbar->AddSeparator();
    toolbar->AddTool( idMenuAddObj, wxT( "Ajouter un objet" ), wxBitmap( wxImage( "res/addicon.png" ) ), _("Ajouter un objet") );
    toolbar->AddTool( idMenuDelObj, wxT( "Supprimer l'objet selectionné" ), wxBitmap( wxImage( "res/deleteicon.png" ) ), _("Supprimer l'objet selectionné") );
    toolbar->AddTool( idMenuModObj, wxT( "Modifier les propriétés de l'objet" ), wxBitmap( wxImage( "res/editpropicon.png" ) ), _("Modifier les propriétés de l'objet") );
    toolbar->AddTool( ID_BITMAPBUTTON6, wxT( "Plus d'options d'édition ( clic droit sur la liste )" ), wxBitmap( wxImage( "res/moreicon.png" ) ), _("Plus d'options d'édition ( clic droit sur la liste )") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_BITMAPBUTTON2, wxT( "Rechercher un objet" ), wxBitmap( wxImage( "res/searchicon.png" ) ), _("Rechercher un objet") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_BITMAPBUTTON3, wxT( "Aide de l'éditeur d'objets" ), wxBitmap( wxImage( "res/helpicon.png" ) ), _("Aide de l'éditeur d'objets") );
    toolbar->Realize();

    //Obligatoire avec wxGTK, sinon la toolbar ne s'affiche pas
#ifdef __WXGTK__
    wxSize tbSize = toolbar->GetSize();
    gtk_widget_set_usize( toolbar->m_widget, tbSize.GetWidth(), tbSize.GetHeight() );
#endif
}

////////////////////////////////////////////////////////////
/// Redimensionement de la toolbar
////////////////////////////////////////////////////////////
void EditorObjectList::OntoolbarPanelResize(wxSizeEvent& event)
{
    toolbar->SetSize(toolbarPanel->GetSize().x, -1);
}

void EditorObjectList::EnableAll()
{
    wxMenuItemList list = ContextMenu.GetMenuItems();
    wxMenuItemList::iterator iter;
    for (iter = list.begin(); iter != list.end(); ++iter)
    {
        (*iter)->Enable(true);
    }

    toolbar->Enable(true);
}

void EditorObjectList::DisableAll()
{
    wxMenuItemList list = ContextMenu.GetMenuItems();
    wxMenuItemList::iterator iter;
    for (iter = list.begin(); iter != list.end(); ++iter)
    {
        (*iter)->Enable(false);
    }

    toolbar->Enable(false);
}

////////////////////////////////////////////////////////////
/// Menu contextuel
////////////////////////////////////////////////////////////
void EditorObjectList::OnMoreOptions( wxCommandEvent& event )
{
    PopupMenu( &ContextMenu );
}

/**
 * Popup context menu
 */
void EditorObjectList::OnobjectsListItemMenu(wxTreeEvent& event)
{
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    item = event.GetItem();
    wxArrayTreeItemIds selection;

    if ( item == objectsList->GetRootItem())
        PopupMenu( &rootContextMenu );
    else if ( objectsList->GetSelections(selection) > 1 )
    {
        PopupMenu( &multipleContextMenu );
    }
    else
    {
        //Find object so as to update automatisms list
        string name = ToString(objectsList->GetItemText( item ));
        std::vector<ObjSPtr>::iterator object = std::find_if(objects->begin(), objects->end(), std::bind2nd(ObjectHasName(), name));
        if ( object == objects->end() ) return;

        //Remove already present automatisms from menu
        for (vector < std::pair<long, std::string> >::iterator idIter = idForAutomatism.begin();
             idIter != idForAutomatism.end();
             ++idIter)
        {
            automatismsMenu->Destroy(idIter->first);
        }
        idForAutomatism.clear();

        //Add each automatism of the object
        vector < std::string > allObjectAutomatisms = (*object)->GetAllAutomatismNames();
        for(unsigned int j = 0;j<allObjectAutomatisms.size();++j)
        {
            //Find an identifier for the menu item
            long id = wxNewId();

            idForAutomatism.push_back(std::make_pair(id, allObjectAutomatisms[j]));
            wxMenuItem * menuItem = new wxMenuItem(automatismsMenu, id,
                                                   (*object)->GetAutomatism(allObjectAutomatisms[j])->GetName());
            automatismsMenu->Insert(0, menuItem);
            Connect(id,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnAutomatismSelected);
        }

        ContextMenu.Enable(idMenuEffects, (*object)->SupportShaders());


        //Popup menu
        PopupMenu( &ContextMenu );
    }
}

void EditorObjectList::OnobjectsListItemRightClick(wxTreeEvent& event)
{
    item = event.GetItem();
}

/**
 * Selection has changed
 */
void EditorObjectList::OnobjectsListSelectionChanged(wxTreeEvent& event)
{
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    item = event.GetItem();
}


////////////////////////////////////////////////////////////
/// Recréer le TreeCtrl
////////////////////////////////////////////////////////////
void EditorObjectList::Refresh()
{
    objectsList->DeleteAllItems();
    objectsImagesList->RemoveAll();

    BitmapGUIManager *bitmapGUIManager = BitmapGUIManager::GetInstance();
    objectsImagesList->Add(bitmapGUIManager->objects24);

    objectsList->AddRoot( _( "Tous les objets" ), 0 );

    //Generate thumbnails
    for ( unsigned int i = 0;i < objects->size();i++ )
    {
        int thumbnailID = -1;
        wxBitmap thumbnail;
        if ( objects->at(i)->GenerateThumbnail(game, thumbnail)  && thumbnail.IsOk() )
        {
            objectsImagesList->Add(thumbnail);
            thumbnailID = objectsImagesList->GetImageCount()-1;
        }

        objectsList->AppendItem( objectsList->GetRootItem(), objects->at( i )->GetName(), thumbnailID );

    }

    objectsList->ExpandAll();
}

////////////////////////////////////////////////////////////
/// Clic sur le bouton de rafraichissement
////////////////////////////////////////////////////////////
void EditorObjectList::OnRefreshBtClick( wxCommandEvent& event )
{
    Refresh();
}


void EditorObjectList::OnAutomatismSelected(wxCommandEvent & event)
{
    string name = ToString(objectsList->GetItemText( item ));
    std::vector<ObjSPtr>::iterator object = std::find_if(objects->begin(), objects->end(), std::bind2nd(ObjectHasName(), name));
    if ( object == objects->end() ) return;

    std::string autoType;
    for (unsigned int i = 0;i<idForAutomatism.size();++i)
    {
    	if ( idForAutomatism[i].first == event.GetId() )
            autoType = idForAutomatism[i].second;
    }

    (*object)->GetAutomatism(autoType)->EditAutomatism(this, game, scene, mainEditorCommand);
    if ( scene )
        scene->wasModified = true;
}

/**
 * Edit an object
 */
void EditorObjectList::OneditMenuISelected(wxCommandEvent& event)
{
    string name = ToString(objectsList->GetItemText( item ));
    std::vector<ObjSPtr>::iterator object = std::find_if(objects->begin(), objects->end(), std::bind2nd(ObjectHasName(), name));
    if ( object == objects->end() ) return;

    (*object)->EditObject(this, game, mainEditorCommand);
    if ( scene ) scene->wasModified = true;

    //Reload thumbnail
    int thumbnailID = -1;
    wxBitmap thumbnail;
    if ( (*object)->GenerateThumbnail(game, thumbnail) )
    {
        objectsImagesList->Add(thumbnail);
        thumbnailID = objectsImagesList->GetImageCount()-1;
    }

    objectsList->SetItemImage( item, thumbnailID );
}

////////////////////////////////////////////////////////////
/// Editer un objet en double cliquant dessus
////////////////////////////////////////////////////////////
void EditorObjectList::OnobjectsListItemActivated(wxTreeEvent& event)
{
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    item = event.GetItem();
    wxCommandEvent eventUseless;
    OneditMenuISelected( eventUseless );
}


////////////////////////////////////////////////////////////
/// Modifier le nom d'un objet
////////////////////////////////////////////////////////////
void EditorObjectList::OneditNameMenuISelected(wxCommandEvent& event)
{
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    wxTreeItemId ItemNul = NULL;
    if ( item != ItemNul && objectsList->GetItemText( item ) != _( "Tous les objets" ) )
    {
        objectsList->EditLabel( item );
    }
    else
    {
        wxLogStatus( _( "Aucun objet sélectionné" ) );
    }
}

////////////////////////////////////////////////////////////
/// Ajouter un objet
////////////////////////////////////////////////////////////
void EditorObjectList::OnaddObjMenuISelected(wxCommandEvent& event)
{
    ObjectTypeChoice chooseTypeDialog(this, game);
    if ( chooseTypeDialog.ShowModal() == 0 )
        return;

    std::string name = ToString(_("Nouvel_objet"));

    //Tant qu'un objet avec le même nom existe, on ajoute un chiffre
    unsigned int i = 0;
    while ( std::find_if(objects->begin(), objects->end(), std::bind2nd(ObjectHasName(), name)) != objects->end() )
    {
        ++i;
        name =  _("Nouvel_objet")+"_"+ToString(i);
    }

    //Add a new object of selected type to objects list
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();
    objects->push_back( extensionsManager->CreateObject(chooseTypeDialog.selectedObjectType, ToString(name)));

    //And to the TreeCtrl
    wxTreeItemId rootId = objectsList->GetRootItem();
    wxTreeItemId itemAdded = objectsList->AppendItem( rootId, name );
    objectsList->ExpandAll();

    //Reload thumbnail
    int thumbnailID = -1;
    wxBitmap thumbnail;
    if ( objects->back()->GenerateThumbnail(game, thumbnail) )
    {
        objectsImagesList->Add(thumbnail);
        thumbnailID = objectsImagesList->GetImageCount()-1;
    }

    objectsList->SetItemImage( itemAdded, thumbnailID );

    objectsList->EditLabel(itemAdded);

    if ( scene )
    {
        scene->wasModified = true;
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, *scene);
    }

    wxLogStatus( _( "L'objet a été correctement ajouté" ) );
}

////////////////////////////////////////////////////////////
/// Supprimer un objet
////////////////////////////////////////////////////////////
void EditorObjectList::OndelObjMenuISelected(wxCommandEvent& event)
{
    wxArrayTreeItemIds selection;
    objectsList->GetSelections(selection);
    std::vector < string > objectsDeleted;

    int answer = wxMessageBox(selection.GetCount() <= 1 ? _("Supprimer également toutes les références à l'objet dans les groupes et les évènements ( Soit les actions et conditions utilisant l'objet ) ?") :
                                                             wxString::Format(_("Supprimer également toutes les références aux %i objets dans les groupes et les évènements ( Soit les actions et conditions utilisant l'objet ) ?"), selection.GetCount()),
                              _("Confirmation de la suppression"), wxYES_NO | wxCANCEL | wxCANCEL_DEFAULT);

    if ( answer == wxCANCEL ) return;

    //Removing objects
    for (unsigned int i = 0;i<selection.GetCount();++i)
    {
        std::string objectName = string(objectsList->GetItemText( selection[i] ).mb_str());
        objectsDeleted.push_back(objectName); //Generate also a list containing the names of the objects deleted.

        if ( selection[i].IsOk() && objectsList->GetRootItem() != selection[i] )
        {
            std::vector<ObjSPtr>::iterator object = std::find_if(objects->begin(), objects->end(), std::bind2nd(ObjectHasName(), objectName));
            if ( object != objects->end() )
            {
                vector <std::string> automatisms = (*object)->GetAllAutomatismNames();

                //Remove objects
                objects->erase( object );

                if ( scene )
                {
                    if ( answer == wxYES )
                    {
                        EventsRefactorer::RemoveObjectInEvents(game, *scene, scene->events, objectName);
                        for (unsigned int g = 0;g<scene->objectGroups.size();++g)
                        {
                            if ( scene->objectGroups[g].Find(objectName)) scene->objectGroups[g].RemoveObject(objectName);
                        }
                    }
                    for (unsigned int p = 0;p<scene->initialObjectsPositions.size();++p)
                    {
                        if ( scene->initialObjectsPositions[p].objectName == objectName )
                        {
                            scene->initialObjectsPositions.erase(scene->initialObjectsPositions.begin() + p);
                            --p;
                        }
                    }
                }

                //Remove automatisms shared datas if necessary
                for (unsigned int i = 0;i<automatisms.size();++i)
                    RemoveSharedDatasIfNecessary(automatisms[i]);
            }

            if ( scene )
            {
                scene->wasModified = true;
                CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, *scene);
            }
        }
    }

    //Removing items
    void * nothing;
    wxTreeItemId item = objectsList->GetFirstChild( objectsList->GetRootItem(), nothing);
    while( item.IsOk() )
    {
        if ( find(objectsDeleted.begin(), objectsDeleted.end(), string(objectsList->GetItemText( item ).mb_str())) != objectsDeleted.end() )
        {
            objectsList->Delete(item);
            item = objectsList->GetFirstChild(objectsList->GetRootItem(), nothing);
        }
        else
            item = objectsList->GetNextSibling(item);
    }
}

////////////////////////////////////////////////////////////
/// Edition du nom d'un objet
////////////////////////////////////////////////////////////
void EditorObjectList::OnobjectsListBeginLabelEdit(wxTreeEvent& event)
{
    if ( objectsList->GetItemText( event.GetItem() ) != _( "Tous les objets" ) )
    {
        ancienNom = objectsList->GetItemText( event.GetItem() );
        return;
    }

    //On ne touche pas au dossier "Tous les objets"
    objectsList->EndEditLabel( event.GetItem(), true );
}

void EditorObjectList::OnobjectsListEndLabelEdit(wxTreeEvent& event)
{
    if ( event.IsEditCancelled() ) return;

    string newName = string(event.GetLabel().mb_str());

    //Be sure there is not already another object with this name
    if ( std::find_if(objects->begin(), objects->end(), std::bind2nd(ObjectHasName(), newName)) != objects->end() )
    {
        wxLogWarning( _( "Impossible de renommer l'objet : un autre objet porte déjà ce nom." ) );

        event.Veto();
        return;
    }

    //Be sure the name is valid
    if ( !CheckObjectName(newName) )
    {
        wxMessageBox(_("Le nom de l'objet contient des espaces, des caractères non autorisés ou représente un nom d'une expression. Utilisez uniquement des lettres, chiffres et underscores ( _ )."), _("Attention"), wxOK | wxICON_EXCLAMATION, this);

        event.Veto();
        return;
    }

    std::vector<ObjSPtr>::iterator object = std::find_if(objects->begin(), objects->end(), std::bind2nd(ObjectHasName(), ancienNom));
    if ( object == objects->end() ) return;

    (*object)->SetName( newName );

    if ( scene ) //Change the object name in the scene.
    {
        EventsRefactorer::RenameObjectInEvents(game, *scene, scene->events, ancienNom, newName);
        for (unsigned int p = 0;p<scene->initialObjectsPositions.size();++p)
        {
            if ( scene->initialObjectsPositions[p].objectName == ancienNom ) scene->initialObjectsPositions[p].objectName = newName;
        }
        for (unsigned int g = 0;g<scene->objectGroups.size();++g)
        {
            if ( scene->objectGroups[g].Find(ancienNom))
            {
                scene->objectGroups[g].RemoveObject(ancienNom);
                scene->objectGroups[g].AddObject(newName);
            }
        }

        scene->wasModified = true;
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, *scene);
    }
    objectsList->SetItemText( event.GetItem(), event.GetLabel() );
    return;
}

/**
 * Check if an object name is valid
 */
bool EditorObjectList::CheckObjectName(std::string name)
{
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();
    const vector < boost::shared_ptr<ExtensionBase> > extensions = extensionsManager->GetExtensions();

    string allowedCharacter = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";

    //Check for invalid names
    bool nameUsedByExpression = extensionsManager->HasExpression(name) || extensionsManager->HasStrExpression(name);
    for (unsigned int i = 0;i<extensions.size();++i)
    {
        //Verify if that extension is enabled
        if ( find(game.extensionsUsed.begin(),
                  game.extensionsUsed.end(),
                  extensions[i]->GetName()) == game.extensionsUsed.end() )
            continue;

        vector<string> objectsTypes = extensions[i]->GetExtensionObjectsTypes();

        for(unsigned int j = 0;j<objectsTypes.size();++j)
        {
            //Add each object expression
            std::map<string, ExpressionInfos > allObjExpr = extensions[i]->GetAllExpressionsForObject(objectsTypes[j]);
            for(std::map<string, ExpressionInfos>::const_iterator it = allObjExpr.begin(); it != allObjExpr.end(); ++it)
            {
                if ( name == it->first )
                    nameUsedByExpression = true;
            }
        }
    }

    //Display warning or errors for invalid names
    return !(name.find_first_not_of(allowedCharacter) != string::npos || nameUsedByExpression);
}

////////////////////////////////////////////////////////////
/// Rechercher un objet
////////////////////////////////////////////////////////////
void EditorObjectList::OnChercherBtClick( wxCommandEvent& event )
{
    string name = static_cast<string> (wxGetTextFromUser( _( "Entrez l'objet à rechercher" ), _( "Chercher un objet" ) ));
    if ( name.empty() ) return;

    std::vector<ObjSPtr>::iterator object = std::find_if(objects->begin(), objects->end(), std::bind2nd(ObjectHasName(), name));
    if ( object != objects->end() )
    {
        //On en a trouvé un, on le sélectionne.
        void * rien;
        wxTreeItemId item = objectsList->GetFirstChild( objectsList->GetRootItem(), rien);
        while( objectsList->GetItemText(item) != name )
        {
            item = objectsList->GetNextSibling( item);
        }

        objectsList->SelectItem(item);

        return;
    } else { wxLogMessage("Aucun objet de ce nom trouvé !"); }
}

////////////////////////////////////////////////////////////
/// Aide
////////////////////////////////////////////////////////////
void EditorObjectList::OnAideBtClick( wxCommandEvent& event )
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::GetInstance();
    helpFileAccess->DisplaySection(10);
}


////////////////////////////////////////////////////////////
/// Copier
////////////////////////////////////////////////////////////
void EditorObjectList::OnCopySelected(wxCommandEvent& event)
{
    std::vector<ObjSPtr>::iterator object = std::find_if(objects->begin(), objects->end(), std::bind2nd(ObjectHasName(), ToString(objectsList->GetItemText( item ))));
    if ( object == objects->end() )
    {
        wxLogWarning(_("Impossible de trouver l'objet à copier"));
        return;
    }

    Clipboard::GetInstance()->SetObject(*object);
}

/**
 * Cut
 */
void EditorObjectList::OnCutSelected(wxCommandEvent& event)
{
    if ( !item.IsOk() || objectsList->GetRootItem() == item )
        return;

    std::vector<ObjSPtr>::iterator object = std::find_if(objects->begin(), objects->end(), std::bind2nd(ObjectHasName(), ToString(objectsList->GetItemText( item ))));
    if ( object == objects->end() )
    {
        wxLogWarning(_("Impossible de trouver l'objet à couper"));
        return;
    }

    objectsList->Delete( item );
    if ( scene )
    {
        scene->wasModified = true;
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, *scene);
    }

    Clipboard::GetInstance()->SetObject(*object);

    //Remove automatisms shared datas if necessary. /!\ Be careful, order is important here : Do not delete the object before getting its automatisms
    vector <std::string> automatisms = (*object)->GetAllAutomatismNames();

    //Remove object
    objects->erase(object);

    for (unsigned int j = 0;j<automatisms.size();++j)
        RemoveSharedDatasIfNecessary(automatisms[j]);
}

////////////////////////////////////////////////////////////
/// Coller
////////////////////////////////////////////////////////////
void EditorObjectList::OnPasteSelected(wxCommandEvent& event)
{
    Clipboard * clipboard = Clipboard::GetInstance();

    if ( !clipboard->HasObject() )
    {
        wxLogWarning(_("Pas d'objet à coller."));
        return;
    }

    //Add a new object of selected type to objects list
    ObjSPtr object = clipboard->GetObject()->Clone();

    wxString name = object->GetName();

    //Add a number to the new name if necessary
    unsigned int i = 0;
    while ( std::find_if(objects->begin(), objects->end(), std::bind2nd(ObjectHasName(), ToString(name))) != objects->end() )
    {
        i++;
        name =  _( "Copie_de_" ) + object->GetName()+"_"+ToString(i);
    }

    //Name the object
    object->SetName( ToString(name) );

    //Add it to the list
    objects->push_back( object );
    objectsList->AppendItem( objectsList->GetRootItem(), name );

    //Add object's automatism's shared datas to scene if necessary
    vector <std::string> automatisms = object->GetAllAutomatismNames();
    for (unsigned int j = 0;j<automatisms.size();++j)
        CreateSharedDatasIfNecessary(object->GetAutomatism(automatisms[j]));

    if ( scene )
    {
        scene->wasModified = true;
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, *scene);
    }
    wxLogStatus( _( "L'objet a été correctement ajouté" ) );
}

////////////////////////////////////////////////////////////
/// Déplacer vers le haut
////////////////////////////////////////////////////////////
void EditorObjectList::OnMoveUpSelected(wxCommandEvent& event)
{
    string name = ToString( objectsList->GetItemText( item ));
    int index = -1;
    for (unsigned int i = 0;i<objects->size();++i)
    {
        if ( objects->at(i)->GetName() == name )
        {
            index = i;
            break;
        }
    }

    if ( index == -1 )
    {
        wxLogStatus( _( "L'objet à déplacer n'a pas été trouvé." ) );
        return;
    }

    if ( index-1 >= 0 )
    {
        //On déplace l'image
        boost::shared_ptr<Object> object = objects->at(index);
        objects->erase(objects->begin() + index );
        objects->insert(objects->begin()+index-1, object);

        Refresh();
        if ( scene )
        {
            scene->wasModified = true;
            CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, *scene);
        }

        //On la reselectionne
        wxTreeItemId item = objectsList->GetLastChild(objectsList->GetRootItem());
        while ( item.IsOk() )
        {
            if ( objectsList->GetItemText( item ) == name )
            {
                objectsList->SelectItem(item);
                return;
            }
            item = objectsList->GetPrevSibling(item);
        }

    }
}

////////////////////////////////////////////////////////////
/// Déplacer vers le bas
////////////////////////////////////////////////////////////
void EditorObjectList::OnMoveDownSelected(wxCommandEvent& event)
{
    string name = static_cast< string > ( objectsList->GetItemText( item ));
    int index = -1;
    for (unsigned int i = 0;i<objects->size();++i)
    {
        if ( objects->at(i)->GetName() == name )
        {
            index = i;
            break;
        }
    }

    if ( index == -1 )
    {
        wxLogStatus( _( "L'objet à déplacer n'a pas été trouvé." ) );
        return;
    }

    if ( static_cast<unsigned>(index+1) < objects->size() )
    {
        //On déplace l'image
        boost::shared_ptr<Object> object = objects->at(index);
        objects->erase(objects->begin() + index );
        objects->insert(objects->begin()+index+1, object);

        Refresh();
        if ( scene )
        {
            scene->wasModified = true;
            CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, *scene);
        }

        //On la reselectionne
        wxTreeItemId item = objectsList->GetLastChild(objectsList->GetRootItem());
        while ( item.IsOk() )
        {
            if ( objectsList->GetItemText( item ) == name )
            {
                objectsList->SelectItem(item);
                return;
            }
            item = objectsList->GetPrevSibling(item);
        }

    }
}

/**
 * Begin dragging object ( to sceneCanvas )
 */
void EditorObjectList::OnobjectsListBeginDrag(wxTreeEvent& event)
{
    if ( event.GetItem().IsOk() && event.GetItem() != objectsList->GetRootItem() )
    {
        wxTextDataObject objectName(objectsList->GetItemText(event.GetItem()));
        wxDropSource dragSource( this );
        dragSource.SetData( objectName );
        dragSource.DoDragDrop( true );
    }
}

/**
 * Change ribbon page and connect events with the editor when selected
 */
void EditorObjectList::OnSetFocus(wxFocusEvent& event)
{
    mainEditorCommand.GetRibbon()->SetActivePage(4);
    ConnectEvents();
}

/**
 * Editing initial variables
 */
void EditorObjectList::OneditVarMenuISelected(wxCommandEvent& event)
{
    string name = ToString( objectsList->GetItemText( item ));
    std::vector<ObjSPtr>::iterator object = std::find_if(objects->begin(), objects->end(), std::bind2nd(ObjectHasName(), name));
    if ( object == objects->end() )
    {
        wxLogStatus( _( "L'objet à éditer n'a pas été trouvé." ) );
        return;
    }

    InitialVariablesDialog dialog(this, (*object)->variablesObjet);
    if ( dialog.ShowModal() == 1 )
    {
        (*object)->variablesObjet = dialog.variables;
        if ( scene ) scene->wasModified = true;
    }
}

/**
 * Add an automatism to the object
 */
void EditorObjectList::OnaddAutomatismItemSelected(wxCommandEvent& event)
{
    string name = ToString( objectsList->GetItemText( item ));
    std::vector<ObjSPtr>::iterator object = std::find_if(objects->begin(), objects->end(), std::bind2nd(ObjectHasName(), name));
    if ( object == objects->end() )
    {
        wxLogStatus( _( "L'objet à éditer n'a pas été trouvé." ) );
        return;
    }

    AutomatismTypeChoice dialog(this, game);
    if ( dialog.ShowModal() == 1)
    {
        GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();
        boost::shared_ptr<Automatism> automatism = extensionManager->CreateAutomatism(dialog.selectedAutomatismType);

        if (automatism == boost::shared_ptr<Automatism>())
        {
            wxLogError( _( "Impossible de créer l'automatisme." ) );
            return;
        }

        AutomatismInfo infos = extensionManager->GetAutomatismInfo(dialog.selectedAutomatismType);

        //Add automatism to object
        automatism->SetName(infos.defaultName);
        for (unsigned int j = 0;(*object)->HasAutomatism(automatism->GetName());++j)
            automatism->SetName(infos.defaultName+ToString(j));

        (*object)->AddAutomatism(automatism);

        //Add shared datas to scene if necessary
        CreateSharedDatasIfNecessary(automatism);

        if ( scene )
        {
            scene->wasModified = true;
            CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, *scene);
        }
    }
}

void EditorObjectList::OndeleteAutomatismItemSelected(wxCommandEvent& event)
{
    string name = ToString( objectsList->GetItemText( item ));
    std::vector<ObjSPtr>::iterator object = std::find_if(objects->begin(), objects->end(), std::bind2nd(ObjectHasName(), name));
    if ( object == objects->end() )
    {
        wxLogStatus( _( "L'objet à éditer n'a pas été trouvé." ) );
        return;
    }

    //Create automatism array
    wxArrayString automatismsStr;

    //Fill array
    vector <std::string> automatisms = (*object)->GetAllAutomatismNames();
    for (unsigned int i = 0;i<automatisms.size();++i)
        automatismsStr.Add((*object)->GetAutomatism(automatisms[i])->GetName());

    int selection = wxGetSingleChoiceIndex(_("Choisissez l'automatisme à supprimer"), _("Choisir l'automatisme à supprimer"), automatismsStr);
    if ( selection == -1 ) return;

    (*object)->RemoveAutomatism(automatisms[selection]);

    //Remove shared datas if necessary
    RemoveSharedDatasIfNecessary(automatisms[selection]);

    if ( scene )
    {
        scene->wasModified = true;
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, *scene);
    }
}

/**
 * Rename an automatism
 */
void EditorObjectList::OnrenameAutomatismSelected(wxCommandEvent& event)
{
    string name = ToString(objectsList->GetItemText( item ));
    std::vector<ObjSPtr>::iterator object = std::find_if(objects->begin(), objects->end(), std::bind2nd(ObjectHasName(), name));
    if ( object == objects->end() )
    {
        wxLogStatus( _( "L'objet à éditer n'a pas été trouvé." ) );
        return;
    }

    //Create automatism array
    wxArrayString automatismsStr;

    //Fill array
    vector <std::string> automatisms = (*object)->GetAllAutomatismNames();
    for (unsigned int i = 0;i<automatisms.size();++i)
        automatismsStr.Add((*object)->GetAutomatism(automatisms[i])->GetName());

    int selection = wxGetSingleChoiceIndex(_("Choisissez l'automatisme à renommer"), _("Choisir l'automatisme à renommer"), automatismsStr);
    if ( selection == -1 ) return;

    boost::shared_ptr<Automatism> automatism = (*object)->GetAutomatism(automatisms[selection]);

    std::string newName = string(wxGetTextFromUser("Entrez le nouveau nom de l'automatisme", "Renommer un automatisme", automatism->GetName()).mb_str());
    if ( newName == automatism->GetName() || newName.empty() ) return;

    //Remove shared datas if necessary
    RemoveSharedDatasIfNecessary(automatism->GetName());

    automatism->SetName(newName);
    CreateSharedDatasIfNecessary(automatism);

    if ( scene )
    {
        scene->wasModified = true;
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, *scene);
    }
}


/**
 * Remove shared datas of an automatism if this automatism is not used anymore
 */
void EditorObjectList::RemoveSharedDatasIfNecessary(std::string name)
{
    if ( scene != NULL && scene->automatismsInitialSharedDatas.find(name) != scene->automatismsInitialSharedDatas.end() )
    {
        //Check no object use this automatism anymore
        for (unsigned int i = 0;i<scene->initialObjects.size();++i)
        {
        	if (scene->initialObjects[i]->HasAutomatism(name))
                return;
        }
        for (unsigned int i = 0;i<game.globalObjects.size();++i)
        {
        	if (game.globalObjects[i]->HasAutomatism(name))
                return;
        }

        scene->automatismsInitialSharedDatas.erase(name);
    }
}

/**
 * Create datas shared by an automatism type if these data don't yet exist.
 */
void EditorObjectList::CreateSharedDatasIfNecessary(boost::shared_ptr<Automatism> automatism)
{
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    if ( scene == NULL || objects != &scene->initialObjects ) //We're editing global objects : Add automatism data to all scenes.
    {
        for (unsigned int i = 0;i<game.scenes.size();++i)
        {
        	if ( game.scenes[i]->automatismsInitialSharedDatas.find(automatism->GetName()) == game.scenes[i]->automatismsInitialSharedDatas.end() )
            {
                boost::shared_ptr<AutomatismsSharedDatas> automatismsSharedDatas = extensionsManager->CreateAutomatismSharedDatas(automatism->GetTypeName());
                automatismsSharedDatas->SetName(automatism->GetName());
                game.scenes[i]->automatismsInitialSharedDatas[automatismsSharedDatas->GetName()] = automatismsSharedDatas;
            }
        }
    }
    //We're editing an object from a scene : Add the data if necessary
    else if ( scene->automatismsInitialSharedDatas.find(automatism->GetName()) == scene->automatismsInitialSharedDatas.end() )
    {
        boost::shared_ptr<AutomatismsSharedDatas> automatismsSharedDatas = extensionsManager->CreateAutomatismSharedDatas(automatism->GetTypeName());
        automatismsSharedDatas->SetName(automatism->GetName());
        scene->automatismsInitialSharedDatas[automatismsSharedDatas->GetName()] = automatismsSharedDatas;
    }
}

/**
 * Handle accelerators
 */
void EditorObjectList::OnobjectsListKeyDown(wxTreeEvent& event)
{
    if ( event.GetKeyCode() == WXK_DELETE )
    {
        wxCommandEvent unusedEvent;
        OndelObjMenuISelected( unusedEvent );
    }
    else if (event.GetKeyEvent().GetModifiers() == wxMOD_CMD)
    {
        switch ( event.GetKeyCode() )
        {
            case 67: //Ctrl C
            {
                wxCommandEvent unusedEvent;
                OnCopySelected( unusedEvent );
                break;
            }
            case 86: //Ctrl-V
            {
                wxCommandEvent unusedEvent;
                OnPasteSelected( unusedEvent );
                break;
            }
            case 88: //Ctrl-X
            {
                wxCommandEvent unusedEvent;
                OnCutSelected( unusedEvent );
                break;
            }
            case WXK_UP:
            {
                wxCommandEvent unusedEvent;
                OnMoveUpSelected( unusedEvent );
                break;
            }
            case WXK_DOWN:
            {
                wxCommandEvent unusedEvent;
                OnMoveDownSelected( unusedEvent );
                break;
            }
            default:
                break;
        }
    }
}
