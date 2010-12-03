#include "EditorLayers.h"

//(*InternalHeaders(EditorLayers)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/config.h>
#include <wx/log.h>
#include "GDL/CommonTools.h"
#include "GDL/Position.h"
#include "ObjectsOnBadLayerBox.h"
#include "EditLayer.h"
#include "SceneCanvas.h"
#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

//(*IdInit(EditorLayers)
const long EditorLayers::ID_PANEL3 = wxNewId();
const long EditorLayers::ID_LISTCTRL1 = wxNewId();
const long EditorLayers::idMenuEdit = wxNewId();
const long EditorLayers::idMenuAdd = wxNewId();
const long EditorLayers::idMenuDel = wxNewId();
const long EditorLayers::idMenuUp = wxNewId();
const long EditorLayers::idMenuDown = wxNewId();
//*)
const long EditorLayers::ID_BITMAPBUTTON1 = wxNewId();
const long EditorLayers::ID_BITMAPBUTTON6 = wxNewId();
const long EditorLayers::ID_BITMAPBUTTON3 = wxNewId();

BEGIN_EVENT_TABLE(EditorLayers,wxPanel)
	//(*EventTable(EditorLayers)
	//*)
END_EVENT_TABLE()

EditorLayers::EditorLayers(wxWindow* parent, Game & game_, Scene & scene_, vector < Layer > * layers_, MainEditorCommand & mainEditorCommand_) :
game(game_),
scene(scene_),
layers(layers_),
sceneCanvas(NULL),
mainEditorCommand(mainEditorCommand_)
{

	//(*Initialize(EditorLayers)
	wxMenuItem* MenuItem5;
	wxMenuItem* MenuItem4;
	wxMenuItem* MenuItem3;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	toolBarPanel = new wxPanel(this, ID_PANEL3, wxDefaultPosition, wxSize(120,25), wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	FlexGridSizer1->Add(toolBarPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	layersList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxSize(191,198), wxLC_REPORT, wxDefaultValidator, _T("ID_LISTCTRL1"));
	FlexGridSizer1->Add(layersList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	MenuItem1 = new wxMenuItem((&contextMenu), idMenuEdit, _("Editer les paramètres du calque"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
	contextMenu.Append(MenuItem1);
	contextMenu.AppendSeparator();
	MenuItem2 = new wxMenuItem((&contextMenu), idMenuAdd, _("Ajouter un calque"), wxEmptyString, wxITEM_NORMAL);
	MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	contextMenu.Append(MenuItem2);
	MenuItem3 = new wxMenuItem((&contextMenu), idMenuDel, _("Supprimer le calque"), wxEmptyString, wxITEM_NORMAL);
	MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	contextMenu.Append(MenuItem3);
	contextMenu.AppendSeparator();
	MenuItem4 = new wxMenuItem((&contextMenu), idMenuUp, _("Déplacer au dessus"), wxEmptyString, wxITEM_NORMAL);
	MenuItem4->SetBitmap(wxBitmap(wxImage(_T("res/up.png"))));
	contextMenu.Append(MenuItem4);
	MenuItem5 = new wxMenuItem((&contextMenu), idMenuDown, _("Déplacer au dessous"), wxEmptyString, wxITEM_NORMAL);
	MenuItem5->SetBitmap(wxBitmap(wxImage(_T("res/down.png"))));
	contextMenu.Append(MenuItem5);
	imageList = new wxImageList(16, 16, 1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	toolBarPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorLayers::OntoolBarPanelResize,0,this);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&EditorLayers::OnlayersListItemSelect1);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&EditorLayers::OnlayersListItemActivated);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_FOCUSED,(wxObjectEventFunction)&EditorLayers::OnlayersListItemFocused);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&EditorLayers::OnlayersListItemRClick);
	Connect(idMenuEdit,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorLayers::OnEditSelected1);
	Connect(idMenuAdd,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorLayers::OnAddSelected);
	Connect(idMenuDel,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorLayers::OnDelSelected);
	Connect(idMenuUp,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorLayers::OnUpSelected);
	Connect(idMenuDown,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorLayers::OnDownSelected);
	//*)
	Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorLayers::OnRefresh);
	Connect(ID_BITMAPBUTTON6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorLayers::OnMoreOptions);
	Connect(ID_BITMAPBUTTON3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorLayers::OnHelp);

    imageList->Add(wxBitmap("res/rightArrowGrey.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/1rightarrow.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/eye.png", wxBITMAP_TYPE_ANY));
    imageList->Add(wxBitmap("res/eyeGrey.png", wxBITMAP_TYPE_ANY));
    layersList->AssignImageList(imageList, wxIMAGE_LIST_SMALL);

	layersList->InsertColumn(1, "Calque");
	layersList->InsertColumn(2, "Visible");

    CreateToolbar();

    Refresh();
}

////////////////////////////////////////////////////////////
/// Mise à jour de la barre d'outils
////////////////////////////////////////////////////////////
void EditorLayers::CreateToolbar()
{
    toolbar = new wxToolBar( toolBarPanel, -1, wxDefaultPosition, wxDefaultSize,
                                   wxTB_FLAT | wxTB_NODIVIDER );

    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( ID_BITMAPBUTTON1, wxT( "Rafraichir" ), wxBitmap( wxImage( "res/refreshicon.png" ) ), _("Rafraichir la liste des calques") );
    toolbar->AddSeparator();
    toolbar->AddTool( idMenuAdd, wxT( "Ajouter un calque" ), wxBitmap( wxImage( "res/addicon.png" ) ), _("Ajouter un calque") );
    toolbar->AddTool( idMenuDel, wxT( "Supprimer le calque sélectionné" ), wxBitmap( wxImage( "res/deleteicon.png" ) ), _("Supprimer le calque sélectionné") );
    toolbar->AddSeparator();
    toolbar->AddTool( idMenuUp, wxT( "Déplacer le calque au dessus" ), wxBitmap( wxImage( "res/up.png" ) ), _("Déplacer le calque au dessus") );
    toolbar->AddTool( idMenuDown, wxT( "Déplacer le calque au dessous" ), wxBitmap( wxImage( "res/down.png" ) ), _("Déplacer le calque au dessous") );
    toolbar->AddTool( ID_BITMAPBUTTON6, wxT( "Plus d'options d'édition ( clic droit sur la liste )" ), wxBitmap( wxImage( "res/moreicon.png" ) ), _("Plus d'options d'édition ( clic droit sur la liste )") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_BITMAPBUTTON3, wxT( "Aide de l'éditeur d'objets" ), wxBitmap( wxImage( "res/helpicon.png" ) ), _("Aide de l'éditeur d'objets") );
    toolbar->Realize();

    //On vérifie si on est pas en mode simple.
    wxConfigBase * pConfig = wxConfigBase::Get();

    bool result;
    pConfig->Read("/ModeSimple", &result);

    if ( result )
    {
        toolbar->EnableTool(ID_BITMAPBUTTON1, false);
        toolbar->EnableTool(ID_BITMAPBUTTON6, false);
    }

    //Obligatoire avec wxGTK, sinon la toolbar ne s'affiche pas
#ifdef __WXGTK__
    wxSize tbSize = toolbar->GetSize();
    gtk_widget_set_usize( toolbar->m_widget, tbSize.GetWidth(), tbSize.GetHeight() );
#endif
}

////////////////////////////////////////////////////////////
/// Redimensionnement de la toolbar
////////////////////////////////////////////////////////////
void EditorLayers::OntoolBarPanelResize(wxSizeEvent& event)
{
    toolbar->SetSize(toolBarPanel->GetSize().x, -1);
}

EditorLayers::~EditorLayers()
{
	//(*Destroy(EditorLayers)
	//*)
}

void EditorLayers::OnRefresh(wxCommandEvent& event)
{
    Refresh();
}

void EditorLayers::OnMoreOptions(wxCommandEvent& event)
{
    PopupMenu(&contextMenu);
}

void EditorLayers::OnHelp(wxCommandEvent& event)
{
    //TODO
}

////////////////////////////////////////////////////////////
/// Rafraichissement de la liste
////////////////////////////////////////////////////////////
void EditorLayers::Refresh()
{
    layersList->DeleteAllItems();

    for (unsigned int i =0;i<layers->size();++i)
    {
        string name = layers->at(i).GetName();
        if ( name == "" ) name = _("Calque de base");
    	layersList->InsertItem(0, name);

    	if ( layers->at(i).GetVisibility() )
            layersList->SetItemColumnImage(0, 1, 2);
        else
            layersList->SetItemColumnImage(0, 1, 3);

        layersList->SetItemImage(0,-1,0);
    }
    layersList->SetColumnWidth( 0, wxLIST_AUTOSIZE );
    layersList->SetColumnWidth( 1, wxLIST_AUTOSIZE );

    UpdateSelectedLayerIcon();
}

void EditorLayers::UpdateSelectedLayerIcon()
{
    if ( !sceneCanvas ) return;

    for (unsigned int i =0;i<layers->size();++i)
    {
    	if ( layers->at(i).GetName() == sceneCanvas->scene.addOnLayer )
            layersList->SetItemImage(layers->size()-i-1,1,1);
        else
            layersList->SetItemImage(layers->size()-i-1,-1,-1);
    }
}

////////////////////////////////////////////////////////////
/// Ajouter un calque
////////////////////////////////////////////////////////////
void EditorLayers::OnAddSelected(wxCommandEvent& event)
{
    wxString name = _("Nouveau calque");

    bool alreadyExist = false;
    int nb = 0;
    for (unsigned int i = 0;i<layers->size();++i)
    {
    	if ( layers->at(i).GetName() == name )
            alreadyExist = true;
    }
    while ( alreadyExist )
    {
        ++nb;
        name = _("Nouveau calque ") + ToString(nb);

        alreadyExist = false;
        for (unsigned int i = 0;i<layers->size();++i)
        {
            if ( layers->at(i).GetName() == name )
                alreadyExist = true;
        }
    }

    Layer layer;
    layer.SetName(static_cast<string>(name));
    layer.SetCamerasNumber(1);
    layers->push_back(layer);

    Refresh();
    if ( sceneCanvas ) sceneCanvas->Reload();
}

/**
 * Delete a layer
 */
void EditorLayers::OnDelSelected(wxCommandEvent& event)
{
    //Get selected layer
    Layer * selectedLayer = GetSelectedLayer();
    if ( !selectedLayer || selectedLayer->GetName().empty() ) return;

    std::string name = selectedLayer->GetName();

    for (unsigned int i = 0;i<layers->size();++i)
    {
    	if ( &layers->at(i) == selectedLayer )
    	{
    	    //Liste de calques sans celui à supprimer
    	    vector < Layer > layersWithoutLayerToDelete = *layers;
    	    layersWithoutLayerToDelete.erase(layersWithoutLayerToDelete.begin() + i );

            //Verifying if there are objects on this layer
            bool objectsOnThisLayer = false;
            for (unsigned int j =0;j<scene.initialObjectsPositions.size();++j)
            {
                if ( scene.initialObjectsPositions[j].layer == name )
                    objectsOnThisLayer = true;
            }

    	    //Confirmation de la suppression et choix du sort des objets dessus
    	    if ( objectsOnThisLayer )
    	    {
                ObjectsOnBadLayerBox dialog(this, layersWithoutLayerToDelete);
                int choice = dialog.ShowModal();

                if ( choice == 0 ) return; //Annulation
                else if ( choice == 1 )
                {
                    for (int i = scene.initialObjectsPositions.size()-1;i>=0;--i)
                    {
                        if ( scene.initialObjectsPositions[i].layer == name )
                            scene.initialObjectsPositions.erase(scene.initialObjectsPositions.begin()+i);
                    }
                }
                else if ( choice == 2 )
                {
                    for (unsigned int i =0;i<scene.initialObjectsPositions.size();++i)
                    {
                        if ( scene.initialObjectsPositions[i].layer == name )
                            scene.initialObjectsPositions[i].layer = dialog.moveOnLayerNamed;
                    }
                }
    	    }

            //Delete the layer
    	    layers->erase(layers->begin() + i );
            Refresh();
            if ( sceneCanvas ) sceneCanvas->Reload();
    	    return;
    	}
    }
    wxLogWarning(_("Impossible de trouver le calque à supprimer !"));
}

////////////////////////////////////////////////////////////
/// Remonter un calquer
////////////////////////////////////////////////////////////
void EditorLayers::OnUpSelected(wxCommandEvent& event)
{
    //Get selected layer
    Layer * selectedLayer = GetSelectedLayer();
    if ( !selectedLayer ) return;

    for (unsigned int i = 0;i<layers->size();++i)
    {
    	if ( &layers->at(i) == selectedLayer )
    	{
    	    if ( i <= layers->size()-1-1 )
    	    {
    	        //On déplace le calque
    	        Layer layer = layers->at(i);
                layers->erase(layers->begin() + i );
                layers->insert(layers->begin()+i+1, layer);

                Refresh();
                if ( sceneCanvas ) sceneCanvas->Reload();

                //On reslectionne le calque
                layersList->SetItemState(layers->size()-i-1-1, wxLIST_STATE_SELECTED, wxLIST_STATE_SELECTED);
                cout << "Selecte" << layers->size()-i-1;
    	    }
    	    return;
    	}
    }
    wxLogWarning(_("Impossible de trouver le calque à déplacer !"));
}

////////////////////////////////////////////////////////////
/// Descendre un calque
////////////////////////////////////////////////////////////
void EditorLayers::OnDownSelected(wxCommandEvent& event)
{
    //Get selected layer
    Layer * selectedLayer = GetSelectedLayer();
    if ( !selectedLayer ) return;

    for (unsigned int i = 0;i<layers->size();++i)
    {
    	if ( &layers->at(i) == selectedLayer )
    	{
    	    if ( i >= 1 )
    	    {
    	        //On déplace le calque
    	        Layer layer = layers->at(i);
                layers->erase(layers->begin() + i );
                layers->insert(layers->begin()+i-1, layer);

                Refresh();
                if ( sceneCanvas ) sceneCanvas->Reload();

                //On reslectionne le calque
                layersList->SetItemState(layers->size()-i, wxLIST_STATE_SELECTED, wxLIST_STATE_SELECTED);
                cout << "Selecte" << layers->size()-i+1;
    	    }
    	    return;
    	}
    }
    wxLogWarning(_("Impossible de trouver le calque à déplacer !"));
}

////////////////////////////////////////////////////////////
/// Clic droit : Mise à jour du calque selectionné et menu contextuel
////////////////////////////////////////////////////////////
void EditorLayers::OnlayersListItemRClick(wxListEvent& event)
{
    PopupMenu(&contextMenu);
}

////////////////////////////////////////////////////////////
/// Connaitre le numéro de l'item selectionné dans la liste
////////////////////////////////////////////////////////////
Layer* EditorLayers::GetSelectedLayer()
{
    long itemIndex = -1;

    for (;;)
    {
        itemIndex = layersList->GetNextItem(itemIndex,wxLIST_NEXT_ALL,wxLIST_STATE_SELECTED);
        if (itemIndex == -1) break;

        // Got the selected item index
        unsigned int layerId = layers->size()-itemIndex-1;
        if ( layerId < layers->size() )
        {
            return &layers->at(layerId);
        }
    }

    return NULL;
}

////////////////////////////////////////////////////////////
/// Selection d'un item : Mise à jour du calque selectionné
////////////////////////////////////////////////////////////
void EditorLayers::OnlayersListItemActivated(wxListEvent& event)
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

        //Changes without reloading
        if ( sceneCanvas )
        {
            for (unsigned int i = 0;i<sceneCanvas->scene.layers.size();++i)
            {
                if ( sceneCanvas->scene.layers[i].GetName() == selectedLayer->GetName() )
                    sceneCanvas->scene.layers[i].SetVisibility(selectedLayer->GetVisibility());
            }
        }
        return;
    }
    else
    {
        EditSelectedLayer();
    }
}

void EditorLayers::EditSelectedLayer()
{
    //Get selected layer
    Layer * layer = GetSelectedLayer();
    if ( !layer ) return;

    //Edition du calque
    string oldName = layer->GetName();
    EditLayer dialog(this, *layer);
    dialog.ShowModal();

    //On renomme les objets qui sont sur le calque
    if ( layer->GetName() != oldName )
    {
        for (int i = scene.initialObjectsPositions.size()-1;i>=0;--i)
        {
            if ( scene.initialObjectsPositions[i].layer == oldName )
                scene.initialObjectsPositions[i].layer = layer->GetName();
        }
    }

    Refresh();
    if ( sceneCanvas ) sceneCanvas->Reload();
}

////////////////////////////////////////////////////////////
/// Clic sur le bouton d'édition
////////////////////////////////////////////////////////////
void EditorLayers::OnEditSelected1(wxCommandEvent& event)
{
    EditSelectedLayer();
}

////////////////////////////////////////////////////////////
/// Selection d'un item :Mise à jour du calque selectionné
////////////////////////////////////////////////////////////
void EditorLayers::OnlayersListItemSelect1(wxListEvent& event)
{
    //Get selected layer
    Layer * layer = GetSelectedLayer();
    if ( !layer ) return;

    if ( sceneCanvas ) sceneCanvas->scene.addOnLayer = layer->GetName();
    UpdateSelectedLayerIcon();
}

void EditorLayers::OnlayersListItemFocused(wxListEvent& event)
{
    //Get selected layer
    Layer * layer = GetSelectedLayer();
    if ( !layer ) return;

    if ( sceneCanvas ) sceneCanvas->scene.addOnLayer = layer->GetName();
    UpdateSelectedLayerIcon();
}
