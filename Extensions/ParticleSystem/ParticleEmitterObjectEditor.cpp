/**

Game Develop - Particle System Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

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

#include "ParticleEmitterObjectEditor.h"

//(*InternalHeaders(ParticleEmitterObjectEditor)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "GDCore/Tools/Log.h"
#include <wx/msgdlg.h>
#include <wx/colordlg.h>
#include <wx/filedlg.h>

#include "GDCpp/Project.h"
#include "GDCpp/CommonTools.h"
#include "ParticleEmitterObject.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/ResourcesEditor.h"
#include "GDCore/Tools/Localization.h"

using namespace std;

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
const long ParticleEmitterObjectEditor::ID_BITMAPBUTTON1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON22 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON23 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT29 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL11 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT30 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL12 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT31 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CHECKBOX1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT3 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL2 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT62 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL24 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT40 = wxNewId();
const long ParticleEmitterObjectEditor::ID_COLOURPICKERCTRL1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT41 = wxNewId();
const long ParticleEmitterObjectEditor::ID_COLOURPICKERCTRL2 = wxNewId();
const long ParticleEmitterObjectEditor::ID_PANEL3 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON6 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON5 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON4 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT13 = wxNewId();
const long ParticleEmitterObjectEditor::ID_SPINCTRL1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT12 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON10 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON11 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON12 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT18 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM2 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT19 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM3 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON7 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON8 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON9 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT15 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM4 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT16 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM5 = wxNewId();
const long ParticleEmitterObjectEditor::ID_PANEL2 = wxNewId();
const long ParticleEmitterObjectEditor::ID_NOTEBOOK1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON13 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON14 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT42 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM12 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT61 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM17 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT17 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM6 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM7 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON26 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON27 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT44 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL28 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT58 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT59 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL27 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT60 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT20 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL17 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL29 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON25 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON24 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT43 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM13 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT56 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT55 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM14 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT54 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT57 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT21 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM8 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM9 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT4 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT5 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL6 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT6 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL7 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT33 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL14 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT48 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL22 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT49 = wxNewId();
const long ParticleEmitterObjectEditor::ID_PANEL5 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT34 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL20 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT36 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT38 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL15 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT11 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT39 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL16 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT14 = wxNewId();
const long ParticleEmitterObjectEditor::ID_PANEL4 = wxNewId();
const long ParticleEmitterObjectEditor::ID_NOTEBOOK2 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT50 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL23 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT52 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL25 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT53 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT51 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL26 = wxNewId();
const long ParticleEmitterObjectEditor::ID_PANEL7 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT2 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL3 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL4 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL5 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT8 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL8 = wxNewId();
const long ParticleEmitterObjectEditor::ID_PANEL6 = wxNewId();
const long ParticleEmitterObjectEditor::ID_NOTEBOOK3 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CHECKBOX2 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICLINE1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_BUTTON3 = wxNewId();
const long ParticleEmitterObjectEditor::ID_BUTTON1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_BUTTON2 = wxNewId();
const long ParticleEmitterObjectEditor::ID_PANEL1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ParticleEmitterObjectEditor,wxDialog)
	//(*EventTable(ParticleEmitterObjectEditor)
	//*)
END_EVENT_TABLE()

ParticleEmitterObjectEditor::ParticleEmitterObjectEditor( wxWindow* parent, gd::Project & game_, ParticleEmitterObject & object_, gd::MainFrameWrapper & mainFrameWrapper ) :
game(game_),
object(object_)
{
	//(*Initialize(ParticleEmitterObjectEditor)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer45;
	wxFlexGridSizer* FlexGridSizer59;
	wxFlexGridSizer* FlexGridSizer54;
	wxFlexGridSizer* FlexGridSizer16;
	wxFlexGridSizer* FlexGridSizer24;
	wxFlexGridSizer* FlexGridSizer19;
	wxStaticBoxSizer* StaticBoxSizer12;
	wxFlexGridSizer* FlexGridSizer38;
	wxFlexGridSizer* FlexGridSizer23;
	wxStaticBoxSizer* StaticBoxSizer15;
	wxFlexGridSizer* FlexGridSizer41;
	wxFlexGridSizer* FlexGridSizer51;
	wxStaticBoxSizer* StaticBoxSizer14;
	wxStaticBoxSizer* StaticBoxSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer27;
	wxFlexGridSizer* FlexGridSizer44;
	wxFlexGridSizer* FlexGridSizer37;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer25;
	wxFlexGridSizer* FlexGridSizer22;
	wxFlexGridSizer* FlexGridSizer56;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxBoxSizer* BoxSizer2;
	wxFlexGridSizer* FlexGridSizer53;
	wxFlexGridSizer* FlexGridSizer7;
	wxStaticBoxSizer* StaticBoxSizer7;
	wxFlexGridSizer* FlexGridSizer55;
	wxStaticBoxSizer* StaticBoxSizer13;
	wxFlexGridSizer* FlexGridSizer57;
	wxFlexGridSizer* FlexGridSizer52;
	wxFlexGridSizer* FlexGridSizer34;
	wxFlexGridSizer* FlexGridSizer29;
	wxStaticBoxSizer* StaticBoxSizer3;
	wxGridSizer* GridSizer1;
	wxFlexGridSizer* FlexGridSizer49;
	wxStaticBoxSizer* StaticBoxSizer6;
	wxFlexGridSizer* FlexGridSizer15;
	wxFlexGridSizer* FlexGridSizer18;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer21;
	wxFlexGridSizer* FlexGridSizer14;
	wxStaticBoxSizer* StaticBoxSizer11;
	wxFlexGridSizer* FlexGridSizer20;
	wxBoxSizer* BoxSizer1;
	wxFlexGridSizer* FlexGridSizer50;
	wxFlexGridSizer* FlexGridSizer13;
	wxFlexGridSizer* FlexGridSizer35;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer36;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer46;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer33;
	wxFlexGridSizer* FlexGridSizer43;
	wxFlexGridSizer* FlexGridSizer11;
	wxBoxSizer* BoxSizer3;
	wxFlexGridSizer* FlexGridSizer17;
	wxStaticBoxSizer* StaticBoxSizer5;
	wxFlexGridSizer* FlexGridSizer32;
	wxFlexGridSizer* FlexGridSizer31;
	wxFlexGridSizer* FlexGridSizer40;
	wxFlexGridSizer* FlexGridSizer39;
	wxFlexGridSizer* FlexGridSizer28;
	wxFlexGridSizer* FlexGridSizer26;
	wxFlexGridSizer* FlexGridSizer60;
	wxFlexGridSizer* FlexGridSizer30;

	Create(parent, wxID_ANY, _("Edit the particle emitter"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	Core = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(1);
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Rendering"));
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	FlexGridSizer10 = new wxFlexGridSizer(0, 4, 0, 0);
	StaticText7 = new wxStaticText(Core, ID_STATICTEXT7, _("Renderering mode :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer10->Add(StaticText7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	pointCheck = new wxRadioButton(Core, ID_RADIOBUTTON2, _("Points"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON2"));
	FlexGridSizer10->Add(pointCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	lineCheck = new wxRadioButton(Core, ID_RADIOBUTTON1, _("Line"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
	FlexGridSizer10->Add(lineCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	quadCheck = new wxRadioButton(Core, ID_RADIOBUTTON3, _("Quad"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON3"));
	FlexGridSizer10->Add(quadCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 10, 0, 0);
	rendererParam1Txt = new wxStaticText(Core, ID_STATICTEXT9, _("rendererParam1 :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer9->Add(rendererParam1Txt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	rendererParam1Edit = new wxTextCtrl(Core, ID_TEXTCTRL9, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL9"));
	FlexGridSizer9->Add(rendererParam1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	rendererParam2Txt = new wxStaticText(Core, ID_STATICTEXT10, _("rendererParam2 :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT10"));
	FlexGridSizer9->Add(rendererParam2Txt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	rendererParam2Edit = new wxTextCtrl(Core, ID_TEXTCTRL10, wxEmptyString, wxDefaultPosition, wxSize(-1,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL10"));
	FlexGridSizer9->Add(rendererParam2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	textureTxt = new wxStaticText(Core, ID_STATICTEXT32, _("Image :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT32"));
	FlexGridSizer9->Add(textureTxt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	textureEdit = new wxTextCtrl(Core, ID_TEXTCTRL13, wxEmptyString, wxDefaultPosition, wxSize(179,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL13"));
	FlexGridSizer9->Add(textureEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	imageChooseBt = new wxBitmapButton(Core, ID_BITMAPBUTTON1, wxBitmap(wxImage(_T("res/addfromimagebanque.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON1"));
	FlexGridSizer9->Add(imageChooseBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer22 = new wxFlexGridSizer(0, 3, 0, 0);
	alphaRenderingCheck = new wxRadioButton(Core, ID_RADIOBUTTON22, _("Standard rendering"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON22"));
	FlexGridSizer22->Add(alphaRenderingCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	additiveRenderingCheck = new wxRadioButton(Core, ID_RADIOBUTTON23, _("Additive rendering"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON23"));
	additiveRenderingCheck->SetValue(true);
	FlexGridSizer22->Add(additiveRenderingCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer22, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer3->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer6->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer33 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer33->AddGrowableCol(0);
	StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Particles"));
	FlexGridSizer31 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer26 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer60 = new wxFlexGridSizer(0, 7, 0, 0);
	StaticText27 = new wxStaticText(Core, ID_STATICTEXT29, _("Lifetime : Between"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT29"));
	FlexGridSizer60->Add(StaticText27, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	lifeTimeMinEdit = new wxTextCtrl(Core, ID_TEXTCTRL11, wxEmptyString, wxDefaultPosition, wxSize(55,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL11"));
	lifeTimeMinEdit->SetToolTip(_("Minimum lifetime"));
	FlexGridSizer60->Add(lifeTimeMinEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText28 = new wxStaticText(Core, ID_STATICTEXT30, _("and"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT30"));
	FlexGridSizer60->Add(StaticText28, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	lifeTimeMaxEdit = new wxTextCtrl(Core, ID_TEXTCTRL12, wxEmptyString, wxDefaultPosition, wxSize(55,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL12"));
	lifeTimeMaxEdit->SetToolTip(_("Maximum lifetime"));
	FlexGridSizer60->Add(lifeTimeMaxEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText29 = new wxStaticText(Core, ID_STATICTEXT31, _("seconds"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT31"));
	FlexGridSizer60->Add(StaticText29, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer26->Add(FlexGridSizer60, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer39 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer39->AddGrowableCol(2);
	infiniteTankCheck = new wxCheckBox(Core, ID_CHECKBOX1, _("Unlimited capacity"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	infiniteTankCheck->SetValue(false);
	infiniteTankCheck->SetToolTip(_("If this box is checked, the emitter will keep emit particles."));
	FlexGridSizer39->Add(infiniteTankCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(Core, ID_STATICTEXT3, _("Capacity :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer39->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	tankEdit = new wxTextCtrl(Core, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	tankEdit->SetToolTip(_("Available particles number."));
	FlexGridSizer39->Add(tankEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer26->Add(FlexGridSizer39, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer37 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer37->AddGrowableCol(1);
	StaticText1 = new wxStaticText(Core, ID_STATICTEXT1, _("Flow :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer37->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	flowEdit = new wxTextCtrl(Core, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	flowEdit->SetToolTip(_("Number of particles emitted ( by seconds ). -1 to emit everything in a single shot."));
	FlexGridSizer37->Add(flowEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer26->Add(FlexGridSizer37, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer59 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer59->AddGrowableCol(1);
	StaticText59 = new wxStaticText(Core, ID_STATICTEXT62, _("Maximum particles number:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT62"));
	FlexGridSizer59->Add(StaticText59, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	maxParticleNbEdit = new wxTextCtrl(Core, ID_TEXTCTRL24, _("5000"), wxDefaultPosition, wxSize(37,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL24"));
	FlexGridSizer59->Add(maxParticleNbEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer26->Add(FlexGridSizer59, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer31->Add(FlexGridSizer26, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer24 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer24->AddGrowableCol(0);
	FlexGridSizer24->AddGrowableRow(0);
	particleNotebook = new wxNotebook(Core, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
	Panel2 = new wxPanel(particleNotebook, ID_PANEL3, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	FlexGridSizer40 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer40->AddGrowableCol(0);
	FlexGridSizer40->AddGrowableRow(0);
	StaticBoxSizer12 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Color"));
	FlexGridSizer43 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticText37 = new wxStaticText(Panel2, ID_STATICTEXT40, _("Initial particles color :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT40"));
	FlexGridSizer43->Add(StaticText37, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	simpleColor1Bt = new wxColourPickerCtrl(Panel2, ID_COLOURPICKERCTRL1, wxColour(0,0,0), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_COLOURPICKERCTRL1"));
	FlexGridSizer43->Add(simpleColor1Bt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText38 = new wxStaticText(Panel2, ID_STATICTEXT41, _("Final particles color :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT41"));
	FlexGridSizer43->Add(StaticText38, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	simpleColor2Bt = new wxColourPickerCtrl(Panel2, ID_COLOURPICKERCTRL2, wxColour(0,0,0), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_COLOURPICKERCTRL2"));
	FlexGridSizer43->Add(simpleColor2Bt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer12->Add(FlexGridSizer43, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer40->Add(StaticBoxSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel2->SetSizer(FlexGridSizer40);
	FlexGridSizer40->Fit(Panel2);
	FlexGridSizer40->SetSizeHints(Panel2);
	Panel1 = new wxPanel(particleNotebook, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	FlexGridSizer12 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer12->AddGrowableCol(0);
	FlexGridSizer12->AddGrowableRow(0);
	GridSizer1 = new wxGridSizer(0, 3, 0, 0);
	StaticBoxSizer5 = new wxStaticBoxSizer(wxHORIZONTAL, Panel1, _("Red"));
	FlexGridSizer13 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer13->AddGrowableCol(0);
	FlexGridSizer14 = new wxFlexGridSizer(0, 3, 0, 0);
	redFixedCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON6, _("Fixed"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON6"));
	redFixedCheck->SetValue(true);
	FlexGridSizer14->Add(redFixedCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	redRandomCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON5, _("Random"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON5"));
	FlexGridSizer14->Add(redRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer13->Add(FlexGridSizer14, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	redMutableCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON4, _("Changing over time"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON4"));
	FlexGridSizer13->Add(redMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer15 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText11 = new wxStaticText(Panel1, ID_STATICTEXT13, _("From"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT13"));
	FlexGridSizer15->Add(StaticText11, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	red1Edit = new wxSpinCtrlDouble(Panel1,ID_SPINCTRL1,"",wxDefaultPosition,wxSize(55,21),0,0,255,0,0.1,_T("ID_SPINCTRL1"));
	FlexGridSizer15->Add(red1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText10 = new wxStaticText(Panel1, ID_STATICTEXT12, _("to"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT12"));
	FlexGridSizer15->Add(StaticText10, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	red2Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM1,"",wxDefaultPosition,wxSize(55,21),0,0,255,0,0.1,_T("ID_CUSTOM1"));
	FlexGridSizer15->Add(red2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer13->Add(FlexGridSizer15, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer5->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	GridSizer1->Add(StaticBoxSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer7 = new wxStaticBoxSizer(wxHORIZONTAL, Panel1, _("Green"));
	FlexGridSizer18 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer18->AddGrowableCol(0);
	FlexGridSizer19 = new wxFlexGridSizer(0, 3, 0, 0);
	greenFixedCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON10, _("Fixed"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON10"));
	greenFixedCheck->SetValue(true);
	FlexGridSizer19->Add(greenFixedCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	greenRandomCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON11, _("Random"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON11"));
	FlexGridSizer19->Add(greenRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer18->Add(FlexGridSizer19, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	greenMutableCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON12, _("Changing over time"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON12"));
	FlexGridSizer18->Add(greenMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer20 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText16 = new wxStaticText(Panel1, ID_STATICTEXT18, _("From"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT18"));
	FlexGridSizer20->Add(StaticText16, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	green1Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM2,"",wxDefaultPosition,wxSize(55,21),0,0,255,0,0.1,_T("ID_CUSTOM2"));
	FlexGridSizer20->Add(green1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText17 = new wxStaticText(Panel1, ID_STATICTEXT19, _("to"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT19"));
	FlexGridSizer20->Add(StaticText17, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	green2Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM3,"",wxDefaultPosition,wxSize(55,21),0,0,255,0,0.1,_T("ID_CUSTOM3"));
	FlexGridSizer20->Add(green2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer18->Add(FlexGridSizer20, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer7->Add(FlexGridSizer18, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	GridSizer1->Add(StaticBoxSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer6 = new wxStaticBoxSizer(wxHORIZONTAL, Panel1, _("Blue"));
	FlexGridSizer16 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer16->AddGrowableCol(0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	blueFixedCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON7, _("Fixed"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON7"));
	blueFixedCheck->SetValue(true);
	FlexGridSizer17->Add(blueFixedCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	blueRandomCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON8, _("Random"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON8"));
	FlexGridSizer17->Add(blueRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer16->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	blueMutableCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON9, _("Changing over time"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON9"));
	FlexGridSizer16->Add(blueMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer21 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText13 = new wxStaticText(Panel1, ID_STATICTEXT15, _("From"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT15"));
	FlexGridSizer21->Add(StaticText13, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	blue1Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM4,"",wxDefaultPosition,wxSize(55,21),0,0,255,0,0.1,_T("ID_CUSTOM4"));
	FlexGridSizer21->Add(blue1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText14 = new wxStaticText(Panel1, ID_STATICTEXT16, _("to"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT16"));
	FlexGridSizer21->Add(StaticText14, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	blue2Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM5,"",wxDefaultPosition,wxSize(55,21),0,0,255,0,0.1,_T("ID_CUSTOM5"));
	FlexGridSizer21->Add(blue2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer16->Add(FlexGridSizer21, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer6->Add(FlexGridSizer16, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	GridSizer1->Add(StaticBoxSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(GridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel1->SetSizer(FlexGridSizer12);
	FlexGridSizer12->Fit(Panel1);
	FlexGridSizer12->SetSizeHints(Panel1);
	particleNotebook->AddPage(Panel2, _("Colors"), false);
	particleNotebook->AddPage(Panel1, _("Colors ( advanced )"), false);
	FlexGridSizer24->Add(particleNotebook, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer31->Add(FlexGridSizer24, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer13 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Transparency"));
	FlexGridSizer55 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer27 = new wxFlexGridSizer(0, 3, 0, 0);
	alphaRandomCheck = new wxRadioButton(Core, ID_RADIOBUTTON13, _("Random value"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON13"));
	FlexGridSizer27->Add(alphaRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	alphaMutableCheck = new wxRadioButton(Core, ID_RADIOBUTTON14, _("Changing over time"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON14"));
	FlexGridSizer27->Add(alphaMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer55->Add(FlexGridSizer27, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer23 = new wxFlexGridSizer(0, 4, 0, 0);
	StaticText39 = new wxStaticText(Core, ID_STATICTEXT42, _("Between"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT42"));
	FlexGridSizer23->Add(StaticText39, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	alpha1Edit = new wxSpinCtrlDouble(Core,ID_CUSTOM12,"",wxDefaultPosition,wxSize(55,21),0,0,255,0,10,_T("ID_CUSTOM12"));
	FlexGridSizer23->Add(alpha1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText58 = new wxStaticText(Core, ID_STATICTEXT61, _("and"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT61"));
	FlexGridSizer23->Add(StaticText58, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	alpha2Edit = new wxSpinCtrlDouble(Core,ID_CUSTOM17,"",wxDefaultPosition,wxSize(55,21),0,0,255,0,10,_T("ID_CUSTOM17"));
	FlexGridSizer23->Add(alpha2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText15 = new wxStaticText(Core, ID_STATICTEXT17, _("Random variation\nbetween:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT17"));
	StaticText15->SetToolTip(_("Ampltiude of the random variation of the initial transparency"));
	FlexGridSizer23->Add(StaticText15, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	alpha1RandomnessEdit = new wxSpinCtrlDouble(Core,ID_CUSTOM6,"",wxDefaultPosition,wxSize(55,21),0,0,255,0,10,_T("ID_CUSTOM6"));
	FlexGridSizer23->Add(alpha1RandomnessEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer23->Add(5,5,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	alpha2RandomnessEdit = new wxSpinCtrlDouble(Core,ID_CUSTOM7,"",wxDefaultPosition,wxSize(55,21),0,0,255,0,10,_T("ID_CUSTOM7"));
	FlexGridSizer23->Add(alpha2RandomnessEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer55->Add(FlexGridSizer23, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer13->Add(FlexGridSizer55, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer31->Add(StaticBoxSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer25 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBoxSizer15 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Display angle"));
	FlexGridSizer56 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer28 = new wxFlexGridSizer(0, 3, 0, 0);
	angleRandomCheck = new wxRadioButton(Core, ID_RADIOBUTTON26, _("Random value"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON26"));
	FlexGridSizer28->Add(angleRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	angleMutableCheck = new wxRadioButton(Core, ID_RADIOBUTTON27, _("Changing over time"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON27"));
	FlexGridSizer28->Add(angleMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer56->Add(FlexGridSizer28, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer57 = new wxFlexGridSizer(0, 6, 0, 0);
	StaticText41 = new wxStaticText(Core, ID_STATICTEXT44, _("Between"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT44"));
	FlexGridSizer57->Add(StaticText41, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	angle1Edit = new wxTextCtrl(Core, ID_TEXTCTRL28, wxEmptyString, wxDefaultPosition, wxSize(55,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL28"));
	FlexGridSizer57->Add(angle1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText55 = new wxStaticText(Core, ID_STATICTEXT58, _("°"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT58"));
	FlexGridSizer57->Add(StaticText55, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText56 = new wxStaticText(Core, ID_STATICTEXT59, _("and"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT59"));
	FlexGridSizer57->Add(StaticText56, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	angle2Edit = new wxTextCtrl(Core, ID_TEXTCTRL27, wxEmptyString, wxDefaultPosition, wxSize(55,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL27"));
	FlexGridSizer57->Add(angle2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText57 = new wxStaticText(Core, ID_STATICTEXT60, _("°"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT60"));
	FlexGridSizer57->Add(StaticText57, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText18 = new wxStaticText(Core, ID_STATICTEXT20, _("Random variation\nbetween:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT20"));
	StaticText18->SetToolTip(_("Ampltiude of the random variation of the initial transparency"));
	FlexGridSizer57->Add(StaticText18, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	angle1RandomnessEdit = new wxTextCtrl(Core, ID_TEXTCTRL17, _("0"), wxDefaultPosition, wxSize(55,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL17"));
	angle1RandomnessEdit->SetToolTip(_("Ampltiude of the random variation of the value."));
	FlexGridSizer57->Add(angle1RandomnessEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer57->Add(5,5,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer57->Add(5,5,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	angle2RandomnessEdit = new wxTextCtrl(Core, ID_TEXTCTRL29, _("0"), wxDefaultPosition, wxSize(55,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL29"));
	angle2RandomnessEdit->SetToolTip(_("Ampltiude of the random variation of the value."));
	FlexGridSizer57->Add(angle2RandomnessEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer57->Add(5,5,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer56->Add(FlexGridSizer57, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer15->Add(FlexGridSizer56, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer25->Add(StaticBoxSizer15, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer14 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Size"));
	FlexGridSizer54 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer29 = new wxFlexGridSizer(0, 3, 0, 0);
	sizeRandomCheck = new wxRadioButton(Core, ID_RADIOBUTTON25, _("Random value"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON25"));
	FlexGridSizer29->Add(sizeRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	sizeMutableCheck = new wxRadioButton(Core, ID_RADIOBUTTON24, _("Changing over time"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON24"));
	FlexGridSizer29->Add(sizeMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer54->Add(FlexGridSizer29, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer44 = new wxFlexGridSizer(0, 7, 0, 0);
	StaticText40 = new wxStaticText(Core, ID_STATICTEXT43, _("Between"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT43"));
	FlexGridSizer44->Add(StaticText40, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	size1Edit = new wxSpinCtrlDouble(Core,ID_CUSTOM13,"",wxDefaultPosition,wxSize(55,21),0,0,100,0,10,_T("ID_CUSTOM13"));
	FlexGridSizer44->Add(size1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText53 = new wxStaticText(Core, ID_STATICTEXT56, _("%"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT56"));
	FlexGridSizer44->Add(StaticText53, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText52 = new wxStaticText(Core, ID_STATICTEXT55, _("and"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT55"));
	FlexGridSizer44->Add(StaticText52, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	size2Edit = new wxSpinCtrlDouble(Core,ID_CUSTOM14,"",wxDefaultPosition,wxSize(55,21),0,0,100,0,10,_T("ID_CUSTOM14"));
	FlexGridSizer44->Add(size2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText51 = new wxStaticText(Core, ID_STATICTEXT54, _("%"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT54"));
	FlexGridSizer44->Add(StaticText51, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText54 = new wxStaticText(Core, ID_STATICTEXT57, _("of the initial size"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT57"));
	FlexGridSizer44->Add(StaticText54, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText19 = new wxStaticText(Core, ID_STATICTEXT21, _("Random variation\nbetween:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT21"));
	StaticText19->SetToolTip(_("Ampltiude of the random variation of the initial transparency"));
	FlexGridSizer44->Add(StaticText19, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	size1RandomnessEdit = new wxSpinCtrlDouble(Core,ID_CUSTOM8,"",wxDefaultPosition,wxSize(55,21),0,0,100,0,10,_T("ID_CUSTOM8"));
	FlexGridSizer44->Add(size1RandomnessEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer44->Add(5,5,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer44->Add(5,5,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	size2RandomnessEdit = new wxSpinCtrlDouble(Core,ID_CUSTOM9,"",wxDefaultPosition,wxSize(55,21),0,0,100,0,10,_T("ID_CUSTOM9"));
	FlexGridSizer44->Add(size2RandomnessEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer54->Add(FlexGridSizer44, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer14->Add(FlexGridSizer54, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer25->Add(StaticBoxSizer14, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer31->Add(FlexGridSizer25, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer4->Add(FlexGridSizer31, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer33->Add(StaticBoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5->AddGrowableRow(0);
	StaticBoxSizer11 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Zone and direction of emission"));
	FlexGridSizer45 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer45->AddGrowableCol(0);
	FlexGridSizer38 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer38->AddGrowableCol(1);
	StaticText4 = new wxStaticText(Core, ID_STATICTEXT4, _("Emission force :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer38->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer2 = new wxBoxSizer(wxHORIZONTAL);
	StaticText5 = new wxStaticText(Core, ID_STATICTEXT5, _("Between"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	BoxSizer2->Add(StaticText5, 0, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	emitterForceMinEdit = new wxTextCtrl(Core, ID_TEXTCTRL6, wxEmptyString, wxDefaultPosition, wxSize(66,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL6"));
	BoxSizer2->Add(emitterForceMinEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText6 = new wxStaticText(Core, ID_STATICTEXT6, _("and"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	BoxSizer2->Add(StaticText6, 0, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	emitterForceMaxEdit = new wxTextCtrl(Core, ID_TEXTCTRL7, wxEmptyString, wxDefaultPosition, wxSize(66,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL7"));
	BoxSizer2->Add(emitterForceMaxEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer38->Add(BoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer45->Add(FlexGridSizer38, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer11->AddGrowableCol(1);
	StaticText30 = new wxStaticText(Core, ID_STATICTEXT33, _("Radius of the emission sphere :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT33"));
	FlexGridSizer11->Add(StaticText30, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	zoneRadiusEdit = new wxTextCtrl(Core, ID_TEXTCTRL14, wxEmptyString, wxDefaultPosition, wxSize(66,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL14"));
	FlexGridSizer11->Add(zoneRadiusEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer45->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	emissionNotebook = new wxNotebook(Core, ID_NOTEBOOK2, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK2"));
	Panel4 = new wxPanel(emissionNotebook, ID_PANEL5, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL5"));
	FlexGridSizer46 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer46->AddGrowableCol(0);
	FlexGridSizer49 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer49->AddGrowableCol(1);
	StaticText45 = new wxStaticText(Panel4, ID_STATICTEXT48, _("Angle of the spray cone :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT48"));
	FlexGridSizer49->Add(StaticText45, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	simpleConeAngleEdit = new wxTextCtrl(Panel4, ID_TEXTCTRL22, wxEmptyString, wxDefaultPosition, wxSize(66,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL22"));
	FlexGridSizer49->Add(simpleConeAngleEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText46 = new wxStaticText(Panel4, ID_STATICTEXT49, _("°"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT49"));
	FlexGridSizer49->Add(StaticText46, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer46->Add(FlexGridSizer49, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel4->SetSizer(FlexGridSizer46);
	FlexGridSizer46->Fit(Panel4);
	FlexGridSizer46->SetSizeHints(Panel4);
	Panel3 = new wxPanel(emissionNotebook, ID_PANEL4, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL4"));
	FlexGridSizer34 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer34->AddGrowableCol(0);
	FlexGridSizer35 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer35->AddGrowableCol(1);
	StaticText31 = new wxStaticText(Panel3, ID_STATICTEXT34, _("Emission Z direction:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT34"));
	FlexGridSizer35->Add(StaticText31, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	emitterDirZEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL20, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL20"));
	emitterDirZEdit->SetToolTip(_("Emission X direction"));
	BoxSizer1->Add(emitterDirZEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer35->Add(BoxSizer1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer34->Add(FlexGridSizer35, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer41 = new wxFlexGridSizer(0, 4, 0, 0);
	FlexGridSizer41->AddGrowableCol(2);
	StaticText33 = new wxStaticText(Panel3, ID_STATICTEXT36, _("Angle of the emission zone :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT36"));
	FlexGridSizer41->Add(StaticText33, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText35 = new wxStaticText(Panel3, ID_STATICTEXT38, _("1st angle :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT38"));
	FlexGridSizer41->Add(StaticText35, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	emitterAngleAEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL15, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL15"));
	FlexGridSizer41->Add(emitterAngleAEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText9 = new wxStaticText(Panel3, ID_STATICTEXT11, _("°"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT11"));
	FlexGridSizer41->Add(StaticText9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer41->Add(8,9,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText36 = new wxStaticText(Panel3, ID_STATICTEXT39, _("2nd angle :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT39"));
	FlexGridSizer41->Add(StaticText36, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	emitterAngleBEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL16, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL16"));
	FlexGridSizer41->Add(emitterAngleBEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText12 = new wxStaticText(Panel3, ID_STATICTEXT14, _("°"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT14"));
	FlexGridSizer41->Add(StaticText12, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer34->Add(FlexGridSizer41, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel3->SetSizer(FlexGridSizer34);
	FlexGridSizer34->Fit(Panel3);
	FlexGridSizer34->SetSizeHints(Panel3);
	emissionNotebook->AddPage(Panel4, _("Simple setup"), false);
	emissionNotebook->AddPage(Panel3, _("Advanced setup"), false);
	FlexGridSizer45->Add(emissionNotebook, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer11->Add(FlexGridSizer45, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5->Add(StaticBoxSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer32 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer32->AddGrowableCol(0);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Gravity"));
	gravityNotebook = new wxNotebook(Core, ID_NOTEBOOK3, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK3"));
	Panel6 = new wxPanel(gravityNotebook, ID_PANEL7, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL7"));
	FlexGridSizer50 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer50->AddGrowableCol(0);
	BoxSizer3 = new wxBoxSizer(wxHORIZONTAL);
	FlexGridSizer52 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer52->AddGrowableCol(1);
	StaticText47 = new wxStaticText(Panel6, ID_STATICTEXT50, _("Gravity :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT50"));
	FlexGridSizer52->Add(StaticText47, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	simpleGravityLengthEdit = new wxTextCtrl(Panel6, ID_TEXTCTRL23, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL23"));
	simpleGravityLengthEdit->SetToolTip(_("Gravity on X axis"));
	FlexGridSizer52->Add(simpleGravityLengthEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer3->Add(FlexGridSizer52, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer51 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer51->AddGrowableCol(1);
	StaticText49 = new wxStaticText(Panel6, ID_STATICTEXT52, _("Gravity angle :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT52"));
	FlexGridSizer51->Add(StaticText49, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	simpleGravityAngleEdit = new wxTextCtrl(Panel6, ID_TEXTCTRL25, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL25"));
	simpleGravityAngleEdit->SetToolTip(_("Gravity on Z axis ( depth )"));
	FlexGridSizer51->Add(simpleGravityAngleEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText50 = new wxStaticText(Panel6, ID_STATICTEXT53, _("°"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT53"));
	FlexGridSizer51->Add(StaticText50, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer3->Add(FlexGridSizer51, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer50->Add(BoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer53 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer53->AddGrowableCol(1);
	StaticText48 = new wxStaticText(Panel6, ID_STATICTEXT51, _("Friction :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT51"));
	FlexGridSizer53->Add(StaticText48, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	simpleFrictionEdit = new wxTextCtrl(Panel6, ID_TEXTCTRL26, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL26"));
	FlexGridSizer53->Add(simpleFrictionEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer50->Add(FlexGridSizer53, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel6->SetSizer(FlexGridSizer50);
	FlexGridSizer50->Fit(Panel6);
	FlexGridSizer50->SetSizeHints(Panel6);
	Panel5 = new wxPanel(gravityNotebook, ID_PANEL6, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL6"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	StaticText2 = new wxStaticText(Panel5, ID_STATICTEXT2, _("Gravity applied to particles :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer3->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	gravityXEdit = new wxTextCtrl(Panel5, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	gravityXEdit->SetToolTip(_("Gravity on X axis"));
	FlexGridSizer4->Add(gravityXEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	gravityYEdit = new wxTextCtrl(Panel5, ID_TEXTCTRL4, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	gravityYEdit->SetToolTip(_("Gravity on Y axis"));
	FlexGridSizer4->Add(gravityYEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	gravityZEdit = new wxTextCtrl(Panel5, ID_TEXTCTRL5, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
	gravityZEdit->SetToolTip(_("Gravity on Z axis ( depth )"));
	FlexGridSizer4->Add(gravityZEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText8 = new wxStaticText(Panel5, ID_STATICTEXT8, _("Friction :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer3->Add(StaticText8, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer8->AddGrowableCol(0);
	frictionEdit = new wxTextCtrl(Panel5, ID_TEXTCTRL8, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL8"));
	FlexGridSizer8->Add(frictionEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel5->SetSizer(FlexGridSizer3);
	FlexGridSizer3->Fit(Panel5);
	FlexGridSizer3->SetSizeHints(Panel5);
	gravityNotebook->AddPage(Panel6, _("Simple setup"), false);
	gravityNotebook->AddPage(Panel5, _("Advanced setup"), false);
	StaticBoxSizer2->Add(gravityNotebook, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer32->Add(StaticBoxSizer2, 1, wxALL|wxALIGN_TOP|wxALIGN_CENTER_HORIZONTAL, 5);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Miscellaneous"));
	FlexGridSizer30 = new wxFlexGridSizer(0, 3, 0, 0);
	destroyWhenNoParticlesCheck = new wxCheckBox(Core, ID_CHECKBOX2, _("Destroy the object when no more particles are spayed"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	destroyWhenNoParticlesCheck->SetValue(false);
	FlexGridSizer30->Add(destroyWhenNoParticlesCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer30, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer32->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_TOP|wxALIGN_CENTER_HORIZONTAL, 5);
	FlexGridSizer5->Add(FlexGridSizer32, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer33->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer33, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(Core, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer2->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer36 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer36->AddGrowableCol(1);
	imageBankBt = new wxButton(Core, ID_BUTTON3, _("Show the images bank"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer36->Add(imageBankBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	okBt = new wxButton(Core, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer36->Add(okBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(Core, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer36->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer36, 1, wxALL|wxEXPAND|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	Core->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(Core);
	FlexGridSizer2->SetSizeHints(Core);
	FlexGridSizer1->Add(Core, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	Connect(ID_RADIOBUTTON2,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnpointCheckSelect);
	Connect(ID_RADIOBUTTON1,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnLineCheckSelect);
	Connect(ID_RADIOBUTTON3,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnQuadCheckSelect);
	Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnimageChooseBtClick);
	Connect(ID_CHECKBOX1,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OninfiniteTankCheckClick);
	Connect(ID_COLOURPICKERCTRL1,wxEVT_COMMAND_COLOURPICKER_CHANGED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleColor1BtColourChanged);
	Connect(ID_COLOURPICKERCTRL2,wxEVT_COMMAND_COLOURPICKER_CHANGED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleColor1BtColourChanged);
	Connect(ID_RADIOBUTTON6,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnredFixedCheckSelect);
	Connect(ID_RADIOBUTTON5,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnredRandomCheckSelect);
	Connect(ID_RADIOBUTTON4,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnredRandomCheckSelect);
	Connect(ID_RADIOBUTTON10,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OngreenFixedCheckSelect);
	Connect(ID_RADIOBUTTON11,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OngreenRandomCheckSelect);
	Connect(ID_RADIOBUTTON12,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OngreenRandomCheckSelect);
	Connect(ID_RADIOBUTTON7,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnblueFixedCheckSelect);
	Connect(ID_RADIOBUTTON8,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnblueRandomCheckSelect);
	Connect(ID_RADIOBUTTON9,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnblueRandomCheckSelect);
	Connect(ID_RADIOBUTTON13,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnalphaRandomCheckSelect1);
	Connect(ID_RADIOBUTTON14,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnalphaMutableCheckSelect);
	Connect(ID_RADIOBUTTON26,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnangleRandomCheckSelect1);
	Connect(ID_RADIOBUTTON27,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnangleMutableCheckSelect);
	Connect(ID_RADIOBUTTON25,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsizeRandomCheckSelect1);
	Connect(ID_RADIOBUTTON24,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsizeMutableCheckSelect);
	Connect(ID_TEXTCTRL22,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleConeAngleText);
	Connect(ID_TEXTCTRL23,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleGravityAngleText);
	Connect(ID_TEXTCTRL25,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleGravityAngleText);
	Connect(ID_TEXTCTRL26,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleFrictionEditText);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnimageBankBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OncancelBtClick);
	//*)

    //Bind all parameters to controls.
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
    emitterDirZEdit->SetValue(ToString(object.GetEmitterZDirection()));
    emitterAngleAEdit->SetValue(ToString(object.GetEmitterAngleA()));
    emitterAngleBEdit->SetValue(ToString(object.GetEmitterAngleB()));
    gravityXEdit->SetValue(ToString(object.GetParticleGravityX()));
    gravityYEdit->SetValue(ToString(object.GetParticleGravityY()));
    gravityZEdit->SetValue(ToString(object.GetParticleGravityZ()));
    frictionEdit->SetValue(ToString(object.GetFriction()));
    lifeTimeMinEdit->SetValue(ToString(object.GetParticleLifeTimeMin()));
    lifeTimeMaxEdit->SetValue(ToString(object.GetParticleLifeTimeMax()));
    zoneRadiusEdit->SetValue(ToString(object.GetZoneRadius()));
    maxParticleNbEdit->SetValue(ToString(object.GetMaxParticleNb()));
    destroyWhenNoParticlesCheck->SetValue(object.GetDestroyWhenNoParticles());

    red1Edit->SetValue(ToString(object.GetParticleRed1()));
    red2Edit->SetValue(ToString(object.GetParticleRed2()));
    green1Edit->SetValue(ToString(object.GetParticleGreen1()));
    green2Edit->SetValue(ToString(object.GetParticleGreen2()));
    blue1Edit->SetValue(ToString(object.GetParticleBlue1()));
    blue2Edit->SetValue(ToString(object.GetParticleBlue2()));
    alpha1Edit->SetValue(ToString(object.GetParticleAlpha1()));
    alpha2Edit->SetValue(ToString(object.GetParticleAlpha2()));
    alpha1RandomnessEdit->SetValue(ToString(object.GetParticleAlphaRandomness1()));
    alpha2RandomnessEdit->SetValue(ToString(object.GetParticleAlphaRandomness2()));

    size1Edit->SetValue(ToString(object.GetParticleSize1()));
    size2Edit->SetValue(ToString(object.GetParticleSize2()));
    angle1Edit->SetValue(ToString(object.GetParticleAngle1()));
    angle2Edit->SetValue(ToString(object.GetParticleAngle2()));
    size1RandomnessEdit->SetValue(ToString(object.GetParticleSizeRandomness1()));
    size2RandomnessEdit->SetValue(ToString(object.GetParticleSizeRandomness2()));
    angle1RandomnessEdit->SetValue(ToString(object.GetParticleAngleRandomness1()));
    angle2RandomnessEdit->SetValue(ToString(object.GetParticleAngleRandomness2()));
    red2Edit->Enable(false);
    green2Edit->Enable(false);
    blue2Edit->Enable(false);
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
        alpha1RandomnessEdit->Enable(false);
        alpha2RandomnessEdit->Enable(false);
    }
    else if ( object.GetAlphaParameterType() == ParticleEmitterObject::Mutable )
    {
        alphaMutableCheck->SetValue(true);
    }
    if ( object.GetSizeParameterType() == ParticleEmitterObject::Random )
    {
        sizeRandomCheck->SetValue(true);
        size1RandomnessEdit->Enable(false);
        size2RandomnessEdit->Enable(false);
    }
    else if ( object.GetSizeParameterType() == ParticleEmitterObject::Mutable )
    {
        sizeMutableCheck->SetValue(true);
    }
    if ( object.GetAngleParameterType() == ParticleEmitterObject::Random )
    {
        angleRandomCheck->SetValue(true);
        angle1RandomnessEdit->Enable(false);
        angle2RandomnessEdit->Enable(false);
    }
    else if ( object.GetAngleParameterType() == ParticleEmitterObject::Mutable )
    {
        angleMutableCheck->SetValue(true);
    }

    //Bind all parameters to simple controls.
    simpleColor1Bt->SetColour(wxColour(object.GetParticleRed1(), object.GetParticleGreen1(), object.GetParticleBlue1()));
    simpleColor2Bt->SetColour(wxColour(object.GetParticleRed2(), object.GetParticleGreen2(), object.GetParticleBlue2()));

    simpleConeAngleEdit->ChangeValue(emitterAngleBEdit->GetValue().mb_str());

    simpleFrictionEdit->ChangeValue(frictionEdit->GetValue());
    {
        float x = ToFloat(string(gravityXEdit->GetValue().mb_str()));
        float y = ToFloat(string(gravityYEdit->GetValue().mb_str()));
        simpleGravityAngleEdit->ChangeValue(ToString(atan2(y,x)*180.0f/3.14159f));
        simpleGravityLengthEdit->ChangeValue(ToString(sqrt(x*x+y*y)));
    }

    //Set last used pages
    if ( !object.emissionEditionSimpleMode ) emissionNotebook->SetSelection(1);
    if ( !object.gravityEditionSimpleMode ) gravityNotebook->SetSelection(1);
    if ( !object.particleEditionSimpleMode ) particleNotebook->SetSelection(1);


    //Init the image bank editor
    editorImagesPnl = new ResourcesEditor( this, game, mainFrameWrapper );
    editorImagesPnl->Refresh();

	//Init wxAuiManager with two pane : the editor and the image bank editor
    m_mgr.SetManagedWindow( this );
    m_mgr.AddPane( Core, wxAuiPaneInfo().Name( wxT( "Core" ) ).Center().CaptionVisible(false) );
    m_mgr.AddPane( editorImagesPnl, wxAuiPaneInfo().Name( wxT( "EI" ) ).Left().Caption( _( "Images bank's editor" ) ).MaximizeButton( true ).MinimizeButton( false ).Show(false).MinSize(150, 100) );
    m_mgr.SetFlags( wxAUI_MGR_ALLOW_FLOATING | wxAUI_MGR_ALLOW_ACTIVE_PANE | wxAUI_MGR_TRANSPARENT_HINT
                    | wxAUI_MGR_TRANSPARENT_DRAG | wxAUI_MGR_HINT_FADE | wxAUI_MGR_NO_VENETIAN_BLINDS_FADE );
    m_mgr.Update();
}

ParticleEmitterObjectEditor::~ParticleEmitterObjectEditor()
{
	//(*Destroy(ParticleEmitterObjectEditor)
	//*)
    m_mgr.UnInit(); //We're using a wxAuiManager that need to be uninitialized.
}
void ParticleEmitterObjectEditor::OnokBtClick(wxCommandEvent& event)
{
    unsigned int particleNb = ToInt(string(maxParticleNbEdit->GetValue().mb_str())) > 0 ? ToInt(string(maxParticleNbEdit->GetValue().mb_str())) : 0;
    if ( particleNb > 30000 )
    {
        if ( wxMessageBox(_("The number of particles is huge. A number too important could crash the game.\nAre you sure you wan to continue\?"), _("Maximum Particles number"), wxYES_NO | wxICON_EXCLAMATION, this) == wxNO )
            return;
    }

    if ( infiniteTankCheck->GetValue() ) object.SetTank(-1);
    else object.SetTank(ToFloat(string(tankEdit->GetValue().mb_str())));

    if ( lineCheck->GetValue() ) object.SetRendererType(ParticleEmitterObject::Line);
    else if ( quadCheck->GetValue() ) object.SetRendererType(ParticleEmitterObject::Quad);
    else object.SetRendererType(ParticleEmitterObject::Point);

    if ( alphaRenderingCheck->GetValue() ) object.SetRenderingAlpha();
    else object.SetRenderingAdditive();

    object.SetFlow(ToFloat(string(flowEdit->GetValue().mb_str())));
    object.SetEmitterForceMin(ToFloat(string(emitterForceMinEdit->GetValue().mb_str())));
    object.SetEmitterForceMax(ToFloat(string(emitterForceMaxEdit->GetValue().mb_str())));
    object.SetEmitterZDirection(ToFloat(string(emitterDirZEdit->GetValue().mb_str())));
    object.SetEmitterAngleA(ToFloat(string(emitterAngleAEdit->GetValue().mb_str())));
    object.SetEmitterAngleB(ToFloat(string(emitterAngleBEdit->GetValue().mb_str())));
    object.SetParticleGravityX(ToFloat(string(gravityXEdit->GetValue().mb_str())));
    object.SetParticleGravityY(ToFloat(string(gravityYEdit->GetValue().mb_str())));
    object.SetParticleGravityZ(ToFloat(string(gravityZEdit->GetValue().mb_str())));
    object.SetRendererParam1(ToFloat(string(rendererParam1Edit->GetValue().mb_str())));
    object.SetRendererParam2(ToFloat(string(rendererParam2Edit->GetValue().mb_str())));
    object.SetParticleLifeTimeMin(ToFloat(string(lifeTimeMinEdit->GetValue().mb_str())));
    object.SetParticleLifeTimeMax(ToFloat(string(lifeTimeMaxEdit->GetValue().mb_str())));
    object.SetZoneRadius(ToFloat(string(zoneRadiusEdit->GetValue().mb_str())));
    object.SetFriction(ToFloat(string(frictionEdit->GetValue().mb_str())));
    object.SetMaxParticleNb(particleNb);
    object.SetDestroyWhenNoParticles(destroyWhenNoParticlesCheck->GetValue());

    object.SetParticleRed1(red1Edit->GetValue());
    object.SetParticleRed2(red2Edit->GetValue());
    object.SetParticleGreen1(green1Edit->GetValue());
    object.SetParticleGreen2(green2Edit->GetValue());
    object.SetParticleBlue1(blue1Edit->GetValue());
    object.SetParticleBlue2(blue2Edit->GetValue());
    object.SetParticleAlpha1(alpha1Edit->GetValue());
    object.SetParticleAlpha2(alpha2Edit->GetValue());
    object.SetParticleSize1(size1Edit->GetValue());
    object.SetParticleSize2(size2Edit->GetValue());
    object.SetParticleAngle1(ToFloat(string(angle1Edit->GetValue().mb_str())));
    object.SetParticleAngle2(ToFloat(string(angle2Edit->GetValue().mb_str())));
    object.SetParticleAlphaRandomness1(alpha1RandomnessEdit->GetValue());
    object.SetParticleAlphaRandomness2(alpha2RandomnessEdit->GetValue());
    object.SetParticleSizeRandomness1(size1RandomnessEdit->GetValue());
    object.SetParticleSizeRandomness2(size2RandomnessEdit->GetValue());
    object.SetParticleAngleRandomness1(ToFloat(string(angle1RandomnessEdit->GetValue().mb_str())));
    object.SetParticleAngleRandomness2(ToFloat(string(angle2RandomnessEdit->GetValue().mb_str())));
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
    if ( sizeRandomCheck->GetValue() ) object.SetSizeParameterType(ParticleEmitterObject::Random);
    else if ( sizeMutableCheck->GetValue() ) object.SetSizeParameterType(ParticleEmitterObject::Mutable);
    else object.SetSizeParameterType(ParticleEmitterObject::Nothing);
    if ( angleRandomCheck->GetValue() ) object.SetAngleParameterType(ParticleEmitterObject::Random);
    else if ( angleMutableCheck->GetValue() ) object.SetAngleParameterType(ParticleEmitterObject::Mutable);
    else object.SetAngleParameterType(ParticleEmitterObject::Nothing);

    object.SetParticleTexture(string(textureEdit->GetValue().mb_str()));

    //Save last used pages
    object.emissionEditionSimpleMode = false;
    object.gravityEditionSimpleMode = false;
    object.particleEditionSimpleMode = false;
    if (emissionNotebook->GetSelection() == 0) object.emissionEditionSimpleMode = true;
    if (gravityNotebook->GetSelection() == 0) object.gravityEditionSimpleMode = true;
    if (particleNotebook->GetSelection() == 0) object.particleEditionSimpleMode = true;

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
    imageChooseBt->Show(false);

    rendererParam1Txt->SetLabel(_("Initial size :"));
    Layout();
    Refresh();
}

void ParticleEmitterObjectEditor::PrepareControlsForQuadRenderer()
{
    rendererParam1Txt->Show();
    rendererParam1Edit->Show();
    rendererParam2Txt->Show();
    rendererParam2Edit->Show();
    textureTxt->Show(true);
    textureEdit->Show(true);
    imageChooseBt->Show(true);

    rendererParam1Txt->SetLabel(_("Inital width :"));
    rendererParam2Txt->SetLabel(_("Initial height :"));
    Layout();
    Refresh();
}

void ParticleEmitterObjectEditor::PrepareControlsForLineRenderer()
{
    rendererParam1Txt->Show();
    rendererParam1Edit->Show();
    rendererParam2Txt->Show();
    rendererParam2Edit->Show();
    textureTxt->Show(false);
    textureEdit->Show(false);
    imageChooseBt->Show(false);

    rendererParam1Txt->SetLabel(_("Length :"));
    rendererParam2Txt->SetLabel(_("Width :"));
    Layout();
    Refresh();
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


void ParticleEmitterObjectEditor::OnimageChooseBtClick(wxCommandEvent& event)
{
    if ( !m_mgr.GetPane( editorImagesPnl ).IsShown() )
    {
        gd::LogMessage(_("Please display the image bank's editor and select an image before clicking on this button."));
        return;
    }

    textureEdit->ChangeValue(editorImagesPnl->resourcesTree->GetItemText(editorImagesPnl->m_itemSelected));
}

void ParticleEmitterObjectEditor::OnimageBankBtClick(wxCommandEvent& event)
{
    //Update the window size
    if ( !m_mgr.GetPane( editorImagesPnl ).IsShown() )
        SetSize(GetSize().GetWidth()+150, GetSize().GetHeight());

    m_mgr.GetPane( editorImagesPnl ).Show();
    m_mgr.Update();
}

void ParticleEmitterObjectEditor::OnsimpleColor1BtColourChanged(wxColourPickerEvent& event)
{
    redMutableCheck->SetValue(true);
    blueMutableCheck->SetValue(true);
    greenMutableCheck->SetValue(true);
    red2Edit->Enable(true);
    green2Edit->Enable(true);
    blue2Edit->Enable(true);

    red1Edit->SetValue(simpleColor1Bt->GetColour().Red());
    red2Edit->SetValue(simpleColor2Bt->GetColour().Red());
    green1Edit->SetValue(simpleColor1Bt->GetColour().Green());
    green2Edit->SetValue(simpleColor2Bt->GetColour().Green());
    blue1Edit->SetValue(simpleColor1Bt->GetColour().Blue());
    blue2Edit->SetValue(simpleColor2Bt->GetColour().Blue());
}

void ParticleEmitterObjectEditor::OnsimpleConeAngleText(wxCommandEvent& event)
{
    emitterAngleBEdit->SetValue(simpleConeAngleEdit->GetValue().mb_str());
    emitterAngleAEdit->SetValue("0");
}

void ParticleEmitterObjectEditor::OnsimpleGravityAngleText(wxCommandEvent& event)
{
    float angle = ToFloat(string(simpleGravityAngleEdit->GetValue().mb_str()))/180.0f*3.14159f;
    float length = ToFloat(string(simpleGravityLengthEdit->GetValue().mb_str()));

    gravityXEdit->SetValue(ToString(cos(angle)*length));
    gravityYEdit->SetValue(ToString(sin(angle)*length));
}

void ParticleEmitterObjectEditor::OnsimpleFrictionEditText(wxCommandEvent& event)
{
    frictionEdit->SetValue(simpleFrictionEdit->GetValue());
}

void ParticleEmitterObjectEditor::OnalphaMutableCheckSelect(wxCommandEvent& event)
{
    alpha1RandomnessEdit->Enable(true);
    alpha2RandomnessEdit->Enable(true);
}

void ParticleEmitterObjectEditor::OnalphaRandomCheckSelect1(wxCommandEvent& event)
{
    alpha1RandomnessEdit->Enable(false);
    alpha2RandomnessEdit->Enable(false);
}

void ParticleEmitterObjectEditor::OnangleRandomCheckSelect1(wxCommandEvent& event)
{
    angle1RandomnessEdit->Enable(false);
    angle2RandomnessEdit->Enable(false);
}

void ParticleEmitterObjectEditor::OnangleMutableCheckSelect(wxCommandEvent& event)
{
    angle1RandomnessEdit->Enable(true);
    angle2RandomnessEdit->Enable(true);
}

void ParticleEmitterObjectEditor::OnsizeRandomCheckSelect1(wxCommandEvent& event)
{
    size1RandomnessEdit->Enable(false);
    size2RandomnessEdit->Enable(false);
}

void ParticleEmitterObjectEditor::OnsizeMutableCheckSelect(wxCommandEvent& event)
{
    size1RandomnessEdit->Enable(true);
    size2RandomnessEdit->Enable(true);
}

#endif

