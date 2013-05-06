/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef PLATFORM_H
#define PLATFORM_H
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDL/IDE/ChangesNotifier.h"
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
    virtual std::string GetFullName() const { return "C++ Platform"; }
    virtual std::string GetDescription() const;

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

    /**
     * We provide a specific ChangesNotifier to ensure that compilation jobs are done properly.
     */
    virtual ChangesNotifier & GetChangesNotifier() { return changesNotifier; };

    /**
     * Preview can be done directly inside the editor thanks to CppLayoutPreviewer
     */
    virtual boost::shared_ptr<gd::LayoutEditorPreviewer> GetLayoutPreviewer(gd::LayoutEditorCanvas & editor) const;

    /**
     * When destroyed, our platform need to do ensure the destruction of some singletons.
     */
    virtual void OnIDEClosed();

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
    ChangesNotifier changesNotifier;

    static CppPlatform * singleton;
};

#endif // PLATFORM_H
#endif
