/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#include "EventsEditor.h"

//(*InternalHeaders(EventsEditor)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/event.h>
#include <wx/config.h>
#include <wx/dcbuffer.h>
#include "GDCore/Tools/Log.h"
#include <iostream>
#include <utility>
#include <algorithm>
#include "GDCore/Events/Event.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorItemsAreas.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorSelection.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Events/EventsRefactorer.h"
#include "GDCore/IDE/EventsChangesNotifier.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "GDCore/IDE/Dialogs/EventStoreDialog.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCpp/IDE/Dialogs/CppLayoutPreviewer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/IDE/wxTools/GUIContentScaleFactor.h"
#include "GDCore/CommonTools.h"
#include "LogFileManager.h"
#include "GDCpp/IDE/Dialogs/ProfileDlg.h"
#include "SearchEvents.h"
#include "InstructionSelectorDialog.h"
#include "GDCore/IDE/Clipboard.h"
#undef CreateEvent //Disable an annoying macro
#undef DrawText //Disable an annoying macro

#include <SFML/System.hpp>

using namespace std;
using namespace gd;

//(*IdInit(EventsEditor)
const long EventsEditor::ID_TEXTCTRL1 = wxNewId();
const long EventsEditor::ID_BITMAPBUTTON1 = wxNewId();
const long EventsEditor::ID_PANEL2 = wxNewId();
const long EventsEditor::ID_STATICBITMAP1 = wxNewId();
const long EventsEditor::ID_STATICTEXT1 = wxNewId();
const long EventsEditor::ID_STATICBITMAP2 = wxNewId();
const long EventsEditor::ID_STATICTEXT2 = wxNewId();
const long EventsEditor::ID_STATICBITMAP3 = wxNewId();
const long EventsEditor::ID_STATICTEXT3 = wxNewId();
const long EventsEditor::ID_PANEL3 = wxNewId();
const long EventsEditor::ID_STATICBITMAP4 = wxNewId();
const long EventsEditor::ID_STATICTEXT4 = wxNewId();
const long EventsEditor::ID_PANEL4 = wxNewId();
const long EventsEditor::ID_PANEL1 = wxNewId();
const long EventsEditor::ID_SCROLLBAR1 = wxNewId();
const long EventsEditor::deleteMenuItem = wxNewId();
const long EventsEditor::toggleActivationMenuItem = wxNewId();
const long EventsEditor::copyMenuItem = wxNewId();
const long EventsEditor::cutMenuItem = wxNewId();
const long EventsEditor::ID_MENUITEM4 = wxNewId();
const long EventsEditor::ID_MENUITEM5 = wxNewId();
const long EventsEditor::ID_MENUITEM6 = wxNewId();
const long EventsEditor::ID_MENUITEM7 = wxNewId();
const long EventsEditor::ID_MENUITEM11 = wxNewId();
const long EventsEditor::ID_MENUITEM12 = wxNewId();
//*)
const long EventsEditor::idRibbonEvent = wxNewId();
const long EventsEditor::idRibbonCom = wxNewId();
const long EventsEditor::idRibbonSubEvent = wxNewId();
const long EventsEditor::idRibbonSomeEvent = wxNewId();
const long EventsEditor::idRibbonDelEvent = wxNewId();
const long EventsEditor::idRibbonUndo = wxNewId();
const long EventsEditor::idRibbonRedo = wxNewId();
const long EventsEditor::idRibbonCopy = wxNewId();
const long EventsEditor::idRibbonCut = wxNewId();
const long EventsEditor::idRibbonPaste = wxNewId();
const long EventsEditor::idRibbonEventStore = wxNewId();
const long EventsEditor::idRibbonHelp = wxNewId();
const long EventsEditor::idRibbonProfiling = wxNewId();
const long EventsEditor::idRibbonPlatform = wxNewId();
const long EventsEditor::idSearchReplace = wxNewId();
const long EventsEditor::idRibbonFoldAll = wxNewId();
const long EventsEditor::idRibbonUnFoldAll = wxNewId();

wxRibbonButtonBar * EventsEditor::insertRibbonBar = NULL;
wxRibbonButtonBar * EventsEditor::deleteRibbonBar = NULL;
wxRibbonButtonBar * EventsEditor::clipboardRibbonBar = NULL;
wxRibbonButtonBar * EventsEditor::templateRibbonBar = NULL;
wxRibbonButtonBar * EventsEditor::undoRibbonBar = NULL;

BEGIN_EVENT_TABLE(EventsEditor,wxPanel)
	//(*EventTable(EventsEditor)
	//*)
END_EVENT_TABLE()

EventsEditor::EventsEditor(wxWindow* parent, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_ ) :
	game(game_),
    scene(scene_),
    externalEvents(NULL),
    events(&scene.GetEvents()),
    mainFrameWrapper(mainFrameWrapper_),
    layoutCanvas(NULL),
    selection(refreshCallback),
    refreshCallback(this)
{
	Init(parent);
}

EventsEditor::EventsEditor(wxWindow* parent, gd::Project & game_, gd::Layout & scene_, gd::ExternalEvents & externalEvents_, gd::MainFrameWrapper & mainFrameWrapper_ ) :
	game(game_),
    scene(scene_),
    externalEvents(&externalEvents_),
    events(&externalEvents->GetEvents()),
    mainFrameWrapper(mainFrameWrapper_),
    layoutCanvas(NULL),
    selection(refreshCallback),
    refreshCallback(this)
{
	Init(parent);
}

void EventsEditor::Init(wxWindow* parent)
{
    conditionColumnWidth = 350;
    isResizingColumns = false;
    leftMargin = 20;
    foldBmp = wxBitmap("res/fold.png", wxBITMAP_TYPE_ANY);
    unfoldBmp = wxBitmap("res/unfold.png", wxBITMAP_TYPE_ANY);
    hideContextPanelsLabels = false;
    ctrlKeyDown = false;
    profilingActivated = false;

	//(*Initialize(EventsEditor)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	eventsPanel = new wxControl(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL|wxBORDER_NONE, wxDefaultValidator, _T("ID_PANEL1"));
	eventsPanel->SetBackgroundColour(wxColour(255,255,255));
	liveEditingPanel = new wxPanel(eventsPanel, ID_PANEL2, wxPoint(100,100), wxDefaultSize, wxSIMPLE_BORDER, _T("ID_PANEL2"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	liveEdit = new wxTextCtrl(liveEditingPanel, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(280,21), wxTE_PROCESS_ENTER, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer2->Add(liveEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	parameterEditBt = new wxBitmapButton(liveEditingPanel, ID_BITMAPBUTTON1, gd::SkinHelper::GetIcon("edit", 16), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON1"));
	FlexGridSizer2->Add(parameterEditBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	liveEditingPanel->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(liveEditingPanel);
	FlexGridSizer2->SetSizeHints(liveEditingPanel);
	eventContextPanel = new wxPanel(eventsPanel, ID_PANEL3, wxPoint(136,24), wxSize(224,40), wxNO_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 7, 0, 0);
	addEventIcon = new wxStaticBitmap(eventContextPanel, ID_STATICBITMAP1, gd::SkinHelper::GetIcon("add_event", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
	addEventIcon->SetToolTip(_("Add an event"));
	FlexGridSizer3->Add(addEventIcon, 1, wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	addEventBt = new wxStaticText(eventContextPanel, ID_STATICTEXT1, _("Add an event"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(addEventBt, 0, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 2);
	addSubEventIcon = new wxStaticBitmap(eventContextPanel, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("add_subevent", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	addSubEventIcon->SetToolTip(_("Add a sub event"));
	FlexGridSizer3->Add(addSubEventIcon, 1, wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	addSubEventBt = new wxStaticText(eventContextPanel, ID_STATICTEXT2, _("A sub event"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer3->Add(addSubEventBt, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
	addMoreIcon = new wxStaticBitmap(eventContextPanel, ID_STATICBITMAP3, gd::SkinHelper::GetIcon("add", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	addMoreIcon->SetToolTip(_("Another event type"));
	FlexGridSizer3->Add(addMoreIcon, 1, wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	addMoreBt = new wxStaticText(eventContextPanel, ID_STATICTEXT3, _("Other"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer3->Add(addMoreBt, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
	eventContextPanel->SetSizer(FlexGridSizer3);
	FlexGridSizer3->SetSizeHints(eventContextPanel);
	listContextPanel = new wxPanel(eventsPanel, ID_PANEL4, wxPoint(136,50), wxSize(224,40), wxNO_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL4"));
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	addInstrIcon = new wxStaticBitmap(listContextPanel, ID_STATICBITMAP4, gd::SkinHelper::GetIcon("add", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP4"));
	addInstrIcon->SetToolTip(_("Add a condition"));
	FlexGridSizer4->Add(addInstrIcon, 1, wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	addInstrBt = new wxStaticText(listContextPanel, ID_STATICTEXT4, _("Add a condition"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer4->Add(addInstrBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
	listContextPanel->SetSizer(FlexGridSizer4);
	FlexGridSizer4->SetSizeHints(listContextPanel);
	FlexGridSizer1->Add(eventsPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	scrollBar = new wxScrollBar(this, ID_SCROLLBAR1, wxDefaultPosition, wxDefaultSize, wxSB_VERTICAL, wxDefaultValidator, _T("ID_SCROLLBAR1"));
	scrollBar->SetScrollbar(0, 1, 10, 1);
	FlexGridSizer1->Add(scrollBar, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	deleteMenu = new wxMenuItem((&eventsContextMenu), deleteMenuItem, _("Delete\tDEL"), wxEmptyString, wxITEM_NORMAL);
	deleteMenu->SetBitmap(gd::SkinHelper::GetIcon("delete", 16));
	eventsContextMenu.Append(deleteMenu);
	toggleActivation = new wxMenuItem((&eventsContextMenu), toggleActivationMenuItem, _("De/activate"), wxEmptyString, wxITEM_NORMAL);
	eventsContextMenu.Append(toggleActivation);
	eventsContextMenu.AppendSeparator();
	eventCopyMenu = new wxMenuItem((&eventsContextMenu), copyMenuItem, _("Copy\tCtrl+C"), wxEmptyString, wxITEM_NORMAL);
	eventCopyMenu->SetBitmap(gd::SkinHelper::GetIcon("copy", 16));
	eventsContextMenu.Append(eventCopyMenu);
	eventCutMenu = new wxMenuItem((&eventsContextMenu), cutMenuItem, _("Cut\tCtrl+X"), wxEmptyString, wxITEM_NORMAL);
	eventCutMenu->SetBitmap(gd::SkinHelper::GetIcon("cut", 16));
	eventsContextMenu.Append(eventCutMenu);
	eventPasteMenu = new wxMenuItem((&eventsContextMenu), ID_MENUITEM4, _("Paste\tCtrl+V"), wxEmptyString, wxITEM_NORMAL);
	eventPasteMenu->SetBitmap(gd::SkinHelper::GetIcon("paste", 16));
	eventsContextMenu.Append(eventPasteMenu);
	eventsContextMenu.AppendSeparator();
	undoMenu = new wxMenuItem((&eventsContextMenu), ID_MENUITEM5, _("Undo\tCtrl-Z"), wxEmptyString, wxITEM_NORMAL);
	undoMenu->SetBitmap(gd::SkinHelper::GetIcon("undo", 16));
	eventsContextMenu.Append(undoMenu);
	redoMenu = new wxMenuItem((&eventsContextMenu), ID_MENUITEM6, _("Redo\tCtrl-Y"), wxEmptyString, wxITEM_NORMAL);
	redoMenu->SetBitmap(gd::SkinHelper::GetIcon("redo", 16));
	eventsContextMenu.Append(redoMenu);
	MenuItem1 = new wxMenuItem((&multipleContextMenu), ID_MENUITEM7, _("Delete"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(gd::SkinHelper::GetIcon("delete", 16));
	multipleContextMenu.Append(MenuItem1);
	multipleContextMenu.AppendSeparator();
	MenuItem5 = new wxMenuItem((&multipleContextMenu), ID_MENUITEM11, _("Cancel"), wxEmptyString, wxITEM_NORMAL);
	multipleContextMenu.Append(MenuItem5);
	MenuItem6 = new wxMenuItem((&multipleContextMenu), ID_MENUITEM12, _("Redo"), wxEmptyString, wxITEM_NORMAL);
	multipleContextMenu.Append(MenuItem6);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EventsEditor::OnliveEditText);
	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_ENTER,(wxObjectEventFunction)&EventsEditor::OnliveEditTextEnter);
	Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EventsEditor::OnparameterEditBtClick);
	eventContextPanel->Connect(wxEVT_PAINT,(wxObjectEventFunction)&EventsEditor::OneventContextPanelPaint,0,this);
	eventContextPanel->Connect(wxEVT_ERASE_BACKGROUND,(wxObjectEventFunction)&EventsEditor::OneventContextPanelEraseBackground,0,this);
	listContextPanel->Connect(wxEVT_PAINT,(wxObjectEventFunction)&EventsEditor::OnlistContextPanelPaint,0,this);
	listContextPanel->Connect(wxEVT_ERASE_BACKGROUND,(wxObjectEventFunction)&EventsEditor::OnlistContextPanelEraseBackground,0,this);
	eventsPanel->Connect(wxEVT_PAINT,(wxObjectEventFunction)&EventsEditor::OneventsPanelPaint,0,this);
	eventsPanel->Connect(wxEVT_ERASE_BACKGROUND,(wxObjectEventFunction)&EventsEditor::OneventsPanelEraseBackground,0,this);
	eventsPanel->Connect(wxEVT_KEY_DOWN,(wxObjectEventFunction)&EventsEditor::OneventsPanelKeyDown,0,this);
	eventsPanel->Connect(wxEVT_KEY_UP,(wxObjectEventFunction)&EventsEditor::OneventsPanelKeyUp,0,this);
	eventsPanel->Connect(wxEVT_LEFT_DOWN,(wxObjectEventFunction)&EventsEditor::OneventsPanelLeftDown,0,this);
	eventsPanel->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&EventsEditor::OneventsPanelLeftUp,0,this);
	eventsPanel->Connect(wxEVT_LEFT_DCLICK,(wxObjectEventFunction)&EventsEditor::OneventsPanelLeftDClick,0,this);
	eventsPanel->Connect(wxEVT_RIGHT_UP,(wxObjectEventFunction)&EventsEditor::OneventsPanelRightUp,0,this);
	eventsPanel->Connect(wxEVT_MOTION,(wxObjectEventFunction)&EventsEditor::OneventsPanelMouseMove,0,this);
	eventsPanel->Connect(wxEVT_LEAVE_WINDOW,(wxObjectEventFunction)&EventsEditor::OneventsPanelMouseLeave,0,this);
	eventsPanel->Connect(wxEVT_MOUSEWHEEL,(wxObjectEventFunction)&EventsEditor::OneventsPanelMouseWheel,0,this);
	eventsPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EventsEditor::OnResize,0,this);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EventsEditor::OnscrollBarScroll);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_THUMBTRACK,(wxObjectEventFunction)&EventsEditor::OnscrollBarScroll);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EventsEditor::OnscrollBarScroll);
	Connect(deleteMenuItem,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EventsEditor::OndeleteMenuSelected);
	Connect(toggleActivationMenuItem,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EventsEditor::OntoggleActivationSelected);
	Connect(copyMenuItem,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EventsEditor::OneventCopyMenuSelected);
	Connect(cutMenuItem,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EventsEditor::OneventCutMenuSelected);
	Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EventsEditor::OneventPasteMenuSelected);
	Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EventsEditor::OnundoMenuSelected);
	Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EventsEditor::OnredoMenuSelected);
	Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EventsEditor::OndeleteMenuSelected);
	Connect(ID_MENUITEM11,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EventsEditor::OnundoMenuSelected);
	Connect(ID_MENUITEM12,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EventsEditor::OnredoMenuSelected);
	Connect(wxEVT_KEY_DOWN,(wxObjectEventFunction)&EventsEditor::OneventsPanelKeyDown);
	Connect(wxEVT_KEY_UP,(wxObjectEventFunction)&EventsEditor::OneventsPanelKeyUp);
	//*)

    addEventBt->Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(EventsEditor::OnaddEventIconPnlLeftDown), NULL, this);
    addEventIcon->Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(EventsEditor::OnaddEventIconPnlLeftDown), NULL, this);
    addEventBt->Connect(wxEVT_ENTER_WINDOW, wxMouseEventHandler(EventsEditor::OnaddEventIconPnlMouseEnter), NULL, this);
    addEventIcon->Connect(wxEVT_ENTER_WINDOW, wxMouseEventHandler(EventsEditor::OnaddEventIconPnlMouseEnter), NULL, this);
    addEventBt->Connect(wxEVT_LEAVE_WINDOW, wxMouseEventHandler(EventsEditor::OnaddEventIconPnlMouseLeave), NULL, this);
    addEventIcon->Connect(wxEVT_LEAVE_WINDOW, wxMouseEventHandler(EventsEditor::OnaddEventIconPnlMouseLeave), NULL, this);

    addSubEventBt->Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(EventsEditor::OnaddSubEventIconPnlLeftDown), NULL, this);
    addSubEventIcon->Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(EventsEditor::OnaddSubEventIconPnlLeftDown), NULL, this);
    addSubEventBt->Connect(wxEVT_ENTER_WINDOW, wxMouseEventHandler(EventsEditor::OnaddSubEventIconPnlMouseEnter), NULL, this);
    addSubEventIcon->Connect(wxEVT_ENTER_WINDOW, wxMouseEventHandler(EventsEditor::OnaddSubEventIconPnlMouseEnter), NULL, this);
    addSubEventBt->Connect(wxEVT_LEAVE_WINDOW, wxMouseEventHandler(EventsEditor::OnaddSubEventIconPnlMouseLeave), NULL, this);
    addSubEventIcon->Connect(wxEVT_LEAVE_WINDOW, wxMouseEventHandler(EventsEditor::OnaddSubEventIconPnlMouseLeave), NULL, this);

    addMoreBt->Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(EventsEditor::OnaddMoreIconPnlLeftDown), NULL, this);
    addMoreIcon->Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(EventsEditor::OnaddMoreIconPnlLeftDown), NULL, this);
    addMoreBt->Connect(wxEVT_ENTER_WINDOW, wxMouseEventHandler(EventsEditor::OnaddMoreIconPnlMouseEnter), NULL, this);
    addMoreIcon->Connect(wxEVT_ENTER_WINDOW, wxMouseEventHandler(EventsEditor::OnaddMoreIconPnlMouseEnter), NULL, this);
    addMoreBt->Connect(wxEVT_LEAVE_WINDOW, wxMouseEventHandler(EventsEditor::OnaddMoreIconPnlMouseLeave), NULL, this);
    addMoreIcon->Connect(wxEVT_LEAVE_WINDOW, wxMouseEventHandler(EventsEditor::OnaddMoreIconPnlMouseLeave), NULL, this);

    addInstrBt->Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(EventsEditor::OnaddInstrIconPnlLeftDown), NULL, this);
    addInstrIcon->Connect(wxEVT_LEFT_DOWN, wxMouseEventHandler(EventsEditor::OnaddInstrIconPnlLeftDown), NULL, this);
    addInstrBt->Connect(wxEVT_ENTER_WINDOW, wxMouseEventHandler(EventsEditor::OnaddInstrIconPnlMouseEnter), NULL, this);
    addInstrIcon->Connect(wxEVT_ENTER_WINDOW, wxMouseEventHandler(EventsEditor::OnaddInstrIconPnlMouseEnter), NULL, this);
    addInstrBt->Connect(wxEVT_LEAVE_WINDOW, wxMouseEventHandler(EventsEditor::OnaddInstrIconPnlMouseLeave), NULL, this);
    addInstrIcon->Connect(wxEVT_LEAVE_WINDOW, wxMouseEventHandler(EventsEditor::OnaddInstrIconPnlMouseLeave), NULL, this);

    //Ensure that the eventsPanel is a wxControl: if declared as a wxPanel, it
    //won't be able to catch keyboard input.
    if (dynamic_cast<wxPanel*>(eventsPanel))
    {
    	std::cout << "ERROR: eventsPanel was declared as a wxPanel instead of wxControl! Keyboards shortcut won't work with wxGTK.";
    }

	//Load configuration
	wxConfigBase * config = wxConfigBase::Get();
	conditionColumnWidth = config->ReadDouble("EventsEditor/ConditionColumnWidth", 350);
	hideContextPanelsLabels = config->ReadBool("EventsEditor/HideContextPanelsLabels", false);

	wxFont eventsEditorFont;
	if ( config->Read("EventsEditor/Font", &eventsEditorFont) )
        gd::EventsRenderingHelper::Get()->SetFont(eventsEditorFont);

    //Create platform list
    for (std::size_t i = 0;i<game.GetUsedPlatforms().size();++i)
    {
        long id = wxNewId();
        idForPlatformsMenu[id] = game.GetUsedPlatforms()[i]->GetName();
        platformsMenu.Append(id, _("Edit events using ") + game.GetUsedPlatforms()[i]->GetFullName(),
                             _("Display the events as they are interpreted by the selected platform."), wxITEM_RADIO);
        mainFrameWrapper.GetMainEditor()->Connect(id, wxEVT_COMMAND_MENU_SELECTED, (wxObjectEventFunction)&EventsEditor::OnPlatformSelected, NULL, this);

        platformsMenu.Check(id, false);
        if ( game.GetUsedPlatforms()[i] == &game.GetCurrentPlatform() )
            platformsMenu.Check(id, true);
    }

    RecreateCustomEventsMenu();

    searchDialog = new SearchEvents(this, game, scene, events);

    RecomputeAllEventsWidth(*events); //Recompute all widths
    liveEditingPanel->Show(false);
    liveEdit->SetFont(gd::EventsRenderingHelper::Get()->GetFont());
    liveEditingPanel->Show(false);
    eventContextPanel->Show(false);
    listContextPanel->Show(false);

    if ( hideContextPanelsLabels )
    {
        addEventBt->SetLabel("");
        addSubEventBt->SetLabel("");
        addMoreBt->SetLabel("");
        addInstrBt->SetLabel("");

        eventContextPanel->SetSize(5+16+5+16+5+16+5,eventContextPanel->GetSize().y);
        listContextPanel->SetSize(5+16+5,listContextPanel->GetSize().y);
    }

    latestState = *events;
}

void EventsEditor::RecreateCustomEventsMenu()
{
    //Adding events types
    const vector < std::shared_ptr<gd::PlatformExtension> > extensions = game.GetCurrentPlatform().GetAllPlatformExtensions();

    //Clear the menu
    for (vector < std::pair<long, gd::String> >::iterator idIter = idForEventTypesMenu.begin();
         idIter != idForEventTypesMenu.end();
         ++idIter)
    {
        eventTypesMenu.Destroy(idIter->first);
    }
    idForEventTypesMenu.clear();

    //Insert extension specific events types
	for (std::size_t i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.GetUsedExtensions().begin(),
                  game.GetUsedExtensions().end(),
                  extensions[i]->GetName()) == game.GetUsedExtensions().end() )
            continue;

        //Add each event type provided
	    std::map<gd::String, gd::EventMetadata > allEventsProvidedByExtension = extensions[i]->GetAllEvents();
        for(auto it = allEventsProvidedByExtension.begin(); it != allEventsProvidedByExtension.end(); ++it)
        {
            if (it->second.fullname.empty()) continue;

            //Find an identifier for the menu item
            long id = wxID_ANY;
            for (vector < std::pair<long, gd::String> >::iterator idIter = idForEventTypesMenu.begin();
                 idIter != idForEventTypesMenu.end();
                 ++idIter)
            {
            	if ( idIter->second == it->first )
                    id = idIter->first;
            }
            if ( id == wxID_ANY )
            {
                id = wxNewId();
                idForEventTypesMenu.push_back(std::make_pair(id, it->first));
            }

            wxMenuItem * menuItem = new wxMenuItem(&eventTypesMenu, id, it->second.fullname, it->second.description);
            menuItem->SetBitmap(it->second.GetBitmapIcon());
            eventTypesMenu.Append(menuItem);
            Connect(id,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EventsEditor::OnAddCustomEventFromMenuSelected);
            mainFrameWrapper.GetMainEditor()->Connect(id, wxEVT_COMMAND_MENU_SELECTED, (wxObjectEventFunction)&EventsEditor::OnAddCustomEventFromMenuSelected, NULL, this);
        }
	}

}

EventsEditor::~EventsEditor()
{
	//(*Destroy(EventsEditor)
	//*)
}

void EventsEditor::CreateRibbonPage(wxRibbonPage * page)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    bool hideLabels = false;
    pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Insert"), gd::SkinHelper::GetRibbonIcon("add"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        insertRibbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        insertRibbonBar->AddButton(idRibbonEvent, !hideLabels ? _("Add an event") : gd::String(), gd::SkinHelper::GetRibbonIcon("eventadd"), _("Add a new standard event with conditions and actions"));
        insertRibbonBar->AddButton(idRibbonSubEvent, !hideLabels ? _("Add a sub event") : gd::String(), gd::SkinHelper::GetRibbonIcon("subeventadd"), _("Add a sub event, launched only when the conditions of its parent are fulfilled."));
        insertRibbonBar->AddButton(idRibbonCom, !hideLabels ? _("Add a comment") : gd::String(), gd::SkinHelper::GetRibbonIcon("commentaireadd"), _("Add a comment"));
        insertRibbonBar->AddDropdownButton(idRibbonSomeEvent, !hideLabels ? _("Add...") : gd::String(), gd::SkinHelper::GetRibbonIcon("add"));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("GDevApp.com"), gd::SkinHelper::GetRibbonIcon("template"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        templateRibbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        templateRibbonBar->AddButton(idRibbonEventStore, !hideLabels ? _("Insert from the events store") : gd::String(), gd::SkinHelper::GetRibbonIcon("addtemplate"));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Delete"), gd::SkinHelper::GetRibbonIcon("delete"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        deleteRibbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        deleteRibbonBar->AddButton(idRibbonDelEvent, !hideLabels ? _("Delete the selection") : gd::String(), gd::SkinHelper::GetRibbonIcon("deleteselected"));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("History"), gd::SkinHelper::GetRibbonIcon("undo"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        undoRibbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        undoRibbonBar->AddButton(idRibbonUndo, !hideLabels ? _("Undo") : gd::String(), gd::SkinHelper::GetRibbonIcon("undo"));
        undoRibbonBar->AddButton(idRibbonRedo, !hideLabels ? _("Redo") : gd::String(), gd::SkinHelper::GetRibbonIcon("redo"));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Clipboard"), gd::SkinHelper::GetRibbonIcon("copy"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        clipboardRibbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        clipboardRibbonBar->AddButton(idRibbonCopy, !hideLabels ? _("Copy") : gd::String(), gd::SkinHelper::GetRibbonIcon("copy"));
        clipboardRibbonBar->AddButton(idRibbonCut, !hideLabels ? _("Cut") : gd::String(), gd::SkinHelper::GetRibbonIcon("cut"));
        clipboardRibbonBar->AddButton(idRibbonPaste, !hideLabels ? _("Paste") : gd::String(), gd::SkinHelper::GetRibbonIcon("paste"));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Search"), gd::SkinHelper::GetRibbonIcon("search"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idSearchReplace, !hideLabels ? _("Search / Replace") : gd::String(), gd::SkinHelper::GetRibbonIcon("search"), _("Search for a specific word in the event and/or replace it by another"));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("View"), gd::SkinHelper::GetRibbonIcon("view"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonFoldAll, !hideLabels ? _("Fold all") : gd::String(), gd::SkinHelper::GetRibbonIcon("foldAll"), _("Hide all subevents"));
        ribbonBar->AddButton(idRibbonUnFoldAll, !hideLabels ? _("Unfold") : gd::String(), gd::SkinHelper::GetRibbonIcon("unFoldAll"), _("Show all hidden subevents"));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Tools"), gd::SkinHelper::GetRibbonIcon("profiler"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonProfiling, !hideLabels ? _("Display performances") : gd::String(), gd::SkinHelper::GetRibbonIcon("profiler"), _("For native games, display the time taken by each events during the last preview when profiling was active."));
        ribbonBar->AddDropdownButton(idRibbonPlatform, !hideLabels ? _("Current platform") : gd::String(), gd::SkinHelper::GetRibbonIcon("extension"), _("Choose the current platform being used to edit the events."));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Help"), gd::SkinHelper::GetRibbonIcon("help"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonHelp, !hideLabels ? _("Help") : gd::String(), gd::SkinHelper::GetRibbonIcon("help"), _("Display the help about the events editor"));
    }
}

void EventsEditor::ConnectEvents()
{
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonEvent, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OnRibbonAddEventBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonCom, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OnRibbonAddCommentBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonSomeEvent, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, (wxObjectEventFunction)&EventsEditor::OnRibbonAddCustomEventFromMenu, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonSubEvent, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OnRibbonAddSubEventSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDelEvent, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::DeleteSelection, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonUndo, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OnundoMenuSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonRedo, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OnredoMenuSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonCopy, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OneventCopyMenuSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonCut, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OneventCutMenuSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonPaste, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OneventPasteMenuSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonEventStore, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OnEventStoreBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idSearchReplace, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OnSearchBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonProfiling, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OnProfilingBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonPlatform, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, (wxObjectEventFunction)&EventsEditor::OnPlatformBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OnHelpBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonFoldAll, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OnRibbonFoldAll, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonUnFoldAll, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OnRibbonUnFoldAll, NULL, this);
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
void EventsEditor::RecomputeAllEventsWidth(gd::EventsList & eventsToRefresh)
{
    for(size_t i = 0;i < eventsToRefresh.GetEventsCount();++i)
    {
    	gd::BaseEvent & event = eventsToRefresh.GetEvent(i);
        event.eventHeightNeedUpdate = true;

        if ( event.CanHaveSubEvents() )
            RecomputeAllEventsWidth(event.GetSubEvents());
    }
}

void EventsEditor::OnResize(wxSizeEvent& event)
{
    RecomputeAllEventsWidth(*events); //Recompute all widths
    Refresh();
}

void EventsEditor::OneventsPanelPaint(wxPaintEvent& event)
{
    //Prepare dc and background
    wxAutoBufferedPaintDC dc(eventsPanel);

    //Support high definition interfaces ("retina" screens).
    double scale = gd::GUIContentScaleFactor::Get();
    dc.SetLogicalScale(scale, scale);
    dc.SetUserScale(1.0/scale, 1.0/scale);

    dc.SetPen(wxPen(wxColour(246, 246, 246)));
    dc.SetBrush(wxBrush(wxColour(246, 246, 246)));
    dc.DrawRectangle(0,0,eventsPanel->GetSize().x,eventsPanel->GetSize().y);

    //Clear selection areas
    itemsAreas.Clear();

    unsigned int totalHeight = DrawEvents(dc, *events, leftMargin + ( profilingActivated ? 23 : 0), -scrollBar->GetThumbPosition());

    wxString text;
    if ( events->IsEmpty() )
        text = _("Add an event with the ribbon.\nHighlight an event/action/condition with the cursor to get more editing options,\nor double-click to edit an item.");
    else
        text = _("Highlight an event/action/condition with the cursor to get more editing options,\nor double-click to edit an item.");
    dc.SetTextForeground(wxColor(0,0,0));
    dc.SetFont(gd::EventsRenderingHelper::Get()->GetNiceFont());
    dc.DrawLabel(text,
                wxRect( (eventsPanel->GetSize().x-dc.GetMultiLineTextExtent(text).GetWidth())/2,-scrollBar->GetThumbPosition()+totalHeight+25,
                        (eventsPanel->GetSize().x+dc.GetMultiLineTextExtent(text).GetWidth())/2-(eventsPanel->GetSize().x-dc.GetMultiLineTextExtent(text).GetWidth())/2,0)
                , wxALIGN_CENTER);

    totalHeight += dc.GetMultiLineTextExtent(text).y;

    scrollBar->SetRange(totalHeight);
    scrollBar->SetPageSize(eventsPanel->GetSize().y);
    #if !defined(LINUX) //Linking error when using SetThumbSize on linux currently.
    scrollBar->SetThumbSize(eventsPanel->GetSize().y);
    #endif
}

unsigned int EventsEditor::DrawEvents(wxDC & dc, gd::EventsList & events, int x, int y, gd::BaseEvent * scrollTo)
{
    int originalYPosition = y;

    for (std::size_t i = 0;i<events.size();++i)
    {
        if ( scrollTo == &events[i] )
        	scrollBar->SetThumbPosition(y);

        dc.SetFont(gd::EventsRenderingHelper::Get()->GetFont());
        dc.SetTextForeground(wxColour(0,0,0));

        gd::EventsRenderingHelper::Get()->SetConditionsColumnWidth(conditionColumnWidth-x);
        unsigned int width = eventsPanel->GetSize().x-x-6 > 0 ? eventsPanel->GetSize().x-x-6 : 1;
        unsigned int height = events[i].GetRenderedHeight(width, game.GetCurrentPlatform());

        if( !(y+static_cast<int>(height) < 0 || y > eventsPanel->GetSize().y) ) //Render only if needed
        {
            //Event drawing :
            EventItem eventAccessor(events.GetEventSmartPtr(i), &events, i);

            bool drawDragTarget = false;
            if ( selection.EventHighlighted(eventAccessor) ) //Highlight and context panel if needed
            {
                dc.SetPen(gd::EventsRenderingHelper::Get()->GetHighlightedRectangleOutlinePen());
                dc.SetBrush(gd::EventsRenderingHelper::Get()->GetHighlightedRectangleFillBrush());
                dc.DrawRectangle(0,y,eventsPanel->GetSize().x,height);

                //Update context panel ( unless we're dragging something )
                if ( !selection.IsDraggingEvent() && ! selection.IsDraggingInstruction())
                {
                    if ( eventContextPanel->GetPosition() != wxPoint(eventsPanel->GetSize().x-eventContextPanel->GetSize().x-10, y+height-1))
                        eventContextPanel->SetPosition(wxPoint(eventsPanel->GetSize().x-eventContextPanel->GetSize().x-10, y+height-1));
                    if ( !eventContextPanel->IsShown() )
                        eventContextPanel->Show(true);
                }

                if ( selection.IsDraggingEvent() )
                    drawDragTarget = true;//Draw drag target, but after
            }
            if ( selection.EventSelected(eventAccessor) ) //Selection rectangle if needed
            {
                dc.SetPen(gd::EventsRenderingHelper::Get()->GetSelectedRectangleOutlinePen());
                dc.SetBrush(gd::EventsRenderingHelper::Get()->GetSelectedRectangleFillBrush());
                dc.DrawRectangle(0,y,eventsPanel->GetSize().x,height);
            }

            if (profilingActivated && events[i].IsExecutable())
            {
                dc.DrawText(gd::String::From(i+1), x-leftMargin+2-42, y);
                dc.SetFont(gd::EventsRenderingHelper::Get()->GetNiceFont().Smaller());

                //Draw profile results
                dc.SetPen(wxPen(wxColour(0,0,0)));
                dc.SetBrush(wxColour(255.0f,255.0f*(1.0f-events[i].percentDuringLastSession*0.05f),255.0f*(1.0f-events[i].percentDuringLastSession*0.05f)));
                dc.DrawRectangle(x-41-2, y, 41,26);

                std::ostringstream timeStr; timeStr.setf(ios::fixed,ios::floatfield); timeStr.precision(2);
                timeStr << static_cast<double>(events[i].totalTimeDuringLastSession)/1000.0f;
                dc.DrawText(timeStr.str()+"ms", x-41, y+1);

                std::ostringstream percentStr; percentStr.setf(ios::fixed,ios::floatfield); percentStr.precision(2);
                percentStr << events[i].percentDuringLastSession;
                dc.DrawText(percentStr.str()+"%", x-41, y+13);
                dc.SetFont(gd::EventsRenderingHelper::Get()->GetFont());
            }
            else
                dc.DrawText(gd::String::From(i+1), x-leftMargin+2, y+3);


            //Event rendering
            events[i].Render(dc, x, y, width, itemsAreas, selection, game.GetCurrentPlatform());

            if ( drawDragTarget )
            {
                dc.SetPen(wxPen(wxColour(0, 0, 0)));
                dc.SetBrush(wxBrush(wxColour(0, 0, 0)));
                dc.DrawRectangle(x+2, selection.IsEventHighlightedOnBottomPart() ? y+height-2 : y, eventsPanel->GetSize().x-x-2, 2);
            }

            //Registering event in items which are displayed
            wxRect eventArea(0,y,eventsPanel->GetSize().x,height);
            itemsAreas.AddEventArea( eventArea, eventAccessor );
        }

        y += height;

        //Folding and sub events
        if ( events[i].CanHaveSubEvents() && !events[i].GetSubEvents().IsEmpty())
        {
            FoldingItem foldingItem(&events[i]);

            if ( !events[i].IsFolded() )
            {
                dc.DrawBitmap(foldBmp, x-5-foldBmp.GetWidth(), y-foldBmp.GetHeight()-2, true /*Use mask*/ );
                itemsAreas.AddFoldingItem(wxRect(x-5-foldBmp.GetWidth(), y-foldBmp.GetHeight()-2, foldBmp.GetWidth(), foldBmp.GetHeight()), foldingItem);

                //Draw sub events
                y += DrawEvents(dc, events[i].GetSubEvents(), x+24, y, scrollTo);
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


void EventsEditor::OnlistContextPanelPaint(wxPaintEvent& event)
{
    wxBufferedPaintDC dc(listContextPanel);

    if ( selection.GetHighlightedInstructionList().isConditionList )
    {
        dc.SetPen(gd::EventsRenderingHelper::Get()->GetConditionsRectangleOutlinePen());
        dc.SetBrush(gd::EventsRenderingHelper::Get()->GetConditionsRectangleFillBrush());
    }
    else
    {
        dc.SetPen(gd::EventsRenderingHelper::Get()->GetActionsRectangleOutlinePen());
        dc.SetBrush(gd::EventsRenderingHelper::Get()->GetActionsRectangleFillBrush());
    }
    dc.DrawRectangle(0,-1,listContextPanel->GetSize().x,listContextPanel->GetSize().y+1);
    addInstrBt->SetBackgroundColour(dc.GetBrush().GetColour());
    addInstrIcon->SetBackgroundColour(dc.GetBrush().GetColour());
}

void EventsEditor::OneventContextPanelPaint(wxPaintEvent& event)
{
    wxBufferedPaintDC dc(eventContextPanel);

    if ( selection.EventSelected(selection.GetHighlightedEvent()) )
    {
        dc.SetPen(gd::EventsRenderingHelper::Get()->GetSelectedRectangleOutlinePen());
        dc.SetBrush(gd::EventsRenderingHelper::Get()->GetSelectedRectangleFillBrush());
    }
    else
    {
        dc.SetPen(gd::EventsRenderingHelper::Get()->GetHighlightedRectangleOutlinePen());
        dc.SetBrush(gd::EventsRenderingHelper::Get()->GetHighlightedRectangleFillBrush());
    }
    dc.DrawRectangle(0,-1,eventContextPanel->GetSize().x,eventContextPanel->GetSize().y+1);
    addEventBt->SetBackgroundColour(dc.GetBrush().GetColour());
    addSubEventBt->SetBackgroundColour(dc.GetBrush().GetColour());
    addMoreBt->SetBackgroundColour(dc.GetBrush().GetColour());
    addEventIcon->SetBackgroundColour(dc.GetBrush().GetColour());
    addSubEventIcon->SetBackgroundColour(dc.GetBrush().GetColour());
    addMoreIcon->SetBackgroundColour(dc.GetBrush().GetColour());
}
/**
 * De/activate ribbon buttons
 */
void EventsEditor::UpdateRibbonBars()
{
    if ( insertRibbonBar != NULL ) insertRibbonBar->EnableButton(idRibbonSubEvent, selection.HasSelectedEvents());
    if ( deleteRibbonBar != NULL ) deleteRibbonBar->EnableButton(idRibbonDelEvent, selection.HasSelectedEvents() || selection.HasSelectedInstructions());
    if ( clipboardRibbonBar != NULL ) clipboardRibbonBar->EnableButton(idRibbonCopy, selection.HasSelectedEvents()|| selection.HasSelectedInstructions());
    if ( clipboardRibbonBar != NULL ) clipboardRibbonBar->EnableButton(idRibbonCut, selection.HasSelectedEvents()|| selection.HasSelectedInstructions());
    if ( undoRibbonBar != NULL ) undoRibbonBar->EnableButton(idRibbonUndo, !history.empty());
    if ( undoRibbonBar != NULL ) undoRibbonBar->EnableButton(idRibbonRedo, !redoHistory.empty());
}

void EventsEditor::OneventsPanelLeftUp(wxMouseEvent& event)
{
    UpdateRibbonBars();

    //End resizing condition column ?
    if ( isResizingColumns )
    {
        conditionColumnWidth = event.GetX();
        RecomputeAllEventsWidth(*events);
        isResizingColumns = false;
    }

    if (selection.EndDragEvent(!ctrlKeyDown, selection.IsEventHighlightedOnBottomPart()))
        ChangesMadeOnEvents();
    else if (gd::InstructionsList * list = selection.EndDragInstruction(!ctrlKeyDown, selection.IsInstructionHighlightedOnBottomPart()))
    {
        EnsureTriggerOnceIsLastCondition(*list);
        ChangesMadeOnEvents();
    }

    Refresh();
}

void EventsEditor::OneventsPanelLeftDown(wxMouseEvent& event)
{
    eventsPanel->SetFocus();

    //Want to resize conditions column ?
    if ( event.GetX() >= conditionColumnWidth-2 && event.GetX() <= conditionColumnWidth+2  )
        isResizingColumns = true;

    //End live editing a parameter?
    if ( liveEditingPanel->IsShown() )
    {
        EndLiveEditing();
        return;
    }

    //Start editing a parameter?
    HandleSelectionAfterClick(event.GetX(), event.GetY());

    //Begin drag
    if ( itemsAreas.IsOnInstruction(event.GetX(), event.GetY()) && selection.InstructionSelected(itemsAreas.GetInstructionAt(event.GetX(), event.GetY())))
        selection.BeginDragInstruction();
    else if ( itemsAreas.IsOnEvent(event.GetX(), event.GetY()) && selection.EventSelected(itemsAreas.GetEventAt(event.GetX(), event.GetY())))
        selection.BeginDragEvent();
}

void EventsEditor::HandleSelectionAfterClick(int x, int y, bool allowLiveEditingParameters)
{
    if ( allowLiveEditingParameters && itemsAreas.IsOnParameter(x, y) )
    {
        selection.ClearSelection();

        wxRect parameterArea = itemsAreas.GetAreaOfParameterAt(x, y);
        liveEditedParameter = itemsAreas.GetParameterAt(x, y);
        liveEditedAssociatedInstruction = itemsAreas.GetInstructionAt(x, y);

        if (liveEditedParameter.parameter == NULL ) return;

        liveEditingPanel->SetPosition(wxPoint(parameterArea.x+liveEditingPanel->GetSize().x < eventsPanel->GetSize().x ? parameterArea.x : (eventsPanel->GetSize().x-liveEditingPanel->GetSize().x), parameterArea.y));
        liveEdit->SetValue(liveEditedParameter.parameter->GetPlainString());
        liveEditingPanel->Layout();
        liveEditingPanel->Show(true);
        liveEdit->SetFocus();
        liveEditingChangesMade = false;
    }
    //gd::Instruction selection?
    else if ( itemsAreas.IsOnInstruction(x, y) )
    {
        gd::InstructionItem item = itemsAreas.GetInstructionAt(x, y);

        if ( !ctrlKeyDown && !selection.InstructionSelected(item) ) selection.ClearSelection();
        selection.AddInstruction(item);

        //Log file
        if ( LogFileManager::Get()->IsLogActivated() )
        {
            if ( itemsAreas.IsOnEvent(x, y) )
            {
                EventItem eventItem = itemsAreas.GetEventAt(x, y);
                if ( item.isCondition )
                    LogFileManager::Get()->WriteToLogFile("Condition selected ( Layout \""+scene.GetName()+"\", Event position in the last list: "+gd::String::From(eventItem.positionInList)+" )");
                else
                    LogFileManager::Get()->WriteToLogFile("Action selected ( Layout \""+scene.GetName()+"\", Event position in the last list: "+gd::String::From(eventItem.positionInList)+" )");
            }
        }
    }
    //Un/folding?
    else if ( itemsAreas.IsOnFoldingItem(x, y) )
    {
        if ( !ctrlKeyDown ) selection.ClearSelection();
        gd::BaseEvent * eventToFold = itemsAreas.GetFoldingItemAt(x, y).event;
        if (eventToFold)
        {
            eventToFold->SetFolded(!eventToFold->IsFolded());
            Refresh();
        }
    }
    //Event selection?
    else if ( itemsAreas.IsOnEvent(x, y) )
    {
        EventItem item = itemsAreas.GetEventAt(x, y);

        if ( !ctrlKeyDown && !selection.EventSelected(item) ) selection.ClearSelection();
        selection.AddEvent(item);

        //Log file
        LogFileManager::Get()->WriteToLogFile("Event selected ( Layout \""+scene.GetName()+"\", Event position in the last list: "+gd::String::From(item.positionInList)+" )");
    }
}

void EventsEditor::OneventsPanelLeftDClick(wxMouseEvent& event)
{
    //gd::Instruction selection?
    if ( itemsAreas.IsOnInstruction(event.GetX(), event.GetY()) )
    {
        gd::InstructionItem item = itemsAreas.GetInstructionAt(event.GetX(), event.GetY());

        if (item.instruction == NULL || item.instructionList == NULL || item.event == NULL) return;

        InstructionSelectorDialog dialog(this, game, scene, !item.isCondition);
        dialog.instructionType = item.instruction->GetType();
        dialog.Param = item.instruction->GetParameters();
        dialog.isInverted = item.instruction->IsInverted();
        dialog.RefreshFromInstruction();
        dialog.Fit();

        if (dialog.ShowModal() == 0)
        {
            item.instruction->SetType( dialog.instructionType );
            item.instruction->SetParameters( dialog.Param );
            item.instruction->SetInverted( dialog.isInverted );

            item.event->eventHeightNeedUpdate = true;
            Refresh();
            ChangesMadeOnEvents();
        }
    }
    else if (itemsAreas.IsOnInstructionList(event.GetX(), event.GetY()) )
    {
        gd::InstructionListItem item = itemsAreas.GetInstructionListAt(event.GetX(), event.GetY());

        if ( item.instructionList == NULL || item.event == NULL) return;

        InstructionSelectorDialog dialog(this, game, scene, !item.isConditionList);
        if (dialog.ShowModal() == 0)
        {
            gd::Instruction instruction;
            instruction.SetType( dialog.instructionType );
            instruction.SetParameters( dialog.Param );
            instruction.SetInverted( dialog.isInverted );

            item.instructionList->Insert(instruction);
            item.event->eventHeightNeedUpdate = true;
            Refresh();
            ChangesMadeOnEvents();
        }
    }
    //Event selection?
    else if ( itemsAreas.IsOnEvent(event.GetX(), event.GetY()) )
    {
        std::shared_ptr<gd::BaseEvent> evt = itemsAreas.GetEventAt(event.GetX(), event.GetY()).event;

        if ( evt == std::shared_ptr<gd::BaseEvent>() ) return;

        gd::BaseEvent::EditEventReturnType returned = evt->EditEvent(this, game, scene, mainFrameWrapper);

        if (returned != gd::BaseEvent::Cancelled)
        {
            evt->eventHeightNeedUpdate = true;
            ChangesMadeOnEvents(true /*update history*/, returned == gd::BaseEvent::ChangesMadeButNoNeedForEventsRecompilation /*Don't recompile events if it is not necessary*/);
        }

    }
}

void EventsEditor::OneventsPanelMouseMove(wxMouseEvent& event)
{
	#if !defined(__WXGTK__)
	if (!liveEditingPanel->IsShown())
		eventsPanel->SetFocus();
	#endif

    //Column resizing
    if ( (event.GetX() >= conditionColumnWidth-2 && event.GetX() <= conditionColumnWidth+2) || isResizingColumns)
    {
        SetCursor(wxCURSOR_SIZEWE);
        if ( isResizingColumns ) return;
    }
    else
        SetCursor(wxNullCursor);

    bool showlistContextPanel = false;

    //Reset highlighted items.
    ParameterItem dummy;
    selection.SetHighlighted(dummy);
    gd::InstructionListItem dummy2;
    selection.SetHighlighted(dummy2);
    gd::InstructionItem dummy3;
    selection.SetHighlighted(dummy3);
    EventItem dummy4;
    selection.SetHighlighted(dummy4);

    //Highlight management
    if ( itemsAreas.IsOnEvent(event.GetX(), event.GetY()) )
    {
        selection.SetHighlighted(itemsAreas.GetEventAt(event.GetX(), event.GetY()));

        wxRect area = itemsAreas.GetAreaOfEventAt(event.GetX(), event.GetY());
        selection.EventHighlightedOnBottomPart(area.y+area.height/2.0 < event.GetY());

        if ( itemsAreas.IsOnInstructionList(event.GetX(), event.GetY()) )
        {
            selection.SetHighlighted(itemsAreas.GetInstructionListAt(event.GetX(), event.GetY()));
            wxRect area = itemsAreas.GetAreaOfInstructionListAt(event.GetX(), event.GetY());

            //Update context panel ( unless we're dragging something )
            if ( !selection.IsDraggingEvent() && ! selection.IsDraggingInstruction())
            {
                if (!hideContextPanelsLabels) addInstrBt->SetLabel(itemsAreas.GetInstructionListAt(event.GetX(), event.GetY()).isConditionList ? _("Add a condition") : _("Add an action"));
                listContextPanel->SetPosition(wxPoint(area.x, area.y+area.height-1));
                showlistContextPanel = true;
            }

            if ( itemsAreas.IsOnInstruction(event.GetX(), event.GetY()) )
            {
                selection.SetHighlighted(itemsAreas.GetInstructionAt(event.GetX(), event.GetY()));

                wxRect area = itemsAreas.GetAreaOfInstructionAt(event.GetX(), event.GetY());
                selection.InstructionHighlightedOnBottomPart(area.y+area.height/2.0 < event.GetY());

                if ( itemsAreas.IsOnParameter(event.GetX(), event.GetY()) )
                    selection.SetHighlighted(itemsAreas.GetParameterAt(event.GetX(), event.GetY()));
            }
        }
        else if ( itemsAreas.IsOnParameter(event.GetX(), event.GetY()) ) //Parameter without list ( a simple gd::Expression )
            selection.SetHighlighted(itemsAreas.GetParameterAt(event.GetX(), event.GetY()));

    }
    else
        eventContextPanel->Show(false);

    if (listContextPanel->IsShown() != showlistContextPanel)
        listContextPanel->Show(showlistContextPanel); //Prevent flickering by change the state only once we know the real state.
    Refresh();
}


void EventsEditor::OneventsPanelRightUp(wxMouseEvent& event)
{
    HandleSelectionAfterClick(event.GetX(), event.GetY(), false /*Do not start editing a parameter*/);

    if ( itemsAreas.IsOnInstruction(event.GetX(), event.GetY()) )
    {
        eventsContextMenu.Enable(deleteMenuItem, true);
        eventsContextMenu.Enable(toggleActivationMenuItem, false);
        eventsContextMenu.Enable(copyMenuItem, true);
        eventsContextMenu.Enable(cutMenuItem, true);
        PopupMenu(&eventsContextMenu);
    }
    else if ( itemsAreas.IsOnInstructionList(event.GetX(), event.GetY()) )
    {
        eventsContextMenu.Enable(deleteMenuItem, false);
        eventsContextMenu.Enable(toggleActivationMenuItem, false);
        eventsContextMenu.Enable(copyMenuItem, false);
        eventsContextMenu.Enable(cutMenuItem, false);
        PopupMenu(&eventsContextMenu);
    }
    else if ( itemsAreas.IsOnEvent(event.GetX(), event.GetY()) )
    {
        eventsContextMenu.Enable(deleteMenuItem, true);
        eventsContextMenu.Enable(toggleActivationMenuItem, true);
        eventsContextMenu.Enable(copyMenuItem, true);
        eventsContextMenu.Enable(cutMenuItem, true);
        PopupMenu(&eventsContextMenu);
    }
}

void EventsEditor::OneventsPanelMouseLeave(wxMouseEvent& event)
{
}


/**
 * Manage keyboard input
 */
void EventsEditor::OneventsPanelKeyDown(wxKeyEvent& event)
{
    wxCommandEvent unusedEvent;

    if ( event.GetKeyCode() == WXK_CONTROL )
    {
        ctrlKeyDown = true;
    }
    else if ( event.GetKeyCode() == WXK_DELETE || event.GetKeyCode() == WXK_BACK )
    {
        DeleteSelection();
    }
    else if ( event.GetKeyCode() == WXK_INSERT )
    {
        wxCommandEvent unusedEvent;
        OnaddEventBtClick( unusedEvent );
    }
    if ( event.GetKeyCode() == WXK_F3 && searchDialog != NULL)
    {
        if ( event.GetModifiers() == wxMOD_SHIFT ) searchDialog->OnpreviousBtClick(unusedEvent);
        else searchDialog->OnnextBtClick(unusedEvent);
    }
    else if ( event.GetModifiers() == wxMOD_CMD ) //Ctrl-xxx
    {
        switch ( event.GetKeyCode() )
        {
            case 67: //Ctrl C
            {
                OneventCopyMenuSelected( unusedEvent );
                break;
            }
            case 86: //Ctrl-V
            {
                OneventPasteMenuSelected( unusedEvent );
                break;
            }
            case 88: //Ctrl-X
            {
                OneventCutMenuSelected( unusedEvent );
                break;
            }
            case 70: //Ctrl-F
            {
                OnSearchBtClick( unusedEvent );
                break;
            }
            case 89: //Ctrl-Y
            {
                OnredoMenuSelected( unusedEvent );
                break;
            }
            case 90: //Ctrl-Z
            {
                OnundoMenuSelected( unusedEvent );
                break;
            }
            default:
                break;
        }
    }

    //Not a shortcut managed here, let the event propagates to the parent.
    event.Skip();
}

/**
 * Manage keyboard input
 */
void EventsEditor::OneventsPanelKeyUp(wxKeyEvent& event)
{
    if ( event.GetKeyCode() == WXK_CONTROL )
    {
        ctrlKeyDown = false;
    }
}

void EventsEditor::DeleteSelection()
{
    //Delete selected instructions..
    selection.DeleteAllInstructionSelected();

    //..and events
    std::vector<EventItem> eventsSelection = selection.GetAllSelectedEvents();
    for (std::size_t i = 0; i<eventsSelection.size();++i)
    {
        if ( eventsSelection[i].event != std::shared_ptr<gd::BaseEvent>() && eventsSelection[i].eventsList != NULL)
            eventsSelection[i].eventsList->RemoveEvent(*eventsSelection[i].event);
    }

    selection.ClearSelection();
    Refresh();
    ChangesMadeOnEvents();
}

void EventsEditor::ChangesMadeOnEvents(bool updateHistory, bool noNeedForSceneRecompilation)
{
    if ( updateHistory )
    {
        history.push_back(latestState);
        redoHistory.clear();
        latestState = *events;
    }

    if ( !noNeedForSceneRecompilation )
    {
        if ( externalEvents != NULL )
            gd::EventsChangesNotifier::NotifyChangesInEventsOfExternalEvents(game, *externalEvents);
        else
            gd::EventsChangesNotifier::NotifyChangesInEventsOfScene(game, scene);
    }
    game.SetDirty();
}

/**
 * Live editing is ended ( by Enter or a click )
 */
void EventsEditor::EndLiveEditing()
{
    if ( liveEditedParameter.parameter == NULL )
    {
        std::cout << "Warning, live edited parameter is invalid" << std::endl;
        return;
    }
    if ( liveEditedParameter.event == NULL )
    {
        std::cout << "Warning, live edited event is invalid" << std::endl;
        return;
    }

    eventsPanel->SetFocus();
    *liveEditedParameter.parameter = gd::Expression(gd::String(liveEdit->GetValue()));
    liveEditedParameter.event->eventHeightNeedUpdate = true;
    liveEditingPanel->Show(false);

    if (liveEditingChangesMade)
        ChangesMadeOnEvents();
    Refresh();
    return;
}

void EventsEditor::OneventsPanelEraseBackground(wxEraseEvent& event)
{
    //Prevent flickering
}
void EventsEditor::OneventContextPanelEraseBackground(wxEraseEvent& event)
{
    //Prevent flickering
}
void EventsEditor::OnlistContextPanelEraseBackground(wxEraseEvent& event)
{
    //Prevent flickering
}


void EventsEditor::OnscrollBarScroll(wxScrollEvent& event)
{
    Refresh();
}

void EventsEditor::OnliveEditTextEnter(wxCommandEvent& event)
{
    EndLiveEditing();
}

void EventsEditor::OneventsPanelMouseWheel(wxMouseEvent& event)
{
    scrollBar->SetThumbPosition(scrollBar->GetThumbPosition()-event.GetWheelRotation());
    Refresh();
}

void EventsEditor::OnliveEditText(wxCommandEvent& event)
{
    liveEditingChangesMade = true;
}

void EventsEditor::EnsureTriggerOnceIsLastCondition(gd::InstructionsList & conditions) {
	if (conditions.empty()) return;

	bool endWithTriggerOnce = conditions.Get(conditions.GetCount()-1).GetType() == "BuiltinCommonInstructions::Once";
	bool multipleOnce = false;
	for (std::size_t i = 0;i<conditions.size()-1;)
	{
		if (conditions[i].GetType() == "BuiltinCommonInstructions::Once")
		{
			if (!endWithTriggerOnce)
			{
				conditions.Insert(conditions[i]); //"Move" the "Trigger once" condition at the end
				endWithTriggerOnce = true;
			}
			else
				multipleOnce = true;

			conditions.Remove(i); //In any case, remove the trigger once as it is not at the end.
		}
		else
			++i;
	}

	if (multipleOnce)
		mainFrameWrapper.GetInfoBar()->ShowMessage(_("Only one \"Trigger Once\" condition is needed in a list of conditions."));
}

void EventsEditor::OnaddInstrBtClick(wxCommandEvent& event)
{
    gd::InstructionListItem listHighlighted = selection.GetHighlightedInstructionList();
    if ( listHighlighted.instructionList == NULL ) return;

    InstructionSelectorDialog dialog(this, game, scene, !listHighlighted.isConditionList);
    if (dialog.ShowModal() == 0)
    {
        gd::Instruction instruction;
        instruction.SetType(dialog.instructionType);
        instruction.SetParameters(dialog.Param);
        instruction.SetInverted(dialog.isInverted);

        listHighlighted.instructionList->Insert(instruction);
        listHighlighted.event->eventHeightNeedUpdate = true;
        EnsureTriggerOnceIsLastCondition(*listHighlighted.instructionList);
        Refresh();
        ChangesMadeOnEvents();
    }
}

/**
 * Add an event
 */
void EventsEditor::AddEvent(gd::EventItem & previousEventItem)
{
    gd::BaseEventSPtr eventToAdd = game.GetCurrentPlatform().CreateEvent("BuiltinCommonInstructions::Standard");
    if ( eventToAdd != std::shared_ptr<gd::BaseEvent>() )
    {
        //Edit the event
        eventToAdd->EditEvent(this, game, scene, mainFrameWrapper);

        //Adding event
        if ( previousEventItem.eventsList != NULL )
			previousEventItem.eventsList->InsertEvent(*eventToAdd, previousEventItem.positionInList+1);
        else if ( events != NULL )
            events->InsertEvent( *eventToAdd );

        Refresh();
        ChangesMadeOnEvents();
    }
    else
        gd::LogError(_("Unable to create standard event."));
}

void EventsEditor::OnaddEventBtClick(wxCommandEvent& event)
{
    gd::EventItem & highlightedEvent = selection.GetHighlightedEvent();
    if ( highlightedEvent.event == std::shared_ptr<gd::BaseEvent>() ) return;

    AddEvent(highlightedEvent);
}
void EventsEditor::OnRibbonAddEventBtClick(wxRibbonButtonBarEvent& evt)
{
    std::vector< EventItem > eventsSelected = selection.GetAllSelectedEvents();

    if ( !eventsSelected.empty() && eventsSelected[0].event != std::shared_ptr<gd::BaseEvent>() )
        AddEvent(eventsSelected[0]);
    else
    {
        EventItem dummy;
        AddEvent(dummy);
    }
}

/**
 * Ribbon specific : add a comment
 */
void EventsEditor::OnRibbonAddCommentBtClick(wxRibbonButtonBarEvent& evt)
{
    std::vector< EventItem > eventsSelected = selection.GetAllSelectedEvents();
    EventItem previousEventItem;
    if ( !eventsSelected.empty() && eventsSelected[0].event != std::shared_ptr<gd::BaseEvent>() ) previousEventItem = eventsSelected[0];

    gd::BaseEventSPtr eventToAdd = game.GetCurrentPlatform().CreateEvent("BuiltinCommonInstructions::Comment");
    if ( eventToAdd != std::shared_ptr<gd::BaseEvent>() )
    {
        if ( eventToAdd->EditEvent(this, game, scene, mainFrameWrapper) == gd::BaseEvent::Cancelled ) return;

        //Adding event
        if ( previousEventItem.eventsList != NULL )
            previousEventItem.eventsList->InsertEvent(*eventToAdd, previousEventItem.positionInList+1);
        else if ( events != NULL)
            events->InsertEvent(eventToAdd);

        Refresh();
        ChangesMadeOnEvents();
    }
    else
        gd::LogError(_("Unable to create a comment event."));
}

/**
 * Add a sub event
 */
void EventsEditor::AddSubEvent(gd::EventItem & parentEventItem)
{
    gd::BaseEventSPtr eventToAdd = game.GetCurrentPlatform().CreateEvent("BuiltinCommonInstructions::Standard");
    if ( eventToAdd != std::shared_ptr<gd::BaseEvent>() )
    {
        eventToAdd->EditEvent(this, game, scene, mainFrameWrapper);

        //Adding event
        parentEventItem.event->GetSubEvents().InsertEvent(*eventToAdd, 0);

        Refresh();
        ChangesMadeOnEvents();
    }
    else
        gd::LogError(_("Unable to create standard event."));
}

void EventsEditor::OnaddSubEventBtClick(wxCommandEvent& event)
{
    gd::EventItem & highlightedEvent = selection.GetHighlightedEvent();
    if ( highlightedEvent.event == std::shared_ptr<gd::BaseEvent>() || !highlightedEvent.event->CanHaveSubEvents() ) return;

    AddSubEvent(highlightedEvent);
}
void EventsEditor::OnRibbonAddSubEventSelected(wxRibbonButtonBarEvent& evt)
{
    std::vector< EventItem > eventsSelected = selection.GetAllSelectedEvents();
    if ( eventsSelected.empty() || eventsSelected[0].event == std::shared_ptr<gd::BaseEvent>() ) return;

    AddSubEvent(eventsSelected[0]);
}

/**
 * Add event of selected type
 */
void EventsEditor::AddCustomEventFromMenu(unsigned int menuID, gd::EventItem & previousEventItem)
{
    //Retrieve event type
    gd::String eventType;
    for (std::size_t i = 0;i<idForEventTypesMenu.size();++i)
    {
    	if ( idForEventTypesMenu[i].first == menuID )
            eventType = idForEventTypesMenu[i].second;
    }

    //Create event
    gd::BaseEventSPtr eventToAdd = game.GetCurrentPlatform().CreateEvent(eventType);
    if ( !eventToAdd ) {
    	return;
    }
    if ( eventToAdd->EditEvent(this, game, scene, mainFrameWrapper) == gd::BaseEvent::Cancelled ) return;

    //Adding event
    if ( previousEventItem.eventsList != NULL )
        previousEventItem.eventsList->InsertEvent(*eventToAdd, previousEventItem.positionInList+1);
    else if ( events != NULL)
        events->InsertEvent(eventToAdd);

    Refresh();
    ChangesMadeOnEvents();
}

void EventsEditor::OnAddCustomEventFromMenuSelected(wxCommandEvent& event)
{
    std::vector< EventItem > eventsSelected = selection.GetAllSelectedEventsWithoutSubEvents();
    if ( !eventsSelected.empty() )
        AddCustomEventFromMenu(event.GetId(), eventsSelected[0]);
    else
    {
        EventItem dummy;
        AddCustomEventFromMenu(event.GetId(), dummy);
    }
}

void EventsEditor::OnRibbonAddCustomEventFromMenu(wxRibbonButtonBarEvent& evt)
{
    evt.PopupMenu(&eventTypesMenu);
}

void EventsEditor::OnaddMoreBtClick(wxCommandEvent& event)
{
    selection.ClearSelection();
    if ( selection.GetHighlightedEvent().event == std::shared_ptr<gd::BaseEvent>() ) return;
    selection.AddEvent(selection.GetHighlightedEvent());

    PopupMenu(&eventTypesMenu);
}

void EventsEditor::ScrollToEvent(gd::BaseEvent & eventToScrollTo)
{
    wxClientDC dc(eventsPanel);
    std::cout << "Scrolling to " << &eventToScrollTo;
    DrawEvents(dc, *events, leftMargin + ( profilingActivated ? 23 : 0), 0, &eventToScrollTo);
    std::cout << "Refresh ";
    Refresh();
}

void EventsEditor::OndeleteMenuSelected(wxCommandEvent& event)
{
    DeleteSelection();
}

void EventsEditor::OnRibbonFoldAll(wxRibbonButtonBarEvent& evt)
{
    FoldEventsListAndSubEvents(*events, true);
    Refresh();
}

void EventsEditor::OnRibbonUnFoldAll(wxRibbonButtonBarEvent& evt)
{
    FoldEventsListAndSubEvents(*events, false);
    Refresh();
}

void EventsEditor::FoldEventsListAndSubEvents(gd::EventsList & list, bool fold)
{
    for (std::size_t i = 0;i<list.size();++i)
    {
        list[i].SetFolded(fold);
        if ( list[i].CanHaveSubEvents() )  FoldEventsListAndSubEvents(list[i].GetSubEvents(), fold);
    }
}

void EventsEditor::OneventCopyMenuSelected(wxCommandEvent& event)
{
    if ( selection.HasSelectedConditions())
    {
        std::vector < gd::InstructionItem > itemsSelected = selection.GetAllSelectedInstructions();
        gd::InstructionsList instructionsToCopy;
        for (std::size_t i = 0;i<itemsSelected.size();++i)
        {
            if (itemsSelected[i].instruction != NULL)
                instructionsToCopy.Insert(*itemsSelected[i].instruction);
        }

        gd::Clipboard::Get()->SetConditions(instructionsToCopy);
    }
    else if ( selection.HasSelectedActions())
    {
        std::vector < gd::InstructionItem > itemsSelected = selection.GetAllSelectedInstructions();
        gd::InstructionsList instructionsToCopy;
        for (std::size_t i = 0;i<itemsSelected.size();++i)
        {
            if (itemsSelected[i].instruction != NULL)
                instructionsToCopy.Insert(*itemsSelected[i].instruction);
        }

        gd::Clipboard::Get()->SetActions(instructionsToCopy);
    }
    else if ( selection.HasSelectedEvents() )
    {
        std::vector < EventItem > itemsSelected = selection.GetAllSelectedEventsWithoutSubEvents();
        gd::EventsList eventsToCopy;
        for (std::size_t i = 0;i<itemsSelected.size();++i)
        {
            if (itemsSelected[i].event != std::shared_ptr<gd::BaseEvent>())
                eventsToCopy.InsertEvent(*itemsSelected[i].event);
        }

        gd::Clipboard::Get()->SetEvents(eventsToCopy);
        std::cout << "itemsSelected" << itemsSelected.size();
    }
}

void EventsEditor::OneventCutMenuSelected(wxCommandEvent& event)
{
    //Do initially the same thing as copy
    OneventCopyMenuSelected(event);

    if ( selection.HasSelectedConditions())
        DeleteSelection();
    else if ( selection.HasSelectedActions())
        DeleteSelection();
    else if ( selection.HasSelectedEvents() )
        DeleteSelection();
}

void EventsEditor::OneventPasteMenuSelected(wxCommandEvent& event)
{
    if ( selection.HasSelectedConditions() || (selection.GetHighlightedInstructionList().instructionList != NULL && selection.GetHighlightedInstructionList().isConditionList) )
    {
        if ( !gd::Clipboard::Get()->HasCondition() ) return;

        //Get information about list where conditions must be pasted
        gd::InstructionsList * instructionList = selection.HasSelectedConditions() ? selection.GetAllSelectedInstructions().back().instructionList : selection.GetHighlightedInstructionList().instructionList;
        size_t positionInThisList = selection.HasSelectedConditions() ? selection.GetAllSelectedInstructions().back().positionInList : gd::String::npos;
        gd::BaseEvent * event = selection.HasSelectedConditions() ? selection.GetAllSelectedInstructions().back().event : selection.GetHighlightedInstructionList().event;
        if (instructionList == NULL) return;

        //Paste all conditions
        const gd::InstructionsList & instructions = gd::Clipboard::Get()->GetInstructions();
        for (std::size_t i = 0;i<instructions.size();++i)
        {
            if ( positionInThisList < instructionList->size() )
                instructionList->Insert(instructions[i], positionInThisList);
            else
                instructionList->Insert(instructions[i]);
        }
        EnsureTriggerOnceIsLastCondition(*instructionList);

        if ( event != NULL ) event->eventHeightNeedUpdate = true;
        if ( !instructions.empty() ) ChangesMadeOnEvents();
        Refresh();
    }
    else if ( selection.HasSelectedActions()|| (selection.GetHighlightedInstructionList().instructionList != NULL && !selection.GetHighlightedInstructionList().isConditionList) )
    {
        if ( !gd::Clipboard::Get()->HasAction() ) return;

        //Get information about list where actions must be pasted
        gd::InstructionsList * instructionList = selection.HasSelectedActions() ? selection.GetAllSelectedInstructions().back().instructionList : selection.GetHighlightedInstructionList().instructionList;
        size_t positionInThisList = selection.HasSelectedActions() ? selection.GetAllSelectedInstructions().back().positionInList : gd::String::npos;
        gd::BaseEvent * event = selection.HasSelectedActions() ? selection.GetAllSelectedInstructions().back().event : selection.GetHighlightedInstructionList().event;
        if (instructionList == NULL) return;

        //Paste all actions
        const gd::InstructionsList & instructions = gd::Clipboard::Get()->GetInstructions();
        for (std::size_t i = 0;i<instructions.size();++i)
        {
            if ( positionInThisList < instructionList->size() )
                instructionList->Insert(instructions[i], positionInThisList);
            else
                instructionList->Insert(instructions[i]);
        }

        if ( event != NULL ) event->eventHeightNeedUpdate = true;
        if ( !instructions.empty() ) ChangesMadeOnEvents();
        Refresh();
    }
    else
    {
        gd::EventsList * eventsList; //The list where events should be inserted.
        std::size_t position = gd::String::npos; //The position where events should be inserted in the list.

        //Find where events should be inserted
        if (selection.HasSelectedEvents())
        {
            EventItem item = selection.GetAllSelectedEvents().back();
            eventsList = item.eventsList;
            position = item.positionInList;
        }
        else
            eventsList = events;

        if (eventsList == NULL) return;

        //Insert events
        gd::EventsList eventsToPaste = gd::Clipboard::Get()->GetEvents();
        eventsList->InsertEvents(eventsToPaste, 0, (size_t)-1, position);

        if ( !eventsToPaste.IsEmpty() ) ChangesMadeOnEvents();
        Refresh();
    }
}

void EventsEditor::OnundoMenuSelected(wxCommandEvent& event)
{
    if ( history.empty() ) return;

    redoHistory.push_back(*events);
    *events = history.back();
    history.pop_back();

    latestState = *events;

    Refresh();
    UpdateRibbonBars();
    ChangesMadeOnEvents(false);
}

void EventsEditor::OnredoMenuSelected(wxCommandEvent& event)
{
    if ( redoHistory.empty() ) return;

    history.push_back(*events);
    *events = redoHistory.back();
    redoHistory.pop_back();

    latestState = *events;

    Refresh();
    UpdateRibbonBars();
    ChangesMadeOnEvents(false);
}

void EventsEditor::OnHelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("gdevelop/documentation/manual/edit_event");
}

void EventsEditor::OnEventStoreBtClick( wxCommandEvent& event )
{
    gd::EventStoreDialog dialog(this, game, scene);
    if (dialog.ShowModal() != 1) return;

    //Insert new events
    std::vector< EventItem > eventsSelected = selection.GetAllSelectedEventsWithoutSubEvents();
    if ( eventsSelected.empty() || eventsSelected[0].eventsList == NULL )
    	events->InsertEvent(dialog.GetGroupEvent());
    else
    	eventsSelected[0].eventsList->InsertEvent(dialog.GetGroupEvent(), eventsSelected[0].positionInList);

    ChangesMadeOnEvents();
}

void EventsEditor::OnSearchBtClick(wxCommandEvent& event)
{
    if ( searchDialog )
        searchDialog->Show();
}

void EventsEditor::OnPlatformBtClick(wxRibbonButtonBarEvent& event)
{
    event.PopupMenu(&platformsMenu);
}

void EventsEditor::OnPlatformSelected(wxCommandEvent& event)
{
    game.SetCurrentPlatform(idForPlatformsMenu[event.GetId()]);
    RecreateCustomEventsMenu();
    Refresh();
}

void EventsEditor::OnProfilingBtClick(wxCommandEvent& event)
{
    CppLayoutPreviewer * sceneCanvas = dynamic_cast<CppLayoutPreviewer*>(layoutCanvas);

    if (sceneCanvas && sceneCanvas->GetProfileDialog() != std::shared_ptr<ProfileDlg>())
    {
        if ( !profilingActivated && !sceneCanvas->GetProfileDialog()->profilingActivated)
        {
            gd::LogMessage(_("Profiling is not activated. Activate profiling thanks to the Profiling window when previewing a scene."));
            return;
        }
    }

    profilingActivated = !profilingActivated;
    RecomputeAllEventsWidth(*events); //Recompute all widths
    Refresh();
}

void EventsEditor::OnparameterEditBtClick(wxCommandEvent& event)
{
    EndLiveEditing();

    if ( liveEditedAssociatedInstruction.instruction == NULL ) return;

    gd::InstructionItem & item = liveEditedAssociatedInstruction;

    if (item.instruction == NULL || item.instructionList == NULL || item.event == NULL) return;

    InstructionSelectorDialog dialog(this, game, scene, !item.isCondition);
    dialog.instructionType = item.instruction->GetType();
    dialog.Param = item.instruction->GetParameters();
    dialog.isInverted = item.instruction->IsInverted();
    dialog.RefreshFromInstruction();
    dialog.Fit();

    if (dialog.ShowModal() == 0)
    {
        item.instruction->SetType( dialog.instructionType );
        item.instruction->SetParameters( dialog.Param );
        item.instruction->SetInverted( dialog.isInverted );

        item.event->eventHeightNeedUpdate = true;
        Refresh();
        ChangesMadeOnEvents();
    }
}


void EventsEditor::OntoggleActivationSelected(wxCommandEvent& event)
{
    std::vector< EventItem > eventsSelected = selection.GetAllSelectedEvents();
    for (std::size_t i = 0;i<eventsSelected.size();++i)
    {
        if ( eventsSelected[i].event != std::shared_ptr<gd::BaseEvent>())
            eventsSelected[i].event->SetDisabled(!eventsSelected[i].event->IsDisabled());
    }
    ChangesMadeOnEvents();
}


void EventsEditor::OnaddMoreIconPnlLeftDown(wxMouseEvent& event)
{
    wxCommandEvent useless;
    OnaddMoreBtClick(useless);
}
void EventsEditor::OnaddSubEventIconPnlLeftDown(wxMouseEvent& event)
{
    wxCommandEvent useless;
    OnaddSubEventBtClick(useless);
}
void EventsEditor::OnaddEventIconPnlLeftDown(wxMouseEvent& event)
{
    wxCommandEvent useless;
    OnaddEventBtClick(useless);
}
void EventsEditor::OnaddInstrIconPnlLeftDown(wxMouseEvent& event)
{
    wxCommandEvent useless;
    OnaddInstrBtClick(useless);
}

void EventsEditor::OnaddEventIconPnlMouseEnter(wxMouseEvent& event)
{
    addEventBt->SetForegroundColour(wxColor(255,0,0));
    addEventBt->Refresh();
    addEventBt->Update();
}

void EventsEditor::OnaddEventIconPnlMouseLeave(wxMouseEvent& event)
{
    addEventBt->SetForegroundColour(wxColor(0,0,0));
    addEventBt->Refresh();
    addEventBt->Update();
}

void EventsEditor::OnaddSubEventIconPnlMouseEnter(wxMouseEvent& event)
{
    addSubEventBt->SetForegroundColour(wxColor(255,0,0));
    addSubEventBt->Refresh();
    addSubEventBt->Update();
}

void EventsEditor::OnaddSubEventIconPnlMouseLeave(wxMouseEvent& event)
{
    addSubEventBt->SetForegroundColour(wxColor(0,0,0));
    addSubEventBt->Refresh();
    addSubEventBt->Update();
}

void EventsEditor::OnaddMoreIconPnlMouseEnter(wxMouseEvent& event)
{
    addMoreBt->SetForegroundColour(wxColor(255,0,0));
    addMoreBt->Refresh();
    addMoreBt->Update();
}

void EventsEditor::OnaddMoreIconPnlMouseLeave(wxMouseEvent& event)
{
    addMoreBt->SetForegroundColour(wxColor(0,0,0));
    addMoreBt->Refresh();
    addMoreBt->Update();
}

void EventsEditor::OnaddInstrIconPnlMouseEnter(wxMouseEvent& event)
{
    addInstrBt->SetForegroundColour(wxColor(255,0,0));
    addInstrBt->Refresh();
    addInstrBt->Update();
}

void EventsEditor::OnaddInstrIconPnlMouseLeave(wxMouseEvent& event)
{
    addInstrBt->SetForegroundColour(wxColor(0,0,0));
    addInstrBt->Refresh();
    addInstrBt->Update();
}
