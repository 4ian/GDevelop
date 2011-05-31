#if defined(GD_IDE_ONLY)
#ifndef CHOOSEAUTOMATISMDLG_H
#define CHOOSEAUTOMATISMDLG_H

//(*Headers(ChooseAutomatismDlg)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/listbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/srchctrl.h>
#include <string>
class Game;
class Scene;

class GD_API ChooseAutomatismDlg: public wxDialog
{
	public:

		ChooseAutomatismDlg(wxWindow* parent, Game & game_, Scene & scene_, std::string parentObject_, std::string automatismTypeAllowed_);
		virtual ~ChooseAutomatismDlg();

		//(*Declarations(ChooseAutomatismDlg)
		wxSearchCtrl* searchCtrl;
		wxButton* ChoisirBt;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticLine* StaticLine2;
		wxButton* AnnulerBt;
		wxListBox* automatismsList;
		wxStaticBitmap* StaticBitmap3;
		//*)

		std::string automatismChosen;

	protected:

		//(*Identifiers(ChooseAutomatismDlg)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_LISTBOX1;
		static const long ID_TEXTCTRL1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(ChooseAutomatismDlg)
		void OnChoisirBtClick(wxCommandEvent& event);
		void OnCancelBtClick(wxCommandEvent& event);
		void OnsearchCtrlText(wxCommandEvent& event);
		void OnsearchCtrlTextEnter(wxCommandEvent& event);
		//*)

        void RefreshList();
		Game & game;
		Scene & scene;
		std::string parentObject;
		std::string automatismTypeAllowed;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
