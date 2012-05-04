/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

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
#include <wx/imaglist.h>
#include <wx/busyinfo.h>
#include <fstream>
#include "LogFileManager.h"
#include "Clipboard.h"
#include "Game_Develop_EditorMain.h"
#include "gdTreeItemGameData.h"
#include "GDL/ExternalEvents.h"
#include "GDL/StandardEvent.h"
#include "GDL/CommentEvent.h"
#include "GDL/SourceFile.h"
#include "GDL/Events/CodeCompilationHelpers.h"
#include "CodeEditor.h"
#include "Extensions.h"
#include "ExternalEventsEditor.h"
#include "EditPropJeu.h"
#include "InitialVariablesDialog.h"
#include "EditPropScene.h"

#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"

#include <fstream>

#ifdef __WXMSW__
#include <wx/msw/uxtheme.h>
#endif

using namespace gd;
using namespace GDpriv;

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
const long ProjectManager::ID_MENUITEM18 = wxNewId();
const long ProjectManager::ID_MENUITEM14 = wxNewId();
const long ProjectManager::ID_MENUITEM15 = wxNewId();
const long ProjectManager::ID_MENUITEM16 = wxNewId();
const long ProjectManager::ID_MENUITEM19 = wxNewId();
const long ProjectManager::ID_MENUITEM17 = wxNewId();
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
const long ProjectManager::idRibbonStartPage = wxNewId();
const long ProjectManager::idRibbonCppTools = wxNewId();
const long ProjectManager::idRibbonImporter = wxNewId();
const long ProjectManager::idRibbonEncoder = wxNewId();
const long ProjectManager::idRibbonProjectsManager = wxNewId();

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
	MenuItem14 = new wxMenuItem((&sourceFilesContextMenu), ID_MENUITEM18, _("Créer un nouveau fichier C++"), wxEmptyString, wxITEM_NORMAL);
	sourceFilesContextMenu.Append(MenuItem14);
	MenuItem10 = new wxMenuItem((&sourceFilesContextMenu), ID_MENUITEM14, _("Ajouter un fichier C++ déjà existant"), wxEmptyString, wxITEM_NORMAL);
	MenuItem10->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	sourceFilesContextMenu.Append(MenuItem10);
	MenuItem11 = new wxMenuItem((&sourceFileContextMenu), ID_MENUITEM15, _("Editer"), wxEmptyString, wxITEM_NORMAL);
	MenuItem11->SetBitmap(wxBitmap(wxImage(_T("res/editicon.png"))));
	sourceFileContextMenu.Append(MenuItem11);
	sourceFileContextMenu.AppendSeparator();
	MenuItem12 = new wxMenuItem((&sourceFileContextMenu), ID_MENUITEM16, _("Supprimer"), wxEmptyString, wxITEM_NORMAL);
	MenuItem12->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	sourceFileContextMenu.Append(MenuItem12);
	sourceFileContextMenu.AppendSeparator();
	MenuItem15 = new wxMenuItem((&sourceFileContextMenu), ID_MENUITEM19, _("Créer un nouveau fichier C++"), wxEmptyString, wxITEM_NORMAL);
	sourceFileContextMenu.Append(MenuItem15);
	MenuItem13 = new wxMenuItem((&sourceFileContextMenu), ID_MENUITEM17, _("Ajouter un fichier C++ déjà existant"), wxEmptyString, wxITEM_NORMAL);
	MenuItem13->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	sourceFileContextMenu.Append(MenuItem13);
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
	Connect(ID_MENUITEM18,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnCreateNewCppFileSelected);
	Connect(ID_MENUITEM14,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnAddCppSourceFileSelected);
	Connect(ID_MENUITEM15,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnEditSourceFileSelected);
	Connect(ID_MENUITEM16,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnDeleteSourceFileSelected);
	Connect(ID_MENUITEM19,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnCreateNewCppFileSelected);
	Connect(ID_MENUITEM17,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnAddCppSourceFileSelected);
	//*)

    wxImageList * imageList = new wxImageList(16,16);
    imageList->Add(wxBitmap("res/window.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/sceneeditor.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/imageicon.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/extensiononly16.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/events16.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/source_cpp16.png", wxBITMAP_TYPE_ANY));
    projectsTree->SetImageList(imageList);

    #if defined(__WXMSW__) //Offer nice look to wxTreeCtrl
    wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
    if(theme) theme->SetWindowTheme((HWND) projectsTree->GetHWND(), L"EXPLORER", NULL);
    #endif

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
        ribbonBar->AddButton(idRibbonEditScene, !hideLabels ? _("Editer la scène") : "", wxBitmap("res/sceneedit24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonEditExternalEvents, !hideLabels ? _("Editer les év. externes") : "", wxBitmap("res/eventsedit24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *affichagePanel = new wxRibbonPanel(page, wxID_ANY, _("Affichage"), wxBitmap("res/imageicon.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *affichage_bar = new wxRibbonButtonBar(affichagePanel, wxID_ANY);
        affichage_bar->AddButton(idRibbonProjectsManager, !hideLabels ? _("Projets") : "", wxBitmap("res/projectManager24.png", wxBITMAP_TYPE_ANY));
        affichage_bar->AddButton(idRibbonStartPage, !hideLabels ? _("Page de démarrage") : "", wxBitmap("res/startPage24.png", wxBITMAP_TYPE_ANY));
        affichage_bar->AddButton(idRibbonCppTools, !hideLabels ? _("Outils C++") : "", wxBitmap("res/source_cpp24.png", wxBITMAP_TYPE_ANY));

        wxRibbonPanel *toolsPanel = new wxRibbonPanel(page, wxID_ANY, _("Outils"), wxBitmap("res/tools24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *tools_bar = new wxRibbonButtonBar(toolsPanel, wxID_ANY);
        tools_bar->AddButton(idRibbonEncoder, !hideLabels ? _("Convertisseur") : "", wxBitmap("res/musicicon24.png", wxBITMAP_TYPE_ANY));
        tools_bar->AddDropdownButton(idRibbonImporter, !hideLabels ? _("Convertisseur d'images ") : "", wxBitmap("res/strip24.png", wxBITMAP_TYPE_ANY));

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
    mainEditor.Connect( idRibbonStartPage, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonStartPageClicked, NULL, &mainEditor );
    mainEditor.Connect( idRibbonCppTools, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonCppToolsClicked, NULL, &mainEditor );
    mainEditor.Connect( idRibbonProjectsManager, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnProjectsManagerClicked, NULL, &mainEditor );
    mainEditor.Connect( idRibbonEncoder, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuItem23Selected, NULL, &mainEditor );
    mainEditor.Connect( idRibbonImporter, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonDecomposerDropDownClicked, NULL, &mainEditor );
}

void ProjectManager::Refresh()
{
    projectsTree->DeleteAllItems();
    projectsTree->AddRoot(_("Projets"));
    for (unsigned int i = 0;i<mainEditor.games.size();++i)
    {
        wxString name = mainEditor.games[i]->GetName() == "" ?
                        _("(Sans nom)") :
                        mainEditor.games[i]->GetName();

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
        for (unsigned int j = 0;j<mainEditor.games[i]->GetLayoutCount();++j)
        {
            gdTreeItemGameData * sceneItemData = new gdTreeItemGameData("Scene", mainEditor.games[i]->GetLayout(j).GetName(), mainEditor.games[i].get());
            projectsTree->AppendItem(scenesItem, mainEditor.games[i]->GetLayout(j).GetName(), 1 ,1, sceneItemData);
        }

        //Evenements externes
        gdTreeItemGameData * eventsItemData = new gdTreeItemGameData("ExternalEventsRoot", "", mainEditor.games[i].get());
        wxTreeItemId eventsItem = projectsTree->AppendItem(projectItem, _("Evenements externes"), 4 ,4, eventsItemData);
        for (unsigned int j = 0;j<mainEditor.games[i]->GetExternalEventsCount();++j)
        {
            gdTreeItemGameData * eventsItemData = new gdTreeItemGameData("ExternalEvents", mainEditor.games[i]->GetExternalEvents(j).GetName(), mainEditor.games[i].get());
            projectsTree->AppendItem(eventsItem, mainEditor.games[i]->GetExternalEvents(j).GetName(), 4 ,4, eventsItemData);
        }

        if ( mainEditor.games[i]->useExternalSourceFiles )
        {
            gdTreeItemGameData * sourceFilesItemData = new gdTreeItemGameData("SourceFiles", "", mainEditor.games[i].get());
            wxTreeItemId sourceFilesItem = projectsTree->AppendItem(projectItem, _("Fichiers sources C++"), 5 ,5, sourceFilesItemData);
            for (unsigned int j = 0;j<mainEditor.games[i]->externalSourceFiles.size();++j)
            {
                if ( mainEditor.games[i]->externalSourceFiles[j]->IsGDManaged() )
                    continue;

                gdTreeItemGameData * sourceFileItem = new gdTreeItemGameData("SourceFile", mainEditor.games[i]->externalSourceFiles[j]->GetFileName(), mainEditor.games[i].get());
                projectsTree->AppendItem(sourceFilesItem, mainEditor.games[i]->externalSourceFiles[j]->GetFileName(), 5 ,5, sourceFileItem);
            }
        }

        //Extensions
        gdTreeItemGameData * extensionsItemData = new gdTreeItemGameData("Extensions", "", mainEditor.games[i].get());
        projectsTree->AppendItem(projectItem, _("Extensions") + " (" + ToString(mainEditor.games[i]->GetUsedPlatformExtensions().size()) + ")", 3 ,3, extensionsItemData);
    }

    projectsTree->ExpandAll();
}

/**
 * Complete the pointers with the game and the datas corresponding to the selected item.
 * Return false if fail, in which case pointers are invalid.
 */
bool ProjectManager::GetGameOfSelectedItem(RuntimeGame *& game, gdTreeItemGameData *& data)
{
    if ( !selectedItem.IsOk() ) return false;

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
        prefix = "["+game->GetName()+"] ";
        if ( game->GetName().length() > gameMaxCharDisplayedInEditor )
            prefix = "["+game->GetName().substr(0, gameMaxCharDisplayedInEditor-3)+"...] ";
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
        EditExtensionsOfGame(*game);

        projectsTree->SetItemText(selectedItem, _("Extensions") + " (" + ToString(game->GetUsedPlatformExtensions().size()) + ")");
    }
    else if ( data->GetString() == "SourceFile")
    {
        wxCommandEvent unusedEvent;
        OnEditSourceFileSelected(unusedEvent);
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
    else if ( data->GetString() == "SourceFiles")
    {
        PopupMenu(&sourceFilesContextMenu);
    }
    else if ( data->GetString() == "SourceFile")
    {
        PopupMenu(&sourceFileContextMenu);
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

void ProjectManager::OnEditSourceFileSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    wxFileName filename(data->GetSecondString());
    filename.MakeAbsolute(wxFileName::FileName(game->gameFile).GetPath());

    EditSourceFile(game, ToString(filename.GetFullPath()));
}

void ProjectManager::EditSourceFile(Game * game, std::string filename, size_t line)
{
    if ( !wxFileExists(filename) )
    {
        wxLogWarning(_("Impossible d'ouvrir "+filename+", le fichier n'existe pas"));
        return;
    }

    //Launch external source editor if one must be used
    bool useExternalEditor;
    wxConfigBase::Get()->Read("/Code/UseExternalEditor", &useExternalEditor, false);
    if ( useExternalEditor )
    {
        wxString program;
        wxConfigBase::Get()->Read("/Code/ExternalEditor", &program);

        wxExecute(program+" \""+filename+"\"");
        return;
    }
    //Launch an internal code editor else

    //Having a game associated with the editor is optional
    Game * associatedGame = NULL;
    if ( game )
    {
        vector< boost::shared_ptr<SourceFile> >::const_iterator sourceFile =
            find_if(game->externalSourceFiles.begin(), game->externalSourceFiles.end(), bind2nd(ExternalSourceFileHasName(), filename));

        if ( sourceFile != game->externalSourceFiles.end() ) associatedGame = game;
    }

    //Verify if the editor is not already opened
    for (unsigned int j =0;j<mainEditor.GetEditorsNotebook()->GetPageCount() ;j++ )
    {
        CodeEditor * editorPtr = dynamic_cast<CodeEditor*>(mainEditor.GetEditorsNotebook()->GetPage(j));

        if ( editorPtr != NULL && editorPtr->filename == filename )
        {
            //Change notebook page to scene page
            mainEditor.GetEditorsNotebook()->SetSelection(j);
            if ( line != std::string::npos ) editorPtr->SelectLine(line);
            return;
        }
    }

    CodeEditor * editorScene = new CodeEditor(mainEditor.GetEditorsNotebook(), filename, associatedGame, mainEditor.GetMainEditorCommand());
    if ( !mainEditor.GetEditorsNotebook()->AddPage(editorScene, wxFileName(filename).GetFullName(), true, wxBitmap("res/source_cpp16.png", wxBITMAP_TYPE_ANY)) )
    {
        wxLogError(_("Impossible d'ajouter le nouvel onglet !"));
    }
    if ( line != std::string::npos ) editorScene->SelectLine(line);
}

/**
 * Edit a scene
 */
void ProjectManager::OneditSceneMenuItemSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) )
    {
        wxLogWarning(_("Choisissez une scène à éditer dans le gestionnaire de projets."));
        return;
    }

    if ( !game->HasLayoutNamed(data->GetSecondString()) )
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    gd::Layout & layout = game->GetLayout(data->GetSecondString());

    //Verify if the scene editor is not already opened
    for (unsigned int j =0;j<mainEditor.GetEditorsNotebook()->GetPageCount() ;j++ )
    {
        EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(mainEditor.GetEditorsNotebook()->GetPage(j));

        if ( sceneEditorPtr != NULL && &sceneEditorPtr->GetLayout() == &layout )
        {
            //Change notebook page to the layout page
            mainEditor.GetEditorsNotebook()->SetSelection(j);
            return;
        }
    }

    //Save the event to log file
    LogFileManager::GetInstance()->WriteToLogFile("Opened layout "+layout.GetName());

    //Open a new editor if necessary
    string prefix = "";
    if ( mainEditor.games.size() > 1 )
    {
        prefix = "["+game->GetName()+"] ";
        if ( game->GetName().length() > gameMaxCharDisplayedInEditor )
            prefix = "["+game->GetName().substr(0, gameMaxCharDisplayedInEditor-3)+"...] ";
    }

    EditorScene * editorScene = new EditorScene(mainEditor.GetEditorsNotebook(), *game, layout, mainEditor.GetMainEditorCommand());
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
    if ( !GetGameOfSelectedItem(game, data) )
    {
        wxLogWarning(_("Choisissez une scène à éditer dans le gestionnaire de projets."));
        return;
    }

    if ( !game->HasLayoutNamed(data->GetSecondString()) )
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    gd::Layout & layout = game->GetLayout(data->GetSecondString());

    EditPropScene dialog( this, layout );
    dialog.ShowModal();
}

/**
 * Edit variables of a scene
 */
void ProjectManager::OnmodVarSceneMenuISelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) )
    {
        wxLogWarning(_("Choisissez une scène à éditer dans le gestionnaire de projets."));
        return;
    }

    vector< boost::shared_ptr<Scene> >::const_iterator scene =
        find_if(game->GetLayouts().begin(), game->GetLayouts().end(), bind2nd(SceneHasName(), data->GetSecondString()));

    if ( scene == game->GetLayouts().end() )
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    InitialVariablesDialog dialog(this, (*scene)->variables);
    if ( dialog.ShowModal() == 1 )
    {
        (*scene)->variables = dialog.variables;
        (*scene)->wasModified = true;
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(*game, *(*scene));
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
        game->SetName( newName );
    }
    //Renaming a scene
    else if ( data->GetString() == "Scene")
    {
        if ( !game->HasLayoutNamed(data->GetSecondString()) )
        {
            wxLogWarning(_("Scène introuvable."));
            return;
        }

        gd::Layout & layout = game->GetLayout(data->GetSecondString());

        if ( game->HasLayoutNamed(newName) )
        {
            wxLogWarning( _( "Impossible de renommer : une scène porte déjà ce nom !" ) );
            Refresh();
            return;
        }

        projectsTree->SetItemData(selectedItem, new gdTreeItemGameData("Scene", newName, game));

        layout.SetName(newName);

        //Updating editors
        for (unsigned int k =0;k<static_cast<unsigned>(mainEditor.GetEditorsNotebook()->GetPageCount()) ;k++ )
        {
            EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(mainEditor.GetEditorsNotebook()->GetPage(k));

            if ( sceneEditorPtr != NULL && &sceneEditorPtr->GetLayout() == &layout)
                mainEditor.GetEditorsNotebook()->SetPageText(k, event.GetLabel());
        }
    }
    //Renaming external events
    else if ( data->GetString() == "ExternalEvents")
    {
        if ( !game->HasExternalEventsNamed(itemTextBeforeEditing) )
        {
            wxLogWarning(_("Evenements introuvable."));
            return;
        }

        if ( game->HasExternalEventsNamed(newName) )
        {
            wxLogWarning( _( "Impossible de renommer : d'autres évènements externes portent déjà ce nom !" ) );
            Refresh();
            return;
        }

        projectsTree->SetItemData(selectedItem, new gdTreeItemGameData("ExternalEvents", newName, game));

        game->GetExternalEvents(itemTextBeforeEditing).SetName(newName);

        //Updating editors
        for (unsigned int k =0;k<static_cast<unsigned>(mainEditor.GetEditorsNotebook()->GetPageCount()) ;k++ )
        {
            ExternalEventsEditor * editorPtr = dynamic_cast<ExternalEventsEditor*>(mainEditor.GetEditorsNotebook()->GetPage(k));

            if ( editorPtr != NULL && &editorPtr->events == &game->GetExternalEvents(newName))
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

    AddSceneToGame(mainEditor.GetCurrentGame().get(), mainEditor.GetCurrentGame()->GetLayoutCount());

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

    AddSceneToGame(game, game->GetLayoutCount());

    Refresh();
}

/**
 * Add a scene to a game
 */
void ProjectManager::AddSceneToGame(Game * game, unsigned int position)
{
    //Finding a new, unique name for the scene
    string newSceneName = string(_("Nouvelle scène"));
    int i = 2;
    while(game->HasLayoutNamed(newSceneName))
    {
        newSceneName = _("Nouvelle scène") + " " + ToString(i);
        ++i;
    }

    game->InsertNewLayout(newSceneName, position);
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
    //Verify if the image editor is not already opened
    for (unsigned int j =0;j<mainEditor.GetEditorsNotebook()->GetPageCount() ;j++ )
    {
        ResourcesEditor * imagesEditorPtr = dynamic_cast<ResourcesEditor*>(mainEditor.GetEditorsNotebook()->GetPage(j));

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
        prefix = "["+game->GetName()+"] ";
        if ( game->GetName().length() > gameMaxCharDisplayedInEditor )
            prefix = "["+game->GetName().substr(0, gameMaxCharDisplayedInEditor-3)+"...] ";
    }

    ResourcesEditor * editorImages = new ResourcesEditor(&mainEditor, *game, mainEditor.GetMainEditorCommand(), true);
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

    std::string sceneName = data->GetSecondString();
    if ( !game->HasLayoutNamed(sceneName) )
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    gd::Layout & layout = game->GetLayout(sceneName);

    //Updating editors
    for (unsigned int k =0;k<static_cast<unsigned>(mainEditor.GetEditorsNotebook()->GetPageCount()) ;k++ )
    {
        EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(mainEditor.GetEditorsNotebook()->GetPage(k));

        if ( sceneEditorPtr != NULL && &sceneEditorPtr->GetLayout() == &layout)
        {
            if ( !mainEditor.GetEditorsNotebook()->DeletePage(k) )
                wxMessageBox(_("Impossible de supprimer l'onglet !"), _("Erreur"), wxICON_ERROR );

            k--;
        }
    }

    //Updating tree
    projectsTree->Delete(selectedItem);

    //Ensure we're not destroying a scene with events being built
    wxBusyInfo * waitDialog = CodeCompiler::GetInstance()->CompilationInProcess() ? new wxBusyInfo("Veuillez patienter, la compilation interne des évènements de la scène\ndoit être menée à terme avant de supprimer la scène...") : NULL;
    while ( CodeCompiler::GetInstance()->CompilationInProcess() )
    {
        wxYield();
    }
    if ( waitDialog ) delete waitDialog;

    game->RemoveLayout(sceneName);
}

/**
 * Copy a scene
 */
void ProjectManager::OncopySceneMenuItemSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    if ( !game->HasLayoutNamed(data->GetSecondString()) )
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    Clipboard::GetInstance()->SetLayout(&game->GetLayout(data->GetSecondString()));
}

/**
 * Cut a scene
 */
void ProjectManager::OncutSceneMenuItemSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    std::string layoutName = data->GetSecondString();
    if ( !game->HasLayoutNamed(layoutName) )
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    gd::Layout & layout = game->GetLayout(layoutName);

    Clipboard::GetInstance()->SetLayout(&layout);

    //Updating editors
    for (unsigned int k =0;k<static_cast<unsigned>(mainEditor.GetEditorsNotebook()->GetPageCount()) ;k++ )
    {
        EditorScene * sceneEditorPtr = dynamic_cast<EditorScene*>(mainEditor.GetEditorsNotebook()->GetPage(k));

        if ( sceneEditorPtr != NULL && &sceneEditorPtr->GetLayout() == &layout)
        {
            if ( !mainEditor.GetEditorsNotebook()->DeletePage(k) )
                wxMessageBox(_("Impossible de supprimer l'onglet !"), _("Erreur"), wxICON_ERROR );

            k--;
        }
    }

    //Updating tree
    projectsTree->Delete(selectedItem);

    //Ensure we're not destroying a scene with events being built
    wxBusyInfo * waitDialog = CodeCompiler::GetInstance()->CompilationInProcess() ? new wxBusyInfo("Veuillez patienter, la compilation interne des évènements\ndoit être menée à terme avant de continuer...") : NULL;
    while (CodeCompiler::GetInstance()->CompilationInProcess())
    {
        wxYield();
    }
    if ( waitDialog ) delete waitDialog;

    game->RemoveLayout(layoutName);
}

void ProjectManager::OnpasteSceneMenuItemSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    Clipboard * clipboard = Clipboard::GetInstance();
    if (!clipboard->HasLayout()) return;

    gd::Layout & newLayout = *clipboard->GetLayout();

    //Finding a new, unique name for the layout
    string newSceneName = string(_("Copie de")) + " " + newLayout.GetName();
    int i = 2;
    while(game->HasLayoutNamed(newSceneName))
    {
        newSceneName = _("Copie de") + " " + newLayout.GetName() + " " + ToString(i);
        ++i;
    }

    newLayout.SetName(newSceneName);
    game->InsertLayout(newLayout, game->GetLayoutPosition(data->GetSecondString()));

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
        for (unsigned int i = 0;i<game->GetLayouts().size();++i)
        {
        	game->GetLayouts()[i]->wasModified = true;
            CodeCompilationHelpers::CreateSceneEventsCompilationTask(*game, *game->GetLayouts()[i]);
        }
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

    bool oldExternalSourcesFileUse = game->useExternalSourceFiles;
    EditPropJeu Dialog( this, *game );
    if ( Dialog.ShowModal() )

    projectsTree->SetItemText(selectedItem, game->GetName()); //The name can have been changed
    if ( oldExternalSourcesFileUse != game->useExternalSourceFiles )
        Refresh();
}

/**
 * Edit extensions used by a project
 */
void ProjectManager::EditExtensionsOfGame(gd::Project & project)
{
    Extensions dialog(this, project);
    dialog.ShowModal();
}

void ProjectManager::OnRibbonExtensionsSelected(wxRibbonButtonBarEvent& event)
{
    if ( !mainEditor.CurrentGameIsValid() ) return;
    EditExtensionsOfGame(*mainEditor.GetCurrentGame());


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
        ResourcesEditor * imagesEditorPtr = dynamic_cast<ResourcesEditor*>(mainEditor.GetEditorsNotebook()->GetPage(k));
        CodeEditor * codeEditorPtr = dynamic_cast<CodeEditor*>(mainEditor.GetEditorsNotebook()->GetPage(k));

        if ( sceneEditorPtr != NULL )
        {
            bool sceneBelongToGame = false;
            for (unsigned int i = 0;i<game->GetLayoutCount();++i)
            {
            	if ( &game->GetLayout(i) == &sceneEditorPtr->GetLayout() )
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
        else if ( codeEditorPtr != NULL )
        {
            if ( codeEditorPtr->game == game)
            {
                if ( !mainEditor.GetEditorsNotebook()->DeletePage(k) )
                    wxMessageBox(_("Impossible de supprimer l'onglet !"), _("Erreur"), wxICON_ERROR );
                k--;
            }
        }
    }

    //Ensure we're not destroying a scene with events being built
    wxBusyInfo * waitDialog = CodeCompiler::GetInstance()->CompilationInProcess() ? new wxBusyInfo("Veuillez patienter, la compilation interne des évènements de la scène\ndoit être menée à terme avant de fermer le jeu...") : NULL;
    while ( CodeCompiler::GetInstance()->CompilationInProcess() )
    {
        wxYield();
    }
    if ( waitDialog ) delete waitDialog;

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
    mainEditor.GetRibbon()->SetActivePage(static_cast<size_t>(0));
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

    if ( !game->HasExternalEventsNamed(data->GetSecondString()) )
    {
        wxLogWarning(_("Evenements externes introuvables."));
        return;
    }

    //Verify if the scene editor is not already opened
    for (unsigned int j =0;j<mainEditor.GetEditorsNotebook()->GetPageCount() ;j++ )
    {
        ExternalEventsEditor * eventsEditorPtr = dynamic_cast<ExternalEventsEditor*>(mainEditor.GetEditorsNotebook()->GetPage(j));

        if ( eventsEditorPtr != NULL && &eventsEditorPtr->events == &game->GetExternalEvents(data->GetSecondString()) )
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
        prefix = "["+game->GetName()+"] ";
        if ( game->GetName().length() > gameMaxCharDisplayedInEditor )
            prefix = "["+game->GetName().substr(0, gameMaxCharDisplayedInEditor-3)+"...] ";
    }

    ExternalEventsEditor * editor = new ExternalEventsEditor(mainEditor.GetEditorsNotebook(), *game, game->GetExternalEvents(data->GetSecondString()), mainEditor.GetMainEditorCommand());
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
    while(game->HasExternalEventsNamed(newName))
    {
        newName = _("Evenements externes") + " " + ToString(i);
        ++i;
    }

    game->InsertNewExternalEvents(newName, game->GetExternalEventsCount());
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

    std::string externalEventsName = data->GetSecondString();
    if ( !game->HasExternalEventsNamed(externalEventsName) )
    {
        wxLogWarning(_("Evenements introuvable."));
        return;
    }

    //Updating editors
    for (unsigned int k =0;k<static_cast<unsigned>(mainEditor.GetEditorsNotebook()->GetPageCount()) ;k++ )
    {
        ExternalEventsEditor * editorPtr = dynamic_cast<ExternalEventsEditor*>(mainEditor.GetEditorsNotebook()->GetPage(k));

        if ( editorPtr != NULL && &editorPtr->events == &game->GetExternalEvents(data->GetSecondString()))
        {
            if ( !mainEditor.GetEditorsNotebook()->DeletePage(k) )
                wxMessageBox(_("Impossible de supprimer l'onglet !"), _("Erreur"), wxICON_ERROR );

            k--;
        }
    }

    //Updating tree
    projectsTree->Delete(selectedItem);

    game->RemoveExternalEvents(externalEventsName);
}

void ProjectManager::OnAddCppSourceFileSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    wxFileDialog fileDialog( this, _("Choisissez un ou plusieurs fichiers à ajouter"), "", "", _("Sources C++|*.cpp;*.cxx|Tous les fichiers|*.*"), wxFD_MULTIPLE );
    if ( fileDialog.ShowModal() != wxID_OK ) return;

    wxArrayString files;
    wxArrayString names;
    fileDialog.GetFilenames( names );
    fileDialog.GetPaths( files );

    for ( unsigned int i = 0; i < files.GetCount();i++ )
    {
        boost::shared_ptr<SourceFile> sourceFile(new SourceFile);
        sourceFile->SetFileName(string(files[i].mb_str()));

        game->externalSourceFiles.push_back(sourceFile);
    }

    Refresh();
}

void ProjectManager::OnDeleteSourceFileSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    vector< boost::shared_ptr<SourceFile> >::iterator sourceFile =
        find_if(game->externalSourceFiles.begin(), game->externalSourceFiles.end(), bind2nd(ExternalSourceFileHasName(), data->GetSecondString()));

    if ( sourceFile == game->externalSourceFiles.end() )
    {
        wxLogWarning(_("Fichier introuvable"));
        return;
    }

    //Updating editors
    for (unsigned int k =0;k<static_cast<unsigned>(mainEditor.GetEditorsNotebook()->GetPageCount()) ;k++ )
    {
        CodeEditor * editorPtr = dynamic_cast<CodeEditor*>(mainEditor.GetEditorsNotebook()->GetPage(k));

        if ( editorPtr != NULL && editorPtr->filename == (*sourceFile)->GetFileName())
        {
            if ( !mainEditor.GetEditorsNotebook()->DeletePage(k) )
                wxMessageBox(_("Impossible de supprimer l'onglet !"), _("Erreur"), wxICON_ERROR );

            k--;
        }
    }

    game->externalSourceFiles.erase(sourceFile);

    //Updating tree
    projectsTree->Delete(selectedItem);
}

void ProjectManager::OnCopyExternalEventsSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    if ( !game->HasExternalEventsNamed(data->GetSecondString()) )
    {
        wxLogWarning(_("Evenements introuvable."));
        return;
    }

    Clipboard::GetInstance()->SetExternalEvents(&game->GetExternalEvents(data->GetSecondString()));
}

void ProjectManager::OnCutExternalEventsSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    std::string externalEventsName = data->GetSecondString();
    if ( !game->HasExternalEventsNamed(externalEventsName) )
    {
        wxLogWarning(_("Evenements introuvable."));
        return;
    }

    Clipboard::GetInstance()->SetExternalEvents(&game->GetExternalEvents(data->GetSecondString()));

    //Updating editors
    for (unsigned int k =0;k<static_cast<unsigned>(mainEditor.GetEditorsNotebook()->GetPageCount()) ;k++ )
    {
        ExternalEventsEditor * editorPtr = dynamic_cast<ExternalEventsEditor*>(mainEditor.GetEditorsNotebook()->GetPage(k));

        if ( editorPtr != NULL && &editorPtr->events == &game->GetExternalEvents(data->GetSecondString()))
        {
            if ( !mainEditor.GetEditorsNotebook()->DeletePage(k) )
                wxMessageBox(_("Impossible de supprimer l'onglet !"), _("Erreur"), wxICON_ERROR );

            k--;
        }
    }

    //Updating tree
    projectsTree->Delete(selectedItem);

    game->RemoveExternalEvents(externalEventsName);
}

void ProjectManager::OnPasteExternalEventsSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    gd::ExternalEvents & newEvents = *Clipboard::GetInstance()->GetExternalEvents();

    //Finding a new, unique name for the events
    string newName = string(_("Copie de")) + " " + newEvents.GetName();
    int i = 2;
    while(game->HasExternalEventsNamed(newName))
    {
        newName = _("Copie de") + " " + newEvents.GetName() + " " + ToString(i);
        ++i;
    }

    newEvents.SetName(newName);
    game->InsertExternalEvents(newEvents, game->GetExternalEventsPosition(data->GetSecondString()));

    //Insert in tree
    gdTreeItemGameData * eventsItemData = new gdTreeItemGameData("ExternalEvents", newName, game);
    if ( projectsTree->GetPrevSibling(selectedItem).IsOk() )
        projectsTree->InsertItem(projectsTree->GetItemParent(selectedItem), projectsTree->GetPrevSibling(selectedItem), newName, 4, 4, eventsItemData);
    else
        projectsTree->InsertItem(projectsTree->GetItemParent(selectedItem), 0, newName, 4, 4, eventsItemData);
}

void ProjectManager::OnCreateNewCppFileSelected(wxCommandEvent& event)
{
    RuntimeGame * game;
    gdTreeItemGameData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    wxFileDialog dialog( this, _( "Choisissez un nom de fichier" ), "", "", "Source C++ (*.cpp)|*.cpp|Header C++ (*.h)|*.h", wxFD_SAVE|wxFD_OVERWRITE_PROMPT );
    if ( dialog.ShowModal() == wxID_CANCEL )
        return;

    //Creating an empty file
    std::ofstream file;
    file.open ( ToString(dialog.GetPath()).c_str() );
    file << "\n";
    file.close();

    //Adding it to the game source files.
    boost::shared_ptr<SourceFile> sourceFile(new SourceFile);

    wxFileName filename(dialog.GetPath()); //Files are added with their paths relative to the project directory
    filename.MakeRelativeTo(wxFileName::FileName(game->gameFile).GetPath());
    sourceFile->SetFileName(ToString(filename.GetFullPath()));

    vector< boost::shared_ptr<SourceFile> >::iterator alreadyExistingSourceFile =
        find_if(game->externalSourceFiles.begin(), game->externalSourceFiles.end(), bind2nd(ExternalSourceFileHasName(), ToString(filename.GetFullPath())));

    if ( alreadyExistingSourceFile == game->externalSourceFiles.end() )
        game->externalSourceFiles.push_back(sourceFile);
    Refresh();
}
