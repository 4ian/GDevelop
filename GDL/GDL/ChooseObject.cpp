#if defined(GDE)

#include "GDL/ChooseObject.h"

//(*InternalHeaders(ChooseObject)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/image.h>
#include <wx/icon.h>
#include <wx/bitmap.h>
#include <wx/imaglist.h>
#include <wx/config.h>

#include "GDL/Scene.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ObjectGroup.h"

//(*IdInit(ChooseObject)
const long ChooseObject::ID_STATICBITMAP3 = wxNewId();
const long ChooseObject::ID_STATICTEXT1 = wxNewId();
const long ChooseObject::ID_PANEL1 = wxNewId();
const long ChooseObject::ID_STATICLINE2 = wxNewId();
const long ChooseObject::ID_TREECTRL1 = wxNewId();
const long ChooseObject::ID_TREECTRL2 = wxNewId();
const long ChooseObject::ID_TREECTRL3 = wxNewId();
const long ChooseObject::ID_TREECTRL4 = wxNewId();
const long ChooseObject::ID_NOTEBOOK1 = wxNewId();
const long ChooseObject::ID_STATICLINE1 = wxNewId();
const long ChooseObject::ID_BUTTON1 = wxNewId();
const long ChooseObject::ID_BUTTON2 = wxNewId();
const long ChooseObject::ID_BUTTON3 = wxNewId();
const long ChooseObject::ID_MENUITEM2 = wxNewId();
const long ChooseObject::ID_MENUITEM1 = wxNewId();
const long ChooseObject::ID_MENUITEM3 = wxNewId();
const long ChooseObject::ID_MENUITEM4 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChooseObject,wxDialog)
	//(*EventTable(ChooseObject)
	//*)
END_EVENT_TABLE()

ChooseObject::ChooseObject(wxWindow* parent, Game & game_, Scene & scene_, bool CanSelectGroup, string onlyObjectOfType_, const wxSize& size) :
game(game_),
scene(scene_),
onlyObjectOfType(onlyObjectOfType_)
{
	//(*Initialize(ChooseObject)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Choisir un objet"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX|wxMINIMIZE_BOX, _T("wxID_ANY"));
	wxIcon FrameIcon;
	FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/objeticon.png"))));
	SetIcon(FrameIcon);
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/objeticon64.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Choisissez un des objets de la scène. Pour ajouter ou\n modifier des objets, utilisez l\'éditeur des objets."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxSize(413,227), 0, _T("ID_NOTEBOOK1"));
	ObjetsList = new wxTreeCtrl(Notebook1, ID_TREECTRL1, wxPoint(-71,-11), wxSize(179,170), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	ObjetsList->SetToolTip(_("Choisissez un objet dans la liste"));
	GroupesList = new wxTreeCtrl(Notebook1, ID_TREECTRL2, wxPoint(-71,-11), wxSize(179,170), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL2"));
	GroupesList->SetToolTip(_("Choisissez un objet dans la liste"));
	globalObjectsList = new wxTreeCtrl(Notebook1, ID_TREECTRL3, wxPoint(-71,-11), wxSize(179,170), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL3"));
	globalObjectsList->SetToolTip(_("Choisissez un objet dans la liste"));
	globalObjectGroups = new wxTreeCtrl(Notebook1, ID_TREECTRL4, wxPoint(-71,-11), wxSize(281,190), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL4"));
	globalObjectGroups->SetToolTip(_("Choisissez un objet dans la liste"));
	Notebook1->AddPage(ObjetsList, _("Objets"), false);
	Notebook1->AddPage(GroupesList, _("Groupes d\'objets"), false);
	Notebook1->AddPage(globalObjectsList, _("Objets globaux"), false);
	Notebook1->AddPage(globalObjectGroups, _("Groupes globaux"), false);
	FlexGridSizer1->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	ChoisirBt = new wxButton(this, ID_BUTTON1, _("Choisir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(ChoisirBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AucunBt = new wxButton(this, ID_BUTTON3, _("Aucun"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer2->Add(AucunBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	editMenuItem = new wxMenuItem((&Menu1), ID_MENUITEM2, _("Choisir cet objet"), wxEmptyString, wxITEM_NORMAL);
	Menu1.Append(editMenuItem);
	#ifdef __WXMSW__
	    Menu1.Remove(editMenuItem);
	    wxFont boldFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	    editMenuItem->SetFont(boldFont);
	    Menu1.Append(editMenuItem);
	#endif
	Menu1.AppendSeparator();
	MenuItem1 = new wxMenuItem((&Menu1), ID_MENUITEM1, _("Pour ajouter des objets, utilisez l\'éditeur d\'objets"), wxEmptyString, wxITEM_NORMAL);
	Menu1.Append(MenuItem1);
	editGroupMenuItem = new wxMenuItem((&Menu2), ID_MENUITEM3, _("Choisir ce groupe"), wxEmptyString, wxITEM_NORMAL);
	Menu2.Append(editGroupMenuItem);
	#ifdef __WXMSW__
	    Menu2.Remove(editGroupMenuItem);
	    wxFont boldFont2(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	    editGroupMenuItem->SetFont(boldFont2);
	    Menu2.Append(editGroupMenuItem);
	#endif
	Menu2.AppendSeparator();
	MenuItem4 = new wxMenuItem((&Menu2), ID_MENUITEM4, _("Pour ajouter des groupes, utilisez l\'éditeur de groupes d\'objets"), wxEmptyString, wxITEM_NORMAL);
	Menu2.Append(MenuItem4);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ChooseObject::OnObjetsListItemActivated);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&ChooseObject::OnObjetsListItemRightClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChooseObject::OnObjetsListSelectionChanged);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ChooseObject::OnGroupesListItemActivated);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&ChooseObject::OnGroupesListItemRightClick);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChooseObject::OnGroupesListSelectionChanged);
	Connect(ID_TREECTRL3,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ChooseObject::OnglobalObjectsListItemActivated);
	Connect(ID_TREECTRL3,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&ChooseObject::OnglobalObjectsListItemRightClick);
	Connect(ID_TREECTRL3,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChooseObject::OnglobalObjectsListSelectionChanged);
	Connect(ID_TREECTRL4,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ChooseObject::OnglobalObjectGroupsItemActivated);
	Connect(ID_TREECTRL4,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&ChooseObject::OnglobalObjectGroupsItemRightClick);
	Connect(ID_TREECTRL4,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChooseObject::OnglobalObjectGroupsSelectionChanged);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseObject::OnChoisirBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseObject::OnAnnulerBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseObject::OnAucunBtClick);
	Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseObject::OnChoisirBtClick);
	Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseObject::OnChoisirBtClick);
	//*)

    imageList = new wxImageList( 16, 16 );
    imageList->Add(( wxBitmap( "res/objeticon.png", wxBITMAP_TYPE_ANY ) ) );
    imageList->Add(( wxBitmap( "res/groupeobjeticon.png", wxBITMAP_TYPE_ANY ) ) );
    Notebook1->AssignImageList(imageList);

    Notebook1->SetPageImage(0,0);
    Notebook1->SetPageImage(1,1);
    Notebook1->SetPageImage(2,0);
    Notebook1->SetPageImage(3,1);

    //On vérifie si on est pas en mode simple.
    wxConfigBase * pConfig = wxConfigBase::Get();

    bool result = false;
    pConfig->Read("/ModeSimple", &result);

    if ( result == true )
        CanSelectGroup = false;

    if ( !CanSelectGroup )
    {
        GroupesList->Enable(false);
        globalObjectGroups->Enable(false);
    }

	objectChosen = "";

	Refresh();
}

ChooseObject::~ChooseObject()
{
	//(*Destroy(ChooseObject)
	//*)
}

/**
 * Populate trees with objects
 */
void ChooseObject::Refresh()
{
    ObjetsList->DeleteAllItems();
    ObjetsList->AddRoot( _( "Tous les objets de la scène" ) );

    //Search the typeId we are allowed to pick
    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();
    unsigned int typeIdAllowed = extensionsManager->GetTypeIdFromString(onlyObjectOfType);

    for ( unsigned int i = 0;i < scene.initialObjects.size();i++ )
    {
        //Only add the object if it has the correct typeId
        if ( typeIdAllowed == 0 || scene.initialObjects[i]->GetTypeId() == typeIdAllowed )
        {
            ObjetsList->AppendItem( ObjetsList->GetRootItem(), scene.initialObjects[i]->GetName() );
        }
    }

    ObjetsList->ExpandAll();

    GroupesList->DeleteAllItems();
    GroupesList->AddRoot( _( "Tous les groupes de la scène" ) );

    for ( unsigned int i = 0;i < scene.objectGroups.size();i++ )
    {
        //Only add the group if it has all objects of the correct typeId
        if ( typeIdAllowed == 0 || GetTypeIdOfObject(game, scene, scene.objectGroups.at( i ).GetName()) == typeIdAllowed )
        {
            GroupesList->AppendItem( GroupesList->GetRootItem(), scene.objectGroups.at( i ).GetName() );
        }
    }

    GroupesList->ExpandAll();

    globalObjectsList->DeleteAllItems();
    globalObjectsList->AddRoot( _( "Tous les objets globaux" ) );

    for ( unsigned int i = 0;i < game.globalObjects.size();i++ )
    {
        //Only add the object if it has the correct typeId
        if ( typeIdAllowed == 0 || game.globalObjects[i]->GetTypeId() == typeIdAllowed )
        {
            globalObjectsList->AppendItem( globalObjectsList->GetRootItem(), game.globalObjects[i]->GetName() );
        }
    }

    globalObjectsList->ExpandAll();

    globalObjectGroups->DeleteAllItems();
    globalObjectGroups->AddRoot( _( "Tous les groupes globaux" ) );

    for ( unsigned int i = 0;i < game.objectGroups.size();i++ )
    {
        //Only add the group if it has all objects of the correct typeId
        if ( typeIdAllowed == 0 || GetTypeIdOfObject(game, scene, game.objectGroups.at( i ).GetName()) == typeIdAllowed )
        {
            globalObjectGroups->AppendItem( globalObjectGroups->GetRootItem(), game.objectGroups.at( i ).GetName() );
        }
    }

    globalObjectGroups->ExpandAll();
}

void ChooseObject::OnChoisirBtClick(wxCommandEvent& event)
{
    if ( Notebook1->GetSelection() == 0 && item.IsOk() && ObjetsList->GetItemText( item ) != _( "Tous les objets de la scène" ) )
    {
        objectChosen = static_cast<string>(ObjetsList->GetItemText( item ));
        EndModal(1);
    }
    else if ( GroupesList->IsEnabled() && itemGroups.IsOk() && Notebook1->GetSelection() == 1 && GroupesList->GetItemText( itemGroups ) != _( "Tous les groupes de la scène" ) )
    {
        objectChosen = static_cast<string>(GroupesList->GetItemText( itemGroups ));
        EndModal(1);
    }
    else if ( Notebook1->GetSelection() == 2 && itemGlobal.IsOk() && GroupesList->GetItemText( itemGlobal ) != _( "Tous les objets globaux" ) )
    {
        objectChosen = static_cast<string>(GroupesList->GetItemText( itemGlobal ));
        EndModal(1);
    }
    else if ( Notebook1->GetSelection() == 3 && itemGlobalGroups.IsOk() && globalObjectGroups->GetItemText( itemGlobalGroups ) != _( "Tous les groupes globaux" ) )
    {
        objectChosen = static_cast<string>(globalObjectGroups->GetItemText( itemGlobalGroups ));
        EndModal(1);
    }
}

void ChooseObject::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void ChooseObject::OnAucunBtClick(wxCommandEvent& event)
{
    objectChosen = "";
    EndModal(1);
}

void ChooseObject::OnObjetsListSelectionChanged(wxTreeEvent& event)
{
    item = event.GetItem();
}

void ChooseObject::OnObjetsListItemRightClick(wxTreeEvent& event)
{
    item = event.GetItem();
    PopupMenu(&Menu1);
}

void ChooseObject::OnObjetsListItemActivated(wxTreeEvent& event)
{
    item = event.GetItem();
    wxCommandEvent uselessEvent;
    OnChoisirBtClick(uselessEvent);
}

void ChooseObject::OnGroupesListSelectionChanged(wxTreeEvent& event)
{
    itemGroups = event.GetItem();
}
void ChooseObject::OnGroupesListItemRightClick(wxTreeEvent& event)
{
    itemGroups = event.GetItem();
    PopupMenu(&Menu2);
}

void ChooseObject::OnGroupesListItemActivated(wxTreeEvent& event)
{
    itemGroups = event.GetItem();
    wxCommandEvent uselessEvent;
    OnChoisirBtClick(uselessEvent);
}

void ChooseObject::OnglobalObjectsListSelectionChanged(wxTreeEvent& event)
{
    itemGlobal = event.GetItem();
}

void ChooseObject::OnglobalObjectsListItemRightClick(wxTreeEvent& event)
{
    itemGlobal = event.GetItem();
    PopupMenu(&Menu1);
}

void ChooseObject::OnglobalObjectGroupsSelectionChanged(wxTreeEvent& event)
{
    itemGlobalGroups = event.GetItem();
}

void ChooseObject::OnglobalObjectsListItemActivated(wxTreeEvent& event)
{
    itemGlobal = event.GetItem();
    wxCommandEvent uselessEvent;
    OnChoisirBtClick(uselessEvent);
}

void ChooseObject::OnglobalObjectGroupsItemActivated(wxTreeEvent& event)
{
    itemGlobalGroups = event.GetItem();
    wxCommandEvent uselessEvent;
    OnChoisirBtClick(uselessEvent);
}

void ChooseObject::OnglobalObjectGroupsItemRightClick(wxTreeEvent& event)
{
    itemGlobalGroups = event.GetItem();
    PopupMenu(&Menu2);
}

#endif
