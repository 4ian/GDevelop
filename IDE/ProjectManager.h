#ifndef PROJECTMANAGER_H
#define PROJECTMANAGER_H

//(*Headers(ProjectManager)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/panel.h>
//*)
#include <string>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/gallery.h>
#include <wx/ribbon/toolbar.h>
class Game_Develop_EditorFrame;
class Game;
class RuntimeGame;
class gdTreeItemGameData;

class ProjectManager: public wxPanel
{
	public:

		ProjectManager(wxWindow* parent, Game_Develop_EditorFrame & mainEditor_);
		virtual ~ProjectManager();

		//(*Declarations(ProjectManager)
		wxMenuItem* MenuItem8;
		wxMenuItem* MenuItem7;
		wxMenuItem* MenuItem5;
		wxMenuItem* MenuItem2;
		wxMenuItem* MenuItem1;
		wxMenuItem* MenuItem4;
		wxMenuItem* editNameGameMenuItem;
		wxMenuItem* MenuItem11;
		wxTreeCtrl* projectsTree;
		wxMenuItem* cutSceneMenuItem;
		wxMenuItem* MenuItem13;
		wxMenuItem* modVarSceneMenuI;
		wxMenuItem* MenuItem10;
		wxMenuItem* MenuItem12;
		wxMenu externalEventsContextMenu;
		wxMenuItem* MenuItem3;
		wxMenu sourceFilesContextMenu;
		wxMenu sourceFileContextMenu;
		wxMenu scenesContextMenu;
		wxMenuItem* copySceneMenuItem;
		wxMenuItem* MenuItem6;
		wxMenu gameContextMenu;
		wxMenu emptyExternalEventsContextMenu;
		wxMenu sceneContextMenu;
		wxMenuItem* editPropGameMenuItem;
		wxMenuItem* pasteSceneMenuItem;
		wxMenuItem* editGblVarMenuItem;
		wxMenuItem* MenuItem9;
		wxMenuItem* closeGameBt;
		wxMenuItem* editScenePropMenuItem;
		//*)

        static void CreateRibbonPage(wxRibbonPage * page);
        void ConnectEvents();

		Game_Develop_EditorFrame & mainEditor;
        void Refresh();

	protected:

		//(*Identifiers(ProjectManager)
		static const long ID_TREECTRL1;
		static const long idMenuEditScene;
		static const long idMenuEditPropScene;
		static const long idMenuModVar;
		static const long idMenuModNameScene;
		static const long idMenuAddScene;
		static const long idMenuDelScene;
		static const long idMenuCopyScene;
		static const long idMenuCutScene;
		static const long idMenuPasteScene;
		static const long ID_MENUITEM1;
		static const long ID_MENUITEM2;
		static const long ID_MENUITEM3;
		static const long ID_MENUITEM4;
		static const long ID_MENUITEM5;
		static const long ID_MENUITEM6;
		static const long ID_MENUITEM7;
		static const long ID_MENUITEM13;
		static const long ID_MENUITEM8;
		static const long ID_MENUITEM9;
		static const long ID_MENUITEM10;
		static const long ID_MENUITEM11;
		static const long ID_MENUITEM12;
		static const long ID_MENUITEM14;
		static const long ID_MENUITEM15;
		static const long ID_MENUITEM16;
		static const long ID_MENUITEM17;
		//*)
        static const long idRibbonNew;
        static const long idRibbonOpen;
        static const long idRibbonSave;
        static const long idRibbonSaveAll;
        static const long idRibbonClose;
        static const long idRibbonExtensions;
        static const long idRibbonAddScene;
        static const long idRibbonEditScene;
        static const long idRibbonEditImages;
        static const long idRibbonCompil;
        static const long idRibbonAddExternalEvents;;
        static const long idRibbonEditExternalEvents;

	private:

		//(*Handlers(ProjectManager)
		void OnprojectsTreeItemActivated(wxTreeEvent& event);
		void OnprojectsTreeItemRightClick(wxTreeEvent& event);
		void OneditSceneMenuItemSelected(wxCommandEvent& event);
		void OneditScenePropMenuItemSelected(wxCommandEvent& event);
		void OnmodVarSceneMenuISelected(wxCommandEvent& event);
		void OneditSceneNameMenuItemSelected(wxCommandEvent& event);
		void OnprojectsTreeBeginLabelEdit(wxTreeEvent& event);
		void OnprojectsTreeEndLabelEdit(wxTreeEvent& event);
		void OnaddSceneMenuItemSelected(wxCommandEvent& event);
		void OndeleteSceneMenuItemSelected(wxCommandEvent& event);
		void OncopySceneMenuItemSelected(wxCommandEvent& event);
		void OncutSceneMenuItemSelected(wxCommandEvent& event);
		void OnpasteSceneMenuItemSelected(wxCommandEvent& event);
		void OneditNameGameMenuItemSelected(wxCommandEvent& event);
		void OneditGblVarMenuItemSelected(wxCommandEvent& event);
		void OneditPropGameMenuItemSelected(wxCommandEvent& event);
		void OncloseGameBtSelected(wxCommandEvent& event);
		void OnprojectsTreeSelectionChanged(wxTreeEvent& event);
		void OnEditExternalEventsSelected(wxCommandEvent& event);
		void OnAddExternalEventsSelected(wxCommandEvent& event);
		void OnRenameExternalEventsSelected(wxCommandEvent& event);
		void OnDeleteExternalEventsSelected(wxCommandEvent& event);
		void OnCopyExternalEventsSelected(wxCommandEvent& event);
		void OnCutExternalEventsSelected(wxCommandEvent& event);
		void OnPasteExternalEventsSelected(wxCommandEvent& event);
		void OnAddCppSourceFileSelected(wxCommandEvent& event);
		void OnDeleteSourceFileSelected(wxCommandEvent& event);
		void OnEditSourceFileSelected(wxCommandEvent& event);
		//*)

		bool GetGameOfSelectedItem(RuntimeGame *& game, gdTreeItemGameData *& data);

		void OnRibbonExtensionsSelected(wxRibbonButtonBarEvent& event);
		void EditExtensionsOfGame(Game * game);
		void OnRibbonCloseSelected(wxRibbonButtonBarEvent& event);
		void CloseGame(Game * game);
		void OnRibbonAddSceneSelected(wxRibbonButtonBarEvent& event);
		void AddSceneToGame(Game * game);
		void OnRibbonEditImagesSelected(wxRibbonButtonBarEvent& event);
		void EditImagesOfGame(Game * game);
		void OnRibbonEditSceneSelected(wxRibbonButtonBarEvent& event);
		void OnRibbonAddExternalEventsSelected(wxRibbonButtonBarEvent& event);
		void OnRibbonEditExternalEventsSelected(wxRibbonButtonBarEvent& event);
		void AddExternalEventsToGame(Game * game);

        wxTreeItemId selectedItem;
        std::string itemTextBeforeEditing;

        static const unsigned int gameMaxCharDisplayedInEditor = 15;

		DECLARE_EVENT_TABLE()
};

#endif
