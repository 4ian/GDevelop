/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "EditOptionsPosition.h"

//(*InternalHeaders(EditOptionsPosition)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "GDL/Position.h"
#include "GDL/Object.h"
#include "GDL/ObjectHelpers.h"
#include "GDL/Animation.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/CommonTools.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/Dialogs/ChooseVariableDialog.h"
#include <sstream>
#include <string>

using namespace std;

//(*IdInit(EditOptionsPosition)
const long EditOptionsPosition::ID_STATICTEXT1 = wxNewId();
const long EditOptionsPosition::ID_STATICTEXT2 = wxNewId();
const long EditOptionsPosition::ID_PANEL1 = wxNewId();
const long EditOptionsPosition::ID_STATICLINE1 = wxNewId();
const long EditOptionsPosition::ID_STATICTEXT3 = wxNewId();
const long EditOptionsPosition::ID_TEXTCTRL1 = wxNewId();
const long EditOptionsPosition::ID_STATICTEXT4 = wxNewId();
const long EditOptionsPosition::ID_TEXTCTRL2 = wxNewId();
const long EditOptionsPosition::ID_CHECKBOX1 = wxNewId();
const long EditOptionsPosition::ID_STATICTEXT5 = wxNewId();
const long EditOptionsPosition::ID_TEXTCTRL3 = wxNewId();
const long EditOptionsPosition::ID_STATICTEXT6 = wxNewId();
const long EditOptionsPosition::ID_TEXTCTRL5 = wxNewId();
const long EditOptionsPosition::ID_STATICTEXT11 = wxNewId();
const long EditOptionsPosition::ID_CHOICE1 = wxNewId();
const long EditOptionsPosition::ID_STATICTEXT7 = wxNewId();
const long EditOptionsPosition::ID_TEXTCTRL4 = wxNewId();
const long EditOptionsPosition::ID_STATICTEXT8 = wxNewId();
const long EditOptionsPosition::ID_BUTTON4 = wxNewId();
const long EditOptionsPosition::ID_STATICTEXT9 = wxNewId();
const long EditOptionsPosition::ID_PANEL2 = wxNewId();
const long EditOptionsPosition::ID_STATICLINE2 = wxNewId();
const long EditOptionsPosition::ID_STATICBITMAP2 = wxNewId();
const long EditOptionsPosition::ID_HYPERLINKCTRL1 = wxNewId();
const long EditOptionsPosition::ID_BUTTON1 = wxNewId();
const long EditOptionsPosition::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditOptionsPosition,wxDialog)
	//(*EventTable(EditOptionsPosition)
	//*)
END_EVENT_TABLE()

EditOptionsPosition::EditOptionsPosition(wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position_) :
position(position_),
initialVariables(position.GetVariables()),
game(game_),
scene(scene_)
{
	//(*Initialize(EditOptionsPosition)
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
	wxFlexGridSizer* FlexGridSizer13;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;
	wxFlexGridSizer* FlexGridSizer17;
	wxStaticBoxSizer* StaticBoxSizer5;

	Create(parent, wxID_ANY, _("Edit the properties of the object on the scene"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	SetClientSize(wxSize(397,260));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(2);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	FlexGridSizer2->AddGrowableRow(0);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Concerned object :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	objectNameTxt = new wxStaticText(Panel1, ID_STATICTEXT2, _("Noname"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	wxFont objectNameTxtFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	objectNameTxt->SetFont(objectNameTxtFont);
	FlexGridSizer2->Add(objectNameTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(Panel1);
	FlexGridSizer2->SetSizeHints(Panel1);
	FlexGridSizer1->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	FlexGridSizer6->AddGrowableRow(1);
	FlexGridSizer13 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer13->AddGrowableCol(0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Position"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT3, _("X :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer3->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	XEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	XEdit->SetToolTip(_("X coordinate of the object on the scene"));
	FlexGridSizer3->Add(XEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT4, _("Y :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer3->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	YEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	YEdit->SetToolTip(_("Y coordinate of the object on the scene"));
	FlexGridSizer3->Add(YEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer13->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Size"));
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	FlexGridSizer5->AddGrowableRow(1);
	sizeCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Custom size"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	sizeCheck->SetValue(false);
	FlexGridSizer5->Add(sizeCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer10->AddGrowableCol(1);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT5, _("Width :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer10->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	widthEdit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	widthEdit->Disable();
	FlexGridSizer10->Add(widthEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT6, _("Height :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer10->Add(StaticText5, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	heightEdit = new wxTextCtrl(this, ID_TEXTCTRL5, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
	heightEdit->Disable();
	FlexGridSizer10->Add(heightEdit, 1, wxBOTTOM|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer13->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer5 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Layer"));
	FlexGridSizer12 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer12->AddGrowableCol(0);
	FlexGridSizer14 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer14->AddGrowableCol(1);
	StaticText8 = new wxStaticText(this, ID_STATICTEXT11, _("Object\'s layer :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT11"));
	FlexGridSizer14->Add(StaticText8, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	layerChoice = new wxChoice(this, ID_CHOICE1, wxDefaultPosition, wxDefaultSize, 0, 0, 0, wxDefaultValidator, _T("ID_CHOICE1"));
	FlexGridSizer14->Add(layerChoice, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(FlexGridSizer14, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer5->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer13->Add(StaticBoxSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Z order"));
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer8->AddGrowableCol(1);
	StaticText6 = new wxStaticText(this, ID_STATICTEXT7, _("Z order :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer8->Add(StaticText6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	zOrderEdit = new wxTextCtrl(this, ID_TEXTCTRL4, _("0"), wxDefaultPosition, wxSize(72,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	zOrderEdit->SetToolTip(_("Initial Z order of the object on the scene."));
	FlexGridSizer8->Add(zOrderEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText7 = new wxStaticText(this, ID_STATICTEXT8, _("0 by default. The object will be above otherif its z order is greater."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	wxFont StaticText7Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText7->SetFont(StaticText7Font);
	FlexGridSizer7->Add(StaticText7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer3->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer13->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer11->AddGrowableCol(0);
	FlexGridSizer11->AddGrowableRow(0);
	StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Initial variables specific to this object instance"));
	FlexGridSizer16 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer16->AddGrowableCol(1);
	FlexGridSizer16->AddGrowableRow(0);
	editInitialVariables = new wxButton(this, ID_BUTTON4, _("Modify"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer16->Add(editInitialVariables, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	variablesStatusTxt = new wxStaticText(this, ID_STATICTEXT9, _("No variable defined for this object instance."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer16->Add(variablesStatusTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer4->Add(FlexGridSizer16, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11->Add(StaticBoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer15 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer15->AddGrowableCol(0);
	FlexGridSizer15->AddGrowableRow(0);
	customPanel = new wxPanel(this, ID_PANEL2, wxDefaultPosition, wxSize(0,0), wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	FlexGridSizer15->Add(customPanel, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(FlexGridSizer15, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 0, 0, 0);
	FlexGridSizer9->AddGrowableCol(0);
	FlexGridSizer9->AddGrowableRow(0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/helpicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer17->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	HyperlinkCtrl1->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9->Add(FlexGridSizer17, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer2 = new wxBoxSizer(wxHORIZONTAL);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	BoxSizer2->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	BoxSizer2->Add(AnnulerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9->Add(BoxSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	SetSizer(FlexGridSizer1);
	Layout();
	Center();

	Connect(ID_CHECKBOX1,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&EditOptionsPosition::OnsizeCheckClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditOptionsPosition::OneditInitialVariablesClick);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&EditOptionsPosition::OnAideBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditOptionsPosition::OnOkBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditOptionsPosition::OnAnnulerBtClick);
	//*)

    //Initializing controls with values
    objectNameTxt->SetLabel( position.GetObjectName() );

    XEdit->ChangeValue( ToString(position.GetX()) );
    YEdit->ChangeValue( ToString(position.GetY()) );
    widthEdit->ChangeValue( ToString(position.GetWidth()) );
    heightEdit->ChangeValue( ToString(position.GetHeight()) );
    if ( position.HasCustomSize() )
    {
        sizeCheck->SetValue(true);
        widthEdit->Enable(true);
        heightEdit->Enable(true);
    }

    for (unsigned int i = 0;i<scene.GetLayersCount();++i)
    {
        if ( scene.GetLayer(i).GetName() == "" )
            layerChoice->Insert(_("Base layer"), 0);
        else
            layerChoice->Insert(scene.GetLayer(i).GetName(), 0);
    }

    layerChoice->SetStringSelection(position.GetLayer());
    if ( position.GetLayer() == "" )
        layerChoice->SetStringSelection(_("Base layer"));

    zOrderEdit->ChangeValue(ToString(position.GetZOrder()) );

    UpdateInitialVariablesStatus();

    //Create the object-specific panel, if it has one.
    wxPanel * returnedPanel = NULL;

    std::vector<ObjSPtr>::const_iterator sceneObject = std::find_if(scene.GetInitialObjects().begin(), scene.GetInitialObjects().end(), std::bind2nd(ObjectHasName(), position.GetObjectName()));
    std::vector<ObjSPtr>::const_iterator globalObject = std::find_if(game.GetGlobalObjects().begin(), game.GetGlobalObjects().end(), std::bind2nd(ObjectHasName(), position.GetObjectName()));

    ObjSPtr object = boost::shared_ptr<Object> ();

    if ( sceneObject != scene.GetInitialObjects().end() ) //We check first scene's objects' list.
        returnedPanel = (*sceneObject)->CreateInitialPositionPanel(this, game, scene, position);
    else if ( globalObject != game.GetGlobalObjects().end() ) //Then the global object list
        returnedPanel = (*globalObject)->CreateInitialPositionPanel(this, game, scene, position);

    if ( returnedPanel )
    {
        customPanel = returnedPanel;
        FlexGridSizer15->Add(customPanel, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    }

    int maxWidth =  customPanel->GetSize().GetWidth() > GetSize().GetWidth() ?
                    customPanel->GetSize().GetWidth() :
                    GetSize().GetWidth();
    SetSize(maxWidth, GetSize().GetHeight()+customPanel->GetSize().GetHeight()+10);
}

EditOptionsPosition::~EditOptionsPosition()
{
	//(*Destroy(EditOptionsPosition)
	//*)
}


void EditOptionsPosition::OnOkBtClick(wxCommandEvent& event)
{
    position.SetX(ToFloat(ToString(XEdit->GetValue())));
    position.SetY(ToFloat(ToString(YEdit->GetValue())));
    position.SetWidth(ToFloat(ToString(widthEdit->GetValue())));
    position.SetHeight(ToFloat(ToString(heightEdit->GetValue())));
    position.SetHasCustomSize(sizeCheck->GetValue());
    position.SetZOrder(ToInt(ToString(zOrderEdit->GetValue())));

    position.SetLayer(ToString(layerChoice->GetStringSelection()));
    if ( layerChoice->GetStringSelection() == _("Base layer"))
        position.SetLayer("");

    position.GetVariables().Create(initialVariables);

    std::vector<ObjSPtr>::const_iterator sceneObject = std::find_if(scene.GetInitialObjects().begin(), scene.GetInitialObjects().end(), std::bind2nd(ObjectHasName(), position.GetObjectName()));
    std::vector<ObjSPtr>::const_iterator globalObject = std::find_if(game.GetGlobalObjects().begin(), game.GetGlobalObjects().end(), std::bind2nd(ObjectHasName(), position.GetObjectName()));

    if ( sceneObject != scene.GetInitialObjects().end() ) //We check first scene's objects' list.
        (*sceneObject)->UpdateInitialPositionFromPanel(customPanel, position);
    else if ( globalObject != game.GetGlobalObjects().end() ) //Then the global object list
        (*globalObject)->UpdateInitialPositionFromPanel(customPanel, position);

    EndModal(1);
}

void EditOptionsPosition::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void EditOptionsPosition::OnAideBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/editors/scene_editor/edit_scene_edit"));
}

void EditOptionsPosition::OnsizeCheckClick(wxCommandEvent& event)
{
    if ( sizeCheck )
    {
        widthEdit->Enable(true);
        heightEdit->Enable(true);
    }
    else
    {
        widthEdit->Enable(false);
        heightEdit->Enable(false);
    }
}

void EditOptionsPosition::OneditInitialVariablesClick(wxCommandEvent& event)
{
    gd::ChooseVariableDialog dialog(this, initialVariables, /*editingOnly=*/true);
    if ( dialog.ShowModal() == 1 )
        UpdateInitialVariablesStatus();
}

void EditOptionsPosition::UpdateInitialVariablesStatus()
{
    if ( initialVariables.GetVariablesVector().empty() )
        variablesStatusTxt->SetLabel(_("No variable defined for this object instance."));
    else
        variablesStatusTxt->SetLabel(ToString(initialVariables.GetVariablesVector().size())+_(" variables are defined to this particular object instance."));
}

