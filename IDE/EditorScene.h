#ifndef EDITORSCENE_H
#define EDITORSCENE_H

//(*Headers(EditorScene)
#include <wx/sizer.h>
#include <wx/menu.h>
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
class EditorEvents;
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

        void Resize( int width, int height );

		//(*Declarations(EditorScene)
		wxPanel* Core;
		wxScrollBar* ScrollBar2;
		wxPanel* Panel5;
		wxMenuItem* zoom10;
		wxMenuItem* zoom50;
		wxPanel* Panel4;
		wxMenu zoomMenu;
		wxScrollBar* ScrollBar1;
		SceneCanvas* sceneCanvas;
		wxMenuItem* zoom200;
		wxMenuItem* zoom25;
		wxPanel* scenePanel;
		EditorEvents* eventsEditor;
		wxMenuItem* zoom100;
		wxAuiNotebook* notebook;
		wxMenuItem* zoom500;
		wxMenuItem* zoom150;
		wxMenuItem* zoom5;
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
		static const long ID_PANEL4;
		static const long ID_PANEL5;
		static const long ID_PANEL1;
		static const long ID_CUSTOM2;
		static const long ID_PANEL6;
		static const long ID_AUINOTEBOOK1;
		static const long ID_MENUITEM8;
		static const long ID_MENUITEM1;
		static const long ID_MENUITEM2;
		static const long ID_MENUITEM3;
		static const long ID_MENUITEM4;
		static const long ID_MENUITEM5;
		static const long ID_MENUITEM6;
		static const long ID_MENUITEM7;
		//*)

	private:

		//(*Handlers(EditorScene)
		void OnScrollBar2Scroll(wxScrollEvent& event);
		void OnScrollBar1Scroll(wxScrollEvent& event);
		void OnCorePaint(wxPaintEvent& event);
		void OnPanel1KeyDown(wxKeyEvent& event);
		void OnsceneCanvasRightDown(wxMouseEvent& event);
		void OnsceneCanvasPaint(wxPaintEvent& event);
		void OnPanel4Resize(wxSizeEvent& event);
		void OnCoreResize(wxSizeEvent& event);
		void OnPanel1Resize(wxSizeEvent& event);
		void OnscenePanelResize(wxSizeEvent& event);
		void OnnotebookPageChanged(wxAuiNotebookEvent& event);
		void OnsceneCanvasSetFocus(wxFocusEvent& event);
		void Onzoom10Selected(wxCommandEvent& event);
		void Onzoom25Selected(wxCommandEvent& event);
		void Onzoom50Selected(wxCommandEvent& event);
		void Onzoom100Selected(wxCommandEvent& event);
		void Onzoom150Selected(wxCommandEvent& event);
		void Onzoom200Selected(wxCommandEvent& event);
		void Onzoom300Selected(wxCommandEvent& event);
		void Onzoom500Selected(wxCommandEvent& event);
		void Onzoom5Selected(wxCommandEvent& event);
		void OnPanel2Resize(wxSizeEvent& event);
		void OnCoreResize1(wxSizeEvent& event);
		//*)

		RuntimeGame & game;
		MainEditorCommand mainEditorCommand;
		RenderDialog externalWindow;

        wxAuiManager m_mgr;

		DECLARE_EVENT_TABLE()
};

#endif
