/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#include "EditPropScene.h"

//(*InternalHeaders(EditPropScene)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/colour.h>
#include <wx/colordlg.h>
#include <wx/cmndata.h>
#include <wx/help.h>
#include <wx/config.h>
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/CommonTools.h"

using namespace gd;

//(*IdInit(EditPropScene)
const long EditPropScene::ID_STATICTEXT4 = wxNewId();
const long EditPropScene::ID_STATICTEXT8 = wxNewId();
const long EditPropScene::ID_TEXTCTRL1 = wxNewId();
const long EditPropScene::ID_STATICTEXT9 = wxNewId();
const long EditPropScene::ID_PANEL1 = wxNewId();
const long EditPropScene::ID_CHECKBOX2 = wxNewId();
const long EditPropScene::ID_CHECKBOX1 = wxNewId();
const long EditPropScene::ID_STATICTEXT1 = wxNewId();
const long EditPropScene::ID_RADIOBUTTON1 = wxNewId();
const long EditPropScene::ID_RADIOBUTTON2 = wxNewId();
const long EditPropScene::ID_STATICTEXT3 = wxNewId();
const long EditPropScene::ID_STATICTEXT2 = wxNewId();
const long EditPropScene::ID_TEXTCTRL2 = wxNewId();
const long EditPropScene::ID_STATICTEXT5 = wxNewId();
const long EditPropScene::ID_STATICTEXT6 = wxNewId();
const long EditPropScene::ID_TEXTCTRL3 = wxNewId();
const long EditPropScene::ID_STATICTEXT7 = wxNewId();
const long EditPropScene::ID_TEXTCTRL4 = wxNewId();
const long EditPropScene::ID_STATICLINE2 = wxNewId();
const long EditPropScene::ID_STATICBITMAP2 = wxNewId();
const long EditPropScene::ID_HYPERLINKCTRL1 = wxNewId();
const long EditPropScene::ID_BUTTON2 = wxNewId();
const long EditPropScene::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditPropScene,wxDialog)
	//(*EventTable(EditPropScene)
	//*)
END_EVENT_TABLE()

EditPropScene::EditPropScene(wxWindow* parent, gd::Layout & layout_) :
    layout(layout_)
{
	//(*Initialize(EditPropScene)
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Properties of "), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxMINIMIZE_BOX, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(2);
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	FlexGridSizer10 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer10->AddGrowableCol(0);
	StaticText9 = new wxStaticText(this, ID_STATICTEXT4, _("Basic properties"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	wxFont StaticText9Font(wxDEFAULT,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_BOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText9->SetFont(StaticText9Font);
	FlexGridSizer10->Add(StaticText9, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10->Add(20,8,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText7 = new wxStaticText(this, ID_STATICTEXT8, _("Window default title:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer10->Add(StaticText7, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	CaptionEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer10->Add(CaptionEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText8 = new wxStaticText(this, ID_STATICTEXT9, _("Background color:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer10->Add(StaticText8, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(24,23), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxColour(100,100,100));
	FlexGridSizer10->Add(Panel1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10->Add(20,8,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	disableInputCheck = new wxCheckBox(this, ID_CHECKBOX2, _("Deactivate input when focus is lost"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	disableInputCheck->SetValue(true);
	FlexGridSizer10->Add(disableInputCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10->Add(20,8,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	stopSoundsCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Stop all sounds and musics at startup"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	stopSoundsCheck->SetValue(true);
	FlexGridSizer10->Add(stopSoundsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Objects internal sort:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer10->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	fastSortCheck = new wxRadioButton(this, ID_RADIOBUTTON1, _("Fast sort ( faster but risk of \"flickering\")"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
	fastSortCheck->SetValue(true);
	FlexGridSizer10->Add(fastSortCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10->Add(20,8,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	stableSortCheck = new wxRadioButton(this, ID_RADIOBUTTON2, _("Stable sort (slower but less \"flickering\")"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON2"));
	FlexGridSizer10->Add(stableSortCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("Advanced"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	wxFont StaticText3Font(wxDEFAULT,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_BOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText3->SetFont(StaticText3Font);
	FlexGridSizer10->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10->Add(20,8,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("OpenGL Field of view :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer10->Add(StaticText2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	fovEdit = new wxTextCtrl(this, ID_TEXTCTRL2, _("90"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer7->Add(fovEdit, 1, wxTOP|wxBOTTOM|wxLEFT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT5, _("°"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer7->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT6, _("First clipping plane distance :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer10->Add(StaticText5, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	zNearEdit = new wxTextCtrl(this, ID_TEXTCTRL3, _("1"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	FlexGridSizer10->Add(zNearEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText6 = new wxStaticText(this, ID_STATICTEXT7, _("Last clipping plane distance :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer10->Add(StaticText6, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	zFarEdit = new wxTextCtrl(this, ID_TEXTCTRL4, _("500"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	FlexGridSizer10->Add(zFarEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableRow(0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer2->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	HyperlinkCtrl1->SetToolTip(_("Display help about this window"));
	FlexGridSizer2->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	OkBt = new wxButton(this, ID_BUTTON2, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON3, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer3->Add(AnnulerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	Panel1->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&EditPropScene::OnPanel1LeftUp,0,this);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&EditPropScene::OnAideBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditPropScene::OnOkBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditPropScene::OnAnnulerBtClick);
	//*)

	CaptionEdit->ChangeValue(layout.GetWindowDefaultTitle());
	SetTitle(_("Properties of ")+layout.GetName());

	Panel1->SetBackgroundColour(wxColour(layout.GetBackgroundColorRed(), layout.GetBackgroundColorGreen(), layout.GetBackgroundColorBlue()));

    if ( layout.StandardSortMethod() ) stableSortCheck->SetValue(true);
    fovEdit->SetValue(gd::String::From(layout.GetOpenGLFOV()));
    zNearEdit->SetValue(gd::String::From(layout.GetOpenGLZNear()));
    zFarEdit->SetValue(gd::String::From(layout.GetOpenGLZFar()));
    stopSoundsCheck->SetValue(layout.StopSoundsOnStartup());
    disableInputCheck->SetValue(layout.IsInputDisabledWhenFocusIsLost());
}

EditPropScene::~EditPropScene()
{
	//(*Destroy(EditPropScene)
	//*)
}


void EditPropScene::OnOkBtClick(wxCommandEvent& event)
{
    wxColourData cData;
    cData.SetColour(Panel1->GetBackgroundColour());
    layout.SetBackgroundColor( cData.GetColour().Red(), cData.GetColour().Green(), cData.GetColour().Blue());
    layout.SetWindowDefaultTitle(CaptionEdit->GetValue());
    layout.SetOpenGLFOV(gd::String(fovEdit->GetValue()).To<float>());
    layout.SetOpenGLZNear(gd::String(zNearEdit->GetValue()).To<float>());
    layout.SetOpenGLZFar(gd::String(zFarEdit->GetValue()).To<float>());
    layout.SetStopSoundsOnStartup(stopSoundsCheck->GetValue());
    layout.SetStandardSortMethod(fastSortCheck->GetValue());
    layout.DisableInputWhenFocusIsLost(disableInputCheck->GetValue());

    EndModal(1);
}

void EditPropScene::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void EditPropScene::OnPanel1LeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour(Panel1->GetBackgroundColour());
    wxColourDialog Dialog(this, &cData);
    if ( Dialog.ShowModal() == wxID_OK)
    {
        cData = Dialog.GetColourData();
        Panel1->SetBackgroundColour(cData.GetColour());
        Panel1->Refresh();
    }
}

void EditPropScene::OnAideBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/edit_projman");
}
