/**

GDevelop - Path Behavior Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "PathBehaviorEditor.h"

//(*InternalHeaders(PathBehaviorEditor)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <string>
#include <cmath>
#include <limits>
#include <algorithm>
#include <memory>
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"
#include <wx/dcbuffer.h>
#include <wx/msgdlg.h>
#include <wx/textdlg.h>
#include <wx/numdlg.h>
#include <wx/filedlg.h>
#include "GDCore/IDE/SkinHelper.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/Project.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/Scene.h"
#include "ScenePathDatas.h"
#include "PathBehavior.h"

//(*IdInit(PathBehaviorEditor)
const long PathBehaviorEditor::ID_STATICTEXT6 = wxNewId();
const long PathBehaviorEditor::ID_CHOICE1 = wxNewId();
const long PathBehaviorEditor::ID_BITMAPBUTTON3 = wxNewId();
const long PathBehaviorEditor::ID_BITMAPBUTTON4 = wxNewId();
const long PathBehaviorEditor::ID_BITMAPBUTTON5 = wxNewId();
const long PathBehaviorEditor::ID_CHECKBOX4 = wxNewId();
const long PathBehaviorEditor::ID_BITMAPBUTTON1 = wxNewId();
const long PathBehaviorEditor::ID_BITMAPBUTTON6 = wxNewId();
const long PathBehaviorEditor::ID_BITMAPBUTTON2 = wxNewId();
const long PathBehaviorEditor::ID_STATICTEXT9 = wxNewId();
const long PathBehaviorEditor::ID_STATICTEXT1 = wxNewId();
const long PathBehaviorEditor::ID_PANEL1 = wxNewId();
const long PathBehaviorEditor::ID_TOGGLEBUTTON1 = wxNewId();
const long PathBehaviorEditor::ID_STATICTEXT11 = wxNewId();
const long PathBehaviorEditor::ID_SPINCTRL1 = wxNewId();
const long PathBehaviorEditor::ID_STATICTEXT12 = wxNewId();
const long PathBehaviorEditor::ID_SPINCTRL2 = wxNewId();
const long PathBehaviorEditor::ID_STATICTEXT7 = wxNewId();
const long PathBehaviorEditor::ID_TEXTCTRL3 = wxNewId();
const long PathBehaviorEditor::ID_STATICTEXT8 = wxNewId();
const long PathBehaviorEditor::ID_TEXTCTRL4 = wxNewId();
const long PathBehaviorEditor::ID_CHECKBOX3 = wxNewId();
const long PathBehaviorEditor::ID_STATICTEXT4 = wxNewId();
const long PathBehaviorEditor::ID_TEXTCTRL2 = wxNewId();
const long PathBehaviorEditor::ID_STATICTEXT5 = wxNewId();
const long PathBehaviorEditor::ID_STATICTEXT2 = wxNewId();
const long PathBehaviorEditor::ID_TEXTCTRL1 = wxNewId();
const long PathBehaviorEditor::ID_STATICTEXT3 = wxNewId();
const long PathBehaviorEditor::ID_CHECKBOX1 = wxNewId();
const long PathBehaviorEditor::ID_CHECKBOX2 = wxNewId();
const long PathBehaviorEditor::ID_STATICTEXT10 = wxNewId();
const long PathBehaviorEditor::ID_STATICLINE1 = wxNewId();
const long PathBehaviorEditor::ID_BUTTON1 = wxNewId();
const long PathBehaviorEditor::ID_BUTTON2 = wxNewId();
//*)
const long PathBehaviorEditor::coordsBtID = wxNewId();
const long PathBehaviorEditor::positionBtID = wxNewId();
const long PathBehaviorEditor::addPointAfterBtID = wxNewId();
const long PathBehaviorEditor::removePointBtID = wxNewId();
const long PathBehaviorEditor::addAfterBtID = wxNewId();
const long PathBehaviorEditor::addBeforeBtID = wxNewId();

BEGIN_EVENT_TABLE(PathBehaviorEditor,wxDialog)
	//(*EventTable(PathBehaviorEditor)
	//*)
END_EVENT_TABLE()

PathBehaviorEditor::PathBehaviorEditor(wxWindow* parent, gd::Project & game_, gd::Layout * scene_, PathBehavior & behavior_, gd::MainFrameWrapper & mainFrameWrapper_ ) :
    behavior(behavior_),
    game(game_),
    scene(scene_),
    mainFrameWrapper(mainFrameWrapper_),
    haveDeletedAGlobalPath(false)
{
	//(*Initialize(PathBehaviorEditor)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer16;
	wxStaticBoxSizer* StaticBoxSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxBoxSizer* BoxSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxStaticBoxSizer* StaticBoxSizer3;
	wxFlexGridSizer* FlexGridSizer15;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer14;
	wxBoxSizer* BoxSizer1;
	wxFlexGridSizer* FlexGridSizer13;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;

	Create(parent, wxID_ANY, _("Edit the behavior"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	FlexGridSizer10 = new wxFlexGridSizer(1, 2, 0, 0);
	FlexGridSizer10->AddGrowableCol(0);
	FlexGridSizer10->AddGrowableRow(0);
	FlexGridSizer12 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer12->AddGrowableCol(0);
	FlexGridSizer12->AddGrowableRow(1);
	FlexGridSizer13 = new wxFlexGridSizer(0, 6, 0, 0);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT6, _("Paths:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer13->Add(StaticText5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	pathChoice = new wxChoice(this, ID_CHOICE1, wxDefaultPosition, wxSize(136,-1), 0, 0, 0, wxDefaultValidator, _T("ID_CHOICE1"));
	pathChoice->SetSelection( pathChoice->Append(_("Object main path")) );
	FlexGridSizer13->Add(pathChoice, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BitmapButton3 = new wxBitmapButton(this, ID_BITMAPBUTTON3, gd::SkinHelper::GetIcon("add", 16), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON3"));
	BitmapButton3->SetDefault();
	BitmapButton3->SetToolTip(_("Create a path"));
	FlexGridSizer13->Add(BitmapButton3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BitmapButton4 = new wxBitmapButton(this, ID_BITMAPBUTTON4, gd::SkinHelper::GetIcon("delete", 16), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON4"));
	BitmapButton4->SetDefault();
	BitmapButton4->SetToolTip(_("Delete this path"));
	FlexGridSizer13->Add(BitmapButton4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, -2);
	BitmapButton5 = new wxBitmapButton(this, ID_BITMAPBUTTON5, gd::SkinHelper::GetIcon("rename", 16), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON5"));
	BitmapButton5->SetDefault();
	BitmapButton5->SetToolTip(_("Change the name"));
	FlexGridSizer13->Add(BitmapButton5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	globalCheck = new wxCheckBox(this, ID_CHECKBOX4, _("Global"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX4"));
	globalCheck->SetValue(false);
	FlexGridSizer13->Add(globalCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Paths editor"));
	FlexGridSizer2 = new wxFlexGridSizer(4, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(2);
	FlexGridSizer6 = new wxFlexGridSizer(0, 0, 0, 0);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	BitmapButton1 = new wxBitmapButton(this, ID_BITMAPBUTTON1, gd::SkinHelper::GetIcon("add", 16), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON1"));
	BitmapButton1->SetToolTip(_("Add a point"));
	BoxSizer1->Add(BitmapButton1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 3);
	BitmapButton6 = new wxBitmapButton(this, ID_BITMAPBUTTON6, wxBitmap(wxImage(_T("res/addmore.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON6"));
	BitmapButton6->SetDefault();
	BitmapButton6->SetToolTip(_("Add..."));
	BoxSizer1->Add(BitmapButton6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
	BitmapButton2 = new wxBitmapButton(this, ID_BITMAPBUTTON2, gd::SkinHelper::GetIcon("delete", 16), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON2"));
	BitmapButton2->SetToolTip(_("Delete a point"));
	BoxSizer1->Add(BitmapButton2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 3);
	FlexGridSizer6->Add(BoxSizer1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	StaticText8 = new wxStaticText(this, ID_STATICTEXT9, _("0;0"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer6->Add(StaticText8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	contextMessageLabel = new wxStaticText(this, ID_STATICTEXT1, _("Label"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(contextMessageLabel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 3);
	FlexGridSizer5 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	FlexGridSizer5->AddGrowableRow(0);
	previewPnl = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(365,258), wxTAB_TRAVERSAL|wxWANTS_CHARS, _T("ID_PANEL1"));
	FlexGridSizer5->Add(previewPnl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 3);
	FlexGridSizer2->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer16 = new wxFlexGridSizer(0, 5, 0, 0);
	ToggleButton1 = new wxToggleButton(this, ID_TOGGLEBUTTON1, _("Image"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON1"));
	ToggleButton1->SetToolTip(_("Display an image on the background"));
	FlexGridSizer16->Add(ToggleButton1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText10 = new wxStaticText(this, ID_STATICTEXT11, _("X:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT11"));
	FlexGridSizer16->Add(StaticText10, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	bgImgXSpin = new wxSpinCtrl(this, ID_SPINCTRL1, _T("0"), wxDefaultPosition, wxSize(70,21), 0, -10000000, 10000000, 0, _T("ID_SPINCTRL1"));
	bgImgXSpin->SetValue(_T("0"));
	bgImgXSpin->Disable();
	FlexGridSizer16->Add(bgImgXSpin, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText11 = new wxStaticText(this, ID_STATICTEXT12, _("Y:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT12"));
	FlexGridSizer16->Add(StaticText11, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	bgImgYSpin = new wxSpinCtrl(this, ID_SPINCTRL2, _T("0"), wxDefaultPosition, wxSize(70,21), 0, -100000000, 100000000, 0, _T("ID_SPINCTRL2"));
	bgImgYSpin->SetValue(_T("0"));
	bgImgYSpin->Disable();
	FlexGridSizer16->Add(bgImgYSpin, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer16, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer12->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Position"));
	FlexGridSizer14 = new wxFlexGridSizer(2, 1, 0, 0);
	FlexGridSizer14->AddGrowableCol(0);
	StaticText6 = new wxStaticText(this, ID_STATICTEXT7, _("Position of the path\nrelative to the scene origin."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer14->Add(StaticText6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer15 = new wxFlexGridSizer(0, 3, 0, 0);
	xOffsetEdit = new wxTextCtrl(this, ID_TEXTCTRL3, _("0"), wxDefaultPosition, wxSize(51,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	FlexGridSizer15->Add(xOffsetEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText7 = new wxStaticText(this, ID_STATICTEXT8, _(";"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer15->Add(StaticText7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	yOffsetEdit = new wxTextCtrl(this, ID_TEXTCTRL4, _("0"), wxDefaultPosition, wxSize(51,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	FlexGridSizer15->Add(yOffsetEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer14->Add(FlexGridSizer15, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer4->Add(FlexGridSizer14, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11->Add(StaticBoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Object orientation"));
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	followAngleCheck = new wxCheckBox(this, ID_CHECKBOX3, _("Automatically update object's angle"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX3"));
	followAngleCheck->SetValue(false);
	FlexGridSizer7->Add(followAngleCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT4, _("Angle offset:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	StaticText3->SetToolTip(_("This angle will be added to the angle the object must take when following the path"));
	FlexGridSizer8->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9 = new wxFlexGridSizer(0, 2, 0, 0);
	angleOffsetEdit = new wxTextCtrl(this, ID_TEXTCTRL2, _("0"), wxDefaultPosition, wxSize(45,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer9->Add(angleOffsetEdit, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT5, _("°"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer9->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer7->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer3->Add(FlexGridSizer7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Movement and speed"));
	FlexGridSizer4 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer4->AddGrowableCol(1);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT2, _("Speed:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer4->Add(StaticText1, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	speedEdit = new wxTextCtrl(this, ID_TEXTCTRL1, _("200"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer4->Add(speedEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT3, _("Options:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer4->Add(StaticText2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer2 = new wxBoxSizer(wxHORIZONTAL);
	reverseCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Reverse movement at the end"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	reverseCheck->SetValue(false);
	BoxSizer2->Add(reverseCheck, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	stopCheck = new wxCheckBox(this, ID_CHECKBOX2, _("Stop at the end of the path"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	stopCheck->SetValue(false);
	BoxSizer2->Add(stopCheck, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(BoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText9 = new wxStaticText(this, ID_STATICTEXT10, _("These parameters are independent from the path."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT10"));
	wxFont StaticText9Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText9->SetFont(StaticText9Font);
	FlexGridSizer11->Add(StaticText9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
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

	Connect(ID_CHOICE1,wxEVT_COMMAND_CHOICE_SELECTED,(wxObjectEventFunction)&PathBehaviorEditor::OnpathChoiceSelect);
	Connect(ID_BITMAPBUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&PathBehaviorEditor::OnBitmapButton3Click1);
	Connect(ID_BITMAPBUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&PathBehaviorEditor::OnBitmapButton4Click);
	Connect(ID_BITMAPBUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&PathBehaviorEditor::OnBitmapButton5Click);
	Connect(ID_CHECKBOX4,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&PathBehaviorEditor::OnglobalCheckClick);
	Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&PathBehaviorEditor::OnBitmapButton1Click);
	Connect(ID_BITMAPBUTTON6,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&PathBehaviorEditor::OnBitmapButton6Click1);
	Connect(ID_BITMAPBUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&PathBehaviorEditor::OnBitmapButton2Click);
	previewPnl->Connect(wxEVT_PAINT,(wxObjectEventFunction)&PathBehaviorEditor::OnPanel1Paint,0,this);
	previewPnl->Connect(wxEVT_ERASE_BACKGROUND,(wxObjectEventFunction)&PathBehaviorEditor::OnpreviewPnlEraseBackground,0,this);
	previewPnl->Connect(wxEVT_LEFT_DOWN,(wxObjectEventFunction)&PathBehaviorEditor::OnpreviewPnlLeftDown,0,this);
	previewPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&PathBehaviorEditor::OnpreviewPnlLeftUp,0,this);
	previewPnl->Connect(wxEVT_RIGHT_UP,(wxObjectEventFunction)&PathBehaviorEditor::OnpreviewPnlRightUp,0,this);
	previewPnl->Connect(wxEVT_MOTION,(wxObjectEventFunction)&PathBehaviorEditor::OnpreviewPnlMouseMove,0,this);
	Connect(ID_TOGGLEBUTTON1,wxEVT_COMMAND_TOGGLEBUTTON_CLICKED,(wxObjectEventFunction)&PathBehaviorEditor::OnBitmapButton6Click);
	Connect(ID_SPINCTRL1,wxEVT_COMMAND_SPINCTRL_UPDATED,(wxObjectEventFunction)&PathBehaviorEditor::OnbgImgXSpinChange);
	Connect(ID_SPINCTRL2,wxEVT_COMMAND_SPINCTRL_UPDATED,(wxObjectEventFunction)&PathBehaviorEditor::OnbgImgXSpinChange);
	Connect(ID_CHECKBOX3,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&PathBehaviorEditor::OnCheckBox1Click);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&PathBehaviorEditor::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&PathBehaviorEditor::OncancelBtClick);
	//*)

    coordsBt = new wxMenuItem(&pointMenu, coordsBtID, _("See coordinates"));
    positionBt = new wxMenuItem(&pointMenu, positionBtID, _("Enter manually coordinates"));
    addPointAfterBt = new wxMenuItem(&pointMenu, addPointAfterBtID, _("Add a point after another"));
    removePointBt = new wxMenuItem(&pointMenu, removePointBtID, _("Delete this point"));

    addAfterBt = new wxMenuItem(&advanceAddMenu, addAfterBtID, _("Add a point after another"));
    addBeforeBt = new wxMenuItem(&advanceAddMenu, addBeforeBtID, _("Add a point before another"));

    pointMenu.Append(coordsBt);
    pointMenu.Append(positionBt);
    pointMenu.AppendSeparator();
    pointMenu.Append(addPointAfterBt);
    pointMenu.Append(removePointBt);

    advanceAddMenu.Append(addAfterBt);
    advanceAddMenu.Append(addBeforeBt);

	previewPnlState.offset = sf::Vector2f(0, 0);
	previewPnlState.state = NOTHING;
	previewPnlState.selectedPoint = -1;
	previewPnlState.backgroundBitmap = NULL;

	speedEdit->SetValue(gd::String::From(behavior.GetSpeed()));
	xOffsetEdit->SetValue(gd::String::From(behavior.GetOffsetX()));
	yOffsetEdit->SetValue(gd::String::From(behavior.GetOffsetY()));
	angleOffsetEdit->SetValue(gd::String::From(behavior.GetAngleOffset()));

	reverseCheck->SetValue(behavior.ReverseAtEnd());
	stopCheck->SetValue(behavior.StopAtEnd());
	followAngleCheck->SetValue(behavior.FollowAngle());

    //Setup shared datas
	if ( !scene || scene->behaviorsInitialSharedDatas.find(behavior.GetName()) == scene->behaviorsInitialSharedDatas.end())
	{
	    gd::LogError(_("Unable to access to shared datas."));
	    return;
	}

	sharedDatas = std::dynamic_pointer_cast<ScenePathDatas>(scene->behaviorsInitialSharedDatas[behavior.GetName()]);

    if ( sharedDatas == std::shared_ptr<ScenePathDatas>() )
    {
	    gd::LogError(_("Unable to access to shared datas : Bad data type."));
	    return;
    }

    paths.clear();

    //Load global paths
    for(std::map<gd::String, std::vector<sf::Vector2f> >::iterator it = sharedDatas->globalPaths.begin(); it != sharedDatas->globalPaths.end(); it++)
    {
        PathInfo newPathInfo;
        newPathInfo.name = it->first;
        newPathInfo.path = it->second;
        newPathInfo.isGlobal = true;

        paths[newPathInfo.name] = newPathInfo;
    }

    //Loading paths from the object
    std::vector<gd::String> listOfPathsNames = behavior.GetListOfPathsNames();
    for(unsigned int a = 0; a < listOfPathsNames.size(); a++)
    {
        PathInfo newPathInfo;

        if(paths.count(listOfPathsNames[a]) == 0) //If a global using the same name doesn't exist
        {
            newPathInfo.name = listOfPathsNames[a];
        }
        else
        {
            gd::String futureName;
            do
            {
                futureName = wxGetTextFromUser(_("A global path with the same name already exists.\nTo avoid name conflict, please rename the local path:"), _("Path conflict"), listOfPathsNames[a], this);
            } while (listOfPathsNames[a] == futureName);

            newPathInfo.name = futureName;
        }

        newPathInfo.path = std::vector<sf::Vector2f>(behavior.GetPath(listOfPathsNames[a]));
        newPathInfo.isGlobal = false;

        paths[newPathInfo.name] = newPathInfo;
    }

    //Update Combobox content
    UpdateComboBoxWithPathsName();

    //Verify if the current path exists
    if(paths.count(behavior.GetCurrentPathName()) != 0)
    {
        ChangePathOfPreview(behavior.GetCurrentPathName());
    }
    else
    {
        wxMessageBox(_("Path \"") + behavior.GetCurrentPathName() + _("\" cannot be found.\nThe preview will go back to the \"Object main path\"."), _("Path not found"), wxOK | wxICON_EXCLAMATION, this);
        ChangePathOfPreview("Object main path");
    }
}

PathBehaviorEditor::~PathBehaviorEditor()
{
	//(*Destroy(PathBehaviorEditor)
	//*)
}

void PathBehaviorEditor::OnpathChoiceSelect(wxCommandEvent& event)
{
    ChangePathOfPreview(GetNameWithoutPrefix(pathChoice->GetString(pathChoice->GetSelection())));
}

void PathBehaviorEditor::ChangePathOfPreview(const gd::String &name)
{
    if(paths.count(name) == 0)
    {
        wxMessageBox("Couldn't find " + name + ".", "Error");
        return;
    }

    path = &(paths.at(name).path);
    pathInfo = &(paths.at(name));

    globalCheck->SetValue(paths.at(name).isGlobal);

    previewPnlState.offset = sf::Vector2f(0,0);

    previewPnl->Refresh();
    previewPnl->Update();

    pathChoice->Select(pathChoice->FindString(pathInfo->isGlobal ? "global: " + name : name, true));

    if(pathInfo->name == "Object main path")
    {
        BitmapButton4->Enable(false);
        BitmapButton5->Enable(false);
        globalCheck->Enable(false);
    }
    else
    {
        BitmapButton4->Enable(true);
        BitmapButton5->Enable(true);
        globalCheck->Enable(true);
    }
}

void PathBehaviorEditor::UpdateComboBoxWithPathsName()
{
    gd::String previousSelectedName = pathChoice->GetString(pathChoice->GetSelection());

    pathChoice->Clear();

    for(std::map<gd::String, PathInfo>::iterator it = paths.begin(); it != paths.end(); it++)
    {
        if(!it->second.isGlobal)
        {
            pathChoice->Append(it->second.name);
        }
        else
        {
            pathChoice->Append("global: " + it->second.name);
        }

    }

    if(pathChoice->FindString(previousSelectedName, true) != -1)
        pathChoice->Select(pathChoice->FindString(previousSelectedName, true));
}

void PathBehaviorEditor::OnBitmapButton3Click1(wxCommandEvent& event)
{
    gd::String newPathName = wxGetTextFromUser(_("Name of the new path:"), _("New path"), "newPath");

    if(PathExists(newPathName))
    {
        wxMessageBox(_("This path already exists."), _("Unable to create the path"));
        return;
    }

    PathInfo newPathInfo;
    newPathInfo.name = newPathName;
    newPathInfo.isGlobal = false;

    paths[newPathInfo.name] = newPathInfo;

    UpdateComboBoxWithPathsName();
    ChangePathOfPreview(newPathName);
}

void PathBehaviorEditor::OnBitmapButton4Click(wxCommandEvent& event)
{
    if(pathInfo->name == "Object main path")
    {
        wxMessageBox(_("Object's main path cannot be deleted"), _("Error"));
        return;
    }

    int r = wxMessageBox(_("Are you sure to delete this path\?"), _("Confirm deletion"), wxYES_NO);
    if(r != wxYES)
        return;

    if(paths.count(pathInfo->name) != 0 && paths.size() > 1)
    {
        if(pathInfo->isGlobal)
            haveDeletedAGlobalPath = true;

        paths.erase(pathInfo->name);
    }

    UpdateComboBoxWithPathsName();
    ChangePathOfPreview(paths.begin()->first);
}

void PathBehaviorEditor::OnBitmapButton5Click(wxCommandEvent& event)
{
    gd::String originalName = pathInfo->name;
    if(originalName == "")
    {
        wxMessageBox(_("Object's main path cannot be renamed"), _("Error"));
        return;
    }

    gd::String newName = wxGetTextFromUser(_("New path name:"), _("Rename a path"), originalName);

    if(PathExists(newName) && newName != originalName)
    {
        wxMessageBox(_("This path already exists."), _("Unable to rename the path"));
        return;
    }

    replace_key< std::map<gd::String, PathInfo> >(paths, originalName, newName);
    paths.at(newName).name = newName;

    UpdateComboBoxWithPathsName();
    ChangePathOfPreview(newName);
}


void PathBehaviorEditor::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void PathBehaviorEditor::OnokBtClick(wxCommandEvent& event)
{
    behavior.DeleteAllPaths();
    sharedDatas->globalPaths.clear();

    for(std::map<gd::String, PathInfo>::iterator it = paths.begin(); it != paths.end(); it++)
    {
        if(!it->second.isGlobal)
        {
            behavior.SetPath(it->first, it->second.path);
        }
        else
        {
            sharedDatas->globalPaths[it->second.name] = it->second.path;
        }

    }
    behavior.ChangeCurrentPath(pathInfo->name);

    behavior.SetSpeed(gd::String(speedEdit->GetValue()).To<float>());
    behavior.SetOffsetX(gd::String(xOffsetEdit->GetValue()).To<float>());
    behavior.SetOffsetY(gd::String(yOffsetEdit->GetValue()).To<float>());
    behavior.SetAngleOffset(gd::String(angleOffsetEdit->GetValue()).To<float>());

    behavior.SetReverseAtEnd(reverseCheck->GetValue());
    behavior.SetStopAtEnd(stopCheck->GetValue());
    behavior.SetFollowAngle(followAngleCheck->GetValue());

    if(haveDeletedAGlobalPath)
        mainFrameWrapper.GetInfoBar()->ShowMessage(_("You have deleted a global path. Be sure that no other object was using it."), wxICON_WARNING);

    EndModal(1);
}

void PathBehaviorEditor::OnPanel1Paint(wxPaintEvent& event)
{
    wxBufferedPaintDC dc(previewPnl);
    wxSize panelSize = previewPnl->GetSize();

    //Draw background
    dc.SetBrush(gd::CommonBitmapManager::Get()->transparentBg);
    dc.DrawRectangle(0,0, panelSize.GetWidth(), panelSize.GetHeight());

    //Draw the image
    if(previewPnlState.backgroundBitmap != NULL)
    {
        dc.DrawBitmap(*previewPnlState.backgroundBitmap, 0 - previewPnlState.offset.x + bgImgXSpin->GetValue(),
                                                         0 - previewPnlState.offset.y + bgImgYSpin->GetValue(),
                                                         true);
    }

    //Draw lines between points
    std::vector<wxPoint> points;
    for(unsigned int a = 0; a < path->size(); a++)
    {
        points.push_back(wxPoint(path->at(a).x - previewPnlState.offset.x,
                                 path->at(a).y - previewPnlState.offset.y));
    }
    dc.SetBrush(wxBrush(wxColour(255, 255, 255, 255), wxBRUSHSTYLE_TRANSPARENT));
    dc.SetPen(wxPen(wxColor(50, 57, 122)));
    dc.DrawLines(points.size(), &points[0]);

    wxBitmap point(gd::CommonBitmapManager::Get()->point);

    //Draw points
    for(unsigned int a = 0; a < path->size(); a++)
    {
        dc.DrawBitmap(point,
                    path->at(a).x-point.GetWidth()/2  - previewPnlState.offset.x,
                    path->at(a).y-point.GetHeight()/2  - previewPnlState.offset.y,
                  true);
    }

    //Draw axis
    dc.SetPen(wxPen(wxColor(82, 178, 255)));
    dc.DrawLine(0, -previewPnlState.offset.y, panelSize.GetWidth(), -previewPnlState.offset.y);
    dc.DrawLine(-previewPnlState.offset.x, 0, -previewPnlState.offset.x, panelSize.GetHeight());

    //Draw mouse projections
    if(previewPnlState.state != VIEWMOVING)
    {
        dc.SetPen(wxPen(wxColor(150, 150, 150)));
        dc.DrawLine(0, previewPnlState.mousePosition.y, panelSize.GetWidth(), previewPnlState.mousePosition.y);
        dc.DrawLine(previewPnlState.mousePosition.x, 0, previewPnlState.mousePosition.x, panelSize.GetHeight());
        dc.DrawText(gd::String::From(previewPnlState.mousePosition.x + previewPnlState.offset.x), previewPnlState.mousePosition.x + 2, 2);
        dc.DrawText(gd::String::From(previewPnlState.mousePosition.y + previewPnlState.offset.y), 2, previewPnlState.mousePosition.y + 2);
    }

    //Draw origin
    dc.DrawBitmap(point,
                  (0-point.GetWidth()/2  - previewPnlState.offset.x),
                  (0-point.GetHeight()/2  - previewPnlState.offset.y),
                  true);
}

void PathBehaviorEditor::OnpreviewPnlLeftDown(wxMouseEvent& event)
{
    //Drag and drop of points
    int selectedPoint;
    if((selectedPoint = GetPointOnMouse(event)) != -1)
    {
        if(previewPnlState.state == NOTHING)
        {
            previewPnlState.state = DRAGGING;
            previewPnlState.selectedPoint = selectedPoint;
        }
    }
    else
    {
        if(previewPnlState.state == DRAGGING)
        {
            previewPnlState.state = NOTHING;
        }
        else if(previewPnlState.state == NOTHING)
        {
            previewPnlState.state = VIEWMOVING;
            previewPnlState.originalPoint = sf::Vector2f(event.GetPosition().x, event.GetPosition().y);
        }

        previewPnlState.selectedPoint = -1;
    }

    //Add new points at the end.
    if(previewPnlState.state == ADDING)
    {
        previewPnlState.state = NOTHING;
        previewPnlState.selectedPoint = -1;

        int segmentPos = GetSegmentOnMouse(event);
        if(segmentPos == -1)
            path->push_back(sf::Vector2f(event.GetPosition().x + previewPnlState.offset.x,
                                        event.GetPosition().y + previewPnlState.offset.y));
        else
            path->insert(path->begin() + segmentPos + 1,
                        sf::Vector2f(event.GetPosition().x + previewPnlState.offset.x,
                                        event.GetPosition().y + previewPnlState.offset.y));
    }
    else if(previewPnlState.state == REMOVING)
    {
        if((selectedPoint = GetPointOnMouse(event)) != -1)
        {
            previewPnlState.state = NOTHING;
            path->erase(path->begin() + selectedPoint);
        }
        else
        {
            previewPnlState.state = NOTHING;
        }
    }
    else if(previewPnlState.state == ADDINGPOINTAFTER)
    {
        if((selectedPoint = GetPointOnMouse(event)) != -1)
        {
            previewPnlState.state = NOTHING;

            if(selectedPoint < (path->size() - 1))
            {
                path->insert(path->begin() + selectedPoint + 1, sf::Vector2f((path->at(selectedPoint) + path->at(selectedPoint + 1)) / 2.f));
            }
        }
        else
        {
            previewPnlState.state = NOTHING;
        }
    }
    else if(previewPnlState.state == ADDINGPOINTBEFORE)
    {
        if((selectedPoint = GetPointOnMouse(event)) != -1)
        {
            previewPnlState.state = NOTHING;

            if(selectedPoint > 0)
            {
                path->insert(path->begin() + selectedPoint, sf::Vector2f((path->at(selectedPoint - 1) + path->at(selectedPoint)) / 2.f));
            }
        }
        else
        {
            previewPnlState.state = NOTHING;
        }
    }

    UpdateContextMessage();
}

void PathBehaviorEditor::OnpreviewPnlMouseMove(wxMouseEvent& event)
{
    wxSize panelSize = previewPnl->GetSize();

    if(previewPnlState.state == DRAGGING)
    {
        (*path)[previewPnlState.selectedPoint] = sf::Vector2f(event.GetPosition().x + previewPnlState.offset.x,
                                                            event.GetPosition().y + previewPnlState.offset.y);
    }
    else if(previewPnlState.state == VIEWMOVING)
    {
        previewPnlState.offset += previewPnlState.originalPoint - sf::Vector2f(event.GetPosition().x, event.GetPosition().y);
        previewPnlState.originalPoint = sf::Vector2f(event.GetPosition().x, event.GetPosition().y);
    }

    previewPnlState.mousePosition = sf::Vector2f(event.GetPosition().x, event.GetPosition().y);

    previewPnl->Refresh();
    previewPnl->Update();

    StaticText8->SetLabel(gd::String::From(event.GetPosition().x + previewPnlState.offset.x) + ";" + gd::String::From(event.GetPosition().y + previewPnlState.offset.y));

    UpdateContextMessage();
}

void PathBehaviorEditor::OnpreviewPnlLeftUp(wxMouseEvent& event)
{
    if(previewPnlState.state == DRAGGING)
    {
        (*path)[previewPnlState.selectedPoint] = sf::Vector2f(event.GetPosition().x + previewPnlState.offset.x,
                                                            event.GetPosition().y + previewPnlState.offset.y);
        previewPnlState.state = NOTHING;
        previewPnlState.selectedPoint = -1;
    }
    else if(previewPnlState.state == VIEWMOVING)
    {
        previewPnlState.offset += previewPnlState.originalPoint - sf::Vector2f(event.GetPosition().x, event.GetPosition().y);

        previewPnlState.originalPoint = sf::Vector2f(0,0);
        previewPnlState.state = NOTHING;
    }

    previewPnl->Refresh();
    previewPnl->Update();

    UpdateContextMessage();
}

void PathBehaviorEditor::OnpreviewPnlRightUp(wxMouseEvent& event)
{
    int selectedPoint;
    if((selectedPoint = GetPointOnMouse(event)) != -1)
    {
        if(previewPnlState.state == NOTHING)
        {
            int menuSelection = previewPnl->GetPopupMenuSelectionFromUser(pointMenu, event.GetPosition());

            if(menuSelection == coordsBtID)
            {
                wxMessageBox(_("Point position:") + gd::String::From(path->at(selectedPoint).x) + ";" + gd::String::From(path->at(selectedPoint).y));
            }
            else if(menuSelection == positionBtID)
            {
                int posX = gd::String(wxGetTextFromUser(_("X position:"), _("Position precisely"), gd::String::From(path->at(selectedPoint).x), this)).To<int>();
                int posY = gd::String(wxGetTextFromUser(_("Y position:"), _("Position precisely"), gd::String::From(path->at(selectedPoint).y), this)).To<int>();

                path->at(selectedPoint).x = posX;
                path->at(selectedPoint).y = posY;
            }
            else if(menuSelection == addPointAfterBtID)
            {
                if(selectedPoint < (path->size() - 1))
                {
                    path->insert(path->begin() + selectedPoint + 1, sf::Vector2f((path->at(selectedPoint) + path->at(selectedPoint + 1)) / 2.f));
                }
            }
            else if(menuSelection == removePointBtID)
            {
                path->erase(path->begin() + selectedPoint);
            }
        }

        previewPnl->Refresh();
        previewPnl->Update();
    }
}

void PathBehaviorEditor::OnBitmapButton1Click(wxCommandEvent& event)
{
    previewPnlState.state = ADDING;
    previewPnlState.selectedPoint = -1;

    UpdateContextMessage();
}

void PathBehaviorEditor::OnBitmapButton2Click(wxCommandEvent& event)
{
    previewPnlState.state = REMOVING;
    previewPnlState.selectedPoint = -1;

    UpdateContextMessage();
}

void PathBehaviorEditor::OnBitmapButton6Click1(wxCommandEvent& event)
{
    int menuSelection = BitmapButton6->GetPopupMenuSelectionFromUser(advanceAddMenu, 0, BitmapButton6->GetSize().GetHeight() - 1);

    if(menuSelection == addAfterBtID)
    {
        previewPnlState.state = ADDINGPOINTAFTER;
    }
    else if(menuSelection == addBeforeBtID)
    {
        previewPnlState.state = ADDINGPOINTBEFORE;
    }

    UpdateContextMessage();
}


bool PathBehaviorEditor::PathExists(const gd::String &name)
{
    return (paths.count(name) != 0);
}

int PathBehaviorEditor::GetPointOnMouse(wxMouseEvent& event)
{
    if(path->empty())
        return -1;

    sf::Vector2f posOfMouse = sf::Vector2f(event.GetPosition().x + previewPnlState.offset.x,
                                           event.GetPosition().y + previewPnlState.offset.y);

    for(unsigned int a = 0; a < path->size(); a++)
    {
        int pointPosX = path->at(a).x;
        int pointPosY = path->at(a).y;

        if(((pointPosX - 4) < posOfMouse.x) && ((pointPosX + 4) > posOfMouse.x) &&
           ((pointPosY - 4) < posOfMouse.y) && ((pointPosY + 4) > posOfMouse.y))
        {
            return a;
        }
    }

    return -1;
}

int PathBehaviorEditor::GetSegmentOnMouse(wxMouseEvent& event)
{
    if(path->empty())
        return -1;

    sf::Vector2f posOfMouse = sf::Vector2f(event.GetPosition().x + previewPnlState.offset.x,
                                           event.GetPosition().y + previewPnlState.offset.y);

    for(unsigned int a = 0; a < path->size() - 1; a++)
    {
        int pointPosX1 = path->at(a).x;
        int pointPosY1 = path->at(a).y;

        int pointPosX2 = path->at(a + 1).x;
        int pointPosY2 = path->at(a + 1).y;

        int deltaX = pointPosX2 - pointPosX1;
        int deltaY = pointPosY2 - pointPosY1;

        float ratioX = static_cast<float>(deltaX) / static_cast<float>(posOfMouse.x - pointPosX1);
        float ratioY = static_cast<float>(deltaY) / static_cast<float>(posOfMouse.y - pointPosY1);

        if(((posOfMouse.x > pointPosX1 && posOfMouse.x < pointPosX2) || (posOfMouse.x < pointPosX1 && posOfMouse.x > pointPosX2)) &&
           ((posOfMouse.y > pointPosY1 && posOfMouse.y < pointPosY2) || (posOfMouse.y < pointPosY1 && posOfMouse.y > pointPosY2)) &&
           (ratioY > (ratioX - 0.7)) && (ratioY < (ratioX + 0.7)))
           return a;
        else if (((posOfMouse.y > pointPosY1 && posOfMouse.y < pointPosY2) || (posOfMouse.y < pointPosY1 && posOfMouse.y > pointPosY2)) &&
                 ratioY == std::numeric_limits< float >::infinity())
            return a;
    }

    return -1;
}

void PathBehaviorEditor::UpdateContextMessage()
{
    if(previewPnlState.state == NOTHING)
    {
        contextMessageLabel->SetLabelText(_("Move points using the mouse."));
    }
    else if(previewPnlState.state == DRAGGING)
    {
        contextMessageLabel->SetLabelText(_("Release the button to validate point's position."));
    }
    else if(previewPnlState.state == ADDING)
    {
        contextMessageLabel->SetLabelText(_("Add a point by clicking with the mouse. Clic on a segment to add a point to it."));
    }
    else if(previewPnlState.state == REMOVING)
    {
        contextMessageLabel->SetLabelText(_("Delete a point by clicking on it with the cursor."));
    }
    else if(previewPnlState.state == VIEWMOVING)
    {
        contextMessageLabel->SetLabelText(_("Drag the mouse to make the view scroll."));
    }
    else if(previewPnlState.state == ADDINGPOINTAFTER)
    {
        contextMessageLabel->SetLabelText(_("Click on a point to add a new point after."));
    }
    else if(previewPnlState.state == ADDINGPOINTBEFORE)
    {
        contextMessageLabel->SetLabelText(_("Click on a point to add a new point before."));
    }
}

void PathBehaviorEditor::OnCheckBox1Click(wxCommandEvent& event)
{
    if(followAngleCheck->GetValue())
    {
        angleOffsetEdit->Enable(true);
    }
    else
    {
        angleOffsetEdit->Enable(false);
    }
}

void PathBehaviorEditor::OnglobalCheckClick(wxCommandEvent& event)
{
    if(pathInfo->name == "Object main path")
    {
        wxMessageBox(_("The objet's main path cannot be made global."), _("Error"));
        globalCheck->SetValue(false);
        return;
    }

    if(globalCheck->GetValue())
        pathInfo->isGlobal = true;
    else
        pathInfo->isGlobal = false;

    UpdateComboBoxWithPathsName();
    ChangePathOfPreview(pathInfo->name);
}

gd::String PathBehaviorEditor::GetNameWithoutPrefix(gd::String name)
{
    gd::String result;

    if(name.substr(0, 8) != "global: ")
    {
        return result = name;
    }
    else
    {
        gd::String::iterator namePlusEightIt = name.begin();
        std::advance(namePlusEightIt, 8);
        std::copy(namePlusEightIt, name.end(), std::back_inserter(result));

        return result;
    }
}

void PathBehaviorEditor::OnBitmapButton6Click(wxCommandEvent& event)
{
    if(ToggleButton1->GetValue())
    {
        wxString filename = wxLoadFileSelector(_("Choose an image to be displayed"), "Images (*.png;*.jpg)|*.png;*.jpg");

        if(!filename.empty())
        {
            if(previewPnlState.backgroundBitmap != NULL)
                delete previewPnlState.backgroundBitmap;

            previewPnlState.backgroundBitmap = new wxBitmap(filename, wxBITMAP_TYPE_ANY);

            bgImgXSpin->Enable(true);
            bgImgYSpin->Enable(true);
        }
        else
        {
            ToggleButton1->SetValue(false);
        }
    }
    else
    {
        if(previewPnlState.backgroundBitmap != NULL)
            delete previewPnlState.backgroundBitmap;

        previewPnlState.backgroundBitmap = NULL;

        bgImgXSpin->Enable(false);
        bgImgYSpin->Enable(false);
    }

    previewPnl->Refresh();
    previewPnl->Update();
}

void PathBehaviorEditor::OnbgImgXSpinChange(wxSpinEvent& event)
{
    previewPnl->Refresh();
    previewPnl->Update();
}

void PathBehaviorEditor::OnpreviewPnlEraseBackground(wxEraseEvent& event)
{
}

#endif
