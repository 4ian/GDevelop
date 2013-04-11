/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)
#include <iostream>
#include <wx/dcclient.h>
#include <wx/log.h>
#include <wx/filename.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/scrolbar.h>
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDL/RuntimeGame.h"
#include "GDL/RuntimeScene.h"
#include "GDL/CodeExecutionEngine.h"
#include "GDL/SceneNameMangler.h"
#include "GDL/SoundManager.h"
#include "GDL/FontManager.h"
#include "GDL/Object.h"
#include "GDL/SpriteObject.h"
#include "GDL/Events/CodeCompilationHelpers.h"
#include "GDL/IDE/Dialogs/DebuggerGUI.h"
#include "GDL/IDE/Dialogs/ProfileDlg.h"
#include "GDL/IDE/Dialogs/RenderDialog.h"
#include "SceneEditorCanvas.h"
// Platform-specific includes. Be sure to include them at the end as it seems to be some incompatibilities with SFML's WindowStyle.hpp
#ifdef __WXGTK__
    #include <gdk/gdkx.h>
    #include <gtk/gtk.h>
    #include <wx/gtk/private/win_gtk.h> //If this file is unable during compilation, then you must manually locate the "gtk/private" folder it in the wxWidgets folder and copy it into the folder where wx is installed.
#endif

sf::Texture SceneEditorCanvas::reloadingIconImage;
sf::Sprite SceneEditorCanvas::reloadingIconSprite;
sf::Text SceneEditorCanvas::reloadingText;

const long SceneEditorCanvas::ID_ADDOBJMENU = wxNewId();
const long SceneEditorCanvas::ID_DELOBJMENU = wxNewId();
const long SceneEditorCanvas::ID_PROPMENU = wxNewId();
const long SceneEditorCanvas::ID_LAYERUPMENU = wxNewId();
const long SceneEditorCanvas::ID_LAYERDOWNMENU = wxNewId();
const long SceneEditorCanvas::ID_COPYMENU = wxNewId();
const long SceneEditorCanvas::ID_CUTMENU = wxNewId();
const long SceneEditorCanvas::ID_PASTEMENU = wxNewId();
const long SceneEditorCanvas::ID_PASTESPECIALMENU = wxNewId();
const long SceneEditorCanvas::ID_CREATEOBJECTMENU = wxNewId();
const long SceneEditorCanvas::ID_LOCKMENU = wxNewId();
const long SceneEditorCanvas::ID_UNLOCKMENU = wxNewId();
const long SceneEditorCanvas::idRibbonOrigine = wxNewId();
const long SceneEditorCanvas::idRibbonOriginalZoom = wxNewId();
const long SceneEditorCanvas::ID_CUSTOMZOOMMENUITEM500 = wxNewId();
const long SceneEditorCanvas::ID_CUSTOMZOOMMENUITEM200 = wxNewId();
const long SceneEditorCanvas::ID_CUSTOMZOOMMENUITEM150 = wxNewId();
const long SceneEditorCanvas::ID_CUSTOMZOOMMENUITEM100 = wxNewId();
const long SceneEditorCanvas::ID_CUSTOMZOOMMENUITEM50 = wxNewId();
const long SceneEditorCanvas::ID_CUSTOMZOOMMENUITEM25 = wxNewId();
const long SceneEditorCanvas::ID_CUSTOMZOOMMENUITEM10 = wxNewId();
const long SceneEditorCanvas::ID_CUSTOMZOOMMENUITEM5 = wxNewId();
const long SceneEditorCanvas::idRibbonRefresh = wxNewId();
const long SceneEditorCanvas::idRibbonPlay = wxNewId();
const long SceneEditorCanvas::idRibbonPlayWin = wxNewId();
const long SceneEditorCanvas::idRibbonPause = wxNewId();
const long SceneEditorCanvas::idRibbonResetGlobalVars = wxNewId();
const long SceneEditorCanvas::idRibbonDebugger = wxNewId();
const long SceneEditorCanvas::idRibbonProfiler = wxNewId();

SceneEditorCanvas::SceneEditorCanvas(wxWindow* parent, gd::Project & project_, gd::Layout & layout_, gd::InitialInstancesContainer & instances_, gd::LayoutEditorCanvasOptions & settings_, gd::MainFrameWrapper & mainFrameWrapper_) :
    LayoutEditorCanvas(parent, project_, layout_, instances_, settings_, mainFrameWrapper_),
    game(dynamic_cast<RuntimeGame &>(project_)),
    scene(dynamic_cast<gd::Layout &>(layout_)),
    instances(dynamic_cast<gd::InitialInstancesContainer &>(instances_)),
    previewScene(this, &game),
    isMovingView(false),
    isReloading(false)
{
    //Initialization allowing to run SFML within the wxWidgets control.
    //See also SceneEditorCanvas::OnUpdate & co.
    #ifdef __WXGTK__

        // GTK implementation requires to go deeper to find the low-level X11 identifier of the widget
        gtk_widget_realize(m_wxwindow);
        gtk_widget_set_double_buffered(m_wxwindow, false);

        GtkWidget* privHandle = m_wxwindow;
        wxPizza * pizza = WX_PIZZA(privHandle);
        GtkWidget * widget = GTK_WIDGET(pizza);

        GdkWindow* Win = widget->window;
        XFlush(GDK_WINDOW_XDISPLAY(Win));
        sf::RenderWindow::create(GDK_WINDOW_XWINDOW(Win));

    #else

        // Tested under Windows XP only (should work with X11 and other Windows versions - no idea about MacOS)
        sf::RenderWindow::create(static_cast<sf::WindowHandle>(GetHandle()));

    #endif
	Connect(wxEVT_KEY_DOWN,(wxObjectEventFunction)&SceneEditorCanvas::OnKey);
	Connect(wxEVT_KEY_UP,(wxObjectEventFunction)&SceneEditorCanvas::OnKeyUp);

    //Creating additional editors used specifically by our platform.
    externalPreviewWindow = boost::shared_ptr<RenderDialog>(new RenderDialog(this, this) );
    //Others editors are created in SetParentAuiManager method.

    //Loading some GUI elements
    reloadingIconImage.loadFromFile("res/compile128.png");
    reloadingIconSprite.setTexture(reloadingIconImage);
    reloadingText.setColor(sf::Color(0,0,0,128));
    reloadingText.setString(string(_("Compiling...").mb_str()));
    reloadingText.setCharacterSize(40);
    reloadingText.setFont(*FontManager::GetInstance()->GetFont(""));
    setFramerateLimit(30);

    editionView.setCenter( (game.GetMainWindowDefaultWidth()/2),(game.GetMainWindowDefaultHeight()/2));

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
        pasteItem->SetBitmap(wxImage( "res/pasteicon.png" ) );
        noObjectContextMenu.Append(pasteItem);
        wxMenuItem * pasteSpecialItem = new wxMenuItem((&noObjectContextMenu), ID_PASTESPECIALMENU, _("Special paste"), wxEmptyString, wxITEM_NORMAL);
        noObjectContextMenu.Append(pasteSpecialItem);
        noObjectContextMenu.AppendSeparator();
        wxMenuItem * unlockItem = new wxMenuItem((&noObjectContextMenu), ID_UNLOCKMENU, _("Unlock the object under the cursor"), wxEmptyString, wxITEM_NORMAL);
        unlockItem->SetBitmap(wxImage( "res/lockicon.png" ) );
        noObjectContextMenu.Append(unlockItem);
    }

    RecreateRibbonToolbar();
}

void SceneEditorCanvas::OnIdle(wxIdleEvent&)
{
    // Send a paint message when the control is idle, to ensure maximum framerate
    Refresh();
}

void SceneEditorCanvas::OnPaint(wxPaintEvent&)
{
    // Make sure the control is able to be repainted
    wxPaintDC Dc(this);
    OnUpdate();
}

/**
 * Go in preview mode
 */
void SceneEditorCanvas::OnPreviewBtClick( wxCommandEvent & event )
{
    if ( !editing ) return;
    std::cout << "Switching to preview mode..." << std::endl;
    LayoutEditorCanvas::OnPreviewBtClick(event);

    previewScene.running = false;
    playing = false;

    RefreshFromLayout();
    UpdateSize();
    UpdateScrollbars();
    setFramerateLimit(game.GetMaximumFPS());

    if ( debugger ) debugger->Play();

    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlay, true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPause, false);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlayWin, true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->Refresh();
}

/**
 * Go in edition mode
 */
void SceneEditorCanvas::OnEditionBtClick( wxCommandEvent & event )
{
    if ( editing ) return;
    std::cout << "Switching to edition mode..." << std::endl;
    LayoutEditorCanvas::OnEditionBtClick(event);

    CodeCompiler::GetInstance()->EnableTaskRelatedTo(scene);
    previewScene.running = false;
    playing = false;

    if ( externalPreviewWindow ) externalPreviewWindow->Show(false);
    previewScene.ChangeRenderWindow(this);
    setFramerateLimit(30);

    //Parse now the results of profiling
    if ( profiler ) profiler->ParseProfileEvents();

    RefreshFromLayout();
    UpdateSize();
    UpdateScrollbars();

    if ( debugger ) debugger->Pause();
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->Refresh();
}

void SceneEditorCanvas::OnUpdate()
{
    if ( isReloading )
    {
        if ( !editing && CodeCompiler::GetInstance()->CompilationInProcess()  ) //We're still waiting for compilation to finish
        {
            RenderCompilationScreen(); //Display a message when compiling
            return;
        }
        else //Everything is finished, reloading is almost complete!
        {
            RefreshFromLayoutSecondPart();
        }
    }
    else //We're displaying the scene
    {
        //First ensure scene does not need to be reloaded
        if ( !previewScene.running || editing )
        {
            //Reload changed images.
            if ( !game.imagesChanged.empty() )
            {
                if ( wxDirExists(wxFileName::FileName(game.GetProjectFile()).GetPath()))
                    wxSetWorkingDirectory(wxFileName::FileName(game.GetProjectFile()).GetPath()); //Resources loading stuff incoming: Switch current work dir.

                for (unsigned int i = 0;i<game.imagesChanged.size();++i)
                    previewGame.imageManager->ReloadImage(game.imagesChanged[i]);

                game.imageManager->LoadPermanentImages();
                game.imagesChanged.clear();
                scene.SetRefreshNeeded();

                wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory()); //Go back to the IDE cwd.
            }

            if ( scene.RefreshNeeded() ) //Reload scene if necessary
                RefreshFromLayout();
        }

        //Then display the scene
        if ( previewScene.running && !editing ) //At runtime
        {
            int retourEvent = previewScene.RenderAndStep();

            if ( retourEvent == -2 )
                mainFrameWrapper.GetInfoBar()->ShowMessage(_( "In the compiled game, the game will quit." ));
            else if ( retourEvent != -1 )
            {
                if (retourEvent > 0 && static_cast<unsigned>(retourEvent) < game.GetLayoutCount())
                    mainFrameWrapper.GetInfoBar()->ShowMessage(_( "In the compiled game, the scene will change for " ) + "\"" + game.GetLayout(retourEvent).GetName() + "\"");
            }
        }
        else if ( !previewScene.running && !editing ) //Runtime paused
            previewScene.RenderWithoutStep();
        else //Edittime
        {
            RenderEdittime();
            UpdateScrollbars();
        }
    }
}

void SceneEditorCanvas::RefreshFromLayout()
{
    cout << "Scene Editor canvas reloading... ( Step 1/2 )" << endl;
    isReloading = true;

    SoundManager::GetInstance()->ClearAllSoundsAndMusics();
    if ( game.imageManager ) game.imageManager->PreventImagesUnloading(); //Images are normally unloaded and loaded again when reloading the scene. We can prevent this to happen as it is time wasting.

    //Reset game
    previewGame = game;
    previewGame.imageManager = game.imageManager; //Use same image manager.

    //Reset scene
    RuntimeScene newScene(this, &previewGame);
    previewScene = newScene;
    previewScene.running = false;
    playing = false;
    if ( debugger ) previewScene.debugger = debugger.get();

    //Launch now events compilation if it has not been launched by another way. ( Events editor for example )
    //Useful when opening a scene for the first time for example.
    if ( scene.CompilationNeeded() && !CodeCompiler::GetInstance()->HasTaskRelatedTo(scene) )
    {
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, scene);

        if ( !editing )
            mainFrameWrapper.GetInfoBar()->ShowMessage(_("Changes made to events will be taken into account when you switch to Edition mode"));
    }

    return; //RefreshFromLayoutSecondPart() will be called by OnUpdate() when appropriate
}

void SceneEditorCanvas::RefreshFromLayoutSecondPart()
{
    cout << "Scene canvas reloading... ( Step 2/2 )" << endl;
    if ( !editing )  CodeCompiler::GetInstance()->DisableTaskRelatedTo(scene);

    //Switch the working directory as we are making calls to the runtime scene
    if ( wxDirExists(wxFileName::FileName(game.GetProjectFile()).GetPath()))
        wxSetWorkingDirectory(wxFileName::FileName(game.GetProjectFile()).GetPath());

    //Load the scene ( compilation is done )
    if ( editing )
    {
        //Create the map linking initial instances to real objects used by the scene for rendering.
        initialInstancesAndObjectsBimap.clear();
        gd::InitialInstancesContainer noInstances; //We need to load the scene in a two time fashion...
        previewScene.LoadFromSceneAndCustomInstances(scene, noInstances);
        std::map< const gd::InitialInstance*, boost::shared_ptr<RuntimeObject> > tempMap;
        previewScene.CreateObjectsFrom(instances, 0, 0, &tempMap); //...so as to fill the tracking map.

        for (std::map< const gd::InitialInstance*, boost::shared_ptr<RuntimeObject> >::const_iterator it = tempMap.begin();it!=tempMap.end();++it)
            initialInstancesAndObjectsBimap.insert(InstanceAndObjectPair(const_cast<gd::InitialInstance*>(it->first), it->second));
            //I know the const_cast is ugly, but I do not know how to bypass the issue otherwise.

    }
    else
    {
        std::cout << "Initializing RuntimeScene from layout..." << std::endl;
        previewScene.LoadFromSceneAndCustomInstances( scene, instances );

        std::cout << "Loading compiled code..." << std::endl;
        if ( !previewScene.GetCodeExecutionEngine()->LoadFromDynamicLibrary(scene.GetCompiledEventsFile(),
                                                                            "GDSceneEvents"+SceneNameMangler::GetMangledSceneName(scene.GetName())) )
        {
            wxLogError(_("Compilation of events failed, and scene cannot be previewed. Please report this problem to Game Develop's developer, joining this file:\n")+CodeCompiler::GetInstance()->GetOutputDirectory()+"LatestCompilationOutput.txt");
            wxCommandEvent useless;
            OnEditionBtClick(useless);
        }
    }
    scene.SetRefreshNotNeeded();

    //If a preview is not going to be made, switch back to the IDE working directory
    if ( editing ) wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());

    if ( game.imageManager ) game.imageManager->EnableImagesUnloading(); //We were preventing images unloading so as to be sure not to waste time unloading and reloading just after scenes images.

    isReloading = false;
}

void SceneEditorCanvas::OnPreviewRefreshBtClick( wxCommandEvent & event )
{
    previewScene.running = false;
    playing = false;
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlay, true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPause, false);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlayWin, true);

    RefreshFromLayout();
}

void SceneEditorCanvas::PlayPreview()
{
    if ( editing ) return;

    previewScene.running = true;
    LayoutEditorCanvas::PlayPreview();

    if ( externalPreviewWindow ) externalPreviewWindow->Show(false);
    previewScene.ChangeRenderWindow(this);

    if ( debugger ) debugger->Play();
}

void SceneEditorCanvas::OnPreviewPlayBtClick( wxCommandEvent & event )
{
    PlayPreview();

    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlay, false);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPause, true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlayWin, true);
}
void SceneEditorCanvas::OnPreviewPlayWindowBtClick( wxCommandEvent & event )
{
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlay, true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPause, true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlayWin, false);

    previewScene.running = true;
    PlayPreview();

    if ( externalPreviewWindow )
    {
        externalPreviewWindow->Show(true);
        externalPreviewWindow->renderCanvas->setFramerateLimit( previewGame.GetMaximumFPS() );

        externalPreviewWindow->SetSizeOfRenderingZone(game.GetMainWindowDefaultWidth(), game.GetMainWindowDefaultHeight());
        previewScene.ChangeRenderWindow(externalPreviewWindow->renderCanvas);

        externalPreviewWindow->SetSizeOfRenderingZone(game.GetMainWindowDefaultWidth(), game.GetMainWindowDefaultHeight());
        previewScene.ChangeRenderWindow(externalPreviewWindow->renderCanvas);
    }

    if ( debugger ) debugger->Play();
}
void SceneEditorCanvas::ExternalWindowClosed()
{
    if ( !editing && previewScene.running )
    {
        wxCommandEvent uselessEvent;
        OnPreviewPlayBtClick(uselessEvent); //Go back to the internal preview
    }
}

void SceneEditorCanvas::PausePreview()
{
    if ( editing ) return;

    previewScene.running = false;
    LayoutEditorCanvas::PausePreview();

    if ( debugger ) debugger->Pause();

    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlay, true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPause, false);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlayWin, true);
}

void SceneEditorCanvas::OnPreviewPauseBtClick( wxCommandEvent & event )
{
    PausePreview();
}

void SceneEditorCanvas::OnPreviewDebugBtClick( wxCommandEvent & event )
{
    if ( !parentAuiManager || !debugger ) return;

    parentAuiManager->GetPane(debugger.get()).Show();
    parentAuiManager->Update();
}

void SceneEditorCanvas::OnPreviewProfilerBtClick( wxCommandEvent & event )
{
    if ( !parentAuiManager || !profiler ) return;

    parentAuiManager->GetPane(profiler.get()).Show();
    parentAuiManager->Update();
}

void SceneEditorCanvas::OnLeftUp( wxMouseEvent &event )
{
    #if defined(LINUX) //Simulate click on linux
    sf::Event myEvent;
    myEvent.type = sf::Event::MouseButtonReleased;
    myEvent.mouseButton.x = event.GetX();
    myEvent.mouseButton.y = event.GetY();
    myEvent.mouseButton.button = sf::Mouse::Left;

    previewScene.GetRenderTargetEvents().push_back(myEvent);
    #endif

    if ( !editing ) return;

    if ( !currentDraggableBt.empty() ) //First check if we were dragging a button.
    {
        currentDraggableBt.clear();

        if ( currentDraggableBt.substr(0, 6) == "resize" ) //Handle the release of resize buttons here ( as the mouse if not necessarily on the button so OnGuiButtonReleased is not called )
        {

            //Ugly hack for sprites part2 : Ensure that the selected instances "start" position is updated
            //as the sprites objects X and Y position are updated when resized.
            for ( std::map <gd::InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
            {
                it->second.x = it->first->GetX(); it->second.y = it->first->GetY();
            }
        }
    }
    else //Nothing special, let's the base editor handle the work.
        LayoutEditorCanvas::OnLeftUp(event);
}

void SceneEditorCanvas::OnMotion( wxMouseEvent &event )
{
    /*
    //First check if we're using a resize button
    if ( currentDraggableBt.substr(0,6) == "resize")
    {
        if ( currentDraggableBt == "resizeRight" || currentDraggableBt == "resizeRightUp" || currentDraggableBt == "resizeRightDown" )
        {
            for ( std::map <gd::InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
            {
                boost::shared_ptr<gd::Object> associatedObject = GetObjectLinkedToInitialInstance(*(it->first));

                if ( associatedObject )
                {
                    if (resizeOriginalWidths[it->first]+GetMouseXOnLayout()-resizeMouseStartPosition.x < 0) continue;

                    associatedObject->SetWidth(resizeOriginalWidths[it->first]+GetMouseXOnLayout()-resizeMouseStartPosition.x);
                    it->first->SetHasCustomSize(true);
                    it->first->SetCustomWidth(associatedObject->GetWidth());

                    //Ugly hack to let the Sprite behave as others objects
                    if ( boost::shared_ptr<SpriteObject> spriteObject = boost::dynamic_pointer_cast<SpriteObject>(associatedObject) )
                    {
                        spriteObject->SetX(it->second.x+0.5*(GetMouseXOnLayout()-resizeMouseStartPosition.x));
                        it->first->SetX(spriteObject->GetX());
                    }
                }
            }
        }
        if ( currentDraggableBt == "resizeDown" || currentDraggableBt == "resizeRightDown" || currentDraggableBt == "resizeLeftDown" )
        {
            for ( std::map <gd::InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
            {
                boost::shared_ptr<gd::Object> associatedObject = GetObjectLinkedToInitialInstance(*(it->first));

                if ( associatedObject )
                {
                    if ( resizeOriginalHeights[it->first]+GetMouseYOnLayout()-resizeMouseStartPosition.y < 0 ) continue;

                    associatedObject->SetHeight(resizeOriginalHeights[it->first]+GetMouseYOnLayout()-resizeMouseStartPosition.y);
                    it->first->SetHasCustomSize(true);
                    it->first->SetCustomHeight(associatedObject->GetHeight());

                    //Ugly hack to let the Sprite behave as others objects
                    if ( boost::shared_ptr<SpriteObject> spriteObject = boost::dynamic_pointer_cast<SpriteObject>(associatedObject) )
                    {
                        spriteObject->SetY(it->second.y+0.5*(GetMouseYOnLayout()-resizeMouseStartPosition.y));
                        it->first->SetY(spriteObject->GetY());
                    }
                }
            }
        }
        if ( currentDraggableBt == "resizeLeft" || currentDraggableBt == "resizeLeftUp" || currentDraggableBt == "resizeLeftDown" )
        {
            for ( std::map <gd::InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
            {
                boost::shared_ptr<gd::Object> associatedObject = GetObjectLinkedToInitialInstance(*(it->first));

                if ( associatedObject )
                {
                    if (resizeOriginalWidths[it->first]-GetMouseXOnLayout()+resizeMouseStartPosition.x < 0) continue;

                    associatedObject->SetWidth(resizeOriginalWidths[it->first]-GetMouseXOnLayout()+resizeMouseStartPosition.x);
                    associatedObject->SetX(it->second.x+GetMouseXOnLayout()-resizeMouseStartPosition.x);
                    it->first->SetHasCustomSize(true);
                    it->first->SetCustomWidth(associatedObject->GetWidth());
                    it->first->SetX(associatedObject->GetX());

                    //Ugly hack to let the Sprite behave as others objects
                    if ( boost::shared_ptr<SpriteObject> spriteObject = boost::dynamic_pointer_cast<SpriteObject>(associatedObject) )
                    {
                        spriteObject->SetX(it->second.x+0.5*(GetMouseXOnLayout()-resizeMouseStartPosition.x));
                        it->first->SetX(spriteObject->GetX());
                    }
                }
            }
        }
        if ( currentDraggableBt == "resizeUp" || currentDraggableBt == "resizeLeftUp" || currentDraggableBt == "resizeRightUp" )
        {
            for ( std::map <gd::InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
            {
                boost::shared_ptr<gd::Object> associatedObject = GetObjectLinkedToInitialInstance(*(it->first));

                if ( associatedObject )
                {
                    if ( resizeOriginalHeights[it->first]-GetMouseYOnLayout()+resizeMouseStartPosition.y < 0 ) continue;

                    associatedObject->SetHeight(resizeOriginalHeights[it->first]-GetMouseYOnLayout()+resizeMouseStartPosition.y);
                    associatedObject->SetY(it->second.y+GetMouseYOnLayout()-resizeMouseStartPosition.y);
                    it->first->SetHasCustomSize(true);
                    it->first->SetCustomHeight(associatedObject->GetHeight());
                    it->first->SetY(associatedObject->GetY());

                    //Ugly hack to let the Sprite behave as others objects
                    if ( boost::shared_ptr<SpriteObject> spriteObject = boost::dynamic_pointer_cast<SpriteObject>(associatedObject) )
                    {
                        spriteObject->SetY(it->second.y+0.5*(GetMouseYOnLayout()-resizeMouseStartPosition.y));
                        it->first->SetY(spriteObject->GetY());
                    }
                }
            }
        }

        UpdateMouseResizeCursor(currentDraggableBt);
    }
    else if (currentDraggableBt == "angle") //Check if we are dragging a angle button
    {
        for ( std::map <gd::InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
        {
            boost::shared_ptr<gd::Object> associatedObject = GetObjectLinkedToInitialInstance(*(it->first));

            if ( associatedObject )
            {
                float newAngle = atan2(sf::Mouse::getPosition(*this).y-angleButtonCenter.y, sf::Mouse::getPosition(*this).x-angleButtonCenter.x)*180/3.14159;
                it->first->SetAngle(newAngle);
                associatedObject->SetAngle(newAngle);
            }
        }
    }
    else //No buttons being used
    {
        //Moving using middle click
        if ( isMovingView )
        {
            float zoomFactor = static_cast<float>(getSize().x)/editionView.getSize().x;

            editionView.setCenter( movingViewStartPosition + (movingViewMouseStartPosition - sf::Vector2f(sf::Mouse::getPosition(*this)))/zoomFactor );
        }

        LayoutEditorCanvas::OnMotion(event);
    }*/
}

void SceneEditorCanvas::OnMiddleDown( wxMouseEvent &event )
{
    if ( !editing ) return;

    //User can move the view thanks to middle click
    if ( !isMovingView )
    {
        isMovingView = true;
        movingViewMouseStartPosition = sf::Vector2f(sf::Mouse::getPosition(*this));
        movingViewStartPosition = getView().getCenter();
        SetCursor( wxCursor( wxCURSOR_SIZING ) );

        return;
    }
    else
    {
        isMovingView = false;
        SetCursor( wxNullCursor );
    }
}

void SceneEditorCanvas::OnRightUp( wxMouseEvent &event )
{
    #if defined(LINUX) //Simulate click on linux
    sf::Event myEvent;
    myEvent.type = sf::Event::MouseButtonReleased;
    myEvent.mouseButton.x = event.GetX();
    myEvent.mouseButton.y = event.GetY();
    myEvent.mouseButton.button = sf::Mouse::Right;

    previewScene.GetRenderTargetEvents().push_back(myEvent);
    #endif

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

void SceneEditorCanvas::OnGuiElementHovered(const gd::LayoutEditorCanvasGuiElement & guiElement)
{
    UpdateMouseResizeCursor(guiElement.name);
}

void SceneEditorCanvas::OnGuiElementPressed(const gd::LayoutEditorCanvasGuiElement & guiElement)
{
    /*if ( currentDraggableBt.empty() && guiElement.name.substr(0, 6) == "resize" )
    {
        currentDraggableBt = guiElement.name;

        resizeOriginalWidths.clear();
        for ( std::map <gd::InitialInstance*, wxRealPoint >::iterator it = selectedInstances.begin();it!=selectedInstances.end();++it)
        {
            boost::shared_ptr<gd::Object> associatedObject = GetObjectLinkedToInitialInstance(*(it->first));
            if ( associatedObject) resizeOriginalWidths[it->first] = associatedObject->GetWidth();
            if ( associatedObject) resizeOriginalHeights[it->first] = associatedObject->GetHeight();
        }
        resizeMouseStartPosition = sf::Vector2f(GetMouseXOnLayout(), GetMouseYOnLayout());
    }
    else if ( currentDraggableBt.empty() && guiElement.name == "angle" )
    {
        currentDraggableBt = "angle";
    }*/
}

void SceneEditorCanvas::OnGuiElementReleased(const gd::LayoutEditorCanvasGuiElement & guiElement)
{
}

void SceneEditorCanvas::DrawSelectionRectangleGuiElement(std::vector < boost::shared_ptr<sf::Shape> > & target, const sf::FloatRect & rectangle )
{
    //Create the shapes
    boost::shared_ptr<sf::Shape> selection = boost::shared_ptr<sf::Shape>(new sf::RectangleShape(sf::Vector2f(rectangle.width, rectangle.height)));
    selection->setPosition(rectangle.left, rectangle.top);
    selection->setFillColor(sf::Color( 0, 0, 200, 40 ));
    selection->setOutlineColor(sf::Color( 0, 0, 255, 128 ));
    selection->setOutlineThickness(1);

    //Add the shape to be drawn
    target.push_back(selection);
}

void SceneEditorCanvas::DrawAngleButtonGuiElement(std::vector < boost::shared_ptr<sf::Shape> > & target, const sf::Vector2f & position, float angle )
{
    //Create the shapes
    boost::shared_ptr<sf::Shape> centerShape = boost::shared_ptr<sf::Shape>(new sf::CircleShape(3));
    centerShape->setPosition(position);
    centerShape->setOutlineColor(sf::Color( 0, 0, 255, 128 ));
    centerShape->setOutlineThickness(1);
    centerShape->setFillColor(sf::Color( 0, 0, 200, 40 ));

    boost::shared_ptr<sf::Shape> angleButton = boost::shared_ptr<sf::Shape>(new sf::RectangleShape(sf::Vector2f(smallButtonSize, smallButtonSize)));
    angleButton->setPosition(position+sf::Vector2f(10.0*cos(angle/180.0*3.14159), 10.0*sin(angle/180.0*3.14159)));
    angleButton->setOutlineColor(sf::Color( 0, 0, 0, 255 ));
    angleButton->setOutlineThickness(1);

    //Declare the angle button as a gui element
    gd::LayoutEditorCanvasGuiElement guiElement;
    guiElement.name = "angle";
    guiElement.area = wxRect(angleButton->getPosition().x, angleButton->getPosition().y, smallButtonSize, smallButtonSize);
    guiElements.push_back(guiElement);
    if ( !guiElement.area.Contains(wxPoint(sf::Mouse::getPosition(*this).x, sf::Mouse::getPosition(*this).y)) )
        angleButton->setFillColor(sf::Color( 220, 220, 220, 255 ));
    else
        angleButton->setFillColor(sf::Color( 255, 255, 255, 255 ));

    angleButtonCenter = position; //Save the position of the center to calculate the new angle when we'll be dragging the button ( See OnMoving method )

    //Add the shape to be drawn
    target.push_back(centerShape);
    target.push_back(angleButton);
}

void SceneEditorCanvas::DrawHighlightRectangleGuiElement(std::vector < boost::shared_ptr<sf::Shape> > & target, const sf::FloatRect & rectangle )
{
    boost::shared_ptr<sf::Shape> highlight = boost::shared_ptr<sf::Shape>(new sf::RectangleShape(sf::Vector2f(rectangle.width, rectangle.height)));
    highlight->setPosition(rectangle.left, rectangle.top);
    highlight->setFillColor(sf::Color( 230, 230, 230, 20 ));
    highlight->setOutlineColor(sf::Color( 200, 200, 200, 70 ));
    highlight->setOutlineThickness(1);

    target.push_back(highlight);
}

void SceneEditorCanvas::AddSmallButtonGuiElement(std::vector < boost::shared_ptr<sf::Shape> > & target, const sf::Vector2f & position, const std::string & buttonName )
{
    //Declare the button as a gui element
    gd::LayoutEditorCanvasGuiElement guiElement;
    guiElement.name = buttonName;
    guiElement.area = wxRect(position.x, position.y, smallButtonSize, smallButtonSize);
    guiElements.push_back(guiElement);

    //Draw button
    boost::shared_ptr<sf::Shape> button = boost::shared_ptr<sf::Shape>(new sf::RectangleShape(sf::Vector2f(smallButtonSize, smallButtonSize)));
    button->setPosition(position);
    button->setOutlineColor(sf::Color( 0, 0, 0, 255 ));
    button->setOutlineThickness(1);
    if ( !guiElement.area.Contains(wxPoint(sf::Mouse::getPosition(*this).x, sf::Mouse::getPosition(*this).y)) )
        button->setFillColor(sf::Color( 220, 220, 220, 255 ));
    else
        button->setFillColor(sf::Color( 255, 255, 255, 255 ));

    target.push_back(button);
}

void SceneEditorCanvas::RenderEdittime()
{
    previewScene.ManageRenderTargetEvents();

    clear( sf::Color( previewScene.GetBackgroundColorRed(), previewScene.GetBackgroundColorGreen(), previewScene.GetBackgroundColorBlue() ) );
    setView(editionView);

    /*glClear(GL_DEPTH_BUFFER_BIT);
    pushGLStates(); //To allow using OpenGL to draw

    //Sort objects according to their Z Order
    RuntimeObjList allObjects = previewScene.objectsInstances.GetAllObjects();
    previewScene.OrderObjectsByZOrder( allObjects );

    //Reseting the gui elements
    std::vector < boost::shared_ptr<sf::Shape> > guiElementsShapes;
    guiElements.clear();

    bool drawResizeButtons = false;
    float resizeButtonsMaxX = 0;
    float resizeButtonsMinX = 0;
    float resizeButtonsMaxY = 0;
    float resizeButtonsMinY = 0;
    float selectionAngle = 0;

    gd::InitialInstance * highlightedInstance = GetInitialInstanceUnderCursor();

    for (unsigned int layerIndex =0;layerIndex<previewScene.GetLayersCount();++layerIndex)
    {
        if ( previewScene.GetLayer(layerIndex).GetVisibility() )
        {
            //Prepare OpenGL rendering
            popGLStates();

            glMatrixMode(GL_PROJECTION);
            glLoadIdentity();
            gluPerspective(previewScene.GetOpenGLFOV(), static_cast<double>(getSize().x)/static_cast<double>(getSize().y), previewScene.GetOpenGLZNear(), previewScene.GetOpenGLZFar());

            glViewport(0,0, getSize().x, getSize().y);

            pushGLStates();

            //Render all objects
            for (unsigned int id = 0;id < allObjects.size();++id)
            {
                if ( allObjects[id]->GetLayer() == previewScene.GetLayer(layerIndex).GetName())
                {
                    allObjects[id]->DrawEdittime(*previewScene.renderWindow);

                    //Selection rectangle
                    gd::InitialInstance * associatedInitialInstance = initialInstancesAndObjectsBimap.right.find(allObjects[id])->second;
                    if ( selectedInstances.find(associatedInitialInstance) != selectedInstances.end() )
                    {
                        sf::Vector2f rectangleOrigin = ConvertToWindowCoordinates(allObjects[id]->GetDrawableX(), allObjects[id]->GetDrawableY(), editionView);
                        sf::Vector2f rectangleEnd = ConvertToWindowCoordinates(allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth(),
                                                                               allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight(), editionView);

                        DrawSelectionRectangleGuiElement(guiElementsShapes, sf::FloatRect(rectangleOrigin, rectangleEnd-rectangleOrigin ));

                        if ( !drawResizeButtons )
                        {
                            resizeButtonsMaxX = rectangleEnd.x;
                            resizeButtonsMaxY = rectangleEnd.y;
                            resizeButtonsMinX = rectangleOrigin.x;
                            resizeButtonsMinY = rectangleOrigin.y;
                            selectionAngle = associatedInitialInstance->GetAngle();
                            drawResizeButtons = true;
                        }
                        else
                        {
                            resizeButtonsMaxX = std::max(resizeButtonsMaxX, rectangleEnd.x);
                            resizeButtonsMaxY = std::max(resizeButtonsMaxY, rectangleEnd.y);
                            resizeButtonsMinX = std::min(resizeButtonsMinX, rectangleOrigin.x);
                            resizeButtonsMinY = std::min(resizeButtonsMinY, rectangleOrigin.y);
                        }
                    }
                    else if ( highlightedInstance == associatedInitialInstance )
                    {
                        sf::Vector2f rectangleOrigin = ConvertToWindowCoordinates(allObjects[id]->GetDrawableX(), allObjects[id]->GetDrawableY(), editionView);
                        sf::Vector2f rectangleEnd = ConvertToWindowCoordinates(allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth(),
                                                                               allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight(), editionView);

                        DrawHighlightRectangleGuiElement(guiElementsShapes, sf::FloatRect(rectangleOrigin, rectangleEnd-rectangleOrigin ));
                    }
                }
            }
        }
    }

    //Go back to "window" view before drawing GUI elements
    setView(sf::View(sf::Vector2f(getSize().x/2,getSize().y/2), sf::Vector2f(getSize().x,getSize().y)));

    if ( options.grid ) RenderGrid();

    if ( drawResizeButtons )
    {
        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(resizeButtonsMinX-gapBetweenButtonsAndRectangle-smallButtonSize, resizeButtonsMinY-gapBetweenButtonsAndRectangle-smallButtonSize), "resizeLeftUp");
        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(0.5*(resizeButtonsMinX+resizeButtonsMaxX-smallButtonSize), resizeButtonsMinY-gapBetweenButtonsAndRectangle-smallButtonSize), "resizeUp");
        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(resizeButtonsMaxX+gapBetweenButtonsAndRectangle, resizeButtonsMinY-gapBetweenButtonsAndRectangle-smallButtonSize), "resizeRightUp");
        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(resizeButtonsMaxX+gapBetweenButtonsAndRectangle, 0.5*(resizeButtonsMinY+resizeButtonsMaxY-smallButtonSize)), "resizeRight");
        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(resizeButtonsMaxX+gapBetweenButtonsAndRectangle, resizeButtonsMaxY+gapBetweenButtonsAndRectangle), "resizeRightDown");
        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(0.5*(resizeButtonsMinX+resizeButtonsMaxX-smallButtonSize), resizeButtonsMaxY+gapBetweenButtonsAndRectangle), "resizeDown");
        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(resizeButtonsMinX-gapBetweenButtonsAndRectangle-smallButtonSize, resizeButtonsMaxY+gapBetweenButtonsAndRectangle), "resizeLeftDown");
        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(resizeButtonsMinX-gapBetweenButtonsAndRectangle-smallButtonSize, 0.5*(resizeButtonsMinY+resizeButtonsMaxY-smallButtonSize)), "resizeLeft" );
        DrawAngleButtonGuiElement(guiElementsShapes, sf::Vector2f(0.5*(resizeButtonsMinX+resizeButtonsMaxX-smallButtonSize), 0.5*(resizeButtonsMinY+resizeButtonsMaxY-smallButtonSize)), selectionAngle);
    }

    if ( isSelecting )
    {
        sf::Vector2f rectangleOrigin = ConvertToWindowCoordinates(selectionRectangle.GetX(), selectionRectangle.GetY(),
                                                                  editionView);

        sf::Vector2f rectangleEnd = ConvertToWindowCoordinates(selectionRectangle.GetBottomRight().x,
                                                               selectionRectangle.GetBottomRight().y,
                                                               editionView);

        DrawSelectionRectangleGuiElement(guiElementsShapes, sf::FloatRect(rectangleOrigin, rectangleEnd-rectangleOrigin));
    }

    for (unsigned int i = 0;i<guiElementsShapes.size();++i)
    	draw(*guiElementsShapes[i]);

    if ( options.windowMask )
    {
        sf::Vector2f rectangleOrigin = ConvertToWindowCoordinates(editionView.getCenter().x-previewScene.game->GetMainWindowDefaultWidth()/2,
                                                                  editionView.getCenter().y-previewScene.game->GetMainWindowDefaultHeight()/2,
                                                                  editionView);

        sf::Vector2f rectangleEnd = ConvertToWindowCoordinates(editionView.getCenter().x+previewScene.game->GetMainWindowDefaultWidth()/2,
                                                                  editionView.getCenter().y+previewScene.game->GetMainWindowDefaultHeight()/2,
                                                                  editionView);

        {
            sf::RectangleShape mask(sf::Vector2f(getSize().x, rectangleOrigin.y));
            mask.setPosition(0, 0);
            mask.setFillColor(sf::Color( 0, 0, 0, 128 ));
            draw(mask);
        }
        {
            sf::RectangleShape mask(sf::Vector2f(rectangleOrigin.x, getSize().y-rectangleOrigin.y));
            mask.setPosition(0, rectangleOrigin.y);
            mask.setFillColor(sf::Color( 0, 0, 0, 128 ));
            draw(mask);
        }
        {
            sf::RectangleShape mask(sf::Vector2f(getSize().x-rectangleEnd.x, getSize().y-rectangleOrigin.y));
            mask.setPosition(rectangleEnd.x, rectangleOrigin.y);
            mask.setFillColor(sf::Color( 0, 0, 0, 128 ));
            draw(mask);
        }
        {
            sf::RectangleShape mask(sf::Vector2f(rectangleEnd.x-rectangleOrigin.x, getSize().y-rectangleEnd.y));
            mask.setPosition(rectangleOrigin.x, rectangleEnd.y);
            mask.setFillColor(sf::Color( 0, 0, 0, 128 ));
            draw(mask);
        }
    }

    setView(editionView);
    popGLStates();
    display();*/
}


void SceneEditorCanvas::RenderGrid()
{
    int initialXPos = floor((editionView.getCenter().x-editionView.getSize().x/2) / options.gridWidth)-options.gridWidth;
    initialXPos *= options.gridWidth;
    int initialYPos = floor((editionView.getCenter().y-editionView.getSize().y/2) / options.gridHeight)-options.gridHeight;
    initialYPos *= options.gridHeight;

    for ( int Xpos = initialXPos;Xpos < (editionView.getCenter().x+editionView.getSize().x/2) ; Xpos += options.gridWidth )
    {
        sf::Vertex line[2] = {sf::Vertex(ConvertToWindowCoordinates(Xpos, initialYPos, editionView), sf::Color(options.gridR, options.gridG, options.gridB)),
                              sf::Vertex(ConvertToWindowCoordinates(Xpos, editionView.getCenter().y+editionView.getSize().y/2, editionView), sf::Color(options.gridR, options.gridG, options.gridB))};
        draw(line, 2, sf::Lines);
    }

    for ( int Ypos = initialYPos;Ypos < (editionView.getCenter().y+editionView.getSize().y/2) ; Ypos += options.gridHeight )
    {
        sf::Vertex line[2] = {sf::Vertex(ConvertToWindowCoordinates(initialXPos, Ypos, editionView), sf::Color(options.gridR, options.gridG, options.gridB)),
                              sf::Vertex(ConvertToWindowCoordinates(editionView.getCenter().x+editionView.getSize().x/2, Ypos, editionView), sf::Color(options.gridR, options.gridG, options.gridB))};
        draw(line, 2, sf::Lines);
    }
}

sf::Vector2f SceneEditorCanvas::ConvertToWindowCoordinates(float x, float y, const sf::View & view)
{
    //Transform by the view matrix
    sf::Vector2f hCoords = view.getTransform().transformPoint(x,y);

    //Go back from homogeneous coordinates to viewport ones.
    sf::IntRect viewport = getViewport(view);
    return sf::Vector2f(( hCoords.x + 1.f ) / 2.f * viewport.width + viewport.left,
                        (-hCoords.y + 1.f ) / 2.f * viewport.height + viewport.top);
}


//The rest of the implementation is available in SceneEditorCanvas2.cpp
#endif
