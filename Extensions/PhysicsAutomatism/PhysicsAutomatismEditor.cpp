#if defined(GDE)
#include "PhysicsAutomatismEditor.h"

//(*InternalHeaders(PhysicsAutomatismEditor)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDL/Game.h"
#include "PhysicsAutomatism.h"
#include "GDL/MainEditorCommand.h"
#include "GDL/CommonTools.h"
#include "GDL/Scene.h"

//(*IdInit(PhysicsAutomatismEditor)
const long PhysicsAutomatismEditor::ID_STATICTEXT1 = wxNewId();
const long PhysicsAutomatismEditor::ID_TEXTCTRL1 = wxNewId();
const long PhysicsAutomatismEditor::ID_STATICTEXT2 = wxNewId();
const long PhysicsAutomatismEditor::ID_TEXTCTRL2 = wxNewId();
const long PhysicsAutomatismEditor::ID_STATICTEXT3 = wxNewId();
const long PhysicsAutomatismEditor::ID_TEXTCTRL3 = wxNewId();
const long PhysicsAutomatismEditor::ID_STATICTEXT4 = wxNewId();
const long PhysicsAutomatismEditor::ID_TEXTCTRL4 = wxNewId();
const long PhysicsAutomatismEditor::ID_STATICLINE1 = wxNewId();
const long PhysicsAutomatismEditor::ID_BUTTON1 = wxNewId();
const long PhysicsAutomatismEditor::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(PhysicsAutomatismEditor,wxDialog)
	//(*EventTable(PhysicsAutomatismEditor)
	//*)
END_EVENT_TABLE()

PhysicsAutomatismEditor::PhysicsAutomatismEditor(wxWindow* parent, Game & game_, Scene * scene_, PhysicsAutomatism & automatism_, MainEditorCommand & mainEditorCommand_ ) :
automatism(automatism_),
game(game_),
scene(scene_),
mainEditorCommand(mainEditorCommand_)
{
	//(*Initialize(PhysicsAutomatismEditor)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Editer l\'automatisme"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Paramètres initiaux"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Densité de masse :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	massDensityEdit = new wxTextCtrl(this, ID_TEXTCTRL1, _("1"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer2->Add(massDensityEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Friction :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	frictionEdit = new wxTextCtrl(this, ID_TEXTCTRL2, _("0.8"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer2->Add(frictionEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Paramètres globaux du moteur physique"));
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("Coordonnées du vecteur de gravité :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer4->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	gravityXEdit = new wxTextCtrl(this, ID_TEXTCTRL3, _("0"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	FlexGridSizer5->Add(gravityXEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _(";"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer5->Add(StaticText4, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	gravityYEdit = new wxTextCtrl(this, ID_TEXTCTRL4, _("0"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	FlexGridSizer5->Add(gravityYEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2->Add(FlexGridSizer4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&PhysicsAutomatismEditor::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&PhysicsAutomatismEditor::OncancelBtClick);
	//*)

	massDensityEdit->SetValue(ToString(automatism.massDensity));
	frictionEdit->SetValue(ToString(automatism.averageFriction));
	gravityXEdit->SetValue(ToString(PhysicsAutomatism::scenesPhysicsDatas[scene].gravityX));
	gravityYEdit->SetValue(ToString(PhysicsAutomatism::scenesPhysicsDatas[scene].gravityY));
}

PhysicsAutomatismEditor::~PhysicsAutomatismEditor()
{
	//(*Destroy(PhysicsAutomatismEditor)
	//*)
}


void PhysicsAutomatismEditor::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void PhysicsAutomatismEditor::OnokBtClick(wxCommandEvent& event)
{
    automatism.massDensity = ToFloat(massDensityEdit->GetValue().mb_str());
    automatism.averageFriction = ToFloat(frictionEdit->GetValue().mb_str());

    PhysicsAutomatism::scenesPhysicsDatas[scene].gravityX = ToFloat(gravityXEdit->GetValue().mb_str());
    PhysicsAutomatism::scenesPhysicsDatas[scene].gravityY = ToFloat(gravityYEdit->GetValue().mb_str());

    EndModal(1);
}
#endif
