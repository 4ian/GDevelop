/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include <vector>
#include <string>
#include <iostream>
#include "GDCpp/ExtensionBase.h"
#include "GDCpp/Automatism.h"
#include "GDCpp/AutomatismsSharedData.h"
#include "GDCpp/CommonTools.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/Event.h"
#endif

using namespace std;

ExtensionBase::~ExtensionBase()
{
};

CreateRuntimeObjectFunPtr ExtensionBase::GetRuntimeObjectCreationFunctionPtr(std::string objectType) const
{
    if ( runtimeObjectCreationFunctionTable.find(objectType) != runtimeObjectCreationFunctionTable.end())
        return runtimeObjectCreationFunctionTable.find(objectType)->second;

    return NULL;
}

void ExtensionBase::AddRuntimeObject(gd::ObjectMetadata & object, std::string className, CreateRuntimeObjectFunPtr createFun)
{
#if defined(GD_IDE_ONLY)
    object.className = className;
#endif
    runtimeObjectCreationFunctionTable[object.GetName()] = createFun;
}

#if !defined(GD_IDE_ONLY)
//Implementations of some dependencies of ExtensionBase are compiled in this compilation unit
//when compiling for runtime:
#include "GDCore/PlatformDefinition/PlatformExtension.cpp"
#include "GDCore/Events/ObjectMetadata.cpp"
#include "GDCore/Events/AutomatismMetadata.cpp"
#endif
