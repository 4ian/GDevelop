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
#include "GDL/MainEditorCommand.h"

class EditorObjectList: public wxPanel
{
	public:

		EditorObjectList(wxWindow* parent, Game & game_, vector < boost::shared_ptr<Object> > * objects_, MainEditorCommand & mainEditorCommand, bool * wasModifiedCallback_);
		virtual ~EditorObjectList();

		//(*Declarations(EditorObjectList)
		wxPanel* toolbarPanel;
		wxTreeCtrl* objectsList;
		wxMenuItem* copyMenuI;
		wxMenu ContextMenu;
		wxMenuItem* moveUpMenuI;
		wxMenuItem* moveDownMenuI;
		wxMenuItem* cutMenuI;
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
		static const long idMenuModName;
		static const long idMenuAddObj;
		static const long idMenuDelObj;
		static const long idMoveUp;
		static const long idMoveDown;
		static const long idMenuCopy;
		static const long idMenuCut;
		static const long idMenuPaste;
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
		//*)
		void OnRefreshBtClick(wxCommandEvent& event);
		void OnChercherBtClick(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void OnMoreOptions(wxCommandEvent& event);
		void DisableAll();
		void EnableAll();
		void CreateToolbar();

		wxImageList* imageList;
		wxImageList* objectsImagesList;
        wxToolBar * toolbar;

		Game & game;

		MainEditorCommand & mainEditorCommand;
		bool * wasModifiedCallback; ///< Set this to true when objects are modified. Can be NULL

        //Item sélectionné
        wxTreeItemId item;
        string ancienNom;

		DECLARE_EVENT_TABLE()
};

#endif
