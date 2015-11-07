/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef SCENEEDITORCANVAS_H
#define SCENEEDITORCANVAS_H
#include <memory>
#include <SFML/Graphics.hpp>
#include "GDCore/Project/LayoutEditorPreviewer.h"
#include "GDCore/Project/Project.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"
namespace gd { class InitialInstancesContainer; }
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class InitialInstance; }
namespace gd { class LayoutEditorCanvasOptions; }
namespace gd { class MainFrameWrapper; }
class wxAuiManager;
class DebuggerGUI;
class ProfileDlg;
class RenderDialog;
class InstancesRenderer;

/**
 * \brief The new scene editor canvas
 */
class GD_API CppLayoutPreviewer : public gd::LayoutEditorPreviewer
{
public:
    CppLayoutPreviewer(gd::LayoutEditorCanvas & editor);
    virtual ~CppLayoutPreviewer();

    /**
     * \brief Return a reference to the scene used for preview inside the editor.
     */
    RuntimeScene & GetRuntimeScene() { return previewScene; }

    /**
     * \brief Return a reference to the layout edited
     */
    gd::Layout & GetLayout();

    /**
     * \brief Return a reference to the layout edited
     */
    gd::Project & GetProject();

    /**
     * Can be called by the external window, owned by the editor, so as to notify the editor that
     * the window has been closed.
     */
    void ExternalWindowClosed();

    /**
     * Return a std::shared_ptr to the profiler owned by the editor. Can be NULL.
     */
    std::shared_ptr<ProfileDlg> GetProfileDialog() const { return profiler; }

    virtual void SetParentAuiManager(wxAuiManager * parentAuiManager_);

    virtual void CreatePreviewRibbonTools(wxRibbonButtonBar & buttonBar);
    virtual void ConnectPreviewRibbonToolsEvents();

    virtual void OnUpdate();

    virtual bool LaunchPreview();
    virtual void StopPreview();
    virtual void PlayPreview();
    virtual void PausePreview();

    virtual bool IsPaused() { return !playing; }


private:

    virtual void RefreshFromLayout();

    virtual void OnPreviewPlayBtClick( wxCommandEvent & event );
    virtual void OnPreviewPlayWindowBtClick( wxCommandEvent & event );
    virtual void OnPreviewPauseBtClick( wxCommandEvent & event );
    virtual void OnPreviewDebugBtClick( wxCommandEvent & event );
    virtual void OnPreviewProfilerBtClick( wxCommandEvent & event );

    void RefreshFromLayoutSecondPart();

    //Rendering methods. The rendering during preview is done by previewScene.
    void RenderCompilationScreen();

    //Members used during preview or compilation
    RuntimeGame previewGame; ///< Runtime game used during preview.
    RuntimeScene previewScene; ///< Runtime scene used to render or preview the scene.
    static sf::Texture reloadingIconImage;
    static sf::Sprite reloadingIconSprite;
    static sf::Text reloadingText;

    //Editors owned by the previewer
    std::shared_ptr<RenderDialog> externalPreviewWindow; ///< The external preview window: Can be NULL if OnPreviewPlayWindowBtClick was not called.
    std::shared_ptr<DebuggerGUI> debugger;
    std::shared_ptr<ProfileDlg> profiler;

    //Custom ribbons buttons identifiers
    static const long idRibbonRefresh;
    static const long idRibbonPlay;
    static const long idRibbonPlayWin;
    static const long idRibbonPause;
    static const long idRibbonResetGlobalVars;
    static const long idRibbonDebugger;
    static const long idRibbonProfiler;

    gd::LayoutEditorCanvas & editor;
    gd::MainFrameWrapper & mainFrameWrapper;
    wxAuiManager * parentAuiManager;

    //State management
    bool isReloading; ///< Our previewer is a bit special: It sometimes need to wait for a compilation to finish before going into preview mode.
    bool playing;
    bool running;
};

#endif // SCENEEDITORCANVAS_H
#endif
