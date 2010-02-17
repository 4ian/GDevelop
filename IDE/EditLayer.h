#ifndef EDITLAYER_H
#define EDITLAYER_H

//(*Headers(EditLayer)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/choice.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDL/Layer.h"

class EditLayer: public wxDialog
{
	public:

		EditLayer(wxWindow* parent, Layer & layer_);
		virtual ~EditLayer();

		//(*Declarations(EditLayer)
		wxStaticText* StaticText9;
		wxTextCtrl* viewportX2Edit;
		wxStaticText* StaticText2;
		wxCheckBox* sizeCheck;
		wxStaticText* StaticText6;
		wxCheckBox* visibilityCheck;
		wxStaticText* StaticText8;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxTextCtrl* nameEdit;
		wxTextCtrl* viewportY1Edit;
		wxStaticText* StaticText7;
		wxTextCtrl* cameraWidthEdit;
		wxStaticLine* StaticLine1;
		wxTextCtrl* viewportX1Edit;
		wxButton* deleteCameraBt;
		wxButton* addCameraBt;
		wxChoice* cameraChoice;
		wxStaticText* StaticText4;
		wxCheckBox* viewportCheck;
		wxButton* okBt;
		wxTextCtrl* viewportY2Edit;
		wxTextCtrl* cameraHeightEdit;
		//*)

		Layer & layer;
		Layer tempLayer;

	protected:

		//(*Identifiers(EditLayer)
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_CHECKBOX1;
		static const long ID_STATICTEXT2;
		static const long ID_CHOICE1;
		static const long ID_BUTTON5;
		static const long ID_BUTTON3;
		static const long ID_CHECKBOX2;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL3;
		static const long ID_CHECKBOX3;
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL4;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL5;
		static const long ID_STATICTEXT8;
		static const long ID_TEXTCTRL6;
		static const long ID_STATICTEXT9;
		static const long ID_TEXTCTRL7;
		static const long ID_STATICTEXT3;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(EditLayer)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		void OnaddCameraBtClick(wxCommandEvent& event);
		void OncameraChoiceSelect(wxCommandEvent& event);
		void OnsizeCheckClick(wxCommandEvent& event);
		void OncameraWidthEditText(wxCommandEvent& event);
		void OncameraHeightEditText(wxCommandEvent& event);
		void OnviewportCheckClick(wxCommandEvent& event);
		void OnviewportX1EditText(wxCommandEvent& event);
		void OndeleteCameraBtClick(wxCommandEvent& event);
		//*)
		void RefreshCameraSettings();

		DECLARE_EVENT_TABLE()
};

#endif
