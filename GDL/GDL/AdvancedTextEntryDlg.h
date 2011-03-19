#ifndef ADVANCEDTEXTENTRYDLG_H
#define ADVANCEDTEXTENTRYDLG_H

//(*Headers(AdvancedTextEntryDlg)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
class Game;
class Scene;

class AdvancedTextEntryDlg: public wxDialog
{
	public:
        enum MoreButtonType { None,  MathExpression, TextExpression };

		AdvancedTextEntryDlg(wxWindow* parent, std::string caption, std::string description, std::string defaultText, MoreButtonType moreButtonType = None, Game * game_ = NULL, Scene * scene_ = NULL);
		virtual ~AdvancedTextEntryDlg();

		//(*Declarations(AdvancedTextEntryDlg)
		wxStaticText* descriptionTxt;
		wxTextCtrl* textEdit;
		wxButton* cancelBt;
		wxButton* moreBt;
		wxStaticLine* StaticLine1;
		wxButton* okBt;
		//*)

		std::string text;

	protected:

		//(*Identifiers(AdvancedTextEntryDlg)
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		//*)

	private:

		//(*Handlers(AdvancedTextEntryDlg)
		void OnmoreBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		//*)

		MoreButtonType moreButtonType;
		Game * game;
		Scene * scene;

		DECLARE_EVENT_TABLE()
};

#endif
