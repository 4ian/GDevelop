/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef EDITORLAYERS_H
#define EDITORLAYERS_H

//(*Headers(LayersEditorPanel)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/aui/aui.h>
#include <wx/panel.h>
#include <wx/imaglist.h>
//*)
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasAssociatedEditor.h"
namespace gd { class LayoutEditorCanvas; }
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class Layer; }
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"

namespace gd
{

/**
 * \brief Panel showing the layers of a layout and allowing to edit them.
 *
 * \ingroup IDEdialogs
 */
class GD_CORE_API LayersEditorPanel: public wxPanel, public gd::LayoutEditorCanvasAssociatedEditor
{
public:

    LayersEditorPanel(wxWindow* parent, gd::Project & project_, gd::Layout & layout_, gd::MainFrameWrapper & mainFrameWrapper_);
    virtual ~LayersEditorPanel();

    /**
     * Refresh the layers list.
     */
    void Refresh();

    /**
     * The editor can be linked to a layout editor canvas to update it according to the changes made in the editor.
     */
    void SetAssociatedLayoutEditorCanvas(gd::LayoutEditorCanvas * layoutCanvas_) { layoutCanvas = layoutCanvas_; Refresh(); };

    /**
     * Return the associated layout editor canvas.
     * \see LayersEditorPanel::SetAssociatedLayoutEditorCanvas
     */
    gd::LayoutEditorCanvas * GetAssociatedLayoutEditorCanvas() { return layoutCanvas; };

    /**
     * Enable or disable the editor.
     */
    virtual bool Enable(bool enable=true) { return wxWindow::Enable(enable); };

protected:

    //(*Identifiers(LayersEditorPanel)
    static const long ID_AUITOOLBARITEM1;
    static const long ID_AUITOOLBARITEM4;
    static const long ID_AUITOOLBARITEM5;
    static const long ID_AUITOOLBARITEM3;
    static const long ID_AUITOOLBARITEM2;
    static const long ID_AUITOOLBARITEM6;
    static const long ID_AUITOOLBARITEM7;
    static const long ID_AUITOOLBAR1;
    static const long ID_PANEL3;
    static const long ID_LISTCTRL1;
    static const long idMenuEdit;
    static const long idMenuAdd;
    static const long idMenuDel;
    static const long idMenuUp;
    static const long idMenuDown;
    //*)
    static const long ID_BITMAPBUTTON1;
    static const long ID_BITMAPBUTTON6;
    static const long ID_BITMAPBUTTON3;

private:

    //(*Handlers(LayersEditorPanel)
    void OntoolBarPanelResize(wxSizeEvent& event);
    void OnAddSelected(wxCommandEvent& event);
    void OnDelSelected(wxCommandEvent& event);
    void OnUpSelected(wxCommandEvent& event);
    void OnDownSelected(wxCommandEvent& event);
    void OnlayersListItemRClick(wxListEvent& event);
    void OnlayersListItemSelect(wxListEvent& event);
    void OnlayersListItemActivated(wxListEvent& event);
    void OnEditSelected1(wxCommandEvent& event);
    void OnlayersListItemSelect1(wxListEvent& event);
    void OnlayersListItemFocused(wxListEvent& event);
    void OnRefreshClick(wxCommandEvent& event);
    void OnHelpClick(wxCommandEvent& event);
    //*)
    void UpdateSelectedLayerIcon();
    void OnRefresh(wxCommandEvent& event);
    void OnMoreOptions(wxCommandEvent& event);
    void EditSelectedLayer();
    void OnHelp(wxCommandEvent& event);
    gd::Layer * GetSelectedLayer();

    //(*Declarations(LayersEditorPanel)
    wxAuiManager* AuiManager1;
    wxAuiToolBar* toolbar;
    wxMenuItem* MenuItem2;
    wxMenuItem* MenuItem1;
    wxListCtrl* layersList;
    wxMenu contextMenu;
    wxPanel* toolBarPanel;
    wxImageList* imageList;
    //*)

    gd::Project & project;
    gd::Layout & layout;
    gd::LayoutEditorCanvas * layoutCanvas;
    gd::MainFrameWrapper & mainFrameWrapper;

    std::string layerSelected;

    void CreateToolbar();

    DECLARE_EVENT_TABLE()
};


}

#endif
