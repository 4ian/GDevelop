/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EVENTSEDITOR_H
#define EVENTSEDITOR_H

//(*Headers(EventsEditor)
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/textctrl.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/bmpbuttn.h>
#include <wx/scrolbar.h>
//*)
#include <vector>
#include <boost/shared_ptr.hpp>
#include "GDL/MainEditorCommand.h"
#include "GDL/Event.h"
#include "GDL/EventsEditorItemsAreas.h"
#include "GDL/EventsEditorSelection.h"
class SearchEvents;
class Game;
class Scene;
class BaseEvent;

/**
 * Lightweight class to get refresh order
 */
class InternalEventsEditorRefreshCallbacks : public GDpriv::EventsEditorRefreshCallbacks
{
public:
    InternalEventsEditorRefreshCallbacks(EventsEditor * editor_) : editor(editor_) {};
    virtual ~InternalEventsEditorRefreshCallbacks() {};

    virtual void Refresh();

    EventsEditor * editor;
};

/**
 * Events editor
 */
class EventsEditor: public wxPanel
{
	public:

		EventsEditor(wxWindow* parent, Game & game, Scene & scene, vector < BaseEventSPtr > * events_, MainEditorCommand & mainEditorCommand_ );
		virtual ~EventsEditor();

		//(*Declarations(EventsEditor)
		wxMenuItem* redoMenu;
		wxMenuItem* MenuItem5;
		wxMenuItem* toggleActivation;
		wxMenuItem* eventPasteMenu;
		wxMenuItem* MenuItem1;
		wxPanel* addEventIconPnl;
		wxMenuItem* eventCutMenu;
		wxScrollBar* scrollBar;
		wxHyperlinkCtrl* addEventBt;
		wxMenu eventsContextMenu;
		wxMenuItem* undoMenu;
		wxHyperlinkCtrl* addInstrBt;
		wxMenuItem* deleteMenu;
		wxPanel* addSubEventIconPnl;
		wxTextCtrl* liveEdit;
		wxPanel* liveEditingPanel;
		wxPanel* eventContextPanel;
		wxPanel* listContextPanel;
		wxPanel* addInstrIconPnl;
		wxMenuItem* MenuItem6;
		wxPanel* addMoreIconPnl;
		wxMenu eventTypesMenu;
		wxPanel* eventsPanel;
		wxMenuItem* eventCopyMenu;
		wxHyperlinkCtrl* addMoreBt;
		wxMenu multipleContextMenu;
		wxBitmapButton* parameterEditBt;
		wxHyperlinkCtrl* addSubEventBt;
		//*)
        SearchEvents * searchDialog;

		void Refresh();

        /**
         * Scroll view to reach an event.
         */
        void ScrollToEvent(BaseEventSPtr event);

		static void CreateRibbonPage(wxRibbonPage * page);
		void ConnectEvents();

		void SetAssociatedSceneCanvas(SceneCanvas * sceneCanvas_) { sceneCanvas = sceneCanvas_; };
		SceneCanvas * GetAssociatedSceneCanvas() { return sceneCanvas; };

	protected:

		//(*Identifiers(EventsEditor)
		static const long ID_TEXTCTRL1;
		static const long ID_BITMAPBUTTON1;
		static const long ID_PANEL2;
		static const long ID_PANEL7;
		static const long ID_HYPERLINKCTRL2;
		static const long ID_PANEL6;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_PANEL5;
		static const long ID_HYPERLINKCTRL3;
		static const long ID_PANEL3;
		static const long ID_PANEL8;
		static const long ID_HYPERLINKCTRL4;
		static const long ID_PANEL4;
		static const long ID_PANEL1;
		static const long ID_SCROLLBAR1;
		static const long deleteMenuItem;
		static const long toggleActivationMenuItem;
		static const long copyMenuItem;
		static const long cutMenuItem;
		static const long ID_MENUITEM4;
		static const long ID_MENUITEM5;
		static const long ID_MENUITEM6;
		static const long ID_MENUITEM7;
		static const long ID_MENUITEM11;
		static const long ID_MENUITEM12;
		//*)
		static const long idRibbonEvent;
		static const long idRibbonCom;
		static const long idRibbonSubEvent;
		static const long idRibbonSomeEvent;
		static const long idRibbonDelEvent;
		static const long idRibbonUndo;
		static const long idRibbonRedo;
		static const long idRibbonCopy;
		static const long idRibbonCut;
		static const long idRibbonPaste;
		static const long idRibbonTemplate;
		static const long idRibbonCreateTemplate;
		static const long idRibbonHelp;
		static const long idSearchReplace;
		static const long idRibbonProfiling;
        static wxRibbonButtonBar * insertRibbonBar;
        static wxRibbonButtonBar * deleteRibbonBar;
        static wxRibbonButtonBar * clipboardRibbonBar;
        static wxRibbonButtonBar * templateRibbonBar;
        static wxRibbonButtonBar * undoRibbonBar;
		static vector < std::pair<long, std::string> > idForEventTypesMenu;

	private:

		//(*Handlers(EventsEditor)
		void OneventsPanelPaint(wxPaintEvent& event);
		void OneventsPanelLeftUp(wxMouseEvent& event);
		void OneventsPanelKeyDown(wxKeyEvent& event);
		void OneventsPanelKeyUp(wxKeyEvent& event);
		void OneventsPanelEraseBackground(wxEraseEvent& event);
		void OneventsPanelLeftDown(wxMouseEvent& event);
		void OneventsPanelMouseMove(wxMouseEvent& event);
		void OnscrollBarScroll(wxScrollEvent& event);
		void OnResize(wxSizeEvent& event);
		void OnliveEditTextEnter(wxCommandEvent& event);
		void OneventsPanelMouseWheel(wxMouseEvent& event);
		void OnliveEditText(wxCommandEvent& event);
		void OnaddEventBtClick(wxCommandEvent& event);
		void OnaddSubEventBtClick(wxCommandEvent& event);
		void OnaddMoreBtClick(wxCommandEvent& event);
		void OndeleteMenuSelected(wxCommandEvent& event);
		void OneventCopyMenuSelected(wxCommandEvent& event);
		void OneventCutMenuSelected(wxCommandEvent& event);
		void OneventPasteMenuSelected(wxCommandEvent& event);
		void OnundoMenuSelected(wxCommandEvent& event);
		void OnredoMenuSelected(wxCommandEvent& event);
		void OneventsPanelMouseLeave(wxMouseEvent& event);
		void OnaddInstrBtClick(wxCommandEvent& event);
		void OneventsPanelLeftDClick(wxMouseEvent& event);
		void OnlistContextPanelPaint(wxPaintEvent& event);
		void OneventContextPanelPaint(wxPaintEvent& event);
		void OnparameterEditBtClick(wxCommandEvent& event);
		void OneventsPanelMiddleUp(wxMouseEvent& event);
		void OneventsPanelRightUp(wxMouseEvent& event);
		void OntoggleActivationSelected(wxCommandEvent& event);
		void OnPanel1LeftDown(wxMouseEvent& event);
		void OnaddEventIconPnlPaint(wxPaintEvent& event);
		void OnaddMoreIconPnlPaint(wxPaintEvent& event);
		void OnaddMoreIconPnlLeftDown(wxMouseEvent& event);
		void OnaddSubEventIconPnlPaint(wxPaintEvent& event);
		void OnaddSubEventIconPnlLeftDown(wxMouseEvent& event);
		void OnaddEventIconPnlLeftDown(wxMouseEvent& event);
		void OnaddInstrIconPnlPaint(wxPaintEvent& event);
		void OnaddInstrIconPnlLeftDown(wxMouseEvent& event);
		//*)
		void UpdateRibbonBars();
		void OnHelpBtClick(wxCommandEvent& event);
        void OnTemplateBtClick(wxCommandEvent& event);
        void OnCreateTemplateBtClick(wxCommandEvent& event);
        void OnSearchBtClick(wxCommandEvent& event);
        void OnProfilingBtClick(wxCommandEvent& event);
        void OnAddCustomEventFromMenuSelected(wxCommandEvent& event);
        void OnRibbonAddEventBtClick(wxRibbonButtonBarEvent& evt);
        void OnRibbonAddCommentBtClick(wxRibbonButtonBarEvent& evt);
        void OnRibbonAddSubEventSelected(wxRibbonButtonBarEvent& evt);
        void OnRibbonAddCustomEventFromMenu(wxRibbonButtonBarEvent& evt);
        void HandleSelectionAfterClick(int x, int y, bool allowLiveEditingParameters = true);

        void AddEvent(EventItem & previousEventItem);
        void AddSubEvent(EventItem & parentEventItem);
        void AddCustomEventFromMenu(unsigned int menuID, EventItem & previousEventItem);

		void RecomputeAllEventsWidth(std::vector < boost::shared_ptr<BaseEvent> > & eventsToRefresh);
		void DeleteSelection();
		void ChangesMadeOnEvents(bool updateHistory = true);

        void EndLiveEditing();

        /**
         * Draw events.
         * \param wxDC where events are drawn
         * \param Events to be drawn
         * \param x position where draw events
         * \param y position where draw events
         * \param optional event that will be searched for. If event is found, it will be selected and scrollbar set to view this event
         */
        unsigned int DrawEvents(wxDC & dc, std::vector < boost::shared_ptr< BaseEvent > > & events, int x, int y, boost::shared_ptr< BaseEvent > scrollTo = boost::shared_ptr< BaseEvent >() );


		Game & game;
		Scene & scene;
        vector < BaseEventSPtr > * events; ///< Events modified are not necessarily the events of the scene
		MainEditorCommand & mainEditorCommand;
        SceneCanvas * sceneCanvas;

        EventsEditorItemsAreas itemsAreas; ///< Areas management
        EventsEditorSelection selection; ///<Selection management and input

        unsigned int conditionColumnWidth; ///< Size of the conditions column
        bool isResizingColumns; ///< True if user is resizeing column
        unsigned int leftMargin; ///< Margin size at the left of events

        wxBitmap foldBmp;
        wxBitmap unfoldBmp;

        ParameterItem liveEditedParameter; ///< Filled with information about parameter which is currently edited, if any.
        InstructionItem liveEditedAssociatedInstruction; ///< Filled with information about instruction of parameter which is currently edited, if any.
        bool liveEditingChangesMade; ///< Used to known if user changed something when live editing the parmameter.

        bool ctrlKeyDown;

        vector < vector < BaseEventSPtr > > history; ///<Changes history
        vector < vector < BaseEventSPtr > > redoHistory;
        std::vector < BaseEventSPtr > latestState; ///< Necessary to keep track of what changed

        bool profilingActivated;


        InternalEventsEditorRefreshCallbacks refreshCallback; ///< Used to allow external objects to request the editor to refresh

		DECLARE_EVENT_TABLE()
};

#endif
