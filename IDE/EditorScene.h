#ifndef EDITORSCENE_H
#define EDITORSCENE_H

//(*Headers(EditorScene)
#include <wx/sizer.h>
#include <wx/aui/aui.h>
#include <wx/panel.h>
#include <wx/scrolbar.h>
//*)
#include <wx/help.h>
#include <wx/aui/aui.h>
#include <wx/toolbar.h>

#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/toolbar.h>

#include "GDL/Game.h"
class RuntimeGame;
#include "GDL/MainEditorCommand.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include "SceneCanvas.h"
class EventsEditor;
#include "RenderDialog.h"
#include <string>
#include <vector>

using namespace std;

/**
 * EditorScene manage and contains all editors needed so as to edit a scene.
 */
class EditorScene: public wxPanel
{
	public:

		EditorScene(wxWindow* parent, RuntimeGame & game_, Scene & scene_, const MainEditorCommand & mainEditorCommand_);
		virtual ~EditorScene();

		//(*Declarations(EditorScene)
		wxScrollBar* scrollBar1;
		wxScrollBar* scrollBar2;
		EventsEditor* eventsEditor;
		SceneCanvas* sceneCanvas;
		wxPanel* scenePanel;
		wxPanel* eventsPanel;
		wxAuiNotebook* notebook;
		//*)

		Scene & scene;

        /**
         * Can be called by parent so as to refresh ribbon for this editor.
         */
        void ForceRefreshRibbonAndConnect();

	protected:

		//(*Identifiers(EditorScene)
		static const long ID_SCROLLBAR2;
		static const long ID_SCROLLBAR1;
		static const long ID_CUSTOM1;
		static const long ID_PANEL5;
		static const long ID_CUSTOM2;
		static const long ID_PANEL6;
		static const long ID_AUINOTEBOOK1;
		//*)

	private:

		//(*Handlers(EditorScene)
		void OnScrollBar2Scroll(wxScrollEvent& event);
		void OnScrollBar1Scroll(wxScrollEvent& event);
		void OnCorePaint(wxPaintEvent& event);
		void OnPanel1KeyDown(wxKeyEvent& event);
		void OnsceneCanvasRightDown(wxMouseEvent& event);
		void OnsceneCanvasPaint(wxPaintEvent& event);
		void OnPanel1Resize(wxSizeEvent& event);
		void OnscenePanelResize(wxSizeEvent& event);
		void OnnotebookPageChanged(wxAuiNotebookEvent& event);
		void OnsceneCanvasSetFocus(wxFocusEvent& event);
		void OnPanel2Resize(wxSizeEvent& event);
		void OnCoreResize1(wxSizeEvent& event);
		void OnsceneCanvasPanelResize(wxSizeEvent& event);
		//*)

		RuntimeGame & game;
		MainEditorCommand mainEditorCommand;

        wxAuiManager m_mgr;

		DECLARE_EVENT_TABLE()
};

#endif
