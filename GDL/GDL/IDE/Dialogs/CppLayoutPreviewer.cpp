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
#include <wx/config.h>
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/PlatformDefinition/ImageManager.h"
#include "GDCore/PlatformDefinition/LayoutEditorPreviewer.h"
#include "GDL/Project.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Project.h"
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
#include "CppLayoutPreviewer.h"
#undef GetObject

sf::Texture CppLayoutPreviewer::reloadingIconImage;
sf::Sprite CppLayoutPreviewer::reloadingIconSprite;
sf::Text CppLayoutPreviewer::reloadingText;

const long CppLayoutPreviewer::idRibbonRefresh = wxNewId();
const long CppLayoutPreviewer::idRibbonPlay = wxNewId();
const long CppLayoutPreviewer::idRibbonPlayWin = wxNewId();
const long CppLayoutPreviewer::idRibbonPause = wxNewId();
const long CppLayoutPreviewer::idRibbonResetGlobalVars = wxNewId();
const long CppLayoutPreviewer::idRibbonDebugger = wxNewId();
const long CppLayoutPreviewer::idRibbonProfiler = wxNewId();

CppLayoutPreviewer::CppLayoutPreviewer(gd::LayoutEditorCanvas & editor_) :
    previewScene(&editor_, &previewGame),
    editor(editor_),
    mainFrameWrapper(editor.GetMainFrameWrapper()),
    isReloading(false),
    playing(false)
{
    //Creating additional editors used specifically by our platform.
    externalPreviewWindow = boost::shared_ptr<RenderDialog>(new RenderDialog(editor.GetParentControl(), this) );
    //Others editors are created in SetParentAuiManager method.

    //Loading some GUI elements
    reloadingIconImage.loadFromFile("res/compile128.png");
    reloadingIconSprite.setTexture(reloadingIconImage);
    reloadingText.setColor(sf::Color(0,0,0,128));
    reloadingText.setString(string(_("Compiling...").mb_str()));
    reloadingText.setCharacterSize(40);
    reloadingText.setFont(*FontManager::GetInstance()->GetFont(""));

    //Launch now events compilation if needed :
    //Useful when opening a scene for the first time for example.
    if ( editor.GetLayout().CompilationNeeded() && !CodeCompiler::GetInstance()->HasTaskRelatedTo(editor.GetLayout()) )
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(editor.GetProject(), editor.GetLayout());
}

/**
 * Go in preview mode
 */
bool CppLayoutPreviewer::LaunchPreview( )
{
    std::cout << "Launching GD C++ Platform preview..." << std::endl;

    if ( wxDirExists(wxFileName::FileName(editor.GetProject().GetProjectFile()).GetPath()))
        wxSetWorkingDirectory(wxFileName::FileName(editor.GetProject().GetProjectFile()).GetPath());

    previewScene.running = false;
    playing = false;

    editor.setFramerateLimit(editor.GetProject().GetMaximumFPS());

    if ( debugger ) debugger->Play();

    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlay, true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPause, false);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlayWin, true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->Refresh();

    RefreshFromLayout();
    return true;
}

/**
 * Go in edition mode
 */
void CppLayoutPreviewer::StopPreview()
{
    std::cout << "Stopping GD C++ preview..." << std::endl;

    CodeCompiler::GetInstance()->EnableTaskRelatedTo(editor.GetLayout());
    previewScene.running = false;
    playing = false;

    if ( externalPreviewWindow ) externalPreviewWindow->Show(false);
    previewScene.ChangeRenderWindow(&editor);
    previewScene.GetCodeExecutionEngine()->Unload();

    //Parse now the results of profiling
    if ( profiler ) profiler->ParseProfileEvents();

    //Reset the scene.
    RuntimeScene newScene(&editor, &previewGame);
    previewScene = newScene;
    previewScene.running = false;
    if ( debugger ) previewScene.debugger = debugger.get();
    if ( profiler ) previewScene.SetProfiler(profiler.get());
    if ( profiler ) editor.GetLayout().SetProfiler(profiler.get());
    if ( debugger ) debugger->Pause();
    SoundManager::GetInstance()->ClearAllSoundsAndMusics();
}

void CppLayoutPreviewer::OnUpdate()
{
    if ( isReloading )
    {
        if ( CodeCompiler::GetInstance()->CompilationInProcess()  ) //We're still waiting for compilation to finish
        {
            RenderCompilationScreen(); //Display a message when compiling
            return;
        }
        else //Everything is finished, reloading is almost complete!
            RefreshFromLayoutSecondPart();

    }
    else //We're displaying the scene
    {
        if ( previewScene.running )
        {
            //Render the scene
            int retourEvent = previewScene.RenderAndStep();
            if ( externalPreviewWindow && externalPreviewWindow->IsShown() ) //Be sure that the editor is updated.
            {
                editor.clear(sf::Color(255,255,255));
                editor.display();
            }

            if ( retourEvent == -2 )
                mainFrameWrapper.GetInfoBar()->ShowMessage(_( "In the compiled game, the game will quit." ));
            else if ( retourEvent != -1 )
            {
                if (retourEvent > 0 && static_cast<unsigned>(retourEvent) < editor.GetProject().GetLayoutCount())
                    mainFrameWrapper.GetInfoBar()->ShowMessage(_( "In the compiled game, the scene will change for " ) + "\"" + editor.GetProject().GetLayout(retourEvent).GetName() + "\"");
            }
        }
        else if ( !previewScene.running ) //Paused
            previewScene.RenderWithoutStep();
    }
}

void CppLayoutPreviewer::RefreshFromLayout()
{
    cout << "Scene Editor canvas reloading... ( Step 1/2 )" << endl;
    isReloading = true;

    SoundManager::GetInstance()->ClearAllSoundsAndMusics();
    if ( editor.GetProject().GetImageManager() ) editor.GetProject().GetImageManager()->PreventImagesUnloading(); //Images are normally unloaded and loaded again when reloading the scene. We can prevent this to happen as it is time wasting.

    //Reset editor.GetProject()
    previewGame = editor.GetProject();
    previewGame.SetImageManager(editor.GetProject().GetImageManager()); //Use same image manager.

    //Reset scene
    RuntimeScene newScene(&editor, &previewGame);
    previewScene = newScene;
    previewScene.running = false;
    playing = false;
    if ( debugger ) previewScene.debugger = debugger.get();
    if ( profiler ) previewScene.SetProfiler(profiler.get());
    if ( profiler ) editor.GetLayout().SetProfiler(profiler.get());

    //Launch now events compilation if it has not been launched by another way. ( Events editor for example )
    if ( editor.GetLayout().CompilationNeeded() && !CodeCompiler::GetInstance()->HasTaskRelatedTo(editor.GetLayout()) )
    {
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(editor.GetProject(), editor.GetLayout());
        mainFrameWrapper.GetInfoBar()->ShowMessage(_("Changes made to events will be taken into account when you switch to Edition mode"));
    }

    return; //RefreshFromLayoutSecondPart() will be called by OnUpdate() when appropriate
}

void CppLayoutPreviewer::RefreshFromLayoutSecondPart()
{
    cout << "Scene canvas reloading... ( Step 2/2 )" << endl;
    CodeCompiler::GetInstance()->DisableTaskRelatedTo(editor.GetLayout());

    //Switch the working directory as we are making calls to the runtime scene
    if ( wxDirExists(wxFileName::FileName(editor.GetProject().GetProjectFile()).GetPath()))
        wxSetWorkingDirectory(wxFileName::FileName(editor.GetProject().GetProjectFile()).GetPath());

    //Load the scene ( compilation is done )
    std::cout << "Initializing RuntimeScene from layout..." << std::endl;
    previewScene.LoadFromScene( editor.GetLayout() );

    std::cout << "Loading compiled code..." << std::endl;
    if ( !previewScene.GetCodeExecutionEngine()->LoadFromDynamicLibrary(editor.GetLayout().GetCompiledEventsFile(),
                                                                        "GDSceneEvents"+gd::SceneNameMangler::GetMangledSceneName(editor.GetLayout().GetName())) )
    {
        wxLogError(_("Compilation of events failed, and scene cannot be previewed. Please report this problem to Game Develop's developer, joining this file:\n")
                   +CodeCompiler::GetInstance()->GetOutputDirectory()+"LatestCompilationOutput.txt");
        editor.GoToEditingState();

        return;
    }
    editor.GetLayout().SetRefreshNotNeeded();

    //We were preventing images unloading so as to be sure not to waste time unloading and reloading just after scenes images.
    if ( editor.GetProject().GetImageManager() ) editor.GetProject().GetImageManager()->EnableImagesUnloading();

    isReloading = false;
    PlayPreview();
}

void CppLayoutPreviewer::PlayPreview()
{
    playing = true;
    if ( wxDirExists(wxFileName::FileName(editor.GetProject().GetProjectFile()).GetPath()))
        wxSetWorkingDirectory(wxFileName::FileName(editor.GetProject().GetProjectFile()).GetPath());
    std::cout << previewScene.GetProfiler() << "<-" << std::endl;
    previewScene.running = true;
    if ( externalPreviewWindow ) externalPreviewWindow->Show(false);
    previewScene.ChangeRenderWindow(&editor);

    if ( debugger ) debugger->Play();

    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlay, false);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPause, true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlayWin, true);
}

void CppLayoutPreviewer::OnPreviewPlayBtClick( wxCommandEvent & event )
{
    PlayPreview();
}
void CppLayoutPreviewer::OnPreviewPlayWindowBtClick( wxCommandEvent & event )
{
    PlayPreview();

    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlay, true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPause, true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlayWin, false);

    if ( externalPreviewWindow )
    {
        externalPreviewWindow->Show(true);
        externalPreviewWindow->renderCanvas->setFramerateLimit( previewGame.GetMaximumFPS() );

        externalPreviewWindow->SetSizeOfRenderingZone(editor.GetProject().GetMainWindowDefaultWidth(), editor.GetProject().GetMainWindowDefaultHeight());
        previewScene.ChangeRenderWindow(externalPreviewWindow->renderCanvas);

        externalPreviewWindow->SetSizeOfRenderingZone(editor.GetProject().GetMainWindowDefaultWidth(), editor.GetProject().GetMainWindowDefaultHeight());
        previewScene.ChangeRenderWindow(externalPreviewWindow->renderCanvas);
    }
}
void CppLayoutPreviewer::ExternalWindowClosed()
{
    if ( previewScene.running )
        PlayPreview(); //Go back to the internal preview
}

void CppLayoutPreviewer::PausePreview()
{
    previewScene.running = false;
    playing = false;
    wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());

    if ( debugger ) debugger->Pause();

    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlay, true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPause, false);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlayWin, true);
}

void CppLayoutPreviewer::OnPreviewPauseBtClick( wxCommandEvent & event )
{
    PausePreview();
}

void CppLayoutPreviewer::OnPreviewDebugBtClick( wxCommandEvent & event )
{
    if ( !parentAuiManager || !debugger ) return;

    parentAuiManager->GetPane(debugger.get()).Show();
    parentAuiManager->Update();
}

void CppLayoutPreviewer::OnPreviewProfilerBtClick( wxCommandEvent & event )
{
    if ( !parentAuiManager || !profiler ) return;

    parentAuiManager->GetPane(profiler.get()).Show();
    parentAuiManager->Update();
}

void CppLayoutPreviewer::RenderCompilationScreen()
{
    sf::Event event;
    while ( editor.pollEvent( event ) )
        ;

    editor.clear(sf::Color(255,255,255));

    editor.pushGLStates();
    editor.setView(sf::View(sf::Vector2f(editor.getSize().x/2, editor.getSize().y/2), sf::Vector2f(editor.getSize().x, editor.getSize().y)));

    reloadingIconSprite.setTexture(reloadingIconImage);
    reloadingIconSprite.setColor(sf::Color(255,255,255,128));
    reloadingIconSprite.setPosition(editor.getSize().x/2-reloadingIconSprite.getLocalBounds().width/2, editor.getSize().y/2-reloadingIconSprite.getLocalBounds().height/2);
    reloadingText.setPosition(editor.getSize().x/2-reloadingText.getLocalBounds().width/2, reloadingIconSprite.getPosition().y+reloadingIconSprite.getLocalBounds().height+10);

    editor.draw(reloadingIconSprite);
    editor.draw(reloadingText);

    editor.popGLStates();
    editor.display();
}

void CppLayoutPreviewer::SetParentAuiManager(wxAuiManager * manager)
{
    parentAuiManager = manager;

    //Create now subeditors if needed
    if ( manager && editor.GetParentControl() )
    {
        if ( !debugger )
        {
            debugger = boost::shared_ptr<DebuggerGUI>(new DebuggerGUI(editor.GetParentControl(), previewScene) );
            if ( !parentAuiManager->GetPane("DBG").IsOk() )
                parentAuiManager->AddPane( debugger.get(), wxAuiPaneInfo().Name( wxT( "DBG" ) ).Float().CloseButton( true ).Caption( _( "Debugger" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(200, 100).Show(false) );
            else
                parentAuiManager->GetPane("DBG").Window(debugger.get());
        }
        if ( !profiler )
        {
            profiler = boost::shared_ptr<ProfileDlg>(new ProfileDlg(editor.GetParentControl(), *this));
            editor.GetLayout().SetProfiler(profiler.get());
            if ( !parentAuiManager->GetPane("PROFILER").IsOk() )
                parentAuiManager->AddPane( profiler.get(), wxAuiPaneInfo().Name( wxT( "PROFILER" ) ).Float().CloseButton( true ).Caption( _( "Profiling" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(50, 50).BestSize(230,100).Show(false) );
            else
                parentAuiManager->GetPane("PROFILER").Window(debugger.get());
        }
    }
}

void CppLayoutPreviewer::CreatePreviewRibbonTools(wxRibbonButtonBar & buttonBar)
{
    bool hideLabels = false;
    wxConfigBase::Get()->Read( _T( "/Skin/HideLabels" ), &hideLabels );
    gd::CommonBitmapManager * bitmapManager = gd::CommonBitmapManager::GetInstance();

    buttonBar.AddButton(idRibbonPlay, !hideLabels ? _("Play") : "", bitmapManager->starticon24);
    buttonBar.AddButton(idRibbonPlayWin, !hideLabels ? _("Play in a window") : "", bitmapManager->startwindow24);
    buttonBar.AddButton(idRibbonPause, !hideLabels ? _("Pause") : "", bitmapManager->pauseicon24);
    buttonBar.AddButton(idRibbonDebugger, !hideLabels ? _("Debugger") : "", bitmapManager->bug24);
    buttonBar.AddButton(idRibbonProfiler, !hideLabels ? _("Profiling") : "", bitmapManager->profiler24);
}

void CppLayoutPreviewer::ConnectPreviewRibbonToolsEvents()
{
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonPlay, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CppLayoutPreviewer::OnPreviewPlayBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonPlayWin, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CppLayoutPreviewer::OnPreviewPlayWindowBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonPause, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CppLayoutPreviewer::OnPreviewPauseBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDebugger, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CppLayoutPreviewer::OnPreviewDebugBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonProfiler, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CppLayoutPreviewer::OnPreviewProfilerBtClick, NULL, this);
}

gd::Layout & CppLayoutPreviewer::GetLayout()
{
    return editor.GetLayout();
}

gd::Project & CppLayoutPreviewer::GetProject()
{
    return editor.GetProject();
}

#endif
