/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * \file This file contains another part of the implementation of SceneCanvas:
 * Mainly less used or less important functions
 */
#include <SFML/Graphics.hpp>
#include <wx/scrolbar.h>
#include <wx/config.h>
#include "GDL/FontManager.h"
#include "GDCore/Tools/Locale/LocaleManager.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDL/Object.h"
#include "EditorLayers.h"
#include "GDL/IDE/Dialogs/DebuggerGUI.h"
#include "EditorObjets.h"
#include "SceneCanvas.h"
#include "GDL/IDE/Dialogs/RenderDialog.h"
#include "GridSetup.h"
#include "GDL/IDE/Dialogs/ProfileDlg.h"
#include "InitialPositionBrowserDlg.h"
#include "DndTextSceneEditor.h"

SceneCanvas::SceneCanvas( wxWindow* parent, RuntimeGame & game_, Scene & scene_, InitialInstancesContainer & instances_, gd::LayoutEditorCanvasOptions & settings_, gd::MainFrameWrapper & mainFrameWrapper_, bool allowPreview_) :
    wxSFMLCanvas( parent, -1, wxDefaultPosition, wxDefaultSize, wxWANTS_CHARS | wxBORDER_SIMPLE ),
    gameEdited(game_),
    sceneEdited(scene_),
    hasJustRightClicked(false),
    ctrlPressed(false),
    isReloading(false),
    editing(true),
    allowPreview(allowPreview_),
    instances(instances_),
    settings(settings_),
    previewData(*this, gameEdited),
    mainFrameWrapper( mainFrameWrapper_ ),
    scrollBar1(NULL),
    scrollBar2(NULL)
{
    reloadingIconImage.loadFromFile("res/compile128.png");
    reloadingIconSprite.setTexture(reloadingIconImage);
    reloadingText.setColor(sf::Color(0,0,0,128));
    reloadingText.setString(string(_("Compiling...").mb_str()));
    reloadingText.setCharacterSize(40);
    reloadingText.setFont(*FontManager::GetInstance()->GetFont(""));

    setView( editionData.view );
    editionData.view.setCenter( (gameEdited.GetMainWindowDefaultWidth()/2),(gameEdited.GetMainWindowDefaultHeight()/2));

    setFramerateLimit( gameEdited.GetMaximumFPS() );
    setVerticalSyncEnabled(gameEdited.IsVerticalSynchronizationEnabledByDefault() );
    clear( sf::Color( 125, 125, 125, 255 ) );

    Connect(ID_DELOBJMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnDelObjetSelected);
    Connect(ID_PROPMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnPropObjSelected);
    Connect(ID_LAYERUPMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnLayerUpSelected);
    Connect(ID_LAYERDOWNMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnLayerDownSelected);
    Connect(ID_COPYMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnCopySelected);
    Connect(ID_CUTMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnCutSelected);
    Connect(ID_PASTEMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnPasteSelected);
    Connect(ID_PASTESPECIALMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnPasteSpecialSelected);
    Connect(ID_CREATEOBJECTMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnCreateObjectSelected);

    CreateMenus();

    latestState.Create(instances);

    SetDropTarget(new DndTextSceneEditor(*this));

    //CreateToolsBar(mainFrameWrapper.GetRibbonSceneEditorButtonBar(), editing); Deactivated so as to let the ribbon of the new layout editor canvas.
}

SceneCanvas::~SceneCanvas()
{
    mainFrameWrapper.UnLockShortcuts(this);  //Make sure shortcuts are not locked.
}

void SceneCanvas::ConnectEvents()
{
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonEditMode, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnEditionBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonPreviewMode, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnPreviewBtClick, NULL, this);

    mainFrameWrapper.GetMainEditor()->Connect(idRibbonObjectsEditor, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnObjectsEditor, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonLayersEditor, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnLayersEditor, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonOrigine, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnOrigineBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonOriginalZoom, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnZoomInitBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonOriginalZoom, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnZoomMoreBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonGrid, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnGridBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonGridSetup, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnGridSetupBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonWindowMask, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnWindowMaskBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonUndo,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&SceneCanvas::OnUndoBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonUndo, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnUndoMoreBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonRedo,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&SceneCanvas::OnRedoBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonObjectsPositionList,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&SceneCanvas::OnObjectsPositionList, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonHelp,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&SceneCanvas::OnHelpBtClick, NULL, this);

    mainFrameWrapper.GetMainEditor()->Connect(idRibbonRefresh, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnRefreshBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonPlay, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnPlayBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonPlayWin, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnPlayWindowBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonPause, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnPauseBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDebugger, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnDebugBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonProfiler, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnProfilerBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonFullScreen, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnFullScreenBtClick, NULL, this);

	mainFrameWrapper.GetMainEditor()->Connect(ID_MENUITEM8,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom5Selected, NULL, this);
	mainFrameWrapper.GetMainEditor()->Connect(ID_MENUITEM1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom10Selected, NULL, this);
	mainFrameWrapper.GetMainEditor()->Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom25Selected, NULL, this);
	mainFrameWrapper.GetMainEditor()->Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom50Selected, NULL, this);
	mainFrameWrapper.GetMainEditor()->Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom100Selected, NULL, this);
	mainFrameWrapper.GetMainEditor()->Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom150Selected, NULL, this);
	mainFrameWrapper.GetMainEditor()->Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom200Selected, NULL, this);
	mainFrameWrapper.GetMainEditor()->Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom500Selected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idUndo10,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnUndo10Selected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idUndo20,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnUndo20Selected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idClearHistory,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnClearHistorySelected, NULL, this);
}

/**
 * Static method for creating the ribbon's page used by Scene canvas
 */
wxRibbonButtonBar* SceneCanvas::CreateRibbonPage(wxRibbonPage * page)
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
    wxRibbonButtonBar *toolsBar = new wxRibbonButtonBar(toolsPanel, wxID_ANY);
    CreateToolsBar(toolsBar, true); //Create an initial tool bar

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Help"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonHelp, !hideLabels ? _("Help") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
    }

    return toolsBar; //Returned to the mainEditor, and will then be passed to Scene Editors with mainFrameWrapper
}

void SceneCanvas::CreateToolsBar(wxRibbonButtonBar * bar, bool editing)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    bool hideLabels = false;
    pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );

    bar->ClearButtons();

    gd::CommonBitmapManager * bitmapManager = gd::CommonBitmapManager::GetInstance();
    if ( editing )
    {
        bar->AddButton(idRibbonObjectsEditor, !hideLabels ? _("Objects' editor") : "", bitmapManager->objects24);
        bar->AddButton(idRibbonLayersEditor, !hideLabels ? _("Layers' editor") : "", bitmapManager->layers24);
        bar->AddHybridButton(idRibbonUndo, !hideLabels ? _("Cancel") : "", bitmapManager->undo24);
        bar->AddButton(idRibbonRedo, !hideLabels ? _("Redo") : "", bitmapManager->redo24);
        bar->AddButton(idRibbonOrigine, !hideLabels ? _("Return to the initial position ( 0;0 )") : "", bitmapManager->center24);
        bar->AddHybridButton(idRibbonOriginalZoom, !hideLabels ? _("Initial zoom") : "", bitmapManager->zoom24);
        bar->AddButton(idRibbonGrid, !hideLabels ? _("Grid") : "", bitmapManager->grid24);
        bar->AddButton(idRibbonGridSetup, !hideLabels ? _("Edit the grid") : "", bitmapManager->gridedit24);
        bar->AddButton(idRibbonWindowMask, !hideLabels ? _("Window mask") : "", bitmapManager->windowMask24);
        bar->AddButton(idRibbonObjectsPositionList, !hideLabels ? _("Objects list") : "", bitmapManager->objectsPositionsList24);
    }
    else
    {
        bar->AddButton(idRibbonRefresh, !hideLabels ? _("Refresh") : "", bitmapManager->refreshicon24);
        bar->AddButton(idRibbonPlay, !hideLabels ? _("Play") : "", bitmapManager->starticon24);
        bar->AddButton(idRibbonPlayWin, !hideLabels ? _("Play in a window") : "", bitmapManager->startwindow24);
        bar->AddButton(idRibbonPause, !hideLabels ? _("Pause") : "", bitmapManager->pauseicon24);
        bar->AddButton(idRibbonDebugger, !hideLabels ? _("Debugger") : "", bitmapManager->bug24);
        bar->AddButton(idRibbonProfiler, !hideLabels ? _("Profiling") : "", bitmapManager->profiler24);
        bar->AddButton(idRibbonFullScreen, !hideLabels ? _("Display editor fullscreen") : "", bitmapManager->fullscreen24);
    }

    bar->Realize();
}

void SceneCanvas::SetObjectsEditor(boost::shared_ptr<EditorObjets> objectsEditor_)
{
    objectsEditor = objectsEditor_;
}
void SceneCanvas::SetLayersEditor(boost::shared_ptr<EditorLayers> layersEditor_)
{
    layersEditor = layersEditor_;
    if ( layersEditor && layersEditor->GetAssociatedSceneCanvas() != this)
        layersEditor->SetAssociatedSceneCanvas(this);
}
void SceneCanvas::SetDebugger(boost::shared_ptr<DebuggerGUI> debugger_)
{
    debugger = debugger_;

    if ( debugger )
        previewData.scene.debugger = debugger.get();
}
void SceneCanvas::SetExternalWindow(boost::shared_ptr<RenderDialog> externalWindow_)
{
    externalWindow = externalWindow_;
}
void SceneCanvas::SetInitialPositionBrowser(boost::shared_ptr<InitialPositionBrowserDlg> initialPositionsBrowser_)
{
    initialPositionsBrowser = initialPositionsBrowser_;
}
void SceneCanvas::SetProfileDialog(boost::shared_ptr<ProfileDlg> profileDialog_)
{
    /*profileDialog = profileDialog_;
    if ( profileDialog && profileDialog->GetAssociatedSceneCanvas() != this)
        profileDialog->SetAssociatedSceneCanvas(this);

    if ( profileDialog )
        sceneEdited.SetProfiler(profileDialog.get());*/
}
void SceneCanvas::SetPropertiesPanel(boost::shared_ptr<LayoutEditorPropertiesPnl> propertiesPanel_)
{
    propertiesPanel = propertiesPanel_;
}

/**
 * Update the size and position of the canvas displaying the scene
 */
void SceneCanvas::UpdateSize()
{
    if (parentPanel == NULL) return;

    if ( editing )
    {
        //Scene takes all the space available in edition mode.

        //This line is unnecessary and create a crash related to X in Linux.
        //Window::SetSize(parentPanel->GetSize().GetWidth()-scrollBar2->GetSize().GetWidth(), parentPanel->GetSize().GetHeight()-scrollBar1->GetSize().GetHeight());
        wxWindowBase::SetPosition(wxPoint(0,0));
        wxWindowBase::SetSize(parentPanel->GetSize().GetWidth()-scrollBar2->GetSize().GetWidth(), parentPanel->GetSize().GetHeight()-scrollBar1->GetSize().GetHeight());

        UpdateViewAccordingToZoomFactor();
    }
    else
    {
        //Scene has the size of the game's window size in preview mode.
        Window::setSize(sf::Vector2u(gameEdited.GetMainWindowDefaultWidth(), gameEdited.GetMainWindowDefaultHeight()));
        wxWindowBase::SetClientSize(gameEdited.GetMainWindowDefaultWidth(), gameEdited.GetMainWindowDefaultHeight());

        if ( externalWindow ) externalWindow->SetSizeOfRenderingZone(gameEdited.GetMainWindowDefaultWidth(), gameEdited.GetMainWindowDefaultHeight());

        //Scene is centered in preview mode
        wxWindowBase::SetPosition(wxPoint((parentPanel->GetSize().GetWidth()-wxWindowBase::GetSize().GetX())/2,
                              (parentPanel->GetSize().GetHeight()-wxWindowBase::GetSize().GetY())/2));
    }
}

void SceneCanvas::UpdateContextMenu()
{
    //Peut on remonter les objets sur un calque plus haut ?
    int lowestLayer = GetObjectsSelectedLowestLayer();

    contextMenu.FindItem(ID_LAYERUPMENU)->Enable(false);
    if ( static_cast<unsigned>(lowestLayer+1) < previewData.scene.GetLayersCount() )
    {
        string name = previewData.scene.GetLayer(lowestLayer+1).GetName();
        if ( name == "" ) name = _("Base layer");
        contextMenu.FindItem(ID_LAYERUPMENU)->Enable(true);
        contextMenu.FindItem(ID_LAYERUPMENU)->SetItemLabel(string(_("Put the object(s) on the layer \"")) + name +"\"");
    }

    //Peut on descendre les objets sur un calque plus bas ? ( pléonasme )
    int highestLayer = GetObjectsSelectedHighestLayer();

    contextMenu.FindItem(ID_LAYERDOWNMENU)->Enable(false);
    if ( highestLayer-1 >= 0 )
    {
        string name = previewData.scene.GetLayer(highestLayer-1).GetName();
        if ( name == "" ) name = _("Base layer");

        contextMenu.FindItem(ID_LAYERDOWNMENU)->Enable(true);
        contextMenu.FindItem(ID_LAYERDOWNMENU)->SetItemLabel(string(_("Put the object(s) on the layer \"")) + name +"\"");
    }
}

void SceneCanvas::OnKeyUp( wxKeyEvent& evt )
{
    if ( evt.GetKeyCode() == WXK_CONTROL )
        ctrlPressed = false;
}

/**
 * Manage key events
 */
void SceneCanvas::OnKey( wxKeyEvent& evt )
{
    if ( evt.GetKeyCode() == WXK_CONTROL )
        ctrlPressed = true;

    //Si on est en mode éditeur
    if ( editing )
    {
        //Suppression
        if ( evt.GetKeyCode() == WXK_DELETE )
        {
            wxCommandEvent unused;
            OnDelObjetSelected(unused);
        }
        else if ( evt.GetKeyCode() == WXK_DOWN )
        {
            for (unsigned int i = 0;i<editionData.objectsSelected.size();++i)
            {
                ObjSPtr object = editionData.objectsSelected.at(i);
                InitialPosition & initialPosition = GetInitialPositionFromObject(object);
                initialPosition.SetY(initialPosition.GetY()+1);
                object->SetY(object->GetY()+1);
            }
        }
        else if ( evt.GetKeyCode() == WXK_UP )
        {
            for (unsigned int i = 0;i<editionData.objectsSelected.size();++i)
            {
                ObjSPtr object = editionData.objectsSelected.at(i);
                InitialPosition & initialPosition = GetInitialPositionFromObject(object);
                initialPosition.SetY(initialPosition.GetY()-1);
                object->SetY(object->GetY()-1);
            }
        }
        else if ( evt.GetKeyCode() == WXK_RIGHT )
        {
            for (unsigned int i = 0;i<editionData.objectsSelected.size();++i)
            {
                ObjSPtr object = editionData.objectsSelected.at(i);
                InitialPosition & initialPosition = GetInitialPositionFromObject(object);
                initialPosition.SetX(initialPosition.GetX()+1);
                object->SetX(object->GetX()+1);
            }
        }
        else if ( evt.GetKeyCode() == WXK_LEFT )
        {
            for (unsigned int i = 0;i<editionData.objectsSelected.size();++i)
            {
                ObjSPtr object = editionData.objectsSelected.at(i);
                InitialPosition & initialPosition = GetInitialPositionFromObject(object);
                initialPosition.SetX(initialPosition.GetX()-1);
                object->SetX(object->GetX()-1);
            }
        }
    }
    evt.StopPropagation();
}

/**
 * Update scrollbars : Thumb position and update size if needed
 */
void SceneCanvas::UpdateScrollbars()
{
    if ( scrollBar1 == NULL || scrollBar2 == NULL)
        return;

    //On calcule la position du thumb
    int thumbY = editionData.view.getCenter().y+scrollBar2->GetRange()/2-getSize().y/2;
    scrollBar2->SetScrollbar(thumbY, getSize().y, scrollBar2->GetRange(), getSize().y);

    int thumbX = editionData.view.getCenter().x+scrollBar1->GetRange()/2-getSize().x/2;
    scrollBar1->SetScrollbar(thumbX, getSize().x, scrollBar1->GetRange(), getSize().x);

    //On agrandit les scrollbars si besoin est
    if ( thumbY <= 0 || static_cast<int>(thumbY+getSize().y) >= scrollBar2->GetRange())
    {
        int ajout = getSize().y;
        scrollBar2->SetScrollbar(thumbY+ajout/2, getSize().y, scrollBar2->GetRange()+ajout, getSize().y);
    }

    if ( thumbX <= 0 || static_cast<int>(thumbX+getSize().x) >= scrollBar1->GetRange())
    {
        int ajout = getSize().x;
        scrollBar1->SetScrollbar(thumbX+ajout/2, getSize().x, scrollBar1->GetRange()+ajout, getSize().x);
    }
}


void SceneCanvas::OnAnyMouseEvent( wxMouseEvent & event )
{
    //Fix for Linux
    #if defined(GD_IDE_ONLY) && defined(LINUX)
    if ( event.GetButton() != wxMOUSE_BTN_NONE )
    {
        sf::Event myEvent;
        if ( event.ButtonDown() )
            myEvent.type = sf::Event::MouseButtonPressed;
        else if ( event.ButtonUp() )
            myEvent.type = sf::Event::MouseButtonReleased;
        myEvent.mouseButton.x = event.GetX();
        myEvent.mouseButton.y = event.GetY();

        if ( event.GetButton() == wxMOUSE_BTN_LEFT ) myEvent.mouseButton.button = sf::Mouse::Left;
        else if ( event.GetButton() == wxMOUSE_BTN_RIGHT ) myEvent.mouseButton.button = sf::Mouse::Right;
        else if ( event.GetButton() == wxMOUSE_BTN_MIDDLE ) myEvent.mouseButton.button = sf::Mouse::Middle;
        else if ( event.GetButton() == wxMOUSE_BTN_AUX1 ) myEvent.mouseButton.button = sf::Mouse::XButton1;
        else if ( event.GetButton() == wxMOUSE_BTN_AUX2 ) myEvent.mouseButton.button = sf::Mouse::XButton2;

        previewData.scene.GetRenderTargetEvents().push_back(myEvent);
    }
    #endif
}

void SceneCanvas::CreateMenus()
{
    //Generate context menu
    wxMenuItem * layerUpItem = new wxMenuItem((&contextMenu), ID_LAYERUPMENU, _("Put the object(s) on the higher layer"), wxEmptyString, wxITEM_NORMAL);
    layerUpItem->SetBitmap(wxImage( "res/up.png" ) );
    wxMenuItem * layerDownItem = new wxMenuItem((&contextMenu), ID_LAYERDOWNMENU, _("Put the object(s) on the lower layer"), wxEmptyString, wxITEM_NORMAL);
    layerDownItem->SetBitmap(wxImage( "res/down.png" ) );
    wxMenuItem * deleteItem = new wxMenuItem((&contextMenu), ID_DELOBJMENU, _("Delete the selection\tDEL"), wxEmptyString, wxITEM_NORMAL);
    deleteItem->SetBitmap(wxImage( "res/deleteicon.png" ) );

    contextMenu.Append(ID_PROPMENU, _("Properties"));
    contextMenu.AppendSeparator();
    contextMenu.Append(ID_CREATEOBJECTMENU, _("Insert a new object"));
    contextMenu.AppendSeparator();
    contextMenu.Append(deleteItem);
    contextMenu.AppendSeparator();
    contextMenu.Append(layerUpItem);
    contextMenu.Append(layerDownItem);
    contextMenu.AppendSeparator();
    {
        wxMenuItem * copyItem = new wxMenuItem((&contextMenu), ID_COPYMENU, _("Copy"), wxEmptyString, wxITEM_NORMAL);
        copyItem->SetBitmap(wxImage( "res/copyicon.png" ) );
        contextMenu.Append(copyItem);
        wxMenuItem * cutItem = new wxMenuItem((&contextMenu), ID_CUTMENU, _("Cut"), wxEmptyString, wxITEM_NORMAL);
        cutItem->SetBitmap(wxImage( "res/cuticon.png" ) );
        contextMenu.Append(cutItem);
        wxMenuItem * pasteItem = new wxMenuItem((&contextMenu), ID_PASTEMENU, _("Paste"), wxEmptyString, wxITEM_NORMAL);
        pasteItem->SetBitmap(wxImage( "res/pasteicon.png" ) );
        contextMenu.Append(pasteItem);
        wxMenuItem * pasteSpecialItem = new wxMenuItem((&contextMenu), ID_PASTESPECIALMENU, _("Special paste"), wxEmptyString, wxITEM_NORMAL);
        contextMenu.Append(pasteSpecialItem);
    }

    //Generate "no object" context menu
    {
        noObjectContextMenu.Append(ID_CREATEOBJECTMENU, _("Insert a new object"));
        noObjectContextMenu.AppendSeparator();
        wxMenuItem * pasteItem = new wxMenuItem((&noObjectContextMenu), ID_PASTEMENU, _("Paste"), wxEmptyString, wxITEM_NORMAL);
        pasteItem->SetBitmap(wxImage( "res/pasteicon.png" ) );
        noObjectContextMenu.Append(pasteItem);
        wxMenuItem * pasteSpecialItem = new wxMenuItem((&noObjectContextMenu), ID_PASTESPECIALMENU, _("Special paste"), wxEmptyString, wxITEM_NORMAL);
        noObjectContextMenu.Append(pasteSpecialItem);
    }

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

    //Generate zoom menu
	wxMenuItem * zoom5 = new wxMenuItem((&zoomMenu), ID_MENUITEM8, _("5%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom5);
	wxMenuItem * zoom10 = new wxMenuItem((&zoomMenu), ID_MENUITEM1, _("10%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom10);
	wxMenuItem * zoom25 = new wxMenuItem((&zoomMenu), ID_MENUITEM2, _("25%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom25);
	wxMenuItem * zoom50 = new wxMenuItem((&zoomMenu), ID_MENUITEM3, _("50%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom50);
	wxMenuItem * zoom100 = new wxMenuItem((&zoomMenu), ID_MENUITEM4, _("100%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom100);
	wxMenuItem * zoom150 = new wxMenuItem((&zoomMenu), ID_MENUITEM5, _("150%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom150);
	wxMenuItem * zoom200 = new wxMenuItem((&zoomMenu), ID_MENUITEM6, _("200%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom200);
	wxMenuItem * zoom500 = new wxMenuItem((&zoomMenu), ID_MENUITEM7, _("500%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom500);
}

void SceneCanvas::OnZoomInitBtClick( wxCommandEvent & event )
{
    settings.zoomFactor = 1;
    UpdateViewAccordingToZoomFactor();
}

void SceneCanvas::OnOrigineBtClick(wxCommandEvent & event )
{
    editionData.view.setCenter( (gameEdited.GetMainWindowDefaultWidth()/2),(gameEdited.GetMainWindowDefaultHeight()/2));
}

void SceneCanvas::OnDebugBtClick( wxCommandEvent & event )
{
    if ( !m_mgr || !debugger ) return;

    m_mgr->GetPane(debugger.get()).Show();
    m_mgr->Update();
}

void SceneCanvas::OnHelpBtClick( wxCommandEvent & event )
{
    gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/edit_scene"));
}

void SceneCanvas::OnLayersEditor( wxCommandEvent & event )
{
    m_mgr->GetPane(layersEditor.get()).Show();
    m_mgr->Update();
}

void SceneCanvas::OnObjectsEditor( wxCommandEvent & event )
{
    m_mgr->GetPane(objectsEditor.get()).Show();
    m_mgr->Update();
}

void SceneCanvas::OnObjectsPositionList( wxCommandEvent & event )
{
    m_mgr->GetPane(initialPositionsBrowser.get()).Show();
    m_mgr->Update();
}

void SceneCanvas::OnProfilerBtClick( wxCommandEvent & event )
{
    /*if ( !profileDialog ) return;

    m_mgr->GetPane(profileDialog.get()).Show();
    m_mgr->Update();*/
}

/**
 * De/activate grid.
 */
void SceneCanvas::OnGridBtClick( wxCommandEvent & event )
{
    settings.grid = !settings.grid;
}

/**
 * Setup the grid.
 */
void SceneCanvas::OnGridSetupBtClick( wxCommandEvent & event )
{
    GridSetup dialog(this, settings.gridWidth, settings.gridHeight, settings.snap, settings.gridR, settings.gridG, settings.gridB);
    dialog.ShowModal();
}


void SceneCanvas::OnWindowMaskBtClick( wxCommandEvent & event )
{
    settings.windowMask = !settings.windowMask;
}

void SceneCanvas::OnUndo10Selected(wxCommandEvent& event)
{
    for (unsigned int i = 0;i<10;++i) Undo();

    Reload();
}

void SceneCanvas::OnUndo20Selected(wxCommandEvent& event)
{
    for (unsigned int i = 0;i<20;++i) Undo();

    Reload();
}

void SceneCanvas::OnUndoMoreBtClick(wxRibbonButtonBarEvent& evt)
{
    evt.PopupMenu(&undoMenu);
}

void SceneCanvas::OnZoomMoreBtClick(wxRibbonButtonBarEvent& evt)
{
    evt.PopupMenu(&zoomMenu);
}

void SceneCanvas::UpdateViewAccordingToZoomFactor()
{
    editionData.view.setSize(GetClientSize().GetWidth()/settings.zoomFactor, GetClientSize().GetHeight()/settings.zoomFactor);
}

void SceneCanvas::Onzoom5Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 0.05f;
    UpdateViewAccordingToZoomFactor();
}

void SceneCanvas::Onzoom10Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 0.1f;
    UpdateViewAccordingToZoomFactor();
}

void SceneCanvas::Onzoom25Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 0.25f;
    UpdateViewAccordingToZoomFactor();
}

void SceneCanvas::Onzoom50Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 0.5f;
    UpdateViewAccordingToZoomFactor();
}

void SceneCanvas::Onzoom100Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 1;
    UpdateViewAccordingToZoomFactor();
}

void SceneCanvas::Onzoom150Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 1.5f;

    UpdateViewAccordingToZoomFactor();
}

void SceneCanvas::Onzoom200Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 2.0f;
    UpdateViewAccordingToZoomFactor();
}

void SceneCanvas::Onzoom500Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 5.0;
    UpdateViewAccordingToZoomFactor();
}

int SceneCanvas::GetHighestZOrderOnLayer(const std::string & layer)
{
    if ( instances.GetInstancesCount() == 0) return 0;

    int max = instances.GetInstance(0).GetZOrder();
    for (unsigned int i = 0;i<instances.GetInstancesCount();++i)
    {
        if (instances.GetInstance(0).GetZOrder() > max && instances.GetInstance(0).GetLayer() == layer)
            max = instances.GetInstance(0).GetZOrder();
    }

    return max;
}

/**
 * Toggle Game Develop full screen mode.
 */
void SceneCanvas::OnFullScreenBtClick(wxCommandEvent & event)
{
    if (!mainFrameWrapper.GetMainEditor()->IsFullScreen())
        mainFrameWrapper.GetMainEditor()->ShowFullScreen(true, wxFULLSCREEN_NOBORDER | wxFULLSCREEN_NOCAPTION);
    else
        mainFrameWrapper.GetMainEditor()->ShowFullScreen(false);
}

