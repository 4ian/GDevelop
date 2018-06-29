/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * Copyright 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
 */

#include "LayersEditorPanel.h"

#include <wx/config.h>
#include "GDCore/Tools/Log.h"
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Layer.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/Dialogs/ObjectsOnBadLayerDialog.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "LayoutEditorPropertiesPnl.h"

const long LayersEditorPanel::idMenuEdit = wxNewId();
const long LayersEditorPanel::idMenuAdd = wxNewId();
const long LayersEditorPanel::idMenuDel = wxNewId();
const long LayersEditorPanel::idMenuUp = wxNewId();
const long LayersEditorPanel::idMenuDown = wxNewId();

using namespace gd;

LayersEditorPanel::LayersEditorPanel(wxWindow* parent, gd::Project & project, gd::Layout & layout, gd::MainFrameWrapper & mainFrameWrapper) :
    LayersEditorPanelBase(parent),
    gd::LayoutEditorCanvasAssociatedEditor(),
    m_imageList(new wxImageList(16, 16, 1)),
    m_project(project),
    m_layout(layout),
    m_layoutCanvas(NULL),
    m_mainFrameWrapper(mainFrameWrapper),
    propPnl(NULL),
    propPnlManager(NULL)
{
    //Connect the wxListCtrl to events
    Connect(LayersEditorPanelBase::LAYERS_LIST_ID,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&LayersEditorPanel::OnlayersListItemSelect1);
    Connect(LayersEditorPanelBase::LAYERS_LIST_ID,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&LayersEditorPanel::OnlayersListItemActivated);
    Connect(LayersEditorPanelBase::LAYERS_LIST_ID,wxEVT_COMMAND_LIST_ITEM_FOCUSED,(wxObjectEventFunction)&LayersEditorPanel::OnlayersListItemFocused);
    Connect(LayersEditorPanelBase::LAYERS_LIST_ID,wxEVT_COMMAND_LIST_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&LayersEditorPanel::OnlayersListItemRClick);

    //Create the context menu
    MenuItem1 = new wxMenuItem((&contextMenu), idMenuEdit, _("Edit the layer properties"), wxEmptyString, wxITEM_NORMAL);
    MenuItem1->SetBitmap(gd::SkinHelper::GetIcon("rename", 16));
    contextMenu.Append(MenuItem1);
    contextMenu.AppendSeparator();
    MenuItem2 = new wxMenuItem((&contextMenu), idMenuAdd, _("Add a layer"), wxEmptyString, wxITEM_NORMAL);
    MenuItem2->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
    contextMenu.Append(MenuItem2);
    MenuItem3 = new wxMenuItem((&contextMenu), idMenuDel, _("Delete the layer"), wxEmptyString, wxITEM_NORMAL);
    MenuItem3->SetBitmap(gd::SkinHelper::GetIcon("delete", 16));
    contextMenu.Append(MenuItem3);
    contextMenu.AppendSeparator();
    MenuItem4 = new wxMenuItem((&contextMenu), idMenuUp, _("Move over"), wxEmptyString, wxITEM_NORMAL);
    MenuItem4->SetBitmap(gd::SkinHelper::GetIcon("up", 16));
    contextMenu.Append(MenuItem4);
    MenuItem5 = new wxMenuItem((&contextMenu), idMenuDown, _("Move below"), wxEmptyString, wxITEM_NORMAL);
    MenuItem5->SetBitmap(gd::SkinHelper::GetIcon("down", 16));
    contextMenu.Append(MenuItem5);

    //Connect menu's events
    Connect(idMenuEdit,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayersEditorPanel::OnEditSelected1);
    Connect(idMenuAdd,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayersEditorPanel::OnAddLayerClicked);
    Connect(idMenuDel,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayersEditorPanel::OnDeleteLayerClicked);
    Connect(idMenuUp,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayersEditorPanel::OnLayerUpClicked);
    Connect(idMenuDown,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayersEditorPanel::OnLayerDownClicked);

    //Add images to the image list
    m_imageList->Add(wxBitmap("res/rightArrowGrey.png", wxBITMAP_TYPE_ANY));
    m_imageList->Add(wxBitmap("res/1rightarrow.png", wxBITMAP_TYPE_ANY));
    m_imageList->Add(wxBitmap("res/eye.png", wxBITMAP_TYPE_ANY));
    m_imageList->Add(wxBitmap("res/eyeGrey.png", wxBITMAP_TYPE_ANY));
    m_layersList->AssignImageList(m_imageList, wxIMAGE_LIST_SMALL);

    m_layersList->InsertColumn(1, _("Layer"));
    m_layersList->InsertColumn(2, _("Visible"));

    gd::SkinHelper::ApplyCurrentSkin(*m_toolbar);
    m_toolbar->Realize(); //Force m_toolbar update to get a good size

    Refresh();
}

LayersEditorPanel::~LayersEditorPanel()
{

}

void LayersEditorPanel::SetAssociatedPropertiesPanel(LayoutEditorPropertiesPnl * propPnl_, wxAuiManager * manager_)
{
    propPnl = propPnl_;
    propPnlManager = manager_;
}

void LayersEditorPanel::Refresh()
{
    m_layersList->DeleteAllItems();

    for (std::size_t i = 0; i < m_layout.GetLayersCount(); ++i)
    {
        gd::String name = m_layout.GetLayer(i).GetName();
        if ( name == "" ) name = _("Base layer");
        m_layersList->InsertItem(0, name);

        if ( m_layout.GetLayer(i).GetVisibility() )
            m_layersList->SetItemColumnImage(0, 1, 2);
        else
            m_layersList->SetItemColumnImage(0, 1, 3);

        m_layersList->SetItemImage(0,-1,0);
    }
    m_layersList->SetColumnWidth( 0, wxLIST_AUTOSIZE );
    m_layersList->SetColumnWidth( 1, wxLIST_AUTOSIZE );

    UpdateSelectedLayerIcon();
}

void LayersEditorPanel::UpdateSelectedLayerIcon()
{
    if ( !m_layoutCanvas )
        return;

    for (std::size_t i = 0; i<m_layout.GetLayersCount(); ++i)
    {
        if ( m_layout.GetLayer(i).GetName() == m_layoutCanvas->GetCurrentLayer() )
            m_layersList->SetItemImage(m_layout.GetLayersCount()-i-1,1,1);
        else
            m_layersList->SetItemImage(m_layout.GetLayersCount()-i-1,-1,-1);
    }
}

Layer* LayersEditorPanel::GetSelectedLayer()
{
    long itemIndex = -1;

    for (;;)
    {
        itemIndex = m_layersList->GetNextItem(itemIndex,wxLIST_NEXT_ALL,wxLIST_STATE_SELECTED);
        if (itemIndex == -1) break;

        // Got the selected item index
        std::size_t layerId = m_layout.GetLayersCount()-itemIndex-1;
        if ( layerId < m_layout.GetLayersCount() )
        {
            return &m_layout.GetLayer(layerId);
        }
    }

    return NULL;
}

void LayersEditorPanel::EditSelectedLayer()
{
    gd::Layer * layer = GetSelectedLayer();
    if ( !layer ) return;

    if ( propPnl && propPnlManager ) {
        propPnlManager->GetPane("PROPERTIES").Show();
        propPnlManager->Update();
    }
}

/** Item double clicked: Toggle visibility or edit the layer
 */
void LayersEditorPanel::OnlayersListItemActivated(wxListEvent& event)
{
    //Get selected layer
    Layer * selectedLayer = GetSelectedLayer();
    if ( !selectedLayer ) return;

    //Get selected column
    wxPoint click_point = ::wxGetMousePosition();
    wxPoint list_point = m_layersList->GetScreenPosition();

    // delta x
    int dx = click_point.x - list_point.x;

    // work out the column
    int ex = 0; // cumulative sum of column widths
    int column = -1;
    for (column = 0; column < m_layersList->GetColumnCount(); column++) {
        ex += m_layersList->GetColumnWidth(column);
        if (ex > dx) break;
    }

    if ( column == 1 )
    {
        selectedLayer->SetVisibility(!selectedLayer->GetVisibility());
        Refresh();

        return;
    }
    else
    {
        EditSelectedLayer();
    }
}

void LayersEditorPanel::OnEditSelected1(wxCommandEvent& event)
{
    EditSelectedLayer();
}

/** Item selected: Update the current layer
 */
void LayersEditorPanel::OnlayersListItemSelect1(wxListEvent& event)
{
    //Get selected layer
    Layer * layer = GetSelectedLayer();
    if ( !layer ) return;

    if ( propPnl ) propPnl->SelectedLayer(layer);

    if ( m_layoutCanvas ) m_layoutCanvas->SetCurrentLayer(layer->GetName());
    UpdateSelectedLayerIcon();
}

/** Item focused: Update the current layer
 */
void LayersEditorPanel::OnlayersListItemFocused(wxListEvent& event)
{
    //Get selected layer
    Layer * layer = GetSelectedLayer();
    if ( !layer ) return;

    if ( propPnl ) propPnl->SelectedLayer(layer);

    if ( m_layoutCanvas ) m_layoutCanvas->SetCurrentLayer(layer->GetName());
    UpdateSelectedLayerIcon();
}

void LayersEditorPanel::OnlayersListItemRClick(wxListEvent& event)
{
    PopupMenu(&contextMenu);
}

void LayersEditorPanel::OnAddLayerClicked(wxCommandEvent& event)
{
    gd::String name = _("New layer");

    bool alreadyExist = false;
    unsigned int nb = 0;
    for (std::size_t i = 0;i<m_layout.GetLayersCount();++i)
    {
        if ( m_layout.GetLayer(i).GetName() == name )
            alreadyExist = true;
    }
    while ( alreadyExist )
    {
        ++nb;
        name = _("New layer ") + gd::String::From(nb);

        alreadyExist = false;
        for (std::size_t i = 0;i<m_layout.GetLayersCount();++i)
        {
            if ( m_layout.GetLayer(i).GetName() == name )
                alreadyExist = true;
        }
    }

    m_layout.InsertNewLayer(name, m_layout.GetLayersCount()-1);
    m_layout.GetLayer(name).SetCameraCount(1);

    if (onChangeCb) onChangeCb("layer-added");
    Refresh();
}

void LayersEditorPanel::OnDeleteLayerClicked(wxCommandEvent& event)
{
    //Get selected layer
    Layer * selectedLayer = GetSelectedLayer();
    if ( !selectedLayer || selectedLayer->GetName().empty() ) return;

    gd::String name = selectedLayer->GetName();

    for (std::size_t i = 0;i<m_layout.GetLayersCount();++i)
    {
        if ( &m_layout.GetLayer(i) == selectedLayer )
        {
            //Ask the user what he wants to do with the existing instances.
            if ( m_layout.GetInitialInstances().SomeInstancesAreOnLayer(name) )
            {
                std::vector<gd::String> availableLayers;
                for (std::size_t j = 0;j<m_layout.GetLayersCount();++j)
                {
                    if (i!=j) availableLayers.push_back(m_layout.GetLayer(j).GetName());
                }

                ObjectsOnBadLayerDialog dialog(this, availableLayers);
                int choice = dialog.ShowModal();

                if ( choice == 0 ) return; //Cancel
                else if ( choice == 1 )
                    m_layout.GetInitialInstances().RemoveAllInstancesOnLayer(name);
                else if ( choice == 2 )
                    m_layout.GetInitialInstances().MoveInstancesToLayer(name, dialog.moveOnLayerNamed);
            }

            //Delete the layer and select base layer
            m_layout.RemoveLayer(name);
            if ( m_layoutCanvas ) m_layoutCanvas->SetCurrentLayer("");
            if ( propPnl ) propPnl->SelectedLayer(NULL);
            if (onChangeCb) onChangeCb("layer-deleted");
            Refresh();
            return;
        }
    }
    gd::LogWarning(_("Can't find the layer to delete !"));
}

void LayersEditorPanel::OnEditLayerClicked(wxCommandEvent& event)
{
    EditSelectedLayer();
}

void LayersEditorPanel::OnHelpClicked(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/editors/scene_editor/edit_layer");
}

void LayersEditorPanel::OnLayerDownClicked(wxCommandEvent& event)
{
    //Get selected layer
    Layer * selectedLayer = GetSelectedLayer();
    if ( !selectedLayer ) return;

    for (std::size_t i = 0;i<m_layout.GetLayersCount();++i)
    {
        if ( &m_layout.GetLayer(i) == selectedLayer )
        {
            if ( i >= 1 )
            {
                //Move the layer
                m_layout.SwapLayers(i,i-1);
                if (onChangeCb) onChangeCb("layer-moved-down");
                Refresh();

                //Focus it again
                m_layersList->SetItemState(m_layout.GetLayersCount()-i, wxLIST_STATE_SELECTED, wxLIST_STATE_SELECTED);
            }
            return;
        }
    }
    gd::LogWarning(_("Can't find the layer to move !"));
}

void LayersEditorPanel::OnLayerUpClicked(wxCommandEvent& event)
{
    //Get selected layer
    Layer * selectedLayer = GetSelectedLayer();
    if ( !selectedLayer ) return;

    for (std::size_t i = 0;i<m_layout.GetLayersCount();++i)
    {
        if ( &m_layout.GetLayer(i) == selectedLayer )
        {
            if ( i <= m_layout.GetLayersCount()-1-1 )
            {
                //Move the layer
                m_layout.SwapLayers(i,i+1);
                if (onChangeCb) onChangeCb("layer-moved-up");
                Refresh();

                //Focus it again
                m_layersList->SetItemState(m_layout.GetLayersCount()-i-1-1, wxLIST_STATE_SELECTED, wxLIST_STATE_SELECTED);
            }
            return;
        }
    }
    gd::LogWarning(_("Can't find the layer to move !"));
}

void LayersEditorPanel::OnRefreshClicked(wxCommandEvent& event)
{
    Refresh();
}
