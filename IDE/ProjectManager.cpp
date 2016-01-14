/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
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
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/wxTools/ShowFolder.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/SourceFile.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/IDE/Dialogs/ProjectExtensionsDialog.h"
#include "GDCore/IDE/Dialogs/ChooseVariableDialog.h"
#include "GDCore/IDE/Clipboard.h"
#include "GDCore/IDE/wxTools/SafeYield.h"
#include "GDCore/CommonTools.h"
#include "Dialogs/ExternalLayoutEditor.h"
#include "Dialogs/ProjectPropertiesPnl.h"
#include "gdTreeItemProjectData.h"
#include "LogFileManager.h"
#include "MainFrame.h"
#include "CodeEditor.h"
#include "ExternalEventsEditor.h"
#include "EditPropScene.h"
#include "GDCpp/IDE/CodeCompiler.h"

#ifdef __WXMSW__
#include <wx/msw/uxtheme.h>
#endif

using namespace gd;

//(*IdInit(ProjectManager)
const long ProjectManager::ID_TREECTRL1 = wxNewId();
const long ProjectManager::idMenuEditScene = wxNewId();
const long ProjectManager::idMenuEditPropScene = wxNewId();
const long ProjectManager::idMenuModVar = wxNewId();
const long ProjectManager::idMenuModNameScene = wxNewId();
const long ProjectManager::idMenuAddScene = wxNewId();
const long ProjectManager::idMenuDelScene = wxNewId();
const long ProjectManager::ID_MENUITEM29 = wxNewId();
const long ProjectManager::ID_MENUITEM30 = wxNewId();
const long ProjectManager::idMenuCopyScene = wxNewId();
const long ProjectManager::idMenuCutScene = wxNewId();
const long ProjectManager::idMenuPasteScene = wxNewId();
const long ProjectManager::ID_MENUITEM1 = wxNewId();
const long ProjectManager::ID_MENUITEM2 = wxNewId();
const long ProjectManager::ID_MENUITEM3 = wxNewId();
const long ProjectManager::ID_MENUITEM4 = wxNewId();
const long ProjectManager::ID_MENUITEM28 = wxNewId();
const long ProjectManager::ID_MENUITEM5 = wxNewId();
const long ProjectManager::ID_MENUITEM6 = wxNewId();
const long ProjectManager::ID_MENUITEM7 = wxNewId();
const long ProjectManager::ID_MENUITEM13 = wxNewId();
const long ProjectManager::ID_MENUITEM8 = wxNewId();
const long ProjectManager::ID_MENUITEM9 = wxNewId();
const long ProjectManager::ID_MENUITEM31 = wxNewId();
const long ProjectManager::ID_MENUITEM32 = wxNewId();
const long ProjectManager::ID_MENUITEM10 = wxNewId();
const long ProjectManager::ID_MENUITEM11 = wxNewId();
const long ProjectManager::ID_MENUITEM12 = wxNewId();
const long ProjectManager::ID_MENUITEM18 = wxNewId();
const long ProjectManager::ID_MENUITEM14 = wxNewId();
const long ProjectManager::ID_MENUITEM15 = wxNewId();
const long ProjectManager::ID_MENUITEM16 = wxNewId();
const long ProjectManager::ID_MENUITEM19 = wxNewId();
const long ProjectManager::ID_MENUITEM17 = wxNewId();
const long ProjectManager::ID_MENUITEM20 = wxNewId();
const long ProjectManager::ID_MENUITEM21 = wxNewId();
const long ProjectManager::ID_MENUITEM22 = wxNewId();
const long ProjectManager::ID_MENUITEM23 = wxNewId();
const long ProjectManager::ID_MENUITEM24 = wxNewId();
const long ProjectManager::ID_MENUITEM33 = wxNewId();
const long ProjectManager::ID_MENUITEM34 = wxNewId();
const long ProjectManager::ID_MENUITEM25 = wxNewId();
const long ProjectManager::ID_MENUITEM26 = wxNewId();
const long ProjectManager::ID_MENUITEM27 = wxNewId();
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
const long ProjectManager::idRibbonEditSelected = wxNewId();
const long ProjectManager::idRibbonAddExternalEvents = wxNewId();
const long ProjectManager::idRibbonAddExternalLayout = wxNewId();
const long ProjectManager::idRibbonStartPage = wxNewId();
const long ProjectManager::idRibbonCppTools = wxNewId();
const long ProjectManager::idRibbonImporter = wxNewId();
const long ProjectManager::idRibbonEncoder = wxNewId();
const long ProjectManager::idRibbonProjectsManager = wxNewId();
const long ProjectManager::idRibbonHelp = wxNewId();

wxRibbonButtonBar * ProjectManager::projectRibbonBar = NULL;
wxRibbonButtonBar * ProjectManager::operationsRibbonBar = NULL;


BEGIN_EVENT_TABLE(ProjectManager,wxPanel)
	//(*EventTable(ProjectManager)
	//*)
END_EVENT_TABLE()

ProjectManager::ProjectManager(wxWindow* parent, MainFrame & mainEditor_) :
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
	editSceneMenuItem = new wxMenuItem((&sceneContextMenu), idMenuEditScene, _("Edit this scene"), wxEmptyString, wxITEM_NORMAL);
	editSceneMenuItem->SetBitmap(gd::SkinHelper::GetIcon("edit", 16));
	sceneContextMenu.Append(editSceneMenuItem);
	editScenePropMenuItem = new wxMenuItem((&sceneContextMenu), idMenuEditPropScene, _("Edit the properties"), wxEmptyString, wxITEM_NORMAL);
	editScenePropMenuItem->SetBitmap(gd::SkinHelper::GetIcon("properties", 16));
	sceneContextMenu.Append(editScenePropMenuItem);
	modVarSceneMenuI = new wxMenuItem((&sceneContextMenu), idMenuModVar, _("Modify inital variables"), wxEmptyString, wxITEM_NORMAL);
	modVarSceneMenuI->SetBitmap(gd::SkinHelper::GetIcon("var", 16));
	sceneContextMenu.Append(modVarSceneMenuI);
	editSceneNameMenuItem = new wxMenuItem((&sceneContextMenu), idMenuModNameScene, _("Rename\tF2"), wxEmptyString, wxITEM_NORMAL);
	editSceneNameMenuItem->SetBitmap(gd::SkinHelper::GetIcon("rename", 16));
	sceneContextMenu.Append(editSceneNameMenuItem);
	sceneContextMenu.AppendSeparator();
	addSceneMenuItem = new wxMenuItem((&sceneContextMenu), idMenuAddScene, _("Add a scene"), wxEmptyString, wxITEM_NORMAL);
	addSceneMenuItem->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
	sceneContextMenu.Append(addSceneMenuItem);
	deleteSceneMenuItem = new wxMenuItem((&sceneContextMenu), idMenuDelScene, _("Delete\tDEL"), wxEmptyString, wxITEM_NORMAL);
	deleteSceneMenuItem->SetBitmap(gd::SkinHelper::GetIcon("delete", 16));
	sceneContextMenu.Append(deleteSceneMenuItem);
	sceneContextMenu.AppendSeparator();
	MenuItem25 = new wxMenuItem((&sceneContextMenu), ID_MENUITEM29, _("Move up\tCtrl-Up"), wxEmptyString, wxITEM_NORMAL);
	MenuItem25->SetBitmap(gd::SkinHelper::GetIcon("up", 16));
	sceneContextMenu.Append(MenuItem25);
	MenuItem26 = new wxMenuItem((&sceneContextMenu), ID_MENUITEM30, _("Move down\tCtrl-Down"), wxEmptyString, wxITEM_NORMAL);
	MenuItem26->SetBitmap(gd::SkinHelper::GetIcon("down", 16));
	sceneContextMenu.Append(MenuItem26);
	sceneContextMenu.AppendSeparator();
	copySceneMenuItem = new wxMenuItem((&sceneContextMenu), idMenuCopyScene, _("Copy\tCtrl-C"), wxEmptyString, wxITEM_NORMAL);
	copySceneMenuItem->SetBitmap(gd::SkinHelper::GetIcon("copy", 16));
	sceneContextMenu.Append(copySceneMenuItem);
	cutSceneMenuItem = new wxMenuItem((&sceneContextMenu), idMenuCutScene, _("Cut\tCtrl-X"), wxEmptyString, wxITEM_NORMAL);
	cutSceneMenuItem->SetBitmap(gd::SkinHelper::GetIcon("cut", 16));
	sceneContextMenu.Append(cutSceneMenuItem);
	pasteSceneMenuItem = new wxMenuItem((&sceneContextMenu), idMenuPasteScene, _("Paste\tCtrl-V"), wxEmptyString, wxITEM_NORMAL);
	pasteSceneMenuItem->SetBitmap(gd::SkinHelper::GetIcon("paste", 16));
	sceneContextMenu.Append(pasteSceneMenuItem);
	MenuItem1 = new wxMenuItem((&scenesContextMenu), ID_MENUITEM1, _("Add a scene"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
	scenesContextMenu.Append(MenuItem1);
	editPropGameMenuItem = new wxMenuItem((&gameContextMenu), ID_MENUITEM2, _("Edit the property of the game"), wxEmptyString, wxITEM_NORMAL);
	editPropGameMenuItem->SetBitmap(gd::SkinHelper::GetIcon("properties", 16));
	gameContextMenu.Append(editPropGameMenuItem);
	editGblVarMenuItem = new wxMenuItem((&gameContextMenu), ID_MENUITEM3, _("Modify global variables"), wxEmptyString, wxITEM_NORMAL);
	editGblVarMenuItem->SetBitmap(gd::SkinHelper::GetIcon("var", 16));
	gameContextMenu.Append(editGblVarMenuItem);
	editNameGameMenuItem = new wxMenuItem((&gameContextMenu), ID_MENUITEM4, _("Rename\tF2"), wxEmptyString, wxITEM_NORMAL);
	editNameGameMenuItem->SetBitmap(gd::SkinHelper::GetIcon("rename", 16));
	gameContextMenu.Append(editNameGameMenuItem);
	gameContextMenu.AppendSeparator();
	MenuItem24 = new wxMenuItem((&gameContextMenu), ID_MENUITEM28, _("Open the folder of the project"), wxEmptyString, wxITEM_NORMAL);
	MenuItem24->SetBitmap(gd::SkinHelper::GetIcon("open", 16));
	gameContextMenu.Append(MenuItem24);
	gameContextMenu.AppendSeparator();
	closeGameBt = new wxMenuItem((&gameContextMenu), ID_MENUITEM5, _("Close this project"), wxEmptyString, wxITEM_NORMAL);
	gameContextMenu.Append(closeGameBt);
	MenuItem2 = new wxMenuItem((&emptyExternalEventsContextMenu), ID_MENUITEM6, _("Add external events"), wxEmptyString, wxITEM_NORMAL);
	MenuItem2->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
	emptyExternalEventsContextMenu.Append(MenuItem2);
	MenuItem3 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM7, _("Edit"), wxEmptyString, wxITEM_NORMAL);
	MenuItem3->SetBitmap(gd::SkinHelper::GetIcon("edit", 16));
	externalEventsContextMenu.Append(MenuItem3);
	MenuItem9 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM13, _("Rename\tF2"), wxEmptyString, wxITEM_NORMAL);
	MenuItem9->SetBitmap(gd::SkinHelper::GetIcon("rename", 16));
	externalEventsContextMenu.Append(MenuItem9);
	externalEventsContextMenu.AppendSeparator();
	MenuItem4 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM8, _("Add external events"), wxEmptyString, wxITEM_NORMAL);
	MenuItem4->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
	externalEventsContextMenu.Append(MenuItem4);
	MenuItem5 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM9, _("Delete\tDEL"), wxEmptyString, wxITEM_NORMAL);
	MenuItem5->SetBitmap(gd::SkinHelper::GetIcon("delete", 16));
	externalEventsContextMenu.Append(MenuItem5);
	externalEventsContextMenu.AppendSeparator();
	MenuItem27 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM31, _("Move up\tCtrl-Up"), wxEmptyString, wxITEM_NORMAL);
	MenuItem27->SetBitmap(gd::SkinHelper::GetIcon("up", 16));
	externalEventsContextMenu.Append(MenuItem27);
	MenuItem28 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM32, _("Move down\tCtrl-Down"), wxEmptyString, wxITEM_NORMAL);
	MenuItem28->SetBitmap(gd::SkinHelper::GetIcon("down", 16));
	externalEventsContextMenu.Append(MenuItem28);
	externalEventsContextMenu.AppendSeparator();
	MenuItem6 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM10, _("Copy\tCtrl-C"), wxEmptyString, wxITEM_NORMAL);
	MenuItem6->SetBitmap(gd::SkinHelper::GetIcon("copy", 16));
	externalEventsContextMenu.Append(MenuItem6);
	MenuItem7 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM11, _("Cut\tCtrl-X"), wxEmptyString, wxITEM_NORMAL);
	MenuItem7->SetBitmap(gd::SkinHelper::GetIcon("cut", 16));
	externalEventsContextMenu.Append(MenuItem7);
	MenuItem8 = new wxMenuItem((&externalEventsContextMenu), ID_MENUITEM12, _("Paste\tCtrl-V"), wxEmptyString, wxITEM_NORMAL);
	MenuItem8->SetBitmap(gd::SkinHelper::GetIcon("paste", 16));
	externalEventsContextMenu.Append(MenuItem8);
	MenuItem14 = new wxMenuItem((&sourceFilesContextMenu), ID_MENUITEM18, _("Create a new source file"), wxEmptyString, wxITEM_NORMAL);
	sourceFilesContextMenu.Append(MenuItem14);
	MenuItem10 = new wxMenuItem((&sourceFilesContextMenu), ID_MENUITEM14, _("Add an already existing source file"), wxEmptyString, wxITEM_NORMAL);
	MenuItem10->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
	sourceFilesContextMenu.Append(MenuItem10);
	MenuItem11 = new wxMenuItem((&sourceFileContextMenu), ID_MENUITEM15, _("Edit"), wxEmptyString, wxITEM_NORMAL);
	MenuItem11->SetBitmap(gd::SkinHelper::GetIcon("edit", 16));
	sourceFileContextMenu.Append(MenuItem11);
	sourceFileContextMenu.AppendSeparator();
	MenuItem12 = new wxMenuItem((&sourceFileContextMenu), ID_MENUITEM16, _("Delete\tDEL"), wxEmptyString, wxITEM_NORMAL);
	MenuItem12->SetBitmap(gd::SkinHelper::GetIcon("delete", 16));
	sourceFileContextMenu.Append(MenuItem12);
	sourceFileContextMenu.AppendSeparator();
	MenuItem15 = new wxMenuItem((&sourceFileContextMenu), ID_MENUITEM19, _("Create a new source file"), wxEmptyString, wxITEM_NORMAL);
	sourceFileContextMenu.Append(MenuItem15);
	MenuItem13 = new wxMenuItem((&sourceFileContextMenu), ID_MENUITEM17, _("Add an already existing source file"), wxEmptyString, wxITEM_NORMAL);
	MenuItem13->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
	sourceFileContextMenu.Append(MenuItem13);
	MenuItem16 = new wxMenuItem((&emptyExternalLayoutsContextMenu), ID_MENUITEM20, _("Add an external layout"), wxEmptyString, wxITEM_NORMAL);
	MenuItem16->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
	emptyExternalLayoutsContextMenu.Append(MenuItem16);
	MenuItem17 = new wxMenuItem((&externalLayoutContextMenu), ID_MENUITEM21, _("Edit"), wxEmptyString, wxITEM_NORMAL);
	MenuItem17->SetBitmap(gd::SkinHelper::GetIcon("edit", 16));
	externalLayoutContextMenu.Append(MenuItem17);
	MenuItem18 = new wxMenuItem((&externalLayoutContextMenu), ID_MENUITEM22, _("Rename\tF2"), wxEmptyString, wxITEM_NORMAL);
	MenuItem18->SetBitmap(gd::SkinHelper::GetIcon("rename", 16));
	externalLayoutContextMenu.Append(MenuItem18);
	externalLayoutContextMenu.AppendSeparator();
	MenuItem19 = new wxMenuItem((&externalLayoutContextMenu), ID_MENUITEM23, _("Add an external layout"), wxEmptyString, wxITEM_NORMAL);
	MenuItem19->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
	externalLayoutContextMenu.Append(MenuItem19);
	MenuItem20 = new wxMenuItem((&externalLayoutContextMenu), ID_MENUITEM24, _("Delete\tDEL"), wxEmptyString, wxITEM_NORMAL);
	MenuItem20->SetBitmap(gd::SkinHelper::GetIcon("delete", 16));
	externalLayoutContextMenu.Append(MenuItem20);
	externalLayoutContextMenu.AppendSeparator();
	MenuItem29 = new wxMenuItem((&externalLayoutContextMenu), ID_MENUITEM33, _("Move up\tCtrl-Up"), wxEmptyString, wxITEM_NORMAL);
	MenuItem29->SetBitmap(gd::SkinHelper::GetIcon("up", 16));
	externalLayoutContextMenu.Append(MenuItem29);
	MenuItem30 = new wxMenuItem((&externalLayoutContextMenu), ID_MENUITEM34, _("Move down\tCtrl-Down"), wxEmptyString, wxITEM_NORMAL);
	MenuItem30->SetBitmap(gd::SkinHelper::GetIcon("down", 16));
	externalLayoutContextMenu.Append(MenuItem30);
	externalLayoutContextMenu.AppendSeparator();
	MenuItem21 = new wxMenuItem((&externalLayoutContextMenu), ID_MENUITEM25, _("Copy\tCtrl-C"), wxEmptyString, wxITEM_NORMAL);
	MenuItem21->SetBitmap(gd::SkinHelper::GetIcon("copy", 16));
	externalLayoutContextMenu.Append(MenuItem21);
	MenuItem22 = new wxMenuItem((&externalLayoutContextMenu), ID_MENUITEM26, _("Cut\tCtrl-X"), wxEmptyString, wxITEM_NORMAL);
	MenuItem22->SetBitmap(gd::SkinHelper::GetIcon("cut", 16));
	externalLayoutContextMenu.Append(MenuItem22);
	MenuItem23 = new wxMenuItem((&externalLayoutContextMenu), ID_MENUITEM27, _("Paste\tCtrl-V"), wxEmptyString, wxITEM_NORMAL);
	MenuItem23->SetBitmap(gd::SkinHelper::GetIcon("paste", 16));
	externalLayoutContextMenu.Append(MenuItem23);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_LABEL_EDIT,(wxObjectEventFunction)&ProjectManager::OnprojectsTreeBeginLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_END_LABEL_EDIT,(wxObjectEventFunction)&ProjectManager::OnprojectsTreeEndLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ProjectManager::OnprojectsTreeItemActivated);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&ProjectManager::OnprojectsTreeItemRightClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ProjectManager::OnprojectsTreeSelectionChanged);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_KEY_DOWN,(wxObjectEventFunction)&ProjectManager::OnprojectsTreeKeyDown);
	Connect(idMenuEditScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OneditSceneMenuItemSelected);
	Connect(idMenuEditPropScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OneditScenePropMenuItemSelected);
	Connect(idMenuModVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnmodVarSceneMenuISelected);
	Connect(idMenuModNameScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OneditSceneNameMenuItemSelected);
	Connect(idMenuAddScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnaddSceneMenuItemSelected);
	Connect(idMenuDelScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OndeleteSceneMenuItemSelected);
	Connect(ID_MENUITEM29,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnSceneMoveUpSelected);
	Connect(ID_MENUITEM30,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnSceneMoveDownSelected);
	Connect(idMenuCopyScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OncopySceneMenuItemSelected);
	Connect(idMenuCutScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OncutSceneMenuItemSelected);
	Connect(idMenuPasteScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnpasteSceneMenuItemSelected);
	Connect(ID_MENUITEM1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnaddSceneMenuItemSelected);
	Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OneditPropGameMenuItemSelected);
	Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OneditGblVarMenuItemSelected);
	Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OneditNameGameMenuItemSelected);
	Connect(ID_MENUITEM28,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnOpenProjectFolderSelected);
	Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OncloseGameBtSelected);
	Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnAddExternalEventsSelected);
	Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnEditExternalEventsSelected);
	Connect(ID_MENUITEM13,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnRenameExternalEventsSelected);
	Connect(ID_MENUITEM8,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnAddExternalEventsSelected);
	Connect(ID_MENUITEM9,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnDeleteExternalEventsSelected);
	Connect(ID_MENUITEM31,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnExternalEventsMoveUpSelected);
	Connect(ID_MENUITEM32,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnExternalEventsMoveDownSelected);
	Connect(ID_MENUITEM10,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnCopyExternalEventsSelected);
	Connect(ID_MENUITEM11,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnCutExternalEventsSelected);
	Connect(ID_MENUITEM12,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnPasteExternalEventsSelected);
	Connect(ID_MENUITEM18,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnCreateNewCppFileSelected);
	Connect(ID_MENUITEM14,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnAddCppSourceFileSelected);
	Connect(ID_MENUITEM15,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnEditSourceFileSelected);
	Connect(ID_MENUITEM16,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnDeleteSourceFileSelected);
	Connect(ID_MENUITEM19,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnCreateNewCppFileSelected);
	Connect(ID_MENUITEM17,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnAddCppSourceFileSelected);
	Connect(ID_MENUITEM20,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnAddExternalLayoutSelected);
	Connect(ID_MENUITEM21,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnEditExternalLayoutSelected);
	Connect(ID_MENUITEM22,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnRenameExternalLayoutSelected);
	Connect(ID_MENUITEM23,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnAddExternalLayoutSelected);
	Connect(ID_MENUITEM24,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnDeleteExternalLayoutSelected);
	Connect(ID_MENUITEM33,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnExternalLayoutMoveUpSelected);
	Connect(ID_MENUITEM34,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnExternalLayoutMoveDownSelected);
	Connect(ID_MENUITEM25,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnCopyExternalLayoutSelected);
	Connect(ID_MENUITEM26,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnCutExternalLayoutSelected);
	Connect(ID_MENUITEM27,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProjectManager::OnPasteExternalLayoutSelected);
	//*)

    wxImageList * imageList = new wxImageList(16,16);
    imageList->Add(gd::SkinHelper::GetIcon("project", 16));
    imageList->Add(gd::SkinHelper::GetIcon("scene", 16));
    imageList->Add(gd::SkinHelper::GetIcon("image", 16));
    imageList->Add(gd::SkinHelper::GetIcon("extensions", 16));
    imageList->Add(gd::SkinHelper::GetIcon("events", 16));
    imageList->Add(gd::SkinHelper::GetIcon("source_cpp", 16));
    imageList->Add(gd::SkinHelper::GetIcon("external_layout", 16));
    projectsTree->SetImageList(imageList);

    #if defined(__WXMSW__) //Offers nice look to wxTreeCtrl
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
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Projects"), SkinHelper::GetRibbonIcon("open"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonNew, !hideLabels ? _("New") : gd::String(), SkinHelper::GetRibbonIcon("new"), _("Create a new game"));
        ribbonBar->AddHybridButton(idRibbonOpen, !hideLabels ? _("Open") : gd::String(), SkinHelper::GetRibbonIcon("open"), _("Open a previously saved project"));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Current project"), SkinHelper::GetRibbonIcon("save"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        projectRibbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        projectRibbonBar->AddHybridButton(idRibbonSave, !hideLabels ? _("Save") : gd::String(), SkinHelper::GetRibbonIcon("save"), _("Save the current project"));
        projectRibbonBar->AddButton(idRibbonSaveAll, !hideLabels ? _("Save all") : gd::String(), SkinHelper::GetRibbonIcon("save_all"), _("Save all open projects"));
        projectRibbonBar->AddButton(idRibbonClose, !hideLabels ? _("Close") : gd::String(), SkinHelper::GetRibbonIcon("close"), _("Close the current project"));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Basic Operations"), SkinHelper::GetRibbonIcon("copy"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        operationsRibbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        operationsRibbonBar->AddButton(idRibbonEditImages, !hideLabels ? _("Images") : gd::String(), SkinHelper::GetRibbonIcon("image"), _("Display the resources used by the game"));
        operationsRibbonBar->AddButton(idRibbonAddScene, !hideLabels ? _("Add a scene") : gd::String(), SkinHelper::GetRibbonIcon("sceneadd"));
        operationsRibbonBar->AddButton(idRibbonAddExternalEvents, !hideLabels ? _("Add external events") : gd::String(), SkinHelper::GetRibbonIcon("eventsadd"));
        operationsRibbonBar->AddButton(idRibbonAddExternalLayout, !hideLabels ? _("Add an external layout") : gd::String(), SkinHelper::GetRibbonIcon("externallayoutadd"));
        operationsRibbonBar->AddButton(idRibbonExtensions, !hideLabels ? _("Extensions and platforms") : gd::String(), SkinHelper::GetRibbonIcon("extension"));
    }
    {
        wxRibbonPanel *affichagePanel = new wxRibbonPanel(page, wxID_ANY, _("View"), SkinHelper::GetRibbonIcon("image"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *affichage_bar = new wxRibbonButtonBar(affichagePanel, wxID_ANY);
        affichage_bar->AddButton(idRibbonProjectsManager, !hideLabels ? _("Projects") : gd::String(), SkinHelper::GetRibbonIcon("projectManager"), _("Display the project manager"));
        affichage_bar->AddButton(idRibbonStartPage, !hideLabels ? _("Start page") : gd::String(), SkinHelper::GetRibbonIcon("startPage"), _("Open the start page"));
        affichage_bar->AddButton(idRibbonCppTools, !hideLabels ? _("C++ Tools") : gd::String(), SkinHelper::GetRibbonIcon("source_cpp"), _("Display tools related to native games"));

        wxRibbonPanel *toolsPanel = new wxRibbonPanel(page, wxID_ANY, _("Tools"), SkinHelper::GetRibbonIcon("tools"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *tools_bar = new wxRibbonButtonBar(toolsPanel, wxID_ANY);
        tools_bar->AddButton(idRibbonEncoder, !hideLabels ? _("Converter") : gd::String(), SkinHelper::GetRibbonIcon("audioconverter"), _("Open a tool to convert MP3 files to OGG"));
        tools_bar->AddDropdownButton(idRibbonImporter, !hideLabels ? _("Image converter") : gd::String(), SkinHelper::GetRibbonIcon("imageconverter"), _("Open a tool to convert various images format"));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Help"), SkinHelper::GetRibbonIcon("help"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonHelp, !hideLabels ? _("Help") : gd::String(), SkinHelper::GetRibbonIcon("help"), _("Open the online help for GDevelop"));
    }

}

void ProjectManager::UpdateRibbonButtonsState()
{
	bool projectOpened = mainEditor.CurrentGameIsValid();
	if (projectRibbonBar)
	{
	    projectRibbonBar->EnableButton(idRibbonSave, projectOpened);
	    projectRibbonBar->EnableButton(idRibbonSaveAll, projectOpened);
	    projectRibbonBar->EnableButton(idRibbonClose, projectOpened);
	}
	if (operationsRibbonBar)
	{
	    operationsRibbonBar->EnableButton(idRibbonEditImages, projectOpened);
	    operationsRibbonBar->EnableButton(idRibbonAddScene, projectOpened);
	    operationsRibbonBar->EnableButton(idRibbonAddExternalEvents, projectOpened);
	    operationsRibbonBar->EnableButton(idRibbonAddExternalLayout, projectOpened);
	    operationsRibbonBar->EnableButton(idRibbonExtensions, projectOpened);
	}
}

void ProjectManager::ConnectEvents()
{
    mainEditor.Connect( idRibbonNew, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnMenuNewSelected, NULL, &mainEditor );
    mainEditor.Connect( idRibbonOpen, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnMenuOpenSelected, NULL, &mainEditor );
    mainEditor.Connect( idRibbonSaveAll, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnRibbonSaveAllClicked, NULL, &mainEditor );
    mainEditor.Connect( idRibbonOpen, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&MainFrame::OnRibbonOpenDropDownClicked, NULL, &mainEditor );
    mainEditor.Connect( idRibbonSave, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnMenuSaveSelected, NULL, &mainEditor );
    mainEditor.Connect( idRibbonSave, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&MainFrame::OnRibbonSaveDropDownClicked, NULL, &mainEditor );
    mainEditor.Connect( idRibbonCompil, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnMenuCompilationSelected, NULL, &mainEditor );
    mainEditor.Connect( idRibbonClose, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonCloseSelected, NULL, this );
    mainEditor.Connect( idRibbonExtensions, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonExtensionsSelected, NULL, this );
    mainEditor.Connect( idRibbonEditImages, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonEditImagesSelected, NULL, this );
    mainEditor.Connect( idRibbonAddScene, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonAddSceneSelected, NULL, this );
    mainEditor.Connect( idRibbonAddExternalEvents, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonAddExternalEventsSelected, NULL, this );
    mainEditor.Connect( idRibbonAddExternalLayout, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonAddExternalLayoutSelected, NULL, this );
    mainEditor.Connect( idRibbonStartPage, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnRibbonStartPageClicked, NULL, &mainEditor );
    mainEditor.Connect( idRibbonCppTools, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnRibbonCppToolsClicked, NULL, &mainEditor );
    mainEditor.Connect( idRibbonProjectsManager, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnProjectsManagerClicked, NULL, &mainEditor );
    mainEditor.Connect( idRibbonEncoder, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&MainFrame::OnMenuItem23Selected, NULL, &mainEditor );
    mainEditor.Connect( idRibbonImporter, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&MainFrame::OnRibbonDecomposerDropDownClicked, NULL, &mainEditor );
    mainEditor.Connect( idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&ProjectManager::OnRibbonHelpSelected, NULL, &mainEditor );

}

void ProjectManager::Refresh()
{
    projectsTree->DeleteAllItems();
    projectsTree->AddRoot(_("Projects"));
    for (std::size_t i = 0;i<mainEditor.games.size();++i)
    {
        wxString name = mainEditor.games[i]->GetName() == gd::String() ?
                        _("(No name)") :
                        mainEditor.games[i]->GetName();

        //Adding game's root
        gdTreeItemProjectData * gameItemData = new gdTreeItemProjectData("Root", "", mainEditor.games[i].get());
        wxTreeItemId projectItem = projectsTree->AppendItem(projectsTree->GetRootItem(), name, 0, 0, gameItemData);
        if ( mainEditor.projectCurrentlyEdited == i) projectsTree->SetItemBold(projectItem, true);

        //Images
        gdTreeItemProjectData * imagesItemData = new gdTreeItemProjectData("Images", "", mainEditor.games[i].get());
        projectsTree->AppendItem(projectItem, _("Images"), 2 ,2, imagesItemData);

        //Scenes
        gdTreeItemProjectData * scenesItemData = new gdTreeItemProjectData("Scenes", "", mainEditor.games[i].get());
        wxTreeItemId scenesItem = projectsTree->AppendItem(projectItem, _("Scenes"), 1 ,1, scenesItemData);
        for (std::size_t j = 0;j<mainEditor.games[i]->GetLayoutsCount();++j)
        {
            gdTreeItemProjectData * sceneItemData = new gdTreeItemProjectData("Scene", mainEditor.games[i]->GetLayout(j).GetName(), mainEditor.games[i].get());
            projectsTree->AppendItem(scenesItem, mainEditor.games[i]->GetLayout(j).GetName(), 1 ,1, sceneItemData);
        }

        //External events
        gdTreeItemProjectData * eventsItemData = new gdTreeItemProjectData("ExternalEventsRoot", "", mainEditor.games[i].get());
        wxTreeItemId eventsItem = projectsTree->AppendItem(projectItem, _("External events"), 4 ,4, eventsItemData);
        for (std::size_t j = 0;j<mainEditor.games[i]->GetExternalEventsCount();++j)
        {
            gdTreeItemProjectData * eventsItemData = new gdTreeItemProjectData("ExternalEvents", mainEditor.games[i]->GetExternalEvents(j).GetName(), mainEditor.games[i].get());
            projectsTree->AppendItem(eventsItem, mainEditor.games[i]->GetExternalEvents(j).GetName(), 4 ,4, eventsItemData);
        }

        //External layouts
        gdTreeItemProjectData * externalLayoutsItemData = new gdTreeItemProjectData("ExternalLayoutsRoot", "", mainEditor.games[i].get());
        wxTreeItemId externalayoutsItem = projectsTree->AppendItem(projectItem, _("External layouts"), 6 , 6, externalLayoutsItemData);
        for (std::size_t j = 0;j<mainEditor.games[i]->GetExternalLayoutsCount();++j)
        {
            gdTreeItemProjectData * externalLayoutsItemData = new gdTreeItemProjectData("ExternalLayout", mainEditor.games[i]->GetExternalLayout(j).GetName(), mainEditor.games[i].get());
            projectsTree->AppendItem(externalayoutsItem, mainEditor.games[i]->GetExternalLayout(j).GetName(), 6 , 6, externalLayoutsItemData);
        }

        std::shared_ptr<gd::Project> game = std::dynamic_pointer_cast<gd::Project>(mainEditor.games[i]);
        if ( game !=  std::shared_ptr<gd::Project>() && game->UseExternalSourceFiles() )
        {
            gdTreeItemProjectData * sourceFilesItemData = new gdTreeItemProjectData("SourceFiles", "", mainEditor.games[i].get());
            wxTreeItemId sourceFilesItem = projectsTree->AppendItem(projectItem, _("Source files"), 5 ,5, sourceFilesItemData);
            const std::vector < std::shared_ptr<gd::SourceFile> > & allFiles = game->GetAllSourceFiles();
            for (std::size_t j = 0;j<allFiles.size();++j)
            {
                if ( allFiles[j]->IsGDManaged() )
                    continue;

                gdTreeItemProjectData * sourceFileItem = new gdTreeItemProjectData("SourceFile", allFiles[j]->GetFileName(), game.get());
                projectsTree->AppendItem(sourceFilesItem, allFiles[j]->GetFileName(), 5 ,5, sourceFileItem);
            }
        }

        //Extensions
        gdTreeItemProjectData * extensionsItemData = new gdTreeItemProjectData("Extensions", "", mainEditor.games[i].get());
        int extensionsCount = game->GetUsedExtensions().size()-gd::PlatformExtension::GetBuiltinExtensionsNames().size();
        projectsTree->AppendItem(projectItem, _("Extensions") + (extensionsCount > 0 ? " (" + gd::String::From(extensionsCount) + ")" : ""),
                                 3 ,3, extensionsItemData);
    }

    projectsTree->ExpandAll();

    if ( !mainEditor.games.empty() )
        projectsTree->SetToolTip(_("Double click to set the project as the current project.\nDouble click on an item to edit it, or use right\nclick to display more options."));
    else
        projectsTree->SetToolTip(_("Create or open a project using the ribbon."));

    UpdateRibbonButtonsState();
    for (auto cb : refreshCallbacks) cb();
}

void ProjectManager::OnRefreshed(std::function<void()> cb)
{
	refreshCallbacks.push_back(cb);
}

/**
 * Complete the pointers with the game and the datas corresponding to the selected item.
 * Return false if fail, in which case pointers are invalid.
 */
bool ProjectManager::GetGameOfSelectedItem(gd::Project *& game, gdTreeItemProjectData *& data)
{
    if ( !selectedItem.IsOk() ) return false;

    data = dynamic_cast<gdTreeItemProjectData*>(projectsTree->GetItemData(selectedItem));
    if ( data == NULL )
        return false;

    game = dynamic_cast<gd::Project*>(data->GetGamePointer());
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

    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    gd::String prefix = "";
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
        for(std::size_t i = 0;i<mainEditor.games.size();++i)
        {
            if (mainEditor.games[i].get() == game)
            {
                projectsTree->SetItemBold(selectedItem, true);
                mainEditor.SetCurrentGame(i, /*refreshProjectManager=*/false);
            }
        }
    }
    else if ( data->GetString() == "Images")
    {
        EditResourcesOfProject(game);
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
    else if ( data->GetString() == "ExternalLayout")
    {
        wxCommandEvent unusedEvent;
        OnEditExternalLayoutSelected(unusedEvent);
    }
    else if ( data->GetString() == "Extensions")
    {
        EditExtensionsOfGame(*game);

        std::size_t extensionsCount = game->GetUsedExtensions().size()-gd::PlatformExtension::GetBuiltinExtensionsNames().size();
        projectsTree->SetItemText(selectedItem, _("Extensions") + (extensionsCount > 0 ? " (" + gd::String::From(extensionsCount) + ")" : ""));
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

    gdTreeItemProjectData * data = dynamic_cast<gdTreeItemProjectData*>(projectsTree->GetItemData(selectedItem));
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
    else if ( data->GetString() == "ExternalLayoutsRoot")
    {
        PopupMenu(&emptyExternalLayoutsContextMenu);
    }
    else if ( data->GetString() == "ExternalLayout")
    {
        PopupMenu(&externalLayoutContextMenu);
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

void ProjectManager::OnEditSourceFileSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    wxFileName filename(data->GetSecondString());
    filename.MakeAbsolute(wxFileName::FileName(game->GetProjectFile()).GetPath());

    EditSourceFile(game, filename.GetFullPath());
}

void ProjectManager::EditSourceFile(gd::Project * game, gd::String filename, size_t line)
{
    //Having a game associated with the editor is optional
    gd::Project * associatedGame = NULL;
    if ( game && game->HasSourceFile(filename))
        associatedGame = game;

    //As we're opening a "real" file, first check if it exists
    if ( !wxFileExists(filename) )
    {
        gd::LogWarning(_("Unable to open ")+filename+_(", the file does not exist"));
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

    //Launch an internal code editor otherwise
    if (mainEditor.GetEditorsManager().SelectCodeEditorFor(filename, line))
    	return;

    CodeEditor * editorScene = new CodeEditor(mainEditor.GetEditorsNotebook(), filename, associatedGame, mainEditor.GetMainFrameWrapper());
    mainEditor.GetEditorsManager().AddPage(editorScene, wxFileName(filename).GetFullName(), true);
    if ( line != gd::String::npos ) editorScene->SelectLine(line);
}

/**
 * Edit a scene
 */
void ProjectManager::OneditSceneMenuItemSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) )
    {
        gd::LogWarning(_("Choose a scene to edit in the project's manager"));
        return;
    }

    if ( !game->HasLayoutNamed(data->GetSecondString()) )
    {
        gd::LogWarning(_("Scene not found."));
        return;
    }

    EditLayout(*game, game->GetLayout(data->GetSecondString()));
}

void ProjectManager::EditLayout(gd::Project & project, gd::Layout & layout)
{
    if (mainEditor.GetEditorsManager().SelectEditorFor(layout))
    	return;

    LogFileManager::Get()->WriteToLogFile("Opened layout "+layout.GetName());

    EditorScene * editorScene = new EditorScene(mainEditor.GetEditorsNotebook(), project, layout, mainEditor.GetMainFrameWrapper());
    mainEditor.GetEditorsManager().AddPage(editorScene, layout.GetName(), true);
}

/**
 * Edit properties of a scene
 */
void ProjectManager::OneditScenePropMenuItemSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) )
    {
        gd::LogWarning(_("Choose a scene to edit in the project's manager"));
        return;
    }

    if ( !game->HasLayoutNamed(data->GetSecondString()) )
    {
        gd::LogWarning(_("Scene not found."));
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
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) )
    {
        gd::LogWarning(_("Choose a scene to edit in the project's manager"));
        return;
    }

    if ( !game->HasLayoutNamed(data->GetSecondString()) )
    {
        gd::LogWarning(_("Scene not found."));
        return;
    }
    gd::Layout & layout = game->GetLayout(data->GetSecondString());

    gd::ChooseVariableDialog dialog(this, layout.GetVariables(), /*editingOnly=*/true);
    dialog.SetAssociatedLayout(game, &layout);
    if ( dialog.ShowModal() == 1 )
    {
        for ( std::size_t j = 0; j < game->GetUsedPlatforms().size();++j)
            game->GetUsedPlatforms()[j]->GetChangesNotifier().OnVariablesModified(*game, &layout);
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

    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    if ( data->GetString() != "Scene" && data->GetString() != "Root" && data->GetString() != "ExternalEvents"&& data->GetString() != "ExternalLayout")
        projectsTree->EndEditLabel( selectedItem, true );
}

/**
 * End renaming something
 */
void ProjectManager::OnprojectsTreeEndLabelEdit(wxTreeEvent& event)
{
    if ( event.IsEditCancelled() ) return;

    selectedItem = event.GetItem();
    gd::String newName = event.GetLabel();

    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    if ( data->GetString() == "Root")
    {
  		if (newName.find_first_of("/\\?%*:|\"<>")!=gd::String::npos)
  		{
  			gd::LogMessage(_("You can not use this name, it contains invalid characters."));
  			event.Veto();
  			return;
  		}

        game->SetName( newName );
    }
    //Renaming a scene
    else if ( data->GetString() == "Scene")
    {
        if ( !game->HasLayoutNamed(data->GetSecondString()) )
        {
            gd::LogWarning(_("Scene not found."));
            return;
        }

        gd::Layout & layout = game->GetLayout(data->GetSecondString());

        if ( game->HasLayoutNamed(newName) )
        {
            gd::LogWarning( _( "Unable to rename: a scene has already the same name." ) );
            event.Veto();
            return;
        }

        projectsTree->SetItemData(selectedItem, new gdTreeItemProjectData("Scene", newName, game));

        layout.SetName(newName);

        //Updating editors
        int page = mainEditor.GetEditorsManager().GetPageOfEditorFor(layout);
        if (page != -1) mainEditor.GetEditorsManager().UpdatePageLabel(page, event.GetLabel());

        for ( std::size_t j = 0; j < game->GetUsedPlatforms().size();++j)
            game->GetUsedPlatforms()[j]->GetChangesNotifier().OnLayoutRenamed(*game, layout, data->GetSecondString());
    }
    //Renaming external events
    else if ( data->GetString() == "ExternalEvents")
    {
        if ( !game->HasExternalEventsNamed(itemTextBeforeEditing) )
        {
            gd::LogWarning(_("Unable to found events."));
            return;
        }

        if ( game->HasExternalEventsNamed(newName) )
        {
            gd::LogWarning( _( "Unable to rename: some external events have already the same name." ) );
            event.Veto();
            return;
        }

        projectsTree->SetItemData(selectedItem, new gdTreeItemProjectData("ExternalEvents", newName, game));

        gd::ExternalEvents & events = game->GetExternalEvents(itemTextBeforeEditing);
        events.SetName(newName);

        //Updating editors
        int page = mainEditor.GetEditorsManager().GetPageOfEditorFor(game->GetExternalEvents(newName));
        if (page != -1) mainEditor.GetEditorsManager().UpdatePageLabel(page, event.GetLabel());

        for ( std::size_t j = 0; j < game->GetUsedPlatforms().size();++j)
            game->GetUsedPlatforms()[j]->GetChangesNotifier().OnExternalEventsRenamed(*game, events, data->GetSecondString());
    }
    //Renaming external layout
    else if ( data->GetString() == "ExternalLayout")
    {
        if ( !game->HasExternalLayoutNamed(itemTextBeforeEditing) )
        {
            gd::LogWarning(_("Unable to found events."));
            return;
        }

        if ( game->HasExternalLayoutNamed(newName) )
        {
            gd::LogWarning( _( "Unable to rename: some external events have already the same name." ) );
            event.Veto();
            return;
        }

        projectsTree->SetItemData(selectedItem, new gdTreeItemProjectData("ExternalLayout", newName, game));

        gd::ExternalLayout & layout = game->GetExternalLayout(itemTextBeforeEditing);
        layout.SetName(newName);

        int page = mainEditor.GetEditorsManager().GetPageOfEditorFor(game->GetExternalLayout(newName));
        if (page != -1) mainEditor.GetEditorsManager().UpdatePageLabel(page, event.GetLabel());

        for ( std::size_t j = 0; j < game->GetUsedPlatforms().size();++j)
            game->GetUsedPlatforms()[j]->GetChangesNotifier().OnExternalLayoutRenamed(*game, layout, data->GetSecondString());
    }
}

/**
 * Add a scene from ribbon button
 */
void ProjectManager::OnRibbonAddSceneSelected(wxRibbonButtonBarEvent& event)
{
    if ( !mainEditor.CurrentGameIsValid() ) return;

    AddLayoutToProject(mainEditor.GetCurrentGame().get(), mainEditor.GetCurrentGame()->GetLayoutsCount());

    Refresh();
}

/**
 * Add a new scene to a game from Right Click
 */
void ProjectManager::OnaddSceneMenuItemSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    AddLayoutToProject(game, game->GetLayoutsCount());

    Refresh();
}

/**
 * Add a scene to a game
 */
void ProjectManager::AddLayoutToProject(gd::Project * project, std::size_t position)
{
    if ( !project ) return;

    //Finding a new, unique name for the scene
    gd::String newSceneName = _("New scene");
    int i = 2;
    while(project->HasLayoutNamed(newSceneName))
    {
        newSceneName = _("New scene") + " " + gd::String::From(i);
        ++i;
    }

    project->InsertNewLayout(newSceneName, position);

    if ( project->HasLayoutNamed(newSceneName) )
    {
        for ( std::size_t j = 0; j < project->GetUsedPlatforms().size();++j)
            project->GetUsedPlatforms()[j]->GetChangesNotifier().OnLayoutAdded(*project, project->GetLayout(newSceneName));
    }
    else
        gd::LogError(_("Unable to add the new layout!"));
}

/**
 * Edit images from ribbon button
 */
void ProjectManager::OnRibbonEditImagesSelected(wxRibbonButtonBarEvent& event)
{
    if ( !mainEditor.CurrentGameIsValid() ) return;

    EditResourcesOfProject(mainEditor.GetCurrentGame().get());
}

/**
 * Edit images of a game
 */
void ProjectManager::EditResourcesOfProject(gd::Project * project)
{
    if (mainEditor.GetEditorsManager().SelectResourceEditorFor(*project))
    	return;

    ResourcesEditor * editorImages = new ResourcesEditor(&mainEditor, *project, mainEditor.GetMainFrameWrapper(), true);
    mainEditor.GetEditorsManager().AddPage(editorImages, "", true);
}

/**
 * Delete a scene from a game
 */
void ProjectManager::OndeleteSceneMenuItemSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    gd::String sceneName = data->GetSecondString();
    if ( !game->HasLayoutNamed(sceneName) )
    {
        gd::LogWarning(_("Scene not found."));
        return;
    }

    gd::Layout & layout = game->GetLayout(sceneName);

    //Updating editors
    mainEditor.GetEditorsManager().CloseAllPagesFor(layout);

    //Updating tree
    projectsTree->Delete(selectedItem);

    //Ensure we're not destroying a scene with events being built
    wxBusyInfo * waitDialog = CodeCompiler::Get()->CompilationInProcess() ? new wxBusyInfo("Please wait for the internal compiler to finish its job...") : NULL;
    while ( CodeCompiler::Get()->CompilationInProcess() )
    {
        gd::SafeYield::Do();
    }
    if ( waitDialog ) delete waitDialog;

    game->RemoveLayout(sceneName);
    for ( std::size_t j = 0; j < game->GetUsedPlatforms().size();++j)
        game->GetUsedPlatforms()[j]->GetChangesNotifier().OnLayoutDeleted(*game, sceneName);
}

/**
 * Copy a scene
 */
void ProjectManager::OncopySceneMenuItemSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    if ( !game->HasLayoutNamed(data->GetSecondString()) )
    {
        gd::LogWarning(_("Scene not found."));
        return;
    }

    gd::Clipboard::Get()->SetLayout(&game->GetLayout(data->GetSecondString()));
}

/**
 * Cut a scene
 */
void ProjectManager::OncutSceneMenuItemSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    gd::String layoutName = data->GetSecondString();
    if ( !game->HasLayoutNamed(layoutName) )
    {
        gd::LogWarning(_("Scene not found."));
        return;
    }

    gd::Layout & layout = game->GetLayout(layoutName);

    gd::Clipboard::Get()->SetLayout(&layout);

    //Updating editors
    mainEditor.GetEditorsManager().CloseAllPagesFor(layout);

    //Updating tree
    projectsTree->Delete(selectedItem);

    //Ensure we're not destroying a scene with events being built
    wxBusyInfo * waitDialog = CodeCompiler::Get()->CompilationInProcess() ? new wxBusyInfo(_("Please wait while the internal compilation of events is finishing...")) : NULL;
    while (CodeCompiler::Get()->CompilationInProcess())
    {
        gd::SafeYield::Do();
    }
    if ( waitDialog ) delete waitDialog;

    game->RemoveLayout(layoutName);
    for ( std::size_t j = 0; j < game->GetUsedPlatforms().size();++j)
    game->GetUsedPlatforms()[j]->GetChangesNotifier().OnLayoutDeleted(*game, layoutName);
}

void ProjectManager::OnpasteSceneMenuItemSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    gd::Clipboard * clipboard = gd::Clipboard::Get();
    if (!clipboard->HasLayout()) return;

    gd::Layout & newLayout = *clipboard->GetLayout();

    //Finding a new, unique name for the layout
    gd::String newLayoutName = newLayout.GetName();
    int i = 1;
    while(game->HasLayoutNamed(newLayoutName))
    {
        newLayoutName = _("Copy of") + " " + newLayout.GetName() + (i == 1 ? "" : " "+gd::String::From(i));
        ++i;
    }

    newLayout.SetName(newLayoutName);
    game->InsertLayout(newLayout, game->GetLayoutPosition(data->GetSecondString()));
    for ( std::size_t j = 0; j < game->GetUsedPlatforms().size();++j)
    game->GetUsedPlatforms()[j]->GetChangesNotifier().OnLayoutAdded(*game, game->GetLayout(newLayoutName));

    //Insert in tree
    gdTreeItemProjectData * sceneItemData = new gdTreeItemProjectData("Scene", newLayoutName, game);
    if ( projectsTree->GetPrevSibling(selectedItem).IsOk() )
        projectsTree->InsertItem(projectsTree->GetItemParent(selectedItem), projectsTree->GetPrevSibling(selectedItem), newLayoutName, 1, 1, sceneItemData);
    else
        projectsTree->InsertItem(projectsTree->GetItemParent(selectedItem), 0, newLayoutName, 1, 1, sceneItemData);
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
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    gd::ChooseVariableDialog dialog(this, game->GetVariables(), /*editingOnly=*/true);
    dialog.SetAssociatedProject(game);
    if ( dialog.ShowModal() == 1 )
    {
        for ( std::size_t j = 0; j < game->GetUsedPlatforms().size();++j)
            game->GetUsedPlatforms()[j]->GetChangesNotifier().OnVariablesModified(*game);
    }
}

void ProjectManager::OnOpenProjectFolderSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    gd::ShowFolder(wxFileName::FileName(game->GetProjectFile()).GetPath());
}

/**
 * Edit the properties of a game
 */
void ProjectManager::OneditPropGameMenuItemSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    mainEditor.GetProjectPropertiesPanel()->SetProject(game);
    mainEditor.GetProjectPropertiesPanel()->SetAssociatedTreeCtrlProjectItem(projectsTree, selectedItem);
    mainEditor.GetProjectPropertiesPanel()->SetAssociatedProjectManager(this);
    mainEditor.GetAUIPaneManger()->GetPane("PP").Show(true);
    mainEditor.GetAUIPaneManger()->Update();
}

/**
 * Edit extensions used by a project
 */
void ProjectManager::EditExtensionsOfGame(gd::Project & project)
{
    gd::ProjectExtensionsDialog dialog(this, project);
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
 * TODO: Should be probably put in MainFrame, next to Open and Save.
 */
void ProjectManager::CloseGame(gd::Project * project)
{
	if (!project) return;

    //Closing all editors related to game
    mainEditor.GetEditorsManager().CloseAllPagesFor(*project);
    if ( mainEditor.GetProjectPropertiesPanel()->GetProject() == project ) mainEditor.GetProjectPropertiesPanel()->SetProject(NULL);

    //Ensure we're not destroying a scene with events being built
    wxBusyInfo * waitDialog = CodeCompiler::Get()->CompilationInProcess() ? new wxBusyInfo(_("Please wait, the internal compilation of events must be finished before continuing...")) : NULL;
    while ( CodeCompiler::Get()->CompilationInProcess() )
    {
        gd::SafeYield::Do();
    }
    if ( waitDialog ) delete waitDialog;

    for (std::size_t i = 0;i<mainEditor.games.size();++i)
    {
    	if ( mainEditor.games[i].get() == project)
            mainEditor.games.erase(mainEditor.games.begin()+i);
    }

    mainEditor.SetCurrentGame(mainEditor.games.size()-1, /*refreshProjectManager=*/false);
    mainEditor.UpdateOpenedProjectsLogFile();
    UpdateRibbonButtonsState();
}

/**
 * Click on Close Button in ribbon
 */
void ProjectManager::OnRibbonCloseSelected(wxRibbonButtonBarEvent& event)
{
    if ( !mainEditor.CurrentGameIsValid() ) return;

    if (mainEditor.GetCurrentGame()->IsDirty()
    	&& wxMessageBox( _( "Changes have been made to the project.\n\nAre you sure you want to close it\?" ), _( "Unsaved changes" ), wxYES_NO|wxNO_DEFAULT, this ) == wxNO )
        return;

    CloseGame(mainEditor.GetCurrentGame().get());

    Refresh();
}

/**
 * Right-click > Close
 */
void ProjectManager::OncloseGameBtSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    if (game->IsDirty()
    	&& wxMessageBox( _("Changes have been made to the project.\n\nAre you sure you want to close it\?"), _( "Unsaved changes" ), wxYES_NO|wxNO_DEFAULT, this ) == wxNO )
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
 * Edit anything selected in the tree
 */
void ProjectManager::OnRibbonEditSelectionSelected(wxRibbonButtonBarEvent& event)
{
    wxTreeEvent unusedEvent;
    OnprojectsTreeItemActivated(unusedEvent);
}

/**
 * Edit external events
 */
void ProjectManager::OnEditExternalEventsSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    if ( !game->HasExternalEventsNamed(data->GetSecondString()) )
    {
        gd::LogWarning(_("Unable to found external events."));
        return;
    }

    if (mainEditor.GetEditorsManager().SelectEditorFor(game->GetExternalEvents(data->GetSecondString())))
    	return;

    ExternalEventsEditor * editor = new ExternalEventsEditor(mainEditor.GetEditorsNotebook(), *game, game->GetExternalEvents(data->GetSecondString()), mainEditor.GetMainFrameWrapper());
    mainEditor.GetEditorsManager().AddPage(editor, data->GetSecondString(), true);
}

/**
* Add external events from right click
*/
void ProjectManager::OnAddExternalEventsSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
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
void ProjectManager::AddExternalEventsToGame(gd::Project * project)
{
    //Finding a new, unique name for the scene
    gd::String newName = _("External events");
    int i = 2;
    while(project->HasExternalEventsNamed(newName))
    {
        newName = _("External events") + " " + gd::String::From(i);
        ++i;
    }

    project->InsertNewExternalEvents(newName, project->GetExternalEventsCount());
    for ( std::size_t j = 0; j < project->GetUsedPlatforms().size();++j)
        project->GetUsedPlatforms()[j]->GetChangesNotifier().OnExternalEventsAdded(*project, project->GetExternalEvents(newName));
}

void ProjectManager::OnRenameExternalEventsSelected(wxCommandEvent& event)
{
    projectsTree->EditLabel( selectedItem );
}

void ProjectManager::OnDeleteExternalEventsSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    gd::String externalEventsName = data->GetSecondString();
    if ( !game->HasExternalEventsNamed(externalEventsName) )
    {
        gd::LogWarning(_("Unable to found events."));
        return;
    }

    //Updating editors
    mainEditor.GetEditorsManager().CloseAllPagesFor(game->GetExternalEvents(data->GetSecondString()));

    //Updating tree
    projectsTree->Delete(selectedItem);

    game->RemoveExternalEvents(externalEventsName);
    for ( std::size_t j = 0; j < game->GetUsedPlatforms().size();++j)
        game->GetUsedPlatforms()[j]->GetChangesNotifier().OnExternalEventsDeleted(*game, externalEventsName);
}

void ProjectManager::OnCopyExternalEventsSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    if ( !game->HasExternalEventsNamed(data->GetSecondString()) )
    {
        gd::LogWarning(_("Unable to found events."));
        return;
    }

    gd::Clipboard::Get()->SetExternalEvents(game->GetExternalEvents(data->GetSecondString()));
}

void ProjectManager::OnCutExternalEventsSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    gd::String externalEventsName = data->GetSecondString();
    if ( !game->HasExternalEventsNamed(externalEventsName) )
    {
        gd::LogWarning(_("Unable to found events."));
        return;
    }

    gd::Clipboard::Get()->SetExternalEvents(game->GetExternalEvents(data->GetSecondString()));

    //Updating editors
    mainEditor.GetEditorsManager().CloseAllPagesFor(game->GetExternalEvents(data->GetSecondString()));

    //Updating tree
    projectsTree->Delete(selectedItem);

    game->RemoveExternalEvents(externalEventsName);
    for ( std::size_t j = 0; j < game->GetUsedPlatforms().size();++j)
        game->GetUsedPlatforms()[j]->GetChangesNotifier().OnExternalEventsDeleted(*game, externalEventsName);
}

void ProjectManager::OnPasteExternalEventsSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;
    if (!Clipboard::Get()->HasExternalEvents()) return;

    gd::ExternalEvents newEvents = Clipboard::Get()->GetExternalEvents();

    //Finding a new, unique name for the events
    gd::String newName = newEvents.GetName();
    int i = 1;
    while(game->HasExternalEventsNamed(newName))
    {
        newName = _("Copy of") + " " + newEvents.GetName() + " " + ( i==1 ? "" : gd::String::From(i));
        ++i;
    }

    newEvents.SetName(newName);
    game->InsertExternalEvents(newEvents, game->GetExternalEventsPosition(data->GetSecondString()));
    for ( std::size_t j = 0; j < game->GetUsedPlatforms().size();++j)
        game->GetUsedPlatforms()[j]->GetChangesNotifier().OnExternalEventsAdded(*game, game->GetExternalEvents(newName));

    //Insert in tree
    gdTreeItemProjectData * eventsItemData = new gdTreeItemProjectData("ExternalEvents", newName, game);
    if ( projectsTree->GetPrevSibling(selectedItem).IsOk() )
        projectsTree->InsertItem(projectsTree->GetItemParent(selectedItem), projectsTree->GetPrevSibling(selectedItem), newName, 4, 4, eventsItemData);
    else
        projectsTree->InsertItem(projectsTree->GetItemParent(selectedItem), 0, newName, 4, 4, eventsItemData);
}

/**
 * Add external layout to a game
 */
void ProjectManager::AddExternalLayoutToGame(gd::Project * project)
{
    //Finding a new, unique name for the scene
    gd::String newName = _("External layout");
    int i = 2;
    while(project->HasExternalLayoutNamed(newName))
    {
        newName = _("External layout") + " " + gd::String::From(i);
        ++i;
    }

    project->InsertNewExternalLayout(newName, project->GetExternalLayoutsCount());
    for ( std::size_t j = 0; j < project->GetUsedPlatforms().size();++j)
        project->GetUsedPlatforms()[j]->GetChangesNotifier().OnExternalLayoutAdded(*project, project->GetExternalLayout(newName));
}

void ProjectManager::OnAddExternalLayoutSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    AddExternalLayoutToGame(game);

    Refresh();
}

/**
 * Add external layout from ribbon button
 */
void ProjectManager::OnRibbonAddExternalLayoutSelected(wxRibbonButtonBarEvent& event)
{
    if ( !mainEditor.CurrentGameIsValid() ) return;

    AddExternalLayoutToGame(mainEditor.GetCurrentGame().get());

    Refresh();
}

void ProjectManager::OnEditExternalLayoutSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    if ( !game->HasExternalLayoutNamed(data->GetSecondString()) )
    {
        gd::LogWarning(_("Unable to found external events."));
        return;
    }

    if (mainEditor.GetEditorsManager().SelectEditorFor(game->GetExternalLayout(data->GetSecondString())))
    	return;

    ExternalLayoutEditor * editor = new ExternalLayoutEditor(mainEditor.GetEditorsNotebook(), *game, game->GetExternalLayout(data->GetSecondString()), mainEditor.GetMainFrameWrapper());
    mainEditor.GetEditorsManager().AddPage(editor, data->GetSecondString(), true);
}

void ProjectManager::OnRenameExternalLayoutSelected(wxCommandEvent& event)
{
    projectsTree->EditLabel( selectedItem );
}

void ProjectManager::OnDeleteExternalLayoutSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    gd::String externalLayoutName = data->GetSecondString();
    if ( !game->HasExternalLayoutNamed(externalLayoutName) )
    {
        gd::LogWarning(_("Unable to found external layout."));
        return;
    }

    //Updating editors
    mainEditor.GetEditorsManager().CloseAllPagesFor(game->GetExternalLayout(data->GetSecondString()));

    //Updating tree
    projectsTree->Delete(selectedItem);

    game->RemoveExternalLayout(externalLayoutName);
    for ( std::size_t j = 0; j < game->GetUsedPlatforms().size();++j)
        game->GetUsedPlatforms()[j]->GetChangesNotifier().OnExternalLayoutDeleted(*game, externalLayoutName);
}

void ProjectManager::OnCopyExternalLayoutSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    if ( !game->HasExternalLayoutNamed(data->GetSecondString()) )
    {
        gd::LogWarning(_("Unable to found external layout."));
        return;
    }

    gd::Clipboard::Get()->SetExternalLayout(game->GetExternalLayout(data->GetSecondString()));
}

void ProjectManager::OnCutExternalLayoutSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    gd::String externalLayoutName = data->GetSecondString();
    if ( !game->HasExternalLayoutNamed(externalLayoutName) )
    {
        gd::LogWarning(_("Unable to found external layout."));
        return;
    }

    gd::Clipboard::Get()->SetExternalLayout(game->GetExternalLayout(data->GetSecondString()));

    //Updating editors
    mainEditor.GetEditorsManager().CloseAllPagesFor(game->GetExternalLayout(data->GetSecondString()));

    //Updating tree
    projectsTree->Delete(selectedItem);

    game->RemoveExternalLayout(externalLayoutName);
    for ( std::size_t j = 0; j < game->GetUsedPlatforms().size();++j)
        game->GetUsedPlatforms()[j]->GetChangesNotifier().OnExternalLayoutDeleted(*game, externalLayoutName);
}

void ProjectManager::OnPasteExternalLayoutSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;
    if (!Clipboard::Get()->HasExternalLayout()) return;

    gd::ExternalLayout newExternalLayout = Clipboard::Get()->GetExternalLayout();

    //Finding a new, unique name for the events
    gd::String newName = newExternalLayout.GetName();
    int i = 1;
    while(game->HasExternalLayoutNamed(newName))
    {
        newName = _("Copy of") + " " + newExternalLayout.GetName() + " " + (i==1 ? "" : gd::String::From(i));
        ++i;
    }

    newExternalLayout.SetName(newName);
    game->InsertExternalLayout(newExternalLayout, game->GetExternalLayoutPosition(data->GetSecondString()));
    for ( std::size_t j = 0; j < game->GetUsedPlatforms().size();++j)
        game->GetUsedPlatforms()[j]->GetChangesNotifier().OnExternalLayoutAdded(*game, game->GetExternalLayout(newName));

    //Insert in tree
    gdTreeItemProjectData * eventsItemData = new gdTreeItemProjectData("ExternalLayout", newName, game);
    if ( projectsTree->GetPrevSibling(selectedItem).IsOk() )
        projectsTree->InsertItem(projectsTree->GetItemParent(selectedItem), projectsTree->GetPrevSibling(selectedItem), newName, 6, 6, eventsItemData);
    else
        projectsTree->InsertItem(projectsTree->GetItemParent(selectedItem), 0, newName, 6, 6, eventsItemData);
}

void ProjectManager::OnAddCppSourceFileSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    wxFileDialog fileDialog( this, _("Choose one or more files to add"), "", "", _("All files|*.*"), wxFD_MULTIPLE );
    if ( fileDialog.ShowModal() != wxID_OK ) return;

    wxArrayString files;
    wxArrayString names;
    fileDialog.GetFilenames( names );
    fileDialog.GetPaths( files );

    for ( std::size_t i = 0; i < files.GetCount();i++ )
    {
    	gd::String language = AutodetectFileLanguage(files[i]);

	    wxFileName filename(files[i]); //Files are added with their paths relative to the project directory
	    filename.MakeRelativeTo(wxFileName::FileName(game->GetProjectFile()).GetPath());
	    game->InsertNewSourceFile(filename.GetFullPath(), language);
    }

    Refresh();
}

void ProjectManager::OnDeleteSourceFileSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    gd::String name = data->GetSecondString();
    if (!game->HasSourceFile(name))
    {
        gd::LogWarning(_("File not found"));
        return;
    }

    //Updating editors
    mainEditor.GetEditorsManager().CloseAllPagesFor(game->GetSourceFile(name));

    game->RemoveSourceFile(name);

    //Updating tree
    projectsTree->Delete(selectedItem);
}

gd::String ProjectManager::AutodetectFileLanguage(wxString filename)
{
	wxFileName file = wxFileName::FileName(filename);
    return file.GetExt().Lower() == "js" ? "Javascript" : "C++";
}

void ProjectManager::OnCreateNewCppFileSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    //Try to find the preferred extension:
    gd::String wildcard = "*.*";
    gd::String platformName = game->GetCurrentPlatform().GetName();
    if (platformName == "GDevelop C++ platform")
    	wildcard = "C++ source file (*.cpp)|*.cpp|C++ Header (*.h)|*.h";
    else if (platformName == "GDevelop JS platform")
    	wildcard = "Javascript source file (*.js)|*.js";

    wxFileDialog dialog(this, _( "Choose a file name" ), "", "", wildcard, wxFD_SAVE|wxFD_OVERWRITE_PROMPT);
    if ( dialog.ShowModal() == wxID_CANCEL )
        return;

    //TODO: Create file with some contents adapted to the chosen platform.
    //Create an empty file
    std::ofstream file;
    file.open(gd::String(dialog.GetPath()).ToLocale().c_str());
    file << "\n";
    file.close();

    gd::String language = AutodetectFileLanguage(dialog.GetPath());

    //Add it to the game source files.
    wxFileName filename(dialog.GetPath()); //Files are added with their paths relative to the project directory
    filename.MakeRelativeTo(wxFileName::FileName(game->GetProjectFile()).GetPath());
    game->InsertNewSourceFile(filename.GetFullPath(), language);

    Refresh();
}

/**
 * Display help
 */
void ProjectManager::OnRibbonHelpSelected(wxRibbonButtonBarEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation");
}

namespace {

wxTreeItemId GetPreviousSibling(wxTreeCtrl * ctrl, wxTreeItemId item)
{
    wxTreeItemId parent = ctrl->GetItemParent(item);
    wxTreeItemId previous;
    void * cookie;
    wxTreeItemId current = ctrl->GetFirstChild(parent, cookie);
    while (current.IsOk())
    {
        if ( current == item ) return previous;

        previous = current;
        current = ctrl->GetNextSibling(current);
    }

    wxTreeItemId notOk;
    return notOk;
}

}

void ProjectManager::OnSceneMoveUpSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    std::size_t index = game->GetLayoutPosition(data->GetSecondString());
    if ( index >= game->GetLayoutsCount() || index == 0 )
        return;

    //Swap the scenes
    game->SwapLayouts(index, index-1);

    //Update the tree
    wxString nextName = data->GetSecondString();
    wxTreeItemData* nextData = projectsTree->GetItemData(selectedItem);
    wxTreeItemId previous = GetPreviousSibling(projectsTree, selectedItem);
    wxString previousName = projectsTree->GetItemText(previous);
    wxTreeItemData* previousData = projectsTree->GetItemData(previous);

    projectsTree->SetItemText(previous, nextName);
    projectsTree->SetItemText(selectedItem, previousName);
    projectsTree->SetItemData(previous, nextData);
    projectsTree->SetItemData(selectedItem, previousData);
    projectsTree->SelectItem(previous);
}

void ProjectManager::OnSceneMoveDownSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    std::size_t index = game->GetLayoutPosition(data->GetSecondString());
    if ( index >= game->GetLayoutsCount()-1 )
        return;

    //Swap the scenes
    game->SwapLayouts(index, index+1);

    //Update the tree
    wxString previousName = data->GetSecondString();
    wxTreeItemData* previousData = projectsTree->GetItemData(selectedItem);
    wxTreeItemId next = projectsTree->GetNextSibling(selectedItem);
    wxString nextName = projectsTree->GetItemText(next);
    wxTreeItemData* nextData = projectsTree->GetItemData(next);

    projectsTree->SetItemText(next, previousName);
    projectsTree->SetItemText(selectedItem, nextName);
    projectsTree->SetItemData(next, previousData);
    projectsTree->SetItemData(selectedItem, nextData);
    projectsTree->SelectItem(next);
}

void ProjectManager::OnExternalLayoutMoveUpSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    std::size_t index = game->GetExternalLayoutPosition(data->GetSecondString());
    if ( index >= game->GetExternalLayoutsCount() || index == 0 )
        return;

    //Swap the scenes
    game->SwapExternalLayouts(index, index-1);

    //Update the tree
    wxString nextName = data->GetSecondString();
    wxTreeItemData* nextData = projectsTree->GetItemData(selectedItem);
    wxTreeItemId previous = GetPreviousSibling(projectsTree, selectedItem);
    wxString previousName = projectsTree->GetItemText(previous);
    wxTreeItemData* previousData = projectsTree->GetItemData(previous);

    projectsTree->SetItemText(previous, nextName);
    projectsTree->SetItemText(selectedItem, previousName);
    projectsTree->SetItemData(previous, nextData);
    projectsTree->SetItemData(selectedItem, previousData);
    projectsTree->SelectItem(previous);
}

void ProjectManager::OnExternalLayoutMoveDownSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    std::size_t index = game->GetExternalLayoutPosition(data->GetSecondString());
    if ( index >= game->GetExternalLayoutsCount()-1 )
        return;

    //Swap the scenes
    game->SwapExternalLayouts(index, index+1);

    //Update the tree
    wxString previousName = data->GetSecondString();
    wxTreeItemData* previousData = projectsTree->GetItemData(selectedItem);
    wxTreeItemId next = projectsTree->GetNextSibling(selectedItem);
    wxString nextName = projectsTree->GetItemText(next);
    wxTreeItemData* nextData = projectsTree->GetItemData(next);

    projectsTree->SetItemText(next, previousName);
    projectsTree->SetItemText(selectedItem, nextName);
    projectsTree->SetItemData(next, previousData);
    projectsTree->SetItemData(selectedItem, nextData);
    projectsTree->SelectItem(next);
}

void ProjectManager::OnExternalEventsMoveUpSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    std::size_t index = game->GetExternalEventsPosition(data->GetSecondString());
    if ( index >= game->GetExternalEventsCount() || index == 0 )
        return;

    //Swap the scenes
    game->SwapExternalEvents(index, index-1);

    //Update the tree
    wxString nextName = data->GetSecondString();
    wxTreeItemData* nextData = projectsTree->GetItemData(selectedItem);
    wxTreeItemId previous = GetPreviousSibling(projectsTree, selectedItem);
    wxString previousName = projectsTree->GetItemText(previous);
    wxTreeItemData* previousData = projectsTree->GetItemData(previous);

    projectsTree->SetItemText(previous, nextName);
    projectsTree->SetItemText(selectedItem, previousName);
    projectsTree->SetItemData(previous, nextData);
    projectsTree->SetItemData(selectedItem, previousData);
    projectsTree->SelectItem(previous);
}

void ProjectManager::OnExternalEventsMoveDownSelected(wxCommandEvent& event)
{
    gd::Project * game;
    gdTreeItemProjectData * data;
    if ( !GetGameOfSelectedItem(game, data) ) return;

    std::size_t index = game->GetExternalEventsPosition(data->GetSecondString());
    if ( index >= game->GetExternalEventsCount()-1 )
        return;

    //Swap the scenes
    game->SwapExternalEvents(index, index+1);

    //Update the tree
    wxString previousName = data->GetSecondString();
    wxTreeItemData* previousData = projectsTree->GetItemData(selectedItem);
    wxTreeItemId next = projectsTree->GetNextSibling(selectedItem);
    wxString nextName = projectsTree->GetItemText(next);
    wxTreeItemData* nextData = projectsTree->GetItemData(next);

    projectsTree->SetItemText(next, previousName);
    projectsTree->SetItemText(selectedItem, nextName);
    projectsTree->SetItemData(next, previousData);
    projectsTree->SetItemData(selectedItem, nextData);
    projectsTree->SelectItem(next);
}


void ProjectManager::OnprojectsTreeKeyDown(wxTreeEvent& event)
{
    wxCommandEvent useless;
    if(event.GetKeyEvent().GetModifiers() == wxMOD_CMD)
    {
        gdTreeItemProjectData * data = dynamic_cast<gdTreeItemProjectData*>(projectsTree->GetItemData(selectedItem));
        if ( data == NULL)
            return;

        switch(event.GetKeyCode()) {
            case 'C':
            {
                if ( data->GetString() == "Scene")
                    OncopySceneMenuItemSelected(useless);
                else if ( data->GetString() == "ExternalEvents")
                    OnCopyExternalEventsSelected(useless);
                else if ( data->GetString() == "ExternalLayout")
                    OnCopyExternalLayoutSelected(useless);
                break;
            }
            case 'X':
            {
                if ( data->GetString() == "Scene")
                    OncutSceneMenuItemSelected(useless);
                else if ( data->GetString() == "ExternalEvents")
                    OnCutExternalEventsSelected(useless);
                else if ( data->GetString() == "ExternalLayout")
                    OnCutExternalLayoutSelected(useless);
                break;
            }
            case 'V':
            {
                if ( data->GetString() == "Scene")
                    OnpasteSceneMenuItemSelected(useless);
                else if ( data->GetString() == "ExternalEvents")
                    OnPasteExternalEventsSelected(useless);
                else if ( data->GetString() == "ExternalLayout")
                    OnPasteExternalLayoutSelected(useless);
                break;
            }
            case WXK_UP:
            {
                if ( data->GetString() == "Scene")
                    OnSceneMoveUpSelected(useless);
                else if ( data->GetString() == "ExternalEvents")
                    OnExternalEventsMoveUpSelected(useless);
                else if ( data->GetString() == "ExternalLayout")
                    OnExternalLayoutMoveUpSelected(useless);
                break;
            }
            case WXK_DOWN:
            {
                if ( data->GetString() == "Scene")
                    OnSceneMoveDownSelected(useless);
                else if ( data->GetString() == "ExternalEvents")
                    OnExternalEventsMoveDownSelected(useless);
                else if ( data->GetString() == "ExternalLayout")
                    OnExternalLayoutMoveDownSelected(useless);
                break;
            }
            default:
                break;
        }
    }
    else
    {
        switch(event.GetKeyCode()) {
            case WXK_F2:
            {
                projectsTree->EditLabel( selectedItem );
                break;
            }
            case WXK_BACK:
            case WXK_DELETE:
            {
                gdTreeItemProjectData * data = dynamic_cast<gdTreeItemProjectData*>(projectsTree->GetItemData(selectedItem));
                if ( data == NULL)
                    return;

                if ( data->GetString() == "Scene")
                    OndeleteSceneMenuItemSelected(useless);
                else if ( data->GetString() == "ExternalEvents")
                    OnDeleteExternalEventsSelected(useless);
                else if ( data->GetString() == "ExternalLayout")
                    OnDeleteExternalLayoutSelected(useless);
                else if ( data->GetString() == "SourceFile")
                    OnDeleteSourceFileSelected(useless);

                break;
            }
            default:
                break;
        }
    }
}
