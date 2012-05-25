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
#include <wx/scrolbar.h>
#include <wx/combobox.h>
//*)
#include <wx/aui/aui.h>
class RuntimeGame;
namespace gd { class ExternalLayout; }
#include "GDL/Scene.h"
#include "GDL/IDE/MainEditorCommand.h"

class ExternalLayoutEditor: public wxPanel
{
public:

    ExternalLayoutEditor(wxWindow* parent, RuntimeGame & game_, gd::ExternalLayout & externalLayout, const MainEditorCommand & mainEditorCommand_);
    virtual ~ExternalLayoutEditor();

    //(*Declarations(ExternalLayoutEditor)
    wxScrollBar* scrollBar1;
    wxScrollBar* scrollBar2;
    wxStaticText* StaticText1;
    SceneCanvas* sceneCanvas;
    wxPanel* contextPanel;
    wxPanel* scenePanel;
    wxComboBox* parentSceneComboBox;
    //*)

    gd::ExternalLayout & externalLayout;
    RuntimeGame & game;

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
    //*)

private:

    //(*Handlers(ExternalLayoutEditor)
    void OnscenePanelResize(wxSizeEvent& event);
    void OnscrollBar2Scroll(wxScrollEvent& event);
    void OnscrollBar1Scroll(wxScrollEvent& event);
    void OnsceneCanvasSetFocus(wxFocusEvent& event);
    void OnResize(wxSizeEvent& event);
    //*)

    DECLARE_EVENT_TABLE()

    Scene emptyScene;
    MainEditorCommand mainEditorCommand;

    wxAuiManager m_mgr;
};

#endif
