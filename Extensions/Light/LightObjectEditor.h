/**

Game Develop - Light Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#if defined(GD_IDE_ONLY)

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

