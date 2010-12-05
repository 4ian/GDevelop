/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EDITOREVENTS_H
#define EDITOREVENTS_H

//(*Headers(EditorEvents)
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/panel.h>
#include <wx/scrolbar.h>
//*)
#include <wx/dc.h>
#include <wx/dcbuffer.h>
#include <wx/toolbar.h>
#include <boost/tuple/tuple.hpp>
#include "GDL/MainEditorCommand.h"
#include "GDL/EventsRenderingHelper.h"
#include "GDL/Game.h"
class SearchEvents;
class SceneCanvas;

class EditorEvents: public wxPanel
{
    friend class EditorEventsDialoguesTest;
	public:


        EditorEvents(wxWindow* parent, Game & game_, Scene & scene_, vector < BaseEventSPtr > * events_, MainEditorCommand & mainEditorCommand_ );
		virtual ~EditorEvents();

		static void CreateRibbonPage(wxRibbonPage * page);
		void ConnectEvents();

		void SetAssociatedSceneCanvas(SceneCanvas * sceneCanvas_) { sceneCanvas = sceneCanvas_; };
		SceneCanvas * GetAssociatedSceneCanvas() { return sceneCanvas; };

		/**
		 * Called (internally by EventsEditor or by modeless dialogs like Search/Replace dialog) when some changes
		 * were made to events.
		 */
        void ChangesMadeOnEvents();

        /**
         * Called (internally or by modeless dialogs like Search/Replace dialog ) so as to force refresh of the events.
         */
        void ForceRefresh();

        /**
         * Return the selected event
         */
        BaseEventSPtr GetLastSelectedEvent();

        /**
         * Scroll view to reach an event.
         */
        void ScrollToEvent(BaseEventSPtr event);

		//(*Declarations(EditorEvents)
		wxMenuItem* MenuItem31;
		wxScrollBar* horizontalScrollbar;
		wxMenuItem* MenuItem8;
		wxMenuItem* MenuItem33;
		wxMenuItem* MenuItem7;
		wxMenuItem* MenuItem25;
		wxMenu* MenuItem36;
		wxMenuItem* MenuItem2;
		wxMenuItem* MenuItem1;
		wxMenuItem* MenuItem4;
		wxMenuItem* MenuItem14;
		wxScrollBar* ScrollBar1;
		wxMenuItem* MenuItem15;
		wxMenuItem* MenuItem22;
		wxMenuItem* MenuItem32;
		wxMenuItem* MenuItem17;
		wxMenuItem* MenuItem13;
		wxMenu ContextMenu;
		wxMenu noActionsMenu;
		wxMenuItem* MenuItem10;
		wxMenu noConditionsMenu;
		wxMenu actionsMenu;
		wxMenuItem* MenuItem24;
		wxMenuItem* MenuItem3;
		wxPanel* EventsPanel;
		wxMenuItem* MenuItem6;
		wxMenu* MenuItem37;
		wxMenuItem* MenuItem21;
		wxMenuItem* MenuItem16;
		wxMenuItem* MenuItem18;
		wxMenu* eventTypesMenu;
		wxMenuItem* MenuItem30;
		wxMenuItem* SubEventMenuItem;
		wxMenu conditionsMenu;
		//*)

	protected:

		//(*Identifiers(EditorEvents)
		static const long ID_PANEL2;
		static const long ID_SCROLLBAR1;
		static const long ID_SCROLLBAR2;
		static const long idEventInsert;
		static const long idMenuCom;
		static const long idMenuSubEvent;
		static const long ID_MENUITEM1;
		static const long idMenuEventDel;
		static const long ID_MENUITEM15;
		static const long idMenuUndo;
		static const long idMenuRedo;
		static const long idMenuClearHistory;
		static const long idMenuCopy;
		static const long idMenuCut;
		static const long idMenuPastAvant;
		static const long idMenuPasteApres;
		static const long idMenuPasteSubEvent;
		static const long idMenuPaste;
		static const long idMenuEdit;
		static const long idMenuAdd;
		static const long idMenuDel;
		static const long ID_MENUITEM2;
		static const long ID_MENUITEM17;
		static const long ID_MENUITEM21;
		static const long ID_MENUITEM3;
		static const long idMenuCouper;
		static const long ID_MENUITEM4;
		static const long ID_MENUITEM5;
		static const long ID_MENUITEM6;
		static const long ID_MENUITEM7;
		static const long ID_MENUITEM18;
		static const long ID_MENUITEM19;
		static const long ID_MENUITEM20;
		static const long ID_MENUITEM8;
		static const long ID_MENUITEM9;
		static const long ID_MENUITEM10;
		static const long ID_MENUITEM11;
		static const long ID_MENUITEM13;
		static const long ID_MENUITEM12;
		static const long ID_MENUITEM14;
		//*)
		static const long ID_TEMPLATEBUTTON;
		static const long ID_CREATETEMPLATEBUTTON;
		static const long ID_HELPBUTTON;
		static const long ID_SEARCHBUTTON;

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
		static vector < std::pair<long, std::string> > idForEventTypesMenu;

	private:

		//(*Handlers(EditorEvents)
		void OnDelEventSelected(wxCommandEvent& event);
		void OnMenuItem2Selected(wxCommandEvent& event);
		void OnDelConditionsSelected(wxCommandEvent& event);
		void OnDelActionsSelected(wxCommandEvent& event);
		void OnMenuCopySelected(wxCommandEvent& event);
		void OnMenuPasteSelected(wxCommandEvent& event);
		void OnCutSelected(wxCommandEvent& event);
		void OnTemplateBtClick(wxCommandEvent& event);
		void OnMenuItem7Selected(wxCommandEvent& event);
		void OnMenuItem9Selected(wxCommandEvent& event);
		void OnMenuPasteAfterSelected(wxCommandEvent& event);
		void OnInsertEventSelected(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void OnCreateTemplateBtClick(wxCommandEvent& event);
		void OnAddLienSelected(wxCommandEvent& event);
		void OnEventsPanelPaint(wxPaintEvent& event);
		void OnScrollBar1ScrollChanged(wxScrollEvent& event);
		void OnEventsPanelLeftDClick(wxMouseEvent& event);
		void OnEventsPanelResize(wxSizeEvent& event);
		void OnEventsPanelRightUp(wxMouseEvent& event);
		void OnEventsPanelMouseWheel(wxMouseEvent& event);
		void OnEventsPanelLeftUp(wxMouseEvent& event);
		void OnSubEventMenuItemSelected(wxCommandEvent& event);
		void OnPasteAsASubEventSelected(wxCommandEvent& event);
		void OnDelSubEventsSelected(wxCommandEvent& event);
		void OnClearHistorySelected(wxCommandEvent& event);
		void OnUndoSelected(wxCommandEvent& event);
		void OnRedoSelected(wxCommandEvent& event);
		void OnhorizontalScrollbarScroll(wxScrollEvent& event);
		void OnEventsPanelMouseMove(wxMouseEvent& event);
		void OnEventsPanelLeftDown(wxMouseEvent& event);
		void OnEventsPanelKeyUp(wxKeyEvent& event);
		void OnEventsPanelSetFocus(wxFocusEvent& event);
		void OneEditConditionMenuSelected(wxCommandEvent& event);
		void OnAddConditionMenuSelected(wxCommandEvent& event);
		void OnDelConditionMenuSelected(wxCommandEvent& event);
		void OnEditActionMenuSelected(wxCommandEvent& event);
		void OnAddActionMenuSelected(wxCommandEvent& event);
		void OnDelActionMenuSelected(wxCommandEvent& event);
		void OnCopyActionMenuSelected(wxCommandEvent& event);
		void OnCutActionMenuSelected(wxCommandEvent& event);
		void OnPasteActionMenuSelected(wxCommandEvent& event);
		void OnCopyConditionMenuSelected(wxCommandEvent& event);
		void OnCutConditionMenuSelected(wxCommandEvent& event);
		void OnPasteConditionMenuSelected(wxCommandEvent& event);
		void OnEditLinkMenuSelected(wxCommandEvent& event);
		void OnEditCommentMenuSelected(wxCommandEvent& event);
		void OnToggleEventSelected(wxCommandEvent& event);
		//*)
        void DrawEvents(vector < BaseEventSPtr > & list, wxBufferedPaintDC & dc, int & Yposition, int initialXposition, int & maximalWidth, bool draw);

        void OnSearchBtClick(wxCommandEvent& event);
        void OnProfilingBtClick(wxCommandEvent& event);
		void OnInsertSomeEventSelected(wxCommandEvent& event);
		void OnAddSomeEventSelected(wxRibbonButtonBarEvent& evt);
		void SetEventsNeedUpdate(vector < BaseEventSPtr > & eventsToRefresh);

        void DeselectAllEvents(vector < BaseEventSPtr > & eventsToUnselected);
        void DeselectAllActions(vector < BaseEventSPtr > & eventsToUnselected);
        void DeselectAllConditions(vector < BaseEventSPtr > & eventsToUnselected);
        void DeselectAllInstructions(BaseEventSPtr parentEvent, vector<Instruction> & instrsToUnselected);

        Instruction & GetLastSelectedInstruction();
        Instruction & GetSelectedInstruction(unsigned int nb);

        vector < Instruction > * GetSelectedListOfInstructions(unsigned int nb);
        vector < Instruction > * GetLastSelectedListOfInstructions();

        BaseEventSPtr GetSelectedEvent(unsigned int nb);

        vector < BaseEventSPtr > * GetSelectedListOfEvents(unsigned int nb);
        vector < BaseEventSPtr > * GetLastSelectedListOfEvents();

        /**
         * Scroll view to reach an event. Return true if event has been reached
         */
        bool ScrollToEvent(vector < BaseEventSPtr > & list, BaseEventSPtr eventToScrollTo, int & Yposition, int initialXposition);

        SearchEvents * searchDialog;
        bool profilingActivated;

		Game & game;
		Scene & scene;
        vector < BaseEventSPtr > * events; //Pointeur vers les évènements à modifier
        SceneCanvas * sceneCanvas;

		MainEditorCommand & mainEditorCommand;

        //Annulation
        vector < vector < BaseEventSPtr > > history; //Historique des changements
        vector < vector < BaseEventSPtr > > redoHistory; //Historique des changements pour "refaire"

        unsigned int conditionsColumnWidth;

        //Position du clic
        int MouseX;
        int MouseY;
        bool ctrlPressed;
        bool isResizingColumns;

        //Selection
        vector < boost::tuple< vector < BaseEventSPtr > *, unsigned int, vector < Instruction > *, unsigned int >
                > eventsSelected; ///<First: Pointer to the event list, 2nd: Number of the event in this list, 3rd: Pointer to the list of instruction, Second: index of the instruction in this list
        bool conditionsSelected;
        bool instructionsSelected;

        vector < BaseEventSPtr > unusedEventList;

		static BaseEventSPtr badEvent;
		static Instruction badInstruction;

		DECLARE_EVENT_TABLE()
};

#endif
