#if defined(GDE)

#ifndef DRAWEROBJECTEDITOR_H
#define DRAWEROBJECTEDITOR_H

//(*Headers(DrawerObjectEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/radiobox.h>
#include <wx/spinctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
class Game;
class DrawerObject;
class MainEditorCommand;

class DrawerObjectEditor: public wxDialog
{
	public:

		DrawerObjectEditor( wxWindow* parent, Game & game_, DrawerObject & object_, MainEditorCommand & mainEditorCommand_ );
		virtual ~DrawerObjectEditor();

		//(*Declarations(DrawerObjectEditor)
		wxStaticText* StaticText2;
		wxRadioBox* coordinatesRadio;
		wxSpinCtrl* outlineSizeEdit;
		wxSpinCtrl* fillOpacityEdit;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxButton* fillColorBt;
		wxButton* outlineColorBt;
		wxStaticText* StaticText5;
		wxStaticLine* StaticLine1;
		wxSpinCtrl* outlineOpacityEdit;
		wxStaticText* StaticText4;
		wxButton* okBt;
		//*)

	protected:

		//(*Identifiers(DrawerObjectEditor)
		static const long ID_STATICTEXT3;
		static const long ID_BUTTON1;
		static const long ID_STATICTEXT5;
		static const long ID_SPINCTRL3;
		static const long ID_STATICTEXT1;
		static const long ID_BUTTON3;
		static const long ID_STATICTEXT2;
		static const long ID_SPINCTRL2;
		static const long ID_STATICTEXT4;
		static const long ID_SPINCTRL1;
		static const long ID_RADIOBOX1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON4;
		//*)

	private:

		//(*Handlers(DrawerObjectEditor)
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OnfillColorBtClick(wxCommandEvent& event);
		void OnoutlineColorBtClick(wxCommandEvent& event);
		//*)

		Game & game;
		MainEditorCommand & mainEditorCommand;
		DrawerObject & object;

		DECLARE_EVENT_TABLE()
};

#endif

#endif