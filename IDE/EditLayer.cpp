#include "EditLayer.h"

//(*InternalHeaders(EditLayer)
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/log.h>
#include <cstdlib>
#include "GDL/CommonTools.h"

//(*IdInit(EditLayer)
const long EditLayer::ID_STATICTEXT1 = wxNewId();
const long EditLayer::ID_TEXTCTRL1 = wxNewId();
const long EditLayer::ID_CHECKBOX1 = wxNewId();
const long EditLayer::ID_STATICTEXT2 = wxNewId();
const long EditLayer::ID_CHOICE1 = wxNewId();
const long EditLayer::ID_BUTTON5 = wxNewId();
const long EditLayer::ID_BUTTON3 = wxNewId();
const long EditLayer::ID_CHECKBOX2 = wxNewId();
const long EditLayer::ID_TEXTCTRL2 = wxNewId();
const long EditLayer::ID_STATICTEXT4 = wxNewId();
const long EditLayer::ID_TEXTCTRL3 = wxNewId();
const long EditLayer::ID_CHECKBOX3 = wxNewId();
const long EditLayer::ID_STATICTEXT7 = wxNewId();
const long EditLayer::ID_TEXTCTRL4 = wxNewId();
const long EditLayer::ID_STATICTEXT6 = wxNewId();
const long EditLayer::ID_TEXTCTRL5 = wxNewId();
const long EditLayer::ID_STATICTEXT8 = wxNewId();
const long EditLayer::ID_TEXTCTRL6 = wxNewId();
const long EditLayer::ID_STATICTEXT9 = wxNewId();
const long EditLayer::ID_TEXTCTRL7 = wxNewId();
const long EditLayer::ID_STATICTEXT3 = wxNewId();
const long EditLayer::ID_STATICLINE1 = wxNewId();
const long EditLayer::ID_BUTTON2 = wxNewId();
const long EditLayer::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditLayer,wxDialog)
	//(*EventTable(EditLayer)
	//*)
END_EVENT_TABLE()

EditLayer::EditLayer(wxWindow* parent, Layer & layer_) :
layer(layer_),
tempLayer(layer_)
{
	//(*Initialize(EditLayer)
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

	Create(parent, wxID_ANY, _("Modify the parameters of the layer"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Name :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	nameEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(129,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
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
	cameraChoice = new wxChoice(this, ID_CHOICE1, wxDefaultPosition, wxSize(37,21), 0, 0, 0, wxDefaultValidator, _T("ID_CHOICE1"));
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
	cameraWidthEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(52,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	cameraWidthEdit->Disable();
	FlexGridSizer8->Add(cameraWidthEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("x"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer8->Add(StaticText4, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cameraHeightEdit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(52,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
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
	viewportX1Edit = new wxTextCtrl(this, ID_TEXTCTRL4, _("0"), wxDefaultPosition, wxSize(35,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	viewportX1Edit->Disable();
	FlexGridSizer9->Add(viewportX1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText6 = new wxStaticText(this, ID_STATICTEXT6, _(";"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer9->Add(StaticText6, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	viewportY1Edit = new wxTextCtrl(this, ID_TEXTCTRL5, _("0"), wxDefaultPosition, wxSize(35,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
	viewportY1Edit->Disable();
	FlexGridSizer9->Add(viewportY1Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText8 = new wxStaticText(this, ID_STATICTEXT8, _("to"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer9->Add(StaticText8, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	viewportX2Edit = new wxTextCtrl(this, ID_TEXTCTRL6, _("1"), wxDefaultPosition, wxSize(35,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL6"));
	viewportX2Edit->Disable();
	FlexGridSizer9->Add(viewportX2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText9 = new wxStaticText(this, ID_STATICTEXT9, _(";"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer9->Add(StaticText9, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	viewportY2Edit = new wxTextCtrl(this, ID_TEXTCTRL7, _("1"), wxDefaultPosition, wxSize(35,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL7"));
	viewportY2Edit->Disable();
	FlexGridSizer9->Add(viewportY2Edit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer6->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("For example, a camera which takes the left side of the window would be defined with 0, 0, 0.5, 1.By default, a camera has a viewport which covers the entire window."), wxDefaultPosition, wxDefaultSize, wxALIGN_RIGHT, _T("ID_STATICTEXT3"));
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
	okBt = new wxButton(this, ID_BUTTON2, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON1, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_CHOICE1,wxEVT_COMMAND_CHOICE_SELECTED,(wxObjectEventFunction)&EditLayer::OncameraChoiceSelect);
	Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditLayer::OndeleteCameraBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditLayer::OnaddCameraBtClick);
	Connect(ID_CHECKBOX2,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&EditLayer::OnsizeCheckClick);
	Connect(ID_TEXTCTRL2,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLayer::OncameraWidthEditText);
	Connect(ID_TEXTCTRL3,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLayer::OncameraHeightEditText);
	Connect(ID_CHECKBOX3,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&EditLayer::OnviewportCheckClick);
	Connect(ID_TEXTCTRL4,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLayer::OnviewportX1EditText);
	Connect(ID_TEXTCTRL5,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLayer::OnviewportX1EditText);
	Connect(ID_TEXTCTRL6,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLayer::OnviewportX1EditText);
	Connect(ID_TEXTCTRL7,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLayer::OnviewportX1EditText);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditLayer::OnokBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditLayer::OncancelBtClick);
	//*)

	nameEdit->ChangeValue(layer.GetName());
	visibilityCheck->SetValue(layer.GetVisibility());

	//Impossible de modifier le nom du calque de base
	if ( layer.GetName() == "" )
        nameEdit->SetEditable(false);


    for (unsigned int i = 0;i<layer.GetCameraCount();++i)
    	cameraChoice->Append(ToString(i));

    cameraChoice->SetSelection(0);
    RefreshCameraSettings();
}

EditLayer::~EditLayer()
{
	//(*Destroy(EditLayer)
	//*)
}


void EditLayer::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void EditLayer::OnokBtClick(wxCommandEvent& event)
{
    //Obligation d'avoir un nom sauf pour le calque de base
    if ( nameEdit->GetValue() == "" && nameEdit->IsEditable() )
    {
        wxLogWarning(_("The name is incorrect"));
        return;
    }

    tempLayer.SetName(ToString(nameEdit->GetValue()));
    tempLayer.SetVisibility(visibilityCheck->GetValue());

    layer = tempLayer;
    EndModal(1);
}

void EditLayer::OnaddCameraBtClick(wxCommandEvent& event)
{
    cameraChoice->Append(ToString(tempLayer.GetCameraCount()));
    tempLayer.SetCameraCount(tempLayer.GetCameraCount()+1);
}

void EditLayer::OncameraChoiceSelect(wxCommandEvent& event)
{
    RefreshCameraSettings();
}

void EditLayer::RefreshCameraSettings()
{
    unsigned int selection = cameraChoice->GetSelection();
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

        cameraWidthEdit->ChangeValue(ToString(camera.GetSize().x));
        cameraHeightEdit->ChangeValue(ToString(camera.GetSize().y));
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

        viewportX1Edit->ChangeValue(ToString(camera.GetViewport().left));
        viewportY1Edit->ChangeValue(ToString(camera.GetViewport().top));
        viewportX2Edit->ChangeValue(ToString(camera.GetViewport().left+camera.GetViewport().width));
        viewportY2Edit->ChangeValue(ToString(camera.GetViewport().top+camera.GetViewport().height));
    }
}

void EditLayer::OnsizeCheckClick(wxCommandEvent& event)
{
    unsigned int selection = cameraChoice->GetSelection();
    if (selection >= tempLayer.GetCameraCount()) return;

    Camera & camera = tempLayer.GetCamera(selection);
    camera.SetUseDefaultSize(!sizeCheck->GetValue());

    RefreshCameraSettings();
}

void EditLayer::OncameraWidthEditText(wxCommandEvent& event)
{
    unsigned int selection = cameraChoice->GetSelection();
    if (selection >= tempLayer.GetCameraCount()) return;

    Camera & camera = tempLayer.GetCamera(selection);
    camera.SetSize(sf::Vector2f(ToFloat(ToString(cameraWidthEdit->GetValue())), camera.GetSize().y));
}

void EditLayer::OncameraHeightEditText(wxCommandEvent& event)
{
    unsigned int selection = cameraChoice->GetSelection();
    if (selection >= tempLayer.GetCameraCount()) return;

    Camera & camera = tempLayer.GetCamera(selection);
    camera.SetSize(sf::Vector2f(camera.GetSize().x, ToFloat(ToString(cameraHeightEdit->GetValue()))));
}

void EditLayer::OnviewportCheckClick(wxCommandEvent& event)
{
    unsigned int selection = cameraChoice->GetSelection();
    if (selection >= tempLayer.GetCameraCount()) return;

    Camera & camera = tempLayer.GetCamera(selection);
    camera.SetUseDefaultViewport(!viewportCheck->GetValue());

    RefreshCameraSettings();
}

/**
 * Update viewport coordinates
 */
void EditLayer::OnviewportX1EditText(wxCommandEvent& event)
{
    unsigned int selection = cameraChoice->GetSelection();
    if (selection >= tempLayer.GetCameraCount()) return;

    Camera & camera = tempLayer.GetCamera(selection);
    sf::FloatRect newViewport = camera.GetViewport();

    {
        float newValue = ToFloat(ToString(viewportX1Edit->GetValue()));
        if ( newValue >= 0 && newValue <= 1)
        {
            newViewport.left = newValue;
            viewportX1Edit->SetBackgroundColour(wxColour(255,255,255));
        }
        else
            viewportX1Edit->SetBackgroundColour(wxColour(254,231,231));
    }

    {
        float newValue =  ToFloat(ToString(viewportY1Edit->GetValue()));
        if ( newValue >= 0 && newValue <= 1)
        {
            newViewport.top = newValue;
            viewportY1Edit->SetBackgroundColour(wxColour(255,255,255));
        }
        else
            viewportY1Edit->SetBackgroundColour(wxColour(254,231,231));
    }

    {
        float newValue = ToFloat(ToString(viewportX2Edit->GetValue()));
        if ( newValue >= 0 && newValue <= 1)
        {
            newViewport.width = newValue-newViewport.left;
            viewportX2Edit->SetBackgroundColour(wxColour(255,255,255));
        }
        else
            viewportX2Edit->SetBackgroundColour(wxColour(254,231,231));
    }

    {
        float newValue = ToFloat(ToString(viewportY2Edit->GetValue()));
        if ( newValue >= 0 && newValue <= 1)
        {
            newViewport.height = newValue-newViewport.top;
            viewportY2Edit->SetBackgroundColour(wxColour(255,255,255));
        }
        else
            viewportY2Edit->SetBackgroundColour(wxColour(254,231,231));
    }

    camera.SetViewport(newViewport);
}

void EditLayer::OndeleteCameraBtClick(wxCommandEvent& event)
{
    unsigned int selection = cameraChoice->GetSelection();
    if (selection >= tempLayer.GetCameraCount()) return;

    if ( tempLayer.GetCameraCount() == 1 )
    {
        wxLogMessage(_("The layer must have at least one camera."));
        return;
    }

    tempLayer.DeleteCamera(selection);
    cameraChoice->Delete(cameraChoice->GetSelection());
    cameraChoice->SetSelection(tempLayer.GetCameraCount());

    RefreshCameraSettings();
}

