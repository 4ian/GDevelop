#ifndef EDITACTIONS_H
#define EDITACTIONS_H

//(*Headers(EditActions)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/menu.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/imaglist.h>

#include "GDL/Event.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"

class EditActions: public wxDialog
{
	public:

		EditActions(wxWindow* parent, Game & game_, Scene & scene_, const Event & event_);
		virtual ~EditActions();
        void RefreshFromEvent();

		Event eventEdited;

		//(*Declarations(EditActions)
		wxButton* OkBt;
		wxListCtrl* ActionsList;
		wxMenuItem* MenuItem2;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxMenu ContextMenu;
		wxStaticLine* StaticLine2;
		wxStaticLine* StaticLine1;
		wxButton* AnnulerBt;
		wxMenuItem* editMenuItem;
		wxButton* AideBt;
		//*)

		wxImageList * imageList;
		int id;

	protected:

		//(*Identifiers(EditActions)
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_LISTCTRL1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		static const long idMenuEdit;
		static const long idMenuAdd;
		static const long idMenuDel;
		static const long idMenuCopy;
		static const long idMenuCut;
		static const long idMenuPaste;
		//*)

	private:

		//(*Handlers(EditActions)
		void OnOkBtClick(wxCommandEvent& event);
		void OnActionsListItemRClick(wxListEvent& event);
		void OnEditAction(wxCommandEvent& event);
		void OnAddAction(wxCommandEvent& event);
		void OnDelAction(wxCommandEvent& event);
		void OnActionsListItemSelect(wxListEvent& event);
		void OnMenuItem4Selected(wxCommandEvent& event);
		void OnMenuItem5Selected(wxCommandEvent& event);
		void OnMenuItem6Selected(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnActionsListItemActivated(wxListEvent& event);
		void OnActionsListKeyDown(wxListEvent& event);
		void OnKeyUp(wxKeyEvent& event);
		//*)

        Game & game;
        Scene & scene;

		DECLARE_EVENT_TABLE()
};

#endif
