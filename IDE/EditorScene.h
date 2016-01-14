/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
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
#include <memory>
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
namespace gd {class Layout;}
namespace gd {class Project;}
namespace gd {class LayoutEditorCanvas;}
namespace gd {class LayersEditorPanel;}
namespace gd {class ObjectsEditor;}
class CppLayoutPreviewer;
class EventsEditor;
class LayoutEditorPropertiesPnl;
class InitialPositionBrowserDlg;

/**
 * \brief Panel containing all the editors of a layout.
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
     * Return the project edited by the editor
     */
    gd::Project & GetProject() { return project; };

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
    void OnvScrollbarScrollThumbRelease(wxScrollEvent& event);
    void OnhScrollbarScrollThumbRelease(wxScrollEvent& event);
    //*)

    //(*Declarations(EditorScene)
    EventsEditor* eventsEditor;
    gd::LayoutEditorCanvas* layoutEditorCanvas;
    wxPanel* scenePanel;
    wxPanel* eventsPanel;
    wxScrollBar* hScrollbar;
    wxAuiNotebook* notebook;
    wxScrollBar* vScrollbar;
    //*)
    std::shared_ptr<gd::ObjectsEditor> objectsEditor;
    std::shared_ptr<gd::LayersEditorPanel> layersEditor;
    std::shared_ptr<LayoutEditorPropertiesPnl> propertiesPnl;
    std::shared_ptr<InitialPositionBrowserDlg> initialInstancesBrowser;

    gd::Project & project;
    gd::Layout & layout;
    gd::MainFrameWrapper mainFrameWrapper;

    wxAuiManager m_mgr;

    DECLARE_EVENT_TABLE()
};

#endif

