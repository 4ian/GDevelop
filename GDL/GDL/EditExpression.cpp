#if defined(GDE)

#include "GDL/EditExpression.h"

//(*InternalHeaders(EditExpression)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/image.h>
#include <wx/icon.h>
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/textdlg.h>
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/gdTreeItemStringData.h"

#include "GDL/ChooseObject.h"
#include "GDL/ChooseLayer.h"
#include "GDL/ChooseObjectExpression.h"

#include <string>
#include <vector>

using namespace std;

//(*IdInit(EditExpression)
const long EditExpression::ID_TEXTCTRL1 = wxNewId();
const long EditExpression::ID_BUTTON1 = wxNewId();
const long EditExpression::ID_STATICTEXT5 = wxNewId();
const long EditExpression::ID_STATICTEXT1 = wxNewId();
const long EditExpression::ID_BUTTON2 = wxNewId();
const long EditExpression::ID_BUTTON3 = wxNewId();
const long EditExpression::ID_BUTTON4 = wxNewId();
const long EditExpression::ID_BUTTON5 = wxNewId();
const long EditExpression::ID_STATICTEXT2 = wxNewId();
const long EditExpression::ID_BUTTON6 = wxNewId();
const long EditExpression::ID_BUTTON7 = wxNewId();
const long EditExpression::ID_BUTTON13 = wxNewId();
const long EditExpression::ID_BUTTON14 = wxNewId();
const long EditExpression::ID_BITMAPBUTTON2 = wxNewId();
const long EditExpression::ID_BITMAPBUTTON1 = wxNewId();
const long EditExpression::ID_BUTTON15 = wxNewId();
const long EditExpression::ID_BUTTON12 = wxNewId();
const long EditExpression::ID_BUTTON8 = wxNewId();
const long EditExpression::ID_BUTTON9 = wxNewId();
const long EditExpression::ID_BUTTON16 = wxNewId();
const long EditExpression::ID_BUTTON17 = wxNewId();
const long EditExpression::ID_BUTTON18 = wxNewId();
const long EditExpression::ID_BUTTON19 = wxNewId();
const long EditExpression::ID_BUTTON20 = wxNewId();
const long EditExpression::ID_BUTTON21 = wxNewId();
const long EditExpression::ID_STATICTEXT3 = wxNewId();
const long EditExpression::ID_TREECTRL1 = wxNewId();
const long EditExpression::ID_BUTTON10 = wxNewId();
const long EditExpression::ID_STATICTEXT4 = wxNewId();
const long EditExpression::ID_TREECTRL2 = wxNewId();
const long EditExpression::ID_BUTTON11 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditExpression,wxDialog)
	//(*EventTable(EditExpression)
	//*)
END_EVENT_TABLE()

EditExpression::EditExpression(wxWindow* parent, string pExpression, Game & game_, Scene & scene_, bool canSelectGroup_, const vector < string > & mainObjectsName_) :
game(game_),
scene(scene_),
canSelectGroup(canSelectGroup_),
mainObjectsName(mainObjectsName_)
{
	//(*Initialize(EditExpression)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxGridSizer* GridSizer1;
	wxBoxSizer* BoxSizer1;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxGridSizer* GridSizer2;

	Create(parent, wxID_ANY, _("Editer l\'expression"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	SetClientSize(wxSize(583,314));
	wxIcon FrameIcon;
	FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/expressionicon.png"))));
	SetIcon(FrameIcon);
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	ExpressionEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(428,23), wxTE_MULTILINE|wxTE_RICH, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer2->Add(ExpressionEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(OkBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	errorTxt = new wxStaticText(this, ID_STATICTEXT5, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	errorTxt->SetForegroundColour(wxColour(120,0,0));
	FlexGridSizer2->Add(errorTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Editer l\'expression"));
	FlexGridSizer6 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer6->AddGrowableCol(1);
	FlexGridSizer6->AddGrowableRow(0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Opérations courantes"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	PlusBt = new wxButton(this, ID_BUTTON2, _("+"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON2"));
	BoxSizer1->Add(PlusBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	MinusBt = new wxButton(this, ID_BUTTON3, _("-"), wxDefaultPosition, wxSize(10,23), 0, wxDefaultValidator, _T("ID_BUTTON3"));
	BoxSizer1->Add(MinusBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	MultBt = new wxButton(this, ID_BUTTON4, _("*"), wxDefaultPosition, wxSize(10,23), 0, wxDefaultValidator, _T("ID_BUTTON4"));
	BoxSizer1->Add(MultBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	DivBt = new wxButton(this, ID_BUTTON5, _("/"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON5"));
	BoxSizer1->Add(DivBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(BoxSizer1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Opérations complexes"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer3->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer2 = new wxGridSizer(0, 4, 0, 0);
	POBt = new wxButton(this, ID_BUTTON6, _("("), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON6"));
	GridSizer2->Add(POBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	PFBt = new wxButton(this, ID_BUTTON7, _(")"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON7"));
	GridSizer2->Add(PFBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button2 = new wxButton(this, ID_BUTTON13, _("^"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON13"));
	Button2->SetToolTip(_("x^n éleve x à la puissance n"));
	GridSizer2->Add(Button2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button3 = new wxButton(this, ID_BUTTON14, _("E10"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON14"));
	GridSizer2->Add(Button3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BitmapButton2 = new wxBitmapButton(this, ID_BITMAPBUTTON2, wxBitmap(wxImage(_T("res/sqrt.png"))), wxDefaultPosition, wxSize(25,23), wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON2"));
	BitmapButton2->SetToolTip(_("sqrt(x) calcule la racine carrée de x."));
	GridSizer2->Add(BitmapButton2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BitmapButton1 = new wxBitmapButton(this, ID_BITMAPBUTTON1, wxBitmap(wxImage(_T("res/nth root.png"))), wxDefaultPosition, wxSize(25,23), wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON1"));
	BitmapButton1->SetToolTip(_("Racine n-ième. nthroot(27, 3) donnera 3"));
	GridSizer2->Add(BitmapButton1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button4 = new wxButton(this, ID_BUTTON15, _("exp"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON15"));
	GridSizer2->Add(Button4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button1 = new wxButton(this, ID_BUTTON12, _("log"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON12"));
	GridSizer2->Add(Button1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	CosBt = new wxButton(this, ID_BUTTON8, _("cos"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON8"));
	GridSizer2->Add(CosBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SinBt = new wxButton(this, ID_BUTTON9, _("sin"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON9"));
	GridSizer2->Add(SinBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button5 = new wxButton(this, ID_BUTTON16, _("tan"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON16"));
	GridSizer2->Add(Button5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button6 = new wxButton(this, ID_BUTTON17, _("abs"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON17"));
	Button6->SetToolTip(_("abs(x) renvoie la valeur absolue de x."));
	GridSizer2->Add(Button6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button7 = new wxButton(this, ID_BUTTON18, _("acos"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON18"));
	wxFont Button7Font(7,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button7->SetFont(Button7Font);
	GridSizer2->Add(Button7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button8 = new wxButton(this, ID_BUTTON19, _("asin"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON19"));
	wxFont Button8Font(7,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button8->SetFont(Button8Font);
	GridSizer2->Add(Button8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button9 = new wxButton(this, ID_BUTTON20, _("atan"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON20"));
	wxFont Button9Font(7,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button9->SetFont(Button9Font);
	GridSizer2->Add(Button9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	intBt = new wxButton(this, ID_BUTTON21, _("int"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON21"));
	intBt->SetToolTip(_("int(x) convertit x en un entier."));
	GridSizer2->Add(intBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(GridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	GridSizer1 = new wxGridSizer(0, 2, 0, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(1);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("Propriétés des objets"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer4->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	ObjList = new wxTreeCtrl(this, ID_TREECTRL1, wxDefaultPosition, wxSize(195,177), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer4->Add(ObjList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	AddPropBt = new wxButton(this, ID_BUTTON10, _("Ajouter"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON10"));
	FlexGridSizer4->Add(AddPropBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	FlexGridSizer5->AddGrowableRow(1);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Valeurs spéciales"), wxDefaultPosition, wxSize(95,13), wxALIGN_CENTRE, _T("ID_STATICTEXT4"));
	FlexGridSizer5->Add(StaticText4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	ValList = new wxTreeCtrl(this, ID_TREECTRL2, wxDefaultPosition, wxSize(178,147), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL2"));
	FlexGridSizer5->Add(ValList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	AddValBt = new wxButton(this, ID_BUTTON11, _("Ajouter"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON11"));
	FlexGridSizer5->Add(AddValBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer6->Add(GridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer1, 2, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditExpression::OnExpressionEditText);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnOkBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnPlusBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnMinusBtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnMultBtClick);
	Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnDivBtClick);
	Connect(ID_BUTTON6,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnPOBtClick);
	Connect(ID_BUTTON7,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnPFBtClick);
	Connect(ID_BUTTON13,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton2Click);
	Connect(ID_BUTTON14,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton3Click);
	Connect(ID_BITMAPBUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnBitmapButton2Click);
	Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnBitmapButton1Click);
	Connect(ID_BUTTON15,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton4Click);
	Connect(ID_BUTTON12,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton1Click);
	Connect(ID_BUTTON8,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnCosBtClick);
	Connect(ID_BUTTON9,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnSinBtClick);
	Connect(ID_BUTTON16,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton5Click);
	Connect(ID_BUTTON17,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton6Click);
	Connect(ID_BUTTON18,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton7Click);
	Connect(ID_BUTTON19,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton8Click);
	Connect(ID_BUTTON20,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton9Click);
	Connect(ID_BUTTON21,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnintBtClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditExpression::OnObjListItemDoubleClicked);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditExpression::OnObjListItemActivated);
	Connect(ID_BUTTON10,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnAddPropBtClick);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditExpression::OnValListItemDoubleClicked);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditExpression::OnValListItemActivated);
	Connect(ID_BUTTON11,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnAddValBtClick);
	//*)

	expression = pExpression;

    imageListObj = new wxImageList( 16, 16 );
    imageListObj->Add(( wxBitmap( "res/actions/uneaction.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/position.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/force.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/direction.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/animation.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/var.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/planicon.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/visibilite.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/create.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/timer.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/camera.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/mouse.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/music.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/texte.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/scene.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/fichier.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/net.png", wxBITMAP_TYPE_ANY ) ) );
    imageListObj->Add(( wxBitmap( "res/actions/scale.png", wxBITMAP_TYPE_ANY ) ) );
    ObjList->AssignImageList( imageListObj );

    imageListVal = new wxImageList( 16, 16 );
    imageListVal->Add(( wxBitmap( "res/actions/uneaction.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/position.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/force.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/direction.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/animation.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/var.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/planicon.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/visibilite.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/create.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/timer.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/camera.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/mouse.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/music.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/texte.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/scene.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/fichier.png", wxBITMAP_TYPE_ANY ) ) );
    imageListVal->Add(( wxBitmap( "res/actions/net.png", wxBITMAP_TYPE_ANY ) ) );
    ValList->AssignImageList( imageListVal );

	ExpressionEdit->ChangeValue(expression);
	RefreshLists();
}

EditExpression::~EditExpression()
{
	//(*Destroy(EditExpression)
	//*)
}


void EditExpression::OnOkBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void EditExpression::OnExpressionEditText(wxCommandEvent& event)
{
    expression = static_cast<string>( ExpressionEdit->GetValue() );
    RefreshExpressionEdit();

    GDExpression expressionTest(expression);
    if ( !expressionTest.PrepareForMathEvaluationOnly(game, scene) )
    {
        errorTxt->SetLabel(expressionTest.GetFirstErrorDuringPreprocessingText());
        if ( expressionTest.GetFirstErrorDuringPreprocessingPosition() != string::npos )
        {
            ExpressionEdit->SetStyle(expressionTest.GetFirstErrorDuringPreprocessingPosition(), expressionTest.GetFirstErrorDuringPreprocessingPosition()+1, wxColour(120,0,0) );
        }
    }
    else
    {
        errorTxt->SetLabel("");
    }
}

void EditExpression::RefreshLists()
{
    ObjList->DeleteAllItems();
    ObjList->AddRoot( _( "Toutes les proprietés" ), 0 );

    ValList->DeleteAllItems();
    ValList->AddRoot( _( "Toutes les valeurs spéciales" ), 0 );

    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();
    const vector < boost::shared_ptr<ExtensionBase> > extensions = extensionManager->GetExtensions();

    //Insert extension objects actions
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.extensionsUsed.begin(),
                  game.extensionsUsed.end(),
                  extensions[i]->GetName()) == game.extensionsUsed.end() )
            continue;

	    vector<string> objectsTypes = extensions[i]->GetExtensionObjectsTypes();

        wxTreeItemId extensionItem = ObjList->GetRootItem();

	    for(unsigned int j = 0;j<objectsTypes.size();++j)
	    {
            wxTreeItemId objectTypeItem =   objectsTypes[j] == "" ?
                                            ObjList->AppendItem(extensionItem, _("Tous les objets"), 0) :
                                            ObjList->AppendItem(extensionItem, _("Objet") + wxString(" ") + extensions[i]->GetExtensionObjectName(objectsTypes[j]),0) ;

            //Add each object expression
            std::map<string, ExpressionInfos > allObjExpr = extensions[i]->GetAllExpressionsForObject(objectsTypes[j]);
            for(std::map<string, ExpressionInfos>::const_iterator it = allObjExpr.begin(); it != allObjExpr.end(); ++it)
            {
                if ( it->second.shown )
                {
                    //Search and/or add group item
                    wxTreeItemIdValue cookie;
                    wxTreeItemId groupItem = ObjList->GetFirstChild(objectTypeItem, cookie);
                    while ( groupItem.IsOk() && ObjList->GetItemText(groupItem) != it->second.group )
                    {
                        groupItem = ObjList->GetNextSibling(groupItem);
                    }
                    if ( !groupItem.IsOk() ) groupItem = ObjList->AppendItem(objectTypeItem, it->second.group, 0);

                    //Add expression item
                    int IDimage = 0;
                    if ( it->second.smallicon.IsOk() )
                    {
                        imageListObj->Add(it->second.smallicon);
                        IDimage = imageListObj->GetImageCount()-1;
                    }

                    gdTreeItemStringData * associatedData = new gdTreeItemStringData(it->first, objectsTypes[j]);
                    ObjList->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
                }
            }
	    }

        //Add each expression
        extensionItem = ValList->GetRootItem();

        std::map<string, ExpressionInfos > allExpr = extensions[i]->GetAllExpressions();
        for(std::map<string, ExpressionInfos>::const_iterator it = allExpr.begin(); it != allExpr.end(); ++it)
        {
            if ( it->second.shown )
            {
                //Search and/or add group item
                wxTreeItemIdValue cookie;
                wxTreeItemId groupItem = ValList->GetFirstChild(extensionItem, cookie);
                while ( groupItem.IsOk() && ValList->GetItemText(groupItem) != it->second.group )
                {
                    groupItem = ValList->GetNextSibling(groupItem);
                }
                if ( !groupItem.IsOk() ) groupItem = ValList->AppendItem(extensionItem, it->second.group, 0);

                //Add expression item
                int IDimage = 0;
                if ( it->second.smallicon.IsOk() )
                {
                    imageListVal->Add(it->second.smallicon);
                    IDimage = imageListVal->GetImageCount()-1;
                }

                gdTreeItemStringData * associatedData = new gdTreeItemStringData(it->first);
                ValList->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
            }
        }
	}

    ObjList->Expand(ObjList->GetRootItem());
    ValList->Expand(ValList->GetRootItem());
}

void EditExpression::RefreshExpressionEdit()
{
    size_t found = expression.find("VAL");
    ExpressionEdit->SetStyle(0, expression.length(), wxTextAttr( wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOWTEXT)));

    while (found!=string::npos)
    {
        ExpressionEdit->SetStyle(found, found+3, wxTextAttr( wxColour(0 , 148, 255) ) );
        //On remet en normal après
        ExpressionEdit->SetStyle(found+3, found+4, wxTextAttr( wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOWTEXT) ) );
        found = expression.find("VAL", found+3);
    }

    found = expression.find("OBJ");

    while (found!=string::npos)
    {
        ExpressionEdit->SetStyle(found, found+3, wxTextAttr( wxColour(0 , 148, 255) ) );
        //On remet en normal après
        ExpressionEdit->SetStyle(found+3, found+4, wxTextAttr( wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOWTEXT) ) );
        found = expression.find("OBJ", found+3);
    }

    found = expression.find("(");

    while (found!=string::npos)
    {
        ExpressionEdit->SetStyle(found, found+1, wxTextAttr( wxColour(0 , 148, 255) ) );
        //On remet en normal après
        ExpressionEdit->SetStyle(found+1, found+2, wxTextAttr( wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOWTEXT) ) );
        found = expression.find("(", found+1);
    }

    found = expression.find(")");

    while (found!=string::npos)
    {
        ExpressionEdit->SetStyle(found, found+1, wxTextAttr( wxColour(0 , 148, 255) ) );
        //On remet en normal après
        ExpressionEdit->SetStyle(found+1, found+2, wxTextAttr( wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOWTEXT) ) );
        found = expression.find(")", found+1);
    }

}

void EditExpression::OnPlusBtClick(wxCommandEvent& event)
{
    expression += "+";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnMinusBtClick(wxCommandEvent& event)
{
    expression += "-";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnMultBtClick(wxCommandEvent& event)
{
    expression += "*";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnDivBtClick(wxCommandEvent& event)
{
    expression += "/";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnPOBtClick(wxCommandEvent& event)
{
    expression += "(";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnPFBtClick(wxCommandEvent& event)
{
    expression += ")";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnCosBtClick(wxCommandEvent& event)
{
    expression += "cos";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnSinBtClick(wxCommandEvent& event)
{
    expression += "sin";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

/**
 * Show a dialog for completing a parameter
 */
string EditExpression::ShowParameterDialog(const ParameterInfo & parameterInfo)
{
    if ( parameterInfo.type == "expression" )
    {
        string param = static_cast<string> (wxGetTextFromUser(parameterInfo.description, _("Paramètre"), "0", this));
        return param;
    }
    else if ( parameterInfo.type == "object" )
    {
        ChooseObject Dialog(this, game, scene, true, parameterInfo.objectType);
        if ( Dialog.ShowModal() == 0 ) return "";

        return Dialog.objectChosen;
    }
    else if ( parameterInfo.type == "text" )
    {
        string param = static_cast<string> (wxGetTextFromUser(parameterInfo.description, _("Paramètre"), "\"\"", this));
        return param;
    }
    else if ( parameterInfo.type == "layer" )
    {
        ChooseLayer dialog(this, scene.initialLayers);
        if ( dialog.ShowModal() == 0 ) return "";

        return dialog.layerChosen;
    }
    else if ( parameterInfo.type == "camera" )
    {
        string param = static_cast<string> (wxGetTextFromUser(parameterInfo.description, _("Numéro de la caméra"), "0", this));
        return param;
    }

    return "";
}

void EditExpression::OnAddPropBtClick(wxCommandEvent& event)
{
    if ( !itemObj.IsOk() ) return;

    gdTreeItemStringData * associatedData = dynamic_cast<gdTreeItemStringData*>(ObjList->GetItemData(itemObj));
    if ( associatedData != NULL )
    {
        gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();

        ExpressionInfos infos = extensionsManager->GetObjectExpressionInfos(associatedData->GetSecondString(), associatedData->GetString());

        if ( infos.parameters.empty() ) return; //Not even a parameter for the object ?

        string object = ShowParameterDialog(infos.parameters[0]);

        string parametersStr;
        for (unsigned int i = 1;i<infos.parameters.size();++i)
        {
            if ( i != 1 ) parametersStr += ",";
            parametersStr += ShowParameterDialog(infos.parameters[i]);
        }

        expression += object+"."+associatedData->GetString()+"("+parametersStr+")";

        ExpressionEdit->ChangeValue(expression);
        RefreshExpressionEdit();
        return;
    }
}

void EditExpression::OnAddValBtClick(wxCommandEvent& event)
{
    if ( !itemVal.IsOk() ) return;

    gdTreeItemStringData * associatedData = dynamic_cast<gdTreeItemStringData*>(ValList->GetItemData(itemVal));
    if ( associatedData != NULL )
    {
        gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();

        ExpressionInfos infos = extensionsManager->GetExpressionInfos(associatedData->GetString());

        string parametersStr;
        for (unsigned int i = 0;i<infos.parameters.size();++i)
        {
            if ( i != 0 ) parametersStr += ",";
            parametersStr += ShowParameterDialog(infos.parameters[i]);
        }

        expression += associatedData->GetString()+"("+parametersStr+")";

        ExpressionEdit->ChangeValue(expression);
        RefreshExpressionEdit();
        return;
    }
}

void EditExpression::OnObjListItemActivated(wxTreeEvent& event)
{
    itemObj = event.GetItem();
}

void EditExpression::OnObjListItemDoubleClicked(wxTreeEvent& event)
{
    itemObj = event.GetItem();
    wxCommandEvent uselessEvent;
    OnAddPropBtClick(uselessEvent);
}

void EditExpression::OnValListItemActivated(wxTreeEvent& event)
{
    itemVal = event.GetItem();
}

void EditExpression::OnValListItemDoubleClicked(wxTreeEvent& event)
{
    itemVal = event.GetItem();
    wxCommandEvent uselessEvent;
    OnAddValBtClick(uselessEvent);
}


void EditExpression::OnButton2Click(wxCommandEvent& event)
{
    expression += "^";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnButton3Click(wxCommandEvent& event)
{
    expression += "E";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnBitmapButton2Click(wxCommandEvent& event)
{
    expression += "sqrt(";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnBitmapButton1Click(wxCommandEvent& event)
{
    expression += "nthroot(x,n)";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnButton4Click(wxCommandEvent& event)
{
    expression += "exp(";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnButton1Click(wxCommandEvent& event)
{
    expression += "log(";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnButton5Click(wxCommandEvent& event)
{
    expression += "tan";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnButton6Click(wxCommandEvent& event)
{
    expression += "abs";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnButton7Click(wxCommandEvent& event)
{
    expression += "acos";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnButton8Click(wxCommandEvent& event)
{
    expression += "asin";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnButton9Click(wxCommandEvent& event)
{
    expression += "atan";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}

void EditExpression::OnintBtClick(wxCommandEvent& event)
{
    expression += "int(";
	ExpressionEdit->ChangeValue(expression);
    RefreshExpressionEdit();
}
#endif
