#ifndef EDITOROBJETSGROUPS_H
#define EDITOROBJETSGROUPS_H

//(*Headers(EditorObjetsGroups)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/panel.h>
//*)
#include <wx/toolbar.h>
#include <string>
#include <vector>
#include "GDL/needReload.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include "GDL/ObjectGroup.h"
#include "GDL/Object.h"
#include "GDL/Game.h"
#include "GDL/MainEditorCommand.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

using namespace std;

class EditorObjetsGroups: public wxPanel
{
	public:

		EditorObjetsGroups(wxWindow* parent, Game & game_, Scene * scene_, vector < ObjectGroup > * objectsGroups_, MainEditorCommand & mainEditorCommand);
		virtual ~EditorObjetsGroups();

		//(*Declarations(EditorObjetsGroups)
		wxMenuItem* MenuItem2;
		wxMenuItem* MenuItem4;
		wxMenu ContextMenu;
		wxPanel* Panel3;
		wxMenuItem* MenuItem3;
		wxTreeCtrl* ObjetsGroupsList;
		//*)
		wxTreeItemId itemSelected;

        static void CreateRibbonPage(wxRibbonPage * page);
        void ConnectEvents();

        void ChangeScenePtr(Scene * newScenePtr)
        {
            assert(newScenePtr != NULL);
            scene = newScenePtr;
        };

        void ChangeGroupsPtr(vector < ObjectGroup > * newGroupsPtr)
        {
            assert(newGroupsPtr != NULL);
            objectsGroups = newGroupsPtr;
        };

		void Refresh();

	protected:

		//(*Identifiers(EditorObjetsGroups)
		static const long ID_PANEL4;
		static const long ID_TREECTRL1;
		static const long IdGroupEdit;
		static const long idModName;
		static const long idAddGroup;
		static const long idDelGroup;
		//*)
		static const long ID_Refresh;
		static const long ID_AddGroup;
		static const long ID_DelGroup;
		static const long ID_EditGroup;
		static const long ID_Help;
		static const long idRibbonAdd;
		static const long idRibbonDel;
		static const long idRibbonEdit;
		static const long idRibbonModName;
		static const long idRibbonHelp;

	private:

		//(*Handlers(EditorObjetsGroups)
		void OnPanel3Resize(wxSizeEvent& event);
		void OnTreeCtrl1ItemRightClick(wxTreeEvent& event);
		void OnEditGroupSelected(wxCommandEvent& event);
		void OnAddGroupSelected(wxCommandEvent& event);
		void OnDelGroupSelected(wxCommandEvent& event);
		void OnObjetsGroupsListItemActivated(wxTreeEvent& event);
		void OnObjetsGroupsListBeginLabelEdit(wxTreeEvent& event);
		void OnObjetsGroupsListEndLabelEdit(wxTreeEvent& event);
		void OnModNameSelected(wxCommandEvent& event);
		void OnObjetsGroupsListItemDoubleClicked(wxTreeEvent& event);
		void OnSetFocus(wxFocusEvent& event);
		//*)
		void OnHelp(wxCommandEvent& event);
		void DisableAll();
		void EnableAll();

		string ancienNom;

        wxToolBar * toolbar;

        /**
         * Reference to game containing the datas to edit
         */
		Game & game;

        /**
         * Pointer to scene containing the datas to edit
         * Use a pointer instead of a reference because scene pointer/reference can change
         * @see EditorScene
         */
		Scene * scene;

		vector < ObjectGroup > * objectsGroups;

		MainEditorCommand & mainEditorCommand;

		DECLARE_EVENT_TABLE()
};

#endif
