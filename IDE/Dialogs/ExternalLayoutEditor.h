/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#ifndef EXTERNALLAYOUTEDITOR_H
#define EXTERNALLAYOUTEDITOR_H

//(*Headers(ExternalLayoutEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/scrolbar.h>
#include <wx/combobox.h>
//*)
#include <wx/aui/aui.h>
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/String.h"
namespace gd { class Project; }
namespace gd { class ExternalLayout; }
namespace gd { class LayersEditorPanel; }
namespace gd { class LayoutEditorCanvas; }
namespace gd { class ObjectsEditor; }
class LayoutEditorPropertiesPnl;
class InitialPositionBrowserDlg;

class ExternalLayoutEditor: public wxPanel
{
public:

    ExternalLayoutEditor(wxWindow* parent, gd::Project & game_, gd::ExternalLayout & externalLayout, const gd::MainFrameWrapper & mainFrameWrapper_);
    virtual ~ExternalLayoutEditor();

    /**
     * Return the layout being used for editing the external layout
     */
    gd::Layout & GetAssociatedLayout();

    /**
     * Can be called by parent so as to refresh ribbon for this editor.
     */
    void ForceRefreshRibbonAndConnect();

    /**
     * Return the external layout being edited.
     */
    gd::ExternalLayout & GetExternalLayout() const { return externalLayout; }

    /**
     * Return the project owning the external layout
     */
    gd::Project & GetProject() const { return project; }

protected:

    //(*Identifiers(ExternalLayoutEditor)
    static const long ID_STATICTEXT1;
    static const long ID_COMBOBOX1;
    static const long ID_PANEL1;
    static const long ID_SCROLLBAR2;
    static const long ID_SCROLLBAR1;
    static const long ID_CUSTOM1;
    static const long ID_PANEL5;
    static const long ID_STATICTEXT2;
    static const long ID_STATICBITMAP1;
    static const long ID_PANEL3;
    static const long ID_PANEL2;
    //*)

private:

    //(*Handlers(ExternalLayoutEditor)
    void OnscenePanelResize(wxSizeEvent& event);
    void OnscrollBar2Scroll(wxScrollEvent& event);
    void OnscrollBar1Scroll(wxScrollEvent& event);
    void OnsceneCanvasSetFocus(wxFocusEvent& event);
    void OnResize(wxSizeEvent& event);
    void OnparentSceneComboBoxSelected(wxCommandEvent& event);
    //*)
    void OnparentSceneComboBoxDropDown(wxCommandEvent& event);
    void SetupForScene(gd::Layout & scene);

    //(*Declarations(ExternalLayoutEditor)
    wxScrollBar* scrollBar1;
    wxPanel* helpPanel;
    wxScrollBar* scrollBar2;
    wxStaticText* StaticText2;
    wxStaticBitmap* StaticBitmap1;
    wxStaticText* StaticText1;
    wxPanel* contextPanel;
    wxPanel* corePanel;
    wxComboBox* parentSceneComboBox;
    gd::LayoutEditorCanvas* layoutEditorCanvas;
    wxPanel* layoutPanel;
    //*)
    std::shared_ptr<gd::ObjectsEditor> objectsEditor;
    std::shared_ptr<gd::LayersEditorPanel> layersEditor;
    std::shared_ptr<LayoutEditorPropertiesPnl> propertiesPnl;
    std::shared_ptr<InitialPositionBrowserDlg> initialInstancesBrowser;

    gd::Project & project;
    gd::ExternalLayout & externalLayout;
    gd::MainFrameWrapper mainFrameWrapper;
    Scene emptyLayout;

    wxAuiManager m_mgr;


    DECLARE_EVENT_TABLE()
};

#endif
