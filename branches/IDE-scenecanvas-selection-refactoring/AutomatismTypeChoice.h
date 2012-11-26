#ifndef AUTOMATISMTYPECHOICE_H
#define AUTOMATISMTYPECHOICE_H

//(*Headers(AutomatismTypeChoice)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
class Game;

class AutomatismTypeChoice: public wxDialog
{
	public:

		AutomatismTypeChoice(wxWindow* parent, Game & game_);
		virtual ~AutomatismTypeChoice();

		//(*Declarations(AutomatismTypeChoice)
		wxStaticBitmap* StaticBitmap2;
		wxStaticBitmap* iconBmp;
		wxTextCtrl* infoEdit;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxButton* cancelBt;
		wxStaticLine* StaticLine2;
		wxListCtrl* automatismsList;
		wxButton* moreAutomatismsBt;
		wxStaticLine* StaticLine1;
		wxButton* okBt;
		//*)

		std::string selectedAutomatismType;

	protected:

		//(*Identifiers(AutomatismTypeChoice)
		static const long ID_STATICBITMAP2;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_LISTCTRL1;
		static const long ID_STATICBITMAP1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON3;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(AutomatismTypeChoice)
		void OnautomatismsListItemActivated(wxListEvent& event);
		void OnautomatismsListItemSelect(wxListEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OnmoreAutomatismsBtClick(wxCommandEvent& event);
		//*)
		void RefreshList();

		Game & game;

		DECLARE_EVENT_TABLE()
};

#endif

