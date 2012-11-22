#include "ChoixClavier.h"

//(*InternalHeaders(ChoixClavier)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <iostream>
#include <string>
#include <vector>
#include <wx/msgdlg.h>
#include "GDCore/Tools/HelpFileAccess.h"

using namespace std;

//(*IdInit(ChoixClavier)
const long ChoixClavier::ID_STATICTEXT3 = wxNewId();
const long ChoixClavier::ID_STATICLINE1 = wxNewId();
const long ChoixClavier::ID_STATICBITMAP2 = wxNewId();
const long ChoixClavier::ID_HYPERLINKCTRL1 = wxNewId();
const long ChoixClavier::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChoixClavier,wxDialog)
	//(*EventTable(ChoixClavier)
	//*)
END_EVENT_TABLE()

ChoixClavier::ChoixClavier(wxWindow* parent, string pTouche)
{
	//(*Initialize(ChoixClavier)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Choose a key"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxWANTS_CHARS, _T("wxID_ANY"));
	SetClientSize(wxSize(234,179));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT3, _("Just press a key"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer1->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/helpicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer17->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer17, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button1 = new wxButton(this, ID_BUTTON1, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(Button1, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	SetSizer(FlexGridSizer1);
	Layout();

	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ChoixClavier::OnhelpBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixClavier::OnButton1Click);
	Connect(wxEVT_KEY_DOWN,(wxObjectEventFunction)&ChoixClavier::OnKeyDown);
	//*)
}

ChoixClavier::~ChoixClavier()
{
	//(*Destroy(ChoixClavier)
	//*)
}

void ChoixClavier::OnKeyDown(wxKeyEvent& event)
{
    int code = event.GetKeyCode();

    if ( code == 65 ) selectedKey = "a";
    if ( code == 66 ) selectedKey = "b";
    if ( code == 67 ) selectedKey = "c";
    if ( code == 68 ) selectedKey = "d";
    if ( code == 69 ) selectedKey = "e";
    if ( code == 70 ) selectedKey = "f";
    if ( code == 71 ) selectedKey = "g";
    if ( code == 72 ) selectedKey = "h";
    if ( code == 73 ) selectedKey = "i";
    if ( code == 74 ) selectedKey = "j";
    if ( code == 75 ) selectedKey = "k";
    if ( code == 76 ) selectedKey = "l";
    if ( code == 77 ) selectedKey = "m";
    if ( code == 78 ) selectedKey = "n";
    if ( code == 79 ) selectedKey = "o";
    if ( code == 80 ) selectedKey = "p";
    if ( code == 81 ) selectedKey = "q";
    if ( code == 82 ) selectedKey = "r";
    if ( code == 83 ) selectedKey = "s";
    if ( code == 84 ) selectedKey = "t";
    if ( code == 85 ) selectedKey = "u";
    if ( code == 86 ) selectedKey = "v";
    if ( code == 87 ) selectedKey = "w";
    if ( code == 88 ) selectedKey = "x";
    if ( code == 89 ) selectedKey = "y";
    if ( code == 90 ) selectedKey = "z";

    if ( code == WXK_NUMPAD0 ) selectedKey = "Numpad0";
    if ( code == WXK_NUMPAD1 ) selectedKey = "Numpad1";
    if ( code == WXK_NUMPAD2 ) selectedKey = "Numpad2";
    if ( code == WXK_NUMPAD3 ) selectedKey = "Numpad3";
    if ( code == WXK_NUMPAD4 ) selectedKey = "Numpad4";
    if ( code == WXK_NUMPAD5 ) selectedKey = "Numpad5";
    if ( code == WXK_NUMPAD6 ) selectedKey = "Numpad6";
    if ( code == WXK_NUMPAD7 ) selectedKey = "Numpad7";
    if ( code == WXK_NUMPAD8 ) selectedKey = "Numpad8";
    if ( code == WXK_NUMPAD9 ) selectedKey = "Numpad9";

    if ( code == WXK_ESCAPE ) selectedKey = "Escape";
    if ( code == WXK_SPACE ) selectedKey = "Space";
    if ( code == WXK_RETURN ) selectedKey = "Return";
    if ( code == WXK_BACK ) selectedKey = "Back";
    if ( code == WXK_TAB ) selectedKey = "Tab";
    if ( code == WXK_PAGEUP ) selectedKey = "PageUp";
    if ( code == WXK_PAGEDOWN ) selectedKey = "PageDown";
    if ( code == WXK_END ) selectedKey = "End";
    if ( code == WXK_HOME ) selectedKey = "Home";
    if ( code == WXK_INSERT ) selectedKey = "Insert";
    if ( code == WXK_DELETE ) selectedKey = "Delete";

    if ( code == WXK_ADD ) selectedKey = "Add";
    if ( code == WXK_SUBTRACT) selectedKey = "Subtract";
    if ( code == WXK_MULTIPLY ) selectedKey = "Multiply";
    if ( code == WXK_DIVIDE ) selectedKey = "Divide";

    if ( code == WXK_LEFT ) selectedKey = "Left";
    if ( code == WXK_RIGHT) selectedKey = "Right";
    if ( code == WXK_UP ) selectedKey = "Up";
    if ( code == WXK_DOWN ) selectedKey = "Down";

    if ( code == WXK_F1 ) selectedKey = "F1";
    if ( code == WXK_F2 ) selectedKey = "F2";
    if ( code == WXK_F3 ) selectedKey = "F3";
    if ( code == WXK_F4 ) selectedKey = "F4";
    if ( code == WXK_F5 ) selectedKey = "F5";
    if ( code == WXK_F6 ) selectedKey = "F6";
    if ( code == WXK_F7 ) selectedKey = "F7";
    if ( code == WXK_F8 ) selectedKey = "F8";
    if ( code == WXK_F9 ) selectedKey = "F9";
    if ( code == WXK_F10 ) selectedKey = "F10";
    if ( code == WXK_F11 ) selectedKey = "F11";
    if ( code == WXK_F12 ) selectedKey = "F12";

    if ( code == WXK_PAUSE ) selectedKey = "Pause";

    if ( event.ControlDown() )
    {
        if ( wxMessageBox(_("Right Control : Yes\nLeft Control : No"), _("Choose the key"), wxYES_NO) == wxYES)
            selectedKey = "RControl";
        else
            selectedKey = "LControl";
    }
    if ( event.AltDown() )
    {
        if ( wxMessageBox(_("Right Alt : Yes\nLeft alt : No"), _("Choose the key"), wxYES_NO) == wxYES)
            selectedKey = "RAlt";
        else
            selectedKey = "LAlt";
    }
    if ( event.ShiftDown() )
    {
        if ( wxMessageBox(_("Right Shift : Yes\nLeft Shift : No"), _("Choose the key"), wxYES_NO) == wxYES)
            selectedKey = "RShift";
        else
            selectedKey = "LShift";
    }

    EndModal(1);
}

void ChoixClavier::OnButton1Click(wxCommandEvent& event)
{
    EndModal(0);
}

void ChoixClavier::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/events_editor/parameters"));
}
