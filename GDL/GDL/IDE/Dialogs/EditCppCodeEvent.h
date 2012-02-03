#ifndef EDITCPPCODEEVENT_H
#define EDITCPPCODEEVENT_H

//(*Headers(EditCppCodeEvent)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
class CppCodeEvent;
class Game;
class Scene;

class EditCppCodeEvent: public wxDialog
{
	public:

		EditCppCodeEvent(wxWindow* parent, CppCodeEvent & event_, Game & game_, Scene & scene_);
		virtual ~EditCppCodeEvent();

		//(*Declarations(EditCppCodeEvent)
		wxStaticText* StaticText2;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxStaticLine* StaticLine2;
		wxStaticLine* StaticLine1;
		wxTextCtrl* TextCtrl1;
		wxButton* okBt;
		wxStaticBitmap* StaticBitmap3;
		wxTextCtrl* codeEdit;
		//*)

	protected:

		//(*Identifiers(EditCppCodeEvent)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT3;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(EditCppCodeEvent)
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		//*)

		CppCodeEvent & editedEvent;
		Game & game;
		Scene & scene;

		DECLARE_EVENT_TABLE()
};

#endif
