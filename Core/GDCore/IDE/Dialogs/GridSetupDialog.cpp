
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GridSetupDialog.h"

//(*InternalHeaders(GridSetupDialog)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/colordlg.h>
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/IDE/SkinHelper.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/CommonTools.h"

using namespace std;

namespace gd
{

//(*IdInit(GridSetupDialog)
const long GridSetupDialog::ID_STATICTEXT2 = wxNewId();
const long GridSetupDialog::ID_TEXTCTRL1 = wxNewId();
const long GridSetupDialog::ID_STATICTEXT7 = wxNewId();
const long GridSetupDialog::ID_STATICTEXT8 = wxNewId();
const long GridSetupDialog::ID_TEXTCTRL4 = wxNewId();
const long GridSetupDialog::ID_STATICTEXT9 = wxNewId();
const long GridSetupDialog::ID_STATICTEXT3 = wxNewId();
const long GridSetupDialog::ID_TEXTCTRL2 = wxNewId();
const long GridSetupDialog::ID_STATICTEXT4 = wxNewId();
const long GridSetupDialog::ID_STATICTEXT5 = wxNewId();
const long GridSetupDialog::ID_TEXTCTRL3 = wxNewId();
const long GridSetupDialog::ID_STATICTEXT6 = wxNewId();
const long GridSetupDialog::ID_CHECKBOX1 = wxNewId();
const long GridSetupDialog::ID_STATICTEXT1 = wxNewId();
const long GridSetupDialog::ID_PANEL1 = wxNewId();
const long GridSetupDialog::ID_STATICLINE1 = wxNewId();
const long GridSetupDialog::ID_STATICBITMAP2 = wxNewId();
const long GridSetupDialog::ID_HYPERLINKCTRL1 = wxNewId();
const long GridSetupDialog::ID_BUTTON1 = wxNewId();
const long GridSetupDialog::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(GridSetupDialog,wxDialog)
	//(*EventTable(GridSetupDialog)
	//*)
END_EVENT_TABLE()

GridSetupDialog::GridSetupDialog(wxWindow* parent, int & width, int & height, int & x, int & y, bool & snap_, int & r_, int & g_, int & b_) :
gridWidth(width),
gridHeight(height),
gridOffsetX(x),
gridOffsetY(y),
snap(snap_),
r(r_),
g(g_),
b(b_)
{
	//(*Initialize(GridSetupDialog)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Grid parameters"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Grid offset X:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	offsetXEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer2->Add(offsetXEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText7 = new wxStaticText(this, ID_STATICTEXT7, _("pixels"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer2->Add(StaticText7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText8 = new wxStaticText(this, ID_STATICTEXT8, _("Grid offset Y:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer2->Add(StaticText8, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	offsetYEdit = new wxTextCtrl(this, ID_TEXTCTRL4, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	FlexGridSizer2->Add(offsetYEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText9 = new wxStaticText(this, ID_STATICTEXT9, _("pixels"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer2->Add(StaticText9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("Width of a cell:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer2->Add(StaticText3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	widthEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(55,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer2->Add(widthEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("pixels"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer2->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT5, _("Height of a cell:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer2->Add(StaticText5, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	heightEdit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(55,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	FlexGridSizer2->Add(heightEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText6 = new wxStaticText(this, ID_STATICTEXT6, _("pixels"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer2->Add(StaticText6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(5,10,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	snapCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Snap to grid"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	snapCheck->SetValue(false);
	FlexGridSizer2->Add(snapCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(5,10,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Color :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	colorPanel = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(36,20), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer2->Add(colorPanel, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer4->AddGrowableCol(1);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap2 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer17->Add(StaticBitmap2, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer17, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer4->Add(okBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer4->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	colorPanel->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&GridSetupDialog::OncolorPanelLeftUp,0,this);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&GridSetupDialog::OnhelpBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&GridSetupDialog::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&GridSetupDialog::OncancelBtClick);
	//*)

	snapCheck->SetValue(snap);
	offsetXEdit->ChangeValue(gd::String::From(gridOffsetX));
	offsetYEdit->ChangeValue(gd::String::From(gridOffsetY));
	widthEdit->ChangeValue(gd::String::From(gridWidth));
	heightEdit->ChangeValue(gd::String::From(gridHeight));
    colorPanel->SetBackgroundColour( wxColor(r,g,b) );
}

GridSetupDialog::~GridSetupDialog()
{
	//(*Destroy(GridSetupDialog)
	//*)
}


void GridSetupDialog::OnokBtClick(wxCommandEvent& event)
{
    snap = snapCheck->GetValue();
    if ( gd::String(widthEdit->GetValue()).To<int>() < 1)
    {
        gd::LogWarning(_("The width of the grid is wrong."));
        return;
    }
    if ( gd::String(heightEdit->GetValue()).To<int>() < 1)
    {
        gd::LogWarning(_("The height of the grid is wrong."));
        return;
    }

    gridOffsetX = gd::String(offsetXEdit->GetValue()).To<int>();
    gridOffsetY = gd::String(offsetYEdit->GetValue()).To<int>();
    gridWidth = gd::String(widthEdit->GetValue()).To<int>();
    gridHeight = gd::String(heightEdit->GetValue()).To<int>();

    EndModal(1);
}

void GridSetupDialog::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void GridSetupDialog::OncolorPanelLeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour( colorPanel->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        colorPanel->SetBackgroundColour( cData.GetColour() );
        colorPanel->Refresh();
        r = cData.GetColour().Red();
        g = cData.GetColour().Green();
        b = cData.GetColour().Blue();
    }
}


void GridSetupDialog::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenURL(_("http://wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/editors/scene_editor/edit_scene_edit"));
}


}
#endif
