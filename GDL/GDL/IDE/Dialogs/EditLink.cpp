#if defined(GD_IDE_ONLY)
#include "EditLink.h"

//(*InternalHeaders(EditLink)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <sstream>
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDL/CommonTools.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include <wx/help.h>

//(*IdInit(EditLink)
const long EditLink::ID_STATICBITMAP3 = wxNewId();
const long EditLink::ID_STATICTEXT3 = wxNewId();
const long EditLink::ID_PANEL1 = wxNewId();
const long EditLink::ID_STATICLINE2 = wxNewId();
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
const long EditLink::ID_BUTTON1 = wxNewId();
const long EditLink::ID_BUTTON2 = wxNewId();
const long EditLink::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditLink,wxDialog)
	//(*EventTable(EditLink)
	//*)
END_EVENT_TABLE()

EditLink::EditLink(wxWindow* parent, LinkEvent & event, const Game & game_) :
editedEvent(event),
game(game_)
{
	//(*Initialize(EditLink)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Créer un lien vers une autre scène"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/link48.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(Panel1, ID_STATICTEXT3, _("Un lien permet d\'insérer les évènements d\'une autre \nscène ou des évènements externes à celle ci."), wxDefaultPosition, wxSize(253,30), wxALIGN_CENTRE, _T("ID_STATICTEXT3"));
	FlexGridSizer6->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Lien vers la scène/évènements externes :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	linkedNameEdit = new wxComboBox(this, ID_COMBOBOX1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, 0, 0, wxDefaultValidator, _T("ID_COMBOBOX1"));
	FlexGridSizer3->Add(linkedNameEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Inclure"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	AllEventsCheck = new wxRadioButton(this, ID_RADIOBUTTON1, _("Tous les évènements de la scène"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
	AllEventsCheck->SetValue(true);
	FlexGridSizer2->Add(AllEventsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 5, 0, 0);
	OnlyEventsCheck = new wxRadioButton(this, ID_RADIOBUTTON2, _("Seulement les évènements"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON2"));
	FlexGridSizer4->Add(OnlyEventsCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StartEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(35,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	StartEdit->SetToolTip(_("Numéro de l\'évènement de départ"));
	FlexGridSizer4->Add(StartEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("à"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer4->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	EndEdit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(35,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	EndEdit->SetToolTip(_("Numéro de l\'évènement de fin"));
	FlexGridSizer4->Add(EndEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("(inclus)"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer4->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT5, _("Pensez à mettre à jour les numéros des évènements du lien\nsi vous supprimez/ajoutez des évènements dans la scène liée."), wxDefaultPosition, wxSize(303,30), 0, _T("ID_STATICTEXT5"));
	wxFont StaticText5Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText5->SetFont(StaticText5Font);
	FlexGridSizer1->Add(StaticText5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer5->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer5->Add(AnnulerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	AideBt = new wxButton(this, ID_BUTTON3, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer5->Add(AideBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TEXTCTRL2,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLink::OnStartEditText);
	Connect(ID_TEXTCTRL3,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditLink::OnEndEditText);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditLink::OnOkBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditLink::OnAnnulerBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditLink::OnAideBtClick);
	//*)

	linkedNameEdit->ChangeValue(editedEvent.GetTarget());
	if ( !editedEvent.IncludeAllEvents() )
	{
	    OnlyEventsCheck->SetValue(true);
	    StartEdit->ChangeValue(ToString(editedEvent.GetIncludeStart()+1));
	    EndEdit->ChangeValue(ToString(editedEvent.GetIncludeEnd()+1));
	}

	for (unsigned int i = 0;i<game.GetExternalEventsCount();++i)
        linkedNameEdit->Append(game.GetExternalEvents(i).GetName());

    for (unsigned int i = 0;i<game.GetLayoutCount();++i)
    	linkedNameEdit->Append(game.GetLayout(i).GetName());
}

EditLink::~EditLink()
{
	//(*Destroy(EditLink)
	//*)
}


void EditLink::OnAideBtClick(wxCommandEvent& event)
{
    if ( GDpriv::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_FRENCH )
        gd::HelpFileAccess::GetInstance()->DisplaySection(150);
    else
        gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/link_events"));
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
    editedEvent.SetTarget(ToString(linkedNameEdit->GetValue()));
    if ( AllEventsCheck->GetValue() == true )
        editedEvent.SetIncludeAllEvents(true);
    else
    {
        editedEvent.SetIncludeAllEvents(false);
        editedEvent.SetIncludeStartAndEnd(ToInt(ToString(StartEdit->GetValue()))-1, ToInt(ToString(EndEdit->GetValue()))-1);
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
#endif
