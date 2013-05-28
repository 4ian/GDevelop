/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EXTENSIONBASE_H
#define EXTENSIONBASE_H

#include <string>
#include <vector>
#include <map>
#include <boost/shared_ptr.hpp>
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/Events/ObjectMetadata.h"
#include "GDCore/Events/AutomatismMetadata.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
namespace gd { class Instruction; }
namespace gd { class Layout; }
namespace gd { class Object; }
namespace gd { class BaseEvent; }
namespace gd { class AutomatismsSharedData; }
namespace gd {class ArbitraryResourceWorker;}
class RuntimeScene;
namespace gd { class Project; }
class RuntimeObject;
class ExtensionBase;
class EventsCodeGenerationContext;
class EventsCodeGenerator;
#undef CreateEvent

//Declare typedefs for objects creations/destructions functions
typedef void (*DestroyRuntimeObjectFunPtr)(RuntimeObject*);
typedef RuntimeObject * (*CreateRuntimeObjectFunPtr)(RuntimeScene & scene, const gd::Object & object);

#if defined(GD_IDE_ONLY)
    #include <wx/intl.h>
    //Ensure the wxWidgets macro "_" returns a std::string
    #if defined(_)
        #undef _
    #endif
    #define _(s) std::string(wxGetTranslation((s)).mb_str())
#else
    //Emulating wxWidgets internationalization macro
    #ifndef _
        #define _(x) x
        #define wxT(x) x
    #endif
#endif

/**
 * \brief Base class for C++ extensions.
 * Extensions can provide :
 *
 *  - Static functions ( e.g. GetActionFunctionPtr ).
 *  - Objects functions ( e.g. GetObjectActionFunctionPtr )
 *  - New objects, which have a type. The new
 *   objects creations/destructions functions are provided
 *   by the extension.
 *  - More information when compiled for the IDE.
 */
class GD_API ExtensionBase : public gd::PlatformExtension
{
public :

    ExtensionBase() {};
    virtual ~ExtensionBase();

    /**
     * To be called so as to declare the creation and destruction function of a RuntimeObject associated to a gd::Object.
     */
    void AddRuntimeObject(gd::ObjectMetadata & object, CreateRuntimeObjectFunPtr createFun, DestroyRuntimeObjectFunPtr destroyFun);

    /**
     * Return a function to create the runtime object if the type is handled by the extension
     */
    CreateRuntimeObjectFunPtr        GetRuntimeObjectCreationFunctionPtr(std::string objectType) const;

    /**
     * Make sure that the runtime object from an extension is deleted by the same extension.
     */
    DestroyRuntimeObjectFunPtr       GetDestroyRuntimeObjectFunction(std::string objectType) const;

    /**
     * Called when a scene is loaded: Useful to initialize some extensions specific objects related to scene
     */
    virtual void SceneLoaded(RuntimeScene & scene) {};

    /**
     * Called when a scene is unloaded: Useful to destroy some extensions specific objects related to scene
     */
    virtual void SceneUnloaded(RuntimeScene & scene) {};

    /**
     * Redefine this method to return true if you want the method ObjectDeletedFromScene to be called by RuntimeScene when
     *
     * \see ExtensionBase::ToBeNotifiedOnObjectDeletion
     */
    virtual bool ToBeNotifiedOnObjectDeletion() { return false; }

    /**
     * Called by RuntimeScene, if ToBeNotifiedOnObjectDeletion() returns true, when an object is about to be deleted.
     *
     * \see ExtensionBase::ObjectDeletedFromScene
     */
    virtual void ObjectDeletedFromScene(RuntimeScene & scene, RuntimeObject * objectDeleted) {};

    #if defined(GD_IDE_ONLY)

    /**
     * Must return true if the extension has something to display in debugger.
     */
    virtual bool HasDebuggingProperties() const { return false; };

    /**
     * Called by the debugger so as to get a property value and name.
     * \see Object::GetPropertyForDebugger
     */
    virtual void GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const {};

    /**
     * Called by the debugger so as to update a property
     * \see Object::ChangeProperty
     */
    virtual bool ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, std::string newValue) { return false; };

    /**
     * Must return the number of available properties for the debugger
     */
    virtual unsigned int GetNumberOfProperties(RuntimeScene & scene) const { return 0; };

    const std::vector < std::pair<std::string, std::string> > & GetSupplementaryRuntimeFiles() const { return supplementaryRuntimeFiles; };
    const std::vector < std::string > & GetSupplementaryIncludeDirectories() const { return supplementaryIncludeDirectories; };
    const std::vector < std::string > & GetSupplementaryLibFiles() const { return supplementaryLibFiles; };
    #endif

protected :

    #if defined(GD_IDE_ONLY) //Information available only at edittime
    std::vector < std::pair<std::string, std::string> > supplementaryRuntimeFiles; ///<Supplementary runtime files to copy on compilation
    std::vector < std::string > supplementaryIncludeDirectories; ///<Supplementary include directories to use on events compilation
    std::vector < std::string > supplementaryLibFiles; ///<Supplementary libraries files to be used when compiling events with this extension. Files must be in CppPlatform/Extensions and CppPlatform/Extensions/Runtime directories. The filename will be completed with lib and .a.
    #endif

private:
    std::map < std::string, CreateRuntimeObjectFunPtr > runtimeObjectCreationFunctionTable;
    std::map < std::string, DestroyRuntimeObjectFunPtr > runtimeObjectDestroyFunctionTable;
};

#endif // EXTENSIONBASE_H

