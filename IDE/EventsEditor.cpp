/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */
#include "EventsEditor.h"

//(*InternalHeaders(EventsEditor)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/event.h>
#include <iostream>
#include <utility>
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/Event.h"
#include "GDL/MainEditorCommand.h"
#include "GDL/EventsEditorItemsAreas.h"
#include "GDL/EventsEditorSelection.h"
#include "GDL/EventsRenderingHelper.h"

#include <SFML/System.hpp>

using namespace std;

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
    mainEditorCommand(mainEditorCommand_),
    conditionColumnWidth(450),
    foldBmp("res/fold.png", wxBITMAP_TYPE_ANY),
    unfoldBmp("res/unfold.png", wxBITMAP_TYPE_ANY),
    selection(refreshCallback),
    ctrlKeyDown(false),
    refreshCallback(this)
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
	scrollBar = new wxScrollBar(this, ID_SCROLLBAR1, wxDefaultPosition, wxDefaultSize, wxSB_VERTICAL, wxDefaultValidator, _T("ID_SCROLLBAR1"));
	scrollBar->SetScrollbar(0, 1, 10, 1);
	FlexGridSizer1->Add(scrollBar, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	ScrollBar2 = new wxScrollBar(this, ID_SCROLLBAR2, wxDefaultPosition, wxDefaultSize, wxSB_HORIZONTAL, wxDefaultValidator, _T("ID_SCROLLBAR2"));
	ScrollBar2->SetScrollbar(0, 1, 10, 1);
	FlexGridSizer1->Add(ScrollBar2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	eventsPanel->Connect(wxEVT_PAINT,(wxObjectEventFunction)&EventsEditor::OneventsPanelPaint,0,this);
	eventsPanel->Connect(wxEVT_ERASE_BACKGROUND,(wxObjectEventFunction)&EventsEditor::OneventsPanelEraseBackground,0,this);
	eventsPanel->Connect(wxEVT_KEY_DOWN,(wxObjectEventFunction)&EventsEditor::OneventsPanelKeyDown,0,this);
	eventsPanel->Connect(wxEVT_KEY_UP,(wxObjectEventFunction)&EventsEditor::OneventsPanelKeyUp,0,this);
	eventsPanel->Connect(wxEVT_LEFT_DOWN,(wxObjectEventFunction)&EventsEditor::OneventsPanelLeftDown,0,this);
	eventsPanel->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&EventsEditor::OneventsPanelLeftUp,0,this);
	eventsPanel->Connect(wxEVT_MOTION,(wxObjectEventFunction)&EventsEditor::OneventsPanelMouseMove,0,this);
	eventsPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EventsEditor::OnResize,0,this);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EventsEditor::OnscrollBarScroll);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_THUMBTRACK,(wxObjectEventFunction)&EventsEditor::OnscrollBarScroll);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EventsEditor::OnscrollBarScroll);
	Connect(wxEVT_KEY_DOWN,(wxObjectEventFunction)&EventsEditor::OneventsPanelKeyDown);
	Connect(wxEVT_KEY_UP,(wxObjectEventFunction)&EventsEditor::OneventsPanelKeyUp);
	//*)

    RecomputeAllEventsWidth(*events); //Recompute all widths
}

EventsEditor::~EventsEditor()
{
	//(*Destroy(EventsEditor)
	//*)
}

void EventsEditor::CreateRibbonPage(wxRibbonPage * page)
{

}

void InternalEventsEditorRefreshCallbacks::Refresh()
{
    editor->Refresh();
}
void EventsEditor::Refresh()
{
    eventsPanel->Refresh();
    eventsPanel->Update(); //Immediately
}

/**
 * Mark all events as must be redraw
 */
void EventsEditor::RecomputeAllEventsWidth(vector < BaseEventSPtr > & eventsToRefresh)
{
    vector<BaseEventSPtr>::iterator e = eventsToRefresh.begin();
    vector<BaseEventSPtr>::const_iterator end = eventsToRefresh.end();

    for(;e != end;++e)
    {
        (*e)->eventHeightNeedUpdate = true;

        if ( (*e)->CanHaveSubEvents() )
            RecomputeAllEventsWidth((*e)->GetSubEvents());
    }
}

void EventsEditor::OnResize(wxSizeEvent& event)
{
    RecomputeAllEventsWidth(*events); //Recompute all widths
    Refresh();
}

void EventsEditor::OneventsPanelPaint(wxPaintEvent& event)
{
    sf::Clock timer;

    //Prepare dc and background
    wxBufferedPaintDC dc(eventsPanel);
    dc.SetPen(wxPen(wxColour(234, 234, 234)));
    dc.SetBrush(wxBrush(wxColour(234, 234, 234)));
    dc.DrawRectangle(0,0,eventsPanel->GetSize().x,eventsPanel->GetSize().y);

    //Clear selection areas
    itemsAreas.Clear();

    unsigned int totalHeight = DrawEvents(dc, *events, 20, -scrollBar->GetThumbPosition());

    scrollBar->SetRange(totalHeight);
    scrollBar->SetPageSize(eventsPanel->GetSize().y);
    scrollBar->SetThumbSize(eventsPanel->GetSize().y);

    cout << endl <<  "DrawTime :" << timer.GetElapsedTime() << endl;
}

unsigned int EventsEditor::DrawEvents(wxDC & dc, std::vector < boost::shared_ptr< BaseEvent > > & events, int x, int y )
{
    int originalYPosition = y;
    for (unsigned int i = 0;i<events.size();++i)
    {
        EventsRenderingHelper::GetInstance()->SetConditionsColumnWidth(conditionColumnWidth-x);
        unsigned int width = eventsPanel->GetSize().x-x > 0 ? eventsPanel->GetSize().x-x : 1;
        unsigned int height = events[i]->GetRenderedHeight(width);

        if( !(y+static_cast<int>(height) < 0 || y > eventsPanel->GetSize().y) ) //Render only if needed
        {
            //Event drawing :
            EventItem eventAccessor(events[i], &events, i);

            bool drawDragTarget = false;
            if ( selection.EventHighlighted(eventAccessor) ) //Highlight if needed
            {
                dc.SetPen(wxPen(wxColour(228, 228, 238)));
                dc.SetBrush(wxBrush(wxColour(228, 228, 238)));
                dc.DrawRectangle(0,y,eventsPanel->GetSize().x,height);

                if ( selection.IsDraggingEvent() )
                    drawDragTarget = true;//Draw drag target, but after
            }

            if ( selection.EventSelected(eventAccessor) ) //Selection rectangle if needed
            {
                dc.SetPen(wxPen(wxColour(245, 231, 189)));
                dc.SetBrush(wxBrush(wxColour(251, 235, 189)));
                dc.DrawRectangle(0,y,eventsPanel->GetSize().x,height);
            }

            //Event rendering
            events[i]->Render(dc, x, y, width, itemsAreas, selection);

            if ( drawDragTarget )
            {
                dc.SetPen(wxPen(wxColour(0, 0, 0)));
                dc.SetBrush(wxBrush(wxColour(0, 0, 0)));
                dc.DrawRectangle(x+2,y,eventsPanel->GetSize().x-x-2,2);
            }

            //Registering event in items which are displayed
            wxRect eventArea(0,y,eventsPanel->GetSize().x,height);
            itemsAreas.AddEventArea( eventArea, eventAccessor );
        }

        y += height;

        //Folding and sub events
        if ( events[i]->CanHaveSubEvents() && !events[i]->GetSubEvents().empty())
        {
            FoldingItem foldingItem(events[i].get());

            if ( !events[i]->folded )
            {
                dc.DrawBitmap(foldBmp, x-5-foldBmp.GetWidth(), y-foldBmp.GetHeight()-2, true /*Use mask*/ );
                itemsAreas.AddFoldingItem(wxRect(x-5-foldBmp.GetWidth(), y-foldBmp.GetHeight()-2, foldBmp.GetWidth(), foldBmp.GetHeight()), foldingItem);

                //Draw sub events
                y += DrawEvents(dc, events[i]->GetSubEvents(), x+24, y);
            }
            else
            {
                dc.DrawBitmap(unfoldBmp, x-5-unfoldBmp.GetWidth(), y-unfoldBmp.GetHeight()-2, true /*Use mask*/ );
                itemsAreas.AddFoldingItem(wxRect(x-5-unfoldBmp.GetWidth(), y-unfoldBmp.GetHeight()-2, unfoldBmp.GetWidth(), unfoldBmp.GetHeight()), foldingItem);

                dc.SetPen(wxPen(wxColour(0,0,0)));
                dc.DrawLine(x-5-unfoldBmp.GetWidth(), y-2, eventsPanel->GetSize().x, y-2);

                y += 2;
            }
        }
    }

    return y-originalYPosition;
}

void EventsEditor::OneventsPanelLeftUp(wxMouseEvent& event)
{
    selection.EndDragEvent();
    selection.EndDragInstruction();
    if ( itemsAreas.IsOnInstruction(event.GetX(), event.GetY()) )
    {
        if ( !ctrlKeyDown ) selection.ClearSelection();
        selection.AddInstruction(itemsAreas.GetInstructionAt(event.GetX(), event.GetY()));
    }
    else if ( itemsAreas.IsOnFoldingItem(event.GetX(), event.GetY()) )
    {
        if ( !ctrlKeyDown ) selection.ClearSelection();
        BaseEvent * eventToFold = itemsAreas.GetFoldingItemAt(event.GetX(), event.GetY()).event;
        if ( eventToFold != NULL )
        {
            eventToFold->folded = !eventToFold->folded;
            Refresh();
        }
        else std::cout << "Bad fold item clicked!" << std::endl;
    }
    else if ( itemsAreas.IsOnEvent(event.GetX(), event.GetY()) )
    {
        if ( !ctrlKeyDown ) selection.ClearSelection();
        selection.AddEvent(itemsAreas.GetEventAt(event.GetX(), event.GetY()));
    }
}
void EventsEditor::OneventsPanelLeftDown(wxMouseEvent& event)
{
    eventsPanel->SetFocusIgnoringChildren();

    if ( itemsAreas.IsOnInstruction(event.GetX(), event.GetY()) && selection.InstructionSelected(itemsAreas.GetInstructionAt(event.GetX(), event.GetY())))
        selection.BeginDragInstruction();
    else if ( itemsAreas.IsOnEvent(event.GetX(), event.GetY()) && selection.EventSelected(itemsAreas.GetEventAt(event.GetX(), event.GetY())))
        selection.BeginDragEvent();
}

void EventsEditor::OneventsPanelMouseMove(wxMouseEvent& event)
{
    eventsPanel->SetFocusIgnoringChildren();

    if ( itemsAreas.IsOnInstruction(event.GetX(), event.GetY()) )
    {
        selection.SetHighlighted(itemsAreas.GetInstructionAt(event.GetX(), event.GetY()));
        selection.SetHighlighted(itemsAreas.GetEventAt(event.GetX(), event.GetY()));
    }
    else if ( itemsAreas.IsOnEvent(event.GetX(), event.GetY()) )
    {
        InstructionItem dummy;
        selection.SetHighlighted(dummy);
        selection.SetHighlighted(itemsAreas.GetEventAt(event.GetX(), event.GetY()));
    }
}


/**
 * Manage keyboard input
 */
void EventsEditor::OneventsPanelKeyDown(wxKeyEvent& event)
{
    if ( event.GetKeyCode() == WXK_CONTROL )
    {
        cout << "CtrlDown";
        ctrlKeyDown = true;
    }
}

/**
 * Manage keyboard input
 */
void EventsEditor::OneventsPanelKeyUp(wxKeyEvent& event)
{
    if ( event.GetKeyCode() == WXK_CONTROL )
    {
        cout << "CtrlUP";
        ctrlKeyDown = false;
    }
}


void EventsEditor::ConnectEvents()
{

}

void EventsEditor::OneventsPanelEraseBackground(wxEraseEvent& event)
{
    //Prevent flickering
}

void EventsEditor::OnscrollBarScroll(wxScrollEvent& event)
{
    Refresh();
}
