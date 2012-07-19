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
#include "GDCore/Tools/Locale/LocaleManager.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDL/Object.h"
#include "EditorLayers.h"
#include "DebuggerGUI.h"
#include "EditorObjets.h"
#include "SceneCanvas.h"
#include "RenderDialog.h"
#include "GridSetup.h"
#include "ProfileDlg.h"
#include "InitialPositionBrowserDlg.h"
#include "DndTextSceneEditor.h"

SceneCanvas::SceneCanvas( wxWindow* parent, RuntimeGame & game_, Scene & scene_, InitialInstancesContainer & instances_, SceneCanvasSettings & settings_, MainEditorCommand & mainEditorCommand_, bool allowPreview_) :
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
    mainEditorCommand( mainEditorCommand_ ),
    scrollBar1(NULL),
    scrollBar2(NULL)
{
    reloadingIconImage.LoadFromFile("res/compile128.png");
    reloadingIconSprite.SetTexture(reloadingIconImage);
    reloadingText.SetColor(sf::Color(0,0,0,128));
    reloadingText.SetString(string(_("Compilation en cours...").mb_str()));
    reloadingText.SetCharacterSize(40);

    SetView( editionData.view );
    editionData.view.SetCenter( (gameEdited.GetMainWindowDefaultWidth()/2),(gameEdited.GetMainWindowDefaultHeight()/2));

    SetFramerateLimit( gameEdited.GetMaximumFPS() );
    EnableVerticalSync(gameEdited.IsVerticalSynchronizationEnabledByDefault() );
    Clear( sf::Color( 125, 125, 125, 255 ) );

    Connect(ID_DELOBJMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnDelObjetSelected);
    Connect(ID_PROPMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnPropObjSelected);
    Connect(ID_LAYERUPMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnLayerUpSelected);
    Connect(ID_LAYERDOWNMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnLayerDownSelected);
    Connect(ID_COPYMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnCopySelected);
    Connect(ID_CUTMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnCutSelected);
    Connect(ID_PASTEMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnPasteSelected);
    Connect(ID_PASTESPECIALMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnPasteSpecialSelected);

    CreateMenus();

    latestState.Create(instances);

    SetDropTarget(new DndTextSceneEditor(*this));

    CreateToolsBar(mainEditorCommand.GetRibbonSceneEditorButtonBar(), editing);
}

SceneCanvas::~SceneCanvas()
{
    mainEditorCommand.UnLockShortcuts(this);  //Make sure shortcuts are not locked.
}

void SceneCanvas::ConnectEvents()
{
    mainEditorCommand.GetMainEditor()->Connect(idRibbonEditMode, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnEditionBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonPreviewMode, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnPreviewBtClick, NULL, this);

    mainEditorCommand.GetMainEditor()->Connect(idRibbonObjectsEditor, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnObjectsEditor, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonLayersEditor, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnLayersEditor, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonOrigine, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnOrigineBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonOriginalZoom, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnZoomInitBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonOriginalZoom, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnZoomMoreBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonGrid, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnGridBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonGridSetup, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnGridSetupBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonWindowMask, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnWindowMaskBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonUndo,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&SceneCanvas::OnUndoBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonUndo, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnUndoMoreBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonRedo,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&SceneCanvas::OnRedoBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonObjectsPositionList,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&SceneCanvas::OnObjectsPositionList, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonHelp,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&SceneCanvas::OnHelpBtClick, NULL, this);

    mainEditorCommand.GetMainEditor()->Connect(idRibbonRefresh, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnRefreshBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonPlay, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnPlayBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonPlayWin, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnPlayWindowBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonPause, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnPauseBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonDebugger, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnDebugBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonProfiler, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnProfilerBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonFullScreen, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnFullScreenBtClick, NULL, this);

	mainEditorCommand.GetMainEditor()->Connect(ID_MENUITEM8,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom5Selected, NULL, this);
	mainEditorCommand.GetMainEditor()->Connect(ID_MENUITEM1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom10Selected, NULL, this);
	mainEditorCommand.GetMainEditor()->Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom25Selected, NULL, this);
	mainEditorCommand.GetMainEditor()->Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom50Selected, NULL, this);
	mainEditorCommand.GetMainEditor()->Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom100Selected, NULL, this);
	mainEditorCommand.GetMainEditor()->Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom150Selected, NULL, this);
	mainEditorCommand.GetMainEditor()->Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom200Selected, NULL, this);
	mainEditorCommand.GetMainEditor()->Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::Onzoom500Selected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idUndo10,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnUndo10Selected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idUndo20,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnUndo20Selected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idClearHistory,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnClearHistorySelected, NULL, this);
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
        ribbonBar->AddButton(idRibbonPreviewMode, !hideLabels ? _("Aperçu") : "", wxBitmap("res/view24.png", wxBITMAP_TYPE_ANY));
    }

    wxRibbonPanel *toolsPanel = new wxRibbonPanel(page, wxID_ANY, _("Outils"), wxBitmap("res/tools24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
    wxRibbonButtonBar *toolsBar = new wxRibbonButtonBar(toolsPanel, wxID_ANY);
    CreateToolsBar(toolsBar, true); //Create an initial tool bar

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Aide"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonHelp, !hideLabels ? _("Aide") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
    }

    return toolsBar; //Returned to the mainEditor, and will then be passed to Scene Editors with MainEditorCommand
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
        bar->AddButton(idRibbonObjectsEditor, !hideLabels ? _("Editeur d'objets") : "", bitmapManager->objects24);
        bar->AddButton(idRibbonLayersEditor, !hideLabels ? _("Editeur de calques") : "", bitmapManager->layers24);
        bar->AddHybridButton(idRibbonUndo, !hideLabels ? _("Annuler") : "", bitmapManager->undo24);
        bar->AddButton(idRibbonRedo, !hideLabels ? _("Refaire") : "", bitmapManager->redo24);
        bar->AddButton(idRibbonOrigine, !hideLabels ? _("Revenir à l'origine") : "", bitmapManager->center24);
        bar->AddHybridButton(idRibbonOriginalZoom, !hideLabels ? _("Zoom initial") : "", bitmapManager->zoom24);
        bar->AddButton(idRibbonGrid, !hideLabels ? _("Grille") : "", bitmapManager->grid24);
        bar->AddButton(idRibbonGridSetup, !hideLabels ? _("Editer la grille") : "", bitmapManager->gridedit24);
        bar->AddButton(idRibbonWindowMask, !hideLabels ? _("Masque de la fen. de jeu") : "", bitmapManager->windowMask24);
        bar->AddButton(idRibbonObjectsPositionList, !hideLabels ? _("Liste des objets") : "", bitmapManager->objectsPositionsList24);
    }
    else
    {
        bar->AddButton(idRibbonRefresh, !hideLabels ? _("Rafraichir") : "", bitmapManager->refreshicon24);
        bar->AddButton(idRibbonPlay, !hideLabels ? _("Jouer") : "", bitmapManager->starticon24);
        bar->AddButton(idRibbonPlayWin, !hideLabels ? _("Jouer dans une fenêtre") : "", bitmapManager->startwindow24);
        bar->AddButton(idRibbonPause, !hideLabels ? _("Pause") : "", bitmapManager->pauseicon24);
        bar->AddButton(idRibbonDebugger, !hideLabels ? _("Debugger") : "", bitmapManager->bug24);
        bar->AddButton(idRibbonProfiler, !hideLabels ? _("Performances") : "", bitmapManager->profiler24);
        bar->AddButton(idRibbonFullScreen, !hideLabels ? _("Afficher l'éditeur en plein écran") : "", bitmapManager->fullscreen24);
    }

    bar->Realize();
}

void SceneCanvas::SetOwnedObjectsEditor(boost::shared_ptr<EditorObjets> objectsEditor_)
{
    objectsEditor = objectsEditor_;
}
void SceneCanvas::SetOwnedLayersEditor(boost::shared_ptr<EditorLayers> layersEditor_)
{
    layersEditor = layersEditor_;
    if ( layersEditor && layersEditor->GetAssociatedSceneCanvas() != this)
        layersEditor->SetAssociatedSceneCanvas(this);
}
void SceneCanvas::SetOwnedDebugger(boost::shared_ptr<DebuggerGUI> debugger_)
{
    debugger = debugger_;

    if ( debugger )
        previewData.scene.debugger = debugger.get();
}
void SceneCanvas::SetOwnedExternalWindow(boost::shared_ptr<RenderDialog> externalWindow_)
{
    externalWindow = externalWindow_;
}
void SceneCanvas::SetOwnedInitialPositionBrowser(boost::shared_ptr<InitialPositionBrowserDlg> initialPositionsBrowser_)
{
    initialPositionsBrowser = initialPositionsBrowser_;
}
void SceneCanvas::SetOwnedProfileDialog(boost::shared_ptr<ProfileDlg> profileDialog_)
{
    profileDialog = profileDialog_;
    if ( profileDialog && profileDialog->GetAssociatedSceneCanvas() != this)
        profileDialog->SetAssociatedSceneCanvas(this);

    if ( profileDialog )
        sceneEdited.profiler = profileDialog.get();
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

        UpdateAccordingToZoomFactor();
    }
    else
    {
        //Scene has the size of the game's window size in preview mode.
        Window::SetSize(gameEdited.GetMainWindowDefaultWidth(), gameEdited.GetMainWindowDefaultHeight());
        wxWindowBase::SetClientSize(gameEdited.GetMainWindowDefaultWidth(), gameEdited.GetMainWindowDefaultHeight());

        externalWindow->SetSizeOfRenderingZone(gameEdited.GetMainWindowDefaultWidth(), gameEdited.GetMainWindowDefaultHeight());

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
        if ( name == "" ) name = _("Calque de base");
        contextMenu.FindItem(ID_LAYERUPMENU)->Enable(true);
        contextMenu.FindItem(ID_LAYERUPMENU)->SetItemLabel(string(_("Passer le(s) objet(s) sur le calque \"")) + name +"\"");
    }

    //Peut on descendre les objets sur un calque plus bas ? ( pléonasme )
    int highestLayer = GetObjectsSelectedHighestLayer();

    contextMenu.FindItem(ID_LAYERDOWNMENU)->Enable(false);
    if ( highestLayer-1 >= 0 )
    {
        string name = previewData.scene.GetLayer(highestLayer-1).GetName();
        if ( name == "" ) name = _("Calque de base");

        contextMenu.FindItem(ID_LAYERDOWNMENU)->Enable(true);
        contextMenu.FindItem(ID_LAYERDOWNMENU)->SetItemLabel(string(_("Passer le(s) objet(s) sur le calque \"")) + name +"\"");
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
    int thumbY = editionData.view.GetCenter().y+scrollBar2->GetRange()/2-GetHeight()/2;
    scrollBar2->SetScrollbar(thumbY, GetHeight(), scrollBar2->GetRange(), GetHeight());

    int thumbX = editionData.view.GetCenter().x+scrollBar1->GetRange()/2-GetWidth()/2;
    scrollBar1->SetScrollbar(thumbX, GetWidth(), scrollBar1->GetRange(), GetWidth());

    //On agrandit les scrollbars si besoin est
    if ( thumbY <= 0 || static_cast<int>(thumbY+GetHeight()) >= scrollBar2->GetRange())
    {
        int ajout = GetHeight();
        scrollBar2->SetScrollbar(thumbY+ajout/2, GetHeight(), scrollBar2->GetRange()+ajout, GetHeight());
    }

    if ( thumbX <= 0 || static_cast<int>(thumbX+GetWidth()) >= scrollBar1->GetRange())
    {
        int ajout = GetWidth();
        scrollBar1->SetScrollbar(thumbX+ajout/2, GetWidth(), scrollBar1->GetRange()+ajout, GetWidth());
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
            myEvent.Type = sf::Event::MouseButtonPressed;
        else if ( event.ButtonUp() )
            myEvent.Type = sf::Event::MouseButtonReleased;
        myEvent.MouseButton.X = event.GetX();
        myEvent.MouseButton.Y = event.GetY();

        if ( event.GetButton() == wxMOUSE_BTN_LEFT ) myEvent.MouseButton.Button = sf::Mouse::Left;
        else if ( event.GetButton() == wxMOUSE_BTN_RIGHT ) myEvent.MouseButton.Button = sf::Mouse::Right;
        else if ( event.GetButton() == wxMOUSE_BTN_MIDDLE ) myEvent.MouseButton.Button = sf::Mouse::Middle;
        else if ( event.GetButton() == wxMOUSE_BTN_AUX1 ) myEvent.MouseButton.Button = sf::Mouse::XButton1;
        else if ( event.GetButton() == wxMOUSE_BTN_AUX2 ) myEvent.MouseButton.Button = sf::Mouse::XButton2;

        previewData.scene.GetRenderTargetEvents().push_back(myEvent);
    }
    #endif
}

void SceneCanvas::CreateMenus()
{
    //Generate context menu
    wxMenuItem * layerUpItem = new wxMenuItem((&contextMenu), ID_LAYERUPMENU, _("Passer le(s) objet(s) sur le calque supérieur"), wxEmptyString, wxITEM_NORMAL);
    layerUpItem->SetBitmap(wxImage( "res/up.png" ) );
    wxMenuItem * layerDownItem = new wxMenuItem((&contextMenu), ID_LAYERDOWNMENU, _("Passer le(s) objet(s) sur le calque inférieur"), wxEmptyString, wxITEM_NORMAL);
    layerDownItem->SetBitmap(wxImage( "res/down.png" ) );
    wxMenuItem * deleteItem = new wxMenuItem((&contextMenu), ID_DELOBJMENU, _("Supprimer la sélection\tDEL"), wxEmptyString, wxITEM_NORMAL);
    deleteItem->SetBitmap(wxImage( "res/deleteicon.png" ) );

    contextMenu.Append(ID_PROPMENU, _("Propriétés"));
    contextMenu.AppendSeparator();
    contextMenu.Append(deleteItem);
    contextMenu.AppendSeparator();
    contextMenu.Append(layerUpItem);
    contextMenu.Append(layerDownItem);
    contextMenu.AppendSeparator();
    {
        wxMenuItem * copyItem = new wxMenuItem((&contextMenu), ID_COPYMENU, _("Copier"), wxEmptyString, wxITEM_NORMAL);
        copyItem->SetBitmap(wxImage( "res/copyicon.png" ) );
        contextMenu.Append(copyItem);
        wxMenuItem * cutItem = new wxMenuItem((&contextMenu), ID_CUTMENU, _("Couper"), wxEmptyString, wxITEM_NORMAL);
        cutItem->SetBitmap(wxImage( "res/cuticon.png" ) );
        contextMenu.Append(cutItem);
        wxMenuItem * pasteItem = new wxMenuItem((&contextMenu), ID_PASTEMENU, _("Coller"), wxEmptyString, wxITEM_NORMAL);
        pasteItem->SetBitmap(wxImage( "res/pasteicon.png" ) );
        contextMenu.Append(pasteItem);
        wxMenuItem * pasteSpecialItem = new wxMenuItem((&contextMenu), ID_PASTESPECIALMENU, _("Collage spécial"), wxEmptyString, wxITEM_NORMAL);
        contextMenu.Append(pasteSpecialItem);
    }

    //Generate "no object" context menu
    {
        wxMenuItem * pasteItem = new wxMenuItem((&noObjectContextMenu), ID_PASTEMENU, _("Coller"), wxEmptyString, wxITEM_NORMAL);
        pasteItem->SetBitmap(wxImage( "res/pasteicon.png" ) );
        noObjectContextMenu.Append(pasteItem);
        wxMenuItem * pasteSpecialItem = new wxMenuItem((&noObjectContextMenu), ID_PASTESPECIALMENU, _("Collage spécial"), wxEmptyString, wxITEM_NORMAL);
        noObjectContextMenu.Append(pasteSpecialItem);
    }

    //Generate undo menu
    {
        wxMenuItem * undo10item = new wxMenuItem(&undoMenu, idUndo10, _("Annuler les 10 précédentes actions"), wxEmptyString, wxITEM_NORMAL);
        undoMenu.Append(undo10item);
        wxMenuItem * undo20item = new wxMenuItem(&undoMenu, idUndo20, _("Annuler les 20 précédentes actions"), wxEmptyString, wxITEM_NORMAL);
        undoMenu.Append(undo20item);
        undoMenu.AppendSeparator();
        wxMenuItem * clearHistoryItem = new wxMenuItem(&undoMenu, idClearHistory, _("Supprimer l'historique des changements"), wxEmptyString, wxITEM_NORMAL);
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
    UpdateAccordingToZoomFactor();
}

void SceneCanvas::OnOrigineBtClick(wxCommandEvent & event )
{
    editionData.view.SetCenter( (gameEdited.GetMainWindowDefaultWidth()/2),(gameEdited.GetMainWindowDefaultHeight()/2));
}

void SceneCanvas::OnDebugBtClick( wxCommandEvent & event )
{
    if ( !m_mgr || !debugger ) return;

    m_mgr->GetPane(debugger.get()).Show();
    m_mgr->Update();
}

void SceneCanvas::OnHelpBtClick( wxCommandEvent & event )
{
    if ( GDpriv::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_FRENCH )
        gd::HelpFileAccess::GetInstance()->DisplaySection(12);
    else
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
    if ( !profileDialog ) return;

    m_mgr->GetPane(profileDialog.get()).Show();
    m_mgr->Update();
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

void SceneCanvas::UpdateAccordingToZoomFactor()
{
    editionData.view.SetSize(GetClientSize().GetWidth()/settings.zoomFactor, GetClientSize().GetHeight()/settings.zoomFactor);
}

void SceneCanvas::Onzoom5Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 0.05f;
    UpdateAccordingToZoomFactor();
}

void SceneCanvas::Onzoom10Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 0.1f;
    UpdateAccordingToZoomFactor();
}

void SceneCanvas::Onzoom25Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 0.25f;
    UpdateAccordingToZoomFactor();
}

void SceneCanvas::Onzoom50Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 0.5f;
    UpdateAccordingToZoomFactor();
}

void SceneCanvas::Onzoom100Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 1;
    UpdateAccordingToZoomFactor();
}

void SceneCanvas::Onzoom150Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 1.5f;
    UpdateAccordingToZoomFactor();
}

void SceneCanvas::Onzoom200Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 2.0f;
    UpdateAccordingToZoomFactor();
}

void SceneCanvas::Onzoom500Selected(wxCommandEvent& event)
{
    settings.zoomFactor = 5.0;
    UpdateAccordingToZoomFactor();
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
    if (!mainEditorCommand.GetMainEditor()->IsFullScreen())
        mainEditorCommand.GetMainEditor()->ShowFullScreen(true, wxFULLSCREEN_NOBORDER | wxFULLSCREEN_NOCAPTION);
    else
        mainEditorCommand.GetMainEditor()->ShowFullScreen(false);
}
