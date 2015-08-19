/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "PhysicsBehaviorEditor.h"

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
//(*InternalHeaders(PhysicsBehaviorEditor)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDCore/Tools/Log.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include "GDCpp/Project.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/Scene.h"
#include "PhysicsBehavior.h"
#include "ScenePhysicsDatas.h"
#include "GDCore/Tools/Localization.h"

#include "CustomPolygonDialog.h"

using namespace std;

//(*IdInit(PhysicsBehaviorEditor)
const long PhysicsBehaviorEditor::ID_STATICTEXT11 = wxNewId();
const long PhysicsBehaviorEditor::ID_RADIOBUTTON1 = wxNewId();
const long PhysicsBehaviorEditor::ID_RADIOBUTTON2 = wxNewId();
const long PhysicsBehaviorEditor::ID_RADIOBUTTON3 = wxNewId();
const long PhysicsBehaviorEditor::ID_BUTTON3 = wxNewId();
const long PhysicsBehaviorEditor::ID_CHECKBOX1 = wxNewId();
const long PhysicsBehaviorEditor::ID_CHECKBOX3 = wxNewId();
const long PhysicsBehaviorEditor::ID_CHECKBOX2 = wxNewId();
const long PhysicsBehaviorEditor::ID_STATICTEXT1 = wxNewId();
const long PhysicsBehaviorEditor::ID_TEXTCTRL1 = wxNewId();
const long PhysicsBehaviorEditor::ID_STATICTEXT2 = wxNewId();
const long PhysicsBehaviorEditor::ID_TEXTCTRL2 = wxNewId();
const long PhysicsBehaviorEditor::ID_STATICTEXT12 = wxNewId();
const long PhysicsBehaviorEditor::ID_TEXTCTRL9 = wxNewId();
const long PhysicsBehaviorEditor::ID_STATICTEXT9 = wxNewId();
const long PhysicsBehaviorEditor::ID_TEXTCTRL7 = wxNewId();
const long PhysicsBehaviorEditor::ID_STATICTEXT10 = wxNewId();
const long PhysicsBehaviorEditor::ID_TEXTCTRL8 = wxNewId();
const long PhysicsBehaviorEditor::ID_STATICTEXT3 = wxNewId();
const long PhysicsBehaviorEditor::ID_TEXTCTRL3 = wxNewId();
const long PhysicsBehaviorEditor::ID_STATICTEXT4 = wxNewId();
const long PhysicsBehaviorEditor::ID_TEXTCTRL4 = wxNewId();
const long PhysicsBehaviorEditor::ID_STATICTEXT5 = wxNewId();
const long PhysicsBehaviorEditor::ID_STATICTEXT7 = wxNewId();
const long PhysicsBehaviorEditor::ID_TEXTCTRL5 = wxNewId();
const long PhysicsBehaviorEditor::ID_STATICTEXT6 = wxNewId();
const long PhysicsBehaviorEditor::ID_TEXTCTRL6 = wxNewId();
const long PhysicsBehaviorEditor::ID_STATICTEXT8 = wxNewId();
const long PhysicsBehaviorEditor::ID_STATICLINE1 = wxNewId();
const long PhysicsBehaviorEditor::ID_BUTTON1 = wxNewId();
const long PhysicsBehaviorEditor::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(PhysicsBehaviorEditor,wxDialog)
	//(*EventTable(PhysicsBehaviorEditor)
	//*)
END_EVENT_TABLE()

PhysicsBehaviorEditor::PhysicsBehaviorEditor(wxWindow* parent, gd::Project & game_, gd::Layout * scene_, PhysicsBehavior & behavior_, gd::MainFrameWrapper & mainFrameWrapper_ ) :
behavior(behavior_),
game(game_),
scene(scene_)
{
	//(*Initialize(PhysicsBehaviorEditor)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer8;
	wxBoxSizer* BoxSizer1;
	wxFlexGridSizer* FlexGridSizer13;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;

	Create(parent, wxID_ANY, _("Edit the behavior"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Initial parameters"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	StaticText11 = new wxStaticText(this, ID_STATICTEXT11, _("Shape of the collision mask"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT11"));
	FlexGridSizer5->Add(StaticText11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer13 = new wxFlexGridSizer(0, 4, 0, 0);
	rectCheck = new wxRadioButton(this, ID_RADIOBUTTON1, _("Rectangle"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
	rectCheck->SetValue(true);
	FlexGridSizer13->Add(rectCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	circleCheck = new wxRadioButton(this, ID_RADIOBUTTON2, _("Circle"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON2"));
	FlexGridSizer13->Add(circleCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	polygonCheck = new wxRadioButton(this, ID_RADIOBUTTON3, _("Custom polygon"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON3"));
	FlexGridSizer13->Add(polygonCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	polygonBt = new wxButton(this, ID_BUTTON3, _("Setup the shape..."), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer13->Add(polygonBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	staticCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Static object"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	staticCheck->SetValue(false);
	FlexGridSizer11->Add(staticCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	fixedRotationCheck = new wxCheckBox(this, ID_CHECKBOX3, _("Fixed rotation"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX3"));
	fixedRotationCheck->SetValue(false);
	FlexGridSizer11->Add(fixedRotationCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	bulletCheck = new wxCheckBox(this, ID_CHECKBOX2, _("Comparable to a projectile (better collision handling, but slower)"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	bulletCheck->SetValue(false);
	FlexGridSizer2->Add(bulletCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer7->AddGrowableCol(1);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Mass density :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer7->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	massDensityEdit = new wxTextCtrl(this, ID_TEXTCTRL1, _("1"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer7->Add(massDensityEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer8->AddGrowableCol(1);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Friction :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer8->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	frictionEdit = new wxTextCtrl(this, ID_TEXTCTRL2, _("0.8"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer8->Add(frictionEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer12 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer12->AddGrowableCol(1);
	StaticText12 = new wxStaticText(this, ID_STATICTEXT12, _("Restitution ( Elasticity ) :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT12"));
	FlexGridSizer12->Add(StaticText12, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	restitutionEdit = new wxTextCtrl(this, ID_TEXTCTRL9, _("0"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL9"));
	FlexGridSizer12->Add(restitutionEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer9->AddGrowableCol(1);
	StaticText9 = new wxStaticText(this, ID_STATICTEXT9, _("Linear damping :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer9->Add(StaticText9, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	linearDampingEdit = new wxTextCtrl(this, ID_TEXTCTRL7, _("0.1"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL7"));
	FlexGridSizer9->Add(linearDampingEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer10 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer10->AddGrowableCol(1);
	StaticText10 = new wxStaticText(this, ID_STATICTEXT10, _("Angular damping :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT10"));
	FlexGridSizer10->Add(StaticText10, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	angularDampingEdit = new wxTextCtrl(this, ID_TEXTCTRL8, _("0.1"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL8"));
	FlexGridSizer10->Add(angularDampingEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Global parameters of physics engine"));
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("Gravity coordinates :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer4->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	gravityXEdit = new wxTextCtrl(this, ID_TEXTCTRL3, _("0"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	BoxSizer1->Add(gravityXEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _(";"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	BoxSizer1->Add(StaticText4, 0, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	gravityYEdit = new wxTextCtrl(this, ID_TEXTCTRL4, _("0"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	BoxSizer1->Add(gravityYEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(BoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT5, _("Scale of the virtual world :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer4->Add(StaticText5, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6 = new wxFlexGridSizer(0, 5, 0, 0);
	StaticText7 = new wxStaticText(this, ID_STATICTEXT7, _("1meter ="), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer6->Add(StaticText7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	scaleXEdit = new wxTextCtrl(this, ID_TEXTCTRL5, _("0"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
	FlexGridSizer6->Add(scaleXEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText6 = new wxStaticText(this, ID_STATICTEXT6, _("( X axis );"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer6->Add(StaticText6, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	scaleYEdit = new wxTextCtrl(this, ID_TEXTCTRL6, _("0"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL6"));
	FlexGridSizer6->Add(scaleYEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText8 = new wxStaticText(this, ID_STATICTEXT8, _("( Y axis )"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer6->Add(StaticText8, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2->Add(FlexGridSizer4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
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

	Connect(ID_RADIOBUTTON1,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&PhysicsBehaviorEditor::OnrectCheckSelect);
	Connect(ID_RADIOBUTTON2,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&PhysicsBehaviorEditor::OncircleCheckSelect);
	Connect(ID_RADIOBUTTON3,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&PhysicsBehaviorEditor::OnpolygonCheckSelect);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&PhysicsBehaviorEditor::OnpolygonBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&PhysicsBehaviorEditor::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&PhysicsBehaviorEditor::OncancelBtClick);
	//*)

    //Setup object datas
    rectCheck->SetValue(behavior.shapeType == PhysicsBehavior::Box);
    circleCheck->SetValue(behavior.shapeType == PhysicsBehavior::Circle);
    polygonCheck->SetValue(behavior.shapeType == PhysicsBehavior::CustomPolygon);
    polygonBt->Enable(polygonCheck->GetValue());

	coordsVector = behavior.GetPolygonCoords();
	positioning = behavior.polygonPositioning;

	polygonHeight = behavior.polygonHeight;
	polygonWidth = behavior.polygonWidth;
	automaticResizing = behavior.HasAutomaticResizing();

	staticCheck->SetValue(!behavior.dynamic);
	fixedRotationCheck->SetValue(behavior.fixedRotation);
	massDensityEdit->SetValue(gd::String::From(behavior.massDensity));
	bulletCheck->SetValue(behavior.isBullet);
	frictionEdit->SetValue(gd::String::From(behavior.averageFriction));
	restitutionEdit->SetValue(gd::String::From(behavior.averageRestitution));
	linearDampingEdit->SetValue(gd::String::From(behavior.linearDamping));
	angularDampingEdit->SetValue(gd::String::From(behavior.angularDamping));

	if ( game_.GetCurrentPlatform().GetName() == "GDevelop JS platform" )
    {
        polygonCheck->Hide();
        polygonBt->Hide();
    }

    //Setup shared datas
	if ( !scene || scene->behaviorsInitialSharedDatas.find(behavior.GetName()) == scene->behaviorsInitialSharedDatas.end())
	{
	    gd::LogError(_("Unable to access to shared datas."));
	    return;
	}

	sharedDatas = std::dynamic_pointer_cast<ScenePhysicsDatas>(scene->behaviorsInitialSharedDatas[behavior.GetName()]);

    if ( sharedDatas == std::shared_ptr<ScenePhysicsDatas>() )
    {
	    gd::LogError(_("Unable to access to shared datas : Bad data type."));
	    return;
    }

	gravityXEdit->SetValue(gd::String::From(sharedDatas->gravityX));
	gravityYEdit->SetValue(gd::String::From(sharedDatas->gravityY));
	scaleXEdit->SetValue(gd::String::From(sharedDatas->scaleX));
	scaleYEdit->SetValue(gd::String::From(sharedDatas->scaleY));
}

PhysicsBehaviorEditor::~PhysicsBehaviorEditor()
{
	//(*Destroy(PhysicsBehaviorEditor)
	//*)
}


void PhysicsBehaviorEditor::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void PhysicsBehaviorEditor::OnokBtClick(wxCommandEvent& event)
{
    if ( circleCheck->GetValue() )
        behavior.shapeType = PhysicsBehavior::Circle;
    else if( rectCheck->GetValue() )
        behavior.shapeType = PhysicsBehavior::Box;
    else
        behavior.shapeType = PhysicsBehavior::CustomPolygon;

    behavior.SetPolygonCoords(coordsVector);

    behavior.dynamic = !staticCheck->GetValue();
    behavior.fixedRotation = fixedRotationCheck->GetValue();
    behavior.isBullet = bulletCheck->GetValue();
    behavior.massDensity = gd::String(massDensityEdit->GetValue()).To<float>();
    behavior.averageFriction = gd::String(frictionEdit->GetValue()).To<float>();
    behavior.averageRestitution = gd::String(restitutionEdit->GetValue()).To<float>();
    behavior.linearDamping = gd::String(linearDampingEdit->GetValue()).To<float>();
    behavior.angularDamping = gd::String(angularDampingEdit->GetValue()).To<float>();
    behavior.polygonPositioning = static_cast<PhysicsBehavior::Positioning>(positioning);
    behavior.polygonWidth = polygonWidth;
    behavior.polygonHeight = polygonHeight;
    behavior.SetAutomaticResizing(automaticResizing);

    if ( sharedDatas != std::shared_ptr<ScenePhysicsDatas>() )
    {
        sharedDatas->gravityX = gd::String(gravityXEdit->GetValue()).To<float>();
        sharedDatas->gravityY = gd::String(gravityYEdit->GetValue()).To<float>();
        sharedDatas->scaleX = gd::String(scaleXEdit->GetValue()).To<float>();
        sharedDatas->scaleY = gd::String(scaleYEdit->GetValue()).To<float>();
    }

    EndModal(1);
}

void PhysicsBehaviorEditor::OnpolygonCheckSelect(wxCommandEvent& event)
{
    polygonBt->Enable(polygonCheck->GetValue());
}

void PhysicsBehaviorEditor::OncircleCheckSelect(wxCommandEvent& event)
{
    polygonBt->Enable(polygonCheck->GetValue());
}

void PhysicsBehaviorEditor::OnrectCheckSelect(wxCommandEvent& event)
{
    polygonBt->Enable(polygonCheck->GetValue());
}

void PhysicsBehaviorEditor::OnpolygonBtClick(wxCommandEvent& event)
{
    CustomPolygonDialog dialog(this, coordsVector, positioning, sf::Vector2f(polygonWidth, polygonHeight), automaticResizing);
    dialog.ShowModal();
    coordsVector = dialog.coordsVec;
    positioning = dialog.positioning;
    polygonHeight = dialog.polygonHeight;
    polygonWidth = dialog.polygonWidth;
    automaticResizing = dialog.automaticResizing;
}

#endif
