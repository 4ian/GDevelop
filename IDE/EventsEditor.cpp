#include "EventsEditor.h"

//(*InternalHeaders(EventsEditor)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/MainEditorCommand.h"
#include "GDL/Event.h"

//(*IdInit(EventsEditor)
const long EventsEditor::ID_PANEL1 = wxNewId();
const long EventsEditor::ID_SCROLLBAR1 = wxNewId();
const long EventsEditor::ID_SCROLLBAR2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EventsEditor,wxPanel)
	//(*EventTable(EventsEditor)
	//*)
END_EVENT_TABLE()

EventsEditor::EventsEditor(wxWindow* parent, Game & game_, Scene & scene_, vector < BaseEventSPtr > * events_, MainEditorCommand & mainEditorCommand_ ) :
    game(game_),
    scene(scene_),
    events(events_),
    mainEditorCommand(mainEditorCommand_)
{
	//(*Initialize(EventsEditor)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	eventsPanel = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	eventsPanel->SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer1->Add(eventsPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	ScrollBar1 = new wxScrollBar(this, ID_SCROLLBAR1, wxDefaultPosition, wxDefaultSize, wxSB_VERTICAL, wxDefaultValidator, _T("ID_SCROLLBAR1"));
	ScrollBar1->SetScrollbar(0, 1, 10, 1);
	FlexGridSizer1->Add(ScrollBar1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	ScrollBar2 = new wxScrollBar(this, ID_SCROLLBAR2, wxDefaultPosition, wxDefaultSize, wxSB_HORIZONTAL, wxDefaultValidator, _T("ID_SCROLLBAR2"));
	ScrollBar2->SetScrollbar(0, 1, 10, 1);
	FlexGridSizer1->Add(ScrollBar2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	//*)
}

EventsEditor::~EventsEditor()
{
	//(*Destroy(EventsEditor)
	//*)
}

