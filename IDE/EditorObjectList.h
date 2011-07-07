#ifndef EDITOROBJECTLIST_H
#define EDITOROBJECTLIST_H

//(*Headers(EditorObjectList)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/panel.h>
//*)
#include <wx/toolbar.h>
#include <wx/image.h>
#include <string>
#include <vector>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/gallery.h>
#include <wx/ribbon/toolbar.h>

#include "GDL/Object.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/MainEditorCommand.h"

class EditorObjectList: public wxPanel
{
	public:

		EditorObjectList(wxWindow* parent, Game & game_, vector < boost::shared_ptr<Object> > * objects_, MainEditorCommand & mainEditorCommand, Scene * scene_);
		virtual ~EditorObjectList();

		//(*Declarations(EditorObjectList)
		wxMenuItem* renameAutomatism;
		wxMenuItem* addAutomatismItem;
		wxPanel* toolbarPanel;
		wxMenu* automatismsMenu;
		wxMenuItem* MenuItem2;
		wxMenuItem* MenuItem1;
		wxTreeCtrl* objectsList;
		wxMenuItem* deleteAutomatismItem;
		wxMenuItem* copyMenuI;
		wxMenu ContextMenu;
		wxMenuItem* moveUpMenuI;
		wxMenuItem* MenuItem3;
		wxMenu rootContextMenu;
		wxMenuItem* moveDownMenuI;
		wxMenuItem* cutMenuI;
		wxMenu multipleContextMenu;
		wxMenuItem* pasteMenuI;
		//*)

        static void CreateRibbonPage(wxRibbonPage * page);
        void ConnectEvents();

		void Refresh();

		std::vector < boost::shared_ptr<Object> > * objects;

	protected:

		//(*Identifiers(EditorObjectList)
		static const long ID_PANEL4;
		static const long ID_TREECTRL1;
		static const long idMenuModObj;
		static const long idMenuModVar;
		static const long ID_MENUITEM2;
		static const long ID_MENUITEM5;
		static const long ID_MENUITEM3;
		static const long ID_MENUITEM1;
		static const long idMenuModName;
		static const long idMenuAddObj;
		static const long idMenuDelObj;
		static const long idMoveUp;
		static const long idMoveDown;
		static const long idMenuCopy;
		static const long idMenuCut;
		static const long idMenuPaste;
		static const long ID_MENUITEM4;
		static const long ID_MENUITEM6;
		static const long ID_MENUITEM7;
		//*)
		static const long ID_BITMAPBUTTON1;
		static const long ID_BITMAPBUTTON2;
		static const long ID_BITMAPBUTTON3;
		static const long ID_BITMAPBUTTON6;
		static const long ID_BITMAPBUTTON7;
        static const long idRibbonAdd;
        static const long idRibbonDel;
        static const long idRibbonUp;
        static const long idRibbonDown;
        static const long idRibbonSearch;
        static const long idRibbonModProp;
        static const long idRibbonModName;
        static const long idRibbonCopy;
        static const long idRibbonCut;
        static const long idRibbonPaste;
        static const long idRibbonHelp;
        static const long idRibbonRefresh;

	private:

		//(*Handlers(EditorObjectList)
		void OneditMenuISelected(wxCommandEvent& event);
		void OneditNameMenuISelected(wxCommandEvent& event);
		void OnaddObjMenuISelected(wxCommandEvent& event);
		void OndelObjMenuISelected(wxCommandEvent& event);
		void OntoolbarPanelResize(wxSizeEvent& event);
		void OnobjectsListSelectionChanged(wxTreeEvent& event);
		void OnobjectsListItemActivated(wxTreeEvent& event);
		void OnobjectsListBeginLabelEdit(wxTreeEvent& event);
		void OnobjectsListEndLabelEdit(wxTreeEvent& event);
		void OnobjectsListItemMenu(wxTreeEvent& event);
		void OnCopySelected(wxCommandEvent& event);
		void OnMoveDownSelected(wxCommandEvent& event);
		void OnMoveUpSelected(wxCommandEvent& event);
		void OnPasteSelected(wxCommandEvent& event);
		void OnCutSelected(wxCommandEvent& event);
		void OnSetFocus(wxFocusEvent& event);
		void OnobjectsListBeginDrag(wxTreeEvent& event);
		void OneditVarMenuISelected(wxCommandEvent& event);
		void OnobjectsListItemRightClick(wxTreeEvent& event);
		void OnaddAutomatismItemSelected(wxCommandEvent& event);
		void OndeleteAutomatismItemSelected(wxCommandEvent& event);
		void OnrenameAutomatismSelected(wxCommandEvent& event);
		void OnobjectsListKeyDown(wxTreeEvent& event);
		//*)
		void OnAutomatismSelected(wxCommandEvent & event);
		void OnRefreshBtClick(wxCommandEvent& event);
		void OnChercherBtClick(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void OnMoreOptions(wxCommandEvent& event);
		void DisableAll();
		void EnableAll();
		void CreateToolbar();
		void RemoveSharedDatasIfNecessary(std::string automatismType);
		void CreateSharedDatasIfNecessary(boost::shared_ptr<Automatism> automatism);
		bool CheckObjectName(std::string name);

		wxImageList* imageList;
		wxImageList* objectsImagesList;
        wxToolBar * toolbar;

		Game & game;
		Scene * scene; ///< Scene edited. Can be NULL

		MainEditorCommand & mainEditorCommand;

        vector < std::pair<long, std::string> > idForAutomatism;

        wxTreeItemId item; ///< Selected item in the list
        string ancienNom;

		DECLARE_EVENT_TABLE()
};

#endif
