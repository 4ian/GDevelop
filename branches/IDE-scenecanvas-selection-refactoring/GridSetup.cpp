#include "GridSetup.h"

//(*InternalHeaders(GridSetup)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/colordlg.h>
#include <wx/log.h>
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDL/CommonTools.h"

using namespace std;

//(*IdInit(GridSetup)
const long GridSetup::ID_STATICTEXT3 = wxNewId();
const long GridSetup::ID_TEXTCTRL2 = wxNewId();
const long GridSetup::ID_STATICTEXT4 = wxNewId();
const long GridSetup::ID_STATICTEXT5 = wxNewId();
const long GridSetup::ID_TEXTCTRL3 = wxNewId();
const long GridSetup::ID_STATICTEXT6 = wxNewId();
const long GridSetup::ID_CHECKBOX1 = wxNewId();
const long GridSetup::ID_STATICTEXT1 = wxNewId();
const long GridSetup::ID_PANEL1 = wxNewId();
const long GridSetup::ID_STATICLINE1 = wxNewId();
const long GridSetup::ID_STATICBITMAP2 = wxNewId();
const long GridSetup::ID_HYPERLINKCTRL1 = wxNewId();
const long GridSetup::ID_BUTTON1 = wxNewId();
const long GridSetup::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(GridSetup,wxDialog)
	//(*EventTable(GridSetup)
	//*)
END_EVENT_TABLE()

GridSetup::GridSetup(wxWindow* parent, int & width, int & height, bool & snap_, int & r_, int & g_, int & b_) :
gridWidth(width),
gridHeight(height),
snap(snap_),
r(r_),
g(g_),
b(b_)
{
	//(*Initialize(GridSetup)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Grid parameters"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("Width of a cell:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer2->Add(StaticText3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	widthEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(55,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer2->Add(widthEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("pixels"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer2->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT5, _("Height of a cell:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer2->Add(StaticText5, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	heightEdit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(55,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
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
	StaticBitmap2 = new wxStaticBitmap(this, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/helpicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
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

	colorPanel->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&GridSetup::OncolorPanelLeftUp,0,this);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&GridSetup::OnhelpBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&GridSetup::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&GridSetup::OncancelBtClick);
	//*)

	snapCheck->SetValue(snap);
	widthEdit->ChangeValue(ToString(gridWidth));
	heightEdit->ChangeValue(ToString(gridHeight));
    colorPanel->SetBackgroundColour( wxColor(r,g,b) );
}

GridSetup::~GridSetup()
{
	//(*Destroy(GridSetup)
	//*)
}


void GridSetup::OnokBtClick(wxCommandEvent& event)
{
    snap = snapCheck->GetValue();
    if ( ToInt(static_cast<string>(widthEdit->GetValue())) < 1)
    {
        wxLogWarning(_("The width of the grid is wrong."));
        return;
    }
    if ( ToInt(static_cast<string>(heightEdit->GetValue())) < 1)
    {
        wxLogWarning(_("The height of the grid is wrong."));
        return;
    }

    gridWidth = ToInt(static_cast<string>(widthEdit->GetValue()));
    gridHeight = ToInt(static_cast<string>(heightEdit->GetValue()));

    EndModal(1);
}

void GridSetup::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void GridSetup::OncolorPanelLeftUp(wxMouseEvent& event)
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


void GridSetup::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::GetInstance()->OpenURL(_("http://wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/editors/scene_editor/edit_scene_edit"));
}
