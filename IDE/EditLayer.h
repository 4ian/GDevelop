#ifndef EDITLAYER_H
#define EDITLAYER_H

//(*Headers(EditLayer)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
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
		wxCheckBox* visibilityCheck;
		wxStaticText* StaticText1;
		wxButton* cancelBt;
		wxTextCtrl* nameEdit;
		wxStaticLine* StaticLine1;
		wxButton* okBt;
		//*)

		Layer & layer;

	protected:

		//(*Identifiers(EditLayer)
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_CHECKBOX1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(EditLayer)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
