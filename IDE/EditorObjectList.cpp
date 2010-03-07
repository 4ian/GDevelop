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

#include <string>
#include <vector>

#include "Game_Develop_EditorMain.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/Object.h"
#include "GDL/Chercher.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/StdAlgo.h"
#include "MemTrace.h"
#include "Clipboard.h"
#include <algorithm>
#include <numeric>
#include "EditorObjetsGroups.h"
#include "GDL/BitmapGUIManager.h"
#include "GDL/StdAlgo.h"
#include "DndTextObjectsEditor.h"
#include "ObjectTypeChoice.h"
#include "InitialVariablesDialog.h"
#include "GDL/HelpFileAccess.h"

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
const long EditorObjectList::idMenuModName = wxNewId();
const long EditorObjectList::idMenuAddObj = wxNewId();
const long EditorObjectList::idMenuDelObj = wxNewId();
const long EditorObjectList::idMoveUp = wxNewId();
const long EditorObjectList::idMoveDown = wxNewId();
const long EditorObjectList::idMenuCopy = wxNewId();
const long EditorObjectList::idMenuCut = wxNewId();
const long EditorObjectList::idMenuPaste = wxNewId();
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

EditorObjectList::EditorObjectList(wxWindow* parent, Game & game_, vector < boost::shared_ptr<Object> > * objects_, MainEditorCommand & mainEditorCommand_, bool * wasModifiedCallback_) :
objects(objects_),
game(game_),
mainEditorCommand(mainEditorCommand_),
wasModifiedCallback(wasModifiedCallback_)
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
	Connect(idMenuModName,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OneditNameMenuISelected);
	Connect(idMenuAddObj,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnaddObjMenuISelected);
	Connect(idMenuDelObj,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OndelObjMenuISelected);
	Connect(idMoveUp,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnMoveUpSelected);
	Connect(idMoveDown,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnMoveDownSelected);
	Connect(idMenuCopy,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnCopySelected);
	Connect(idMenuCut,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnCutSelected);
	Connect(idMenuPaste,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnPasteSelected);
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

void EditorObjectList::OnobjectsListItemMenu(wxTreeEvent& event)
{
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    item = event.GetItem();

    PopupMenu( &ContextMenu );
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
        if ( wasModifiedCallback ) *wasModifiedCallback = true;

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

    wxString name =  _("Nouvel objet");
    int i = 0;

    //Tant qu'un objet avec le même nom existe, on ajoute un chiffre
    while ( Picker::PickOneObject( objects, ( string ) name ) != -1 )
    {
        i++;
        name =  _("Nouvel objet")+wxString(" ");
        wxString Num = st( i );

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

    if ( wasModifiedCallback ) *wasModifiedCallback = true;
    wxLogStatus( _( "L'objet a été correctement ajouté" ) );
}

////////////////////////////////////////////////////////////
/// Supprimer un objet
////////////////////////////////////////////////////////////
void EditorObjectList::OndelObjMenuISelected(wxCommandEvent& event)
{
    wxTreeItemId ItemNul = NULL;
    if ( item != ItemNul && objectsList->GetItemText( item ) != _( "Tous les objets" ) )
    {
        int i = Picker::PickOneObject( objects, ( string ) objectsList->GetItemText( item ) );
        if ( i != -1 )
            objects->erase( objects->begin() + i );

        if ( wasModifiedCallback ) *wasModifiedCallback = true;
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
    }
    else
    {
        //On ne touche pas au dossier "Tous les objets"
        objectsList->EndEditLabel( event.GetItem(), true );
    }
}

void EditorObjectList::OnobjectsListEndLabelEdit(wxTreeEvent& event)
{
    if ( !event.IsEditCancelled() )
    {
        //Si le nom n'existe pas
        if ( Picker::PickOneObject( objects, ( string ) event.GetLabel() ) != -1 )
        {
            wxLogWarning( _( "Impossible de renommer l'objet : un autre objet porte déjà ce nom." ) );
            Refresh();
            return;
        }
        else
        {

            int i = Picker::PickOneObject( objects, ancienNom );
            if ( i != -1 )
            {
                objects->at( i )->SetName( (string)event.GetLabel() );

                if ( wasModifiedCallback ) *wasModifiedCallback = true;
                objectsList->SetItemText( event.GetItem(), event.GetLabel() );
                return;
            }
        }
    }
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
    if ( wasModifiedCallback ) *wasModifiedCallback = true;

    clipboard->SetObject(objects->at(i));
    objects->erase(objects->begin() + i);
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
    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();
    ObjSPtr object = extensionsManager->CreateObject(clipboard->GetObject());

    wxString name =  _( "Copie de " ) + object->GetName();
    int i = 0;

    //Tant qu'un objet avec le même nom existe, on ajoute un chiffre
    while ( Picker::PickOneObject( objects, ( string ) name ) != -1 )
    {
        i++;
        name =  _( "Copie de " ) + object->GetName();
        wxString Num = st( i );

        name += Num;

    }

    //On donne un nom à l'objet
    object->SetName( static_cast<string>(name) );

    //On l'ajoute
    objects->push_back( object );
    objectsList->AppendItem( objectsList->GetRootItem(), name );

    if ( wasModifiedCallback ) *wasModifiedCallback = true;
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
        if ( wasModifiedCallback ) *wasModifiedCallback = true;

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
        if ( wasModifiedCallback ) *wasModifiedCallback = true;

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
        cout << objects->at(i)->variablesObjet.variables.size()<< endl;
        if ( wasModifiedCallback ) *wasModifiedCallback = true;
    }
}
