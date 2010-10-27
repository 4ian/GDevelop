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
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/colordlg.h>
#include <wx/filedlg.h>

#include "GDL/Game.h"
#include "GDL/CommonTools.h"
#include "ParticleEmitterObject.h"
#include "GDL/MainEditorCommand.h"
#include "GDL/EditorImages.h"

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
const long ParticleEmitterObjectEditor::ID_STATICTEXT40 = wxNewId();
const long ParticleEmitterObjectEditor::ID_COLOURPICKERCTRL1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT41 = wxNewId();
const long ParticleEmitterObjectEditor::ID_COLOURPICKERCTRL2 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT42 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM12 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT61 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM17 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON25 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON24 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT43 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM13 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT56 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT55 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM14 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT54 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT57 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON26 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON27 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT44 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM15 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT58 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT59 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM16 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT60 = wxNewId();
const long ParticleEmitterObjectEditor::ID_PANEL3 = wxNewId();
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
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON19 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON20 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON21 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT26 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT27 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM10 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT28 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM11 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON16 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON17 = wxNewId();
const long ParticleEmitterObjectEditor::ID_RADIOBUTTON18 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT23 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT24 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM8 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT25 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CUSTOM9 = wxNewId();
const long ParticleEmitterObjectEditor::ID_PANEL2 = wxNewId();
const long ParticleEmitterObjectEditor::ID_NOTEBOOK1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT4 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT5 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL6 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT6 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL7 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT45 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL17 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT46 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL21 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT47 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT48 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL22 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT49 = wxNewId();
const long ParticleEmitterObjectEditor::ID_PANEL5 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT33 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL14 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT34 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL18 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL19 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL20 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT36 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT38 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL15 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT35 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT39 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL16 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT37 = wxNewId();
const long ParticleEmitterObjectEditor::ID_PANEL4 = wxNewId();
const long ParticleEmitterObjectEditor::ID_NOTEBOOK2 = wxNewId();
const long ParticleEmitterObjectEditor::ID_CHECKBOX1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT3 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_STATICTEXT1 = wxNewId();
const long ParticleEmitterObjectEditor::ID_TEXTCTRL2 = wxNewId();
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

ParticleEmitterObjectEditor::ParticleEmitterObjectEditor( wxWindow* parent, Game & game_, ParticleEmitterObject & object_, MainEditorCommand & mainEditorCommand_ ) :
game(game_),
mainEditorCommand(mainEditorCommand_),
object(object_)
{
	//(*Initialize(ParticleEmitterObjectEditor)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer45;
	wxFlexGridSizer* FlexGridSizer47;
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
	wxStaticBoxSizer* StaticBoxSizer9;
	wxBoxSizer* BoxSizer2;
	wxFlexGridSizer* FlexGridSizer53;
	wxFlexGridSizer* FlexGridSizer7;
	wxStaticBoxSizer* StaticBoxSizer7;
	wxFlexGridSizer* FlexGridSizer55;
	wxStaticBoxSizer* StaticBoxSizer13;
	wxStaticBoxSizer* StaticBoxSizer10;
	wxFlexGridSizer* FlexGridSizer57;
	wxFlexGridSizer* FlexGridSizer52;
	wxFlexGridSizer* FlexGridSizer34;
	wxFlexGridSizer* FlexGridSizer29;
	wxStaticBoxSizer* StaticBoxSizer8;
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
	wxFlexGridSizer* FlexGridSizer48;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer33;
	wxFlexGridSizer* FlexGridSizer43;
	wxFlexGridSizer* FlexGridSizer11;
	wxBoxSizer* BoxSizer3;
	wxFlexGridSizer* FlexGridSizer17;
	wxStaticBoxSizer* StaticBoxSizer5;
	wxFlexGridSizer* FlexGridSizer32;
	wxFlexGridSizer* FlexGridSizer42;
	wxFlexGridSizer* FlexGridSizer31;
	wxFlexGridSizer* FlexGridSizer40;
	wxFlexGridSizer* FlexGridSizer39;
	wxFlexGridSizer* FlexGridSizer28;
	wxFlexGridSizer* FlexGridSizer26;
	wxFlexGridSizer* FlexGridSizer30;
	
	Create(parent, wxID_ANY, _("Editer l\'émetteur de particules"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	Core = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(1);
	StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Rendu"));
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	FlexGridSizer10 = new wxFlexGridSizer(0, 4, 0, 0);
	StaticText7 = new wxStaticText(Core, ID_STATICTEXT7, _("Mode de rendu :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer10->Add(StaticText7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	pointCheck = new wxRadioButton(Core, ID_RADIOBUTTON2, _("Points"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON2"));
	FlexGridSizer10->Add(pointCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	lineCheck = new wxRadioButton(Core, ID_RADIOBUTTON1, _("Lignes"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
	FlexGridSizer10->Add(lineCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	quadCheck = new wxRadioButton(Core, ID_RADIOBUTTON3, _("Quadrilatère"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON3"));
	FlexGridSizer10->Add(quadCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 7, 0, 0);
	rendererParam1Txt = new wxStaticText(Core, ID_STATICTEXT9, _("rendererParam1 :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer9->Add(rendererParam1Txt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	rendererParam1Edit = new wxTextCtrl(Core, ID_TEXTCTRL9, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL9"));
	FlexGridSizer9->Add(rendererParam1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	rendererParam2Txt = new wxStaticText(Core, ID_STATICTEXT10, _("rendererParam2 :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT10"));
	FlexGridSizer9->Add(rendererParam2Txt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	rendererParam2Edit = new wxTextCtrl(Core, ID_TEXTCTRL10, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL10"));
	FlexGridSizer9->Add(rendererParam2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	textureTxt = new wxStaticText(Core, ID_STATICTEXT32, _("Image :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT32"));
	FlexGridSizer9->Add(textureTxt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	textureEdit = new wxTextCtrl(Core, ID_TEXTCTRL13, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL13"));
	FlexGridSizer9->Add(textureEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	imageChooseBt = new wxBitmapButton(Core, ID_BITMAPBUTTON1, wxBitmap(wxImage(_T("res/addfromimagebanque.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON1"));
	FlexGridSizer9->Add(imageChooseBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer32 = new wxFlexGridSizer(0, 3, 0, 0);
	alphaRenderingCheck = new wxRadioButton(Core, ID_RADIOBUTTON22, _("Rendu normal"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON22"));
	FlexGridSizer32->Add(alphaRenderingCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	additiveRenderingCheck = new wxRadioButton(Core, ID_RADIOBUTTON23, _("Rendu additif"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON23"));
	additiveRenderingCheck->SetValue(true);
	FlexGridSizer32->Add(additiveRenderingCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer32, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer3->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer33 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer33->AddGrowableCol(0);
	StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Particules"));
	FlexGridSizer30 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer30->AddGrowableCol(0);
	FlexGridSizer31 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText27 = new wxStaticText(Core, ID_STATICTEXT29, _("Temps de vie : Entre"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT29"));
	FlexGridSizer31->Add(StaticText27, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	lifeTimeMinEdit = new wxTextCtrl(Core, ID_TEXTCTRL11, wxEmptyString, wxDefaultPosition, wxSize(55,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL11"));
	lifeTimeMinEdit->SetToolTip(_("Temps de vie minimum"));
	FlexGridSizer31->Add(lifeTimeMinEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText28 = new wxStaticText(Core, ID_STATICTEXT30, _("et"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT30"));
	FlexGridSizer31->Add(StaticText28, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	lifeTimeMaxEdit = new wxTextCtrl(Core, ID_TEXTCTRL12, wxEmptyString, wxDefaultPosition, wxSize(55,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL12"));
	lifeTimeMaxEdit->SetToolTip(_("Temps de vie maximum"));
	FlexGridSizer31->Add(lifeTimeMaxEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText29 = new wxStaticText(Core, ID_STATICTEXT31, _("secondes"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT31"));
	FlexGridSizer31->Add(StaticText29, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer30->Add(FlexGridSizer31, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	particleNotebook = new wxNotebook(Core, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
	Panel2 = new wxPanel(particleNotebook, ID_PANEL3, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	FlexGridSizer40 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer40->AddGrowableCol(1);
	StaticBoxSizer12 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Couleur"));
	FlexGridSizer43 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticText37 = new wxStaticText(Panel2, ID_STATICTEXT40, _("Couleur des particules à leur apparition :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT40"));
	FlexGridSizer43->Add(StaticText37, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	simpleColor1Bt = new wxColourPickerCtrl(Panel2, ID_COLOURPICKERCTRL1, wxColour(0,0,0), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_COLOURPICKERCTRL1"));
	FlexGridSizer43->Add(simpleColor1Bt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText38 = new wxStaticText(Panel2, ID_STATICTEXT41, _("Couleur des particules à leur disparition :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT41"));
	FlexGridSizer43->Add(StaticText38, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	simpleColor2Bt = new wxColourPickerCtrl(Panel2, ID_COLOURPICKERCTRL2, wxColour(0,0,0), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_COLOURPICKERCTRL2"));
	FlexGridSizer43->Add(simpleColor2Bt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer12->Add(FlexGridSizer43, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer40->Add(StaticBoxSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer13 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Transparence"));
	FlexGridSizer55 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticText39 = new wxStaticText(Panel2, ID_STATICTEXT42, _("Transparence initiale :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT42"));
	FlexGridSizer55->Add(StaticText39, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	simpleOpacityEdit = new wxSpinCtrlDouble(Panel2,ID_CUSTOM12,"",wxDefaultPosition,wxSize(55,21),0,0,255,0,10,_T("ID_CUSTOM12"));
	FlexGridSizer55->Add(simpleOpacityEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText58 = new wxStaticText(Panel2, ID_STATICTEXT61, _("Transparence à la disparition :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT61"));
	FlexGridSizer55->Add(StaticText58, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	simpleOpacity2Edit = new wxSpinCtrlDouble(Panel2,ID_CUSTOM17,"",wxDefaultPosition,wxSize(55,21),0,0,255,0,10,_T("ID_CUSTOM17"));
	FlexGridSizer55->Add(simpleOpacity2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer13->Add(FlexGridSizer55, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer40->Add(StaticBoxSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer14 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Taille"));
	FlexGridSizer54 = new wxFlexGridSizer(0, 1, 0, 0);
	simpleSizeRandomCheck = new wxRadioButton(Panel2, ID_RADIOBUTTON25, _("Valeur aléatoire"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON25"));
	FlexGridSizer54->Add(simpleSizeRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	simpleSizeMutableCheck = new wxRadioButton(Panel2, ID_RADIOBUTTON24, _("Evolution au cours du temps"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON24"));
	FlexGridSizer54->Add(simpleSizeMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer44 = new wxFlexGridSizer(0, 7, 0, 0);
	StaticText40 = new wxStaticText(Panel2, ID_STATICTEXT43, _("Entre"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT43"));
	FlexGridSizer44->Add(StaticText40, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	simpleSize1Edit = new wxSpinCtrlDouble(Panel2,ID_CUSTOM13,"",wxDefaultPosition,wxSize(55,21),0,0,100,0,10,_T("ID_CUSTOM13"));
	FlexGridSizer44->Add(simpleSize1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText53 = new wxStaticText(Panel2, ID_STATICTEXT56, _("%"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT56"));
	FlexGridSizer44->Add(StaticText53, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText52 = new wxStaticText(Panel2, ID_STATICTEXT55, _("et"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT55"));
	FlexGridSizer44->Add(StaticText52, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	simpleSize2Edit = new wxSpinCtrlDouble(Panel2,ID_CUSTOM14,"",wxDefaultPosition,wxSize(55,21),0,0,100,0,10,_T("ID_CUSTOM14"));
	FlexGridSizer44->Add(simpleSize2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText51 = new wxStaticText(Panel2, ID_STATICTEXT54, _("%"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT54"));
	FlexGridSizer44->Add(StaticText51, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText54 = new wxStaticText(Panel2, ID_STATICTEXT57, _("de la taille initiale"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT57"));
	FlexGridSizer44->Add(StaticText54, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer54->Add(FlexGridSizer44, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer14->Add(FlexGridSizer54, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer40->Add(StaticBoxSizer14, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer15 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Angle d\'affichage"));
	FlexGridSizer56 = new wxFlexGridSizer(0, 1, 0, 0);
	simpleAngleRandomCheck = new wxRadioButton(Panel2, ID_RADIOBUTTON26, _("Valeur aléatoire"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON26"));
	FlexGridSizer56->Add(simpleAngleRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	simpleAngleMutableCheck = new wxRadioButton(Panel2, ID_RADIOBUTTON27, _("Evolution au cours du temps"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON27"));
	FlexGridSizer56->Add(simpleAngleMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer57 = new wxFlexGridSizer(0, 7, 0, 0);
	StaticText41 = new wxStaticText(Panel2, ID_STATICTEXT44, _("Entre"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT44"));
	FlexGridSizer57->Add(StaticText41, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	simpleAngle1Edit = new wxSpinCtrlDouble(Panel2,ID_CUSTOM15,"",wxDefaultPosition,wxSize(55,21),0,0,360,0,10,_T("ID_CUSTOM15"));
	FlexGridSizer57->Add(simpleAngle1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText55 = new wxStaticText(Panel2, ID_STATICTEXT58, _("°"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT58"));
	FlexGridSizer57->Add(StaticText55, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText56 = new wxStaticText(Panel2, ID_STATICTEXT59, _("et"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT59"));
	FlexGridSizer57->Add(StaticText56, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	simpleAngle2Edit = new wxSpinCtrlDouble(Panel2,ID_CUSTOM16,"",wxDefaultPosition,wxSize(55,21),0,0,360,0,10,_T("ID_CUSTOM16"));
	FlexGridSizer57->Add(simpleAngle2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText57 = new wxStaticText(Panel2, ID_STATICTEXT60, _("°"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT60"));
	FlexGridSizer57->Add(StaticText57, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer56->Add(FlexGridSizer57, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer15->Add(FlexGridSizer56, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer40->Add(StaticBoxSizer15, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel2->SetSizer(FlexGridSizer40);
	FlexGridSizer40->Fit(Panel2);
	FlexGridSizer40->SetSizeHints(Panel2);
	Panel1 = new wxPanel(particleNotebook, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	GridSizer1 = new wxGridSizer(0, 3, 0, 0);
	StaticBoxSizer5 = new wxStaticBoxSizer(wxHORIZONTAL, Panel1, _("Rouge"));
	FlexGridSizer12 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer12->AddGrowableCol(0);
	FlexGridSizer14 = new wxFlexGridSizer(0, 3, 0, 0);
	redFixedCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON6, _("Fixé"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON6"));
	redFixedCheck->SetValue(true);
	FlexGridSizer14->Add(redFixedCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	redRandomCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON5, _("Aléatoire"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON5"));
	FlexGridSizer14->Add(redRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(FlexGridSizer14, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	redMutableCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON4, _("Changeant au cours du temps"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON4"));
	FlexGridSizer12->Add(redMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer13 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText9 = new wxStaticText(Panel1, ID_STATICTEXT11, _("Valeur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT11"));
	FlexGridSizer13->Add(StaticText9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText11 = new wxStaticText(Panel1, ID_STATICTEXT13, _("De"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT13"));
	FlexGridSizer13->Add(StaticText11, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	red1Edit = new wxSpinCtrlDouble(Panel1,ID_SPINCTRL1,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_SPINCTRL1"));
	FlexGridSizer13->Add(red1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText10 = new wxStaticText(Panel1, ID_STATICTEXT12, _("à"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT12"));
	FlexGridSizer13->Add(StaticText10, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	red2Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM1,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM1"));
	FlexGridSizer13->Add(red2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer5->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	GridSizer1->Add(StaticBoxSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer7 = new wxStaticBoxSizer(wxHORIZONTAL, Panel1, _("Vert"));
	FlexGridSizer18 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer18->AddGrowableCol(0);
	FlexGridSizer19 = new wxFlexGridSizer(0, 3, 0, 0);
	greenFixedCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON10, _("Fixé"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON10"));
	greenFixedCheck->SetValue(true);
	FlexGridSizer19->Add(greenFixedCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	greenRandomCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON11, _("Aléatoire"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON11"));
	FlexGridSizer19->Add(greenRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer18->Add(FlexGridSizer19, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	greenMutableCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON12, _("Changeant au cours du temps"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON12"));
	FlexGridSizer18->Add(greenMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer20 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText15 = new wxStaticText(Panel1, ID_STATICTEXT17, _("Valeur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT17"));
	FlexGridSizer20->Add(StaticText15, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText16 = new wxStaticText(Panel1, ID_STATICTEXT18, _("De"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT18"));
	FlexGridSizer20->Add(StaticText16, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	green1Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM2,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM2"));
	FlexGridSizer20->Add(green1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText17 = new wxStaticText(Panel1, ID_STATICTEXT19, _("à"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT19"));
	FlexGridSizer20->Add(StaticText17, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	green2Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM3,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM3"));
	FlexGridSizer20->Add(green2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer18->Add(FlexGridSizer20, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer7->Add(FlexGridSizer18, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	GridSizer1->Add(StaticBoxSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer6 = new wxStaticBoxSizer(wxHORIZONTAL, Panel1, _("Bleu"));
	FlexGridSizer15 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer15->AddGrowableCol(0);
	FlexGridSizer16 = new wxFlexGridSizer(0, 3, 0, 0);
	blueFixedCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON7, _("Fixé"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON7"));
	blueFixedCheck->SetValue(true);
	FlexGridSizer16->Add(blueFixedCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	blueRandomCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON8, _("Aléatoire"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON8"));
	FlexGridSizer16->Add(blueRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer15->Add(FlexGridSizer16, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	blueMutableCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON9, _("Changeant au cours du temps"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON9"));
	FlexGridSizer15->Add(blueMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer17 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText12 = new wxStaticText(Panel1, ID_STATICTEXT14, _("Valeur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT14"));
	FlexGridSizer17->Add(StaticText12, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText13 = new wxStaticText(Panel1, ID_STATICTEXT15, _("De"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT15"));
	FlexGridSizer17->Add(StaticText13, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	blue1Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM4,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM4"));
	FlexGridSizer17->Add(blue1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText14 = new wxStaticText(Panel1, ID_STATICTEXT16, _("à"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT16"));
	FlexGridSizer17->Add(StaticText14, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	blue2Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM5,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM5"));
	FlexGridSizer17->Add(blue2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer15->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer6->Add(FlexGridSizer15, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	GridSizer1->Add(StaticBoxSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer8 = new wxStaticBoxSizer(wxHORIZONTAL, Panel1, _("Transparence"));
	FlexGridSizer21 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer21->AddGrowableCol(0);
	FlexGridSizer22 = new wxFlexGridSizer(0, 3, 0, 0);
	alphaFixedCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON13, _("Fixé"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON13"));
	alphaFixedCheck->SetValue(true);
	FlexGridSizer22->Add(alphaFixedCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	alphaRandomCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON14, _("Aléatoire"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON14"));
	FlexGridSizer22->Add(alphaRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer21->Add(FlexGridSizer22, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	alphaMutableCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON15, _("Changeant au cours du temps"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON15"));
	FlexGridSizer21->Add(alphaMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer23 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText18 = new wxStaticText(Panel1, ID_STATICTEXT20, _("Valeur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT20"));
	FlexGridSizer23->Add(StaticText18, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText19 = new wxStaticText(Panel1, ID_STATICTEXT21, _("De"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT21"));
	FlexGridSizer23->Add(StaticText19, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	alpha1Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM6,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM6"));
	FlexGridSizer23->Add(alpha1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText20 = new wxStaticText(Panel1, ID_STATICTEXT22, _("à"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT22"));
	FlexGridSizer23->Add(StaticText20, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	alpha2Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM7,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM7"));
	FlexGridSizer23->Add(alpha2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer21->Add(FlexGridSizer23, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer8->Add(FlexGridSizer21, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	GridSizer1->Add(StaticBoxSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer10 = new wxStaticBoxSizer(wxHORIZONTAL, Panel1, _("Taille"));
	FlexGridSizer27 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer27->AddGrowableCol(0);
	FlexGridSizer28 = new wxFlexGridSizer(0, 3, 0, 0);
	sizeNothingCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON19, _("Pas de changement"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON19"));
	sizeNothingCheck->SetValue(true);
	FlexGridSizer28->Add(sizeNothingCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	sizeRandomCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON20, _("Aléatoire"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON20"));
	FlexGridSizer28->Add(sizeRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer27->Add(FlexGridSizer28, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	sizeMutableCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON21, _("Changeant au cours du temps"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON21"));
	FlexGridSizer27->Add(sizeMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer29 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText24 = new wxStaticText(Panel1, ID_STATICTEXT26, _("Valeur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT26"));
	FlexGridSizer29->Add(StaticText24, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText25 = new wxStaticText(Panel1, ID_STATICTEXT27, _("De"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT27"));
	FlexGridSizer29->Add(StaticText25, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	size1Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM10,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM10"));
	FlexGridSizer29->Add(size1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText26 = new wxStaticText(Panel1, ID_STATICTEXT28, _("à"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT28"));
	FlexGridSizer29->Add(StaticText26, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	size2Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM11,"",wxDefaultPosition,wxSize(55,21),0,0,1,0,0.1,_T("ID_CUSTOM11"));
	FlexGridSizer29->Add(size2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer27->Add(FlexGridSizer29, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer10->Add(FlexGridSizer27, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	GridSizer1->Add(StaticBoxSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer9 = new wxStaticBoxSizer(wxHORIZONTAL, Panel1, _("Angle"));
	FlexGridSizer24 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer24->AddGrowableCol(0);
	FlexGridSizer25 = new wxFlexGridSizer(0, 3, 0, 0);
	angleNothingCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON16, _("Pas de changement"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON16"));
	angleNothingCheck->SetValue(true);
	FlexGridSizer25->Add(angleNothingCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	angleRandomCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON17, _("Aléatoire"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON17"));
	FlexGridSizer25->Add(angleRandomCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer24->Add(FlexGridSizer25, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	angleMutableCheck = new wxRadioButton(Panel1, ID_RADIOBUTTON18, _("Changeant au cours du temps"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON18"));
	FlexGridSizer24->Add(angleMutableCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer26 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText21 = new wxStaticText(Panel1, ID_STATICTEXT23, _("Valeur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT23"));
	FlexGridSizer26->Add(StaticText21, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText22 = new wxStaticText(Panel1, ID_STATICTEXT24, _("De"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT24"));
	FlexGridSizer26->Add(StaticText22, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	angle1Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM8,"",wxDefaultPosition,wxSize(55,21),0,0,6.28319,0,0.1,_T("ID_CUSTOM8"));
	FlexGridSizer26->Add(angle1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText23 = new wxStaticText(Panel1, ID_STATICTEXT25, _("à"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT25"));
	FlexGridSizer26->Add(StaticText23, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	angle2Edit = new wxSpinCtrlDouble(Panel1,ID_CUSTOM9,"",wxDefaultPosition,wxSize(55,21),0,0,6.28319,0,0.1,_T("ID_CUSTOM9"));
	FlexGridSizer26->Add(angle2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer24->Add(FlexGridSizer26, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer9->Add(FlexGridSizer24, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	GridSizer1->Add(StaticBoxSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(GridSizer1);
	GridSizer1->Fit(Panel1);
	GridSizer1->SetSizeHints(Panel1);
	particleNotebook->AddPage(Panel2, _("Configuration simple"), false);
	particleNotebook->AddPage(Panel1, _("Configuration avancée"), false);
	FlexGridSizer30->Add(particleNotebook, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer4->Add(FlexGridSizer30, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer33->Add(StaticBoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	FlexGridSizer5->AddGrowableRow(0);
	StaticBoxSizer11 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Zone et direction d\'émission"));
	FlexGridSizer45 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer38 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer38->AddGrowableCol(1);
	StaticText4 = new wxStaticText(Core, ID_STATICTEXT4, _("Force d\'émission :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer38->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer2 = new wxBoxSizer(wxHORIZONTAL);
	StaticText5 = new wxStaticText(Core, ID_STATICTEXT5, _("Entre"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	BoxSizer2->Add(StaticText5, 0, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	emitterForceMinEdit = new wxTextCtrl(Core, ID_TEXTCTRL6, wxEmptyString, wxDefaultPosition, wxSize(66,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL6"));
	BoxSizer2->Add(emitterForceMinEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText6 = new wxStaticText(Core, ID_STATICTEXT6, _("et"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	BoxSizer2->Add(StaticText6, 0, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	emitterForceMaxEdit = new wxTextCtrl(Core, ID_TEXTCTRL7, wxEmptyString, wxDefaultPosition, wxSize(66,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL7"));
	BoxSizer2->Add(emitterForceMaxEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer38->Add(BoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer45->Add(FlexGridSizer38, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	emissionNotebook = new wxNotebook(Core, ID_NOTEBOOK2, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK2"));
	Panel4 = new wxPanel(emissionNotebook, ID_PANEL5, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL5"));
	FlexGridSizer46 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer46->AddGrowableCol(0);
	FlexGridSizer47 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer47->AddGrowableCol(1);
	StaticText42 = new wxStaticText(Panel4, ID_STATICTEXT45, _("Rayon d\'apparition :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT45"));
	FlexGridSizer47->Add(StaticText42, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	simpleRadiusEdit = new wxTextCtrl(Panel4, ID_TEXTCTRL17, wxEmptyString, wxDefaultPosition, wxSize(66,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL17"));
	FlexGridSizer47->Add(simpleRadiusEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer46->Add(FlexGridSizer47, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer48 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer48->AddGrowableCol(1);
	StaticText43 = new wxStaticText(Panel4, ID_STATICTEXT46, _("Angle d\'émission :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT46"));
	FlexGridSizer48->Add(StaticText43, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	simpleAngleEdit = new wxTextCtrl(Panel4, ID_TEXTCTRL21, wxEmptyString, wxDefaultPosition, wxSize(66,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL21"));
	FlexGridSizer48->Add(simpleAngleEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText44 = new wxStaticText(Panel4, ID_STATICTEXT47, _("°"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT47"));
	FlexGridSizer48->Add(StaticText44, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer46->Add(FlexGridSizer48, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer49 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer49->AddGrowableCol(1);
	StaticText45 = new wxStaticText(Panel4, ID_STATICTEXT48, _("Angle d\'ouverture du cone d\'émission :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT48"));
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
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer11->AddGrowableCol(1);
	StaticText30 = new wxStaticText(Panel3, ID_STATICTEXT33, _("Rayon de la sphère d\'apparition :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT33"));
	FlexGridSizer11->Add(StaticText30, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	zoneRadiusEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL14, wxEmptyString, wxDefaultPosition, wxSize(66,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL14"));
	FlexGridSizer11->Add(zoneRadiusEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer34->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer35 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer35->AddGrowableCol(1);
	StaticText31 = new wxStaticText(Panel3, ID_STATICTEXT34, _("Direction :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT34"));
	FlexGridSizer35->Add(StaticText31, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	emitterDirXEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL18, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL18"));
	emitterDirXEdit->SetToolTip(_("Direction de l\'émission, sur l\'axe X"));
	BoxSizer1->Add(emitterDirXEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	emitterDirYEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL19, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL19"));
	emitterDirYEdit->SetToolTip(_("Direction de l\'émission, sur l\'axe Y"));
	BoxSizer1->Add(emitterDirYEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	emitterDirZEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL20, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL20"));
	emitterDirZEdit->SetToolTip(_("Direction de l\'émission, sur l\'axe Z ( profondeur )"));
	BoxSizer1->Add(emitterDirZEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer35->Add(BoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer34->Add(FlexGridSizer35, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer41 = new wxFlexGridSizer(0, 4, 0, 0);
	FlexGridSizer41->AddGrowableCol(2);
	StaticText33 = new wxStaticText(Panel3, ID_STATICTEXT36, _("Angle de la zone d\'émission :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT36"));
	FlexGridSizer41->Add(StaticText33, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText35 = new wxStaticText(Panel3, ID_STATICTEXT38, _("1er angle :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT38"));
	FlexGridSizer41->Add(StaticText35, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	emitterAngleAEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL15, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL15"));
	FlexGridSizer41->Add(emitterAngleAEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText32 = new wxStaticText(Panel3, ID_STATICTEXT35, _("rad"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT35"));
	FlexGridSizer41->Add(StaticText32, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer41->Add(8,9,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText36 = new wxStaticText(Panel3, ID_STATICTEXT39, _("2eme angle :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT39"));
	FlexGridSizer41->Add(StaticText36, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	emitterAngleBEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL16, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL16"));
	FlexGridSizer41->Add(emitterAngleBEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText34 = new wxStaticText(Panel3, ID_STATICTEXT37, _("rad"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT37"));
	FlexGridSizer41->Add(StaticText34, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer34->Add(FlexGridSizer41, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel3->SetSizer(FlexGridSizer34);
	FlexGridSizer34->Fit(Panel3);
	FlexGridSizer34->SetSizeHints(Panel3);
	emissionNotebook->AddPage(Panel4, _("Configuration simple"), false);
	emissionNotebook->AddPage(Panel3, _("Configuration avancée"), false);
	FlexGridSizer45->Add(emissionNotebook, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer11->Add(FlexGridSizer45, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5->Add(StaticBoxSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer42 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Quantité"));
	FlexGridSizer6 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	FlexGridSizer39 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer39->AddGrowableCol(2);
	infiniteTankCheck = new wxCheckBox(Core, ID_CHECKBOX1, _("Capacité infinie"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	infiniteTankCheck->SetValue(false);
	infiniteTankCheck->SetToolTip(_("En cochant ceci, l\'émetteur ne s\'arrêtera jamais d\'émettre des particules."));
	FlexGridSizer39->Add(infiniteTankCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(Core, ID_STATICTEXT3, _("Capacité :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer39->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	tankEdit = new wxTextCtrl(Core, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	tankEdit->SetToolTip(_("Le nombre de particules disponibles."));
	FlexGridSizer39->Add(tankEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(FlexGridSizer39, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer37 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer37->AddGrowableCol(1);
	StaticText1 = new wxStaticText(Core, ID_STATICTEXT1, _("Flux :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer37->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	flowEdit = new wxTextCtrl(Core, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	flowEdit->SetToolTip(_("Le nombre de particules émises à la seconde. -1 pour tout émettre d\'un coup."));
	FlexGridSizer37->Add(flowEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(FlexGridSizer37, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer42->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Gravité"));
	gravityNotebook = new wxNotebook(Core, ID_NOTEBOOK3, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK3"));
	Panel6 = new wxPanel(gravityNotebook, ID_PANEL7, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL7"));
	FlexGridSizer50 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer50->AddGrowableCol(0);
	BoxSizer3 = new wxBoxSizer(wxHORIZONTAL);
	FlexGridSizer52 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer52->AddGrowableCol(1);
	StaticText47 = new wxStaticText(Panel6, ID_STATICTEXT50, _("Gravité :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT50"));
	FlexGridSizer52->Add(StaticText47, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	simpleGravityLengthEdit = new wxTextCtrl(Panel6, ID_TEXTCTRL23, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL23"));
	simpleGravityLengthEdit->SetToolTip(_("Gravité sur l\'axe X"));
	FlexGridSizer52->Add(simpleGravityLengthEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer3->Add(FlexGridSizer52, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer51 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer51->AddGrowableCol(1);
	StaticText49 = new wxStaticText(Panel6, ID_STATICTEXT52, _("Angle de la gravité :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT52"));
	FlexGridSizer51->Add(StaticText49, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	simpleGravityAngleEdit = new wxTextCtrl(Panel6, ID_TEXTCTRL25, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL25"));
	simpleGravityAngleEdit->SetToolTip(_("Gravité sur l\'axe Z ( profondeur )"));
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
	StaticText2 = new wxStaticText(Panel5, ID_STATICTEXT2, _("Gravité appliquée aux particules :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer3->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	gravityXEdit = new wxTextCtrl(Panel5, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	gravityXEdit->SetToolTip(_("Gravité sur l\'axe X"));
	FlexGridSizer4->Add(gravityXEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	gravityYEdit = new wxTextCtrl(Panel5, ID_TEXTCTRL4, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	gravityYEdit->SetToolTip(_("Gravité sur l\'axe Y"));
	FlexGridSizer4->Add(gravityYEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	gravityZEdit = new wxTextCtrl(Panel5, ID_TEXTCTRL5, wxEmptyString, wxDefaultPosition, wxSize(62,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
	gravityZEdit->SetToolTip(_("Gravité sur l\'axe Z ( profondeur )"));
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
	gravityNotebook->AddPage(Panel6, _("Configuration simple"), false);
	gravityNotebook->AddPage(Panel5, _("Configuration avancée"), false);
	StaticBoxSizer2->Add(gravityNotebook, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer42->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer42, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer33->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer33, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(Core, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer2->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer36 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer36->AddGrowableCol(1);
	imageBankBt = new wxButton(Core, ID_BUTTON3, _("Afficher la banque d\'images"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer36->Add(imageBankBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	okBt = new wxButton(Core, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer36->Add(okBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(Core, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
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
	Connect(ID_COLOURPICKERCTRL1,wxEVT_COMMAND_COLOURPICKER_CHANGED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleColor1BtColourChanged);
	Connect(ID_COLOURPICKERCTRL2,wxEVT_COMMAND_COLOURPICKER_CHANGED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleColor1BtColourChanged);
	Connect(ID_RADIOBUTTON25,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleSizeRandomCheckSelect);
	Connect(ID_RADIOBUTTON24,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleSizeMutableCheckSelect);
	Connect(ID_RADIOBUTTON26,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleAngleRandomCheckSelect);
	Connect(ID_RADIOBUTTON27,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleAngleMutableCheckSelect);
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
	Connect(ID_RADIOBUTTON19,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsizeNothingCheckSelect);
	Connect(ID_RADIOBUTTON20,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsizeRandomCheckSelect);
	Connect(ID_RADIOBUTTON21,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsizeRandomCheckSelect);
	Connect(ID_RADIOBUTTON16,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnangleNothingCheckSelect);
	Connect(ID_RADIOBUTTON17,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnangleRandomCheckSelect);
	Connect(ID_RADIOBUTTON18,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnangleRandomCheckSelect);
	Connect(ID_TEXTCTRL17,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleRadiusEditText);
	Connect(ID_TEXTCTRL21,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleAngleText);
	Connect(ID_TEXTCTRL22,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleConeAngleText);
	Connect(ID_CHECKBOX1,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OninfiniteTankCheckClick);
	Connect(ID_TEXTCTRL23,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleGravityAngleText);
	Connect(ID_TEXTCTRL25,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleGravityAngleText);
	Connect(ID_TEXTCTRL26,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleFrictionEditText);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnimageBankBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OncancelBtClick);
	//*)
	Connect(ID_CUSTOM12,wxEVT_COMMAND_SPINCTRLDOUBLE_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleOpacityEditChange);
	Connect(ID_CUSTOM17,wxEVT_COMMAND_SPINCTRLDOUBLE_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleOpacityEditChange);
	Connect(ID_CUSTOM13,wxEVT_COMMAND_SPINCTRLDOUBLE_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleSizeEditChange);
	Connect(ID_CUSTOM14,wxEVT_COMMAND_SPINCTRLDOUBLE_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleSizeEditChange);
	Connect(ID_CUSTOM15,wxEVT_COMMAND_SPINCTRLDOUBLE_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleAngleEditChange);
	Connect(ID_CUSTOM16,wxEVT_COMMAND_SPINCTRLDOUBLE_UPDATED,(wxObjectEventFunction)&ParticleEmitterObjectEditor::OnsimpleAngleEditChange);

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
    emitterDirXEdit->SetValue(ToString(object.GetEmitterXDirection()));
    emitterDirYEdit->SetValue(ToString(object.GetEmitterYDirection()));
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

    red1Edit->SetValue(ToString(object.GetParticleRed1()));
    red2Edit->SetValue(ToString(object.GetParticleRed2()));
    green1Edit->SetValue(ToString(object.GetParticleGreen1()));
    green2Edit->SetValue(ToString(object.GetParticleGreen2()));
    blue1Edit->SetValue(ToString(object.GetParticleBlue1()));
    blue2Edit->SetValue(ToString(object.GetParticleBlue2()));
    alpha1Edit->SetValue(ToString(object.GetParticleAlpha1()));
    alpha2Edit->SetValue(ToString(object.GetParticleAlpha2()));
    size1Edit->SetValue(ToString(object.GetParticleSize1()));
    size2Edit->SetValue(ToString(object.GetParticleSize2()));
    angle1Edit->SetValue(ToString(object.GetParticleAngle1()));
    angle2Edit->SetValue(ToString(object.GetParticleAngle2()));
    red2Edit->Enable(false);
    green2Edit->Enable(false);
    blue2Edit->Enable(false);
    alpha2Edit->Enable(false);
    size2Edit->Enable(false);
    angle2Edit->Enable(false);
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
    if ( object.GetSizeParameterType() == ParticleEmitterObject::Random )
    {
        sizeRandomCheck->SetValue(true);
        size2Edit->Enable(true);
    }
    else if ( object.GetSizeParameterType() == ParticleEmitterObject::Mutable )
    {
        sizeMutableCheck->SetValue(true);
        size2Edit->Enable(true);
    }
    if ( object.GetAngleParameterType() == ParticleEmitterObject::Random )
    {
        angleRandomCheck->SetValue(true);
        angle2Edit->Enable(true);
    }
    else if ( object.GetAngleParameterType() == ParticleEmitterObject::Mutable )
    {
        angleMutableCheck->SetValue(true);
        angle2Edit->Enable(true);
    }

    //Bind all parameters to simple controls.
    simpleColor1Bt->SetColour(wxColour(object.GetParticleRed1()*255.0f, object.GetParticleGreen1()*255.0f, object.GetParticleBlue1()*255.0f));
    simpleColor2Bt->SetColour(wxColour(object.GetParticleRed2()*255.0f, object.GetParticleGreen2()*255.0f, object.GetParticleBlue2()*255.0f));
    simpleOpacityEdit->SetValue(object.GetParticleAlpha1()*255.0f);
    simpleOpacity2Edit->SetValue(object.GetParticleAlpha2()*255.0f);
    simpleSize1Edit->SetValue(object.GetParticleSize1()*100.0f);
    simpleSize2Edit->SetValue(object.GetParticleSize2()*100.0f);
    simpleAngle1Edit->SetValue(object.GetParticleAngle1()*180.0f/3.14159f);
    simpleAngle2Edit->SetValue(object.GetParticleAngle2()*180.0f/3.14159f);
    simpleAngleRandomCheck->SetValue(angleRandomCheck->GetValue());
    simpleAngleMutableCheck->SetValue(angleMutableCheck->GetValue());
    simpleSizeRandomCheck->SetValue(sizeRandomCheck->GetValue());
    simpleSizeMutableCheck->SetValue(sizeMutableCheck->GetValue());

    simpleRadiusEdit->SetValue(zoneRadiusEdit->GetValue());
    {
        float x = ToFloat(string(emitterDirXEdit->GetValue().mb_str()));
        float y = ToFloat(string(emitterDirYEdit->GetValue().mb_str()));
        simpleAngleEdit->SetValue(ToString(atan2(y,x)*180.0f/3.14159f));
    }
    simpleConeAngleEdit->SetValue(ToString(ToFloat(string(emitterAngleBEdit->GetValue().mb_str()))*180.0f/3.14159f));

    simpleFrictionEdit->SetValue(frictionEdit->GetValue());
    {
        float x = ToFloat(string(gravityXEdit->GetValue().mb_str()));
        float y = ToFloat(string(gravityYEdit->GetValue().mb_str()));
        simpleGravityAngleEdit->SetValue(ToString(atan2(y,x)*180.0f/3.14159f));
        simpleGravityLengthEdit->SetValue(ToString(sqrt(x*x+y*y)));
    }

    //Set last used pages
    if ( !object.emissionEditionSimpleMode ) emissionNotebook->SetSelection(1);
    if ( !object.gravityEditionSimpleMode ) gravityNotebook->SetSelection(1);
    if ( !object.particleEditionSimpleMode ) particleNotebook->SetSelection(1);


    //Init the image bank editor
    editorImagesPnl = new EditorImages( this, game, mainEditorCommand );
    editorImagesPnl->Refresh();

	//Init wxAuiManager with two pane : the editor and the image bank editor
    m_mgr.SetManagedWindow( this );
    m_mgr.AddPane( Core, wxAuiPaneInfo().Name( wxT( "Core" ) ).Center().CaptionVisible(false) );
    m_mgr.AddPane( editorImagesPnl, wxAuiPaneInfo().Name( wxT( "EI" ) ).Left().Caption( _( "Editeur de la banque d'images" ) ).MaximizeButton( true ).MinimizeButton( false ).Show(false).MinSize(150, 100) );
    m_mgr.SetFlags( wxAUI_MGR_ALLOW_FLOATING | wxAUI_MGR_ALLOW_ACTIVE_PANE | wxAUI_MGR_TRANSPARENT_HINT
                    | wxAUI_MGR_TRANSPARENT_DRAG | wxAUI_MGR_HINT_FADE | wxAUI_MGR_NO_VENETIAN_BLINDS_FADE );
    m_mgr.Update();
}

ParticleEmitterObjectEditor::~ParticleEmitterObjectEditor()
{
	//(*Destroy(ParticleEmitterObjectEditor)
	//*)
    m_mgr.UnInit(); //We're using a wxAuiManager that need to be unitizialized.
}
void ParticleEmitterObjectEditor::OnokBtClick(wxCommandEvent& event)
{
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
    object.SetEmitterXDirection(ToFloat(string(emitterDirXEdit->GetValue().mb_str())));
    object.SetEmitterYDirection(ToFloat(string(emitterDirYEdit->GetValue().mb_str())));
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
    object.SetParticleAngle1(angle1Edit->GetValue());
    object.SetParticleAngle2(angle2Edit->GetValue());
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

    rendererParam1Txt->SetLabel(_("Taille initiale :"));
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

    rendererParam1Txt->SetLabel(_("Largeur initiale :"));
    rendererParam2Txt->SetLabel(_("Hauteur initiale :"));
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

    rendererParam1Txt->SetLabel(_("Longueur :"));
    rendererParam2Txt->SetLabel(_("Largeur :"));
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

void ParticleEmitterObjectEditor::OnalphaFixedCheckSelect(wxCommandEvent& event)
{
    alpha2Edit->Enable(false);
}

void ParticleEmitterObjectEditor::OnalphaRandomCheckSelect(wxCommandEvent& event)
{
    alpha2Edit->Enable(true);
}

void ParticleEmitterObjectEditor::OnsizeNothingCheckSelect(wxCommandEvent& event)
{
    size2Edit->Enable(false);
}

void ParticleEmitterObjectEditor::OnsizeRandomCheckSelect(wxCommandEvent& event)
{
    size2Edit->Enable(true);
}

void ParticleEmitterObjectEditor::OnangleNothingCheckSelect(wxCommandEvent& event)
{
    angle2Edit->Enable(false);
}

void ParticleEmitterObjectEditor::OnangleRandomCheckSelect(wxCommandEvent& event)
{
    angle2Edit->Enable(true);
}

void ParticleEmitterObjectEditor::OnimageChooseBtClick(wxCommandEvent& event)
{
    if ( !m_mgr.GetPane( editorImagesPnl ).IsShown() )
    {
        wxLogMessage(_("Affichez l'éditeur de la banque d'image, et sélectionnez une image avant de cliquer sur ce bouton."));
        return;
    }

    textureEdit->ChangeValue(editorImagesPnl->BanqueImageList->GetItemText(editorImagesPnl->m_itemSelected));
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

    red1Edit->SetValue(simpleColor1Bt->GetColour().Red()/255.0f);
    red2Edit->SetValue(simpleColor2Bt->GetColour().Red()/255.0f);
    green1Edit->SetValue(simpleColor1Bt->GetColour().Green()/255.0f);
    green2Edit->SetValue(simpleColor2Bt->GetColour().Green()/255.0f);
    blue1Edit->SetValue(simpleColor1Bt->GetColour().Blue()/255.0f);
    blue2Edit->SetValue(simpleColor2Bt->GetColour().Blue()/255.0f);
}

void ParticleEmitterObjectEditor::OnsimpleOpacityEditChange(wxSpinDoubleEvent& event)
{
    alphaMutableCheck->SetValue(true);
    alpha2Edit->Enable(true);
    alpha1Edit->SetValue(simpleOpacityEdit->GetValue()/255.0f);
    alpha2Edit->SetValue(simpleOpacity2Edit->GetValue()/255.0f);
}

void ParticleEmitterObjectEditor::OnsimpleSizeEditChange(wxSpinDoubleEvent& event)
{
    sizeRandomCheck->SetValue(true);
    size2Edit->Enable(true);
    size1Edit->SetValue(simpleSize1Edit->GetValue()/100.0f);
    size2Edit->SetValue(simpleSize2Edit->GetValue()/100.0f);
}

void ParticleEmitterObjectEditor::OnsimpleAngleEditChange(wxSpinDoubleEvent& event)
{
    angleRandomCheck->SetValue(true);
    angle2Edit->Enable(true);
    angle1Edit->SetValue(simpleAngle1Edit->GetValue()/180.0f*3.14159f);
    angle2Edit->SetValue(simpleAngle2Edit->GetValue()/180.0f*3.14159f);
}

void ParticleEmitterObjectEditor::OnsimpleRadiusEditText(wxCommandEvent& event)
{
    zoneRadiusEdit->SetValue(simpleRadiusEdit->GetValue());
}

#endif

void ParticleEmitterObjectEditor::OnsimpleAngleText(wxCommandEvent& event)
{
    float angle = ToFloat(string(simpleAngleEdit->GetValue().mb_str()))/180.0f*3.14159f;

    emitterDirXEdit->SetValue(ToString(cos(angle)));
    emitterDirYEdit->SetValue(ToString(sin(angle)));
}

void ParticleEmitterObjectEditor::OnsimpleConeAngleText(wxCommandEvent& event)
{
    emitterAngleBEdit->SetValue(ToString(ToFloat(string(simpleConeAngleEdit->GetValue().mb_str()))/180.0f*3.14159f));
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

void ParticleEmitterObjectEditor::OnsimpleSizeRandomCheckSelect(wxCommandEvent& event)
{
    sizeRandomCheck->SetValue(true);
}

void ParticleEmitterObjectEditor::OnsimpleSizeMutableCheckSelect(wxCommandEvent& event)
{
    sizeMutableCheck->SetValue(true);
}

void ParticleEmitterObjectEditor::OnsimpleAngleMutableCheckSelect(wxCommandEvent& event)
{
    angleMutableCheck->SetValue(true);
}

void ParticleEmitterObjectEditor::OnsimpleAngleRandomCheckSelect(wxCommandEvent& event)
{
    angleRandomCheck->SetValue(true);
}
