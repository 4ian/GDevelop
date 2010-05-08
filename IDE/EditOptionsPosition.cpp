#include "EditOptionsPosition.h"

//(*InternalHeaders(EditOptionsPosition)
#include <wx/settings.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDL/Position.h"
#include "GDL/Object.h"
#include "GDL/Animation.h"
#include "GDL/Chercher.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/StdAlgo.h"
#include "GDL/HelpFileAccess.h"
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
const long EditOptionsPosition::ID_STATICTEXT12 = wxNewId();
const long EditOptionsPosition::ID_STATICTEXT7 = wxNewId();
const long EditOptionsPosition::ID_TEXTCTRL4 = wxNewId();
const long EditOptionsPosition::ID_STATICTEXT8 = wxNewId();
const long EditOptionsPosition::ID_PANEL2 = wxNewId();
const long EditOptionsPosition::ID_STATICLINE2 = wxNewId();
const long EditOptionsPosition::ID_BUTTON1 = wxNewId();
const long EditOptionsPosition::ID_BUTTON2 = wxNewId();
const long EditOptionsPosition::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditOptionsPosition,wxDialog)
	//(*EventTable(EditOptionsPosition)
	//*)
END_EVENT_TABLE()

EditOptionsPosition::EditOptionsPosition(wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position_) :
position(position_),
game(game_),
scene(scene_)
{
	//(*Initialize(EditOptionsPosition)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
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
	wxStaticBoxSizer* StaticBoxSizer5;

	Create(parent, wxID_ANY, _("Editer les options avancées d\'un objet sur la scène"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	SetClientSize(wxSize(397,260));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(2);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	FlexGridSizer2->AddGrowableRow(0);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Objet concerné :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	objectNameTxt = new wxStaticText(Panel1, ID_STATICTEXT2, _("Sans Nom"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
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
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Position"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT3, _("X :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer3->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	XEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(74,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	XEdit->SetToolTip(_("Coordonnée X de l\'objet sur la scène"));
	FlexGridSizer3->Add(XEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT4, _("Y :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer3->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	YEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	YEdit->SetToolTip(_("Coordonnée Y de l\'objet sur la scène."));
	FlexGridSizer3->Add(YEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer13->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Taille"));
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	FlexGridSizer5->AddGrowableRow(1);
	sizeCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Taille personnalisée"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	sizeCheck->SetValue(false);
	FlexGridSizer5->Add(sizeCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer10->AddGrowableCol(1);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT5, _("Largeur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer10->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	widthEdit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	widthEdit->Disable();
	FlexGridSizer10->Add(widthEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT6, _("Hauteur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer10->Add(StaticText5, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	heightEdit = new wxTextCtrl(this, ID_TEXTCTRL5, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
	heightEdit->Disable();
	FlexGridSizer10->Add(heightEdit, 1, wxBOTTOM|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer13->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer5 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Calque"));
	FlexGridSizer12 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer12->AddGrowableCol(0);
	FlexGridSizer14 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer14->AddGrowableCol(1);
	StaticText8 = new wxStaticText(this, ID_STATICTEXT11, _("Calque de l\'objet :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT11"));
	FlexGridSizer14->Add(StaticText8, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	layerChoice = new wxChoice(this, ID_CHOICE1, wxDefaultPosition, wxDefaultSize, 0, 0, 0, wxDefaultValidator, _T("ID_CHOICE1"));
	FlexGridSizer14->Add(layerChoice, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(FlexGridSizer14, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText9 = new wxStaticText(this, ID_STATICTEXT12, _("Mettez un nom de calque vide pour mettre l\'objet\nsur le calque de base."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT12"));
	wxFont StaticText9Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText9->SetFont(StaticText9Font);
	FlexGridSizer12->Add(StaticText9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer5->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer13->Add(StaticBoxSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Plan"));
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer8->AddGrowableCol(1);
	StaticText6 = new wxStaticText(this, ID_STATICTEXT7, _("Plan n° :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer8->Add(StaticText6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	zOrderEdit = new wxTextCtrl(this, ID_TEXTCTRL4, _("0"), wxDefaultPosition, wxSize(72,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	zOrderEdit->SetToolTip(_("Plan initial de l\'objet sur la scène."));
	FlexGridSizer8->Add(zOrderEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText7 = new wxStaticText(this, ID_STATICTEXT8, _("0 par défaut. Plus le plan est grand,\nplus l\'objet sera au dessus des autres."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	wxFont StaticText7Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText7->SetFont(StaticText7Font);
	FlexGridSizer7->Add(StaticText7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer3->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer13->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(FlexGridSizer13, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
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
	BoxSizer2 = new wxBoxSizer(wxHORIZONTAL);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	BoxSizer2->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	BoxSizer2->Add(AnnulerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	AideBt = new wxButton(this, ID_BUTTON3, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	BoxSizer2->Add(AideBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9->Add(BoxSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	Connect(ID_CHECKBOX1,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&EditOptionsPosition::OnsizeCheckClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditOptionsPosition::OnOkBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditOptionsPosition::OnAnnulerBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditOptionsPosition::OnAideBtClick);
	//*)

    //Initializing controls with values
    objectNameTxt->SetLabel( position.objectName );

    XEdit->ChangeValue( toString(position.x) );
    YEdit->ChangeValue( toString(position.y) );
    widthEdit->ChangeValue( toString(position.width) );
    heightEdit->ChangeValue( toString(position.height) );
    if ( position.personalizedSize )
    {
        sizeCheck->SetValue(true);
        widthEdit->Enable(true);
        heightEdit->Enable(true);
    }

    for (unsigned int i = 0;i<scene.initialLayers.size();++i)
    {
        if ( scene.initialLayers[i].GetName() == "" )
            layerChoice->Insert(_("Calque de base"), 0);
        else
            layerChoice->Insert(scene.initialLayers[i].GetName(), 0);
    }

    layerChoice->SetStringSelection(position.layer);
    if ( position.layer == "" )
        layerChoice->SetStringSelection(_("Calque de base"));

    zOrderEdit->ChangeValue( st(position.zOrder) );

    //Create the object-specific panel, if it has one.
    wxPanel * returnedPanel = NULL;

    int objetId = Picker::PickOneObject(&scene.initialObjects, position.objectName);
    int objetGlobalId = Picker::PickOneObject(&game.globalObjects, position.objectName);
    if ( objetId != -1 )
        returnedPanel = scene.initialObjects[objetId]->CreateInitialPositionPanel(this, game, scene, position);
    else if  (objetGlobalId != -1)
        returnedPanel = game.globalObjects[objetGlobalId]->CreateInitialPositionPanel(this, game, scene, position);

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
    {
        string x = (string) XEdit->GetValue();
        std::istringstream iss( x );
        float i;

        if ( ( iss >> i ) && ( iss.eof() ) )
            position.x = i;
    }

    {
        string y = (string) YEdit->GetValue();
        std::istringstream iss( y );
        float i;

        if ( ( iss >> i ) && ( iss.eof() ) )
            position.y = i;
    }

    {
        string width = (string) widthEdit->GetValue();
        std::istringstream iss( width );
        float i;

        if ( ( iss >> i ) && ( iss.eof() ) )
            position.width = i;
    }

    {
        string height = (string) heightEdit->GetValue();
        std::istringstream iss( height );
        float i;

        if ( ( iss >> i ) && ( iss.eof() ) )
            position.height = i;
    }

    if ( sizeCheck->GetValue() )
        position.personalizedSize = true;
    else
        position.personalizedSize = false;

    position.zOrder = toInt(string(zOrderEdit->GetValue().mb_str()));

    position.layer = static_cast<string>(layerChoice->GetStringSelection());
    if ( layerChoice->GetStringSelection() == _("Calque de base"))
        position.layer = "";

    int objetId = Picker::PickOneObject(&scene.initialObjects, position.objectName);
    int objetGlobalId = Picker::PickOneObject(&game.globalObjects, position.objectName);
    if ( objetId != -1 )
        scene.initialObjects[objetId]->UpdateInitialPositionFromPanel(customPanel, position);
    else if  (objetGlobalId != -1)
        game.globalObjects[objetGlobalId]->UpdateInitialPositionFromPanel(customPanel, position);

    EndModal(1);
}

void EditOptionsPosition::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void EditOptionsPosition::OnAideBtClick(wxCommandEvent& event)
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(25);
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
