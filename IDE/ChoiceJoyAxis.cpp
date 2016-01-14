/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#include "ChoiceJoyAxis.h"

//(*InternalHeaders(ChoiceJoyAxis)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <string>
#include <vector>
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/IDE/Dialogs/EditStrExpressionDialog.h"
#include "GDCore/Tools/HelpFileAccess.h"

using namespace std;

//(*IdInit(ChoiceJoyAxis)
const long ChoiceJoyAxis::ID_STATICTEXT1 = wxNewId();
const long ChoiceJoyAxis::ID_RADIOBOX1 = wxNewId();
const long ChoiceJoyAxis::ID_STATICLINE1 = wxNewId();
const long ChoiceJoyAxis::ID_STATICBITMAP2 = wxNewId();
const long ChoiceJoyAxis::ID_HYPERLINKCTRL1 = wxNewId();
const long ChoiceJoyAxis::ID_BUTTON3 = wxNewId();
const long ChoiceJoyAxis::ID_BUTTON2 = wxNewId();
const long ChoiceJoyAxis::ID_BUTTON4 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChoiceJoyAxis,wxDialog)
	//(*EventTable(ChoiceJoyAxis)
	//*)
END_EVENT_TABLE()

ChoiceJoyAxis::ChoiceJoyAxis(wxWindow* parent, gd::String joyaxis_, gd::Project & game_, gd::Layout & scene_) :
joyaxis(joyaxis_),
game(game_),
scene(scene_)
{
	//(*Initialize(ChoiceJoyAxis)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Choose joystick\'s axis"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Choose directly Joystick axis :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer1->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	wxString __wxRadioBoxChoices_1[8] =
	{
		_("AxisX"),
		_("AxisY"),
		_("AxisZ"),
		_("AxisR"),
		_("AxisU"),
		_("AxisV"),
		_("AxisPovX"),
		_("AxisPovY")
	};
	axisRadio = new wxRadioBox(this, ID_RADIOBOX1, _("Axis"), wxDefaultPosition, wxDefaultSize, 8, __wxRadioBoxChoices_1, 1, 0, wxDefaultValidator, _T("ID_RADIOBOX1"));
	FlexGridSizer1->Add(axisRadio, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 4, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap2 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer17->Add(StaticBitmap2, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer17, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	okBt = new wxButton(this, ID_BUTTON3, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer3->Add(okBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	annulerBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(annulerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	advancedBt = new wxButton(this, ID_BUTTON4, _("Advanced"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer3->Add(advancedBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_RADIOBOX1,wxEVT_COMMAND_RADIOBOX_SELECTED,(wxObjectEventFunction)&ChoiceJoyAxis::OnaxisRadioSelect);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ChoiceJoyAxis::OnhelpBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceJoyAxis::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceJoyAxis::OnannulerBtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceJoyAxis::OnadvancedBtClick);
	//*)

	if ( joyaxis == "\"AxisX\"" ) axisRadio->SetSelection(0);
	else if ( joyaxis == "\"AxisY\"" ) axisRadio->SetSelection(1);
	else if ( joyaxis == "\"AxisZ\"" ) axisRadio->SetSelection(2);
	else if ( joyaxis == "\"AxisR\"" ) axisRadio->SetSelection(3);
	else if ( joyaxis == "\"AxisU\"" ) axisRadio->SetSelection(4);
	else if ( joyaxis == "\"AxisV\"" ) axisRadio->SetSelection(5);
	else if ( joyaxis == "\"AxisPOV\"" || joyaxis == "\"AxisPovX\"" ) axisRadio->SetSelection(6);
	else if ( joyaxis == "\"AxisPovY\"" ) axisRadio->SetSelection(7);
	else joyaxis = "\"AxisX\"";
}

ChoiceJoyAxis::~ChoiceJoyAxis()
{
	//(*Destroy(ChoiceJoyAxis)
	//*)
}


void ChoiceJoyAxis::OnadvancedBtClick(wxCommandEvent& event)
{
    gd::EditStrExpressionDialog dialog(this, joyaxis, game, scene);
    if ( dialog.ShowModal() == 1 )
        joyaxis = dialog.GetExpression();
}

void ChoiceJoyAxis::OnaxisRadioSelect(wxCommandEvent& event)
{
	if ( axisRadio->GetSelection() == 0 ) joyaxis = "\"AxisX\"";
	else if ( axisRadio->GetSelection() == 1 ) joyaxis = "\"AxisY\"";
	else if ( axisRadio->GetSelection() == 2 ) joyaxis = "\"AxisZ\"";
	else if ( axisRadio->GetSelection() == 3 ) joyaxis = "\"AxisR\"";
	else if ( axisRadio->GetSelection() == 4 ) joyaxis = "\"AxisU\"";
	else if ( axisRadio->GetSelection() == 5 ) joyaxis = "\"AxisV\"";
	else if ( axisRadio->GetSelection() == 6 ) joyaxis = "\"AxisPovX\"";
	else if ( axisRadio->GetSelection() == 7 ) joyaxis = "\"AxisPovY\"";
}

void ChoiceJoyAxis::OnokBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void ChoiceJoyAxis::OnannulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}


void ChoiceJoyAxis::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/events_editor/parameters");
}
