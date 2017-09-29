/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef JSPLATFORM_H
#define JSPLATFORM_H
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"
#include "GDJS/IDE/HttpServer.h"
#if !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h>
#endif

namespace gdjs
{

/**
 * \brief GDevelop Javascript Platform
 *
 * Platform designed to be used to create 2D games based on Javascript.<br>
 * <br>
 * This is the core class that is exposing to the IDE the features of the platform.<br>
 * The IDE creates this platform during its startup, thanks to CreateGDPlatform/DestroyGDPlatform.
 */
class GD_API JsPlatform : public gd::Platform
{
public:

    virtual gd::String GetName() const { return "GDevelop JS platform"; }
    virtual gd::String GetFullName() const { return _("HTML5 (Web and Android games)"); }
    virtual gd::String GetSubtitle() const { return _("HTML5 and javascript based games for web browsers."); }
    virtual gd::String GetDescription() const { return _("Enables the creation of 2D games that can be played in web browsers. These can also be exported to Android with third-party tools."); }
    virtual gd::String GetIcon() const { return "JsPlatform/icon32.png"; }

    /** \brief The name of the function searched in an extension file to create the extension
     */
    virtual gd::String GetExtensionCreateFunctionName() { return "CreateGDJSExtension"; }

    #if !defined(GD_NO_WX_GUI)
    /**
     * \brief Expose the previewer to the IDE
     *
     * Returns a gd::LayoutEditorPreviewer object which export the layout being edited and
     * then launch the preview in an external browser
     */
    virtual std::shared_ptr<gd::LayoutEditorPreviewer> GetLayoutPreviewer(gd::LayoutEditorCanvas & editor) const;

    /**
     * \brief Expose to the IDE how to export games.
     */
    virtual std::vector<std::shared_ptr<gd::ProjectExporter>> GetProjectExporters() const;
    #endif

    /**
     * \brief When the IDE is ready, start the tiny web server used for preview.
     */
    virtual void OnIDEInitialized();

    /**
     * Get access to the JsPlatform instance (JsPlatform is a singleton).
     */
    static JsPlatform & Get();

    /**
     * \brief Destroy the singleton.
     *
     * \note You do not need usually to call this method.
     **/
    static void DestroySingleton();

    JsPlatform();
    virtual ~JsPlatform() {};
private:

    #if !defined(GD_NO_WX_GUI)
    wxBitmap icon; ///< The platform icon shown to the user in the IDE.
    HttpServer httpServer; ///< The server used for the previews.
    #endif

    static JsPlatform * singleton;
};

}

#endif // JSPLATFORM_H
