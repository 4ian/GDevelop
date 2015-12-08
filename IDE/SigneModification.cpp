#include "SigneModification.h"

//(*InternalHeaders(SigneModification)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"

//(*IdInit(SigneModification)
const long SigneModification::ID_RADIOBOX1 = wxNewId();
const long SigneModification::ID_STATICBITMAP2 = wxNewId();
const long SigneModification::ID_HYPERLINKCTRL1 = wxNewId();
const long SigneModification::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(SigneModification,wxDialog)
	//(*EventTable(SigneModification)
	//*)
END_EVENT_TABLE()

SigneModification::SigneModification(wxWindow* parent)
{
	//(*Initialize(SigneModification)
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Choose the modification\'s sign"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	wxString __wxRadioBoxChoices_1[5] =
	{
		_("= ( Set to )"),
		_("+ ( Add )"),
		_("- ( Subtract )"),
		_("* ( Multiply by )"),
		_("/ ( Divide by )")
	};
	SigneRadio = new wxRadioBox(this, ID_RADIOBOX1, _("Choose the operator"), wxDefaultPosition, wxDefaultSize, 5, __wxRadioBoxChoices_1, 1, wxRA_HORIZONTAL, wxDefaultValidator, _T("ID_RADIOBOX1"));
	SigneRadio->SetFocus();
	FlexGridSizer1->Add(SigneRadio, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer17->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer17->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&SigneModification::OnhelpBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SigneModification::OnOkBtClick);
	//*)
}

SigneModification::~SigneModification()
{
	//(*Destroy(SigneModification)
	//*)
}


void SigneModification::OnOkBtClick(wxCommandEvent& event)
{
    int nb = SigneRadio->GetSelection();

    EndModal(nb+1);
}


void SigneModification::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/events_editor/parameters");
}
