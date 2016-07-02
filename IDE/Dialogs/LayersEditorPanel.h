/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * Copyright 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
 */
#ifndef LAYERSEDITORPANEL_H
#define LAYERSEDITORPANEL_H
#include "GDIDEDialogs.h"

#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasAssociatedEditor.h"
namespace gd { class LayoutEditorCanvas; }
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class Layer; }
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/String.h"
class LayoutEditorPropertiesPnl;

/**
 * \brief Panel showing the layers of a layout and allowing to edit them.
 *
 * \ingroup IDEdialogs
 */
class LayersEditorPanel : public LayersEditorPanelBase, public gd::LayoutEditorCanvasAssociatedEditor
{
public:
    LayersEditorPanel(wxWindow* parent, gd::Project & project, gd::Layout & layout, gd::MainFrameWrapper & mainFrameWrapper);
    virtual ~LayersEditorPanel();

    /**
     * Refresh the layers list.
     */
    void Refresh();

    /**
     * The editor can be linked to a layout editor canvas to update it according to the changes made in the editor.
     */
    void SetAssociatedLayoutEditorCanvas(gd::LayoutEditorCanvas * layoutCanvas) { m_layoutCanvas = layoutCanvas; Refresh(); };

    /**
     * Return the associated layout editor canvas.
     * \see LayersEditorPanel::SetAssociatedLayoutEditorCanvas
     */
    gd::LayoutEditorCanvas * GetAssociatedLayoutEditorCanvas() { return m_layoutCanvas; };

    /**
     * \brief Can be used to associate a LayoutEditorPropertiesPnl, and the wxAuiManager used to display it,
     * to the editor.
     */
    void SetAssociatedPropertiesPanel(LayoutEditorPropertiesPnl * propPnl, wxAuiManager * manager);

    /**
     * Enable or disable the editor.
     */
    virtual bool Enable(bool enable = true) { return wxWindow::Enable(enable); };

protected:
    virtual void OnAddLayerClicked(wxCommandEvent& event);
    virtual void OnDeleteLayerClicked(wxCommandEvent& event);
    virtual void OnEditLayerClicked(wxCommandEvent& event);
    virtual void OnHelpClicked(wxCommandEvent& event);
    virtual void OnLayerDownClicked(wxCommandEvent& event);
    virtual void OnLayerUpClicked(wxCommandEvent& event);
    virtual void OnRefreshClicked(wxCommandEvent& event);
    void OnEditSelected1(wxCommandEvent& event);
    void OnlayersListItemRClick(wxListEvent& event);
    void OnlayersListItemSelect(wxListEvent& event);
    void OnlayersListItemActivated(wxListEvent& event);
    void OnlayersListItemSelect1(wxListEvent& event);
    void OnlayersListItemFocused(wxListEvent& event);

    static const long idMenuEdit;
    static const long idMenuAdd;
    static const long idMenuDel;
    static const long idMenuUp;
    static const long idMenuDown;

private:
    void UpdateSelectedLayerIcon();
    void EditSelectedLayer();
    gd::Layer * GetSelectedLayer();

    wxImageList * m_imageList;

    wxMenu contextMenu;
    wxMenuItem* MenuItem1;
    wxMenuItem* MenuItem2;
    wxMenuItem* MenuItem3;
    wxMenuItem* MenuItem4;
    wxMenuItem* MenuItem5;

    gd::Project & m_project;
    gd::Layout & m_layout;
    gd::LayoutEditorCanvas * m_layoutCanvas;
    gd::MainFrameWrapper & m_mainFrameWrapper;

    LayoutEditorPropertiesPnl * propPnl;
    wxAuiManager * propPnlManager;

    gd::String m_layerSelected;
};

#endif // LAYERSEDITORPANEL_H
