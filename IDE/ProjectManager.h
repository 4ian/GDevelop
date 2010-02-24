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

class ProjectManager: public wxPanel
{
	public:

		ProjectManager(wxWindow* parent, Game_Develop_EditorFrame & mainEditor_);
		virtual ~ProjectManager();

		//(*Declarations(ProjectManager)
		wxMenuItem* MenuItem1;
		wxMenuItem* editNameGameMenuItem;
		wxTreeCtrl* projectsTree;
		wxMenuItem* cutSceneMenuItem;
		wxMenuItem* modVarSceneMenuI;
		wxMenu scenesContextMenu;
		wxMenuItem* copySceneMenuItem;
		wxMenu gameContextMenu;
		wxMenu sceneContextMenu;
		wxMenuItem* editPropGameMenuItem;
		wxMenuItem* pasteSceneMenuItem;
		wxMenuItem* editGblVarMenuItem;
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
		//*)
        static const long idRibbonNew;
        static const long idRibbonOpen;
        static const long idRibbonSave;
        static const long idRibbonClose;
        static const long idRibbonExtensions;
        static const long idRibbonAddScene;
        static const long idRibbonEditScene;
        static const long idRibbonEditImages;
        static const long idRibbonCompil;

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
		//*)

		void OnRibbonExtensionsSelected(wxRibbonButtonBarEvent& event);
		void EditExtensionsOfGame(Game * game);
		void OnRibbonCloseSelected(wxRibbonButtonBarEvent& event);
		void CloseGame(Game * game);
		void OnRibbonAddSceneSelected(wxRibbonButtonBarEvent& event);
		void AddSceneToGame(Game * game);
		void OnRibbonEditImagesSelected(wxRibbonButtonBarEvent& event);
		void EditImagesOfGame(Game * game);
		void OnRibbonEditSceneSelected(wxRibbonButtonBarEvent& event);

        wxTreeItemId selectedItem;
        std::string itemTextBeforeEditing;

        static const unsigned int gameMaxCharDisplayedInEditor = 15;

		DECLARE_EVENT_TABLE()
};

#endif
