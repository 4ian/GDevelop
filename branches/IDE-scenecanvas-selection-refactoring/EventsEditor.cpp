/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
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
#include <wx/log.h>
#include <iostream>
#include <utility>
#include <algorithm>
#include "GDCore/Events/Event.h"
#include "GDCore/IDE/EventsEditorItemsAreas.h"
#include "GDCore/IDE/EventsEditorSelection.h"
#include "GDCore/IDE/EventsRenderingHelper.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/EventsRefactorer.h"
#include "GDCore/IDE/EventsChangesNotifier.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/CommonTools.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ExtensionBase.h"
#include "GDL/ExternalEvents.h"
#include "SceneCanvas.h"
#include "LogFileManager.h"
#include "GDL/IDE/Dialogs/ProfileDlg.h"
#include "SearchEvents.h"
#include "CreateTemplate.h"
#include "ChoixTemplateEvent.h"
#include "ChoixCondition.h"
#include "ChoixAction.h"
#include "Clipboard.h"
#undef CreateEvent //Disable an annoying macro
#undef DrawText //Disable an annoying macro

#include <SFML/System.hpp>

using namespace std;

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
const long EventsEditor::idRibbonTemplate = wxNewId();
const long EventsEditor::idRibbonCreateTemplate = wxNewId();
const long EventsEditor::idRibbonHelp = wxNewId();
const long EventsEditor::idRibbonProfiling = wxNewId();
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


EventsEditor::EventsEditor(wxWindow* parent, Game & game_, Scene & scene_, vector < gd::BaseEventSPtr > * events_, gd::MainFrameWrapper & mainFrameWrapper_ ) :
    game(game_),
    scene(scene_),
    externalEvents(NULL),
    events(events_),
    mainFrameWrapper(mainFrameWrapper_),
    sceneCanvas(NULL),
    conditionColumnWidth(350),
    isResizingColumns(false),
    leftMargin(20),
    foldBmp("res/fold.png", wxBITMAP_TYPE_ANY),
    unfoldBmp("res/unfold.png", wxBITMAP_TYPE_ANY),
    hideContextPanelsLabels(false),
    selection(refreshCallback),
    ctrlKeyDown(false),
    profilingActivated(false),
    refreshCallback(this)
{
	//(*Initialize(EventsEditor)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	eventsPanel = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	eventsPanel->SetBackgroundColour(wxColour(255,255,255));
	liveEditingPanel = new wxPanel(eventsPanel, ID_PANEL2, wxPoint(100,100), wxDefaultSize, wxSIMPLE_BORDER, _T("ID_PANEL2"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	liveEdit = new wxTextCtrl(liveEditingPanel, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(280,21), wxTE_AUTO_SCROLL|wxTE_PROCESS_ENTER, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer2->Add(liveEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	parameterEditBt = new wxBitmapButton(liveEditingPanel, ID_BITMAPBUTTON1, wxBitmap(wxImage(_T("res/editicon.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON1"));
	FlexGridSizer2->Add(parameterEditBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	liveEditingPanel->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(liveEditingPanel);
	FlexGridSizer2->SetSizeHints(liveEditingPanel);
	eventContextPanel = new wxPanel(eventsPanel, ID_PANEL3, wxPoint(136,24), wxSize(224,40), wxNO_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 7, 0, 0);
	addEventIcon = new wxStaticBitmap(eventContextPanel, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/eventaddicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
	addEventIcon->SetToolTip(_("Add an event"));
	FlexGridSizer3->Add(addEventIcon, 1, wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	addEventBt = new wxStaticText(eventContextPanel, ID_STATICTEXT1, _("Add an event"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(addEventBt, 0, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 2);
	addSubEventIcon = new wxStaticBitmap(eventContextPanel, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/subeventaddicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	addSubEventIcon->SetToolTip(_("Add a sub event"));
	FlexGridSizer3->Add(addSubEventIcon, 1, wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	addSubEventBt = new wxStaticText(eventContextPanel, ID_STATICTEXT2, _("A sub event"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer3->Add(addSubEventBt, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
	addMoreIcon = new wxStaticBitmap(eventContextPanel, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/addicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	addMoreIcon->SetToolTip(_("Another event type"));
	FlexGridSizer3->Add(addMoreIcon, 1, wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	addMoreBt = new wxStaticText(eventContextPanel, ID_STATICTEXT3, _("Other"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer3->Add(addMoreBt, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
	eventContextPanel->SetSizer(FlexGridSizer3);
	FlexGridSizer3->SetSizeHints(eventContextPanel);
	listContextPanel = new wxPanel(eventsPanel, ID_PANEL4, wxPoint(136,50), wxSize(224,40), wxNO_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL4"));
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	addInstrIcon = new wxStaticBitmap(listContextPanel, ID_STATICBITMAP4, wxBitmap(wxImage(_T("res/addicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP4"));
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
	deleteMenu->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	eventsContextMenu.Append(deleteMenu);
	toggleActivation = new wxMenuItem((&eventsContextMenu), toggleActivationMenuItem, _("De/activate"), wxEmptyString, wxITEM_NORMAL);
	eventsContextMenu.Append(toggleActivation);
	eventsContextMenu.AppendSeparator();
	eventCopyMenu = new wxMenuItem((&eventsContextMenu), copyMenuItem, _("Copy\tCtrl+C"), wxEmptyString, wxITEM_NORMAL);
	eventCopyMenu->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
	eventsContextMenu.Append(eventCopyMenu);
	eventCutMenu = new wxMenuItem((&eventsContextMenu), cutMenuItem, _("Cut\tCtrl+X"), wxEmptyString, wxITEM_NORMAL);
	eventCutMenu->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
	eventsContextMenu.Append(eventCutMenu);
	eventPasteMenu = new wxMenuItem((&eventsContextMenu), ID_MENUITEM4, _("Paste\tCtrl+V"), wxEmptyString, wxITEM_NORMAL);
	eventPasteMenu->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	eventsContextMenu.Append(eventPasteMenu);
	eventsContextMenu.AppendSeparator();
	undoMenu = new wxMenuItem((&eventsContextMenu), ID_MENUITEM5, _("Cancel\tCtrl-Z"), wxEmptyString, wxITEM_NORMAL);
	undoMenu->SetBitmap(wxBitmap(wxImage(_T("res/undo.png"))));
	eventsContextMenu.Append(undoMenu);
	redoMenu = new wxMenuItem((&eventsContextMenu), ID_MENUITEM6, _("Redo\tCtrl-Y"), wxEmptyString, wxITEM_NORMAL);
	redoMenu->SetBitmap(wxBitmap(wxImage(_T("res/redo.png"))));
	eventsContextMenu.Append(redoMenu);
	MenuItem1 = new wxMenuItem((&multipleContextMenu), ID_MENUITEM7, _("Delete"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
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

	//Load configuration
	wxConfigBase * config = wxConfigBase::Get();
	conditionColumnWidth = config->ReadDouble("EventsEditor/ConditionColumnWidth", 350);
	hideContextPanelsLabels = config->ReadBool("EventsEditor/HideContextPanelsLabels", false);

	wxFont eventsEditorFont;
	if ( config->Read("EventsEditor/Font", &eventsEditorFont) )
        gd::EventsRenderingHelper::GetInstance()->SetFont(eventsEditorFont);

    //Adding events types
    ExtensionsManager * extensionManager = ExtensionsManager::GetInstance();
    const vector < boost::shared_ptr<ExtensionBase> > extensions = extensionManager->GetExtensions();

    //Insert extension specific events types
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.GetUsedPlatformExtensions().begin(),
                  game.GetUsedPlatformExtensions().end(),
                  extensions[i]->GetName()) == game.GetUsedPlatformExtensions().end() )
            continue;

        //Add each event type provided
	    std::map<std::string, EventInfos > allEventsProvidedByExtension = extensions[i]->GetAllEvents();
        for(std::map<string, EventInfos>::const_iterator it = allEventsProvidedByExtension.begin(); it != allEventsProvidedByExtension.end(); ++it)
        {
            //Find an identifier for the menu item
            long id = wxID_ANY;
            for (vector < std::pair<long, std::string> >::iterator idIter = idForEventTypesMenu.begin();
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
            menuItem->SetBitmap(it->second.smallicon);
            eventTypesMenu.Append(menuItem);
            Connect(id,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EventsEditor::OnAddCustomEventFromMenuSelected);
            mainFrameWrapper.GetMainEditor()->Connect(id, wxEVT_COMMAND_MENU_SELECTED, (wxObjectEventFunction)&EventsEditor::OnAddCustomEventFromMenuSelected, NULL, this);
        }
	}

    searchDialog = new SearchEvents(this, game, scene, events);

    RecomputeAllEventsWidth(*events); //Recompute all widths
    liveEditingPanel->Show(false);
    liveEdit->SetFont(gd::EventsRenderingHelper::GetInstance()->GetFont());
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

    latestState = CloneVectorOfEvents(*events);
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
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Insert"), wxBitmap("res/add24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        insertRibbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        insertRibbonBar->AddButton(idRibbonEvent, !hideLabels ? _("Add an event") : "", wxBitmap("res/eventadd24.png", wxBITMAP_TYPE_ANY));
        insertRibbonBar->AddButton(idRibbonSubEvent, !hideLabels ? _("Add a sub event") : "", wxBitmap("res/subeventadd24.png", wxBITMAP_TYPE_ANY));
        insertRibbonBar->AddButton(idRibbonCom, !hideLabels ? _("Add a comment") : "", wxBitmap("res/commentaireadd24.png", wxBITMAP_TYPE_ANY));
        insertRibbonBar->AddDropdownButton(idRibbonSomeEvent, !hideLabels ? _("Add...") : "", wxBitmap("res/add24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Delete"), wxBitmap("res/delete24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        deleteRibbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        deleteRibbonBar->AddButton(idRibbonDelEvent, !hideLabels ? _("Delete the selection") : "", wxBitmap("res/delete24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Cancelling"), wxBitmap("res/unredo24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        undoRibbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        undoRibbonBar->AddButton(idRibbonUndo, !hideLabels ? _("Cancel") : "", wxBitmap("res/undo24.png", wxBITMAP_TYPE_ANY));
        undoRibbonBar->AddButton(idRibbonRedo, !hideLabels ? _("Redo") : "", wxBitmap("res/redo24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Clipboard"), wxBitmap("res/copy24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        clipboardRibbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        clipboardRibbonBar->AddButton(idRibbonCopy, !hideLabels ? _("Copy") : "", wxBitmap("res/copy24.png", wxBITMAP_TYPE_ANY));
        clipboardRibbonBar->AddButton(idRibbonCut, !hideLabels ? _("Cut") : "", wxBitmap("res/cut24.png", wxBITMAP_TYPE_ANY));
        clipboardRibbonBar->AddButton(idRibbonPaste, !hideLabels ? _("Paste") : "", wxBitmap("res/paste24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Templates"), wxBitmap("res/template24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        templateRibbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        templateRibbonBar->AddButton(idRibbonTemplate, !hideLabels ? _("Insert") : "", wxBitmap("res/template24.png", wxBITMAP_TYPE_ANY));
        templateRibbonBar->AddButton(idRibbonCreateTemplate, !hideLabels ? _("Create") : "", wxBitmap("res/addtemplate24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Search"), wxBitmap("res/search24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idSearchReplace, !hideLabels ? _("Search / Replace") : "", wxBitmap("res/search24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("View"), wxBitmap("res/view24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonFoldAll, !hideLabels ? _("Fold all") : "", wxBitmap("res/foldAll24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonUnFoldAll, !hideLabels ? _("Unfold all") : "", wxBitmap("res/unFoldAll24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Tools"), wxBitmap("res/profiler24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonProfiling, !hideLabels ? _("Display performances") : "", wxBitmap("res/profiler24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Help"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonHelp, !hideLabels ? _("Help") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
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
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonTemplate, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OnTemplateBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonCreateTemplate, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OnCreateTemplateBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idSearchReplace, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OnSearchBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonProfiling, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EventsEditor::OnProfilingBtClick, NULL, this);
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
void EventsEditor::RecomputeAllEventsWidth(vector < gd::BaseEventSPtr > & eventsToRefresh)
{
    vector<gd::BaseEventSPtr>::iterator e = eventsToRefresh.begin();
    vector<gd::BaseEventSPtr>::const_iterator end = eventsToRefresh.end();

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
    //Prepare dc and background
    wxBufferedPaintDC dc(eventsPanel);
    dc.SetPen(wxPen(wxColour(246, 246, 246)));
    dc.SetBrush(wxBrush(wxColour(246, 246, 246)));
    dc.DrawRectangle(0,0,eventsPanel->GetSize().x,eventsPanel->GetSize().y);

    //Clear selection areas
    itemsAreas.Clear();

    unsigned int totalHeight = DrawEvents(dc, *events, leftMargin + ( profilingActivated ? 23 : 0), -scrollBar->GetThumbPosition());

    wxString text;
    if ( events->empty() )
        text = _("Add an event with the ribbon.\nHighlight then an event/action/condition with the cursor to get more edition options,\nor make a double click to edit an item.");
    else
        text = _("Highlight then an event/action/condition with the cursor to get more edition options,\nor make a double click to edit an item.");
    dc.SetTextForeground(wxColor(0,0,0));
    dc.SetFont(gd::EventsRenderingHelper::GetInstance()->GetNiceFont());
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

unsigned int EventsEditor::DrawEvents(wxDC & dc, std::vector < boost::shared_ptr< gd::BaseEvent > > & events, int x, int y, boost::shared_ptr< gd::BaseEvent > scrollTo  )
{
    int originalYPosition = y;

    for (unsigned int i = 0;i<events.size();++i)
    {
        if ( scrollTo == events[i] ) scrollBar->SetThumbPosition(y);

        dc.SetFont(gd::EventsRenderingHelper::GetInstance()->GetFont());
        dc.SetTextForeground(wxColour(0,0,0));

        gd::EventsRenderingHelper::GetInstance()->SetConditionsColumnWidth(conditionColumnWidth-x);
        unsigned int width = eventsPanel->GetSize().x-x > 0 ? eventsPanel->GetSize().x-x : 1;
        unsigned int height = events[i]->GetRenderedHeight(width);

        if( !(y+static_cast<int>(height) < 0 || y > eventsPanel->GetSize().y) ) //Render only if needed
        {
            //Event drawing :
            EventItem eventAccessor(events[i], &events, i);

            bool drawDragTarget = false;
            if ( selection.EventHighlighted(eventAccessor) ) //Highlight and context panel if needed
            {
                dc.SetPen(gd::EventsRenderingHelper::GetInstance()->GetHighlightedRectangleOutlinePen());
                dc.SetBrush(gd::EventsRenderingHelper::GetInstance()->GetHighlightedRectangleFillBrush());
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
                dc.SetPen(gd::EventsRenderingHelper::GetInstance()->GetSelectedRectangleOutlinePen());
                dc.SetBrush(gd::EventsRenderingHelper::GetInstance()->GetSelectedRectangleFillBrush());
                dc.DrawRectangle(0,y,eventsPanel->GetSize().x,height);
            }

            if (profilingActivated && events[i]->IsExecutable())
            {
                dc.DrawText(ToString(i+1), x-leftMargin+2-42, y);
                dc.SetFont(gd::EventsRenderingHelper::GetInstance()->GetNiceFont().Smaller());

                //Draw profile results
                dc.SetPen(wxPen(wxColour(0,0,0)));
                dc.SetBrush(wxColour(255.0f,255.0f*(1.0f-events[i]->percentDuringLastSession*0.05f),255.0f*(1.0f-events[i]->percentDuringLastSession*0.05f)));
                dc.DrawRectangle(x-41-2, y, 41,26);

                std::ostringstream timeStr; timeStr.setf(ios::fixed,ios::floatfield); timeStr.precision(2);
                timeStr << static_cast<double>(events[i]->totalTimeDuringLastSession)/1000.0f;
                dc.DrawText(timeStr.str()+"ms", x-41, y+1);

                std::ostringstream percentStr; percentStr.setf(ios::fixed,ios::floatfield); percentStr.precision(2);
                percentStr << events[i]->percentDuringLastSession;
                dc.DrawText(percentStr.str()+"%", x-41, y+13);
                dc.SetFont(gd::EventsRenderingHelper::GetInstance()->GetFont());
            }
            else
                dc.DrawText(ToString(i+1), x-leftMargin+2, y+3);


            //Event rendering
            events[i]->Render(dc, x, y, width, itemsAreas, selection);

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


void EventsEditor::OnlistContextPanelPaint(wxPaintEvent& event)
{
    wxBufferedPaintDC dc(listContextPanel);

    if ( selection.GetHighlightedInstructionList().isConditionList )
    {
        dc.SetPen(gd::EventsRenderingHelper::GetInstance()->GetConditionsRectangleOutlinePen());
        dc.SetBrush(gd::EventsRenderingHelper::GetInstance()->GetConditionsRectangleFillBrush());
    }
    else
    {
        dc.SetPen(gd::EventsRenderingHelper::GetInstance()->GetActionsRectangleOutlinePen());
        dc.SetBrush(gd::EventsRenderingHelper::GetInstance()->GetActionsRectangleFillBrush());
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
        dc.SetPen(gd::EventsRenderingHelper::GetInstance()->GetSelectedRectangleOutlinePen());
        dc.SetBrush(gd::EventsRenderingHelper::GetInstance()->GetSelectedRectangleFillBrush());
    }
    else
    {
        dc.SetPen(gd::EventsRenderingHelper::GetInstance()->GetHighlightedRectangleOutlinePen());
        dc.SetBrush(gd::EventsRenderingHelper::GetInstance()->GetHighlightedRectangleFillBrush());
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
    if ( templateRibbonBar != NULL ) templateRibbonBar->EnableButton(idRibbonTemplate, selection.HasSelectedEvents());
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

    if ( selection.EndDragEvent(!ctrlKeyDown, selection.IsEventHighlightedOnBottomPart()) || selection.EndDragInstruction(!ctrlKeyDown, selection.IsInstructionHighlightedOnBottomPart()) )
        ChangesMadeOnEvents();

    Refresh();
}

void EventsEditor::OneventsPanelLeftDown(wxMouseEvent& event)
{
    eventsPanel->SetFocusIgnoringChildren();

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
        InstructionItem item = itemsAreas.GetInstructionAt(x, y);

        if ( !ctrlKeyDown && !selection.InstructionSelected(item) ) selection.ClearSelection();
        selection.AddInstruction(item);

        //Log file
        if ( LogFileManager::GetInstance()->IsLogActivated() )
        {
            if ( itemsAreas.IsOnEvent(x, y) )
            {
                EventItem eventItem = itemsAreas.GetEventAt(x, y);
                if ( item.isCondition )
                    LogFileManager::GetInstance()->WriteToLogFile("Condition selected ( Layout \""+scene.GetName()+"\", Event position in the last list: "+ToString(eventItem.positionInList)+" )");
                else
                    LogFileManager::GetInstance()->WriteToLogFile("Action selected ( Layout \""+scene.GetName()+"\", Event position in the last list: "+ToString(eventItem.positionInList)+" )");
            }
        }
    }
    //Un/folding?
    else if ( itemsAreas.IsOnFoldingItem(x, y) )
    {
        if ( !ctrlKeyDown ) selection.ClearSelection();
        gd::BaseEvent * eventToFold = itemsAreas.GetFoldingItemAt(x, y).event;
        if ( eventToFold != NULL )
        {
            eventToFold->folded = !eventToFold->folded;
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
        LogFileManager::GetInstance()->WriteToLogFile("Event selected ( Layout \""+scene.GetName()+"\", Event position in the last list: "+ToString(item.positionInList)+" )");
    }
}

void EventsEditor::OneventsPanelLeftDClick(wxMouseEvent& event)
{
    //gd::Instruction selection?
    if ( itemsAreas.IsOnInstruction(event.GetX(), event.GetY()) )
    {
        InstructionItem item = itemsAreas.GetInstructionAt(event.GetX(), event.GetY());

        if (item.instruction == NULL || item.instructionList == NULL || item.event == NULL) return;

        if ( item.isCondition )
        {
            ChoixCondition dialog(this, game, scene);
            dialog.Type = item.instruction->GetType();
            dialog.Param = item.instruction->GetParameters();
            dialog.conditionInverted = item.instruction->IsInverted();
            dialog.RefreshFromCondition();
            dialog.Fit();

            if ( dialog.ShowModal() == 0)
            {
                item.instruction->SetType( dialog.Type );
                item.instruction->SetParameters( dialog.Param );
                item.instruction->SetInverted( dialog.conditionInverted );

                item.event->eventHeightNeedUpdate = true;
                Refresh();
                ChangesMadeOnEvents();
            }
        }
        else
        {
            ChoixAction dialog(this, game, scene);
            dialog.Type = item.instruction->GetType();
            dialog.Param = item.instruction->GetParameters();
            dialog.RefreshFromAction();
            dialog.Fit();

            if ( dialog.ShowModal() == 0)
            {
                item.instruction->SetType( dialog.Type );
                item.instruction->SetParameters( dialog.Param );

                item.event->eventHeightNeedUpdate = true;
                Refresh();
                ChangesMadeOnEvents();
            }
        }
    }
    else if (itemsAreas.IsOnInstructionList(event.GetX(), event.GetY()) )
    {
        InstructionListItem item = itemsAreas.GetInstructionListAt(event.GetX(), event.GetY());

        if ( item.instructionList == NULL || item.event == NULL) return;

        if ( item.isConditionList )
        {
            ChoixCondition dialog(this, game, scene);
            if ( dialog.ShowModal() == 0)
            {
                gd::Instruction instruction;
                instruction.SetType( dialog.Type );
                instruction.SetParameters( dialog.Param );
                instruction.SetInverted( dialog.conditionInverted );

                item.instructionList->push_back(instruction);
                item.event->eventHeightNeedUpdate = true;
                Refresh();
                ChangesMadeOnEvents();
            }
        }
        else
        {
            ChoixAction dialog(this, game, scene);
            if ( dialog.ShowModal() == 0)
            {
                gd::Instruction instruction;
                instruction.SetType( dialog.Type );
                instruction.SetParameters( dialog.Param );

                item.instructionList->push_back(instruction);
                item.event->eventHeightNeedUpdate = true;
                Refresh();
                ChangesMadeOnEvents();
            }
        }
    }
    //Event selection?
    else if ( itemsAreas.IsOnEvent(event.GetX(), event.GetY()) )
    {
        boost::shared_ptr<gd::BaseEvent> evt = itemsAreas.GetEventAt(event.GetX(), event.GetY()).event;

        if ( evt == boost::shared_ptr<gd::BaseEvent>() ) return;

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
    if (!liveEditingPanel->IsShown())
        eventsPanel->SetFocusIgnoringChildren();

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
    InstructionListItem dummy2;
    selection.SetHighlighted(dummy2);
    InstructionItem dummy3;
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
    if ( event.GetKeyCode() == WXK_CONTROL )
    {
        ctrlKeyDown = true;
    }
    else if ( event.GetKeyCode() == WXK_DELETE )
    {
        DeleteSelection();
    }
    else if ( event.GetKeyCode() == WXK_INSERT )
    {
        wxCommandEvent unusedEvent;
        OnaddEventBtClick( unusedEvent );
    }
    if ( event.GetModifiers() == wxMOD_CMD ) //Ctrl-xxx
    {
        switch ( event.GetKeyCode() )
        {
            case 67: //Ctrl C
            {
                wxCommandEvent unusedEvent;
                OneventCopyMenuSelected( unusedEvent );
                break;
            }
            case 86: //Ctrl-V
            {
                wxCommandEvent unusedEvent;
                OneventPasteMenuSelected( unusedEvent );
                break;
            }
            case 88: //Ctrl-X
            {
                wxCommandEvent unusedEvent;
                OneventCutMenuSelected( unusedEvent );
                break;
            }
            case 89: //Ctrl-Y
            {
                wxCommandEvent unusedEvent;
                OnredoMenuSelected( unusedEvent );
                break;
            }
            case 90: //Ctrl-Z
            {
                wxCommandEvent unusedEvent;
                OnundoMenuSelected( unusedEvent );
                break;
            }
            default:
                break;
        }
    }
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
    for (unsigned int i = 0; i<eventsSelection.size();++i)
    {
        if ( eventsSelection[i].event != boost::shared_ptr<gd::BaseEvent>() && eventsSelection[i].eventsList != NULL)
            eventsSelection[i].eventsList->erase(std::remove(eventsSelection[i].eventsList->begin(), eventsSelection[i].eventsList->end(), eventsSelection[i].event) , eventsSelection[i].eventsList->end());
    }

    selection.ClearSelection();
    Refresh();
    ChangesMadeOnEvents();
}

void EventsEditor::ChangesMadeOnEvents(bool updateHistory, bool noNeedForSceneRecompilation)
{
    if ( updateHistory )
    {
        history.push_back(CloneVectorOfEvents(latestState));
        redoHistory.clear();
        latestState = CloneVectorOfEvents(*events);
    }

    if ( !noNeedForSceneRecompilation )
    {
        if ( externalEvents != NULL )
            gd::EventsChangesNotifier::NotifyChangesInEventsOfExternalEvents(game, *externalEvents);
        else
            gd::EventsChangesNotifier::NotifyChangesInEventsOfScene(game, scene);
    }
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

    eventsPanel->SetFocusIgnoringChildren();
    *liveEditedParameter.parameter = gd::Expression(ToString(liveEdit->GetValue()));
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


void EventsEditor::OnaddInstrBtClick(wxCommandEvent& event)
{
    InstructionListItem listHighlighted = selection.GetHighlightedInstructionList();
    if ( listHighlighted.instructionList == NULL ) return;

    if ( listHighlighted.isConditionList )
    {
        ChoixCondition dialog(this, game, scene);
        if ( dialog.ShowModal() == 0)
        {
            gd::Instruction instruction;
            instruction.SetType(dialog.Type);
            instruction.SetParameters(dialog.Param);
            instruction.SetInverted(dialog.conditionInverted);

            listHighlighted.instructionList->push_back(instruction);
            listHighlighted.event->eventHeightNeedUpdate = true;
            Refresh();
            ChangesMadeOnEvents();
        }
    }
    else
    {
        ChoixAction dialog(this, game, scene);
        if ( dialog.ShowModal() == 0)
        {
            gd::Instruction instruction;
            instruction.SetType(dialog.Type);
            instruction.SetParameters(dialog.Param);

            listHighlighted.instructionList->push_back(instruction);
            listHighlighted.event->eventHeightNeedUpdate = true;
            Refresh();
            ChangesMadeOnEvents();
        }
    }
}

/**
 * Add an event
 */
void EventsEditor::AddEvent(EventItem & previousEventItem)
{
    gd::BaseEventSPtr eventToAdd = ExtensionsManager::GetInstance()->CreateEvent("BuiltinCommonInstructions::Standard");
    if ( eventToAdd != boost::shared_ptr<gd::BaseEvent>() )
    {
        //Edit the event
        eventToAdd->EditEvent(this, game, scene, mainFrameWrapper);

        //Adding event
        if ( previousEventItem.eventsList != NULL )
        {
            if ( previousEventItem.positionInList < previousEventItem.eventsList->size() )
                previousEventItem.eventsList->insert( previousEventItem.eventsList->begin() + previousEventItem.positionInList+1, eventToAdd );
            else
                previousEventItem.eventsList->push_back( eventToAdd );
        }
        else if ( events != NULL )
            events->push_back( eventToAdd );

        Refresh();
        ChangesMadeOnEvents();
    }
    else
        wxLogError(_("Unable to create standard event."));
}

void EventsEditor::OnaddEventBtClick(wxCommandEvent& event)
{
    EventItem & highlightedEvent = selection.GetHighlightedEvent();
    if ( highlightedEvent.event == boost::shared_ptr<gd::BaseEvent>() ) return;

    AddEvent(highlightedEvent);
}
void EventsEditor::OnRibbonAddEventBtClick(wxRibbonButtonBarEvent& evt)
{
    std::vector< EventItem > eventsSelected = selection.GetAllSelectedEvents();

    if ( !eventsSelected.empty() && eventsSelected[0].event != boost::shared_ptr<gd::BaseEvent>() )
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
    if ( !eventsSelected.empty() && eventsSelected[0].event != boost::shared_ptr<gd::BaseEvent>() ) previousEventItem = eventsSelected[0];

    gd::BaseEventSPtr eventToAdd = ExtensionsManager::GetInstance()->CreateEvent("BuiltinCommonInstructions::Comment");
    if ( eventToAdd != boost::shared_ptr<gd::BaseEvent>() )
    {
        if ( eventToAdd->EditEvent(this, game, scene, mainFrameWrapper) == gd::BaseEvent::Cancelled ) return;

        //Adding event
        if ( previousEventItem.eventsList != NULL )
        {
            if ( previousEventItem.positionInList < previousEventItem.eventsList->size() )
                previousEventItem.eventsList->insert( previousEventItem.eventsList->begin() + previousEventItem.positionInList+1, eventToAdd );
            else
                previousEventItem.eventsList->push_back( eventToAdd );
        }
        else if ( events != NULL)
            events->push_back( eventToAdd );

        Refresh();
        ChangesMadeOnEvents();
    }
    else
        wxLogError(_("Unable to create a comment event."));
}

/**
 * Add a sub event
 */
void EventsEditor::AddSubEvent(EventItem & parentEventItem)
{
    gd::BaseEventSPtr eventToAdd = ExtensionsManager::GetInstance()->CreateEvent("BuiltinCommonInstructions::Standard");
    if ( eventToAdd != boost::shared_ptr<gd::BaseEvent>() )
    {
        eventToAdd->EditEvent(this, game, scene, mainFrameWrapper);

        //Adding event
        parentEventItem.event->GetSubEvents().insert( parentEventItem.event->GetSubEvents().begin(), eventToAdd );

        Refresh();
        ChangesMadeOnEvents();
    }
    else
        wxLogError(_("Unable to create standard event."));
}

void EventsEditor::OnaddSubEventBtClick(wxCommandEvent& event)
{
    EventItem & highlightedEvent = selection.GetHighlightedEvent();
    if ( highlightedEvent.event == boost::shared_ptr<gd::BaseEvent>() || !highlightedEvent.event->CanHaveSubEvents() ) return;

    AddSubEvent(highlightedEvent);
}
void EventsEditor::OnRibbonAddSubEventSelected(wxRibbonButtonBarEvent& evt)
{
    std::vector< EventItem > eventsSelected = selection.GetAllSelectedEvents();
    if ( eventsSelected.empty() || eventsSelected[0].event == boost::shared_ptr<gd::BaseEvent>() ) return;

    AddSubEvent(eventsSelected[0]);
}

/**
 * Add event of selected type
 */
void EventsEditor::AddCustomEventFromMenu(unsigned int menuID, EventItem & previousEventItem)
{
    //Retrieve event type
    string eventType;
    for (unsigned int i = 0;i<idForEventTypesMenu.size();++i)
    {
    	if ( idForEventTypesMenu[i].first == menuID )
            eventType = idForEventTypesMenu[i].second;
    }

    //Create event
    if ( !ExtensionsManager::GetInstance()->HasEventType(eventType) ) return;
    gd::BaseEventSPtr eventToAdd = ExtensionsManager::GetInstance()->CreateEvent(eventType);
    if ( eventToAdd->EditEvent(this, game, scene, mainFrameWrapper) == gd::BaseEvent::Cancelled ) return;

    //Adding event
    if ( previousEventItem.eventsList != NULL )
    {
        if ( previousEventItem.positionInList < previousEventItem.eventsList->size() )
            previousEventItem.eventsList->insert( previousEventItem.eventsList->begin() + previousEventItem.positionInList+1, eventToAdd );
        else
            previousEventItem.eventsList->push_back( eventToAdd );
    }
    else if ( events != NULL)
        events->push_back( eventToAdd );

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
    if ( selection.GetHighlightedEvent().event == boost::shared_ptr<gd::BaseEvent>() ) return;
    selection.AddEvent(selection.GetHighlightedEvent());

    PopupMenu(&eventTypesMenu);
}

void EventsEditor::ScrollToEvent(gd::BaseEventSPtr eventToScrollTo)
{
    wxClientDC dc(eventsPanel);
    DrawEvents(dc, *events, leftMargin + ( profilingActivated ? 23 : 0), 0, eventToScrollTo);
    Refresh();
}

void EventsEditor::OndeleteMenuSelected(wxCommandEvent& event)
{
    DeleteSelection();
}

void EventsEditor::OnRibbonFoldAll(wxRibbonButtonBarEvent& evt)
{
    FoldEventListAndSubEvents(*events, true);
    Refresh();
}

void EventsEditor::OnRibbonUnFoldAll(wxRibbonButtonBarEvent& evt)
{
    FoldEventListAndSubEvents(*events, false);
    Refresh();
}

void EventsEditor::FoldEventListAndSubEvents(std::vector<boost::shared_ptr<gd::BaseEvent> > & list, bool fold)
{
    for (unsigned int i = 0;i<list.size();++i)
    {
        list[i]->folded = fold;
        if ( list[i]->CanHaveSubEvents() )  FoldEventListAndSubEvents(list[i]->GetSubEvents(), fold);
    }
}

void EventsEditor::OneventCopyMenuSelected(wxCommandEvent& event)
{
    if ( selection.HasSelectedConditions())
    {
        std::vector < InstructionItem > itemsSelected = selection.GetAllSelectedInstructions();
        std::vector < gd::Instruction > instructionsToCopy;
        for (unsigned int i = 0;i<itemsSelected.size();++i)
        {
            if (itemsSelected[i].instruction != NULL)
                instructionsToCopy.push_back(*itemsSelected[i].instruction);
        }

        Clipboard::GetInstance()->SetConditions(instructionsToCopy);
    }
    else if ( selection.HasSelectedActions())
    {
        std::vector < InstructionItem > itemsSelected = selection.GetAllSelectedInstructions();
        std::vector < gd::Instruction > instructionsToCopy;
        for (unsigned int i = 0;i<itemsSelected.size();++i)
        {
            if (itemsSelected[i].instruction != NULL)
                instructionsToCopy.push_back(*itemsSelected[i].instruction);
        }

        Clipboard::GetInstance()->SetActions(instructionsToCopy);
    }
    else if ( selection.HasSelectedEvents() )
    {
        std::vector < EventItem > itemsSelected = selection.GetAllSelectedEventsWithoutSubEvents();
        std::vector < boost::shared_ptr<gd::BaseEvent> > eventsToCopy;
        for (unsigned int i = 0;i<itemsSelected.size();++i)
        {
            if (itemsSelected[i].event != boost::shared_ptr<gd::BaseEvent>())
                eventsToCopy.push_back(itemsSelected[i].event->Clone());
        }

        Clipboard::GetInstance()->SetEvents(eventsToCopy);
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
        if ( !Clipboard::GetInstance()->HasCondition() ) return;

        //Get information about list where conditions must be pasted
        std::vector<gd::Instruction> * instructionList = selection.HasSelectedConditions() ? selection.GetAllSelectedInstructions().back().instructionList : selection.GetHighlightedInstructionList().instructionList;
        size_t positionInThisList = selection.HasSelectedConditions() ? selection.GetAllSelectedInstructions().back().positionInList : std::string::npos;
        gd::BaseEvent * event = selection.HasSelectedConditions() ? selection.GetAllSelectedInstructions().back().event : selection.GetHighlightedInstructionList().event;
        if (instructionList == NULL) return;

        //Paste all conditions
        const vector < gd::Instruction > & instructions = Clipboard::GetInstance()->GetInstructions();
        for (unsigned int i = 0;i<instructions.size();++i)
        {
            if ( positionInThisList < instructionList->size() )
                instructionList->insert(instructionList->begin()+positionInThisList, instructions[i]);
            else
                instructionList->push_back(instructions[i]);
        }

        if ( event != NULL ) event->eventHeightNeedUpdate = true;
        if ( !instructions.empty() ) ChangesMadeOnEvents();
        Refresh();
    }
    else if ( selection.HasSelectedActions()|| (selection.GetHighlightedInstructionList().instructionList != NULL && !selection.GetHighlightedInstructionList().isConditionList) )
    {
        if ( !Clipboard::GetInstance()->HasAction() ) return;

        //Get information about list where actions must be pasted
        std::vector<gd::Instruction> * instructionList = selection.HasSelectedActions() ? selection.GetAllSelectedInstructions().back().instructionList : selection.GetHighlightedInstructionList().instructionList;
        size_t positionInThisList = selection.HasSelectedActions() ? selection.GetAllSelectedInstructions().back().positionInList : std::string::npos;
        gd::BaseEvent * event = selection.HasSelectedActions() ? selection.GetAllSelectedInstructions().back().event : selection.GetHighlightedInstructionList().event;
        if (instructionList == NULL) return;

        //Paste all actions
        const vector < gd::Instruction > & instructions = Clipboard::GetInstance()->GetInstructions();
        for (unsigned int i = 0;i<instructions.size();++i)
        {
            if ( positionInThisList < instructionList->size() )
                instructionList->insert(instructionList->begin()+positionInThisList, instructions[i]);
            else
                instructionList->push_back(instructions[i]);
        }

        if ( event != NULL ) event->eventHeightNeedUpdate = true;
        if ( !instructions.empty() ) ChangesMadeOnEvents();
        Refresh();
    }
    else
    {
        std::vector<boost::shared_ptr<gd::BaseEvent> > * eventsList; //The list where events should be inserted.
        unsigned int position = std::string::npos; //The position where events should be inserted in the list.

        //Find where events should be inserted
        if ( selection.HasSelectedEvents())
        {
            EventItem item = selection.GetAllSelectedEvents().back();
            eventsList = item.eventsList;
            position = item.positionInList;
        }
        else
            eventsList = events;

        if (eventsList == NULL) return;

        //Insert events
        vector < boost::shared_ptr <gd::BaseEvent> > eventsToPaste = Clipboard::GetInstance()->GetEvents();
        std::cout << "EventToPaste" << eventsToPaste.size();
        for (unsigned int i = 0;i<eventsToPaste.size();++i)
        {
            if ( position < eventsList->size() )
                eventsList->insert(eventsList->begin()+position, eventsToPaste[i]->Clone());
            else
                eventsList->push_back(eventsToPaste[i]->Clone());
        }

        if ( !eventsToPaste.empty() ) ChangesMadeOnEvents();
        Refresh();
    }
}

void EventsEditor::OnundoMenuSelected(wxCommandEvent& event)
{
    if ( history.empty() ) return;

    redoHistory.push_back(CloneVectorOfEvents(*events));
    *events = CloneVectorOfEvents(history.back());
    history.pop_back();

    latestState = CloneVectorOfEvents(*events);

    Refresh();
    UpdateRibbonBars();
    ChangesMadeOnEvents(false);
}

void EventsEditor::OnredoMenuSelected(wxCommandEvent& event)
{
    if ( redoHistory.empty() ) return;

    history.push_back(CloneVectorOfEvents(*events));
    *events = CloneVectorOfEvents(redoHistory.back());
    redoHistory.pop_back();

    latestState = CloneVectorOfEvents(*events);

    Refresh();
    UpdateRibbonBars();
    ChangesMadeOnEvents(false);
}

void EventsEditor::OnHelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/edit_event"));
}

void EventsEditor::OnCreateTemplateBtClick( wxCommandEvent& event )
{
    std::vector< EventItem > eventsSelected = selection.GetAllSelectedEventsWithoutSubEvents();
    if ( eventsSelected.empty() )
    {
        wxLogMessage(_("Please select events to use so as to create the template, and then click again on the Create button."));
        return;
    }

    std::vector< boost::shared_ptr<gd::BaseEvent> > eventsToUse;
    for (unsigned int i = 0;i<eventsSelected.size();++i)
    {
        if (eventsSelected[i].event != boost::shared_ptr<gd::BaseEvent>())
            eventsToUse.push_back(eventsSelected[i].event->Clone());
    }

    CreateTemplate dialog( this, eventsToUse );
    dialog.ShowModal();
}

void EventsEditor::OnTemplateBtClick( wxCommandEvent& event )
{
    std::vector< EventItem > eventsSelected = selection.GetAllSelectedEventsWithoutSubEvents();
    if ( eventsSelected.empty() || eventsSelected[0].eventsList == NULL )
    {
        wxLogMessage("Selectionnez un évènement où insérer le modèle puis recliquez sur le bouton.");
        return;
    }

    ChoixTemplateEvent dialog( this );
    if ( dialog.ShowModal() != 1 ) return;

    //Insert new events
    for ( unsigned int i = 0;i < dialog.finalTemplate.events.size();i++ )
    {
        if ( eventsSelected[0].positionInList < eventsSelected[0].eventsList->size() )
            eventsSelected[0].eventsList->insert( eventsSelected[0].eventsList->begin()+eventsSelected[0].positionInList+1, dialog.finalTemplate.events[i] );
        else
            eventsSelected[0].eventsList->push_back( dialog.finalTemplate.events[i] );
    }

    ChangesMadeOnEvents();
}

void EventsEditor::OnSearchBtClick(wxCommandEvent& event)
{
    if ( searchDialog )
        searchDialog->Show();
}

void EventsEditor::OnProfilingBtClick(wxCommandEvent& event)
{
    if (sceneCanvas && sceneCanvas->GetProfileDialog() != boost::shared_ptr<ProfileDlg>())
    {
        if ( !profilingActivated && !sceneCanvas->GetProfileDialog()->profilingActivated)
        {
            wxLogMessage(_("Profiling is not activated. Activate profiling thanks to the Profiling window when previewing a scene."));
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

    InstructionItem & item = liveEditedAssociatedInstruction;

    if (item.instruction == NULL || item.instructionList == NULL || item.event == NULL) return;

    if ( item.isCondition )
    {
        ChoixCondition dialog(this, game, scene);
        dialog.Type = item.instruction->GetType();
        dialog.Param = item.instruction->GetParameters();
        dialog.conditionInverted = item.instruction->IsInverted();
        dialog.RefreshFromCondition();
        dialog.Fit();

        if ( dialog.ShowModal() == 0)
        {
            item.instruction->SetType( dialog.Type );
            item.instruction->SetParameters( dialog.Param );
            item.instruction->SetInverted( dialog.conditionInverted );

            item.event->eventHeightNeedUpdate = true;
            Refresh();
            ChangesMadeOnEvents();
        }
    }
    else
    {
        ChoixAction dialog(this, game, scene);
        dialog.Type = item.instruction->GetType();
        dialog.Param = item.instruction->GetParameters();
        dialog.RefreshFromAction();
        dialog.Fit();

        if ( dialog.ShowModal() == 0)
        {
            item.instruction->SetType( dialog.Type );
            item.instruction->SetParameters( dialog.Param );

            item.event->eventHeightNeedUpdate = true;
            Refresh();
            ChangesMadeOnEvents();
        }
    }
}


void EventsEditor::OntoggleActivationSelected(wxCommandEvent& event)
{
    std::vector< EventItem > eventsSelected = selection.GetAllSelectedEvents();
    for (unsigned int i = 0;i<eventsSelected.size();++i)
    {
        if ( eventsSelected[i].event != boost::shared_ptr<gd::BaseEvent>())
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

