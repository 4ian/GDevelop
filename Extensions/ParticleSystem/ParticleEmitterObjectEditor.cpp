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
	wxStaticBoxSizer* StaticBoxSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxStaticBoxSizer* StaticBoxSizer3;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;

	Create(parent, wxID_ANY, _("Editer l\'objet texte"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Rendu"));
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	FlexGridSizer10 = new wxFlexGridSizer(0, 4, 0, 0);
	StaticText7 = new wxStaticText(this, ID_STATICTEXT7, _("Mode de rendu :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer10->Add(StaticText7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	pointCheck = new wxRadioButton(this, ID_RADIOBUTTON2, _("Points"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON2"));
	FlexGridSizer10->Add(pointCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	LineCheck = new wxRadioButton(this, ID_RADIOBUTTON1, _("Lignes"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
	FlexGridSizer10->Add(LineCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	QuadCheck = new wxRadioButton(this, ID_RADIOBUTTON3, _("Quadrilatère"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON3"));
	FlexGridSizer10->Add(QuadCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 4, 0, 0);
	rendererParam1Txt = new wxStaticText(this, ID_STATICTEXT9, _("rendererParam1 :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer9->Add(rendererParam1Txt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	rendererParam1Edit = new wxTextCtrl(this, ID_TEXTCTRL9, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL9"));
	FlexGridSizer9->Add(rendererParam1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	rendererParam2Txt = new wxStaticText(this, ID_STATICTEXT10, _("rendererParam2 :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT10"));
	FlexGridSizer9->Add(rendererParam2Txt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	rendererParam2Edit = new wxTextCtrl(this, ID_TEXTCTRL10, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL10"));
	FlexGridSizer9->Add(rendererParam2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer3->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Particules"));
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBoxSizer4->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
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
    if ( object.GetRendererType() == ParticleEmitterObject::Line ) PrepareControlsForLineRenderer();
    else if ( object.GetRendererType() == ParticleEmitterObject::Quad ) PrepareControlsForQuadRenderer();
    else PrepareControlsForPointRenderer();

    flowEdit->SetValue(ToString(object.GetFlow()));
    emitterForceMinEdit->SetValue(ToString(object.GetEmitterForceMin()));
    emitterForceMaxEdit->SetValue(ToString(object.GetEmitterForceMax()));
    gravityXEdit->SetValue(ToString(object.GetParticleGravityX()));
    gravityYEdit->SetValue(ToString(object.GetParticleGravityY()));
    gravityZEdit->SetValue(ToString(object.GetParticleGravityZ()));
    frictionEdit->SetValue(ToString(object.GetFriction()));
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

    if ( LineCheck->GetValue() ) object.SetRendererType(ParticleEmitterObject::Line);
    else if ( QuadCheck->GetValue() ) object.SetRendererType(ParticleEmitterObject::Quad);
    else object.SetRendererType(ParticleEmitterObject::Point);

    object.SetFlow(ToFloat(flowEdit->GetValue().mb_str()));
    object.SetEmitterForceMin(ToFloat(emitterForceMinEdit->GetValue().mb_str()));
    object.SetEmitterForceMax(ToFloat(emitterForceMaxEdit->GetValue().mb_str()));
    object.SetParticleGravityX(ToFloat(gravityXEdit->GetValue().mb_str()));
    object.SetParticleGravityY(ToFloat(gravityYEdit->GetValue().mb_str()));
    object.SetParticleGravityZ(ToFloat(gravityZEdit->GetValue().mb_str()));
    object.SetRendererParam1(ToFloat(rendererParam1Edit->GetValue().mb_str()));
    object.SetRendererParam2(ToFloat(rendererParam2Edit->GetValue().mb_str()));

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

    rendererParam1Txt->SetLabel(_("Taille :"));
    Layout();
}

void ParticleEmitterObjectEditor::PrepareControlsForQuadRenderer()
{
    Layout();
}

void ParticleEmitterObjectEditor::PrepareControlsForLineRenderer()
{
    rendererParam1Txt->Show();
    rendererParam1Edit->Show();
    rendererParam2Txt->Show();
    rendererParam2Edit->Show();

    rendererParam1Txt->SetLabel(_("Largeur :"));
    rendererParam1Txt->SetLabel(_("Longueur :"));
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


#endif
