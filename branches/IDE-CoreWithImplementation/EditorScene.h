/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
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
#include <boost/shared_ptr.hpp>
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
namespace gd {class Layout;}
namespace gd {class Project;}
namespace gd {class LayersEditorPanel;}
class SceneEditorCanvas;
class EditorObjets;
class EventsEditor;
class LayoutEditorPropertiesPnl;
class InitialPositionBrowserDlg;

/**
 * \brief Panel containing the main editors of a layout
 */
class EditorScene: public wxPanel
{
public:

    EditorScene(wxWindow* parent, gd::Project & project, gd::Layout & layout_, const gd::MainFrameWrapper & mainFrameWrapper_);
    virtual ~EditorScene();

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
    static const long ID_SCROLLBAR3;
    static const long ID_SCROLLBAR4;
    static const long ID_CUSTOM3;
    static const long ID_PANEL1;
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
    void OnnotebookPageChanging(wxAuiNotebookEvent& event);
    void OnvScrollbarScroll(wxScrollEvent& event);
    void OnhScrollbarScroll(wxScrollEvent& event);
    //*)

    //(*Declarations(EditorScene)
    EventsEditor* eventsEditor;
    wxPanel* scenePanel;
    wxPanel* eventsPanel;
    wxScrollBar* hScrollbar;
    SceneEditorCanvas* layoutEditorCanvas;
    wxAuiNotebook* notebook;
    wxScrollBar* vScrollbar;
    //*)
    boost::shared_ptr<EditorObjets> objectsEditor;
    boost::shared_ptr<gd::LayersEditorPanel> layersEditor;
    boost::shared_ptr<LayoutEditorPropertiesPnl> propertiesPnl;
    boost::shared_ptr<InitialPositionBrowserDlg> initialInstancesBrowser;

    gd::Project & project;
    gd::Layout & layout;
    gd::MainFrameWrapper mainFrameWrapper;

    wxAuiManager m_mgr;

    DECLARE_EVENT_TABLE()
};

#endif

