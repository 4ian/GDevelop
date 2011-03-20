/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "SceneCanvas.h"
#include <string>
#include <iostream>
#include <vector>
#include <cmath>
#include <sstream>
#include <wx/config.h>
#include <wx/cursor.h>
#include <wx/log.h>
#include <wx/scrolbar.h>
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include "GDL/RuntimeScene.h"
#include "GDL/Chercher.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ImageManager.h"
#include "GDL/RuntimeGame.h"
#include "GDL/Object.h"
#include "GDL/Collisions.h"
#include "GDL/Event.h"
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/HelpFileAccess.h"
#include "GDL/ChooseLayer.h"
#include "GDL/ChooseObject.h"
#include "GDL/DynamicExtensionsManager.h"
#include "GDL/SourceFileBuilder.h"
#include "GDL/CompilerMessagesParser.h"
#include "BuildMessagesPnl.h"
#include "BuildProgressPnl.h"
#include "BuildToolsPnl.h"
#include "EditOptionsPosition.h"
#include "Clipboard.h"
#include "DndTextSceneEditor.h"
#include "InitialPositionBrowserDlg.h"
#include "RenderDialog.h"
#include "EditorObjets.h"
#include "EditorLayers.h"
#include "DebuggerGUI.h"
#include "GridSetup.h"
#include "ProfileDlg.h"

const long SceneCanvas::ID_ADDOBJMENU = wxNewId();
const long SceneCanvas::ID_DELOBJMENU = wxNewId();
const long SceneCanvas::ID_PROPMENU = wxNewId();
const long SceneCanvas::ID_LAYERUPMENU = wxNewId();
const long SceneCanvas::ID_LAYERDOWNMENU = wxNewId();
const long SceneCanvas::ID_COPYMENU = wxNewId();
const long SceneCanvas::ID_CUTMENU = wxNewId();
const long SceneCanvas::ID_PASTEMENU = wxNewId();
const long SceneCanvas::idRibbonEditMode = wxNewId();
const long SceneCanvas::idRibbonPreviewMode = wxNewId();

const long SceneCanvas::idRibbonObjectsEditor = wxNewId();
const long SceneCanvas::idRibbonLayersEditor = wxNewId();
const long SceneCanvas::idRibbonChooseObject = wxNewId();
const long SceneCanvas::idRibbonOrigine = wxNewId();
const long SceneCanvas::idRibbonOriginalZoom = wxNewId();
const long SceneCanvas::idRibbonGrid = wxNewId();
const long SceneCanvas::idRibbonWindowMask = wxNewId();
const long SceneCanvas::idRibbonGridSetup = wxNewId();
const long SceneCanvas::idRibbonUndo = wxNewId();
const long SceneCanvas::idRibbonRedo = wxNewId();
const long SceneCanvas::idRibbonObjectsPositionList = wxNewId();
const long SceneCanvas::idRibbonHelp = wxNewId();

const long SceneCanvas::idRibbonRefresh = wxNewId();
const long SceneCanvas::idRibbonPlay = wxNewId();
const long SceneCanvas::idRibbonPlayWin = wxNewId();
const long SceneCanvas::idRibbonPause = wxNewId();
const long SceneCanvas::idRibbonResetGlobalVars = wxNewId();
const long SceneCanvas::idRibbonDebugger = wxNewId();
const long SceneCanvas::idRibbonProfiler = wxNewId();
const long SceneCanvas::idRibbonFullScreen = wxNewId();

const long SceneCanvas::ID_MENUITEM8 = wxNewId();
const long SceneCanvas::ID_MENUITEM1 = wxNewId();
const long SceneCanvas::ID_MENUITEM2 = wxNewId();
const long SceneCanvas::ID_MENUITEM3 = wxNewId();
const long SceneCanvas::ID_MENUITEM4 = wxNewId();
const long SceneCanvas::ID_MENUITEM5 = wxNewId();
const long SceneCanvas::ID_MENUITEM6 = wxNewId();
const long SceneCanvas::ID_MENUITEM7 = wxNewId();


sf::Image SceneCanvas::reloadingIconImage;
sf::Sprite SceneCanvas::reloadingIconSprite;
sf::Text SceneCanvas::reloadingText;

SceneCanvas::SceneCanvas( wxWindow* Parent, RuntimeGame & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_, wxWindowID Id, const wxPoint& Position, const wxSize& Size, long Style ) :
        wxSFMLCanvas( Parent, Id, Position, Size, Style ),
        gameEdited(game_),
        sceneEdited(scene_),
        game(gameEdited),
        edittimeRenderer(this, &game, sceneEdited),
        hasJustRightClicked(false),
        isReloading(false),
        mainEditorCommand( mainEditorCommand_ ),
        scrollBar1(NULL),
        scrollBar2(NULL)
{
    MemTracer.AddObj( "Editeur de scène", ( long )this );
    reloadingIconImage.LoadFromFile("res/compile128.png");
    reloadingIconSprite.SetImage(reloadingIconImage);
    reloadingText.SetColor(sf::Color(0,0,0));
    reloadingText.SetString(string(_("Compilation en cours des sources C++").mb_str()));
    reloadingText.SetCharacterSize(40);

    SetView( edittimeRenderer.view );
    SetFramerateLimit( gameEdited.maxFPS );
    UseVerticalSync( gameEdited.verticalSync );
    Clear( sf::Color( 125, 125, 125, 255 ) );

    Connect(ID_ADDOBJMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnAddObjetSelected);
    Connect(ID_DELOBJMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnDelObjetSelected);
    Connect(ID_PROPMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnPropObjSelected);
    Connect(ID_LAYERUPMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnLayerUpSelected);
    Connect(ID_LAYERDOWNMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnLayerDownSelected);
    Connect(ID_COPYMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnCopySelected);
    Connect(ID_CUTMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnCutSelected);
    Connect(ID_PASTEMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnPasteSelected);

    //Generate context menu
    wxMenuItem * layerUpItem = new wxMenuItem((&contextMenu), ID_LAYERUPMENU, _("Passer le(s) objet(s) sur le calque supérieur"), wxEmptyString, wxITEM_NORMAL);
    layerUpItem->SetBitmap(wxImage( "res/up.png" ) );
    wxMenuItem * layerDownItem = new wxMenuItem((&contextMenu), ID_LAYERDOWNMENU, _("Passer le(s) objet(s) sur le calque inférieur"), wxEmptyString, wxITEM_NORMAL);
    layerDownItem->SetBitmap(wxImage( "res/down.png" ) );
    wxMenuItem * deleteItem = new wxMenuItem((&contextMenu), ID_DELOBJMENU, _("Supprimer la sélection\tDEL"), wxEmptyString, wxITEM_NORMAL);
    deleteItem->SetBitmap(wxImage( "res/deleteicon.png" ) );
    wxMenuItem * addItem = new wxMenuItem((&contextMenu), ID_ADDOBJMENU, _("Ajouter un objet\tINSER"), wxEmptyString, wxITEM_NORMAL);
    addItem->SetBitmap(wxImage( "res/addobjet.png" ) );

    contextMenu.Append(ID_PROPMENU, _("Propriétés"));
    contextMenu.AppendSeparator();
    contextMenu.Append(addItem);
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
    }

    //Generate "no object" context menu
    {
        wxMenuItem * addItem = new wxMenuItem((&noObjectContextMenu), ID_ADDOBJMENU, _("Ajouter un objet\tINSER"), wxEmptyString, wxITEM_NORMAL);
        addItem->SetBitmap(wxImage( "res/addobjet.png" ) );
        noObjectContextMenu.Append(addItem);
        noObjectContextMenu.AppendSeparator();
        wxMenuItem * pasteItem = new wxMenuItem((&noObjectContextMenu), ID_PASTEMENU, _("Coller"), wxEmptyString, wxITEM_NORMAL);
        pasteItem->SetBitmap(wxImage( "res/pasteicon.png" ) );
        noObjectContextMenu.Append(pasteItem);
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

    SetDropTarget(new DndTextSceneEditor(*this));

    CreateToolsBar(mainEditorCommand.GetRibbonSceneEditorButtonBar(), edittimeRenderer.editing);
}

SceneCanvas::~SceneCanvas()
{
    MemTracer.DelObj((long)this); //Old memory tracking tool
    mainEditorCommand.UnLockShortcuts(this);  //Make sure shortcuts are not locked.
}

void SceneCanvas::ConnectEvents()
{
    mainEditorCommand.GetMainEditor()->Connect(idRibbonEditMode, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnEditionBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonPreviewMode, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnPreviewBtClick, NULL, this);

    mainEditorCommand.GetMainEditor()->Connect(idRibbonObjectsEditor, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnObjectsEditor, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonLayersEditor, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnLayersEditor, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonChooseObject, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnChoisirObjetBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonOrigine, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnOrigineBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonOriginalZoom, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnZoomInitBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonOriginalZoom, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnZoomMoreBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonGrid, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnGridBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonGridSetup, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnGridSetupBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonWindowMask, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&SceneCanvas::OnWindowMaskBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonUndo,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&SceneCanvas::OnUndoBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonRedo,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&SceneCanvas::OnRedoBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonObjectsPositionList,wxEVT_COMMAND_RIBBONBUTTON_CLICKED,(wxObjectEventFunction)&SceneCanvas::OnObjectsPositionList, NULL, this);


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

void SceneCanvas::OnZoomMoreBtClick(wxRibbonButtonBarEvent& evt)
{
    evt.PopupMenu(&zoomMenu);
}

void SceneCanvas::CreateToolsBar(wxRibbonButtonBar * bar, bool editing)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    bool hideLabels = false;
    pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );

    bar->ClearButtons();

    if ( editing )
    {
        bar->AddButton(idRibbonObjectsEditor, !hideLabels ? _("Editeur d'objets") : "", wxBitmap("res/objeticon24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonLayersEditor, !hideLabels ? _("Editeur de calques") : "", wxBitmap("res/layers24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonChooseObject, !hideLabels ? _("Choisir un objet") : "", wxBitmap("res/addobjet24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonUndo, !hideLabels ? _("Annuler") : "", wxBitmap("res/undo24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonRedo, !hideLabels ? _("Refaire") : "", wxBitmap("res/redo24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonOrigine, !hideLabels ? _("Revenir à l'origine") : "", wxBitmap("res/center24.png", wxBITMAP_TYPE_ANY));
        bar->AddHybridButton(idRibbonOriginalZoom, !hideLabels ? _("Zoom initial") : "", wxBitmap("res/zoom24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonGrid, !hideLabels ? _("Grille") : "", wxBitmap("res/grid24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonGridSetup, !hideLabels ? _("Editer la grille") : "", wxBitmap("res/gridedit24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonWindowMask, !hideLabels ? _("Masque de la fenêtre de jeu") : "", wxBitmap("res/windowMask24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonObjectsPositionList, !hideLabels ? _("Liste des objets de la scène") : "", wxBitmap("res/ObjectsPositionsList24.png", wxBITMAP_TYPE_ANY));
    }
    else
    {
        bar->AddButton(idRibbonRefresh, !hideLabels ? _("Rafraichir") : "", wxBitmap("res/refreshicon24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonPlay, !hideLabels ? _("Jouer") : "", wxBitmap("res/starticon24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonPlayWin, !hideLabels ? _("Jouer dans une fenêtre") : "", wxBitmap("res/startwindow24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonPause, !hideLabels ? _("Pause") : "", wxBitmap("res/pauseicon24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonDebugger, !hideLabels ? _("Debugger") : "", wxBitmap("res/bug24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonProfiler, !hideLabels ? _("Performances") : "", wxBitmap("res/profiler24.png", wxBITMAP_TYPE_ANY));
        bar->AddButton(idRibbonFullScreen, !hideLabels ? _("Afficher l'éditeur en plein écran") : "", wxBitmap("res/fullscreen24.png", wxBITMAP_TYPE_ANY));
    }

    bar->Realize();
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
        edittimeRenderer.runtimeScene.debugger = debugger.get();
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
        edittimeRenderer.runtimeScene.profiler = profileDialog.get();
}

/**
 * Update the size and position of the canvas displaying the scene
 */
void SceneCanvas::UpdateSize()
{
    if ( edittimeRenderer.editing )
    {
        //Scene takes all the space available in edition mode.
        Window::SetSize(parentPanel->GetSize().GetWidth()-scrollBar2->GetSize().GetWidth(), parentPanel->GetSize().GetHeight()-scrollBar1->GetSize().GetHeight());
        wxWindowBase::SetSize(0,0, parentPanel->GetSize().GetWidth()-scrollBar2->GetSize().GetWidth(), parentPanel->GetSize().GetHeight()-scrollBar1->GetSize().GetHeight());
        edittimeRenderer.view.SetSize(parentPanel->GetSize().GetWidth()-scrollBar2->GetSize().GetWidth(), parentPanel->GetSize().GetHeight()-scrollBar1->GetSize().GetHeight());
    }
    else
    {
        //Scene has the size of the game's window size in preview mode.
        Window::SetSize(game.windowWidth, game.windowHeight);
        wxWindowBase::SetSize(game.windowWidth, game.windowHeight);

        externalWindow->SetSizeOfRenderingZone(game.windowWidth, game.windowHeight);

        //Scene is centered in preview mode
        wxWindowBase::SetSize((parentPanel->GetSize().GetWidth()-wxWindowBase::GetSize().GetX())/2,
                              (parentPanel->GetSize().GetHeight()-wxWindowBase::GetSize().GetY())/2,
                              game.windowWidth, game.windowHeight);
    }
}


/**
 * Go in preview mode
 */
void SceneCanvas::OnPreviewBtClick( wxCommandEvent & event )
{
    if ( !edittimeRenderer.editing ) return;

    mainEditorCommand.LockShortcuts(this);

    edittimeRenderer.editing = false;
    edittimeRenderer.runtimeScene.running = false;

    scrollBar1->Show(false);
    scrollBar2->Show(false);
    UpdateSize();

    Reload();

    if ( debugger ) debugger->Play();
    CreateToolsBar(mainEditorCommand.GetRibbonSceneEditorButtonBar(), false);
    mainEditorCommand.GetRibbonSceneEditorButtonBar()->Refresh();
}

/**
 * Go in edition mode
 */
void SceneCanvas::OnEditionBtClick( wxCommandEvent & event )
{
    if ( edittimeRenderer.editing ) return;

    mainEditorCommand.UnLockShortcuts(this);

    edittimeRenderer.editing = true;
    edittimeRenderer.runtimeScene.running = false;

    scrollBar1->Show(true);
    scrollBar2->Show(true);
    externalWindow->Show(false);
    edittimeRenderer.runtimeScene.ChangeRenderWindow(this);
    UpdateSize();
    UpdateScrollbars();

    if ( profileDialog ) profileDialog->ParseProfileEvents();

    Reload();

    if ( debugger ) debugger->Pause();
    CreateToolsBar(mainEditorCommand.GetRibbonSceneEditorButtonBar(), true);
    mainEditorCommand.GetRibbonSceneEditorButtonBar()->Refresh();
}


void SceneCanvas::OnHelpBtClick( wxCommandEvent & event )
{
    HelpFileAccess::GetInstance()->DisplaySection(12);
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

void SceneCanvas::OnRefreshBtClick( wxCommandEvent & event )
{
    edittimeRenderer.editing = false;
    edittimeRenderer.runtimeScene.running = false;

    Reload();
}

void SceneCanvas::OnZoomInitBtClick( wxCommandEvent & event )
{
    edittimeRenderer.view.SetSize(GetWidth(), GetHeight());
}

////////////////////////////////////////////////////////////
/// Retour aux coordonnées 0;0 de la scène
////////////////////////////////////////////////////////////
void SceneCanvas::OnOrigineBtClick(wxCommandEvent & event )
{
    edittimeRenderer.view.SetCenter( (game.windowWidth/2),(game.windowHeight/2));
}


////////////////////////////////////////////////////////////
/// Choisir un objet à ajouter
////////////////////////////////////////////////////////////
void SceneCanvas::OnChoisirObjetBtClick( wxCommandEvent & event )
{
    ChooseObject Dialog( this, game, edittimeRenderer.runtimeScene, false );
    if ( Dialog.ShowModal() == 1 )
    {
        edittimeRenderer.objectToAdd = Dialog.objectChosen;
    }
}

////////////////////////////////////////////////////////////
/// Activer/Desactiver la grille
////////////////////////////////////////////////////////////
void SceneCanvas::OnGridBtClick( wxCommandEvent & event )
{
    sceneEdited.grid = !sceneEdited.grid;
}

void SceneCanvas::OnWindowMaskBtClick( wxCommandEvent & event )
{
    sceneEdited.windowMask = !sceneEdited.windowMask;
}

void SceneCanvas::OnUndoBtClick( wxCommandEvent & event )
{
    if ( history.size() < 2 )
        return;

    redoHistory.push_back(sceneEdited.initialObjectsPositions); //On pourra revenir à l'état actuel avec "Refaire"
    sceneEdited.initialObjectsPositions = history.at( history.size() - 2 ); //-2 car le dernier élément est la liste d'évènement actuelle
    history.pop_back();

    Reload();
}

void SceneCanvas::OnRedoBtClick( wxCommandEvent & event )
{
    if ( redoHistory.empty() )
        return;

    history.push_back(redoHistory.back()); //Le dernier élément est la liste d'évènement actuellement éditée
    sceneEdited.initialObjectsPositions = redoHistory.back();
    redoHistory.pop_back();

    Reload();
}

////////////////////////////////////////////////////////////
/// Activer/Desactiver la grille
////////////////////////////////////////////////////////////
void SceneCanvas::OnGridSetupBtClick( wxCommandEvent & event )
{
    GridSetup dialog(this, sceneEdited.gridWidth, sceneEdited.gridHeight, sceneEdited.snap, sceneEdited.gridR, sceneEdited.gridG, sceneEdited.gridB);
    dialog.ShowModal();
}

/**
 * Test scene in editor
 */
void SceneCanvas::OnPlayBtClick( wxCommandEvent & event )
{
    edittimeRenderer.runtimeScene.running = true;
    edittimeRenderer.editing = false;

    externalWindow->Show(false);
    edittimeRenderer.runtimeScene.ChangeRenderWindow(this);


    if ( debugger ) debugger->Play();
}

/**
 * Test scene in an external window
 */
void SceneCanvas::OnPlayWindowBtClick( wxCommandEvent & event )
{
    edittimeRenderer.runtimeScene.running = true;
    edittimeRenderer.editing = false;

    externalWindow->Show(true);
    externalWindow->renderCanvas->SetFramerateLimit( game.maxFPS );
    externalWindow->SetSize(GetWidth(), GetHeight());
    edittimeRenderer.runtimeScene.ChangeRenderWindow(externalWindow->renderCanvas);

    edittimeRenderer.runtimeScene.RenderAndStep(1);  //FIXME : Hack to make sure OpenGL Rendering is correct

    externalWindow->SetSize(GetWidth(), GetHeight());
    edittimeRenderer.runtimeScene.ChangeRenderWindow(externalWindow->renderCanvas);

    if ( debugger ) debugger->Play();
}

////////////////////////////////////////////////////////////
/// Mettre la scène en pause
////////////////////////////////////////////////////////////
void SceneCanvas::OnPauseBtClick( wxCommandEvent & event )
{
    edittimeRenderer.runtimeScene.running = false;
    edittimeRenderer.editing = false;

    if ( debugger ) debugger->Pause();
}

////////////////////////////////////////////////////////////
/// Afficher le debugger de la scène
////////////////////////////////////////////////////////////
void SceneCanvas::OnDebugBtClick( wxCommandEvent & event )
{
    if ( !m_mgr || !debugger ) return;

    m_mgr->GetPane(debugger.get()).Show();
    m_mgr->Update();
}

void SceneCanvas::OnKey( wxKeyEvent& evt )
{
    //Si on est en mode éditeur
    if ( edittimeRenderer.editing )
    {
        //ajout
        if ( evt.GetKeyCode() == WXK_INSERT )
        {
            wxCommandEvent unused;
            OnAddObjetSelected(unused);
        }
        //Suppression
        else if ( evt.GetKeyCode() == WXK_DELETE )
        {
            wxCommandEvent unused;
            OnDelObjetSelected(unused);
        }
        else if ( evt.GetKeyCode() == WXK_DOWN )
        {
            for (unsigned int i = 0;i<edittimeRenderer.objectsSelected.size();++i)
            {
                ObjSPtr object = edittimeRenderer.objectsSelected.at(i);

                int idPos = GetInitialPositionFromObject(object);
                if ( idPos != -1 )
                {
                    sceneEdited.initialObjectsPositions[idPos].y += 1;
                    object->SetY(object->GetY()+1);
                }
            }
        }
        else if ( evt.GetKeyCode() == WXK_UP )
        {
            for (unsigned int i = 0;i<edittimeRenderer.objectsSelected.size();++i)
            {
                ObjSPtr object = edittimeRenderer.objectsSelected.at(i);

                int idPos = GetInitialPositionFromObject(object);
                if ( idPos != -1 )
                {
                    sceneEdited.initialObjectsPositions[idPos].y -= 1;
                    object->SetY(object->GetY()-1);
                }
            }
        }
        else if ( evt.GetKeyCode() == WXK_RIGHT )
        {
            for (unsigned int i = 0;i<edittimeRenderer.objectsSelected.size();++i)
            {
                ObjSPtr object = edittimeRenderer.objectsSelected.at(i);

                int idPos = GetInitialPositionFromObject(object);
                if ( idPos != -1 )
                {
                    sceneEdited.initialObjectsPositions[idPos].x += 1;
                    object->SetX(object->GetX()+1);
                }
            }
        }
        else if ( evt.GetKeyCode() == WXK_LEFT )
        {
            for (unsigned int i = 0;i<edittimeRenderer.objectsSelected.size();++i)
            {
                ObjSPtr object = edittimeRenderer.objectsSelected.at(i);

                int idPos = GetInitialPositionFromObject(object);
                if ( idPos != -1 )
                {
                    sceneEdited.initialObjectsPositions[idPos].x -= 1;
                    object->SetX(object->GetX()-1);
                }
            }
        }
    }
    evt.StopPropagation();
}

void SceneCanvas::Reload()
{
    ReloadFirstPart();
}

void SceneCanvas::ReloadFirstPart()
{
    isReloading = true;

    game = gameEdited;
    game.imageManager = gameEdited.imageManager; //Use same image manager.

    edittimeRenderer.runtimeScene.StopMusic();

    RuntimeScene newScene(this, &game);
    edittimeRenderer.runtimeScene = newScene;
    edittimeRenderer.runtimeScene.running = false;
    if ( profileDialog )   edittimeRenderer.runtimeScene.profiler = profileDialog.get();
    if ( debugger ) edittimeRenderer.runtimeScene.debugger = debugger.get();


    #if !defined(GD_NO_DYNAMIC_EXTENSIONS)
    if ( !edittimeRenderer.editing && gameEdited.useExternalSourceFiles )
    {
        GDpriv::DynamicExtensionsManager::GetInstance()->UnloadAllDynamicExtensions();
        mainEditorCommand.GetBuildToolsPanel()->notebook->SetSelection(0);

        if ( !mainEditorCommand.GetBuildToolsPanel()->buildProgressPnl->LaunchGameSourceFilesBuild(gameEdited) )
        {
            wxLogWarning(_("Game Develop est entrain de compiler les sources C++ et ne pourra lancer un aperçu qu'une fois ce processus terminé."));
        }

        //Wait dynamic extensions for being compiled when previewing.
    }
    else
    #endif
    {
        ReloadSecondPart(); //Finalize immediatly reloading when editing.
    }
}

void SceneCanvas::ReloadSecondPart()
{
    #if !defined(GD_NO_DYNAMIC_EXTENSIONS)
    if ( !edittimeRenderer.editing && gameEdited.useExternalSourceFiles )
    {
        GDpriv::CompilerMessagesParser errorsParser;
        errorsParser.ParseOutput(mainEditorCommand.GetBuildToolsPanel()->buildProgressPnl->sourceFileBuilder.GetErrors());
        mainEditorCommand.GetBuildToolsPanel()->buildMessagesPnl->RefreshWith(&gameEdited, errorsParser.parsedErrors);

        if ( !mainEditorCommand.GetBuildToolsPanel()->buildProgressPnl->LastBuildSuccessed() )
        {
            mainEditorCommand.GetPaneManager()->GetPane(mainEditorCommand.GetBuildToolsPanel()).Show(true);
            mainEditorCommand.GetBuildToolsPanel()->notebook->SetSelection(1);
            mainEditorCommand.GetBuildToolsPanel()->buildMessagesPnl->OpenFileContainingFirstError();
            mainEditorCommand.GetMainEditor()->RequestUserAttention();
        }

        GDpriv::DynamicExtensionsManager::GetInstance()->LoadDynamicExtension("dynext.dxgde");
    }
    #endif

    edittimeRenderer.runtimeScene.LoadFromScene( sceneEdited );
    sceneEdited.wasModified = false;

    UpdateSize();
    UpdateScrollbars();

    isReloading = false;
}


void SceneCanvas::Refresh()
{
    if ( isReloading && gameEdited.useExternalSourceFiles )
    {
        //Wait extensions to be compiled
        if ( !mainEditorCommand.GetBuildToolsPanel()->buildProgressPnl->IsBuilding() )
            ReloadSecondPart();

        //Display a message when compiling
        sf::Event event;
        while ( GetEvent( event ) )
            ;

        SaveGLStates();
        Clear(sf::Color(255,255,255));
        SetView(sf::View(sf::Vector2f(GetWidth()/2,GetHeight()/2), sf::Vector2f(GetWidth(),GetHeight())));

        reloadingIconSprite.SetImage(reloadingIconImage);
        reloadingIconSprite.SetPosition(GetWidth()/2-reloadingIconSprite.GetSize().x/2, GetHeight()/2-reloadingIconSprite.GetSize().y/2);
        reloadingText.SetPosition(GetWidth()/2-reloadingText.GetRect().Width/2, reloadingIconSprite.GetPosition().y+reloadingIconSprite.GetSize().y+10);

        Draw(reloadingIconSprite);
        Draw(reloadingText);

        RestoreGLStates();
        Display();
    }
    else
    {
        if ( !edittimeRenderer.runtimeScene.running || edittimeRenderer.editing )
        {
            //Reload changed images.
            for (unsigned int i = 0;i<gameEdited.imagesChanged.size();++i)
                game.imageManager->ReloadImage(gameEdited.imagesChanged[i]);

            if ( !gameEdited.imagesChanged.empty() )
            {
                gameEdited.imageManager->LoadPermanentImages();
                gameEdited.imagesChanged.clear();
                sceneEdited.wasModified = true;
            }

            if ( sceneEdited.wasModified )
                Reload();
        }
        if ( edittimeRenderer.runtimeScene.running )
        {
            int retourEvent = edittimeRenderer.runtimeScene.RenderAndStep(1);

            if ( retourEvent == -2 )
            {
                wxLogStatus( _( "Dans le jeu final, le jeu se terminera." ) );
            }
            else if ( retourEvent != -1 )
            {
                wxLogStatus( _( "Dans le jeu final, un changement de scène s'effectuera." ) );
            }

        }
        else if ( !edittimeRenderer.runtimeScene.running && !edittimeRenderer.editing )
            edittimeRenderer.runtimeScene.RenderWithoutStep();
        else
            edittimeRenderer.RenderSceneEdittimeRenderer();
    }
}

void SceneCanvas::OnUpdate()
{
    Refresh();
    UpdateScrollbars();
}

void SceneCanvas::ChangesMade()
{
    //Mise à jour de l'historique d'annulation
    history.push_back(sceneEdited.initialObjectsPositions);
    redoHistory.clear();
}

////////////////////////////////////////////////////////////
/// Met à jour les barres de défilements
////////////////////////////////////////////////////////////
void SceneCanvas::UpdateScrollbars()
{
    if ( scrollBar1 == NULL || scrollBar2 == NULL)
        return;

    //On calcule la position du thumb
    int thumbY = edittimeRenderer.view.GetCenter().y+scrollBar2->GetRange()/2-GetHeight()/2;
    scrollBar2->SetScrollbar(thumbY, GetHeight(), scrollBar2->GetRange(), GetHeight());

    int thumbX = edittimeRenderer.view.GetCenter().x+scrollBar1->GetRange()/2-GetWidth()/2;
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

void SceneCanvas::UpdateContextMenu()
{
    //Peut on remonter les objets sur un calque plus haut ?
    int lowestLayer = GetObjectsSelectedLowestLayer();

    contextMenu.FindItem(ID_LAYERUPMENU)->Enable(false);
    if ( static_cast<unsigned>(lowestLayer+1) < edittimeRenderer.runtimeScene.initialLayers.size() )
    {
        string name = edittimeRenderer.runtimeScene.initialLayers[lowestLayer+1].GetName();
        if ( name == "" ) name = _("Calque de base");
        contextMenu.FindItem(ID_LAYERUPMENU)->Enable(true);
        contextMenu.FindItem(ID_LAYERUPMENU)->SetItemLabel(string(_("Passer le(s) objet(s) sur le calque \"")) + name +"\"");
    }

    //Peut on descendre les objets sur un calque plus bas ? ( pléonasme )
    int highestLayer = GetObjectsSelectedHighestLayer();

    contextMenu.FindItem(ID_LAYERDOWNMENU)->Enable(false);
    if ( highestLayer-1 >= 0 )
    {
        string name = edittimeRenderer.runtimeScene.initialLayers[highestLayer-1].GetName();
        if ( name == "" ) name = _("Calque de base");

        contextMenu.FindItem(ID_LAYERDOWNMENU)->Enable(true);
        contextMenu.FindItem(ID_LAYERDOWNMENU)->SetItemLabel(string(_("Passer le(s) objet(s) sur le calque \"")) + name +"\"");
    }
}

////////////////////////////////////////////////////////////
/// Bouton gauche : Déplacement objet
////////////////////////////////////////////////////////////
void SceneCanvas::OnLeftDown( wxMouseEvent &event )
{
    SetFocus();

    if ( !edittimeRenderer.editing )
        return;

    if ( hasJustRightClicked )
    {
        hasJustRightClicked = false;
        return;
    }

    ObjSPtr object = edittimeRenderer.FindSmallestObject();

    int mouseX = ConvertCoords(edittimeRenderer.runtimeScene.input->GetMouseX(), 0).x;
    int mouseY = ConvertCoords(0, edittimeRenderer.runtimeScene.input->GetMouseY()).y;

    //Suppress selection
    if ( (!edittimeRenderer.runtimeScene.input->IsKeyDown(sf::Key::LShift) && !edittimeRenderer.runtimeScene.input->IsKeyDown(sf::Key::RShift)) && //Check that shift is not pressed
        ( object == boost::shared_ptr<Object> () || //If no object is clicked
         find(edittimeRenderer.objectsSelected.begin(), edittimeRenderer.objectsSelected.end(), object) == edittimeRenderer.objectsSelected.end()) ) //Or an object which is not currently selected.
    {
        edittimeRenderer.objectsSelected.clear();
        edittimeRenderer.xObjectsSelected.clear();
        edittimeRenderer.yObjectsSelected.clear();

        if ( initialPositionsBrowser )
            initialPositionsBrowser->DeselectAll();
    }

    //Manage selection area
    if ( object == boost::shared_ptr<Object> () ) //If no object is clicked
    {
        //Creation
        edittimeRenderer.isSelecting = true;
        edittimeRenderer.xRectangleSelection = mouseX;
        edittimeRenderer.yRectangleSelection = mouseY;
        edittimeRenderer.xEndRectangleSelection = mouseX;
        edittimeRenderer.yEndRectangleSelection = mouseY;
    }

    //On ajoute l'objet surligné dans les objets à bouger
    if ( object == boost::shared_ptr<Object> () ) return;

    //Verify if user want to resize the object
    if (    edittimeRenderer.objectsSelected.size() == 1 &&
            mouseX > object->GetDrawableX()+object->GetWidth()-6 &&
            mouseX < object->GetDrawableX()+object->GetWidth() &&
            mouseY > object->GetDrawableY()+object->GetHeight()/2-3 &&
            mouseY < object->GetDrawableY()+object->GetHeight()/2+3)
    {
        edittimeRenderer.isMovingObject = false;
        edittimeRenderer.isRotatingObject = false;
        edittimeRenderer.isResizingX = true;
    }
    else if (   edittimeRenderer.objectsSelected.size() == 1 &&
                mouseY > object->GetDrawableY()+object->GetHeight()-6 &&
                mouseY < object->GetDrawableY()+object->GetHeight() &&
                mouseX > object->GetDrawableX()+object->GetWidth()/2-3 &&
                mouseX < object->GetDrawableX()+object->GetWidth()/2+3 )
    {
        edittimeRenderer.isMovingObject = false;
        edittimeRenderer.isRotatingObject = false;
        edittimeRenderer.isResizingY = true;
    }
    else if ( edittimeRenderer.objectsSelected.size() == 1 &&
                mouseX > object->GetDrawableX()+object->GetWidth()/2+20*cos(object->GetAngle()/180.f*3.14159)-3 &&
                mouseX < object->GetDrawableX()+object->GetWidth()/2+20*cos(object->GetAngle()/180.f*3.14159)+3 &&
                mouseY > object->GetDrawableY()+object->GetHeight()/2+20*sin(object->GetAngle()/180.f*3.14159)-3 &&
                mouseY < object->GetDrawableY()+object->GetHeight()/2+20*sin(object->GetAngle()/180.f*3.14159)+3 )
    {
        edittimeRenderer.isRotatingObject = true;
        edittimeRenderer.isMovingObject = false;
        edittimeRenderer.isResizingX = false;
        edittimeRenderer.isResizingY = false;
    }
    else //Add object to selection
    {
        if ( find(edittimeRenderer.objectsSelected.begin(), edittimeRenderer.objectsSelected.end(), object) == edittimeRenderer.objectsSelected.end() )
        {
            edittimeRenderer.objectsSelected.push_back(object);

            //Et on renseigne sa position de départ :
            edittimeRenderer.xObjectsSelected.push_back(object->GetX());
            edittimeRenderer.yObjectsSelected.push_back(object->GetY());

            if ( initialPositionsBrowser )
                initialPositionsBrowser->SelectInitialPosition(GetInitialPositionFromObject(object));
        }

        edittimeRenderer.isMovingObject = true;
        edittimeRenderer.isRotatingObject = false;
        edittimeRenderer.isResizingX = false;
        edittimeRenderer.isResizingY = false;
    }

    edittimeRenderer.oldMouseX = mouseX; //Position de départ de la souris
    edittimeRenderer.oldMouseY = mouseY;
}

////////////////////////////////////////////////////////////
/// Bouton gauche relaché : Fin du déplacement
////////////////////////////////////////////////////////////
void SceneCanvas::OnLeftUp( wxMouseEvent &event )
{
    if ( !edittimeRenderer.editing ) return;

    //Relachement de la souris :
    //Pour les objets selectionnés, leurs nouvelle
    //position de départ est celle où ils sont.
    if ( edittimeRenderer.isMovingObject )
    {
        if ( initialPositionsBrowser ) initialPositionsBrowser->Refresh();
        for (unsigned int i = 0;i<edittimeRenderer.objectsSelected.size();++i)
        {
            ObjSPtr object = edittimeRenderer.objectsSelected.at(i);
            int IDInitialPosition = GetInitialPositionFromObject(object);
            if ( IDInitialPosition != -1)
            {
                edittimeRenderer.xObjectsSelected[i] = sceneEdited.initialObjectsPositions.at( IDInitialPosition ).x;
                edittimeRenderer.yObjectsSelected[i] = sceneEdited.initialObjectsPositions.at( IDInitialPosition ).y;

                if ( initialPositionsBrowser )
                    initialPositionsBrowser->SelectInitialPosition(IDInitialPosition);
            }
        }
    }

    //Select object thanks to the selection area
    if ( edittimeRenderer.isSelecting )
    {
        //Origin must be at the top left of the area
        if ( edittimeRenderer.xEndRectangleSelection < edittimeRenderer.xRectangleSelection) std::swap(edittimeRenderer.xEndRectangleSelection, edittimeRenderer.xRectangleSelection);
        if ( edittimeRenderer.yEndRectangleSelection < edittimeRenderer.yRectangleSelection) std::swap(edittimeRenderer.yEndRectangleSelection, edittimeRenderer.yRectangleSelection);

        ObjList allObjects = edittimeRenderer.runtimeScene.objectsInstances.GetAllObjects();

        for (unsigned int id = 0;id < allObjects.size();++id)
        {
            //Find and add to selection all objects of the selection area
            ObjSPtr object = allObjects[id];
            if ( object->GetX() >= edittimeRenderer.xRectangleSelection &&
                 object->GetX()+object->GetWidth() <= edittimeRenderer.xEndRectangleSelection &&
                 object->GetY() >= edittimeRenderer.yRectangleSelection &&
                 object->GetY()+object->GetHeight() <= edittimeRenderer.yEndRectangleSelection )
             {
                int IDInitialPosition = GetInitialPositionFromObject(object);
                if ( IDInitialPosition != -1)
                {
                    if ( find(edittimeRenderer.objectsSelected.begin(), edittimeRenderer.objectsSelected.end(), object) == edittimeRenderer.objectsSelected.end() )
                    {
                        edittimeRenderer.objectsSelected.push_back(object);

                        //Et on renseigne sa position de départ :
                        edittimeRenderer.xObjectsSelected.push_back(object->GetX());
                        edittimeRenderer.yObjectsSelected.push_back(object->GetY());

                        if ( initialPositionsBrowser )
                            initialPositionsBrowser->SelectInitialPosition(IDInitialPosition);
                    }
                }
             }
        }
    }

    edittimeRenderer.isResizingX = false;
    edittimeRenderer.isResizingY = false;
    edittimeRenderer.isMovingObject = false;
    edittimeRenderer.isRotatingObject = false;
    edittimeRenderer.isSelecting = false;

    ChangesMade();
}

////////////////////////////////////////////////////////////
/// A chaque déplacement de la souris :
///
/// -affichage position
/// -bouger la vue si on suit la souris
////////////////////////////////////////////////////////////
void SceneCanvas::OnMotion( wxMouseEvent &event )
{
    //Mille mercis Laurent.
    int mouseXInScene = 0;
    int mouseYInScene = 0;

    wxString Xstr;
    wxString Ystr;

    if ( !edittimeRenderer.editing )
    {
        mouseXInScene = static_cast<int>(sf::RenderWindow::ConvertCoords(edittimeRenderer.runtimeScene.input->GetMouseX(), 0, edittimeRenderer.runtimeScene.GetLayer("").GetCamera(0).GetSFMLView()).x);
        mouseYInScene = static_cast<int>(sf::RenderWindow::ConvertCoords(0, edittimeRenderer.runtimeScene.input->GetMouseY(), edittimeRenderer.runtimeScene.GetLayer("").GetCamera(0).GetSFMLView()).y);
        Xstr =ToString( mouseXInScene );
        Ystr =ToString( mouseYInScene );

        wxLogStatus( wxString( _( "Position " ) ) + Xstr + wxString( _( ";" ) ) + Ystr + wxString( _( ". ( Calque de base, Caméra 0 )" ) ) );
    }
    else
    {
        mouseXInScene = static_cast<int>(sf::RenderWindow::ConvertCoords(edittimeRenderer.runtimeScene.input->GetMouseX(), 0).x);
        mouseYInScene = static_cast<int>(sf::RenderWindow::ConvertCoords(0, edittimeRenderer.runtimeScene.input->GetMouseY()).y);

        Xstr =ToString( mouseXInScene );
        Ystr =ToString( mouseYInScene );

        wxLogStatus( wxString( _( "Position " ) ) + Xstr + wxString( _( ";" ) ) + Ystr + wxString( _( ". SHIFT pour sélection multiple, clic droit pour plus d'options." ) ) );
    }

    //Le reste concerne juste le mode édition
    if ( edittimeRenderer.runtimeScene.running )
        return;

    //Déplacement avec la souris
    if ( edittimeRenderer.isMoving )
        edittimeRenderer.view.Move( edittimeRenderer.deplacementOX - mouseXInScene, edittimeRenderer.deplacementOY - mouseYInScene );

    if ( edittimeRenderer.isResizingX )
    {
        for (unsigned int i = 0;i<edittimeRenderer.objectsSelected.size();++i)
        {
            ObjSPtr object = edittimeRenderer.objectsSelected.at(i);
            object->SetWidth(mouseXInScene-edittimeRenderer.xObjectsSelected.at(i));

            int idPos = GetInitialPositionFromObject(object);
            if ( idPos != -1 )
            {
                sceneEdited.initialObjectsPositions.at( idPos ).personalizedSize = true;
                sceneEdited.initialObjectsPositions.at( idPos ).width = object->GetWidth();
                sceneEdited.initialObjectsPositions.at( idPos ).height = object->GetHeight();
            }
        }
    }
    if ( edittimeRenderer.isResizingY )
    {
        for (unsigned int i = 0;i<edittimeRenderer.objectsSelected.size();++i)
        {
            ObjSPtr object = edittimeRenderer.objectsSelected.at(i);
            object->SetHeight(mouseYInScene-edittimeRenderer.yObjectsSelected.at(i));

            int idPos = GetInitialPositionFromObject(object);
            if ( idPos != -1 )
            {
                sceneEdited.initialObjectsPositions.at( idPos ).personalizedSize = true;
                sceneEdited.initialObjectsPositions.at( idPos ).height = object->GetHeight();
                sceneEdited.initialObjectsPositions.at( idPos ).width = object->GetWidth();
            }
        }
    }
    if ( edittimeRenderer.isRotatingObject )
    {
        for (unsigned int i = 0;i<edittimeRenderer.objectsSelected.size();++i)
        {
            ObjSPtr object = edittimeRenderer.objectsSelected.at(i);
            float x = mouseXInScene-(object->GetDrawableX()+object->GetWidth()/2);
            float y = mouseYInScene-(object->GetDrawableY()+object->GetHeight()/2);
            float newAngle = atan2(y,x)*180/3.14159;

            object->SetAngle(newAngle);

            int idPos = GetInitialPositionFromObject(object);
            if ( idPos != -1 )
            {
                sceneEdited.initialObjectsPositions.at( idPos ).angle = newAngle;
            }
        }
    }
    //Déplacement de la position initiale d'un objet
    if ( edittimeRenderer.isMovingObject )
    {
        for (unsigned int i = 0;i<edittimeRenderer.objectsSelected.size();++i)
        {
            ObjSPtr object = edittimeRenderer.objectsSelected.at(i);

            int idPos = GetInitialPositionFromObject(object);
            if ( idPos != -1 )
            {
                //Déplacement effectué par la souris
                int deltaX = mouseXInScene - edittimeRenderer.oldMouseX;
                int deltaY = mouseYInScene - edittimeRenderer.oldMouseY;

                //Anciennes et nouvelles coordonnées
                int oldX = edittimeRenderer.xObjectsSelected[i];
                int oldY = edittimeRenderer.yObjectsSelected[i];
                int newX = oldX + deltaX;
                int newY = oldY + deltaY;

                if ( sceneEdited.grid && sceneEdited.snap )
                {
                    newX = static_cast<int>(newX/sceneEdited.gridWidth)*sceneEdited.gridWidth;
                    newY = static_cast<int>(newY/sceneEdited.gridHeight)*sceneEdited.gridHeight;
                }

                //Modification de l'emplacement initial
                sceneEdited.initialObjectsPositions.at( idPos ).x = newX;
                sceneEdited.initialObjectsPositions.at( idPos ).y = newY;

                //On bouge aussi l'objet actuellement affiché
                object->SetX( newX );
                object->SetY( newY );
            }
        }
    }
    if ( edittimeRenderer.isSelecting )
    {
        edittimeRenderer.xEndRectangleSelection = mouseXInScene;
        edittimeRenderer.yEndRectangleSelection = mouseYInScene;
    }

}

////////////////////////////////////////////////////////////
/// Double clic : insertion objet
////////////////////////////////////////////////////////////
void SceneCanvas::OnLeftDClick( wxMouseEvent &event )
{
    AddObjetSelected(ConvertCoords(edittimeRenderer.runtimeScene.input->GetMouseX(), 0).x, ConvertCoords(0, edittimeRenderer.runtimeScene.input->GetMouseY()).y);
}

////////////////////////////////////////////////////////////
/// Insertion d'un objet
////////////////////////////////////////////////////////////
void SceneCanvas::OnAddObjetSelected( wxCommandEvent & event )
{
    AddObjetSelected(ConvertCoords(edittimeRenderer.runtimeScene.input->GetMouseX(), 0).x, ConvertCoords(0, edittimeRenderer.runtimeScene.input->GetMouseY()).y);
}

void SceneCanvas::AddObjetSelected(float x, float y)
{
    //Seulement en mode éditeur
    if ( !edittimeRenderer.editing )
        return;

    edittimeRenderer.isMovingObject = false;

    if ( edittimeRenderer.objectToAdd.empty() ) { wxLogMessage( _( "Vous n'avez selectionné aucun objet à ajouter.\nSélectionnez en un avec le bouton \"Choisir un objet à ajouter\" dans la barre d'outils." ) ); return;}

    int IDsceneObject = Picker::PickOneObject( &sceneEdited.initialObjects, edittimeRenderer.objectToAdd );
    int IDglobalObject = Picker::PickOneObject( &gameEdited.globalObjects, edittimeRenderer.objectToAdd );

    ObjSPtr newObject = boost::shared_ptr<Object> ();

    if ( IDsceneObject != -1 ) //We check first scene's objects' list.
        newObject = sceneEdited.initialObjects[IDsceneObject]->Clone();
    else if ( IDglobalObject != -1 ) //Then the global object list
        newObject = gameEdited.globalObjects[IDglobalObject]->Clone();

    if ( newObject == boost::shared_ptr<Object> () )
    {
        wxLogMessage(_("L'objet à ajouter n'existe pas ou plus dans la liste des objets."));
        return;
    }

    //Initial position creation
    InitialPosition pos;
    pos.objectName = edittimeRenderer.objectToAdd; //A choisir avec un dialog approprié ou par drag'n'drop
    if ( sceneEdited.grid && sceneEdited.snap )
    {
        pos.x = static_cast<int>(x/sceneEdited.gridWidth)*sceneEdited.gridWidth;
        pos.y = static_cast<int>(y/sceneEdited.gridHeight)*sceneEdited.gridHeight;
    }
    else
    {
        pos.x = x;
        pos.y = y;
    }

    pos.zOrder = 0;
    pos.layer = edittimeRenderer.addOnLayer;
    sceneEdited.initialObjectsPositions.push_back( pos );

    //Edittime scene object creation
    newObject->SetX( pos.x );
    newObject->SetY( pos.y );
    newObject->SetZOrder( pos.zOrder );
    newObject->SetLayer( pos.layer );

    newObject->InitializeFromInitialPosition(pos);
    newObject->LoadRuntimeResources( edittimeRenderer.runtimeScene, *game.imageManager );

    edittimeRenderer.runtimeScene.objectsInstances.AddObject(newObject);

    newObject->LoadResources(edittimeRenderer.runtimeScene, *game.imageManager); //Global objects images are curiously not displayed if we don't reload resources..

    if ( initialPositionsBrowser ) initialPositionsBrowser->Refresh();
    ChangesMade();
}

////////////////////////////////////////////////////////////
/// Clic droit : edition propriétés objet
////////////////////////////////////////////////////////////
void SceneCanvas::OnRightUp( wxMouseEvent &event )
{
    if ( !edittimeRenderer.editing )
        return;

    ObjSPtr object = edittimeRenderer.FindSmallestObject();

    //Suppress selection if
    if ( object == boost::shared_ptr<Object> () || /*Not clicked on an object*/
        (( !edittimeRenderer.runtimeScene.input->IsKeyDown(sf::Key::LShift) && !edittimeRenderer.runtimeScene.input->IsKeyDown(sf::Key::RShift) ) && /*Clicked without using shift*/
         find(edittimeRenderer.objectsSelected.begin(), edittimeRenderer.objectsSelected.end(), object) == edittimeRenderer.objectsSelected.end() ))
    {
        edittimeRenderer.objectsSelected.clear();
        edittimeRenderer.xObjectsSelected.clear();
        edittimeRenderer.yObjectsSelected.clear();

        if ( initialPositionsBrowser )
            initialPositionsBrowser->DeselectAll();
    }

    if ( object == boost::shared_ptr<Object> () ) //Popup "no object" context menu
    {
        PopupMenu(&noObjectContextMenu);
        return;
    }

    //Add the object to selection
    if ( find(edittimeRenderer.objectsSelected.begin(), edittimeRenderer.objectsSelected.end(), object) == edittimeRenderer.objectsSelected.end() )
    {
        edittimeRenderer.objectsSelected.push_back(object);

        //Must also register its position
        edittimeRenderer.xObjectsSelected.push_back(object->GetX());
        edittimeRenderer.yObjectsSelected.push_back(object->GetY());

        if ( initialPositionsBrowser )
            initialPositionsBrowser->SelectInitialPosition(GetInitialPositionFromObject(object));
    }

    OnUpdate(); //So as to display selection rectangle for the newly selected object
    UpdateContextMenu();
    PopupMenu(&contextMenu);

    hasJustRightClicked = true;
}

////////////////////////////////////////////////////////////
/// Déplacement de(s) objet(s) selectionné(s) sur le calque supérieur
////////////////////////////////////////////////////////////
void SceneCanvas::OnLayerUpSelected(wxCommandEvent & event)
{
    int lowestLayer = GetObjectsSelectedLowestLayer();
    if ( lowestLayer+1 < 0 || static_cast<unsigned>(lowestLayer+1) >= edittimeRenderer.runtimeScene.initialLayers.size() )
        return;

    string layerName = edittimeRenderer.runtimeScene.initialLayers.at(lowestLayer+1).GetName();

    for (unsigned int i =0;i<edittimeRenderer.objectsSelected.size();++i)
    {
        //Récupérons la position initiale
        int posId = GetInitialPositionFromObject(edittimeRenderer.objectsSelected[i]);
        if ( posId != -1 )
        {
            sceneEdited.initialObjectsPositions.at(posId).layer = layerName;
            edittimeRenderer.objectsSelected[i]->SetLayer(layerName);
        }
    }

    ChangesMade();
}

void SceneCanvas::OnCopySelected(wxCommandEvent & event)
{
    vector < InitialPosition > copiedPositions;

    for (unsigned int i =0;i<edittimeRenderer.objectsSelected.size();++i)
    {
        int posId = GetInitialPositionFromObject(edittimeRenderer.objectsSelected[i]);
        if ( posId != -1 )
        {
            copiedPositions.push_back(sceneEdited.initialObjectsPositions.at(posId));
            copiedPositions.back().x -= ConvertCoords(edittimeRenderer.runtimeScene.input->GetMouseX(), 0).x;
            copiedPositions.back().y -= ConvertCoords(0, edittimeRenderer.runtimeScene.input->GetMouseY()).y;
        }
    }

    Clipboard::GetInstance()->SetPositionsSelection(copiedPositions);
}

void SceneCanvas::OnCutSelected(wxCommandEvent & event)
{
    vector < InitialPosition > copiedPositions;

    for (unsigned int i =0;i<edittimeRenderer.objectsSelected.size();++i)
    {
        int posId = GetInitialPositionFromObject(edittimeRenderer.objectsSelected[i]);
        if ( posId != -1 )
        {
            //Copy position
            copiedPositions.push_back(sceneEdited.initialObjectsPositions.at(posId));
            copiedPositions.back().x -= ConvertCoords(edittimeRenderer.runtimeScene.input->GetMouseX(), 0).x;
            copiedPositions.back().y -= ConvertCoords(0, edittimeRenderer.runtimeScene.input->GetMouseY()).y;

            //Remove objects
            sceneEdited.initialObjectsPositions.erase(sceneEdited.initialObjectsPositions.begin() + posId);
            edittimeRenderer.runtimeScene.objectsInstances.RemoveObject(edittimeRenderer.objectsSelected[i]);
        }
    }

    edittimeRenderer.objectsSelected.clear();
    edittimeRenderer.xObjectsSelected.clear();
    edittimeRenderer.yObjectsSelected.clear();

    if ( initialPositionsBrowser ) initialPositionsBrowser->DeselectAll();
    if ( initialPositionsBrowser ) initialPositionsBrowser->Refresh();

    Clipboard::GetInstance()->SetPositionsSelection(copiedPositions);
}

void SceneCanvas::OnPasteSelected(wxCommandEvent & event)
{
    if ( !Clipboard::GetInstance()->HasPositionsSelection() ) return;

    vector < InitialPosition > pastedPositions = Clipboard::GetInstance()->GetPositionsSelection();

    for (unsigned int i =0;i<pastedPositions.size();++i)
    {
        sceneEdited.initialObjectsPositions.push_back(pastedPositions[i]);
        sceneEdited.initialObjectsPositions.back().x += ConvertCoords(edittimeRenderer.runtimeScene.input->GetMouseX(), 0).x;
        sceneEdited.initialObjectsPositions.back().y += ConvertCoords(0, edittimeRenderer.runtimeScene.input->GetMouseY()).y;
    }

    if ( initialPositionsBrowser ) initialPositionsBrowser->Refresh();
    Reload();
}

////////////////////////////////////////////////////////////
/// Déplacement de(s) objet(s) selectionné(s) sur le calque inférieur
////////////////////////////////////////////////////////////
void SceneCanvas::OnLayerDownSelected(wxCommandEvent & event)
{
    int highestLayer = GetObjectsSelectedLowestLayer();
    if ( highestLayer-1 < 0 || static_cast<unsigned>(highestLayer-1) >= edittimeRenderer.runtimeScene.initialLayers.size() )
        return;

    string layerName = edittimeRenderer.runtimeScene.initialLayers.at(highestLayer-1).GetName();

    for (unsigned int i =0;i<edittimeRenderer.objectsSelected.size();++i)
    {
        //Récupérons la position initiale
        int posId = GetInitialPositionFromObject(edittimeRenderer.objectsSelected[i]);
        if ( posId != -1 )
        {
            sceneEdited.initialObjectsPositions.at(posId).layer = layerName;
            edittimeRenderer.objectsSelected[i]->SetLayer(layerName);
        }
    }

    ChangesMade();
}

////////////////////////////////////////////////////////////
/// Editer les valeurs initiales d'un objet sur la scène
////////////////////////////////////////////////////////////
void SceneCanvas::OnPropObjSelected(wxCommandEvent & event)
{
    if ( !edittimeRenderer.editing )
        return;

    //Cherche l'objet sous la souris
    ObjSPtr smallestObject = edittimeRenderer.FindSmallestObject();
    if ( smallestObject == boost::shared_ptr<Object> ()) return;

    int idPos = GetInitialPositionFromObject(smallestObject);
    if ( idPos == -1 ) return;

    bool hadAPersonalizedSize = sceneEdited.initialObjectsPositions.at( idPos ).personalizedSize;

    //Affichage des propriétés de l'objet sous la souris
    EditOptionsPosition DialogPosition( this, gameEdited, edittimeRenderer.runtimeScene, sceneEdited.initialObjectsPositions.at( idPos ) );
    if ( DialogPosition.ShowModal() == 1 )
    {
        sceneEdited.initialObjectsPositions.at( idPos ) = DialogPosition.position;

        smallestObject->SetX( sceneEdited.initialObjectsPositions.at( idPos ).x );
        smallestObject->SetY( sceneEdited.initialObjectsPositions.at( idPos ).y );
        smallestObject->SetZOrder( sceneEdited.initialObjectsPositions.at( idPos ).zOrder );
        smallestObject->SetLayer( sceneEdited.initialObjectsPositions.at( idPos ).layer );

        smallestObject->InitializeFromInitialPosition(sceneEdited.initialObjectsPositions.at( idPos ));

        if ( sceneEdited.initialObjectsPositions.at( idPos ).personalizedSize )
        {
            smallestObject->SetWidth( sceneEdited.initialObjectsPositions.at( idPos ).width );
            smallestObject->SetHeight( sceneEdited.initialObjectsPositions.at( idPos ).height );
        }
        else if ( hadAPersonalizedSize ) //For now, we reload the scene so as the object get back its initial size
        {
            Reload();
        }
        if ( initialPositionsBrowser ) initialPositionsBrowser->Refresh();
        ChangesMade();
    }

    return;
}

////////////////////////////////////////////////////////////
/// Double clic droit : propriétés direct de l'objet
////////////////////////////////////////////////////////////
void SceneCanvas::OnRightDClick( wxMouseEvent &event )
{
    wxCommandEvent unusedEvent;
    OnPropObjSelected(unusedEvent);
}

////////////////////////////////////////////////////////////
/// Suppression de(s) objet(s) selectionné(s)
////////////////////////////////////////////////////////////
void SceneCanvas::OnDelObjetSelected(wxCommandEvent & event)
{
    if ( !edittimeRenderer.editing )
        return;

    for (unsigned int i = 0;i<edittimeRenderer.objectsSelected.size();++i)
    {
        ObjSPtr object = edittimeRenderer.objectsSelected.at(i);

        int idPos = GetInitialPositionFromObject(object);
        if ( idPos != -1 )
        {
            sceneEdited.initialObjectsPositions.erase(sceneEdited.initialObjectsPositions.begin() + idPos);
            edittimeRenderer.runtimeScene.objectsInstances.RemoveObject(object);
        }
    }

    edittimeRenderer.objectsSelected.clear();
    edittimeRenderer.xObjectsSelected.clear();
    edittimeRenderer.yObjectsSelected.clear();

    if ( initialPositionsBrowser ) initialPositionsBrowser->Refresh();

    ChangesMade();
}

////////////////////////////////////////////////////////////
/// Clic molette : Des/activer déplacement à la souris
////////////////////////////////////////////////////////////
void SceneCanvas::OnMiddleDown( wxMouseEvent &event )
{
    if ( !edittimeRenderer.editing ) return;

    if ( !edittimeRenderer.isMoving )
    {
        edittimeRenderer.isMoving = true;
        edittimeRenderer.deplacementOX = ConvertCoords(edittimeRenderer.runtimeScene.input->GetMouseX(), 0).x;
        edittimeRenderer.deplacementOY = ConvertCoords(0, edittimeRenderer.runtimeScene.input->GetMouseY()).y;
        SetCursor( wxCursor( wxCURSOR_SIZING ) );
        return;
    }
    else
    {
        edittimeRenderer.isMoving = false;
        SetCursor( wxNullCursor );
    }
}

////////////////////////////////////////////////////////////
/// Zoom / dezoom à la molette
/// Il faut prendre garde à garder les proportions de la fenêtre
////////////////////////////////////////////////////////////
void SceneCanvas::OnMouseWheel( wxMouseEvent &event )
{
    if (edittimeRenderer.runtimeScene.running)
        return;

    //La rotation de la molette
    float rotation = event.GetWheelRotation()*3;
    edittimeRenderer.zoom += ( rotation / 25 );

    //Le rapport entre la largeur et la hauteur
    float qwoh = edittimeRenderer.view.GetSize().x / edittimeRenderer.view.GetSize().y;

    //La nouvelle hauteur
    float newheight = edittimeRenderer.view.GetSize().y + ( rotation / 25 );

    edittimeRenderer.view.SetSize( newheight*qwoh, newheight );
}

int SceneCanvas::GetObjectsSelectedHighestLayer()
{
    int highestLayer = 0;
    for (unsigned int i =0;i<edittimeRenderer.objectsSelected.size();++i)
    {
        //Récupérons la position initiale
        int posId = GetInitialPositionFromObject(edittimeRenderer.objectsSelected[i]);
        if ( posId != -1 )
        {
            int layerObjId = 0;
            //On cherche le numéro du calque de l'objet
            for (unsigned int layerId = 0;layerId<edittimeRenderer.runtimeScene.initialLayers.size();++layerId)
            {
                if ( edittimeRenderer.runtimeScene.initialLayers[layerId].GetName() == sceneEdited.initialObjectsPositions.at(posId).layer )
                   layerObjId = layerId;
            }

            if ( layerObjId > highestLayer )
                highestLayer = layerObjId;
        }
    }

    return highestLayer;
}

int SceneCanvas::GetObjectsSelectedLowestLayer()
{
    int lowestLayer = edittimeRenderer.runtimeScene.initialLayers.size()-1;
    for (unsigned int i =0;i<edittimeRenderer.objectsSelected.size();++i)
    {
        //Récupérons la position initiale
        int posId = GetInitialPositionFromObject(edittimeRenderer.objectsSelected[i]);
        if ( posId != -1 )
        {
            int layerObjId = 0;
            //On cherche le numéro du calque de l'objet
            for (unsigned int layerId = 0;layerId<edittimeRenderer.runtimeScene.initialLayers.size();++layerId)
            {
                if ( edittimeRenderer.runtimeScene.initialLayers[layerId].GetName() == sceneEdited.initialObjectsPositions.at(posId).layer )
                   layerObjId = layerId;
            }

            if ( layerObjId < lowestLayer )
                lowestLayer = layerObjId;
        }
    }

    return lowestLayer;
}

////////////////////////////////////////////////////////////
/// Renvoi l'ID d'une position initiale à partir d'un objet sur la scène
////////////////////////////////////////////////////////////
int SceneCanvas::GetInitialPositionFromObject(ObjSPtr object)
{
    if ( object == boost::shared_ptr<Object> ()) return -1;

    for (unsigned int j = 0;j < sceneEdited.initialObjectsPositions.size();++j)
    {
        if ( sceneEdited.initialObjectsPositions.at( j ).objectName == object->GetName() &&
                sceneEdited.initialObjectsPositions.at( j ).x == object->GetX() &&
                sceneEdited.initialObjectsPositions.at( j ).y == object->GetY() )
        {
            return j;
        }
    }

    return -1;
}

ObjSPtr SceneCanvas::GetObjectFromInitialPosition(const InitialPosition & initialPosition)
{
    ObjList allObjects = edittimeRenderer.runtimeScene.objectsInstances.GetAllObjects();

    for (unsigned int id = 0;id < allObjects.size();++id)
    {
        if ( allObjects[id]->GetX() == initialPosition.x &&
                allObjects[id]->GetY() == initialPosition.y &&
                allObjects[id]->GetAngle() == initialPosition.angle)
        {
            return allObjects[id];
        }
    }

    cout << "Object not found";
    return boost::shared_ptr<Object> ();
}

void SceneCanvas::Onzoom5Selected(wxCommandEvent& event)
{
    edittimeRenderer.view.SetSize(GetWidth()/0.05f, GetHeight()/0.05f);
}

void SceneCanvas::Onzoom10Selected(wxCommandEvent& event)
{
    edittimeRenderer.view.SetSize(GetWidth()/0.1f, GetHeight()/0.1f);
}

void SceneCanvas::Onzoom25Selected(wxCommandEvent& event)
{
    edittimeRenderer.view.SetSize(GetWidth()/0.25f, GetHeight()/0.25f);
}

void SceneCanvas::Onzoom50Selected(wxCommandEvent& event)
{
    edittimeRenderer.view.SetSize(GetWidth()/0.5f, GetHeight()/0.5f);
}

void SceneCanvas::Onzoom100Selected(wxCommandEvent& event)
{
    edittimeRenderer.view.SetSize(GetWidth(), GetHeight());
}

void SceneCanvas::Onzoom150Selected(wxCommandEvent& event)
{
    edittimeRenderer.view.SetSize(GetWidth()/1.5f, GetHeight()/1.5f);
}

void SceneCanvas::Onzoom200Selected(wxCommandEvent& event)
{
    edittimeRenderer.view.SetSize(GetWidth()/2.f, GetHeight()/2.f);
}

void SceneCanvas::Onzoom500Selected(wxCommandEvent& event)
{
    edittimeRenderer.view.SetSize(GetWidth()/5.f, GetHeight()/5.f);
}
