#include "EditorObjetsGroups.h"

//(*InternalHeaders(EditorObjetsGroups)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/toolbar.h>
#include <wx/image.h>
#include <wx/log.h>
#include <wx/help.h>
#include <wx/config.h>
#include <string>
#include <vector>
#include <algorithm>
#include "GDL/ObjectGroup.h"
#include "GDL/Object.h"
#include "GDL/Game.h"
#include "Game_Develop_EditorMain.h"
#include "GDL/CommonTools.h"
#include "EditObjectGroup.h"
#include "Clipboard.h"
#include "GDL/IDE/HelpFileAccess.h"
#include "GDL/Events/CodeCompilationHelpers.h"
#include "EventsRefactorer.h"

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#include <wx/msw/uxtheme.h>
#endif

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif


using namespace std;

//(*IdInit(EditorObjetsGroups)
const long EditorObjetsGroups::ID_PANEL4 = wxNewId();
const long EditorObjetsGroups::ID_TREECTRL1 = wxNewId();
const long EditorObjetsGroups::IdGroupEdit = wxNewId();
const long EditorObjetsGroups::idModName = wxNewId();
const long EditorObjetsGroups::idAddGroup = wxNewId();
const long EditorObjetsGroups::idDelGroup = wxNewId();
const long EditorObjetsGroups::ID_MENUITEM1 = wxNewId();
const long EditorObjetsGroups::ID_MENUITEM2 = wxNewId();
const long EditorObjetsGroups::ID_MENUITEM3 = wxNewId();
const long EditorObjetsGroups::ID_MENUITEM4 = wxNewId();
//*)
const long EditorObjetsGroups::ID_Refresh = wxNewId();
const long EditorObjetsGroups::ID_Help = wxNewId();
const long EditorObjetsGroups::idRibbonAdd = wxNewId();
const long EditorObjetsGroups::idRibbonDel = wxNewId();
const long EditorObjetsGroups::idRibbonUp = wxNewId();
const long EditorObjetsGroups::idRibbonDown = wxNewId();
const long EditorObjetsGroups::idRibbonEdit = wxNewId();
const long EditorObjetsGroups::idRibbonModName = wxNewId();
const long EditorObjetsGroups::idRibbonHelp = wxNewId();

BEGIN_EVENT_TABLE(EditorObjetsGroups,wxPanel)
	//(*EventTable(EditorObjetsGroups)
	//*)
END_EVENT_TABLE()

EditorObjetsGroups::EditorObjetsGroups( wxWindow* parent,  Game & game_, Scene & scene_, vector < ObjectGroup > * objectsGroups_, MainEditorCommand & mainEditorCommand_) :
game(game_),
scene(scene_),
objectsGroups(objectsGroups_),
mainEditorCommand(mainEditorCommand_)
{
	//(*Initialize(EditorObjetsGroups)
	wxMenuItem* editMenuItem;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	Panel3 = new wxPanel(this, ID_PANEL4, wxDefaultPosition, wxSize(-1,0), wxTAB_TRAVERSAL, _T("ID_PANEL4"));
	FlexGridSizer1->Add(Panel3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	ObjetsGroupsList = new wxTreeCtrl(this, ID_TREECTRL1, wxPoint(-72,-72), wxSize(179,170), wxTR_EDIT_LABELS|wxTR_MULTIPLE|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer1->Add(ObjetsGroupsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	editMenuItem = new wxMenuItem((&ContextMenu), IdGroupEdit, _("Editer le groupe"), wxEmptyString, wxITEM_NORMAL);
	editMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editpropicon.png"))));
	ContextMenu.Append(editMenuItem);
	MenuItem4 = new wxMenuItem((&ContextMenu), idModName, _("Modifier le nom"), wxEmptyString, wxITEM_NORMAL);
	MenuItem4->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
	ContextMenu.Append(MenuItem4);
	ContextMenu.AppendSeparator();
	MenuItem2 = new wxMenuItem((&ContextMenu), idAddGroup, _("Ajouter un groupe"), wxEmptyString, wxITEM_NORMAL);
	MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	ContextMenu.Append(MenuItem2);
	MenuItem3 = new wxMenuItem((&ContextMenu), idDelGroup, _("Supprimer le groupe"), wxEmptyString, wxITEM_NORMAL);
	MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	ContextMenu.Append(MenuItem3);
	ContextMenu.AppendSeparator();
	MenuItem1 = new wxMenuItem((&ContextMenu), ID_MENUITEM1, _("Copier"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
	ContextMenu.Append(MenuItem1);
	MenuItem5 = new wxMenuItem((&ContextMenu), ID_MENUITEM2, _("Couper"), wxEmptyString, wxITEM_NORMAL);
	MenuItem5->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
	ContextMenu.Append(MenuItem5);
	MenuItem6 = new wxMenuItem((&ContextMenu), ID_MENUITEM3, _("Coller"), wxEmptyString, wxITEM_NORMAL);
	MenuItem6->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	ContextMenu.Append(MenuItem6);
	MenuItem7 = new wxMenuItem((&multipleContextMenu), ID_MENUITEM4, _("Supprimer"), wxEmptyString, wxITEM_NORMAL);
	multipleContextMenu.Append(MenuItem7);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Panel3->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorObjetsGroups::OnPanel3Resize,0,this);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_LABEL_EDIT,(wxObjectEventFunction)&EditorObjetsGroups::OnObjetsGroupsListBeginLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_END_LABEL_EDIT,(wxObjectEventFunction)&EditorObjetsGroups::OnObjetsGroupsListEndLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditorObjetsGroups::OnObjetsGroupsListItemDoubleClicked);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&EditorObjetsGroups::OnTreeCtrl1ItemRightClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditorObjetsGroups::OnObjetsGroupsListItemActivated);
	Connect(IdGroupEdit,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjetsGroups::OnEditGroupSelected);
	Connect(idModName,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjetsGroups::OnModNameSelected);
	Connect(idAddGroup,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjetsGroups::OnAddGroupSelected);
	Connect(idDelGroup,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjetsGroups::OnDelGroupSelected);
	Connect(ID_MENUITEM1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjetsGroups::OnCopyGroupSelected);
	Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjetsGroups::OnCutGroupSelected);
	Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjetsGroups::OnPasteGroupSelected);
	Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjetsGroups::OnDelGroupSelected);
	Connect(wxEVT_SET_FOCUS,(wxObjectEventFunction)&EditorObjetsGroups::OnSetFocus);
	//*)

    #if defined(__WXMSW__) //Offer nice look to wxTreeCtrl
    wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
    if(theme) theme->SetWindowTheme((HWND) ObjetsGroupsList->GetHWND(), L"EXPLORER", NULL);
    #endif

    toolbar = new wxToolBar( Panel3, -1, wxDefaultPosition, wxDefaultSize,
                                   wxTB_FLAT | wxTB_NODIVIDER );

    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( ID_Refresh, wxT( "Rafraichir" ), wxBitmap( wxImage( "res/refreshicon.png" ) ), _("Rafraichir la liste d'images") );
    toolbar->AddSeparator();
    toolbar->AddTool( idAddGroup, wxT( "Ajouter un groupe" ), wxBitmap( wxImage( "res/addicon.png" ) ), _("Ajouter un groupe") );
    toolbar->AddTool( idDelGroup, wxT( "Supprimer le groupe selectionné" ), wxBitmap( wxImage( "res/deleteicon.png" ) ), _("Supprimer le groupe selectionné") );
    toolbar->AddTool( IdGroupEdit, wxT( "Modifier le groupe" ), wxBitmap( wxImage( "res/editpropicon.png" ) ), _("Modifier le groupe") );
    toolbar->AddTool( idRibbonUp, wxT( "Déplacer le groupe vers le haut" ), wxBitmap( wxImage( "res/up24.png" ) ), _("Déplacer le groupe vers le haut") );
    toolbar->AddTool( idRibbonDown, wxT( "Déplacer le groupe vers le bas" ), wxBitmap( wxImage( "res/down24.png" ) ), _("Déplacer le groupe vers le bas") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_Help, wxT( "Aide de l'éditeur de groupes d'objets" ), wxBitmap( wxImage( "res/helpicon.png" ) ), _("Aide de l'éditeur de groupes d'objets") );
    toolbar->Realize();

    Connect(ID_Refresh,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorObjetsGroups::Refresh);
    Connect(ID_Help,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorObjetsGroups::OnHelp);

    //Obligatoire avec wxGTK, sinon la toolbar ne s'affiche pas
#ifdef __WXGTK__
    wxSize tbSize = toolbar->GetSize();
    gtk_widget_set_usize( toolbar->m_widget, tbSize.GetWidth(), tbSize.GetHeight() );
#endif

    Refresh();
}

EditorObjetsGroups::~EditorObjetsGroups()
{
	//(*Destroy(EditorObjetsGroups)
	//*)
}

/**
 * Static method for creating ribbon page for this kind of editor
 */
void EditorObjetsGroups::CreateRibbonPage(wxRibbonPage * page)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    bool hideLabels = false;
    pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Liste de groupes"), wxBitmap("res/list24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonAdd, !hideLabels ? _("Ajouter un groupe") : "", wxBitmap("res/add24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonDel, !hideLabels ? _("Supprimer") : "", wxBitmap("res/delete24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonUp, !hideLabels ? _("Déplacer vers le haut") : "", wxBitmap("res/up24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonDown, !hideLabels ? _("Déplacer vers le bas") : "", wxBitmap("res/down24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Objet sélectionné"), wxBitmap("res/edit24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonEdit, !hideLabels ? _("Editer le groupe") : "", wxBitmap("res/editprop24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonModName, !hideLabels ? _("Editer le nom") : "", wxBitmap("res/editname24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Aide"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonHelp, !hideLabels ? _("Aide") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
    }

}

void EditorObjetsGroups::ConnectEvents()
{
    mainEditorCommand.GetMainEditor()->Connect(idRibbonAdd, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjetsGroups::OnAddGroupSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonDel, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjetsGroups::OnDelGroupSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonUp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjetsGroups::OnMoveUpSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonDown, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjetsGroups::OnMoveDownSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonEdit, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjetsGroups::OnEditGroupSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonModName, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjetsGroups::OnModNameSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjetsGroups::OnHelp, NULL, this);
}

////////////////////////////////////////////////////////////
/// Rafraichissement de la liste des groupes
////////////////////////////////////////////////////////////
void EditorObjetsGroups::Refresh()
{
    ObjetsGroupsList->DeleteAllItems();
    ObjetsGroupsList->AddRoot( _( "Tous les groupes d'objets de la scène" ) );

    for (unsigned int i = 0;i<objectsGroups->size();++i)
        ObjetsGroupsList->AppendItem( ObjetsGroupsList->GetRootItem(), objectsGroups->at( i ).GetName() );

    ObjetsGroupsList->ExpandAll();
}

void EditorObjetsGroups::OnMoveUpSelected(wxCommandEvent& event)
{
    string groupName = string(ObjetsGroupsList->GetItemText( itemSelected ).mb_str());

    for (unsigned int i = 0;i<objectsGroups->size();++i)
    {
        if ( objectsGroups->at(i).GetName() == groupName )
        {
            if ( i-1 >= 0)
            {
                ObjectGroup group = objectsGroups->at(i);
                objectsGroups->erase(objectsGroups->begin()+i);
                objectsGroups->insert(objectsGroups->begin()+i-1, group);

                Refresh();

                //Reselect group
                wxTreeItemId item = ObjetsGroupsList->GetLastChild(ObjetsGroupsList->GetRootItem());
                while ( item.IsOk() )
                {
                    if ( ObjetsGroupsList->GetItemText( item ) == groupName )
                    {
                        ObjetsGroupsList->SelectItem(item);
                        return;
                    }
                    item = ObjetsGroupsList->GetPrevSibling(item);
                }
            }

        }
    }
}

void EditorObjetsGroups::OnMoveDownSelected(wxCommandEvent& event)
{
    string groupName = string(ObjetsGroupsList->GetItemText( itemSelected ).mb_str());

    for (unsigned int i = 0;i<objectsGroups->size();++i)
    {
        if ( objectsGroups->at(i).GetName() == groupName )
        {
            if ( static_cast<unsigned>(i+1) < objectsGroups->size())
            {
                ObjectGroup group = objectsGroups->at(i);
                objectsGroups->erase(objectsGroups->begin()+i);
                objectsGroups->insert(objectsGroups->begin()+i+1, group);

                Refresh();

                //Reselect group
                wxTreeItemId item = ObjetsGroupsList->GetLastChild(ObjetsGroupsList->GetRootItem());
                while ( item.IsOk() )
                {
                    if ( ObjetsGroupsList->GetItemText( item ) == groupName )
                    {
                        ObjetsGroupsList->SelectItem(item);
                        return;
                    }
                    item = ObjetsGroupsList->GetPrevSibling(item);
                }
            }

        }
    }
}

////////////////////////////////////////////////////////////
/// Active l'éditeur
////////////////////////////////////////////////////////////
void EditorObjetsGroups::EnableAll()
{
    toolbar->Enable(true);
    wxMenuItemList list = ContextMenu.GetMenuItems();
    wxMenuItemList::iterator iter;
    for (iter = list.begin(); iter != list.end(); ++iter)
    {
        (*iter)->Enable(true);
    }

}

////////////////////////////////////////////////////////////
/// Désactive l'éditeur
////////////////////////////////////////////////////////////
void EditorObjetsGroups::DisableAll()
{
    toolbar->Enable(false);
    wxMenuItemList list = ContextMenu.GetMenuItems();
    wxMenuItemList::iterator iter;
    for (iter = list.begin(); iter != list.end(); ++iter)
    {
        (*iter)->Enable(false);
    }

}

////////////////////////////////////////////////////////////
/// Aide de l'éditeur
////////////////////////////////////////////////////////////
void EditorObjetsGroups::OnHelp(wxCommandEvent& event)
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::GetInstance();
    helpFileAccess->DisplaySection(180);
}

////////////////////////////////////////////////////////////
/// Mise à jour de la taille de la toolbar
////////////////////////////////////////////////////////////
void EditorObjetsGroups::OnPanel3Resize(wxSizeEvent& event)
{
    toolbar->SetSize(Panel3->GetSize().x, -1);
}

/**
 * Display context menus
 */
void EditorObjetsGroups::OnTreeCtrl1ItemRightClick(wxTreeEvent& event)
{
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    itemSelected = event.GetItem();
    wxArrayTreeItemIds selection;

    if ( ObjetsGroupsList->GetSelections(selection) > 1 )
        PopupMenu( &multipleContextMenu );
    else
        PopupMenu( &ContextMenu );
}

////////////////////////////////////////////////////////////
/// Edition d'un groupe
////////////////////////////////////////////////////////////
void EditorObjetsGroups::OnEditGroupSelected(wxCommandEvent& event)
{
    vector<ObjectGroup>::iterator i = std::find_if( objectsGroups->begin(),
                                                    objectsGroups->end(),
                                                    std::bind2nd(HasTheSameName(), ObjetsGroupsList->GetItemText( itemSelected )));
    if ( i != objectsGroups->end() )
    {
        EditObjectGroup dialog(this, game, scene, *i);
        if ( dialog.ShowModal() == 1 )
            *i = dialog.group;

        scene.wasModified = true;
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, scene);
        return;
    }
}

////////////////////////////////////////////////////////////
/// Ajout d'un groupe
////////////////////////////////////////////////////////////
void EditorObjetsGroups::OnAddGroupSelected(wxCommandEvent& event)
{
    //Le nouvel objet
    ObjectGroup NewGroup;
    wxTreeItemId rootId = ObjetsGroupsList->GetRootItem();

    wxString name =  _( "Nouveau_groupe" );
    int i = 1;

    //Tant qu'un objet avec le même nom existe, on ajoute un chiffre
    while ( std::find_if( objectsGroups->begin(), objectsGroups->end(), std::bind2nd(HasTheSameName(), name))
            != objectsGroups->end() )
    {
        ++i;
        name =  _( "Nouveau_groupe" )+"_"+ ToString(i);
    }
    NewGroup.SetName( string(name.mb_str()) );

    //On l'ajoute
    objectsGroups->push_back( NewGroup );
    ObjetsGroupsList->AppendItem( rootId, name );

    scene.wasModified = true;
    CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, scene);
    wxLogStatus( _( "Le groupe a été correctement ajouté" ) );
}

////////////////////////////////////////////////////////////
/// Suppression d'un groupe
////////////////////////////////////////////////////////////
void EditorObjetsGroups::OnDelGroupSelected(wxCommandEvent& event)
{
    //Get selection
    wxArrayTreeItemIds selection;
    ObjetsGroupsList->GetSelections(selection);
    std::vector < string > groupsDeleted;

    int answer = wxMessageBox(selection.GetCount() <= 1 ? _("Supprimer également toutes les références au groupe dans les évènements ( Soit les actions et conditions utilisant le groupe ) ?") :
                                                             wxString::Format(_("Supprimer également toutes les références aux %i groupes dans les évènements ( Soit les actions et conditions utilisant les groupes ) ?"), selection.GetCount()),
                              _("Confirmation de la suppression"), wxYES_NO | wxCANCEL | wxCANCEL_DEFAULT);

    if ( answer == wxCANCEL ) return;

    if ( itemSelected == ObjetsGroupsList->GetRootItem() )
    {
        wxLogStatus( _( "Aucun groupe sélectionné" ) );
        return;
    }

    for (unsigned int i = 0;i<selection.GetCount();++i)
    {
        std::string groupName = string(ObjetsGroupsList->GetItemText( selection[i] ).mb_str());
        groupsDeleted.push_back(groupName); //Generate also a list containing the names of the objects deleted.

        if ( selection[i].IsOk() && ObjetsGroupsList->GetRootItem() != selection[i] )
        {
            vector<ObjectGroup>::iterator i = std::find_if( objectsGroups->begin(),
                                                            objectsGroups->end(),
                                                            std::bind2nd(HasTheSameName(), ObjetsGroupsList->GetItemText( itemSelected )));
            if ( i != objectsGroups->end() )
                objectsGroups->erase( i );

            if ( answer == wxYES )
            {
                EventsRefactorer::RemoveObjectInEvents(game, scene, scene.events, groupName);
            }

            scene.wasModified = true;
            CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, scene);
            ObjetsGroupsList->Delete( itemSelected );
        }
    }

    //Removing items
    void * nothing;
    wxTreeItemId item = ObjetsGroupsList->GetFirstChild( ObjetsGroupsList->GetRootItem(), nothing);
    while( item.IsOk() )
    {
        if ( find(groupsDeleted.begin(), groupsDeleted.end(), string(ObjetsGroupsList->GetItemText( item ).mb_str())) != groupsDeleted.end() )
        {
            ObjetsGroupsList->Delete(item);
            item = ObjetsGroupsList->GetFirstChild(ObjetsGroupsList->GetRootItem(), nothing);
        }
        else
            item = ObjetsGroupsList->GetNextSibling(item);
    }

    return;
}

////////////////////////////////////////////////////////////
/// Choix dans le treeCtrl
////////////////////////////////////////////////////////////
void EditorObjetsGroups::OnObjetsGroupsListItemActivated(wxTreeEvent& event)
{
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    itemSelected = event.GetItem();
    if ( itemSelected == ObjetsGroupsList->GetRootItem() ) return;

    string nomItemSelected = string(ObjetsGroupsList->GetItemText( event.GetItem() ).mb_str());

    vector<ObjectGroup>::iterator i = std::find_if( objectsGroups->begin(),
                                                    objectsGroups->end(),
                                                    std::bind2nd(HasTheSameName(), nomItemSelected));

    //Si on a selectionné un groupe
    if ( i != objectsGroups->end() )
    {
        //Affichage du contenu du groupe
        wxString tooltip = _("Contenu du groupe \"");
        tooltip += nomItemSelected;
        tooltip += "\" :\n";
        vector < string > allObjects = i->GetAllObjectsNames();
        for (unsigned int j = 0;j< allObjects.size() && j < 10;++j)
        {
        	tooltip += allObjects.at(j)+"\n";

        	if ( j == 9 ) tooltip += "...";
        }
        ObjetsGroupsList->SetToolTip( tooltip );
    }
}

////////////////////////////////////////////////////////////
/// Début de l'édition d'un nom de groupe
////////////////////////////////////////////////////////////
void EditorObjetsGroups::OnObjetsGroupsListBeginLabelEdit(wxTreeEvent& event)
{
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    if ( event.GetItem() != ObjetsGroupsList->GetRootItem() )
    {
        ancienNom = ObjetsGroupsList->GetItemText( event.GetItem() );
    }
    else
    {
        //On ne touche pas au dossier "Tous les groupes"
        ObjetsGroupsList->EndEditLabel( event.GetItem(), true );
    }
}

////////////////////////////////////////////////////////////
/// Fin de l'édition d'un nom de groupe
////////////////////////////////////////////////////////////
void EditorObjetsGroups::OnObjetsGroupsListEndLabelEdit(wxTreeEvent& event)
{
    if ( event.IsEditCancelled() )
        return;

    std::string newName = string(event.GetLabel().mb_str());

    //On vérifie que le nom n'existe pas déjà
    if ( std::find_if(  objectsGroups->begin(),
                        objectsGroups->end(),
                        std::bind2nd(HasTheSameName(), event.GetLabel()))
        != objectsGroups->end())
    {
        wxLogWarning( _( "Impossible de renommer le groupe : un autre groupe porte déjà ce nom." ) );

        event.Veto();
        return;
    }
    else
    {
        vector<ObjectGroup>::iterator i = std::find_if( objectsGroups->begin(),
                                                        objectsGroups->end(),
                                                        std::bind2nd(HasTheSameName(), ancienNom));

        if ( i != objectsGroups->end() )
        {
            i->SetName( newName );

            EventsRefactorer::RenameObjectInEvents(game, scene, scene.events, ancienNom, newName);

            scene.wasModified = true;
            CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, scene);
            return;
        }
    }
}

////////////////////////////////////////////////////////////
/// Modifier le nom de du groupe
////////////////////////////////////////////////////////////
void EditorObjetsGroups::OnModNameSelected(wxCommandEvent& event)
{
    if ( ObjetsGroupsList->GetItemText( itemSelected ) != _( "Tous les groupes de de la scène" ) )
        ObjetsGroupsList->EditLabel( itemSelected );
    else
        wxLogStatus( _( "Aucun groupe sélectionné" ) );
}

////////////////////////////////////////////////////////////
/// Edition directe par double clic
////////////////////////////////////////////////////////////
void EditorObjetsGroups::OnObjetsGroupsListItemDoubleClicked(wxTreeEvent& event)
{
    itemSelected = event.GetItem();

    wxCommandEvent uselessEvent;
    OnEditGroupSelected(uselessEvent);
}

/**
 * Change ribbon page and connect events with the editor when selected
 */
void EditorObjetsGroups::OnSetFocus(wxFocusEvent& event)
{
    mainEditorCommand.GetRibbon()->SetActivePage(5);
    ConnectEvents();
}

void EditorObjetsGroups::OnCopyGroupSelected(wxCommandEvent& event)
{
    Clipboard * clipboard = Clipboard::GetInstance();

    if ( itemSelected == ObjetsGroupsList->GetRootItem() ) return;

    vector<ObjectGroup>::iterator i = std::find_if( objectsGroups->begin(),
                                                    objectsGroups->end(),
                                                    std::bind2nd(HasTheSameName(), ObjetsGroupsList->GetItemText( itemSelected )));
    if ( i == objectsGroups->end() ) return;

    clipboard->SetObjectGroup(*i);
}

void EditorObjetsGroups::OnCutGroupSelected(wxCommandEvent& event)
{
    Clipboard * clipboard = Clipboard::GetInstance();

    if ( itemSelected == ObjetsGroupsList->GetRootItem() ) return;

    vector<ObjectGroup>::iterator i = std::find_if( objectsGroups->begin(),
                                                    objectsGroups->end(),
                                                    std::bind2nd(HasTheSameName(), ObjetsGroupsList->GetItemText( itemSelected )));
    if ( i == objectsGroups->end() ) return;

    clipboard->SetObjectGroup(*i);
    objectsGroups->erase( i );

    scene.wasModified = true;
    CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, scene);
    ObjetsGroupsList->Delete( itemSelected );
}

void EditorObjetsGroups::OnPasteGroupSelected(wxCommandEvent& event)
{
    Clipboard * clipboard = Clipboard::GetInstance();
    if ( !clipboard->HasObjectGroup() ) return;
    ObjectGroup groupPasted = clipboard->GetObjectGroup();

    wxTreeItemId rootId = ObjetsGroupsList->GetRootItem();

    //Tant qu'un objet avec le même nom existe, on ajoute un chiffre
    unsigned int i = 0;
    while ( std::find_if( objectsGroups->begin(), objectsGroups->end(), std::bind2nd(HasTheSameName(), groupPasted.GetName()))
            != objectsGroups->end() )
    {
        ++i;
        groupPasted.SetName(ToString(_( "Copie_de_" )+groupPasted.GetName()+"_"+ToString(i)));
    }

    //On l'ajoute
    objectsGroups->push_back( groupPasted );
    ObjetsGroupsList->AppendItem( rootId, groupPasted.GetName());

    scene.wasModified = true;
    CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, scene);
}
