/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifdef CreateDialog
#undef CreateDialog
#endif
#include <iostream>
#include <wx/dcclient.h>
#include "GDCore/Tools/Log.h"
#include <wx/filename.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/scrolbar.h>
#include <wx/config.h>
#include "GDCore/Tools/Localization.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/Project/ImageManager.h"
#include "GDCore/Project/LayoutEditorPreviewer.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/CodeExecutionEngine.h"
#include "GDCpp/Runtime/SceneNameMangler.h"
#include "GDCpp/Runtime/SoundManager.h"
#include "GDCpp/Runtime/FontManager.h"
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/RuntimeSpriteObject.h"
#include "GDCpp/IDE/CodeCompilationHelpers.h"
#include "GDCpp/IDE/Dialogs/DebuggerGUI.h"
#include "GDCpp/IDE/Dialogs/ProfileDlg.h"
#include "GDCpp/IDE/Dialogs/RenderDialog.h"
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
    //The external preview window is created only when necessary to prevent it to be shown
    //at creation on Linux.
    //Additional editors are created in SetParentAuiManager method.

    //Loading some GUI elements
    reloadingIconImage.loadFromFile("res/compile128.png");
    reloadingIconSprite.setTexture(reloadingIconImage);
    reloadingText.setColor(sf::Color(0,0,0,128));
    reloadingText.setString(_("Compiling..."));
    reloadingText.setCharacterSize(40);
    reloadingText.setFont(*FontManager::Get()->GetFont(""));

    //Launch now events compilation if needed :
    //Useful when opening a scene for the first time for example.
    if ( editor.GetLayout().CompilationNeeded() && !CodeCompiler::Get()->HasTaskRelatedTo(editor.GetLayout()) )
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(editor.GetProject(), editor.GetLayout());
}

CppLayoutPreviewer::~CppLayoutPreviewer()
{
    editor.GetLayout().SetProfiler(NULL);
};

/**
 * Go in preview mode
 */
bool CppLayoutPreviewer::LaunchPreview( )
{
    std::cout << "Launching GD C++ Platform preview..." << std::endl;

    #if defined(MACOS)
    wxString error = _("GDevelop for Mac OS X does not support creating native games :/\n\nInstead, please use the HTML5 platform for your game: you can activate it from the Extensions in the project manager.");
    wxLogWarning(error);
    return false;
    #else

    if ( wxDirExists(wxFileName::FileName(editor.GetProject().GetProjectFile()).GetPath()))
        wxSetWorkingDirectory(wxFileName::FileName(editor.GetProject().GetProjectFile()).GetPath());

    playing = false;

    editor.setFramerateLimit(editor.GetProject().GetMaximumFPS());

    if ( debugger ) debugger->Play();

    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlay, true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPause, false);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->EnableButton(idRibbonPlayWin, true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->Refresh();

    RefreshFromLayout();
    return true;
    #endif
}

/**
 * Go in edition mode
 */
void CppLayoutPreviewer::StopPreview()
{
    std::cout << "Stopping GD C++ preview..." << std::endl;

    CodeCompiler::Get()->EnableTaskRelatedTo(editor.GetLayout());
    playing = false;

    if ( externalPreviewWindow ) externalPreviewWindow->Show(false);
    previewScene.ChangeRenderWindow(&editor);
    previewScene.GetCodeExecutionEngine()->Unload();

    //Parse now the results of profiling
    if ( profiler ) profiler->ParseProfileEvents();

    //Reset the scene.
    RuntimeScene newScene(&editor, &previewGame);
    previewScene = newScene;
    if ( debugger ) previewScene.debugger = debugger.get();
    if ( debugger ) previewScene.objectsInstances.SetDebugger(debugger);
    if ( profiler ) previewScene.SetProfiler(profiler.get());
    if ( profiler ) editor.GetLayout().SetProfiler(profiler.get());
    if ( debugger ) debugger->Pause();
    previewGame.GetSoundManager().ClearAllSoundsAndMusics();
}

void CppLayoutPreviewer::OnUpdate()
{
    if (isReloading)
    {
        if ( CodeCompiler::Get()->CompilationInProcess()  ) //We're still waiting for compilation to finish
            RenderCompilationScreen(); //Display a message when compiling
        else //Everything is finished, reloading is almost complete!
            RefreshFromLayoutSecondPart();

        return;
    }

    if (playing)
    {
        bool changeRequested = previewScene.RenderAndStep();
        if (externalPreviewWindow && externalPreviewWindow->IsShown()) //Be sure that the editor is updated.
        {
            editor.clear(sf::Color(255,255,255));
            editor.display();
        }

        if (changeRequested)
        {
            auto request = previewScene.GetRequestedChange();
            if (request.change == RuntimeScene::SceneChange::STOP_GAME)
                mainFrameWrapper.GetInfoBar()->ShowMessage(_( "In the compiled game, the game will be stopped." ));
            else if (request.change == RuntimeScene::SceneChange::REPLACE_SCENE)
                mainFrameWrapper.GetInfoBar()->ShowMessage(_( "In the compiled game, the scene will be stopped and replaced by " ) + "\"" + request.requestedScene + "\"");
            else if (request.change == RuntimeScene::SceneChange::PUSH_SCENE)
                mainFrameWrapper.GetInfoBar()->ShowMessage(_( "In the compiled game, the scene will be paused and replaced by " ) + "\"" + request.requestedScene + "\"");
            else if (request.change == RuntimeScene::SceneChange::POP_SCENE)
                mainFrameWrapper.GetInfoBar()->ShowMessage(_( "In the compiled game, the scene will be stopped and the game will go to the previous paused one"));
        }
    }
    else //Paused
        previewScene.RenderWithoutStep();
}

void CppLayoutPreviewer::RefreshFromLayout()
{
    cout << "Scene Editor canvas reloading... (step 1/2)" << endl;
    isReloading = true;

    previewGame.GetSoundManager().ClearAllSoundsAndMusics();
    if ( editor.GetProject().GetImageManager() ) editor.GetProject().GetImageManager()->PreventImagesUnloading(); //Images are normally unloaded and loaded again when reloading the scene. We can prevent this to happen as it is time wasting.

    //Reset game
    RuntimeGame newGame;
    previewGame = newGame;
    previewGame.LoadFromProject(editor.GetProject());
    previewGame.SetImageManager(editor.GetProject().GetImageManager()); //Use same image manager.

    //Reset scene
    RuntimeScene newScene(&editor, &previewGame);
    previewScene = newScene;
    playing = false;

    if ( debugger ) previewScene.debugger = debugger.get();
    if ( debugger ) previewScene.objectsInstances.SetDebugger(debugger);
    if ( profiler ) previewScene.SetProfiler(profiler.get());
    if ( profiler ) editor.GetLayout().SetProfiler(profiler.get());

    //Launch now events compilation if it has not been launched by another way (i.e: by the events editor).
    if ( editor.GetLayout().CompilationNeeded() && !CodeCompiler::Get()->HasTaskRelatedTo(editor.GetLayout()) )
    {
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(editor.GetProject(), editor.GetLayout());
        mainFrameWrapper.GetInfoBar()->ShowMessage(_("Changes made to events will be taken into account when you switch to Editing mode"));
    }

    return; //RefreshFromLayoutSecondPart() will be called by OnUpdate() when appropriate
}

void CppLayoutPreviewer::RefreshFromLayoutSecondPart()
{
    cout << "Scene canvas reloading... (step 2/2)" << endl;
    CodeCompiler::Get()->DisableTaskRelatedTo(editor.GetLayout());

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
        gd::LogError(_("Compilation of events failed, and scene cannot be previewed. Please report this problem to GDevelop's developer, joining this file:\n")
                   +CodeCompiler::Get()->GetOutputDirectory()+"LatestCompilationOutput.txt");
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

    //Create now the window if necessary (not done in the constructor because, on linux, the window was not hidden).
    if (!externalPreviewWindow)
        externalPreviewWindow = std::make_shared<RenderDialog>(editor.GetParentControl(), this);

    externalPreviewWindow->Show(true);

    externalPreviewWindow->SetSizeOfRenderingZone(editor.GetProject().GetMainWindowDefaultWidth(), editor.GetProject().GetMainWindowDefaultHeight());
    previewScene.ChangeRenderWindow(externalPreviewWindow->renderCanvas);
}
void CppLayoutPreviewer::ExternalWindowClosed()
{
    if (playing)
        PlayPreview(); //Go back to the internal preview
}

void CppLayoutPreviewer::PausePreview()
{
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
    //Ignore all events
    sf::Event event;
    while ( editor.pollEvent( event ) )
        ;

    //Render the screen
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
            wxLogNull noLogPlease; //Avoid libpng warnings.
            debugger = std::shared_ptr<DebuggerGUI>(new DebuggerGUI(editor.GetParentControl(), previewScene, [this](bool newState) {
                playing = newState;
            }));
            if ( !parentAuiManager->GetPane("DBG").IsOk() )
                parentAuiManager->AddPane( debugger.get(), wxAuiPaneInfo().Name( wxT( "DBG" ) ).Float().CloseButton( true ).Caption( _( "Debugger" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(200, 100).Show(false) );
            else
                parentAuiManager->GetPane("DBG").Window(debugger.get());
        }
        if ( !profiler )
        {
            profiler = std::make_shared<ProfileDlg>(editor.GetParentControl(), *this);
            editor.GetLayout().SetProfiler(profiler.get());
            if ( !parentAuiManager->GetPane("PROFILER").IsOk() )
                parentAuiManager->AddPane( profiler.get(), wxAuiPaneInfo().Name( wxT( "PROFILER" ) ).Float().CloseButton( true ).Caption( _( "Profiling" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(50, 50).BestSize(230,100).Show(false) );
            else
                parentAuiManager->GetPane("PROFILER").Window(profiler.get());
        }
        parentAuiManager->Update();
    }
}

void CppLayoutPreviewer::CreatePreviewRibbonTools(wxRibbonButtonBar & buttonBar)
{
    bool hideLabels = false;
    wxConfigBase::Get()->Read( _T( "/Skin/HideLabels" ), &hideLabels );

    buttonBar.AddButton(idRibbonPlay, !hideLabels ? _("Play") : gd::String(), gd::SkinHelper::GetRibbonIcon("start"), _("Start the preview"));
    buttonBar.AddButton(idRibbonPlayWin, !hideLabels ? _("Play in a window") : gd::String(), gd::SkinHelper::GetRibbonIcon("startwindow"), _("Start the preview in an external window"));
    buttonBar.AddButton(idRibbonPause, !hideLabels ? _("Pause") : gd::String(), gd::SkinHelper::GetRibbonIcon("pause"), _("Pause the preview"));
    buttonBar.AddButton(idRibbonDebugger, !hideLabels ? _("Debugger") : gd::String(), gd::SkinHelper::GetRibbonIcon("bug"), _("Show the debugger to view the state of the game"));
    buttonBar.AddButton(idRibbonProfiler, !hideLabels ? _("Profiling") : gd::String(), gd::SkinHelper::GetRibbonIcon("profiler"), _("Show the profiler to monitor performances"));
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
