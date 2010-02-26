#include "ProjectManager.h"

//(*InternalHeaders(ProjectManager)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/gallery.h>
#include <wx/ribbon/toolbar.h>
#include "Clipboard.h"
#include "Game_Develop_EditorMain.h"
#include "gdTreeItemGameData.h"
#include "GDL/ChercherScene.h"

#include "Extensions.h"
#include "EditPropJeu.h"
#include "InitialVariablesDialog.h"
#include "EditPropScene.h"

//(*IdInit(ProjectManager)
const long ProjectManager::ID_TREECTRL1 = wxNewId();
const long ProjectManager::idMenuEditScene = wxNewId();
const long ProjectManager::idMenuEditPropScene = wxNewId();
const long ProjectManager::idMenuModVar = wxNewId();
const long ProjectManager::idMenuModNameScene = wxNewId();
const long ProjectManager::idMenuAddScene = wxNewId();
const long ProjectManager::idMenuDelScene = wxNewId();
const long ProjectManager::idMenuCopyScene = wxNewId();
const long ProjectManager::idMenuCutScene = wxNewId();
const long ProjectManager::idMenuPasteScene = wxNewId();
const long ProjectManager::ID_MENUITEM1 = wxNewId();
const long ProjectManager::ID_MENUITEM2 = wxNewId();
const long ProjectManager::ID_MENUITEM3 = wxNewId();
const long ProjectManager::ID_MENUITEM4 = wxNewId();
const long ProjectManager::ID_MENUITEM5 = wxNewId();
//*)
const long ProjectManager::idRibbonNew = wxNewId();
const long ProjectManager::idRibbonOpen = wxNewId();
const long ProjectManager::idRibbonSave = wxNewId();
const long ProjectManager::idRibbonCompil = wxNewId();
const long ProjectManager::idRibbonClose = wxNewId();
const long ProjectManager::idRibbonExtensions = wxNewId();
const long ProjectManager::idRibbonAddScene = wxNewId();
const long ProjectManager::idRibbonEditImages = wxNewId();
const long ProjectManager::idRibbonEditScene = wxNewId();

BEGIN_EVENT_TABLE(ProjectManager,wxPanel)
	//(*EventTable(ProjectManager)
	//*)
END_EVENT_TABLE()

ProjectManager::ProjectManager(wxWindow* parent, Game_Develop_EditorFrame & mainEditor_) :
mainEditor(mainEditor_)
{
	//(*Initialize(ProjectManager)
	wxMenuItem* deleteSceneMenuItem;
	wxMenuItem* editSceneNameMenuItem;
	wxMenuItem* editSceneMenuItem;
	wxFlexGridSizer* FlexGridSizer1;
	wxMenuItem* addSceneMenuItem;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	projectsTree = new wxTreeCtrl(this, ID_TREECTRL1, wxDefaultPosition, wxSize(209,197), wxTR_EDIT_LABELS|wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer1->Add(projectsTree, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	editSceneMenuItem = new wxMenuItem((&sceneContextMenu), idMenuEditScene, _("Editer cette scène"), wxEmptyString, wxITEM_NORMAL);
	editSceneMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editicon.png"))));
	sceneContextMenu.Append(editSceneMenuItem);
	#ifdef __WXMSW__
	sceneContextMenu.Remove(editSceneMenuItem);
	wxFont boldFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	editSceneMenuItem->SetFont(boldFont);
	sceneContextMenu.Append(editSceneMenuItem);
	#endif
	editScenePropMenuItem = new wxMenuItem((&sceneContextMenu), idMenuEditPropScene, _("Modifier les propriétés"), wxEmptyString, wxITEM_NORMAL);
	editScenePropMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editpropicon.png"))));
	sceneContextMenu.Append(editScenePropMenuItem);
	modVarSceneMenuI = new wxMenuItem((&sceneContextMenu), idMenuModVar, _("Modifier les variables initiales"), wxEmptyString, wxITEM_NORMAL);
	modVarSceneMenuI->SetBitmap(wxBitmap(wxImage(_T("res/var.png"))));
	sceneContextMenu.Append(modVarSceneMenuI);
	editSceneNameMenuItem = new wxMenuItem((&sceneContextMenu), idMenuModNameScene, _("Modifier le nom"), wxEmptyString, wxITEM_NORMAL);
	editSceneNameMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
	sceneContextMenu.Append(editSceneNameMenuItem);
	sceneContextMenu.AppendSeparator();
	addSceneMenuItem = new wxMenuItem((&sceneContextMenu), idMenuAddScene, _("Ajouter une scène"), wxEmptyString, wxITEM_NORMAL);
	addSceneMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	sceneContextMenu.Append(addSceneMenuItem);
	deleteSceneMenuItem = new wxMenuItem((&sceneContextMenu), idMenuDelScene, _("Supprimer la scène"), wxEmptyString, wxITEM_NORMAL);
	deleteSceneMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	sceneContextMenu.Append(deleteSceneMenuItem);
	sceneContextMenu.AppendSeparator();
	copySceneMenuItem = new wxMenuItem((&sceneContextMenu), idMenuCopyScene, _("Copier la scène"), wxEmptyString, wxITEM_NORMAL);
	copySceneMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
	sceneContextMenu.Append(copySceneMenuItem);
	cutSceneMenuItem = new wxMenuItem((&sceneContextMenu), idMenuCutScene, _("Couper la scène"), wxEmptyString, wxITEM_NORMAL);
	cutSceneMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
	sceneContextMenu.Append(cutSceneMenuItem);
	pasteSceneMenuItem = new wxMenuItem((&sceneContextMenu), idMenuPasteScene, _("Coller la scène"), wxEmptyString, wxITEM_NORMAL);
	pasteSceneMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	sceneContextMenu.Append(pasteSceneMenuItem);
	MenuItem1 = new wxMenuItem((&scenesContextMenu), ID_MENUITEM1, _("Ajouter une scène"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	scenesContextMenu.Append(MenuItem1);
	editPropGameMenuItem = new wxMenuItem((&gameContextMenu), ID_MENUITEM2, _("Editer les propriétés du jeu"), wxEmptyString, wxITEM_NORMAL);
	editPropGameMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editpropicon.png"))));
	gameContextMenu.Append(editPropGameMenuItem);
	editGblVarMenuItem = new wxMenuItem((&gameContextMenu), ID_MENUITEM3, _("Modifier les variables globales"), wxEmptyString, wxITEM_NORMAL);
	editGblVarMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/var.png"))));
	gameContextMenu.Append(editGblVarMenuItem);
	editNameGameMenuItem = new wxMenuItem((&gameContextMenu), ID_MENUITEM4, _("Modifier le nom"), wxEmptyString, wxITEM_NORMAL);
	editNameGameMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
	gameContextMenu.Append(editNameGameMenuItem);
	gameContextMenu.AppendSeparator();
	closeGameBt = new wxMenuItem((&gameContextMenu), ID_MENUITEM5, _("Fermer ce projet"), wxEmptyString, wxITEM_NORMAL);
	gameContextMenu.Append(closeGameBt);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_LABEL_EDIT,(wxObjectEventFunction)&ProjectManager::OnprojectsTreeBeginLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_END_LABEL_EDIT,(wxObjectEventFunction)&ProjectManager::OnprojectsTreeEndLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ProjectManager::OnprojectsTreeItemActivated);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&ProjectManager::OnprojectsTreeItemRightClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ProjectManager::OnprojectsTreeSelectionChanged);
	Connect(idMenuEditScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OneditSceneMenuItemSelected);
	Connect(idMenuEditPropScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OneditScenePropMenuItemSelected);
	Connect(idMenuModVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnmodVarSceneMenuISelected);
	Connect(idMenuModNameScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OneditSceneNameMenuItemSelected);
	Connect(idMenuAddScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnaddSceneMenuItemSelected);
	Connect(idMenuDelScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OndeleteSceneMenuItemSelected);
	Connect(idMenuCopyScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OncopySceneMenuItemSelected);
	Connect(idMenuCutScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OncutSceneMenuItemSelected);
	Connect(idMenuPasteScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnpasteSceneMenuItemSelected);
	Connect(ID_MENUITEM1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnaddSceneMenuItemSelected);
	Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OneditPropGameMenuItemSelected);
	Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OneditGblVarMenuItemSelected);
	Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OneditNameGameMenuItemSelected);
	Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OncloseGameBtSelected);
	//*)

    wxImageList * imageList = new wxImageList(16,16);
    imageList->Add(wxBitmap("res/window.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/sceneeditor.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/imageicon.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/extensiononly16.png", wxBITMAP_TYPE_ANY));
    projectsTree->SetImageList(imageList);

    Refresh();
}

ProjectManager::~ProjectManager()
{
	//(*Destroy(ProjectManager)
	//*)
}


/**
 * Static method for creating ribbon page for this kind of editor
 */
void ProjectManager::CreateRibbonPage(wxRibbonPage * page)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    bool hideLabels = false;
    pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Projets"), wxBitmap("res/openicon.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonNew, !hideLabels ? _("Nouveau") : "", wxBitmap("res/newicon24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddHybridButton(idRibbonOpen, !hideLabels ? _("Ouvrir") : "", wxBitmap("res/openicon24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *file2Panel = new wxRibbonPanel(page, wxID_ANY, _("Projet actuel"), wxBitmap("res/saveicon.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_EXT_BUTTON);
        wxRibbonButtonBar *file2_bar = new wxRibbonButtonBar(file2Panel, wxID_ANY);
        file2_bar->AddHybridButton(idRibbonSave, !hideLabels ? _("Enregistrer") : " ", wxBitmap("res/saveicon24.png", wxBITMAP_TYPE_ANY));
        file2_bar->AddButton(idRibbonClose, !hideLabels ? _("Fermer") : "", wxBitmap("res/close24.png", wxBITMAP_TYPE_ANY));
        file2_bar->AddButton(idRibbonCompil, !hideLabels ? _("Compilation") : "", wxBitmap("res/compilicon24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Opérations de base sur le jeu"), wxBitmap("res/copy24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonEditImages, !hideLabels ? _("Images") : "", wxBitmap("res/imageicon24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonAddScene, !hideLabels ? _("Ajouter une scène") : "", wxBitmap("res/sceneadd24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonExtensions, !hideLabels ? _("Extensions") : "", wxBitmap("res/extension24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonEditScene, !hideLabels ? _("Editer la scène selectionnée") : "", wxBitmap("res/sceneedit24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Aide"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(wxID_ANY, !hideLabels ? _("Aide") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
    }

}

void ProjectManager::ConnectEvents()
{
    mainEditor.Connect( idRibbonNew, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuNewSelected, NULL, &mainEditor );
    mainEditor.Connect( idRibbonOpen, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuOpenSelected, NULL, &mainEditor );
    mainEditor.Connect( idRibbonOpen, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonOpenDropDownClicked, NULL, &mainEditor );
    mainEditor.Connect( idRibbonSave, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuSaveSelected, NULL, &mainEditor );
    mainEditor.Connect( idRibbonSave, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonSaveDropDownClicked, NULL, &mainEditor );
    mainEditor.Connect( idRibbonCompil, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuCompilationSelected, NULL, &mainEditor );
    mainEditor.Connect( idRibbonClose, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonCloseSelected, NULL, this );
    mainEditor.Connect( idRibbonExtensions, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonExtensionsSelected, NULL, this );
    mainEditor.Connect( idRibbonEditImages, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonEditImagesSelected, NULL, this );
    mainEditor.Connect( idRibbonAddScene, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonAddSceneSelected, NULL, this );
    mainEditor.Connect( idRibbonEditScene, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonEditSceneSelected, NULL, this );
}

void ProjectManager::Refresh()
{
    projectsTree->DeleteAllItems();
    projectsTree->AddRoot(_("Projets"));
    for (unsigned int i = 0;i<mainEditor.games.size();++i)
    {
        wxString name = mainEditor.games[i]->name == "" ?
                        _("(Sans nom)") :
                        mainEditor.games[i]->name;

        //Adding game's root
        gdTreeItemGameData * gameItemData = new gdTreeItemGameData("Root", "", mainEditor.games[i].get());
        wxTreeItemId projectItem = projectsTree->AppendItem(projectsTree->GetRootItem(), name, 0, 0, gameItemData);
        if ( mainEditor.gameCurrentlyEdited == i) projectsTree->SetItemBold(projectItem, true);

        //Images
        gdTreeItemGameData * imagesItemData = new gdTreeItemGameData("Images", "", mainEditor.games[i].get());
        projectsTree->AppendItem(projectItem, _("Images"), 2 ,2, imagesItemData);

        //Scenes
        gdTreeItemGameData * scenesItemData = new gdTreeItemGameData("Scenes", "", mainEditor.games[i].get());
        wxTreeItemId scenesItem = projectsTree->AppendItem(projectItem, _("Scenes"), 1 ,1, scenesItemData);
        for (unsigned int j = 0;j<mainEditor.games[i]->scenes.size();++j)
        {
            gdTreeItemGameData * sceneItemData = new gdTreeItemGameData("Scene", mainEditor.games[i]->scenes[j]->GetName(), mainEditor.games[i].get());
            projectsTree->AppendItem(scenesItem, mainEditor.games[i]->scenes[j]->GetName(), 1 ,1, sceneItemData);
        }

        //Extensions
        gdTreeItemGameData * extensionsItemData = new gdTreeItemGameData("Extensions", "", mainEditor.games[i].get());
        projectsTree->AppendItem(projectItem, _("Extensions") + " (" + toString(mainEditor.games[i]->extensionsUsed.size()) + ")", 3 ,3, extensionsItemData);
    }

    projectsTree->ExpandAll();
}


/**
 * Double click on an item
 */
void ProjectManager::OnprojectsTreeItemActivated(wxTreeEvent& event)
{
    selectedItem = event.GetItem();

    gdTreeItemGameData * data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL)
        return;

    RuntimeGame * game = dynamic_cast<RuntimeGame*>(data->GetGamePointer());
    if ( game == NULL)
        return;

    string prefix = "";
    if ( mainEditor.games.size() > 1 )
    {
        prefix = "["+game->name+"] ";
        if ( game->name.length() > gameMaxCharDisplayedInEditor )
            prefix = "["+game->name.substr(0, gameMaxCharDisplayedInEditor-3)+"...] ";
    }

    if ( data->GetString() == "Root")
    {
        //Set all projects font to a normal font.
        wxTreeItemIdValue cookie;
        wxTreeItemId child = projectsTree->GetFirstChild(projectsTree->GetRootItem(), cookie);
        while(child.IsOk())
        {
            projectsTree->SetItemBold(child, false);

            child = projectsTree->GetNextChild(projectsTree->GetRootItem(), cookie);
        }

        //Activate the project double clicked
        for(unsigned int i = 0;i<mainEditor.games.size();++i)
        {
            if (mainEditor.games[i].get() == game)
            {
                projectsTree->SetItemBold(selectedItem, true);
                mainEditor.SetCurrentGame(i);
            }
        }
    }
    else if ( data->GetString() == "Images")
    {
        EditImagesOfGame(game);
    }
    else if ( data->GetString() == "Scene")
    {
        wxCommandEvent unusedEvent;
        OneditSceneMenuItemSelected(unusedEvent);
    }
    else if ( data->GetString() == "Extensions")
    {
        EditExtensionsOfGame(game);

        projectsTree->SetItemText(selectedItem, _("Extensions") + " (" + toString(game->extensionsUsed.size()) + ")");
    }
}

/**
 * Right click on an item
 */
void ProjectManager::OnprojectsTreeItemRightClick(wxTreeEvent& event)
{
    selectedItem = event.GetItem();

    gdTreeItemGameData * data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL)
        return;

    if ( data->GetString() == "Scene")
    {
        PopupMenu(&sceneContextMenu);
    }
    else if ( data->GetString() == "Scenes")
    {
        PopupMenu(&scenesContextMenu);
    }
    else if ( data->GetString() == "Root")
    {
        PopupMenu(&gameContextMenu);
    }
}

/**
 * Edit a scene from ribbon
 */
void ProjectManager::OnRibbonEditSceneSelected(wxRibbonButtonBarEvent& event)
{
    wxCommandEvent unusedEvent;
    OneditSceneMenuItemSelected(unusedEvent);
}

/**
 * Edit a scene
 */
void ProjectManager::OneditSceneMenuItemSelected(wxCommandEvent& event)
{
    gdTreeItemGameData * data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL)
        return;

    RuntimeGame * game = dynamic_cast<RuntimeGame*>(data->GetGamePointer());
    if ( game == NULL)
        return;

    MainEditorCommand mainEditorCommand;
    mainEditorCommand.SetMainEditor(&mainEditor);
    mainEditorCommand.SetRibbonSceneEditorButtonBar(mainEditor.GetRibbonSceneEditorButtonBar()); //Need link to the scene editor wxRibbonButtonBar
    mainEditorCommand.SetRibbon(mainEditor.GetRibbon());

    vector< boost::shared_ptr<Scene> >::const_iterator scene =
        find_if(game->scenes.begin(), game->scenes.end(), bind2nd(SceneHasName(), data->GetSecondString()));

    if ( scene == game->scenes.end() )
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    //Verify if the scene editor is not already opened
    for (unsigned int j =0;j<mainEditor.GetEditorsNotebook()->GetPageCount() ;j++ )
    {
        EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(mainEditor.GetEditorsNotebook()->GetPage(j));

        if ( sceneEditorPtr != NULL && &sceneEditorPtr->scene == (*scene).get() )
        {
            //Change notebook page to scene page
            mainEditor.GetEditorsNotebook()->SetSelection(j);
            return;
        }
    }

    //Open a new editor if necessary
    string prefix = "";
    if ( mainEditor.games.size() > 1 )
    {
        prefix = "["+game->name+"] ";
        if ( game->name.length() > gameMaxCharDisplayedInEditor )
            prefix = "["+game->name.substr(0, gameMaxCharDisplayedInEditor-3)+"...] ";
    }

    EditorScene * editorScene = new EditorScene(mainEditor.GetEditorsNotebook(), *game, *(*scene), mainEditorCommand);
    mainEditor.GetEditorsNotebook()->AddPage(editorScene, prefix+data->GetSecondString(), true, wxBitmap("res/sceneeditor.png", wxBITMAP_TYPE_ANY));
}

/**
 * Edit properties of a scene
 */
void ProjectManager::OneditScenePropMenuItemSelected(wxCommandEvent& event)
{
    gdTreeItemGameData * data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL)
        return;

    RuntimeGame * game = dynamic_cast<RuntimeGame*>(data->GetGamePointer());
    if ( game == NULL)
        return;

    MainEditorCommand mainEditorCommand;
    mainEditorCommand.SetMainEditor(&mainEditor);
    mainEditorCommand.SetRibbonSceneEditorButtonBar(mainEditor.GetRibbonSceneEditorButtonBar()); //Need link to the scene editor wxRibbonButtonBar
    mainEditorCommand.SetRibbon(mainEditor.GetRibbon());

    vector< boost::shared_ptr<Scene> >::const_iterator scene =
        find_if(game->scenes.begin(), game->scenes.end(), bind2nd(SceneHasName(), data->GetSecondString()));

    if ( scene == game->scenes.end() )
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    EditPropScene dialog( this, (*scene).get() );
    dialog.ShowModal();

    (*scene)->wasModified = true;
}

/**
 * Edit variables of a scene
 */
void ProjectManager::OnmodVarSceneMenuISelected(wxCommandEvent& event)
{
    gdTreeItemGameData * data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL)
        return;

    RuntimeGame * game = dynamic_cast<RuntimeGame*>(data->GetGamePointer());
    if ( game == NULL)
        return;

    MainEditorCommand mainEditorCommand;
    mainEditorCommand.SetMainEditor(&mainEditor);
    mainEditorCommand.SetRibbonSceneEditorButtonBar(mainEditor.GetRibbonSceneEditorButtonBar()); //Need link to the scene editor wxRibbonButtonBar
    mainEditorCommand.SetRibbon(mainEditor.GetRibbon());

    vector< boost::shared_ptr<Scene> >::const_iterator scene =
        find_if(game->scenes.begin(), game->scenes.end(), bind2nd(SceneHasName(), data->GetSecondString()));

    if ( scene == game->scenes.end() )
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    InitialVariablesDialog dialog(this, (*scene)->variables);
    if ( dialog.ShowModal() == 1 )
    {
        (*scene)->variables = dialog.variables;
        (*scene)->wasModified = true;
    }
}

/**
 * Edit name of a scene
 */
void ProjectManager::OneditSceneNameMenuItemSelected(wxCommandEvent& event)
{
    projectsTree->EditLabel( selectedItem );
}

/**
 * Start renaming something
 */
void ProjectManager::OnprojectsTreeBeginLabelEdit(wxTreeEvent& event)
{
    selectedItem = event.GetItem();

    itemTextBeforeEditing = projectsTree->GetItemText(event.GetItem());

    gdTreeItemGameData * data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL)
        return;

    RuntimeGame * game = dynamic_cast<RuntimeGame*>(data->GetGamePointer());
    if ( game == NULL)
        return;

    if ( data->GetString() != "Scene" && data->GetString() != "Root")
        projectsTree->EndEditLabel( selectedItem, true );
}

/**
 * End renaming something
 */
void ProjectManager::OnprojectsTreeEndLabelEdit(wxTreeEvent& event)
{
    if ( event.IsEditCancelled() ) return;

    selectedItem = event.GetItem();
    string newName = string(event.GetLabel().mb_str());

    gdTreeItemGameData * data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL)
        return;

    RuntimeGame * game = dynamic_cast<RuntimeGame*>(data->GetGamePointer());
    if ( game == NULL)
        return;

    if ( data->GetString() == "Root")
    {
        game->name = newName;
    }
    //Renaming a scene
    else if ( data->GetString() == "Scene")
    {
        vector< boost::shared_ptr<Scene> >::iterator scene =
            find_if(game->scenes.begin(), game->scenes.end(), bind2nd(SceneHasName(), itemTextBeforeEditing));

        if ( scene == game->scenes.end() )
        {
            wxLogWarning(_("Scène introuvable."));
            return;
        }

        if ( find_if(game->scenes.begin(), game->scenes.end(), bind2nd(SceneHasName(), newName)) != game->scenes.end() )
        {
            wxLogWarning( _( "Impossible de renommer : une scène porte déjà ce nom !" ) );
            Refresh();
            return;
        }

        projectsTree->SetItemData(selectedItem, new gdTreeItemGameData("Scene", newName, game));

        (*scene)->SetName(newName);

        //Updating editors
        for (unsigned int k =0;k<static_cast<unsigned>(mainEditor.GetEditorsNotebook()->GetPageCount()) ;k++ )
        {
            EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(mainEditor.GetEditorsNotebook()->GetPage(k));

            //Si il s'agit d'un éditeur de scène avec ce nom, on le renomme
            if ( sceneEditorPtr != NULL && &sceneEditorPtr->scene == (*scene).get())
                mainEditor.GetEditorsNotebook()->SetPageText(k, event.GetLabel());
        }
    }
}

/**
 * Add a scene from ribbon button
 */
void ProjectManager::OnRibbonAddSceneSelected(wxRibbonButtonBarEvent& event)
{
    if ( !mainEditor.CurrentGameIsValid() ) return;

    AddSceneToGame(mainEditor.GetCurrentGame().get());

    Refresh();
}

/**
 * Add a new scene to a game from Right Click
 */
void ProjectManager::OnaddSceneMenuItemSelected(wxCommandEvent& event)
{
    gdTreeItemGameData * data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL)
        return;

    RuntimeGame * game = dynamic_cast<RuntimeGame*>(data->GetGamePointer());
    if ( game == NULL)
        return;

    AddSceneToGame(game);

    Refresh();
}

/**
 * Add a scene to a game
 */
void ProjectManager::AddSceneToGame(Game * game)
{
    //Finding a new, unique name for the scene
    string newSceneName = string(_("Nouvelle scène"));
    int i = 1;
    while(find_if(game->scenes.begin(), game->scenes.end(), bind2nd(SceneHasName(), newSceneName)) != game->scenes.end())
    {
        newSceneName = _("Nouvelle scène") + " " + toString(i);
        ++i;
    }

    boost::shared_ptr<Scene> newScene = boost::shared_ptr<Scene>(new Scene());
    newScene->SetName(newSceneName);

    game->scenes.push_back(newScene);
}

/**
 * Edit images from ribbon button
 */
void ProjectManager::OnRibbonEditImagesSelected(wxRibbonButtonBarEvent& event)
{
    if ( !mainEditor.CurrentGameIsValid() ) return;

    EditImagesOfGame(mainEditor.GetCurrentGame().get());
}

/**
 * Edit images of a game
 */
void ProjectManager::EditImagesOfGame(Game * game)
{
    MainEditorCommand mainEditorCommand;
    mainEditorCommand.SetMainEditor(&mainEditor);
    mainEditorCommand.SetRibbon(mainEditor.GetRibbon());

    //Verify if the image editor is not already opened
    for (unsigned int j =0;j<mainEditor.GetEditorsNotebook()->GetPageCount() ;j++ )
    {
        EditorImages * imagesEditorPtr = dynamic_cast<EditorImages*>(mainEditor.GetEditorsNotebook()->GetPage(j));

        if ( imagesEditorPtr != NULL && &imagesEditorPtr->game == game )
        {
            //Change notebook page to editor page
            mainEditor.GetEditorsNotebook()->SetSelection(j);
            return;
        }
    }

    //Open a new editor if necessary
    string prefix = "";
    if ( mainEditor.games.size() > 1 )
    {
        prefix = "["+game->name+"] ";
        if ( game->name.length() > gameMaxCharDisplayedInEditor )
            prefix = "["+game->name.substr(0, gameMaxCharDisplayedInEditor-3)+"...] ";
    }

    EditorImages * editorImages = new EditorImages(&mainEditor, *game, mainEditorCommand, true);
    mainEditor.GetEditorsNotebook()->AddPage(editorImages, prefix+_("Banque d'images"), true, wxBitmap("res/imageicon.png", wxBITMAP_TYPE_ANY));
}

/**
 * Delete a scene from a game
 */
void ProjectManager::OndeleteSceneMenuItemSelected(wxCommandEvent& event)
{
    gdTreeItemGameData * data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL)
        return;

    RuntimeGame * game = dynamic_cast<RuntimeGame*>(data->GetGamePointer());
    if ( game == NULL)
        return;

    vector< boost::shared_ptr<Scene> >::iterator scene =
        find_if(game->scenes.begin(), game->scenes.end(), bind2nd(SceneHasName(), data->GetSecondString()));

    if ( scene == game->scenes.end() )
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    //Updating editors
    for (unsigned int k =0;k<static_cast<unsigned>(mainEditor.GetEditorsNotebook()->GetPageCount()) ;k++ )
    {
        EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(mainEditor.GetEditorsNotebook()->GetPage(k));

        if ( sceneEditorPtr != NULL && &sceneEditorPtr->scene == (*scene).get())
        {
            mainEditor.GetEditorsNotebook()->DeletePage(k);
            k--;
        }
    }

    //Updating tree
    projectsTree->Delete(selectedItem);

    game->scenes.erase(scene);
}

/**
 * Copy a scene
 */
void ProjectManager::OncopySceneMenuItemSelected(wxCommandEvent& event)
{
    gdTreeItemGameData * data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL)
        return;

    RuntimeGame * game = dynamic_cast<RuntimeGame*>(data->GetGamePointer());
    if ( game == NULL)
        return;

    vector< boost::shared_ptr<Scene> >::const_iterator scene =
        find_if(game->scenes.begin(), game->scenes.end(), bind2nd(SceneHasName(), data->GetSecondString()));

    if ( scene == game->scenes.end() )
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    Clipboard * clipboard = Clipboard::getInstance();
    clipboard->SetScene(*(*scene));
}

/**
 * Cut a scene
 */
void ProjectManager::OncutSceneMenuItemSelected(wxCommandEvent& event)
{
    gdTreeItemGameData * data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL)
        return;

    RuntimeGame * game = dynamic_cast<RuntimeGame*>(data->GetGamePointer());
    if ( game == NULL)
        return;

    vector< boost::shared_ptr<Scene> >::iterator scene =
        find_if(game->scenes.begin(), game->scenes.end(), bind2nd(SceneHasName(), data->GetSecondString()));

    if ( scene == game->scenes.end() )
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    Clipboard * clipboard = Clipboard::getInstance();
    clipboard->SetScene(*(*scene));

    //Updating editors
    for (unsigned int k =0;k<static_cast<unsigned>(mainEditor.GetEditorsNotebook()->GetPageCount()) ;k++ )
    {
        EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(mainEditor.GetEditorsNotebook()->GetPage(k));

        if ( sceneEditorPtr != NULL && &sceneEditorPtr->scene == (*scene).get())
        {
            mainEditor.GetEditorsNotebook()->DeletePage(k);
            k--;
        }
    }

    //Updating tree
    projectsTree->Delete(selectedItem);

    game->scenes.erase(scene);
}

void ProjectManager::OnpasteSceneMenuItemSelected(wxCommandEvent& event)
{
    gdTreeItemGameData * data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL)
        return;

    RuntimeGame * game = dynamic_cast<RuntimeGame*>(data->GetGamePointer());
    if ( game == NULL)
        return;

    vector< boost::shared_ptr<Scene> >::iterator scene =
        find_if(game->scenes.begin(), game->scenes.end(), bind2nd(SceneHasName(), data->GetSecondString()));

    if ( scene == game->scenes.end() )
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    Clipboard * clipboard = Clipboard::getInstance();
    boost::shared_ptr<Scene> newScene = boost::shared_ptr<Scene>(new Scene(clipboard->GetScene()));

    //Finding a new, unique name for the scene
    string newSceneName = string(_("Copie de")) + " " + newScene->GetName();
    int i = 1;
    while(find_if(game->scenes.begin(), game->scenes.end(), bind2nd(SceneHasName(), newSceneName)) != game->scenes.end())
    {
        newSceneName = _("Copie de") + " " + newScene->GetName() + " " + toString(i);
        ++i;
    }

    newScene->SetName(newSceneName);
    game->scenes.insert(scene, newScene);

    //Insert in tree
    gdTreeItemGameData * sceneItemData = new gdTreeItemGameData("Scene", newSceneName, game);
    if ( projectsTree->GetPrevSibling(selectedItem).IsOk() )
        projectsTree->InsertItem(projectsTree->GetItemParent(selectedItem), projectsTree->GetPrevSibling(selectedItem), newSceneName, 1, 1, sceneItemData);
    else
        projectsTree->InsertItem(projectsTree->GetItemParent(selectedItem), 0, newSceneName, 1, 1, sceneItemData);
}

/**
 * Edit the name of a game
 */
void ProjectManager::OneditNameGameMenuItemSelected(wxCommandEvent& event)
{
    projectsTree->EditLabel( selectedItem );
}

/**
 * Edit global variables of a game
 */
void ProjectManager::OneditGblVarMenuItemSelected(wxCommandEvent& event)
{
    gdTreeItemGameData * data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL)
        return;

    RuntimeGame * game = dynamic_cast<RuntimeGame*>(data->GetGamePointer());
    if ( game == NULL)
        return;

    InitialVariablesDialog dialog(this, game->variables);
    if ( dialog.ShowModal() == 1 )
    {
        game->variables = dialog.variables;
        for (unsigned int i = 0;i<game->scenes.size();++i)
        	game->scenes[i]->wasModified = true;
    }
}

/**
 * Edit the properties of a game
 */
void ProjectManager::OneditPropGameMenuItemSelected(wxCommandEvent& event)
{
    gdTreeItemGameData * data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL)
        return;

    RuntimeGame * game = dynamic_cast<RuntimeGame*>(data->GetGamePointer());
    if ( game == NULL)
        return;

    EditPropJeu Dialog( this, game );
    Dialog.ShowModal();

    projectsTree->SetItemText(selectedItem, game->name); //The name can have been changed
}

/**
 * Edit extensions of a game
 */
void ProjectManager::EditExtensionsOfGame(Game * game)
{
    Extensions dialog(this, *game);
    dialog.ShowModal();
}

void ProjectManager::OnRibbonExtensionsSelected(wxRibbonButtonBarEvent& event)
{
    if ( !mainEditor.CurrentGameIsValid() ) return;

    EditExtensionsOfGame(mainEditor.GetCurrentGame().get());

    Refresh();
}

/**
 * Close a game
 */
void ProjectManager::CloseGame(Game * game)
{
    //Closing all editors related to game
    for (unsigned int k =0;k<static_cast<unsigned>(mainEditor.GetEditorsNotebook()->GetPageCount()) ;k++ )
    {
        EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(mainEditor.GetEditorsNotebook()->GetPage(k));
        EditorImages * imagesEditorPtr = dynamic_cast<EditorImages*>(mainEditor.GetEditorsNotebook()->GetPage(k));

        if ( sceneEditorPtr != NULL )
        {
            bool sceneBelongToGame = false;
            for (unsigned int i = 0;i<game->scenes.size();++i)
            {
            	if ( game->scenes[i].get() == &sceneEditorPtr->scene )
                    sceneBelongToGame = true;
            }

            if ( sceneBelongToGame )
            {
                mainEditor.GetEditorsNotebook()->DeletePage(k);
                k--;
            }
        }
        else if ( imagesEditorPtr != NULL )
        {
            if ( &imagesEditorPtr->game == game)
            {
                mainEditor.GetEditorsNotebook()->DeletePage(k);
                k--;
            }
        }
    }

    for (unsigned int i = 0;i<mainEditor.games.size();++i)
    {
    	if ( mainEditor.games[i].get() == game)
            mainEditor.games.erase(mainEditor.games.begin()+i);
    }

    mainEditor.SetCurrentGame(mainEditor.games.size()-1);
}

/**
 * Click on Close Button in ribbon
 */
void ProjectManager::OnRibbonCloseSelected(wxRibbonButtonBarEvent& event)
{
    if ( !mainEditor.CurrentGameIsValid() ) return;

    if ( wxMessageBox( _( "Attention !\nToute modification non enregistrée sera perdue.\n\nFermer le projet actuel ?" ), _( "Confirmation" ), wxYES_NO, this ) == wxNO )
        return;

    CloseGame(mainEditor.GetCurrentGame().get());

    Refresh();
}

/**
 * Right-click > Close
 */
void ProjectManager::OncloseGameBtSelected(wxCommandEvent& event)
{
    gdTreeItemGameData * data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL)
        return;

    RuntimeGame * game = dynamic_cast<RuntimeGame*>(data->GetGamePointer());
    if ( game == NULL)
        return;

    if ( wxMessageBox( _( "Attention !\nToute modification non enregistrée sera perdue.\n\nFermer le projet actuel ?" ), _( "Confirmation" ), wxYES_NO, this ) == wxNO )
        return;

    CloseGame(game);

    projectsTree->Delete(selectedItem);
}

void ProjectManager::OnprojectsTreeSelectionChanged(wxTreeEvent& event)
{
    selectedItem = event.GetItem();
    mainEditor.GetRibbon()->SetActivePage(1);
}
