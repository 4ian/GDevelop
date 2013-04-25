#ifndef CODEEDITOR_H
#define CODEEDITOR_H

//(*Headers(CodeEditor)
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/stedit/stedit.h>
#include <wx/panel.h>
//*)
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/toolbar.h>
#include <string>
#include <vector>
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
namespace gd { class Project; }
namespace gd { class Layout; }

class CodeEditor: public wxPanel
{
	public:

		CodeEditor(wxWindow* parent, std::string filename, gd::Project * game_, const gd::MainFrameWrapper & mainFrameWrapper_);
		virtual ~CodeEditor();

		//(*Declarations(CodeEditor)
		wxMenuItem* MenuItem5;
		wxMenuItem* MenuItem2;
		wxMenuItem* MenuItem1;
		wxMenuItem* MenuItem4;
		wxMenuItem* MenuItem3;
		wxMenu contextMenu;
		wxSTEditor* textEditor;
		//*)

		std::string filename; ///< File being edited.
		gd::Project * game; ///< Game associated with the file. Can be NULL.

        /**
         * Change selected line
         */
		void SelectLine(size_t line);

		/**
		 * Ask the user for closing the editor, if needed.
		 * @return true if editor must be closed
		 */
		bool QueryClose();

		static void CreateRibbonPage(wxRibbonPage * page);
		void ConnectEvents();

        /**
         * Can be called by parent so as to refresh ribbon for this editor.
         */
        void ForceRefreshRibbonAndConnect();

	protected:

		//(*Identifiers(CodeEditor)
		static const long ID_CUSTOM1;
		static const long ID_MENUITEM1;
		static const long ID_MENUITEM2;
		static const long ID_MENUITEM3;
		static const long ID_MENUITEM4;
		static const long ID_MENUITEM5;
		//*)
		static const long idRibbonSave;
		static const long idRibbonCopy;
		static const long idRibbonCut;
		static const long idRibbonPaste;
		static const long idRibbonUndo;
		static const long idRibbonRedo;
		static const long idRibbonOptions;
		static const long idRibbonFindReplace;
        static const long idRibbonGotoLine;
		static const long idRibbonDocGDL;
		static const long idRibbonDocSFML;
		static const long idRibbonDocWxWidgets;
		static const long idRibbonDocBoost;

	private:

		//(*Handlers(CodeEditor)
		void OntextEditorRightUp(wxMouseEvent& event);
		void OnMenuCopySelected(wxCommandEvent& event);
		void OnMenuCutSelected(wxCommandEvent& event);
		void OnMenuPasteSelected(wxCommandEvent& event);
		void OnResize(wxSizeEvent& event);
		void OnMenuUndoSelected(wxCommandEvent& event);
		void OnMenuRedoSelected(wxCommandEvent& event);
		//*)
		void OnSaveSelected(wxRibbonButtonBarEvent& evt);
		void UpdateTextCtrl(wxStyledTextEvent& event);
		void OnCharAdded (wxStyledTextEvent &event);
		void OnOptionsSelected(wxRibbonButtonBarEvent &event);
		void OnFindReplaceSelected(wxRibbonButtonBarEvent &event);
		void OnDocGDLSelected(wxRibbonButtonBarEvent &event);
		void OnDocSFMLSelected(wxRibbonButtonBarEvent &event);
		void OnDocWxWidgetsSelected(wxRibbonButtonBarEvent &event);
		void OnDocBoostSelected(wxRibbonButtonBarEvent &event);
		void OnGotoLineSelected(wxRibbonButtonBarEvent &event);
		void OpenLink(wxString link);

		gd::MainFrameWrapper mainFrameWrapper;

        char lastCharEntered;
        long lastCharEnteredPos;

		DECLARE_EVENT_TABLE()
};

#endif

