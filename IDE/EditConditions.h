#ifndef EDITCONDITIONS_H
#define EDITCONDITIONS_H

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
//(*Headers(EditConditions)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/menu.h>
#include <wx/statline.h>
#include <wx/radiobut.h>
#include <wx/panel.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

#include "GDL/Event.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"

class EditConditions: public wxDialog
{
	public:

		EditConditions(wxWindow* parent, Game & game_, Scene & scene_, const Event & event_);
		virtual ~EditConditions();

		Event eventEdited;

		//(*Declarations(EditConditions)
		wxButton* OkBt;
		wxRadioButton* OuRadio;
		wxMenuItem* MenuItem5;
		wxMenuItem* MenuItem4;
		wxListCtrl* ConditionsList;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxMenu ContextMenu;
		wxStaticLine* StaticLine2;
		wxRadioButton* EtRadio;
		wxStaticLine* StaticLine1;
		wxButton* AnnulerBt;
		wxButton* AideBt;
		//*)

        wxImageList *imageList;
        int id;

		void RefreshFromEvent();

	protected:

		//(*Identifiers(EditConditions)
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_RADIOBUTTON2;
		static const long ID_RADIOBUTTON1;
		static const long ID_LISTCTRL1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON3;
		static const long ID_BUTTON2;
		static const long idMenuEdit;
		static const long idMenuAdd;
		static const long idMenuDel;
		static const long idMenuCopy;
		static const long idMenuCouper;
		static const long idMenuPaste;
		//*)

	private:

		//(*Handlers(EditConditions)
		void OnOkBtClick(wxCommandEvent& event);
		void OnEtRadioSelect(wxCommandEvent& event);
		void OnOuRadioSelect(wxCommandEvent& event);
		void OnClose(wxCloseEvent& event);
		void OnConditionsListItemRClick(wxListEvent& event);
		void OnAddCondition(wxCommandEvent& event);
		void OnDelCondition(wxCommandEvent& event);
		void OnEditCondition(wxCommandEvent& event);
		void OnConditionsListItemActivated(wxListEvent& event);
		void OnMenuCopySelected(wxCommandEvent& event);
		void OnMenuCutSelected(wxCommandEvent& event);
		void OnMenuPasteSelected(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick1(wxCommandEvent& event);
		void OnConditionsListItemDoubleClicked(wxListEvent& event);
		void OnConditionsListKeyDown(wxListEvent& event);
		void OnKeyUp(wxKeyEvent& event);
		//*)

        Game & game;
        Scene & scene;

		DECLARE_EVENT_TABLE()
};

#endif
