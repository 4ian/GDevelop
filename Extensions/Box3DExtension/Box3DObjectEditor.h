#if defined(GDE)
#ifndef BOX3DOBJECTEDITOR_H
#define BOX3DOBJECTEDITOR_H

//(*Headers(Box3DObjectEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/bmpbuttn.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
class Game;
class Box3DObject;
class MainEditorCommand;

class Box3DObjectEditor: public wxDialog
{
	public:

		Box3DObjectEditor( wxWindow* parent, Game & game_, Box3DObject & object_, MainEditorCommand & mainEditorCommand_ );
		virtual ~Box3DObjectEditor();

		//(*Declarations(Box3DObjectEditor)
		wxStaticText* StaticText9;
		wxTextCtrl* widthEdit;
		wxTextCtrl* bottomTextureEdit;
		wxStaticText* StaticText2;
		wxTextCtrl* backTextureEdit;
		wxStaticText* StaticText6;
		wxTextCtrl* heightEdit;
		wxStaticText* StaticText8;
		wxTextCtrl* depthEdit;
		wxBitmapButton* rightAddFromBt;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxTextCtrl* topTextureEdit;
		wxButton* cancelBt;
		wxBitmapButton* topAddFromBt;
		wxBitmapButton* leftAddFromBt;
		wxBitmapButton* backAddFromBt;
		wxTextCtrl* leftTextureEdit;
		wxTextCtrl* rightTextureEdit;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxStaticLine* StaticLine1;
		wxBitmapButton* frontAddFromBt;
		wxStaticText* StaticText4;
		wxButton* okBt;
		wxBitmapButton* bottomAddFromBt;
		wxTextCtrl* frontTextureEdit;
		//*)

	protected:

		//(*Identifiers(Box3DObjectEditor)
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL7;
		static const long ID_STATICTEXT8;
		static const long ID_TEXTCTRL8;
		static const long ID_STATICTEXT9;
		static const long ID_TEXTCTRL9;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_BITMAPBUTTON1;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL2;
		static const long ID_BITMAPBUTTON2;
		static const long ID_STATICTEXT3;
		static const long ID_TEXTCTRL3;
		static const long ID_BITMAPBUTTON3;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL4;
		static const long ID_BITMAPBUTTON4;
		static const long ID_STATICTEXT5;
		static const long ID_TEXTCTRL5;
		static const long ID_BITMAPBUTTON5;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL6;
		static const long ID_BITMAPBUTTON6;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(Box3DObjectEditor)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		//*)

		Game & game;
		MainEditorCommand & mainEditorCommand;
		Box3DObject & object;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
