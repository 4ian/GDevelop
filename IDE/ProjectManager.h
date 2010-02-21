#ifndef PROJECTMANAGER_H
#define PROJECTMANAGER_H

//(*Headers(ProjectManager)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/panel.h>
//*)
#include <string>
class Game_Develop_EditorFrame;

class ProjectManager: public wxPanel
{
	public:

		ProjectManager(wxWindow* parent, Game_Develop_EditorFrame & mainEditor_);
		virtual ~ProjectManager();

		//(*Declarations(ProjectManager)
		wxMenuItem* MenuItem1;
		wxTreeCtrl* projectsTree;
		wxMenuItem* cutSceneMenuItem;
		wxMenuItem* modVarSceneMenuI;
		wxMenu scenesContextMenu;
		wxMenuItem* copySceneMenuItem;
		wxMenu sceneContextMenu;
		wxMenuItem* pasteSceneMenuItem;
		wxMenuItem* editScenePropMenuItem;
		//*)

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
		//*)

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
		//*)

        wxFont boldFont;
        wxTreeItemId selectedItem;
        std::string itemTextBeforeEditing;

		DECLARE_EVENT_TABLE()
};

#endif
