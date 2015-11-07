/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include <vector>
#include <string>
#include <iostream>
#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCpp/Project/Behavior.h"
#include "GDCpp/Project/BehaviorsSharedData.h"
#include "GDCpp/CommonTools.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/Event.h"
#endif

using namespace std;

ExtensionBase::~ExtensionBase()
{
};

CreateRuntimeObjectFunPtr ExtensionBase::GetRuntimeObjectCreationFunctionPtr(gd::String objectType) const
{
    if ( runtimeObjectCreationFunctionTable.find(objectType) != runtimeObjectCreationFunctionTable.end())
        return runtimeObjectCreationFunctionTable.find(objectType)->second;

    return NULL;
}

void ExtensionBase::AddRuntimeObject(gd::ObjectMetadata & object, gd::String className, CreateRuntimeObjectFunPtr createFun)
{
#if defined(GD_IDE_ONLY)
    object.className = className;
#endif
    runtimeObjectCreationFunctionTable[object.GetName()] = createFun;
}

#if !defined(GD_IDE_ONLY)
//Implementations of some dependencies of ExtensionBase are compiled in this compilation unit
//when compiling for runtime:
#include "GDCore/Extensions/PlatformExtension.cpp"
#include "GDCore/Extensions/Metadata/ObjectMetadata.cpp"
#include "GDCore/Extensions/Metadata/BehaviorMetadata.cpp"
#endif
