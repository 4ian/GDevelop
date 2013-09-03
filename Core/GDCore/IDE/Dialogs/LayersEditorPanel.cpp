/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "LayersEditorPanel.h"

//(*InternalHeaders(LayersEditorPanel)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/config.h>
#include <wx/log.h>
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "GDCore/PlatformDefinition/InitialInstancesContainer.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Layer.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/Dialogs/ObjectsOnBadLayerDialog.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"

namespace gd
{

//(*IdInit(LayersEditorPanel)
const long LayersEditorPanel::ID_AUITOOLBARITEM1 = wxNewId();
const long LayersEditorPanel::ID_AUITOOLBARITEM4 = wxNewId();
const long LayersEditorPanel::ID_AUITOOLBARITEM5 = wxNewId();
const long LayersEditorPanel::ID_AUITOOLBARITEM3 = wxNewId();
const long LayersEditorPanel::ID_AUITOOLBARITEM2 = wxNewId();
const long LayersEditorPanel::ID_AUITOOLBARITEM6 = wxNewId();
const long LayersEditorPanel::ID_AUITOOLBARITEM7 = wxNewId();
const long LayersEditorPanel::ID_AUITOOLBAR1 = wxNewId();
const long LayersEditorPanel::ID_PANEL3 = wxNewId();
const long LayersEditorPanel::ID_LISTCTRL1 = wxNewId();
const long LayersEditorPanel::idMenuEdit = wxNewId();
const long LayersEditorPanel::idMenuAdd = wxNewId();
const long LayersEditorPanel::idMenuDel = wxNewId();
const long LayersEditorPanel::idMenuUp = wxNewId();
const long LayersEditorPanel::idMenuDown = wxNewId();
//*)
const long LayersEditorPanel::ID_BITMAPBUTTON1 = wxNewId();
const long LayersEditorPanel::ID_BITMAPBUTTON6 = wxNewId();
const long LayersEditorPanel::ID_BITMAPBUTTON3 = wxNewId();

BEGIN_EVENT_TABLE(LayersEditorPanel,wxPanel)
	//(*EventTable(LayersEditorPanel)
	//*)
END_EVENT_TABLE()

LayersEditorPanel::LayersEditorPanel(wxWindow* parent, gd::Project & project_, gd::Layout & layout_, gd::MainFrameWrapper & mainFrameWrapper_) :
project(project_),
layout(layout_),
layoutCanvas(NULL),
mainFrameWrapper(mainFrameWrapper_)
{

	//(*Initialize(LayersEditorPanel)
	wxMenuItem* MenuItem5;
	wxMenuItem* MenuItem4;
	wxMenuItem* MenuItem3;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	toolBarPanel = new wxPanel(this, ID_PANEL3, wxDefaultPosition, wxSize(120,25), wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	AuiManager1 = new wxAuiManager(toolBarPanel, wxAUI_MGR_DEFAULT);
	toolbar = new wxAuiToolBar(toolBarPanel, ID_AUITOOLBAR1, wxDefaultPosition, wxDefaultSize, wxAUI_TB_DEFAULT_STYLE);
	toolbar->AddTool(ID_AUITOOLBARITEM1, _("Add a layer"), wxBitmap(wxImage(_T("res/addicon.png"))), wxNullBitmap, wxITEM_NORMAL, _("Add a layer"), _("Add a new layer"), NULL);
	toolbar->AddTool(ID_AUITOOLBARITEM4, _("Delete the selected layer"), wxBitmap(wxImage(_T("res/deleteicon.png"))), wxNullBitmap, wxITEM_NORMAL, _("Delete the selected layer"), _("Delete the selected layer"), NULL);
	toolbar->AddSeparator();
	toolbar->AddTool(ID_AUITOOLBARITEM5, _("Edit the properties of the layer"), wxBitmap(wxImage(_T("res/editpropicon.png"))), wxNullBitmap, wxITEM_NORMAL, _("Edit the properties of the layer"), _("Edit the properties of the layer"), NULL);
	toolbar->AddTool(ID_AUITOOLBARITEM3, _("Move the layer over"), wxBitmap(wxImage(_T("res/up.png"))), wxNullBitmap, wxITEM_NORMAL, _("Move the layer over"), _("Move the layer over"), NULL);
	toolbar->AddTool(ID_AUITOOLBARITEM2, _("Move the layer below"), wxBitmap(wxImage(_T("res/down.png"))), wxNullBitmap, wxITEM_NORMAL, _("Move the layer below"), _("Move the layer below"), NULL);
	toolbar->AddSeparator();
	toolbar->AddTool(ID_AUITOOLBARITEM6, _("Refresh the list"), wxBitmap(wxImage(_T("res/refreshicon.png"))), wxNullBitmap, wxITEM_NORMAL, _("Refresh the list"), _("Refresh the list"), NULL);
	toolbar->AddSeparator();
	toolbar->AddTool(ID_AUITOOLBARITEM7, _("Help"), wxBitmap(wxImage(_T("res/helpicon.png"))), wxNullBitmap, wxITEM_NORMAL, _("Display help about the layers editor"), _("Display help about the layers editor"), NULL);
	toolbar->Realize();
	AuiManager1->AddPane(toolbar, wxAuiPaneInfo().Name(_T("PaneName")).ToolbarPane().Caption(_("Pane caption")).Layer(10).Top().Gripper(false));
	AuiManager1->Update();
	FlexGridSizer1->Add(toolBarPanel, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	layersList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxSize(191,198), wxLC_REPORT, wxDefaultValidator, _T("ID_LISTCTRL1"));
	FlexGridSizer1->Add(layersList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	MenuItem1 = new wxMenuItem((&contextMenu), idMenuEdit, _("Edit the layer properties"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
	contextMenu.Append(MenuItem1);
	contextMenu.AppendSeparator();
	MenuItem2 = new wxMenuItem((&contextMenu), idMenuAdd, _("Add a layer"), wxEmptyString, wxITEM_NORMAL);
	MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	contextMenu.Append(MenuItem2);
	MenuItem3 = new wxMenuItem((&contextMenu), idMenuDel, _("Delete the layer"), wxEmptyString, wxITEM_NORMAL);
	MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	contextMenu.Append(MenuItem3);
	contextMenu.AppendSeparator();
	MenuItem4 = new wxMenuItem((&contextMenu), idMenuUp, _("Move over"), wxEmptyString, wxITEM_NORMAL);
	MenuItem4->SetBitmap(wxBitmap(wxImage(_T("res/up.png"))));
	contextMenu.Append(MenuItem4);
	MenuItem5 = new wxMenuItem((&contextMenu), idMenuDown, _("Move below"), wxEmptyString, wxITEM_NORMAL);
	MenuItem5->SetBitmap(wxBitmap(wxImage(_T("res/down.png"))));
	contextMenu.Append(MenuItem5);
	imageList = new wxImageList(16, 16, 1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_AUITOOLBARITEM1,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&LayersEditorPanel::OnAddSelected);
	Connect(ID_AUITOOLBARITEM4,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&LayersEditorPanel::OnDelSelected);
	Connect(ID_AUITOOLBARITEM5,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&LayersEditorPanel::OnEditSelected1);
	Connect(ID_AUITOOLBARITEM3,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&LayersEditorPanel::OnUpSelected);
	Connect(ID_AUITOOLBARITEM2,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&LayersEditorPanel::OnDownSelected);
	Connect(ID_AUITOOLBARITEM6,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&LayersEditorPanel::OnRefreshClick);
	Connect(ID_AUITOOLBARITEM7,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&LayersEditorPanel::OnHelpClick);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&LayersEditorPanel::OnlayersListItemSelect1);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&LayersEditorPanel::OnlayersListItemActivated);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_FOCUSED,(wxObjectEventFunction)&LayersEditorPanel::OnlayersListItemFocused);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&LayersEditorPanel::OnlayersListItemRClick);
	Connect(idMenuEdit,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayersEditorPanel::OnEditSelected1);
	Connect(idMenuAdd,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayersEditorPanel::OnAddSelected);
	Connect(idMenuDel,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayersEditorPanel::OnDelSelected);
	Connect(idMenuUp,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayersEditorPanel::OnUpSelected);
	Connect(idMenuDown,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayersEditorPanel::OnDownSelected);
	//*)

    imageList->Add(wxBitmap("res/rightArrowGrey.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/1rightarrow.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/eye.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/eyeGrey.png", wxBITMAP_TYPE_ANY));
    layersList->AssignImageList(imageList, wxIMAGE_LIST_SMALL);

	layersList->InsertColumn(1, _("Layer"));
	layersList->InsertColumn(2, _("Visible"));

    gd::SkinHelper::ApplyCurrentSkin(*toolbar);

    Refresh();
}

LayersEditorPanel::~LayersEditorPanel()
{
	//(*Destroy(LayersEditorPanel)
	//*)
	AuiManager1->UnInit();
}

void LayersEditorPanel::OnRefresh(wxCommandEvent& event)
{
    Refresh();
}

void LayersEditorPanel::OnMoreOptions(wxCommandEvent& event)
{
    PopupMenu(&contextMenu);
}

void LayersEditorPanel::OnHelpClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/editors/scene_editor/edit_layer"));
}

void LayersEditorPanel::Refresh()
{
    layersList->DeleteAllItems();

    for (unsigned int i =0;i<layout.GetLayersCount();++i)
    {
        std::string name = layout.GetLayer(i).GetName();
        if ( name == "" ) name = _("Base layer");
    	layersList->InsertItem(0, name);

    	if ( layout.GetLayer(i).GetVisibility() )
            layersList->SetItemColumnImage(0, 1, 2);
        else
            layersList->SetItemColumnImage(0, 1, 3);

        layersList->SetItemImage(0,-1,0);
    }
    layersList->SetColumnWidth( 0, wxLIST_AUTOSIZE );
    layersList->SetColumnWidth( 1, wxLIST_AUTOSIZE );

    UpdateSelectedLayerIcon();
}
void LayersEditorPanel::OnRefreshClick(wxCommandEvent& event)
{
    Refresh();
}


void LayersEditorPanel::UpdateSelectedLayerIcon()
{
    if ( !layoutCanvas ) return;

    for (unsigned int i =0;i<layout.GetLayersCount();++i)
    {
    	if ( layout.GetLayer(i).GetName() == layoutCanvas->GetCurrentLayer() )
            layersList->SetItemImage(layout.GetLayersCount()-i-1,1,1);
        else
            layersList->SetItemImage(layout.GetLayersCount()-i-1,-1,-1);
    }
}

void LayersEditorPanel::OnAddSelected(wxCommandEvent& event)
{
    wxString name = _("New layer");

    bool alreadyExist = false;
    int nb = 0;
    for (unsigned int i = 0;i<layout.GetLayersCount();++i)
    {
    	if ( layout.GetLayer(i).GetName() == name )
            alreadyExist = true;
    }
    while ( alreadyExist )
    {
        ++nb;
        name = _("New layer ") + ToString(nb);

        alreadyExist = false;
        for (unsigned int i = 0;i<layout.GetLayersCount();++i)
        {
            if ( layout.GetLayer(i).GetName() == name )
                alreadyExist = true;
        }
    }

    layout.InsertNewLayer(ToString(name), layout.GetLayersCount()-1);
    layout.GetLayer(ToString(name)).SetCameraCount(1);

    Refresh();
}

/** Delete a layer
 */
void LayersEditorPanel::OnDelSelected(wxCommandEvent& event)
{
    //Get selected layer
    Layer * selectedLayer = GetSelectedLayer();
    if ( !selectedLayer || selectedLayer->GetName().empty() ) return;

    std::string name = selectedLayer->GetName();

    for (unsigned int i = 0;i<layout.GetLayersCount();++i)
    {
    	if ( &layout.GetLayer(i) == selectedLayer )
    	{
    	    //Ask the user what he wants to do with the existing instances.
    	    if ( layout.GetInitialInstances().SomeInstancesAreOnLayer(name) )
    	    {
    	        std::vector<std::string> availableLayers;
    	        for (unsigned int j = 0;j<layout.GetLayersCount();++j)
    	        {
    	            if (i!=j) availableLayers.push_back(layout.GetLayer(j).GetName());
    	        }

                ObjectsOnBadLayerDialog dialog(this, availableLayers);
                int choice = dialog.ShowModal();

                if ( choice == 0 ) return; //Cancel
                else if ( choice == 1 )
                    layout.GetInitialInstances().RemoveAllInstancesOnLayer(name);
                else if ( choice == 2 )
                    layout.GetInitialInstances().MoveInstancesToLayer(name, dialog.moveOnLayerNamed);
    	    }

            //Delete the layer and select base layer
    	    layout.RemoveLayer(name);
            if ( layoutCanvas )
            {
                layoutCanvas->SetCurrentLayer("");
            }
            Refresh();
    	    return;
    	}
    }
    wxLogWarning(_("Can't find the layer to delete !"));
}

void LayersEditorPanel::OnUpSelected(wxCommandEvent& event)
{
    //Get selected layer
    Layer * selectedLayer = GetSelectedLayer();
    if ( !selectedLayer ) return;

    for (unsigned int i = 0;i<layout.GetLayersCount();++i)
    {
    	if ( &layout.GetLayer(i) == selectedLayer )
    	{
    	    if ( i <= layout.GetLayersCount()-1-1 )
    	    {
                //Move the layer
    	        layout.SwapLayers(i,i+1);
                Refresh();

                //Focus it again
                layersList->SetItemState(layout.GetLayersCount()-i-1-1, wxLIST_STATE_SELECTED, wxLIST_STATE_SELECTED);
    	    }
    	    return;
    	}
    }
    wxLogWarning(_("Can't find the layer to move  !"));
}

void LayersEditorPanel::OnDownSelected(wxCommandEvent& event)
{
    //Get selected layer
    Layer * selectedLayer = GetSelectedLayer();
    if ( !selectedLayer ) return;

    for (unsigned int i = 0;i<layout.GetLayersCount();++i)
    {
    	if ( &layout.GetLayer(i) == selectedLayer )
    	{
    	    if ( i >= 1 )
    	    {
    	        //Move the layer
    	        layout.SwapLayers(i,i-1);
                Refresh();

                //Focus it again
                layersList->SetItemState(layout.GetLayersCount()-i, wxLIST_STATE_SELECTED, wxLIST_STATE_SELECTED);
    	    }
    	    return;
    	}
    }
    wxLogWarning(_("Can't find the layer to move  !"));
}

void LayersEditorPanel::OnlayersListItemRClick(wxListEvent& event)
{
    PopupMenu(&contextMenu);
}

Layer* LayersEditorPanel::GetSelectedLayer()
{
    long itemIndex = -1;

    for (;;)
    {
        itemIndex = layersList->GetNextItem(itemIndex,wxLIST_NEXT_ALL,wxLIST_STATE_SELECTED);
        if (itemIndex == -1) break;

        // Got the selected item index
        unsigned int layerId = layout.GetLayersCount()-itemIndex-1;
        if ( layerId < layout.GetLayersCount() )
        {
            return &layout.GetLayer(layerId);
        }
    }

    return NULL;
}

/** Item double clicked: Toggle visibility or edit the layer
 */
void LayersEditorPanel::OnlayersListItemActivated(wxListEvent& event)
{
    //Get selected layer
    Layer * selectedLayer = GetSelectedLayer();
    if ( !selectedLayer ) return;

    //Get selected column
    wxPoint click_point=::wxGetMousePosition();
    wxPoint list_point=layersList->GetScreenPosition();

    // delta x
    int dx=click_point.x - list_point.x;

    // work out the column
    int ex=0; // cumulative sum of column widths
    int column = -1;
    for (column=0; column<layersList->GetColumnCount(); column++) {
            ex+=layersList->GetColumnWidth(column);
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

void LayersEditorPanel::EditSelectedLayer()
{
    //Get selected layer
    gd::Layer * layer = GetSelectedLayer();
    if ( !layer ) return;

    std::string oldName = layer->GetName();
    layer->EditLayer();

    //Be sure to update instances if the layer name has changed.
    if ( layer->GetName() != oldName )
    {
        layout.GetInitialInstances().MoveInstancesToLayer(oldName, layer->GetName());
        if ( layoutCanvas && layoutCanvas->GetCurrentLayer() == oldName ) layoutCanvas->SetCurrentLayer(layer->GetName());
    }

    Refresh();
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

    if ( layoutCanvas ) layoutCanvas->SetCurrentLayer(layer->GetName());
    UpdateSelectedLayerIcon();
}

/** Item focused: Update the current layer
 */
void LayersEditorPanel::OnlayersListItemFocused(wxListEvent& event)
{
    //Get selected layer
    Layer * layer = GetSelectedLayer();
    if ( !layer ) return;

    if ( layoutCanvas ) layoutCanvas->SetCurrentLayer(layer->GetName());
    UpdateSelectedLayerIcon();
}


}
