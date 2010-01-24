#include "ChoiceJoyAxis.h"

//(*InternalHeaders(ChoiceJoyAxis)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <string>
#include <vector>
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "EditTexte.h"

using namespace std;

//(*IdInit(ChoiceJoyAxis)
const long ChoiceJoyAxis::ID_STATICTEXT1 = wxNewId();
const long ChoiceJoyAxis::ID_RADIOBOX1 = wxNewId();
const long ChoiceJoyAxis::ID_STATICLINE1 = wxNewId();
const long ChoiceJoyAxis::ID_BUTTON3 = wxNewId();
const long ChoiceJoyAxis::ID_BUTTON2 = wxNewId();
const long ChoiceJoyAxis::ID_BUTTON4 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChoiceJoyAxis,wxDialog)
	//(*EventTable(ChoiceJoyAxis)
	//*)
END_EVENT_TABLE()

ChoiceJoyAxis::ChoiceJoyAxis(wxWindow* parent, string joyaxis_, Game & game_, Scene & scene_, bool canSelectGroup_, const vector < string > & mainObjectsName_) :
joyaxis(joyaxis_),
game(game_),
scene(scene_),
canSelectGroup(canSelectGroup_),
mainObjectsName(mainObjectsName_)
{
	//(*Initialize(ChoiceJoyAxis)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Choisir l\'axe du joystick"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Choisissez directement l\'axe du joystick :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer1->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	wxString __wxRadioBoxChoices_1[6] =
	{
		_("AxisX"),
		_("AxisY"),
		_("AxisZ"),
		_("AxisR"),
		_("AxisU"),
		_("AxisPOV")
	};
	axisRadio = new wxRadioBox(this, ID_RADIOBOX1, _("Axe"), wxDefaultPosition, wxDefaultSize, 6, __wxRadioBoxChoices_1, 1, 0, wxDefaultValidator, _T("ID_RADIOBOX1"));
	FlexGridSizer1->Add(axisRadio, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON3, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer3->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	annulerBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(annulerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	advancedBt = new wxButton(this, ID_BUTTON4, _("Avancé"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer3->Add(advancedBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_RADIOBOX1,wxEVT_COMMAND_RADIOBOX_SELECTED,(wxObjectEventFunction)&ChoiceJoyAxis::OnaxisRadioSelect);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceJoyAxis::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceJoyAxis::OnannulerBtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceJoyAxis::OnadvancedBtClick);
	//*)

	if ( joyaxis == "AxisX" ) axisRadio->SetSelection(0);
	else if ( joyaxis == "AxisY" ) axisRadio->SetSelection(1);
	else if ( joyaxis == "AxisZ" ) axisRadio->SetSelection(2);
	else if ( joyaxis == "AxisR" ) axisRadio->SetSelection(3);
	else if ( joyaxis == "AxisU" ) axisRadio->SetSelection(4);
	else if ( joyaxis == "AxisY" ) axisRadio->SetSelection(5);
	else joyaxis = "AxisX";
}

ChoiceJoyAxis::~ChoiceJoyAxis()
{
	//(*Destroy(ChoiceJoyAxis)
	//*)
}


void ChoiceJoyAxis::OnadvancedBtClick(wxCommandEvent& event)
{
    EditTexte dialog(this, joyaxis, game, scene, canSelectGroup, mainObjectsName);
    if ( dialog.ShowModal() == 1 )
        joyaxis = dialog.texteFinal;
}

void ChoiceJoyAxis::OnaxisRadioSelect(wxCommandEvent& event)
{
	if ( axisRadio->GetSelection() == 0 ) joyaxis = "AxisX";
	else if ( axisRadio->GetSelection() == 1 ) joyaxis = "AxisY";
	else if ( axisRadio->GetSelection() == 2 ) joyaxis = "AxisZ";
	else if ( axisRadio->GetSelection() == 3 ) joyaxis = "AxisR";
	else if ( axisRadio->GetSelection() == 4 ) joyaxis = "AxisU";
	else if ( axisRadio->GetSelection() == 5 ) joyaxis = "AxisY";
}

void ChoiceJoyAxis::OnokBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void ChoiceJoyAxis::OnannulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}
