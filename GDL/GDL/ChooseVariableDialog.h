#if defined(GDE)

#ifndef CHOIXVARIABLEDIALOG_H
#define CHOIXVARIABLEDIALOG_H

//(*Headers(ChooseVariableDialog)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/toolbar.h>
#include <string>
#include "GDL/ListVariable.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

class GD_API ChooseVariableDialog: public wxDialog
{
	public:

		ChooseVariableDialog(wxWindow* parent, ListVariable & variables_);
		virtual ~ChooseVariableDialog();

        std::string selectedVariable;

		ListVariable variables;

		//(*Declarations(ChooseVariableDialog)
		wxButton* helpBt;
		wxPanel* toolbarPanel;
		wxStaticBitmap* StaticBitmap1;
		wxListCtrl* variablesList;
		wxButton* cancelBt;
		wxStaticLine* StaticLine2;
		wxStaticLine* StaticLine1;
		wxPanel* Panel2;
		wxStaticText* StaticText4;
		wxButton* okBt;
		//*)

	protected:

		//(*Identifiers(ChooseVariableDialog)
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT6;
		static const long ID_PANEL2;
		static const long ID_STATICLINE1;
		static const long ID_PANEL1;
		static const long ID_LISTCTRL1;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON1;
		static const long ID_BUTTON3;
		static const long ID_BUTTON2;
		//*)
		static const long idAddVar;
		static const long idEditVar;
		static const long idDelVar;
		static const long idMoveUpVar;
		static const long idRenameVar;
		static const long idMoveDownVar;
		static const long ID_Help;

	private:

		//(*Handlers(ChooseVariableDialog)
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OnhelpBtClick(wxCommandEvent& event);
		void OntoolbarPanelResize(wxSizeEvent& event);
		void OnvariablesListItemActivated(wxListEvent& event);
		void OnvariablesListItemSelect(wxListEvent& event);
		void OnvariablesListKeyDown(wxListEvent& event);
		//*)
		void OnAddVarSelected(wxCommandEvent& event);
		void OnDelVarSelected(wxCommandEvent& event);
		void OnEditVarSelected(wxCommandEvent& event);
		void OnRenameVarSelected(wxCommandEvent& event);
		void OnMoveUpVarSelected(wxCommandEvent& event);
		void OnMoveDownVarSelected(wxCommandEvent& event);
		void Refresh();

        wxToolBar * toolbar;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
