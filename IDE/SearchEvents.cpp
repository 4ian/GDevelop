#include "SearchEvents.h"

//(*InternalHeaders(SearchEvents)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <string>
#include <vector>
#include "GDL/Event.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "EventsRefactorer.h"
#include "EditorEvents.h"

using namespace std;

//(*IdInit(SearchEvents)
const long SearchEvents::ID_STATICTEXT1 = wxNewId();
const long SearchEvents::ID_TEXTCTRL1 = wxNewId();
const long SearchEvents::ID_CHECKBOX5 = wxNewId();
const long SearchEvents::ID_CHECKBOX6 = wxNewId();
const long SearchEvents::ID_CHECKBOX1 = wxNewId();
const long SearchEvents::ID_CHECKBOX2 = wxNewId();
const long SearchEvents::ID_CHECKBOX3 = wxNewId();
const long SearchEvents::ID_CHECKBOX4 = wxNewId();
const long SearchEvents::ID_LISTCTRL1 = wxNewId();
const long SearchEvents::ID_BUTTON1 = wxNewId();
const long SearchEvents::ID_BUTTON2 = wxNewId();
const long SearchEvents::ID_BUTTON3 = wxNewId();
const long SearchEvents::ID_PANEL1 = wxNewId();
const long SearchEvents::ID_STATICTEXT2 = wxNewId();
const long SearchEvents::ID_TEXTCTRL2 = wxNewId();
const long SearchEvents::ID_STATICTEXT3 = wxNewId();
const long SearchEvents::ID_TEXTCTRL3 = wxNewId();
const long SearchEvents::ID_CHECKBOX8 = wxNewId();
const long SearchEvents::ID_CHECKBOX7 = wxNewId();
const long SearchEvents::ID_CHECKBOX9 = wxNewId();
const long SearchEvents::ID_CHECKBOX10 = wxNewId();
const long SearchEvents::ID_BUTTON4 = wxNewId();
const long SearchEvents::ID_PANEL2 = wxNewId();
const long SearchEvents::ID_NOTEBOOK1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(SearchEvents,wxDialog)
	//(*EventTable(SearchEvents)
	//*)
END_EVENT_TABLE()

SearchEvents::SearchEvents(EditorEvents * parent_, Game & game_, Scene & scene_, vector < BaseEventSPtr > * events_) :
parent(parent_),
game(game_),
scene(scene_),
events(events_)
{
	//(*Initialize(SearchEvents)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer16;
	wxStaticBoxSizer* StaticBoxSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxStaticBoxSizer* StaticBoxSizer3;
	wxFlexGridSizer* FlexGridSizer15;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer14;
	wxBoxSizer* BoxSizer1;
	wxFlexGridSizer* FlexGridSizer13;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Chercher dans les évènements"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxSize(491,326), 0, _T("ID_NOTEBOOK1"));
	Panel1 = new wxPanel(Notebook1, ID_PANEL1, wxPoint(60,115), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer4->AddGrowableCol(1);
	FlexGridSizer4->AddGrowableRow(0);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Rechercher"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer4->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	searchEdit = new wxTextCtrl(Panel1, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(178,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer4->Add(searchEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, Panel1, _("Options"));
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	CheckBox1 = new wxCheckBox(Panel1, ID_CHECKBOX5, _("Chercher uniquement dans les paramètres"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX5"));
	CheckBox1->SetValue(false);
	FlexGridSizer7->Add(CheckBox1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	CheckBox2 = new wxCheckBox(Panel1, ID_CHECKBOX6, _("Prendre en compte la casse"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX6"));
	CheckBox2->SetValue(false);
	FlexGridSizer7->Add(CheckBox2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, Panel1, _("Où"));
	FlexGridSizer5 = new wxFlexGridSizer(0, 2, 0, 0);
	conditionsCheck = new wxCheckBox(Panel1, ID_CHECKBOX1, _("Les conditions"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	conditionsCheck->SetValue(true);
	FlexGridSizer5->Add(conditionsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	actionsCheck = new wxCheckBox(Panel1, ID_CHECKBOX2, _("Les actions"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	actionsCheck->SetValue(true);
	FlexGridSizer5->Add(actionsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	commentsCheck = new wxCheckBox(Panel1, ID_CHECKBOX3, _("Les commentaires"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX3"));
	commentsCheck->SetValue(true);
	FlexGridSizer5->Add(commentsCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	linksCheck = new wxCheckBox(Panel1, ID_CHECKBOX4, _("Les liens"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX4"));
	linksCheck->SetValue(true);
	FlexGridSizer5->Add(linksCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer9->AddGrowableCol(0);
	FlexGridSizer9->AddGrowableRow(0);
	ListCtrl1 = new wxListCtrl(Panel1, ID_LISTCTRL1, wxDefaultPosition, wxSize(455,125), wxLC_REPORT, wxDefaultValidator, _T("ID_LISTCTRL1"));
	FlexGridSizer9->Add(ListCtrl1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
	searchBt = new wxButton(Panel1, ID_BUTTON1, _("Chercher"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer8->Add(searchBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	Button1 = new wxButton(Panel1, ID_BUTTON2, _("Suivant"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer8->Add(Button1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Button2 = new wxButton(Panel1, ID_BUTTON3, _("Précédent"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer8->Add(Button2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel1->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(Panel1);
	FlexGridSizer2->SetSizeHints(Panel1);
	Panel2 = new wxPanel(Notebook1, ID_PANEL2, wxPoint(70,6), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer10->AddGrowableCol(0);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer11->AddGrowableCol(1);
	FlexGridSizer11->AddGrowableRow(0);
	StaticText2 = new wxStaticText(Panel2, ID_STATICTEXT2, _("Remplacer"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer11->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	searchToReplaceEdit = new wxTextCtrl(Panel2, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(178,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer11->Add(searchToReplaceEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer1->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	FlexGridSizer3->AddGrowableRow(0);
	StaticText3 = new wxStaticText(Panel2, ID_STATICTEXT3, _("par"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer3->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	replaceEdit = new wxTextCtrl(Panel2, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(178,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	FlexGridSizer3->Add(replaceEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer10->Add(BoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer12 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer12->AddGrowableCol(0);
	StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Options"));
	FlexGridSizer13 = new wxFlexGridSizer(0, 1, 0, 0);
	replaceCaseCheck = new wxCheckBox(Panel2, ID_CHECKBOX8, _("Prendre en compte la casse"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX8"));
	replaceCaseCheck->SetValue(false);
	FlexGridSizer13->Add(replaceCaseCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer3->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Où"));
	FlexGridSizer14 = new wxFlexGridSizer(0, 1, 0, 0);
	onlySelectedEventCheck = new wxCheckBox(Panel2, ID_CHECKBOX7, _("Seulement l\'évènement selectionné"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX7"));
	onlySelectedEventCheck->SetValue(false);
	FlexGridSizer14->Add(onlySelectedEventCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	replaceConditionsCheck = new wxCheckBox(Panel2, ID_CHECKBOX9, _("Les conditions"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX9"));
	replaceConditionsCheck->SetValue(true);
	FlexGridSizer17->Add(replaceConditionsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	replaceActionsCheck = new wxCheckBox(Panel2, ID_CHECKBOX10, _("Les actions"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX10"));
	replaceActionsCheck->SetValue(true);
	FlexGridSizer17->Add(replaceActionsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer14->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer4->Add(FlexGridSizer14, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(StaticBoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer15 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer15->AddGrowableCol(0);
	FlexGridSizer15->AddGrowableRow(0);
	FlexGridSizer10->Add(FlexGridSizer15, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer16 = new wxFlexGridSizer(0, 3, 0, 0);
	replaceBt = new wxButton(Panel2, ID_BUTTON4, _("Remplacer"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer16->Add(replaceBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10->Add(FlexGridSizer16, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel2->SetSizer(FlexGridSizer10);
	FlexGridSizer10->Fit(Panel2);
	FlexGridSizer10->SetSizeHints(Panel2);
	Notebook1->AddPage(Panel1, _("Chercher"), false);
	Notebook1->AddPage(Panel2, _("Remplacer"), false);
	FlexGridSizer1->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SearchEvents::OnreplaceBtClick);
	//*)
}

SearchEvents::~SearchEvents()
{
	//(*Destroy(SearchEvents)
	//*)
}

void SearchEvents::OnreplaceBtClick(wxCommandEvent& event)
{
    vector < BaseEventSPtr > eventsToInspect;

    //Check events validity
    if ( !onlySelectedEventCheck->GetValue() && events == NULL ) return;
    if ( onlySelectedEventCheck->GetValue() )
    {
        if ( parent->GetLastSelectedEvent() == boost::shared_ptr<BaseEvent>() ) return;

        eventsToInspect.push_back(parent->GetLastSelectedEvent()); //Use an intermediate vector for single events.
    }

    EventsRefactorer::ReplaceStringInEvents(game, scene,
                                            onlySelectedEventCheck->GetValue() ? eventsToInspect : *events,
                                            string(searchToReplaceEdit->GetValue().mb_str()),
                                            string(replaceEdit->GetValue().mb_str()),
                                            replaceCaseCheck->GetValue(),
                                            replaceConditionsCheck->GetValue(),
                                            replaceActionsCheck->GetValue());

    parent->ChangesMadeOnEvents();
    parent->ForceRefresh();
}
