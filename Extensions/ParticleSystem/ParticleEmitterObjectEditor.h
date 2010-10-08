/**

Game Develop - Particle System Extension
Copyright (c) 2010 Florian Rival (Florian.Rival@gmail.com)

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

#if defined(GDE)

#ifndef TEXTOBJECTEDITOR_H
#define TEXTOBJECTEDITOR_H

//(*Headers(ParticleEmitterObjectEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/radiobut.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
class Game;
class ParticleEmitterObject;
class MainEditorCommand;

class ParticleEmitterObjectEditor: public wxDialog
{
	public:

		ParticleEmitterObjectEditor( wxWindow* parent, Game & game_, ParticleEmitterObject & object_, MainEditorCommand & mainEditorCommand_ );
		virtual ~ParticleEmitterObjectEditor();

		//(*Declarations(ParticleEmitterObjectEditor)
		wxTextCtrl* gravityXEdit;
		wxStaticText* rendererParam1Txt;
		wxRadioButton* QuadCheck;
		wxTextCtrl* frictionEdit;
		wxCheckBox* infiniteTankCheck;
		wxStaticText* StaticText2;
		wxTextCtrl* tankEdit;
		wxStaticText* StaticText6;
		wxStaticText* StaticText8;
		wxRadioButton* pointCheck;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxTextCtrl* gravityZEdit;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxTextCtrl* gravityYEdit;
		wxStaticLine* StaticLine1;
		wxStaticText* rendererParam2Txt;
		wxTextCtrl* emitterForceMinEdit;
		wxTextCtrl* rendererParam2Edit;
		wxTextCtrl* flowEdit;
		wxStaticText* StaticText4;
		wxButton* okBt;
		wxRadioButton* LineCheck;
		wxTextCtrl* rendererParam1Edit;
		wxTextCtrl* emitterForceMaxEdit;
		//*)

	protected:

		//(*Identifiers(ParticleEmitterObjectEditor)
		static const long ID_STATICTEXT7;
		static const long ID_RADIOBUTTON2;
		static const long ID_RADIOBUTTON1;
		static const long ID_RADIOBUTTON3;
		static const long ID_STATICTEXT9;
		static const long ID_TEXTCTRL9;
		static const long ID_STATICTEXT10;
		static const long ID_TEXTCTRL10;
		static const long ID_CHECKBOX1;
		static const long ID_STATICTEXT3;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT4;
		static const long ID_STATICTEXT5;
		static const long ID_TEXTCTRL6;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL7;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL3;
		static const long ID_TEXTCTRL4;
		static const long ID_TEXTCTRL5;
		static const long ID_STATICTEXT8;
		static const long ID_TEXTCTRL8;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(ParticleEmitterObjectEditor)
		void OnokBtClick(wxCommandEvent& event);
		void OncolorBtClick(wxCommandEvent& event);
		void OnfontBtClick(wxCommandEvent& event);
		void OnSizeEditChange(wxSpinEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OninfiniteTankCheckClick(wxCommandEvent& event);
		void OnpointCheckSelect(wxCommandEvent& event);
		void OnLineCheckSelect(wxCommandEvent& event);
		void OnQuadCheckSelect(wxCommandEvent& event);
		//*)
		void PrepareControlsForPointRenderer();
		void PrepareControlsForQuadRenderer();
		void PrepareControlsForLineRenderer();

		Game & game;
		MainEditorCommand & mainEditorCommand;
		ParticleEmitterObject & object;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
