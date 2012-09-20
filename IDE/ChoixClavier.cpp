#include "ChoixClavier.h"

//(*InternalHeaders(ChoixClavier)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <iostream>
#include <string>
#include <vector>
#include <wx/msgdlg.h>

using namespace std;

//(*IdInit(ChoixClavier)
const long ChoixClavier::ID_STATICTEXT3 = wxNewId();
const long ChoixClavier::ID_PANEL1 = wxNewId();
const long ChoixClavier::ID_STATICTEXT1 = wxNewId();
const long ChoixClavier::ID_STATICTEXT2 = wxNewId();
const long ChoixClavier::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChoixClavier,wxDialog)
	//(*EventTable(ChoixClavier)
	//*)
END_EVENT_TABLE()

ChoixClavier::ChoixClavier(wxWindow* parent, string pTouche)
{
	//(*Initialize(ChoixClavier)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Choose a key"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	SetClientSize(wxSize(234,179));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT3, _("Click on the area, and press a key"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer1->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	AideTxt = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(285,85), wxSUNKEN_BORDER|wxWANTS_CHARS, _T("ID_PANEL1"));
	AideTxt->SetBackgroundColour(wxColour(80,80,80));
	FlexGridSizer1->Add(AideTxt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Chosen key :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	toucheTxt = new wxStaticText(this, ID_STATICTEXT2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer2->Add(toucheTxt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Button1 = new wxButton(this, ID_BUTTON1, _("Close"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer1->Add(Button1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->SetSizeHints(this);

	AideTxt->Connect(wxEVT_KEY_DOWN,(wxObjectEventFunction)&ChoixClavier::OnPanel1KeyDown,0,this);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixClavier::OnButton1Click);
	Connect(wxEVT_KEY_DOWN,(wxObjectEventFunction)&ChoixClavier::OnKeyDown);
	//*)

	toucheTxt->SetLabel(pTouche);
}

ChoixClavier::~ChoixClavier()
{
	//(*Destroy(ChoixClavier)
	//*)
}


void ChoixClavier::OnKeyDown(wxKeyEvent& event)
{
}

void ChoixClavier::OnButton1Click(wxCommandEvent& event)
{
    EndModal(1);
}


void ChoixClavier::OnPanel1KeyDown(wxKeyEvent& event)
{
    int code = event.GetKeyCode();

    if ( code == 65 ) touche = "a";
    if ( code == 66 ) touche = "b";
    if ( code == 67 ) touche = "c";
    if ( code == 68 ) touche = "d";
    if ( code == 69 ) touche = "e";
    if ( code == 70 ) touche = "f";
    if ( code == 71 ) touche = "g";
    if ( code == 72 ) touche = "h";
    if ( code == 73 ) touche = "i";
    if ( code == 74 ) touche = "j";
    if ( code == 75 ) touche = "k";
    if ( code == 76 ) touche = "l";
    if ( code == 77 ) touche = "m";
    if ( code == 78 ) touche = "n";
    if ( code == 79 ) touche = "o";
    if ( code == 80 ) touche = "p";
    if ( code == 81 ) touche = "q";
    if ( code == 82 ) touche = "r";
    if ( code == 83 ) touche = "s";
    if ( code == 84 ) touche = "t";
    if ( code == 85 ) touche = "u";
    if ( code == 86 ) touche = "v";
    if ( code == 87 ) touche = "w";
    if ( code == 88 ) touche = "x";
    if ( code == 89 ) touche = "y";
    if ( code == 90 ) touche = "z";

    if ( code == WXK_NUMPAD0 ) touche = "Numpad0";
    if ( code == WXK_NUMPAD1 ) touche = "Numpad1";
    if ( code == WXK_NUMPAD2 ) touche = "Numpad2";
    if ( code == WXK_NUMPAD3 ) touche = "Numpad3";
    if ( code == WXK_NUMPAD4 ) touche = "Numpad4";
    if ( code == WXK_NUMPAD5 ) touche = "Numpad5";
    if ( code == WXK_NUMPAD6 ) touche = "Numpad6";
    if ( code == WXK_NUMPAD7 ) touche = "Numpad7";
    if ( code == WXK_NUMPAD8 ) touche = "Numpad8";
    if ( code == WXK_NUMPAD9 ) touche = "Numpad9";

    if ( code == WXK_ESCAPE ) touche = "Escape";
    if ( code == WXK_SPACE ) touche = "Space";
    if ( code == WXK_RETURN ) touche = "Return";
    if ( code == WXK_BACK ) touche = "Back";
    if ( code == WXK_TAB ) touche = "Tab";
    if ( code == WXK_PAGEUP ) touche = "PageUp";
    if ( code == WXK_PAGEDOWN ) touche = "PageDown";
    if ( code == WXK_END ) touche = "End";
    if ( code == WXK_HOME ) touche = "Home";
    if ( code == WXK_INSERT ) touche = "Insert";
    if ( code == WXK_DELETE ) touche = "Delete";

    if ( code == WXK_ADD ) touche = "Add";
    if ( code == WXK_SUBTRACT) touche = "Subtract";
    if ( code == WXK_MULTIPLY ) touche = "Multiply";
    if ( code == WXK_DIVIDE ) touche = "Divide";

    if ( code == WXK_LEFT ) touche = "Left";
    if ( code == WXK_RIGHT) touche = "Right";
    if ( code == WXK_UP ) touche = "Up";
    if ( code == WXK_DOWN ) touche = "Down";

    if ( code == WXK_F1 ) touche = "F1";
    if ( code == WXK_F2 ) touche = "F2";
    if ( code == WXK_F3 ) touche = "F3";
    if ( code == WXK_F4 ) touche = "F4";
    if ( code == WXK_F5 ) touche = "F5";
    if ( code == WXK_F6 ) touche = "F6";
    if ( code == WXK_F7 ) touche = "F7";
    if ( code == WXK_F8 ) touche = "F8";
    if ( code == WXK_F9 ) touche = "F9";
    if ( code == WXK_F10 ) touche = "F10";
    if ( code == WXK_F11 ) touche = "F11";
    if ( code == WXK_F12 ) touche = "F12";

    if ( code == WXK_PAUSE ) touche = "Pause";

    if ( event.ControlDown() )
    {
        if ( wxMessageBox(_("Right Control : Yes\nLeft Control : No"), _("Choose the key"), wxYES_NO) == wxYES)
            touche = "RControl";
        else
            touche = "LControl";
    }
    if ( event.AltDown() )
    {
        if ( wxMessageBox(_("Right Alt : Yes\nLeft alt : No"), _("Choose the key"), wxYES_NO) == wxYES)
            touche = "RAlt";
        else
            touche = "LAlt";
    }
    if ( event.ShiftDown() )
    {
        if ( wxMessageBox(_("Right Shift : Yes\nLeft Shift : No"), _("Choose the key"), wxYES_NO) == wxYES)
            touche = "RShift";
        else
            touche = "LShift";
    }

    toucheTxt->SetLabel(touche);
}

