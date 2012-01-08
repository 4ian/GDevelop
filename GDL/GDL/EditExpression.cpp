/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

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
#include "GDL/CommonTools.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/TreeItemExpressionInfoData.h"
#include "GDL/ExpressionsCorrectnessTesting.h"

#include "GDL/ChooseObject.h"
#include "GDL/ChooseLayer.h"
#include "GDL/ChooseVariableDialog.h"
#include "GDL/IDE/ChooseAutomatismDlg.h"
#include "GDL/IDE/AdvancedTextEntryDlg.h"
#include "GDL/HelpFileAccess.h"

#include <string>
#include <vector>

using namespace std;

//(*IdInit(EditExpression)
const long EditExpression::ID_CUSTOM1 = wxNewId();
const long EditExpression::ID_BUTTON1 = wxNewId();
const long EditExpression::ID_HYPERLINKCTRL1 = wxNewId();
const long EditExpression::ID_BUTTON34 = wxNewId();
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
const long EditExpression::ID_BUTTON33 = wxNewId();
const long EditExpression::ID_BUTTON29 = wxNewId();
const long EditExpression::ID_BUTTON28 = wxNewId();
const long EditExpression::ID_BUTTON27 = wxNewId();
const long EditExpression::ID_BUTTON26 = wxNewId();
const long EditExpression::ID_BUTTON18 = wxNewId();
const long EditExpression::ID_BUTTON19 = wxNewId();
const long EditExpression::ID_BUTTON20 = wxNewId();
const long EditExpression::ID_BUTTON21 = wxNewId();
const long EditExpression::ID_BUTTON22 = wxNewId();
const long EditExpression::ID_BUTTON23 = wxNewId();
const long EditExpression::ID_BUTTON24 = wxNewId();
const long EditExpression::ID_BUTTON25 = wxNewId();
const long EditExpression::ID_BUTTON30 = wxNewId();
const long EditExpression::ID_BUTTON31 = wxNewId();
const long EditExpression::ID_BUTTON32 = wxNewId();
const long EditExpression::ID_BUTTON17 = wxNewId();
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

EditExpression::EditExpression(wxWindow* parent, string pExpression, Game & game_, Scene & scene_ ) :
game(game_),
scene(scene_),
lastErrorPos(std::string::npos)
{
	//(*Initialize(EditExpression)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxGridSizer* GridSizer1;
	wxFlexGridSizer* FlexGridSizer8;
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
	ExpressionEdit = new wxStyledTextCtrl(this,ID_CUSTOM1,wxDefaultPosition,wxSize(460,40),0,_T("ID_CUSTOM1"));
	FlexGridSizer2->Add(ExpressionEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer8->AddGrowableCol(0);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer8->Add(OkBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	FlexGridSizer7->AddGrowableRow(0);
	errorTxt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Pas d\'erreurs."), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_LEFT|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	errorTxt->SetToolTip(_("Cliquer pour positionner le curseur sur l\'erreur."));
	FlexGridSizer7->Add(errorTxt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	helpBt = new wxButton(this, ID_BUTTON34, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON34"));
	FlexGridSizer2->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
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
	MinusBt = new wxButton(this, ID_BUTTON3, _("-"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON3"));
	BoxSizer1->Add(MinusBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	MultBt = new wxButton(this, ID_BUTTON4, _("*"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON4"));
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
	Button4->SetToolTip(_("Exponentielle"));
	GridSizer2->Add(Button4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button1 = new wxButton(this, ID_BUTTON12, _("log"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON12"));
	Button1->SetToolTip(_("Logarithme népérien"));
	GridSizer2->Add(Button1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	CosBt = new wxButton(this, ID_BUTTON8, _("cos"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON8"));
	CosBt->SetToolTip(_("Cosinus"));
	GridSizer2->Add(CosBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SinBt = new wxButton(this, ID_BUTTON9, _("sin"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON9"));
	SinBt->SetToolTip(_("Sinus"));
	GridSizer2->Add(SinBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button5 = new wxButton(this, ID_BUTTON16, _("tan"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON16"));
	Button5->SetToolTip(_("Tangente"));
	GridSizer2->Add(Button5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button21 = new wxButton(this, ID_BUTTON33, _("log10"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON33"));
	wxFont Button21Font(6,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button21->SetFont(Button21Font);
	Button21->SetToolTip(_("Logarithme en base 10."));
	GridSizer2->Add(Button21, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button17 = new wxButton(this, ID_BUTTON29, _("cosh"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON29"));
	wxFont Button17Font(7,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button17->SetFont(Button17Font);
	Button17->SetToolTip(_("Cosinus hyperbolique"));
	GridSizer2->Add(Button17, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button16 = new wxButton(this, ID_BUTTON28, _("sinh"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON28"));
	wxFont Button16Font(7,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button16->SetFont(Button16Font);
	Button16->SetToolTip(_("Sinus hyperbolique"));
	GridSizer2->Add(Button16, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button15 = new wxButton(this, ID_BUTTON27, _("tanh"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON27"));
	wxFont Button15Font(7,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button15->SetFont(Button15Font);
	Button15->SetToolTip(_("Tangente hyperbolique"));
	GridSizer2->Add(Button15, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button14 = new wxButton(this, ID_BUTTON26, _("floor"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON26"));
	wxFont Button14Font(7,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button14->SetFont(Button14Font);
	Button14->SetToolTip(_("Arrondi à l\'entier le plus petit."));
	GridSizer2->Add(Button14, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
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
	ceilBt = new wxButton(this, ID_BUTTON21, _("ceil"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON21"));
	ceilBt->SetToolTip(_("Arrondi à l\'entier le plus grand."));
	GridSizer2->Add(ceilBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button10 = new wxButton(this, ID_BUTTON22, _("a\ncosh"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON22"));
	wxFont Button10Font(6,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button10->SetFont(Button10Font);
	GridSizer2->Add(Button10, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button11 = new wxButton(this, ID_BUTTON23, _("a\nsinh"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON23"));
	wxFont Button11Font(6,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button11->SetFont(Button11Font);
	GridSizer2->Add(Button11, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button12 = new wxButton(this, ID_BUTTON24, _("a\ntanh"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON24"));
	wxFont Button12Font(6,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button12->SetFont(Button12Font);
	GridSizer2->Add(Button12, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	intBt = new wxButton(this, ID_BUTTON25, _("int"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON25"));
	intBt->SetToolTip(_("int(x) convertit x en un entier."));
	GridSizer2->Add(intBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button18 = new wxButton(this, ID_BUTTON30, _("sec"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON30"));
	wxFont Button18Font(7,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button18->SetFont(Button18Font);
	Button18->SetToolTip(_("Sécante ( 1/cos(x) )"));
	GridSizer2->Add(Button18, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button19 = new wxButton(this, ID_BUTTON31, _("csc"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON31"));
	wxFont Button19Font(7,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button19->SetFont(Button19Font);
	Button19->SetToolTip(_("Cosécante ( 1/sin(x) )"));
	GridSizer2->Add(Button19, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button20 = new wxButton(this, ID_BUTTON32, _("cot"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON32"));
	wxFont Button20Font(7,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button20->SetFont(Button20Font);
	Button20->SetToolTip(_("Cotangente ( 1/tan(x) )"));
	GridSizer2->Add(Button20, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button6 = new wxButton(this, ID_BUTTON17, _("abs"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON17"));
	Button6->SetToolTip(_("abs(x) renvoie la valeur absolue de x."));
	GridSizer2->Add(Button6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
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

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnOkBtClick);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&EditExpression::OnerrorTxtClick);
	Connect(ID_BUTTON34,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnhelpBtClick);
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
	Connect(ID_BUTTON33,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton21Click);
	Connect(ID_BUTTON29,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton17Click);
	Connect(ID_BUTTON28,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton16Click);
	Connect(ID_BUTTON27,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton15Click);
	Connect(ID_BUTTON26,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton14Click);
	Connect(ID_BUTTON18,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton7Click);
	Connect(ID_BUTTON19,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton8Click);
	Connect(ID_BUTTON20,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton9Click);
	Connect(ID_BUTTON21,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnceilBtClick);
	Connect(ID_BUTTON22,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton10Click);
	Connect(ID_BUTTON23,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton11Click);
	Connect(ID_BUTTON24,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton12Click);
	Connect(ID_BUTTON25,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnintBtClick);
	Connect(ID_BUTTON30,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton18Click);
	Connect(ID_BUTTON31,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton19Click);
	Connect(ID_BUTTON32,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton20Click);
	Connect(ID_BUTTON17,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnButton6Click);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditExpression::OnObjListItemDoubleClicked);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditExpression::OnObjListItemActivated);
	Connect(ID_BUTTON10,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnAddPropBtClick);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditExpression::OnValListItemDoubleClicked);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditExpression::OnValListItemActivated);
	Connect(ID_BUTTON11,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpression::OnAddValBtClick);
	//*)
	Connect(ID_CUSTOM1, wxEVT_STC_MODIFIED, (wxObjectEventFunction)&EditExpression::TextModified);
	Connect(ID_CUSTOM1, wxEVT_STC_UPDATEUI, (wxObjectEventFunction)&EditExpression::UpdateTextCtrl);

	expression = pExpression;

    imageListObj = new wxImageList( 16, 16 );
    imageListObj->Add(( wxBitmap( "res/actions/uneaction.png", wxBITMAP_TYPE_ANY ) ) );
    ObjList->AssignImageList( imageListObj );

    imageListVal = new wxImageList( 16, 16 );
    imageListVal->Add(( wxBitmap( "res/actions/uneaction.png", wxBITMAP_TYPE_ANY ) ) );
    ValList->AssignImageList( imageListVal );

	ExpressionEdit->SetText(expression);
	ExpressionEdit->SetLexer(wxSTC_LEX_CPP);
	ExpressionEdit->StyleSetForeground(4, *wxBLACK); //Numbers
	ExpressionEdit->StyleSetForeground(10, *wxRED); //Operators
	ExpressionEdit->StyleSetForeground(6, *wxBLUE); //String
	ExpressionEdit->StyleSetForeground(5, wxColour(0,28,158)); //(Key)Word
	ExpressionEdit->StyleSetBackground(34, wxColour(119, 255, 119)); //Brace
	ExpressionEdit->StyleSetBackground(35, wxColour(255, 119, 119)); //Brace

    //Prepare keyword highlighting
    std::string keywords;
    const vector < boost::shared_ptr<ExtensionBase> > extensions = GDpriv::ExtensionsManager::GetInstance()->GetExtensions();
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.extensionsUsed.begin(),
                  game.extensionsUsed.end(),
                  extensions[i]->GetName()) == game.extensionsUsed.end() )
            continue;

        //Add keywords of static expressions
	    const std::map<std::string, ExpressionInfos > & allExprs = extensions[i]->GetAllExpressions();
        for(std::map<std::string, ExpressionInfos >::const_iterator it = allExprs.begin(); it != allExprs.end(); ++it)
	        keywords += " "+it->first;

	    const std::map<std::string, StrExpressionInfos > & allStrExprs = extensions[i]->GetAllStrExpressions();
        for(std::map<std::string, StrExpressionInfos >::const_iterator it = allStrExprs.begin(); it != allStrExprs.end(); ++it)
	        keywords += " "+it->first;

        //Add keywords of objects expressions
	    vector<string> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
        for (unsigned int j = 0;j<objectsTypes.size();++j)
        {
            const std::map<std::string, ExpressionInfos > & allExprs = extensions[i]->GetAllExpressionsForObject(objectsTypes[j]);
            for(std::map<std::string, ExpressionInfos >::const_iterator it = allExprs.begin(); it != allExprs.end(); ++it)
                keywords += " "+it->first;

            const std::map<std::string, StrExpressionInfos > & allStrExprs = extensions[i]->GetAllStrExpressionsForObject(objectsTypes[j]);
            for(std::map<std::string, StrExpressionInfos >::const_iterator it = allStrExprs.begin(); it != allStrExprs.end(); ++it)
                keywords += " "+it->first;
        }

        //Add keywords of automatisms expressions
	    vector<string> automatismsTypes = extensions[i]->GetAutomatismsTypes();
        for (unsigned int j = 0;j<automatismsTypes.size();++j)
        {
            const std::map<std::string, ExpressionInfos > & allExprs = extensions[i]->GetAllExpressionsForAutomatism(automatismsTypes[j]);
            for(std::map<std::string, ExpressionInfos >::const_iterator it = allExprs.begin(); it != allExprs.end(); ++it)
                keywords += " "+it->first;

            const std::map<std::string, StrExpressionInfos > & allStrExprs = extensions[i]->GetAllStrExpressionsForAutomatism(automatismsTypes[j]);
            for(std::map<std::string, StrExpressionInfos >::const_iterator it = allStrExprs.begin(); it != allStrExprs.end(); ++it)
                keywords += " "+it->first;
        }
	}
	ExpressionEdit->SetKeyWords(0, keywords);
    ExpressionEdit->SetWrapMode(wxSTC_WRAP_WORD);
    ExpressionEdit->SetMarginLeft(1);

	RefreshLists();
}

EditExpression::~EditExpression()
{
	//(*Destroy(EditExpression)
	//*)
}

/**
 * Syntax highlighting
 */
void EditExpression::UpdateTextCtrl(wxStyledTextEvent& event)
{
    char currentChar = ExpressionEdit->GetCharAt(ExpressionEdit->GetCurrentPos());
    if ( currentChar != '(' && currentChar != ')')
    {
        ExpressionEdit->BraceHighlight(wxSTC_INVALID_POSITION, wxSTC_INVALID_POSITION);
        return;
    }

    int otherBrace = ExpressionEdit->BraceMatch(ExpressionEdit->GetCurrentPos());

    if ( otherBrace != wxSTC_INVALID_POSITION)
        ExpressionEdit->BraceHighlight(ExpressionEdit->GetCurrentPos(), otherBrace);
    else
        ExpressionEdit->BraceBadLight(ExpressionEdit->GetCurrentPos());
}

/**
 * Realtime expression checking
 */
void EditExpression::TextModified(wxStyledTextEvent& event)
{
    //Syntax checking
    expression = string( ExpressionEdit->GetText().mb_str() );

    CallbacksForExpressionCorrectnessTesting callbacks(game, scene);

    GDExpressionParser expressionParser(expression);
    if ( !expressionParser.ParseMathExpression(game, scene, callbacks) )
    {
        errorTxt->SetLabel(expressionParser.firstErrorStr);
        lastErrorPos = expressionParser.firstErrorPos;
    }
    else
    {
        errorTxt->SetLabel(_("Pas d'erreurs."));
        lastErrorPos = std::string::npos;
    }

    errorTxt->Refresh(); //Need to call manually update.
}

void EditExpression::OnOkBtClick(wxCommandEvent& event)
{
    CallbacksForExpressionCorrectnessTesting callbacks(game, scene);
    GDExpressionParser expressionParser(expression);

    if ( !expressionParser.ParseMathExpression(game, scene, callbacks) )
    {
        if ( wxMessageBox(_("L'expression est mal formulée. Êtes vous sûr de vouloir valider cette expression ?"), _("L'expression contient une ou plusieurs erreurs."), wxYES_NO | wxICON_EXCLAMATION, this) == wxNO )
            return;
    }

    EndModal(1);
}

void EditExpression::RefreshLists()
{
    ObjList->DeleteAllItems();
    ObjList->AddRoot( _( "Toutes les proprietés" ), 0 );

    ValList->DeleteAllItems();
    ValList->AddRoot( _( "Toutes les valeurs spéciales" ), 0 );

    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();
    const vector < boost::shared_ptr<ExtensionBase> > extensions = extensionManager->GetExtensions();

    //Insert extension objects expressions
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.extensionsUsed.begin(),
                  game.extensionsUsed.end(),
                  extensions[i]->GetName()) == game.extensionsUsed.end() )
            continue;

	    vector<string> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
	    vector<string> automatismsTypes = extensions[i]->GetAutomatismsTypes();

        wxTreeItemId extensionItem = ObjList->GetRootItem();

	    for(unsigned int j = 0;j<objectsTypes.size();++j)
	    {
            wxTreeItemId objectTypeItem =   objectsTypes[j] == "" ?
                                            ObjList->AppendItem(extensionItem, _("Tous les objets"), 0) :
                                            ObjList->AppendItem(extensionItem, _("Objet") + wxString(" ") + extensions[i]->GetObjectInfo(objectsTypes[j]).fullname,0) ;

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

                    TreeItemExpressionInfoData * associatedData = new TreeItemExpressionInfoData(it->first, it->second);
                    ObjList->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
                }
            }
	    }

	    for(unsigned int j = 0;j<automatismsTypes.size();++j)
	    {
            wxTreeItemId automatismTypeItem =   automatismsTypes[j] == "" ?
                                            ObjList->AppendItem(extensionItem, _("Tous les objets"), 0) :
                                            ObjList->AppendItem(extensionItem, _("Automatisme") + wxString(" ") + extensions[i]->GetAutomatismInfo(automatismsTypes[j]).fullname,0) ;

            //Add each automatism expression
            std::map<string, ExpressionInfos > allAutoExpr = extensions[i]->GetAllExpressionsForAutomatism(automatismsTypes[j]);
            for(std::map<string, ExpressionInfos>::const_iterator it = allAutoExpr.begin(); it != allAutoExpr.end(); ++it)
            {
                if ( it->second.shown )
                {
                    //Search and/or add group item
                    wxTreeItemIdValue cookie;
                    wxTreeItemId groupItem = ObjList->GetFirstChild(automatismTypeItem, cookie);
                    while ( groupItem.IsOk() && ObjList->GetItemText(groupItem) != it->second.group )
                    {
                        groupItem = ObjList->GetNextSibling(groupItem);
                    }
                    if ( !groupItem.IsOk() ) groupItem = ObjList->AppendItem(automatismTypeItem, it->second.group, 0);

                    //Add expression item
                    int IDimage = 0;
                    if ( it->second.smallicon.IsOk() )
                    {
                        imageListObj->Add(it->second.smallicon);
                        IDimage = imageListObj->GetImageCount()-1;
                    }

                    TreeItemExpressionInfoData * associatedData = new TreeItemExpressionInfoData(it->first, it->second);
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

                TreeItemExpressionInfoData * associatedData = new TreeItemExpressionInfoData(it->first, it->second);
                ValList->AppendItem(groupItem, it->second.fullname, IDimage, -1, associatedData);
            }
        }
	}

    ObjList->Expand(ObjList->GetRootItem());
    ValList->Expand(ValList->GetRootItem());
}

void EditExpression::OnPlusBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("+");
}

void EditExpression::OnMinusBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("-");
}

void EditExpression::OnMultBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("*");
}

void EditExpression::OnDivBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("/");
}

void EditExpression::OnPOBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("(");
}

void EditExpression::OnPFBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText(")");
}

void EditExpression::OnCosBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("cos(");
}

void EditExpression::OnSinBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("sin(");
}

/**
 * Show a dialog for completing a parameter
 */
string EditExpression::ShowParameterDialog(const ParameterInfo & parameterInfo, bool & userCancelled)
{
    if ( parameterInfo.type == "expression" )
    {
        AdvancedTextEntryDlg dialog(this, string(_("Paramètre").mb_str()), parameterInfo.description, "0", AdvancedTextEntryDlg::MathExpression, &game, &scene);
        if ( dialog.ShowModal() == wxOK )
            return dialog.text;
        else
            userCancelled = true;
    }
    else if ( parameterInfo.type == "string" )
    {
        AdvancedTextEntryDlg dialog(this, string(_("Paramètre").mb_str()), parameterInfo.description, "\"\"", AdvancedTextEntryDlg::TextExpression, &game, &scene);
        if ( dialog.ShowModal() == wxOK )
            return dialog.text;
        else
            userCancelled = true;
    }
    else if ( parameterInfo.type == "object" )
    {
        ChooseObject Dialog(this, game, scene, true, parameterInfo.supplementaryInformation);
        if ( Dialog.ShowModal() == 0 ) return "";

        return Dialog.objectChosen;
    }
    else if ( parameterInfo.type == "layer" )
    {
        ChooseLayer dialog(this, scene.initialLayers);
        if ( dialog.ShowModal() == 0 ) return "";

        return dialog.layerChosen;
    }
    else if ( parameterInfo.type == "scenevar" )
    {
        ChooseVariableDialog dialog(this, scene.variables);
        if ( dialog.ShowModal() == 0 ) return "";

        return dialog.selectedVariable;
    }
    else if ( parameterInfo.type == "globalvar" )
    {
        ChooseVariableDialog dialog(this, game.variables);
        if ( dialog.ShowModal() == 0 ) return "";

        return dialog.selectedVariable;
    }
    else if ( parameterInfo.type == "camera" )
    {
        string param = static_cast<string> (wxGetTextFromUser(parameterInfo.description, _("Numéro de la caméra"), "0", this));
        return param;
    }
    else
    {
        string param = static_cast<string> (wxGetTextFromUser(parameterInfo.description, _("Paramètre"), "", this));
        return param;
    }

    return "";
}

void EditExpression::OnAddPropBtClick(wxCommandEvent& event)
{
    if ( !itemObj.IsOk() ) return;

    TreeItemExpressionInfoData * infos = dynamic_cast<TreeItemExpressionInfoData *>(ObjList->GetItemData(itemObj));
    if ( infos != NULL )
    {
        if ( infos->GetExpressionInfos().parameters.empty() ) return; //Not even a parameter for the object ?

        bool cancelled = false;
        string object = ShowParameterDialog(infos->GetExpressionInfos().parameters[0], cancelled);
        if ( cancelled ) return;

        //Add parameters
        string parametersStr, automatismStr;
        for (unsigned int i = 1;i<infos->GetExpressionInfos().parameters.size();++i)
        {
            if ( infos->GetExpressionInfos().parameters[i].codeOnly ) continue;

            if ( i == 1 && infos->GetExpressionInfos().parameters[i].type == "automatism" )
            {
                ChooseAutomatismDlg dialog(this, game, scene, object, infos->GetExpressionInfos().parameters[i].supplementaryInformation);
                if ( dialog.ShowModal() == 1 )
                    automatismStr = dialog.automatismChosen+"::";
            }
            else
            {
                if ( !parametersStr.empty() ) parametersStr += ",";
                parametersStr += ShowParameterDialog(infos->GetExpressionInfos().parameters[i], cancelled);
                if ( cancelled ) return;
            }
        }

        if ( ExpressionEdit->GetText() == "0" ) ExpressionEdit->SetText("");
        ExpressionEdit->AddText(ReplaceSpacesByTildes(object)+"."+automatismStr+infos->GetName()+"("+parametersStr+")");
        return;
    }
}

void EditExpression::OnAddValBtClick(wxCommandEvent& event)
{
    if ( !itemVal.IsOk() ) return;

    TreeItemExpressionInfoData * infos = dynamic_cast<TreeItemExpressionInfoData *>(ValList->GetItemData(itemVal));
    if ( infos != NULL )
    {
        string parametersStr;
        for (unsigned int i = 0;i<infos->GetExpressionInfos().parameters.size();++i)
        {
            if ( infos->GetExpressionInfos().parameters[i].codeOnly ) continue;

            if ( !parametersStr.empty() ) parametersStr += ",";
            bool userCancelled = false;
            parametersStr += ShowParameterDialog(infos->GetExpressionInfos().parameters[i], userCancelled);
            if ( userCancelled ) return;
        }

        if ( ExpressionEdit->GetText() == "0" ) ExpressionEdit->SetText("");
        ExpressionEdit->AddText(infos->GetName()+"("+parametersStr+")");
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
	ExpressionEdit->AddText("^");
}

void EditExpression::OnButton3Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("E");
}

void EditExpression::OnBitmapButton2Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("sqrt(");
}

void EditExpression::OnBitmapButton1Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("nthroot(x,n)");
}

void EditExpression::OnButton4Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("exp(");
}

void EditExpression::OnButton1Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("log(");
}

void EditExpression::OnButton5Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("tan(");
}

void EditExpression::OnButton6Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("abs(");
}

void EditExpression::OnButton7Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("acos(");
}

void EditExpression::OnButton8Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("asin(");
}

void EditExpression::OnButton9Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("atan(");
}

void EditExpression::OnintBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("int(");
}

void EditExpression::OnerrorTxtClick(wxCommandEvent& event)
{
    if ( lastErrorPos != std::string::npos )
        ExpressionEdit->GotoPos(lastErrorPos);
}

void EditExpression::OnButton21Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("log10(");
}

void EditExpression::OnButton14Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("floor(");
}

void EditExpression::OnceilBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("ceil(");
}

void EditExpression::OnButton10Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("acosh(");
}

void EditExpression::OnButton11Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("asinh(");
}

void EditExpression::OnButton12Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("atanh(");
}

void EditExpression::OnButton18Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("sec(");
}

void EditExpression::OnButton19Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("csc(");
}

void EditExpression::OnButton20Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("cot(");
}

void EditExpression::OnButton15Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("tanh(");
}

void EditExpression::OnButton16Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("sinh(");
}

void EditExpression::OnButton17Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("cosh(");
}

void EditExpression::OnhelpBtClick(wxCommandEvent& event)
{
    HelpFileAccess::GetInstance()->DisplaySection(145);
}

#endif
