#if defined(GDE)

#ifndef TEXTOBJECTEDITOR_H
#define TEXTOBJECTEDITOR_H

//(*Headers(TextObjectEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/spinctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
class Game;
class TextObject;
class MainEditorCommand;

class TextObjectEditor: public wxDialog
{
	public:

		TextObjectEditor( wxWindow* parent, Game & game_, TextObject & object_, MainEditorCommand & mainEditorCommand_ );
		virtual ~TextObjectEditor();

		//(*Declarations(TextObjectEditor)
		wxSpinCtrl* sizeEdit;
		wxStaticText* StaticText2;
		wxTextCtrl* textEdit;
		wxStaticText* StaticText1;
		wxButton* fontBt;
		wxButton* colorBt;
		wxStaticLine* StaticLine1;
		wxTextCtrl* fontEdit;
		wxStaticText* StaticText4;
		wxButton* okBt;
		//*)

	protected:

		//(*Identifiers(TextObjectEditor)
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT1;
		static const long ID_BUTTON3;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL2;
		static const long ID_BUTTON4;
		static const long ID_STATICTEXT4;
		static const long ID_SPINCTRL1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(TextObjectEditor)
		void OnokBtClick(wxCommandEvent& event);
		void OncolorBtClick(wxCommandEvent& event);
		void OnfontBtClick(wxCommandEvent& event);
		void OnSizeEditChange(wxSpinEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		//*)

		Game & game;
		MainEditorCommand & mainEditorCommand;
		TextObject & object;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
