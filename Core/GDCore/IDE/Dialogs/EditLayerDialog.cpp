/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "EditLayerDialog.h"

//(*InternalHeaders(EditLayerDialog)
#include <wx/bitmap.h>
#include <wx/font.h>
#include "GDCore/Tools/Localization.h"
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "GDCore/Tools/Log.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/CommonTools.h"

namespace gd
{

//(*IdInit(EditLayerDialog)
const long EditLayerDialog::ID_STATICTEXT1 = wxNewId();
const long EditLayerDialog::ID_TEXTCTRL1 = wxNewId();
const long EditLayerDialog::ID_CHECKBOX1 = wxNewId();
const long EditLayerDialog::ID_STATICTEXT2 = wxNewId();
const long EditLayerDialog::ID_CHOICE1 = wxNewId();
const long EditLayerDialog::ID_BUTTON5 = wxNewId();
const long EditLayerDialog::ID_BUTTON3 = wxNewId();
const long EditLayerDialog::ID_CHECKBOX2 = wxNewId();
const long EditLayerDialog::ID_TEXTCTRL2 = wxNewId();
const long EditLayerDialog::ID_STATICTEXT4 = wxNewId();
const long EditLayerDialog::ID_TEXTCTRL3 = wxNewId();
const long EditLayerDialog::ID_CHECKBOX3 = wxNewId();
const long EditLayerDialog::ID_STATICTEXT7 = wxNewId();
const long EditLayerDialog::ID_TEXTCTRL4 = wxNewId();
const long EditLayerDialog::ID_STATICTEXT6 = wxNewId();
const long EditLayerDialog::ID_TEXTCTRL5 = wxNewId();
const long EditLayerDialog::ID_STATICTEXT8 = wxNewId();
const long EditLayerDialog::ID_TEXTCTRL6 = wxNewId();
const long EditLayerDialog::ID_STATICTEXT9 = wxNewId();
const long EditLayerDialog::ID_TEXTCTRL7 = wxNewId();
const long EditLayerDialog::ID_STATICTEXT3 = wxNewId();
const long EditLayerDialog::ID_STATICLINE1 = wxNewId();
const long EditLayerDialog::ID_STATICBITMAP2 = wxNewId();
const long EditLayerDialog::ID_HYPERLINKCTRL1 = wxNewId();
const long EditLayerDialog::ID_BUTTON2 = wxNewId();
const long EditLayerDialog::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditLayerDialog,wxDialog)
	//(*EventTable(EditLayerDialog)
	//*)
END_EVENT_TABLE()

EditLayerDialog::EditLayerDialog(wxWindow* parent, Layer & layer_) :
layer(layer_),
tempLayer(layer_)
{
	//(*Initialize(EditLayerDialog)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Modify the parameters of the layer"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Name :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	nameEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(129,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer2->Add(nameEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	visibilityCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Visible"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	visibilityCheck->SetValue(false);
	FlexGridSizer2->Add(visibilityCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Cameras"));
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 4, 0, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Camera No."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer5->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cameraChoice = new wxChoice(this, ID_CHOICE1, wxDefaultPosition, wxSize(50,-1), 0, 0, 0, wxDefaultValidator, _T("ID_CHOICE1"));
	cameraChoice->Append("00");
	cameraChoice->SetSelection(0);
	FlexGridSizer5->Add(cameraChoice, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	deleteCameraBt = new wxButton(this, ID_BUTTON5, _("Delete"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON5"));
	FlexGridSizer5->Add(deleteCameraBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	addCameraBt = new wxButton(this, ID_BUTTON3, _("Add another camera"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer5->Add(addCameraBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer5, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Editing the camera"));
	FlexGridSizer6 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	FlexGridSizer8 = new wxFlexGridSizer(0, 4, 0, 0);
	sizeCheck = new wxCheckBox(this, ID_CHECKBOX2, _("Custom size :"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	sizeCheck->SetValue(false);
	FlexGridSizer8->Add(sizeCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cameraWidthEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(60,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	cameraWidthEdit->Disable();
	FlexGridSizer8->Add(cameraWidthEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("x"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer8->Add(StaticText4, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cameraHeightEdit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(60,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	cameraHeightEdit->Disable();
	FlexGridSizer8->Add(cameraHeightEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer7 = new wxFlexGridSizer(0, 2, 0, 0);
	viewportCheck = new wxCheckBox(this, ID_CHECKBOX3, _("Custom viewport :"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX3"));
	viewportCheck->SetValue(false);
	FlexGridSizer7->Add(viewportCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9 = new wxFlexGridSizer(0, 8, 0, 0);
	StaticText7 = new wxStaticText(this, ID_STATICTEXT7, _("From"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer9->Add(StaticText7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	viewportX1Edit = new wxTextCtrl(this, ID_TEXTCTRL4, _("0"), wxDefaultPosition, wxSize(40,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	viewportX1Edit->Disable();
	FlexGridSizer9->Add(viewportX1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText6 = new wxStaticText(this, ID_STATICTEXT6, _(";"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer9->Add(StaticText6, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	viewportY1Edit = new wxTextCtrl(this, ID_TEXTCTRL5, _("0"), wxDefaultPosition, wxSize(40,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
	viewportY1Edit->Disable();
	FlexGridSizer9->Add(viewportY1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText8 = new wxStaticText(this, ID_STATICTEXT8, _("to"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer9->Add(StaticText8, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	viewportX2Edit = new wxTextCtrl(this, ID_TEXTCTRL6, _("1"), wxDefaultPosition, wxSize(40,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL6"));
	viewportX2Edit->Disable();
	FlexGridSizer9->Add(viewportX2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText9 = new wxStaticText(this, ID_STATICTEXT9, _(";"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer9->Add(StaticText9, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	viewportY2Edit = new wxTextCtrl(this, ID_TEXTCTRL7, _("1"), wxDefaultPosition, wxSize(40,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL7"));
	viewportY2Edit->Disable();
	FlexGridSizer9->Add(viewportY2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer6->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("For example, a camera which takes the left side of the window would be defined with 0, 0, 0.5, 1.\nBy default, a camera has a viewport which covers the entire window."), wxDefaultPosition, wxDefaultSize, wxALIGN_RIGHT, _T("ID_STATICTEXT3"));
	wxFont StaticText3Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText3->SetFont(StaticText3Font);
	FlexGridSizer6->Add(StaticText3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2->Add(FlexGridSizer6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap2 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer17->Add(StaticBitmap2, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer17, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	okBt = new wxButton(this, ID_BUTTON2, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(okBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON1, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_CHOICE1,wxEVT_COMMAND_CHOICE_SELECTED,(wxObjectEventFunction)&EditLayerDialog::OncameraChoiceSelect);
	Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditLayerDialog::OndeleteCameraBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditLayerDialog::OnaddCameraBtClick);
	Connect(ID_CHECKBOX2,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&EditLayerDialog::OnsizeCheckClick);
	Connect(ID_TEXTCTRL2,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLayerDialog::OncameraWidthEditText);
	Connect(ID_TEXTCTRL3,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLayerDialog::OncameraHeightEditText);
	Connect(ID_CHECKBOX3,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&EditLayerDialog::OnviewportCheckClick);
	Connect(ID_TEXTCTRL4,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLayerDialog::OnviewportX1EditText);
	Connect(ID_TEXTCTRL5,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLayerDialog::OnviewportX1EditText);
	Connect(ID_TEXTCTRL6,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLayerDialog::OnviewportX1EditText);
	Connect(ID_TEXTCTRL7,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLayerDialog::OnviewportX1EditText);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&EditLayerDialog::OnhelpBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditLayerDialog::OnokBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditLayerDialog::OncancelBtClick);
	//*)

	nameEdit->ChangeValue(layer.GetName());
	visibilityCheck->SetValue(layer.GetVisibility());

	//Can't edit the base layer's name
	if ( layer.GetName() == "" )
	{
        nameEdit->Disable();
        nameEdit->SetValue(_("Base layer"));
	}

    cameraChoice->Clear();
    for (std::size_t i = 0;i<layer.GetCameraCount();++i)
    	cameraChoice->Append(gd::String::From(i));

    cameraChoice->SetSelection(0);
    RefreshCameraSettings();
}

EditLayerDialog::~EditLayerDialog()
{
	//(*Destroy(EditLayerDialog)
	//*)
}


void EditLayerDialog::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void EditLayerDialog::OnokBtClick(wxCommandEvent& event)
{
    //Obligation d'avoir un nom sauf pour le calque de base
    if ( nameEdit->GetValue() == "" && nameEdit->IsEnabled() )
    {
        gd::LogWarning(_("The name is incorrect"));
        return;
    }

    if( layer.GetName() != "")
    	tempLayer.SetName(nameEdit->GetValue());

    tempLayer.SetVisibility(visibilityCheck->GetValue());

    layer = tempLayer;
    EndModal(1);
}

void EditLayerDialog::OnaddCameraBtClick(wxCommandEvent& event)
{
    cameraChoice->Append(gd::String::From(tempLayer.GetCameraCount()));
    tempLayer.SetCameraCount(tempLayer.GetCameraCount()+1);
}

void EditLayerDialog::OncameraChoiceSelect(wxCommandEvent& event)
{
    RefreshCameraSettings();
}

void EditLayerDialog::RefreshCameraSettings()
{
    std::size_t selection = cameraChoice->GetSelection();
    if (selection >= tempLayer.GetCameraCount()) return;

    const Camera & camera = tempLayer.GetCamera(selection);

    if ( camera.UseDefaultSize() )
    {
        sizeCheck->SetValue(false);
        cameraWidthEdit->Enable(false);
        cameraHeightEdit->Enable(false);

        cameraWidthEdit->ChangeValue("");
        cameraHeightEdit->ChangeValue("");
    }
    else
    {
        sizeCheck->SetValue(true);
        cameraWidthEdit->Enable(true);
        cameraHeightEdit->Enable(true);

        cameraWidthEdit->ChangeValue(gd::String::From(camera.GetWidth()));
        cameraHeightEdit->ChangeValue(gd::String::From(camera.GetHeight()));
    }

    viewportX1Edit->SetBackgroundColour(wxColour(255,255,255));
    viewportY1Edit->SetBackgroundColour(wxColour(255,255,255));
    viewportX2Edit->SetBackgroundColour(wxColour(255,255,255));
    viewportY2Edit->SetBackgroundColour(wxColour(255,255,255));
    if ( camera.UseDefaultViewport() )
    {
        viewportCheck->SetValue(false);
        viewportX1Edit->Enable(false);
        viewportX2Edit->Enable(false);
        viewportY1Edit->Enable(false);
        viewportY2Edit->Enable(false);

        viewportX1Edit->ChangeValue("0");
        viewportY1Edit->ChangeValue("0");
        viewportX2Edit->ChangeValue("1");
        viewportY2Edit->ChangeValue("1");
    }
    else
    {
        viewportCheck->SetValue(true);
        viewportX1Edit->Enable(true);
        viewportX2Edit->Enable(true);
        viewportY1Edit->Enable(true);
        viewportY2Edit->Enable(true);

        viewportX1Edit->ChangeValue(gd::String::From(camera.GetViewportX1()));
        viewportX2Edit->ChangeValue(gd::String::From(camera.GetViewportX2()));
        viewportY1Edit->ChangeValue(gd::String::From(camera.GetViewportY1()));
        viewportY2Edit->ChangeValue(gd::String::From(camera.GetViewportY2()));
    }
}

void EditLayerDialog::OnsizeCheckClick(wxCommandEvent& event)
{
    std::size_t selection = cameraChoice->GetSelection();
    if (selection >= tempLayer.GetCameraCount()) return;

    Camera & camera = tempLayer.GetCamera(selection);
    camera.SetUseDefaultSize(!sizeCheck->GetValue());

    RefreshCameraSettings();
}

void EditLayerDialog::OncameraWidthEditText(wxCommandEvent& event)
{
    std::size_t selection = cameraChoice->GetSelection();
    if (selection >= tempLayer.GetCameraCount()) return;

    Camera & camera = tempLayer.GetCamera(selection);
    camera.SetSize(gd::String(cameraWidthEdit->GetValue()).To<float>(), camera.GetHeight());
}

void EditLayerDialog::OncameraHeightEditText(wxCommandEvent& event)
{
    std::size_t selection = cameraChoice->GetSelection();
    if (selection >= tempLayer.GetCameraCount()) return;

    Camera & camera = tempLayer.GetCamera(selection);
    camera.SetSize(camera.GetWidth(), gd::String(cameraHeightEdit->GetValue()).To<float>());
}

void EditLayerDialog::OnviewportCheckClick(wxCommandEvent& event)
{
    std::size_t selection = cameraChoice->GetSelection();
    if (selection >= tempLayer.GetCameraCount()) return;

    Camera & camera = tempLayer.GetCamera(selection);
    camera.SetUseDefaultViewport(!viewportCheck->GetValue());

    RefreshCameraSettings();
}

/**
 * Update viewport coordinates
 */
void EditLayerDialog::OnviewportX1EditText(wxCommandEvent& event)
{
    std::size_t selection = cameraChoice->GetSelection();
    if (selection >= tempLayer.GetCameraCount()) return;

    Camera & camera = tempLayer.GetCamera(selection);
    float x1 = camera.GetViewportX1();
    float x2 = camera.GetViewportX2();
    float y1 = camera.GetViewportY1();
    float y2 = camera.GetViewportY2();

    {
        float newValue = gd::String(viewportX1Edit->GetValue()).To<float>();
        if ( newValue >= 0 && newValue <= 1)
        {
            x1 = newValue;
            viewportX1Edit->SetBackgroundColour(wxColour(255,255,255));
        }
        else
            viewportX1Edit->SetBackgroundColour(wxColour(254,231,231));
    }

    {
        float newValue =  gd::String(viewportY1Edit->GetValue()).To<float>();
        if ( newValue >= 0 && newValue <= 1)
        {
            y1 = newValue;
            viewportY1Edit->SetBackgroundColour(wxColour(255,255,255));
        }
        else
            viewportY1Edit->SetBackgroundColour(wxColour(254,231,231));
    }

    {
        float newValue = gd::String(viewportX2Edit->GetValue()).To<float>();
        if ( newValue >= 0 && newValue <= 1)
        {
            x2 = newValue;
            viewportX2Edit->SetBackgroundColour(wxColour(255,255,255));
        }
        else
            viewportX2Edit->SetBackgroundColour(wxColour(254,231,231));
    }

    {
        float newValue = gd::String(viewportY2Edit->GetValue()).To<float>();
        if ( newValue >= 0 && newValue <= 1)
        {
            y2 = newValue;
            viewportY2Edit->SetBackgroundColour(wxColour(255,255,255));
        }
        else
            viewportY2Edit->SetBackgroundColour(wxColour(254,231,231));
    }

    camera.SetViewport(x1,y1,x2,y2);
}

void EditLayerDialog::OndeleteCameraBtClick(wxCommandEvent& event)
{
    std::size_t selection = cameraChoice->GetSelection();
    if (selection >= tempLayer.GetCameraCount()) return;

    if ( tempLayer.GetCameraCount() == 1 )
    {
        gd::LogMessage(_("The layer must have at least one camera."));
        return;
    }

    tempLayer.DeleteCamera(selection);
    cameraChoice->Delete(cameraChoice->GetSelection());
    cameraChoice->SetSelection(tempLayer.GetCameraCount());

    RefreshCameraSettings();
}


void EditLayerDialog::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("en/game_develop/documentation/manual/editors/scene_editor/edit_layer");
}

}
#endif
