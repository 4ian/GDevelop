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
#include <wx/spinctrl.h>
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
		wxStaticText* StaticText10;
		wxTextCtrl* gravityXEdit;
		wxStaticText* StaticText22;
		wxStaticText* StaticText9;
		wxStaticText* StaticText20;
		wxStaticText* rendererParam1Txt;
		wxRadioButton* angleMutableCheck;
		wxSpinCtrlDouble* green2Edit;
		wxStaticText* StaticText29;
		wxSpinCtrlDouble* angle2Edit;
		wxTextCtrl* frictionEdit;
		wxCheckBox* infiniteTankCheck;
		wxStaticText* StaticText33;
		wxStaticText* StaticText13;
		wxStaticText* StaticText2;
		wxTextCtrl* tankEdit;
		wxStaticText* StaticText30;
		wxStaticText* StaticText14;
		wxRadioButton* blueFixedCheck;
		wxRadioButton* quadCheck;
		wxRadioButton* additiveRenderingCheck;
		wxStaticText* StaticText6;
		wxStaticText* StaticText26;
		wxSpinCtrlDouble* size1Edit;
		wxTextCtrl* emitterAngleAEdit;
		wxSpinCtrlDouble* blue2Edit;
		wxRadioButton* alphaRenderingCheck;
		wxTextCtrl* emitterDirYEdit;
		wxStaticText* StaticText32;
		wxStaticText* StaticText19;
		wxStaticText* StaticText8;
		wxStaticText* StaticText11;
		wxTextCtrl* lifeTimeMaxEdit;
		wxStaticText* StaticText18;
		wxStaticText* StaticText31;
		wxRadioButton* pointCheck;
		wxStaticText* StaticText1;
		wxSpinCtrlDouble* red1Edit;
		wxStaticText* StaticText27;
		wxRadioButton* blueMutableCheck;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxTextCtrl* textureEdit;
		wxRadioButton* alphaMutableCheck;
		wxStaticText* StaticText21;
		wxTextCtrl* gravityZEdit;
		wxStaticText* StaticText23;
		wxRadioButton* blueRandomCheck;
		wxStaticText* StaticText24;
		wxSpinCtrlDouble* blue1Edit;
		wxRadioButton* redMutableCheck;
		wxRadioButton* angleNothingCheck;
		wxTextCtrl* emitterDirZEdit;
		wxSpinCtrlDouble* alpha1Edit;
		wxRadioButton* sizeMutableCheck;
		wxStaticText* StaticText5;
		wxStaticText* StaticText34;
		wxRadioButton* alphaFixedCheck;
		wxStaticText* StaticText7;
		wxRadioButton* angleRandomCheck;
		wxRadioButton* lineCheck;
		wxRadioButton* redRandomCheck;
		wxTextCtrl* gravityYEdit;
		wxRadioButton* greenFixedCheck;
		wxRadioButton* greenMutableCheck;
		wxStaticLine* StaticLine1;
		wxTextCtrl* lifeTimeMinEdit;
		wxStaticText* rendererParam2Txt;
		wxSpinCtrlDouble* alpha2Edit;
		wxTextCtrl* emitterDirXEdit;
		wxSpinCtrlDouble* red2Edit;
		wxRadioButton* redFixedCheck;
		wxRadioButton* alphaRandomCheck;
		wxStaticText* StaticText28;
		wxStaticText* StaticText15;
		wxStaticText* StaticText12;
		wxStaticText* textureTxt;
		wxTextCtrl* emitterAngleBEdit;
		wxStaticText* StaticText35;
		wxSpinCtrlDouble* angle1Edit;
		wxTextCtrl* emitterForceMinEdit;
		wxSpinCtrlDouble* green1Edit;
		wxSpinCtrlDouble* size2Edit;
		wxTextCtrl* rendererParam2Edit;
		wxTextCtrl* flowEdit;
		wxStaticText* StaticText25;
		wxRadioButton* sizeRandomCheck;
		wxTextCtrl* zoneRadiusEdit;
		wxStaticText* StaticText4;
		wxStaticText* StaticText36;
		wxStaticText* StaticText17;
		wxButton* okBt;
		wxRadioButton* sizeNothingCheck;
		wxStaticText* StaticText16;
		wxTextCtrl* rendererParam1Edit;
		wxRadioButton* greenRandomCheck;
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
		static const long ID_STATICTEXT32;
		static const long ID_TEXTCTRL13;
		static const long ID_RADIOBUTTON22;
		static const long ID_RADIOBUTTON23;
		static const long ID_STATICTEXT29;
		static const long ID_TEXTCTRL11;
		static const long ID_STATICTEXT30;
		static const long ID_TEXTCTRL12;
		static const long ID_STATICTEXT31;
		static const long ID_RADIOBUTTON6;
		static const long ID_RADIOBUTTON5;
		static const long ID_RADIOBUTTON4;
		static const long ID_STATICTEXT11;
		static const long ID_STATICTEXT13;
		static const long ID_SPINCTRL1;
		static const long ID_STATICTEXT12;
		static const long ID_CUSTOM1;
		static const long ID_RADIOBUTTON10;
		static const long ID_RADIOBUTTON11;
		static const long ID_RADIOBUTTON12;
		static const long ID_STATICTEXT17;
		static const long ID_STATICTEXT18;
		static const long ID_CUSTOM2;
		static const long ID_STATICTEXT19;
		static const long ID_CUSTOM3;
		static const long ID_RADIOBUTTON7;
		static const long ID_RADIOBUTTON8;
		static const long ID_RADIOBUTTON9;
		static const long ID_STATICTEXT14;
		static const long ID_STATICTEXT15;
		static const long ID_CUSTOM4;
		static const long ID_STATICTEXT16;
		static const long ID_CUSTOM5;
		static const long ID_RADIOBUTTON13;
		static const long ID_RADIOBUTTON14;
		static const long ID_RADIOBUTTON15;
		static const long ID_STATICTEXT20;
		static const long ID_STATICTEXT21;
		static const long ID_CUSTOM6;
		static const long ID_STATICTEXT22;
		static const long ID_CUSTOM7;
		static const long ID_RADIOBUTTON19;
		static const long ID_RADIOBUTTON20;
		static const long ID_RADIOBUTTON21;
		static const long ID_STATICTEXT26;
		static const long ID_STATICTEXT27;
		static const long ID_CUSTOM10;
		static const long ID_STATICTEXT28;
		static const long ID_CUSTOM11;
		static const long ID_RADIOBUTTON16;
		static const long ID_RADIOBUTTON17;
		static const long ID_RADIOBUTTON18;
		static const long ID_STATICTEXT23;
		static const long ID_STATICTEXT24;
		static const long ID_CUSTOM8;
		static const long ID_STATICTEXT25;
		static const long ID_CUSTOM9;
		static const long ID_STATICTEXT33;
		static const long ID_TEXTCTRL14;
		static const long ID_STATICTEXT34;
		static const long ID_TEXTCTRL18;
		static const long ID_TEXTCTRL19;
		static const long ID_TEXTCTRL20;
		static const long ID_STATICTEXT36;
		static const long ID_STATICTEXT38;
		static const long ID_TEXTCTRL15;
		static const long ID_STATICTEXT35;
		static const long ID_STATICTEXT39;
		static const long ID_TEXTCTRL16;
		static const long ID_STATICTEXT37;
		static const long ID_STATICTEXT4;
		static const long ID_STATICTEXT5;
		static const long ID_TEXTCTRL6;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL7;
		static const long ID_CHECKBOX1;
		static const long ID_STATICTEXT3;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL2;
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
		void OnredFixedCheckSelect(wxCommandEvent& event);
		void OnredRandomCheckSelect(wxCommandEvent& event);
		void OngreenFixedCheckSelect(wxCommandEvent& event);
		void OngreenRandomCheckSelect(wxCommandEvent& event);
		void OnblueFixedCheckSelect(wxCommandEvent& event);
		void OnblueRandomCheckSelect(wxCommandEvent& event);
		void OnalphaFixedCheckSelect(wxCommandEvent& event);
		void OnalphaRandomCheckSelect(wxCommandEvent& event);
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
