#ifndef EDITPROPSCENE_H
#define EDITPROPSCENE_H

//(*Headers(EditPropScene)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/radiobox.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDL/Scene.h"

class EditPropScene: public wxDialog
{
	public:

		EditPropScene(wxWindow* parent, Scene * pScene);
		virtual ~EditPropScene();

		Scene * scene;

		//(*Declarations(EditPropScene)
		wxButton* OkBt;
		wxTextCtrl* zFarEdit;
		wxButton* ColorBt;
		wxStaticText* StaticText2;
		wxStaticText* NomSceneTxt;
		wxTextCtrl* CaptionEdit;
		wxStaticText* StaticText6;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxStaticLine* StaticLine2;
		wxTextCtrl* zNearEdit;
		wxStaticText* StaticText5;
		wxTextCtrl* fovEdit;
		wxStaticLine* StaticLine1;
		wxButton* AnnulerBt;
		wxPanel* Panel2;
		wxCheckBox* stopSoundsCheck;
		wxStaticText* StaticText4;
		wxRadioBox* TriBox;
		wxButton* AideBt;
		//*)

	protected:

		//(*Identifiers(EditPropScene)
		static const long ID_STATICTEXT1;
		static const long ID_STATICTEXT2;
		static const long ID_PANEL2;
		static const long ID_STATICLINE1;
		static const long ID_TEXTCTRL1;
		static const long ID_PANEL1;
		static const long ID_BUTTON1;
		static const long ID_CHECKBOX1;
		static const long ID_RADIOBOX1;
		static const long ID_STATICTEXT3;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT5;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL3;
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL4;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		static const long ID_BUTTON4;
		//*)

	private:

		//(*Handlers(EditPropScene)
		void OnOkBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnColorBtClick(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
