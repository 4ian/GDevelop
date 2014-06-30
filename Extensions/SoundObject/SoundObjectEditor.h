/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy

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

#ifndef SoundObjectEDITOR_H
#define SoundObjectEDITOR_H

//(*Headers(SoundObjectEditor)
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/spinctrl.h>
#include <wx/statline.h>
#include <wx/radiobut.h>
#include <wx/panel.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
namespace gd { class MainFrameWrapper; }
namespace gd { class Project; }
class SoundObject;

class SoundObjectEditor: public wxDialog
{
	public:

		SoundObjectEditor( wxWindow* parent, gd::Project & game_, SoundObject & object_ );
		virtual ~SoundObjectEditor();

		//(*Declarations(SoundObjectEditor)
		wxSpinCtrl* MinDistanceSpinCtrl;
		wxButton* ValidateButton;
		wxNotebook* Notebook1;
		wxStaticText* StaticText2;
		wxTextCtrl* FileNameTextCtrl;
		wxCheckBox* LoopCheckBox;
		wxButton* Button1;
		wxStaticText* StaticText6;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* Button2;
		wxStaticText* StaticText5;
		wxTextCtrl* AttenuationSpinCtrl;
		wxStaticText* StaticText7;
		wxTextCtrl* pitchTextCtrl;
		wxSpinCtrl* VolumeSpinCtrl;
		wxStaticLine* StaticLine1;
		wxRadioButton* SoundRadioBt;
		wxPanel* Panel2;
		wxRadioButton* MusicRadioBt;
		wxStaticText* StaticText4;
		//*)

	protected:

		//(*Identifiers(SoundObjectEditor)
		static const long ID_RADIOBUTTON2;
		static const long ID_RADIOBUTTON1;
		static const long ID_STATICTEXT6;
		static const long ID_STATICTEXT7;
		static const long ID_PANEL1;
		static const long ID_STATICTEXT1;
		static const long ID_SPINCTRL1;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL3;
		static const long ID_STATICTEXT3;
		static const long ID_SPINCTRL3;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL2;
		static const long ID_CHECKBOX1;
		static const long ID_STATICTEXT5;
		static const long ID_TEXTCTRL1;
		static const long ID_BUTTON2;
		static const long ID_PANEL2;
		static const long ID_NOTEBOOK1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON3;
		//*)

	private:

		//(*Handlers(SoundObjectEditor)
		void OnValidateButtonClick(wxCommandEvent& event);
		void OnButton1Click(wxCommandEvent& event);
		void OnButton2Click(wxCommandEvent& event);
		//*)

		gd::Project & game;
		SoundObject & object;

		DECLARE_EVENT_TABLE()
};

#endif
#endif

