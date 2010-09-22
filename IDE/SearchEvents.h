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
class Game;
class Scene;

class SearchEvents: public wxDialog
{
	public:

		SearchEvents(wxWindow* parent, Game & game_, Scene & scene_, vector < BaseEventSPtr > * events_);
		virtual ~SearchEvents();

		//(*Declarations(SearchEvents)
		wxCheckBox* replaceCaseCheck;
		wxCheckBox* actionsCheck;
		wxListCtrl* ListCtrl1;
		wxNotebook* Notebook1;
		wxCheckBox* replaceActionsCheck;
		wxStaticText* StaticText2;
		wxButton* Button1;
		wxCheckBox* CheckBox2;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* Button2;
		wxCheckBox* CheckBox1;
		wxCheckBox* replaceConditionsCheck;
		wxTextCtrl* searchEdit;
		wxTextCtrl* replaceEdit;
		wxCheckBox* conditionsCheck;
		wxTextCtrl* searchToReplaceEdit;
		wxButton* replaceBt;
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
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT3;
		static const long ID_TEXTCTRL3;
		static const long ID_CHECKBOX8;
		static const long ID_CHECKBOX9;
		static const long ID_CHECKBOX10;
		static const long ID_BUTTON4;
		static const long ID_PANEL2;
		static const long ID_NOTEBOOK1;
		//*)

	private:

		//(*Handlers(SearchEvents)
		void OnreplaceBtClick(wxCommandEvent& event);
		//*)

		Game & game;
		Scene & scene;

		std::vector < BaseEventSPtr > * events;

		DECLARE_EVENT_TABLE()
};

#endif
