/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. Copyright 2016 Victor Levasseur (victorlevasseur52@gmail.com) This
 * project is released under the MIT License.
 */
#ifndef EXTENSIONBASE_INL
#define EXTENSIONBASE_INL

#include "GDCore/Tools/MakeUnique.h"

template <class T, class U>
void ExtensionBase::AddRuntimeObject(gd::ObjectMetadata& object,
                                     gd::String className) {
#if defined(GD_IDE_ONLY)
  object.className = className;
#endif
  runtimeObjectCreationFunctionTable[object.GetName()] =
      [](RuntimeScene& scene,
         const gd::Object& object) -> std::unique_ptr<RuntimeObject> {
    try {
      const T& derivedObject = dynamic_cast<const T&>(object);
      return gd::make_unique<U>(scene, derivedObject);
    } catch (const std::bad_cast& e) {
      std::cout
          << "Tried to create a RuntimeObject from an invalid gd::Object: "
          << std::endl;
      std::cout << e.what() << std::endl;
    }

    return std::unique_ptr<U>();
  };
}

template <class T>
void ExtensionBase::AddRuntimeBehavior(gd::BehaviorMetadata& behavior,
                                       gd::String className) {
#if defined(GD_IDE_ONLY)
  behavior.className = className;
#endif
  runtimeBehaviorCreationFunctionTable[behavior.GetName()] =
      [](const gd::SerializerElement& behaviorContent)
      -> std::unique_ptr<RuntimeBehavior> {
    return gd::make_unique<T>(behaviorContent);
  };
}

template <class T>
void ExtensionBase::AddBehaviorsRuntimeSharedData(gd::BehaviorMetadata& behavior) {
  behaviorsRuntimeSharedDataCreationFunctionTable[behavior.GetName()] =
      [](const gd::SerializerElement& behaviorSharedDataContent)
      -> std::unique_ptr<BehaviorsRuntimeSharedData> {
    return gd::make_unique<T>(behaviorSharedDataContent);
  };
}

#endif
