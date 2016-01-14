/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#include "GeneratePassword.h"

//(*InternalHeaders(GeneratePassword)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include <string>
#include <SFML/System.hpp>

using namespace std;

//(*IdInit(GeneratePassword)
const long GeneratePassword::ID_STATICTEXT1 = wxNewId();
const long GeneratePassword::ID_TEXTCTRL1 = wxNewId();
const long GeneratePassword::ID_STATICTEXT2 = wxNewId();
const long GeneratePassword::ID_BUTTON1 = wxNewId();
const long GeneratePassword::ID_TEXTCTRL2 = wxNewId();
const long GeneratePassword::ID_STATICLINE1 = wxNewId();
const long GeneratePassword::ID_STATICBITMAP2 = wxNewId();
const long GeneratePassword::ID_HYPERLINKCTRL1 = wxNewId();
const long GeneratePassword::ID_BUTTON2 = wxNewId();
const long GeneratePassword::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(GeneratePassword,wxDialog)
	//(*EventTable(GeneratePassword)
	//*)
END_EVENT_TABLE()

GeneratePassword::GeneratePassword(wxWindow* parent)
{
	//(*Initialize(GeneratePassword)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Automatic creation of a password"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 4, 0, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Length of the password to create :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	longEdit = new wxTextCtrl(this, ID_TEXTCTRL1, _("45"), wxDefaultPosition, wxSize(42,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer3->Add(longEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("caracters"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer3->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	CreerBt = new wxButton(this, ID_BUTTON1, _("Create"), wxDefaultPosition, wxSize(60,23), 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(CreerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Generated password"));
	mdpEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	StaticBoxSizer1->Add(mdpEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer2->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer17->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer17, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	OkBt = new wxButton(this, ID_BUTTON2, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer4->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON3, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer4->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&GeneratePassword::OnCreerBtClick);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&GeneratePassword::OnhelpBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&GeneratePassword::OnOkBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&GeneratePassword::OnAnnulerBtClick);
	//*)
}

GeneratePassword::~GeneratePassword()
{
	//(*Destroy(GeneratePassword)
	//*)
}

/**
 * Original code by Laurent Gomila.
 */
namespace
{
    // Initialize the generator's seed with the current system time
    // in milliseconds, so that it is always different
    unsigned int InitializeSeed()
    {
        unsigned int seed = static_cast<unsigned int>(std::time(NULL));
        std::srand(seed);
        return seed;
    }

    double Random(int end)
    {
        int begin = 0;
        return std::rand() % (end - begin + 1) + begin;
    }

    // Global variable storing the current seed
    unsigned int globalSeed = InitializeSeed();
}

void GeneratePassword::OnCreerBtClick(wxCommandEvent& event)
{

    string carac = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789^$�*!�";
    long number;
    longEdit->GetValue().ToLong(&number);
    if ( number < 1 ) return;

    mdpEdit->ChangeValue("");
    for (unsigned int i = 0;i<static_cast<unsigned>(number);i++)
    {
        int nb = ::Random(41);
        mdpEdit->ChangeValue(mdpEdit->GetValue()+carac.substr(nb,1));
    }
}

void GeneratePassword::OnAnnulerBtClick(wxCommandEvent& event)
{
    mdp = "";
    EndModal(0);
}

void GeneratePassword::OnOkBtClick(wxCommandEvent& event)
{
    mdp = static_cast<string>(mdpEdit->GetValue());
    EndModal(1);
}


void GeneratePassword::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/events_editor/parameters");
}
