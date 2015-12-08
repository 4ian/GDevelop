/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#include "SearchEvents.h"

//(*InternalHeaders(SearchEvents)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <string>
#include <vector>
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/Events/EventsRefactorer.h"
#include "EventsEditor.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorSelection.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorItemsAreas.h"
#include "GDCore/Tools/Localization.h"

using namespace std;

//(*IdInit(SearchEvents)
const long SearchEvents::ID_STATICTEXT1 = wxNewId();
const long SearchEvents::ID_TEXTCTRL1 = wxNewId();
const long SearchEvents::ID_STATICTEXT4 = wxNewId();
const long SearchEvents::ID_CHECKBOX6 = wxNewId();
const long SearchEvents::ID_CHECKBOX1 = wxNewId();
const long SearchEvents::ID_CHECKBOX2 = wxNewId();
const long SearchEvents::ID_STATICBITMAP2 = wxNewId();
const long SearchEvents::ID_HYPERLINKCTRL1 = wxNewId();
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
const long SearchEvents::ID_STATICBITMAP1 = wxNewId();
const long SearchEvents::ID_HYPERLINKCTRL2 = wxNewId();
const long SearchEvents::ID_BUTTON4 = wxNewId();
const long SearchEvents::ID_PANEL2 = wxNewId();
const long SearchEvents::ID_NOTEBOOK1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(SearchEvents,wxDialog)
	//(*EventTable(SearchEvents)
	//*)
END_EVENT_TABLE()

SearchEvents::SearchEvents(EventsEditor * parent_, gd::Project & project_, gd::Layout & layout_, gd::EventsList * events_) :
parent(parent_),
project(project_),
layout(layout_),
events(events_)
{
	//(*Initialize(SearchEvents)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer16;
	wxFlexGridSizer* FlexGridSizer19;
	wxStaticBoxSizer* StaticBoxSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxStaticBoxSizer* StaticBoxSizer3;
	wxFlexGridSizer* FlexGridSizer15;
	wxFlexGridSizer* FlexGridSizer18;
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

	Create(parent, wxID_ANY, _("Search in events"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
	Panel1 = new wxPanel(Notebook1, ID_PANEL1, wxPoint(60,115), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer4->AddGrowableCol(1);
	FlexGridSizer4->AddGrowableRow(0);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Search"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer4->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	searchEdit = new wxTextCtrl(Panel1, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(178,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	searchEdit->SetFocus();
	FlexGridSizer4->Add(searchEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer9->AddGrowableCol(0);
	FlexGridSizer9->AddGrowableRow(0);
	resultsCountTxt = new wxStaticText(Panel1, ID_STATICTEXT4, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer9->Add(resultsCountTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, Panel1, _("Options"));
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	caseCheck = new wxCheckBox(Panel1, ID_CHECKBOX6, _("Match case"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX6"));
	caseCheck->SetValue(false);
	FlexGridSizer7->Add(caseCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, Panel1, _("Where"));
	FlexGridSizer5 = new wxFlexGridSizer(0, 2, 0, 0);
	conditionsCheck = new wxCheckBox(Panel1, ID_CHECKBOX1, _("The conditions"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	conditionsCheck->SetValue(true);
	FlexGridSizer5->Add(conditionsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	actionsCheck = new wxCheckBox(Panel1, ID_CHECKBOX2, _("The actions"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	actionsCheck->SetValue(true);
	FlexGridSizer5->Add(actionsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer15 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer15->AddGrowableCol(0);
	FlexGridSizer8 = new wxFlexGridSizer(0, 4, 0, 0);
	FlexGridSizer8->AddGrowableCol(1);
	FlexGridSizer18 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer18->AddGrowableRow(0);
	StaticBitmap2 = new wxStaticBitmap(Panel1, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer18->Add(StaticBitmap2, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(Panel1, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer18->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8->Add(FlexGridSizer18, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	searchBt = new wxButton(Panel1, ID_BUTTON1, _("Search"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer8->Add(searchBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	nextBt = new wxButton(Panel1, ID_BUTTON2, _("Next"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	nextBt->Disable();
	FlexGridSizer8->Add(nextBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	previousBt = new wxButton(Panel1, ID_BUTTON3, _("Previous"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	previousBt->Disable();
	FlexGridSizer8->Add(previousBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer15->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer15, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
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
	StaticText2 = new wxStaticText(Panel2, ID_STATICTEXT2, _("Replace"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer11->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	searchToReplaceEdit = new wxTextCtrl(Panel2, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(178,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer11->Add(searchToReplaceEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer1->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	FlexGridSizer3->AddGrowableRow(0);
	StaticText3 = new wxStaticText(Panel2, ID_STATICTEXT3, _("by"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer3->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	replaceEdit = new wxTextCtrl(Panel2, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(178,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	FlexGridSizer3->Add(replaceEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer10->Add(BoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer12 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer12->AddGrowableCol(0);
	StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Options"));
	FlexGridSizer13 = new wxFlexGridSizer(0, 1, 0, 0);
	replaceCaseCheck = new wxCheckBox(Panel2, ID_CHECKBOX8, _("Match case"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX8"));
	replaceCaseCheck->SetValue(false);
	FlexGridSizer13->Add(replaceCaseCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer3->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Where"));
	FlexGridSizer14 = new wxFlexGridSizer(0, 1, 0, 0);
	onlySelectedEventCheck = new wxCheckBox(Panel2, ID_CHECKBOX7, _("Only the selected event"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX7"));
	onlySelectedEventCheck->SetValue(false);
	FlexGridSizer14->Add(onlySelectedEventCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	replaceConditionsCheck = new wxCheckBox(Panel2, ID_CHECKBOX9, _("The conditions"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX9"));
	replaceConditionsCheck->SetValue(true);
	FlexGridSizer17->Add(replaceConditionsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	replaceActionsCheck = new wxCheckBox(Panel2, ID_CHECKBOX10, _("The actions"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX10"));
	replaceActionsCheck->SetValue(true);
	FlexGridSizer17->Add(replaceActionsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer14->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer4->Add(FlexGridSizer14, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(StaticBoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer16 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer16->AddGrowableCol(1);
	FlexGridSizer19 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer19->AddGrowableRow(0);
	StaticBitmap1 = new wxStaticBitmap(Panel2, ID_STATICBITMAP1, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer19->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(Panel2, ID_HYPERLINKCTRL2, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL2"));
	HyperlinkCtrl1->SetToolTip(_("Display help about this window"));
	FlexGridSizer19->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer16->Add(FlexGridSizer19, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	replaceBt = new wxButton(Panel2, ID_BUTTON4, _("Replace all"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer16->Add(replaceBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10->Add(FlexGridSizer16, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel2->SetSizer(FlexGridSizer10);
	FlexGridSizer10->Fit(Panel2);
	FlexGridSizer10->SetSizeHints(Panel2);
	Notebook1->AddPage(Panel1, _("Search"), false);
	Notebook1->AddPage(Panel2, _("Replace"), false);
	FlexGridSizer1->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&SearchEvents::OnsearchEditText);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&SearchEvents::OnhelpBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SearchEvents::OnsearchBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SearchEvents::OnnextBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SearchEvents::OnpreviousBtClick);
	Connect(ID_TEXTCTRL2,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&SearchEvents::OnsearchToReplaceEditText);
	Connect(ID_HYPERLINKCTRL2,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&SearchEvents::OnhelpBtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SearchEvents::OnreplaceBtClick);
	Connect(wxEVT_KEY_DOWN,(wxObjectEventFunction)&SearchEvents::OnKeyDown);
	//*)
}

SearchEvents::~SearchEvents()
{
	//(*Destroy(SearchEvents)
	//*)
}

void SearchEvents::OnreplaceBtClick(wxCommandEvent& event)
{
    gd::EventsList eventsToInspect;

    //Check events validity
    if ( !onlySelectedEventCheck->GetValue() && events == NULL ) return;
    if ( onlySelectedEventCheck->GetValue() )
    {
        std::vector < gd::EventItem > selectedEventsInfo = parent->GetSelection().GetAllSelectedEvents();
        for (std::size_t i = 0;i<selectedEventsInfo.size();++i)
        {
            if ( selectedEventsInfo[i].event != std::shared_ptr<gd::BaseEvent>() )
                eventsToInspect.InsertEvent(selectedEventsInfo[i].event);
        }
    }

    gd::EventsRefactorer::ReplaceStringInEvents(project, layout,
                                            onlySelectedEventCheck->GetValue() ? eventsToInspect : *events,
                                            searchToReplaceEdit->GetValue(),
                                            replaceEdit->GetValue(),
                                            replaceCaseCheck->GetValue(),
                                            replaceConditionsCheck->GetValue(),
                                            replaceActionsCheck->GetValue());

    parent->ChangesMadeOnEvents();
    parent->Refresh();
}

void SearchEvents::OnsearchBtClick(wxCommandEvent& event)
{
    if ( events == NULL ) return;

    searchResults = gd::EventsRefactorer::SearchInEvents(project, layout, *events,
                                            searchEdit->GetValue(),
                                            caseCheck->GetValue(),
                                            conditionsCheck->GetValue(),
                                            actionsCheck->GetValue());

    resultsCountTxt->SetLabel(wxString::Format(wxString(_("%i results.")), searchResults.size()));
    nextBt->Enable(true);
    previousBt->Enable(true);
    currentResult = 0;
}

void SearchEvents::OnsearchEditText(wxCommandEvent& event)
{
    searchToReplaceEdit->ChangeValue(searchEdit->GetValue());

    resultsCountTxt->SetLabel("");
    nextBt->Enable(false);
    previousBt->Enable(false);
}

void SearchEvents::OnsearchToReplaceEditText(wxCommandEvent& event)
{
    searchEdit->ChangeValue(searchToReplaceEdit->GetValue());
}

void SearchEvents::OnnextBtClick(wxCommandEvent&)
{
    if ( searchResults.empty() ) return;

    //Iterate over results
    currentResult++;
    if ( currentResult >= searchResults.size()) currentResult = 0;

    //Verify event still exists
    gd::BaseEventSPtr event = searchResults[currentResult].event.lock();
    if ( event == std::shared_ptr<gd::BaseEvent>() ) return;

    parent->GetSelection().ClearSelection(/*Refresh=*/false);
    parent->GetSelection().AddEvent(gd::EventItem(event, searchResults[currentResult].eventsList, searchResults[currentResult].positionInList));

    std::cout << "Scrolling to event " << event.get();
    parent->ScrollToEvent(*event);
}

void SearchEvents::OnpreviousBtClick(wxCommandEvent&)
{
    if ( searchResults.empty() ) return;

    //Iterate over results
    currentResult--;
    if ( currentResult >= searchResults.size()) currentResult = searchResults.size()-1;

    //Verify event still exists
    gd::BaseEventSPtr event = searchResults[currentResult].event.lock();
    if ( event == std::shared_ptr<gd::BaseEvent>() ) return;

    parent->GetSelection().ClearSelection(/*Refresh=*/false);
    parent->GetSelection().AddEvent(gd::EventItem(event, searchResults[currentResult].eventsList, searchResults[currentResult].positionInList));

    std::cout << "Scrolling to event " << event.get();
    parent->ScrollToEvent(*event);
}

void SearchEvents::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/edit_event_find");
}

void SearchEvents::OnKeyDown(wxKeyEvent& event)
{
    wxCommandEvent unusedEvent;

    if ( event.GetKeyCode() == WXK_F3 )
    {
        if ( event.GetModifiers() == wxMOD_SHIFT ) OnpreviousBtClick(unusedEvent);
        else OnnextBtClick(unusedEvent);
    }
}
