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
#include "EditorEvents.h"
#include "EditorObjets.h"
#include "EditorLayers.h"
#include "RenderDialog.h"
#include "DebuggerGUI.h"
#include <string>
#include <vector>

using namespace std;

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
		wxPanel* Panel4;
		wxScrollBar* ScrollBar1;
		SceneCanvas* sceneCanvas;
		wxPanel* scenePanel;
		EditorEvents* eventsEditor;
		wxAuiNotebook* notebook;
		wxPanel* Panel2;
		//*)
		EditorObjets *  objectsEditor;
		EditorLayers *  layersEditor;
        DebuggerGUI *   debugger;

		Scene & scene;

        static wxRibbonButtonBar * CreateRibbonPage(wxRibbonPage * page);
        static void CreateToolsBar(wxRibbonButtonBar * bar, bool editing);

	protected:

		//(*Identifiers(EditorScene)
		static const long ID_PANEL2;
		static const long ID_SCROLLBAR2;
		static const long ID_SCROLLBAR1;
		static const long ID_CUSTOM1;
		static const long ID_PANEL4;
		static const long ID_PANEL5;
		static const long ID_PANEL1;
		static const long ID_CUSTOM2;
		static const long ID_PANEL6;
		static const long ID_AUINOTEBOOK1;
		//*)
		static const long ID_EDITIONBUTTON;
		static const long ID_APERCUBUTTON;
		static const long ID_REFRESHBUTTON;
		static const long ID_PLAYBUTTON;
		static const long ID_PAUSEBUTTON;
		static const long ID_ORIGINEBUTTON;
        static const long ID_CHOISIROBJBUTTON;
        static const long ID_ZOOMINITBUTTON;
        static const long ID_GRIDBUTTON;
        static const long ID_GRIDSETUPBUTTON;
        static const long ID_DEBUGBUTTON;
        static const long ID_VARRAZBUTTON;
        static const long ID_OBJECTSEDITOR;
        static const long ID_LAYERSEDITOR;
        static const long ID_CHOISIRLAYERBUTTON;

        //Identifiers for changing mode
        static const long idRibbonEditMode;
        static const long idRibbonPreviewMode;

        //Edition mode identifiers
        static const long idRibbonObjectsEditor;
        static const long idRibbonLayersEditor;
        static const long idRibbonChooseObject;
        static const long idRibbonChooseLayer;
        static const long idRibbonOrigine;
        static const long idRibbonOriginalZoom;
        static const long idRibbonGrid;
        static const long idRibbonGridSetup;

        //Preview mode identifiers
        static const long idRibbonRefresh;
        static const long idRibbonPlay;
        static const long idRibbonPlayWin;
        static const long idRibbonPause;
        static const long idRibbonResetGlobalVars;
        static const long idRibbonDebugger;

        static const long idRibbonHelp;

	private:

		//(*Handlers(EditorScene)
		void OnPanel2Resize(wxSizeEvent& event);
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
		//*)
        void UpdateSceneCanvasSize(int parentPanelWidht, int parentPanelHeight);
        void UpdateScenePanelSize(int parentPanelWidht, int parentPanelHeight);

		void SetToolbarEdition();
		void SetToolbarApercu();

        void OnRefreshBtClick( wxCommandEvent & event );
        void OnPreviewBtClick( wxCommandEvent & event );
        void OnEditionBtClick( wxCommandEvent & event );

        void OnOrigineBtClick( wxCommandEvent & event );
        void OnChoisirObjetBtClick( wxCommandEvent & event );
        void OnChoisirLayerBtClick( wxCommandEvent & event );
        void OnZoomInitBtClick( wxCommandEvent & event );
        void OnGridBtClick( wxCommandEvent & event );
        void OnGridSetupBtClick( wxCommandEvent & event );

        void OnPlayBtClick( wxCommandEvent & event );
        void OnPlayWindowBtClick( wxCommandEvent & event );
        void OnPauseBtClick( wxCommandEvent & event );

        void OnDebugBtClick( wxCommandEvent & event );

        void OnObjectsEditor( wxCommandEvent & event );
        void OnLayersEditor( wxCommandEvent & event );

        void OnHelpBtClick( wxCommandEvent & event );

        void ConnectEvents();

		RuntimeGame & game;
		MainEditorCommand mainEditorCommand;
		wxToolBar * toolbar;
		RenderDialog externalWindow;

        wxAuiManager m_mgr;

		DECLARE_EVENT_TABLE()
};

#endif
