#ifndef EDITPROPJEU_H
#define EDITPROPJEU_H

//(*Headers(EditPropJeu)
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/spinctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDL/Game.h"

class EditPropJeu: public wxDialog
{
	public:

		EditPropJeu(wxWindow* parent, Game * pJeu);
		virtual ~EditPropJeu();

		//(*Declarations(EditPropJeu)
		wxStaticText* StaticText10;
		wxButton* OkBt;
		wxStaticText* StaticText9;
		wxStaticBitmap* StaticBitmap2;
		wxTextCtrl* texteYPosEdit;
		wxSpinCtrl* FPSmax;
		wxTextCtrl* heightECEdit;
		wxTextCtrl* imageEdit;
		wxStaticBitmap* StaticBitmap5;
		wxNotebook* Notebook1;
		wxTextCtrl* texteXPosEdit;
		wxTextCtrl* AuteurEdit;
		wxStaticText* StaticText13;
		wxStaticText* StaticText2;
		wxButton* BrowseBt;
		wxStaticText* StaticText6;
		wxStaticBitmap* StaticBitmap1;
		wxStaticText* StaticText8;
		wxStaticText* StaticText11;
		wxStaticBitmap* StaticBitmap4;
		wxCheckBox* FPSmaxCheck;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxCheckBox* SyncCheck;
		wxButton* Button2;
		wxPanel* Panel3;
		wxCheckBox* pourcentCheck;
		wxTextCtrl* WidthEdit;
		wxStaticText* StaticText5;
		wxTextCtrl* NomEdit;
		wxStaticText* StaticText7;
		wxStaticLine* StaticLine3;
		wxStaticLine* StaticLine1;
		wxTextCtrl* texteEdit;
		wxCheckBox* imageCheck;
		wxStaticText* StaticText12;
		wxTextCtrl* pourcentXPosEdit;
		wxCheckBox* afficherEcranCheck;
		wxTextCtrl* widthECEdit;
		wxPanel* Panel2;
		wxCheckBox* smoothCheck;
		wxTextCtrl* pourcentYPosEdit;
		wxStaticText* StaticText4;
		wxCheckBox* texteCheck;
		wxCheckBox* borderCheck;
		wxStaticBitmap* StaticBitmap3;
		wxSpinCtrl* FPSmin;
		wxTextCtrl* HeightEdit;
		wxButton* AideBt;
		//*)

		Game * m_jeu;

	protected:

		//(*Identifiers(EditPropJeu)
		static const long ID_STATICBITMAP5;
		static const long ID_STATICTEXT6;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT3;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL3;
		static const long ID_STATICTEXT5;
		static const long ID_TEXTCTRL4;
		static const long ID_STATICBITMAP1;
		static const long ID_CHECKBOX5;
		static const long ID_SPINCTRL1;
		static const long ID_CHECKBOX6;
		static const long ID_STATICTEXT12;
		static const long ID_SPINCTRL2;
		static const long ID_PANEL2;
		static const long ID_CHECKBOX4;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL11;
		static const long ID_STATICTEXT11;
		static const long ID_TEXTCTRL12;
		static const long ID_STATICBITMAP2;
		static const long ID_CHECKBOX1;
		static const long ID_TEXTCTRL5;
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL6;
		static const long ID_STATICTEXT8;
		static const long ID_TEXTCTRL7;
		static const long ID_STATICBITMAP3;
		static const long ID_CHECKBOX2;
		static const long ID_STATICTEXT9;
		static const long ID_TEXTCTRL9;
		static const long ID_STATICTEXT10;
		static const long ID_TEXTCTRL10;
		static const long ID_STATICBITMAP4;
		static const long ID_CHECKBOX3;
		static const long ID_TEXTCTRL8;
		static const long ID_BUTTON3;
		static const long ID_CHECKBOX7;
		static const long ID_CHECKBOX8;
		static const long ID_STATICTEXT13;
		static const long ID_BUTTON4;
		static const long ID_PANEL3;
		static const long ID_NOTEBOOK1;
		static const long ID_STATICLINE3;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(EditPropJeu)
		void OnInit(wxInitDialogEvent& event);
		void OnOkBtClick(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void OnButton2Click(wxCommandEvent& event);
		void OnBrowseBtClick(wxCommandEvent& event);
		void OnFPSmaxCheckClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
