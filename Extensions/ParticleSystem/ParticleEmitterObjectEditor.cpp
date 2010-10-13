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

#include "ParticleEmitterObjectEditor.h"

//(*InternalHeaders(ParticleEmitterObjectEditor)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/colordlg.h>
#include <wx/filedlg.h>

#include "GDL/Game.h"
#include "GDL/CommonTools.h"
#include "ParticleEmitterObject.h"
#include "GDL/MainEditorCommand.h"

//(*IdInit(ParticleEmitterObjectEditor)
const long ParticleEmitterObjectEditor::ID_STATICTEXT7 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON2 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON3 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT9 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL9 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT10 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL10 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT32 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL13 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON22 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON23 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT29 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL11 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT30 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL12 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT31 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON6 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON5 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON4 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT11 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT13 = wxNewId();
const long ParticleEmitterObjectEditor::ID_SPINCTRL1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT12 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON10 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON11 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON12 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT17 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT18 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM2 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT19 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM3 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON7 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON8 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON9 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT14 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT15 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM4 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT16 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM5 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON13 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON14 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON15 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT20 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT21 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM6 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT22 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM7 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON16 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON17 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON18 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT23 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT24 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM8 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT25 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM9 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON19 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON20 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON21 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT26 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT27 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM10 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT28 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM11 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CHECKBOX1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT3 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL2 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT4 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT5 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL6 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT6 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL7 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT2 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL3 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL4 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL5 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT8 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL8 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICLINE1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_BUTTON1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ParticleEmitterObjectEditor,wxDialog)
	//(*EventTable(ParticleEmitterObjectEditor)
	//*)
END_EVENT_TABLE()

ParticleEmitterObjectEditor::ParticleEmitterObjectEditor( wxWindow* parent, Game & game_, ParticleEmitterObject & object_, MainEditorCommand & mainEditorCommand_ ) :
game(game_),
mainEditorCommand(mainEditorCommand_),
object(object_)
{
	//(*Initialize(ParticleEmitterObjectEditor)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer16;
	wxFlexGridSizer* FlexGridSizer24;
	wxFlexGridSizer* FlexGridSizer19;
	wxFlexGridSizer* FlexGridSizer23;
	wxStaticBoxSizer* StaticBoxSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer27;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer25;
	wxFlexGridSizer* FlexGridSizer22;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxStaticBoxSizer* StaticBoxSizer9;
	wxFlexGridSizer* FlexGridSizer7;
	wxStaticBoxSizer* StaticBoxSizer7;
	wxStaticBoxSizer* StaticBoxSizer10;
	wxFlexGridSizer* FlexGridSizer29;
	wxStaticBoxSizer* StaticBoxSizer8;
	wxStaticBoxSizer* StaticBoxSizer3;
	wxStaticBoxSizer* StaticBoxSizer6;
	wxFlexGridSizer* FlexGridSizer15;
	wxFlexGridSizer* FlexGridSizer18;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer21;
	wxFlexGridSizer* FlexGridSizer14;
	wxFlexGridSizer* FlexGridSizer20;
	wxFlexGridSizer* FlexGridSizer13;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;
	wxFlexGridSizer* FlexGridSizer17;
	wxStaticBoxSizer* StaticBoxSizer5;
	wxFlexGridSizer* FlexGridSizer32;
	wxFlexGridSizer* FlexGridSizer31;
	wxFlexGridSizer* FlexGridSizer28;
	wxFlexGridSizer* FlexGridSizer26;
	wxFlexGridSizer* FlexGridSizer30;

	Create(parent, wxID_ANY, _("Editer l\'objet texte"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Rendu"));
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	FlexGridSizer10 = new wxFlexGridSizer(0, 4, 0, 0);
	StaticText7 = new wxStaticText(this, ID_STATICTEXT7, _("Mode de rendu :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer10->Add(StaticText7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	pointCheck = new wxRadioButton(this, ID_RADIOBUTTON2, _("Points"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON2"));
	FlexGridSizer10->Add(pointCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	lineCheck = new wxRadioButton(this, ID_RADIOBUTTON1, _("Lignes"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
	FlexGridSizer10->Add(lineCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	quadCheck = new wxRadioButton(this, ID_RADIOBUTTON3, _("Quadrilatère"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON3"));
	FlexGridSizer10->Add(quadCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 6, 0, 0);
	rendererParam1Txt = new wxStaticText(this, ID_STATICTEXT9, _("rendererParam1 :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer9->Add(rendererParam1Txt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	rendererParam1Edit = new wxTextCtrl(this, ID_TEXTCTRL9, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL9"));
	FlexGridSizer9->Add(rendererParam1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	rendererParam2Txt = new wxStaticText(this, ID_STATICTEXT10, _("rendererParam2 :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT10"));
	FlexGridSizer9->Add(rendererParam2Txt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	rendererParam2Edit = new wxTextCtrl(this, ID_TEXTCTRL10, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL10"));
	FlexGridSizer9->Add(rendererParam2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	textureTxt = new wxStaticText(this, ID_STATICTEXT32, _("Image :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT32"));
	FlexGridSizer9->Add(textureTxt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	textureEdit = new wxTextCtrl(this, ID_TEXTCTRL13, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL13"));
	FlexGridSizer9->Add(textureEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer32 = new wxFlexGridSizer(0, 3, 0, 0);
	alphaRenderingCheck = new wxRadioButton(this, ID_RADIOBUTTON22, _("Rendu normal"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON22"));
	FlexGridSizer32->Add(alphaRenderingCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	additiveRenderingCheck = new wxRadioButton(this, ID_RADIOBUTTON23, _("Rendu additif"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON23"));
	additiveRenderingCheck->SetValue(true);
	FlexGridSizer32->Add(additiveRenderingCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer32, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer3->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Particules"));
	FlexGridSizer30 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer30->AddGrowableCol(0);
	FlexGridSizer31 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText27 = new wxStaticText(this, ID_STATICTEXT29, _("Temps de vie : Entre"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT29"));
	FlexGridSizer31->Add(StaticText27, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	lifeTimeMinEdit = new wxTextCtrl(this, ID_TEXTCTRL11, wxEmptyString, wxDefaultPosition, wxSize(55,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL11"));
	FlexGridSizer31->Add(lifeTimeMinEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText28 = new wxStaticText(this, ID_STATICTEXT30, _("et"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT30"));
	FlexGridSizer31->Add(StaticText28, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	lifeTimeMaxEdit = new wxTextCtrl(this, ID_TEXTCTRL12, wxEmptyString, wxDefaultPosition, wxSize(55,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL12"));
	FlexGridSizer31->Add(lifeTimeMaxEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText29 = new wxStaticText(this, ID_STATICTEXT31, _("secondes"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT31"));
	FlexGridSizer31->Add(StaticText29, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer30->Add(FlexGridSizer31, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBoxSizer5 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Rouge"));
	FlexGridSizer12 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer14 = new wxFlexGridSizer(0, 3, 0, 0);
	redFixedCheck = new wxRadioButton(this, ID_RADIOBUTTON6, _("Fixé"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON6"));
	redFixedCheck->SetValue(true);
	FlexGridSizer14->Add(redFixedCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	redRandomCheck = new wxRadioButton(this, ID_RADIOBUTTON5, _("Aléatoire"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON5"));
	FlexGridSizer14->Add(redRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(FlexGridSizer14, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	redMutableCheck = new wxRadioButton(this, ID_RADIOBUTTON4, _("Changeant au cours du temps"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON4"));
	FlexGridSizer12->Add(redMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer13 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText9 = new wxStaticText(this, ID_STATICTEXT11, _("Valeur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT11"));
	FlexGridSizer13->Add(StaticText9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText11 = new wxStaticText(this, ID_STATICTEXT13, _("De"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT13"));
	FlexGridSizer13->Add(StaticText11, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	red1Edit = new wxSpinCtrlDouble(this,ID_SPINCTRL1,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_SPINCTRL1"));
	FlexGridSizer13->Add(red1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText10 = new wxStaticText(this, ID_STATICTEXT12, _("à"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT12"));
	FlexGridSizer13->Add(StaticText10, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	red2Edit = new wxSpinCtrlDouble(this,ID_CUSTOM1,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM1"));
	FlexGridSizer13->Add(red2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer5->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11->Add(StaticBoxSizer5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer7 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Vert"));
	FlexGridSizer18 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer19 = new wxFlexGridSizer(0, 3, 0, 0);
	greenFixedCheck = new wxRadioButton(this, ID_RADIOBUTTON10, _("Fixé"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON10"));
	greenFixedCheck->SetValue(true);
	FlexGridSizer19->Add(greenFixedCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	greenRandomCheck = new wxRadioButton(this, ID_RADIOBUTTON11, _("Aléatoire"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON11"));
	FlexGridSizer19->Add(greenRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer18->Add(FlexGridSizer19, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	greenMutableCheck = new wxRadioButton(this, ID_RADIOBUTTON12, _("Changeant au cours du temps"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON12"));
	FlexGridSizer18->Add(greenMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer20 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText15 = new wxStaticText(this, ID_STATICTEXT17, _("Valeur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT17"));
	FlexGridSizer20->Add(StaticText15, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText16 = new wxStaticText(this, ID_STATICTEXT18, _("De"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT18"));
	FlexGridSizer20->Add(StaticText16, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	green1Edit = new wxSpinCtrlDouble(this,ID_CUSTOM2,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM2"));
	FlexGridSizer20->Add(green1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText17 = new wxStaticText(this, ID_STATICTEXT19, _("à"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT19"));
	FlexGridSizer20->Add(StaticText17, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	green2Edit = new wxSpinCtrlDouble(this,ID_CUSTOM3,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM3"));
	FlexGridSizer20->Add(green2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer18->Add(FlexGridSizer20, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer7->Add(FlexGridSizer18, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11->Add(StaticBoxSizer7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer6 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Bleu"));
	FlexGridSizer15 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer16 = new wxFlexGridSizer(0, 3, 0, 0);
	blueFixedCheck = new wxRadioButton(this, ID_RADIOBUTTON7, _("Fixé"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON7"));
	blueFixedCheck->SetValue(true);
	FlexGridSizer16->Add(blueFixedCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	blueRandomCheck = new wxRadioButton(this, ID_RADIOBUTTON8, _("Aléatoire"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON8"));
	FlexGridSizer16->Add(blueRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer15->Add(FlexGridSizer16, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	blueMutableCheck = new wxRadioButton(this, ID_RADIOBUTTON9, _("Changeant au cours du temps"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON9"));
	FlexGridSizer15->Add(blueMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer17 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText12 = new wxStaticText(this, ID_STATICTEXT14, _("Valeur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT14"));
	FlexGridSizer17->Add(StaticText12, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText13 = new wxStaticText(this, ID_STATICTEXT15, _("De"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT15"));
	FlexGridSizer17->Add(StaticText13, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	blue1Edit = new wxSpinCtrlDouble(this,ID_CUSTOM4,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM4"));
	FlexGridSizer17->Add(blue1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText14 = new wxStaticText(this, ID_STATICTEXT16, _("à"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT16"));
	FlexGridSizer17->Add(StaticText14, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	blue2Edit = new wxSpinCtrlDouble(this,ID_CUSTOM5,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM5"));
	FlexGridSizer17->Add(blue2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer15->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer6->Add(FlexGridSizer15, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11->Add(StaticBoxSizer6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer8 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Transparence"));
	FlexGridSizer21 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer22 = new wxFlexGridSizer(0, 3, 0, 0);
	alphaFixedCheck = new wxRadioButton(this, ID_RADIOBUTTON13, _("Fixé"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON13"));
	alphaFixedCheck->SetValue(true);
	FlexGridSizer22->Add(alphaFixedCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	alphaRandomCheck = new wxRadioButton(this, ID_RADIOBUTTON14, _("Aléatoire"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON14"));
	FlexGridSizer22->Add(alphaRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer21->Add(FlexGridSizer22, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	alphaMutableCheck = new wxRadioButton(this, ID_RADIOBUTTON15, _("Changeant au cours du temps"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON15"));
	FlexGridSizer21->Add(alphaMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer23 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText18 = new wxStaticText(this, ID_STATICTEXT20, _("Valeur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT20"));
	FlexGridSizer23->Add(StaticText18, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText19 = new wxStaticText(this, ID_STATICTEXT21, _("De"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT21"));
	FlexGridSizer23->Add(StaticText19, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	alpha1Edit = new wxSpinCtrlDouble(this,ID_CUSTOM6,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM6"));
	FlexGridSizer23->Add(alpha1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText20 = new wxStaticText(this, ID_STATICTEXT22, _("à"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT22"));
	FlexGridSizer23->Add(StaticText20, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	alpha2Edit = new wxSpinCtrlDouble(this,ID_CUSTOM7,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM7"));
	FlexGridSizer23->Add(alpha2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer21->Add(FlexGridSizer23, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer8->Add(FlexGridSizer21, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11->Add(StaticBoxSizer8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer9 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Bleu"));
	FlexGridSizer24 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer25 = new wxFlexGridSizer(0, 3, 0, 0);
	RadioButton4 = new wxRadioButton(this, ID_RADIOBUTTON16, _("Fixé"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON16"));
	RadioButton4->SetValue(true);
	FlexGridSizer25->Add(RadioButton4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	RadioButton5 = new wxRadioButton(this, ID_RADIOBUTTON17, _("Aléatoire"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON17"));
	FlexGridSizer25->Add(RadioButton5, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer24->Add(FlexGridSizer25, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	RadioButton6 = new wxRadioButton(this, ID_RADIOBUTTON18, _("Changeant au cours du temps"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON18"));
	FlexGridSizer24->Add(RadioButton6, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer26 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText21 = new wxStaticText(this, ID_STATICTEXT23, _("Valeur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT23"));
	FlexGridSizer26->Add(StaticText21, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText22 = new wxStaticText(this, ID_STATICTEXT24, _("De"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT24"));
	FlexGridSizer26->Add(StaticText22, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Custom1 = new wxSpinCtrlDouble(this,ID_CUSTOM8,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM8"));
	FlexGridSizer26->Add(Custom1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText23 = new wxStaticText(this, ID_STATICTEXT25, _("à"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT25"));
	FlexGridSizer26->Add(StaticText23, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Custom2 = new wxSpinCtrlDouble(this,ID_CUSTOM9,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM9"));
	FlexGridSizer26->Add(Custom2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer24->Add(FlexGridSizer26, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer9->Add(FlexGridSizer24, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11->Add(StaticBoxSizer9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer10 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Bleu"));
	FlexGridSizer27 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer28 = new wxFlexGridSizer(0, 3, 0, 0);
	RadioButton7 = new wxRadioButton(this, ID_RADIOBUTTON19, _("Fixé"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON19"));
	RadioButton7->SetValue(true);
	FlexGridSizer28->Add(RadioButton7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	RadioButton8 = new wxRadioButton(this, ID_RADIOBUTTON20, _("Aléatoire"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON20"));
	FlexGridSizer28->Add(RadioButton8, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer27->Add(FlexGridSizer28, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	RadioButton9 = new wxRadioButton(this, ID_RADIOBUTTON21, _("Changeant au cours du temps"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON21"));
	FlexGridSizer27->Add(RadioButton9, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer29 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText24 = new wxStaticText(this, ID_STATICTEXT26, _("Valeur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT26"));
	FlexGridSizer29->Add(StaticText24, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText25 = new wxStaticText(this, ID_STATICTEXT27, _("De"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT27"));
	FlexGridSizer29->Add(StaticText25, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Custom3 = new wxSpinCtrlDouble(this,ID_CUSTOM10,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM10"));
	FlexGridSizer29->Add(Custom3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText26 = new wxStaticText(this, ID_STATICTEXT28, _("à"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT28"));
	FlexGridSizer29->Add(StaticText26, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Custom4 = new wxSpinCtrlDouble(this,ID_CUSTOM11,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM11"));
	FlexGridSizer29->Add(Custom4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer27->Add(FlexGridSizer29, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer10->Add(FlexGridSizer27, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11->Add(StaticBoxSizer10, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer30->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer4->Add(FlexGridSizer30, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Emission"));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer6->AddGrowableCol(2);
	infiniteTankCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Capacité infinie"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	infiniteTankCheck->SetValue(false);
	FlexGridSizer6->Add(infiniteTankCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("Capacité :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer6->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	tankEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer6->Add(tankEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(2,2,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Flux :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	flowEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer6->Add(flowEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(2,2,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Force d\'émission :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer6->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5 = new wxFlexGridSizer(0, 4, 0, 0);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT5, _("Entre"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer5->Add(StaticText5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	emitterForceMinEdit = new wxTextCtrl(this, ID_TEXTCTRL6, wxEmptyString, wxDefaultPosition, wxSize(66,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL6"));
	FlexGridSizer5->Add(emitterForceMinEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText6 = new wxStaticText(this, ID_STATICTEXT6, _("et"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer5->Add(StaticText6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	emitterForceMaxEdit = new wxTextCtrl(this, ID_TEXTCTRL7, wxEmptyString, wxDefaultPosition, wxSize(66,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL7"));
	FlexGridSizer5->Add(emitterForceMaxEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Gravité"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Gravité appliquée aux particules :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer3->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	gravityXEdit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	FlexGridSizer4->Add(gravityXEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	gravityYEdit = new wxTextCtrl(this, ID_TEXTCTRL4, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	FlexGridSizer4->Add(gravityYEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	gravityZEdit = new wxTextCtrl(this, ID_TEXTCTRL5, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
	FlexGridSizer4->Add(gravityZEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText8 = new wxStaticText(this, ID_STATICTEXT8, _("Friction :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer3->Add(StaticText8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer8->AddGrowableCol(0);
	frictionEdit = new wxTextCtrl(this, ID_TEXTCTRL8, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL8"));
	FlexGridSizer8->Add(frictionEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_RADIOBUTTON2,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnpointCheckSelect);
	Connect(ID_RADIOBUTTON1,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnLineCheckSelect);
	Connect(ID_RADIOBUTTON3,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnQuadCheckSelect);
	Connect(ID_RADIOBUTTON6,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnredFixedCheckSelect);
	Connect(ID_RADIOBUTTON5,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnredRandomCheckSelect);
	Connect(ID_RADIOBUTTON4,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnredRandomCheckSelect);
	Connect(ID_RADIOBUTTON10,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OngreenFixedCheckSelect);
	Connect(ID_RADIOBUTTON11,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OngreenRandomCheckSelect);
	Connect(ID_RADIOBUTTON12,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OngreenRandomCheckSelect);
	Connect(ID_RADIOBUTTON7,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnblueFixedCheckSelect);
	Connect(ID_RADIOBUTTON8,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnblueRandomCheckSelect);
	Connect(ID_RADIOBUTTON9,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnblueRandomCheckSelect);
	Connect(ID_RADIOBUTTON13,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnalphaFixedCheckSelect);
	Connect(ID_RADIOBUTTON14,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnalphaRandomCheckSelect);
	Connect(ID_RADIOBUTTON15,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnalphaRandomCheckSelect);
	Connect(ID_CHECKBOX1,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OninfiniteTankCheckClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OncancelBtClick);
	//*)

    if ( object.GetTank() == -1 )
    {
        infiniteTankCheck->SetValue(true);
        tankEdit->Enable(false);
    }
    else
        tankEdit->SetValue(ToString(object.GetTank()));

    rendererParam1Edit->SetValue(ToString(object.GetRendererParam1()));
    rendererParam2Edit->SetValue(ToString(object.GetRendererParam2()));
    textureEdit->SetValue(object.GetParticleTexture());
    if ( object.GetRendererType() == ParticleEmitterObject::Line )
    {
        PrepareControlsForLineRenderer();
        lineCheck->SetValue(true);
    }
    else if ( object.GetRendererType() == ParticleEmitterObject::Quad )
    {
        PrepareControlsForQuadRenderer();
        quadCheck->SetValue(true);
    }
    else PrepareControlsForPointRenderer();

    if ( !object.IsRenderingAdditive() ) alphaRenderingCheck->SetValue(true);

    flowEdit->SetValue(ToString(object.GetFlow()));
    emitterForceMinEdit->SetValue(ToString(object.GetEmitterForceMin()));
    emitterForceMaxEdit->SetValue(ToString(object.GetEmitterForceMax()));
    gravityXEdit->SetValue(ToString(object.GetParticleGravityX()));
    gravityYEdit->SetValue(ToString(object.GetParticleGravityY()));
    gravityZEdit->SetValue(ToString(object.GetParticleGravityZ()));
    frictionEdit->SetValue(ToString(object.GetFriction()));
    lifeTimeMinEdit->SetValue(ToString(object.GetParticleLifeTimeMin()));
    lifeTimeMaxEdit->SetValue(ToString(object.GetParticleLifeTimeMax()));

    red1Edit->SetValue(ToString(object.GetParticleRed1()));
    red2Edit->SetValue(ToString(object.GetParticleRed2()));
    green1Edit->SetValue(ToString(object.GetParticleGreen1()));
    green2Edit->SetValue(ToString(object.GetParticleGreen2()));
    blue1Edit->SetValue(ToString(object.GetParticleBlue1()));
    blue2Edit->SetValue(ToString(object.GetParticleBlue2()));
    alpha1Edit->SetValue(ToString(object.GetParticleAlpha1()));
    alpha2Edit->SetValue(ToString(object.GetParticleAlpha2()));
    if ( object.GetRedParameterType() == ParticleEmitterObject::Random )
    {
        redRandomCheck->SetValue(true);
        red2Edit->Enable(true);
    }
    else if ( object.GetRedParameterType() == ParticleEmitterObject::Mutable )
    {
        redMutableCheck->SetValue(true);
        red2Edit->Enable(true);
    }
    if ( object.GetGreenParameterType() == ParticleEmitterObject::Random )
    {
        greenRandomCheck->SetValue(true);
        green2Edit->Enable(true);
    }
    else if ( object.GetGreenParameterType() == ParticleEmitterObject::Mutable )
    {
        greenMutableCheck->SetValue(true);
        green2Edit->Enable(true);
    }
    if ( object.GetBlueParameterType() == ParticleEmitterObject::Random )
    {
        blueRandomCheck->SetValue(true);
        blue2Edit->Enable(true);
    }
    else if ( object.GetBlueParameterType() == ParticleEmitterObject::Mutable )
    {
        blueMutableCheck->SetValue(true);
        blue2Edit->Enable(true);
    }
    if ( object.GetAlphaParameterType() == ParticleEmitterObject::Random )
    {
        alphaRandomCheck->SetValue(true);
        alpha2Edit->Enable(true);
    }
    else if ( object.GetAlphaParameterType() == ParticleEmitterObject::Mutable )
    {
        alphaMutableCheck->SetValue(true);
        alpha2Edit->Enable(true);
    }
}

ParticleEmitterObjectEditor::~ParticleEmitterObjectEditor()
{
	//(*Destroy(ParticleEmitterObjectEditor)
	//*)
}
void ParticleEmitterObjectEditor::OnokBtClick(wxCommandEvent& event)
{
    if ( infiniteTankCheck->GetValue() ) object.SetTank(-1);
    else object.SetTank(ToFloat(tankEdit->GetValue().mb_str()));

    if ( lineCheck->GetValue() ) object.SetRendererType(ParticleEmitterObject::Line);
    else if ( quadCheck->GetValue() ) object.SetRendererType(ParticleEmitterObject::Quad);
    else object.SetRendererType(ParticleEmitterObject::Point);

    if ( alphaRenderingCheck->GetValue() ) object.SetRenderingAlpha();
    else object.SetRenderingAdditive();

    object.SetFlow(ToFloat(flowEdit->GetValue().mb_str()));
    object.SetEmitterForceMin(ToFloat(emitterForceMinEdit->GetValue().mb_str()));
    object.SetEmitterForceMax(ToFloat(emitterForceMaxEdit->GetValue().mb_str()));
    object.SetParticleGravityX(ToFloat(gravityXEdit->GetValue().mb_str()));
    object.SetParticleGravityY(ToFloat(gravityYEdit->GetValue().mb_str()));
    object.SetParticleGravityZ(ToFloat(gravityZEdit->GetValue().mb_str()));
    object.SetRendererParam1(ToFloat(rendererParam1Edit->GetValue().mb_str()));
    object.SetRendererParam2(ToFloat(rendererParam2Edit->GetValue().mb_str()));
    object.SetParticleLifeTimeMin(ToFloat(lifeTimeMinEdit->GetValue().mb_str()));
    object.SetParticleLifeTimeMax(ToFloat(lifeTimeMaxEdit->GetValue().mb_str()));

    object.SetParticleRed1(red1Edit->GetValue());
    object.SetParticleRed2(red2Edit->GetValue());
    object.SetParticleGreen1(green1Edit->GetValue());
    object.SetParticleGreen2(green2Edit->GetValue());
    object.SetParticleBlue1(blue1Edit->GetValue());
    object.SetParticleBlue2(blue2Edit->GetValue());
    object.SetParticleAlpha1(alpha1Edit->GetValue());
    object.SetParticleAlpha2(alpha2Edit->GetValue());
    if ( redRandomCheck->GetValue() ) object.SetRedParameterType(ParticleEmitterObject::Random);
    else if ( redMutableCheck->GetValue() ) object.SetRedParameterType(ParticleEmitterObject::Mutable);
    else object.SetRedParameterType(ParticleEmitterObject::Enabled);
    if ( greenRandomCheck->GetValue() ) object.SetGreenParameterType(ParticleEmitterObject::Random);
    else if ( greenMutableCheck->GetValue() ) object.SetGreenParameterType(ParticleEmitterObject::Mutable);
    else object.SetGreenParameterType(ParticleEmitterObject::Enabled);
    if ( blueRandomCheck->GetValue() ) object.SetBlueParameterType(ParticleEmitterObject::Random);
    else if ( blueMutableCheck->GetValue() ) object.SetBlueParameterType(ParticleEmitterObject::Mutable);
    else object.SetBlueParameterType(ParticleEmitterObject::Enabled);
    if ( alphaRandomCheck->GetValue() ) object.SetAlphaParameterType(ParticleEmitterObject::Random);
    else if ( alphaMutableCheck->GetValue() ) object.SetAlphaParameterType(ParticleEmitterObject::Mutable);
    else object.SetAlphaParameterType(ParticleEmitterObject::Enabled);

    object.SetParticleTexture(string(textureEdit->GetValue().mb_str()));

    EndModal(1);
}

void ParticleEmitterObjectEditor::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void ParticleEmitterObjectEditor::PrepareControlsForPointRenderer()
{
    rendererParam1Txt->Show();
    rendererParam1Edit->Show();
    rendererParam2Txt->Show(false);
    rendererParam2Edit->Show(false);
    textureTxt->Show(false);
    textureEdit->Show(false);

    rendererParam1Txt->SetLabel(_("Taille :"));
    Layout();
}

void ParticleEmitterObjectEditor::PrepareControlsForQuadRenderer()
{
    rendererParam1Txt->Show();
    rendererParam1Edit->Show();
    rendererParam2Txt->Show();
    rendererParam2Edit->Show();
    textureTxt->Show(true);
    textureEdit->Show(true);

    rendererParam1Txt->SetLabel(_("Echelle de la taille en X :"));
    rendererParam2Txt->SetLabel(_("Echelle de la taille en Y :"));
    Layout();
}

void ParticleEmitterObjectEditor::PrepareControlsForLineRenderer()
{
    rendererParam1Txt->Show();
    rendererParam1Edit->Show();
    rendererParam2Txt->Show();
    rendererParam2Edit->Show();
    textureTxt->Show(false);
    textureEdit->Show(false);

    rendererParam1Txt->SetLabel(_("Longueur :"));
    rendererParam2Txt->SetLabel(_("Largeur :"));
    Layout();
}

void ParticleEmitterObjectEditor::OnpointCheckSelect(wxCommandEvent& event)
{
    PrepareControlsForPointRenderer();
}
void ParticleEmitterObjectEditor::OnLineCheckSelect(wxCommandEvent& event)
{
    PrepareControlsForLineRenderer();
}
void ParticleEmitterObjectEditor::OnQuadCheckSelect(wxCommandEvent& event)
{
    PrepareControlsForQuadRenderer();
}

void ParticleEmitterObjectEditor::OninfiniteTankCheckClick(wxCommandEvent& event)
{
    tankEdit->Enable(!infiniteTankCheck->GetValue());
}

void ParticleEmitterObjectEditor::OnredFixedCheckSelect(wxCommandEvent& event)
{
    red2Edit->Enable(false);
}

void ParticleEmitterObjectEditor::OnredRandomCheckSelect(wxCommandEvent& event)
{
    red2Edit->Enable(true);
}

void ParticleEmitterObjectEditor::OngreenFixedCheckSelect(wxCommandEvent& event)
{
    green2Edit->Enable(false);
}

void ParticleEmitterObjectEditor::OngreenRandomCheckSelect(wxCommandEvent& event)
{
    green2Edit->Enable(true);
}

void ParticleEmitterObjectEditor::OnblueFixedCheckSelect(wxCommandEvent& event)
{
    blue2Edit->Enable(false);
}

void ParticleEmitterObjectEditor::OnblueRandomCheckSelect(wxCommandEvent& event)
{
    blue2Edit->Enable(true);
}

void ParticleEmitterObjectEditor::OnalphaFixedCheckSelect(wxCommandEvent& event)
{
    alpha2Edit->Enable(false);
}

void ParticleEmitterObjectEditor::OnalphaRandomCheckSelect(wxCommandEvent& event)
{
    alpha2Edit->Enable(true);
}


#endif
