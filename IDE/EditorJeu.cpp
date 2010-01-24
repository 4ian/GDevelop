#include "EditorJeu.h"

//(*InternalHeaders(EditorJeu)
#include <wx/intl.h>
#include <wx/string.h>
//*)

//(*IdInit(EditorJeu)
const long EditorJeu::ID_STATICTEXT1 = wxNewId();
const long EditorJeu::ID_STATICTEXT16 = wxNewId();
const long EditorJeu::ID_STATICTEXT2 = wxNewId();
const long EditorJeu::ID_STATICTEXT17 = wxNewId();
const long EditorJeu::ID_STATICTEXT6 = wxNewId();
const long EditorJeu::ID_BUTTON1 = wxNewId();
const long EditorJeu::ID_TREECTRL1 = wxNewId();
const long EditorJeu::ID_STATICTEXT3 = wxNewId();
const long EditorJeu::ID_STATICTEXT4 = wxNewId();
const long EditorJeu::ID_STATICLINE1 = wxNewId();
const long EditorJeu::ID_BUTTON2 = wxNewId();
const long EditorJeu::ID_BUTTON10 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditorJeu,wxPanel)
	//(*EventTable(EditorJeu)
	//*)
END_EVENT_TABLE()

EditorJeu::EditorJeu(wxWindow* parent)
{
	//(*Initialize(EditorJeu)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxBoxSizer* BoxSizer6;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer19;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;
	wxBoxSizer* BoxSizer3;
	
	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	BoxSizer3 = new wxBoxSizer(wxHORIZONTAL);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Paramètres principaux du jeu"));
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(0);
	BoxSizer6 = new wxBoxSizer(wxHORIZONTAL);
	FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticText = new wxStaticText(this, ID_STATICTEXT1, _("Nom :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(StaticText, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	NomJeuTxt = new wxStaticText(this, ID_STATICTEXT16, _("Sans Nom"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT16"));
	FlexGridSizer3->Add(NomJeuTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText9 = new wxStaticText(this, ID_STATICTEXT2, _("Auteur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer3->Add(StaticText9, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AuteurTxt = new wxStaticText(this, ID_STATICTEXT17, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT17"));
	FlexGridSizer3->Add(AuteurTxt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer6->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer19 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer19->AddGrowableCol(1);
	FlexGridSizer19->AddGrowableRow(0);
	TailleJeuTxt = new wxStaticText(this, ID_STATICTEXT6, _("Taille fenêtre du jeu :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer19->Add(TailleJeuTxt, 1, wxALL|wxALIGN_TOP|wxALIGN_CENTER_HORIZONTAL, 5);
	BoxSizer6->Add(FlexGridSizer19, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4->Add(BoxSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer11->AddGrowableCol(0);
	FlexGridSizer11->AddGrowableRow(0);
	ModParaBt = new wxButton(this, ID_BUTTON1, _("Modifier les paramètres du jeu"), wxDefaultPosition, wxSize(220,23), 0, wxDefaultValidator, _T("ID_BUTTON1"));
	ModParaBt->SetToolTip(_("Modifier les principaux paramètres du jeu :\nTaille de la fenêtre, nom du jeu et de l\'auteur, écran de chargement..."));
	FlexGridSizer11->Add(ModParaBt, 1, wxALL|wxFIXED_MINSIZE|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer3->Add(StaticBoxSizer1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(BoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Scènes du jeu"));
	SceneTree = new wxTreeCtrl(this, ID_TREECTRL1, wxDefaultPosition, wxDefaultSize, wxTR_EDIT_LABELS|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	SceneTree->SetToolTip(_("Liste des scènes qui composent le jeu.\nPour commencer, créez une scène."));
	StaticBoxSizer2->Add(SceneTree, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT3, _("Le jeu commençera par la première \nscène de la liste."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT3"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_TOP|wxALIGN_CENTER_HORIZONTAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT4, _("Le jeu ne contient aucune scène,\nil vous faut en ajouter une. Faites un\nclic droit sur \"Toutes les scènes\" et\nchoisissez \"Ajouter une scène\""), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT4"));
	StaticText2->SetForegroundColour(wxColour(128,0,0));
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer2->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	EditSceneBt = new wxButton(this, ID_BUTTON2, _("Editer la scène choisie"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	EditSceneBt->SetToolTip(_("Permet d\'éditer la scène surlignée : Objets, Evenements..."));
	FlexGridSizer2->Add(EditSceneBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	EditPropSceneBt = new wxButton(this, ID_BUTTON10, _("Editer les propriétés de la scène choisie"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON10"));
	EditPropSceneBt->SetToolTip(_("Cliquez pour modifier les principaux paramètres de la scène : Couleur d\'arrière plan, titre..."));
	FlexGridSizer2->Add(EditPropSceneBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2->Add(FlexGridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditorJeu::OnModParaBtClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_LABEL_EDIT,(wxObjectEventFunction)&EditorJeu::OnSceneTreeBeginLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_END_LABEL_EDIT,(wxObjectEventFunction)&EditorJeu::OnSceneTreeEndLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditorJeu::OnSelectedItemChanged);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&EditorJeu::OnSelectedItemChanged);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditorJeu::OnSelectedItemChanged);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditorJeu::OnEditSceneBtClick);
	Connect(ID_BUTTON10,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditorJeu::OnEditPropSceneBtClick);
	//*)
}

EditorJeu::~EditorJeu()
{
	//(*Destroy(EditorJeu)
	//*)
}


void EditorJeu::OnModParaBtClick(wxCommandEvent& event)
{
}

void EditorJeu::OnSceneTreeBeginLabelEdit(wxTreeEvent& event)
{
}

void EditorJeu::OnSceneTreeEndLabelEdit(wxTreeEvent& event)
{
}

void EditorJeu::OnSceneTreeItemActivated(wxTreeEvent& event)
{
}

void EditorJeu::OnSelectedItemChanged(wxTreeEvent& event)
{
}

void EditorJeu::OnEditSceneBtClick(wxCommandEvent& event)
{
}

void EditorJeu::OnEditPropSceneBtClick(wxCommandEvent& event)
{
}
