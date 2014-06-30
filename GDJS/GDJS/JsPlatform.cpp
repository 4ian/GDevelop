/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "GDCore/IDE/ExtensionsLoader.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/CommonTools.h"
#include "GDJS/JsPlatform.h"
#include "GDJS/Exporter.h"
#include "GDCore/Tools/Log.h"
#if !defined(GD_NO_WX_GUI)
#include <wx/filename.h>
#include <wx/bitmap.h>
#include <wx/time.h>
#endif

//Built-in extensions
#include "GDJS/BuiltinExtensions/SpriteExtension.h"
#include "GDJS/BuiltinExtensions/CommonInstructionsExtension.h"
#include "GDJS/BuiltinExtensions/MathematicalToolsExtension.h"
#include "GDJS/BuiltinExtensions/BaseObjectExtension.h"
#include "GDJS/BuiltinExtensions/VariablesExtension.h"
#include "GDJS/BuiltinExtensions/KeyboardExtension.h"
#include "GDJS/BuiltinExtensions/MouseExtension.h"
#include "GDJS/BuiltinExtensions/SceneExtension.h"
#include "GDJS/BuiltinExtensions/CameraExtension.h"
#include "GDJS/BuiltinExtensions/TimeExtension.h"
#include "GDJS/BuiltinExtensions/AudioExtension.h"
#include "GDJS/BuiltinExtensions/NetworkExtension.h"
#include "GDJS/BuiltinExtensions/WindowExtension.h"
#include "GDJS/BuiltinExtensions/CommonConversionsExtension.h"
#include "GDJS/BuiltinExtensions/StringInstructionsExtension.h"
#include "GDJS/BuiltinExtensions/JoystickExtension.h"
#include "GDJS/BuiltinExtensions/ExternalLayoutsExtension.h"
#include "GDJS/BuiltinExtensions/AdvancedExtension.h"
#include "GDJS/BuiltinExtensions/FileExtension.h"

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
    Previewer(gd::Project & project_, gd::Layout & layout_) :
        project(project_),
        layout(layout_)
    {
    }

    virtual bool LaunchPreview()
    {
        std::string exportDir = gd::ToString(wxFileName::GetTempDir()+"/GDTemporaries/JSPreview/");

        Exporter exporter(gd::NativeFileSystem::Get());
        if ( !exporter.ExportLayoutForPreview(project, layout, exportDir) )
        {
            gd::LogError(_("An error occurred when launching the preview:\n\n")+exporter.GetLastError()
                       +_("\n\nPlease report this error on the Game Develop website, or contact the extension developer if it seems related to a third party extension."));
        }

        //Without "http://", the function fails ( on Windows at least ).
        //The timestamp is here to prevent browsers caching contents.
        if ( !wxLaunchDefaultBrowser("http://localhost:2828?"+gd::ToString(wxGetLocalTime())) )
        {
            gd::LogError(_("Unable to launch your browser :(\nOpen manually your browser and type \"localhost:2828\" in\nthe address bar ( without the quotes ) to launch the preview!"));
        }

        return false;
    }
private:
    gd::Project & project;
    gd::Layout & layout;
};
#endif

void JsPlatform::OnIDEInitialized()
{
    //Initializing the tiny web server used to preview the games
    #if !defined(GD_NO_WX_GUI)
    std::cout << " * Starting web server..." << std::endl;
    std::string exportDir = gd::ToString(wxFileName::GetTempDir()+"/GDTemporaries/JSPreview/");
    httpServer.Run(exportDir);
    #endif
}

#if !defined(GD_NO_WX_GUI)
boost::shared_ptr<gd::LayoutEditorPreviewer> JsPlatform::GetLayoutPreviewer(gd::LayoutEditorCanvas & editor) const
{
    return boost::shared_ptr<gd::LayoutEditorPreviewer>(new Previewer(editor.GetProject(), editor.GetLayout()));
}

boost::shared_ptr<gd::ProjectExporter> JsPlatform::GetProjectExporter() const
{
    return boost::shared_ptr<gd::ProjectExporter>(new Exporter(gd::NativeFileSystem::Get()));
}
#endif

 //When compiling with emscripten, extensions exposes specific functions to create them.
#if defined(EMSCRIPTEN)
extern "C" {
gd::PlatformExtension * CreateGDJSPlatformAutomatismExtension();
gd::PlatformExtension * CreateGDJSDestroyOutsideAutomatismExtension();
gd::PlatformExtension * CreateGDJSTiledSpriteObjectExtension();
gd::PlatformExtension * CreateGDJSDraggableAutomatismExtension();
gd::PlatformExtension * CreateGDJSTopDownMovementAutomatismExtension();
}
#endif

JsPlatform::JsPlatform() :
    gd::Platform()
{
    //Adding built-in extensions.
    std::cout << "* Loading builtin extensions... "; std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new BaseObjectExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new SpriteExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new CommonInstructionsExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new CommonConversionsExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new VariablesExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new MouseExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new KeyboardExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new JoystickExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new SceneExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new TimeExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new MathematicalToolsExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new CameraExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new AudioExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new FileExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new NetworkExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new WindowExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new StringInstructionsExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new AdvancedExtension)); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new ExternalLayoutsExtension)); std::cout.flush();
    std::cout << "done." << std::endl;

    //Add extensions adapted from GD C++ Platform:
    #if !defined(EMSCRIPTEN) //except when compiling with emscripten
    std::cout << "* Loading extensions based on GD C++ Platform... "; std::cout.flush();
    #if defined(WINDOWS)
    std::string extension = "xgdwe";
    #elif defined(LINUX)
    std::string extension = "xgdle";
    #else
    std::string extension = "xgde";
    #endif
    gd::ExtensionsLoader::LoadExtension("CppPlatform/Extensions/TextObject."+extension, *this); std::cout.flush();
    gd::ExtensionsLoader::LoadExtension("CppPlatform/Extensions/DraggableAutomatism."+extension, *this); std::cout.flush();
    gd::ExtensionsLoader::LoadExtension("CppPlatform/Extensions/DestroyOutsideAutomatism."+extension, *this); std::cout.flush();
    gd::ExtensionsLoader::LoadExtension("CppPlatform/Extensions/PhysicsAutomatism."+extension, *this); std::cout.flush();
    gd::ExtensionsLoader::LoadExtension("CppPlatform/Extensions/LinkedObjects."+extension, *this); std::cout.flush();
    gd::ExtensionsLoader::LoadExtension("CppPlatform/Extensions/TiledSpriteObject."+extension, *this); std::cout.flush();
    gd::ExtensionsLoader::LoadExtension("CppPlatform/Extensions/PlatformAutomatism."+extension, *this); std::cout.flush();
    gd::ExtensionsLoader::LoadExtension("CppPlatform/Extensions/PathfindingAutomatism."+extension, *this); std::cout.flush();
    gd::ExtensionsLoader::LoadExtension("CppPlatform/Extensions/TopDownMovementAutomatism."+extension, *this); std::cout.flush();
    std::cout << "done." << std::endl;
    #else
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(CreateGDJSPlatformAutomatismExtension())); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(CreateGDJSDestroyOutsideAutomatismExtension())); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(CreateGDJSTiledSpriteObjectExtension())); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(CreateGDJSDraggableAutomatismExtension())); std::cout.flush();
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(CreateGDJSTopDownMovementAutomatismExtension())); std::cout.flush();
    #endif
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
 * Used by Game Develop to create the platform class
 */
extern "C" gd::Platform * GD_API CreateGDPlatform() {
    return &JsPlatform::Get();
}

/**
 * Used by Game Develop to destroy the platform class
 */
extern "C" void GD_API DestroyGDPlatform() {
    JsPlatform::DestroySingleton();
}
#endif

}
