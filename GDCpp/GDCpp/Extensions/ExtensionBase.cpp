/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCpp/Extensions/ExtensionBase.h"
#include <iostream>
#include <string>
#include <vector>
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Behavior.h"
#include "GDCpp/Runtime/Project/BehaviorsSharedData.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/Event.h"
#endif

using namespace std;

ExtensionBase::~ExtensionBase(){};

CreateRuntimeObjectFunPtr ExtensionBase::GetRuntimeObjectCreationFunctionPtr(
    gd::String objectType) const {
  if (runtimeObjectCreationFunctionTable.find(objectType) !=
      runtimeObjectCreationFunctionTable.end())
    return runtimeObjectCreationFunctionTable.find(objectType)->second;

  return NULL;
}

CreateRuntimeBehaviorFunPtr
ExtensionBase::GetRuntimeBehaviorCreationFunctionPtr(
    gd::String behaviorType) const {
  if (runtimeBehaviorCreationFunctionTable.find(behaviorType) !=
      runtimeBehaviorCreationFunctionTable.end())
    return runtimeBehaviorCreationFunctionTable.find(behaviorType)->second;

  return NULL;
}

CreateBehaviorsRuntimeSharedDataFunPtr
ExtensionBase::GetBehaviorsRuntimeSharedDataFunctionPtr(
    gd::String behaviorType) const {
  if (behaviorsRuntimeSharedDataCreationFunctionTable.find(behaviorType) !=
      behaviorsRuntimeSharedDataCreationFunctionTable.end())
    return behaviorsRuntimeSharedDataCreationFunctionTable.find(behaviorType)
        ->second;

  return NULL;
}

#if !defined(GD_IDE_ONLY)
// Implementations of some dependencies of ExtensionBase are compiled in this
// compilation unit when compiling for runtime:
#include "GDCore/Extensions/Metadata/BehaviorMetadata.cpp"
#include "GDCore/Extensions/Metadata/ObjectMetadata.cpp"
#include "GDCore/Extensions/PlatformExtension.cpp"
#endif
