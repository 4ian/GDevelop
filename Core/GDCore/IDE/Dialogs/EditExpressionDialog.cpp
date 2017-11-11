/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <algorithm>
#include "GDCore/String.h"
#include <vector>
//(*InternalHeaders(EditExpressionDialog)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/settings.h>
#include <wx/msgdlg.h>
#include <wx/image.h>
#include <wx/icon.h>
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/textdlg.h>
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "GDCore/IDE/Events/ExpressionsCorrectnessTesting.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDCore/IDE/Dialogs/ChooseLayerDialog.h"
#include "GDCore/IDE/Dialogs/ChooseVariableDialog.h"
#include "GDCore/IDE/Dialogs/ChooseBehaviorDialog.h"
#include "GDCore/IDE/Dialogs/AdvancedEntryDialog.h"
#include "GDCore/IDE/wxTools/TreeItemExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/CommonTools.h"
#include "EditExpressionDialog.h"

using namespace std;

namespace gd
{

//(*IdInit(EditExpressionDialog)
const long EditExpressionDialog::ID_CUSTOM1 = wxNewId();
const long EditExpressionDialog::ID_BUTTON1 = wxNewId();
const long EditExpressionDialog::ID_HYPERLINKCTRL1 = wxNewId();
const long EditExpressionDialog::ID_STATICBITMAP5 = wxNewId();
const long EditExpressionDialog::ID_HYPERLINKCTRL2 = wxNewId();
const long EditExpressionDialog::ID_PANEL1 = wxNewId();
const long EditExpressionDialog::ID_STATICTEXT1 = wxNewId();
const long EditExpressionDialog::ID_BUTTON2 = wxNewId();
const long EditExpressionDialog::ID_BUTTON3 = wxNewId();
const long EditExpressionDialog::ID_BUTTON4 = wxNewId();
const long EditExpressionDialog::ID_BUTTON5 = wxNewId();
const long EditExpressionDialog::ID_STATICTEXT2 = wxNewId();
const long EditExpressionDialog::ID_BUTTON6 = wxNewId();
const long EditExpressionDialog::ID_BUTTON7 = wxNewId();
const long EditExpressionDialog::ID_BUTTON13 = wxNewId();
const long EditExpressionDialog::ID_BUTTON14 = wxNewId();
const long EditExpressionDialog::ID_BITMAPBUTTON2 = wxNewId();
const long EditExpressionDialog::ID_BITMAPBUTTON1 = wxNewId();
const long EditExpressionDialog::ID_BUTTON15 = wxNewId();
const long EditExpressionDialog::ID_BUTTON12 = wxNewId();
const long EditExpressionDialog::ID_BUTTON8 = wxNewId();
const long EditExpressionDialog::ID_BUTTON9 = wxNewId();
const long EditExpressionDialog::ID_BUTTON16 = wxNewId();
const long EditExpressionDialog::ID_BUTTON33 = wxNewId();
const long EditExpressionDialog::ID_BUTTON29 = wxNewId();
const long EditExpressionDialog::ID_BUTTON28 = wxNewId();
const long EditExpressionDialog::ID_BUTTON27 = wxNewId();
const long EditExpressionDialog::ID_BUTTON26 = wxNewId();
const long EditExpressionDialog::ID_BUTTON18 = wxNewId();
const long EditExpressionDialog::ID_BUTTON19 = wxNewId();
const long EditExpressionDialog::ID_BUTTON20 = wxNewId();
const long EditExpressionDialog::ID_BUTTON21 = wxNewId();
const long EditExpressionDialog::ID_BUTTON22 = wxNewId();
const long EditExpressionDialog::ID_BUTTON23 = wxNewId();
const long EditExpressionDialog::ID_BUTTON24 = wxNewId();
const long EditExpressionDialog::ID_BUTTON25 = wxNewId();
const long EditExpressionDialog::ID_BUTTON30 = wxNewId();
const long EditExpressionDialog::ID_BUTTON31 = wxNewId();
const long EditExpressionDialog::ID_BUTTON32 = wxNewId();
const long EditExpressionDialog::ID_BUTTON17 = wxNewId();
const long EditExpressionDialog::ID_PANEL2 = wxNewId();
const long EditExpressionDialog::ID_TREECTRL1 = wxNewId();
const long EditExpressionDialog::ID_BUTTON10 = wxNewId();
const long EditExpressionDialog::ID_PANEL3 = wxNewId();
const long EditExpressionDialog::ID_TREECTRL2 = wxNewId();
const long EditExpressionDialog::ID_BUTTON11 = wxNewId();
const long EditExpressionDialog::ID_PANEL4 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditExpressionDialog,wxDialog)
	//(*EventTable(EditExpressionDialog)
	//*)
END_EVENT_TABLE()

EditExpressionDialog::EditExpressionDialog(wxWindow* parent, const gd::String & expression_, gd::Project & project_, gd::Layout & layout_ ) :
expression(expression_),
project(project_),
layout(layout_),
lastErrorPos(gd::String::npos)
{
	//(*Initialize(EditExpressionDialog)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxBoxSizer* BoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;
	wxGridSizer* GridSizer2;

	Create(parent, wxID_ANY, _("Edit the expression"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	wxIcon FrameIcon;
	FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/expressionicon.png"))));
	SetIcon(FrameIcon);
	mgr = new wxAuiManager(this, wxAUI_MGR_DEFAULT);
	centerPanel = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	ExpressionEdit = new wxStyledTextCtrl(centerPanel,ID_CUSTOM1,wxDefaultPosition,wxSize(200,28),0,_T("ID_CUSTOM1"));
	FlexGridSizer2->Add(ExpressionEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	OkBt = new wxButton(centerPanel, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(OkBt, 1, wxALL|wxALIGN_BOTTOM|wxALIGN_CENTER_HORIZONTAL, 5);
	FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	FlexGridSizer7->AddGrowableRow(0);
	errorTxt = new wxHyperlinkCtrl(centerPanel, ID_HYPERLINKCTRL1, _("No errors."), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_ALIGN_LEFT|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	errorTxt->SetToolTip(_("Click to position cursor on the error."));
	FlexGridSizer7->Add(errorTxt, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer7, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap2 = new wxStaticBitmap(centerPanel, ID_STATICBITMAP5, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP5"));
	FlexGridSizer17->Add(StaticBitmap2, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(centerPanel, ID_HYPERLINKCTRL2, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL2"));
	HyperlinkCtrl1->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer17, 1, wxRIGHT|wxALIGN_RIGHT|wxALIGN_BOTTOM, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	centerPanel->SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(centerPanel);
	FlexGridSizer1->SetSizeHints(centerPanel);
	mgr->AddPane(centerPanel, wxAuiPaneInfo().Name(_T("PaneName")).DefaultPane().Caption(_("Pane caption")).CaptionVisible(false).CloseButton(false).Center().DockFixed().Floatable(false).Movable(false).PaneBorder(false));
	mathPanel = new wxPanel(this, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	StaticText1 = new wxStaticText(mathPanel, ID_STATICTEXT1, _("Basic operations"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	PlusBt = new wxButton(mathPanel, ID_BUTTON2, _("+"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON2"));
	BoxSizer1->Add(PlusBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	MinusBt = new wxButton(mathPanel, ID_BUTTON3, _("-"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON3"));
	BoxSizer1->Add(MinusBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	MultBt = new wxButton(mathPanel, ID_BUTTON4, _("*"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON4"));
	BoxSizer1->Add(MultBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	DivBt = new wxButton(mathPanel, ID_BUTTON5, _("/"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON5"));
	BoxSizer1->Add(DivBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(BoxSizer1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(mathPanel, ID_STATICTEXT2, _("Complex operations"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer3->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer2 = new wxGridSizer(0, 4, 0, 0);
	POBt = new wxButton(mathPanel, ID_BUTTON6, _("("), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON6"));
	GridSizer2->Add(POBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	PFBt = new wxButton(mathPanel, ID_BUTTON7, _(")"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON7"));
	GridSizer2->Add(PFBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button2 = new wxButton(mathPanel, ID_BUTTON13, _("pow"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON13"));
	Button2->SetToolTip(_("pow(x,n) raise x to power n"));
	GridSizer2->Add(Button2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button3 = new wxButton(mathPanel, ID_BUTTON14, _("E10"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON14"));
	GridSizer2->Add(Button3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BitmapButton2 = new wxBitmapButton(mathPanel, ID_BITMAPBUTTON2, wxBitmap(wxImage(_T("res/sqrt.png"))), wxDefaultPosition, wxSize(25,23), wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON2"));
	BitmapButton2->SetToolTip(_("sqrt(x) compute the square root of x."));
	GridSizer2->Add(BitmapButton2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BitmapButton1 = new wxBitmapButton(mathPanel, ID_BITMAPBUTTON1, wxBitmap(wxImage(_T("res/nth root.png"))), wxDefaultPosition, wxSize(25,23), wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON1"));
	BitmapButton1->SetToolTip(_("Nth root of a number. nthroot(27, 3) will return 3."));
	GridSizer2->Add(BitmapButton1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button4 = new wxButton(mathPanel, ID_BUTTON15, _("exp"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON15"));
	Button4->SetToolTip(_("Exponential"));
	GridSizer2->Add(Button4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button1 = new wxButton(mathPanel, ID_BUTTON12, _("log"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON12"));
	Button1->SetToolTip(_("Natural logarithm"));
	GridSizer2->Add(Button1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	CosBt = new wxButton(mathPanel, ID_BUTTON8, _("cos"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON8"));
	CosBt->SetToolTip(_("Cosine"));
	GridSizer2->Add(CosBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SinBt = new wxButton(mathPanel, ID_BUTTON9, _("sin"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON9"));
	SinBt->SetToolTip(_("Sine"));
	GridSizer2->Add(SinBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button5 = new wxButton(mathPanel, ID_BUTTON16, _("tan"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON16"));
	Button5->SetToolTip(_("Tangent"));
	GridSizer2->Add(Button5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button21 = new wxButton(mathPanel, ID_BUTTON33, _("log10"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON33"));
	wxFont Button21Font(6,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_NORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button21->SetFont(Button21Font);
	Button21->SetToolTip(_("Base-10 logarithm"));
	GridSizer2->Add(Button21, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button17 = new wxButton(mathPanel, ID_BUTTON29, _("cosh"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON29"));
	wxFont Button17Font(7,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_NORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button17->SetFont(Button17Font);
	Button17->SetToolTip(_("Hyperbolic cosine"));
	GridSizer2->Add(Button17, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button16 = new wxButton(mathPanel, ID_BUTTON28, _("sinh"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON28"));
	wxFont Button16Font(7,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_NORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button16->SetFont(Button16Font);
	Button16->SetToolTip(_("Hyperbolic sine"));
	GridSizer2->Add(Button16, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button15 = new wxButton(mathPanel, ID_BUTTON27, _("tanh"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON27"));
	wxFont Button15Font(7,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_NORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button15->SetFont(Button15Font);
	Button15->SetToolTip(_("Hyperbolic tangent"));
	GridSizer2->Add(Button15, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button14 = new wxButton(mathPanel, ID_BUTTON26, _("floor"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON26"));
	wxFont Button14Font(7,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_NORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button14->SetFont(Button14Font);
	Button14->SetToolTip(_("Round to the smallest following integer."));
	GridSizer2->Add(Button14, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button7 = new wxButton(mathPanel, ID_BUTTON18, _("acos"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON18"));
	wxFont Button7Font(7,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_NORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button7->SetFont(Button7Font);
	GridSizer2->Add(Button7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button8 = new wxButton(mathPanel, ID_BUTTON19, _("asin"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON19"));
	wxFont Button8Font(7,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_NORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button8->SetFont(Button8Font);
	GridSizer2->Add(Button8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button9 = new wxButton(mathPanel, ID_BUTTON20, _("atan"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON20"));
	wxFont Button9Font(7,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_NORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button9->SetFont(Button9Font);
	GridSizer2->Add(Button9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	ceilBt = new wxButton(mathPanel, ID_BUTTON21, _("ceil"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON21"));
	ceilBt->SetToolTip(_("Round to the greatest following integer."));
	GridSizer2->Add(ceilBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button10 = new wxButton(mathPanel, ID_BUTTON22, _("a\ncosh"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON22"));
	wxFont Button10Font(6,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_NORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button10->SetFont(Button10Font);
	GridSizer2->Add(Button10, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button11 = new wxButton(mathPanel, ID_BUTTON23, _("a\nsinh"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON23"));
	wxFont Button11Font(6,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_NORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button11->SetFont(Button11Font);
	GridSizer2->Add(Button11, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button12 = new wxButton(mathPanel, ID_BUTTON24, _("a\ntanh"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON24"));
	wxFont Button12Font(6,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_NORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button12->SetFont(Button12Font);
	GridSizer2->Add(Button12, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	intBt = new wxButton(mathPanel, ID_BUTTON25, _("int"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON25"));
	intBt->SetToolTip(_("in(x) convert x in an integer."));
	GridSizer2->Add(intBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button18 = new wxButton(mathPanel, ID_BUTTON30, _("sec"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON30"));
	wxFont Button18Font(7,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_NORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button18->SetFont(Button18Font);
	Button18->SetToolTip(_("Secant ( 1/cos(x) )"));
	GridSizer2->Add(Button18, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button19 = new wxButton(mathPanel, ID_BUTTON31, _("csc"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON31"));
	wxFont Button19Font(7,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_NORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button19->SetFont(Button19Font);
	Button19->SetToolTip(_("Cosecant ( 1/sin(x) )"));
	GridSizer2->Add(Button19, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button20 = new wxButton(mathPanel, ID_BUTTON32, _("cot"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON32"));
	wxFont Button20Font(7,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_NORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	Button20->SetFont(Button20Font);
	Button20->SetToolTip(_("Cotangent ( 1/tan(x) )"));
	GridSizer2->Add(Button20, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button6 = new wxButton(mathPanel, ID_BUTTON17, _("abs"), wxDefaultPosition, wxSize(25,23), 0, wxDefaultValidator, _T("ID_BUTTON17"));
	Button6->SetToolTip(_("abs(x) return the absolute value of x."));
	GridSizer2->Add(Button6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(GridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	mathPanel->SetSizer(FlexGridSizer3);
	FlexGridSizer3->Fit(mathPanel);
	FlexGridSizer3->SetSizeHints(mathPanel);
	mgr->AddPane(mathPanel, wxAuiPaneInfo().Name(_T("mathPane")).DefaultPane().Caption(_("Mathematical functions and operators")).CaptionVisible().CloseButton(false).Bottom().Resizable(false));
	objectsPanel = new wxPanel(this, ID_PANEL3, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(0);
	ObjList = new wxTreeCtrl(objectsPanel, ID_TREECTRL1, wxDefaultPosition, wxSize(195,177), wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer4->Add(ObjList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	AddPropBt = new wxButton(objectsPanel, ID_BUTTON10, _("Add"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON10"));
	FlexGridSizer4->Add(AddPropBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	objectsPanel->SetSizer(FlexGridSizer4);
	FlexGridSizer4->Fit(objectsPanel);
	FlexGridSizer4->SetSizeHints(objectsPanel);
	mgr->AddPane(objectsPanel, wxAuiPaneInfo().Name(_T("objectsPane")).DefaultPane().Caption(_("Objects functions")).CaptionVisible().CloseButton(false).Bottom());
	freeFunctionsPanel = new wxPanel(this, ID_PANEL4, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL4"));
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	FlexGridSizer5->AddGrowableRow(0);
	ValList = new wxTreeCtrl(freeFunctionsPanel, ID_TREECTRL2, wxDefaultPosition, wxSize(178,147), wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL2"));
	FlexGridSizer5->Add(ValList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	AddValBt = new wxButton(freeFunctionsPanel, ID_BUTTON11, _("Add"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON11"));
	FlexGridSizer5->Add(AddValBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	freeFunctionsPanel->SetSizer(FlexGridSizer5);
	FlexGridSizer5->Fit(freeFunctionsPanel);
	FlexGridSizer5->SetSizeHints(freeFunctionsPanel);
	mgr->AddPane(freeFunctionsPanel, wxAuiPaneInfo().Name(_T("freeFunctionsPane")).DefaultPane().Caption(_("Other functions")).CaptionVisible().CloseButton(false).Bottom());
	mgr->Update();

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnOkBtClick);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&EditExpressionDialog::OnerrorTxtClick);
	Connect(ID_HYPERLINKCTRL2,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&EditExpressionDialog::OnhelpBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnPlusBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnMinusBtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnMultBtClick);
	Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnDivBtClick);
	Connect(ID_BUTTON6,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnPOBtClick);
	Connect(ID_BUTTON7,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnPFBtClick);
	Connect(ID_BUTTON13,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton2Click);
	Connect(ID_BUTTON14,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton3Click);
	Connect(ID_BITMAPBUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnBitmapButton2Click);
	Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnBitmapButton1Click);
	Connect(ID_BUTTON15,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton4Click);
	Connect(ID_BUTTON12,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton1Click);
	Connect(ID_BUTTON8,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnCosBtClick);
	Connect(ID_BUTTON9,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnSinBtClick);
	Connect(ID_BUTTON16,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton5Click);
	Connect(ID_BUTTON33,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton21Click);
	Connect(ID_BUTTON29,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton17Click);
	Connect(ID_BUTTON28,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton16Click);
	Connect(ID_BUTTON27,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton15Click);
	Connect(ID_BUTTON26,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton14Click);
	Connect(ID_BUTTON18,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton7Click);
	Connect(ID_BUTTON19,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton8Click);
	Connect(ID_BUTTON20,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton9Click);
	Connect(ID_BUTTON21,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnceilBtClick);
	Connect(ID_BUTTON22,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton10Click);
	Connect(ID_BUTTON23,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton11Click);
	Connect(ID_BUTTON24,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton12Click);
	Connect(ID_BUTTON25,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnintBtClick);
	Connect(ID_BUTTON30,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton18Click);
	Connect(ID_BUTTON31,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton19Click);
	Connect(ID_BUTTON32,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton20Click);
	Connect(ID_BUTTON17,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnButton6Click);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditExpressionDialog::OnObjListItemDoubleClicked);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditExpressionDialog::OnObjListItemActivated);
	Connect(ID_BUTTON10,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnAddPropBtClick);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditExpressionDialog::OnValListItemDoubleClicked);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditExpressionDialog::OnValListItemActivated);
	Connect(ID_BUTTON11,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditExpressionDialog::OnAddValBtClick);
	//*)
	Connect(ID_CUSTOM1, wxEVT_STC_MODIFIED, (wxObjectEventFunction)&EditExpressionDialog::TextModified);
	Connect(ID_CUSTOM1, wxEVT_STC_UPDATEUI, (wxObjectEventFunction)&EditExpressionDialog::UpdateTextCtrl);

    imageListObj = new wxImageList( 16, 16 );
    imageListObj->Add(( wxBitmap( "res/actions/uneaction.png", wxBITMAP_TYPE_ANY ) ) );
    ObjList->AssignImageList( imageListObj );

    imageListVal = new wxImageList( 16, 16 );
    imageListVal->Add(( wxBitmap( "res/actions/uneaction.png", wxBITMAP_TYPE_ANY ) ) );
    ValList->AssignImageList( imageListVal );

	ExpressionEdit->SetText(expression);
	ExpressionEdit->SetLexer(wxSTC_LEX_CPP);
	ExpressionEdit->StyleSetFont(wxSTC_STYLE_DEFAULT, gd::EventsRenderingHelper::Get()->GetFont());
	ExpressionEdit->StyleClearAll();

	ExpressionEdit->StyleSetForeground(4, *wxBLACK); //Numbers
	ExpressionEdit->StyleSetForeground(10, *wxRED); //Operators
	ExpressionEdit->StyleSetForeground(6, *wxBLUE); //String
	ExpressionEdit->StyleSetForeground(5, wxColour(0,28,158)); //(Key)Word
	ExpressionEdit->StyleSetBackground(34, wxColour(119, 255, 119)); //Brace
	ExpressionEdit->StyleSetBackground(35, wxColour(255, 119, 119)); //Brace

    //Prepare keyword highlighting
    gd::String keywords;
    const vector < std::shared_ptr<PlatformExtension> > extensions = project.GetCurrentPlatform().GetAllPlatformExtensions();
	for (std::size_t i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(project.GetUsedExtensions().begin(),
                  project.GetUsedExtensions().end(),
                  extensions[i]->GetName()) == project.GetUsedExtensions().end() )
            continue;

        //Add keywords of static expressions
	    const std::map<gd::String, gd::ExpressionMetadata > & allExprs = extensions[i]->GetAllExpressions();
        for(std::map<gd::String, gd::ExpressionMetadata >::const_iterator it = allExprs.begin(); it != allExprs.end(); ++it)
	        keywords += " "+it->first;

	    const std::map<gd::String, gd::ExpressionMetadata > & allStrExprs = extensions[i]->GetAllStrExpressions();
        for(std::map<gd::String, gd::ExpressionMetadata >::const_iterator it = allStrExprs.begin(); it != allStrExprs.end(); ++it)
	        keywords += " "+it->first;

        //Add keywords of objects expressions
	    std::vector<gd::String> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
        for (std::size_t j = 0;j<objectsTypes.size();++j)
        {
            const std::map<gd::String, gd::ExpressionMetadata > & allExprs = extensions[i]->GetAllExpressionsForObject(objectsTypes[j]);
            for(std::map<gd::String, gd::ExpressionMetadata >::const_iterator it = allExprs.begin(); it != allExprs.end(); ++it)
                keywords += " "+it->first;

            const std::map<gd::String, gd::ExpressionMetadata > & allStrExprs = extensions[i]->GetAllStrExpressionsForObject(objectsTypes[j]);
            for(std::map<gd::String, gd::ExpressionMetadata >::const_iterator it = allStrExprs.begin(); it != allStrExprs.end(); ++it)
                keywords += " "+it->first;
        }

        //Add keywords of behaviors expressions
	    std::vector<gd::String> behaviorsTypes = extensions[i]->GetBehaviorsTypes();
        for (std::size_t j = 0;j<behaviorsTypes.size();++j)
        {
            const std::map<gd::String, gd::ExpressionMetadata > & allExprs = extensions[i]->GetAllExpressionsForBehavior(behaviorsTypes[j]);
            for(std::map<gd::String, gd::ExpressionMetadata >::const_iterator it = allExprs.begin(); it != allExprs.end(); ++it)
                keywords += " "+it->first;

            const std::map<gd::String, gd::ExpressionMetadata > & allStrExprs = extensions[i]->GetAllStrExpressionsForBehavior(behaviorsTypes[j]);
            for(std::map<gd::String, gd::ExpressionMetadata >::const_iterator it = allStrExprs.begin(); it != allStrExprs.end(); ++it)
                keywords += " "+it->first;
        }
	}
	ExpressionEdit->SetKeyWords(0, keywords);
    ExpressionEdit->SetWrapMode(wxSTC_WRAP_WORD);
    ExpressionEdit->SetMarginLeft(1);

	RefreshLists();

    mgr->GetArtProvider()->SetColor(wxAUI_DOCKART_SASH_COLOUR, wxSystemSettings::GetColour(wxSYS_COLOUR_MENU));
    mgr->GetArtProvider()->SetColor(wxAUI_DOCKART_BACKGROUND_COLOUR, wxSystemSettings::GetColour(wxSYS_COLOUR_MENU));
	mgr->GetPane(centerPanel).MinSize(450,50).BestSize(450,50);
	mgr->GetPane(mathPanel).MinSize(130,300).MaxSize(130,300).Resizable(false);
	mgr->GetPane(objectsPanel).MinSize(200,300);
	mgr->GetPane(freeFunctionsPanel).MinSize(200,300);
	mgr->Update();

	#if defined(WINDOWS)
	SetSize(580,438); //Values tuned for looking best on Windows
	#else
	SetSize(580,440);
	#endif
}

EditExpressionDialog::~EditExpressionDialog()
{
	//(*Destroy(EditExpressionDialog)
	//*)
	mgr->UnInit();
}

/**
 * Syntax highlighting
 */
void EditExpressionDialog::UpdateTextCtrl(wxStyledTextEvent& event)
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
void EditExpressionDialog::TextModified(wxStyledTextEvent& event)
{
    //Syntax checking
    expression = ExpressionEdit->GetText();

    gd::CallbacksForExpressionCorrectnessTesting callbacks(project, layout);
    gd::ExpressionParser expressionParser(expression);
    if ( !expressionParser.ParseMathExpression(project.GetCurrentPlatform(), project, layout, callbacks) )
    {
        errorTxt->SetLabel(expressionParser.GetFirstError());
        lastErrorPos = expressionParser.GetFirstErrorPosition();
    }
    else
    {
        errorTxt->SetLabel(_("No errors."));
        lastErrorPos = gd::String::npos;
    }

    errorTxt->Refresh(); //Need to call manually update.
}

void EditExpressionDialog::OnOkBtClick(wxCommandEvent& event)
{
    gd::CallbacksForExpressionCorrectnessTesting callbacks(project, layout);
    gd::ExpressionParser expressionParser(expression);

    if ( !expressionParser.ParseMathExpression(project.GetCurrentPlatform(), project, layout, callbacks) )
    {
        if ( wxMessageBox(_("The expression is malformed. Are you sure you want to validate this expression\?"), _("The expression contains one or more errors."), wxYES_NO | wxICON_EXCLAMATION, this) == wxNO )
            return;
    }

    EndModal(1);
}

void EditExpressionDialog::RefreshLists()
{
    ObjList->DeleteAllItems();
    ObjList->AddRoot( _( "All properties" ), 0 );

    ValList->DeleteAllItems();
    ValList->AddRoot( _( "All special values" ), 0 );

    const vector < std::shared_ptr<PlatformExtension> > extensions = project.GetCurrentPlatform().GetAllPlatformExtensions();

    //Insert extension objects expressions
	for (std::size_t i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(project.GetUsedExtensions().begin(),
                  project.GetUsedExtensions().end(),
                  extensions[i]->GetName()) == project.GetUsedExtensions().end() )
            continue;

	    std::vector<gd::String> objectsTypes = extensions[i]->GetExtensionObjectsTypes();
	    std::vector<gd::String> behaviorsTypes = extensions[i]->GetBehaviorsTypes();

        wxTreeItemId extensionItem = ObjList->GetRootItem();

	    for(std::size_t j = 0;j<objectsTypes.size();++j)
	    {
            wxTreeItemId objectTypeItem =   objectsTypes[j] == "" ?
                                            ObjList->AppendItem(extensionItem, _("All objects"), 0) :
                                            ObjList->AppendItem(extensionItem, _("Object") + wxString(" ") + extensions[i]->GetObjectMetadata(objectsTypes[j]).GetFullName() ,0) ;

            //Add each object expression
            std::map<gd::String, gd::ExpressionMetadata > allObjExpr = extensions[i]->GetAllExpressionsForObject(objectsTypes[j]);
            for(std::map<gd::String, gd::ExpressionMetadata>::const_iterator it = allObjExpr.begin(); it != allObjExpr.end(); ++it)
            {
                if ( it->second.IsShown() )
                {
                    //Search and/or add group item
                    wxTreeItemIdValue cookie;
                    wxTreeItemId groupItem = ObjList->GetFirstChild(objectTypeItem, cookie);
                    while ( groupItem.IsOk() && ObjList->GetItemText(groupItem) != it->second.GetGroup() )
                    {
                        groupItem = ObjList->GetNextSibling(groupItem);
                    }
                    if ( !groupItem.IsOk() ) groupItem = ObjList->AppendItem(objectTypeItem, it->second.GetGroup(), 0);

                    //Add expression item
                    int IDimage = 0;
                    if ( it->second.GetBitmapIcon().IsOk() )
                    {
                        imageListObj->Add(it->second.GetBitmapIcon());
                        IDimage = imageListObj->GetImageCount()-1;
                    }

                    gd::TreeItemExpressionMetadata * associatedData = new gd::TreeItemExpressionMetadata(it->first, it->second);
                    ObjList->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
                }
            }
	    }

	    for(std::size_t j = 0;j<behaviorsTypes.size();++j)
	    {
            wxTreeItemId behaviorTypeItem =   behaviorsTypes[j] == "" ?
                                            ObjList->AppendItem(extensionItem, _("All objects"), 0) :
                                            ObjList->AppendItem(extensionItem, _("Behavior") + wxString(" ") + extensions[i]->GetBehaviorMetadata(behaviorsTypes[j]).GetFullName(),0) ;

            //Add each behavior expression
            std::map<gd::String, gd::ExpressionMetadata > allAutoExpr = extensions[i]->GetAllExpressionsForBehavior(behaviorsTypes[j]);
            for(std::map<gd::String, gd::ExpressionMetadata>::const_iterator it = allAutoExpr.begin(); it != allAutoExpr.end(); ++it)
            {
                if ( it->second.IsShown() )
                {
                    //Search and/or add group item
                    wxTreeItemIdValue cookie;
                    wxTreeItemId groupItem = ObjList->GetFirstChild(behaviorTypeItem, cookie);
                    while ( groupItem.IsOk() && ObjList->GetItemText(groupItem) != it->second.GetGroup())
                    {
                        groupItem = ObjList->GetNextSibling(groupItem);
                    }
                    if ( !groupItem.IsOk() ) groupItem = ObjList->AppendItem(behaviorTypeItem, it->second.GetGroup(), 0);

                    //Add expression item
                    int IDimage = 0;
                    if ( it->second.GetBitmapIcon().IsOk() )
                    {
                        imageListObj->Add(it->second.GetBitmapIcon());
                        IDimage = imageListObj->GetImageCount()-1;
                    }

                    gd::TreeItemExpressionMetadata * associatedData = new gd::TreeItemExpressionMetadata(it->first, it->second);
                    ObjList->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
                }
            }
	    }

        //Add each expression
        extensionItem = ValList->GetRootItem();

        std::map<gd::String, gd::ExpressionMetadata > allExpr = extensions[i]->GetAllExpressions();
        for(std::map<gd::String, gd::ExpressionMetadata>::const_iterator it = allExpr.begin(); it != allExpr.end(); ++it)
        {
            if ( it->second.IsShown() )
            {
                //Search and/or add group item
                wxTreeItemIdValue cookie;
                wxTreeItemId groupItem = ValList->GetFirstChild(extensionItem, cookie);
                while ( groupItem.IsOk() && ValList->GetItemText(groupItem) != it->second.GetGroup())
                {
                    groupItem = ValList->GetNextSibling(groupItem);
                }
                if ( !groupItem.IsOk() ) groupItem = ValList->AppendItem(extensionItem, it->second.GetGroup(), 0);

                //Add expression item
                int IDimage = 0;
                if ( it->second.GetBitmapIcon().IsOk() )
                {
                    imageListVal->Add(it->second.GetBitmapIcon());
                    IDimage = imageListVal->GetImageCount()-1;
                }

                gd::TreeItemExpressionMetadata * associatedData = new gd::TreeItemExpressionMetadata(it->first, it->second);
                ValList->AppendItem(groupItem, it->second.GetFullName(), IDimage, -1, associatedData);
            }
        }
	}

    ObjList->Expand(ObjList->GetRootItem());
    ValList->Expand(ValList->GetRootItem());
}

void EditExpressionDialog::OnPlusBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("+");
}

void EditExpressionDialog::OnMinusBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("-");
}

void EditExpressionDialog::OnMultBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("*");
}

void EditExpressionDialog::OnDivBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("/");
}

void EditExpressionDialog::OnPOBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("(");
}

void EditExpressionDialog::OnPFBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText(")");
}

void EditExpressionDialog::OnCosBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("cos(");
}

void EditExpressionDialog::OnSinBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("sin(");
}

/**
 * Show a dialog for completing a parameter
 */
gd::String EditExpressionDialog::ShowParameterDialog(const gd::ParameterMetadata & parameterMetadata, bool & userCancelled, gd::String objectNameAssociated)
{
    if ( parameterMetadata.type == "expression" )
    {
        gd::AdvancedTextEntryDialog dialog(this, _("Parameter"), parameterMetadata.description, "0", AdvancedTextEntryDialog::MathExpression, &project, &layout);
        if ( dialog.ShowModal() == wxOK )
            return dialog.text;
        else
            userCancelled = true;
    }
    else if ( parameterMetadata.type == "string" )
    {
        gd::AdvancedTextEntryDialog dialog(this, _("Parameter"), parameterMetadata.description, "\"\"", AdvancedTextEntryDialog::TextExpression, &project, &layout);
        if ( dialog.ShowModal() == wxOK )
            return dialog.text;
        else
            userCancelled = true;
    }
    else if ( gd::ParameterMetadata::IsObject(parameterMetadata.type) )
    {
        gd::ChooseObjectDialog dialog(this, project, layout, true, parameterMetadata.supplementaryInformation);
        if ( dialog.ShowModal() == 0 ) return "";

        return dialog.GetChosenObject();
    }
    else if ( parameterMetadata.type == "layer" )
    {
        gd::ChooseLayerDialog dialog(this, layout);
        if ( dialog.ShowModal() == 0 ) return "";

        return dialog.GetChosenLayer();
    }
    else if ( parameterMetadata.type == "scenevar" )
    {
        gd::ChooseVariableDialog dialog(this, layout.GetVariables());
        dialog.SetAssociatedLayout(&project, &layout);
        if ( dialog.ShowModal() == 0 ) return "";

        return dialog.GetSelectedVariable();
    }
    else if ( parameterMetadata.type == "globalvar" )
    {
        gd::ChooseVariableDialog dialog(this, project.GetVariables());
        dialog.SetAssociatedProject(&project);
        if ( dialog.ShowModal() == 0 ) return "";

        return dialog.GetSelectedVariable();
    }
    else if ( parameterMetadata.type == "objectvar" )
    {
        gd::Object * object = NULL;

        if ( layout.HasObjectNamed(objectNameAssociated) )
            object = &layout.GetObject(objectNameAssociated);
        else if ( project.HasObjectNamed(objectNameAssociated) )
            object = &project.GetObject(objectNameAssociated);
        else
            return wxGetTextFromUser(parameterMetadata.description, _("Variable"), "", this);

        gd::ChooseVariableDialog dialog(this, object->GetVariables());
        dialog.SetAssociatedObject(&project, &layout, object);
        if ( dialog.ShowModal() == 1 )
            return dialog.GetSelectedVariable();

        return "";
    }
    else if ( parameterMetadata.type == "camera" )
    {
        gd::String param = wxGetTextFromUser(parameterMetadata.description, _("Camera number"), "0", this);
        return param;
    }
    else
    {
        gd::String param = wxGetTextFromUser(parameterMetadata.description, _("Parameter"), "", this);
        return param;
    }

    return "";
}

void EditExpressionDialog::OnAddPropBtClick(wxCommandEvent& event)
{
    if ( !itemObj.IsOk() ) return;

    gd::TreeItemExpressionMetadata * infos = dynamic_cast<gd::TreeItemExpressionMetadata *>(ObjList->GetItemData(itemObj));
    if ( infos != NULL )
    {
        if ( infos->GetExpressionMetadata().parameters.empty() ) return; //Not even a parameter for the object ?

        bool cancelled = false;
        gd::String object = ShowParameterDialog(infos->GetExpressionMetadata().parameters[0], cancelled);
        if ( cancelled ) return;

        //Add parameters
        gd::String parametersStr, behaviorStr;
        for (std::size_t i = 1;i<infos->GetExpressionMetadata().parameters.size();++i)
        {
            if ( infos->GetExpressionMetadata().parameters[i].codeOnly ) continue;

            if ( i == 1 && infos->GetExpressionMetadata().parameters[i].type == "behavior" )
            {
                gd::ChooseBehaviorDialog dialog(this, project, layout, object, infos->GetExpressionMetadata().parameters[i].supplementaryInformation);
                if ( dialog.DeduceBehavior() || dialog.ShowModal() == 1 )
                    behaviorStr = dialog.GetChosenBehavior()+"::";
            }
            else
            {
                if ( !parametersStr.empty() ) parametersStr += ",";
                parametersStr += ShowParameterDialog(infos->GetExpressionMetadata().parameters[i], cancelled, object);
                if ( cancelled ) return;
            }
        }

        if ( ExpressionEdit->GetText() == "0" ) ExpressionEdit->SetText("");
        ExpressionEdit->AddText(object+"."+behaviorStr+infos->GetName()+"("+parametersStr+")");
        return;
    }
}

void EditExpressionDialog::OnAddValBtClick(wxCommandEvent& event)
{
    if ( !itemVal.IsOk() ) return;

    gd::TreeItemExpressionMetadata * infos = dynamic_cast<gd::TreeItemExpressionMetadata *>(ValList->GetItemData(itemVal));
    if ( infos != NULL )
    {
        gd::String parametersStr;
        for (std::size_t i = 0;i<infos->GetExpressionMetadata().parameters.size();++i)
        {
            if ( infos->GetExpressionMetadata().parameters[i].codeOnly ) continue;

            if ( !parametersStr.empty() ) parametersStr += ",";
            bool userCancelled = false;
            parametersStr += ShowParameterDialog(infos->GetExpressionMetadata().parameters[i], userCancelled);
            if ( userCancelled ) return;
        }

        if ( ExpressionEdit->GetText() == "0" ) ExpressionEdit->SetText("");
        ExpressionEdit->AddText(infos->GetName()+"("+parametersStr+")");
        return;
    }
}

void EditExpressionDialog::OnObjListItemActivated(wxTreeEvent& event)
{
    itemObj = event.GetItem();
}

void EditExpressionDialog::OnObjListItemDoubleClicked(wxTreeEvent& event)
{
    itemObj = event.GetItem();
    wxCommandEvent uselessEvent;
    OnAddPropBtClick(uselessEvent);
}

void EditExpressionDialog::OnValListItemActivated(wxTreeEvent& event)
{
    itemVal = event.GetItem();
}

void EditExpressionDialog::OnValListItemDoubleClicked(wxTreeEvent& event)
{
    itemVal = event.GetItem();
    wxCommandEvent uselessEvent;
    OnAddValBtClick(uselessEvent);
}


void EditExpressionDialog::OnButton2Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("pow(x,n)");
}

void EditExpressionDialog::OnButton3Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("exp(");
}

void EditExpressionDialog::OnBitmapButton2Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("sqrt(");
}

void EditExpressionDialog::OnBitmapButton1Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("nthroot(x,n)");
}

void EditExpressionDialog::OnButton4Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("exp(");
}

void EditExpressionDialog::OnButton1Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("log(");
}

void EditExpressionDialog::OnButton5Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("tan(");
}

void EditExpressionDialog::OnButton6Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("abs(");
}

void EditExpressionDialog::OnButton7Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("acos(");
}

void EditExpressionDialog::OnButton8Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("asin(");
}

void EditExpressionDialog::OnButton9Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("atan(");
}

void EditExpressionDialog::OnintBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("int(");
}

void EditExpressionDialog::OnerrorTxtClick(wxCommandEvent& event)
{
    if ( lastErrorPos != gd::String::npos )
        ExpressionEdit->GotoPos(lastErrorPos);
}

void EditExpressionDialog::OnButton21Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("log10(");
}

void EditExpressionDialog::OnButton14Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("floor(");
}

void EditExpressionDialog::OnceilBtClick(wxCommandEvent& event)
{
	ExpressionEdit->AddText("ceil(");
}

void EditExpressionDialog::OnButton10Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("acosh(");
}

void EditExpressionDialog::OnButton11Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("asinh(");
}

void EditExpressionDialog::OnButton12Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("atanh(");
}

void EditExpressionDialog::OnButton18Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("sec(");
}

void EditExpressionDialog::OnButton19Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("csc(");
}

void EditExpressionDialog::OnButton20Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("cot(");
}

void EditExpressionDialog::OnButton15Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("tanh(");
}

void EditExpressionDialog::OnButton16Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("sinh(");
}

void EditExpressionDialog::OnButton17Click(wxCommandEvent& event)
{
	ExpressionEdit->AddText("cosh(");
}

void EditExpressionDialog::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/edit_expr");
}

}
#endif
