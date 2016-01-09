
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "EditLink.h"

//(*InternalHeaders(EditLink)
#include <wx/bitmap.h>
#include <wx/font.h>
#include "GDCore/Tools/Localization.h"
#include <wx/image.h>
#include <wx/string.h>
#include <wx/settings.h>
//*)
#include <sstream>
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/CommonTools.h"
#include <wx/help.h>

namespace gd
{

//(*IdInit(EditLink)
const long EditLink::ID_STATICTEXT1 = wxNewId();
const long EditLink::ID_COMBOBOX1 = wxNewId();
const long EditLink::ID_RADIOBUTTON1 = wxNewId();
const long EditLink::ID_RADIOBUTTON2 = wxNewId();
const long EditLink::ID_TEXTCTRL2 = wxNewId();
const long EditLink::ID_STATICTEXT2 = wxNewId();
const long EditLink::ID_TEXTCTRL3 = wxNewId();
const long EditLink::ID_STATICTEXT4 = wxNewId();
const long EditLink::ID_STATICTEXT5 = wxNewId();
const long EditLink::ID_STATICLINE1 = wxNewId();
const long EditLink::ID_STATICBITMAP2 = wxNewId();
const long EditLink::ID_HYPERLINKCTRL1 = wxNewId();
const long EditLink::ID_BUTTON1 = wxNewId();
const long EditLink::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditLink,wxDialog)
	//(*EventTable(EditLink)
	//*)
END_EVENT_TABLE()


EditLink::EditLink(wxWindow* parent, LinkEvent & event, const gd::Project & game_) :
editedEvent(event),
game(game_)
{
	//(*Initialize(EditLink)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Create a link to another scene"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Link to scene/external events:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	linkedNameEdit = new wxComboBox(this, ID_COMBOBOX1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, 0, 0, wxDefaultValidator, _T("ID_COMBOBOX1"));
	FlexGridSizer3->Add(linkedNameEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Include"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	AllEventsCheck = new wxRadioButton(this, ID_RADIOBUTTON1, _("All scene\'s events"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
	AllEventsCheck->SetValue(true);
	FlexGridSizer2->Add(AllEventsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 5, 0, 0);
	OnlyEventsCheck = new wxRadioButton(this, ID_RADIOBUTTON2, _("Only the events"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON2"));
	FlexGridSizer4->Add(OnlyEventsCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StartEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(45,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	StartEdit->SetToolTip(_("Number of the first event"));
	FlexGridSizer4->Add(StartEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("to"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer4->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	EndEdit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(45,-1), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	EndEdit->SetToolTip(_("Number of the last event"));
	FlexGridSizer4->Add(EndEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("(included)"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer4->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT5, _("Remember to update the numbers of the events if\nyou delete or add events in the scene linked."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	wxFont StaticText5Font = wxSystemSettings::GetFont(wxSYS_DEFAULT_GUI_FONT);
	if ( !StaticText5Font.Ok() ) StaticText5Font = wxSystemSettings::GetFont(wxSYS_DEFAULT_GUI_FONT);
	StaticText5Font.SetStyle(wxFONTSTYLE_ITALIC);
	StaticText5->SetFont(StaticText5Font);
	FlexGridSizer1->Add(StaticText5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer7->AddGrowableRow(0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer7->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	HyperlinkCtrl1->SetToolTip(_("Display help about this window"));
	FlexGridSizer7->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer7, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer5->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer5->Add(AnnulerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_RADIOBUTTON1,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&EditLink::OnOnlyEventsCheckSelect);
	Connect(ID_RADIOBUTTON2,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&EditLink::OnOnlyEventsCheckSelect);
	Connect(ID_TEXTCTRL2,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLink::OnStartEditText);
	Connect(ID_TEXTCTRL3,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLink::OnEndEditText);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&EditLink::OnAideBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditLink::OnOkBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditLink::OnAnnulerBtClick);
	//*)

	linkedNameEdit->ChangeValue(editedEvent.GetTarget());
	if ( !editedEvent.IncludeAllEvents() )
	{
	    OnlyEventsCheck->SetValue(true);
	    StartEdit->ChangeValue(gd::String::From(editedEvent.GetIncludeStart()+1));
	    EndEdit->ChangeValue(gd::String::From(editedEvent.GetIncludeEnd()+1));
	}

	for (std::size_t i = 0;i<game.GetExternalEventsCount();++i)
        linkedNameEdit->Append(game.GetExternalEvents(i).GetName());

    for (std::size_t i = 0;i<game.GetLayoutsCount();++i)
    	linkedNameEdit->Append(game.GetLayout(i).GetName());
}

EditLink::~EditLink()
{
	//(*Destroy(EditLink)
	//*)
}


void EditLink::OnAideBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/link_events");
}

/**
 * Cancel changes
 */
void EditLink::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

/**
 * Apply changes
 */
void EditLink::OnOkBtClick(wxCommandEvent& event)
{
    editedEvent.SetTarget(linkedNameEdit->GetValue());
    if ( AllEventsCheck->GetValue() == true )
        editedEvent.SetIncludeAllEvents(true);
    else
    {
        editedEvent.SetIncludeAllEvents(false);
        editedEvent.SetIncludeStartAndEnd(
        	gd::String(StartEdit->GetValue()).To<std::size_t>() - 1,
        	gd::String(EndEdit->GetValue()).To<std::size_t>() - 1);
    }
    EndModal(1);
}

void EditLink::OnStartEditText(wxCommandEvent& event)
{
    OnlyEventsCheck->SetValue(true);
}
void EditLink::OnEndEditText(wxCommandEvent& event)
{
    OnlyEventsCheck->SetValue(true);
}

void EditLink::OnOnlyEventsCheckSelect(wxCommandEvent& event)
{
    StaticText5->Show(OnlyEventsCheck->GetValue());
}

}
#endif
