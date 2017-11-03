/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "LayoutEditorCanvas.h"
#include <cmath>
#include <wx/wx.h>
#include <wx/config.h>
#include <wx/filename.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/page.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/aui/aui.h>
#include <SFML/Graphics.hpp>
#include "GDCore/Project/LayoutEditorPreviewer.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/IDE/Dialogs/ChooseBehaviorTypeDialog.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasAssociatedEditor.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasTextDnd.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasOptions.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/GridSetupDialog.h"
#include "GDCore/IDE/wxTools/GUIContentScaleFactor.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/CommonTools.h"
// Platform-specific includes. Be sure to include them at the end as it seems
// to be some incompatibilities with SFML's WindowStyle.hpp
#ifdef __WXGTK__
    #include <gdk/gdkx.h>
    #include <gtk/gtk.h>
    #include "GDCore/IDE/wxTools/win_gtk.h"
#endif

//(*InternalHeaders(LayoutEditorCanvas)
#include "GDCore/Tools/Localization.h"
#include <wx/string.h>
//*)

//(*IdInit(LayoutEditorCanvas)
//*)

using namespace std;

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
const long LayoutEditorCanvas::ID_ADDOBJMENU = wxNewId();
const long LayoutEditorCanvas::ID_DELOBJMENU = wxNewId();
const long LayoutEditorCanvas::ID_PROPMENU = wxNewId();
const long LayoutEditorCanvas::ID_AUTOMENU = wxNewId();
const long LayoutEditorCanvas::ID_LAYERUPMENU = wxNewId();
const long LayoutEditorCanvas::ID_LAYERDOWNMENU = wxNewId();
const long LayoutEditorCanvas::ID_COPYMENU = wxNewId();
const long LayoutEditorCanvas::ID_CUTMENU = wxNewId();
const long LayoutEditorCanvas::ID_PASTEMENU = wxNewId();
const long LayoutEditorCanvas::ID_PASTESPECIALMENU = wxNewId();
const long LayoutEditorCanvas::ID_CREATEOBJECTMENU = wxNewId();
const long LayoutEditorCanvas::ID_LOCKMENU = wxNewId();
const long LayoutEditorCanvas::ID_UNLOCKMENU = wxNewId();
const long LayoutEditorCanvas::idRibbonOrigine = wxNewId();
const long LayoutEditorCanvas::idRibbonOriginalZoom = wxNewId();
const long LayoutEditorCanvas::ID_CUSTOMZOOMMENUITEM500 = wxNewId();
const long LayoutEditorCanvas::ID_CUSTOMZOOMMENUITEM200 = wxNewId();
const long LayoutEditorCanvas::ID_CUSTOMZOOMMENUITEM150 = wxNewId();
const long LayoutEditorCanvas::ID_CUSTOMZOOMMENUITEM100 = wxNewId();
const long LayoutEditorCanvas::ID_CUSTOMZOOMMENUITEM50 = wxNewId();
const long LayoutEditorCanvas::ID_CUSTOMZOOMMENUITEM25 = wxNewId();
const long LayoutEditorCanvas::ID_CUSTOMZOOMMENUITEM10 = wxNewId();
const long LayoutEditorCanvas::ID_CUSTOMZOOMMENUITEM5 = wxNewId();
wxRibbonButtonBar * LayoutEditorCanvas::modeRibbonBar = NULL;

LayoutEditorCanvas::LayoutEditorCanvas(wxWindow* parent, gd::Project & project_,
    gd::Layout & layout_, gd::InitialInstancesContainer & instances_,
    LayoutEditorCanvasOptions & options_, gd::MainFrameWrapper & mainFrameWrapper_, gd::ExternalLayout * externalLayout_) :
    project(project_),
    layout(layout_),
    externalLayout(externalLayout_),
    instances(instances_),
    options(options_),
    mainFrameWrapper(mainFrameWrapper_),
    parentControl(parent),
    parentAuiManager(NULL),
    hScrollbar(NULL),
    vScrollbar(NULL),
    isMovingView(false),
    hasJustRightClicked(false),
    ctrlPressed(false),
    altPressed(false),
    shiftPressed(false),
    isMovingInstance(false),
    gapBetweenButtonsAndRectangle(gd::GUIContentScaleFactor::Get() > 1 ? 12 : 5),
    smallButtonSize(gd::GUIContentScaleFactor::Get() > 1 ? 12 : 5),
    firstRefresh(true),
    isSelecting(false),
    editing(true),
    enableIdleEvents(true)
{
	//(*Initialize(LayoutEditorCanvas)
	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxWANTS_CHARS, _T("wxID_ANY"));
	//*)

    //Initialization allowing to run SFML within the wxWidgets control.
    //See also LayoutEditorCanvas::OnUpdate & co.
    #ifdef __WXGTK__

        // GTK implementation requires to go deeper to find the low-level X11 identifier of the widget
        gtk_widget_realize(m_wxwindow); //Required to create the internal gtk window
        gtk_widget_set_double_buffered(m_wxwindow, false);

        GtkWidget* privHandle = m_wxwindow;
        wxPizza * pizza = WX_PIZZA(privHandle);
        GtkWidget * widget = GTK_WIDGET(pizza);

        //Get the internal gtk window...
        #if GTK_CHECK_VERSION(3, 0, 0)
        GdkWindow* win = gtk_widget_get_window(widget);
        #else
        GdkWindow* win = widget->window;
        #endif
        XFlush(GDK_WINDOW_XDISPLAY(win));

        //...and pass it to the sf::RenderWindow.
        #if GTK_CHECK_VERSION(3, 0, 0)
        sf::RenderWindow::create(GDK_WINDOW_XID(win), sf::ContextSettings(24, 8));
        #else
        sf::RenderWindow::create(GDK_WINDOW_XWINDOW(win), sf::ContextSettings(24, 8));
        #endif

    #else

        // Tested under Windows XP only (should work with X11 and other Windows versions - no idea about MacOS)
        sf::RenderWindow::create(static_cast<sf::WindowHandle>(GetHandle()), sf::ContextSettings(24, 8));

    #endif

	Connect(wxEVT_PAINT,(wxObjectEventFunction)&LayoutEditorCanvas::OnPaint);
	Connect(wxEVT_ERASE_BACKGROUND,(wxObjectEventFunction)&LayoutEditorCanvas::OnEraseBackground);
	Connect(wxEVT_IDLE,(wxObjectEventFunction)&LayoutEditorCanvas::OnIdle);
	Connect(wxEVT_LEFT_DOWN,(wxObjectEventFunction)&LayoutEditorCanvas::OnLeftDown);
	Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&LayoutEditorCanvas::OnLeftUp);
	Connect(wxEVT_LEFT_DCLICK,(wxObjectEventFunction)&LayoutEditorCanvas::OnLeftDClick);
	Connect(wxEVT_RIGHT_UP,(wxObjectEventFunction)&LayoutEditorCanvas::OnRightUp);
    Connect(wxEVT_MIDDLE_DOWN,(wxObjectEventFunction)&LayoutEditorCanvas::OnMiddleDown);
	Connect(wxEVT_MIDDLE_UP,(wxObjectEventFunction)&LayoutEditorCanvas::OnMiddleUp);
	Connect(wxEVT_MOTION,(wxObjectEventFunction)&LayoutEditorCanvas::OnMotion);
	Connect(wxEVT_KEY_DOWN,(wxObjectEventFunction)&LayoutEditorCanvas::OnKey);
	Connect(wxEVT_KEY_UP,(wxObjectEventFunction)&LayoutEditorCanvas::OnKeyUp);
	Connect(wxEVT_MOUSEWHEEL,(wxObjectEventFunction)&LayoutEditorCanvas::OnMouseWheel);
    Connect(ID_DELOBJMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnDeleteObjectSelected);
    Connect(ID_PROPMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnPropObjSelected);
    Connect(ID_AUTOMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnAddAutoObjSelected);
    Connect(ID_LAYERUPMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnLayerUpSelected);
    Connect(ID_LAYERDOWNMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnLayerDownSelected);
    Connect(ID_COPYMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnCopySelected);
    Connect(ID_CUTMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnCutSelected);
    Connect(ID_PASTEMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnPasteSelected);
    Connect(ID_PASTESPECIALMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnPasteSpecialSelected);
    Connect(ID_CREATEOBJECTMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnCreateObjectSelected);
    Connect(ID_LOCKMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnLockSelected);
    Connect(ID_UNLOCKMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnUnLockSelected);
    SetDropTarget(new LayoutEditorCanvasTextDnd(*this));

    //Generate undo menu
    {
        wxMenuItem * undo10item = new wxMenuItem(&undoMenu, idUndo10, _("Cancel 10 changes"), wxEmptyString, wxITEM_NORMAL);
        undoMenu.Append(undo10item);
        wxMenuItem * undo20item = new wxMenuItem(&undoMenu, idUndo20, _("Cancel 20 changes"), wxEmptyString, wxITEM_NORMAL);
        undoMenu.Append(undo20item);
        undoMenu.AppendSeparator();
        wxMenuItem * clearHistoryItem = new wxMenuItem(&undoMenu, idClearHistory, _("Delete the history"), wxEmptyString, wxITEM_NORMAL);
        clearHistoryItem->SetBitmap(wxImage( "res/history_clear16.png" ) );
        undoMenu.Append(clearHistoryItem);
    }

    //Prepare undo-related variables
    latestState = std::shared_ptr<gd::InitialInstancesContainer>(instances.Clone());

    //Generate zoom menu
	wxMenuItem * zoom5 = new wxMenuItem((&zoomMenu), ID_CUSTOMZOOMMENUITEM5, _("5%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom5);
	wxMenuItem * zoom10 = new wxMenuItem((&zoomMenu), ID_CUSTOMZOOMMENUITEM10, _("10%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom10);
	wxMenuItem * zoom25 = new wxMenuItem((&zoomMenu), ID_CUSTOMZOOMMENUITEM25, _("25%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom25);
	wxMenuItem * zoom50 = new wxMenuItem((&zoomMenu), ID_CUSTOMZOOMMENUITEM50, _("50%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom50);
	wxMenuItem * zoom100 = new wxMenuItem((&zoomMenu), ID_CUSTOMZOOMMENUITEM100, _("100%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom100);
	wxMenuItem * zoom150 = new wxMenuItem((&zoomMenu), ID_CUSTOMZOOMMENUITEM150, _("150%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom150);
	wxMenuItem * zoom200 = new wxMenuItem((&zoomMenu), ID_CUSTOMZOOMMENUITEM200, _("200%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom200);
	wxMenuItem * zoom500 = new wxMenuItem((&zoomMenu), ID_CUSTOMZOOMMENUITEM500, _("500%"), wxEmptyString, wxITEM_NORMAL);
	zoomMenu.Append(zoom500);

    //Generate context menu
    {
        wxMenuItem * layerUpItem = new wxMenuItem((&contextMenu), ID_LAYERUPMENU, _("Put the object(s) on the higher layer"), wxEmptyString, wxITEM_NORMAL);
        layerUpItem->SetBitmap(gd::SkinHelper::GetIcon("up", 16));
        wxMenuItem * layerDownItem = new wxMenuItem((&contextMenu), ID_LAYERDOWNMENU, _("Put the object(s) on the lower layer"), wxEmptyString, wxITEM_NORMAL);
        layerDownItem->SetBitmap(gd::SkinHelper::GetIcon("down", 16));
        wxMenuItem * deleteItem = new wxMenuItem((&contextMenu), ID_DELOBJMENU, _("Delete the selection\tDEL"), wxEmptyString, wxITEM_NORMAL);
        deleteItem->SetBitmap(gd::SkinHelper::GetIcon("delete", 16));

        contextMenu.Append(ID_PROPMENU, _("Properties"));
        contextMenu.Append(ID_AUTOMENU, _("Add a behavior to the object"));
        contextMenu.AppendSeparator();
        contextMenu.Append(ID_CREATEOBJECTMENU, _("Insert a new object"));
        contextMenu.AppendSeparator();
        contextMenu.Append(deleteItem);
        contextMenu.AppendSeparator();
        contextMenu.Append(layerUpItem);
        contextMenu.Append(layerDownItem);
        contextMenu.AppendSeparator();

        wxMenuItem * copyItem = new wxMenuItem((&contextMenu), ID_COPYMENU, _("Copy"), wxEmptyString, wxITEM_NORMAL);
        copyItem->SetBitmap(gd::SkinHelper::GetIcon("copy", 16));
        contextMenu.Append(copyItem);
        wxMenuItem * cutItem = new wxMenuItem((&contextMenu), ID_CUTMENU, _("Cut"), wxEmptyString, wxITEM_NORMAL);
        cutItem->SetBitmap(gd::SkinHelper::GetIcon("cut", 16));
        contextMenu.Append(cutItem);
        wxMenuItem * pasteItem = new wxMenuItem((&contextMenu), ID_PASTEMENU, _("Paste"), wxEmptyString, wxITEM_NORMAL);
        pasteItem->SetBitmap(gd::SkinHelper::GetIcon("paste", 16));
        contextMenu.Append(pasteItem);
        wxMenuItem * pasteSpecialItem = new wxMenuItem((&contextMenu), ID_PASTESPECIALMENU, _("Special paste"), wxEmptyString, wxITEM_NORMAL);
        contextMenu.Append(pasteSpecialItem);

        contextMenu.AppendSeparator();
        wxMenuItem * lockItem = new wxMenuItem((&contextMenu), ID_LOCKMENU, _("Lock the object(s)"), wxEmptyString, wxITEM_NORMAL);
        lockItem->SetBitmap(wxImage( "res/lockicon.png" ) );
        contextMenu.Append(lockItem);
    }

    //Generate "no object" context menu
    {
        noObjectContextMenu.Append(ID_CREATEOBJECTMENU, _("Insert a new object"));
        noObjectContextMenu.AppendSeparator();
        wxMenuItem * pasteItem = new wxMenuItem((&noObjectContextMenu), ID_PASTEMENU, _("Paste"), wxEmptyString, wxITEM_NORMAL);
        pasteItem->SetBitmap(gd::SkinHelper::GetIcon("paste", 16));
        noObjectContextMenu.Append(pasteItem);
        wxMenuItem * pasteSpecialItem = new wxMenuItem((&noObjectContextMenu), ID_PASTESPECIALMENU, _("Special paste"), wxEmptyString, wxITEM_NORMAL);
        noObjectContextMenu.Append(pasteSpecialItem);
        noObjectContextMenu.AppendSeparator();
        wxMenuItem * unlockItem = new wxMenuItem((&noObjectContextMenu), ID_UNLOCKMENU, _("Unlock the object under the cursor"), wxEmptyString, wxITEM_NORMAL);
        unlockItem->SetBitmap(wxImage( "res/lockicon.png" ) );
        noObjectContextMenu.Append(unlockItem);
    }

    //Initialize previewers
    for (std::size_t i = 0;i<project.GetUsedPlatforms().size();++i)
    {
        std::shared_ptr<gd::LayoutEditorPreviewer> previewer = project.GetUsedPlatforms()[i]->GetLayoutPreviewer(*this);
        previewers[project.GetUsedPlatforms()[i]->GetName()] = previewer;

        long id = wxNewId();
        if ( previewer )
        {
            idForPlatformsMenu[id] = project.GetUsedPlatforms()[i]->GetName();
            platformsMenu.Append(id, _("Preview for ") + project.GetUsedPlatforms()[i]->GetFullName(),
                                 _("Launch a preview for this platform"), wxITEM_RADIO);
            mainFrameWrapper.GetMainEditor()->Connect(id, wxEVT_COMMAND_MENU_SELECTED, (wxObjectEventFunction)&LayoutEditorCanvas::OnPreviewForPlatformSelected, NULL, this);
        }
        else
        {
            platformsMenu.Append(id, _("No preview available for ")+ project.GetUsedPlatforms()[i]->GetFullName(), _("No preview can be done for this platform"), wxITEM_RADIO);
            platformsMenu.Enable(id, false);
        }

        platformsMenu.Check(id, false);
        if ( &project.GetCurrentPlatform() == project.GetUsedPlatforms()[i] )
        {
            currentPreviewer = previewer;
            platformsMenu.Check(id, true);
        }
    }

    setFramerateLimit(30);
    editionView.setCenter( (project.GetMainWindowDefaultWidth()/2),(project.GetMainWindowDefaultHeight()/2));
    RecreateRibbonToolbar();
    UpdateModeButtonsState();
}

LayoutEditorCanvas::~LayoutEditorCanvas()
{
	//(*Destroy(LayoutEditorCanvas)
	//*)
}

void LayoutEditorCanvas::OnIdle(wxIdleEvent & event)
{
    if(enableIdleEvents)
    {
        // Send a paint message when the control is idle, to ensure maximum framerate
        Refresh();
        #if defined(__WXGTK__)
        event.RequestMore(); //On GTK, we need to specify that we want continuous idle events.
        #endif
    }
}

void LayoutEditorCanvas::OnPaint(wxPaintEvent&)
{
    // Make sure the control is able to be repainted
    wxPaintDC Dc(this);
    OnUpdate();
}

void LayoutEditorCanvas::OnEraseBackground(wxEraseEvent&) {}

void LayoutEditorCanvas::AddAssociatedEditor(gd::LayoutEditorCanvasAssociatedEditor * editor)
{
    if (!editor) return;

    associatedEditors.insert(editor);
}

void LayoutEditorCanvas::ConnectEvents()
{
    if (!editing && currentPreviewer) currentPreviewer->ConnectPreviewRibbonToolsEvents();

    mainFrameWrapper.GetMainEditor()->Connect(idRibbonEditMode, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&LayoutEditorCanvas::OnEditionBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonPreviewMode, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&LayoutEditorCanvas::OnPreviewBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonPreviewMode, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, (wxObjectEventFunction)&LayoutEditorCanvas::OnPreviewDropDownBtClick, NULL, this);
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
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonOrigine, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&LayoutEditorCanvas::OnOrigineBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonOriginalZoom, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&LayoutEditorCanvas::OnZoomInitBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonOriginalZoom, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, (wxObjectEventFunction)&LayoutEditorCanvas::OnZoomMoreBtClick, NULL, this);
	mainFrameWrapper.GetMainEditor()->Connect(ID_CUSTOMZOOMMENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnCustomZoom5Selected, NULL, this);
	mainFrameWrapper.GetMainEditor()->Connect(ID_CUSTOMZOOMMENUITEM10,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnCustomZoom10Selected, NULL, this);
	mainFrameWrapper.GetMainEditor()->Connect(ID_CUSTOMZOOMMENUITEM25,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnCustomZoom25Selected, NULL, this);
	mainFrameWrapper.GetMainEditor()->Connect(ID_CUSTOMZOOMMENUITEM50,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnCustomZoom50Selected, NULL, this);
	mainFrameWrapper.GetMainEditor()->Connect(ID_CUSTOMZOOMMENUITEM100,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnCustomZoom100Selected, NULL, this);
	mainFrameWrapper.GetMainEditor()->Connect(ID_CUSTOMZOOMMENUITEM150,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnCustomZoom150Selected, NULL, this);
	mainFrameWrapper.GetMainEditor()->Connect(ID_CUSTOMZOOMMENUITEM200,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnCustomZoom200Selected, NULL, this);
	mainFrameWrapper.GetMainEditor()->Connect(ID_CUSTOMZOOMMENUITEM500,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&LayoutEditorCanvas::OnCustomZoom500Selected, NULL, this);
}

void LayoutEditorCanvas::OnGuiElementHovered(const gd::LayoutEditorCanvasGuiElement & guiElement)
{
    UpdateMouseResizeCursor(guiElement.name);
}

void LayoutEditorCanvas::OnGuiElementPressed(const gd::LayoutEditorCanvasGuiElement & guiElement)
{
    if ( currentDraggableBt.empty() && guiElement.name.substr(0, 6) == "resize" )
    {
        currentDraggableBt = guiElement.name;

        resizeOriginalWidths.clear();
        resizeOriginalHeights.clear();
        for (auto & it : selectedInstances)
        {
            it.second.x = it.first->GetX(); it.second.y = it.first->GetY();

            if ( it.first->HasCustomSize() ) {
                resizeOriginalWidths[it.first] = it.first->GetCustomWidth();
                resizeOriginalHeights[it.first] = it.first->GetCustomHeight();
            }
            else {
                gd::Object * associatedObject = GetObjectLinkedToInitialInstance(*(it.first));
                if ( associatedObject )
                {
                    sf::Vector2f size = associatedObject->GetInitialInstanceDefaultSize(*(it.first), project, layout);
                    resizeOriginalWidths[it.first] = size.x;
                    resizeOriginalHeights[it.first] = size.y;
                }
            }
        }
        resizeMouseStartPosition = sf::Vector2f(GetMouseXOnLayout(), GetMouseYOnLayout());
    }
    else if ( currentDraggableBt.empty() && guiElement.name == "angle" )
    {
        currentDraggableBt = "angle";
    }
}

void LayoutEditorCanvas::OnGuiElementReleased(const gd::LayoutEditorCanvasGuiElement & guiElement)
{
}

void LayoutEditorCanvas::OnPreviewForPlatformSelected( wxCommandEvent & event )
{
    gd::String platformName = idForPlatformsMenu[event.GetId()];
    currentPreviewer = previewers[platformName];

    wxCommandEvent useless;
    OnPreviewBtClick(useless);
}

void LayoutEditorCanvas::UpdateModeButtonsState()
{
    if (!modeRibbonBar) return;

    modeRibbonBar->EnableButton(idRibbonEditMode, !editing);
    modeRibbonBar->EnableButton(idRibbonPreviewMode, editing);
}

/**
 * Go in preview mode
 */
void LayoutEditorCanvas::OnPreviewBtClick( wxCommandEvent & event )
{
    LaunchPreview();
}

void LayoutEditorCanvas::LaunchPreview()
{
    if ( !editing ) return;

    if ( !currentPreviewer ) {
        gd::LogMessage(_("This platform does not support launching previews."));
        return;
    }

    editing = false;

    if (!currentPreviewer->LaunchPreview())
    {
        //Do not go into preview state if LaunchPreview returned false
        //( Some platforms can launch a program and do not display the preview in the editor. )
        editing = true;
        wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());
        return;
    }

    std::cout << "Switching to preview mode..." << std::endl;

    UpdateModeButtonsState();
    UpdateSize();
    UpdateScrollbars();

    //Let the IDE go into to preview state
    //Note: Working directory is changed later, just before loading the layout
    mainFrameWrapper.LockShortcuts(this);
    mainFrameWrapper.DisableControlsForScenePreviewing();
    for (auto & it : associatedEditors)
        it->Enable(false);

    wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());
    RecreateRibbonToolbar();
    currentPreviewer->ConnectPreviewRibbonToolsEvents();
    hScrollbar->Show(false);
    vScrollbar->Show(false);
    SetFocus();

    if ( wxDirExists(wxFileName::FileName(project.GetProjectFile()).GetPath()))
        wxSetWorkingDirectory(wxFileName::FileName(project.GetProjectFile()).GetPath());
}

/**
 * Go in edition mode
 */
void LayoutEditorCanvas::OnEditionBtClick( wxCommandEvent & event )
{
    if ( editing ) return;
    std::cout << "Switching to editing mode..." << std::endl;
    editing = true;

    //Notice the previewer it must stop preview.
    if ( currentPreviewer ) currentPreviewer->StopPreview();

    //Let the IDE go back to edition state
    UpdateModeButtonsState();
    UpdateSize();
    UpdateScrollbars();
    ReloadResources();
    wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());

    mainFrameWrapper.UnLockShortcuts(this);
    mainFrameWrapper.EnableControlsAfterScenePreviewing();
    for (auto & it : associatedEditors)
        it->Enable();

    RecreateRibbonToolbar();
    hScrollbar->Show(true);
    vScrollbar->Show(true);
}

wxRibbonButtonBar* LayoutEditorCanvas::CreateRibbonPage(wxRibbonPage * page)
{
    bool hideLabels = false;
    wxConfigBase::Get()->Read( _T( "/Skin/HideLabels" ), &hideLabels );

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Mode"), SkinHelper::GetRibbonIcon("preview"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        modeRibbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        modeRibbonBar->AddButton(idRibbonEditMode, !hideLabels ? _("Stop the preview") : gd::String(), SkinHelper::GetRibbonIcon("edit"), _("Stop the preview and go back to editing"));
        modeRibbonBar->AddButton(idRibbonPreviewMode, !hideLabels ? _("Preview") : gd::String(), SkinHelper::GetRibbonIcon("preview"), _("Launch a preview"), wxRIBBON_BUTTON_HYBRID);
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Editors"), SkinHelper::GetRibbonIcon("preview"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonObjectsEditor, !hideLabels ? _("Objects editor") : gd::String(), gd::SkinHelper::GetRibbonIcon("objects"), _("Show the list of objects of the scene"));
        ribbonBar->AddButton(idRibbonLayersEditor, !hideLabels ? _("Layers editor") : gd::String(), gd::SkinHelper::GetRibbonIcon("layers"), _("Show the layers editor"));
    }

    wxRibbonPanel *toolsPanel = new wxRibbonPanel(page, wxID_ANY, _("Tools"), SkinHelper::GetRibbonIcon("tools"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
    wxRibbonButtonBar * ribbonToolbar = new wxRibbonButtonBar(toolsPanel, wxID_ANY);

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Help"), SkinHelper::GetRibbonIcon("help"), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonHelp, !hideLabels ? _("Help") : gd::String(), SkinHelper::GetRibbonIcon("help"));
    }

    return ribbonToolbar;
}

void LayoutEditorCanvas::RecreateRibbonToolbar()
{
    wxRibbonButtonBar * toolsBar = mainFrameWrapper.GetRibbonSceneEditorButtonBar();
    toolsBar->ClearButtons();

    if ( editing )
        CreateEditionRibbonTools();
    else
    {
        if (currentPreviewer) currentPreviewer->CreatePreviewRibbonTools(*toolsBar);
    }

    toolsBar->Realize();
    if (onRibbonButtonBarUpdatedCb) onRibbonButtonBarUpdatedCb(toolsBar);
}

void LayoutEditorCanvas::CreateEditionRibbonTools()
{
    bool hideLabels = false;
    wxConfigBase::Get()->Read( _T( "/Skin/HideLabels" ), &hideLabels );

    wxRibbonButtonBar * ribbonToolbar = mainFrameWrapper.GetRibbonSceneEditorButtonBar();
    ribbonToolbar->AddButton(idRibbonObjectsPositionList, !hideLabels ? _("Instances") : gd::String(), gd::SkinHelper::GetRibbonIcon("ObjectsPositionsList"), _("Open a list of all instances of objects put on the scene"));
    ribbonToolbar->AddHybridButton(idRibbonUndo, !hideLabels ? _("Undo") : gd::String(), gd::SkinHelper::GetRibbonIcon("undo"), _("Undo the last change"));
    ribbonToolbar->AddButton(idRibbonRedo, !hideLabels ? _("Redo") : gd::String(), gd::SkinHelper::GetRibbonIcon("redo"));
    ribbonToolbar->AddButton(idRibbonGrid, !hideLabels ? _("Grid") : gd::String(), gd::SkinHelper::GetRibbonIcon("grid"));
    ribbonToolbar->AddButton(idRibbonGridSetup, !hideLabels ? _("Edit the grid") : gd::String(), gd::SkinHelper::GetRibbonIcon("gridedit"), _("Edit the size of the grid"));
    ribbonToolbar->AddButton(idRibbonWindowMask, !hideLabels ? _("Mask") : gd::String(), gd::SkinHelper::GetRibbonIcon("windowMask"), _("Show a mask corresponding to the size of the game window"));
    ribbonToolbar->AddButton(idRibbonOrigine, !hideLabels ? _("Return to the initial position ( 0;0 )") : gd::String(), gd::SkinHelper::GetRibbonIcon("center"), _("Go back to the origin of the scene"));
    ribbonToolbar->AddHybridButton(idRibbonOriginalZoom, !hideLabels ? _("Initial zoom") : gd::String(), gd::SkinHelper::GetRibbonIcon("zoom"), _("Go back to the initial zoom level"));
}

void LayoutEditorCanvas::UpdateContextMenu()
{
    if ( selectedInstances.empty() ) return;

    //Can we send the objects on a higher layer ?
    std::size_t highestLayer = 0;
    for (auto & it : selectedInstances)
    {
        if (it.first == NULL) continue;
        highestLayer = std::max(highestLayer, layout.GetLayerPosition(it.first->GetLayer()));
    }

    //Can we send the objects on a lower layer ?
    std::size_t lowestLayer = layout.GetLayersCount()-1;
    for (auto & it : selectedInstances)
    {
        if (it.first == NULL) continue;
        lowestLayer = std::min(lowestLayer, layout.GetLayerPosition(it.first->GetLayer()));
    }

    if (wxMenuItem * layerUpItem = contextMenu.FindItem(ID_LAYERUPMENU))
    {
        layerUpItem->Enable(false);
        if ( highestLayer+1 < layout.GetLayersCount() )
        {
            gd::String name = layout.GetLayer(highestLayer+1).GetName();
            if ( name == "" ) name = _("Base layer");
            layerUpItem->Enable(true);
            layerUpItem->SetItemLabel(_("Put the object(s) on the layer \"") + name + "\"");
        }
    }

    if (wxMenuItem * layerDownItem = contextMenu.FindItem(ID_LAYERDOWNMENU))
    {
        layerDownItem->Enable(false);
        if ( lowestLayer >= 1 )
        {
            gd::String name = layout.GetLayer(lowestLayer-1).GetName();
            if ( name == "" ) name = _("Base layer");

            layerDownItem->Enable(true);
            layerDownItem->SetItemLabel(_("Put the object(s) on the layer \"") + name + "\"");
        }
    }
}

void LayoutEditorCanvas::OnLayerUpSelected(wxCommandEvent & event)
{
    std::size_t lowestLayer = layout.GetLayersCount()-1;
    for (auto & it : selectedInstances)
    {
        if (it.first == NULL) continue;
        lowestLayer = std::min(lowestLayer, layout.GetLayerPosition(it.first->GetLayer()));
    }

    if ( lowestLayer+1 < layout.GetLayersCount() ) SendSelectionToLayer(layout.GetLayer(lowestLayer+1).GetName());
}

void LayoutEditorCanvas::OnLayerDownSelected(wxCommandEvent & event)
{
    std::size_t highestLayer = 0;
    for (auto & it : selectedInstances)
    {
        if (it.first == NULL) continue;
        highestLayer = std::max(highestLayer, layout.GetLayerPosition(it.first->GetLayer()));
    }

    if ( highestLayer >= 1 ) SendSelectionToLayer(layout.GetLayer(highestLayer-1).GetName());
}

void LayoutEditorCanvas::SendSelectionToLayer(const gd::String & newLayerName)
{
    for (auto & it : selectedInstances)
    {
        if (it.first == NULL) continue;

        it.first->SetLayer(newLayerName);
    }

    ChangesMade();
    for (auto & it : associatedEditors)
        it->InitialInstancesUpdated();
}

void LayoutEditorCanvas::OnPropObjSelected(wxCommandEvent & event)
{
    parentAuiManager->GetPane("PROPERTIES").Show();
    parentAuiManager->Update();
}

void LayoutEditorCanvas::OnAddAutoObjSelected(wxCommandEvent & event)
{
    std::vector<gd::InitialInstance*> selection = GetSelection();
    if (selection.empty()) return;

    gd::Object * object = GetObjectLinkedToInitialInstance(*selection[0]);
    bool globalObject = false;
    for (std::size_t i = 0;i<project.GetObjectsCount();++i)
    {
        if ( &project.GetObject(i) == object )
        {
            globalObject = true;
            break;
        }
    }

    gd::ChooseBehaviorTypeDialog::ChooseAndAddBehaviorToObject(this, project,
        object, &layout, globalObject);

    //Show the properties panel and ensure other editors are refreshed:
    parentAuiManager->GetPane("PROPERTIES").Show();
    parentAuiManager->Update();

    for (auto & it : associatedEditors)
        it->InitialInstancesUpdated();
}

void LayoutEditorCanvas::AddObject(const gd::String & objectName)
{
    AddObject(objectName, GetMouseXOnLayout(), GetMouseYOnLayout());
}

void LayoutEditorCanvas::AddObject(const gd::String & objectName, float x, float y)
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
    gd::HighestZOrderFinder zOrderFinder;
    zOrderFinder.RestrictSearchToLayer(currentLayer);
    instances.IterateOverInstances(zOrderFinder);
    newInstance.SetZOrder(zOrderFinder.GetHighestZOrder()+1);

    //Notify sub editors
    for (std::set<LayoutEditorCanvasAssociatedEditor*>::iterator it = associatedEditors.begin();it !=associatedEditors.end();++it)
        (*it)->InitialInstancesUpdated();
    ChangesMade();

    ReloadResources();
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
    for (std::size_t i = 0;i<guiElements.size();++i)
    {
        if ( guiElements[i].area.Contains(wxPoint(sf::Mouse::getPosition(*this).x, sf::Mouse::getPosition(*this).y)) )
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

            if (!isMovingInstance && ctrlPressed) //Clone objects
            {
                std::vector < InitialInstance* > selection = GetSelection();
                for (std::size_t i = 0;i<selection.size();++i)
                    instances.InsertInitialInstance(*selection[i]);

                for (std::set<LayoutEditorCanvasAssociatedEditor*>::iterator it = associatedEditors.begin();it !=associatedEditors.end();++it)
                    (*it)->InitialInstancesUpdated();
            }

            isMovingInstance = true;
        }

        oldMouseX = mouseX; //Remember the old position of the cursor for
        oldMouseY = mouseY; //use during the next event.
    }
}

void LayoutEditorCanvas::OnRightUp( wxMouseEvent &event )
{
    if ( !editing ) return;


    //Check if an instance is selected
    {
        gd::InitialInstance * instance = GetInitialInstanceUnderCursor();

        double mouseX = GetMouseXOnLayout();
        double mouseY = GetMouseYOnLayout();
        oldMouseX = mouseX; //Remember the old position of the cursor for
        oldMouseY = mouseY; //use during the next event.

        //Check if we must unselect all the objects
        if ( !shiftPressed && //Check that shift is not pressed
            ( instance == NULL || //If no object is clicked
              selectedInstances.find(instance) == selectedInstances.end()) ) //Or an object which is not currently selected.
        {
            ClearSelection();
        }

        //Display the appropriate context menu
        if ( instance != NULL )
        {
            SelectInstance(instance);
            OnUpdate(); //So as to display selection rectangle for the newly selected object
            UpdateContextMenu();
            PopupMenu(&contextMenu);
        }
        else
        {
            //Check if there is locked instance under the cursor.
            gd::InitialInstance * instance = GetInitialInstanceUnderCursor(/*pickOnlyLockedInstances=*/true);
            noObjectContextMenu.Enable(ID_UNLOCKMENU, instance != NULL);

            PopupMenu(&noObjectContextMenu);
        }

    }
}

void LayoutEditorCanvas::ClearSelection()
{
    selectedInstances.clear();
    for (auto & it : associatedEditors)
        it->DeselectedAllInitialInstance();
}

void LayoutEditorCanvas::SelectInstance(InitialInstance * instance)
{
    if ( !instance ) return;

    selectedInstances[instance] = wxRealPoint(instance->GetX(), instance->GetY());
    for (auto & it : associatedEditors)
        it->SelectedInitialInstance(*instance);
}

void LayoutEditorCanvas::UnselectInstance(InitialInstance * instance)
{
    if ( !instance ) return;

    selectedInstances.erase(instance);
    for (auto & it : associatedEditors)
        it->DeselectedInitialInstance(*instance);
}

void LayoutEditorCanvas::DeleteInstances(std::vector<InitialInstance *> instancesToDelete)
{
    for (std::size_t i = 0;i<instancesToDelete.size();++i)
    {
        if (instancesToDelete[i] == NULL ) continue;

        instances.RemoveInstance(*instancesToDelete[i]);

        if ( selectedInstances.find(instancesToDelete[i]) != selectedInstances.end()) selectedInstances.erase(instancesToDelete[i]);
    }

    for (std::set<LayoutEditorCanvasAssociatedEditor*>::iterator it = associatedEditors.begin();it !=associatedEditors.end();++it)
        (*it)->InitialInstancesUpdated();
}

/** \brief Tool class collecting in a list all the instances that are inside the selectionRectangle of the layout editor canvas.
 */
class InstancesInAreaPicker : public gd::InitialInstanceFunctor
{
public:
    InstancesInAreaPicker(const LayoutEditorCanvas & editor_) : editor(editor_), ignoreLockedInstances(false) {};
    virtual ~InstancesInAreaPicker() {};

    virtual void operator()(gd::InitialInstance & instance)
    {
        if ( ignoreLockedInstances && instance.IsLocked() ) return;
        if ( excludedLayers.find(instance.GetLayer()) != excludedLayers.end() ) return;

        sf::Vector2f size = editor.GetInitialInstanceSize(instance);
        sf::Vector2f origin = editor.GetInitialInstanceOrigin(instance);

        if ( editor.selectionRectangle.Contains(instance.GetX()-origin.x, instance.GetY()-origin.y) &&
             editor.selectionRectangle.Contains(instance.GetX()-origin.x+size.x,
                                                instance.GetY()-origin.y+size.y) )
        {
            selectedList.push_back(&instance);
        }
    }

    std::vector<InitialInstance*> & GetSelectedList() { return selectedList; }
    InstancesInAreaPicker & IgnoreLockedInstances() { ignoreLockedInstances = true; return *this; }
    InstancesInAreaPicker & ExcludeLayer(const gd::String & layerName) {
        excludedLayers.insert(layerName);
        return *this;
    }

private:
    const LayoutEditorCanvas & editor;
    std::vector<InitialInstance*> selectedList; ///< This list will be filled with the instances that are into the selectionRectangle
    bool ignoreLockedInstances;
    std::set<gd::String> excludedLayers;
};

void LayoutEditorCanvas::OnLeftUp(wxMouseEvent &)
{
    if ( !editing ) return;

    if ( !currentDraggableBt.empty() ) //First check if we were dragging a button.
    {
        currentDraggableBt.clear();

        if ( currentDraggableBt.substr(0, 6) == "resize" ) //Handle the release of resize buttons here ( as the mouse if not necessarily on the button so OnGuiButtonReleased is not called )
        {
            for (auto & it : selectedInstances)
            {
                it.second.x = it.first->GetX();
                it.second.y = it.first->GetY();
            }
        }
        return;
    }

    //Check if there is a click released on a gui element inside the layout
    for (std::size_t i = 0;i<guiElements.size();++i)
    {
        if ( guiElements[i].area.Contains(wxPoint(sf::Mouse::getPosition(*this).x, sf::Mouse::getPosition(*this).y)) )
        {
            OnGuiElementReleased(guiElements[i]);
            return;
        }
    }

    if ( isMovingInstance )
    {
        bool changesMade = false;
        for (auto & it : selectedInstances)
        {
            //Update the member containing the "start" position of the instances.
            if (it.second.x != it.first->GetX() || it.second.y != it.first->GetY())
            {
                it.second.x = it.first->GetX();
                it.second.y = it.first->GetY();
                changesMade = true;
            }
        }

        if (changesMade)
        {
            ChangesMade();

            for (auto & it : associatedEditors)
                it->InitialInstancesUpdated();
        }
        isMovingInstance = false;
    }

    //Select object thanks to the selection area
    if (isSelecting)
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
        InstancesInAreaPicker picker(*this);
        for(auto hiddenLayer : gd::GetHiddenLayers(layout))
            picker.ExcludeLayer(hiddenLayer);
        picker.IgnoreLockedInstances();
        instances.IterateOverInstances(picker);

        for ( std::size_t i = 0; i<picker.GetSelectedList().size();++i)
            SelectInstance(picker.GetSelectedList()[i]);

        isSelecting = false;
    }
}

void LayoutEditorCanvas::OnMotion(wxMouseEvent &)
{
    if (!editing) return;

    auto preserveWidthRatio = [this](gd::InitialInstance * instance) {
        auto ratio = resizeOriginalHeights[instance] / resizeOriginalWidths[instance];
        instance->SetCustomWidth(instance->GetCustomHeight() / ratio);
    };
    auto preserveHeightRatio = [this](gd::InitialInstance * instance) {
        auto ratio = resizeOriginalHeights[instance] / resizeOriginalWidths[instance];
        instance->SetCustomHeight(instance->GetCustomWidth() * ratio);
    };
    auto ensureHasCustomHeight = [this](gd::InitialInstance * instance) {
        if (instance->HasCustomSize()) return;
        instance->SetHasCustomSize(true);
        instance->SetCustomHeight(resizeOriginalHeights[instance]);
    };
    auto ensureHasCustomWidth = [this](gd::InitialInstance * instance) {
        if (instance->HasCustomSize()) return;
        instance->SetHasCustomSize(true);
        instance->SetCustomWidth(resizeOriginalWidths[instance]);
    };
    auto snapCoordinates = [this](double & x, double & y) {
        if (!options.grid || !options.snap) return;

        x = gd::Round((x-options.gridOffsetX) / options.gridWidth) * options.gridWidth + options.gridOffsetX;
        y = gd::Round((y-options.gridOffsetY) / options.gridHeight) * options.gridHeight + options.gridOffsetY;
    };
    auto snapWidth = [this](double width) {
        if (!options.grid || !options.snap) return width;
        return (double)gd::Round(width / options.gridWidth) * options.gridWidth;
    };
    auto snapHeight = [this](double height) {
        if (!options.grid || !options.snap) return height;
        return (double)gd::Round(height / options.gridHeight) * options.gridWidth;
    };

    //First check if we're using a resize button
    if ( currentDraggableBt.substr(0,6) == "resize")
    {
        auto mouseX = GetMouseXOnLayout();
        auto mouseY = GetMouseYOnLayout();

        if ( currentDraggableBt == "resizeRight" || currentDraggableBt == "resizeRightUp" || currentDraggableBt == "resizeRightDown" )
        {
            for (auto & it : selectedInstances)
            {
                auto newWidth = snapWidth(resizeOriginalWidths[it.first] + mouseX - resizeMouseStartPosition.x);
                if (newWidth < 0) continue;

                ensureHasCustomHeight(it.first);
                it.first->SetCustomWidth(newWidth);
                if (shiftPressed) preserveHeightRatio(it.first);
            }
        }
        if ( currentDraggableBt == "resizeDown" || currentDraggableBt == "resizeRightDown" || currentDraggableBt == "resizeLeftDown" )
        {
            for (auto & it : selectedInstances)
            {
                auto newHeight = snapHeight(resizeOriginalHeights[it.first] + mouseY - resizeMouseStartPosition.y);
                if (newHeight < 0) continue;

                ensureHasCustomWidth(it.first);
                it.first->SetCustomHeight(newHeight);
                if (shiftPressed) preserveWidthRatio(it.first);
            }
        }
        if ( currentDraggableBt == "resizeLeft" || currentDraggableBt == "resizeLeftUp" || currentDraggableBt == "resizeLeftDown" )
        {
            for (auto & it : selectedInstances)
            {
                auto newWidth = snapWidth(resizeOriginalWidths[it.first] - mouseX + resizeMouseStartPosition.x);
                if (newWidth < 0) continue;

                ensureHasCustomHeight(it.first);
                it.first->SetCustomWidth(newWidth);
                it.first->SetX(it.second.x + mouseX - resizeMouseStartPosition.x);

                if (shiftPressed) preserveHeightRatio(it.first);
            }
        }
        if ( currentDraggableBt == "resizeUp" || currentDraggableBt == "resizeLeftUp" || currentDraggableBt == "resizeRightUp" )
        {
            for (auto & it : selectedInstances)
            {
                auto newHeight = snapHeight(resizeOriginalHeights[it.first] - mouseY + resizeMouseStartPosition.y);
                if (newHeight < 0) continue;

                ensureHasCustomWidth(it.first);
                it.first->SetCustomHeight(newHeight);
                it.first->SetY(it.second.y + mouseY - resizeMouseStartPosition.y);

                if (shiftPressed) preserveWidthRatio(it.first);
            }
        }

        UpdateMouseResizeCursor(currentDraggableBt);
    }
    else if (currentDraggableBt == "angle") //Check if we are dragging a angle button
    {
        for ( auto & it : selectedInstances)
        {
            float newAngle = atan2(sf::Mouse::getPosition(*this).y-angleButtonCenter.y, sf::Mouse::getPosition(*this).x-angleButtonCenter.x)*180/3.14159;
            if (shiftPressed) newAngle = gd::Round(newAngle / 15.0) * 15.0;
            it.first->SetAngle(newAngle);
        }

        UpdateMouseResizeCursor(currentDraggableBt);
    }
    else //No buttons being used
    {
        //Moving using middle click
        if ( isMovingView )
        {
            float zoomFactor = static_cast<float>(getSize().x)/editionView.getSize().x;

            editionView.setCenter( movingViewStartPosition + (movingViewMouseStartPosition - sf::Vector2f(sf::Mouse::getPosition(*this)))/zoomFactor );
        }

        double mouseX = GetMouseXOnLayout();
        double mouseY = GetMouseYOnLayout();

        gd::LogStatus( wxString::Format(  wxString(_( "Position %f;%f. Hold SHIFT to select multiple items, and right-click for more options." )),
            mouseX, mouseY ));

        //Check if there is a gui element hovered inside the layout
        bool hoveringSomething = false;
        for (std::size_t i = 0;i<guiElements.size();++i)
        {
            if ( guiElements[i].area.Contains(wxPoint(sf::Mouse::getPosition(*this).x, sf::Mouse::getPosition(*this).y)) ) {
                OnGuiElementHovered(guiElements[i]);
                hoveringSomething = true;
            }
        }

        //Ensure cursor returns to the default cursor on wxGTK
        if (!hoveringSomething && !isMovingView)
            SetCursor(wxNullCursor);

        if ( isMovingInstance )
        {
            //Get the displacement of the cursor
            double deltaX = mouseX - oldMouseX;
            double deltaY = mouseY - oldMouseY;

            for (auto & it : selectedInstances)
            {
                //Compute new position
                double newX = it.second.x + deltaX;
                double newY = it.second.y + deltaY;
                snapCoordinates(newX, newY);

                //Move the initial instance
                it.first->SetX(newX);
                it.first->SetY(newY);
            }
        }
        if ( isSelecting )
        {
            selectionRectangle.SetBottomRight(wxPoint(mouseX, mouseY));
        }
    }
}

void LayoutEditorCanvas::OnMiddleDown(wxMouseEvent &)
{
    if ( !editing ) return;

    //User can move the view thanks to middle click
    isMovingView = true;
    movingViewMouseStartPosition = sf::Vector2f(sf::Mouse::getPosition(*this));
    movingViewStartPosition = getView().getCenter();
    SetCursor(wxCursor(wxCURSOR_SIZING));
}

void LayoutEditorCanvas::OnMiddleUp(wxMouseEvent & event)
{
    if ( !editing ) return;

    isMovingView = false;
    SetCursor(wxNullCursor);
}

void LayoutEditorCanvas::OnLeftDClick( wxMouseEvent &event )
{
    if ( !editing ) return;

    parentAuiManager->GetPane("PROPERTIES").Show();
    parentAuiManager->Update();
}

void LayoutEditorCanvas::OnKey( wxKeyEvent& evt )
{
    if (!editing)
    {
        evt.StopPropagation();
        return;
    }

    bool eventIsOnlyForMe = false;

    if ( evt.GetKeyCode() == WXK_CONTROL )
        ctrlPressed = true;
    if ( evt.GetKeyCode() == WXK_SHIFT )
        shiftPressed = true;
    if ( evt.GetKeyCode() == WXK_ALT )
        altPressed = true;

    if ( evt.GetKeyCode() == WXK_DELETE || evt.GetKeyCode() == WXK_BACK )
    {
        std::vector<InitialInstance*> instancesToDelete;
        for (auto & it : selectedInstances)
            instancesToDelete.push_back(it.first);

        DeleteInstances(instancesToDelete);

        ClearSelection();
        ChangesMade();
        eventIsOnlyForMe = true;
    }
    else if ( evt.GetKeyCode() == WXK_DOWN )
    {
        for (auto & it : selectedInstances)
            it.first->SetY(it.first->GetY()+1);

        eventIsOnlyForMe = true;
    }
    else if ( evt.GetKeyCode() == WXK_UP )
    {
        for (auto & it : selectedInstances)
            it.first->SetY(it.first->GetY()-1);

        eventIsOnlyForMe = true;
    }
    else if ( evt.GetKeyCode() == WXK_RIGHT )
    {
        for (auto & it : selectedInstances)
            it.first->SetX(it.first->GetX()+1);

        eventIsOnlyForMe = true;
    }
    else if ( evt.GetKeyCode() == WXK_LEFT )
    {
        for (auto & it : selectedInstances)
            it.first->SetX(it.first->GetX()-1);

        eventIsOnlyForMe = true;
    }
    else if ( evt.GetModifiers() == wxMOD_CMD ) //Ctrl-xxx
    {
        switch ( evt.GetKeyCode() )
        {
            case 89: //Ctrl-Y
            {
                Redo();
                break;
            }
            case 90: //Ctrl-Z
            {
                Undo();
                break;
            }
            default:
                break;
        }
    }

    if (eventIsOnlyForMe)
        evt.StopPropagation();
    else
        evt.Skip(); //Not a shortcut managed here, let the event propagates to the parent.
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
    if ( evt.GetKeyCode() == WXK_ALT )
        altPressed = false;
}

void LayoutEditorCanvas::ChangesMade()
{
    history.push_back(std::shared_ptr<gd::InitialInstancesContainer>(latestState->Clone()));
    redoHistory.clear();
    latestState->Create(instances);
    project.SetDirty();
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
        if ( excludedLayers.find(instance.GetLayer()) != excludedLayers.end() ) return;

        sf::Vector2f size = editor.GetInitialInstanceSize(instance);
        sf::Vector2f origin = editor.GetInitialInstanceOrigin(instance);

        wxRect2DDouble boundingBox(instance.GetX()-origin.x, instance.GetY()-origin.y, size.x, size.y);

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
    void ExcludeLayer(const gd::String & layerName) { excludedLayers.insert(layerName); }

private:
    const LayoutEditorCanvas & editor;
    InitialInstance * smallestInstance;
    double smallestInstanceArea;
    const double xPosition;
    const double yPosition;
    bool pickLockedOnly;
    std::set<gd::String> excludedLayers;
};

InitialInstance * LayoutEditorCanvas::GetInitialInstanceAtPosition(double xPosition, double yPosition, bool pickOnlyLockedInstances)
{
    SmallestInstanceUnderCursorPicker picker(*this, xPosition, yPosition);

    for(auto hiddenLayer : gd::GetHiddenLayers(layout))
        picker.ExcludeLayer(hiddenLayer);
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
    GridSetupDialog dialog(this, options.gridWidth, options.gridHeight, options.gridOffsetX, options.gridOffsetY, options.snap, options.gridR, options.gridG, options.gridB);
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

void LayoutEditorCanvas::Undo(std::size_t times)
{
    for (std::size_t i = 0;i<times;++i)
    {
        if ( history.empty() ) return;

        redoHistory.push_back(std::shared_ptr<gd::InitialInstancesContainer>(instances.Clone()));
        instances.Create(*history.back());
        history.pop_back();

        latestState = std::shared_ptr<gd::InitialInstancesContainer>(instances.Clone());
    }
}

void LayoutEditorCanvas::OnClearHistorySelected(wxCommandEvent& event)
{
    if (wxMessageBox(_("Are you sure you want to clear the Undo History?"), "Clear the history",wxYES_NO ) != wxYES)
        return;

    history.clear();
    redoHistory.clear();
}

void LayoutEditorCanvas::Redo( std::size_t times )
{
    for (std::size_t i = 0;i<times;++i)
    {
        if ( redoHistory.empty() ) return;

        history.push_back(std::shared_ptr<gd::InitialInstancesContainer>(instances.Clone()));
        instances.Create(*redoHistory.back());
        redoHistory.pop_back();

        latestState = std::shared_ptr<gd::InitialInstancesContainer>(instances.Clone());
    }
}

void LayoutEditorCanvas::OnRedoBtClick( wxCommandEvent & event )
{
    Redo();
}

/**
 * Toggle GDevelop full screen mode.
 */
void LayoutEditorCanvas::OnFullScreenBtClick(wxCommandEvent & event)
{
    if (!mainFrameWrapper.GetMainEditor()->IsFullScreen())
        mainFrameWrapper.GetMainEditor()->ShowFullScreen(true, wxFULLSCREEN_NOBORDER | wxFULLSCREEN_NOCAPTION);
    else
        mainFrameWrapper.GetMainEditor()->ShowFullScreen(false);
}

double LayoutEditorCanvas::GetMouseXOnLayout() const
{
    return mapPixelToCoords(sf::Mouse::getPosition(*this), editionView).x;
}

double LayoutEditorCanvas::GetMouseYOnLayout() const
{
    return mapPixelToCoords(sf::Mouse::getPosition(*this), editionView).y;
}

sf::Vector2f LayoutEditorCanvas::GetInitialInstanceSize(gd::InitialInstance & instance) const
{
    if (instance.HasCustomSize()) return sf::Vector2f(instance.GetCustomWidth(), instance.GetCustomHeight());

    gd::Object * object = GetObjectLinkedToInitialInstance(instance);
    if ( object ) return object->GetInitialInstanceDefaultSize(instance, project, layout);

    return sf::Vector2f(32,32);
}

sf::Vector2f LayoutEditorCanvas::GetInitialInstanceOrigin(gd::InitialInstance & instance) const
{
    gd::Object * object = GetObjectLinkedToInitialInstance(instance);
    if ( object ) return object->GetInitialInstanceOrigin(instance, project, layout);

    return sf::Vector2f(0,0);
}

gd::Object * LayoutEditorCanvas::GetObjectLinkedToInitialInstance(gd::InitialInstance & instance) const
{
    if ( layout.HasObjectNamed(instance.GetObjectName()) )
        return &layout.GetObject(instance.GetObjectName());
    else if ( project.HasObjectNamed(instance.GetObjectName()) )
        return &project.GetObject(instance.GetObjectName());

    return NULL;
}

void LayoutEditorCanvas::UpdateMouseResizeCursor(const gd::String & currentDraggableBt)
{
    if ( currentDraggableBt == "resizeUp" || currentDraggableBt == "resizeDown"  )
        SetCursor(wxCursor(wxCURSOR_SIZENS));
    else if ( currentDraggableBt == "resizeLeft" || currentDraggableBt == "resizeRight"  )
        SetCursor(wxCursor(wxCURSOR_SIZEWE));
    else if ( currentDraggableBt == "resizeLeftUp" || currentDraggableBt == "resizeRightDown"  )
        SetCursor(wxCursor(wxCURSOR_SIZENWSE));
    else if ( currentDraggableBt == "resizeRightUp" || currentDraggableBt == "resizeLeftDown"  )
        SetCursor(wxCursor(wxCURSOR_SIZENESW));
    else if ( currentDraggableBt == "angle" )
        SetCursor(wxCursor(wxCURSOR_HAND));
}

bool LayoutEditorCanvas::PreviewPaused() const
{
    return !editing && (currentPreviewer ? currentPreviewer->IsPaused() : false);
}

void LayoutEditorCanvas::PausePreview()
{
    if ( editing ) return;

    if (currentPreviewer) currentPreviewer->PausePreview();
}

void LayoutEditorCanvas::SetParentAuiManager(wxAuiManager * parentAuiManager_)
{
    parentAuiManager = parentAuiManager_;
    for(std::map<gd::String, std::shared_ptr<gd::LayoutEditorPreviewer> >::iterator it = previewers.begin();
        it != previewers.end();
        ++it)
    {
        if ( it->second != std::shared_ptr<gd::LayoutEditorPreviewer>() ) { it->second->SetParentAuiManager(parentAuiManager_); }
    }
}

void LayoutEditorCanvas::ReloadResources()
{
    if ( wxDirExists(wxFileName::FileName(project.GetProjectFile()).GetPath()))
        wxSetWorkingDirectory(wxFileName::FileName(project.GetProjectFile()).GetPath());

    for (std::size_t i = 0;i<layout.GetObjectsCount();++i)
        layout.GetObject(i).LoadResources(project, layout);
    for (std::size_t i = 0;i<project.GetObjectsCount();++i)
        project.GetObject(i).LoadResources(project, layout);

    wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());
}

void LayoutEditorCanvas::GoToEditingState()
{
    wxCommandEvent useless;
    OnEditionBtClick(useless);
}

}

//The rest of the implementation is available in LayoutEditorCanvas2.cpp
#endif
