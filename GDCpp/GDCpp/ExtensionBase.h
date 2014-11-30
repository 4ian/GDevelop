/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
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
#include "GDCore/Tools/Localization.h"
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
     * \brief To be called so as to declare the creation and destruction function of a RuntimeObject associated to a gd::Object.
     * \param object The object associated to the RuntimeObject being declared.
     * \param className The C++ class name associated to the RuntimeObject.
     * \param createFun The function used to create the object.
     * \param destroyFun The function used to destroy the object.
     */
    void AddRuntimeObject(gd::ObjectMetadata & object, std::string className, CreateRuntimeObjectFunPtr createFun, DestroyRuntimeObjectFunPtr destroyFun);

    /**
     * \brief Return a function to create the runtime object if the type is handled by the extension
     */
    CreateRuntimeObjectFunPtr        GetRuntimeObjectCreationFunctionPtr(std::string objectType) const;

    /**
     * \brief Return the function to destroy the runtime object, if the type is handled by the extension.
     *
     * Used to make sure that the runtime object from an extension is deleted by the same extension.
     */
    DestroyRuntimeObjectFunPtr       GetDestroyRuntimeObjectFunction(std::string objectType) const;

    /**
     * \brief Called when a scene is loaded: Useful to initialize some extensions specific objects related to scene
     */
    virtual void SceneLoaded(RuntimeScene & scene) {};

    /**
     * \brief Called when a scene is unloaded: Useful to destroy some extensions specific objects related to scene
     */
    virtual void SceneUnloaded(RuntimeScene & scene) {};

    /**
     * \brief Redefine this method to return true if you want the method ObjectDeletedFromScene to be called by RuntimeScene when
     *
     * \see ExtensionBase::ToBeNotifiedOnObjectDeletion
     */
    virtual bool ToBeNotifiedOnObjectDeletion() { return false; }

    /**
     * \brief Called by RuntimeScene, if ToBeNotifiedOnObjectDeletion() returns true, when an object is about to be deleted.
     *
     * \see ExtensionBase::ObjectDeletedFromScene
     */
    virtual void ObjectDeletedFromScene(RuntimeScene & scene, RuntimeObject * objectDeleted) {};

    #if defined(GD_IDE_ONLY)

    /**
     * \brief Must return true if the extension has something to display in debugger.
     */
    virtual bool HasDebuggingProperties() const { return false; };

    /**
     * \brief Called by the debugger so as to get a property value and name.
     * \see RuntimeObject::GetPropertyForDebugger
     */
    virtual void GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const {};

    /**
     * \brief Called by the debugger so as to update a property
     * \see RuntimeObject::ChangeProperty
     */
    virtual bool ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, std::string newValue) { return false; };

    /**
     * \brief Must return the number of available properties for the debugger
     */
    virtual unsigned int GetNumberOfProperties(RuntimeScene & scene) const { return 0; };

    const std::vector < std::pair<std::string, std::string> > & GetSupplementaryRuntimeFiles() const { return supplementaryRuntimeFiles; };
    const std::vector < std::string > & GetSupplementaryIncludeDirectories() const { return supplementaryIncludeDirectories; };
    const std::vector < std::string > & GetSupplementaryLibFiles() const { return supplementaryLibFiles; };
    #endif

protected :

    #if defined(GD_IDE_ONLY)
    std::vector < std::pair<std::string, std::string> > supplementaryRuntimeFiles; ///<Supplementary runtime files to copy on compilation
    std::vector < std::string > supplementaryIncludeDirectories; ///<Supplementary include directories to use on events compilation
    std::vector < std::string > supplementaryLibFiles; ///<Supplementary libraries files to be used when compiling events with this extension. Files must be in CppPlatform/Extensions and CppPlatform/Extensions/Runtime directories. The filename will be completed with lib and .a.
    #endif

private:
    std::map < std::string, CreateRuntimeObjectFunPtr > runtimeObjectCreationFunctionTable;
    std::map < std::string, DestroyRuntimeObjectFunPtr > runtimeObjectDestroyFunctionTable;
};

#endif // EXTENSIONBASE_H

