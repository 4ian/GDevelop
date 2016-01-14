/**

GDevelop - Light Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#ifndef LightObjectEDITOR_H
#define LightObjectEDITOR_H

//(*Headers(LightObjectEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/spinctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
#include <wx/clrpicker.h>
//*)
namespace gd { class Project; }
class LightObject;
namespace gd { class MainFrameWrapper; }

class LightObjectEditor: public wxDialog
{
	public:

		LightObjectEditor( wxWindow* parent, gd::Project & game_, LightObject & object_ );
		virtual ~LightObjectEditor();

		//(*Declarations(LightObjectEditor)
		wxTextCtrl* qualityEdit;
		wxStaticText* StaticText2;
		wxStaticText* StaticText6;
		wxColourPickerCtrl* globalColorPicker;
		wxCheckBox* globalCheck;
		wxSpinCtrl* intensityEdit;
		wxColourPickerCtrl* colorPicker;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxTextCtrl* radiusEdit;
		wxStaticText* StaticText5;
		wxStaticLine* StaticLine1;
		wxStaticText* StaticText4;
		wxButton* okBt;
		//*)

	protected:

		//(*Identifiers(LightObjectEditor)
		static const long ID_STATICTEXT1;
		static const long ID_COLOURPICKERCTRL1;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT3;
		static const long ID_STATICTEXT4;
		static const long ID_SPINCTRL1;
		static const long ID_STATICTEXT5;
		static const long ID_TEXTCTRL2;
		static const long ID_CHECKBOX1;
		static const long ID_STATICTEXT6;
		static const long ID_COLOURPICKERCTRL2;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(LightObjectEditor)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		//*)

		gd::Project & game;
		LightObject & object;

		DECLARE_EVENT_TABLE()
};

#endif
#endif

