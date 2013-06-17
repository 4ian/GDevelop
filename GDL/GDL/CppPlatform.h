/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef PLATFORM_H
#define PLATFORM_H
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDL/CommonTools.h"
#include "GDL/IDE/ChangesNotifier.h"
#if defined(GD_IDE_ONLY)
#include <wx/intl.h>
#endif
namespace gd { class Automatism; }
namespace gd { class Object; }
class RuntimeObject;
class RuntimeScene;

typedef void (*DestroyRuntimeObjectFunPtr)(RuntimeObject*);
typedef RuntimeObject * (*CreateRuntimeObjectFunPtr)(RuntimeScene & scene, const gd::Object & object);

/**
 * \brief Game Develop C++ Platform
 *
 * Platform designed to be used to create 2D games based on SFML and OpenGL libraries for rendering,
 * events being translated to C++ and then compiled using GCC.
 */
class GD_API CppPlatform : public gd::Platform
{
public:

    virtual std::string GetName() const { return "Game Develop C++ platform"; }
    #if defined(GD_IDE_ONLY)
    virtual std::string GetFullName() const { return ToString(_("Native platform")); }
    virtual std::string GetSubtitle() const { return ToString(_("C++ and OpenGL based games for Windows or Linux.")); }
    virtual std::string GetDescription() const;
    #endif

    /**
     * Create a RuntimeObject from a gd::Object for a scene.
     *
     * \param scene The scene the object is going to be used on.
     * \param scene The gd::Object the RuntimeObject must be based on.
     */
    boost::shared_ptr<RuntimeObject> CreateRuntimeObject(RuntimeScene & scene, gd::Object & object);

    /**
     * Our platform need to do a bit of extra work when adding an extension
     * ( i.e : Storing pointers to creation/destruction functions ).
     */
    bool AddExtension(boost::shared_ptr<gd::PlatformExtension> platformExtension);

#if defined(GD_IDE_ONLY)
    virtual std::string GetIcon() const { return "CppPlatform/icon32.png"; }

    /**
     * We provide a specific ChangesNotifier to ensure that compilation jobs are done properly.
     */
    virtual ChangesNotifier & GetChangesNotifier() const { return changesNotifier; };

    /**
     * \brief Preview can be done directly inside the editor thanks to CppLayoutPreviewer
     */
    virtual boost::shared_ptr<gd::LayoutEditorPreviewer> GetLayoutPreviewer(gd::LayoutEditorCanvas & editor) const;

    /**
     * \brief Expose to the IDE how to export games.
     */
    virtual boost::shared_ptr<gd::ProjectExporter> GetProjectExporter() const;

    /**
     * When destroyed, our platform need to do ensure the destruction of some singletons.
     */
    virtual void OnIDEClosed();
#endif

    /**
     * Get access to the CppPlatform instance. ( CppPlatform is a singleton ).
     */
    static CppPlatform & Get();

    /**
     * \brief Destroy the singleton.
     *
     * \note You do not need usually to call this method.
     **/
    static void DestroySingleton();

private:
    CppPlatform();
    virtual ~CppPlatform() {};

    std::map < std::string, CreateRuntimeObjectFunPtr > runtimeObjCreationFunctionTable; ///< The C++ Platform also need to store functions to create runtime objects.
    std::map < std::string, DestroyRuntimeObjectFunPtr > runtimeObjDestroyFunctionTable; ///< The C++ Platform also need to store functions to destroy runtime objects.
#if defined(GD_IDE_ONLY)
    static ChangesNotifier changesNotifier;
    wxBitmap icon32;
#endif

    static CppPlatform * singleton;
};

#endif // PLATFORM_H
