/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "LayoutEditorCanvas.h"
#include <cmath>
#include <wx/wx.h>
#include <wx/config.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/page.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/aui/aui.h>
#include "GDCore/IDE/Dialogs/LayoutEditorCanvasAssociatedEditor.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvasTextDnd.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvasOptions.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/GridSetupDialog.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/PlatformDefinition/InitialInstance.h"
#include "GDCore/PlatformDefinition/InitialInstancesContainer.h"
#include "GDCore/CommonTools.h"

//(*InternalHeaders(LayoutEditorCanvas)
#include <wx/intl.h>
#include <wx/string.h>
//*)

//(*IdInit(LayoutEditorCanvas)
//*)

namespace gd
{

BEGIN_EVENT_TABLE(LayoutEditorCanvas,wxPanel)
	//(*EventTable(LayoutEditorCanvas)
	//*)
END_EVENT_TABLE()

const long LayoutEditorCanvas::idRibbonEditMode = wxNewId();
const long LayoutEditorCanvas::idRibbonPreviewMode = wxNewId();
const long LayoutEditorCanvas::idRibbonHelp = wxNewId();
const long LayoutEditorCanvas::idRibbonObjectsEditor = wxNewId();
const long LayoutEditorCanvas::idRibbonLayersEditor = wxNewId();
const long LayoutEditorCanvas::idRibbonGrid = wxNewId();
const long LayoutEditorCanvas::idRibbonWindowMask = wxNewId();
const long LayoutEditorCanvas::idRibbonGridSetup = wxNewId();
const long LayoutEditorCanvas::idRibbonUndo = wxNewId();
const long LayoutEditorCanvas::idRibbonRedo = wxNewId();
const long LayoutEditorCanvas::idRibbonObjectsPositionList = wxNewId();
const long LayoutEditorCanvas::idUndo10 = wxNewId();
const long LayoutEditorCanvas::idUndo20 = wxNewId();
const long LayoutEditorCanvas::idClearHistory = wxNewId();
const long LayoutEditorCanvas::idRibbonFullScreen = wxNewId();

LayoutEditorCanvas::LayoutEditorCanvas(wxWindow* parent, gd::Project & project_, gd::Layout & layout_, gd::InitialInstancesContainer & instances_, LayoutEditorCanvasOptions & options_, gd::MainFrameWrapper & mainFrameWrapper_) :
    project(project_),
    layout(layout_),
    instances(instances_),
    options(options_),
    mainFrameWrapper(mainFrameWrapper_),
    parentControl(parent),
    parentAuiManager(NULL),
    hScrollbar(NULL),
    vScrollbar(NULL),
    hasJustRightClicked(false),
    ctrlPressed(false),
    shiftPressed(false),
    isMovingInstance(false),
    isSelecting(false),
    editing(true)
{
	//(*Initialize(LayoutEditorCanvas)
	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL|wxWANTS_CHARS, _T("wxID_ANY"));
	//*)
	Connect(wxEVT_PAINT,(wxObjectEventFunction)&LayoutEditorCanvas::OnPaint);
	Connect(wxEVT_ERASE_BACKGROUND,(wxObjectEventFunction)&LayoutEditorCanvas::OnEraseBackground);
	Connect(wxEVT_IDLE,(wxObjectEventFunction)&LayoutEditorCanvas::OnIdle);
	Connect(wxEVT_LEFT_DOWN,(wxObjectEventFunction)&LayoutEditorCanvas::OnLeftDown);
	Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&LayoutEditorCanvas::OnLeftUp);
	Connect(wxEVT_RIGHT_UP,(wxObjectEventFunction)&LayoutEditorCanvas::OnRightUp);
	Connect(wxEVT_MIDDLE_DOWN,(wxObjectEventFunction)&LayoutEditorCanvas::OnMiddleDown);
	Connect(wxEVT_MOTION,(wxObjectEventFunction)&LayoutEditorCanvas::OnMotion);
	Connect(wxEVT_KEY_DOWN,(wxObjectEventFunction)&LayoutEditorCanvas::OnKey);
	Connect(wxEVT_KEY_UP,(wxObjectEventFunction)&LayoutEditorCanvas::OnKeyUp);
	Connect(wxEVT_MOUSEWHEEL,(wxObjectEventFunction)&LayoutEditorCanvas::OnMouseWheel);
    SetDropTarget(new LayoutEditorCanvasTextDnd(*this));

    //Generate undo menu
    {
        wxMenuItem * undo10item = new wxMenuItem(&undoMenu, idUndo10, _("Cancel 10 changes"), wxEmptyString, wxITEM_NORMAL);
        undoMenu.Append(undo10item);
        wxMenuItem * undo20item = new wxMenuItem(&undoMenu, idUndo20, _("Cancel 20 changes"), wxEmptyString, wxITEM_NORMAL);
        undoMenu.Append(undo20item);
        undoMenu.AppendSeparator();
        wxMenuItem * clearHistoryItem = new wxMenuItem(&undoMenu, idClearHistory, _("Delete the historic"), wxEmptyString, wxITEM_NORMAL);
        clearHistoryItem->SetBitmap(wxImage( "res/history_clear16.png" ) );
        undoMenu.Append(clearHistoryItem);
    }

    //Prepare undo-related variables
    latestState = boost::shared_ptr<gd::InitialInstancesContainer>(instances.Clone());
}

LayoutEditorCanvas::~LayoutEditorCanvas()
{
	//(*Destroy(LayoutEditorCanvas)
	//*)
}

void LayoutEditorCanvas::AddAssociatedEditor(gd::LayoutEditorCanvasAssociatedEditor * editor)
{
    if (!editor) return;

    associatedEditors.insert(editor);
}

void LayoutEditorCanvas::ConnectEvents()
{
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonEditMode, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&LayoutEditorCanvas::OnEditionBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonPreviewMode, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&LayoutEditorCanvas::OnPreviewBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonHelp,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&LayoutEditorCanvas::OnHelpBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonObjectsEditor, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&LayoutEditorCanvas::OnObjectsEditor, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonLayersEditor, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&LayoutEditorCanvas::OnLayersEditor, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonGrid, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&LayoutEditorCanvas::OnGridBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonGridSetup, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&LayoutEditorCanvas::OnGridSetupBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonWindowMask, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&LayoutEditorCanvas::OnWindowMaskBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonUndo,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&LayoutEditorCanvas::OnUndoBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonUndo, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, (wxObjectEventFunction)&LayoutEditorCanvas::OnUndoMoreBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonRedo,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&LayoutEditorCanvas::OnRedoBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonObjectsPositionList,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&LayoutEditorCanvas::OnObjectsPositionList, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idUndo10,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnUndo10Selected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idUndo20,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnUndo20Selected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idClearHistory,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnClearHistorySelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonFullScreen,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&LayoutEditorCanvas::OnFullScreenBtClick, NULL, this);

    DoConnectEvents();
}

void LayoutEditorCanvas::OnPaint(wxPaintEvent& event)
{
    wxPaintDC dc(this);
}

/**
 * Go in preview mode
 */
void LayoutEditorCanvas::OnPreviewBtClick( wxCommandEvent & event )
{
    if ( !editing ) return;
    std::cout << "Switching to preview mode..." << std::endl;

    editing = false;

    //Let the IDE go into to preview state
    //Note: Working directory is changed later, just before loading the scene
    mainFrameWrapper.LockShortcuts(this);
    mainFrameWrapper.DisableControlsForScenePreviewing();
    for (std::set<LayoutEditorCanvasAssociatedEditor*>::iterator it = associatedEditors.begin();it !=associatedEditors.end();++it)
        (*it)->Enable(false);

    RecreateRibbonToolbar();
    hScrollbar->Show(false);
    vScrollbar->Show(false);

    SetFocus();
}

/**
 * Go in edition mode
 */
void LayoutEditorCanvas::OnEditionBtClick( wxCommandEvent & event )
{
    if ( editing ) return;
    std::cout << "Switching to edition mode..." << std::endl;

    editing = true;

    //Let the IDE go back to edition state
    wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());
    mainFrameWrapper.UnLockShortcuts(this);
    mainFrameWrapper.EnableControlsAfterScenePreviewing();
    for (std::set<LayoutEditorCanvasAssociatedEditor*>::iterator it = associatedEditors.begin();it !=associatedEditors.end();++it)
        (*it)->Enable();

    RecreateRibbonToolbar();
    hScrollbar->Show(true);
    vScrollbar->Show(true);
}

wxRibbonButtonBar* LayoutEditorCanvas::CreateRibbonPage(wxRibbonPage * page)
{
    bool hideLabels = false;
    wxConfigBase::Get()->Read( _T( "/Skin/HideLabels" ), &hideLabels );

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Mode"), wxBitmap("res/view24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonEditMode, !hideLabels ? _("Edition") : "", wxBitmap("res/edit24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonPreviewMode, !hideLabels ? _("Preview") : "", wxBitmap("res/view24.png", wxBITMAP_TYPE_ANY));
    }

    wxRibbonPanel *toolsPanel = new wxRibbonPanel(page, wxID_ANY, _("Tools"), wxBitmap("res/tools24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
    wxRibbonButtonBar * ribbonToolbar = new wxRibbonButtonBar(toolsPanel, wxID_ANY);

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Help"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonHelp, !hideLabels ? _("Help") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
    }

    return ribbonToolbar;
}

void LayoutEditorCanvas::RecreateRibbonToolbar()
{
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->ClearButtons();

    if ( editing )
        CreateEditionRibbonTools();
    else
        CreatePreviewRibbonTools();

    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->Realize();
}

void LayoutEditorCanvas::CreatePreviewRibbonTools()
{
    bool hideLabels = false;
    wxConfigBase::Get()->Read( _T( "/Skin/HideLabels" ), &hideLabels );
    gd::CommonBitmapManager * bitmapManager = gd::CommonBitmapManager::GetInstance();

    wxRibbonButtonBar * ribbonToolbar = mainFrameWrapper.GetRibbonSceneEditorButtonBar();
    ribbonToolbar->AddButton(idRibbonFullScreen, !hideLabels ? _("Display editor fullscreen") : "", bitmapManager->fullscreen24);
}

void LayoutEditorCanvas::CreateEditionRibbonTools()
{
    bool hideLabels = false;
    wxConfigBase::Get()->Read( _T( "/Skin/HideLabels" ), &hideLabels );
    gd::CommonBitmapManager * bitmapManager = gd::CommonBitmapManager::GetInstance();

    wxRibbonButtonBar * ribbonToolbar = mainFrameWrapper.GetRibbonSceneEditorButtonBar();
    ribbonToolbar->AddButton(idRibbonObjectsEditor, !hideLabels ? _("Objects") : "", bitmapManager->objects24);
    ribbonToolbar->AddButton(idRibbonLayersEditor, !hideLabels ? _("Layers editor") : "", bitmapManager->layers24);
    ribbonToolbar->AddButton(idRibbonObjectsPositionList, !hideLabels ? _("Instances") : "", bitmapManager->objectsPositionsList24);
    ribbonToolbar->AddHybridButton(idRibbonUndo, !hideLabels ? _("Cancel") : "", bitmapManager->undo24);
    ribbonToolbar->AddButton(idRibbonRedo, !hideLabels ? _("Redo") : "", bitmapManager->redo24);
    ribbonToolbar->AddButton(idRibbonGrid, !hideLabels ? _("Grid") : "", bitmapManager->grid24);
    ribbonToolbar->AddButton(idRibbonGridSetup, !hideLabels ? _("Edit the grid") : "", bitmapManager->gridedit24);
    ribbonToolbar->AddButton(idRibbonWindowMask, !hideLabels ? _("Mask") : "", bitmapManager->windowMask24);
}

/** \brief Tool class picking the smallest instance under the cursor.
 */
class HighestZOrderFinder : public gd::InitialInstanceFunctor
{
public:
    HighestZOrderFinder() : highestZOrder(0), firstCall(true), layerRestricted(false) {};
    virtual ~HighestZOrderFinder() {};

    virtual void operator()(gd::InitialInstance & instance)
    {
        if ( !layerRestricted || instance.GetLayer() == layerName)
        {
            if ( firstCall ) highestZOrder = instance.GetZOrder();
            else highestZOrder = std::max(highestZOrder, instance.GetZOrder());
        }
    }

    void RestrictSearchToLayer(const std::string & layerName_) { layerName = layerName_; layerRestricted = true; };
    int GetHighestZOrder() const { return highestZOrder; }

private:
    int highestZOrder;
    bool firstCall;

    bool layerRestricted; ///< If true, the search is restricted to the layer called \a layerName.
    std::string layerName;
};

void LayoutEditorCanvas::AddObject(const std::string & objectName)
{
    AddObject(objectName, GetMouseXOnLayout(), GetMouseYOnLayout());
}

void LayoutEditorCanvas::AddObject(const std::string & objectName, float x, float y)
{
    if ( !editing || objectName.empty() ) return;
    isMovingInstance = false;

    //Create the new instance
    InitialInstance & newInstance = instances.InsertNewInitialInstance();
    newInstance.SetObjectName(objectName);
    newInstance.SetLayer(currentLayer);

    //Compute position
    if ( options.grid && options.snap )
    {
        newInstance.SetX(static_cast<int>(x/options.gridWidth +0.5)*options.gridWidth);
        newInstance.SetY(static_cast<int>(y/options.gridHeight+0.5)*options.gridHeight);
    }
    else
    {
        newInstance.SetX(x);
        newInstance.SetY(y);
    }

    //Compute the Z order
    HighestZOrderFinder zOrderFinder;
    zOrderFinder.RestrictSearchToLayer(currentLayer);
    instances.IterateOverInstances(zOrderFinder);
    newInstance.SetZOrder(zOrderFinder.GetHighestZOrder()+1);

    //Notify child and sub editors
    OnInitialInstanceAdded(newInstance);

    for (std::set<LayoutEditorCanvasAssociatedEditor*>::iterator it = associatedEditors.begin();it !=associatedEditors.end();++it)
        (*it)->InitialInstancesUpdated();
    ChangesMade();
}

void LayoutEditorCanvas::OnLeftDown( wxMouseEvent &event )
{
    SetFocus();

    if ( !editing ) return;

    if ( hasJustRightClicked )
    {
        hasJustRightClicked = false;
        return;
    }

    double mouseX = GetMouseXOnLayout();
    double mouseY = GetMouseYOnLayout();

    //Check if there is a click on a gui element inside the layout
    for (unsigned int i = 0;i<guiElements.size();++i)
    {
        if ( guiElements[i].area.Contains(event.GetX(), event.GetY()) )
        {
            OnGuiElementPressed(guiElements[i]);
            return ;
        }
    }

    //Check if an instance is selected
    {
        InitialInstance * instance = GetInitialInstanceUnderCursor();

        //Check if we must unselect all the objects
        if ( !shiftPressed && //Check that shift is not pressed
            ( instance == NULL || //If no object is clicked
              selectedInstances.find(instance) == selectedInstances.end()) ) //Or an object which is not currently selected.
        {
            ClearSelection();
        }


        if ( instance == NULL ) //If no object is clicked, create a selection rectangle
        {
            isSelecting = true;
            selectionRectangle = wxRect(wxPoint(mouseX, mouseY), wxPoint(mouseX, mouseY));
            return;
        }
        else //We made a click on an object
        {
            SelectInstance(instance);

            if (!isMovingInstance && ctrlPressed)
            {
                for ( std::map <InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
                {
                    OnInitialInstanceAdded(instances.InsertInitialInstance(*(it->first)));
                }

                for (std::set<LayoutEditorCanvasAssociatedEditor*>::iterator it = associatedEditors.begin();it !=associatedEditors.end();++it)
                    (*it)->InitialInstancesUpdated();
            }

            isMovingInstance = true;
        }

        oldMouseX = mouseX; //Remember the old position of the cursor for
        oldMouseY = mouseY; //use during the next event.
    }
}

void LayoutEditorCanvas::ClearSelection()
{
    selectedInstances.clear();
    for (std::set<LayoutEditorCanvasAssociatedEditor*>::iterator it = associatedEditors.begin();it !=associatedEditors.end();++it)
        (*it)->DeselectedAllInitialInstance();
}

void LayoutEditorCanvas::SelectInstance(InitialInstance * instance)
{
    if ( !instance ) return;

    selectedInstances[instance] = wxRealPoint(instance->GetX(), instance->GetY());
    for (std::set<LayoutEditorCanvasAssociatedEditor*>::iterator it = associatedEditors.begin();it !=associatedEditors.end();++it)
        (*it)->SelectedInitialInstance(*instance);
}

void LayoutEditorCanvas::UnselectInstance(InitialInstance * instance)
{
    if ( !instance ) return;

    selectedInstances.erase(instance);
    for (std::set<LayoutEditorCanvasAssociatedEditor*>::iterator it = associatedEditors.begin();it !=associatedEditors.end();++it)
        (*it)->DeselectedInitialInstance(*instance);
}

void LayoutEditorCanvas::DeleteInstances(std::vector<InitialInstance *> instancesToDelete)
{
    for (unsigned int i = 0;i<instancesToDelete.size();++i)
    {
        if (instancesToDelete[i] == NULL ) continue;

        OnInitialInstanceDeleted(*instancesToDelete[i]);
        instances.RemoveInstance(*instancesToDelete[i]);

        if ( selectedInstances.find(instancesToDelete[i]) != selectedInstances.end()) selectedInstances.erase(instancesToDelete[i]);
    }

    for (std::set<LayoutEditorCanvasAssociatedEditor*>::iterator it = associatedEditors.begin();it !=associatedEditors.end();++it)
        (*it)->InitialInstancesUpdated();
}

/** \brief Tool class collecting in a list all the instances that are inside the selectionRectangle of the layout editor canvas.
 */
class InstancesInsideSelectionPicker : public gd::InitialInstanceFunctor
{
public:
    InstancesInsideSelectionPicker(const LayoutEditorCanvas & editor_) : editor(editor_) {};
    virtual ~InstancesInsideSelectionPicker() {};

    virtual void operator()(gd::InitialInstance & instance)
    {
        if ( instance.IsLocked() ) return;

        if ( editor.selectionRectangle.Contains(editor.GetRealXPositionOfInitialInstance(instance), editor.GetRealYPositionOfInitialInstance(instance)) &&
             editor.selectionRectangle.Contains(editor.GetRealXPositionOfInitialInstance(instance)+editor.GetWidthOfInitialInstance(instance),
                                                editor.GetRealYPositionOfInitialInstance(instance)+editor.GetHeightOfInitialInstance(instance)) )
        {
            selectedList.push_back(&instance);
        }
    }

    std::vector<InitialInstance*> & GetSelectedList() { return selectedList; };

private:
    const LayoutEditorCanvas & editor;
    std::vector<InitialInstance*> selectedList; ///< This list will be filled with the instances that are into the selectionRectangle
};

void LayoutEditorCanvas::OnLeftUp( wxMouseEvent &event )
{
    if ( !editing ) return;

    //Check if there is a click released on a gui element inside the layout
    for (unsigned int i = 0;i<guiElements.size();++i)
    {
        if ( guiElements[i].area.Contains(event.GetX(), event.GetY()) )
        {
            OnGuiElementReleased(guiElements[i]);
            return;
        }
    }

    if ( isMovingInstance )
    {
        bool changesMade = false;
        for ( std::map <InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
        {
            //Update the member containing the "start" position of the instances.
            if (it->second.x != it->first->GetX() || it->second.y != it->first->GetY() )
            {
                it->second.x = it->first->GetX(); it->second.y = it->first->GetY();
                changesMade = true;
            }
        }

        if ( changesMade )
        {
            ChangesMade();

            for (std::set<LayoutEditorCanvasAssociatedEditor*>::iterator it = associatedEditors.begin();it !=associatedEditors.end();++it)
                (*it)->InitialInstancesUpdated();
        }
        isMovingInstance = false;
    }

    //Select object thanks to the selection area
    if ( isSelecting )
    {
        //Be sure that the selection rectangle origin is on the top left
        if ( selectionRectangle.GetWidth() < 0 )
        {
            selectionRectangle.SetX(selectionRectangle.GetX()+selectionRectangle.GetWidth());
            selectionRectangle.SetWidth(-selectionRectangle.GetWidth());
        }
        if ( selectionRectangle.GetHeight() < 0 )
        {
            selectionRectangle.SetY(selectionRectangle.GetY()+selectionRectangle.GetHeight());
            selectionRectangle.SetHeight(-selectionRectangle.GetHeight());
        }

        //Select the instances that are inside the selection rectangle
        InstancesInsideSelectionPicker picker(*this);
        instances.IterateOverInstances(picker);

        for ( unsigned int i = 0; i<picker.GetSelectedList().size();++i)
            SelectInstance(picker.GetSelectedList()[i]);

        isSelecting = false;
    }
}

void LayoutEditorCanvas::OnKey( wxKeyEvent& evt )
{
    if (!editing)
    {
        evt.StopPropagation();
        return;
    }

    if ( evt.GetKeyCode() == WXK_CONTROL )
        ctrlPressed = true;
    if ( evt.GetKeyCode() == WXK_SHIFT )
        shiftPressed = true;

    if ( evt.GetKeyCode() == WXK_DELETE )
    {
        std::vector<InitialInstance*> instancesToDelete;
        for ( std::map <InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
            instancesToDelete.push_back(it->first);

        DeleteInstances(instancesToDelete);

        ClearSelection();
        ChangesMade();
    }
    else if ( evt.GetKeyCode() == WXK_DOWN )
    {
        for ( std::map <InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
        {
            it->first->SetY(it->first->GetY()+1);
            OnInitialInstanceMoved(*(it->first));
        }
    }
    else if ( evt.GetKeyCode() == WXK_UP )
    {
        for ( std::map <InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
        {
            it->first->SetY(it->first->GetY()-1);
            OnInitialInstanceMoved(*(it->first));
        }
    }
    else if ( evt.GetKeyCode() == WXK_RIGHT )
    {
        for ( std::map <InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
        {
            it->first->SetX(it->first->GetX()+1);
            OnInitialInstanceMoved(*(it->first));
        }
    }
    else if ( evt.GetKeyCode() == WXK_LEFT )
    {
        for ( std::map <InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
        {
            it->first->SetX(it->first->GetX()-1);
            OnInitialInstanceMoved(*(it->first));
        }
    }

    evt.StopPropagation();
}

void LayoutEditorCanvas::OnKeyUp( wxKeyEvent& evt )
{
    if (!editing)
    {
        evt.StopPropagation();
        return;
    }

    if ( evt.GetKeyCode() == WXK_CONTROL )
        ctrlPressed = false;
    if ( evt.GetKeyCode() == WXK_SHIFT )
        shiftPressed = false;
}

void LayoutEditorCanvas::OnMotion( wxMouseEvent &event )
{
    double mouseX = GetMouseXOnLayout();
    double mouseY = GetMouseYOnLayout();

    if ( !editing )
        wxLogStatus( wxString( _( "Position " ) ) + ToString( mouseX ) + wxString( _( ";" ) ) + ToString( mouseY ) + wxString( _( ". ( Base layer, camera 0 )" ) ) );
    else
        wxLogStatus( wxString( _( "Position " ) ) + ToString( mouseX ) + wxString( _( ";" ) ) + ToString( mouseY ) + wxString( _( ". SHIFT for multiple selection, right click for more options." ) ) );

    //Check if there is a gui element hovered inside the layout
    for (unsigned int i = 0;i<guiElements.size();++i)
    {
        if ( guiElements[i].area.Contains(event.GetX(), event.GetY()) )
            OnGuiElementHovered(guiElements[i]);
    }

    if ( isMovingInstance )
    {
        //Get the displacement of the cursor
        float deltaX = mouseX - oldMouseX;
        float deltaY = mouseY - oldMouseY;

        for ( std::map <InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
        {
            //Compute new position
            float newX = it->second.x + deltaX;
            float newY = it->second.y + deltaY;

            if ( options.grid && options.snap )
            {
                newX = std::floor(newX/options.gridWidth +0.5)*options.gridWidth;
                newY = std::floor(newY/options.gridHeight+0.5)*options.gridHeight;
            }

            //Move the initial instance
            it->first->SetX(newX);
            it->first->SetY(newY);

            OnInitialInstanceMoved(*(it->first));
        }
    }
    if ( isSelecting )
    {
        selectionRectangle.SetBottomRight(wxPoint(mouseX, mouseY));
    }
}

void LayoutEditorCanvas::ChangesMade()
{
    history.push_back(boost::shared_ptr<gd::InitialInstancesContainer>(latestState->Clone()));
    redoHistory.clear();
    latestState->Create(instances);
}


/** \brief Tool class picking the smallest instance under the cursor.
 */
class SmallestInstanceUnderCursorPicker : public gd::InitialInstanceFunctor
{
public:
    SmallestInstanceUnderCursorPicker(const LayoutEditorCanvas & editor_, double xPosition_, double yPosition_) :
        editor(editor_),
        smallestInstance(NULL),
        smallestInstanceArea(0),
        xPosition(xPosition_),
        yPosition(yPosition_),
        pickLockedOnly(false)
    {
    };
    virtual ~SmallestInstanceUnderCursorPicker() {};

    virtual void operator()(gd::InitialInstance & instance)
    {
        if ( pickLockedOnly != instance.IsLocked() ) return;

        wxRect2DDouble boundingBox(editor.GetRealXPositionOfInitialInstance(instance), editor.GetRealYPositionOfInitialInstance(instance),
                                   editor.GetWidthOfInitialInstance(instance), editor.GetHeightOfInitialInstance(instance));

        if ( boundingBox.Contains(wxPoint2DDouble(xPosition, yPosition)) )
        {
            if ( smallestInstance == NULL || boundingBox.GetSize().GetWidth()*boundingBox.GetSize().GetHeight() < smallestInstanceArea )
            {
                smallestInstance = &instance;
                smallestInstanceArea = boundingBox.GetSize().GetWidth()*boundingBox.GetSize().GetHeight();
            }
        }
    }

    InitialInstance * GetSmallestInstanceUnderCursor() { return smallestInstance; };

    void PickLockedInstancesAndOnlyThem() { pickLockedOnly = true; }

private:
    const LayoutEditorCanvas & editor;
    InitialInstance * smallestInstance;
    double smallestInstanceArea;
    const double xPosition;
    const double yPosition;
    bool pickLockedOnly;
};

InitialInstance * LayoutEditorCanvas::GetInitialInstanceAtPosition(double xPosition, double yPosition, bool pickOnlyLockedInstances)
{
    SmallestInstanceUnderCursorPicker picker(*this, xPosition, yPosition);
    if ( pickOnlyLockedInstances ) picker.PickLockedInstancesAndOnlyThem();
    instances.IterateOverInstances(picker);

    return picker.GetSmallestInstanceUnderCursor();
}

std::vector<gd::InitialInstance*> LayoutEditorCanvas::GetSelection()
{
    std::vector<gd::InitialInstance*> selection;
    for ( std::map <InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
        selection.push_back(it->first);

    return selection;
}

double LayoutEditorCanvas::GetRealXPositionOfInitialInstance(InitialInstance & instance) const
{
    return instance.GetX();
}

double LayoutEditorCanvas::GetRealYPositionOfInitialInstance(InitialInstance & instance) const
{
    return instance.GetY();
}

void LayoutEditorCanvas::OnLayersEditor( wxCommandEvent & event )
{
    parentAuiManager->GetPane("EL").Show();
    parentAuiManager->Update();
}

void LayoutEditorCanvas::OnObjectsEditor( wxCommandEvent & event )
{
    parentAuiManager->GetPane("EO").Show();
    parentAuiManager->Update();
}

void LayoutEditorCanvas::OnObjectsPositionList( wxCommandEvent & event )
{
    parentAuiManager->GetPane("InstancesBrowser").Show();
    parentAuiManager->Update();
}

void LayoutEditorCanvas::OnGridBtClick( wxCommandEvent & event )
{
    options.grid = !options.grid;
}

void LayoutEditorCanvas::OnGridSetupBtClick( wxCommandEvent & event )
{
    GridSetupDialog dialog(this, options.gridWidth, options.gridHeight, options.snap, options.gridR, options.gridG, options.gridB);
    dialog.ShowModal();
}

void LayoutEditorCanvas::OnWindowMaskBtClick( wxCommandEvent & event )
{
    options.windowMask = !options.windowMask;
}

void LayoutEditorCanvas::OnUndoMoreBtClick(wxRibbonButtonBarEvent& evt)
{
    evt.PopupMenu(&undoMenu);
}

void LayoutEditorCanvas::OnUndoBtClick( wxCommandEvent & event )
{
    Undo();
}

void LayoutEditorCanvas::Undo(unsigned int times)
{
    for (unsigned int i = 0;i<times;++i)
    {
        if ( history.empty() ) return;

        redoHistory.push_back(boost::shared_ptr<gd::InitialInstancesContainer>(instances.Clone()));
        instances.Create(*history.back());
        history.pop_back();

        latestState = boost::shared_ptr<gd::InitialInstancesContainer>(instances.Clone());
    }
}

void LayoutEditorCanvas::OnClearHistorySelected(wxCommandEvent& event)
{
    if (wxMessageBox("Etes-vous sûr de vouloir supprimer l'historique des modifications ?", "Êtes vous sûr ?",wxYES_NO ) != wxYES)
        return;

    history.clear();
    redoHistory.clear();
}

void LayoutEditorCanvas::Redo( unsigned int times )
{
    for (unsigned int i = 0;i<times;++i)
    {
        if ( redoHistory.empty() ) return;

        history.push_back(boost::shared_ptr<gd::InitialInstancesContainer>(instances.Clone()));
        instances.Create(*redoHistory.back());
        redoHistory.pop_back();

        latestState = boost::shared_ptr<gd::InitialInstancesContainer>(instances.Clone());
    }
}

void LayoutEditorCanvas::OnRedoBtClick( wxCommandEvent & event )
{
    Redo();
}

/**
 * Toggle Game Develop full screen mode.
 */
void LayoutEditorCanvas::OnFullScreenBtClick(wxCommandEvent & event)
{
    if (!mainFrameWrapper.GetMainEditor()->IsFullScreen())
        mainFrameWrapper.GetMainEditor()->ShowFullScreen(true, wxFULLSCREEN_NOBORDER | wxFULLSCREEN_NOCAPTION);
    else
        mainFrameWrapper.GetMainEditor()->ShowFullScreen(false);
}

}
