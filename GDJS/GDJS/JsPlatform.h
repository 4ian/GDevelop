/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef JSPLATFORM_H
#define JSPLATFORM_H
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/CommonTools.h"
#include <wx/bitmap.h>
#include <wx/intl.h>
#include "HttpServer.h"

/**
 * \brief Game Develop Javascript Platform
 *
 * Platform designed to be used to create 2D games based on Javascript.<br>
 * <br>
 * This is the core class that is exposing to the IDE the features of the platform.<br>
 * The IDE creates this platform during its startup, thanks to CreateGDPlatform/DestroyGDPlatform.
 */
class GD_API JsPlatform : public gd::Platform
{
public:

    virtual std::string GetName() const { return "Game Develop JS platform"; }
    virtual std::string GetFullName() const { return gd::ToString(_("Web platform")); }
    virtual std::string GetSubtitle() const { return gd::ToString(_("HTML5 and javascript based games for web browsers.")); }
    virtual std::string GetDescription() const { return gd::ToString(_("Allows to create 2D games which can be played in a web browser.")); }
    virtual std::string GetIcon() const { return "JsPlatform/icon32.png"; }

    /** \brief The name of the function searched in an extension file to create the extension
     */
    virtual std::string GetExtensionCreateFunctionName() { return "CreateGDJSExtension"; }

    /** \brief The name of the function searched in an extension file to destroy the extension
     */
    virtual std::string GetExtensionDestroyFunctionName() { return "DestroyGDJSExtension"; }

    /**
     * \brief Expose the previewer to the IDE
     *
     * Returns a gd::LayoutEditorPreviewer object which export the layout being edited and
     * then launch the preview in an external browser
     */
    virtual boost::shared_ptr<gd::LayoutEditorPreviewer> GetLayoutPreviewer(gd::LayoutEditorCanvas & editor) const;

    /**
     * \brief Expose to the IDE how to export games.
     */
    virtual boost::shared_ptr<gd::ProjectExporter> GetProjectExporter() const;

    /**
     * \brief When the IDE is ready, start the tiny web server used for preview.
     */
    virtual void OnIDEInitialized();

    /**
     * Get access to the JsPlatform instance. ( JsPlatform is a singleton ).
     */
    static JsPlatform & Get();

    /**
     * \brief Destroy the singleton.
     *
     * \note You do not need usually to call this method.
     **/
    static void DestroySingleton();

private:
    JsPlatform();
    virtual ~JsPlatform() {};

    wxBitmap icon; ///< The platform icon shown to the user in the IDE.
    HttpServer httpServer; ///< The server used for the previews.

    static JsPlatform * singleton;
};

#endif // JSPLATFORM_H
