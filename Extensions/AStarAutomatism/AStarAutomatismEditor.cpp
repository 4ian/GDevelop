/**

Game Develop - A Star Automatism Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#if defined(GD_IDE_ONLY)
#include "AStarAutomatismEditor.h"

//(*InternalHeaders(AStarAutomatismEditor)
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDL/Game.h"
#include "AStarAutomatism.h"
#include "GDL/MainEditorCommand.h"
#include "GDL/CommonTools.h"
#include "GDL/Scene.h"

//(*IdInit(AStarAutomatismEditor)
const long AStarAutomatismEditor::ID_STATICTEXT1 = wxNewId();
const long AStarAutomatismEditor::ID_TEXTCTRL1 = wxNewId();
const long AStarAutomatismEditor::ID_STATICTEXT2 = wxNewId();
const long AStarAutomatismEditor::ID_STATICTEXT4 = wxNewId();
const long AStarAutomatismEditor::ID_TEXTCTRL4 = wxNewId();
const long AStarAutomatismEditor::ID_TEXTCTRL5 = wxNewId();
const long AStarAutomatismEditor::ID_TEXTCTRL6 = wxNewId();
const long AStarAutomatismEditor::ID_TEXTCTRL7 = wxNewId();
const long AStarAutomatismEditor::ID_STATICTEXT3 = wxNewId();
const long AStarAutomatismEditor::ID_TEXTCTRL2 = wxNewId();
const long AStarAutomatismEditor::ID_STATICTEXT5 = wxNewId();
const long AStarAutomatismEditor::ID_TEXTCTRL3 = wxNewId();
const long AStarAutomatismEditor::ID_CHECKBOX1 = wxNewId();
const long AStarAutomatismEditor::ID_STATICLINE1 = wxNewId();
const long AStarAutomatismEditor::ID_BUTTON1 = wxNewId();
const long AStarAutomatismEditor::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(AStarAutomatismEditor,wxDialog)
	//(*EventTable(AStarAutomatismEditor)
	//*)
END_EVENT_TABLE()

AStarAutomatismEditor::AStarAutomatismEditor(wxWindow* parent, Game & game_, Scene * scene_, AStarAutomatism & automatism_, MainEditorCommand & mainEditorCommand_ ) :
automatism(automatism_),
game(game_),
scene(scene_),
mainEditorCommand(mainEditorCommand_)
{
	//(*Initialize(AStarAutomatismEditor)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxStaticBoxSizer* StaticBoxSizer3;
	wxGridSizer* GridSizer1;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _T("Paramétrage de l\'automatisme"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _T("Paramétrage"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _T("Coût de passage sur l\'objet :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	costEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer3->Add(costEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _T("Plus le coût sera elevé, plus les chemins éviteront de passer dessus.\nUn coût de 9 empeche le passage sur l\'objet."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	wxFont StaticText2Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText2->SetFont(StaticText2Font);
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, this, _T("Bordures supplémentaires"));
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _T("Des cases virtuelles peuvent être rajoutées autour de l\'objet afin\nde mieux éviter celui ci. Entrez ici le nombre de case à rajouter\nsur le haut/bas/gauche/droite de l\'objet."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer7->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1 = new wxGridSizer(0, 3, 0, 0);
	GridSizer1->Add(-1,-1,1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	topBorderEdit = new wxTextCtrl(this, ID_TEXTCTRL4, _T("Text"), wxDefaultPosition, wxSize(23,23), 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	GridSizer1->Add(topBorderEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1->Add(-1,-1,1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	leftBorderEdit = new wxTextCtrl(this, ID_TEXTCTRL5, _T("Text"), wxDefaultPosition, wxSize(23,23), 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
	GridSizer1->Add(leftBorderEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1->Add(-1,-1,1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	rightBorderEdit = new wxTextCtrl(this, ID_TEXTCTRL6, _T("Text"), wxDefaultPosition, wxSize(23,23), 0, wxDefaultValidator, _T("ID_TEXTCTRL6"));
	GridSizer1->Add(rightBorderEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1->Add(-1,-1,1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	bottomBorderEdit = new wxTextCtrl(this, ID_TEXTCTRL7, _T("Text"), wxDefaultPosition, wxSize(23,23), 0, wxDefaultValidator, _T("ID_TEXTCTRL7"));
	GridSizer1->Add(bottomBorderEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(GridSizer1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer3->Add(FlexGridSizer7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _T("Paramètres globaux de l\'automatisme"));
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 4, 0, 0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _T("Taille de la grille virtuelle des chemins ( pixels ) :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer5->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	gridWidthEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(32,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer5->Add(gridWidthEdit, 1, wxTOP|wxBOTTOM|wxLEFT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT5, _T("x"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer5->Add(StaticText5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	gridHeightEdit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(32,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	FlexGridSizer5->Add(gridHeightEdit, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	diagonalMoveCheck = new wxCheckBox(this, ID_CHECKBOX1, _T("Autoriser les chemins en diagonale"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	diagonalMoveCheck->SetValue(false);
	FlexGridSizer4->Add(diagonalMoveCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	cancelBt = new wxButton(this, ID_BUTTON1, _T("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer6->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	OkBt = new wxButton(this, ID_BUTTON2, _T("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer6->Add(OkBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer6, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&AStarAutomatismEditor::OncancelBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&AStarAutomatismEditor::OnokBtClick);
	//*)

	costEdit->SetValue(ToString(automatism.GetCost()));
	topBorderEdit->SetValue(ToString(automatism.topBorder));
	bottomBorderEdit->SetValue(ToString(automatism.bottomBorder));
	rightBorderEdit->SetValue(ToString(automatism.rightBorder));
	leftBorderEdit->SetValue(ToString(automatism.leftBorder));

    //Setup shared datas
	if ( !scene || scene->automatismsInitialSharedDatas.find(automatism.GetName()) == scene->automatismsInitialSharedDatas.end())
	{
	    wxLogError(_T("Impossible d'accéder aux données partagées."));
	    return;
	}

	sharedDatas = boost::dynamic_pointer_cast<SceneAStarDatas>(scene->automatismsInitialSharedDatas[automatism.GetName()]);

    if ( sharedDatas == boost::shared_ptr<SceneAStarDatas>() )
    {
	    wxLogError(_T("Impossible d'accéder aux données partagées : Données de mauvais type"));
	    return;
    }

    gridWidthEdit->SetValue(ToString(sharedDatas->gridWidth));
    gridHeightEdit->SetValue(ToString(sharedDatas->gridHeight));
    diagonalMoveCheck->SetValue(sharedDatas->diagonalMove);
}

AStarAutomatismEditor::~AStarAutomatismEditor()
{
	//(*Destroy(AStarAutomatismEditor)
	//*)
}


void AStarAutomatismEditor::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void AStarAutomatismEditor::OnokBtClick(wxCommandEvent& event)
{
    automatism.SetCost(ToInt(string(costEdit->GetValue().mb_str())));
    automatism.topBorder = (ToInt(string(topBorderEdit->GetValue().mb_str())));
    automatism.bottomBorder = (ToInt(string(bottomBorderEdit->GetValue().mb_str())));
    automatism.rightBorder = (ToInt(string(rightBorderEdit->GetValue().mb_str())));
    automatism.leftBorder = (ToInt(string(leftBorderEdit->GetValue().mb_str())));

    if ( sharedDatas )
    {
        sharedDatas->gridWidth = ToFloat(string(gridWidthEdit->GetValue().mb_str()));
        sharedDatas->gridHeight = ToFloat(string(gridHeightEdit->GetValue().mb_str()));
        sharedDatas->diagonalMove = diagonalMoveCheck->GetValue();
    }

    EndModal(1);
}
#endif
