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
#include <wx/msgdlg.h>
#include <string>
#include <vector>
#include <algorithm>
#include "GDCore/PlatformDefinition/ObjectGroup.h"
#include "GDL/Object.h"
#include "GDL/Game.h"
#include "MainFrame.h"
#include "GDL/CommonTools.h"
#include "EditObjectGroup.h"
#include "Clipboard.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDL/Events/CodeCompilationHelpers.h"
#include "GDCore/IDE/EventsRefactorer.h"

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

EditorObjetsGroups::EditorObjetsGroups( wxWindow* parent,  Game & game_, Scene & scene_, vector < gd::ObjectGroup > * objectsGroups_, gd::MainFrameWrapper & mainFrameWrapper_) :
game(game_),
scene(scene_),
objectsGroups(objectsGroups_),
mainFrameWrapper(mainFrameWrapper_)
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
	ObjetsGroupsList = new wxTreeCtrl(this, ID_TREECTRL1, wxPoint(-72,-72), wxSize(179,170), wxTR_EDIT_LABELS|wxTR_MULTIPLE|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer1->Add(ObjetsGroupsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	editMenuItem = new wxMenuItem((&ContextMenu), IdGroupEdit, _("Edit the group"), wxEmptyString, wxITEM_NORMAL);
	editMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editpropicon.png"))));
	ContextMenu.Append(editMenuItem);
	MenuItem4 = new wxMenuItem((&ContextMenu), idModName, _("Change the name"), wxEmptyString, wxITEM_NORMAL);
	MenuItem4->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
	ContextMenu.Append(MenuItem4);
	ContextMenu.AppendSeparator();
	MenuItem2 = new wxMenuItem((&ContextMenu), idAddGroup, _("Add a group"), wxEmptyString, wxITEM_NORMAL);
	MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	ContextMenu.Append(MenuItem2);
	MenuItem3 = new wxMenuItem((&ContextMenu), idDelGroup, _("Delete the group"), wxEmptyString, wxITEM_NORMAL);
	MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	ContextMenu.Append(MenuItem3);
	ContextMenu.AppendSeparator();
	MenuItem1 = new wxMenuItem((&ContextMenu), ID_MENUITEM1, _("Copy"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
	ContextMenu.Append(MenuItem1);
	MenuItem5 = new wxMenuItem((&ContextMenu), ID_MENUITEM2, _("Cut"), wxEmptyString, wxITEM_NORMAL);
	MenuItem5->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
	ContextMenu.Append(MenuItem5);
	MenuItem6 = new wxMenuItem((&ContextMenu), ID_MENUITEM3, _("Paste"), wxEmptyString, wxITEM_NORMAL);
	MenuItem6->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	ContextMenu.Append(MenuItem6);
	MenuItem7 = new wxMenuItem((&multipleContextMenu), ID_MENUITEM4, _("Delete"), wxEmptyString, wxITEM_NORMAL);
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
    toolbar->AddTool( ID_Refresh, _( "Refresh" ), wxBitmap( wxImage( "res/refreshicon.png" ) ), _("Refresh the image list") );
    toolbar->AddSeparator();
    toolbar->AddTool( idAddGroup, _( "Add a group" ), wxBitmap( wxImage( "res/addicon.png" ) ), _("Add a group") );
    toolbar->AddTool( idDelGroup, _( "Delete the selected group" ), wxBitmap( wxImage( "res/deleteicon.png" ) ), _("Delete the selected group") );
    toolbar->AddTool( IdGroupEdit, _( "Edit the group" ), wxBitmap( wxImage( "res/editpropicon.png" ) ), _("Edit the group") );
    toolbar->AddTool( idRibbonUp, _( "Move up" ), wxBitmap( wxImage( "res/up24.png" ) ), _("Move up") );
    toolbar->AddTool( idRibbonDown, _( "Move down" ), wxBitmap( wxImage( "res/down24.png" ) ), _("Move down") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_Help, _( "Objects group editor help" ), wxBitmap( wxImage( "res/helpicon.png" ) ), _("Objects group editor help") );
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
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Group's list"), wxBitmap("res/list24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonAdd, !hideLabels ? _("Add a group") : "", wxBitmap("res/add24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonDel, !hideLabels ? _("Delete") : "", wxBitmap("res/delete24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonUp, !hideLabels ? _("Move up") : "", wxBitmap("res/up24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonDown, !hideLabels ? _("Move down") : "", wxBitmap("res/down24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Selected object"), wxBitmap("res/edit24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonEdit, !hideLabels ? _("Edit the group") : "", wxBitmap("res/editprop24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonModName, !hideLabels ? _("Edit the name") : "", wxBitmap("res/editname24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Help"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonHelp, !hideLabels ? _("Help") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
    }

}

void EditorObjetsGroups::ConnectEvents()
{
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonAdd, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjetsGroups::OnAddGroupSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDel, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjetsGroups::OnDelGroupSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonUp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjetsGroups::OnMoveUpSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDown, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjetsGroups::OnMoveDownSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonEdit, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjetsGroups::OnEditGroupSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonModName, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjetsGroups::OnModNameSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjetsGroups::OnHelp, NULL, this);
}

////////////////////////////////////////////////////////////
/// Rafraichissement de la liste des groupes
////////////////////////////////////////////////////////////
void EditorObjetsGroups::Refresh()
{
    ObjetsGroupsList->DeleteAllItems();
    ObjetsGroupsList->AddRoot( _( "All group of objects of the scene" ) );

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
                gd::ObjectGroup group = objectsGroups->at(i);
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
                gd::ObjectGroup group = objectsGroups->at(i);
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
/// Aide de l'éditeur
////////////////////////////////////////////////////////////
void EditorObjetsGroups::OnHelp(wxCommandEvent& event)
{
    if ( gd::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_FRENCH )
        gd::HelpFileAccess::GetInstance()->DisplaySection(180);
    else
        gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/edit_group")); //TODO
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
    vector<gd::ObjectGroup>::iterator i = std::find_if( objectsGroups->begin(),
                                                    objectsGroups->end(),
                                                    std::bind2nd(gd::GroupHasTheSameName(), ObjetsGroupsList->GetItemText( itemSelected )));
    if ( i != objectsGroups->end() )
    {
        EditObjectGroup dialog(this, game, scene, *i);
        if ( dialog.ShowModal() == 1 )
            *i = dialog.group;

        scene.SetRefreshNeeded();
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
    gd::ObjectGroup NewGroup;
    wxTreeItemId rootId = ObjetsGroupsList->GetRootItem();

    wxString name =  _( "New_group" );
    int i = 1;

    //Tant qu'un objet avec le même nom existe, on ajoute un chiffre
    while ( std::find_if( objectsGroups->begin(), objectsGroups->end(), std::bind2nd(gd::GroupHasTheSameName(), name))
            != objectsGroups->end() )
    {
        ++i;
        name =  _( "New_group" )+"_"+ ToString(i);
    }
    NewGroup.SetName( string(name.mb_str()) );

    //On l'ajoute
    objectsGroups->push_back( NewGroup );
    ObjetsGroupsList->AppendItem( rootId, name );

    scene.SetRefreshNeeded();
    CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, scene);
    wxLogStatus( _( "The group was correctly added." ) );
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

    int answer = wxMessageBox(selection.GetCount() <= 1 ? _("Delete also all references to the group in events ( i.e. Actions and conditions using the object )\?") :
                                                             wxString::Format(_("Delete also all references to these %i groups in events ( i.e. Actions and conditions using the object )\?"), selection.GetCount()),
                              _("Confirm deletion"), wxYES_NO | wxCANCEL | wxCANCEL_DEFAULT);

    if ( answer == wxCANCEL ) return;

    if ( itemSelected == ObjetsGroupsList->GetRootItem() )
    {
        wxLogStatus( _( "No group selected" ) );
        return;
    }

    for (unsigned int i = 0;i<selection.GetCount();++i)
    {
        std::string groupName = string(ObjetsGroupsList->GetItemText( selection[i] ).mb_str());
        groupsDeleted.push_back(groupName); //Generate also a list containing the names of the objects deleted.

        if ( selection[i].IsOk() && ObjetsGroupsList->GetRootItem() != selection[i] )
        {
            vector<gd::ObjectGroup>::iterator i = std::find_if( objectsGroups->begin(),
                                                            objectsGroups->end(),
                                                            std::bind2nd(gd::GroupHasTheSameName(), ObjetsGroupsList->GetItemText( itemSelected )));
            if ( i != objectsGroups->end() )
                objectsGroups->erase( i );

            if ( answer == wxYES )
            {
                gd::EventsRefactorer::RemoveObjectInEvents(game, scene, scene.GetEvents(), groupName);
            }

            scene.SetRefreshNeeded();
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

    vector<gd::ObjectGroup>::iterator i = std::find_if( objectsGroups->begin(),
                                                    objectsGroups->end(),
                                                    std::bind2nd(gd::GroupHasTheSameName(), nomItemSelected));

    //Si on a selectionné un groupe
    if ( i != objectsGroups->end() )
    {
        //Affichage du contenu du groupe
        wxString tooltip = _("Contents of group \"");
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
                        std::bind2nd(gd::GroupHasTheSameName(), event.GetLabel()))
        != objectsGroups->end())
    {
        wxLogWarning( _( "Unable to rename the groupe : another group has already this name." ) );

        event.Veto();
        return;
    }
    else
    {
        vector<gd::ObjectGroup>::iterator i = std::find_if( objectsGroups->begin(),
                                                        objectsGroups->end(),
                                                        std::bind2nd(gd::GroupHasTheSameName(), ancienNom));

        if ( i != objectsGroups->end() )
        {
            i->SetName( newName );

            gd::EventsRefactorer::RenameObjectInEvents(game, scene, scene.GetEvents(), ancienNom, newName);

            scene.SetRefreshNeeded();
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
    if ( ObjetsGroupsList->GetItemText( itemSelected ) != _( "All groups of the scene" ) )
        ObjetsGroupsList->EditLabel( itemSelected );
    else
        wxLogStatus( _( "No group selected" ) );
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
    mainFrameWrapper.GetRibbon()->SetActivePage(5);
    ConnectEvents();
}

void EditorObjetsGroups::OnCopyGroupSelected(wxCommandEvent& event)
{
    Clipboard * clipboard = Clipboard::GetInstance();

    if ( itemSelected == ObjetsGroupsList->GetRootItem() ) return;

    vector<gd::ObjectGroup>::iterator i = std::find_if( objectsGroups->begin(),
                                                    objectsGroups->end(),
                                                    std::bind2nd(gd::GroupHasTheSameName(), ObjetsGroupsList->GetItemText( itemSelected )));
    if ( i == objectsGroups->end() ) return;

    clipboard->SetObjectGroup(*i);
}

void EditorObjetsGroups::OnCutGroupSelected(wxCommandEvent& event)
{
    Clipboard * clipboard = Clipboard::GetInstance();

    if ( itemSelected == ObjetsGroupsList->GetRootItem() ) return;

    vector<gd::ObjectGroup>::iterator i = std::find_if( objectsGroups->begin(),
                                                    objectsGroups->end(),
                                                    std::bind2nd(gd::GroupHasTheSameName(), ObjetsGroupsList->GetItemText( itemSelected )));
    if ( i == objectsGroups->end() ) return;

    clipboard->SetObjectGroup(*i);
    objectsGroups->erase( i );

    scene.SetRefreshNeeded();
    CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, scene);
    ObjetsGroupsList->Delete( itemSelected );
}

void EditorObjetsGroups::OnPasteGroupSelected(wxCommandEvent& event)
{
    Clipboard * clipboard = Clipboard::GetInstance();
    if ( !clipboard->HasObjectGroup() ) return;
    gd::ObjectGroup groupPasted = clipboard->GetObjectGroup();

    wxTreeItemId rootId = ObjetsGroupsList->GetRootItem();

    //Tant qu'un objet avec le même nom existe, on ajoute un chiffre
    unsigned int i = 0;
    while ( std::find_if( objectsGroups->begin(), objectsGroups->end(), std::bind2nd(gd::GroupHasTheSameName(), groupPasted.GetName()))
            != objectsGroups->end() )
    {
        ++i;
        groupPasted.SetName(ToString(_( "Copy_of_" )+groupPasted.GetName()+"_"+ToString(i)));
    }

    //On l'ajoute
    objectsGroups->push_back( groupPasted );
    ObjetsGroupsList->AppendItem( rootId, groupPasted.GetName());

    scene.SetRefreshNeeded();
    CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, scene);
}

