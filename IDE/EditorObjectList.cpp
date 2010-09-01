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

#include <string>
#include <vector>

#include "Game_Develop_EditorMain.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/Object.h"
#include "GDL/Chercher.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/CommonTools.h"
#include "MemTrace.h"
#include "Clipboard.h"
#include <algorithm>
#include <numeric>
#include "EditorObjetsGroups.h"
#include "GDL/BitmapGUIManager.h"
#include "GDL/Automatism.h"
#include "GDL/CommonTools.h"
#include "DndTextObjectsEditor.h"
#include "ObjectTypeChoice.h"
#include "InitialVariablesDialog.h"
#include "GDL/HelpFileAccess.h"
#include "GDL/AutomatismsSharedDatas.h"
#include "AutomatismTypeChoice.h"
#include "EventsRefactorer.h"

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
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
	wxMenuItem* renameAutomatism;
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
	objectsList = new wxTreeCtrl(this, ID_TREECTRL1, wxPoint(-72,-72), wxSize(179,170), wxTR_EDIT_LABELS|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer1->Add(objectsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	editMenuI = new wxMenuItem((&ContextMenu), idMenuModObj, _("Modifier les propriétés de l\'objet"), wxEmptyString, wxITEM_NORMAL);
	editMenuI->SetBitmap(wxBitmap(wxImage(_T("res/editicon.png"))));
	ContextMenu.Append(editMenuI);
	#ifdef __WXMSW__
	    ContextMenu.Remove(editMenuI);
	    wxFont boldFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	    editMenuI->SetFont(boldFont);
	    ContextMenu.Append(editMenuI);
	#endif
	editVarMenuI = new wxMenuItem((&ContextMenu), idMenuModVar, _("Modifier les variables initiales"), wxEmptyString, wxITEM_NORMAL);
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
	ContextMenu.Append(ID_MENUITEM1, _("Modifier les automatismes"), automatismsMenu, wxEmptyString);
	editNameMenuI = new wxMenuItem((&ContextMenu), idMenuModName, _("Modifier le nom de l\'objet"), wxEmptyString, wxITEM_NORMAL);
	editNameMenuI->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
	ContextMenu.Append(editNameMenuI);
	ContextMenu.AppendSeparator();
	addObjMenuI = new wxMenuItem((&ContextMenu), idMenuAddObj, _("Ajouter un objet"), wxEmptyString, wxITEM_NORMAL);
	addObjMenuI->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	ContextMenu.Append(addObjMenuI);
	delObjMenuI = new wxMenuItem((&ContextMenu), idMenuDelObj, _("Supprimer l\'objet"), wxEmptyString, wxITEM_NORMAL);
	delObjMenuI->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	ContextMenu.Append(delObjMenuI);
	ContextMenu.AppendSeparator();
	moveUpMenuI = new wxMenuItem((&ContextMenu), idMoveUp, _("Déplacer vers le haut"), wxEmptyString, wxITEM_NORMAL);
	moveUpMenuI->SetBitmap(wxBitmap(wxImage(_T("res/up.png"))));
	ContextMenu.Append(moveUpMenuI);
	moveDownMenuI = new wxMenuItem((&ContextMenu), idMoveDown, _("Déplacer vers le bas"), wxEmptyString, wxITEM_NORMAL);
	moveDownMenuI->SetBitmap(wxBitmap(wxImage(_T("res/down.png"))));
	ContextMenu.Append(moveDownMenuI);
	ContextMenu.AppendSeparator();
	copyMenuI = new wxMenuItem((&ContextMenu), idMenuCopy, _("Copier"), wxEmptyString, wxITEM_NORMAL);
	copyMenuI->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
	ContextMenu.Append(copyMenuI);
	cutMenuI = new wxMenuItem((&ContextMenu), idMenuCut, _("Couper"), wxEmptyString, wxITEM_NORMAL);
	cutMenuI->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
	ContextMenu.Append(cutMenuI);
	pasteMenuI = new wxMenuItem((&ContextMenu), idMenuPaste, _("Coller"), wxEmptyString, wxITEM_NORMAL);
	pasteMenuI->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	ContextMenu.Append(pasteMenuI);
	MenuItem1 = new wxMenuItem((&rootContextMenu), ID_MENUITEM4, _("Ajouter un objet"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	rootContextMenu.Append(MenuItem1);
	rootContextMenu.AppendSeparator();
	MenuItem3 = new wxMenuItem((&rootContextMenu), ID_MENUITEM6, _("Coller"), wxEmptyString, wxITEM_NORMAL);
	MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	rootContextMenu.Append(MenuItem3);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	toolbarPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorObjectList::OntoolbarPanelResize,0,this);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_DRAG,(wxObjectEventFunction)&EditorObjectList::OnobjectsListBeginDrag);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_LABEL_EDIT,(wxObjectEventFunction)&EditorObjectList::OnobjectsListBeginLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_END_LABEL_EDIT,(wxObjectEventFunction)&EditorObjectList::OnobjectsListEndLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditorObjectList::OnobjectsListItemActivated);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&EditorObjectList::OnobjectsListItemRightClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditorObjectList::OnobjectsListSelectionChanged);
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
	Connect(wxEVT_SET_FOCUS,(wxObjectEventFunction)&EditorObjectList::OnSetFocus);
	//*)

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

    //On vérifie si on est pas en mode simple.
    wxConfigBase * pConfig = wxConfigBase::Get();

    bool result;
    pConfig->Read("/ModeSimple", &result);

    if ( result )
    {
        toolbar->EnableTool(ID_BITMAPBUTTON1, false);
        toolbar->EnableTool(ID_BITMAPBUTTON6, false);
        toolbar->EnableTool(ID_BITMAPBUTTON2, false);
    }

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

    if ( item == objectsList->GetRootItem())
        PopupMenu( &rootContextMenu );
    else
    {
        //Find object so as to update automatisms list
        string name = static_cast<string>(objectsList->GetItemText( item ));
        int i = Picker::PickOneObject( objects, name );
        if ( i == -1 ) return;

        //Remove already present automatisms from menu
        for (vector < std::pair<long, unsigned int> >::iterator idIter = idForAutomatism.begin();
             idIter != idForAutomatism.end();
             ++idIter)
        {
            automatismsMenu->Destroy(idIter->first);
        }
        idForAutomatism.clear();

        //Add each automatism of the object
        vector < unsigned int > allObjectAutomatisms = objects->at(i)->GetAllAutomatismsNameIdentifiers();
        for(unsigned int j = 0;j<allObjectAutomatisms.size();++j)
        {
            //Find an identifier for the menu item
            long id = wxNewId();

            idForAutomatism.push_back(std::make_pair(id, allObjectAutomatisms[j]));
            wxMenuItem * menuItem = new wxMenuItem(automatismsMenu, id,
                                                   objects->at(i)->GetAutomatism(allObjectAutomatisms[j])->GetName());
            automatismsMenu->Insert(0, menuItem);
            Connect(id,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnAutomatismSelected);
        }


        //Popup menu
        PopupMenu( &ContextMenu );
    }
}

void EditorObjectList::OnobjectsListItemRightClick(wxTreeEvent& event)
{
    item = event.GetItem();
}

////////////////////////////////////////////////////////////
/// La selection a changé.
////////////////////////////////////////////////////////////
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

    BitmapGUIManager *bitmapGUIManager = BitmapGUIManager::getInstance();
    objectsImagesList->Add(bitmapGUIManager->objects24);

    objectsList->AddRoot( _( "Tous les objets" ), 0 );

    //Generate thumbnails
    for ( unsigned int i = 0;i < objects->size();i++ )
    {
        int thumbnailID = -1;
        wxBitmap thumbnail;
        if ( objects->at(i)->GenerateThumbnail(game, thumbnail) )
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
    string name = static_cast<string>(objectsList->GetItemText( item ));
    int i = Picker::PickOneObject( objects, name );
    if ( i == -1 ) return;

    unsigned int autoType = 0;
    for (unsigned int i = 0;i<idForAutomatism.size();++i)
    {
    	if ( idForAutomatism[i].first == event.GetId() )
            autoType = idForAutomatism[i].second;
    }

    objects->at(i)->GetAutomatism(autoType)->EditAutomatism(this, game, scene, mainEditorCommand);
    if ( scene ) scene->wasModified = true;
}

////////////////////////////////////////////////////////////
/// Editer un objet
////////////////////////////////////////////////////////////
void EditorObjectList::OneditMenuISelected(wxCommandEvent& event)
{
    string name = static_cast<string>(objectsList->GetItemText( item ));
    int i = Picker::PickOneObject( objects, name );
    if ( i != -1 )
    {
        objects->at(i)->EditObject(this, game, mainEditorCommand);
        if ( scene ) scene->wasModified = true;

        //Reload thumbnail
        int thumbnailID = -1;
        wxBitmap thumbnail;
        if ( objects->at(i)->GenerateThumbnail(game, thumbnail) )
        {
            objectsImagesList->Add(thumbnail);
            thumbnailID = objectsImagesList->GetImageCount()-1;
        }

        objectsList->SetItemImage( item, thumbnailID );
    }
    else
    {
        wxLogWarning( _( "L'objet à éditer n'a pas été trouvé." ) );
    }
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

    wxString name =  _("Nouvel_objet");
    int i = 0;

    //Tant qu'un objet avec le même nom existe, on ajoute un chiffre
    while ( Picker::PickOneObject( objects, ( string ) name ) != -1 )
    {
        i++;
        name =  _("Nouvel_objet")+wxString("_");
        wxString Num =ToString( i );

        name += Num;
    }

    //Add a new object of selected type to objects list
    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();
    objects->push_back( extensionsManager->CreateObject(extensionsManager->GetTypeIdFromString(chooseTypeDialog.selectedObjectType),
                                                        string(name.mb_str())));

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

   if ( scene ) scene->wasModified = true;
    wxLogStatus( _( "L'objet a été correctement ajouté" ) );
}

////////////////////////////////////////////////////////////
/// Supprimer un objet
////////////////////////////////////////////////////////////
void EditorObjectList::OndelObjMenuISelected(wxCommandEvent& event)
{
    if ( item.IsOk() && objectsList->GetRootItem() != item )
    {
        int id = Picker::PickOneObject( objects, ( string ) objectsList->GetItemText( item ) );
        if ( id != -1 )
        {
            vector <unsigned int> automatisms = objects->at(id)->GetAllAutomatismsNameIdentifiers();

            //Remove objects
            objects->erase( objects->begin() + id );

            //Remove automatisms shared datas if necessary
            for (unsigned int i = 0;i<automatisms.size();++i)
                RemoveSharedDatasIfNecessary(automatisms[i]);
        }

        if ( scene ) scene->wasModified = true;
        objectsList->Delete( item );
        return;

    }
    else
        wxLogStatus( _( "Aucun objet sélectionnée" ) );
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
    if ( Picker::PickOneObject( objects, newName ) != -1 )
    {
        wxLogWarning( _( "Impossible de renommer l'objet : un autre objet porte déjà ce nom." ) );
        Refresh();
        return;
    }

    //Be sure the name is valid
    if ( !CheckObjectName(newName) )
    {
        wxMessageBox(_("Le nom de l'objet contient des espaces, des caractères non autorisés ou représente un nom d'une expression. Utilisez uniquement des lettres, chiffres et underscores ( _ )."), _("Attention"), wxICON_EXCLAMATION, this);

        Refresh();
        return;
    }

    int i = Picker::PickOneObject( objects, ancienNom );
    if ( i != -1 )
    {
        objects->at( i )->SetName( newName );

        if ( scene )
        {
            EventsRefactorer::RenameObjectInEvents(game, *scene, scene->events, ancienNom, newName);
            scene->wasModified = true;
        }
        objectsList->SetItemText( event.GetItem(), event.GetLabel() );
        return;
    }
}

/**
 * Check if an object name is valid
 */
bool EditorObjectList::CheckObjectName(std::string name)
{
    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();
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
    if ( name == "" ) return;

    int i = Picker::PickOneObject( objects, name );
    if ( i != -1 )
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
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(10);
}


////////////////////////////////////////////////////////////
/// Copier
////////////////////////////////////////////////////////////
void EditorObjectList::OnCopySelected(wxCommandEvent& event)
{
    Clipboard * clipboard = Clipboard::getInstance();

    int i = Picker::PickOneObject( objects, static_cast<string>(objectsList->GetItemText( item )) );
    if ( i == -1 )
    {
        wxLogWarning(_("Impossible de trouver l'objet à copier"));
        return;
    }

    clipboard->SetObject(objects->at(i));
}

////////////////////////////////////////////////////////////
/// Couper
////////////////////////////////////////////////////////////
void EditorObjectList::OnCutSelected(wxCommandEvent& event)
{
    wxTreeItemId ItemNul = NULL;
    if ( item == ItemNul || objectsList->GetItemText( item ) == _( "Tous les objets de la scène" ) )
        return;

    Clipboard * clipboard = Clipboard::getInstance();

    int i = Picker::PickOneObject( objects, static_cast<string>(objectsList->GetItemText( item )) );
    if ( i == -1 )
    {
        wxLogWarning(_("Impossible de trouver l'objet à couper"));
        return;
    }

    objectsList->Delete( item );
    if ( scene ) scene->wasModified = true;

    clipboard->SetObject(objects->at(i));

    //Remove automatisms shared datas if necessary
    vector <unsigned int> automatisms = objects->at(i)->GetAllAutomatismsNameIdentifiers();

    //Remove object
    objects->erase(objects->begin() + i);

    for (unsigned int j = 0;j<automatisms.size();++j)
        RemoveSharedDatasIfNecessary(automatisms[j]);
}

////////////////////////////////////////////////////////////
/// Coller
////////////////////////////////////////////////////////////
void EditorObjectList::OnPasteSelected(wxCommandEvent& event)
{
    Clipboard * clipboard = Clipboard::getInstance();

    if ( !clipboard->HasObject() )
    {
        wxLogWarning(_("Pas d'objet à coller."));
        return;
    }

    //Add a new object of selected type to objects list
    ObjSPtr object = clipboard->GetObject()->Clone();

    wxString name =  _( "Copie de " ) + object->GetName();
    int i = 0;

    //Tant qu'un objet avec le même nom existe, on ajoute un chiffre
    while ( Picker::PickOneObject( objects, ( string ) name ) != -1 )
    {
        i++;
        name =  _( "Copie de " ) + object->GetName();
        wxString Num =ToString( i );

        name += Num;

    }

    //On donne un nom à l'objet
    object->SetName( static_cast<string>(name) );

    //On l'ajoute
    objects->push_back( object );
    objectsList->AppendItem( objectsList->GetRootItem(), name );

    //Add object's automatism's shared datas to scene if necessary
    vector <unsigned int> automatisms = object->GetAllAutomatismsNameIdentifiers();
    for (unsigned int j = 0;j<automatisms.size();++j)
        CreateSharedDatasIfNecessary(object->GetAutomatism(automatisms[j]));

    if ( scene ) scene->wasModified = true;
    wxLogStatus( _( "L'objet a été correctement ajouté" ) );
}

////////////////////////////////////////////////////////////
/// Déplacer vers le haut
////////////////////////////////////////////////////////////
void EditorObjectList::OnMoveUpSelected(wxCommandEvent& event)
{
    string name = static_cast< string > ( objectsList->GetItemText( item ));
    int i = Picker::PickOneObject( objects, name );
    if ( i == -1 )
    {
        wxLogStatus( _( "L'objet à déplacer n'a pas été trouvé." ) );
        return;
    }

    if ( i-1 >= 0 )
    {
        //On déplace l'image
        boost::shared_ptr<Object> object = objects->at(i);
        objects->erase(objects->begin() + i );
        objects->insert(objects->begin()+i-1, object);

        Refresh();
        if ( scene ) scene->wasModified = true;

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
    int i = Picker::PickOneObject( objects, name );
    if ( i == -1 )
    {
        wxLogStatus( _( "L'objet à déplacer n'a pas été trouvé." ) );
        return;
    }

    if ( static_cast<unsigned>(i+1) < objects->size() )
    {
        //On déplace l'image
        boost::shared_ptr<Object> object = objects->at(i);
        objects->erase(objects->begin() + i );
        objects->insert(objects->begin()+i+1, object);

        Refresh();
        if ( scene ) scene->wasModified = true;

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
    mainEditorCommand.GetRibbon()->SetActivePage(5);
    ConnectEvents();
}

/**
 * Editing initial variables
 */
void EditorObjectList::OneditVarMenuISelected(wxCommandEvent& event)
{
    string name = static_cast< string > ( objectsList->GetItemText( item ));
    int i = Picker::PickOneObject( objects, name );
    if ( i == -1 )
    {
        wxLogStatus( _( "L'objet à éditer n'a pas été trouvé." ) );
        return;
    }

    InitialVariablesDialog dialog(this, objects->at(i)->variablesObjet);
    if ( dialog.ShowModal() == 1 )
    {
        objects->at(i)->variablesObjet = dialog.variables;
        if ( scene ) scene->wasModified = true;
    }
}

/**
 * Add an automatism to the object
 */
void EditorObjectList::OnaddAutomatismItemSelected(wxCommandEvent& event)
{
    string name = static_cast< string > ( objectsList->GetItemText( item ));
    int i = Picker::PickOneObject( objects, name );
    if ( i == -1 )
    {
        wxLogStatus( _( "L'objet à éditer n'a pas été trouvé." ) );
        return;
    }

    AutomatismTypeChoice dialog(this, game);
    if ( dialog.ShowModal() == 1)
    {
        gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();
        boost::shared_ptr<Automatism> automatism = extensionManager->CreateAutomatism(dialog.selectedAutomatismType);

        if (automatism == boost::shared_ptr<Automatism>())
        {
            wxLogError( _( "Impossible de créer l'automatisme." ) );
            return;
        }

        AutomatismInfo infos = extensionManager->GetAutomatismInfo(dialog.selectedAutomatismType);

        //Add automatism to object
        automatism->SetName(infos.defaultName);
        for (unsigned int j = 0;objects->at(i)->HasAutomatism(automatism->GetAutomatismId());++j)
            automatism->SetName(infos.defaultName+ToString(j));

        objects->at(i)->AddAutomatism(automatism);

        //Add shared datas to scene if necessary
        CreateSharedDatasIfNecessary(automatism);

        if ( scene ) scene->wasModified = true;
    }
}

void EditorObjectList::OndeleteAutomatismItemSelected(wxCommandEvent& event)
{
    string name = static_cast< string > ( objectsList->GetItemText( item ));
    int id = Picker::PickOneObject( objects, name );
    if ( id == -1 )
    {
        wxLogStatus( _( "L'objet à éditer n'a pas été trouvé." ) );
        return;
    }

    //Create automatism array
    wxArrayString automatismsStr;

    //Fill array
    vector <unsigned int> automatisms = objects->at(id)->GetAllAutomatismsNameIdentifiers();
    for (unsigned int i = 0;i<automatisms.size();++i)
        automatismsStr.Add(objects->at(id)->GetAutomatism(automatisms[i])->GetName());

    int selection = wxGetSingleChoiceIndex(_("Choisissez l'automatisme à supprimer"), _("Choisir l'automatisme à supprimer"), automatismsStr);
    if ( selection == -1 ) return;

    objects->at(id)->RemoveAutomatism(automatisms[selection]);

    //Remove shared datas if necessary
    RemoveSharedDatasIfNecessary(automatisms[selection]);

    if ( scene ) scene->wasModified = true;
}

/**
 * Rename an automatism
 */
void EditorObjectList::OnrenameAutomatismSelected(wxCommandEvent& event)
{
    string name = string(objectsList->GetItemText( item ).mb_str());
    int id = Picker::PickOneObject( objects, name );
    if ( id == -1 )
    {
        wxLogStatus( _( "L'objet à éditer n'a pas été trouvé." ) );
        return;
    }

    //Create automatism array
    wxArrayString automatismsStr;

    //Fill array
    vector <unsigned int> automatisms = objects->at(id)->GetAllAutomatismsNameIdentifiers();
    for (unsigned int i = 0;i<automatisms.size();++i)
        automatismsStr.Add(objects->at(id)->GetAutomatism(automatisms[i])->GetName());

    int selection = wxGetSingleChoiceIndex(_("Choisissez l'automatisme à renommer"), _("Choisir l'automatisme à renommer"), automatismsStr);
    if ( selection == -1 ) return;

    boost::shared_ptr<Automatism> automatism = objects->at(id)->GetAutomatism(automatisms[selection]);

    std::string newName = string(wxGetTextFromUser("Entrez le nouveau nom de l'automatisme", "Renommer un automatisme", automatism->GetName()).mb_str());
    if ( newName == automatism->GetName() || newName.empty() ) return;

    //Remove shared datas if necessary
    RemoveSharedDatasIfNecessary(automatism->GetAutomatismId());

    automatism->SetName(newName);
    CreateSharedDatasIfNecessary(automatism);

    if ( scene ) scene->wasModified = true;
}


/**
 * Remove shared datas of an automatism if this automatism is not used anymore
 */
void EditorObjectList::RemoveSharedDatasIfNecessary(unsigned int automatismId)
{
    if ( scene != NULL && scene->automatismsInitialSharedDatas.find(automatismId) != scene->automatismsInitialSharedDatas.end() )
    {
        //Check no object use this automatism anymore
        for (unsigned int i = 0;i<scene->initialObjects.size();++i)
        {
        	if (scene->initialObjects[i]->HasAutomatism(automatismId))
                return;
        }
        for (unsigned int i = 0;i<game.globalObjects.size();++i)
        {
        	if (game.globalObjects[i]->HasAutomatism(automatismId))
                return;
        }

        scene->automatismsInitialSharedDatas.erase(automatismId);
    }
}

/**
 * Create datas shared by an automatism type if these data don't yet exist.
 */
void EditorObjectList::CreateSharedDatasIfNecessary(boost::shared_ptr<Automatism> automatism)
{
    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();

    if ( scene != NULL && scene->automatismsInitialSharedDatas.find(automatism->GetAutomatismId()) == scene->automatismsInitialSharedDatas.end() )
    {
        boost::shared_ptr<AutomatismsSharedDatas> automatismsSharedDatas = extensionsManager->CreateAutomatismSharedDatas(automatism->GetTypeName());
        automatismsSharedDatas->SetName(automatism->GetName());
        scene->automatismsInitialSharedDatas[automatismsSharedDatas->GetAutomatismId()] = automatismsSharedDatas;
    }
}
