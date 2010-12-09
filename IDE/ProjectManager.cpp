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
#include "GDL/ExternalEvents.h"
#include "GDL/StandardEvent.h"
#include "GDL/CommentEvent.h"

#include "Extensions.h"
#include "ExternalEventsEditor.h"
#include "EditPropJeu.h"
#include "InitialVariablesDialog.h"
#include "EditPropScene.h"

// archives Boost
#include <fstream>
#include <boost/archive/xml_oarchive.hpp>
#include <boost/archive/xml_iarchive.hpp>


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
const long ProjectManager::ID_MENUITEM6 = wxNewId();
const long ProjectManager::ID_MENUITEM7 = wxNewId();
const long ProjectManager::ID_MENUITEM13 = wxNewId();
const long ProjectManager::ID_MENUITEM8 = wxNewId();
const long ProjectManager::ID_MENUITEM9 = wxNewId();
const long ProjectManager::ID_MENUITEM10 = wxNewId();
const long ProjectManager::ID_MENUITEM11 = wxNewId();
const long ProjectManager::ID_MENUITEM12 = wxNewId();
//*)
const long ProjectManager::idRibbonNew = wxNewId();
const long ProjectManager::idRibbonOpen = wxNewId();
const long ProjectManager::idRibbonSave = wxNewId();
const long ProjectManager::idRibbonSaveAll = wxNewId();
const long ProjectManager::idRibbonCompil = wxNewId();
const long ProjectManager::idRibbonClose = wxNewId();
const long ProjectManager::idRibbonExtensions = wxNewId();
const long ProjectManager::idRibbonAddScene = wxNewId();
const long ProjectManager::idRibbonEditImages = wxNewId();
const long ProjectManager::idRibbonEditScene = wxNewId();
const long ProjectManager::idRibbonAddExternalEvents = wxNewId();
const long ProjectManager::idRibbonEditExternalEvents = wxNewId();

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
	projectsTree->SetToolTip(_("Double cliquez pour passer un projet en tant que projet actuel.\nDouble cliquez sur un élement pour l\'éditer, ou utilisez le clic\ndroit pour accéder à plus d\'options."));
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
	MenuItem2 = new wxMenuItem((&emptyExternalEventsContextMenu), ID_MENUITEM6, _("Ajouter des évènements externes"), wxEmptyString, wxITEM_NORMAL);
	MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/eventsadd16.png"))));
	emptyExternalEventsContextMenu.Append(MenuItem2);
	MenuItem3 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM7, _("Editer"), wxEmptyString, wxITEM_NORMAL);
	MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/eventsedit16.png"))));
	externalEventsContextMenu.Append(MenuItem3);
	MenuItem9 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM13, _("Renommer"), wxEmptyString, wxITEM_NORMAL);
	MenuItem9->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
	externalEventsContextMenu.Append(MenuItem9);
	externalEventsContextMenu.AppendSeparator();
	MenuItem4 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM8, _("Ajouter des évènements externes"), wxEmptyString, wxITEM_NORMAL);
	MenuItem4->SetBitmap(wxBitmap(wxImage(_T("res/eventsadd16.png"))));
	externalEventsContextMenu.Append(MenuItem4);
	MenuItem5 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM9, _("Supprimer"), wxEmptyString, wxITEM_NORMAL);
	MenuItem5->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	externalEventsContextMenu.Append(MenuItem5);
	externalEventsContextMenu.AppendSeparator();
	MenuItem6 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM10, _("Copier"), wxEmptyString, wxITEM_NORMAL);
	MenuItem6->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
	externalEventsContextMenu.Append(MenuItem6);
	MenuItem7 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM11, _("Couper"), wxEmptyString, wxITEM_NORMAL);
	MenuItem7->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
	externalEventsContextMenu.Append(MenuItem7);
	MenuItem8 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM12, _("Coller"), wxEmptyString, wxITEM_NORMAL);
	MenuItem8->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	externalEventsContextMenu.Append(MenuItem8);
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
	Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnAddExternalEventsSelected);
	Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnEditExternalEventsSelected);
	Connect(ID_MENUITEM13,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnRenameExternalEventsSelected);
	Connect(ID_MENUITEM8,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnAddExternalEventsSelected);
	Connect(ID_MENUITEM9,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnDeleteExternalEventsSelected);
	Connect(ID_MENUITEM10,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnCopyExternalEventsSelected);
	Connect(ID_MENUITEM11,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnCutExternalEventsSelected);
	Connect(ID_MENUITEM12,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnPasteExternalEventsSelected);
	//*)

    wxImageList * imageList = new wxImageList(16,16);
    imageList->Add(wxBitmap("res/window.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/sceneeditor.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/imageicon.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/extensiononly16.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/events16.png", wxBITMAP_TYPE_ANY));
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
        file2_bar->AddButton(idRibbonSaveAll, !hideLabels ? _("Tout enregistrer") : " ", wxBitmap("res/save_all24.png", wxBITMAP_TYPE_ANY));
        file2_bar->AddButton(idRibbonClose, !hideLabels ? _("Fermer") : "", wxBitmap("res/close24.png", wxBITMAP_TYPE_ANY));
        file2_bar->AddButton(idRibbonCompil, !hideLabels ? _("Compilation") : "", wxBitmap("res/compilicon24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Opérations de base sur le jeu"), wxBitmap("res/copy24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonEditImages, !hideLabels ? _("Images") : "", wxBitmap("res/imageicon24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonAddScene, !hideLabels ? _("Ajouter une scène") : "", wxBitmap("res/sceneadd24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonAddExternalEvents, !hideLabels ? _("Ajouter des évènements externes") : "", wxBitmap("res/eventsadd24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonExtensions, !hideLabels ? _("Extensions") : "", wxBitmap("res/extension24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonEditScene, !hideLabels ? _("Editer la scène selectionnée") : "", wxBitmap("res/sceneedit24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonEditExternalEvents, !hideLabels ? _("Editer les évènements externes selectionnés") : "", wxBitmap("res/eventsedit24.png", wxBITMAP_TYPE_ANY));
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
    mainEditor.Connect( idRibbonSaveAll, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonSaveAllClicked, NULL, &mainEditor );
    mainEditor.Connect( idRibbonOpen, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonOpenDropDownClicked, NULL, &mainEditor );
    mainEditor.Connect( idRibbonSave, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuSaveSelected, NULL, &mainEditor );
    mainEditor.Connect( idRibbonSave, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonSaveDropDownClicked, NULL, &mainEditor );
    mainEditor.Connect( idRibbonCompil, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuCompilationSelected, NULL, &mainEditor );
    mainEditor.Connect( idRibbonClose, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonCloseSelected, NULL, this );
    mainEditor.Connect( idRibbonExtensions, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonExtensionsSelected, NULL, this );
    mainEditor.Connect( idRibbonEditImages, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonEditImagesSelected, NULL, this );
    mainEditor.Connect( idRibbonAddScene, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonAddSceneSelected, NULL, this );
    mainEditor.Connect( idRibbonAddExternalEvents, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonAddExternalEventsSelected, NULL, this );
    mainEditor.Connect( idRibbonEditScene, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonEditSceneSelected, NULL, this );
    mainEditor.Connect( idRibbonEditExternalEvents, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonEditExternalEventsSelected, NULL, this );
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

        //Evenements externes
        gdTreeItemGameData * eventsItemData = new gdTreeItemGameData("ExternalEventsRoot", "", mainEditor.games[i].get());
        wxTreeItemId eventsItem = projectsTree->AppendItem(projectItem, _("Evenements externes"), 4 ,4, eventsItemData);
        for (unsigned int j = 0;j<mainEditor.games[i]->externalEvents.size();++j)
        {
            gdTreeItemGameData * eventsItemData = new gdTreeItemGameData("ExternalEvents", mainEditor.games[i]->externalEvents[j]->GetName(), mainEditor.games[i].get());
            projectsTree->AppendItem(eventsItem, mainEditor.games[i]->externalEvents[j]->GetName(), 4 ,4, eventsItemData);
        }

        //Extensions
        gdTreeItemGameData * extensionsItemData = new gdTreeItemGameData("Extensions", "", mainEditor.games[i].get());
        projectsTree->AppendItem(projectItem, _("Extensions") + " (" + ToString(mainEditor.games[i]->extensionsUsed.size()) + ")", 3 ,3, extensionsItemData);
    }

    projectsTree->ExpandAll();
}

/**
 * Complete the pointers with the game and the datas corresponding to the selected item.
 * Return false if fail, in which case pointers are invalids.
 */
bool ProjectManager::GetGameOfSelectedItem(RuntimeGame *& game, gdTreeItemGameData *& data)
{
    data = dynamic_cast<gdTreeItemGameData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL )
        return false;

    game = dynamic_cast<RuntimeGame*>(data->GetGamePointer());
    if ( game == NULL )
        return false;

    return true;
}

/**
 * Double click on an item
 */
void ProjectManager::OnprojectsTreeItemActivated(wxTreeEvent& event)
{
    selectedItem = event.GetItem();

    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

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
    else if ( data->GetString() == "ExternalEvents")
    {
        wxCommandEvent unusedEvent;
        OnEditExternalEventsSelected(unusedEvent);
    }
    else if ( data->GetString() == "Extensions")
    {
        EditExtensionsOfGame(game);

        projectsTree->SetItemText(selectedItem, _("Extensions") + " (" + ToString(game->extensionsUsed.size()) + ")");
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
    else if ( data->GetString() == "ExternalEventsRoot")
    {
        PopupMenu(&emptyExternalEventsContextMenu);
    }
    else if ( data->GetString() == "ExternalEvents")
    {
        PopupMenu(&externalEventsContextMenu);
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
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

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
    if ( !mainEditor.GetEditorsNotebook()->AddPage(editorScene, prefix+data->GetSecondString(), true, wxBitmap("res/sceneeditor.png", wxBITMAP_TYPE_ANY)) )
    {
        wxLogError(_("Impossible d'ajouter le nouvel onglet !"));
    }
}

/**
 * Edit properties of a scene
 */
void ProjectManager::OneditScenePropMenuItemSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

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
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

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

    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    if ( data->GetString() != "Scene" && data->GetString() != "Root" && data->GetString() != "ExternalEvents")
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

    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

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
    //Renaming external events
    else if ( data->GetString() == "ExternalEvents")
    {
        vector< boost::shared_ptr<ExternalEvents> >::iterator events =
            find_if(game->externalEvents.begin(), game->externalEvents.end(), bind2nd(ExternalEventsHasName(), itemTextBeforeEditing));

        if ( events == game->externalEvents.end() )
        {
            wxLogWarning(_("Evenements introuvable."));
            return;
        }

        if ( find_if(game->externalEvents.begin(), game->externalEvents.end(), bind2nd(ExternalEventsHasName(), newName)) != game->externalEvents.end() )
        {
            wxLogWarning( _( "Impossible de renommer : d'autres évènements externes portent déjà ce nom !" ) );
            Refresh();
            return;
        }

        projectsTree->SetItemData(selectedItem, new gdTreeItemGameData("ExternalEvents", newName, game));

        (*events)->SetName(newName);

        //Updating editors
        for (unsigned int k =0;k<static_cast<unsigned>(mainEditor.GetEditorsNotebook()->GetPageCount()) ;k++ )
        {
            ExternalEventsEditor * editorPtr = dynamic_cast<ExternalEventsEditor*>(mainEditor.GetEditorsNotebook()->GetPage(k));

            //Si il s'agit d'un éditeur de scène avec ce nom, on le renomme
            if ( editorPtr != NULL && &editorPtr->events == (*events).get())
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
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

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
    int i = 2;
    while(find_if(game->scenes.begin(), game->scenes.end(), bind2nd(SceneHasName(), newSceneName)) != game->scenes.end())
    {
        newSceneName = _("Nouvelle scène") + " " + ToString(i);
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
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

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
            if ( !mainEditor.GetEditorsNotebook()->DeletePage(k) )
                wxMessageBox(_("Impossible de supprimer l'onglet !"), _("Erreur"), wxICON_ERROR );

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
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

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
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

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
            if ( !mainEditor.GetEditorsNotebook()->DeletePage(k) )
                wxMessageBox(_("Impossible de supprimer l'onglet !"), _("Erreur"), wxICON_ERROR );

            k--;
        }
    }

    //Updating tree
    projectsTree->Delete(selectedItem);

    game->scenes.erase(scene);
}

void ProjectManager::OnpasteSceneMenuItemSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    vector< boost::shared_ptr<Scene> >::iterator scene =
        find_if(game->scenes.begin(), game->scenes.end(), bind2nd(SceneHasName(), data->GetSecondString()));

    if ( scene == game->scenes.end() )
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    Clipboard * clipboard = Clipboard::getInstance();
    if (!clipboard->HasScene()) return;

    boost::shared_ptr<Scene> newScene = boost::shared_ptr<Scene>(new Scene(clipboard->GetScene()));

    //Finding a new, unique name for the scene
    string newSceneName = string(_("Copie de")) + " " + newScene->GetName();
    int i = 2;
    while(find_if(game->scenes.begin(), game->scenes.end(), bind2nd(SceneHasName(), newSceneName)) != game->scenes.end())
    {
        newSceneName = _("Copie de") + " " + newScene->GetName() + " " + ToString(i);
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
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

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
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

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
        ExternalEventsEditor * externalEventsEditorPtr = dynamic_cast<ExternalEventsEditor*>(mainEditor.GetEditorsNotebook()->GetPage(k));
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
                if ( !mainEditor.GetEditorsNotebook()->DeletePage(k) )
                    wxMessageBox(_("Impossible de supprimer l'onglet !"), _("Erreur"), wxICON_ERROR );
                k--;
            }
        }
        else if ( imagesEditorPtr != NULL )
        {
            if ( &imagesEditorPtr->game == game)
            {
                if ( !mainEditor.GetEditorsNotebook()->DeletePage(k) )
                    wxMessageBox(_("Impossible de supprimer l'onglet !"), _("Erreur"), wxICON_ERROR );
                k--;
            }
        }
        else if ( externalEventsEditorPtr != NULL )
        {
            if ( &externalEventsEditorPtr->game == game)
            {
                if ( !mainEditor.GetEditorsNotebook()->DeletePage(k) )
                    wxMessageBox(_("Impossible de supprimer l'onglet !"), _("Erreur"), wxICON_ERROR );
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
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

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

/**
 * Edit external events from ribbon button
 */
void ProjectManager::OnRibbonEditExternalEventsSelected(wxRibbonButtonBarEvent& event)
{
    wxCommandEvent unusedEvent;
    OnEditExternalEventsSelected(unusedEvent);
}

/**
 * Edit external events
 */
void ProjectManager::OnEditExternalEventsSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    MainEditorCommand mainEditorCommand;
    mainEditorCommand.SetMainEditor(&mainEditor);
    mainEditorCommand.SetRibbonSceneEditorButtonBar(mainEditor.GetRibbonSceneEditorButtonBar()); //Need link to the scene editor wxRibbonButtonBar
    mainEditorCommand.SetRibbon(mainEditor.GetRibbon());

    vector< boost::shared_ptr<ExternalEvents> >::const_iterator events =
        find_if(game->externalEvents.begin(), game->externalEvents.end(), bind2nd(ExternalEventsHasName(), data->GetSecondString()));

    if ( events == game->externalEvents.end() )
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    //Verify if the scene editor is not already opened
    for (unsigned int j =0;j<mainEditor.GetEditorsNotebook()->GetPageCount() ;j++ )
    {
        ExternalEventsEditor * eventsEditorPtr = dynamic_cast<ExternalEventsEditor*>(mainEditor.GetEditorsNotebook()->GetPage(j));

        if ( eventsEditorPtr != NULL && &eventsEditorPtr->events == (*events).get() )
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

    ExternalEventsEditor * editor = new ExternalEventsEditor(mainEditor.GetEditorsNotebook(), *game, *(*events), mainEditorCommand);
    if ( !mainEditor.GetEditorsNotebook()->AddPage(editor, prefix+data->GetSecondString(), true, wxBitmap("res/events16.png", wxBITMAP_TYPE_ANY)) )
    {
        wxLogError(_("Impossible d'ajouter le nouvel onglet !"));
    }
}

/**
* Add external events from right click
*/
void ProjectManager::OnAddExternalEventsSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    AddExternalEventsToGame(game);

    Refresh();
}


/**
 * Add external events from ribbon button
 */
void ProjectManager::OnRibbonAddExternalEventsSelected(wxRibbonButtonBarEvent& event)
{
    if ( !mainEditor.CurrentGameIsValid() ) return;

    AddExternalEventsToGame(mainEditor.GetCurrentGame().get());

    Refresh();
}

/**
 * Add external events to a game
 */
void ProjectManager::AddExternalEventsToGame(Game * game)
{
    //Finding a new, unique name for the scene
    string newName = string(_("Evenements externes"));
    int i = 2;
    while(find_if(game->externalEvents.begin(), game->externalEvents.end(), bind2nd(ExternalEventsHasName(), newName)) != game->externalEvents.end())
    {
        newName = _("Evenements externes") + " " + ToString(i);
        ++i;
    }

    boost::shared_ptr<ExternalEvents> externalEventsPtr = boost::shared_ptr<ExternalEvents>(new ExternalEvents());
    externalEventsPtr->SetName(newName);

    game->externalEvents.push_back(externalEventsPtr);
}

void ProjectManager::OnRenameExternalEventsSelected(wxCommandEvent& event)
{
    projectsTree->EditLabel( selectedItem );
}

void ProjectManager::OnDeleteExternalEventsSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    vector< boost::shared_ptr<ExternalEvents> >::iterator events =
        find_if(game->externalEvents.begin(), game->externalEvents.end(), bind2nd(ExternalEventsHasName(), data->GetSecondString()));

    if ( events == game->externalEvents.end() )
    {
        wxLogWarning(_("Evenements introuvable."));
        return;
    }

    //Updating editors
    for (unsigned int k =0;k<static_cast<unsigned>(mainEditor.GetEditorsNotebook()->GetPageCount()) ;k++ )
    {
        ExternalEventsEditor * editorPtr = dynamic_cast<ExternalEventsEditor*>(mainEditor.GetEditorsNotebook()->GetPage(k));

        if ( editorPtr != NULL && &editorPtr->events == (*events).get())
        {
            if ( !mainEditor.GetEditorsNotebook()->DeletePage(k) )
                wxMessageBox(_("Impossible de supprimer l'onglet !"), _("Erreur"), wxICON_ERROR );

            k--;
        }
    }

    //Updating tree
    projectsTree->Delete(selectedItem);

    game->externalEvents.erase(events);
}

void ProjectManager::OnCopyExternalEventsSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    vector< boost::shared_ptr<ExternalEvents> >::iterator events =
        find_if(game->externalEvents.begin(), game->externalEvents.end(), bind2nd(ExternalEventsHasName(), data->GetSecondString()));

    if ( events == game->externalEvents.end() )
    {
        wxLogWarning(_("Evenements introuvable."));
        return;
    }

    Clipboard * clipboard = Clipboard::getInstance();
    clipboard->SetExternalEvents(*(*events));
}

void ProjectManager::OnCutExternalEventsSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    vector< boost::shared_ptr<ExternalEvents> >::iterator events =
        find_if(game->externalEvents.begin(), game->externalEvents.end(), bind2nd(ExternalEventsHasName(), data->GetSecondString()));

    if ( events == game->externalEvents.end() )
    {
        wxLogWarning(_("Evenements introuvable."));
        return;
    }

    Clipboard * clipboard = Clipboard::getInstance();
    clipboard->SetExternalEvents(*(*events));

    //Updating editors
    for (unsigned int k =0;k<static_cast<unsigned>(mainEditor.GetEditorsNotebook()->GetPageCount()) ;k++ )
    {
        ExternalEventsEditor * editorPtr = dynamic_cast<ExternalEventsEditor*>(mainEditor.GetEditorsNotebook()->GetPage(k));

        if ( editorPtr != NULL && &editorPtr->events == (*events).get())
        {
            if ( !mainEditor.GetEditorsNotebook()->DeletePage(k) )
                wxMessageBox(_("Impossible de supprimer l'onglet !"), _("Erreur"), wxICON_ERROR );

            k--;
        }
    }

    //Updating tree
    projectsTree->Delete(selectedItem);

    game->externalEvents.erase(events);
}

void ProjectManager::OnPasteExternalEventsSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    vector< boost::shared_ptr<ExternalEvents> >::iterator events =
        find_if(game->externalEvents.begin(), game->externalEvents.end(), bind2nd(ExternalEventsHasName(), data->GetSecondString()));

    if ( events == game->externalEvents.end() )
    {
        wxLogWarning(_("Evenements introuvable."));
        return;
    }

    Clipboard * clipboard = Clipboard::getInstance();
    boost::shared_ptr<ExternalEvents> newEvents = boost::shared_ptr<ExternalEvents>(new ExternalEvents(clipboard->GetExternalEvents()));

    //Finding a new, unique name for the events
    string newName = string(_("Copie de")) + " " + newEvents->GetName();
    int i = 2;
    while(find_if(game->externalEvents.begin(), game->externalEvents.end(), bind2nd(ExternalEventsHasName(), newName)) != game->externalEvents.end())
    {
        newName = _("Copie de") + " " + newEvents->GetName() + " " + ToString(i);
        ++i;
    }

    newEvents->SetName(newName);
    game->externalEvents.insert(events, newEvents);

    //Insert in tree
    gdTreeItemGameData * eventsItemData = new gdTreeItemGameData("ExternalEvents", newName, game);
    if ( projectsTree->GetPrevSibling(selectedItem).IsOk() )
        projectsTree->InsertItem(projectsTree->GetItemParent(selectedItem), projectsTree->GetPrevSibling(selectedItem), newName, 4, 4, eventsItemData);
    else
        projectsTree->InsertItem(projectsTree->GetItemParent(selectedItem), 0, newName, 4, 4, eventsItemData);
}
