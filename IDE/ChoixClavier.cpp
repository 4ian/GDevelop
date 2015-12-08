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
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/Tools/HelpFileAccess.h"

using namespace std;

//(*IdInit(ChoixClavier)
const long ChoixClavier::ID_STATICTEXT3 = wxNewId();
const long ChoixClavier::ID_PANEL1 = wxNewId();
const long ChoixClavier::ID_STATICLINE1 = wxNewId();
const long ChoixClavier::ID_STATICBITMAP2 = wxNewId();
const long ChoixClavier::ID_HYPERLINKCTRL1 = wxNewId();
const long ChoixClavier::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChoixClavier,wxDialog)
	//(*EventTable(ChoixClavier)
	//*)
END_EVENT_TABLE()

ChoixClavier::ChoixClavier(wxWindow* parent, gd::String pTouche)
{
	//(*Initialize(ChoixClavier)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Choose a key"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxWANTS_CHARS, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxWANTS_CHARS, _T("ID_PANEL1"));
	Panel1->SetFocus();
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	StaticText2 = new wxStaticText(Panel1, ID_STATICTEXT3, _("Press a key"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(Panel1);
	FlexGridSizer2->SetSizeHints(Panel1);
	FlexGridSizer1->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer17->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer17, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button1 = new wxButton(this, ID_BUTTON1, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(Button1, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Panel1->Connect(wxEVT_KEY_DOWN,(wxObjectEventFunction)&ChoixClavier::OnPanel1KeyDown1,0,this);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ChoixClavier::OnhelpBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixClavier::OnButton1Click);
	Connect(wxEVT_KEY_DOWN,(wxObjectEventFunction)&ChoixClavier::OnKeyDown);
	//*)

    Panel1->SetWindowStyleFlag(wxWANTS_CHARS);
    Panel1->SetFocus();
}

ChoixClavier::~ChoixClavier()
{
	//(*Destroy(ChoixClavier)
	//*)
}

void ChoixClavier::OnKeyDown(wxKeyEvent& event)
{
    OnPanel1KeyDown1(event);
}

void ChoixClavier::OnButton1Click(wxCommandEvent& event)
{
    EndModal(0);
}

void ChoixClavier::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/events_editor/parameters");
}

void ChoixClavier::OnPanel1KeyDown1(wxKeyEvent& event)
{
    int code = event.GetKeyCode();
    std::cout << code << std::endl;

    if ( code == 48 ) selectedKey = "Num0";
    else if ( code == 49 ) selectedKey = "Num1";
    else if ( code == 50 ) selectedKey = "Num2";
    else if ( code == 51 ) selectedKey = "Num3";
    else if ( code == 52 ) selectedKey = "Num4";
    else if ( code == 53 ) selectedKey = "Num5";
    else if ( code == 54 ) selectedKey = "Num6";
    else if ( code == 55 ) selectedKey = "Num7";
    else if ( code == 56 ) selectedKey = "Num8";
    else if ( code == 57 ) selectedKey = "Num9";

    else if ( code == 65 ) selectedKey = "a";
    else if ( code == 66 ) selectedKey = "b";
    else if ( code == 67 ) selectedKey = "c";
    else if ( code == 68 ) selectedKey = "d";
    else if ( code == 69 ) selectedKey = "e";
    else if ( code == 70 ) selectedKey = "f";
    else if ( code == 71 ) selectedKey = "g";
    else if ( code == 72 ) selectedKey = "h";
    else if ( code == 73 ) selectedKey = "i";
    else if ( code == 74 ) selectedKey = "j";
    else if ( code == 75 ) selectedKey = "k";
    else if ( code == 76 ) selectedKey = "l";
    else if ( code == 77 ) selectedKey = "m";
    else if ( code == 78 ) selectedKey = "n";
    else if ( code == 79 ) selectedKey = "o";
    else if ( code == 80 ) selectedKey = "p";
    else if ( code == 81 ) selectedKey = "q";
    else if ( code == 82 ) selectedKey = "r";
    else if ( code == 83 ) selectedKey = "s";
    else if ( code == 84 ) selectedKey = "t";
    else if ( code == 85 ) selectedKey = "u";
    else if ( code == 86 ) selectedKey = "v";
    else if ( code == 87 ) selectedKey = "w";
    else if ( code == 88 ) selectedKey = "x";
    else if ( code == 89 ) selectedKey = "y";
    else if ( code == 90 ) selectedKey = "z";

    //TODO: Not working?
    else if ( code == '[' ) selectedKey = "LBracket";
    else if ( code == ']' ) selectedKey = "RBracket";
    else if ( code == ';' ) selectedKey = "SemiColon";

    else if ( code == WXK_NUMPAD0 ) selectedKey = "Numpad0";
    else if ( code == WXK_NUMPAD1 ) selectedKey = "Numpad1";
    else if ( code == WXK_NUMPAD2 ) selectedKey = "Numpad2";
    else if ( code == WXK_NUMPAD3 ) selectedKey = "Numpad3";
    else if ( code == WXK_NUMPAD4 ) selectedKey = "Numpad4";
    else if ( code == WXK_NUMPAD5 ) selectedKey = "Numpad5";
    else if ( code == WXK_NUMPAD6 ) selectedKey = "Numpad6";
    else if ( code == WXK_NUMPAD7 ) selectedKey = "Numpad7";
    else if ( code == WXK_NUMPAD8 ) selectedKey = "Numpad8";
    else if ( code == WXK_NUMPAD9 ) selectedKey = "Numpad9";

    else if ( code == WXK_ESCAPE ) selectedKey = "Escape";
    else if ( code == WXK_SPACE ) selectedKey = "Space";
    else if ( code == WXK_RETURN ) selectedKey = "Return";
    else if ( code == WXK_BACK ) selectedKey = "Back";
    else if ( code == WXK_TAB ) selectedKey = "Tab";
    else if ( code == WXK_PAGEUP ) selectedKey = "PageUp";
    else if ( code == WXK_PAGEDOWN ) selectedKey = "PageDown";
    else if ( code == WXK_END ) selectedKey = "End";
    else if ( code == WXK_HOME ) selectedKey = "Home";
    else if ( code == WXK_INSERT ) selectedKey = "Insert";
    else if ( code == WXK_DELETE ) selectedKey = "Delete";

    else if ( code == WXK_ADD ) selectedKey = "Add";
    else if ( code == WXK_SUBTRACT) selectedKey = "Subtract";
    else if ( code == WXK_MULTIPLY ) selectedKey = "Multiply";
    else if ( code == WXK_DIVIDE ) selectedKey = "Divide";

    else if ( code == WXK_LEFT ) selectedKey = "Left";
    else if ( code == WXK_RIGHT) selectedKey = "Right";
    else if ( code == WXK_UP ) selectedKey = "Up";
    else if ( code == WXK_DOWN ) selectedKey = "Down";

    else if ( code == WXK_F1 ) selectedKey = "F1";
    else if ( code == WXK_F2 ) selectedKey = "F2";
    else if ( code == WXK_F3 ) selectedKey = "F3";
    else if ( code == WXK_F4 ) selectedKey = "F4";
    else if ( code == WXK_F5 ) selectedKey = "F5";
    else if ( code == WXK_F6 ) selectedKey = "F6";
    else if ( code == WXK_F7 ) selectedKey = "F7";
    else if ( code == WXK_F8 ) selectedKey = "F8";
    else if ( code == WXK_F9 ) selectedKey = "F9";
    else if ( code == WXK_F10 ) selectedKey = "F10";
    else if ( code == WXK_F11 ) selectedKey = "F11";
    else if ( code == WXK_F12 ) selectedKey = "F12";

    else if ( code == WXK_PAUSE ) selectedKey = "Pause";

    else if ( event.ControlDown() )
    {
        if ( wxMessageBox(_("Right Control : No\nLeft Control : Yes"), _("Choose the key"), wxYES_NO) == wxNO)
            selectedKey = "RControl";
        else
            selectedKey = "LControl";
    }
    else if ( event.AltDown() )
    {
        if ( wxMessageBox(_("Right Alt : No\nLeft alt : Yes"), _("Choose the key"), wxYES_NO) == wxNO)
            selectedKey = "RAlt";
        else
            selectedKey = "LAlt";
    }
    else if ( event.ShiftDown() )
    {
        if ( wxMessageBox(_("Right Shift : No\nLeft Shift : Yes"), _("Choose the key"), wxYES_NO) == wxNO)
            selectedKey = "RShift";
        else
            selectedKey = "LShift";
    }

    EndModal(1);
}
