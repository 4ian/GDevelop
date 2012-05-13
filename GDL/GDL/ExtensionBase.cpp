/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/ExtensionBase.h"
#include "GDCore/Events/Event.h"
#include "GDL/Automatism.h"
#include "GDL/AutomatismsSharedDatas.h"
#include "GDL/CommonTools.h"
#include <vector>
#include <string>
#include <iostream>

using namespace std;

std::map<std::string, ExtensionObjectInfos > ExtensionBase::badObjectsInfos;
std::map<std::string, AutomatismInfo > ExtensionBase::badAutomatismsInfo;

#if defined(GD_IDE_ONLY)
std::map<std::string, InstructionMetadata > ExtensionBase::badConditionsInfos;
std::map<std::string, InstructionMetadata > ExtensionBase::badActionsInfos;
std::map<std::string, ExpressionMetadata > ExtensionBase::badExpressionsInfos;
std::map<std::string, StrExpressionMetadata > ExtensionBase::badStrExpressionsInfos;
#endif

ExtensionObjectInfos::ExtensionObjectInfos() :
destroyFunPtr(NULL),
createFunPtr(NULL)
{
}

#if defined(GD_IDE_ONLY)

EventInfos::EventInfos() :
instance(boost::shared_ptr<gd::BaseEvent>())
{
}
#endif

AutomatismInfo::AutomatismInfo() :
instance(boost::shared_ptr<Automatism>())
{
}

AutomatismInfo::~AutomatismInfo()
{
}

void ExtensionBase::SetNameSpace(std::string nameSpace_)
{
    //For backward compatibility
    //or for extension without namespace
    if (name == "Sprite" ||
        name == "BuiltinObject" ||
        name == "BuiltinAudio" ||
        name == "BuiltinMouse" ||
        name == "BuiltinKeyboard"||
        name == "BuiltinJoystick" ||
        name == "BuiltinTime"||
        name == "BuiltinFile"||
        name == "BuiltinInterface"||
        name == "BuiltinVariables"||
        name == "BuiltinCamera"||
        name == "BuiltinWindow"||
        name == "BuiltinNetwork"||
        name == "BuiltinScene"||
        name == "BuiltinAdvanced" ||
        name == "BuiltinCommonConversions" ||
        name == "BuiltinStringInstructions" ||
        name == "BuiltinMathematicalTools" ||
        name == "CommonDialogs") //New name for BuiltinInterface
    {
        nameSpace = "";
        return;
    }


    nameSpace = nameSpace_+"::";
}

vector < std::string > ExtensionBase::GetExtensionObjectsTypes() const
{
    vector < string > objects;

    std::map<string, ExtensionObjectInfos>::const_iterator it;
    for(it = objectsInfos.begin(); it != objectsInfos.end(); ++it)
        objects.push_back(it->first);

    return objects;
}

#if defined(GD_IDE_ONLY)
vector < std::string > ExtensionBase::GetAutomatismsTypes() const
{
    vector < string > automatisms;

    std::map<string, AutomatismInfo>::const_iterator it;
    for(it = automatismsInfo.begin(); it != automatismsInfo.end(); ++it)
        automatisms.push_back(it->first);

    return automatisms;
}

const std::map<std::string, InstructionMetadata > & ExtensionBase::GetAllActions() const
{
    return actionsInfos;
}

const std::map<std::string, InstructionMetadata > & ExtensionBase::GetAllConditions() const
{
    return conditionsInfos;
}

const std::map<std::string, ExpressionMetadata > & ExtensionBase::GetAllExpressions() const
{
    return expressionsInfos;
}

const std::map<std::string, StrExpressionMetadata > & ExtensionBase::GetAllStrExpressions() const
{
    return strExpressionsInfos;
}

const std::map<std::string, EventInfos > & ExtensionBase::GetAllEvents() const
{
    return eventsInfos;
}

const std::map<std::string, AutomatismInfo > & ExtensionBase::GetAllAutomatisms() const
{
    return automatismsInfo;
}
const std::map<std::string, InstructionMetadata > & ExtensionBase::GetAllActionsForObject(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.actionsInfos;

    return badActionsInfos;
}

const std::map<std::string, InstructionMetadata > & ExtensionBase::GetAllConditionsForObject(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.conditionsInfos;

    return badConditionsInfos;
}

const std::map<std::string, ExpressionMetadata > & ExtensionBase::GetAllExpressionsForObject(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.expressionsInfos;

    return badExpressionsInfos;
}

const std::map<std::string, StrExpressionMetadata > & ExtensionBase::GetAllStrExpressionsForObject(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.strExpressionsInfos;

    return badStrExpressionsInfos;
}

const std::map<std::string, InstructionMetadata > & ExtensionBase::GetAllActionsForAutomatism(std::string autoType) const
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.actionsInfos;

    return badActionsInfos;
}

const std::map<std::string, InstructionMetadata > & ExtensionBase::GetAllConditionsForAutomatism(std::string autoType) const
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.conditionsInfos;

    return badConditionsInfos;
}

const std::map<std::string, ExpressionMetadata > & ExtensionBase::GetAllExpressionsForAutomatism(std::string autoType) const
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.expressionsInfos;

    return badExpressionsInfos;
}

const std::map<std::string, StrExpressionMetadata > & ExtensionBase::GetAllStrExpressionsForAutomatism(std::string autoType) const
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.strExpressionsInfos;

    return badStrExpressionsInfos;
}

const ExtensionObjectInfos & ExtensionBase::GetObjectInfo(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second;

    return badObjectsInfos[""];
}

const AutomatismInfo & ExtensionBase::GetAutomatismInfo(std::string objectType) const
{
    if ( automatismsInfo.find(objectType) != automatismsInfo.end())
        return automatismsInfo.find(objectType)->second;

    return badAutomatismsInfo[""];
}
#endif

CreateFunPtr ExtensionBase::GetObjectCreationFunctionPtr(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.createFunPtr;

    return NULL;
}

DestroyFunPtr ExtensionBase::GetDestroyObjectFunction(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.destroyFunPtr;

    return NULL;
}

#if defined(GD_IDE_ONLY)
gd::BaseEventSPtr ExtensionBase::CreateEvent(std::string eventType) const
{
    if ( eventsInfos.find(eventType) != eventsInfos.end())
        return eventsInfos.find(eventType)->second.instance->Clone();

    return boost::shared_ptr<gd::BaseEvent>();
}
#endif

Automatism* ExtensionBase::CreateAutomatism(std::string type) const
{
    if ( automatismsInfo.find(type) != automatismsInfo.end())
        return automatismsInfo.find(type)->second.instance->Clone();

    return NULL;
}


boost::shared_ptr<AutomatismsSharedDatas> ExtensionBase::CreateAutomatismSharedDatas(std::string type) const
{
    if ( automatismsInfo.find(type) != automatismsInfo.end())
        return automatismsInfo.find(type)->second.sharedDatasInstance->Clone();

    return boost::shared_ptr<AutomatismsSharedDatas>();
}

void ExtensionBase::SceneLoaded(RuntimeScene & scene)
{
}

void ExtensionBase::SceneUnloaded(RuntimeScene & scene)
{
}
