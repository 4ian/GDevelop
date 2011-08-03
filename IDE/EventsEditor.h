#ifndef EVENTSEDITOR_H
#define EVENTSEDITOR_H

//(*Headers(EventsEditor)
#include <wx/sizer.h>
#include <wx/panel.h>
#include <wx/scrolbar.h>
//*)
#include <boost/shared_ptr.hpp>
#include "GDL/MainEditorCommand.h"
#include "GDL/Event.h"
class Game;
class Scene;


class EventsEditor: public wxPanel
{
	public:

		EventsEditor(wxWindow* parent, Game & game, Scene & scene, vector < BaseEventSPtr > * events_, MainEditorCommand & mainEditorCommand_ );
		virtual ~EventsEditor();

		//(*Declarations(EventsEditor)
		wxScrollBar* ScrollBar2;
		wxScrollBar* ScrollBar1;
		wxPanel* eventsPanel;
		//*)

	protected:

		//(*Identifiers(EventsEditor)
		static const long ID_PANEL1;
		static const long ID_SCROLLBAR1;
		static const long ID_SCROLLBAR2;
		//*)

	private:

		//(*Handlers(EventsEditor)
		//*)

		Game & game;
		Scene & scene;
        vector < BaseEventSPtr > * events; ///< Events modified are not necessarily the events of the scene

		MainEditorCommand & mainEditorCommand;

		DECLARE_EVENT_TABLE()
};

#endif
