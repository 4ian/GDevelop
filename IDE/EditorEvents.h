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
#include <stack>

#include "SearchEvents.h"
#include "GDL/MainEditorCommand.h"
#include "EventsRendererDatas.h"

#include "GDL/Game.h"

class EditorEvents: public wxPanel
{
    friend class EditorEventsDialoguesTest;
	public:


        EditorEvents(wxWindow* parent, Game & game_, Scene & scene_, vector < Event > * events_, MainEditorCommand & mainEditorCommand_ );
		virtual ~EditorEvents();

		static void CreateRibbonPage(wxRibbonPage * page);
		void ConnectEvents();

		//(*Declarations(EditorEvents)
		wxScrollBar* horizontalScrollbar;
		wxMenuItem* MenuItem8;
		wxMenuItem* MenuItem7;
		wxMenuItem* MenuItem25;
		wxMenu* MenuItem9;
		wxMenuItem* MenuItem2;
		wxMenuItem* MenuItem1;
		wxMenuItem* MenuItem4;
		wxScrollBar* ScrollBar1;
		wxMenuItem* MenuItem15;
		wxMenuItem* MenuItem22;
		wxPanel* Panel1;
		wxMenuItem* MenuItem17;
		wxMenuItem* MenuItem13;
		wxMenu ContextMenu;
		wxMenuItem* MenuItem10;
		wxMenu actionsMenu;
		wxMenuItem* MenuItem12;
		wxMenuItem* MenuItem24;
		wxMenuItem* MenuItem3;
		wxPanel* EventsPanel;
		wxMenuItem* MenuItem6;
		wxMenu* MenuItem14;
		wxMenuItem* MenuItem21;
		wxMenuItem* MenuItem16;
		wxMenuItem* MenuItem18;
		wxMenuItem* SubEventMenuItem;
		wxMenu conditionsMenu;
		//*)

	protected:

		//(*Identifiers(EditorEvents)
		static const long ID_PANEL1;
		static const long ID_PANEL2;
		static const long ID_SCROLLBAR1;
		static const long ID_SCROLLBAR2;
		static const long idEventInsert;
		static const long idMenuCom;
		static const long idMenuSubEvent;
		static const long idMenuLien;
		static const long ID_MENUITEM1;
		static const long idMenuEventDel;
		static const long idMenuDelConditions;
		static const long idMenuDelActions;
		static const long idMenuDelSubEvents;
		static const long ID_MENUITEM2;
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
		static const long ID_MENUITEM3;
		static const long idMenuCouper;
		static const long ID_MENUITEM4;
		static const long ID_MENUITEM5;
		static const long ID_MENUITEM6;
		static const long ID_MENUITEM7;
		static const long ID_MENUITEM8;
		static const long ID_MENUITEM9;
		static const long ID_MENUITEM10;
		//*)
		static const long ID_TEMPLATEBUTTON;
		static const long ID_CREATETEMPLATEBUTTON;
		static const long ID_HELPBUTTON;
		static const long ID_SEARCHBUTTON;

		static const long idRibbonEvent;
		static const long idRibbonCom;
		static const long idRibbonSubEvent;
		static const long idRibbonLink;
		static const long idRibbonDelEvent;
		static const long idRibbonUndo;
		static const long idRibbonRedo;
		static const long idRibbonCopy;
		static const long idRibbonCut;
		static const long idRibbonPaste;
		static const long idRibbonTemplate;
		static const long idRibbonCreateTemplate;
		static const long idRibbonHelp;

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
		void OnPanel1Resize(wxSizeEvent& event);
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
		//*)
        void DrawEvents(vector < Event > & list, wxBufferedPaintDC & dc, int & Yposition, int initialXposition, int & maximalWidth, bool draw);
        void OnSearchBtClick(wxCommandEvent& event);
        void ChangesMadeOnEvents();
        void ResetEventsSizeCache(vector < Event > & eventsToReset);
        void DeselectAllEvents(vector < Event > & eventsToUnselected);
        void DeselectAllActions(vector < Event > & eventsToUnselected);
        void DeselectAllConditions(vector < Event > & eventsToUnselected);

        SearchEvents * searchDialog;

        /**
         * Reference to game containing the datas to edit
         */
		Game & game;

        /**
         * Reference to the scene edited
         */
		Scene & scene;
        vector < Event > * events; //Pointeur vers les évènements à modifier

		MainEditorCommand & mainEditorCommand;

        //Annulation
        vector < vector < Event > > history; //Historique des changements
        vector < vector < Event > > redoHistory; //Historique des changements pour "refaire"

        unsigned int conditionsColumnWidth;
        EventsRendererDatas eventsRenderersDatas;

        //Position du clic
        int MouseX;
        int MouseY;
        bool ctrlPressed;
        bool isResizingColumns;

        //Evènement selectionné
        vector < std::pair<vector < Event > *, unsigned int> > eventsSelected; ///<First: Pointer to the list of event, Second: index of the event in this list
        vector < std::pair<vector < Instruction > *, unsigned int> > instructionsSelected; ///<First: Pointer to the list of instruction, Second: index of the instruction in this list
        bool ConditionsSelected;

        Event unusedEvent;
        vector < Event > unusedEventList;

		wxToolBar * toolbar;

		DECLARE_EVENT_TABLE()
};

#endif
