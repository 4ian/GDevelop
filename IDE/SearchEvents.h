#ifndef SEARCHEVENTS_H
#define SEARCHEVENTS_H

//(*Headers(SearchEvents)
#include <wx/listctrl.h>
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/panel.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <string>
#include <vector>
#include "GDL/Event.h"

using namespace std;

class SearchEvents: public wxDialog
{
	public:

		SearchEvents(wxWindow* parent, vector < BaseEventSPtr > events_);
		virtual ~SearchEvents();

		//(*Declarations(SearchEvents)
		wxCheckBox* actionsCheck;
		wxListCtrl* ListCtrl1;
		wxNotebook* Notebook1;
		wxButton* Button1;
		wxCheckBox* CheckBox2;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxButton* Button2;
		wxCheckBox* CheckBox1;
		wxTextCtrl* searchEdit;
		wxCheckBox* conditionsCheck;
		wxPanel* Panel2;
		wxCheckBox* commentsCheck;
		wxCheckBox* linksCheck;
		wxButton* searchBt;
		//*)

	protected:

		//(*Identifiers(SearchEvents)
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_CHECKBOX5;
		static const long ID_CHECKBOX6;
		static const long ID_CHECKBOX1;
		static const long ID_CHECKBOX2;
		static const long ID_CHECKBOX3;
		static const long ID_CHECKBOX4;
		static const long ID_LISTCTRL1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		static const long ID_PANEL1;
		static const long ID_PANEL2;
		static const long ID_NOTEBOOK1;
		//*)

	private:

		//(*Handlers(SearchEvents)
		//*)

		vector < BaseEventSPtr > events;

		DECLARE_EVENT_TABLE()
};

#endif
