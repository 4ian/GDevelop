#include "ChoixBouton.h"

//(*InternalHeaders(ChoixBouton)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)

#include <string>
#include <vector>
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"

using namespace std;

//(*IdInit(ChoixBouton)
const long ChoixBouton::ID_RADIOBOX1 = wxNewId();
const long ChoixBouton::ID_PANEL1 = wxNewId();
const long ChoixBouton::ID_STATICBITMAP2 = wxNewId();
const long ChoixBouton::ID_HYPERLINKCTRL1 = wxNewId();
const long ChoixBouton::ID_BUTTON2 = wxNewId();
const long ChoixBouton::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE( ChoixBouton, wxDialog )
    //(*EventTable(ChoixBouton)
    //*)
END_EVENT_TABLE()

ChoixBouton::ChoixBouton( wxWindow* parent, gd::String pBouton ) :
        bouton( pBouton )
{
    //(*Initialize(ChoixBouton)
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer2;
    wxFlexGridSizer* FlexGridSizer1;
    wxFlexGridSizer* FlexGridSizer17;

    Create(parent, wxID_ANY, _("Choose a mouse button"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
    SetClientSize(wxSize(333,249));
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(0);
    FlexGridSizer2 = new wxFlexGridSizer(0, 2, 0, 0);
    FlexGridSizer2->AddGrowableCol(1);
    FlexGridSizer2->AddGrowableRow(0);
    wxString __wxRadioBoxChoices_1[5] =
    {
    	_("Left button"),
    	_("Right button"),
    	_("Center button"),
    	_("Special button 1"),
    	_("Special button 2")
    };
    RadioBox1 = new wxRadioBox(this, ID_RADIOBOX1, _("Choose the button :"), wxDefaultPosition, wxDefaultSize, 5, __wxRadioBoxChoices_1, 1, wxRA_HORIZONTAL, wxDefaultValidator, _T("ID_RADIOBOX1"));
    FlexGridSizer2->Add(RadioBox1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    TestPanel = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(123,117), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    TestPanel->SetBackgroundColour(wxColour(128,128,128));
    TestPanel->SetToolTip(_("Click with a button to automatically select this latter from the list"));
    FlexGridSizer2->Add(TestPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer3->AddGrowableCol(0);
    FlexGridSizer3->AddGrowableRow(0);
    FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer17->AddGrowableRow(0);
    StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
    FlexGridSizer17->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
    helpBt->SetToolTip(_("Display help about this window"));
    FlexGridSizer17->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer3->Add(FlexGridSizer17, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
    OkBt = new wxButton(this, ID_BUTTON2, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    FlexGridSizer3->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    CancelBt = new wxButton(this, ID_BUTTON1, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    FlexGridSizer3->Add(CancelBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    SetSizer(FlexGridSizer1);
    Layout();

    Connect(ID_RADIOBOX1,wxEVT_COMMAND_RADIOBOX_SELECTED,(wxObjectEventFunction)&ChoixBouton::OnRadioBox1Select);
    TestPanel->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&ChoixBouton::OnTestPanelLeftUp,0,this);
    TestPanel->Connect(wxEVT_MIDDLE_UP,(wxObjectEventFunction)&ChoixBouton::OnTestPanelMiddleUp,0,this);
    TestPanel->Connect(wxEVT_RIGHT_DOWN,(wxObjectEventFunction)&ChoixBouton::OnTestPanelRightDown,0,this);
    Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ChoixBouton::OnhelpBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixBouton::OnOkBtClick);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixBouton::OnCancelBtClick);
    //*)


    if ( bouton == "" ) { bouton = "Left"; RadioBox1->SetSelection( 0 ); } //Valeur par d�faut
    if ( bouton == "Left" ) { RadioBox1->SetSelection( 0 ); }
    if ( bouton == "Right" ) { RadioBox1->SetSelection( 1 ); }
    if ( bouton == "Middle" ) { RadioBox1->SetSelection( 2 ); }
    if ( bouton == "XButton1" ) { RadioBox1->SetSelection( 3 ); }
    if ( bouton == "XButton2" ) { RadioBox1->SetSelection( 4 ); }
}

ChoixBouton::~ChoixBouton()
{
    //(*Destroy(ChoixBouton)
    //*)
}


void ChoixBouton::OnRadioBox1Select( wxCommandEvent& event )
{
    if ( RadioBox1->GetSelection() == 0 ) { bouton = "Left"; }
    if ( RadioBox1->GetSelection() == 1 ) { bouton = "Right"; }
    if ( RadioBox1->GetSelection() == 2 ) { bouton = "Middle"; }
    if ( RadioBox1->GetSelection() == 3 ) { bouton = "XButton1"; }
    if ( RadioBox1->GetSelection() == 4 ) { bouton = "XButton2"; }
}

void ChoixBouton::OnOkBtClick( wxCommandEvent& event )
{
    EndModal( 1 );
}

void ChoixBouton::OnCancelBtClick( wxCommandEvent& event )
{
    EndModal( 0 );
}

void ChoixBouton::OnTestPanelLeftUp( wxMouseEvent& event )
{
    RadioBox1->SetSelection( 0 );
    bouton = "Left";
}

void ChoixBouton::OnTestPanelMiddleUp( wxMouseEvent& event )
{
    RadioBox1->SetSelection( 2 );
    bouton = "Middle";
}

void ChoixBouton::OnTestPanelRightDown( wxMouseEvent& event )
{
    RadioBox1->SetSelection( 1 );
    bouton = "Right";
}


void ChoixBouton::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/events_editor/parameters");
}
