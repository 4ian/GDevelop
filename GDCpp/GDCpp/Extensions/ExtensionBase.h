/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. Copyright 2016 Victor Levasseur (victorlevasseur52@gmail.com) This
 * project is released under the MIT License.
 */

#ifndef EXTENSIONBASE_H
#define EXTENSIONBASE_H
#include <iostream>
#include <map>
#include <memory>
#include <string>
#include <vector>
#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

namespace gd {
class Instruction;
class Layout;
class Object;
class BaseEvent;
class BehaviorsSharedData;
class ArbitraryResourceWorker;
class Project;
class SerializerElement;
}  // namespace gd
class RuntimeScene;
class RuntimeObject;
class RuntimeBehavior;
class BehaviorsRuntimeSharedData;
class ExtensionBase;
class EventsCodeGenerationContext;
class EventsCodeGenerator;
#undef CreateEvent

// Declare typedefs for objects creations/destructions functions
typedef std::unique_ptr<RuntimeObject> (*CreateRuntimeObjectFunPtr)(
    RuntimeScene& scene, const gd::Object& object);
typedef std::unique_ptr<RuntimeBehavior> (*CreateRuntimeBehaviorFunPtr)(
    const gd::SerializerElement& behaviorContent);
typedef std::unique_ptr<BehaviorsRuntimeSharedData> (
    *CreateBehaviorsRuntimeSharedDataFunPtr)(
    const gd::SerializerElement& behaviorSharedDataContent);

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
class GD_API ExtensionBase : public gd::PlatformExtension {
 public:
  ExtensionBase(){};
  virtual ~ExtensionBase();

  /**
   * \brief To be called so as to declare the creation and destruction function
   * of a RuntimeObject associated to a gd::Object.
   *
   * \tparam T the object class (inheriting *gd::Object*) declared with
   * *AddObject*.
   *
   * \tparam U the runtime object class (inheriting *RuntimeObject*).
   *
   * \param object The object associated to the RuntimeObject being declared.
   * \param className The C++ class name associated to the RuntimeObject.
   */
  template <class T, class U>
  void AddRuntimeObject(gd::ObjectMetadata& object, gd::String className);

  /**
   * \brief To be called so as to declare the creation and destruction function
   * of a RuntimeBehavior associated to a gd::Behavior.
   *
   * \tparam T the runtime behavior class (inheriting *RuntimeBehavior*).
   * \tparam U the runtime behavior shared data class (inheriting
   * *BehaviorsRuntimeSharedData*).
   *
   * \param object The object associated to the RuntimeBehavior being declared.
   * \param className The C++ class name associated to the RuntimeBehavior.
   */
  template <class T>
  void AddRuntimeBehavior(gd::BehaviorMetadata& behavior, gd::String className);

  /**
   * \brief To be called so as to declare the creation and destruction function
   * of a BehaviorsRuntimeSharedData associated to a gd::BehaviorsSharedData.
   *
   * \tparam T the behavior shared data class (inheriting
   * *BehaviorsSharedData*). \tparam U the runtime behavior shared data class
   * (inheriting *BehaviorsRuntimeSharedData*).
   *
   * \param object The object associated to the RuntimeBehavior being declared.
   * \param className The C++ class name associated to the RuntimeBehavior.
   */
  template <class T>
  void AddBehaviorsRuntimeSharedData(gd::BehaviorMetadata& behavior);

  /**
   * \brief Return a function to create the runtime object if the type is
   * handled by the extension
   */
  CreateRuntimeObjectFunPtr GetRuntimeObjectCreationFunctionPtr(
      gd::String objectType) const;

  /**
   * \brief Return a function to create the runtime behavior if the type is
   * handled by the extension
   */
  CreateRuntimeBehaviorFunPtr GetRuntimeBehaviorCreationFunctionPtr(
      gd::String behaviorType) const;

  /**
   * \brief Return a function to create the runtime behavior shared data if the type is
   * handled by the extension.
   */
  CreateBehaviorsRuntimeSharedDataFunPtr GetBehaviorsRuntimeSharedDataFunctionPtr(
      gd::String behaviorType) const;

  /**
   * \brief Called when a scene is loaded: Useful to initialize some extensions
   * specific objects related to scene
   */
  virtual void SceneLoaded(RuntimeScene& scene){};

  /**
   * \brief Called when a scene is unloaded: Useful to destroy some extensions
   * specific objects related to scene
   */
  virtual void SceneUnloaded(RuntimeScene& scene){};

  /**
   * \brief Redefine this method to return true if you want the method
   * ObjectDeletedFromScene to be called by RuntimeScene when
   *
   * \see ExtensionBase::ToBeNotifiedOnObjectDeletion
   */
  virtual bool ToBeNotifiedOnObjectDeletion() { return false; }

  /**
   * \brief Called by RuntimeScene, if ToBeNotifiedOnObjectDeletion() returns
   * true, when an object is about to be deleted.
   *
   * \see ExtensionBase::ObjectDeletedFromScene
   */
  virtual void ObjectDeletedFromScene(RuntimeScene& scene,
                                      RuntimeObject* objectDeleted){};

#if defined(GD_IDE_ONLY)

  /**
   * \brief Must return true if the extension has something to display in
   * debugger.
   */
  virtual bool HasDebuggingProperties() const { return false; };

  /**
   * \brief Called by the debugger so as to get a property value and name.
   * \see RuntimeObject::GetPropertyForDebugger
   */
  virtual void GetPropertyForDebugger(RuntimeScene& scene,
                                      std::size_t propertyNb,
                                      gd::String& name,
                                      gd::String& value) const {};

  /**
   * \brief Called by the debugger so as to update a property
   * \see RuntimeObject::ChangeProperty
   */
  virtual bool ChangeProperty(RuntimeScene& scene,
                              std::size_t propertyNb,
                              gd::String newValue) {
    return false;
  };

  /**
   * \brief Must return the number of available properties for the debugger
   */
  virtual std::size_t GetNumberOfProperties(RuntimeScene& scene) const {
    return 0;
  };

  const std::vector<std::pair<gd::String, gd::String> >&
  GetSupplementaryRuntimeFiles() const {
    return supplementaryRuntimeFiles;
  };
  const std::vector<gd::String>& GetSupplementaryIncludeDirectories() const {
    return supplementaryIncludeDirectories;
  };
  const std::vector<gd::String>& GetSupplementaryLibFiles() const {
    return supplementaryLibFiles;
  };
#endif

 protected:
#if defined(GD_IDE_ONLY)
  std::vector<std::pair<gd::String, gd::String> >
      supplementaryRuntimeFiles;  ///< Supplementary runtime files to copy on
                                  ///< compilation
  std::vector<gd::String>
      supplementaryIncludeDirectories;  ///< Supplementary include directories
                                        ///< to use on events compilation
  std::vector<gd::String>
      supplementaryLibFiles;  ///< Supplementary libraries files to be used when
                              ///< compiling events with this extension. Files
                              ///< must be in CppPlatform/Extensions and
                              ///< CppPlatform/Extensions/Runtime directories.
                              ///< The filename will be completed with lib and
                              ///< .a.
#endif

 private:
  std::map<gd::String, CreateRuntimeObjectFunPtr>
      runtimeObjectCreationFunctionTable;
  std::map<gd::String, CreateRuntimeBehaviorFunPtr>
      runtimeBehaviorCreationFunctionTable;
  std::map<gd::String, CreateBehaviorsRuntimeSharedDataFunPtr>
      behaviorsRuntimeSharedDataCreationFunctionTable;
};

#include "GDCpp/Extensions/ExtensionBase.inl"

#endif  // EXTENSIONBASE_H
