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

#include "LightObjectEditor.h"

//(*InternalHeaders(LightObjectEditor)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/colordlg.h>
#include <wx/filedlg.h>
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/Project.h"
#include "LightObject.h"
#include "SceneLightObstacleDatas.h"

using namespace std;

//(*IdInit(LightObjectEditor)
const long LightObjectEditor::ID_STATICTEXT1 = wxNewId();
const long LightObjectEditor::ID_COLOURPICKERCTRL1 = wxNewId();
const long LightObjectEditor::ID_STATICTEXT2 = wxNewId();
const long LightObjectEditor::ID_TEXTCTRL1 = wxNewId();
const long LightObjectEditor::ID_STATICTEXT3 = wxNewId();
const long LightObjectEditor::ID_STATICTEXT4 = wxNewId();
const long LightObjectEditor::ID_SPINCTRL1 = wxNewId();
const long LightObjectEditor::ID_STATICTEXT5 = wxNewId();
const long LightObjectEditor::ID_TEXTCTRL2 = wxNewId();
const long LightObjectEditor::ID_CHECKBOX1 = wxNewId();
const long LightObjectEditor::ID_STATICTEXT6 = wxNewId();
const long LightObjectEditor::ID_COLOURPICKERCTRL2 = wxNewId();
const long LightObjectEditor::ID_STATICLINE1 = wxNewId();
const long LightObjectEditor::ID_BUTTON1 = wxNewId();
const long LightObjectEditor::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(LightObjectEditor,wxDialog)
	//(*EventTable(LightObjectEditor)
	//*)
END_EVENT_TABLE()

LightObjectEditor::LightObjectEditor( wxWindow* parent, gd::Project & game_, LightObject & object_ ) :
game(game_),
object(object_)
{
	//(*Initialize(LightObjectEditor)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Light color:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	colorPicker = new wxColourPickerCtrl(this, ID_COLOURPICKERCTRL1, wxColour(0,0,0), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_COLOURPICKERCTRL1"));
	FlexGridSizer2->Add(colorPicker, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Radius:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	radiusEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(45,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer5->Add(radiusEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("pixels"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer5->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Intensity:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer2->Add(StaticText4, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	intensityEdit = new wxSpinCtrl(this, ID_SPINCTRL1, _T("255"), wxDefaultPosition, wxSize(56,21), 0, 0, 255, 255, _T("ID_SPINCTRL1"));
	intensityEdit->SetValue(_T("255"));
	FlexGridSizer2->Add(intensityEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT5, _("Quality:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer2->Add(StaticText5, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	qualityEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(45,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer2->Add(qualityEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Global light"));
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	globalCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Set the light as the global light"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	globalCheck->SetValue(false);
	FlexGridSizer4->Add(globalCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer6->AddGrowableCol(1);
	StaticText6 = new wxStaticText(this, ID_STATICTEXT6, _("Color of the scene:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer6->Add(StaticText6, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	globalColorPicker = new wxColourPickerCtrl(this, ID_COLOURPICKERCTRL2, wxColour(0,0,0), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_COLOURPICKERCTRL2"));
	FlexGridSizer6->Add(globalColorPicker, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&LightObjectEditor::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&LightObjectEditor::OncancelBtClick);
	//*)

    intensityEdit->SetValue(object.GetIntensity());
    radiusEdit->SetValue(ToString(object.GetRadius()));
    qualityEdit->SetValue(ToString(object.GetQuality()));
    colorPicker->SetColour(wxColour(object.GetColor().r, object.GetColor().g, object.GetColor().b));

    globalCheck->SetValue(object.IsGlobalLight());
    globalColorPicker->SetColour(wxColour(object.GetGlobalColor().r, object.GetGlobalColor().g, object.GetGlobalColor().b));
    //globalIntensityEdit->SetValue(object.GetGlobalColor().a);
}

LightObjectEditor::~LightObjectEditor()
{
	//(*Destroy(LightObjectEditor)
	//*)
}

void LightObjectEditor::OnokBtClick(wxCommandEvent& event)
{
    object.SetIntensity(intensityEdit->GetValue());
    object.SetRadius( ToFloat(string(radiusEdit->GetValue().mb_str())));
    object.SetQuality( ToFloat(string(qualityEdit->GetValue().mb_str())));
    object.SetColor(sf::Color(colorPicker->GetColour().Red(), colorPicker->GetColour().Green(), colorPicker->GetColour().Blue()));

    object.SetGlobalLight(globalCheck->GetValue());
    object.SetGlobalColor(sf::Color(globalColorPicker->GetColour().Red(), globalColorPicker->GetColour().Green(), globalColorPicker->GetColour().Blue()/*, globalIntensityEdit->GetValue()*/));

    EndModal(1);
}

void LightObjectEditor::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

#endif

