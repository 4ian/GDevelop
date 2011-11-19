#ifndef EDITOPTIONSPOSITION_H
#define EDITOPTIONSPOSITION_H

//(*Headers(EditOptionsPosition)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/choice.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDL/Position.h"
#include "GDL/Object.h"
class Game;
class Scene;

class EditOptionsPosition: public wxDialog
{
	public:

		EditOptionsPosition(wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position_);
		virtual ~EditOptionsPosition();

		InitialPosition position;

		//(*Declarations(EditOptionsPosition)
		wxButton* OkBt;
		wxTextCtrl* widthEdit;
		wxTextCtrl* YEdit;
		wxStaticText* StaticText2;
		wxCheckBox* sizeCheck;
		wxChoice* layerChoice;
		wxStaticText* StaticText6;
		wxTextCtrl* heightEdit;
		wxStaticText* StaticText8;
		wxPanel* Panel1;
		wxPanel* customPanel;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxTextCtrl* XEdit;
		wxStaticLine* StaticLine2;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxStaticLine* StaticLine1;
		wxButton* AnnulerBt;
		wxTextCtrl* zOrderEdit;
		wxStaticText* StaticText4;
		wxStaticText* objectNameTxt;
		wxButton* AideBt;
		//*)

	protected:

		//(*Identifiers(EditOptionsPosition)
		static const long ID_STATICTEXT1;
		static const long ID_STATICTEXT2;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_STATICTEXT3;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL2;
		static const long ID_CHECKBOX1;
		static const long ID_STATICTEXT5;
		static const long ID_TEXTCTRL3;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL5;
		static const long ID_STATICTEXT11;
		static const long ID_CHOICE1;
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL4;
		static const long ID_STATICTEXT8;
		static const long ID_PANEL2;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		//*)

	private:

		//(*Handlers(EditOptionsPosition)
		void OnOkBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void OnAnimationComboText(wxCommandEvent& event);
		void OnsizeCheckClick(wxCommandEvent& event);
		//*)
		void RefreshDirecType(int anim);

		const Game & game;
		const Scene & scene;

		DECLARE_EVENT_TABLE()
};

#endif
