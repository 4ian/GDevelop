/**
 * Game Develop
 *    Editor
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 * Debugger de l'éditeur.
 * Hérite de BaseDebugger, qui s'occupe
 * d'appeler UpdateGUI()
 */

#ifndef DEBUGGERGUI_H
#define DEBUGGERGUI_H

//(*Headers(DebuggerGUI)
#include <wx/listctrl.h>
#include <wx/treectrl.h>
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/panel.h>
#include <wx/bmpbuttn.h>
//*)
#include <wx/toolbar.h>

#include "GDL/RuntimeScene.h"
#include "GDL/Game.h"
#include "GDL/BaseDebugger.h"

#ifdef ___WXMSW___
#include <wx/msw/winundef.h>
#endif

class DebuggerGUI: public wxPanel, public BaseDebugger
{
	public:

		DebuggerGUI(wxWindow* parent, RuntimeScene & scene_);
		virtual ~DebuggerGUI();

		//(*Declarations(DebuggerGUI)
		wxPanel* toolbarPanel;
		wxListCtrl* generalList;
		wxNotebook* Notebook1;
		wxTreeCtrl* objectsTree;
		wxBitmapButton* deleteBt;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* objectName;
		wxListCtrl* objectList;
		wxPanel* Panel2;
		//*)
		wxToolBar * toolbar;

		void Pause();
		void Play();
	protected:

		//(*Identifiers(DebuggerGUI)
		static const long ID_PANEL3;
		static const long ID_LISTCTRL2;
		static const long ID_PANEL1;
		static const long ID_TREECTRL1;
		static const long ID_STATICTEXT1;
		static const long ID_STATICTEXT2;
		static const long ID_BITMAPBUTTON1;
		static const long ID_LISTCTRL1;
		static const long ID_PANEL2;
		static const long ID_NOTEBOOK1;
		//*)
        static const long ID_PLAYBT;
        static const long ID_PAUSEBT;
        static const long ID_STEPBT;
        static const long ID_CONSOLEBT;
        static const long ID_VARSCENEBT;
        static const long ID_VARGLOBALBT;
        static const long ID_ADDOBJBT;
        static const long ID_EXTLIST;

	private:

		//(*Handlers(DebuggerGUI)
		void OntoolbarPanelResize(wxSizeEvent& event);
		void OnobjectsTreeSelectionChanged(wxTreeEvent& event);
		void OnobjectsTreeItemActivated(wxTreeEvent& event);
		void OnobjectListItemActivated(wxListEvent& event);
		void OnBitmapButton1Click(wxCommandEvent& event);
		void OndeleteBtClick(wxCommandEvent& event);
		void OngeneralListItemActivated(wxListEvent& event);
		void OnResize(wxSizeEvent& event);
		//*)
		void UpdateGUI();
        void OnPlayBtClick( wxCommandEvent & event );
        void OnPauseBtClick( wxCommandEvent & event );
        void OnStepBtClick( wxCommandEvent & event );
        void OnConsoleBtClick( wxCommandEvent & event );
        void OnAddVarSceneBtClick( wxCommandEvent & event );
        void OnAddVarGlobalBtClick( wxCommandEvent & event );
        void OnAddObjBtClick( wxCommandEvent & event );
        void OnExtensionListItemActivated(wxListEvent& event);
        void UpdateListCtrlColumnsWidth();

        void RecreateListForObject(const ObjSPtr & object);

		RuntimeScene & scene;

		map < boost::weak_ptr<Object>, pair<string, wxTreeItemId> > objectsInTree;
		map < string, wxTreeItemId > initialObjects;
		bool mustRecreateTree;

		std::vector<wxListCtrl*> extensionsListCtrls; ///< Contains wxListCtrl used to display properties of each extensions.

		unsigned int baseItemCount;
		unsigned int generalBaseItemCount;
		unsigned int generalBaseAndVariablesItemCount;
		bool doMAJ;
		bool objectChanged;

		wxFont font;

		DECLARE_EVENT_TABLE()
};

#endif
