/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "GDCore/CommonTools.h"
#include "GDJS/JsPlatform.h"
#include "GDJS/Exporter.h"
#include <wx/filename.h>
#include <wx/log.h>
#include <wx/bitmap.h>

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

JsPlatform *JsPlatform::singleton = NULL;

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

        Exporter exporter(&project);
        if ( !exporter.ExportLayoutForPreview(layout, exportDir) )
        {
            wxLogError(_("An error occurred when launching the preview:\n\n")+exporter.GetLastError()
                       +_("\n\nPlease report this error on the Game Develop website, or contact the extension developer if it seems related to a third party extension."));
        }

        if ( !wxLaunchDefaultBrowser("http://localhost:2828") ) //Without "http://", the function fails ( on Windows at least ).
        {
            wxLogError(_("Unable to launch your browser :(\nOpen manually your browser and type \"localhost:2828\" in\nthe address bar ( without the quotes ) to launch the preview!"));
        }

        return false;
    }
private:
    gd::Project & project;
    gd::Layout & layout;
};

void JsPlatform::OnIDEInitialized()
{
    //Initializing the tiny web server used to preview the games
    std::cout << "Starting web server..." << std::endl;
    std::string exportDir = gd::ToString(wxFileName::GetTempDir()+"/GDTemporaries/JSPreview/");
    httpServer.Run(exportDir);
}

boost::shared_ptr<gd::LayoutEditorPreviewer> JsPlatform::GetLayoutPreviewer(gd::LayoutEditorCanvas & editor) const
{
    return boost::shared_ptr<gd::LayoutEditorPreviewer>(new Previewer(editor.GetProject(), editor.GetLayout()));
}

boost::shared_ptr<gd::ProjectExporter> JsPlatform::GetProjectExporter() const
{
    return boost::shared_ptr<gd::ProjectExporter>(new Exporter);
}

JsPlatform::JsPlatform() :
    gd::Platform()
{
    //Adding built-in extensions.
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new BaseObjectExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new SpriteExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new CommonInstructionsExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new CommonConversionsExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new VariablesExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new MouseExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new KeyboardExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new JoystickExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new SceneExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new TimeExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new MathematicalToolsExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new CameraExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new AudioExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new FileExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new NetworkExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new WindowExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new StringInstructionsExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new AdvancedExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new ExternalLayoutsExtension));
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
