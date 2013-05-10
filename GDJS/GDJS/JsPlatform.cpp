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

//Builtin extensions
#include "GDJS/BuiltinExtensions/SpriteExtension.h"
#include "GDJS/BuiltinExtensions/CommonInstructionsExtension.h"
#include "GDJS/BuiltinExtensions/BaseObjectExtension.h"
#include "GDJS/BuiltinExtensions/VariablesExtension.h"
#include "GDJS/BuiltinExtensions/KeyboardExtension.h"
#include "GDJS/BuiltinExtensions/MouseExtension.h"

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

        Exporter exporter(project);
        if ( !exporter.ExportLayoutForPreview(layout, exportDir) )
        {
            wxLogError(_("An error occurred when launching the preview:\n\n")+exporter.GetLastError()
                       +_("\n\nPlease report this error on the Game Develop website, or contact the extension developer if it seems related to a third party extension."));
        }
        wxLaunchDefaultBrowser(exportDir+"index.html");

        return false;
    }
private:
    gd::Project & project;
    gd::Layout & layout;
};

boost::shared_ptr<gd::LayoutEditorPreviewer> JsPlatform::GetLayoutPreviewer(gd::LayoutEditorCanvas & editor) const
{
    return boost::shared_ptr<gd::LayoutEditorPreviewer>(new Previewer(editor.GetProject(), editor.GetLayout()));
}

JsPlatform::JsPlatform() :
    gd::Platform()
{
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new BaseObjectExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new CommonInstructionsExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new KeyboardExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new MouseExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new SpriteExtension));
    AddExtension(boost::shared_ptr<gd::PlatformExtension>(new VariablesExtension));
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
