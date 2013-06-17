/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include <iostream>
#include "GDL/ExtensionBase.h"
#include "GDL/Automatism.h"
#include "GDL/AutomatismsSharedData.h"
#include "GDL/CommonTools.h"
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

DestroyRuntimeObjectFunPtr ExtensionBase::GetDestroyRuntimeObjectFunction(std::string objectType) const
{
    if ( runtimeObjectDestroyFunctionTable.find(objectType) != runtimeObjectDestroyFunctionTable.end())
        return runtimeObjectDestroyFunctionTable.find(objectType)->second;

    return NULL;
}

void ExtensionBase::AddRuntimeObject(gd::ObjectMetadata & object, std::string className, CreateRuntimeObjectFunPtr createFun, DestroyRuntimeObjectFunPtr destroyFun)
{
#if defined(GD_IDE_ONLY)
    object.className = className;
#endif
    runtimeObjectCreationFunctionTable[object.GetName()] = createFun;
    runtimeObjectDestroyFunctionTable[object.GetName()] = destroyFun;
}

#if !defined(GD_IDE_ONLY)
//Implementations of some dependencies of ExtensionBase are compiled in this compilation unit
//when compiling for runtime:
#include "GDCore/PlatformDefinition/PlatformExtension.cpp"
#include "GDCore/Events/ObjectMetadata.cpp"
#include "GDCore/Events/AutomatismMetadata.cpp"
#endif
