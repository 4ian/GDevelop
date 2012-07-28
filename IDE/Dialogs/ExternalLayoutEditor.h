/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
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
class RuntimeGame;
class SceneCanvas;
namespace gd { class ExternalLayout; }
#include "GDL/Scene.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"

class ExternalLayoutEditor: public wxPanel
{
public:

    ExternalLayoutEditor(wxWindow* parent, RuntimeGame & game_, gd::ExternalLayout & externalLayout, const gd::MainFrameWrapper & mainFrameWrapper_);
    virtual ~ExternalLayoutEditor();

    //(*Declarations(ExternalLayoutEditor)
    wxScrollBar* scrollBar1;
    wxPanel* helpPanel;
    wxScrollBar* scrollBar2;
    wxStaticText* StaticText2;
    wxStaticBitmap* StaticBitmap1;
    wxStaticText* StaticText1;
    SceneCanvas* sceneCanvas;
    wxPanel* contextPanel;
    wxPanel* corePanel;
    wxPanel* scenePanel;
    wxComboBox* parentSceneComboBox;
    //*)

    gd::ExternalLayout & externalLayout;
    RuntimeGame & game;

    /**
     * Return the layout being used for editing the external layout
     */
    gd::Layout & GetAssociatedLayout();

    /**
     * Can be called by parent so as to refresh ribbon for this editor.
     */
    void ForceRefreshRibbonAndConnect();

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

    DECLARE_EVENT_TABLE()

    void SetupForScene(Scene & scene);

    Scene emptyScene;
    gd::MainFrameWrapper mainFrameWrapper;

    wxAuiManager m_mgr;
};

#endif
