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

void ExtensionBase::AddRuntimeObject(gd::ObjectMetadata & object, CreateRuntimeObjectFunPtr createFun, DestroyRuntimeObjectFunPtr destroyFun)
{
    runtimeObjectCreationFunctionTable[object.GetName()] = createFun;
    runtimeObjectDestroyFunctionTable[object.GetName()] = destroyFun;
}

#if !defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/PlatformExtension.cpp"
#endif
