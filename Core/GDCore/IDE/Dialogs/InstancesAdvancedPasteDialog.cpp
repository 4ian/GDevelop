/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "InstancesAdvancedPasteDialog.h"

//(*InternalHeaders(InstancesAdvancedPasteDialog)
#include <wx/bitmap.h>
#include "GDCore/Tools/Localization.h"
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/SkinHelper.h"

namespace gd
{

//(*IdInit(InstancesAdvancedPasteDialog)
const long InstancesAdvancedPasteDialog::ID_STATICTEXT9 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_TEXTCTRL2 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_STATICTEXT11 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_TEXTCTRL3 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_STATICTEXT1 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_SPINCTRL1 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_STATICTEXT2 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_SPINCTRL2 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_STATICTEXT3 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_STATICTEXT6 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_TEXTCTRL4 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_STATICTEXT7 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_TEXTCTRL5 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_STATICTEXT8 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_STATICTEXT4 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_TEXTCTRL1 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_STATICTEXT5 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_STATICLINE1 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_STATICBITMAP2 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_HYPERLINKCTRL1 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_BUTTON1 = wxNewId();
const long InstancesAdvancedPasteDialog::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(InstancesAdvancedPasteDialog,wxDialog)
	//(*EventTable(InstancesAdvancedPasteDialog)
	//*)
END_EVENT_TABLE()

InstancesAdvancedPasteDialog::InstancesAdvancedPasteDialog(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size)
{
	//(*Initialize(InstancesAdvancedPasteDialog)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, id, _("Special paste"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("id"));
	SetClientSize(wxDefaultSize);
	Move(wxDefaultPosition);

		wxIcon FrameIcon;
		FrameIcon.CopyFromBitmap(gd::SkinHelper::GetIcon("paste", 16));
		SetIcon(FrameIcon);
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Paste"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer8 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticText9 = new wxStaticText(this, ID_STATICTEXT9, _("Start pasting at :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer8->Add(StaticText9, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
	xStartEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(52,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer9->Add(xStartEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText11 = new wxStaticText(this, ID_STATICTEXT11, _(";"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT11"));
	FlexGridSizer9->Add(StaticText11, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	yStartEdit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(52,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	FlexGridSizer9->Add(yStartEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Number of copies:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer8->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	xCountEdit = new wxSpinCtrl(this, ID_SPINCTRL1, _T("1"), wxDefaultPosition, wxSize(56,-1), 0, 1, 100000, 1, _T("ID_SPINCTRL1"));
	xCountEdit->SetValue(_T("1"));
	xCountEdit->SetFocus();
	FlexGridSizer11->Add(xCountEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("in width ( X )"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer11->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer8->Add(-1,-1,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10 = new wxFlexGridSizer(0, 3, 0, 0);
	yCountEdit = new wxSpinCtrl(this, ID_SPINCTRL2, _T("1"), wxDefaultPosition, wxSize(56,-1), 0, 1, 100000, 1, _T("ID_SPINCTRL2"));
	yCountEdit->SetValue(_T("1"));
	FlexGridSizer10->Add(yCountEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("in height ( Y )"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer10->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Options"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText6 = new wxStaticText(this, ID_STATICTEXT6, _("Spaces between each obejects"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer3->Add(StaticText6, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5 = new wxFlexGridSizer(0, 4, 0, 0);
	xGapEdit = new wxTextCtrl(this, ID_TEXTCTRL4, _("0"), wxDefaultPosition, wxSize(52,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	FlexGridSizer5->Add(xGapEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText7 = new wxStaticText(this, ID_STATICTEXT7, _("pixels in width"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer5->Add(StaticText7, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	yGapEdit = new wxTextCtrl(this, ID_TEXTCTRL5, _("0"), wxDefaultPosition, wxSize(52,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
	FlexGridSizer5->Add(yGapEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText8 = new wxStaticText(this, ID_STATICTEXT8, _("pixels in height"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer5->Add(StaticText8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Apply progressively to each created object :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer3->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	rotationEdit = new wxTextCtrl(this, ID_TEXTCTRL1, _("0"), wxDefaultPosition, wxSize(44,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer4->Add(rotationEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT5, _("deg"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer4->Add(StaticText5, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2->Add(FlexGridSizer3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer6->AddGrowableCol(1);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap2 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer17->Add(StaticBitmap2, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(FlexGridSizer17, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer6->Add(okBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer6->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&InstancesAdvancedPasteDialog::OnhelpBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&InstancesAdvancedPasteDialog::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&InstancesAdvancedPasteDialog::OncancelBtClick);
	//*)
}

InstancesAdvancedPasteDialog::~InstancesAdvancedPasteDialog()
{
	//(*Destroy(InstancesAdvancedPasteDialog)
	//*)
}


void InstancesAdvancedPasteDialog::OnokBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void InstancesAdvancedPasteDialog::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void InstancesAdvancedPasteDialog::SetStartX(float xStart)
{
    xStartEdit->SetValue(gd::String::From(xStart));
}
void InstancesAdvancedPasteDialog::SetStartY(float yStart)
{
    yStartEdit->SetValue(gd::String::From(yStart));
}
void InstancesAdvancedPasteDialog::SetXGap(float xGap)
{
    xGapEdit->SetValue(gd::String::From(xGap));
}
void InstancesAdvancedPasteDialog::SetYGap(float yGap)
{
    yGapEdit->SetValue(gd::String::From(yGap));
}

unsigned int InstancesAdvancedPasteDialog::GetXCount() const
{
    return xCountEdit->GetValue();
}

unsigned int InstancesAdvancedPasteDialog::GetYCount() const
{
    return yCountEdit->GetValue();
}

float InstancesAdvancedPasteDialog::GetStartX() const
{
    return gd::String(xStartEdit->GetValue()).To<float>();
}
float InstancesAdvancedPasteDialog::GetStartY() const
{
    return gd::String(yStartEdit->GetValue()).To<float>();
}
float InstancesAdvancedPasteDialog::GetXGap() const
{
    return gd::String(xGapEdit->GetValue()).To<float>();
}
float InstancesAdvancedPasteDialog::GetYGap() const
{
    return gd::String(yGapEdit->GetValue()).To<float>();
}
float InstancesAdvancedPasteDialog::GetRotationIncrementation() const
{
    return gd::String(rotationEdit->GetValue()).To<float>();
}


void InstancesAdvancedPasteDialog::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenURL(_("http://wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/editors/scene_editor/edit_scene_edit"));
}


}
#endif
