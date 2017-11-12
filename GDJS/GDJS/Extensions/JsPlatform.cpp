/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Project.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "GDCore/IDE/ExtensionsLoader.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/CommonTools.h"
#include "GDJS/Extensions/JsPlatform.h"
#include "GDJS/IDE/Exporter.h"
#include "GDCore/Tools/Log.h"
#if !defined(GD_NO_WX_GUI)
#include <wx/filename.h>
#include <wx/bitmap.h>
#include <wx/time.h>
#endif

//Built-in extensions
#include "GDJS/Extensions/Builtin/SpriteExtension.h"
#include "GDJS/Extensions/Builtin/CommonInstructionsExtension.h"
#include "GDJS/Extensions/Builtin/MathematicalToolsExtension.h"
#include "GDJS/Extensions/Builtin/BaseObjectExtension.h"
#include "GDJS/Extensions/Builtin/VariablesExtension.h"
#include "GDJS/Extensions/Builtin/KeyboardExtension.h"
#include "GDJS/Extensions/Builtin/MouseExtension.h"
#include "GDJS/Extensions/Builtin/SceneExtension.h"
#include "GDJS/Extensions/Builtin/CameraExtension.h"
#include "GDJS/Extensions/Builtin/TimeExtension.h"
#include "GDJS/Extensions/Builtin/AudioExtension.h"
#include "GDJS/Extensions/Builtin/NetworkExtension.h"
#include "GDJS/Extensions/Builtin/WindowExtension.h"
#include "GDJS/Extensions/Builtin/CommonConversionsExtension.h"
#include "GDJS/Extensions/Builtin/StringInstructionsExtension.h"
#include "GDJS/Extensions/Builtin/JoystickExtension.h"
#include "GDJS/Extensions/Builtin/ExternalLayoutsExtension.h"
#include "GDJS/Extensions/Builtin/AdvancedExtension.h"
#include "GDJS/Extensions/Builtin/FileExtension.h"

namespace gdjs
{

JsPlatform *JsPlatform::singleton = NULL;


#if !defined(GD_NO_WX_GUI)
/**
 * \brief Allow the platform to launch preview in a browser.
 *
 * This class inherits from gd::LayoutEditorPreviewer and is provided
 * to the IDE thanks to the JsPlatform::GetLayoutPreviewer method.
 *
 * \see JsPlatform
 * \see gd::LayoutEditorPreviewer
 */
class Previewer : public gd::LayoutEditorPreviewer
{
public:
    Previewer(gd::Project & project_, gd::Layout & layout_, gd::ExternalLayout * externalLayout_ = NULL) :
        project(project_),
        layout(layout_),
        externalLayout(externalLayout_)
    {
    }

    virtual bool LaunchPreview()
    {
        gd::String exportDir = wxFileName::GetTempDir()+"/GDTemporaries/JSPreview/";

        Exporter exporter(gd::NativeFileSystem::Get());
        bool exportSuccessed = externalLayout ?
            exporter.ExportExternalLayoutForPixiPreview(project, layout, *externalLayout, exportDir) :
            exporter.ExportLayoutForPixiPreview(project, layout, exportDir);

        if (!exportSuccessed)
        {
            gd::LogError(_("An error occurred when launching the preview:\n\n")+exporter.GetLastError()
                       +_("\n\nPlease report this error on the GDevelop website, or contact the extension developer if it seems related to a third party extension."));
        }

        //Without "http://", the function fails (on Windows at least).
        //The timestamp is here to prevent browsers caching contents.
        if ( !wxLaunchDefaultBrowser("http://localhost:2828?"+gd::String::From(wxGetLocalTime())) )
        {
            gd::LogError(_("Unable to launch your browser :(\nManually open your browser and type \"localhost:2828\" in\nthe address bar (without the quotes) to launch the preview!"));
        }

        return false;
    }
private:
    gd::Project & project;
    gd::Layout & layout;
    gd::ExternalLayout * externalLayout;
};
#endif

void JsPlatform::OnIDEInitialized()
{
    //Initializing the tiny web server used to preview the games
    #if !defined(GD_NO_WX_GUI)
    std::cout << " * Starting web server..." << std::endl;
    gd::String exportDir = wxFileName::GetTempDir()+"/GDTemporaries/JSPreview/";
    httpServer.Run(exportDir);
    #endif
}

#if !defined(GD_NO_WX_GUI)
std::shared_ptr<gd::LayoutEditorPreviewer> JsPlatform::GetLayoutPreviewer(gd::LayoutEditorCanvas & editor) const
{
    return std::shared_ptr<gd::LayoutEditorPreviewer>(new Previewer(
        editor.GetProject(), editor.GetLayout(), editor.GetExternalLayout()));
}

std::vector<std::shared_ptr<gd::ProjectExporter>> JsPlatform::GetProjectExporters() const
{
    return std::vector<std::shared_ptr<gd::ProjectExporter>>{ std::shared_ptr<gd::ProjectExporter>(new Exporter(gd::NativeFileSystem::Get())) };
}
#endif

 //When compiling with emscripten, extensions exposes specific functions to create them.
#if defined(EMSCRIPTEN)
extern "C" {
gd::PlatformExtension * CreateGDJSPlatformBehaviorExtension();
gd::PlatformExtension * CreateGDJSDestroyOutsideBehaviorExtension();
gd::PlatformExtension * CreateGDJSTiledSpriteObjectExtension();
gd::PlatformExtension * CreateGDJSDraggableBehaviorExtension();
gd::PlatformExtension * CreateGDJSTopDownMovementBehaviorExtension();
gd::PlatformExtension * CreateGDJSTextObjectExtension();
gd::PlatformExtension * CreateGDJSAdMobObjectExtension();
gd::PlatformExtension * CreateGDJSPanelSpriteObjectExtension();
gd::PlatformExtension * CreateGDJSAnchorBehaviorExtension();
gd::PlatformExtension * CreateGDJSPrimitiveDrawingExtension();
gd::PlatformExtension * CreateGDJSTextEntryObjectExtension();
gd::PlatformExtension * CreateGDJSInventoryExtension();
gd::PlatformExtension * CreateGDJSLinkedObjectsExtension();
gd::PlatformExtension * CreateGDJSSystemInfoExtension();
gd::PlatformExtension * CreateGDJSShopifyExtension();
}
#endif

JsPlatform::JsPlatform() :
    gd::Platform()
{
    //Adding built-in extensions.
    std::cout << "* Loading builtin extensions... "; std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new BaseObjectExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new SpriteExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new CommonInstructionsExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new CommonConversionsExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new VariablesExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new MouseExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new KeyboardExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new JoystickExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new SceneExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new TimeExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new MathematicalToolsExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new CameraExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new AudioExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new FileExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new NetworkExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new WindowExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new StringInstructionsExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new AdvancedExtension)); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(new ExternalLayoutsExtension)); std::cout.flush();
    std::cout << "done." << std::endl;

    #if defined(EMSCRIPTEN) //When compiling with emscripten, hardcode extensions to load.
    std::cout << "* Loading other extensions... "; std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(CreateGDJSPlatformBehaviorExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(CreateGDJSDestroyOutsideBehaviorExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(CreateGDJSTiledSpriteObjectExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(CreateGDJSDraggableBehaviorExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(CreateGDJSTopDownMovementBehaviorExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(CreateGDJSTextObjectExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(CreateGDJSAdMobObjectExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(CreateGDJSPanelSpriteObjectExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(CreateGDJSAnchorBehaviorExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(CreateGDJSPrimitiveDrawingExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(CreateGDJSTextEntryObjectExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(CreateGDJSInventoryExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(CreateGDJSLinkedObjectsExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(CreateGDJSSystemInfoExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<gd::PlatformExtension>(CreateGDJSShopifyExtension())); std::cout.flush();
    #endif
    std::cout << "done." << std::endl;
};

JsPlatform & JsPlatform::Get()
{
    if ( !singleton ) singleton = new JsPlatform;

    return *singleton;
}

void JsPlatform::DestroySingleton()
{
    if ( singleton )
    {
        delete singleton;
        singleton = NULL;
    }
}

#if !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the platform class
 */
extern "C" gd::Platform * GD_API CreateGDPlatform() {
    return &JsPlatform::Get();
}

/**
 * Used by GDevelop to destroy the platform class
 */
extern "C" void GD_API DestroyGDPlatform() {
    JsPlatform::DestroySingleton();
}
#endif

}
