/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EDITORSCENE_H
#define EDITORSCENE_H

#include <string>
#include <vector>
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
namespace gd {class Layout;}
namespace gd {class Project;}
class RuntimeGame;
class EventsEditor;
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "RenderDialog.h"
#include "SceneCanvas.h"

using namespace std;

/**
 * EditorScene manage and contains all editors needed so as to edit a scene.
 */
class EditorScene: public wxPanel
{
	public:

		EditorScene(wxWindow* parent, gd::Project & project, gd::Layout & layout_, const gd::MainFrameWrapper & mainFrameWrapper_);
		virtual ~EditorScene();

		//(*Declarations(EditorScene)
		wxScrollBar* scrollBar1;
		EventsEditor* eventsEditor;
		wxScrollBar* scrollBar2;
		SceneCanvas* sceneCanvas;
		wxPanel* scenePanel;
		wxPanel* eventsPanel;
		wxAuiNotebook* notebook;
		//*)

		/**
		 * Return the layout edited by the editor
		 */
		gd::Layout & GetLayout() { return layout; };

        /**
         * Can be called by parent so as to refresh ribbon for this editor.
         */
        void ForceRefreshRibbonAndConnect();

        /**
         * Return true if the editor can be closed, false otherwise ( i.e. Scene is being previewed )
         */
        bool CanBeClosed();

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

		gd::Project & project;
		gd::Layout & layout;
		gd::MainFrameWrapper mainFrameWrapper;

        wxAuiManager m_mgr;

		DECLARE_EVENT_TABLE()
};

#endif

