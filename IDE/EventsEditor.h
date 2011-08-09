/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EVENTSEDITOR_H
#define EVENTSEDITOR_H

//(*Headers(EventsEditor)
#include <wx/sizer.h>
#include <wx/panel.h>
#include <wx/scrolbar.h>
//*)
#include <vector>
#include <boost/shared_ptr.hpp>
#include "GDL/MainEditorCommand.h"
#include "GDL/Event.h"
#include "GDL/EventsEditorItemsAreas.h"
#include "GDL/EventsEditorSelection.h"
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
		wxScrollBar* ScrollBar2;
		wxScrollBar* scrollBar;
		wxPanel* eventsPanel;
		//*)

		void Refresh();

		static void CreateRibbonPage(wxRibbonPage * page);
		void ConnectEvents();

		void SetAssociatedSceneCanvas(SceneCanvas * sceneCanvas_) { sceneCanvas = sceneCanvas_; };
		SceneCanvas * GetAssociatedSceneCanvas() { return sceneCanvas; };

	protected:

		//(*Identifiers(EventsEditor)
		static const long ID_PANEL1;
		static const long ID_SCROLLBAR1;
		static const long ID_SCROLLBAR2;
		//*)

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
		//*)
		void RecomputeAllEventsWidth(std::vector < boost::shared_ptr<BaseEvent> > & eventsToRefresh);

		Game & game;
		Scene & scene;
        vector < BaseEventSPtr > * events; ///< Events modified are not necessarily the events of the scene
		MainEditorCommand & mainEditorCommand;
        SceneCanvas * sceneCanvas;

        unsigned int conditionColumnWidth;

        wxBitmap foldBmp;
        wxBitmap unfoldBmp;

        //Areas management
        EventsEditorItemsAreas itemsAreas;

        //Selection management and input
        EventsEditorSelection selection;
        bool ctrlKeyDown;

        //Drawing
        unsigned int DrawEvents(wxDC & dc, std::vector < boost::shared_ptr< BaseEvent > > & events, int x, int y );

        InternalEventsEditorRefreshCallbacks refreshCallback;

		DECLARE_EVENT_TABLE()
};

#endif
