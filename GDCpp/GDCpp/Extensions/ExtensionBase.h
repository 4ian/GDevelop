/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * Copyright 2016 Victor Levasseur (victorlevasseur52@gmail.com)
 * This project is released under the MIT License.
 */

#ifndef EXTENSIONBASE_H
#define EXTENSIONBASE_H

#include <iostream>
#include <map>
#include <memory>
#include <vector>
#include <string>
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/CommonTools.h"
namespace gd { class Instruction; }
namespace gd { class Layout; }
namespace gd { class Object; }
namespace gd { class BaseEvent; }
namespace gd { class BehaviorsSharedData; }
namespace gd {class ArbitraryResourceWorker;}
class RuntimeScene;
namespace gd { class Project; }
class RuntimeObject;
class ExtensionBase;
class EventsCodeGenerationContext;
class EventsCodeGenerator;
#undef CreateEvent

//Declare typedefs for objects creations/destructions functions
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
     * \tparam T the object class (inheriting *gd::Object*) declared with *AddObject*
     * \tparam U the runtime object class (inheriting *RuntimeObject*)
     * \param object The object associated to the RuntimeObject being declared.
     * \param className The C++ class name associated to the RuntimeObject.
     */
    template<class T, class U>
    void AddRuntimeObject(gd::ObjectMetadata & object, gd::String className);

    /**
     * \brief Return a function to create the runtime object if the type is handled by the extension
     */
    CreateRuntimeObjectFunPtr GetRuntimeObjectCreationFunctionPtr(gd::String objectType) const;

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
    virtual void GetPropertyForDebugger(RuntimeScene & scene, std::size_t propertyNb, gd::String & name, gd::String & value) const {};

    /**
     * \brief Called by the debugger so as to update a property
     * \see RuntimeObject::ChangeProperty
     */
    virtual bool ChangeProperty(RuntimeScene & scene, std::size_t propertyNb, gd::String newValue) { return false; };

    /**
     * \brief Must return the number of available properties for the debugger
     */
    virtual std::size_t GetNumberOfProperties(RuntimeScene & scene) const { return 0; };

    const std::vector < std::pair<gd::String, gd::String> > & GetSupplementaryRuntimeFiles() const { return supplementaryRuntimeFiles; };
    const std::vector < gd::String > & GetSupplementaryIncludeDirectories() const { return supplementaryIncludeDirectories; };
    const std::vector < gd::String > & GetSupplementaryLibFiles() const { return supplementaryLibFiles; };
    #endif

protected :

    #if defined(GD_IDE_ONLY)
    std::vector < std::pair<gd::String, gd::String> > supplementaryRuntimeFiles; ///<Supplementary runtime files to copy on compilation
    std::vector < gd::String > supplementaryIncludeDirectories; ///<Supplementary include directories to use on events compilation
    std::vector < gd::String > supplementaryLibFiles; ///<Supplementary libraries files to be used when compiling events with this extension. Files must be in CppPlatform/Extensions and CppPlatform/Extensions/Runtime directories. The filename will be completed with lib and .a.
    #endif

private:
    std::map < gd::String, CreateRuntimeObjectFunPtr > runtimeObjectCreationFunctionTable;
};

#include "GDCpp/Extensions/ExtensionBase.inl"

#endif // EXTENSIONBASE_H
