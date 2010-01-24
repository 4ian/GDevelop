#ifndef EDITPROPSCENE_H
#define EDITPROPSCENE_H

//(*Headers(EditPropScene)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/radiobox.h>
#include <wx/textctrl.h>
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
		wxButton* ColorBt;
		wxStaticText* StaticText2;
		wxStaticText* NomSceneTxt;
		wxTextCtrl* CaptionEdit;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticLine* StaticLine2;
		wxStaticLine* StaticLine1;
		wxButton* AnnulerBt;
		wxPanel* Panel2;
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
		static const long ID_RADIOBOX1;
		static const long ID_STATICTEXT3;
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
